'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { funcionarioSchema } from '@/lib/validations';
import { z } from 'zod';

type FuncionarioInput = z.infer<typeof funcionarioSchema>;

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

export async function getFuncionarios() {
  try {
    const { orgId } = await getValidatedSession();
    return await prisma.funcionario.findMany({
      where: { organizacionId: orgId },
      orderBy: { nombre: 'asc' },
    });
  } catch (error) {
    console.error('Error en getFuncionarios:', error);
    return [];
  }
}

export async function getFuncionarioById(id: string) {
  try {
    const { orgId } = await getValidatedSession();
    return await prisma.funcionario.findFirst({
      where: { id, organizacionId: orgId },
      include: {
        equipos: true,
      },
    });
  } catch (error) {
    console.error('Error en getFuncionarioById:', error);
    return null;
  }
}

export async function createFuncionario(data: FuncionarioInput) {
  try {
    const { orgId } = await getValidatedSession();
    
    // Validar Zod
    const validatedData = funcionarioSchema.parse(data);

    const newFuncionario = await prisma.funcionario.create({
      data: {
        nombre: validatedData.nombre,
        rut: validatedData.rut || null,
        cargo: validatedData.cargo || null,
        departamento: validatedData.departamento || null,
        telefono: validatedData.telefono || null,
        email: validatedData.email || null,
        organizacionId: orgId,
      },
    });

    revalidatePath('/dashboard/funcionarios');
    return { success: true, funcionario: newFuncionario };
  } catch (error: unknown) {
    console.error('Error en createFuncionario:', error);
    const message = error instanceof Error ? error.message : 'Error al crear funcionario';
    return { success: false, error: message };
  }
}

export async function updateFuncionario(id: string, data: FuncionarioInput) {
  try {
    const { orgId } = await getValidatedSession();
    
    // Validar pertenencia del funcionario a la org
    const existing = await prisma.funcionario.findFirst({
      where: { id, organizacionId: orgId },
    });
    if (!existing) {
      return { success: false, error: 'Funcionario no encontrado' };
    }

    // Validar Zod
    const validatedData = funcionarioSchema.parse(data);

    const updatedFuncionario = await prisma.funcionario.update({
      where: { id },
      data: {
        nombre: validatedData.nombre,
        rut: validatedData.rut || null,
        cargo: validatedData.cargo || null,
        departamento: validatedData.departamento || null,
        telefono: validatedData.telefono || null,
        email: validatedData.email || null,
      },
    });

    revalidatePath('/dashboard/funcionarios');
    revalidatePath(`/dashboard/funcionarios/${id}`);
    return { success: true, funcionario: updatedFuncionario };
  } catch (error: unknown) {
    console.error('Error en updateFuncionario:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar funcionario';
    return { success: false, error: message };
  }
}

export async function deleteFuncionario(id: string) {
  try {
    const { orgId } = await getValidatedSession();
    
    // Validar pertenencia del funcionario a la org
    const existing = await prisma.funcionario.findFirst({
      where: { id, organizacionId: orgId },
    });
    if (!existing) {
      return { success: false, error: 'Funcionario no encontrado o no pertenece a tu organización' };
    }

    // Desvincular equipos asociados
    await prisma.equipo.updateMany({
      where: { funcionarioId: id, organizacionId: orgId },
      data: { funcionarioId: null },
    });

    // Eliminar funcionario
    await prisma.funcionario.delete({
      where: { id },
    });

    revalidatePath('/dashboard/funcionarios');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error en deleteFuncionario:', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar funcionario';
    return { success: false, error: message };
  }
}
