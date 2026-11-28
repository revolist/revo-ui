import { componentNestedSlots } from './component-metadata';

type Scope = Record<string, unknown>;
interface Options<T> {
  slots: Record<string, T>;
  render: (slot: T, scope: Scope) => unknown;
  /** Convert host-framework nodes and node-returning callbacks already present in data. */
  convert?: (value: unknown) => unknown;
}

/** Preserve item prototypes and property descriptors while replacing one field. */
function withProperty(source: object, key: string, value: unknown): object {
  const descriptors = Object.getOwnPropertyDescriptors(source);
  // Match object spread's reactive reads for enumerable data properties.
  for (const property of Reflect.ownKeys(descriptors)) {
    const descriptor = Reflect.get(descriptors, property) as PropertyDescriptor;
    if (descriptor.enumerable && 'value' in descriptor)
      descriptor.value = Reflect.get(source, property);
  }
  const prior = descriptors[key];
  descriptors[key] = {
    value,
    enumerable: prior?.enumerable ?? true,
    configurable: true,
    writable: true,
  };
  return Object.create(Object.getPrototypeOf(source), descriptors);
}

/** Apply only declared content paths, retaining all untouched application objects. */
export function withNestedFrameworkContent<T>(
  name: string,
  props: Record<string, any>,
  options: Options<T>,
): { props: Record<string, any>; originals: WeakMap<object, object> } {
  let result = props;
  const originals = new WeakMap<object, object>();
  const original = (value: any) =>
    value && typeof value === 'object'
      ? (originals.get(value) ?? value)
      : value;
  const remember = (copy: object, source: object) => {
    originals.set(copy, original(source));
    return copy;
  };
  for (const [slotName, descriptor] of Object.entries(
    componentNestedSlots(name),
  )) {
    const slot = options.slots[slotName];
    if (slot == null && !options.convert) continue;
    const visit = (value: any, depth: number, scope: Scope): any => {
      if (depth === descriptor.path.length) {
        if (descriptor.args) {
          if (slot != null)
            return (...args: unknown[]) =>
              options.render(
                slot,
                Object.fromEntries(
                  descriptor.args!.map((arg, index) => [arg, args[index]]),
                ),
              );
          if (typeof value !== 'function' || !options.convert) return value;
          return (...args: unknown[]) => options.convert!(value(...args));
        }
        return slot != null
          ? options.render(slot, scope)
          : (options.convert?.(value) ?? value);
      }
      const key = descriptor.path[depth];
      if (key === '*') {
        if (!Array.isArray(value)) return value;
        let changed = false;
        const next = value.map((item, index) => {
          const raw = original(item);
          const path = [...((scope.path as number[] | undefined) ?? []), index];
          const childScope = {
            ...scope,
            ...(descriptor.item ? { [descriptor.item]: raw } : {}),
            index,
            ...(descriptor.recursiveChildren ? { path } : {}),
          };
          let entry = visit(item, depth + 1, childScope);
          if (
            descriptor.recursiveChildren &&
            item &&
            typeof item === 'object'
          ) {
            const childKey = descriptor.recursiveChildren;
            const children = visit(item[childKey], depth, { ...scope, path });
            if (children !== item[childKey]) {
              const prior = entry;
              entry = remember(
                withProperty(entry, childKey, children),
                original(prior),
              );
            }
          }
          changed ||= entry !== item;
          return entry;
        });
        return changed ? remember(next, value) : value;
      }
      if (
        value === false ||
        (value == null && !(slot != null && descriptor.create))
      )
        return value;
      if (typeof value !== 'object' && value != null) return value;
      const source = value ?? {};
      const next = visit(source[key], depth + 1, scope);
      if (next === source[key]) return value;
      return remember(withProperty(source, key, next), source);
    };
    result = visit(result, 0, {});
  }
  return { props: result, originals };
}

/** Call consumer callbacks with original items rather than adapter-created copies. */
export function restoreNestedCallbackArguments(
  props: Record<string, any>,
  originals: WeakMap<object, object>,
): Record<string, any> {
  const result = { ...props };
  for (const [key, callback] of Object.entries(props)) {
    if (typeof callback !== 'function') continue;
    result[key] = (...args: unknown[]) =>
      callback(
        ...args.map((arg) =>
          arg && typeof arg === 'object' ? (originals.get(arg) ?? arg) : arg,
        ),
      );
  }
  return result;
}
