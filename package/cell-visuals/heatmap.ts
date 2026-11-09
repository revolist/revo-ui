import {
  parseHexColor,
  interpolateRgb,
  normalizeColorValue,
  type RgbColor,
} from '@revolist/chart-utils/colors';
import type { ElementFactory } from './types';
function getHeatmapColor(value: number): string {
  if (value <= 0.5) {
    const red = 255;
    const green = Math.round(255 * (value / 0.5)); // Scale green from 0 to 255
    const blue = 0; // No blue
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    const red = Math.round(255 * ((1 - value) / 0.5)); // Scale red from 255 to 0
    const green = Math.round(150 + 105 * ((1 - value) / 0.5)); // Darker green (150-255)
    const blue = 0; // No blue
    return `rgb(${red}, ${green}, ${blue})`;
  }
}

/**
 * Helper to calculate coldmap color (shades of blue).
 * @param value Normalized value (0 to 1).
 * @returns RGB color for the coldmap.
 */
function getColdmapColor(value: number): string {
  const red = 0; // No red
  const green = Math.round(150 * value); // Scale green from 0 to 150
  const blue = Math.round(255 * value); // Scale blue from light to deep blue
  return `rgb(${red}, ${green}, ${blue})`;
}

function getThresholdColor(
  value: number,
  minValue: number,
  midValue: number,
  maxValue: number,
  colors: readonly [string, string, string],
): string | undefined {
  const parsed = colors.map(parseHexColor);
  if (parsed.some((color) => !color)) return undefined;
  const [lowColor, midColor, highColor] = parsed as [
    RgbColor,
    RgbColor,
    RgbColor,
  ];
  if (value <= midValue) {
    return interpolateRgb(
      lowColor,
      midColor,
      normalizeColorValue(value, minValue, midValue, 1),
    );
  }
  return interpolateRgb(
    midColor,
    highColor,
    normalizeColorValue(value, midValue, maxValue, 1),
  );
}

/**
 * Selects black or white text for a given background.
 * @param bgColor Background color in `rgb(r, g, b)` format.
 * @returns Font color (`#000` for black or `#fff` for white).
 */
function getFontColor(bgColor: string): string {
  const rgb = bgColor.match(/\d+/g)?.map(Number); // Extract RGB values
  if (!rgb || rgb.length !== 3) return '#000'; // Default to black if parsing fails
  const [r, g, b] = rgb;

  // Calculate the weighted luminance
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Return white if luminance is low, otherwise black
  return luminance > 0.5 ? '#000' : '#fff';
}

export function renderHeatmap(
  h: ElementFactory,
  options: {
    value: unknown;
    minValue?: number;
    maxValue?: number;
    midValue?: number;
    colorMap?: 'heatmap' | 'coldmap';
    lowColor?: string;
    midColor?: string;
    highColor?: string;
  },
) {
  const { value } = options;
  const minValue = options.minValue ?? 0; // Default to 0 if not provided
  const maxValue = options.maxValue ?? 100; // Default to 100 if not provided
  const range = maxValue - minValue || 1; // Prevent division by zero
  const mapType = options.colorMap ?? 'heatmap'; // Determine map type: 'heatmap' or 'coldmap'
  const numericValue = Number(value);
  const thresholdMin = Math.min(minValue, maxValue);
  const thresholdMax = Math.max(minValue, maxValue);
  const thresholdMid = Math.min(
    thresholdMax,
    Math.max(
      thresholdMin,
      options.midValue ?? thresholdMin + (thresholdMax - thresholdMin) / 2,
    ),
  );

  // Normalize the value to a range of 0 to 1
  const normalizedValue = Math.min(
    1,
    Math.max(0, (numericValue - minValue) / range),
  );

  // Choose color based on map type
  const customColors =
    options.lowColor && options.midColor && options.highColor
      ? getThresholdColor(
          numericValue,
          thresholdMin,
          thresholdMid,
          thresholdMax,
          [options.lowColor, options.midColor, options.highColor],
        )
      : undefined;
  const backgroundColor =
    customColors ??
    (mapType === 'coldmap'
      ? getColdmapColor(normalizedValue)
      : getHeatmapColor(normalizedValue));
  const fontColor = getFontColor(backgroundColor); // Get contrasting font color

  return h(
    'div',
    {
      class: 'heatmap-cell',
      style: {
        backgroundColor, // Dynamically generated background
        color: fontColor, // Dynamically computed font color
      },
    },
    String(value), // Display the cell value
  );
}
