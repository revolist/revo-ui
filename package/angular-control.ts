import { Directive, ElementRef, inject, type DoCheck } from '@angular/core';
import { controlAttributes, type ControlTag } from './control-attributes';

/** Decorates Angular's native controls without replacing form bindings or DOM events. */
@Directive({
  selector:
    'button[rvControl],input[rvControl],select[rvControl],textarea[rvControl],summary[rvControl]',
  standalone: true,
})
export class UiControlDirective implements DoCheck {
  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private classes: string[] = [];

  ngDoCheck(): void {
    const element = this.element;
    const tag = element.localName as ControlTag;
    const type = element.getAttribute('type');
    const presentation = controlAttributes(tag, type === null ? {} : { type });
    const classes = (presentation.class as string).split(/\s+/).filter(Boolean);
    for (const name of this.classes)
      if (!classes.includes(name)) element.classList.remove(name);
    element.classList.add(...classes);
    this.classes = classes;
    if (tag === 'button' && !element.hasAttribute('type'))
      element.setAttribute('type', presentation.type);
  }
}
