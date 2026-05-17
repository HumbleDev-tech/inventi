# Project Brief: NetAsset Lite
> Documento de contexto completo para desarrollo asistido por IA

---

## 1. Descripción General

**NetAsset Lite** es una aplicación web de gestión de activos TI e inventario para establecimientos como hospitales, clínicas o empresas pequeñas. Es un proyecto de portafolio profesional que debe verse moderno, limpio y premium, con código simple y directo.

- **Single-tenant por organización:** Toda la información está asociada a una "Organización" (ej: Hospital Comunitario de Achao).
- **Multi-usuario:** Varios usuarios pueden gestionar el sistema, cada uno asociado a una o más organizaciones.
- **Uso real:** El desarrollador lo usará activamente en su trabajo, por lo que la funcionalidad debe ser práctica.

---

## 2. Stack Tecnológico (no negociable)

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14+ con App Router |
| UI | Tailwind CSS + Shadcn/UI |
| Backend | Server Actions de Next.js (no API routes separadas) |
| ORM | Prisma |
| Base de datos (dev) | SQLite |
| Base de datos (prod) | PostgreSQL en Neon (gratuito) |
| Autenticación | Auth.js v5 (credentials: email + contraseña con bcrypt) |
| Validación | Zod + React Hook Form |
| Tablas | TanStack Table |
| Gráficos | Recharts |
| Deploy | Vercel (gratuito) |

**Nota de entorno dev:** Usar siempre `next dev --webpack` (no Turbopack) para evitar problemas de RAM con Prisma.

---

## 3. Reglas de Desarrollo (seguir estrictamente)

1. **Paso a paso:** Nunca generar todo el código de golpe. Fase por fase, esperando aprobación.
2. **Simplicidad ante todo:** Si hay dos formas de hacer algo, elegir siempre la más fácil de leer.
3. **Explicación antes del código:** Explicar en 2 líneas qué hace y por qué se necesita, antes de cada bloque de código.
4. **UI primero:** El proyecto es para CV. La interfaz debe verse profesional, limpia y premium. Usar Shadcn/UI para todos los componentes.
5. **Sin sobre-ingeniería:** Sin Redux, sin tRPC, sin Docker, sin arquitecturas complejas.

---

## 4. Modelo de Datos (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // cambiar a "sqlite" para desarrollo local
  url      = env("DATABASE_URL")
}

model Organizacion {
  id           String   @id @default(cuid())
  nombre       String
  tipo         String?  // "Hospital", "Empresa", "Clínica", etc.
  createdAt    DateTime @default(now())

  usuarios     UsuarioOrganizacion[]
  funcionarios Funcionario[]
  equipos      Equipo[]
  insumos      Insumo[]
}

model Usuario {
  id        String   @id @default(cuid())
  nombre    String
  email     String   @unique
  password  String   // hasheado con bcrypt
  createdAt DateTime @default(now())

  organizaciones UsuarioOrganizacion[]
}

// Tabla puente: un usuario puede pertenecer a múltiples organizaciones
model UsuarioOrganizacion {
  usuarioId      String
  organizacionId String
  rol            String @default("ADMIN") // por ahora solo ADMIN

  usuario      Usuario      @relation(fields: [usuarioId], references: [id])
  organizacion Organizacion @relation(fields: [organizacionId], references: [id])

  @@id([usuarioId, organizacionId])
}

model Funcionario {
  id             String   @id @default(cuid())
  nombre         String
  rut            String?
  cargo          String?
  departamento   String?
  telefono       String?
  email          String?
  createdAt      DateTime @default(now())

  organizacionId String
  organizacion   Organizacion @relation(fields: [organizacionId], references: [id])
  equipos        Equipo[]
}

model Equipo {
  id             String   @id @default(cuid())
  tipo           String   // "PC", "Notebook", "Impresora"
  marca          String?
  modelo         String?
  serial         String?
  ip             String?
  mac            String?
  ram            String?
  estado         String   @default("ACTIVO") // "ACTIVO", "BODEGA", "BAJA"
  notas          String?
  createdAt      DateTime @default(now())

  organizacionId String
  organizacion   Organizacion @relation(fields: [organizacionId], references: [id])

  funcionarioId  String?
  funcionario    Funcionario? @relation(fields: [funcionarioId], references: [id])
}

