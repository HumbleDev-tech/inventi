'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { insumoSchema } from '@/lib/validations';
import { z } from 'zod';

type InsumoInput = z.infer<typeof insumoSchema>;

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

export async function getInsumos() {
  try {
    const { orgId } = await getValidatedSession();
    return await prisma.insumo.findMany({
      where: { organizacionId: orgId },
      orderBy: { nombre: 'asc' },
    });
  } catch (error) {
    console.error('Error en getInsumos:', error);
    return [];
  }
}

export async function getInsumoById(id: string) {
  try {
    const { orgId } = await getValidatedSession();
    return await prisma.insumo.findFirst({
      where: { id, organizacionId: orgId },
    });
  } catch (error) {
    console.error('Error en getInsumoById:', error);
    return null;
  }
}

export async function createInsumo(data: InsumoInput) {
  try {
    const { userId, orgId } = await getValidatedSession();
    
    // Validar Zod
    const validatedData = insumoSchema.parse(data);

    const newInsumo = await prisma.insumo.create({
      data: {
        nombre: validatedData.nombre,
        tipo: validatedData.tipo || null,
        modelo: validatedData.modelo || null,
        stockActual: validatedData.stockActual,
        stockMinimo: validatedData.stockMinimo,
        organizacionId: orgId,
      },
    });

    // Registrar movimiento de stock inicial si es mayor que cero
    if (newInsumo.stockActual > 0) {
      await prisma.movimientoInsumo.create({
        data: {
          insumoId: newInsumo.id,
          usuarioId: userId,
          cantidad: newInsumo.stockActual,
          tipo: 'ENTRADA',
          motivo: 'Registro inicial de stock',
          organizacionId: orgId,
        },
      });
    }

    revalidatePath('/dashboard/insumos');
    return { success: true, insumo: newInsumo };
  } catch (error: unknown) {
    console.error('Error en createInsumo:', error);
    const message = error instanceof Error ? error.message : 'Error al crear insumo';
    return { success: false, error: message };
  }
}

export async function updateInsumo(id: string, data: InsumoInput) {
  try {
    const { userId, orgId } = await getValidatedSession();
    
    // Validar pertenencia del insumo a la org
    const existing = await prisma.insumo.findFirst({
      where: { id, organizacionId: orgId },
    });
    if (!existing) {
      return { success: false, error: 'Insumo no encontrado' };
    }

    // Validar Zod
    const validatedData = insumoSchema.parse(data);

    const updatedInsumo = await prisma.insumo.update({
      where: { id },
      data: {
        nombre: validatedData.nombre,
        tipo: validatedData.tipo || null,
        modelo: validatedData.modelo || null,
        stockActual: validatedData.stockActual,
        stockMinimo: validatedData.stockMinimo,
      },
    });

    // Registrar movimiento si el stock cambió manualmente
    const stockDiff = validatedData.stockActual - existing.stockActual;
    if (stockDiff !== 0) {
      await prisma.movimientoInsumo.create({
        data: {
          insumoId: id,
          usuarioId: userId,
          cantidad: stockDiff,
          tipo: stockDiff > 0 ? 'ENTRADA' : 'SALIDA',
          motivo: 'Actualización manual de stock',
          organizacionId: orgId,
        },
      });
    }

    revalidatePath('/dashboard/insumos');
    revalidatePath(`/dashboard/insumos/${id}`);
    return { success: true, insumo: updatedInsumo };
  } catch (error: unknown) {
    console.error('Error en updateInsumo:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar insumo';
    return { success: false, error: message };
  }
}

export async function deleteInsumo(id: string) {
  try {
    const { orgId } = await getValidatedSession();
    
    // Validar pertenencia del insumo a la org
    const existing = await prisma.insumo.findFirst({
      where: { id, organizacionId: orgId },
    });
    if (!existing) {
      return { success: false, error: 'Insumo no encontrado o no pertenece a tu organización' };
    }

    // Eliminar insumo
    await prisma.insumo.delete({
      where: { id },
    });

    revalidatePath('/dashboard/insumos');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error en deleteInsumo:', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar insumo';
    return { success: false, error: message };
  }
}

export async function adjustInsumoStock(id: string, amount: number, motivo?: string) {
  try {
    const { userId, orgId } = await getValidatedSession();
    
    // Validar pertenencia del insumo a la org
    const existing = await prisma.insumo.findFirst({
      where: { id, organizacionId: orgId },
    });
    if (!existing) {
      return { success: false, error: 'Insumo no encontrado o no pertenece a tu organización' };
    }

    const newStock = Math.max(0, existing.stockActual + amount);
    const realAmount = newStock - existing.stockActual;

    if (realAmount === 0) {
      return { success: true, insumo: existing };
    }

    const updated = await prisma.insumo.update({
      where: { id },
      data: {
        stockActual: newStock,
      },
    });

    // Registrar el movimiento en la bitácora
    await prisma.movimientoInsumo.create({
      data: {
        insumoId: id,
        usuarioId: userId,
        cantidad: realAmount,
        tipo: realAmount > 0 ? 'ENTRADA' : 'SALIDA',
        motivo: motivo || (realAmount > 0 ? 'Ajuste rápido: Entrada' : 'Ajuste rápido: Salida'),
        organizacionId: orgId,
      },
    });

    revalidatePath('/dashboard/insumos');
    revalidatePath('/dashboard'); // Para actualizar el widget del dashboard
    return { success: true, insumo: updated };
  } catch (error: unknown) {
    console.error('Error en adjustInsumoStock:', error);
    const message = error instanceof Error ? error.message : 'Error al ajustar stock';
    return { success: false, error: message };
  }
}

export async function getInsumoMovimientos(insumoId: string) {
  try {
    const { orgId } = await getValidatedSession();
    return await prisma.movimientoInsumo.findMany({
      where: { insumoId, organizacionId: orgId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error en getInsumoMovimientos:', error);
    return [];
  }
}
