import { expect, it } from 'vitest';
import {
  Input,
  TextArea,
  ButtonControl,
  Summary,
  Select,
  nativeControlTag,
} from './native-control';

it.each([
  [Input, 'input'],
  [TextArea, 'textarea'],
  [ButtonControl, 'button'],
  [Summary, 'summary'],
  [Select, 'select'],
] as const)(
  'retains native tag metadata for a referenced control',
  (component, tag) => {
    expect(nativeControlTag(component)).toBe(tag);
  },
);
