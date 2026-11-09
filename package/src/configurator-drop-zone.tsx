/** @jsxImportSource preact */
import { h, type JSX, type ComponentChildren } from 'preact';
import {
  SelectedField,
  FieldDropIndicator,
  useFieldDropTarget,
  FieldGroup,
  FieldList,
  FieldRemoveButton,
} from './field-configurator';

export interface ConfiguratorDropZoneProps<
  Prop extends string | number,
  Field extends { prop: Prop; name?: string },
  Area extends string,
> {
  label?: string;
  id?: string;
  footer?: ComponentChildren;
  removeLabel?: (index: number, prop: Prop) => string;
  title: string | JSX.Element;
  headerActions?: JSX.Element | null;
  renderActions?: (index: number, prop: Prop) => JSX.Element | null;
  allowFieldRemoving?: boolean;
  panel: Area; // 'rows' | 'columns' | 'values'
  items: Prop[];
  /** Optional stable identities for repeated measure instances; other zones use their field identities. */
  itemKeys?: readonly (string | number)[];
  dimensions: ReadonlyMap<Prop, Field>;
  placeholder?: string;
  i18n: { dragHere: string; remove: string };
  onRemove: (index: number) => void;
  onDrop: (target: Area, index?: number, event?: DragEvent) => void;
  canDrop?: (event: DragEvent) => boolean;
  onDragOver: (e: Event) => void;
  onDragEnter: (e: Event) => void;
  onItemDragStart: (index: number, prop: Prop, event?: DragEvent) => void;
  onItemDragEnd: () => void;
  renderItem?: (index: number, item?: Field) => ComponentChildren;
  allowFieldDragging?: boolean;
  dragActive?: boolean;
  renderIcon?: (field?: Field) => ComponentChildren;
}

export function ConfiguratorDropZone<
  Prop extends string | number,
  Field extends { prop: Prop; name?: string },
  Area extends string,
>({
  title,
  label,
  id,
  footer,
  removeLabel,
  headerActions,
  renderActions,
  allowFieldRemoving = true,
  panel,
  items,
  itemKeys,
  dimensions,
  placeholder,
  i18n,
  renderItem,
  onRemove,
  onDrop,
  onDragOver,
  canDrop = () => true,
  onDragEnter,
  onItemDragStart,
  onItemDragEnd,
  allowFieldDragging = true,
  dragActive,
  renderIcon,
}: ConfiguratorDropZoneProps<Prop, Field, Area>) {
  const noItems = items.length === 0;
  const target = useFieldDropTarget(items.length, {
    enabled: allowFieldDragging,
    active: dragActive,
    canDrop,
    onDragOver,
    onDrop: (index, event) => onDrop(panel, index, event),
  });

  return (
    <FieldGroup
      {...target.list}
      id={id}
      tabIndex={id ? -1 : undefined}
      className="pivot-layout-zone"
      aria-label={label}
      data-pivot-area={panel}
      heading={title}
      headingClassName="zone-title"
      actions={headerActions}
    >
      <FieldList
        empty={noItems}
        placeholder={placeholder ?? i18n.dragHere}
        className={`min-h-[3rem] overflow-auto grow panel-card ${noItems ? 'empty' : ''} ${target.isOver ? 'drag-over' : ''}`}
        {...target.list}
        onDragEnter={onDragEnter}
      >
        {items.map((prop, index) => {
          const dimension = dimensions.get(prop);
          const dividerPosition = target.position(index);
          return (
            <SelectedField
              key={itemKeys?.[index] ?? `${title}-${index}`}
              {...target.row(index)}
              draggable={allowFieldDragging}
              onDragStart={(e) => {
                if (allowFieldDragging) {
                  e.dataTransfer?.setData('text/plain', String(prop));
                  if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                  }
                  target.start(index);
                  onItemDragStart(index, prop, e);
                } else {
                  e.preventDefault();
                }
              }}
              onDragEnd={() => {
                target.clear();
                onItemDragEnd();
              }}
              indicator={
                dividerPosition && (
                  <FieldDropIndicator
                    position={dividerPosition}
                    index={target.boundary ?? undefined}
                    className={`pivot-zone-drop-divider ${dividerPosition}`}
                  />
                )
              }
              contentClassName="pivot-dimension-cell"
              icon={renderIcon?.(dimension)}
              label={
                <span className="pivot-zone-field-caption flex grow">
                  {renderItem?.(index, dimension) ?? dimension?.name ?? prop}
                </span>
              }
              actions={
                <>
                  {renderActions?.(index, prop)}
                  {allowFieldRemoving && (
                    <FieldRemoveButton
                      className="pivot-remove-button"
                      onClick={() => onRemove(index)}
                      locale={{
                        title: removeLabel?.(index, prop) ?? i18n.remove,
                        ariaLabel: removeLabel?.(index, prop) ?? i18n.remove,
                      }}
                    />
                  )}
                </>
              }
            />
          );
        })}
      </FieldList>
      {footer}
    </FieldGroup>
  );
}
