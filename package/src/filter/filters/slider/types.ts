export interface SliderRange {
  fromValue: number;
  toValue: number;
}
export interface RangeSliderProps {
  /** Minimum value for the range */
  min: number;
  /** Maximum value for the range */
  max: number;
  /** Current value for the start of the range */
  fromValue: number;
  /** Current value for the end of the range */
  toValue: number;
  /** Value-domain increment for native range handles. Defaults to the slider's decimal precision. */
  step?: number;
  /** Whether to show tooltips on hover */
  showTooltips?: boolean;
  /** Whether to show the current range values above the slider */
  showRangeDisplay?: boolean;
  /** Whether to show numeric inputs for editing the selected range */
  showRangeInputs?: boolean;
  /** Disable both native range handles. */
  disabled?: boolean;
  /** Scaling used to preserve decimals in native range inputs. Defaults to 100. */
  scaleFactor?: number;
  /** Extra class on the shared slider root. */
  className?: string;
  /** Extra class on the shared dual-handle control. */
  controlClassName?: string;
  /** Extra classes retained by feature adapters. */
  fromClassName?: string;
  toClassName?: string;
  /** Accessible names for the two native range handles. */
  fromAriaLabel?: string;
  toAriaLabel?: string;
  /**
   * Optional function to format values inside the editable inputs.
   * Defaults to `String(value)`, which keeps dot decimals independent of the
   * browser's localized number input rendering.
   */
  formatInputValue?: (value: number) => string;
  /**
   * Optional function to parse editable input text back to a number.
   * Return `NaN` to ignore incomplete or invalid text while the user is typing.
   * The default parser accepts both dot and comma decimal separators.
   */
  parseInputValue?: (value: string) => number;
  /** Callback fired when the range values change */
  onRangeChange: (range: SliderRange) => void;
  /** Callback fired when a native handle commits its change. */
  onRangeCommit?: (range: SliderRange) => void;
  /**
   * Optional function to format read-only labels and tooltips.
   * Editable inputs use `formatInputValue` so display labels and input text can
   * intentionally use different formats.
   */
  formatValue?: (value: number) => string;
  /** Optional handle-specific display/accessible value formatters. */
  formatFromValue?: (value: number) => string;
  formatToValue?: (value: number) => string;
}
