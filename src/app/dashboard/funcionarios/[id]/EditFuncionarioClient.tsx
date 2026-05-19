'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, AlertCircle, Laptop, Settings, Trash2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { funcionarioSchema } from '@/lib/validations';
import { updateFuncionario, deleteFuncionario } from '@/actions/funcionarios';
import { z } from 'zod';

interface Equipo {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  serial: string | null;
  estado: string;
}

interface Funcionario {
  id: string;
  nombre: string;
  rut: string | null;
  cargo: string | null;
  departamento: string | null;
  telefono: string | null;
  email: string | null;
  equipos: Equipo[];
}

interface EditFuncionarioClientProps {
  funcionario: Funcionario;
}

type FormValues = z.infer<typeof funcionarioSchema>;

export function EditFuncionarioClient({ funcionario }: EditFuncionarioClientProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: {
      nombre: funcionario.nombre || '',
      rut: funcionario.rut || '',
      cargo: funcionario.cargo || '',
      departamento: funcionario.departamento || '',
      telefono: funcionario.telefono || '',
      email: funcionario.email || '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    const result = await updateFuncionario(funcionario.id, data);
    setIsSubmitting(false);

    if (result.success) {
      router.refresh();
      alert('Funcionario actualizado con éxito');
    } else {
      setError(result.error || 'Ocurrió un error al actualizar.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este funcionario? Sus equipos asignados quedarán sin responsable.')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteFuncionario(funcionario.id);
    setIsDeleting(false);

    if (result.success) {
      router.push('/dashboard/funcionarios');
      router.refresh();
    } else {
      alert(result.error || 'Error al eliminar funcionario');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/funcionarios">
          <Button variant="ghost" size="icon-sm" className="hover:bg-muted">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Volver</span>
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Volver a funcionarios</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Editar Formulario */}
        <div className="lg:col-span-2">
          <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="border-b border-muted/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Editar Funcionario</CardTitle>
                  <CardDescription>
                    Modifica los datos personales y profesionales del funcionario.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre Completo <span className="text-destructive">*</span></Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Dr. Juan Pérez"
                    className="bg-muted/20"
                    {...register('nombre')}
                  />
                  {errors.nombre && (
                    <span className="text-xs text-destructive">{errors.nombre.message}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rut">RUT (Opcional)</Label>
                    <Input
                      id="rut"
                      placeholder="Ej: 12.345.678-9"
                      className="bg-muted/20"
                      {...register('rut')}
                    />
                    {errors.rut && (
                      <span className="text-xs text-destructive">{errors.rut.message}</span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cargo">Cargo (Opcional)</Label>
                    <Input
                      id="cargo"
                      placeholder="Ej: Médico General"
                      className="bg-muted/20"
                      {...register('cargo')}
                    />
                    {errors.cargo && (
                      <span className="text-xs text-destructive">{errors.cargo.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="departamento">Departamento / Unidad (Opcional)</Label>
                    <Input
                      id="departamento"
                      placeholder="Ej: Urgencias"
                      className="bg-muted/20"
                      {...register('departamento')}
                    />
                    {errors.departamento && (
                      <span className="text-xs text-destructive">{errors.departamento.message}</span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                    <Input
                      id="telefono"
                      placeholder="Ej: +56 9 1234 5678"
                      className="bg-muted/20"
                      {...register('telefono')}
                    />
                    {errors.telefono && (
                      <span className="text-xs text-destructive">{errors.telefono.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Correo Electrónico (Opcional)</Label>
                  <Input
                    id="email"
                    placeholder="Ej: juan.perez@hospitalachao.cl"
                    className="bg-muted/20"
                    {...register('email')}
                  />
                  {errors.email && (
                    <span className="text-xs text-destructive">{errors.email.message}</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t border-muted/50 p-6 flex justify-between gap-2 bg-muted/10">
                <Button 
                  type="button" 
                  variant="destructive" 
                  className="gap-2" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Funcionario
                </Button>
                <div className="flex gap-2">
                  <Link href="/dashboard/funcionarios">
                    <Button type="button" variant="outline">
                      Volver
                    </Button>
                  </Link>
                  <Button type="submit" className="gap-2" disabled={isSubmitting}>
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Columna Equipos Asignados */}
        <div>
          <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden h-full flex flex-col">
            <CardHeader className="border-b border-muted/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Equipos Asignados</CardTitle>
                  <CardDescription>
                    Dispositivos asignados bajo la responsabilidad de este funcionario.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-auto">
              {funcionario.equipos.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[200px] gap-2">
                  <ShieldAlert className="h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm font-semibold text-muted-foreground">Sin equipos asignados</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Puedes asignar equipos a este funcionario editando el equipo específico.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {funcionario.equipos.map((eq) => (
                    <div 
                      key={eq.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-muted bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {eq.marca || ''} {eq.modelo || ''}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          S/N: {eq.serial || 'Sin Serial'} • {eq.tipo}
                        </span>
                        <div className="mt-1">
                          <Badge 
                            variant="secondary"
                            className={`text-[9px] font-bold px-1.5 py-0.5 ${
                              eq.estado === 'ACTIVO' 
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                                : eq.estado === 'BODEGA'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {eq.estado}
                          </Badge>
                        </div>
                      </div>
                      <Link href={`/dashboard/equipos/${eq.id}`}>
                        <Button variant="ghost" size="xs" className="text-xs hover:bg-primary/10 hover:text-primary">
                          Ver equipo
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
