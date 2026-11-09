import { createContext } from 'preact';
export const FormFieldContext = createContext<{
  labelId?: string;
  hintId?: string;
  disabled?: boolean;
}>({});
