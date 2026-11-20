import { normalizeProgressRange } from './range';
export interface ProgressBarPreset {
  className?: string;
}

export interface ProgressBarProps {
  preset?: ProgressBarPreset;
  value: number;
  min?: number;
  max?: number;
  ariaLabel?: string;
  className?: string;
  fillClass?: string | Record<string, boolean>;
}

type ProgressHyperFunc = (
  tag: string,
  props: Record<string, unknown>,
  children?: any[],
) => any;

function progressFillClassName(fillClass?: string | Record<string, boolean>) {
  if (typeof fillClass === 'string')
    return `rv-progress-bar__fill ${fillClass}`;
  return [
    'rv-progress-bar__fill',
    ...Object.entries(fillClass ?? {})
      .filter(([, enabled]) => enabled)
      .map(([className]) => className),
  ].join(' ');
}

/** Shared framework-neutral progress primitive used by chart cell renderers. */
export function renderProgressBar(
  h: ProgressHyperFunc,
  {
    preset,
    value,
    min = 0,
    max = 100,
    ariaLabel,
    className,
    fillClass,
  }: ProgressBarProps,
) {
  const normalized = normalizeProgressRange(value, min, max);
  const width = Number(normalized.percent.toFixed(8));
  return h(
    'div',
    {
      class: ['rv-progress-bar', preset?.className, className].filter(Boolean).join(' '),
      'data-part': 'root',
      role: 'progressbar',
      'aria-valuemin': normalized.min,
      'aria-valuemax': normalized.max,
      'aria-valuenow': Math.min(
        normalized.max,
        Math.max(normalized.min, value),
      ),
      'aria-label': ariaLabel,
    },
    [
      h(
        'span',
        {
          class: 'rv-progress-bar__track',
          'data-part': 'track',
        },
        [
          h('span', {
            class: progressFillClassName(fillClass),
            'data-part': 'fill',
            style: { width: `${width}%` },
          }),
        ],
      ),
    ],
  );
}
