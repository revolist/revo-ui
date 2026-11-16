import { Component, signal } from "@angular/core";
import { UiComponent } from "@revolist/ui/angular/unstyled";

@Component({
  selector: "app-root",
  imports: [UiComponent],
  template: `
    <main>
      <h1>Angular report</h1>
      <p>This text renders on the server. The button mounts in the browser.</p>
      <rv-ui
        ngSkipHydration
        component="SvgButton"
        [props]="{
          label: 'Save ' + count(),
          visibleLabel: 'Save ' + count(),
          onClick: save,
        }"
      />
    </main>
  `,
})
export class App {
  readonly count = signal(0);
  readonly save = () => this.count.update((value) => value + 1);
}
