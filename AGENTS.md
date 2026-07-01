# Agent Rules — Kanban Next.js

<!-- BEGIN:nextjs-agent-rules -->

> ⚠️ **This is NOT the Next.js you know.** APIs, conventions, and file structure may differ from training data.
> Read `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

## User

- Name: **papi dannfront** — always refer to them by this name

---

## Project Assets

| Resource          | Location          |
| ----------------- | ----------------- |
| Design references | `diseño/`         |
| Icons & logos     | `src/assets/`     |
| Available skills  | `.agents/skills/` |

### Design Reference Structure

- `diseño/full-design/` — Full design system: Desktop / Mobile / Tablet, Light / Dark
- `diseño/board/` — Main board view screens
- `diseño/board-empty/` — Empty board state screens
- `diseño/componets/` — Component reference images

> **Before implementing any UI**, read the relevant images in `diseño/` to verify colors, layout, spacing, and component structure.

---

## Agent Behavior

### Before Starting Any Task

1. Check `.agents/skills/` for available skills
2. If the task matches a skill's trigger conditions → load that skill first
3. Skills are listed in the system prompt under `<available_skills>`

### Before Writing Any Code

- Read the Next.js docs in `node_modules/next/dist/docs/` for anything version-specific
- Verify icons and assets exist in `src/assets/` before referencing them
- Cross-reference UI work against the `diseño/` images

### When in Doubt About a Library or API

Use the **context7 MCP** before guessing or hallucinating API shapes:

1. Call `resolve-library-id` with the library name to get its context7 ID
2. Call `query-docs` with that ID to fetch up-to-date documentation

> This applies to any library — Next.js, React, Tailwind, Prisma, etc. If you're unsure about an API signature, a hook's behavior, or a config option: **look it up via context7 first, never guess.**

---

## Frontend Architecture

Esta es la arquitectura de carpetas que se sigue en este proyecto. **Respetarla es obligatorio.**

```
📦 kanban-nextjs
 ┣ 📂 src
 ┃ ┣ 📂 app                  # 1. Enrutamiento y Layouts (Next.js App Router)
 ┃ ┃ ┣ 📂 (dashboard)        # Grupo de rutas para el tablero
 ┃ ┃ ┃ ┣ 📜 layout.tsx       # Layout principal (Sidebar y TopMenu van aquí)
 ┃ ┃ ┃ ┗ 📜 page.tsx         # La vista principal del tablero
 ┃ ┃ ┣ 📜 globals.css        # Estilos globales de Tailwind
 ┃ ┃ ┗ 📜 layout.tsx         # Root layout (html, body, providers)
 ┃ ┃
 ┃ ┣ 📂 components           # 2. Componentes UI Globales (Agnósticos al negocio)
 ┃ ┃ ┣ 📂 ui                 # Botones, Inputs, Modales base, Dropdowns
 ┃ ┃ ┗ 📂 layout             # Componentes de estructura global
 ┃ ┃   ┣ 📜 Sidebar.tsx
 ┃ ┃   ┗ 📜 TopMenu.tsx
 ┃ ┃
 ┃ ┣ 📂 features             # 3. El corazón de la arquitectura (Por dominio)
 ┃ ┃ ┣ 📂 boards             # Todo lo relacionado a los Tableros y Columnas
 ┃ ┃ ┃ ┣ 📂 components       # BoardView, Column, AddColumnForm
 ┃ ┃ ┃ ┣ 📂 store            # useBoardStore.ts (Zustand)
 ┃ ┃ ┃ ┗ 📜 types.ts         # Interfaces de Board y Column
 ┃ ┃ ┃
 ┃ ┃ ┗ 📂 tasks              # Todo lo relacionado a las Tareas
 ┃ ┃   ┣ 📂 components       # TaskCard, TaskDetailModal, CreateTaskForm
 ┃ ┃   ┣ 📂 store            # useTaskStore.ts (Zustand para DnD y data)
 ┃ ┃   ┗ 📜 types.ts         # Interfaces de Task y Subtask
 ┃ ┃
 ┃ ┣ 📂 hooks                # 4. Custom hooks globales
 ┃ ┃ ┣ 📜 useClickOutside.ts
 ┃ ┃ ┗ 📜 useLocalStorage.ts # Útil para persistir la data inicial
 ┃ ┃
 ┃ ┣ 📂 lib                  # 5. Configuraciones y utilidades de terceros
 ┃ ┃ ┣ 📜 dnd.ts             # Configuración de tu librería de Drag and Drop
 ┃ ┃ ┗ 📜 utils.ts           # Funciones puras (clsx, twMerge para Tailwind)
 ┃ ┃
 ┃ ┣ 📂 store                # 6. Estados globales de UI
 ┃ ┃ ┣ 📜 useUIStore.ts      # Zustand: isSidebarOpen, toggleSidebar
 ┃ ┃ ┗ 📜 useModalStore.ts   # Zustand: Gestor centralizado de modales
 ┃ ┃
 ┃ ┗ 📂 types                # 7. Tipos TypeScript globales genéricos
 ┃
 ┣ 📜 data.json              # Mock de datos iniciales
 ┣ 📜 tailwind.config.ts
 ┗ 📜 tsconfig.json
```

### Reglas de la Arquitectura

- **`app/`** — Solo routing y layouts. Sin lógica de negocio.
- **`components/`** — Solo UI genérica, agnóstica al dominio. Si necesita saber qué es un "Task" o un "Board", no va aquí.
- **`features/`** — Cada dominio es autónomo: sus componentes, su store, sus tipos. No mezclar dominios.
- **`store/`** — Solo estado global de UI (sidebar, modales). El estado de datos va en `features/*/store/`.
- **`hooks/`** — Solo hooks verdaderamente reutilizables en toda la app.

> [!NOTE]
> **Componentes reutilizables primero.** Antes de crear un componente nuevo, verificar si ya existe algo similar en `components/ui/`. Si un componente se repite en dos o más lugares, extraerlo inmediatamente. El código duplicado en UI es deuda técnica desde el primer commit.
