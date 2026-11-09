export interface BadgeOptions {
  /** Neutral counters or accent emphasis. Defaults to the existing solid badge. */
  variant?: 'neutral' | 'accent' | 'solid';
  shape?: 'pill' | 'rounded';
}

/** Shared presentation for inline badges across framework adapters. */
export function badgeClassName({
  variant = 'solid',
  shape = 'pill',
}: BadgeOptions = {}): string {
  return `rv-badge rv-badge--inline rv-badge--${variant} rv-badge--${shape}`;
}
