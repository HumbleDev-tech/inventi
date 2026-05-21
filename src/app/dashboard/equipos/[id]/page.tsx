import { getEquipoById, getEquipoHistorial } from '@/actions/equipos';
import { getFuncionarios } from '@/actions/funcionarios';
import { notFound } from 'next/navigation';
import { EditEquipoClient } from './EditEquipoClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DetalleEquipoPage({ params }: PageProps) {
  const equipo = await getEquipoById(params.id);
  const funcionarios = await getFuncionarios();
  const historial = await getEquipoHistorial(params.id);

  if (!equipo) {
    notFound();
  }

  // Estructurar equipo y mapear campos null
  const formattedEquipo = {
    id: equipo.id,
    tipo: equipo.tipo,
    marca: equipo.marca,
    modelo: equipo.modelo,
    serial: equipo.serial,
    ip: equipo.ip,
    mac: equipo.mac,
    ram: equipo.ram,
    estado: equipo.estado as 'ACTIVO' | 'BODEGA' | 'BAJA',
    notas: equipo.notas,
    funcionarioId: equipo.funcionarioId,
  };

  const formattedFuncionarios = funcionarios.map((f) => ({
    id: f.id,
    nombre: f.nombre,
  }));

  const formattedHistorial = historial.map((h) => ({
    id: h.id,
    tipoMovimiento: h.tipoMovimiento,
    estado: h.estado,
    notas: h.notas,
    createdAt: h.createdAt.toISOString(),
    usuario: {
      nombre: h.usuario.nombre,
    },
    funcionario: h.funcionario ? {
      nombre: h.funcionario.nombre,
    } : null,
  }));

  return (
    <EditEquipoClient 
      equipo={formattedEquipo} 
      funcionarios={formattedFuncionarios} 
      historial={formattedHistorial}
    />
  );
}
