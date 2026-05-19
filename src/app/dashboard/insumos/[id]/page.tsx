import { getInsumoById } from '@/actions/insumos';
import { notFound } from 'next/navigation';
import { EditInsumoClient } from './EditInsumoClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DetalleInsumoPage({ params }: PageProps) {
  const insumo = await getInsumoById(params.id);

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

  return <EditInsumoClient insumo={formattedInsumo} />;
}
