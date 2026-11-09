/** @jsxImportSource preact */
import {
  FieldActions,
  FieldRemoveButton as DeleteButton,
  FieldIcon as ConfiguratorIcon,
} from './field-configurator';
import { SvgIcon } from './icons/icon';
import { renderControl } from './control-presentation';
import { ButtonControl as UiButton } from './native-control';

import {
  h,
  Fragment,
  toChildArray,
  type ComponentChildren,
  type ComponentProps,
  type JSX,
  type Ref,
} from 'preact';
import { DropdownPopup } from './dropdown/popup';
import { SearchInput } from './search-input/index';
import plusIcon from '@fortawesome/fontawesome-free/svgs/solid/plus.svg?raw';
import gearIcon from '@fortawesome/fontawesome-free/svgs/solid/gear.svg?raw';
import rowsIcon from '@fortawesome/fontawesome-free/svgs/solid/bars.svg?raw';
import columnsIcon from '@fortawesome/fontawesome-free/svgs/solid/table-columns.svg?raw';
import valuesIcon from '@fortawesome/fontawesome-free/svgs/solid/calculator.svg?raw';
import filterIcon from '@fortawesome/fontawesome-free/svgs/solid/filter.svg?raw';
import checkIcon from '@fortawesome/fontawesome-free/svgs/solid/check.svg?raw';
import searchIcon from '@fortawesome/fontawesome-free/svgs/solid/magnifying-glass.svg?raw';
import './styles/configurator-actions.scss';
import { resolveConfiguratorFieldIcon } from './configurator-field-icon';
type ElementRenderer = (...args: any[]) => any;

export const CONFIGURATOR_AREA_ICONS = {
  rows: rowsIcon,
  columns: columnsIcon,
  values: valuesIcon,
  filters: filterIcon,
};

type ActionTriggerProps = Omit<
  JSX.IntrinsicElements['button'],
  'children' | 'ref'
> & {
  icon: 'plus' | 'gear';
  buttonRef?: Ref<HTMLButtonElement>;
};

/** The same control renders in Core Fields cells and Preact panels. */
export function renderConfiguratorActionTrigger(
  createElement: ElementRenderer,
  { icon, buttonRef, ...props }: ActionTriggerProps,
) {
  const create = createElement as ElementRenderer;
  const svg = icon === 'plus' ? plusIcon : gearIcon;
  return create(
    'div',
    { class: 'pivot-field-action-trigger rv-configurator-action-trigger' },
    renderControl(
      create,
      'button',
      {
        ...props,
        ref: buttonRef,
        type: 'button',
        'data-configurator-action': icon === 'gear' ? 'settings' : undefined,
        class: 'rv-btn rv-configurator-action-button pivot-field-action-icon',
      },
      create('span', {
        'aria-hidden': 'true',
        'data-icon': icon,
        ...(createElement === h
          ? { dangerouslySetInnerHTML: { __html: svg } }
          : { innerHTML: svg }),
      }),
    ),
  );
}

/** Native button refs and event handlers stay with the adapter. */
export function ConfiguratorActionTrigger(props: ActionTriggerProps) {
  return renderConfiguratorActionTrigger(h, props) as unknown as JSX.Element;
}

export function ConfiguratorRemoveButton(
  props: ComponentProps<typeof DeleteButton>,
) {
  return (
    <DeleteButton
      {...props}
      className={`pivot-remove-button ${props.className ?? ''}`}
    />
  );
}

/** Shared menu row; integrations supply policy, labels and callbacks. */
export function ConfiguratorActionButton({
  text,
  icon,
  explanation,
  checked,
  ...props
}: Omit<JSX.IntrinsicElements['button'], 'children'> & {
  text: string;
  icon?: ComponentChildren;
  explanation?: string;
  checked?: boolean;
}) {
  return (
    <UiButton type="button" className="rv-btn" {...props}>
      {icon}
      <span className="pivot-field-action-copy">
        {text}
        {explanation && (
          <span className="pivot-action-reason">{explanation}</span>
        )}
      </span>
      {checked && (
        <SvgIcon className="pivot-field-action-check" svg={checkIcon} />
      )}
    </UiButton>
  );
}

