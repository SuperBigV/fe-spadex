import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import type {
  PingRequest,
  TracerouteRequest,
  SubnetRequest,
  PortScanRequest,
  HostDiscoveryRequest,
  IPConflictRequest,
  PacketCaptureRequest,
  DNSRequest,
  SpeedTestRequest,
} from '../types';

// 获取主机列表
export const getHosts = () => {
  return request('/api/n9e/net-tools/hosts', {
    method: RequestMethod.Get,
  });
};

// Ping 测试
export const postNetToolPing = (data: PingRequest) => {
  return request('/api/n9e/net-tools/ping', {
    method: RequestMethod.Post,
    data,
  });
};

// 路由追踪
export const postNetToolTraceroute = (data: TracerouteRequest) => {
  return request('/api/n9e/net-tools/traceroute', {
    method: RequestMethod.Post,
    data,
  });
};

// 子网计算
export const postNetToolSubnet = (data: SubnetRequest) => {
  return request('/api/n9e/net-tools/subnet', {
    method: RequestMethod.Post,
    data,
  });
};

// 端口扫描
export const postNetToolPortScan = (data: PortScanRequest) => {
  return request('/api/n9e/net-tools/port-scan', {
    method: RequestMethod.Post,
    data,
  });
};

// 主机发现
export const postNetToolHostDiscovery = (data: HostDiscoveryRequest) => {
  return request('/api/n9e/net-tools/host-discovery', {
    method: RequestMethod.Post,
    data,
  });
};

// IP 冲突检测
export const postNetToolIPConflict = (data: IPConflictRequest) => {
  return request('/api/n9e/net-tools/ip-conflict', {
    method: RequestMethod.Post,
    data,
  });
};

// 数据包抓包
export const postNetToolPacketCapture = (data: PacketCaptureRequest) => {
  return request('/api/n9e/net-tools/packet-capture', {
    method: RequestMethod.Post,
    data,
  });
};

// DNS 测试
export const postNetToolDNS = (data: DNSRequest) => {
  return request('/api/n9e/net-tools/dns', {
    method: RequestMethod.Post,
    data,
  });
};

// 网络测速
export const postNetToolSpeedTest = (data: SpeedTestRequest) => {
  return request('/api/n9e/net-tools/speed-test', {
    method: RequestMethod.Post,
    data,
  });
};
