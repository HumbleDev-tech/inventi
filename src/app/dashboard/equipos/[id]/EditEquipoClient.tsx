'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, AlertCircle, Laptop, Trash2 } from 'lucide-react';
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

interface EditEquipoClientProps {
  equipo: Equipo;
  funcionarios: FuncionarioRef[];
}

type FormValues = z.infer<typeof equipoSchema>;

export function EditEquipoClient({ equipo, funcionarios }: EditEquipoClientProps) {
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
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/equipos">
          <Button variant="ghost" size="icon-sm" className="hover:bg-muted">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Volver</span>
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Volver a equipos</span>
      </div>

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
  );
}
