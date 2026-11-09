/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { createPreactElement, releasePreactElement } from '../preact-mount';

export function createDropdownHost(document: Document) {
  let mount!: HTMLDivElement;
  let input!: HTMLInputElement;
  const element = createPreactElement<HTMLDivElement>(
    document,
    <div>
      <div
        style={{ display: 'contents' }}
        ref={(element) => {
          if (element) mount = element;
        }}
      />
      <input
        type="hidden"
        ref={(element) => {
          if (element) input = element;
        }}
      />
    </div>,
  );
  return {
    element,
    mount,
    input,
    release: () => releasePreactElement(element),
  };
}
