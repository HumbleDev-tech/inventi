'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

export async function getDashboardData() {
  try {
    const { orgId } = await getValidatedSession();

    // 1. Contadores generales
    const countFuncionarios = await prisma.funcionario.count({
      where: { organizacionId: orgId },
    });

    const countEquipos = await prisma.equipo.count({
      where: { organizacionId: orgId },
    });

    const countInsumos = await prisma.insumo.count({
      where: { organizacionId: orgId },
    });

    // 2. Equipos por estado
    const equiposPorEstadoRaw = await prisma.equipo.groupBy({
      by: ['estado'],
      where: { organizacionId: orgId },
      _count: {
        id: true,
      },
    });

    const equiposPorEstado = {
      ACTIVO: 0,
      BODEGA: 0,
      BAJA: 0,
    };

    equiposPorEstadoRaw.forEach((item) => {
      const est = item.estado as keyof typeof equiposPorEstado;
      if (equiposPorEstado[est] !== undefined) {
        equiposPorEstado[est] = item._count.id;
      }
    });

    // 3. Equipos por tipo
    const equiposPorTipoRaw = await prisma.equipo.groupBy({
      by: ['tipo'],
      where: { organizacionId: orgId },
      _count: {
        id: true,
      },
    });

    const equiposPorTipo = equiposPorTipoRaw.map((item) => ({
      name: item.tipo,
      value: item._count.id,
    }));

    // 4. Insumos críticos (stockActual <= stockMinimo)
    const insumosCriticos = await prisma.insumo.findMany({
      where: {
        organizacionId: orgId,
        stockActual: {
          lte: prisma.insumo.fields.stockMinimo,
        },
      },
      orderBy: { stockActual: 'asc' },
      take: 5,
    });

    // 5. Historial/Lista de insumos para gráfico de comparación
    const todosInsumos = await prisma.insumo.findMany({
      where: { organizacionId: orgId },
      orderBy: { nombre: 'asc' },
      take: 8,
    });

    const insumosChartData = todosInsumos.map((i) => ({
      nombre: i.nombre.length > 15 ? i.nombre.substring(0, 15) + '...' : i.nombre,
      stockActual: i.stockActual,
      stockMinimo: i.stockMinimo,
    }));

    return {
      success: true,
      data: {
        counts: {
          funcionarios: countFuncionarios,
          equipos: countEquipos,
          insumos: countInsumos,
        },
        equiposPorEstado,
        equiposPorTipo,
        insumosCriticos: insumosCriticos.map((i) => ({
          id: i.id,
          nombre: i.nombre,
          stockActual: i.stockActual,
          stockMinimo: i.stockMinimo,
          tipo: i.tipo,
        })),
        insumosChartData,
      },
    };
  } catch (error) {
    console.error('Error en getDashboardData:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al cargar dashboard',
    };
  }
}
