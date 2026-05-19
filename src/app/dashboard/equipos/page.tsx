import { getEquipos } from '@/actions/equipos';
import { EquiposClient } from './EquiposClient';

export default async function EquiposPage() {
  const equipos = await getEquipos();

  // Asegurar tipado correcto para el cliente Next.js
  const formattedEquipos = equipos.map((e) => ({
    id: e.id,
    tipo: e.tipo,
    marca: e.marca,
    modelo: e.modelo,
    serial: e.serial,
    ip: e.ip,
    mac: e.mac,
    estado: e.estado as 'ACTIVO' | 'BODEGA' | 'BAJA',
    funcionario: e.funcionario,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventario de Equipos</h1>
        <p className="text-muted-foreground">
          Gestión de hardware TI, asignación de responsables y estados de servicio.
        </p>
      </div>
      <EquiposClient initialEquipos={formattedEquipos} />
    </div>
  );
}
