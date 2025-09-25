import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Space, Button, Modal, Upload, Table, message, Input, Row, Col } from 'antd';

import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { createSSHSession, createTelnetSession, sftpFileList, sftpCreateDirApi, downloadSftpFile, sftpDeleteFileApi } from './services';
import 'xterm/css/xterm.css';
import './style.less';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { set } from 'lodash';
import { Timeout } from 'ahooks/lib/useRequest/src/types';
import PageLayout from '@/components/pageLayout';
import { DatabaseOutlined } from '@ant-design/icons';
const Xterm = () => {
  const [visible, setVisible] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [tableData, setTableData] = useState([]);
  const [path, setPath] = useState('');
  const [typ, setTyp] = useState<string>('ssh');
  const { id } = useParams<{ id: string }>();
  const { category } = useParams<{ category: string }>();
  const { ident } = useParams<{ ident: string }>();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xterm = useRef<Terminal | null>(null);

  // const fitAddon = useRef<FitAddon>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectIntervalRef = useRef<Timeout | null>(null); // 用于存储定时器ID
  const [modalVisible, setModalVisible] = useState(false);
  const [dirName, setDirName] = useState('');
  const [maxReconnectAttempts, setMaxReconnectAttempts] = useState(5);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const createDir = async () => {
    setModalVisible(true);
  };

  const handleOk = async () => {
    const res = await sftpCreateDirApi({
      path: `${path}/${dirName}`,
      session_id: sessionId,
    });
    message.success(res.dat);
    getSftpFileList(path || '/');
    setModalVisible(false);
    setDirName(''); // 重置输入框
  };

  const handleCancel = () => {
    setModalVisible(false);
    setDirName(''); // 重置输入框
  };

  const createWebSocketConn = async () => {
    let dtype = 'ssh';
    // switch (category) {
    //   case 'net_switch':
    //     setTyp('telnet');
    //     dtype = 'telnet';
    //     break;
    // }
    if (category.includes('net_')) {
      setTyp('telnet');
      dtype = 'telnet';
    }
    const session = dtype === 'ssh' ? await createSSHSession({ ident_id: id }) : await createTelnetSession({ ident_id: id });
    setSessionId(session);
    const domainPrefix = window.location.hostname + ':17001';
    // const domainPrefix = window.location.hostname;
    ws.current = new WebSocket(`ws://${domainPrefix}/cmdb/term/ws/${dtype}/connection?session_id=${session}`);
    ws.current.onopen = () => {
      setReconnectAttempts(0); // 重置计数器
      xterm.current?.write('Welcome to the terminal!\r\n');
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
      }
    };

    ws.current.onmessage = (event) => {
      xterm.current?.write(event.data);
    };
    ws.current.onclose = (event) => {
      console.log(`WebSocket closed: Code: ${event.code}, Reason: ${event.reason}`);
      xterm.current?.write('\r\nConnection closed.\r\n');

      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
      }

      reconnectIntervalRef.current = setInterval(() => {
        setReconnectAttempts((prev) => {
          const nextAttempt = prev + 1;
          if (nextAttempt >= maxReconnectAttempts) {
            clearInterval(reconnectIntervalRef.current!);
            xterm.current?.write('\r\nMax reconnection attempts reached.\r\n');
          } else {
            xterm.current?.write(`\r\nReconnecting... (${nextAttempt}/${maxReconnectAttempts})\r\n`);
            createWebSocketConn(); // 注意：这里可能需要防重复调用
          }
          return nextAttempt;
        });
      }, 10000);
    };

    // ws.current.onclose = (event) => {
    //   console.log(`WebSocket closed: Code: ${event.code}, Reason: ${event.reason}`);
    //   xterm.current?.write('\r\nConnection closed.\r\n');

    //   // 清除已有重连定时器（避免重复）
    //   if (reconnectIntervalRef.current) {
    //     clearInterval(reconnectIntervalRef.current);
    //   }

    //   // 重连逻辑
    //   reconnectIntervalRef.current = setInterval(() => {
    //     if (reconnectAttempts >= maxReconnectAttempts) {
    //       console.log('Max reconnection attempts reached. Giving up.');
    //       xterm.current?.write('\r\nMax reconnection attempts reached. Please refresh page.\r\n');
    //       if (reconnectIntervalRef.current) {
    //         clearInterval(reconnectIntervalRef.current);
    //       }
    //       return;
    //     }

    //     console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
    //     xterm.current?.write(`\r\nReconnecting... (${reconnectAttempts + 1}/${maxReconnectAttempts})\r\n`);
    //     setReconnectAttempts(reconnectAttempts + 1);
    //     createWebSocketConn();
    //   }, 10000); // 每3秒重试一次（原代码注释与实际值不一致，已修正）
    // };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  // setInterval(() => {
  //   ws.current.send(JSON.stringify({ type: 'ping' }));
  // }, 30000); // 每30秒发送一次心跳
  useEffect(() => {
    console.log('start ws ');

    createWebSocketConn();
    // 初始化 xterm
    xterm.current = new Terminal();
    fitAddon.current = new FitAddon();

    xterm.current?.loadAddon(fitAddon.current);
    if (xterm.current && terminalRef.current) {
      xterm.current.open(terminalRef.current);
    }
    // xterm.current?.open(terminalRef.current);
    fitAddon.current?.fit();

    // 建立 WebSocket 连接

    // 处理终端输入
    xterm.current?.onData((data) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current?.send(data);
      }
    });

    // 监听窗口大小变化
    const handleResize = () => {
      fitAddon.current?.fit();
    };

    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      ws.current?.close();
      window.removeEventListener('resize', handleResize);
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
      }
    };
  }, []);

  const showFileList = () => {
    setVisible(true);
    getSftpFileList();
  };

  const getSftpFileList = async (currentPath = '/') => {
    sftpFileList({ path: currentPath, session_id: sessionId }).then((res) => {
      console.log('sftp list:', res);
      setTableData(res?.files || []);
      setPath(currentPath);
    });
  };

  const nextLevel = (row) => {
    if (row.type === 'd') {
      setPath(row.path);
      getSftpFileList(row.path);
    }
  };

  const backLevel = () => {
    if (path) {
      const backPath = path.slice(0, path.lastIndexOf('/'));
      setPath(backPath);
      getSftpFileList(backPath || '/');
    }
  };
  // const UploadProps = {
  //   action: `/api/term/sftp/upload`,
  //   method: 'put',
  //   data: { path, session_id: sessionId },
  //   showUploadList: false,
  //   onChange(info) {
  //     if (info.file.status === 'done') {
  //       message.success(`${info.file.name} 上传成功`);
  //       getSftpFileList(path || '/');
  //     } else if (info.file.status === 'error') {
  //       message.error(`${info.file.name} 上传失败`);
  //     }
  //   },
  // };
  const downloadFile = async (row) => {
    const res = await downloadSftpFile({ path: row.path, session_id: sessionId });
    const blob = new Blob([res], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // 修正Excel类型
    });

    // 3. 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = row.name; // 直接赋值更规范
    link.style.display = 'none';

    // 4. 触发下载
    document.body.appendChild(link);
    link.click();

    // 5. 清理资源
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  const deleteFile = async (row) => {
    await Modal.confirm({
      title: '提示',
      content: `确定将文件【${row.name}】删除吗？`,
      onOk: async () => {
        const res = await sftpDeleteFileApi({ path: row.path, session_id: sessionId });
        message.success(res);
        getSftpFileList(path || '/');
      },
      onCancel: () => {},
    });
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      className: 'n9e-hosts-table-column-ident',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (text) => (text === 'd' ? '文件夹' : '文件'),
    },
    {
      title: '大小',
      dataIndex: 'size',
    },
    {
      title: '权限',
      dataIndex: 'mode',
    },
    {
      title: '修改日期',
      dataIndex: 'mod_time',
      width: 180,
    },
    {
      title: '操作',
      render: (text, row) => (
        <>
          {row.type === 'f' && (
            // <Button type='link' onClick={() => downloadFile(row)}>
            <>
              <Button size='small' style={{ padding: 0 }} type='link' onClick={() => downloadFile(row)}>
                下载
              </Button>
              <Button size='small' type='link' danger onClick={() => deleteFile(row)} style={{ padding: 0 }}>
                删除
              </Button>
            </>
          )}
          {row.type === 'd' && (
            <Upload
              action='/cmdb/term/sftp/upload'
              method='post'
              data={{ path: path, sessionId: sessionId }}
              showUploadList={false}
              onChange={(info) => {
                console.log('@@info:', info.file.status);
                if (info.file.status === 'done') {
                  message.success(`${info.file.name} 上传成功`);
                  getSftpFileList(path || '/');
                } else if (info.file.status === 'error') {
                  message.error(`${info.file.name} 上传失败`);
                }
              }}
            >
              <Button size='small' style={{ padding: 0 }} type='link'>
                上传
              </Button>
            </Upload>
          )}
          {/* <Button type='link' danger onClick={() => deleteFile(row)}> */}
        </>
      ),
    },
  ];

  return (
    <PageLayout icon={<DatabaseOutlined />} title={'资产终端'}>
      <div
        className='n9e-border-base'
        style={{
          padding: 16,
        }}
      >
        <div
          className='mb8'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>资产名称：{ident}</span>
          {typ === 'ssh' && (
            <Button type='primary' icon={<SwapOutlined />} onClick={showFileList}>
              文件传输
            </Button>
          )}
        </div>

        <div ref={terminalRef} className='terminal' style={{ height: 'calc(100% - 40px)' }} />

        <Modal open={visible} title='文件传输' onCancel={() => setVisible(false)} footer={null} width={800}>
          <div className='flex flex-items-center justify-between mb-20px'>
            <div>当前位置：{path || '/'}</div>
            <div className='flex'>
              <Space>
                {/* <Button type='primary' onClick={backLevel}> */}
                <Button type='primary' onClick={backLevel}>
                  返回
                </Button>
                {/* <Button type='primary' onClick={createDir}> */}
                <Button type='primary' onClick={createDir}>
                  创建目录
                </Button>
                <Upload
                  action='/cmdb/term/sftp/upload'
                  method='post'
                  data={{ path: path, sessionId: sessionId }}
                  showUploadList={false}
                  onChange={(info) => {
                    if (info.file.status === 'done') {
                      message.success(`${info.file.name} 上传成功`);
                      getSftpFileList(path || '/');
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} 上传失败`);
                    }
                  }}
                >
                  <Button type='primary'>上传文件</Button>
                </Upload>
              </Space>
            </div>
          </div>
          <Table
            dataSource={tableData}
            columns={columns}
            rowKey='name'
            pagination={false}
            scroll={{ y: 400 }}
            onRow={(record) => ({
              onClick: () => nextLevel(record),
              onMouseEnter: (e) => {
                e.currentTarget.classList.add('highlight-row');
              },
              onMouseLeave: (e) => {
                e.currentTarget.classList.remove('highlight-row');
              },
            })}
          />
        </Modal>
        <Modal title='创建目录' open={modalVisible} onOk={handleOk} onCancel={handleCancel}>
          <Input placeholder='请输入文件名称' value={dirName} onChange={(e) => setDirName(e.target.value)} />
        </Modal>
      </div>
    </PageLayout>
  );
};

export default Xterm;
