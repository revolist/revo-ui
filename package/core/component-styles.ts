export interface ComponentStyles {
  id: string;
  css: string;
  order: number;
}

/** Install shared presentation before mounting controls, keeping application CSS last. */
export function ensureComponentStyles(
  host: HTMLElement,
  sheets: readonly ComponentStyles[],
): void {
  const document = host.ownerDocument;
  const root = host.getRootNode();
  const targets: (Document | ShadowRoot)[] = [document];
  if (root.nodeType === 11 && 'host' in root) targets.push(root as ShadowRoot);
  for (const target of targets) {
    const parent = target.nodeType === 9 ? document.head : target;
    for (const sheet of sheets) {
      const installed = Array.from(
        parent.querySelectorAll<HTMLStyleElement>(
          'style[data-rv-component-styles]',
        ),
      );
      if (
        installed.some((style) => style.dataset.rvComponentStyles === sheet.id)
      )
        continue;
      const style = document.createElement('style');
      style.dataset.rvComponentStyles = sheet.id;
      style.dataset.rvStyleOrder = String(sheet.order);
      const nonceSource = document.querySelector<
        HTMLStyleElement | HTMLScriptElement
      >('style[nonce], script[nonce]');
      const nonce = nonceSource?.nonce || nonceSource?.getAttribute('nonce');
      if (nonce) style.setAttribute('nonce', nonce);
      style.textContent = sheet.css;
      const following = installed.find(
        (node) => Number(node.dataset.rvStyleOrder) > sheet.order,
      );
      parent.insertBefore(
        style,
        following ??
          (installed.length
            ? installed.at(-1)!.nextSibling
            : parent.firstChild),
      );
    }
  }
}
