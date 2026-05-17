import type { NextAuthConfig } from 'next-auth';

// Configuración compatible con el Edge Runtime (Middleware)
export const authConfig = {
  pages: {
    signIn: '/login', // Redirige aquí cuando no hay sesión
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirige al login si no está autenticado
      } else if (isLoggedIn && nextUrl.pathname === '/login') {
        // Si está logueado y trata de ir al login, envíalo al dashboard
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;
