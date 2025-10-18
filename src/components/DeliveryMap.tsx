import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Delivery, Driver } from '@/types/logistics';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const getMarkerColor = (status: string): string => {
  switch (status) {
    case 'pendente':
      return '#f59e0b';
    case 'em-andamento':
      return '#3b82f6';
    case 'entregue':
      return '#10b981';
    case 'cancelada':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

interface DeliveryMapProps {
  deliveries: Delivery[];
  drivers?: Driver[];
  selectedDeliveries?: string[];
  routePath?: { lat: number; lng: number }[];
  height?: string;
}

function MapUpdater({ deliveries }: { deliveries: Delivery[] }) {
  const map = useMap();

  useEffect(() => {
    if (deliveries.length > 0) {
      const bounds = deliveries.map(d => [d.coordinates.lat, d.coordinates.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [deliveries, map]);

  return null;
}

export function DeliveryMap({ 
  deliveries, 
  selectedDeliveries = [], 
  routePath,
  height = '500px' 
}: DeliveryMapProps) {
  const displayDeliveries = selectedDeliveries.length > 0
    ? deliveries.filter(d => selectedDeliveries.includes(d.id))
    : deliveries;

  const center = displayDeliveries.length > 0
    ? [displayDeliveries[0].coordinates.lat, displayDeliveries[0].coordinates.lng] as [number, number]
    : [-23.5505, -46.6333] as [number, number]; // São Paulo

  return (
    <div className="relative rounded-lg overflow-hidden border border-border shadow-sm" style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater deliveries={displayDeliveries} />

        {displayDeliveries.map((delivery) => (
          <Marker
            key={delivery.id}
            position={[delivery.coordinates.lat, delivery.coordinates.lng]}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{delivery.client}</p>
                <p className="text-muted-foreground text-xs">{delivery.address}</p>
                <p className="text-xs mt-1">
                  <span className="font-medium">Status:</span>{' '}
                  <span style={{ color: getMarkerColor(delivery.status) }}>
                    {delivery.status}
                  </span>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {routePath && routePath.length > 1 && (
          <Polyline
            positions={routePath.map(p => [p.lat, p.lng] as [number, number])}
            color="#3b82f6"
            weight={3}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
}
