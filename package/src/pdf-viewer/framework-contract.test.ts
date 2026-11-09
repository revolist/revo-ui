import { expect, it, vi } from 'vitest';
import { withFrameworkContent } from '../framework-mount';
import { uiComponents } from '../component-catalog';
import { PdfViewerToolbar } from './toolbar';

it('registers the reusable toolbar for generic Angular and Svelte hosts', () => {
  expect(uiComponents.PdfViewerToolbar).toBe(PdfViewerToolbar);
});

it('preserves every PDF toolbar and status callback argument for framework slots', () => {
  const content = vi.fn();
  const controller = {},
    state = { status: 'empty' },
    toolbarProps = { controller, state };
  const props = withFrameworkContent(
    'PdfViewer',
    {},
    { toolbar: 'tools', status: 'status' },
    content,
  );
  props.renderToolbar(controller, state, toolbarProps);
  expect(content).toHaveBeenLastCalledWith('tools', {
    controller,
    state,
    toolbarProps,
  });
  props.renderStatus(state);
  expect(content).toHaveBeenLastCalledWith('status', { state });
});
