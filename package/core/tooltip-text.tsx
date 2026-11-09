/** @jsxImportSource preact */
import { h, type JSX } from 'preact';
import { useTitleTooltip } from './title-tooltip';

/** Wrapper-free shared hint for otherwise native text and label elements. */
export function TooltipText({
  as = 'span',
  title,
  children,
  ...attributes
}: Omit<JSX.HTMLAttributes<HTMLElement>, 'title'> & {
  as?: 'span' | 'label' | 'div';
  title?: string;
}): JSX.Element {
  const ref = useTitleTooltip<HTMLElement>(title);
  return h(as, { ...attributes, ref }, children);
}
