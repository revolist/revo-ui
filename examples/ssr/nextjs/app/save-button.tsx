'use client';

import { useState } from 'react';
import { SvgButton } from '@revolist/ui/react/unstyled';

export function SaveButton() {
  const [count, setCount] = useState(0);
  return (
    <SvgButton
      label={`Save ${count}`}
      visibleLabel={`Save ${count}`}
      onClick={() => setCount((value) => value + 1)}
    />
  );
}
