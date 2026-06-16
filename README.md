English | [Українська](./README.uk.md)

# Project & Task Manager

An SPA for managing projects and the tasks inside them. Vue 3 (Composition API) + TypeScript (strict, no `any`) + Pinia. Works without a real backend — through an Axios mock adapter on top of `localStorage`.

**Live version:** _<!-- paste URL here after deploy -->_

---

## Features

- **Projects list:** a table with sortable columns, name search, status filter, column resize. Create / edit / delete a project without a reload.
- **Project page, two view modes:** Table and Kanban over the **same** store data — changes sync in real time both ways. The selected mode persists across reloads.
- **Tasks table:** sort by due date and status, filter by assignee and status, drag-and-drop rows, column resize.
- **Kanban:** three status columns; dragging within a column changes the order, dragging between columns changes status and position.
- **Forms** with validation (zod + vee-validate), errors on blur and on submit.
- **Bonuses:** toast notifications, a donut chart of task distribution by status, filters/sort persisted in the URL (shareable & bookmarkable), light/dark theme, animations.

---

## Stack

Vue 3 (Composition API, `<script setup>`) · TypeScript (strict) · Pinia · Vue Router · Axios · SCSS · vue-draggable-plus · zod + vee-validate · Vite.

---

## Local development

```bash
npm install
npm run dev         # dev server (http://localhost:5173)
npm run build       # production build
npm run preview     # preview the production build locally
npm run lint        # ESLint (fails on any `any`)
npm run type-check  # vue-tsc --noEmit
```

No backend required — the app is fully self-contained (mock adapter + `localStorage`). Seed data is loaded on first launch; after that, state lives in the browser.

---

## Architecture

```
src/
  api/          # Axios layer: generic-typed wrappers, mock adapter, error handling
  stores/       # Pinia modules (projects, tasks) — CRUD actions, derived state
  composables/  # reusable reactive logic (sort, resize, drag, filters, …)
  utils/        # pure functions (date format, pluralization, status labels, aria)
  types/        # domain models, enums (const-object), DTOs
  components/   # feature components + ui/ primitives + icons/
  views/        # pages (ProjectsView, ProjectView)
  router/       # vue-router routes
  styles/       # SCSS: tokens, reset, mixins, variables
  App.vue       # root component
  main.ts       # entry point: Pinia, router, global styles
```

### API layer (`src/api/`)

All data goes **exclusively** through Axios — even without a real backend. `http` exposes generic-typed wrappers (`get<T>`, `post<T, B>`, …) that return the unwrapped payload, so components never touch `AxiosResponse`.

Error handling is centralized **in a single place**: the response interceptor normalizes any failure into `ApiError`, and `settle()` wraps the call into a tagged result `{ ok, data } | { ok, error }`. This is the **only** `try/catch` around requests — stores and components just branch on `result.ok` and never wrap Axios in their own `try/catch`.

All 8 endpoints are implemented: `GET/POST/PUT/DELETE /projects`, `GET /tasks` (with an optional `?projectId=` — without the parameter it returns every task, used by the task-count column on the projects list), `POST/PUT/DELETE /tasks`.

### Store (`src/stores/`)

Separate modules for projects and tasks. Tasks are the single source of truth for both view modes: mutations are applied to state immediately (optimistically), so a status/order change is reflected everywhere instantly, then persisted via the API. Task counts and the status distribution are **derived reactive** state (`computed`), never stored on the model.

### Composables

All table/drag/filter logic lives in hooks, not in components:

- `useTableSort` — generic sort with a three-state column cycle (inactive → asc → desc → manual).
- `useColumnResize` — column-width resize (feeds grid tracks).
- `useDragSort` / `useKanbanDrag` — drag-and-drop glue for the list and for the board. They hold only a writable mirror for `<VueDraggable>` and report the new order; they do **not** derive `order`/`status` themselves — that is the store's job.
- `useFilters` — generic filtering (text search + exact-match filters, including tri-state).
- `useNullableSelect` — a bridge between the store's nullable filter and a non-null `<select>` model.
- `useQueryFilters` — two-way sync of filters/sort with the URL query string.
- `usePersistedRef`, `useTheme`, `useToast` — persistence, theme, notifications.

Pure (non-reactive) helpers live separately in `utils/` — date format, Ukrainian pluralization, status labels (single source of truth), `aria-sort`.

### Typing

Domain models and DTOs (via `Omit`/`Partial`) live in one place. Statuses are a **const-object + derived union** rather than a TS `enum`: values stay plain strings (they bind directly to `<option>` and round-trip through API/JSON without any numeric reverse-mapping), the object is iterable for rendering option lists, and it is fully erasable under `verbatimModuleSyntax`. Generic typing is end-to-end across the API layer and composables. `any` is forbidden by an ESLint rule (`no-explicit-any: error`) — 0 occurrences in the source.

---

## Mock backend

There is no real server. A custom **Axios adapter** (`src/api/mockAdapter.ts`) intercepts every request and serves it from `localStorage`, adding a random delay of **150–300 ms** to mimic network latency. A custom adapter was chosen over `axios-mock-adapter` so that the mock stays self-contained and fully typed (no extra dependency, no `any`).

Routes are matched by method and URL, bodies are parsed from JSON, responses are typed. Deleting a project cascades and removes its tasks too. From the app code's perspective this is transparent — it makes ordinary typed Axios calls and knows nothing about the mock.

---

## Deliberate decisions and trade-offs

- **Optimistic mutations without rollback.** `reorderTasks`/`syncBoard` change state before the server responds (instant UI), and on a failed `PUT` they surface the error without rolling back. The mock never fails, so for this assignment a rollback would be wasted code; in production this would be a state rollback on request failure.
- **Reorder issues multiple `PUT`s.** Persisting a new order sends one `PUT /tasks/:id` per changed task (`Promise.all`). A real backend would warrant a batch endpoint (e.g. `PATCH /tasks/reorder`); within the mock this is a deliberate simplification.
- **Filters/sort — in the URL, view mode — in `localStorage`.** *View state* (filters, sort) lives in the query string: shareable, bookmarkable, and friendly with back/forward. The selected Table/Kanban mode stays in `localStorage` — as the assignment explicitly requires. One mechanism per kind of state, not mixed.
- **Two separate drag composables** (`useDragSort` for the list, `useKanbanDrag` for the board) rather than one generic. The shared kernel is a handful of lines; merging them into `useDragSort<T | Record<S, T[]>>` would make both scenarios less readable. The semantics differ (flat list vs `Record<status, list>`), so they are kept apart on purpose.
- **Column sort and manual DnD in the table are mutually exclusive.** While a column sort is active, drag is disabled (otherwise the next re-render by sort would "throw away" the dragged row). A third click on the header returns to manual mode, where DnD works again.
- **`order` is project-wide.** Both the table (flat list) and the Kanban (order within a column) read the same `order`, which is recomputed end-to-end across todo → in_progress → done after any drop. This makes syncing the two modes trivial — both look at the same store array.
