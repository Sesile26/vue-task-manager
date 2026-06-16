// Choice: const-object + derived union (NOT a TS `enum`).
// Rationale — this works best with a `value` bound to a <select>:
//   * The values are plain strings ('active', 'todo', ...), so they bind
//     directly to <option :value="..."> and round-trip to/from the API and
//     JSON unchanged — no numeric reverse-mapping like a numeric `enum`.
//   * The object is iterable (Object.values) for rendering <option> lists,
//     while the derived union type still constrains assignment to the
//     known string literals.
//   * It is fully erasable / tree-shakeable and plays nicely with
//     `verbatimModuleSyntax` — unlike `enum`, which emits a runtime object
//     and cannot be `import type`-d away.

export const ProjectStatus = {
  Active: 'active',
  Archived: 'archived',
} as const

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus]

export const TaskStatus = {
  Todo: 'todo',
  InProgress: 'in_progress',
  Done: 'done',
} as const

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]
