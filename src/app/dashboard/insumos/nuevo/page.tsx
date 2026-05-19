'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, AlertCircle, Package } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { insumoSchema } from '@/lib/validations';
import { createInsumo } from '@/actions/insumos';
import { z } from 'zod';

type FormValues = z.infer<typeof insumoSchema>;

export default function NuevoInsumoPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(insumoSchema),
    defaultValues: {
      nombre: '',
      tipo: '',
      modelo: '',
      stockActual: 0,
      stockMinimo: 2,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    const result = await createInsumo(data);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/dashboard/insumos');
      router.refresh();
    } else {
      setError(result.error || 'Ocurrió un error al registrar el insumo.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/insumos">
          <Button variant="ghost" size="icon-sm" className="hover:bg-muted">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Volver</span>
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Volver a insumos</span>
      </div>

      <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="border-b border-muted/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Nuevo Insumo</CardTitle>
              <CardDescription>
                Registra un nuevo insumo, consumible o repuesto de TI.
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
                placeholder="Ej: Tóner HP LaserJet CF258A, Cable de Red Cat6"
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
                  placeholder="Ej: Tóner, Cable, Conectores, Disco Duro"
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
                  placeholder="Ej: CF258A, 1.5 metros, 1TB SATA"
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
                <Label htmlFor="stockActual">Stock Inicial <span className="text-destructive">*</span></Label>
                <Input
                  id="stockActual"
                  type="number"
                  placeholder="Ej: 10"
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
                  placeholder="Ej: 2"
                  className="bg-muted/20"
                  {...register('stockMinimo', { valueAsNumber: true })}
                />
                {errors.stockMinimo && (
                  <span className="text-xs text-destructive">{errors.stockMinimo.message}</span>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-muted/50 p-6 flex justify-end gap-2 bg-muted/10">
            <Link href="/dashboard/insumos">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="gap-2" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Guardando...' : 'Guardar Insumo'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
