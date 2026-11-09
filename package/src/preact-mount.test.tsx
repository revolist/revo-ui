// @vitest-environment happy-dom
import { h } from 'preact';
import { useLayoutEffect } from 'preact/hooks';
import { Window } from 'happy-dom';
import { expect, it, vi } from 'vitest';
import { createPreactElement, releasePreactElement } from './preact-mount';

it('releases effects and refs after a host moves the rendered root', () => {
  const cleanup = vi.fn(),
    ref = vi.fn();
  function View() {
    useLayoutEffect(() => cleanup, []);
    return <button ref={ref}>Close</button>;
  }
  const element = createPreactElement(document, <View />);
  document.body.append(element);
  releasePreactElement(element);
  releasePreactElement(element);
  expect(cleanup).toHaveBeenCalledOnce();
  expect(ref).toHaveBeenLastCalledWith(null);
  expect(element.isConnected).toBe(false);
});

it('renders in an isolated owner document and restores the ambient document', async () => {
  const isolated = new Window();
  const owner = isolated.document as unknown as Document;
  const original = globalThis.document;
  try {
    const element = createPreactElement(
      owner,
      <section>
        <input value="Safe" />
      </section>,
    );
    expect(element.ownerDocument).toBe(owner);
    expect(element.firstChild?.ownerDocument).toBe(owner);
    expect(globalThis.document).toBe(original);
    releasePreactElement(element);
  } finally {
    await isolated.happyDOM.close();
  }
});
