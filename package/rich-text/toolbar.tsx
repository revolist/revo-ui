/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { useLayoutEffect, useRef } from 'preact/hooks';
import { IconToolbar, type IconToolbarAction } from '../icon-toolbar';
import type { HtmlEngine, HtmlSelection, HtmlBlock } from './engine';
import type { HtmlEditorText } from './translations';
import bold from '@fortawesome/fontawesome-free/svgs/solid/bold.svg?raw';
import italic from '@fortawesome/fontawesome-free/svgs/solid/italic.svg?raw';
import strike from '@fortawesome/fontawesome-free/svgs/solid/strikethrough.svg?raw';
import code from '@fortawesome/fontawesome-free/svgs/solid/code.svg?raw';
import heading from '@fortawesome/fontawesome-free/svgs/solid/heading.svg?raw';
import one from '@fortawesome/fontawesome-free/svgs/solid/1.svg?raw';
import two from '@fortawesome/fontawesome-free/svgs/solid/2.svg?raw';
import bullets from '@fortawesome/fontawesome-free/svgs/solid/list-ul.svg?raw';
import numbered from '@fortawesome/fontawesome-free/svgs/solid/list-ol.svg?raw';
import quote from '@fortawesome/fontawesome-free/svgs/solid/quote-left.svg?raw';
import codeBlock from '@fortawesome/fontawesome-free/svgs/solid/file-code.svg?raw';
import link from '@fortawesome/fontawesome-free/svgs/solid/link.svg?raw';

export function HtmlToolbar({
  engine,
  selection,
  text,
  showLink,
  onLink,
}: {
  engine: () => HtmlEngine | undefined;
  selection: HtmlSelection;
  text: Required<HtmlEditorText>;
  showLink: boolean;
  onLink: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const active = useRef<string | null>(null);
  const buttons = () => [
    ...(host.current?.querySelectorAll<SVGGElement>(
      '[role="button"]:not([aria-disabled="true"])',
    ) ?? []),
  ];
  const focusButton = (button: SVGGElement) => {
    active.current = button.getAttribute('aria-label');
    for (const item of buttons())
      item.setAttribute('tabindex', item === button ? '0' : '-1');
  };
  useLayoutEffect(() => {
    const items = buttons();
    const next =
      items.find(
        (item) => item.getAttribute('aria-label') === active.current,
      ) ?? items[0];
    if (next) focusButton(next);
  });
  type Action = IconToolbarAction & { run: () => void };
  const mark = (
    id: 'bold' | 'italic' | 'strikethrough' | 'code',
    label: string,
    icon: string,
  ): Action => ({
    id,
    label,
    icon,
    pressed: selection.formats.includes(id),
    disabled: selection.block === 'code',
    run: () => engine()?.format(id),
  });
  const block = (
    id: HtmlBlock,
    label: string,
    icon: string,
    suffixIcon?: string,
  ): Action => ({
    id,
    label,
    icon,
    suffixIcon,
    pressed: selection.block === id,
    run: () => engine()?.block(selection.block === id ? 'paragraph' : id),
  });
  const panels: { label: string; actions: Action[] }[] = [
    {
      label: text.inlineFormatting,
      actions: [
        mark('bold', text.bold, bold),
        mark('italic', text.italic, italic),
        mark('strikethrough', text.strike, strike),
        mark('code', text.code, code),
      ],
    },
    {
      label: text.headings,
      actions: [
        block('h1', text.heading1, heading, one),
        block('h2', text.heading2, heading, two),
      ],
    },
    {
      label: text.structure,
      actions: [
        block('bullet', text.bullets, bullets),
        block('ordered', text.numberedList, numbered),
        block('quote', text.quote, quote),
        block('code', text.codeBlock, codeBlock),
      ],
    },
    {
      label: text.links,
      actions: [
        {
          id: 'link',
          label: text.link,
          icon: link,
          pressed: showLink || selection.link,
          disabled: selection.block === 'code',
          run: onLink,
        },
      ],
    },
  ];
  return (
    <div
      ref={host}
      class="rv-rich-text-editor__toolbar"
      role="toolbar"
      aria-label={text.formatting}
      onMouseDown={(event) => {
        if ((event.target as Element).closest('[role="button"]'))
          event.preventDefault();
      }}
      onFocusCapture={(event) => {
        if (
          event.target instanceof SVGElement &&
          event.target.matches('[role="button"]')
        )
          focusButton(event.target as SVGGElement);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          engine()?.focus();
          return;
        }
        if (
          !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
        const items = buttons(),
          index = items.indexOf(event.target as SVGGElement);
        if (index < 0 || !items.length) return;
        event.preventDefault();
        event.stopPropagation();
        const rtl = getComputedStyle(host.current!).direction === 'rtl';
        const step = (event.key === 'ArrowRight') !== rtl ? 1 : -1;
        const next =
          event.key === 'Home'
            ? items[0]
            : event.key === 'End'
              ? items.at(-1)!
              : items[(index + step + items.length) % items.length];
        next.focus();
      }}
    >
      {panels.map((panel) => (
        <IconToolbar
          key={panel.label}
          label={panel.label}
          actions={panel.actions}
          onEscape={() => engine()?.focus()}
          onAction={(id) =>
            panel.actions.find((action) => action.id === id)?.run()
          }
        />
      ))}
    </div>
  );
}
