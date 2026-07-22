# Kanban Board

A full-featured Kanban project management application built with Next.js 16. Organize work with boards, columns, and tasks — drag and drop everything between columns in real time.

## Features

- **Boards CRUD** — create, read, update, and delete boards
- **Columns CRUD** — add, rename, reorder, and remove columns per board
- **Tasks & Subtasks** — full task management with nested subtask checklists
- **Drag & Drop** — move tasks between columns and reorder within a column using @dnd-kit
- **Authentication** — email/password sign-up and login powered by Better Auth
- **Dark / Light Theme** — system-aware and manual toggle via next-themes
- **Responsive Design** — works on desktop, tablet, and mobile
- **Optimistic Updates** — instant UI feedback on drag-and-drop with server reconciliation

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Drag & Drop | @dnd-kit (react 0.5) |
| Authentication | Better Auth |
| Validation | Zod v4 |
| Forms | React Hook Form |

## Prerequisites

- **Node.js** 18+
- **Docker** (for PostgreSQL)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd kanban-nextjs
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the database**

   ```bash
   docker compose up -d
   ```

4. **Configure environment variables**

   Copy `.env.example` to `.env` and adjust values as needed:

   ```bash
   cp .env.example .env
   ```

5. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

6. **Seed the database** (optional)

   ```bash
   npm run prisma:seed
   ```

7. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/              # Next.js App Router — routes and layouts
├── components/       # Shared UI components (buttons, inputs, modals)
├── features/         # Domain modules (boards, tasks, auth)
│   ├── boards/       #   Board & column logic, actions, hooks
│   ├── tasks/        #   Task & subtask logic, actions, hooks
│   └── auth/         #   Authentication forms and schemas
├── hooks/            # Global reusable hooks
├── lib/              # Third-party configs (DnD, auth, prisma, utils)
├── store/            # Global UI state (sidebar, modals)
└── types/            # Shared TypeScript types
```

Each feature is self-contained with its own components, server actions, hooks, stores, and types.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma data browser |
| `npm run db:reset` | Reset and re-seed the database |
