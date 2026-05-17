# Project Brief: InvenTI
> Documento maestro del proyecto y reglas de desarrollo.

## 1. Descripción General
**InvenTI** es una aplicación web de gestión de activos TI e inventario para establecimientos de salud (ej: Hospital Comunitario de Achao) y empresas. Tiene un enfoque premium, limpio y es altamente práctico.
- **Single-tenant por organización.**
- **Multi-usuario.**

## 2. Stack Tecnológico
- **Framework:** Next.js 14+ (App Router)
- **UI:** Tailwind CSS + Shadcn UI
- **Backend:** Server Actions de Next.js
- **Base de datos:** Prisma ORM con SQLite (Desarrollo) / PostgreSQL Neon (Producción)
- **Autenticación:** Auth.js v5 (Credentials: email/pass + bcrypt)
- **Herramientas extra:** Zod + React Hook Form, TanStack Table, Recharts.

## 3. Reglas Estrictas de Desarrollo
1. **Paso a paso:** Avanzar una fase a la vez. No saltar fases.
2. **Simplicidad:** Elegir siempre la forma más fácil de leer. Sin sobre-ingeniería.
3. **UI/UX Premium:** Interfaz profesional estilo SaaS.
4. **Explicación breve:** Explicar en 2 líneas qué hace el código antes de mostrarlo.
5. **Comando Dev:** Usar `next dev --webpack` localmente.

## 4. Fases de Desarrollo
- [x] **Fase 1:** Setup del proyecto (Next.js, dependencias básicas).
- [ ] **Fase 2:** Schema de Base de Datos y seed.
- [ ] **Fase 3:** Autenticación (Login + Selector de Organización).
- [ ] **Fase 4:** Layout del Dashboard (Sidebar + Navegación).
- [ ] **Fase 5:** Módulo Funcionarios (CRUD).
- [ ] **Fase 6:** Módulo Equipos (CRUD + asignación).
- [ ] **Fase 7:** Módulo Insumos (CRUD + Alertas).
- [ ] **Fase 8:** Dashboard principal (Métricas + Gráficos).
- [ ] **Fase 9:** Deploy en Vercel + Neon (PostgreSQL).
