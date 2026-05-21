import { getInsumoById, getInsumoMovimientos } from '@/actions/insumos';
import { notFound } from 'next/navigation';
import { EditInsumoClient } from './EditInsumoClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DetalleInsumoPage({ params }: PageProps) {
  const insumo = await getInsumoById(params.id);
  const movimientos = await getInsumoMovimientos(params.id);

  if (!insumo) {
    notFound();
  }

  // Formatear campos null
  const formattedInsumo = {
    id: insumo.id,
    nombre: insumo.nombre,
    tipo: insumo.tipo,
    modelo: insumo.modelo,
    stockActual: insumo.stockActual,
    stockMinimo: insumo.stockMinimo,
  };

  const formattedMovimientos = movimientos.map((m) => ({
    id: m.id,
    cantidad: m.cantidad,
    tipo: m.tipo as 'ENTRADA' | 'SALIDA',
    motivo: m.motivo,
    createdAt: m.createdAt.toISOString(),
    usuario: {
      nombre: m.usuario.nombre,
    },
  }));

  return (
    <EditInsumoClient 
      insumo={formattedInsumo} 
      movimientos={formattedMovimientos} 
    />
  );
}
