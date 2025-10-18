import React, { createContext, useContext, useState, useEffect } from 'react';
import { Driver, Delivery, Route, Statistics, DriverStatus, DeliveryStatus } from '@/types/logistics';
import { toast } from '@/hooks/use-toast';

interface LogisticsContextType {
  drivers: Driver[];
  deliveries: Delivery[];
  routes: Route[];
  statistics: Statistics;
  addDriver: (driver: Omit<Driver, 'id' | 'createdAt'>) => void;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  updateDriverStatus: (id: string, status: DriverStatus) => void;
  addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt'>) => void;
  updateDelivery: (id: string, delivery: Partial<Delivery>) => void;
  deleteDelivery: (id: string) => void;
  assignDelivery: (deliveryId: string, driverId: string) => void;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => void;
  addRoute: (route: Omit<Route, 'id' | 'createdAt'>) => void;
  calculateStatistics: () => Statistics;
}

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
};

export const LogisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedDrivers = localStorage.getItem('logistics_drivers');
    const savedDeliveries = localStorage.getItem('logistics_deliveries');
    const savedRoutes = localStorage.getItem('logistics_routes');

    if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
    if (savedDeliveries) {
      const parsedDeliveries = JSON.parse(savedDeliveries);
      setDeliveries(parsedDeliveries.map((d: any) => ({
        ...d,
        scheduledTime: new Date(d.scheduledTime),
        createdAt: new Date(d.createdAt),
        completedAt: d.completedAt ? new Date(d.completedAt) : undefined,
      })));
    }
    if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('logistics_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('logistics_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('logistics_routes', JSON.stringify(routes));
  }, [routes]);

  const addDriver = (driver: Omit<Driver, 'id' | 'createdAt'>) => {
    const newDriver: Driver = {
      ...driver,
      id: `driver-${Date.now()}`,
      createdAt: new Date(),
    };
    setDrivers([...drivers, newDriver]);
    toast({ title: 'Motorista adicionado', description: `${driver.name} foi adicionado com sucesso.` });
  };

  const updateDriver = (id: string, driver: Partial<Driver>) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, ...driver } : d));
    toast({ title: 'Motorista atualizado' });
  };

  const deleteDriver = (id: string) => {
    setDrivers(drivers.filter(d => d.id !== id));
    toast({ title: 'Motorista removido' });
  };

  const updateDriverStatus = (id: string, status: DriverStatus) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, status } : d));
  };

  const addDelivery = (delivery: Omit<Delivery, 'id' | 'createdAt'>) => {
    const newDelivery: Delivery = {
      ...delivery,
      id: `delivery-${Date.now()}`,
      createdAt: new Date(),
    };
    setDeliveries([...deliveries, newDelivery]);
    toast({ title: 'Entrega adicionada', description: `Entrega para ${delivery.client} criada.` });
  };

  const updateDelivery = (id: string, delivery: Partial<Delivery>) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, ...delivery } : d));
    toast({ title: 'Entrega atualizada' });
  };

  const deleteDelivery = (id: string) => {
    setDeliveries(deliveries.filter(d => d.id !== id));
    toast({ title: 'Entrega removida' });
  };

  const assignDelivery = (deliveryId: string, driverId: string) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    const driver = drivers.find(d => d.id === driverId);
    
    if (delivery && driver) {
      setDeliveries(deliveries.map(d => 
        d.id === deliveryId ? { ...d, assignedDriverId: driverId, status: 'em-andamento' as DeliveryStatus } : d
      ));
      setDrivers(drivers.map(d => 
        d.id === driverId ? { ...d, status: 'em-entrega' as DriverStatus } : d
      ));
      toast({ 
        title: 'Entrega atribuída', 
        description: `${driver.name} foi atribuído à entrega para ${delivery.client}.` 
      });
    }
  };

  const updateDeliveryStatus = (id: string, status: DeliveryStatus) => {
    const delivery = deliveries.find(d => d.id === id);
    
    setDeliveries(deliveries.map(d => 
      d.id === id ? { 
        ...d, 
        status, 
        completedAt: (status === 'entregue' || status === 'cancelada') ? new Date() : undefined 
      } : d
    ));

    if (delivery && delivery.assignedDriverId && (status === 'entregue' || status === 'cancelada')) {
      setDrivers(drivers.map(d => 
        d.id === delivery.assignedDriverId ? { ...d, status: 'ocioso' as DriverStatus } : d
      ));
    }
  };

  const addRoute = (route: Omit<Route, 'id' | 'createdAt'>) => {
    const newRoute: Route = {
      ...route,
      id: `route-${Date.now()}`,
      createdAt: new Date(),
    };
    setRoutes([...routes, newRoute]);
    toast({ title: 'Rota criada', description: `Rota com ${route.deliveries.length} entregas otimizada.` });
  };

  const calculateStatistics = (): Statistics => {
    const totalDeliveries = deliveries.length;
    const pendingDeliveries = deliveries.filter(d => d.status === 'pendente').length;
    const inProgressDeliveries = deliveries.filter(d => d.status === 'em-andamento').length;
    const completedDeliveries = deliveries.filter(d => d.status === 'entregue').length;
    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter(d => d.status === 'em-entrega').length;
    const totalDistance = deliveries.reduce((sum, d) => sum + (d.distance || 0), 0);
    const completedWithTime = deliveries.filter(d => d.status === 'entregue' && d.estimatedTime);
    const averageDeliveryTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, d) => sum + (d.estimatedTime || 0), 0) / completedWithTime.length
      : 0;

    return {
      totalDeliveries,
      pendingDeliveries,
      inProgressDeliveries,
      completedDeliveries,
      totalDrivers,
      activeDrivers,
      totalDistance,
      averageDeliveryTime,
    };
  };

  const statistics = calculateStatistics();

  return (
    <LogisticsContext.Provider
      value={{
        drivers,
        deliveries,
        routes,
        statistics,
        addDriver,
        updateDriver,
        deleteDriver,
        updateDriverStatus,
        addDelivery,
        updateDelivery,
        deleteDelivery,
        assignDelivery,
        updateDeliveryStatus,
        addRoute,
        calculateStatistics,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};
