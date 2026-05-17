import type { NextAuthConfig } from 'next-auth';

// Configuración compatible con el Edge Runtime (Middleware)
export const authConfig = {
  pages: {
    signIn: '/login', // Redirige aquí cuando no hay sesión
  },
  callbacks: {
    authorized({ auth, request }) {
      const nextUrl = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnSelectOrg = nextUrl.pathname.startsWith('/select-org');
      
      if (isOnDashboard) {
        if (isLoggedIn) {
          // Si está logueado pero no ha seleccionado organización, forzar a seleccionar
          const activeOrgId = request.cookies.get('activeOrgId')?.value;
          if (!activeOrgId) {
            return Response.redirect(new URL('/select-org', nextUrl));
          }
          return true;
        }
        return false; // Redirige al login si no está autenticado
      } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/')) {
        // Si está logueado y va al login/raíz, revisar si tiene org o enviarlo al select-org/dashboard
        const activeOrgId = request.cookies.get('activeOrgId')?.value;
        if (!activeOrgId && !isOnSelectOrg) {
          return Response.redirect(new URL('/select-org', nextUrl));
        } else if (activeOrgId && !isOnSelectOrg) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      
      // Si intenta acceder a select-org sin estar logueado
      if (isOnSelectOrg && !isLoggedIn) {
         return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;
