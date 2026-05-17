import { prisma } from './src/lib/prisma';
prisma.usuario.findFirst().then(console.log).catch(console.error);
