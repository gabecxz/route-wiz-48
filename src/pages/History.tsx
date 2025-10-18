import { Download, Package, Calendar, User, MapPin } from 'lucide-react';
import { useLogistics } from '@/contexts/LogisticsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';

export default function History() {
  const { deliveries, drivers } = useLogistics();

  const completedDeliveries = deliveries.filter(
    d => d.status === 'entregue' || d.status === 'cancelada'
  ).sort((a, b) => {
    const dateA = a.completedAt || a.createdAt;
    const dateB = b.completedAt || b.createdAt;
    return dateB.getTime() - dateA.getTime();
  });

  const handleExportCSV = () => {
    const headers = ['Data', 'Cliente', 'Endereço', 'Status', 'Motorista', 'Distância (km)', 'Tempo (min)'];
    const rows = completedDeliveries.map(delivery => {
      const driver = drivers.find(d => d.id === delivery.assignedDriverId);
      return [
        delivery.completedAt?.toLocaleDateString('pt-BR') || '',
        delivery.client,
        delivery.address,
        delivery.status,
        driver?.name || 'N/A',
        delivery.distance?.toFixed(2) || 'N/A',
        delivery.estimatedTime || 'N/A',
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico-entregas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportXLSX = () => {
    // Placeholder for XLSX export
    // In a real implementation, you would use a library like 'xlsx'
    alert('Exportação XLSX será implementada com biblioteca específica');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Entregas</h1>
          <p className="text-muted-foreground">
            Visualize e exporte o histórico de entregas concluídas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={handleExportXLSX}>
            <Download className="h-4 w-4 mr-2" />
            Exportar XLSX
          </Button>
        </div>
      </div>

      {completedDeliveries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma entrega concluída ainda.
              <br />
              O histórico aparecerá aqui quando houver entregas finalizadas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {completedDeliveries.map((delivery) => {
            const driver = drivers.find(d => d.id === delivery.assignedDriverId);
            
            return (
              <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{delivery.client}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {delivery.completedAt?.toLocaleString('pt-BR') || 
                       delivery.createdAt.toLocaleString('pt-BR')}
                    </CardDescription>
                  </div>
                  <StatusBadge status={delivery.status} type="delivery" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{delivery.address}</span>
                    </div>
                    {driver && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{driver.name}</span>
                      </div>
                    )}
                  </div>
                  {(delivery.distance || delivery.estimatedTime) && (
                    <div className="flex gap-4 text-sm text-muted-foreground pt-2 border-t">
                      {delivery.distance && (
                        <span>Distância: {delivery.distance.toFixed(2)} km</span>
                      )}
                      {delivery.estimatedTime && (
                        <span>Tempo: {delivery.estimatedTime} min</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
