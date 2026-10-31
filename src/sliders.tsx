import { h } from 'preact';
import { useState } from 'preact/hooks';
import { SliderField } from '@revolist/ui/filter/filters/slider/single';
import { TimelineTrack, type TimelineTrackEvent, type TimelineTrackItem } from '@revolist/ui/timeline-track';
import { Example } from './catalog';

export function SliderLayoutExamples() {
  const [volume, setVolume] = useState(7);
  const [quality, setQuality] = useState(80);
  const [optimism, setOptimism] = useState(15);
  const [budget, setBudget] = useState(70);
  const [temperature, setTemperature] = useState(21);
  return <>
    <Example title="Slider labels and value callouts">
      <SliderField label="Volume" ariaLabel="Volume" min={0} max={10} value={volume} formatValue={value => `${value} dB`} onChange={setVolume} />
      <SliderField label="Code quality" ariaLabel="Code quality" min={0} max={100} value={quality} accentColor="#fb8c00" onChange={setQuality} />
      <SliderField label="Optimism" ariaLabel="Optimism" min={0} max={100} value={optimism} accentColor="#43a047" onChange={setOptimism} />
      <SliderField label="Legacy code (disabled)" ariaLabel="Legacy code" min={0} max={100} value={99} disabled formatValue={value => `${value}%`} onChange={() => {}} />
      <SliderField label="Budget" ariaLabel="Budget" min={0} max={100} value={budget} valuePlacement="thumb" ticks={11} accentColor="#e53935" onChange={setBudget} />
    </Example>
    <Example title="Stacked slider with units">
      <SliderField label="Temperature" ariaLabel="Temperature" layout="stacked" min={-10} max={40} step={0.5} value={temperature} formatValue={value => `${value} °C`} ticks={6} onChange={setTemperature} />
      <SliderField label="Minimal temperature" ariaLabel="Minimal temperature" layout="stacked" min={-10} max={40} value={temperature} valuePlacement="none" onChange={setTemperature} />
    </Example>
  </>;
}

export function TimelineTrackExample() {
  const [rows, setRows] = useState<TimelineTrackItem<TimelineTrackEvent>[]>([
    { id: 'build', event: { start: 8, end: 12, label: 'Build', color: '#2563eb', textColor: '#ffffff' } },
    { id: 'review', event: { start: 14, end: 18, label: 'Review', color: '#7c3aed', textColor: '#ffffff', segments: [{ color: '#7c3aed', weight: 3 }, { color: '#c2410c', weight: 1 }] } },
  ]);
  const [selected, setSelected] = useState<string | number>('review');
  return <Example title="Interactive timeline track" wide>
    <TimelineTrack rows={rows} selected={selected} range={{ start: 0, end: 24 }} formatValue={value => `${String(value).padStart(2, '0')}:00`}
      onSelect={setSelected}
      onEventChange={(id, event) => setRows(current => current.map(row => row.id === id ? { ...row, event } : row))}
    />
    <p>Build stays solid blue. Review pairs violet feedback with an orange approval phase. Segment weights define the relative phase lengths and scale when resized.</p>
    <p>Drag an event to move it, or drag either edge to resize. Focus an event or edge and use Left/Right arrows.</p>
  </Example>;
}
