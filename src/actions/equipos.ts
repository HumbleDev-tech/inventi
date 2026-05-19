'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { equipoSchema } from '@/lib/validations';
import { z } from 'zod';

type EquipoInput = z.infer<typeof equipoSchema>;

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

  // Verificar membresía
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

  return { userId: session.user.id, orgId };
}

export async function getEquipos() {
  try {
    const { orgId } = await getValidatedSession();
    return await prisma.equipo.findMany({
      where: { organizacionId: orgId },
      include: {
        funcionario: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { tipo: 'asc' },
    });
  } catch (error) {
    console.error('Error en getEquipos:', error);
    return [];
  }
}

export async function getEquipoById(id: string) {
  try {
    const { orgId } = await getValidatedSession();
    return await prisma.equipo.findFirst({
      where: { id, organizacionId: orgId },
      include: {
        funcionario: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error en getEquipoById:', error);
    return null;
  }
}

export async function createEquipo(data: EquipoInput) {
  try {
    const { orgId } = await getValidatedSession();
    
    // Validar Zod
    const validatedData = equipoSchema.parse(data);

    // Mapear funcionarioId vacío a null
    const funcionarioId = validatedData.funcionarioId?.trim() || null;

    // Si hay un funcionarioId, validar que pertenezca a la misma org
    if (funcionarioId) {
      const func = await prisma.funcionario.findFirst({
        where: { id: funcionarioId, organizacionId: orgId },
      });
      if (!func) {
        return { success: false, error: 'Funcionario no válido o no pertenece a tu organización' };
      }
    }

    const newEquipo = await prisma.equipo.create({
      data: {
        tipo: validatedData.tipo,
        marca: validatedData.marca || null,
        modelo: validatedData.modelo || null,
        serial: validatedData.serial || null,
        ip: validatedData.ip || null,
        mac: validatedData.mac || null,
        ram: validatedData.ram || null,
        estado: validatedData.estado,
        notas: validatedData.notas || null,
        funcionarioId,
        organizacionId: orgId,
      },
    });

    revalidatePath('/dashboard/equipos');
    return { success: true, equipo: newEquipo };
  } catch (error: unknown) {
    console.error('Error en createEquipo:', error);
    const message = error instanceof Error ? error.message : 'Error al crear equipo';
    return { success: false, error: message };
  }
}

export async function updateEquipo(id: string, data: EquipoInput) {
  try {
    const { orgId } = await getValidatedSession();
    
    // Validar pertenencia del equipo a la org
    const existing = await prisma.equipo.findFirst({
      where: { id, organizacionId: orgId },
    });
    if (!existing) {
      return { success: false, error: 'Equipo no encontrado' };
    }

    // Validar Zod
    const validatedData = equipoSchema.parse(data);

    // Mapear funcionarioId vacío a null
    const funcionarioId = validatedData.funcionarioId?.trim() || null;

    // Si hay un funcionarioId, validar que pertenezca a la misma org
    if (funcionarioId) {
      const func = await prisma.funcionario.findFirst({
        where: { id: funcionarioId, organizacionId: orgId },
      });
      if (!func) {
        return { success: false, error: 'Funcionario no válido o no pertenece a tu organización' };
      }
    }

    const updatedEquipo = await prisma.equipo.update({
      where: { id },
      data: {
        tipo: validatedData.tipo,
        marca: validatedData.marca || null,
        modelo: validatedData.modelo || null,
        serial: validatedData.serial || null,
        ip: validatedData.ip || null,
        mac: validatedData.mac || null,
        ram: validatedData.ram || null,
        estado: validatedData.estado,
        notas: validatedData.notas || null,
        funcionarioId,
      },
    });

    revalidatePath('/dashboard/equipos');
    revalidatePath(`/dashboard/equipos/${id}`);
    if (funcionarioId) {
      revalidatePath(`/dashboard/funcionarios/${funcionarioId}`);
    }
    if (existing.funcionarioId) {
      revalidatePath(`/dashboard/funcionarios/${existing.funcionarioId}`);
    }

    return { success: true, equipo: updatedEquipo };
  } catch (error: unknown) {
    console.error('Error en updateEquipo:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar equipo';
    return { success: false, error: message };
  }
}

export async function deleteEquipo(id: string) {
  try {
    const { orgId } = await getValidatedSession();
    
    // Validar pertenencia del equipo a la org
    const existing = await prisma.equipo.findFirst({
      where: { id, organizacionId: orgId },
    });
    if (!existing) {
      return { success: false, error: 'Equipo no encontrado o no pertenece a tu organización' };
    }

    // Eliminar equipo
    await prisma.equipo.delete({
      where: { id },
    });

    revalidatePath('/dashboard/equipos');
    if (existing.funcionarioId) {
      revalidatePath(`/dashboard/funcionarios/${existing.funcionarioId}`);
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Error en deleteEquipo:', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar equipo';
    return { success: false, error: message };
  }
}
