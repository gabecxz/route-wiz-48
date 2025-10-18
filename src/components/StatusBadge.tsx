import { Badge } from '@/components/ui/badge';
import { DriverStatus, DeliveryStatus } from '@/types/logistics';

interface StatusBadgeProps {
  status: DriverStatus | DeliveryStatus;
  type: 'driver' | 'delivery';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const getVariant = (): 'default' | 'destructive' | 'outline' | 'secondary' => {
    if (type === 'driver') {
      switch (status as DriverStatus) {
        case 'ocioso':
          return 'secondary';
        case 'em-entrega':
          return 'default';
        case 'voltando':
          return 'outline';
        default:
          return 'default';
      }
    } else {
      switch (status as DeliveryStatus) {
        case 'pendente':
          return 'secondary';
        case 'em-andamento':
          return 'default';
        case 'entregue':
          return 'outline';
        case 'cancelada':
          return 'destructive';
        default:
          return 'default';
      }
    }
  };

  const getLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  return <Badge variant={getVariant()}>{getLabel()}</Badge>;
}
