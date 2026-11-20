import {
  motionAllowed,
  presetAnimation,
  type MotionPreset,
} from "./presets/motion";

/** Animate a controlled step without replacing the accessible, editable input. */
export function animateNumberStep(
  root: HTMLElement,
  from: number,
  to: number,
  motion?: MotionPreset,
): (() => void) | undefined {
  const input = root.querySelector<HTMLInputElement>('input[type="number"]');
  const win = root.ownerDocument.defaultView;
  if (
    !input ||
    !win ||
    root.ownerDocument.activeElement === input ||
    typeof input.animate !== "function" ||
    !motionAllowed(input)
  )
    return;

  const previous = String(from);
  const current = String(to);
  if (previous === current) return;
  const rootRect = root.getBoundingClientRect();
  const inputRect = input.getBoundingClientRect();
  const styles = win.getComputedStyle(input);
  const overlay = root.ownerDocument.createElement("span");
  overlay.className = "rv-number-stepper__rolling-value";
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    left: `${inputRect.left - rootRect.left - root.clientLeft}px`,
    top: `${inputRect.top - rootRect.top - root.clientTop}px`,
    width: `${inputRect.width}px`,
    height: `${inputRect.height}px`,
    padding: styles.padding,
    borderWidth: styles.borderWidth,
    font: styles.font,
    letterSpacing: styles.letterSpacing,
    color: styles.color,
    direction: styles.direction,
    justifyContent:
      styles.textAlign === "center"
        ? "center"
        : styles.textAlign === "right" ||
            (styles.textAlign === "start" && styles.direction === "rtl")
          ? "flex-end"
          : "flex-start",
  });
  const oldParts =
    previous.length === current.length ? Array.from(previous) : [previous];
  const newParts =
    previous.length === current.length ? Array.from(current) : [current];
  const animations: Animation[] = [];
  const direction = to > from ? 1 : -1;
  const event =
    direction > 0 && motion?.digitsUp
      ? "digitsUp"
      : direction < 0 && motion?.digitsDown
        ? "digitsDown"
        : "digits";
  if (motion?.[event]?.enabled === false) return;
  newParts.forEach((digit, index) => {
    const oldDigit = oldParts[index];
    if (oldDigit === digit) {
      overlay.append(root.ownerDocument.createTextNode(digit));
      return;
    }
    const column = root.ownerDocument.createElement("span");
    column.className = "rv-number-stepper__digit";
    const oldSpan = root.ownerDocument.createElement("span");
    const nextSpan = root.ownerDocument.createElement("span");
    oldSpan.textContent = oldDigit;
    nextSpan.textContent = digit;
    column.append(oldSpan, nextSpan);
    overlay.append(column);
    const options = {
      duration: 240,
      easing: "cubic-bezier(.2, .8, .2, 1)",
      fill: "both" as const,
    };
    const outgoing = presetAnimation(
      motion,
      event,
      {
        keyframes: [
          { transform: "translateY(0)", opacity: 1 },
          { transform: `translateY(${-direction * 100}%)`, opacity: 0 },
        ],
        options,
      },
      {
        fromY: "0%",
        toY: `${-direction * 100}%`,
        fromOpacity: 1,
        toOpacity: 0,
        direction,
      },
    );
    const incoming = presetAnimation(
      motion,
      event,
      {
        keyframes: [
          { transform: `translateY(${direction * 100}%)`, opacity: 0 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        options,
      },
      {
        fromY: `${direction * 100}%`,
        toY: "0%",
        fromOpacity: 0,
        toOpacity: 1,
        direction,
      },
    );
    if (outgoing && incoming) {
      animations.push(oldSpan.animate(outgoing.keyframes, outgoing.options));
      animations.push(nextSpan.animate(incoming.keyframes, incoming.options));
    }
  });
  if (!animations.length) return;
  root.append(overlay);
  input.classList.add("rv-number-stepper__animating");
  const cleanup = () => {
    input.removeEventListener("focus", stop);
    if (!overlay.isConnected) return;
    overlay.remove();
    input.classList.remove("rv-number-stepper__animating");
  };
  const stop = () => {
    animations.forEach((animation) => animation.cancel());
    cleanup();
  };
  input.addEventListener("focus", stop, { once: true });
  animations.forEach((animation) => void animation.finished.catch(() => {}));
  void Promise.all(animations.map((animation) => animation.finished)).then(
    cleanup,
    cleanup,
  );
  return stop;
}
