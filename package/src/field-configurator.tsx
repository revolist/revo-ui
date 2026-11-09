import { PanelResizeHandle } from './controls';
import { TooltipText } from './core/tooltip-text';
import { RemoveButton } from './buttons/remove-button';
import { h, type ComponentChildren, type JSX } from 'preact';
import { SvgIcon } from './icons/icon';
import { useId, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { ButtonControl } from './native-control';
import { Badge } from './badge.view';
import panelIcon from '@fortawesome/fontawesome-free/svgs/solid/table-columns.svg?raw';
import { DisclosureSummary } from './form-controls/presentation';

import cancel from './icons/cancel.svg?raw';
import chevron from '@fortawesome/fontawesome-free/svgs/solid/chevron-right.svg?raw';

// Shared configurator classes used by product layouts.
export function FieldIcon({
  svg,
  className = '',
}: {
  svg: string;
  className?: string;
}) {
  return <SvgIcon svg={svg} className={`rv-configurator-icon ${className}`} />;
}

export function FieldSummary({
  children,
  className = '',
  ...attributes
}: Omit<JSX.IntrinsicElements['summary'], 'children'> & {
  children: ComponentChildren;
  className?: string;
}) {
  return (
    <DisclosureSummary
      {...attributes}
      className={`rv-configurator-summary ${className}`}
      iconPosition="after"
      icon={<FieldIcon svg={chevron} />}
    >
      {children}
    </DisclosureSummary>
  );
}

export function FieldLibrary({
  title,
  id,
  count,
  children,
  className = '',
}: {
  title: string;
  id?: string;
  count?: ComponentChildren;
  children: ComponentChildren;
  className?: string;
}) {
  return (
    <details
      id={id}
      tabIndex={id ? -1 : undefined}
      class={`rv-configurator-available-fields ${className}`}
      open
    >
      <FieldSummary>
        {title}
        {count != null && (
          <span class="rv-configurator-field-count">{count}</span>
        )}
      </FieldSummary>
      <div class="rv-configurator-library-content">{children}</div>
    </details>
  );
}

export function FieldGroupHeading({
  children,
  actions,
  className = '',
}: {
  children: ComponentChildren;
  actions?: ComponentChildren;
  className?: string;
}) {
  return (
    <div class={`rv-configurator-zone-heading ${className}`}>
      <span class="rv-configurator-zone-label">{children}</span>
      {actions && <span class="rv-configurator-zone-actions">{actions}</span>}
    </div>
  );
}

export function FieldGroup({
  heading,
  actions,
  headingClassName,
  className = '',
  children,
  ...props
}: Omit<JSX.HTMLAttributes<HTMLElement>, 'class' | 'title'> & {
  heading: ComponentChildren;
  actions?: ComponentChildren;
  headingClassName?: string;
  className?: string;
}) {
  return (
    <section {...props} className={`rv-configurator-zone ${className}`}>
      <FieldGroupHeading className={headingClassName} actions={actions}>
        {heading}
      </FieldGroupHeading>
      {children}
    </section>
  );
}

export function FieldList({
  empty,
  placeholder,
  className = '',
  children,
  ...props
}: Omit<JSX.HTMLAttributes<HTMLUListElement>, 'class'> & {
  empty: boolean;
  placeholder: ComponentChildren;
  className?: string;
}) {
  return (
    <ul
      {...props}
      className={`rv-configurator-field-list ${empty ? 'empty' : ''} ${className}`}
    >
      {empty ? (
        <li className="rv-configurator-empty-zone empty">{placeholder}</li>
      ) : (
        children
      )}
    </ul>
  );
}

export function FieldRow({
  className = '',
  children,
  indicator,
  dropPosition,
  ...props
}: Omit<JSX.HTMLAttributes<HTMLLIElement>, 'class'> & {
  className?: string;
  indicator?: ComponentChildren;
  dropPosition?: 'before' | 'after';
}) {
  return (
    <li
      {...props}
      className={`rv-configurator-field rv-configurator-field-row ${className}`}
    >
      {indicator ??
        (dropPosition && <FieldDropIndicator position={dropPosition} />)}
      <span className="rv-configurator-drag-handle" aria-hidden="true" />
      {children}
    </li>
  );
}

export function FieldContent({
  icon,
  children,
  className = '',
}: {
  icon?: ComponentChildren;
  children: ComponentChildren;
  className?: string;
}) {
  return (
    <span class={`rv-configurator-field-content ${className}`}>
      {icon}
      <span class="rv-configurator-field-caption">{children}</span>
    </span>
  );
}

/** Neutral row shell; consumers supply actions, selection and update policy. */
export function FieldItem({
  as = 'div',
  children,
  className = '',
  ...props
}: Omit<JSX.HTMLAttributes<HTMLElement>, 'class'> & {
  as?: 'div' | 'label';
  className?: string;
}): JSX.Element {
  return h(
    as,
    { ...props, class: `rv-configurator-field ${className}` },
    children,
  );
}

export function FieldLibraryList({
  children,
  ...props
}: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rv-configurator-library-list ${props.className ?? ''}`}
    >
      {children}
    </div>
  );
}

/** Selected field row; product adapters retain drag, settings and remove policy. */
export function SelectedField({
  label,
  icon,
  actions,
  contentClassName,
  ...row
}: Omit<Parameters<typeof FieldRow>[0], 'children'> & {
  label: ComponentChildren;
  icon?: ComponentChildren;
  actions?: ComponentChildren;
  contentClassName?: string;
}) {
  return (
    <FieldRow {...row}>
      <FieldContent className={contentClassName} icon={icon}>
        {label}
      </FieldContent>
      {actions}
    </FieldRow>
  );
}
export function FieldActions({
  children,
  className = '',
  ...props
}: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class'> & { className?: string }) {
  return (
    <div {...props} className={`rv-configurator-field-actions ${className}`}>
      {children}
    </div>
  );
}
export function FieldStatusBadge({
  children,
  active = false,
  label,
  className = '',
}: {
  children: ComponentChildren;
  active?: boolean;
  label: string;
  className?: string;
}) {
  return (
    <TooltipText
      className={`rv-configurator-status-badge ${className}`}
      data-active={active ? 'true' : undefined}
      title={label}
      aria-label={label}
    >
      {children}
    </TooltipText>
  );
}

/** Animated remove control shared by selected-field rows and section actions. */
export function FieldRemoveButton(props: Parameters<typeof RemoveButton>[0]) {
  return (
    <RemoveButton
      {...props}
      className={`rv-configurator-remove-button ${props.className ?? ''}`}
    />
  );
}

/** The same removal glyph for native policy adapters and field remove buttons. */
export function FieldRemoveIcon() {
  return <SvgIcon svg={cancel} />;
}

export { reorderFields, fieldDropIndex } from './field-reorder';
export { useFieldReorder, useFieldDropTarget } from './field-reorder.hook';

export function FieldDropIndicator({
  position,
  index,
  className = '',
}: {
  position: 'before' | 'after';
  index?: number;
  className?: string;
}) {
  return (
    <span
      className={`rv-configurator-drop-indicator ${className}`}
      data-position={position}
      data-drop-index={index}
      aria-hidden="true"
    />
  );
}

export interface CollapsibleSectionProps {
  /** Heading displayed in the keyboard-accessible expand/collapse trigger. */
  title: ComponentChildren;
  /** Supporting text displayed above the expanded content. */
  description?: ComponentChildren;
  /** Expand initially. Later toggles are owned by the native disclosure. */
  defaultOpen?: boolean;
  /** Section content; stays mounted when collapsed to preserve drafts. */
  children: ComponentChildren;
  /** Additional CSS classes on the outer disclosure. */
  className?: string;
  /** Additional CSS classes on the summary trigger. */
  summaryClassName?: string;
  /** Additional CSS classes on the content container. */
  contentClassName?: string;
  /** Additional CSS classes on the supporting description. */
  descriptionClassName?: string;
  /** Host policies can wrap the native details without owning its presentation. */
  renderRoot?: (props: JSX.IntrinsicElements['details']) => ComponentChildren;
}

/** Native disclosure; collapsed content stays mounted to preserve draft edits. */
export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
  className = '',
  summaryClassName = '',
  contentClassName = '',
  descriptionClassName = '',
  renderRoot,
}: CollapsibleSectionProps) {
  const initiallyOpen = useRef(defaultOpen);
  const props: JSX.IntrinsicElements['details'] = {
    class: `rv-collapsible-section rv-configurator-section ${className}`.trim(),
    open: initiallyOpen.current,
    children: [
      <FieldSummary className={summaryClassName}>{title}</FieldSummary>,
      <div class={`rv-collapsible-section__content ${contentClassName}`.trim()}>
        {description && (
          <p
            class={`rv-collapsible-section__description ${descriptionClassName}`.trim()}
          >
            {description}
          </p>
        )}
        {children}
      </div>,
    ],
  };
  return renderRoot ? renderRoot(props) : <details {...props} />;
}

export interface ConfiguratorCompactItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  disabled?: boolean;
  /** Optional section to focus after opening. */
  targetId?: string;
  /** Activate the corresponding product tab when reopening. */
  onOpen?: () => void;
}

export interface ConfiguratorMiniModeConfig {
  /** Starts the configurator as a narrow rail. Users can expand and collapse it. */
  miniMode?: boolean;
  /** Enables width resizing. Shrinking below 200px collapses to the rail. */
  resizable?: boolean;
}

/** Shared panel shell. Collapsing preserves mounted controls and their drafts. */
export function ConfiguratorPanel({
  panelRef,
  standalone = false,
  children,
  compactItems,
  compact: compactProp = false,
  onExpand,
  miniMode = false,
  resizable = false,
  resizeParent = false,
  ...props
}: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'ref'> &
  ConfiguratorMiniModeConfig & {
    panelRef?: import('preact').Ref<HTMLDivElement>;
    standalone?: boolean;
    compactItems?: readonly ConfiguratorCompactItem[];
    /** Presentation state is owned by the host; the panel adds no toggle button. */
    compact?: boolean;
    onExpand?: () => void;
    /** Apply the resized width to the product-owned parent as well. */
    resizeParent?: boolean;
  }) {
  const [expanded, setExpanded] = useState<boolean>();
  const railEnabled = miniMode || resizable;
  const compact = railEnabled ? !(expanded ?? !miniMode) : compactProp;
  const [width, setWidth] = useState<number>();
  const resizeAnchor = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const parent = resizeAnchor.current?.parentElement?.parentElement;
    if (
      !resizable ||
      !resizeParent ||
      compact ||
      width === undefined ||
      !parent
    )
      return;
    parent.style.setProperty('--rv-configurator-resized-width', `${width}px`);
    return () => parent.style.removeProperty('--rv-configurator-resized-width');
  }, [resizable, resizeParent, compact, width]);
  const contentId = useId();
  const rail = useRef<HTMLDivElement>(null);
  const collapse = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);
  const destination = useRef<string>();
  useLayoutEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    if (compact)
      rail.current
        ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
        ?.focus();
    else {
      const target =
        destination.current &&
        collapse.current?.ownerDocument.getElementById(destination.current);
      (target || collapse.current)?.focus();
    }
  }, [compact]);

  const reopen = (item: ConfiguratorCompactItem) => {
    if (railEnabled) {
      destination.current = item.targetId;
      moveFocus.current = true;
      setExpanded(true);
    }
    onExpand?.();
    item.onOpen?.();
  };
  const railItems: readonly ConfiguratorCompactItem[] | undefined =
    railEnabled && !compactItems?.some((item) => !item.disabled)
      ? [{ id: 'expand', label: 'Expand configurator' }]
      : compactItems;
  const collapsePanel = () => {
    moveFocus.current = true;
    setExpanded(false);
  };
  const panelStyle =
    resizable && !resizeParent && width !== undefined
      ? typeof props.style === 'string'
        ? `${props.style};width:${width}px`
        : { ...props.style, width }
      : props.style;
  return (
    <div
      {...props}
      style={panelStyle}
      ref={panelRef}
      data-compact={compact ? 'true' : undefined}
      data-mini-mode={railEnabled ? 'true' : undefined}
      data-resizable={resizable ? 'true' : undefined}
      className={`rv-configurator-panel ${standalone ? 'rv-configurator-panel--standalone' : ''} ${props.className ?? ''}`}
    >
      {compact && railItems && (
        <div
          ref={rail}
          className="rv-configurator-rail"
          role="group"
          aria-label={props['aria-label'] ?? 'Configurator'}
        >
          {railItems.map((item) => (
            <ButtonControl
              key={item.id}
              unstyled
              class="rv-btn rv-btn-ghost rv-configurator-rail__button"
              aria-label={`${item.label}${item.count === undefined ? '' : ` (${item.count})`}`}
              title={`${item.label}${item.count === undefined ? '' : ` (${item.count})`}`}
              aria-expanded={railEnabled ? false : undefined}
              aria-controls={railEnabled ? contentId : undefined}
              disabled={item.disabled}
              onClick={() => reopen(item)}
            >
              <FieldIcon svg={item.icon ?? panelIcon} />
              {railEnabled && (
                <span class="rv-configurator-rail__label">{item.label}</span>
              )}
              {item.count !== undefined && (
                <Badge
                  className="rv-configurator-rail__count"
                  variant={item.count ? 'accent' : 'neutral'}
                >
                  {item.count}
                </Badge>
              )}
            </ButtonControl>
          ))}
        </div>
      )}
      {resizable && !compact && (
        <PanelResizeHandle
          anchorRef={resizeAnchor}
          resizeParent={resizeParent}
          label="Resize configurator"
          edge={resizeParent ? 'left' : 'right'}
          initialWidth={360}
          min={56}
          max={720}
          onChange={(next) => {
            if (next < 200) collapsePanel();
            else setWidth(next);
          }}
        />
      )}
      {railEnabled && !compact && (
        <div class="rv-configurator-panel__toggle">
          <ButtonControl
            ref={collapse}
            class="rv-btn-ghost"
            aria-label="Collapse configurator"
            aria-expanded={true}
            aria-controls={contentId}
            onClick={collapsePanel}
          >
            Collapse
          </ButtonControl>
        </div>
      )}
      {compactItems || railEnabled ? (
        <div
          id={railEnabled ? contentId : undefined}
          class="rv-configurator-panel__content"
          hidden={compact}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export {
  createFieldExpansion,
  fieldExpansionIds,
  recordFieldExpansion,
  type FieldExpansionState,
} from './field-expansion';