export function ConfiguratorActionIcon({ svg }: { svg: string }) {
  return <SvgIcon className="pivot-field-action-symbol" svg={svg} />;
}

export function ConfiguratorZoneActions({
  add,
  clear,
  children,
}: {
  add: ComponentProps<typeof ConfiguratorActionTrigger>;
  clear?: ComponentProps<typeof ConfiguratorRemoveButton>;
  children?: ComponentChildren;
}) {
  return (
    <FieldActions className="pivot-zone-actions">
      <ConfiguratorActionTrigger {...add} />
      {clear && <ConfiguratorRemoveButton {...clear} />}
      {children}
    </FieldActions>
  );
}

export function ConfiguratorFilterStatus({ label }: { label: string }) {
  return <span className="pivot-filter-active" aria-label={label} />;
}

export function ConfiguratorFieldCaption({
  children,
  annotation,
}: {
  children: ComponentChildren;
  annotation?: string;
}) {
  return (
    <>
      {children}
      {annotation && (
        <small className="pivot-field-annotation">{annotation}</small>
      )}
    </>
  );
}

export function ConfiguratorHint({
  children,
}: {
  children: ComponentChildren;
}) {
  return <p className="pivot-inspector-hint">{children}</p>;
}

export function ConfiguratorFieldSearch(
  props: ComponentProps<typeof SearchInput>,
) {
  return (
    <SearchInput
      {...props}
      rootClassName={`rv-configurator-field-search ${props.rootClassName ?? ''}`}
      icon={props.icon ?? <ConfiguratorIcon svg={searchIcon} />}
    />
  );
}

export function ConfiguratorFieldPicker({
  children,
  emptyText,
}: {
  children?: ComponentChildren;
  emptyText?: string;
}) {
  return (
    <div className="pivot-field-picker-list rv-configurator-field-picker">
      {toChildArray(children).length
        ? children
        : emptyText && <p>{emptyText}</p>}
    </div>
  );
}

export function ConfiguratorActionGroup({
  section,
  children,
}: {
  section: 'settings' | 'layout' | 'removal';
  children: ComponentChildren;
}) {
  const items = toChildArray(children);
  return items.length ? (
    <div
      className="pivot-field-action-group rv-configurator-action-group"
      data-section={section}
    >
      {items}
    </div>
  ) : null;
}

export function ConfiguratorActionPanel({
  title,
  accessibleLabel = title,
  header,
  panelRef,
  onKeyDown,
  children,
  ...popup
}: Omit<
  ComponentProps<typeof DropdownPopup>,
  'children' | 'popupClassName' | 'topLayer' | 'closeOnClickOutside'
> & {
  title: string;
  accessibleLabel?: string;
  header?: ComponentChildren;
  panelRef?: Ref<HTMLDivElement>;
  onKeyDown?: JSX.HTMLAttributes<HTMLDivElement>['onKeyDown'];
  children: ComponentChildren;
}) {
  return (
    <DropdownPopup
      {...popup}
      topLayer
      closeOnClickOutside
      popupClassName="pivot-field-action-popover"
    >
      <div
        ref={panelRef}
        className="pivot-field-action-panel rv-configurator-action-panel"
        role="region"
        aria-label={accessibleLabel}
        onKeyDown={onKeyDown}
      >
        <div className="pivot-field-action-header">
          <strong className="pivot-field-action-title">{title}</strong>
          {header}
        </div>
        <div className="pivot-field-action-body">{children}</div>
      </div>
    </DropdownPopup>
  );
}

/** Field identity shared by grid and report authoring controls. */
export function ConfiguratorFieldTypeIcon({
  field,
}: {
  field?: import('./configurator-field-icon').ConfiguratorFieldMetadata;
}) {
  const icon = resolveConfiguratorFieldIcon(field);
  return (
    <span
      className="rv-configurator-icon column-icon"
      aria-hidden="true"
      data-field-icon={icon.kind}
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  );
}
