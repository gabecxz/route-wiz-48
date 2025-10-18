import { Package, Users, TrendingUp, Clock, MapPin, Navigation } from 'lucide-react';
import { useLogistics } from '@/contexts/LogisticsContext';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryMap } from '@/components/DeliveryMap';
import { StatusBadge } from '@/components/StatusBadge';

export default function Index() {
  const { statistics, deliveries, drivers } = useLogistics();

  const recentDeliveries = deliveries
    .filter(d => d.status !== 'entregue' && d.status !== 'cancelada')
    .slice(0, 5);

  const activeDrivers = drivers.filter(d => d.status === 'em-entrega').slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de roteirização e entregas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Entregas"
          value={statistics.totalDeliveries}
          icon={Package}
          description="Todas as entregas cadastradas"
          variant="primary"
        />
        <StatCard
          title="Entregas Pendentes"
          value={statistics.pendingDeliveries}
          icon={Clock}
          description="Aguardando atribuição"
          variant="warning"
        />
        <StatCard
          title="Em Andamento"
          value={statistics.inProgressDeliveries}
          icon={Navigation}
          description="Entregas em execução"
          variant="primary"
        />
        <StatCard
          title="Concluídas"
          value={statistics.completedDeliveries}
          icon={TrendingUp}
          description="Entregas finalizadas"
          variant="success"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Motoristas"
          value={statistics.totalDrivers}
          icon={Users}
          description="Motoristas cadastrados"
        />
        <StatCard
          title="Motoristas Ativos"
          value={statistics.activeDrivers}
          icon={Users}
          description="Em entregas no momento"
          variant="success"
        />
        <StatCard
          title="Distância Total"
          value={`${statistics.totalDistance.toFixed(1)} km`}
          icon={MapPin}
          description="Todas as rotas"
        />
        <StatCard
          title="Tempo Médio"
          value={`${Math.round(statistics.averageDeliveryTime)} min`}
          icon={Clock}
          description="Por entrega"
        />
      </div>

      {recentDeliveries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Entregas no Mapa</CardTitle>
          </CardHeader>
          <CardContent>
            <DeliveryMap deliveries={recentDeliveries} height="400px" />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Entregas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeliveries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma entrega ativa no momento
              </p>
            ) : (
              <div className="space-y-3">
                {recentDeliveries.map((delivery) => {
                  const driver = drivers.find(d => d.id === delivery.assignedDriverId);
                  return (
                    <div
                      key={delivery.id}
                      className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">{delivery.client}</div>
                        <div className="text-sm text-muted-foreground">{delivery.address}</div>
                        {driver && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {driver.name}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={delivery.status} type="delivery" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Motoristas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {activeDrivers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum motorista em entrega no momento
              </p>
            ) : (
              <div className="space-y-3">
                {activeDrivers.map((driver) => {
                  const assignedDeliveries = deliveries.filter(
                    d => d.assignedDriverId === driver.id && d.status === 'em-andamento'
                  );
                  return (
                    <div
                      key={driver.id}
                      className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {driver.vehiclePlate} - {driver.vehicleType}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {assignedDeliveries.length} entrega(s) em andamento
                        </div>
                      </div>
                      <StatusBadge status={driver.status} type="driver" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
