// mock/topologyData.js
export default mockTopologyData = {
  devices: [
    {
      id: 'device-1',
      type: 'net_router',
      iconType: 'net_router',
      deviceId: 'router-001',
      deviceName: '核心路由器',
      x: 200,
      y: 150,
      width: 80,
      height: 60,
      ports: [
        { id: 'port-1-1', name: 'GigabitEthernet0/0', bandwidth: '1G', status: 'up' },
        { id: 'port-1-2', name: 'GigabitEthernet0/1', bandwidth: '1G', status: 'up' },
      ],
      alarm: false,
      status: 'up',
    },
    {
      id: 'device-2',
      type: 'net_switch_core',
      iconType: 'net_switch_core',
      deviceId: 'switch-001',
      deviceName: '核心交换机',
      x: 400,
      y: 150,
      width: 80,
      height: 60,
      ports: [
        { id: 'port-2-1', name: 'GigabitEthernet1/0', bandwidth: '1G', status: 'up' },
        { id: 'port-2-2', name: 'GigabitEthernet1/1', bandwidth: '1G', status: 'up' },
      ],
      alarm: false,
      status: 'up',
    },
  ],
  connections: [
    {
      id: 'conn-1',
      source: {
        deviceId: 'device-1',
        portId: 'port-1-1',
      },
      target: {
        deviceId: 'device-2',
        portId: 'port-2-1',
      },
    },
  ],
  groups: [
    {
      id: 'group-1',
      name: '核心机房',
      x: 100,
      y: 100,
      width: 500,
      height: 200,
    },
  ],
  canvas: {
    scale: 1,
    position: { x: 0, y: 0 },
  },
  timestamp: '2024-01-01T00:00:00.000Z',
};