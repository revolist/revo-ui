// Product bundles can contain separate copies of this utility. Store ownership
// on the document with a shared key so they still coordinate without dependencies.
const key = Symbol.for('@revolist/tooltip-owner');
interface TooltipOwner {
  owner: object;
  dismiss(): void;
}
type TooltipDocument = Document & { [key]?: TooltipOwner };

/** Showing a tooltip retires the previous presenter, including its timers/ARIA. */
export function claimTooltip(
  document: Document,
  owner: object,
  dismiss: () => void,
): void {
  const scope = document as TooltipDocument;
  const previous = scope[key];
  if (previous?.owner === owner) return;
  Object.defineProperty(scope, key, {
    configurable: true,
    writable: true,
    value: { owner, dismiss },
  });
  previous?.dismiss();
}

/** A delayed hide or destroyed presenter must never release a newer owner. */
export function releaseTooltip(document: Document, owner: object): void {
  const scope = document as TooltipDocument;
  if (scope[key]?.owner === owner) delete scope[key];
}
