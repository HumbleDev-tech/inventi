import { getInsumos } from '@/actions/insumos';
import { InsumosClient } from './InsumosClient';

export default async function InsumosPage() {
  const insumos = await getInsumos();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Insumos & Repuestos</h1>
        <p className="text-muted-foreground">
          Control de stock de suministros TI (tintas, cables, repuestos) y alertas de bajo stock.
        </p>
      </div>
      <InsumosClient initialInsumos={insumos} />
    </div>
  );
}
