/** Stable resource identifier. Numeric and string IDs remain distinct. */
export type AssigneeId = string | number;
/** Allocation in percent; values above 100 represent over-allocation. */
export interface AssigneeAssignment {
  value: AssigneeId;
  units: number;
}

/** Copy and deduplicate stored assignments without modifying the source row. */
export function copyAssigneeAssignments(value: unknown): AssigneeAssignment[] {
  const assignments = new Map<AssigneeId, AssigneeAssignment>();
  if (Array.isArray(value))
    for (const item of value) {
      if (
        item &&
        (typeof item.value === 'string' || typeof item.value === 'number')
      ) {
        assignments.set(item.value, { value: item.value, units: item.units });
      }
    }
  return [...assignments.values()];
}

export function validAssigneeUnits(units: number): boolean {
  return Number.isFinite(units) && units >= 0;
}

/** Reconcile checkbox state while retaining unknown IDs and locked assignments. */
export function reconcileAssigneeSelection(
  previous: AssigneeAssignment[],
  options: readonly { value: AssigneeId; disabled?: boolean }[],
  selected: ReadonlySet<AssigneeId>,
  defaultUnits: number,
): AssigneeAssignment[] {
  const known = new Map(options.map((option) => [option.value, option]));
  const existing = new Set(previous.map((item) => item.value));
  const next = previous.filter(
    (item) =>
      !known.has(item.value) ||
      known.get(item.value)?.disabled ||
      selected.has(item.value),
  );
  for (const option of options) {
    if (
      selected.has(option.value) &&
      !existing.has(option.value) &&
      !option.disabled
    )
      next.push({ value: option.value, units: defaultUnits });
  }
  return next;
}

/** Zero allocations keep the assignee name without a percentage suffix. */
export function formatAssigneeLabel(
  name: string | number,
  units: number,
): string {
  return units === 0 ? String(name) : `${name} ${units}%`;
}
