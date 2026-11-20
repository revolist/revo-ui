/** Values that can be shared in a JSON theme. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
export type ComponentDefaults = Record<string, JsonValue>;

const forbidden =
  /^(?:preset|key|ref|children|dangerouslySetInnerHTML|__proto__|prototype|constructor|on[A-Za-z].*)$/;
const propName = /^[a-zA-Z_$][a-zA-Z0-9_$-]*$/;

function isJsonValue(value: unknown, visited: Set<object>): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || visited.has(value)) return false;
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  )
    return false;
  visited.add(value);
  const valid = Object.values(value).every((item) =>
    isJsonValue(item, visited),
  );
  visited.delete(value);
  return valid;
}

/**
 * Apply arbitrary JSON-friendly component defaults. Spread the result before
 * application props so those props and callbacks take precedence.
 */
export function presetProps<T extends { defaults?: ComponentDefaults }>(
  preset: T | undefined,
): Record<string, unknown> & { preset: T | undefined } {
  const defaults = preset?.defaults ?? {};
  if (typeof defaults !== 'object' || Array.isArray(defaults))
    throw new TypeError('Component defaults must be a JSON object');
  for (const [key, value] of Object.entries(defaults)) {
    if (
      !propName.test(key) ||
      forbidden.test(key) ||
      !isJsonValue(value, new Set())
    )
      throw new TypeError(`Invalid component default: ${key}`);
  }
  return { ...defaults, preset };
}
