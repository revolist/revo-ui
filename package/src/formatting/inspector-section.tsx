/** @jsxImportSource preact */
import { Summary as UiSummary } from '../native-control';

import { h, type ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { useControlTooltip } from '../core/tooltip';
import { SvgIcon } from '../icons/icon';
import chevronDown from '@fortawesome/fontawesome-free/svgs/solid/chevron-down.svg?raw';

export function InspectorSection({
  title,
  icon,
  expandLabel,
  collapseLabel,
  open = false,
  children,
}: {
  readonly title: string;
  readonly icon: string;
  readonly expandLabel: string;
  readonly collapseLabel: string;
  readonly open?: boolean;
  readonly children: ComponentChildren;
}) {
  const [expanded, setExpanded] = useState(open);
  const tooltipText = expanded ? collapseLabel : expandLabel;
  const tooltip = useControlTooltip(tooltipText, true);
  return (
    <details
      class="rv-format-inspector-section"
      open={expanded}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <UiSummary
        class="rv-format-inspector-section__summary"
        aria-label={tooltipText}
        aria-expanded={expanded}
        {...tooltip.triggerProps}
      >
        <span class="rv-format-inspector-section__title">
          <SvgIcon svg={icon} className="rv-format-icon" />
          {title}
        </span>
        <SvgIcon
          svg={chevronDown}
          className="rv-format-icon rv-format-inspector-section__chevron"
        />
        {tooltip.tooltip}
      </UiSummary>
      <div class="rv-format-inspector-section__content">{children}</div>
    </details>
  );
}
