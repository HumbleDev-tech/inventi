'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Helper para validar sesión y obtener orgId activa
async function getValidatedSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('No autenticado');
  }
  
  const orgId = cookies().get('activeOrgId')?.value;
  if (!orgId) {
    throw new Error('Organización no seleccionada');
  }

  const membership = await prisma.usuarioOrganizacion.findUnique({
    where: {
      usuarioId_organizacionId: {
        usuarioId: session.user.id,
        organizacionId: orgId,
      },
    },
  });

  if (!membership) {
    throw new Error('No autorizado');
  }

  return { userId: session.user.id, orgId, userRole: membership.rol };
}

// Helper para verificar rol ADMIN
async function requireAdminRole() {
  const session = await getValidatedSession();
  if (session.userRole !== 'ADMIN') {
    throw new Error('No autorizado: Se requiere rol de Administrador');
  }
  return session;
}

// Obtener info de la organización activa
export async function getOrganization() {
  try {
    const { orgId } = await getValidatedSession();
    return await prisma.organizacion.findUnique({
      where: { id: orgId },
    });
  } catch (error) {
    console.error('Error en getOrganization:', error);
    return null;
  }
}

// Actualizar info de la organización activa (solo ADMIN)
export async function updateOrganization(nombre: string, tipo?: string) {
  try {
    const { orgId } = await requireAdminRole();
    
    if (!nombre.trim()) {
      return { success: false, error: 'El nombre es obligatorio' };
    }

    const updated = await prisma.organizacion.update({
      where: { id: orgId },
      data: {
        nombre: nombre.trim(),
        tipo: tipo?.trim() || null,
      },
    });

    revalidatePath('/dashboard/settings');
    return { success: true, organization: updated };
  } catch (error: unknown) {
    console.error('Error en updateOrganization:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar organización';
    return { success: false, error: message };
  }
}

// Obtener miembros de la organización activa
export async function getOrganizationMembers() {
  try {
    const { orgId } = await getValidatedSession();
    const memberships = await prisma.usuarioOrganizacion.findMany({
      where: { organizacionId: orgId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: { usuario: { nombre: 'asc' } },
    });

    return memberships.map((m) => ({
      usuarioId: m.usuarioId,
      nombre: m.usuario.nombre,
      email: m.usuario.email,
      rol: m.rol as 'ADMIN' | 'TECNICO' | 'USUARIO',
    }));
  } catch (error) {
    console.error('Error en getOrganizationMembers:', error);
    return [];
  }
}

// Actualizar rol de un miembro (solo ADMIN)
export async function updateMemberRole(usuarioId: string, rol: 'ADMIN' | 'TECNICO' | 'USUARIO') {
  try {
    const { userId, orgId } = await requireAdminRole();

    if (userId === usuarioId) {
      return { success: false, error: 'No puedes cambiar tu propio rol' };
    }
    await prisma.usuarioOrganizacion.update({
      where: {
        usuarioId_organizacionId: {
          usuarioId,
          organizacionId: orgId,
        },
      },
      data: {
        rol,
      },
    });

    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error en updateMemberRole:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar rol';
    return { success: false, error: message };
  }
}

// Añadir / Invitar a un miembro a la organización (solo ADMIN)
export async function addMemberByEmail(email: string, rol: 'ADMIN' | 'TECNICO' | 'USUARIO' = 'USUARIO') {
  try {
    const { orgId } = await requireAdminRole();

    const targetUser = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!targetUser) {
      return { 
        success: false, 
        error: 'El usuario con ese correo no está registrado en la plataforma. Primero debe crear su cuenta.' 
      };
    }

    // Verificar si ya pertenece a la organización
    const existing = await prisma.usuarioOrganizacion.findUnique({
      where: {
        usuarioId_organizacionId: {
          usuarioId: targetUser.id,
          organizacionId: orgId,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'El usuario ya pertenece a esta organización' };
    }

    // Crear membresía
    await prisma.usuarioOrganizacion.create({
      data: {
        usuarioId: targetUser.id,
        organizacionId: orgId,
        rol,
      },
    });

    revalidatePath('/dashboard/settings');
    return { success: true, nombre: targetUser.nombre };
  } catch (error: unknown) {
    console.error('Error en addMemberByEmail:', error);
    const message = error instanceof Error ? error.message : 'Error al añadir miembro';
    return { success: false, error: message };
  }
}

// Remover miembro de la organización (solo ADMIN)
export async function removeMember(usuarioId: string) {
  try {
    const { userId, orgId } = await requireAdminRole();

    if (userId === usuarioId) {
      return { success: false, error: 'No puedes eliminarte a ti mismo de la organización' };
    }

    await prisma.usuarioOrganizacion.delete({
      where: {
        usuarioId_organizacionId: {
          usuarioId,
          organizacionId: orgId,
        },
      },
    });

    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error en removeMember:', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar miembro';
    return { success: false, error: message };
  }
}
