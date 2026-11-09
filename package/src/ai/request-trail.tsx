import { TooltipText } from '../core/tooltip-text';
import type { AiUiTranslations } from './translations';
import { useAiText } from './translation-context';
import { h, type ComponentChildren } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { Button } from '../controls';
import { RemoveButton } from '../buttons/remove-button';
import { createControlId } from '../core/control-id';
import historyIcon from '@fortawesome/fontawesome-free/svgs/solid/clock-rotate-left.svg?raw';
import { SvgIcon } from '../icons/icon';
import { PopoverController } from '../surfaces';

export interface AiRequestTrailItem {
  id: string;
  /** Hide removal when the host cannot safely undo this individual request. */
  removable?: boolean;
  label: string;
  /** Number of earlier requests represented by a grouped step. */
  count?: number;
}
export interface AiRequestTrailProps {
  translations?: AiUiTranslations;
  items: readonly AiRequestTrailItem[];
  onRemove(id: string): void;
  onClear?(): void;
  onEmpty?(): void;
  /** Additional host-owned actions in the steps popup. */
  footer?: ComponentChildren;
  /** Optional application-owned clear action for standalone history presentation. */
  showClear?: boolean;
  disabled?: boolean;
  removalsDisabled?: boolean;
  label?: string;
  triggerLabel?: (count: number) => string;
  clearLabel?: string;
  clearDescription?: string;
  removeLabel?: (item: AiRequestTrailItem) => string;
  countLabel?: (count: number) => string;
  changedMessage?: string;
}

/** Applied context only. The host owns replay, persistence and view mutations. */
export function AiRequestTrail({
  translations,
  items,
  onRemove,
  onClear,
  onEmpty,
  footer,
  showClear = true,
  disabled,
  removalsDisabled,
  label = 'Request history',
  triggerLabel,
  clearLabel = 'Clear all',
  clearDescription,
  removeLabel,
  countLabel,
  changedMessage,
}: AiRequestTrailProps) {
  const t = useAiText(translations);
  const formatCount =
    countLabel ??
    ((count: number) =>
      t(count === 1 ? '{count} applied request' : '{count} applied requests', {
        count,
      }));
  const formatRemove =
    removeLabel ??
    ((item: AiRequestTrailItem) =>
      t('Remove request: {label}', { label: item.label }));
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [panelId] = useState(() => createControlId('rv-ai-steps'));
  const [open, setOpen] = useState(false);
  const hasItems = items.length > 0;
  useLayoutEffect(() => {
    if (!hasItems) setOpen(false);
    if (
      !open ||
      !hasItems ||
      !root.current ||
      !trigger.current ||
      !panel.current
    )
      return;
    const content = panel.current;
    const controller = new PopoverController();
    let active = true;
    controller.open({
      anchor: trigger.current,
      content,
      appendTo: root.current,
      onClose: () => {
        if (active) setOpen(false);
      },
    });
    content.focus({ preventScroll: true });
    return () => {
      active = false;
      controller.destroy();
      content.hidden = true;
    };
  }, [open, hasItems]);
  const pendingFocus = useRef<{
    button: HTMLButtonElement;
    index: number;
    id?: string;
    sawBusy?: boolean;
  }>();
  useLayoutEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    if (disabled) {
      pending.sawBusy = true;
      return;
    }
    if (
      pending.id
        ? items.some((item) => item.id === pending.id)
        : items.length > 0
    ) {
      // An unsuccessful or stale operation must not move focus during a later request.
      if (pending.sawBusy || (pending.id && removalsDisabled))
        pendingFocus.current = undefined;
      return;
    }
    pendingFocus.current = undefined;
    const active = pending.button.ownerDocument.activeElement;
    if (
      active !== pending.button &&
      active !== pending.button.ownerDocument.body
    )
      return;
    const buttons =
      root.current?.querySelectorAll<HTMLButtonElement>('.rv-remove-button');
    if (buttons?.length && open)
      buttons[Math.min(pending.index, buttons.length - 1)]?.focus();
    else if (!items.length) onEmpty?.();
    else if (open) trigger.current?.focus();
  }, [items, onEmpty, disabled, removalsDisabled, open]);
  if (!hasItems) return null;
  let offset = 0;
  const total = items.reduce((sum, item) => sum + (item.count ?? 1), 0);
  return (
    <div
      class="rv-ai-request-trail"
      role="group"
      aria-label={t(label)}
      ref={root}
      onFocusOut={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setOpen(false);
      }}
    >
      <Button
        ref={trigger}
        className="rv-ai-trail-trigger rv-btn-icon"
        variant="ghost"
        size="compact"
        disabled={disabled}
        aria-label={t(label)}
        title={t(label)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        {triggerLabel ? (
          triggerLabel(total)
        ) : (
          <SvgIcon svg={historyIcon} size={16} />
        )}
      </Button>
      <div
        ref={panel}
        id={panelId}
        class="rv-popover rv-ai-trail-popover"
        role="dialog"
        aria-label={t(label)}
        tabIndex={-1}
        hidden={!open}
      >
        <div class="rv-ai-trail-header">
          <span class="rv-ai-trail-label">{t(label)}</span>
        </div>
        <ol class="rv-ai-trail-steps" aria-label={formatCount(total)}>
          {items.map((item, index) => {
            const first = offset + 1;
            offset += item.count ?? 1;
            return (
              <li
                class="rv-ai-step"
                key={item.id}
                data-current={index === items.length - 1 || undefined}
                onFocusCapture={(event) =>
                  event.currentTarget.scrollIntoView({
                    block: 'nearest',
                    inline: 'nearest',
                  })
                }
              >
                <span class="rv-ai-step-chip">
                  <span class="rv-ai-step-number" aria-hidden="true">
                    {first === offset ? first : `${first}–${offset}`}
                  </span>
                  <TooltipText class="rv-ai-step-label" title={item.label}>
                    {item.label}
                  </TooltipText>
                  {item.removable !== false && (
                    <RemoveButton
                      compact
                      disabled={disabled || removalsDisabled}
                      locale={{
                        title: formatRemove(item),
                        ariaLabel: formatRemove(item),
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        pendingFocus.current = {
                          button: event.currentTarget as HTMLButtonElement,
                          index,
                          id: item.id,
                        };
                        onRemove(item.id);
                      }}
                    />
                  )}
                </span>
              </li>
            );
          })}
        </ol>
        {changedMessage && (
          <p class="rv-ai-trail-message">{t(changedMessage)}</p>
        )}
        <div class="rv-ai-trail-footer">
          {footer}
          {showClear && onClear && (
            <Button
              variant="ghost"
              size="compact"
              disabled={disabled}
              title={clearDescription ? t(clearDescription) : undefined}
              onClick={(event) => {
                event.preventDefault();
                pendingFocus.current = {
                  button: event.currentTarget,
                  index: 0,
                };
                onClear?.();
              }}
            >
              {t(clearLabel)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
