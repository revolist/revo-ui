/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import type { JSX } from 'preact';
import { useContext } from 'preact/hooks';
import { FormFieldContext } from './form-controls/field-context';

/** Carries native fieldset restrictions to custom selection controls. */
export function Fieldset(props: JSX.IntrinsicElements['fieldset']) {
  const parent = useContext(FormFieldContext);
  const disabled = parent.disabled || !!props.disabled;
  return (
    <FormFieldContext.Provider value={{ ...parent, disabled }}>
      <fieldset {...props} disabled={disabled} />
    </FormFieldContext.Provider>
  );
}
