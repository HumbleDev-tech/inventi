export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general de tu organización.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Bienvenido a InvenTI
          </h3>
          <p className="text-sm text-muted-foreground">
            Aquí se mostrarán las métricas clave de tu inventario.
          </p>
        </div>
      </div>
    </div>
  );
}
