import { h } from 'preact';
import { TooltipSession } from '../core/tooltip-session';
import { createTooltipElement } from '../core/popover-controller';
import { createPreactElement, releasePreactElement } from '../preact-mount';
import { renderDotHistogram, type DotHistogramOptions } from './dot-histogram';
import { renderSegmentedSummary, type SegmentedSummaryOptions } from './segmented-summary';
import { renderDottedComparison, renderStackedDotPlot, type DottedComparisonOptions, type StackedDotPlotOptions } from './dotted-summary';
import { createMetricTileHistoryTooltip, type MetricTileHistory } from './metric-tile-history';
const cleanups = new WeakMap<Element, () => void>();
const summaryTooltipMotion = { delay: 200, focusDelay: 200, transitionDuration: 160 } as const;
export function createDotHistogramElement(document: Document, options: DotHistogramOptions): HTMLElement {
  const chart = createPreactElement<HTMLElement>(document, renderDotHistogram(h, options));
  if (!options.tooltip) return chart;
  const session = new TooltipSession();
  const surface = createTooltipElement(document, 'rv-tooltip rv-dot-histogram__tooltip');
  session.setSurface(surface);
  session.configure({ ...summaryTooltipMotion, side: 'top', arrow: true });
  const show = (event: Event) => {
    const target = (event.target as Element).closest<HTMLButtonElement>('[data-dot-index]');
    if (!target || !chart.contains(target)) return;
    const index = Number(target.dataset.dotIndex), value = options.values[index];
    const data = options.tooltip!(value, index);
    const title = document.createElement('strong'); title.textContent = data.title;
    const subtitle = document.createElement('span'); subtitle.className = 'rv-dot-histogram__tooltip-subtitle'; subtitle.textContent = data.subtitle ?? '';
    const metric = document.createElement('div'); metric.className = 'rv-dot-histogram__tooltip-metric';
    const name = document.createElement('span'); name.textContent = data.metricLabel;
    const amount = document.createElement('b'); amount.textContent = data.metricValue;
    metric.append(name, amount); surface.replaceChildren(title, subtitle, metric);
    session.show(target, event.type === 'focusin' ? 'focus' : 'hover', event);
  };
  const hide = () => session.hide();
  chart.addEventListener('pointerover', show); chart.addEventListener('pointerout', hide);
  chart.addEventListener('focusin', show); chart.addEventListener('focusout', hide);
  cleanups.set(chart, () => { session.destroy(); releasePreactElement(surface); chart.removeEventListener('pointerover', show); chart.removeEventListener('pointerout', hide); chart.removeEventListener('focusin', show); chart.removeEventListener('focusout', hide); });
  return chart;
}
export function createSegmentedSummaryElement(document: Document, options: SegmentedSummaryOptions): HTMLElement {
  return createPreactElement(document, renderSegmentedSummary(h, options));
}
export function createDottedComparisonElement(document: Document, options: DottedComparisonOptions): HTMLElement {
  const chart = createPreactElement<HTMLElement>(document, renderDottedComparison(h, options));
  if (options.tooltip) bindSummaryTooltip(chart, '[data-comparison-index]', target => {
    const index = Number(target.dataset.comparisonIndex);
    return options.tooltip!(options.values[index], options.references?.[index], index);
  });
  return chart;
}
export function createStackedDotPlotElement(document: Document, options: StackedDotPlotOptions): HTMLElement {
  const chart = createPreactElement<HTMLElement>(document, renderStackedDotPlot(h, options));
  if (options.tooltip || options.pointTooltip) bindSummaryTooltip(chart, '[data-point-index], [data-summary-tooltip]', target => {
    const index = target.dataset.pointIndex;
    return index === undefined ? options.tooltip! : options.pointTooltip!(options.points[Number(index)], Number(index));
  });
  return chart;
}
function bindSummaryTooltip(chart: HTMLElement, selector: string, content: (target: HTMLElement) => MetricTileHistory): void {
  const session = new TooltipSession();
  const surface = createTooltipElement(chart.ownerDocument, 'rv-tooltip');
  session.setSurface(surface); session.configure({ ...summaryTooltipMotion, side: 'bottom', arrow: true });
  const targetFor = (target: EventTarget | null) => (target as Element | null)?.closest?.<HTMLElement>(selector);
  const show = (event: Event) => {
    const target = targetFor(event.target);
    if (!target || !chart.contains(target)) return;
    const body = createMetricTileHistoryTooltip(chart.ownerDocument, JSON.stringify({ history: content(target), index: -1 }));
    if (!body) return;
    surface.replaceChildren(body);
    session.show(target, event.type === 'focusin' ? 'focus' : 'hover', event);
  };
  const hide = (event: Event) => {
    const from = targetFor(event.target);
    if (from && from === targetFor((event as FocusEvent | PointerEvent).relatedTarget)) return;
    session.hide();
  };
  chart.addEventListener('pointerover', show); chart.addEventListener('pointerout', hide);
  chart.addEventListener('focusin', show); chart.addEventListener('focusout', hide);
  cleanups.set(chart, () => { session.destroy(); releasePreactElement(surface); chart.removeEventListener('pointerover', show); chart.removeEventListener('pointerout', hide); chart.removeEventListener('focusin', show); chart.removeEventListener('focusout', hide); });
}
/** Release a chart created by either native factory. */
export function releaseSummaryChartElement(element: Element): void { cleanups.get(element)?.(); cleanups.delete(element); releasePreactElement(element); }
