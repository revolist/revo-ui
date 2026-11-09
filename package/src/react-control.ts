import {
  createElement,
  forwardRef,
  type ComponentPropsWithoutRef,
} from 'react';
import { controlAttributes, type ControlTag } from './control-attributes';

/** React adapters keep native refs and event contracts while sharing control presentation. */
function control<K extends ControlTag>(tag: K) {
  const Component = forwardRef<
    HTMLElementTagNameMap[K],
    ComponentPropsWithoutRef<K>
  >((props, ref) => {
    const { class: className, ...attributes } = controlAttributes(tag, props);
    return createElement(tag, { ...attributes, className, ref });
  });
  Component.displayName = `Ui${tag[0].toUpperCase()}${tag.slice(1)}`;
  return Component;
}

export const ButtonControl = control('button');
export const Input = control('input');
/** @deprecated Prefer Dropdown from @revolist/ui/react for new controls. */
export const Select = control('select');
export const TextArea = control('textarea');
export const Summary = control('summary');
