import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it } from 'vitest';
import { EditorActions } from './editor-actions';
const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));
it('localizes individual actions while retaining default labels for unspecified actions', () => {
  act(() =>
    render(
      <EditorActions
        apply={() => {}}
        cancel={() => {}}
        clear={() => {}}
        text={{ apply: 'Speichern' }}
      />,
      host,
    ),
  );
  expect(
    [...host.querySelectorAll('button')].map((button) => button.textContent),
  ).toEqual(['Clear', 'Cancel', 'Speichern']);
});
