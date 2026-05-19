import { getFuncionarios } from '@/actions/funcionarios';
import { NuevoEquipoClient } from './NuevoEquipoClient';

export default async function NuevoEquipoPage() {
  const funcionarios = await getFuncionarios();

  const formattedFuncionarios = funcionarios.map((f) => ({
    id: f.id,
    nombre: f.nombre,
  }));

  return <NuevoEquipoClient funcionarios={formattedFuncionarios} />;
}
