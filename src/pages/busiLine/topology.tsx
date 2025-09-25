import React, { Children, useEffect, useRef, useState } from 'react';
import { Graph, Shape, ToolsView } from '@antv/x6';
import { Modal, Button, Tabs, Table, TableProps, Space, message } from 'antd'; // 使用 Ant Design 组件库
import { getBusinessTeamInfo } from '@/services/manage';
import { GetAssetListByType, createBusiTopoloy } from './services';
import 'antd/dist/antd.css';
import moment from 'moment';
import { stringify } from 'querystring';

interface attr {
  icon: string;
}

interface assetProps {
  id: string;
  name?: string;
  ident?: string;
  create_at: string;
  attr: attr;
}

interface IProps {
  gids?: string;
}

interface nodeProps {
  id: string;
  name: string;
  topology?: string;
}

const Topology = (props: IProps) => {
  const { gids } = props;
  const graphRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<assetProps>();
  const [graph, setGraph] = useState<Graph>();
  const [selectedAssetType, setSelectedAssetType] = useState('busi');
  const [assetList, setAssetList] = useState([]);
  const isBusi: boolean = selectedAssetType === 'busi' ? true : false;
  const isMiddleware: boolean = selectedAssetType === 'middleware' ? true : false;
  const isDatabase: boolean = selectedAssetType === 'database' ? true : false;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNode, setCurrentNode] = useState<nodeProps>();
  const rowSelection: TableProps<any>['rowSelection'] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      if (selectedRows.length > 0) {
        setSelectedAsset(selectedRows[0]);
      }
    },
    // getCheckboxProps: (record: any) => ({
    //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
    //   name: record.name,
    // }),
  };
  const busiColumns = [
    {
      title: '业务名称',
      dataIndex: 'name',
      key: 'id',
    },
    {
      title: '创建时间',
      dataIndex: 'create_at',
      key: 'id',
      render: (val, reocrd) => {
        let result = moment.unix(val).format('YYYY-MM-DD HH:mm:ss');
        return <div>{result}</div>;
      },
    },
  ];
  const targetColumns = [
    {
      title: '名称',
      dataIndex: 'ident',
      key: 'id',
    },
    {
      title: 'IP',
      dataIndex: 'host_ip',
      key: 'id',
    },
  ];
  const assetTypes = [
    {
      key: 'busi',
      label: '业务模块',
      children: (
        <Table dataSource={assetList} columns={busiColumns} rowKey='id' rowSelection={{ type: 'radio', ...rowSelection }} pagination={{ pageSize: 50 }} scroll={{ y: 55 * 5 }} />
      ),
    },
    {
      key: 'database',
      label: '数据库',
      children: (
        <Table dataSource={assetList} columns={targetColumns} rowKey='id' rowSelection={{ type: 'radio', ...rowSelection }} pagination={{ pageSize: 50 }} scroll={{ y: 55 * 5 }} />
      ),
    },
    {
      key: 'middleware',
      label: '中间件',
      children: (
        <Table dataSource={assetList} columns={targetColumns} rowKey='id' rowSelection={{ type: 'radio', ...rowSelection }} pagination={{ pageSize: 50 }} scroll={{ y: 55 * 5 }} />
      ),
    },
  ];
  const ports = {
    groups: {
      top: {
        position: 'top',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      right: {
        position: 'right',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      bottom: {
        position: 'bottom',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      left: {
        position: 'left',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
    },
    items: [
      {
        group: 'top',
      },
      {
        group: 'right',
      },
      {
        group: 'bottom',
      },
      {
        group: 'left',
      },
    ],
  };
  // 控制连接桩显示/隐藏
  const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
    for (let i = 0, len = ports.length; i < len; i += 1) {
      ports[i].style.visibility = show ? 'visible' : 'hidden';
    }
  };
  Graph.registerNode(
    'custom-rect',
    {
      inherit: 'rect',
      width: 66,
      height: 36,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
        },
      },
      ports: { ...ports },
    },
    true,
  );
  Graph.registerNode(
    'custom-image',
    {
      inherit: 'rect',
      width: 52,
      height: 52,
      markup: [
        {
          tagName: 'rect',
          selector: 'body',
        },
        {
          tagName: 'image',
        },
        {
          tagName: 'text',
          selector: 'label',
        },
      ],
      attrs: {
        body: {
          stroke: '#5F95FF',
          fill: '#5F95FF',
        },
        image: {
          width: 26,
          height: 26,
          refX: 13,
          refY: 16,
        },
        label: {
          refX: 3,
          refY: 2,
          textAnchor: 'left',
          textVerticalAnchor: 'top',
          fontSize: 12,
          fill: '#fff',
        },
      },
      ports: { ...ports },
    },
    true,
  );
  const setDefaultNode = () => {
    if (currentNode?.topology != undefined && Object.keys(currentNode.topology).length != 0) {
      console.log('@@@defaultNode:', currentNode?.topology);
      // let data = JSON.parse(currentNode.topology);
      graph?.fromJSON(Object(currentNode.topology));
      return;
    }
    let namesegs = currentNode?.name.split('-');
    let name = namesegs ? namesegs[namesegs.length - 1] : '';
    graph?.addNode({
      shape: 'custom-rect',
      x: 100,
      y: 100,
      id: currentNode?.id,
      label: name,
      tools: [
        {
          name: 'button-remove', // 工具名称
          args: {
            // 工具对应的参数
            x: 0,
            y: 0,
          },
        },
      ],
    });
  };
  useEffect(() => {
    GetAssetListByType(selectedAssetType).then(({ dat }) => {
      setAssetList(dat.dat);
    });
  }, [selectedAssetType]);
  useEffect(() => {
    graph?.clearCells();
    getBusinessTeamInfo(gids).then((res) => {
      setCurrentNode(res);
    });
  }, [gids]);
  useEffect(() => {
    setDefaultNode();
  }, [currentNode]);
  useEffect(() => {
    const newGraph = new Graph({
      container: graphRef.current ?? undefined,
      grid: true,
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'normal',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        snap: {
          radius: 20,
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#A2B1C3',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 0,
          });
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet;
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#5F95FF',
              stroke: '#5F95FF',
            },
          },
        },
      },
    });

    setGraph(newGraph);

    newGraph.on('cell:dragend', ({ cell }) => {
      const position = cell.getPosition();
      console.log(`Node ${cell.id} moved to:`, position);
      // 在这里可以保存坐标到状态或数据库
    });
    newGraph.on('node:mouseenter', () => {
      const container = graphRef.current!;
      if (container) {
        const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
        showPorts(ports, true);
      }
    });
    newGraph.on('node:mouseleave', () => {
      const container = graphRef.current!;
      if (container) {
        const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
        showPorts(ports, false);
      }
    });
    getBusinessTeamInfo(gids).then((res) => {
      setCurrentNode(res);
    });
    return () => {
      newGraph.dispose();
    };
  }, []);

  const showAssetList = (assetTypes) => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    let name = '';
    if (selectedAssetType === 'busi') {
      let namesegs = selectedAsset?.name?.split('-');
      name = namesegs ? namesegs[namesegs.length - 1] : '';
    } else {
      name = selectedAsset?.ident || '';
    }
    if (selectedAsset?.attr.icon === '' || selectedAsset?.attr.icon === undefined) {
      graph?.addNode({
        shape: 'custom-rect',
        x: 100,
        y: 100,
        id: selectedAsset?.id || '',
        label: name,
        tools: [
          {
            name: 'button-remove', // 工具名称
            args: {
              // 工具对应的参数
              x: 0,
              y: 0,
            },
          },
        ],
      });
    } else {
      graph?.addNode({
        shape: 'custom-image',
        x: 100,
        y: 100,
        attrs: {
          image: {
            'xlink:href': selectedAsset?.attr.icon,
          },
        },
        id: selectedAsset?.id,
        label: name,
        tools: [
          {
            name: 'button-remove', // 工具名称
            args: {
              x: 0,
              y: 0,
            },
          },
        ],
      });
    }

    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onChange = (key: string) => {
    console.log(key);
    setSelectedAssetType(key);
  };
  const saveTopology = () => {
    const cells = graph?.toJSON();
    console.log(cells);
    createBusiTopoloy(gids, cells).then((res) => {
      getBusinessTeamInfo(gids).then((res) => {
        setCurrentNode(res);
      });
      message.success('保存成功');
    });
    // const topology = {
    //   id: 1,
    //   name: 'test',
    //   topology: cells,
    // };

    // saveTopologyInfo(topology).then((res) => {
    //   message.success('保存成功');
    // })
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Space>
        <Button type='primary' onClick={showAssetList}>
          添加关联
        </Button>
        <Button type='primary' onClick={saveTopology}>
          保存
        </Button>
      </Space>

      <Modal title='选择资产' open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Tabs defaultActiveKey='1' items={assetTypes} onChange={onChange} style={{ width: '100%' }} />
      </Modal>

      <div
        ref={graphRef}
        style={{
          width: '80vw', // 画布宽度
          height: '70vh', // 画布高度
          maxWidth: '1000px', // 最大宽度
          maxHeight: '600px', // 最大高度
          backgroundColor: '#f2f4f7',
          border: '1px solid #ccc',
          marginTop: '20px',
        }}
      />
    </div>
  );
};

export default Topology;
