import { expect, it } from 'vitest';
import { ownsPopupTarget } from './popup-ownership';

it('follows nested portals without owning siblings or looping through cycles', () => {
  const host = document.createElement('div');
  host.innerHTML =
    '<div id="owner"><button aria-controls="missing child"></button></div><div id="child"><button aria-controls="grandchild"></button></div><div id="grandchild"><button aria-controls="owner">Choice</button></div><div id="sibling">Other</div>';
  document.body.append(host);
  try {
    const owner = host.querySelector<HTMLElement>('#owner')!;
    expect(
      ownsPopupTarget(owner, host.querySelector('#grandchild button')),
    ).toBe(true);
    expect(ownsPopupTarget(owner, host.querySelector('#sibling'))).toBe(false);
    expect(ownsPopupTarget(owner, owner.firstChild)).toBe(true);
    expect(ownsPopupTarget(null, owner)).toBe(false);
  } finally {
    host.remove();
  }
});
