import { h, render } from 'preact';
import { MetricPanel, MetricTile } from '../../../../package/preact';
import '../../../../package/styles.scss';
import { renderGroupRail } from '../../../../package/cell-visuals/group-rail';

render(
  <>
    <MetricPanel
      label="Campaign performance"
      items={[
        { label: 'Spend', value: '$643.6K', detail: '76% of $846K budget' },
        { label: 'Impressions', value: '43.6M', detail: '2.2% CTR' },
        {
          label: 'Conversions',
          value: '27.8K',
          detail: '-6%',
          detailTone: 'negative',
        },
        {
          label: 'Blended CPA',
          value: '$23.13',
          detail: '+3.1%',
          detailTone: 'negative',
        },
        { label: 'Blended ROAS', value: '5.0x', detail: 'Target 4.3x' },
        { label: 'Below Target', value: 21, detail: 'of 30 campaigns' },
      ]}
    />
    <MetricPanel label="Composed">
      <MetricTile label="Revenue" value="$12K" detail="+2%" />
    </MetricPanel>
    <MetricPanel label="Variants">
      <MetricTile label="Visual" value="1" visual={{ accent: 'red' }}>
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
    </MetricPanel>
    {renderGroupRail(h, {
      title: 'Group',
      actionLabel: 'Open',
      expanded: false,
      details: (h) => h('button', {}, 'Hidden details'),
      onToggle: () => {},
    })}
  </>,
  document.getElementById('app')!,
);
