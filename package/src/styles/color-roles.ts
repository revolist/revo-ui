/** Semantic color catalog. Values belong exclusively to the Sass theme. */
export const colorRoles = [
  {
    token: '--rv-ui-canvas',
    group: 'Surfaces',
    usage: 'Application background.',
  },
  {
    token: '--rv-ui-surface',
    group: 'Surfaces',
    usage: 'Default panels and controls.',
  },
  {
    token: '--rv-ui-surface-elevated',
    group: 'Surfaces',
    usage: 'Floating menus and dialogs.',
  },
  {
    token: '--rv-ui-surface-sunken',
    group: 'Surfaces',
    usage: 'Inset content areas.',
  },
  {
    token: '--rv-ui-surface-hover',
    group: 'Surfaces',
    usage: 'Hovered neutral rows and controls.',
  },
  {
    token: '--rv-ui-overlay',
    group: 'Surfaces',
    usage: 'Modal backdrop and content scrim.',
  },
  {
    token: '--rv-ui-shadow',
    group: 'Surfaces',
    usage: 'Elevation shadow color.',
  },
  {
    token: '--rv-ui-text',
    group: 'Content',
    usage: 'Primary readable content.',
  },
  {
    token: '--rv-ui-text-muted',
    group: 'Content',
    usage: 'Supporting descriptions and labels.',
  },
  {
    token: '--rv-ui-text-subtle',
    group: 'Content',
    usage:
      'Low emphasis decorative content; verify contrast before using for text.',
  },
  {
    token: '--rv-ui-border',
    group: 'Content',
    usage: 'Default control and panel boundaries.',
  },
  {
    token: '--rv-ui-border-strong',
    group: 'Content',
    usage: 'Emphasized boundaries.',
  },
  {
    token: '--rv-ui-accent',
    group: 'Interaction',
    usage: 'Primary actions and active indicators.',
  },
  {
    token: '--rv-ui-accent-hover',
    group: 'Interaction',
    usage: 'Hovered primary actions.',
  },
  {
    token: '--rv-ui-accent-fg',
    group: 'Interaction',
    usage: 'Content on accent fills.',
  },
  {
    token: '--rv-ui-accent-text',
    group: 'Interaction',
    usage: 'Accent text on neutral surfaces.',
  },
  {
    token: '--rv-ui-focus-ring',
    group: 'Interaction',
    usage: 'Keyboard focus indicator.',
  },
  {
    token: '--rv-ui-selected-bg',
    group: 'Interaction',
    usage: 'Shared selection background for calendars, lists and choices.',
  },
  {
    token: '--rv-ui-selected-fg',
    group: 'Interaction',
    usage: 'Content on shared selection backgrounds.',
  },
  {
    token: '--rv-ui-selected-accent-fg',
    group: 'Interaction',
    usage:
      'Emphasized selection text in choices, tabs and formatting controls.',
  },
  {
    token: '--rv-ui-disabled-bg',
    group: 'Interaction',
    usage: 'Disabled control background.',
  },
  {
    token: '--rv-ui-disabled-fg',
    group: 'Interaction',
    usage: 'Disabled control content.',
  },
  {
    token: '--rv-ui-danger',
    group: 'Feedback',
    usage: 'Errors and destructive actions.',
  },
  {
    token: '--rv-ui-danger-surface',
    group: 'Feedback',
    usage: 'Error feedback background.',
  },
  {
    token: '--rv-ui-warning',
    group: 'Feedback',
    usage: 'Warnings needing attention.',
  },
  {
    token: '--rv-ui-warning-surface',
    group: 'Feedback',
    usage: 'Warning feedback background.',
  },
  {
    token: '--rv-ui-success',
    group: 'Feedback',
    usage: 'Successful outcomes.',
  },
  {
    token: '--rv-ui-success-surface',
    group: 'Feedback',
    usage: 'Success feedback background.',
  },
  {
    token: '--rv-ui-field-muted',
    group: 'Fields',
    usage: 'Muted inline field content.',
  },
  {
    token: '--rv-ui-field-accent-text',
    group: 'Fields',
    usage: 'Accent content within fields.',
  },
  {
    token: '--rv-ui-field-surface',
    group: 'Fields',
    usage: 'Inline field background.',
  },
  {
    token: '--rv-ui-field-text',
    group: 'Fields',
    usage: 'Inline field content.',
  },
] as const;
