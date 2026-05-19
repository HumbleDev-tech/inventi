'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, UserPlus, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { funcionarioSchema } from '@/lib/validations';
import { createFuncionario } from '@/actions/funcionarios';
import { z } from 'zod';

type FormValues = z.infer<typeof funcionarioSchema>;

export default function NuevoFuncionarioPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: {
      nombre: '',
      rut: '',
      cargo: '',
      departamento: '',
      telefono: '',
      email: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    const result = await createFuncionario(data);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/dashboard/funcionarios');
      router.refresh();
    } else {
      setError(result.error || 'Ocurrió un error inesperado.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/funcionarios">
          <Button variant="ghost" size="icon-sm" className="hover:bg-muted">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Volver</span>
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Volver a funcionarios</span>
      </div>

      <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="border-b border-muted/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Nuevo Funcionario</CardTitle>
              <CardDescription>
                Ingresa los datos personales del funcionario para agregarlo al directorio.
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
                  placeholder="Ej: Médico General, Administrativo"
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
                  placeholder="Ej: Urgencias, Pabellón, SOME"
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
                type="text"
                placeholder="Ej: juan.perez@hospitalachao.cl"
                className="bg-muted/20"
                {...register('email')}
              />
              {errors.email && (
                <span className="text-xs text-destructive">{errors.email.message}</span>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t border-muted/50 p-6 flex justify-end gap-2 bg-muted/10">
            <Link href="/dashboard/funcionarios">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="gap-2" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Guardando...' : 'Guardar Funcionario'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
