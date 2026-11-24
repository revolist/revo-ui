import { h, render } from 'preact';
import { afterEach, describe, expect, it } from 'vitest';
import { MetricPanel, MetricTile, renderMetricTile } from './metric-panel';
import {
  createMetricPanelElement,
  createMetricTileElement,
  releaseMetricElement,
  renderMetricPanelInto,
} from './metric-panel-native';

afterEach(() => {
  render(null, document.body);
  document.body.replaceChildren();
});

describe('metric tile and panel', () => {
  it('composes localized metrics, including zero and a semantic tone', () => {
    render(
      <MetricPanel
        label="Campagne"
        items={[
          { label: 'Dépenses', value: '643,6 k€', detail: '76 % du budget' },
          { label: 'Conversions', value: 0, detail: 0, detailTone: 'negative' },
        ]}
      />,
      document.body,
    );
    const panel = document.querySelector('[role="group"]')!;
    expect(panel.getAttribute('aria-label')).toBe('Campagne');
    expect(
      [...panel.querySelectorAll('dt')].map((node) => node.textContent),
    ).toEqual(['Dépenses', 'Conversions']);
    expect(
      panel.querySelectorAll('.rv-metric-tile__value')[1].textContent,
    ).toBe('0');
    expect(
      panel.querySelectorAll('.rv-metric-tile__detail')[1].textContent,
    ).toBe('0');
    expect(panel.querySelector('.is-negative')).not.toBeNull();
    expect(panel.querySelectorAll('dl')).toHaveLength(2);
  });

  it('colors plus-prefixed numbers green while honoring explicit overrides', () => {
    render(
      <MetricPanel
        items={[
          { label: 'Growth', value: '+3.2%', detail: ' +1,5 % ' },
          {
            label: 'Cost',
            value: '+$5',
            detail: '+3.1%',
            detailTone: 'negative',
          },
          { label: 'Override', value: '+5%', valueTone: 'neutral' },
          { label: 'Unsigned', value: 20, detail: '2% CTR' },
        ]}
      />,
      document.body,
    );
    const tiles = document.querySelectorAll('.rv-metric-tile');
    expect(
      tiles[0]
        .querySelector('.rv-metric-tile__value')
        ?.classList.contains('is-positive'),
    ).toBe(true);
    expect(
      tiles[0]
        .querySelector('.rv-metric-tile__detail')
        ?.classList.contains('is-positive'),
    ).toBe(true);
    expect(
      tiles[1]
        .querySelector('.rv-metric-tile__value')
        ?.classList.contains('is-positive'),
    ).toBe(true);
    expect(
      tiles[1]
        .querySelector('.rv-metric-tile__detail')
        ?.classList.contains('is-negative'),
    ).toBe(true);
    expect(
      tiles[2]
        .querySelector('.rv-metric-tile__value')
        ?.classList.contains('is-neutral'),
    ).toBe(true);
    expect(
      tiles[3]
        .querySelector('.rv-metric-tile__value')
        ?.classList.contains('is-neutral'),
    ).toBe(true);
    expect(
      tiles[3]
        .querySelector('.rv-metric-tile__detail')
        ?.classList.contains('is-neutral'),
    ).toBe(true);
  });

  it('supports composing independent tiles and extra content', () => {
    render(
      <MetricPanel preset={{ className: 'panel-custom' }}>
        <MetricTile
          preset={{ className: 'tile-custom' }}
          label="Spend"
          value="$10"
        >
          <span>Extra</span>
        </MetricTile>
      </MetricPanel>,
      document.body,
    );
    expect(
      document.querySelector('.rv-metric-panel .rv-metric-tile dt')
        ?.textContent,
    ).toBe('Spend');
    expect(
      document.querySelector('.rv-metric-tile__extra span')?.textContent,
    ).toBe('Extra');
    expect(
      document
        .querySelector('.rv-metric-panel')
        ?.classList.contains('panel-custom'),
    ).toBe(true);
    expect(
      document
        .querySelector('.rv-metric-tile')
        ?.classList.contains('tile-custom'),
    ).toBe(true);
    expect(
      document.querySelector('.rv-metric-panel')?.getAttribute('role'),
    ).toBeNull();
  });

  it('exposes renderer-neutral markup without formatting host data', () => {
    const factory = (
      tag: string,
      attributes: Record<string, unknown>,
      children?: unknown,
    ) => ({ tag, attributes, children });
    const tile = renderMetricTile(factory, {
      label: 'Новые',
      value: 12,
      detail: '',
      detailTone: 'positive',
    });
    expect(tile.tag).toBe('dl');
    expect(tile.children[0].children).toBe('Новые');
    expect(tile.children[1].children).toBe(12);
    expect(tile.children[2].attributes.class).toContain('is-positive');
    expect(tile.children[2].children).toBe('');
  });

  it('updates and releases native panels and standalone tiles', () => {
    const host = createMetricPanelElement(document, {
      items: [{ label: 'Revenue', value: 4 }],
    });
    document.body.append(host);
    renderMetricPanelInto(host, {
      items: [{ label: 'Revenue', value: 5, detail: '<img>' }],
    });
    expect(host.querySelector('.rv-metric-tile__value')?.textContent).toBe('5');
    expect(host.querySelector('.rv-metric-tile__detail')?.textContent).toBe(
      '<img>',
    );
    expect(host.querySelector('img')).toBeNull();
    releaseMetricElement(host);
    expect(host.isConnected).toBe(false);
    const tile = createMetricTileElement(document, {
      label: 'CTR',
      value: '2.2%',
    });
    document.body.append(tile);
    expect(tile.querySelector('dt')?.textContent).toBe('CTR');
    releaseMetricElement(tile);
    expect(tile.isConnected).toBe(false);
  });
});

