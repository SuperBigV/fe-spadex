export interface AuthConfig {
  id: number;
  password: string;
  name: string;
  username: string;
  port: number;
  version: string;
  auth_type: string;
}

export interface RASConfig {
  OpenRSA: boolean;
  RSAPublicKey: string;
}

interface TabPaneProps {
  label: string;
  key: string;
  value: string;
}

// 定义一个 Person 对象数组并初始化
export let TabPans: TabPaneProps[] = [
  { label: '访问凭证', key: '1', value: 'ssh' },
  { label: 'SNMP凭证', key: '2', value: 'snmp' },
];

export let AuthTypes: TabPaneProps[] = [
  { label: '服务器访问凭证', key: 'ssh', value: 'ssh' },
  { label: '网络设备访问凭证', key: 'telnet', value: 'telnet' },
  { label: 'SNMP采集凭证', key: 'snmp', value: 'snmp' },
  { label: 'Mysql认证', key: 'mysql', value: 'mysql' },
  { label: 'Redis认证', key: 'redis', value: 'redis' },
];
export interface RASConfig {
  OpenRSA: boolean;
  RSAPublicKey: string;
}
