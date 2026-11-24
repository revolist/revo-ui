import { h } from 'preact';
import { createPreactElement } from './preact-mount';
import { renderProgressBar } from './progress/bar';

/** Display-ready content; all language and number formatting belongs to the host. */
export interface BenchmarkCardContent {
  title: string;
  description?: string;
  badge?: string;
  value: string;
  detail?: string;
  change?: string;
  changeTone?: 'positive' | 'negative' | 'neutral';
  benchmark?: string;
  progress?: { value: number; min?: number; max?: number; label: string };
}

/** Create safe, presentation-only benchmark content in the supplied document. */
export function createBenchmarkCardContent(
  doc: Document,
  content: BenchmarkCardContent,
): HTMLElement {
  const progress = content.progress;
  const finiteValue =
    progress && Number.isFinite(progress.value)
      ? progress.value
      : Number.isFinite(progress?.min)
        ? progress!.min!
        : 0;
  return doc.adoptNode(
    createPreactElement<HTMLElement>(
      doc,
      h('div', { class: 'rv-benchmark-card' }, [
        h('div', { class: 'rv-benchmark-card__header' }, [
          h('div', { class: 'rv-benchmark-card__title' }, [
            h('strong', {}, content.title),
            content.description ? h('small', {}, content.description) : null,
          ]),
          content.badge
            ? h('span', { class: 'rv-benchmark-card__badge' }, content.badge)
            : null,
        ]),
        h('div', { class: 'rv-benchmark-card__result' }, [
          h('div', { class: 'rv-benchmark-card__value' }, [
            h('strong', {}, content.value),
            content.detail ? h('small', {}, content.detail) : null,
          ]),
          content.change
            ? h(
                'span',
                {
                  class: `rv-benchmark-card__change is-${content.changeTone ?? 'neutral'}`,
                },
                content.change,
              )
            : null,
        ]),
        progress
          ? renderProgressBar(h, {
              value: finiteValue!,
              min: progress.min,
              max: progress.max,
              ariaLabel: progress.label,
              className: 'rv-benchmark-card__progress',
            })
          : null,
        content.benchmark
          ? h(
              'small',
              { class: 'rv-benchmark-card__benchmark' },
              content.benchmark,
            )
          : null,
      ]),
    ),
  );
}
