import { describe, expect, it } from 'vitest';
import { bindAriaDescription } from './aria-description';

describe('description binding', () => {
  it('preserves existing and later-added tokens and cleans up only once', () => {
    const anchor = document.createElement('button');
    anchor.setAttribute('aria-describedby', 'help');
    const release = bindAriaDescription(anchor, 'hint');
    expect(anchor.getAttribute('aria-describedby')).toBe('help hint');
    anchor.setAttribute('aria-describedby', 'help hint newer');
    release();
    release();
    expect(anchor.getAttribute('aria-describedby')).toBe('help newer');
  });
  it('does not remove a token already owned by the host', () => {
    const anchor = document.createElement('button');
    anchor.setAttribute('aria-describedby', 'hint');
    bindAriaDescription(anchor, 'hint')();
    expect(anchor.getAttribute('aria-describedby')).toBe('hint');
  });
});
