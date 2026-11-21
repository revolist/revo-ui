export const MAX_ANGLE = 360;

export function normalizeAngle(value: number) {
  return Math.max(0, Math.min(MAX_ANGLE, Number.isFinite(value) ? value : 0));
}

export function angleFromPoint(x: number, y: number) {
  return ((Math.atan2(x, -y) * 180) / Math.PI + MAX_ANGLE) % MAX_ANGLE;
}

export function advanceAngle(value: number, previous: number, next: number) {
  const delta = ((next - previous + 540) % MAX_ANGLE) - 180;
  return normalizeAngle(value + delta);
}

export function snapAngle(value: number, step: number) {
  const angle = normalizeAngle(value);
  const stepped = normalizeAngle(Math.round(angle / step) * step);
  return MAX_ANGLE - angle < Math.abs(stepped - angle)
    ? MAX_ANGLE
    : Number(stepped.toFixed(9));
}

export function stepAngle(value: number, step: number, steps: number) {
  const index = value / step;
  const origin = steps > 0 ? Math.floor(index + 1e-8) : Math.ceil(index - 1e-8);
  return normalizeAngle(Number(((origin + steps) * step).toFixed(9)));
}

export function pointOnDial(center: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: center + radius * Math.sin(radians),
    y: center - radius * Math.cos(radians),
  };
}
