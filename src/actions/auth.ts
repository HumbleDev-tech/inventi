'use server';

import { auth, signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function login(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales inválidas.';
        default:
          return 'Error interno. Por favor intenta más tarde.';
      }
    }
    throw error;
  }
}

export async function selectOrganization(orgId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Verificar pertenencia en la base de datos
  const membership = await prisma.usuarioOrganizacion.findUnique({
    where: {
      usuarioId_organizacionId: {
        usuarioId: session.user.id,
        organizacionId: orgId,
      },
    },
  });

  if (!membership) {
    throw new Error('No autorizado a acceder a esta organización');
  }
  
  cookies().set('activeOrgId', orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  
  redirect('/dashboard');
}

export async function logout() {
  cookies().delete('activeOrgId');
  await signOut({ redirectTo: '/login' });
}
