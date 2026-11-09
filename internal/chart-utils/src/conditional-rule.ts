export interface ConditionalRule {
  operator: 'gt' | 'lt' | 'between' | 'equal' | 'contains';
  value?: unknown;
  min?: unknown;
  max?: unknown;
  caseSensitive?: boolean;
}

export function evaluateConditionalRule(
  value: unknown,
  rule: ConditionalRule,
): boolean {
  switch (rule.operator) {
    case 'gt':
      return compareNumber(value, rule.value, (left, right) => left > right);
    case 'lt':
      return compareNumber(value, rule.value, (left, right) => left < right);
    case 'between': {
      const [min, max] = resolveBetweenBounds(rule);
      return (
        compareNumber(value, min, (left, right) => left >= right) &&
        compareNumber(value, max, (left, right) => left <= right)
      );
    }
    case 'equal':
      return isEqualValue(value, rule.value, !!rule.caseSensitive);
    case 'contains':
      return containsText(value, rule.value, !!rule.caseSensitive);
    default:
      return false;
  }
}

function compareNumber(
  leftValue: unknown,
  rightValue: unknown,
  compare: (left: number, right: number) => boolean,
) {
  const left = toFiniteNumber(leftValue);
  const right = toFiniteNumber(rightValue);
  return (
    typeof left === 'number' &&
    typeof right === 'number' &&
    compare(left, right)
  );
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'string' && value.trim()) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  }
  return undefined;
}

function resolveBetweenBounds(rule: ConditionalRule) {
  return Array.isArray(rule.value) && rule.value.length >= 2
    ? [rule.value[0], rule.value[1]]
    : [rule.min, rule.max];
}

function isEqualValue(left: unknown, right: unknown, caseSensitive: boolean) {
  if (Object.is(left, right)) {
    return true;
  }

  const leftNumber = toFiniteNumber(left);
  const rightNumber = toFiniteNumber(right);
  if (typeof leftNumber === 'number' && typeof rightNumber === 'number') {
    return leftNumber === rightNumber;
  }

  const leftText = stringifyComparable(left);
  const rightText = stringifyComparable(right);
  if (typeof leftText === 'undefined' || typeof rightText === 'undefined') {
    return false;
  }
  return caseSensitive
    ? leftText === rightText
    : leftText.toLocaleLowerCase() === rightText.toLocaleLowerCase();
}

function containsText(value: unknown, needle: unknown, caseSensitive: boolean) {
  const haystackText = stringifyComparable(value);
  const needleText = stringifyComparable(needle);
  if (!haystackText || !needleText) {
    return false;
  }
  return caseSensitive
    ? haystackText.includes(needleText)
    : haystackText.toLocaleLowerCase().includes(needleText.toLocaleLowerCase());
}

function stringifyComparable(value: unknown): string | undefined {
  if (value === null || typeof value === 'undefined') {
    return undefined;
  }
  return String(value);
}
