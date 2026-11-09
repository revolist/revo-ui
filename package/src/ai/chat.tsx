import { h, toChildArray, type ComponentChildren, type JSX } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { Button, Disclosure, IconButton, Spinner } from '../controls';
import { SvgIcon } from '../icons';
import checkIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-check.svg?raw';
import errorIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-xmark.svg?raw';
import clockIcon from '@fortawesome/fontawesome-free/svgs/regular/clock.svg?raw';
import cancelledIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-stop.svg?raw';
import chevronIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-down.svg?raw';
import arrowDownIcon from '@fortawesome/fontawesome-free/svgs/solid/arrow-down.svg?raw';
import { AiPromptInput, type AiPromptInputProps } from './components';
import { useAiText } from './translation-context';
import type { AiUiTranslations } from './translations';

export interface AiChatPartProps {
  children?: ComponentChildren;
  className?: string;
  translations?: AiUiTranslations;
}
export interface AiChatProps extends AiChatPartProps {
  label?: string;
  style?: JSX.CSSProperties;
}
/** Presentation only. The host owns transcript, provider, actions and persistence. */
export function AiChat({
  children,
  className = '',
  label = 'AI chat',
  style,
  translations,
}: AiChatProps) {
  const t = useAiText(translations);
  return (
    <section
      class={`rv-ai-chat ${className}`}
      aria-label={t(label)}
      style={style}
    >
      {children}
    </section>
  );
}
export interface AiChatContentProps extends AiChatPartProps {
  label?: string;
  /** Follow updates only while the reader remains at the live edge. */
  autoScroll?: boolean;
  busy?: boolean;
  jumpLabel?: string;
}
/** Scroll measurement belongs to this visual viewport, never to a grid/data owner. */
export function AiChatContent({
  children,
  className = '',
  autoScroll = true,
  busy = false,
  label = 'Conversation messages',
  jumpLabel = 'Jump to latest',
  translations,
}: AiChatContentProps) {
  const t = useAiText(translations);
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const following = useRef(autoScroll);
  const [behind, setBehind] = useState(false);
  const measure = () => {
    const el = viewport.current;
    if (!el) return;
    const atEnd = el.scrollHeight - el.clientHeight - el.scrollTop <= 40;
    following.current = atEnd;
    setBehind(!atEnd);
  };
  const jump = () => {
    const el = viewport.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    following.current = true;
    setBehind(false);
  };
  const update = () => {
    if (autoScroll && following.current) jump();
    else {
      const el = viewport.current;
      if (el) setBehind(el.scrollHeight - el.clientHeight - el.scrollTop > 40);
    }
  };
  useLayoutEffect(update, [children, autoScroll]);
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    if (viewport.current) observer.observe(viewport.current);
    if (content.current) observer.observe(content.current);
    return () => observer.disconnect();
  }, [autoScroll]);
  return (
    <div class={`rv-ai-chat-scroll ${className}`}>
      <div
        ref={viewport}
        class="rv-ai-chat-viewport"
        role="log"
        aria-label={t(label)}
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={busy || undefined}
        tabIndex={0}
        onScroll={measure}
      >
        <div ref={content} class="rv-ai-chat-content">
          {children}
        </div>
      </div>
      {behind && (
        <IconButton
          className="rv-ai-chat-jump"
          label={t(jumpLabel)}
          icon={arrowDownIcon}
          variant="default"
          size="compact"
          onClick={jump}
        />
      )}
    </div>
  );
}
export interface AiChatEmptyStateProps extends AiChatPartProps {
  title?: string;
  description?: string;
  /** Framework-owned image/text content. Return cleanup for listeners or mounted views. */
  renderContent?(host: HTMLElement): void | (() => void);
}
export function AiChatEmptyState({
  title = 'Start a conversation',
  description = 'Ask a question to get started.',
  children,
  className = '',
  translations,
  renderContent,
}: AiChatEmptyStateProps) {
  const t = useAiText(translations);
  const host = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = host.current;
    if (!element || !renderContent) return;
    const dispose = renderContent(element);
    return () => {
      dispose?.();
      element.replaceChildren();
    };
  }, [renderContent]);
  return (
    <div class={`rv-ai-chat-empty ${className}`}>
      {title && <strong>{t(title)}</strong>}
      {description && <p>{t(description)}</p>}
      {children}
      {renderContent && <div ref={host} class="rv-ai-chat-empty-slot" />}
    </div>
  );
}
/** Existing composer behavior, with chat-specific defaults. */
export function AiChatComposer(props: AiPromptInputProps) {
  return (
    <div class="rv-ai-chat-composer">
      <AiPromptInput label="Message" placeholder="Type a message…" {...props} />
    </div>
  );
}
export interface AiMessageProps extends AiChatPartProps {
  from: 'user' | 'assistant' | 'system';
  label?: string;
  isStreaming?: boolean;
}
export function AiMessage({
  from,
  label,
  isStreaming = false,
  children,
  className = '',
  translations,
}: AiMessageProps) {
  const t = useAiText(translations);
  return (
    <article
      class={`rv-ai-message rv-ai-message--${from} ${className}`}
      aria-label={t(
        label ??
          { user: 'You', assistant: 'Assistant', system: 'System' }[from],
      )}
      aria-busy={isStreaming || undefined}
      data-streaming={isStreaming || undefined}
    >
      {children}
    </article>
  );
}
/** Text stays text. Hosts can supply their own trusted Markdown renderer as children. */
export function AiMessageContent({
  children,
  className = '',
}: AiChatPartProps) {
  return <div class={`rv-ai-message-content ${className}`}>{children}</div>;
}
export interface AiMessageActionsProps extends AiChatPartProps {
  label?: string;
}
export function AiMessageActions({
  children,
  className = '',
  label = 'Message actions',
  translations,
}: AiMessageActionsProps) {
  const t = useAiText(translations);
  return (
    <div
      class={`rv-ai-message-actions ${className}`}
      role="group"
      aria-label={t(label)}
    >
      {children}
    </div>
  );
}
export type AiTaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'error'
  | 'cancelled';
