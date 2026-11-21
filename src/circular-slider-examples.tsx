import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Button, CircularSlider } from '@revolist/ui/preact';
import { Example } from './catalog';

export function CircularSliderExamples() {
  const [rotation, setRotation] = useState(135);
  const [committed, setCommitted] = useState(135);

  return (
    <>
      <Example title="Controlled rotation">
        <CircularSlider
          label="Rotation"
          value={rotation}
          markers
          step={5}
          onValueChange={setRotation}
          onValueCommit={setCommitted}
        />
        <div class="catalog-row">
          <Button
            onClick={() => {
              setRotation(0);
              setCommitted(0);
            }}
          >
            Reset rotation
          </Button>
          <output role="status">Applied rotation {committed}°</output>
        </div>
      </Example>
      <Example title="Heading with compass markers">
        <CircularSlider
          label="Heading"
          defaultValue={90}
          markers={[0, 90, 180, 270, 360]}
          step={15}
          size={176}
          thickness={8}
        />
      </Example>
      <Example title="Circular form control">
        <form onSubmit={(event) => event.preventDefault()}>
          <CircularSlider
            label="Mix level"
            name="mix"
            defaultValue={180}
            step={18}
            markers
            markersAtSteps
            formatValue={(angle) => `${Math.round(angle / 3.6)}%`}
          />
          <div class="catalog-row">
            <Button type="reset">Reset mix</Button>
          </div>
        </form>
      </Example>
      <Example title="Circular slider states">
        <div class="catalog-row">
          <CircularSlider
            label="Locked rotation"
            defaultValue={45}
            disabled
            size={104}
          />
          <CircularSlider
            label="Saved heading"
            defaultValue={225}
            readOnly
            size={104}
          />
          <CircularSlider
            label="Review angle"
            defaultValue={300}
            invalid
            size={104}
          />
        </div>
      </Example>
    </>
  );
}
