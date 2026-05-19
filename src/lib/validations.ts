import { z } from 'zod';

export const funcionarioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  rut: z.string().optional().or(z.literal('')),
  cargo: z.string().optional().or(z.literal('')),
  departamento: z.string().optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  email: z.string().optional().or(z.literal('')).refine(
    (val) => !val || z.string().email().safeParse(val).success, 
    { message: 'El correo electrónico debe ser válido' }
  ),
});

export const equipoSchema = z.object({
  tipo: z.string().min(1, 'El tipo es requerido'),
  marca: z.string().optional().or(z.literal('')),
  modelo: z.string().optional().or(z.literal('')),
  serial: z.string().optional().or(z.literal('')),
  ip: z.string().optional().or(z.literal('')),
  mac: z.string().optional().or(z.literal('')),
  ram: z.string().optional().or(z.literal('')),
  estado: z.enum(['ACTIVO', 'BODEGA', 'BAJA']),
  notas: z.string().optional().or(z.literal('')),
  funcionarioId: z.string().nullable().optional().or(z.literal('')),
});

export const insumoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  tipo: z.string().optional().or(z.literal('')),
  modelo: z.string().optional().or(z.literal('')),
  stockActual: z.number().int().min(0, 'El stock no puede ser negativo'),
  stockMinimo: z.number().int().min(0, 'El stock mínimo no puede ser negativo'),
});
