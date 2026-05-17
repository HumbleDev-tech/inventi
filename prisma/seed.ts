import { prisma } from '../src/lib/prisma';
import * as bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Crear Organización de prueba
  const org = await prisma.organizacion.create({
    data: {
      nombre: 'Hospital Comunitario de Achao',
      tipo: 'Hospital',
    },
  });
  console.log(`✅ Organización creada: ${org.nombre}`);

  // 2. Crear Usuario Administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.usuario.create({
    data: {
      nombre: 'Administrador TI',
      email: 'admin@hospitalachao.cl',
      password: hashedPassword,
      organizaciones: {
        create: {
          organizacionId: org.id,
          rol: 'ADMIN',
        },
      },
    },
  });
  console.log(`✅ Usuario Administrador creado: ${adminUser.email}`);

  // 3. Crear Funcionarios
  const funcionariosData = [
    { nombre: 'Dr. Juan Pérez', cargo: 'Médico General', departamento: 'Urgencias' },
    { nombre: 'Enf. María González', cargo: 'Enfermera Jefe', departamento: 'Pabellón' },
    { nombre: 'Pedro Silva', cargo: 'Administrativo', departamento: 'SOME' },
  ];

  const funcionarios = [];
  for (const f of funcionariosData) {
    const funcionario = await prisma.funcionario.create({
      data: {
        ...f,
        organizacionId: org.id,
      },
    });
    funcionarios.push(funcionario);
  }
  console.log(`✅ ${funcionarios.length} Funcionarios creados.`);

  // 4. Crear Equipos
  const equiposData = [
    { tipo: 'PC', marca: 'HP', modelo: 'ProDesk 400', estado: 'ACTIVO', funcionarioId: funcionarios[0].id },
    { tipo: 'Notebook', marca: 'Lenovo', modelo: 'ThinkPad T14', estado: 'ACTIVO', funcionarioId: funcionarios[1].id },
    { tipo: 'Impresora', marca: 'Brother', modelo: 'HL-L2320D', estado: 'BODEGA' },
    { tipo: 'Monitor', marca: 'Dell', modelo: 'P2419H', estado: 'ACTIVO', funcionarioId: funcionarios[2].id },
    { tipo: 'PC', marca: 'Lenovo', modelo: 'M720q', estado: 'BAJA', notas: 'Placa madre quemada' },
  ];

  for (const e of equiposData) {
    await prisma.equipo.create({
      data: {
        ...e,
        organizacionId: org.id,
      },
    });
  }
  console.log(`✅ ${equiposData.length} Equipos creados.`);

  // 5. Crear Insumos
  const insumosData = [
    { nombre: 'Tóner Brother TN-1060', tipo: 'Tóner', modelo: 'HL-1202', stockActual: 5, stockMinimo: 2 },
    { nombre: 'Tinta Epson T664 Negra', tipo: 'Tinta', modelo: 'L380', stockActual: 1, stockMinimo: 3 },
    { nombre: 'Resma Papel Carta', tipo: 'Papelería', modelo: 'N/A', stockActual: 50, stockMinimo: 10 },
  ];

  for (const i of insumosData) {
    await prisma.insumo.create({
      data: {
        ...i,
        organizacionId: org.id,
      },
    });
  }
  console.log(`✅ ${insumosData.length} Insumos creados.`);

  console.log('✅ Seed completado con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