const statusLabels: Record<AiTaskStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  error: 'Failed',
  cancelled: 'Cancelled',
};
function TaskIcon({ status }: { status: AiTaskStatus }) {
  return (
    <span class="rv-ai-task-icon" data-status={status} aria-hidden="true">
      {status === 'running' ? (
        <Spinner label="" />
      ) : (
        <SvgIcon
          svg={
            status === 'completed'
              ? checkIcon
              : status === 'error'
                ? errorIcon
                : status === 'cancelled'
                  ? cancelledIcon
                  : clockIcon
          }
        />
      )}
    </span>
  );
}
export interface AiTaskProps extends AiChatPartProps {
  title: string;
  status?: AiTaskStatus;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
}
/** Native disclosure shared by task and published reasoning summaries. */
function AiTrace({
  title,
  status = 'completed',
  open,
  defaultOpen,
  onOpenChange,
  children,
  className = '',
  translations,
}: AiTaskProps) {
  const t = useAiText(translations);
  const [manualOpen, setManualOpen] = useState(defaultOpen);
  const expanded = open ?? manualOpen ?? status === 'running';
  // Some DOM implementations emit toggle during prop reconciliation, before the new handler is attached.
  const state = useRef({ expanded, open, onOpenChange });
  state.current = { expanded, open, onOpenChange };
  const hasContent = toChildArray(children).some(
    (child) => typeof child !== 'string' || child.trim().length > 0,
  );
  const heading = (
    <span class="rv-ai-trace-heading">
      <TaskIcon status={status} />
      <span>{title}</span>
      <span class="rv-visually-hidden">{t(statusLabels[status])}</span>
      {hasContent && (
        <span class="rv-ai-trace-chevron" aria-hidden="true">
          <SvgIcon svg={chevronIcon} size={8} />
        </span>
      )}
    </span>
  );
  if (!hasContent)
    return (
      <div class={`rv-ai-trace rv-ai-trace-line ${className}`}>{heading}</div>
    );
  return (
    <Disclosure
      className={`rv-ai-trace ${className}`}
      open={expanded}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        const current = state.current;
        // Native toggle also fires for prop updates: only a divergent state is a user choice.
        if (next === current.expanded) return;
        if (current.open === undefined) setManualOpen(next);
        else event.currentTarget.open = current.expanded;
        current.onOpenChange?.(next);
      }}
      summary={heading}
    >
      <div class="rv-ai-trace-content">{children}</div>
    </Disclosure>
  );
}
export function AiTask(props: AiTaskProps) {
  return <AiTrace {...props} />;
}
export interface AiTaskItemProps extends AiChatPartProps {
  status?: AiTaskStatus;
}
export function AiTaskItem({
  status = 'completed',
  children,
  className = '',
  translations,
}: AiTaskItemProps) {
  const t = useAiText(translations);
  return (
    <div class={`rv-ai-task-item ${className}`}>
      <TaskIcon status={status} />
      <span class="rv-visually-hidden">{t(statusLabels[status])}: </span>
      <div>{children}</div>
    </div>
  );
}
export interface AiReasoningProps extends Omit<
  AiTaskProps,
  'title' | 'status'
> {
  title?: string;
  isStreaming?: boolean;
  /** Host-supplied elapsed seconds; no hidden timer or invented reasoning. */
  duration?: number;
}
/** Render only reasoning/summary text explicitly supplied by the host or provider. */
export function AiReasoning({
  title,
  isStreaming = false,
  duration,
  children,
  translations,
  ...props
}: AiReasoningProps) {
  const t = useAiText(translations);
  const elapsed =
    typeof duration === 'number' && Number.isFinite(duration) && duration >= 0
      ? ` · ${t('{seconds}s', { seconds: Math.round(duration) })}`
      : '';
  return (
    <AiTrace
      {...props}
      translations={translations}
      status={isStreaming ? 'running' : 'completed'}
      title={`${t(title ?? (isStreaming ? 'Working…' : 'Reasoning summary'))}${elapsed}`}
    >
      {children}
    </AiTrace>
  );
}
