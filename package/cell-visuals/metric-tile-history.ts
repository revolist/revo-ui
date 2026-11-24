/** Display-ready, localized history content for a metric's tiles. */
export interface MetricTileHistory {
  title: string;
  subtitle?: string;
  footer?: { text: string; color?: string };
  rows: readonly { label: string; value: string; color?: string; filled?: boolean }[];
}
export const METRIC_TILE_HISTORY_TOOLTIP = 'metric-tile-history';
/** Safely construct content for the shared grid tooltip surface. */
export function createMetricTileHistoryTooltip(document: Document, content: string): HTMLElement | undefined {
  let data: { history: MetricTileHistory; index: number };
  try { data = JSON.parse(content); } catch { return; }
  if (!data?.history || !Array.isArray(data.history.rows) || !Number.isInteger(data.index)) return;
  const root = document.createElement('div'); root.className = `rv-metric-history${data.index < 0 ? ' rv-metric-history--summary' : ''}`;
  const title = document.createElement('strong'); title.className = 'rv-metric-history__title'; title.textContent = data.history.title; root.append(title);
  if (data.history.subtitle) { const subtitle = document.createElement('span'); subtitle.className = 'rv-metric-history__subtitle'; subtitle.textContent = data.history.subtitle; root.append(subtitle); }
  const list = document.createElement('div'); list.className = 'rv-metric-history__rows';
  data.history.rows.forEach((row, index) => {
    const line = document.createElement('div'); line.className = `rv-metric-history__row${index === data.index ? ' is-active' : ''}`;
    const label = document.createElement('span'); label.className = 'rv-metric-history__label';
    if (row.color) { const marker = document.createElement('i'); marker.className = `rv-metric-history__marker${row.filled ? ' is-filled' : ''}`; marker.style.color = row.color; label.append(marker); }
    label.append(document.createTextNode(row.label));
    const value = document.createElement('span'); value.textContent = row.value;
    line.append(label, value); list.append(line);
  });
  root.append(list);
  if (data.history.footer?.text) {
    const footer = document.createElement('div'); footer.className = 'rv-metric-history__footer';
    if (data.history.footer.color) { const marker = document.createElement('i'); marker.className = 'rv-metric-history__marker is-filled'; marker.style.color = data.history.footer.color; footer.append(marker); }
    footer.append(document.createTextNode(data.history.footer.text)); root.append(footer);
  }
  return root;
}
