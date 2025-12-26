/*
 * 属性面板
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Statistic, Row, Col, Empty } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { TopologyNode, TopologyConnection, Port } from '../../types';
import { useTopology } from '../../context/TopologyContext';
import { getAssetPorts } from '@/services/topology';
import StatusIndicator from '../StatusIndicator';
import './index.less';

const PropertyPanel: React.FC = () => {
  const { selectedItem, nodes, connections, deleteNode, deleteConnection } = useTopology();

  // 统计信息
  const statistics = useMemo(() => {
    const onlineCount = nodes.filter((n) => n.status === 'online').length;
    const offlineCount = nodes.filter((n) => n.status === 'offline').length;
    const alarmCount = nodes.reduce((sum, n) => sum + n.alarmCount, 0);
    const upConnections = connections.filter((c) => c.status === 'up').length;
    const downConnections = connections.filter((c) => c.status === 'down').length;

    // 计算端口统计
    let totalPorts = 0;
    let upPorts = 0;
    nodes.forEach((node) => {
      // 这里可以根据实际情况获取端口数量
      totalPorts += 8; // 假设每个设备8个端口
    });

    return {
      totalDevices: nodes.length,
      onlineCount,
      offlineCount,
      alarmCount,
      totalConnections: connections.length,
      upConnections,
      downConnections,
      totalPorts,
      upPorts,
    };
  }, [nodes, connections]);

  // 连接属性相关的状态（必须在所有条件返回之前声明，遵守 Hooks 规则）
  const connection = selectedItem && !('assetId' in selectedItem) ? (selectedItem as TopologyConnection) : null;
  const sourceNode = connection ? nodes.find((n) => n.id === connection.sourceNodeId) : null;
  const targetNode = connection ? nodes.find((n) => n.id === connection.targetNodeId) : null;
  
  // 加载端口信息以显示端口名称
  const [sourcePortInfo, setSourcePortInfo] = useState<Port | null>(null);
  const [targetPortInfo, setTargetPortInfo] = useState<Port | null>(null);

  useEffect(() => {
    if (sourceNode && connection) {
      getAssetPorts(sourceNode.assetId)
        .then((ports) => {
          const port = ports.find((p) => p.portNumber === connection.sourcePort);
          setSourcePortInfo(port || null);
        })
        .catch((error) => {
          console.error('加载源端口信息失败:', error);
        });
    } else {
      setSourcePortInfo(null);
    }
    if (targetNode && connection) {
      getAssetPorts(targetNode.assetId)
        .then((ports) => {
          const port = ports.find((p) => p.portNumber === connection.targetPort);
          setTargetPortInfo(port || null);
        })
        .catch((error) => {
          console.error('加载目标端口信息失败:', error);
        });
    } else {
      setTargetPortInfo(null);
    }
  }, [connection, sourceNode, targetNode]);

  // 删除选中项
  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      if ('assetId' in selectedItem) {
        // 节点
        await deleteNode(selectedItem.id);
      } else {
        // 连接
        await deleteConnection(selectedItem.id);
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  if (!selectedItem) {
    return (
      <div className="property-panel">
        <div className="panel-header">
          <h3>状态监控</h3>
        </div>
        <div className="panel-content">
          <Card title="设备状态统计" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="在线设备"
                  value={statistics.onlineCount}
                  suffix={`/ ${statistics.totalDevices}`}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="离线设备"
                  value={statistics.offlineCount}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>

          <Card title="连接状态统计" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="正常连接"
                  value={statistics.upConnections}
                  suffix={`/ ${statistics.totalConnections}`}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="故障连接"
                  value={statistics.downConnections}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>

          <Card title="告警统计" size="small">
            <Statistic
              title="设备告警数"
              value={statistics.alarmCount}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </div>
      </div>
    );
  }

  // 节点属性
  if ('assetId' in selectedItem) {
    const node = selectedItem as TopologyNode;
    return (
      <div className="property-panel">
        <div className="panel-header">
          <h3>节点属性</h3>
        </div>
        <div className="panel-content">
          <Card
            size="small"
            extra={
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => {
                    // TODO: 实现编辑功能
                  }}
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDelete}
                >
                  删除
                </Button>
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="节点名称">{node.name}</Descriptions.Item>
              <Descriptions.Item label="关联资产ID">{node.assetId}</Descriptions.Item>
              <Descriptions.Item label="设备类型">{node.deviceType}</Descriptions.Item>
              <Descriptions.Item label="设备IP">{node.ip}</Descriptions.Item>
              <Descriptions.Item label="所属机房">{node.roomName || '-'}</Descriptions.Item>
              <Descriptions.Item label="所属机柜">{node.rackName || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Space>
                  <StatusIndicator status={node.status} type="device" />
                  <span>
                    {node.status === 'online' ? '在线' : node.status === 'offline' ? '离线' : '未知'}
                  </span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="告警数量">{node.alarmCount}</Descriptions.Item>
              <Descriptions.Item label="X坐标">{Math.round(node.position.x)}</Descriptions.Item>
              <Descriptions.Item label="Y坐标">{Math.round(node.position.y)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    );
  }

  // 连接属性（connection 已经在上面定义了）

  return (
    <div className="property-panel">
      <div className="panel-header">
        <h3>连接属性</h3>
      </div>
      <div className="panel-content">
        <Card
          size="small"
          extra={
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={handleDelete}
            >
              删除
            </Button>
          }
        >
          <Descriptions column={1} size="small">
            <Descriptions.Item label="源设备">
              {sourceNode?.name || connection.sourceNodeId}
            </Descriptions.Item>
            <Descriptions.Item label="源端口">
              <Space>
                <span>{sourcePortInfo ? `${sourcePortInfo.portName} (${connection.sourcePort})` : connection.sourcePort}</span>
                {sourcePortInfo && (
                  <StatusIndicator status={sourcePortInfo.status} type="port" size="small" />
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="目标设备">
              {targetNode?.name || connection.targetNodeId}
            </Descriptions.Item>
            <Descriptions.Item label="目标端口">
              <Space>
                <span>{targetPortInfo ? `${targetPortInfo.portName} (${connection.targetPort})` : connection.targetPort}</span>
                {targetPortInfo && (
                  <StatusIndicator status={targetPortInfo.status} type="port" size="small" />
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="连接状态">
              <Space>
                <StatusIndicator status={connection.status} type="connection" />
                <span>
                  {connection.status === 'up' ? '正常' : connection.status === 'down' ? '故障' : '未知'}
                </span>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default PropertyPanel;

