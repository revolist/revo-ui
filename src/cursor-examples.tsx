import { h } from 'preact';
import { useState } from 'preact/hooks';
import {
  Button,
  Cursor,
  CursorBody,
  CursorMessage,
  CursorName,
  CursorPointer,
} from '@revolist/ui/preact';
import { Example } from './catalog';

const positions = [
  { x: 18, y: 24 },
  { x: 108, y: 64 },
  { x: 52, y: 103 },
] as const;

export function CursorExamples() {
  const [frame, setFrame] = useState(0);
  const [boardEdits, setBoardEdits] = useState(0);

  return (
    <>
      <Example title="Collaborator colors">
        <div class="catalog-row">
          <Cursor name="Morgan" />
          <Cursor name="Sam" color="#6d28d9" />
          <Cursor name="Alex" color="#047857" />
          <Cursor name="Priya" color="#fbbf24" />
          <Cursor name="Noor" color="#be185d" />
        </div>
      </Example>
      <Example title="Composable cursor parts">
        <div class="catalog-row">
          <Cursor color="#7c3aed" aria-hidden="true">
            <CursorPointer size={24} />
          </Cursor>
          <Cursor color="#047857">
            <CursorPointer />
            <CursorBody>
              <CursorName>Morgan</CursorName>
            </CursorBody>
          </Cursor>
          <Cursor color="#0e7490">
            <CursorPointer />
            <CursorBody>
              <CursorName>Sam</CursorName>
              <CursorMessage>Reviewing the totals</CursorMessage>
            </CursorBody>
          </Cursor>
        </div>
      </Example>
      <Example title="Shared worksheet">
        <div class="rv-demo-cursor-canvas rv-demo-cursor-worksheet">
          <table aria-label="Launch budget">
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Forecast</th>
                <th scope="col">Actual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Research</th>
                <td>$2,100</td>
                <td>$1,950</td>
              </tr>
              <tr>
                <th scope="row">Design</th>
                <td>$4,600</td>
                <td>$4,300</td>
              </tr>
              <tr>
                <th scope="row">Launch</th>
                <td>$3,750</td>
                <td>$3,500</td>
              </tr>
            </tbody>
          </table>
          <Cursor name="Sam" color="#6d28d9" className="rv-demo-cursor-sam" />
          <Cursor name="Alex" color="#047857" className="rv-demo-cursor-alex" />
        </div>
      </Example>
      <Example title="Live collaborator positions">
        <div class="rv-demo-cursor-canvas rv-demo-cursor-live">
          <Button
            className="rv-demo-cursor-board-action"
            onClick={() => setBoardEdits((count) => count + 1)}
          >
            Mark reviewed
          </Button>
          <Cursor
            position={positions[frame]}
            name="Priya"
            color="#0e7490"
            animate
          />
        </div>
        <div class="catalog-row">
          <Button
            onClick={() =>
              setFrame((previous) => (previous + 1) % positions.length)
            }
          >
            Move collaborator
          </Button>
          <output role="status">
            {boardEdits > 0 ? `Reviews marked: ${boardEdits}` : ''}
          </output>
        </div>
      </Example>
    </>
  );
}
