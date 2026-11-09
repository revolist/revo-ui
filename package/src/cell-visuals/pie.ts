import type { ElementFactory } from './types';
export interface PieData {
  value: number;
  color?: string;
  name?: string;
}

function generateColor(segment: number, totalSegments: number): string {
  const hue = (segment / totalSegments) * 360; // Distribute hues evenly
  const saturation = 70; // Fixed saturation (you can adjust this for more vivid colors)
  const lightness = 50; // Fixed lightness (adjust if you want lighter or darker colors)

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
// Function to parse the input `values` and return an array of pie data
function parseValues(values: number[] | PieData[]): PieData[] {
  if (Array.isArray(values) && typeof values[0] === 'number') {
    return (values as number[]).map((value, index) => ({
      value,
      color: generateColor(index, (values as number[]).length),
      name: `Slice ${index + 1}`,
    }));
  }

  if (Array.isArray(values) && typeof values[0] === 'object') {
    return values as PieData[];
  }

  return [];
}

function renderPieChart(
  values: number[] | PieData[] = [],
  canvas?: HTMLCanvasElement,
  labelFont?: string,
) {
  if (!canvas) {
    return;
  }
  const pieData = parseValues(values);

  const totalValue = pieData.reduce((sum, entry) => sum + entry.value, 0);
  let startAngle = 0;
  const radius = Math.min(canvas.width, canvas.height) / 2;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = labelFont ?? '12px system-ui';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  pieData.forEach((entry, index) => {
    const sliceAngle = (entry.value / totalValue) * 2 * Math.PI;

    context.beginPath();
    context.moveTo(canvas.width / 2, canvas.height / 2); // Move to center
    context.arc(
      canvas.width / 2,
      canvas.height / 2,
      radius,
      startAngle,
      startAngle + sliceAngle,
    );
    context.fillStyle = entry.color || generateColor(index, pieData.length); // Use custom color or generate one
    context.fill();

    // Optionally, add the slice labels
    if (entry.name) {
      context.fillStyle = '#ffffff';
      const textX =
        canvas.width / 2 + Math.cos(startAngle + sliceAngle / 2) * (radius / 2);
      const textY =
        canvas.height / 2 +
        Math.sin(startAngle + sliceAngle / 2) * (radius / 2);
      context.fillText(entry.name, textX, textY, radius * 0.8);
    }

    startAngle += sliceAngle; // Update the start angle for the next slice
  });
}

export function renderPie(
  h: ElementFactory,
  value: readonly PieData[] | readonly number[] = [],
  options: { size?: number; labelFont?: string; ariaLabel?: string } = {},
) {
  return h('canvas', {
    class: 'pie-chart-canvas',
    width: options.size ?? 64,
    height: options.size ?? 64,
    role: 'img',
    'aria-label':
      options.ariaLabel ??
      parseValues(value as PieData[] | number[])
        .map((entry) => `${entry.name ?? 'Slice'}: ${entry.value}`)
        .join(', '),
    ref: (canvas?: HTMLCanvasElement) =>
      renderPieChart(value as PieData[] | number[], canvas, options.labelFont),
  });
}