model Insumo {
  id             String   @id @default(cuid())
  nombre         String   // Ej: "Tóner HP 85A"
  tipo           String?  // "Tóner", "Tinta"
  modelo         String?  // Compatible con qué impresora
  stockActual    Int      @default(0)
  stockMinimo    Int      @default(2) // Alerta si baja de este número
  createdAt      DateTime @default(now())

  organizacionId String
  organizacion   Organizacion @relation(fields: [organizacionId], references: [id])
}
```

---

## 5. Módulos de la Aplicación

### 5.1 Autenticación
- Login con email + contraseña (Auth.js v5 Credentials)
- Al iniciar sesión, si el usuario tiene múltiples organizaciones, se le muestra un selector
- La organización activa se guarda en sesión y filtra todos los datos
- No hay registro público; el admin crea usuarios manualmente

### 5.2 Dashboard
- Pantalla de inicio después del login
- Muestra métricas clave de la organización activa:
  - Total de equipos por estado (activo, bodega, baja)
  - Insumos con stock bajo (alerta visual)
  - Total de funcionarios registrados
- Gráfico de equipos por tipo (Recharts)

### 5.3 Funcionarios
- CRUD completo de personal de la organización
- Campos: nombre, RUT, cargo, departamento, teléfono, email
- Vista de detalle: muestra los equipos asignados al funcionario
- Tabla con búsqueda y filtros (TanStack Table)

### 5.4 Equipos
- CRUD completo de activos TI
- Campos: tipo, marca, modelo, serial, IP, MAC, RAM, estado, notas
- Asignación a un funcionario (opcional)
- Estado: ACTIVO, BODEGA, BAJA
- Tabla con filtro por tipo y estado

### 5.5 Insumos
- CRUD de tóneres, tintas y consumibles
- Campos: nombre, tipo, modelo compatible, stock actual, stock mínimo
- Alerta visual cuando stockActual <= stockMinimo
- Ajuste manual de stock (entrada/salida con cantidad)

---

## 6. Flujo de Usuario

```
Login
  └─> Selector de Organización (si tiene más de una)
        └─> Dashboard
              ├─> Funcionarios (lista, crear, editar, ver detalle)
              ├─> Equipos (lista, crear, editar, asignar a funcionario)
              └─> Insumos (lista, crear, editar, ajustar stock)
```

---

## 7. Diseño UI/UX

- **Estética:** Limpia, profesional, moderna. Inspiración: dashboards SaaS como Linear, Vercel, o Shadcn's own examples.
- **Tema:** Oscuro o claro, con soporte para ambos (Shadcn maneja esto nativamente).
- **Sidebar:** Navegación lateral fija con íconos (Lucide React).
- **Componentes Shadcn a usar:** Card, Table, Dialog, Form, Input, Select, Badge, Alert, Button, Skeleton (para loading states).
- **Responsive:** Mobile-friendly pero optimizado para desktop (es una herramienta de gestión interna).

---

## 8. Estructura de Carpetas (Next.js App Router)

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← Sidebar + Header
│   │   ├── page.tsx            ← Dashboard
│   │   ├── funcionarios/
│   │   │   ├── page.tsx        ← Lista
│   │   │   ├── [id]/page.tsx   ← Detalle/Editar
│   │   │   └── nuevo/page.tsx  ← Crear
│   │   ├── equipos/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── nuevo/page.tsx
│   │   └── insumos/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   └── api/auth/[...nextauth]/route.ts
├── components/
│   ├── ui/                     ← Componentes Shadcn (auto-generados)
│   └── app/                    ← Componentes propios
├── lib/
│   ├── prisma.ts               ← Cliente Prisma singleton
│   ├── auth.ts                 ← Configuración Auth.js
│   └── validations.ts          ← Esquemas Zod
├── actions/                    ← Server Actions
│   ├── funcionarios.ts
│   ├── equipos.ts
│   └── insumos.ts
└── prisma/
    └── schema.prisma
```

---

## 9. Fases de Desarrollo (orden sugerido)

| Fase | Contenido |
|---|---|
| 1 | Setup del proyecto: Next.js + Prisma + Shadcn + Auth.js |
| 2 | Schema de BD + seed con datos de prueba |
| 3 | Autenticación: login + selector de organización |
| 4 | Layout del dashboard (sidebar, header, navegación) |
| 5 | Módulo Funcionarios (CRUD completo) |
| 6 | Módulo Equipos (CRUD + asignación) |
| 7 | Módulo Insumos (CRUD + ajuste de stock + alertas) |
| 8 | Dashboard con métricas y gráfico (Recharts) |
| 9 | Deploy en Vercel + Neon (PostgreSQL) |

---

## 10. Contexto del Desarrollador

- El desarrollador trabaja en un hospital en Chile (Hospital Comunitario de Achao).
- El proyecto nació de una necesidad real: llevar inventario de equipos TI, tóneres, y un directorio de funcionarios.
- Es un proyecto de portafolio, por lo que el código debe ser limpio, legible y la UI debe lucir premium.
- Prefiere respuestas cortas, directas y sin sobre-explicaciones.
- Se trabaja paso a paso, módulo por módulo, sin adelantar fases.
