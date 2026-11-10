/** @jsxImportSource preact */
import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import { useTooltip, ControlTooltip } from './tooltip';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { Tooltip } from '../pickers';
import { TooltipController } from './popover-controller';
import { createTooltipGroup } from './tooltip-options';

const controllers: TooltipController[] = [];
const host = document.createElement('div');
function bind(
  text = 'Details',
  options: Parameters<TooltipController['bind']>[2] = {},
) {
  const anchor = document.createElement('button');
  document.body.append(anchor);
  const controller = new TooltipController();
  controllers.push(controller);
  controller.bind(anchor, text, options);
  return { anchor, controller };
}
function pointer(target: Element, type: string) {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true }));
}
afterEach(() => {
  act(() => render(null, host));
  controllers.splice(0).forEach((controller) => controller.destroy());
  document.body.replaceChildren();
  document.documentElement.removeAttribute('data-rv-ui-motion');
  vi.useRealTimers();
});
it('supports rich content and updates an open popup without rebinding the trigger', () => {
  document.body.append(host);
  act(() =>
    render(
      <Tooltip content={<strong>Rich details</strong>} side="right" arrow>
        <button>Help</button>
      </Tooltip>,
      host,
    ),
  );
  const anchor = host.querySelector('button')!;
  act(() => anchor.focus());
  let popup = document.querySelector<HTMLElement>('.rv-tooltip:not([hidden])')!;
  expect(popup.querySelector('strong')?.textContent).toBe('Rich details');
  expect(popup.dataset.arrow).toBe('true');
  act(() =>
    render(
      <Tooltip content={<strong>Updated details</strong>} side="right" arrow>
        <button>Help</button>
      </Tooltip>,
      host,
    ),
  );
  expect(host.querySelector('button')).toBe(anchor);
  expect(popup.querySelector('strong')?.textContent).toBe('Updated details');
});
it('requests controlled changes, obeys the supplied state and reports reasons', () => {
  document.body.append(host);
  const change = vi.fn();
  const view = (open: boolean) => (
    <Tooltip text="Controlled" open={open} onOpenChange={change}>
      <button>Help</button>
    </Tooltip>
  );
  act(() => render(view(false), host));
  const anchor = host.querySelector('button')!;
  act(() => anchor.focus());
  expect(change).toHaveBeenCalledWith(
    true,
    expect.objectContaining({ target: anchor, reason: 'focus' }),
  );
  expect(document.querySelector('.rv-tooltip:not([hidden])')).toBeNull();
  act(() => render(view(true), host));
  const popup = document.querySelector<HTMLElement>(
    '.rv-tooltip:not([hidden])',
  )!;
  act(() =>
    anchor.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(change).toHaveBeenLastCalledWith(
    false,
    expect.objectContaining({ reason: 'escape' }),
  );
  expect(popup.hidden).toBe(false);
  act(() => render(view(false), host));
  expect(popup.hidden).toBe(true);
});
it('can cancel an opening request and suppress disabled triggers', () => {
  const before = vi.fn(() => false),
    shown = vi.fn();
  const { anchor, controller } = bind('Blocked', {
    onBeforeOpenChange: before,
    onShow: shown,
  });
  pointer(anchor, 'pointerenter');
  expect(controller.isOpen).toBe(false);
  expect(shown).not.toHaveBeenCalled();
  controller.update({ disabled: true });
  pointer(anchor, 'pointerenter');
  expect(controller.isOpen).toBe(false);
  controller.update({});
  pointer(anchor, 'pointerenter');
  expect(controller.isOpen).toBe(true);
});
it('shares warm-up delay and honors close delay without global timers', () => {
  vi.useFakeTimers();
  const group = createTooltipGroup({
    delay: 600,
    closeDelay: 100,
    skipDelayDuration: 400,
  });
  const a = bind('A', { group }),
    b = bind('B', { group });
  pointer(a.anchor, 'pointerenter');
  vi.advanceTimersByTime(599);
  expect(a.controller.isOpen).toBe(false);
  vi.advanceTimersByTime(1);
  expect(a.controller.isOpen).toBe(true);
  pointer(b.anchor, 'pointerenter');
  expect(b.controller.isOpen).toBe(true);
  expect(a.controller.isOpen).toBe(false);
  pointer(b.anchor, 'pointerleave');
  vi.advanceTimersByTime(99);
  expect(b.controller.isOpen).toBe(true);
  vi.advanceTimersByTime(1);
  expect(b.controller.isOpen).toBe(false);
  pointer(a.anchor, 'pointerenter');
  expect(a.controller.isOpen).toBe(true);
  a.controller.destroy();
  b.controller.destroy();
  expect(vi.getTimerCount()).toBe(0);
});
it('uses one delegated surface for dynamically inserted triggers and nested event targets', () => {
  const root = document.createElement('section');
  document.body.append(root);
  const controller = new TooltipController();
  controllers.push(controller);
  controller.bind(root, '', {
    filter: '[data-hint]',
    renderContent: (context) => context.target.getAttribute('data-hint'),
  });
  const button = document.createElement('button'),
    nested = document.createElement('span');
  button.dataset.hint = 'First';
  button.append(nested);
  root.append(button);
  pointer(nested, 'pointerover');
  expect(controller.target()).toBe(button);
  expect(controller.element?.textContent).toBe('First');
  const second = document.createElement('button');
  second.dataset.hint = 'Second';
  root.append(second);
  pointer(second, 'pointerover');
  expect(controller.target()).toBe(second);
  expect(controller.element?.textContent).toBe('Second');
  expect(document.querySelectorAll('.rv-tooltip:not([hidden])')).toHaveLength(
    1,
  );
  expect(button.hasAttribute('aria-describedby')).toBe(false);
});
it('exposes imperative show/hide/toggle/refresh and removes kept surfaces on destroy', () => {
  const { anchor, controller } = bind('Initial', {
    trigger: 'manual',
    keepMounted: true,
  });
  anchor.focus();
  pointer(anchor, 'pointerenter');
  expect(controller.isOpen).toBe(false);
  controller.show();
  expect(controller.target()).toBe(anchor);
  expect(controller.element?.textContent).toBe('Initial');
  controller.setContent(<em>Updated</em>);
  controller.refresh();
  expect(controller.element?.querySelector('em')?.textContent).toBe('Updated');
  controller.toggle();
  const popup = controller.element!;
  expect(popup.hidden).toBe(true);
  expect(popup.isConnected).toBe(true);
  controller.toggle();
  expect(controller.isOpen).toBe(true);
  controller.destroy();
  expect(popup.isConnected).toBe(false);
  expect(anchor.hasAttribute('aria-describedby')).toBe(false);
});
it('aborts loaders on target changes and ignores stale results and post-destroy failures', async () => {
  let first!: (text: string) => void, second!: (text: string) => void;
  const loaded = vi.fn(),
    errors = vi.fn();
  const signals: AbortSignal[] = [];
  const { anchor, controller } = bind('', {
    trigger: 'manual',
    loadingContent: 'Loading',
    loadContent: (context) => {
      signals.push(context.signal);
      return new Promise((resolve) => {
        if (signals.length === 1) first = resolve;
        else second = resolve;
      });
    },
    onContentLoad: loaded,
    onError: errors,
  });
  controller.show();
  await Promise.resolve();
  expect(controller.element?.getAttribute('aria-busy')).toBe('true');
  controller.hide();
  expect(signals[0].aborted).toBe(true);
  controller.show(anchor);
  await Promise.resolve();
  first('Stale');
  await Promise.resolve();
  await Promise.resolve();
  expect(controller.element?.textContent).toBe('Loading');
  second('Current');
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  expect(controller.element?.textContent).toBe('Current');
  expect(loaded).toHaveBeenCalledOnce();
  expect(errors).not.toHaveBeenCalled();
  controller.destroy();
});
it('reports load failures with caller-supplied error content', async () => {
  const error = new Error('Offline'),
    onError = vi.fn();
  const { controller } = bind('', {
    trigger: 'manual',
    loadContent: async () => {
      throw error;
    },
    errorContent: 'Try again later',
    onError,
  });
  controller.show();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  expect(controller.element?.textContent).toBe('Try again later');
  expect(onError).toHaveBeenCalledWith(
    error,
    expect.objectContaining({ reason: 'imperative' }),
  );
});
it('supports detached anchors, initially open content and mounted cleanup', () => {
  document.body.append(host);
  const anchor = document.createElement('button');
  document.body.append(anchor);
  act(() =>
    render(<Tooltip anchor={anchor} defaultOpen text="Detached" />, host),
  );
  const popup = document.querySelector<HTMLElement>(
    '.rv-tooltip:not([hidden])',
  )!;
  expect(popup.textContent).toBe('Detached');
  expect(anchor.getAttribute('aria-describedby')).toBe(popup.id);
  act(() => render(null, host));
  expect(popup.isConnected).toBe(false);
  expect(anchor.hasAttribute('aria-describedby')).toBe(false);
});
it('finishes transitions, cancels them on destruction and respects reduced motion policy', () => {
  vi.useFakeTimers();
  const complete = vi.fn();
  const { controller } = bind('Animated', {
    trigger: 'manual',
    transitionDuration: 100,
    onOpenChangeComplete: complete,
  });
  controller.show();
  expect(controller.element?.dataset.state).toBe('opening');
  vi.advanceTimersByTime(100);
  expect(complete).toHaveBeenCalledWith(true, expect.anything());
  controller.hide();
  expect(controller.element?.dataset.state).toBe('closing');
  vi.advanceTimersByTime(100);
  expect(controller.element?.hidden).toBe(true);
  document.documentElement.setAttribute('data-rv-ui-motion', 'off');
  controller.show();
  expect(controller.element?.dataset.state).toBe('open');
  controller.hide();
  expect(controller.element?.hidden).toBe(true);
  controller.destroy();
  expect(vi.getTimerCount()).toBe(0);
});

it('keeps a click hook open while the host click updates state', () => {
  document.body.append(host);
  function View() {
    const [clicks, setClicks] = useState(0);
    const hint = useTooltip('Click description', true, { trigger: 'click' });
    return (
      <>
        <button
          id="update-host"
          onClick={() => setClicks((value) => value + 1)}
        >
          Update host
        </button>
        <button
          id="hook-trigger"
          onClick={() => setClicks((value) => value + 1)}
          {...hint.triggerProps}
        >
          Help {clicks}
        </button>
        {hint.tooltip}
      </>
    );
  }
  act(() => render(<View />, host));
  act(() => host.querySelector<HTMLButtonElement>('#update-host')!.click());
  act(() => host.querySelector<HTMLButtonElement>('#hook-trigger')!.click());
  expect(host.querySelector('#hook-trigger')?.textContent).toBe('Help 2');
  expect(document.querySelector<HTMLElement>('[role="tooltip"]')?.hidden).toBe(
    false,
  );
});

it('replaces native node content with text and preserves other trigger descriptions', () => {
  const { anchor, controller } = bind();
  anchor.setAttribute('aria-describedby', 'existing-help');
  const node = document.createElement('strong');
  node.textContent = 'Native content';
  controller.setContent(node);
  controller.show();
  expect(controller.element?.textContent).toBe('Native content');
  controller.setContent('New text');
  expect(controller.element?.textContent).toBe('New text');
  expect(node.isConnected).toBe(false);
  controller.hide();
  expect(anchor.getAttribute('aria-describedby')).toBe('existing-help');
});

it('mounts inside a shadow portal and restores descriptions and kept surfaces on teardown', () => {
  const portalHost = document.createElement('div');
  document.body.append(portalHost);
  const portal = portalHost.attachShadow({ mode: 'open' });
  const { anchor, controller } = bind('Shadow details', {
    appendTo: portal,
    keepMounted: true,
  });
  controller.show();
  const popup = controller.element!;
  expect(popup.parentNode).toBe(portal);
  expect(portal.querySelectorAll('style[data-rv-tooltip-styles]')).toHaveLength(
    1,
  );
  controller.hide();
  expect(popup.hidden).toBe(true);
  expect(popup.parentNode).toBe(portal);
  controller.destroy();
  expect(popup.isConnected).toBe(false);
  expect(anchor.hasAttribute('aria-describedby')).toBe(false);
});
it('restores delegated click trigger attributes without marking the container expanded', () => {
  const root = document.createElement('section');
  const first = document.createElement('button'),
    second = document.createElement('button');
  first.dataset.hint = second.dataset.hint = '';
  first.setAttribute('aria-expanded', 'mixed');
  root.append(first, second);
  document.body.append(root);
  const controller = new TooltipController();
  controllers.push(controller);
  controller.bind(root, 'Details', { filter: '[data-hint]', trigger: 'click' });
  first.click();
  expect(first.getAttribute('aria-expanded')).toBe('true');
  second.click();
  expect(first.getAttribute('aria-expanded')).toBe('false');
  expect(second.getAttribute('aria-expanded')).toBe('true');
  expect(root.hasAttribute('aria-expanded')).toBe(false);
  controller.destroy();
  expect(first.getAttribute('aria-expanded')).toBe('mixed');
  expect(second.hasAttribute('aria-expanded')).toBe(false);
});

it('does not cancel close delay when hoverable content is disabled', () => {
  vi.useFakeTimers();
  const { anchor, controller } = bind('Details', {
    closeDelay: 100,
    disableHoverablePopup: true,
  });
  pointer(anchor, 'pointerenter');
  pointer(anchor, 'pointerleave');
  pointer(controller.element!, 'pointerenter');
  vi.advanceTimersByTime(100);
  expect(controller.isOpen).toBe(false);
});

it('opens an untouched manual hook trigger through show without taking focus', () => {
  document.body.append(host);
  let show!: () => void;
  function View() {
    const hint = useTooltip('Manual description', true, { trigger: 'manual' });
    show = hint.show;
    return (
      <>
        <button {...hint.triggerProps}>Untouched help</button>
        {hint.tooltip}
      </>
    );
  }
  act(() => render(<View />, host));
  const trigger = host.querySelector('button')!;
  act(() => show());
  expect(document.querySelector<HTMLElement>('[role="tooltip"]')?.hidden).toBe(
    false,
  );
  expect(document.activeElement).not.toBe(trigger);
});

for (const timing of ['delay', 'group', 'both'] as const) {
  it(`click controller bypasses ${timing} hover timing and toggles immediately`, () => {
    vi.useFakeTimers();
    const { anchor, controller } = bind('Click details', {
      trigger: 'click',
      ...(timing !== 'group' ? { delay: 1000 } : {}),
      ...(timing !== 'delay'
        ? { group: createTooltipGroup({ delay: 600 }) }
        : {}),
    });
    anchor.click();
    expect(controller.isOpen).toBe(true);
    anchor.click();
    expect(controller.isOpen).toBe(false);
    vi.advanceTimersByTime(1200);
    expect(controller.isOpen).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
}

it('click hook bypasses group and explicit hover timing while preserving host activation', () => {
  vi.useFakeTimers();
  document.body.append(host);
  const clicked = vi.fn();
  const group = createTooltipGroup({ delay: 600 });
  function View() {
    const hint = useTooltip('Click description', true, {
      trigger: 'click',
      delay: 1000,
      group,
    });
    return (
      <>
        <button {...hint.triggerProps} onClick={clicked}>
          Click help
        </button>
        {hint.tooltip}
      </>
    );
  }
  act(() => render(<View />, host));
  const trigger = host.querySelector('button')!;
  act(() => trigger.click());
  const popup = document.querySelector<HTMLElement>('[role="tooltip"]')!;
  expect(popup.hidden).toBe(false);
  act(() => trigger.click());
  expect(popup.hidden).toBe(true);
  expect(clicked).toHaveBeenCalledTimes(2);
  vi.advanceTimersByTime(1200);
  expect(popup.hidden).toBe(true);
});

for (const delegated of [false, true])
  for (const grouped of [false, true]) {
    it(`preserves ${grouped ? 'group' : 'explicit'} opening delay across ${delegated ? 'delegated' : 'direct'} trigger descendants`, () => {
      vi.useFakeTimers();
      const root = document.createElement('div');
      const trigger = document.createElement('button');
      const first = document.createElement('span'),
        second = document.createElement('span');
      trigger.dataset.hint = 'Details';
      trigger.append(first, second);
      root.append(trigger);
      document.body.append(root);
      const controller = new TooltipController();
      controllers.push(controller);
      controller.bind(delegated ? root : trigger, 'Details', {
        ...(delegated ? { filter: '[data-hint]' } : {}),
        ...(grouped
          ? { group: createTooltipGroup({ delay: 600 }) }
          : { delay: 600 }),
      });
      const type = delegated ? 'pointerover' : 'pointerenter';
      trigger.dispatchEvent(
        new PointerEvent(type, {
          bubbles: delegated,
          relatedTarget: document.body,
        }),
      );
      vi.advanceTimersByTime(300);
      first.dispatchEvent(
        new PointerEvent(type, { bubbles: delegated, relatedTarget: trigger }),
      );
      vi.advanceTimersByTime(200);
      second.dispatchEvent(
        new PointerEvent(type, { bubbles: delegated, relatedTarget: first }),
      );
      vi.advanceTimersByTime(100);
      expect(controller.isOpen).toBe(true);
      expect(controller.target()).toBe(trigger);
      controller.destroy();
      expect(vi.getTimerCount()).toBe(0);
    });
  }

for (const initiallyDisabled of [false, true]) {
  it(`controlled surface follows visible state when re-enabled (initial disabled=${initiallyDisabled})`, () => {
    document.body.append(host);
    const anchor = document.createElement('button');
    document.body.append(anchor);
    const view = (disabled: boolean) => (
      <ControlTooltip
        id="controlled-surface"
        text="Surface details"
        visible
        anchor={anchor}
        disabled={disabled}
      />
    );
    act(() => render(view(initiallyDisabled), host));
    const popup = host.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(popup.hidden).toBe(initiallyDisabled);
    act(() => render(view(true), host));
    expect(popup.hidden).toBe(true);
    act(() => render(view(false), host));
    expect(popup.hidden).toBe(false);
    expect(anchor.getAttribute('aria-describedby')).toBe('controlled-surface');
    act(() => render(view(true), host));
    expect(popup.hidden).toBe(true);
    expect(anchor.hasAttribute('aria-describedby')).toBe(false);
  });
}

it('keeps an open uncontrolled tooltip open when its external anchor changes', () => {
  document.body.append(host);
  const first = document.createElement('button'),
    second = document.createElement('button');
  document.body.append(first, second);
  const view = (anchor: HTMLElement) => (
    <Tooltip anchor={anchor} defaultOpen text="Moved details" />
  );
  act(() => render(view(first), host));
  expect(first.hasAttribute('aria-describedby')).toBe(true);
  act(() => render(view(second), host));
  expect(first.hasAttribute('aria-describedby')).toBe(false);
  const popup = document.querySelector<HTMLElement>(
    '.rv-tooltip:not([hidden])',
  );
  expect(popup?.textContent).toBe('Moved details');
  expect(second.getAttribute('aria-describedby')).toBe(popup?.id);
});

it('aborts a removed loader and restores local content without stale completion callbacks', async () => {
  let signal!: AbortSignal, resolve!: (value: string) => void;
  const loaded = vi.fn();
  const { controller } = bind('Local content', {
    trigger: 'manual',
    loadingContent: 'Loading',
    onContentLoad: loaded,
    loadContent: (context) => {
      signal = context.signal;
      return new Promise((done) => {
        resolve = done;
      });
    },
  });
  controller.show();
  await Promise.resolve();
  controller.update({ trigger: 'manual', onContentLoad: loaded });
  expect(signal.aborted).toBe(true);
  expect(controller.element?.textContent).toBe('Local content');
  resolve('Obsolete server content');
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  expect(controller.element?.textContent).toBe('Local content');
  expect(loaded).not.toHaveBeenCalled();
  expect(controller.element?.hasAttribute('aria-busy')).toBe(false);
});

it('generates an accessible description ID for a caller-supplied surface', () => {
  const surface = document.createElement('div');
  const { anchor, controller } = bind('Supplied details', { surface });
  controller.show();
  expect(surface.id).not.toBe('');
  expect(anchor.getAttribute('aria-describedby')).toBe(surface.id);
  controller.hide();
  expect(anchor.hasAttribute('aria-describedby')).toBe(false);
});

it('does not remove native content that the application has moved out of the tooltip', () => {
  const { controller } = bind();
  const node = document.createElement('strong');
  node.textContent = 'Shared node';
  controller.setContent(node);
  controller.show();
  const applicationHost = document.createElement('section');
  document.body.append(applicationHost);
  applicationHost.append(node);
  controller.setContent('Replacement');
  expect(applicationHost.firstChild).toBe(node);
  expect(controller.element?.textContent).toBe('Replacement');
});

it('preserves native fragment content on refresh and replaces all owned children', () => {
  const { controller } = bind();
  const fragment = document.createDocumentFragment();
  const first = document.createElement('strong');
  first.textContent = 'Fragment title';
  fragment.append(first, document.createTextNode(' and details'));
  controller.setContent(fragment);
  controller.show();
  expect(controller.element?.textContent).toBe('Fragment title and details');
  controller.refresh();
  expect(controller.element?.textContent).toBe('Fragment title and details');
  controller.setContent('Replacement');
  expect(controller.element?.textContent).toBe('Replacement');
  expect(first.isConnected).toBe(false);
});

for (const kind of ['textarea', 'select', 'summary', 'contenteditable']) {
  it(`describes the actual ${kind} trigger rather than its wrapper`, () => {
    document.body.append(host);
    const child =
      kind === 'summary' ? (
        <details open>
          <summary>Details</summary>
        </details>
      ) : kind === 'contenteditable' ? (
        <div contentEditable>Editable</div>
      ) : (
        h(kind, {}, kind === 'select' ? <option>Choice</option> : null)
      );
    act(() =>
      render(<Tooltip text="Native control details">{child}</Tooltip>, host),
    );
    const trigger = host.querySelector<HTMLElement>(
      kind === 'contenteditable' ? '[contenteditable]' : kind,
    )!;
    act(() => trigger.focus());
    const popup = document.querySelector<HTMLElement>(
      '.rv-tooltip:not([hidden])',
    );
    expect(popup).not.toBeNull();
    expect(trigger.getAttribute('aria-describedby')).toBe(popup!.id);
    expect(
      host
        .querySelector('.rv-tooltip-anchor')
        ?.hasAttribute('aria-describedby'),
    ).toBe(false);
  });
}

it('closes controlled surfaces with callbacks and exit motion, reserving silent cleanup for unmount', () => {
  vi.useFakeTimers();
  document.body.append(host);
  const anchor = document.createElement('button');
  document.body.append(anchor);
  const onHide = vi.fn(),
    complete = vi.fn();
  const view = (visible: boolean) => (
    <ControlTooltip
      id="transition-surface"
      text="Details"
      visible={visible}
      anchor={anchor}
      transitionDuration={100}
      onHide={onHide}
      onOpenChangeComplete={complete}
    />
  );
  act(() => render(view(true), host));
  act(() => vi.advanceTimersByTime(100));
  const popup = host.querySelector<HTMLElement>('[role="tooltip"]')!;
  act(() => render(view(false), host));
  expect(onHide).toHaveBeenCalledWith(
    expect.objectContaining({ reason: 'controlled', target: anchor }),
  );
  expect(popup.dataset.state).toBe('closing');
  expect(popup.hidden).toBe(false);
  expect(complete).not.toHaveBeenCalledWith(false, expect.anything());
  act(() => vi.advanceTimersByTime(100));
  expect(popup.hidden).toBe(true);
  expect(complete).toHaveBeenCalledWith(
    false,
    expect.objectContaining({ reason: 'controlled' }),
  );
  act(() => render(view(true), host));
  onHide.mockClear();
  complete.mockClear();
  act(() => render(null, host));
  act(() => vi.advanceTimersByTime(200));
  expect(onHide).not.toHaveBeenCalled();
  expect(complete).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it('normalizes numeric styles as JSX lengths while preserving unitless values and custom properties', () => {
  const { controller } = bind('Styled details', {
    style: {
      padding: 12,
      fontSize: 14,
      borderRadius: 9,
      lineHeight: 1.5,
      opacity: 0.9,
      zIndex: 1234,
      '--custom-value': 3,
    },
  });
  controller.show();
  const style = controller.element!.style;
  expect(style.padding).toBe('12px');
  expect(style.fontSize).toBe('14px');
  expect(style.borderRadius).toBe('9px');
  expect(style.lineHeight).toBe('1.5');
  expect(style.opacity).toBe('0.9');
  expect(style.zIndex).toBe('1234');
  expect(style.getPropertyValue('--custom-value')).toBe('3');
  controller.update({ style: { padding: 4 } });
  expect(style.padding).toBe('4px');
  expect(style.fontSize).toBe('');
  expect(style.getPropertyValue('--custom-value')).toBe('');
});
