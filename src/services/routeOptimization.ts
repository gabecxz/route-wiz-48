import { Delivery } from '@/types/logistics';

interface Coordinates {
  lat: number;
  lng: number;
}

// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

// Nearest neighbor algorithm for TSP approximation
export const optimizeRoute = (deliveries: Delivery[], startPoint?: Coordinates): {
  optimizedDeliveries: Delivery[];
  totalDistance: number;
  estimatedTime: number;
} => {
  if (deliveries.length === 0) {
    return { optimizedDeliveries: [], totalDistance: 0, estimatedTime: 0 };
  }

  if (deliveries.length === 1) {
    return {
      optimizedDeliveries: deliveries,
      totalDistance: 0,
      estimatedTime: 15, // 15 minutes for single delivery
    };
  }

  const unvisited = [...deliveries];
  const optimized: Delivery[] = [];
  let current = startPoint || deliveries[0].coordinates;
  let totalDistance = 0;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    unvisited.forEach((delivery, index) => {
      const distance = calculateDistance(current, delivery.coordinates);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const nearest = unvisited[nearestIndex];
    optimized.push(nearest);
    totalDistance += nearestDistance;
    current = nearest.coordinates;
    unvisited.splice(nearestIndex, 1);
  }

  // Calculate estimated time (assuming 40 km/h average speed + 15 min per delivery)
  const travelTime = (totalDistance / 40) * 60; // minutes
  const deliveryTime = deliveries.length * 15; // 15 minutes per delivery
  const estimatedTime = Math.round(travelTime + deliveryTime);

  return {
    optimizedDeliveries: optimized,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedTime,
  };
};

// Calculate route statistics
export interface RouteStatistics {
  totalDistance: number;
  estimatedTime: number;
  averageDistancePerDelivery: number;
  coordinates: Coordinates[];
}

export const calculateRouteStatistics = (deliveries: Delivery[]): RouteStatistics => {
  const { totalDistance, estimatedTime } = optimizeRoute(deliveries);
  
  return {
    totalDistance,
    estimatedTime,
    averageDistancePerDelivery: deliveries.length > 0 ? totalDistance / deliveries.length : 0,
    coordinates: deliveries.map(d => d.coordinates),
  };
};

// Generate sample coordinates for Brazilian cities
export const generateCoordinates = (baseCity: 'saopaulo' | 'riodejaneiro' | 'brasilia' = 'saopaulo'): Coordinates => {
  const bases = {
    saopaulo: { lat: -23.5505, lng: -46.6333 },
    riodejaneiro: { lat: -22.9068, lng: -43.1729 },
    brasilia: { lat: -15.7801, lng: -47.9292 },
  };

  const base = bases[baseCity];
  const variation = 0.1; // ~10km variation

  return {
    lat: base.lat + (Math.random() - 0.5) * variation,
    lng: base.lng + (Math.random() - 0.5) * variation,
  };
};
