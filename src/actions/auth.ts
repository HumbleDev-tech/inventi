'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
  // En un caso real, aquí deberíamos verificar que el usuario
  // en sesión (auth()) realmente pertenece a esta organización.
  
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
