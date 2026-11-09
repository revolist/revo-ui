/** @jsxImportSource preact */
import { h, type ComponentChildren, type RefObject } from 'preact';
import { DropdownPopup } from '../dropdown/popup';

type ResourcePickerPopupProps = {
  readonly triggerRef: RefObject<HTMLDivElement>;
  readonly portalTarget: HTMLElement;
  readonly popupId: string;
  readonly children: ComponentChildren;
};

/** Keep resource selection policy in the picker and geometry in the shared popup. */
export function ResourcePickerPopup({
  triggerRef,
  portalTarget,
  popupId,
  children,
}: ResourcePickerPopupProps) {
  return (
    <DropdownPopup
      triggerRef={triggerRef}
      portalTarget={portalTarget}
      dropdownMenuId={popupId}
      popupClassName="rv-resource-picker__portal"
      matchTriggerWidth
      onPointerRelease={(event) => {
        if (event.type === 'mouseup') event.preventDefault();
        else event.stopPropagation();
      }}
    >
      {children}
    </DropdownPopup>
  );
}
