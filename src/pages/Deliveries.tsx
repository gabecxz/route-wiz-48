import { useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, Clock, User } from 'lucide-react';
import { useLogistics } from '@/contexts/LogisticsContext';
import { Delivery, DeliveryStatus } from '@/types/logistics';
import { generateCoordinates } from '@/services/routeOptimization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { DeliveryMap } from '@/components/DeliveryMap';

const deliveryStatuses: { value: DeliveryStatus; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em-andamento', label: 'Em Andamento' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelada', label: 'Cancelada' },
];

export default function Deliveries() {
  const { deliveries, drivers, addDelivery, updateDelivery, deleteDelivery, assignDelivery, updateDeliveryStatus } = useLogistics();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [formData, setFormData] = useState({
    address: '',
    client: '',
    scheduledTime: '',
    status: 'pendente' as DeliveryStatus,
    lat: '',
    lng: '',
  });

  const activeDeliveries = deliveries.filter(d => d.status !== 'entregue' && d.status !== 'cancelada');

  const resetForm = () => {
    setFormData({
      address: '',
      client: '',
      scheduledTime: '',
      status: 'pendente',
      lat: '',
      lng: '',
    });
    setEditingDelivery(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const coordinates = formData.lat && formData.lng
      ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) }
      : generateCoordinates();

    const deliveryData = {
      address: formData.address,
      client: formData.client,
      scheduledTime: new Date(formData.scheduledTime),
      status: formData.status,
      assignedDriverId: null,
      coordinates,
    };
    
    if (editingDelivery) {
      updateDelivery(editingDelivery.id, deliveryData);
    } else {
      addDelivery(deliveryData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setFormData({
      address: delivery.address,
      client: delivery.client,
      scheduledTime: delivery.scheduledTime.toISOString().slice(0, 16),
      status: delivery.status,
      lat: delivery.coordinates.lat.toString(),
      lng: delivery.coordinates.lng.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta entrega?')) {
      deleteDelivery(id);
    }
  };

  const handleAssign = (deliveryId: string, driverId: string) => {
    assignDelivery(deliveryId, driverId);
  };

  const handleStatusChange = (deliveryId: string, status: DeliveryStatus) => {
    updateDeliveryStatus(deliveryId, status);
  };

  const availableDrivers = drivers.filter(d => d.status === 'ocioso');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entregas</h1>
          <p className="text-muted-foreground">Gerencie as entregas e atribua motoristas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Entrega
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDelivery ? 'Editar Entrega' : 'Nova Entrega'}
              </DialogTitle>
              <DialogDescription>
                {editingDelivery 
                  ? 'Atualize as informações da entrega' 
                  : 'Adicione uma nova entrega ao sistema'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Input
                      id="client"
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Data/Hora</Label>
                    <Input
                      id="scheduledTime"
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Latitude (opcional)</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      placeholder="-23.5505"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Longitude (opcional)</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                      placeholder="-46.6333"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as DeliveryStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  * Se não fornecer coordenadas, serão geradas automaticamente para São Paulo
                </p>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingDelivery ? 'Atualizar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {activeDeliveries.length > 0 && (
        <DeliveryMap deliveries={activeDeliveries} height="400px" />
      )}

      {activeDeliveries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma entrega ativa.
              <br />
              Adicione entregas para começar a roteirização.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activeDeliveries.map((delivery) => {
            const assignedDriver = drivers.find(d => d.id === delivery.assignedDriverId);
            
            return (
              <Card key={delivery.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{delivery.client}</CardTitle>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={delivery.status} type="delivery" />
                      {assignedDriver && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {assignedDriver.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(delivery)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(delivery.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{delivery.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{delivery.scheduledTime.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {!delivery.assignedDriverId && availableDrivers.length > 0 && (
                      <Select onValueChange={(value) => handleAssign(delivery.id, value)}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Atribuir motorista" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDrivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Select
                      value={delivery.status}
                      onValueChange={(value) => handleStatusChange(delivery.id, value as DeliveryStatus)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
