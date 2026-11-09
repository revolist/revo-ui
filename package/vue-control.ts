import type { ObjectDirective } from 'vue';
import { controlAttributes, type ControlTag } from './control-attributes';

const appliedClasses = new WeakMap<HTMLElement, string[]>();

function applyControl(element: HTMLElement): void {
  for (const name of appliedClasses.get(element) ?? [])
    element.classList.remove(name);
  const tag = element.localName as ControlTag;
  const attributes = controlAttributes(tag, {
    ...(tag === 'input' ? { type: (element as HTMLInputElement).type } : {}),
  });
  const classes = attributes.class.split(/\s+/).filter(Boolean);
  element.classList.add(...classes);
  appliedClasses.set(element, classes);
  if (tag === 'button' && !element.hasAttribute('type'))
    element.setAttribute('type', attributes.type);
}

/** Native controls keep Vue's v-model, DOM refs and events. Shared UI owns their
 * presentation; reapply after Vue patches dynamic classes or input types.
 * SSR templates must also declare the shared class (rv-btn, rv-control, etc.)
 * so presentation is available before this client-side directive runs. */
export const vRvControl: ObjectDirective<HTMLElement> = {
  beforeMount: applyControl,
  updated: applyControl,
  unmounted(element) {
    appliedClasses.delete(element);
  },
};
