import { controlAttributes, type ControlTag } from './control-attributes';

const selector = 'button,input,select,textarea,summary';
const presentationClasses = [
  'rv-btn',
  'rv-control',
  'rv-checkbox',
  'rv-radio',
  'rv-native-slider',
  'rv-disclosure-summary',
];

/** Apply shared control presentation to existing HTML without replacing nodes,
 * values, event listeners, or framework ownership. Call again after replacing
 * HTML or changing an input type. No observer or lifecycle cleanup is needed. */
export function applyControlPresentation(root: ParentNode): void {
  const controls = Array.from(root.querySelectorAll<HTMLElement>(selector));
  if (
    'matches' in root &&
    typeof root.matches === 'function' &&
    root.matches(selector)
  ) {
    controls.unshift(root as HTMLElement);
  }
  for (const element of controls) {
    const tag = element.localName as ControlTag;
    const attributes = controlAttributes(tag, {
      class: [...element.classList]
        .filter((name) => !presentationClasses.includes(name))
        .join(' '),
      ...(tag === 'input' ? { type: (element as HTMLInputElement).type } : {}),
      ...(tag === 'button' && element.hasAttribute('type')
        ? { type: element.getAttribute('type') }
        : {}),
    });
    element.className = attributes.class;
    if (tag === 'button' && !element.hasAttribute('type'))
      element.setAttribute('type', attributes.type);
  }
}
