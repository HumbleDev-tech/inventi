import { getFuncionarios } from '@/actions/funcionarios';
import { FuncionariosClient } from './FuncionariosClient';

export default async function FuncionariosPage() {
  const funcionarios = await getFuncionarios();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Funcionarios</h1>
        <p className="text-muted-foreground">
          Directorio del personal y sus equipos TI asignados.
        </p>
      </div>
      <FuncionariosClient initialFuncionarios={funcionarios} />
    </div>
  );
}
