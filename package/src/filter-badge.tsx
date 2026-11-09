import { Fragment, h, type ComponentChildren, type JSX } from 'preact';
import { useId } from 'preact/hooks';
import { ChoiceChip, ChoiceChipInfoButton } from './choice-chips';
import { type FilterChipProps } from './form-controls/presentation';

/** Shared click-only details action; consumers provide localized labels. */
export function FilterBadgeInfoButton(
  props: Omit<JSX.IntrinsicElements['button'], 'children'>,
) {
  return (
    <ChoiceChipInfoButton
      {...props}
      type="button"
      class={`rv-filter-badge-info ${props.className ?? props.class ?? ''}`.trim()}
    />
  );
}

/** Active-filter presentation, independent of grid/filter state. */
export function FilterBadge({
  label,
  details,
  detailsLabel,
  descriptionId,
  className = '',
  ...props
}: Omit<FilterChipProps, 'children'> & {
  label: ComponentChildren;
  color?: string;
  details?: string;
  detailsLabel?: string;
  descriptionId?: string;
}) {
  const generatedId = useId();
  const detailsId = descriptionId ?? `rv-filter-badge-${generatedId}`;
  return (
    <ChoiceChip
      {...props}
      selected
      className={`rv-filter-badge ${className}`.trim()}
      info={
        details ? (
          <>
            <FilterBadgeInfoButton
              aria-label={detailsLabel}
              aria-describedby={detailsId}
              data-tooltip={details}
              tooltip-position="bottom"
            />
            <span class="rv-filter-badge-description" id={detailsId}>
              {details}
            </span>
          </>
        ) : undefined
      }
    >
      <span class="rv-filter-badge-label">{label}</span>
    </ChoiceChip>
  );
}
