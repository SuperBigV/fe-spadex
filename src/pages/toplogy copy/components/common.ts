import React, { Dispatch, MutableRefObject } from 'react';
// 定义 Canvas 组件的 Props 接口
export interface CanvasProps {
  devices: any[];
  connections: any[];
  groups: any[];
  selectedItem: any;
  setSelectedItem: (item: any) => void;
  canvasScale: number;
  canvasPosition: { x: number; y: number };
  setCanvasPosition: (position: { x: number; y: number }) => void;
  onAddDevice: (device: any) => void;
  onAddConnection: (connection: any) => void;
  onUpdateDevice: (deviceId: string, updates: any) => void;
  onCreateConnection: (connection: any) => void;
  onDeleteDevice: (deviceId: string) => void;
  onMoveDevice: (deviceId: string, x: number, y: number) => void;
  onMoveGroup: (groupId: string, x: number, y: number) => void;
  onResizeGroup: (groupId: string, width: number, height: number) => void;
  onAddDeviceToGroup: (deviceId: string, groupId: string) => void;
  onRemoveDeviceFromGroup: (deviceId: string, groupId: string) => void;
  onAddGroup: (group: any) => void;
  onSelectConnection: (connection: any) => void;
}
// 定义 ref 的类型
export interface CanvasRefObject {
  getCanvasRef: () => MutableRefObject<HTMLDivElement | null>;
}
