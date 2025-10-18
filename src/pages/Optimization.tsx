import { useState } from 'react';
import { TrendingUp, MapPin, Clock, Navigation } from 'lucide-react';
import { useLogistics } from '@/contexts/LogisticsContext';
import { Delivery } from '@/types/logistics';
import { optimizeRoute } from '@/services/routeOptimization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DeliveryMap } from '@/components/DeliveryMap';
import { StatCard } from '@/components/StatCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Optimization() {
  const { deliveries, drivers, addRoute, assignDelivery } = useLogistics();
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [optimizedRoute, setOptimizedRoute] = useState<{
    deliveries: Delivery[];
    totalDistance: number;
    estimatedTime: number;
  } | null>(null);

  const pendingDeliveries = deliveries.filter(d => d.status === 'pendente');
  const availableDrivers = drivers.filter(d => d.status === 'ocioso');

  const handleOptimize = () => {
    const selected = deliveries.filter(d => selectedDeliveries.includes(d.id));
    const result = optimizeRoute(selected);
    setOptimizedRoute({
      deliveries: result.optimizedDeliveries,
      totalDistance: result.totalDistance,
      estimatedTime: result.estimatedTime,
    });
  };

  const handleCreateRoute = () => {
    if (!selectedDriver || !optimizedRoute) return;

    addRoute({
      deliveries: optimizedRoute.deliveries.map(d => d.id),
      driverId: selectedDriver,
      totalDistance: optimizedRoute.totalDistance,
      estimatedTime: optimizedRoute.estimatedTime,
      status: 'planejada',
    });

    optimizedRoute.deliveries.forEach(delivery => {
      assignDelivery(delivery.id, selectedDriver);
    });

    setSelectedDeliveries([]);
    setSelectedDriver('');
    setOptimizedRoute(null);
  };

  const toggleDelivery = (id: string) => {
    setSelectedDeliveries(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedDeliveries(pendingDeliveries.map(d => d.id));
  };

  const clearAll = () => {
    setSelectedDeliveries([]);
    setOptimizedRoute(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Otimização de Rotas</h1>
        <p className="text-muted-foreground">
          Selecione entregas pendentes e otimize a rota usando cálculos matemáticos
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Entregas Disponíveis</CardTitle>
            <CardDescription>
              Selecione as entregas para otimizar ({selectedDeliveries.length} selecionadas)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Selecionar Todas
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Limpar
              </Button>
            </div>

            {pendingDeliveries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma entrega pendente disponível
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {pendingDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleDelivery(delivery.id)}
                  >
                    <Checkbox
                      checked={selectedDeliveries.includes(delivery.id)}
                      onCheckedChange={() => toggleDelivery(delivery.id)}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{delivery.client}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {delivery.address}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {delivery.scheduledTime.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleOptimize}
              disabled={selectedDeliveries.length === 0}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Otimizar Rota
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado da Otimização</CardTitle>
            <CardDescription>
              Rota otimizada usando algoritmo TSP (Problema do Caixeiro Viajante)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!optimizedRoute ? (
              <div className="text-center text-muted-foreground py-12">
                <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione entregas e clique em "Otimizar Rota"</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    title="Distância Total"
                    value={`${optimizedRoute.totalDistance} km`}
                    icon={MapPin}
                    variant="primary"
                  />
                  <StatCard
                    title="Tempo Estimado"
                    value={`${optimizedRoute.estimatedTime} min`}
                    icon={Clock}
                    variant="success"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ordem Otimizada de Entregas</Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {optimizedRoute.deliveries.map((delivery, index) => (
                      <div
                        key={delivery.id}
                        className="flex items-center gap-3 p-2 bg-muted rounded text-sm"
                      >
                        <span className="font-bold text-primary">#{index + 1}</span>
                        <div className="flex-1">
                          <div className="font-medium">{delivery.client}</div>
                          <div className="text-xs text-muted-foreground">{delivery.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Atribuir Motorista</Label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} ({driver.vehicleType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleCreateRoute}
                  disabled={!selectedDriver}
                >
                  Criar Rota e Atribuir
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {optimizedRoute && optimizedRoute.deliveries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Visualização da Rota</CardTitle>
          </CardHeader>
          <CardContent>
            <DeliveryMap
              deliveries={optimizedRoute.deliveries}
              routePath={optimizedRoute.deliveries.map(d => d.coordinates)}
              height="500px"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
