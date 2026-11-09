export interface StatusFeedbackSizeOptions {
  readonly width?: number;
  readonly collapsedWidth?: number;
}

/** Size the surface before the shared anchor helper positions it. */
export function statusFeedbackSize(
  viewport: { width: number; height: number },
  boundary: { width: number; height: number } | undefined,
  collapsed: boolean,
  options: StatusFeedbackSizeOptions,
): { width: number; maxHeight: number } {
  return {
    width: Math.max(
      0,
      Math.min(
        collapsed ? (options.collapsedWidth ?? 260) : (options.width ?? 560),
        viewport.width - 16,
        boundary ? boundary.width - 16 : Infinity,
      ),
    ),
    maxHeight: Math.max(
      0,
      Math.min(
        viewport.height - 16,
        Math.max(48, boundary ? boundary.height * 0.45 : viewport.height * 0.6),
      ),
    ),
  };
}
