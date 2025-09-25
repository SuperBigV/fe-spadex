export interface Room {
  id: number;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: number;
  name: string;
  ip: string;
}

export interface Rack {
  id: number;
  u: string;
  unicode: string;
  createdAt: string;
  room_id: number;
  updatedAt: string;
  devices?: Device[];
}
