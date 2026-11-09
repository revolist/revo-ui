/** Expansion overlay shared by nested field libraries; searching never overwrites it. */
export interface FieldExpansionState {
  known: Set<string>;
  expanded: Set<string>;
  collapsed: Set<string>;
}
export function createFieldExpansion(): FieldExpansionState {
  return { known: new Set(), expanded: new Set(), collapsed: new Set() };
}
export function fieldExpansionIds(
  state: FieldExpansionState,
  ids: readonly string[],
  searching: boolean,
): Set<string> {
  for (const id of ids) {
    if (!state.known.has(id)) {
      state.known.add(id);
      state.expanded.add(id);
    }
  }
  return new Set(searching ? ids : state.expanded);
}
export function recordFieldExpansion(
  state: FieldExpansionState,
  expanded: Iterable<unknown>,
): void {
  state.expanded = new Set([...expanded].map(String));
  state.collapsed = new Set(
    [...state.known].filter((id) => !state.expanded.has(id)),
  );
}
