import { getFuncionarioById } from '@/actions/funcionarios';
import { notFound } from 'next/navigation';
import { EditFuncionarioClient } from './EditFuncionarioClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DetalleFuncionarioPage({ params }: PageProps) {
  const funcionario = await getFuncionarioById(params.id);

  if (!funcionario) {
    notFound();
  }

  // Mapear campos null a string vacía o estructurar para coincidir con la interfaz del cliente
  const formattedFuncionario = {
    id: funcionario.id,
    nombre: funcionario.nombre,
    rut: funcionario.rut,
    cargo: funcionario.cargo,
    departamento: funcionario.departamento,
    telefono: funcionario.telefono,
    email: funcionario.email,
    equipos: funcionario.equipos.map(e => ({
      id: e.id,
      tipo: e.tipo,
      marca: e.marca,
      modelo: e.modelo,
      serial: e.serial,
      estado: e.estado
    }))
  };

  return <EditFuncionarioClient funcionario={formattedFuncionario} />;
}
