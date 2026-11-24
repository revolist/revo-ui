import type { ElementFactory } from './types';
import { renderVarianceBar, type VarianceBarOptions } from './variance-bar';
import { renderSegmentedBar, type SegmentedBarOptions } from './segmented-bar';
import { renderChange } from './presentation';
import { METRIC_TILE_HISTORY_TOOLTIP, type MetricTileHistory } from './metric-tile-history';

export type MetricTrack =
  | {
      kind: 'meter';
      value: number;
      max: number;
      label: string;
      reference?: number;
    }
  | {
      kind: 'tiles';
      items: readonly ('positive' | 'negative' | 'neutral' | 'unknown')[];
      label?: string;
      /** Optional localized per-tile history, displayed by a compatible tooltip host. */
      history?: MetricTileHistory;
    }
  | ({ kind: 'variance' } & VarianceBarOptions);
export interface MetricDetailOptions {
  value: string;
  detail?: string;
  detailTone?: 'positive' | 'negative' | 'neutral';
  valueTone?: 'negative' | 'neutral';
  alignValue?: 'start' | 'positive-negative';
  track: MetricTrack;
}
export function renderMetricDetail(
  h: ElementFactory,
  options: MetricDetailOptions,
) {
  const track = options.track;
  const visual =
    track.kind === 'variance'
      ? renderVarianceBar(h, track)
      : track.kind === 'tiles'
        ? h(
            'span',
            {
              class: 'rv-metric-detail__tiles',
              ...(track.history
                ? { role: 'group', 'aria-label': track.label ?? track.history.title }
                : track.label ? { role: 'img', 'aria-label': track.label } : { 'aria-hidden': 'true' }),
            },
            track.items.map((item, index) =>
              track.history?.rows[index]
                ? h('button', {
                    type: 'button', class: `is-${item}`,
                    'aria-label': `${track.history.title}, ${track.history.rows[index].label}, ${track.history.rows[index].value}`,
                    'data-tooltip': JSON.stringify({ history: track.history, index }),
                    'tooltip-type': METRIC_TILE_HISTORY_TOOLTIP, 'tooltip-position': 'bottom',
                    onMouseDown: (event: MouseEvent) => event.stopPropagation(),
                  })
                : h('i', { class: `is-${item}`, 'aria-hidden': 'true' }),
            ),
          )
        : h('span', { class: 'rv-metric-detail__meter' }, [
            h('progress', {
              value: track.value,
              max: track.max > 0 ? track.max : 1,
              'aria-label': track.label,
            }),
            typeof track.reference === 'number' &&
            Number.isFinite(track.reference)
              ? h('i', {
                  class: 'rv-metric-detail__reference',
                  style: {
                    left: `${Math.max(0, Math.min(100, (track.reference / (track.max > 0 ? track.max : 1)) * 100))}%`,
                  },
                  'aria-hidden': 'true',
                })
              : null,
          ]);
  return h('div', { class: 'rv-metric-detail' }, [
    h(
      'span',
      {
        class: `rv-metric-detail__heading${options.alignValue === 'positive-negative' ? ` rv-metric-detail__heading--split${options.valueTone === 'negative' ? ' is-negative' : ''}` : ''}`,
      },
      [
        h('strong', {}, options.value),
        options.detail === undefined
          ? null
          : h(
              'small',
              { class: `is-${options.detailTone ?? 'positive'}` },
              options.detail,
            ),
      ],
    ),
    visual,
  ]);
}

export interface SplitValueOptions {
  value: string;
  detail: string;
  detailTone?: 'positive' | 'negative' | 'neutral';
  badge?: boolean;
}
export function renderSplitValue(
  h: ElementFactory,
  options: SplitValueOptions,
) {
  return h('div', { class: 'rv-split-value' }, [
    h(
      'small',
      { class: `is-${options.detailTone ?? 'neutral'}` },
      options.detail,
    ),
    h(
      'span',
      { class: options.badge ? 'rv-split-value__badge' : '' },
      options.value,
    ),
  ]);
}

export type ChoiceStatusOptions =
  | { kind: 'summary'; text: string; segments: SegmentedBarOptions }
  | {
      kind: 'choice';
      text: string;
      label: string;
      tone: 'positive' | 'negative' | 'neutral';
      onActivate: (event: MouseEvent) => void;
    };
export function renderChoiceStatus(
  h: ElementFactory,
  options: ChoiceStatusOptions,
) {
  if (options.kind === 'summary')
    return h('div', { class: 'rv-choice-status__summary' }, [
      h('span', {}, options.text),
      renderSegmentedBar(h, options.segments),
    ]);
  return h('span', { class: `rv-choice-status is-${options.tone}` }, [
    h(
      'button',
      {
        type: 'button',
        'aria-label': options.label,
        onMouseDown: (event: MouseEvent) => event.stopPropagation(),
        onClick: options.onActivate,
      },
      options.text,
    ),
  ]);
}

export interface RankingOptions {
  label: string;
  tone?: 'gold' | 'silver' | 'bronze' | 'neutral';
  change?: { value: number; label: string };
}
export function renderRanking(h: ElementFactory, options: RankingOptions) {
  return h('div', { class: 'rv-ranking' }, [
    h(
      'span',
      { class: `rv-ranking__badge is-${options.tone ?? 'neutral'}` },
      options.label,
    ),
    options.change
      ? renderChange(h, {
          ...options.change,
          icons: { positive: '↗', negative: '↘' },
          iconPosition: 'before',
          negativeParentheses: false,
        })
      : null,
  ]);
}
