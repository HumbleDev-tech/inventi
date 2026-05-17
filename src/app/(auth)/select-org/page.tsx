import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { selectOrganization } from '@/actions/auth';
import { Building2 } from 'lucide-react';

export default async function SelectOrgPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Obtener las organizaciones a las que pertenece el usuario
  const usuarioConOrgs = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    include: {
      organizaciones: {
        include: {
          organizacion: true,
        },
      },
    },
  });

  const organizaciones = usuarioConOrgs?.organizaciones.map(o => o.organizacion) || [];

  if (organizaciones.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sin Organizaciones</CardTitle>
            <CardDescription>
              Tu usuario no está asignado a ninguna organización. Contacta a tu administrador.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Si solo tiene una organización, seleccionarla automáticamente
  // Opcional: Podríamos hacer esto directamente en el middleware o aquí.
  // Por ahora mostraremos el selector siempre para probar la UI.

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Bienvenido</CardTitle>
          <CardDescription>
            Selecciona la organización con la que vas a trabajar hoy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {organizaciones.map((org) => (
              <form key={org.id} action={selectOrganization.bind(null, org.id)}>
                <Button 
                  type="submit" 
                  variant="outline" 
                  className="w-full h-auto py-4 flex items-center justify-start gap-4 hover:border-primary hover:bg-primary/5"
                >
                  <Building2 className="h-6 w-6 text-primary" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-lg">{org.nombre}</span>
                    <span className="text-sm text-muted-foreground">{org.tipo || 'Organización'}</span>
                  </div>
                </Button>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
