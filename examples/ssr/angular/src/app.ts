import { Component, signal } from "@angular/core";
import { SvgButton } from "@revolist/ui/angular/svg-button/unstyled";

@Component({
  selector: "app-root",
  imports: [SvgButton],
  template: `
    <main>
      <h1>Angular report</h1>
      <p>This text renders on the server. The button mounts in the browser.</p>
      <rv-svg-button
        [label]="'Save ' + count()"
        [visibleLabel]="'Save ' + count()"
        (click)="count.set(count() + 1)"
      />
    </main>
  `,
})
export class App {
  readonly count = signal(0);
}
