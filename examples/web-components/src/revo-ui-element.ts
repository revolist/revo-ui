import { createFrameworkMount, uiComponents, type UiFrameworkMount } from '@revolist/ui/framework';
import '@revolist/ui/styles.css';

/** Example custom-element adapter using the published UI component catalog. */
export class RevoUiElement extends HTMLElement {
  static observedAttributes = ['component'];
  private readonly container = document.createElement('div');
  private mount: UiFrameworkMount<unknown> | undefined;
  private currentProps: Record<string, unknown> = {};

  get props(): Record<string, unknown> {
    return this.currentProps;
  }

  set props(value: Record<string, unknown>) {
    this.currentProps = value;
    if (this.isConnected) this.renderComponent();
  }

  connectedCallback() {
    const assigned = Object.getOwnPropertyDescriptor(this, 'props');
    if (assigned) {
      Reflect.deleteProperty(this, 'props');
      this.currentProps = assigned.value;
    }
    this.append(this.container);
    this.renderComponent();
  }

  disconnectedCallback() {
    this.mount?.destroy();
    this.mount = undefined;
  }

  attributeChangedCallback() {
    if (this.isConnected) this.renderComponent();
  }

  private renderComponent() {
    const component = this.getAttribute('component');
    if (!component || !Object.hasOwn(uiComponents, component)) {
      this.mount?.destroy();
      this.mount = undefined;
      if (!component) return;
      this.dispatchEvent(new CustomEvent('ui-error', {
        detail: new Error(`Unknown UI component: ${component}`),
        bubbles: true,
        composed: true,
      }));
      return;
    }
    this.mount ??= createFrameworkMount(this.container, () => {});
    this.mount.render(uiComponents[component as keyof typeof uiComponents], this.currentProps);
  }
}

if (!customElements.get('revo-ui')) {
  customElements.define('revo-ui', RevoUiElement);
}
