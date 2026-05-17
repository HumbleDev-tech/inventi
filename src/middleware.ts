import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// El middleware usa solo la parte compatible con Edge para proteger rutas
export default NextAuth(authConfig).auth;

export const config = {
  // Proteger todas las rutas excepto archivos estáticos, imágenes y api
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
