import { controlClassName } from '../control-presentation';
import type { ElementFactory } from '../native-controls';
export function renderCircularProgress<H extends ElementFactory>(
  h: H,
  options: {
    percent: number;
    thresholdClasses?: Record<string, boolean>;
    showValue?: boolean;
    formattedValue?: string;
  },
): ReturnType<H> {
  return h('div', { class: 'circular-progress-container' }, [
    h('div', { class: 'circular-progress' }, [
      h('svg', { class: 'circular-progress-svg', viewBox: '0 0 36 36' }, [
        // Background circle
        h('path', {
          class: 'circular-progress-bg',
          d: 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831',
        }),
        // Progress circle
        h('path', {
          class: controlClassName(
            'circular-progress-path',
            options.thresholdClasses,
          ),
          d: 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831',
          style: {
            'stroke-dasharray': `${options.percent}, 100`,
          },
        }),
      ]),
      // Optional value display in center
      options.showValue &&
        h('div', { class: 'circular-progress-value' }, options.formattedValue),
    ]),
  ]);
}
