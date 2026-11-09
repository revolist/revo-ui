import type { StatusFeedbackPopoverController } from './popover';
/** Framework-neutral renderer compatible with RevoGrid templates and Preact. */
export type StatusFeedbackH<T> = (
  tag: string,
  properties: Record<string, unknown>,
  children?: any,
) => T;
export type StatusFeedbackTone = 'neutral' | 'warning' | 'danger' | 'success';
export type StatusFeedbackData = Readonly<
  Record<`data-${string}`, string | number | undefined>
>;

export interface StatusFeedbackAction {
  readonly id: string;
  readonly label: string;
  readonly onClick: (event: MouseEvent) => void;
  readonly appearance?: 'primary' | 'secondary' | 'ghost';
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
}
export interface StatusFeedbackItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly detail?: string;
  readonly tone?: StatusFeedbackTone;
  readonly busy?: boolean;
  readonly actions?: readonly StatusFeedbackAction[];
  readonly className?: string;
  readonly data?: StatusFeedbackData;
}
export interface StatusFeedbackLocaleText {
  readonly collapse: string;
  readonly expand: string;
  readonly countLabel: (count: number) => string;
  readonly formatCount: (count: number) => string;
}
export interface StatusFeedbackPanelProps {
  /** Component adapters only: dismiss settled neutral/success items after this delay. Disabled by default. */
  readonly autoDismissMs?: number;
  /** The owner removes the item after its exit animation. */
  readonly onDismissItem?: (id: string) => void;
  readonly compact?: boolean;
  readonly onClose?: () => void;
  readonly closeLabel?: string;
  readonly localeText?: Partial<StatusFeedbackLocaleText>;
  readonly title: string;
  readonly items: readonly StatusFeedbackItem[];
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly collapsed?: boolean;
  readonly onCollapsedChange?: (collapsed: boolean) => void;
  readonly collapseLabel?: string;
  readonly expandLabel?: string;
  readonly popover?: StatusFeedbackPopoverController;
}
export interface StatusBadgeProps {
  readonly label: string;
  readonly tone?: StatusFeedbackTone;
  readonly busy?: boolean;
  readonly className?: string;
}
