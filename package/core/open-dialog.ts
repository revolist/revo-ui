/** Find the nearest open native dialog through composed shadow ancestors. */
export function findOpenDialog(anchor: Element): HTMLDialogElement | undefined {
  let node: Element | null = anchor;
  while (node) {
    if (node.localName === 'dialog' && (node as HTMLDialogElement).open)
      return node as HTMLDialogElement;
    const root = node.getRootNode();
    node =
      node.assignedSlot ?? node.parentElement ?? ('host' in root ? (root as ShadowRoot).host : null);
  }
  return undefined;
}
