export type DriverStatus = 'ocioso' | 'em-entrega' | 'voltando';
export type VehicleType = 'moto' | 'carro' | 'van' | 'caminhao';
export type DeliveryStatus = 'pendente' | 'em-andamento' | 'entregue' | 'cancelada';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  status: DriverStatus;
  createdAt: Date;
}

export interface Delivery {
  id: string;
  address: string;
  client: string;
  scheduledTime: Date;
  status: DeliveryStatus;
  assignedDriverId: string | null;
  coordinates: {
    lat: number;
    lng: number;
  };
  completedAt?: Date;
  distance?: number;
  estimatedTime?: number;
  createdAt: Date;
}

export interface Route {
  id: string;
  deliveries: string[];
  driverId: string;
  totalDistance: number;
  estimatedTime: number;
  status: 'planejada' | 'em-andamento' | 'concluida';
  createdAt: Date;
}

export interface Statistics {
  totalDeliveries: number;
  pendingDeliveries: number;
  inProgressDeliveries: number;
  completedDeliveries: number;
  totalDrivers: number;
  activeDrivers: number;
  totalDistance: number;
  averageDeliveryTime: number;
}
