import React, { useState } from 'react';
import { Tabs, Input, Button, Descriptions, Spin, message, Tooltip, Tag } from 'antd';
import { QuestionCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, DatabaseOutlined } from '@ant-design/icons';
import { postProbeHttp, postProbePing, postProbeTelnet, postProbeTraceroute } from './service';
import PageLayout from '@/components/pageLayout';
import { set } from 'lodash';
const { TabPane } = Tabs;
const { TextArea } = Input;

const NetworkProbeTool = () => {
  // HTTP检测状态
  const [httpUrl, setHttpUrl] = useState('');
  const [httpLoading, setHttpLoading] = useState(false);
  const [httpResult, setHttpResult] = useState<any>(null);

  // Ping检测状态
  const [pingTarget, setPingTarget] = useState('');
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);

  // Telnet检测状态
  const [telnetTarget, setTelnetTarget] = useState('');
  const [telnetLoading, setTelnetLoading] = useState(false);
  const [telnetResult, setTelnetResult] = useState<any>(null);

  // Traceroute检测状态
  const [tracerouteTarget, setTracerouteTarget] = useState('');
  const [tracerouteLoading, setTracerouteLoading] = useState(false);
  const [tracerouteResult, setTracerouteResult] = useState<any>('');

  // HTTP检测
  const handleHttpTest = async () => {
    if (!httpUrl) {
      message.warning('请输入URL地址');
      return;
    }

    setHttpLoading(true);
    setHttpResult(null);
    postProbeHttp({ url: httpUrl }).then((res) => {
      setHttpResult({
        url: httpUrl,
        checkTime: new Date().toLocaleString(),
        statusCode: res.statusCode,
        totalTime: res.totalTime,
        success: res.success,
      });
    });
  };

  // Ping检测
  const handlePingTest = async () => {
    if (!pingTarget) {
      message.warning('请输入域名或IP地址');
      return;
    }

    setPingLoading(true);
    setPingResult(null);

    postProbePing({ target: pingTarget }).then((res) => {
      setPingResult({
        target: pingTarget,
        sourceIp: res.dat.sourceIp,
        sent: res.dat.sent,
        received: res.dat.received,
        packetLoss: res.dat.packetLoss,
        statusCode: res.dat.status,
        success: res.dat.success,
      });
      setPingLoading(false);
    });
  };

  // Telnet检测
  const handleTelnetTest = async () => {
    if (!telnetTarget) {
      message.warning('请输入IP地址:端口号');
      return;
    }

    // 验证格式
    const telnetRegex = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
    if (!telnetRegex.test(telnetTarget)) {
      message.warning('请输入正确的IP地址:端口号格式');
      return;
    }

    setTelnetLoading(true);
    setTelnetResult(null);
    postProbeTelnet({ target: telnetTarget }).then((res) => {
      setTelnetResult({
        target: telnetTarget,
        portStatus: res.portStatus,
        success: res.success,
      });
    });
  };

  // Traceroute检测
  const handleTracerouteTest = async () => {
    if (!tracerouteTarget) {
      message.warning('请输入域名或IP地址');
      return;
    }

    setTracerouteLoading(true);
    setTracerouteResult('');
    postProbeTraceroute({ target: tracerouteTarget }).then((res) => {
      setTracerouteResult(res);
    });
  };

  // 渲染Tab标题
  const renderTabTitle = (title, tooltip) => (
    <span>
      {title}
      <Tooltip title={<div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{tooltip}</div>}>
        <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
      </Tooltip>
    </span>
  );
  const tipPing = `
作用：
    * 连通性检查：确认目标IP地址在网络层是否可达。
    * 网络质量评估：测量到目标服务器的网络延迟和丢包情况，反映链路的稳定性和速度。
    * 简单可用性监控：最快速、最轻量地判断一台主机是否"活着"。
使用场景：
    * 故障排查第一步：当应用无法访问时，首先PING一下服务器IP，如果不通，问题很可能出在网络层面。
    * 网络质量监控：持续对网关、核心交换机和关键服务器进行PING监控，绘制延迟和丢包率趋势图。
    * 实时应用保障：在线游戏、视频会议、VoIP等对网络延迟敏感的应用，可用PING监控基础网络环境。
  `;
  const tipHttp = `
作用：
    * 业务可用性监控：模拟真实用户或客户端行为，检查网站、API等Web服务是否正常提供服务。
    * 端到端性能测量：测量从发起请求到收到完整响应的总时间，包括DNS、TCP、SSL、服务器处理、网络传输等所有环节。
    * 功能正确性验证：通过检查HTTP状态码和响应内容，确认应用功能逻辑正确（如登录成功、页面内容正确）。
    * 用户体验评估：从不同地域、不同网络发起检测，评估全球用户的访问体验。
使用场景：
    * 网站监控：7x24小时监控官网、商城、后台管理系统等Web服务的可用性和性能。
    * API监控：监控微服务、移动应用后端、第三方接口的可用性、响应时间和返回数据是否正确。
    * SLA合规性证明：通过持续的HTTP检测数据，证明服务达到了承诺的可用性（如99.9%）和性能指标。
    * 多地域用户体验管理：从全球多个探测点发起HTTP请求，确保所有地区的用户都能获得良好的服务体验。
  `;
  const tipTelnet = `
作用：
    * 端口连通性验证：检查目标服务器的特定TCP端口是否处于监听状态，并能成功建立连接。
    * 服务可达性测试：在不涉及具体应用协议的情况下，确认服务的传输层通道是否畅通。
    * 防火墙规则验证：测试安全组、ACL等防火墙策略是否允许对特定端口的访问。
使用场景：
    * 快速检查服务状态：快速验证SSH(22)、MySQL(3306)、Redis(6379)等服务的端口是否开放，无需登录或使用专业客户端。
    * 故障排查：当某个服务（如数据库）无法连接时，使用Telnet检测其端口，如果连接失败，则问题出在网络、防火墙或服务进程上。
    * 安全审计：检查服务器上不应对外开放的端口是否意外暴露。
  `;
  const tipTraceroute = `
作用：
    * 路径发现：探测并显示数据包从源到目标所经过的完整路径（所有路由器节点）。
    * 故障定位：精确找出网络链路中具体在哪一个"跳"出现了高延迟或丢包。
    * 路由分析：分析数据包的实际路径，判断是否存在绕路、路由环路或非最优路径。
使用场景：
    * 精确定位网络故障：当PING检测发现延迟高或丢包时，立即使用Traceroute找出问题发生在哪个运营商的哪个节点。
    * 跨运营商问题分析：访问国外网站或跨运营商访问缓慢时，用Traceroute查看数据包在哪个国际出口或网间互联点出现问题。
    * 网络拓扑调研：了解到达目标服务器的网络路径，用于网络规划和优化。
  `;
  return (
    <PageLayout icon={<DatabaseOutlined />} title={'探测工具'}>
      <div style={{ margin: 10, minHeight: 400 }}>
        <div style={{ padding: 10 }}>
          <Tabs defaultActiveKey='1'>
            {/* HTTP检测 */}
            <TabPane tab={renderTabTitle('HTTP检测', tipHttp)} key='1'>
              <div style={{ marginBottom: 16 }}>
                <Input
                  placeholder='请输入URL地址 (例如: https://www.example.com)'
                  value={httpUrl}
                  onChange={(e) => setHttpUrl(e.target.value)}
                  style={{ width: 400, marginRight: 16 }}
                  onPressEnter={handleHttpTest}
                />
                <Button type='primary' onClick={handleHttpTest} loading={httpLoading}>
                  开始检测
                </Button>
              </div>

              <Spin spinning={httpLoading} tip='检测中，最多需要3分钟...'>
                {httpResult && (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label='检测地址' span={2}>
                      {httpResult.url}
                    </Descriptions.Item>
                    <Descriptions.Item label='检测时间'>{httpResult.checkTime}</Descriptions.Item>
                    <Descriptions.Item label='状态码'>
                      <Tag color={httpResult.statusCode === 200 ? 'green' : 'red'} icon={httpResult.statusCode === 200 ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                        {httpResult.statusCode}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label='总时间(ms)'>{httpResult.totalTime}</Descriptions.Item>
                    <Descriptions.Item label='检测状态'>
                      <Tag color={httpResult.success ? 'success' : 'error'}>{httpResult.success ? '成功' : '失败'}</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Spin>
            </TabPane>

            {/* Ping检测 */}
            <TabPane tab={renderTabTitle('Ping检测', tipPing)} key='2'>
              <div style={{ marginBottom: 16 }}>
                <Input
                  placeholder='请输入域名或IP地址 (例如: 192.168.1.1 或 www.baidu.com)'
                  value={pingTarget}
                  onChange={(e) => setPingTarget(e.target.value)}
                  style={{ width: 400, marginRight: 16 }}
                  onPressEnter={handlePingTest}
                />
                <Button type='primary' onClick={handlePingTest} loading={pingLoading}>
                  开始检测
                </Button>
              </div>

              <Spin spinning={pingLoading} tip='检测中，最多需要3分钟...'>
                {pingResult && (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label='检测目标' span={2}>
                      {pingResult.target}
                    </Descriptions.Item>
                    <Descriptions.Item label='探测源IP'>{pingResult.sourceIp}</Descriptions.Item>
                    <Descriptions.Item label='发送包数'>{pingResult.sent}</Descriptions.Item>
                    <Descriptions.Item label='接收包数'>{pingResult.received}</Descriptions.Item>
                    <Descriptions.Item label='丢包率'>
                      <Tag color={pingResult.packetLoss === '0%' ? 'green' : 'orange'}>{pingResult.packetLoss}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label='状态码'>
                      <Tag color={pingResult.success ? 'green' : 'red'}>{pingResult.statusCode}</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Spin>
            </TabPane>

            {/* Telnet检测 */}
            <TabPane tab={renderTabTitle('Telnet检测', tipTelnet)} key='3'>
              <div style={{ marginBottom: 16 }}>
                <Input
                  placeholder='请输入IP地址:端口号 (例如: 192.168.1.1:8080)'
                  value={telnetTarget}
                  onChange={(e) => setTelnetTarget(e.target.value)}
                  style={{ width: 400, marginRight: 16 }}
                  onPressEnter={handleTelnetTest}
                />
                <Button type='primary' onClick={handleTelnetTest} loading={telnetLoading}>
                  开始检测
                </Button>
              </div>

              <Spin spinning={telnetLoading} tip='检测中，最多需要3分钟...'>
                {telnetResult && (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label='检测目标' span={2}>
                      {telnetResult.target}
                    </Descriptions.Item>
                    <Descriptions.Item label='端口状态'>
                      <Tag
                        color={telnetResult.portStatus === '开放' ? 'green' : 'red'}
                        icon={telnetResult.portStatus === '开放' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      >
                        {telnetResult.portStatus}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label='检测状态'>
                      <Tag color={telnetResult.success ? 'success' : 'error'}>{telnetResult.success ? '成功' : '失败'}</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Spin>
            </TabPane>

            {/* Traceroute检测 */}
            <TabPane tab={renderTabTitle('Traceroute检测', tipTraceroute)} key='4'>
              <div style={{ marginBottom: 16 }}>
                <Input
                  placeholder='请输入域名或IP地址 (例如: www.google.com)'
                  value={tracerouteTarget}
                  onChange={(e) => setTracerouteTarget(e.target.value)}
                  style={{ width: 400, marginRight: 16 }}
                  onPressEnter={handleTracerouteTest}
                />
                <Button type='primary' onClick={handleTracerouteTest} loading={tracerouteLoading}>
                  开始检测
                </Button>
              </div>

              <Spin spinning={tracerouteLoading} tip='检测中，最多需要3分钟...'>
                {tracerouteResult && (
                  <TextArea
                    value={tracerouteResult}
                    rows={15}
                    readOnly
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                    placeholder='Traceroute检测结果将显示在这里...'
                  />
                )}
              </Spin>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};

export default NetworkProbeTool;
