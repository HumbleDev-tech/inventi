'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, AlertCircle, Package, Trash2, Clock, User, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { insumoSchema } from '@/lib/validations';
import { updateInsumo, deleteInsumo } from '@/actions/insumos';
import { z } from 'zod';

interface Insumo {
  id: string;
  nombre: string;
  tipo: string | null;
  modelo: string | null;
  stockActual: number;
  stockMinimo: number;
}

interface MovimientoRef {
  id: string;
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA';
  motivo: string | null;
  createdAt: string;
  usuario: {
    nombre: string;
  };
}

interface EditInsumoClientProps {
  insumo: Insumo;
  movimientos: MovimientoRef[];
}

type FormValues = z.infer<typeof insumoSchema>;

export function EditInsumoClient({ insumo, movimientos }: EditInsumoClientProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(insumoSchema),
    defaultValues: {
      nombre: insumo.nombre || '',
      tipo: insumo.tipo || '',
      modelo: insumo.modelo || '',
      stockActual: insumo.stockActual || 0,
      stockMinimo: insumo.stockMinimo || 2,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    const result = await updateInsumo(insumo.id, data);
    setIsSubmitting(false);

    if (result.success) {
      router.refresh();
      alert('Insumo actualizado con éxito');
    } else {
      setError(result.error || 'Ocurrió un error al actualizar el insumo.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este insumo del inventario?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteInsumo(insumo.id);
    setIsDeleting(false);

    if (result.success) {
      router.push('/dashboard/insumos');
      router.refresh();
    } else {
      alert(result.error || 'Error al eliminar el insumo');
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/insumos">
          <Button variant="ghost" size="icon-sm" className="hover:bg-muted">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Volver</span>
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Volver a insumos</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Editar Formulario */}
        <div className="lg:col-span-2">
          <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="border-b border-muted/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Editar Insumo</CardTitle>
                  <CardDescription>
                    Modifica el stock, límites o especificaciones técnicas del insumo.
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
                  <Label htmlFor="nombre">Nombre del Insumo <span className="text-destructive">*</span></Label>
                  <Input
                    id="nombre"
                    className="bg-muted/20"
                    {...register('nombre')}
                  />
                  {errors.nombre && (
                    <span className="text-xs text-destructive">{errors.nombre.message}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo / Categoría</Label>
                    <Input
                      id="tipo"
                      className="bg-muted/20"
                      {...register('tipo')}
                    />
                    {errors.tipo && (
                      <span className="text-xs text-destructive">{errors.tipo.message}</span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="modelo">Modelo / Especificación</Label>
                    <Input
                      id="modelo"
                      className="bg-muted/20"
                      {...register('modelo')}
                    />
                    {errors.modelo && (
                      <span className="text-xs text-destructive">{errors.modelo.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stockActual">Stock Actual <span className="text-destructive">*</span></Label>
                    <Input
                      id="stockActual"
                      type="number"
                      className="bg-muted/20"
                      {...register('stockActual', { valueAsNumber: true })}
                    />
                    {errors.stockActual && (
                      <span className="text-xs text-destructive">{errors.stockActual.message}</span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="stockMinimo">Stock Mínimo (Alerta) <span className="text-destructive">*</span></Label>
                    <Input
                      id="stockMinimo"
                      type="number"
                      className="bg-muted/20"
                      {...register('stockMinimo', { valueAsNumber: true })}
                    />
                    {errors.stockMinimo && (
                      <span className="text-xs text-destructive">{errors.stockMinimo.message}</span>
                    )}
                  </div>
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
                  Eliminar Insumo
                </Button>
                <div className="flex gap-2">
                  <Link href="/dashboard/insumos">
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

        {/* Columna Kardex/Bitácora de Movimientos */}
        <div className="lg:col-span-1">
          <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden h-full flex flex-col">
            <CardHeader className="border-b border-muted/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Kardex de Insumo</CardTitle>
                  <CardDescription>
                    Bitácora de entradas, salidas y ajustes.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex-1 overflow-y-auto max-h-[550px]">
              {movimientos.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 h-full min-h-[150px] gap-2">
                  <Clock className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">Sin movimientos registrados</p>
                </div>
              ) : (
                <div className="relative pl-4 border-l border-muted space-y-6">
                  {movimientos.map((item) => {
                    const isEntrada = item.tipo === 'ENTRADA';
                    const Icon = isEntrada ? ArrowUpRight : ArrowDownRight;
                    const iconColor = isEntrada 
                      ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                      : "bg-red-500/10 text-red-600 dark:text-red-400";
                    const label = isEntrada ? `Entrada: +${item.cantidad}` : `Salida: ${item.cantidad}`;

                    return (
                      <div key={item.id} className="relative">
                        {/* Dot / Icon */}
                        <div className={`absolute -left-[30px] top-0.5 p-1 rounded-full border border-background ${iconColor}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-bold text-xs ${isEntrada ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
                            {item.motivo || 'Sin motivo especificado'}
                          </p>
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
