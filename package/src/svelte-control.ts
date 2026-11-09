import { controlAttributes, type ControlTag } from './control-attributes';

/** A transparent Svelte action: native bindings, refs and events stay on the
 * consumer's element, while shared UI owns presentation and button defaults. */
export function rvControl(element: HTMLElement): { destroy(): void } {
  let applied: string[] = [];
  const apply = () => {
    const tag = element.localName as ControlTag;
    const attributes = controlAttributes(tag, {
      ...(tag === 'input' ? { type: (element as HTMLInputElement).type } : {}),
    });
    const classes: string[] = attributes.class.split(/\s+/).filter(Boolean);
    for (const name of applied)
      if (!classes.includes(name)) element.classList.remove(name);
    for (const name of classes)
      if (!element.classList.contains(name)) element.classList.add(name);
    applied = classes;
    if (tag === 'button' && !element.hasAttribute('type'))
      element.setAttribute('type', attributes.type);
  };
  apply();
  const observer = new element.ownerDocument.defaultView!.MutationObserver(
    apply,
  );
  observer.observe(element, {
    attributes: true,
    attributeFilter: ['class', 'type'],
  });
  return { destroy: () => observer.disconnect() };
}
