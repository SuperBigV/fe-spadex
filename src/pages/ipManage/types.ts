export interface Subnet {
  id: number;
  addr: string;
  mask: string;
  note: string;
  netmask: string;
  broadcast: string;
  network_addr: string;
  ips: any[];
}

export interface RASConfig {
  OpenRSA: boolean;
  RSAPublicKey: string;
}
