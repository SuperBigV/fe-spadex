export interface Host {
  ip: string;
  ident: string;
}

export interface PingRequest {
  target: string;
  count?: number;
  timeout?: number;
  interval?: number;
  execMode?: 'local' | 'remote';
  agentIdent?: string;
}

export interface PingResponse {
  success: boolean;
  target: string;
  sourceIp: string;
  sent: number;
  received: number;
  packetLoss: string;
  minRtt?: number;
  maxRtt?: number;
  avgRtt?: number;
  status: string;
  error?: string;
  checkTime: string;
  execMode: string;
}

export interface TracerouteRequest {
  target: string;
  maxHops?: number;
  timeout?: number;
  execMode?: 'local' | 'remote';
  agentIdent?: string;
}

export interface TracerouteResponse {
  success: boolean;
  target: string;
  hops?: Array<{
    hop: number;
    ip: string;
    hostname?: string;
    rtt: number[];
  }>;
  result: string;
  error?: string;
  checkTime: string;
  execMode: string;
}

export interface SubnetRequest {
  ip: string;
  mask: string;
  calculateType?: 'subnet' | 'hosts' | 'all';
}

export interface SubnetResponse {
  success: boolean;
  network: string;
  broadcast: string;
  netmask: string;
  cidr: string;
  hosts: {
    total: number;
    usable: number;
    first: string;
    last: string;
  };
  wildcard: string;
  checkTime: string;
}

export interface PortScanRequest {
  target: string;
  ports: string;
  scanType?: 'tcp' | 'udp';
  timeout?: number;
  execMode?: 'local' | 'remote';
  agentIdent?: string;
}

export interface PortScanResponse {
  success: boolean;
  target: string;
  scanType: string;
  ports: Array<{
    port: number;
    status: string;
    service?: string;
    banner?: string;
  }>;
  summary: {
    total: number;
    open: number;
    closed: number;
    filtered: number;
  };
  checkTime: string;
}

export interface HostDiscoveryRequest {
  network: string;
  scanType?: 'ping' | 'arp' | 'syn';
  timeout?: number;
  execMode?: 'local' | 'remote';
  agentIdent?: string;
}

export interface HostDiscoveryResponse {
  success: boolean;
  network: string;
  scanType: string;
  hosts: Array<{
    ip: string;
    hostname?: string;
    mac?: string;
    status: string;
    rtt?: number;
  }>;
  summary: {
    total: number;
    alive: number;
    dead: number;
  };
  checkTime: string;
}

export interface IPConflictRequest {
  scanMode?: 'single' | 'network';
  ip?: string;
  network: string;
  detectionMethod?: 'arp' | 'ping' | 'both';
  timeout?: number;
  concurrency?: number;
  execMode?: 'local' | 'remote';
  agentIdent?: string;
}

export interface IPConflictResponse {
  success: boolean;
  scanMode: 'single' | 'network';
  ip?: string;
  network: string;
  conflict?: boolean; // 单IP检测模式
  conflictDetails?: Array<{
    ip: string;
    mac: string;
    hostname?: string;
    detectedAt: string;
  }>; // 单IP检测模式
  conflicts?: Array<{
    ip: string;
    conflict: boolean;
    conflictDetails: Array<{
      ip: string;
      mac: string;
      hostname?: string;
      detectedAt: string;
    }>;
  }>; // 网络扫描模式
  summary?: {
    totalIPs: number;
    scannedIPs: number;
    conflictIPs: number;
    normalIPs: number;
    failedIPs: number;
  }; // 网络扫描模式
  duration?: number; // 网络扫描模式，扫描耗时（秒）
  checkTime: string;
}

export interface PacketCaptureRequest {
  agentIdent: string;
  interface?: string;
  filter?: string;
  count?: number;
  duration?: number;
  outputFormat?: 'text' | 'json';
}

export interface PacketCaptureResponse {
  success: boolean;
  agentIdent: string;
  interface: string;
  // 文本模式下返回的原始抓包结果（tcpdump 原始输出）
  result?: string;
  packets?: Array<{
    timestamp: string;
    src: string;
    dst: string;
    protocol: string;
    length: number;
    info?: string;
  }>;
  summary?: {
    total: number;
    tcp: number;
    udp: number;
    icmp: number;
  };
  error?: string;
  checkTime: string;
}

export interface DNSRequest {
  domain: string;
  dnsServer?: string;
  recordType?: 'A' | 'AAAA' | 'MX' | 'CNAME' | 'TXT';
  timeout?: number;
  execMode?: 'local' | 'remote';
  agentIdent?: string;
}

export interface DNSResponse {
  success: boolean;
  domain: string;
  dnsServer: string;
  recordType: string;
  records: Array<{
    type: string;
    value: string;
    ttl: number;
  }>;
  responseTime: number;
  checkTime: string;
}

export interface SpeedTestRequest {
  target: string;
  testType?: 'bandwidth' | 'latency' | 'both';
  duration?: number;
  execMode?: 'local' | 'remote';
  agentIdent?: string;
}

export interface SpeedTestResponse {
  success: boolean;
  target: string;
  testType: string;
  latency?: {
    min: number;
    max: number;
    avg: number;
    jitter: number;
  };
  bandwidth?: {
    download: number;
    upload: number;
    unit: string;
  };
  packetLoss: string;
  checkTime: string;
}
