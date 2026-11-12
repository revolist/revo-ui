export interface ComponentStyles {
  id: string;
  css: string;
  order: number;
}

const componentSheets = new WeakMap<object, readonly ComponentStyles[]>();
const automaticStyles = true;
const styleConfigKey = Symbol.for('@revolist/ui/style-config');
type StyleConfig = { mode?: 'automatic' | 'external'; nonce?: string };
function rootConfig(root: Document | ShadowRoot): StyleConfig | undefined {
  return (root as unknown as Record<symbol, StyleConfig>)[styleConfigKey];
}
export function registerComponentStyles<T extends object>(
  component: T,
  styles: readonly ComponentStyles[],
): T {
  componentSheets.set(component, styles);
  return component;
}
export function componentStyles(component: object): readonly ComponentStyles[] {
  return componentSheets.get(component) ?? [];
}
/** Configure before mounting any adapter; configuration belongs to this root only. */
export function configureUiStyles(
  options: { mode?: 'automatic' | 'external'; nonce?: string },
  root: Document | ShadowRoot | undefined = typeof document === 'undefined'
    ? undefined
    : document,
): void {
  if (!root) return;
  Object.defineProperty(root, styleConfigKey, {
    value: options,
    configurable: true,
    writable: true,
  });
}
export function prepareComponentStyles(
  component: object,
  host: HTMLElement,
): void {
  const node = host.getRootNode();
  const root =
    node.nodeType === 11 && 'host' in node
      ? (node as ShadowRoot)
      : host.ownerDocument;
  ensureComponentStyles(root, componentStyles(component));
}
export function externalComponentStyles(root: Document | ShadowRoot): boolean {
  return (
    !automaticStyles ||
    rootConfig(root)?.mode === 'external' ||
    (root.nodeType !== 9 &&
      rootConfig(root.ownerDocument!)?.mode === 'external')
  );
}
const rootNonces = new WeakMap<Document | ShadowRoot, string>();
const rootStyles = new WeakMap<ParentNode, HTMLStyleElement[]>();

export function componentStyleNonce(
  root: Document | ShadowRoot,
): string | undefined {
  const document =
    root.nodeType === 9 ? (root as Document) : root.ownerDocument!;
  const source = document.querySelector<HTMLStyleElement | HTMLScriptElement>(
    'style[nonce], script[nonce]',
  );
  return (
    rootConfig(root)?.nonce ??
    rootConfig(document)?.nonce ??
    rootNonces.get(root) ??
    rootNonces.get(document) ??
    (source?.nonce || source?.getAttribute('nonce') || undefined)
  );
}

/** Install shared presentation before mounting controls, keeping application CSS last. */
export function ensureComponentStyles(
  root: Document | ShadowRoot,
  sheets: readonly ComponentStyles[],
  explicitNonce?: string,
): void {
  const document =
    root.nodeType === 9 ? (root as Document) : root.ownerDocument!;
  const requestedNonce = explicitNonce ?? componentStyleNonce(root);
  const targets: (Document | ShadowRoot)[] = [document];
  if (root.nodeType === 11) targets.push(root as ShadowRoot);
  for (const target of targets) {
    if (requestedNonce !== undefined) rootNonces.set(target, requestedNonce);
    const parent = target.nodeType === 9 ? document.head : target;
    const installed = (
      rootStyles.get(parent) ??
      Array.from(
        parent.querySelectorAll<HTMLStyleElement>(
          'style[data-rv-component-styles]',
        ),
      )
    ).filter((style) => style.parentNode === parent);
    rootStyles.set(parent, installed);
    if (externalComponentStyles(target)) continue;
    for (const sheet of sheets) {
      if (
        installed.some((style) => style.dataset.rvComponentStyles === sheet.id)
      )
        continue;
      const style = document.createElement('style');
      style.dataset.rvComponentStyles = sheet.id;
      style.dataset.rvStyleOrder = String(sheet.order);
      const nonce =
        explicitNonce ??
        rootConfig(target)?.nonce ??
        componentStyleNonce(target);
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
      installed.push(style);
      installed.sort(
        (left, right) =>
          Number(left.dataset.rvStyleOrder) -
          Number(right.dataset.rvStyleOrder),
      );
    }
  }
}
