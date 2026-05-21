'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ArrowLeft, Save, AlertCircle, Laptop, Trash2, User, Clock, UserCheck, UserMinus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { equipoSchema } from '@/lib/validations';
import { updateEquipo, deleteEquipo } from '@/actions/equipos';
import { z } from 'zod';

interface FuncionarioRef {
  id: string;
  nombre: string;
}

interface Equipo {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  serial: string | null;
  ip: string | null;
  mac: string | null;
  ram: string | null;
  estado: 'ACTIVO' | 'BODEGA' | 'BAJA';
  notas: string | null;
  funcionarioId: string | null;
}

interface HistorialRef {
  id: string;
  tipoMovimiento: string;
  estado: string;
  notas: string | null;
  createdAt: string;
  usuario: {
    nombre: string;
  };
  funcionario: {
    nombre: string;
  } | null;
}

interface EditEquipoClientProps {
  equipo: Equipo;
  funcionarios: FuncionarioRef[];
  historial: HistorialRef[];
}

type FormValues = z.infer<typeof equipoSchema>;

export function EditEquipoClient({ equipo, funcionarios, historial }: EditEquipoClientProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(equipoSchema),
    defaultValues: {
      tipo: equipo.tipo || 'PC',
      marca: equipo.marca || '',
      modelo: equipo.modelo || '',
      serial: equipo.serial || '',
      ip: equipo.ip || '',
      mac: equipo.mac || '',
      ram: equipo.ram || '',
      estado: equipo.estado || 'ACTIVO',
      notas: equipo.notas || '',
      funcionarioId: equipo.funcionarioId || '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    const result = await updateEquipo(equipo.id, data);
    setIsSubmitting(false);

    if (result.success) {
      router.refresh();
      alert('Equipo actualizado con éxito');
    } else {
      setError(result.error || 'Ocurrió un error al actualizar el equipo.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este equipo del inventario?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteEquipo(equipo.id);
    setIsDeleting(false);

    if (result.success) {
      router.push('/dashboard/equipos');
      router.refresh();
    } else {
      alert(result.error || 'Error al eliminar el equipo');
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/equipos">
          <Button variant="ghost" size="icon-sm" className="hover:bg-muted">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Volver</span>
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Volver a equipos</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Editar Formulario */}
        <div className="lg:col-span-2">
          <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="border-b border-muted/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Editar Equipo</CardTitle>
                  <CardDescription>
                    Modifica la información técnica, física y de asignación de este hardware.
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo de Equipo <span className="text-destructive">*</span></Label>
                    <select
                      id="tipo"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...register('tipo')}
                    >
                      <option value="PC">PC (Escritorio)</option>
                      <option value="Notebook">Notebook (Portátil)</option>
                      <option value="Impresora">Impresora / Multifuncional</option>
                      <option value="Monitor">Monitor</option>
                      <option value="Servidor">Servidor</option>
                      <option value="Switch">Switch / Router</option>
                      <option value="Otro">Otro</option>
                    </select>
                    {errors.tipo && (
                      <span className="text-xs text-destructive">{errors.tipo.message}</span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="estado">Estado del Equipo <span className="text-destructive">*</span></Label>
                    <select
                      id="estado"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...register('estado')}
                    >
                      <option value="ACTIVO">ACTIVO (En uso)</option>
                      <option value="BODEGA">BODEGA (Almacenado)</option>
                      <option value="BAJA">BAJA (Descompuesto/Retirado)</option>
                    </select>
                    {errors.estado && (
                      <span className="text-xs text-destructive">{errors.estado.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input id="marca" placeholder="Ej: Lenovo, HP" className="bg-muted/20" {...register('marca')} />
                    {errors.marca && <span className="text-xs text-destructive">{errors.marca.message}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input id="modelo" placeholder="Ej: ThinkCentre M70q" className="bg-muted/20" {...register('modelo')} />
                    {errors.modelo && <span className="text-xs text-destructive">{errors.modelo.message}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="serial">Número de Serie (S/N)</Label>
                    <Input id="serial" placeholder="Ej: MJ089XYZ" className="bg-muted/20" {...register('serial')} />
                    {errors.serial && <span className="text-xs text-destructive">{errors.serial.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ip">Dirección IP (Opcional)</Label>
                    <Input id="ip" placeholder="Ej: 192.168.10.45" className="bg-muted/20" {...register('ip')} />
                    {errors.ip && <span className="text-xs text-destructive">{errors.ip.message}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="mac">Dirección MAC (Opcional)</Label>
                    <Input id="mac" placeholder="Ej: AA:BB:CC:DD:EE:FF" className="bg-muted/20" {...register('mac')} />
                    {errors.mac && <span className="text-xs text-destructive">{errors.mac.message}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ram">Memoria RAM (Opcional)</Label>
                    <Input id="ram" placeholder="Ej: 8GB DDR4" className="bg-muted/20" {...register('ram')} />
                    {errors.ram && <span className="text-xs text-destructive">{errors.ram.message}</span>}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="funcionarioId">Asignar Responsable (Opcional)</Label>
                  <select
                    id="funcionarioId"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('funcionarioId')}
                  >
                    <option value="">Sin Asignar (Disponible en Bodega)</option>
                    {funcionarios.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.funcionarioId && (
                    <span className="text-xs text-destructive">{errors.funcionarioId.message}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notas">Notas / Comentarios</Label>
                  <textarea
                    id="notas"
                    placeholder="Observaciones..."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('notas')}
                  />
                  {errors.notas && <span className="text-xs text-destructive">{errors.notas.message}</span>}
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
                  Eliminar Equipo
                </Button>
                <div className="flex gap-2">
                  <Link href="/dashboard/equipos">
                    <Button type="button" variant="outline">
                      Cancelar
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

        {/* Columna Historial/Línea de Tiempo */}
        <div className="lg:col-span-1">
          <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden h-full flex flex-col">
            <CardHeader className="border-b border-muted/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Historial de Activo</CardTitle>
                  <CardDescription>
                    Bitácora de movimientos y asignaciones.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex-1 overflow-y-auto max-h-[550px]">
              {historial.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 h-full min-h-[150px] gap-2">
                  <Clock className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">Sin registros en la bitácora</p>
                </div>
              ) : (
                <div className="relative pl-4 border-l border-muted space-y-6">
                  {historial.map((item) => {
                    let Icon = RefreshCw;
                    let iconColor = "bg-muted text-muted-foreground";
                    let label = "Modificado";

                    if (item.tipoMovimiento === 'CREACION') {
                      Icon = Laptop;
                      iconColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
                      label = "Registro Inicial";
                    } else if (item.tipoMovimiento === 'ASIGNACION') {
                      Icon = UserCheck;
                      iconColor = "bg-green-500/10 text-green-600 dark:text-green-400";
                      label = "Asignado";
                    } else if (item.tipoMovimiento === 'DEVOLUCION') {
                      Icon = UserMinus;
                      iconColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
                      label = "Devuelto";
                    } else if (item.tipoMovimiento === 'BAJA') {
                      Icon = Trash2;
                      iconColor = "bg-red-500/10 text-red-600 dark:text-red-400";
                      label = "Baja";
                    }

                    return (
                      <div key={item.id} className="relative">
                        {/* Dot / Icon */}
                        <div className={`absolute -left-[30px] top-0.5 p-1 rounded-full border border-background ${iconColor}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-foreground">
                              {label}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-medium">
                              {new Date(item.createdAt).toLocaleDateString('es-CL', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug">
                            {item.notas}
                          </p>
                          {item.funcionario && (
                            <p className="text-[10px] font-semibold text-foreground/80 mt-0.5">
                              Asignado a: {item.funcionario.nombre}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-0.5 text-[9px] text-muted-foreground">
                            <User className="h-2.5 w-2.5" />
                            <span>Por: {item.usuario.nombre}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
