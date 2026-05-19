import { getDashboardData } from '@/actions/dashboard';
import { DashboardClient } from './DashboardClient';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function DashboardPage() {
  const result = await getDashboardData();

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general de tu organización.
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {result.error || 'Ocurrió un error al cargar el dashboard.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general y métricas clave de tu organización.
        </p>
      </div>
      <DashboardClient data={result.data} />
    </div>
  );
}