it('renders a localized visual metric tile with a bounded progress and supplied trend', () => {
  const tile = createMetricTileElement(document, {
    label: 'Presupuesto',
    value: '€120',
    visual: {
      accent: '#9747ff',
      detailLead: '+5%',
      detailRest: ' semanal',
      trend: [1, 2, 4],
      progress: {
        value: 140,
        label: 'Presupuesto gastado',
        captionLead: '140%',
        captionRest: ' del presupuesto',
      },
    },
  });
  expect(tile.querySelector('dt')?.textContent).toBe('Presupuesto');
  expect(tile.querySelectorAll('.bar-chart-bar')).toHaveLength(3);
  const progress = tile.querySelector('progress')!;
  expect(progress.value).toBe(100);
  expect(progress.getAttribute('aria-label')).toBe('Presupuesto gastado');
  expect(tile.querySelector('.rv-metric-tile__caption')?.textContent).toBe(
    '140% del presupuesto',
  );
  releaseMetricElement(tile);
});

it('renders an optional decorative SVG without placeholder icons', () => {
  const tile = createMetricTileElement(document, {
    label: 'Budget',
    value: '$100',
    visual: {
      accent: '#6647f0',
      iconSvg: '<svg viewBox="0 0 10 10"><path d="M0 0h10v10H0z"/></svg>',
    },
  });
  expect(tile.querySelector('.rv-metric-tile__icon svg')).not.toBeNull();
  expect(
    tile.querySelector('.rv-metric-tile__icon')?.getAttribute('aria-hidden'),
  ).toBe('true');
  releaseMetricElement(tile);
  const plain = createMetricTileElement(document, {
    label: 'Budget',
    value: '$100',
    visual: { accent: '#6647f0' },
  });
  expect(plain.querySelector('.rv-metric-tile__icon')).toBeNull();
  expect(plain.classList.contains('rv-metric-tile--no-icon')).toBe(true);
  releaseMetricElement(plain);
});

it('renders a compact localized summary heading with marker and legend', () => {
  const tile = createMetricTileElement(document, {
    label: 'Ventas',
    value: '€100',
    detail: '+5%',
    summary: { markerColor: '#f80', legend: 'Año anterior' },
  });
  expect(tile.querySelector('dt')?.textContent).toBe('Ventas');
  expect(tile.querySelector('strong')?.textContent).toBe('€100');
  expect(tile.querySelector('.rv-metric-tile__legend')?.textContent).toBe(
    'Año anterior',
  );
  releaseMetricElement(tile);
});

it('preserves children and presets in visual and summary tiles', () => {
  render(
    <div>
      <MetricTile
        label="Visual"
        value="1"
        preset={{ className: 'visual-preset' }}
        visual={{ accent: 'red' }}
      >
        <span>Visual extra</span>
      </MetricTile>
      <MetricTile
        label="Summary"
        value="2"
        preset={{ className: 'summary-preset' }}
        summary={{ markerColor: 'red' }}
      >
        <span>Summary extra</span>
      </MetricTile>
    </div>,
    document.body,
  );
  expect(
    document.querySelector('.visual-preset .rv-metric-tile__extra')
      ?.textContent,
  ).toBe('Visual extra');
  expect(
    document.querySelector('.summary-preset .rv-metric-tile__extra')
      ?.textContent,
  ).toBe('Summary extra');
});
