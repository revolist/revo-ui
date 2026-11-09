import '@angular/compiler';
import '@revolist/ui/styles.scss';
import { h as preactH, render } from 'preact';
import { useState as usePreactState } from 'preact/hooks';
import { createElement as reactH, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, h as vueH, ref } from 'vue';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { mount } from 'svelte';
import {
  PdfViewer as PreactPdfViewer,
  PdfViewerToolbar as PreactPdfToolbar,
} from '@revolist/ui/preact';
import {
  PdfViewer as ReactPdfViewer,
  PdfViewerToolbar as ReactPdfToolbar,
} from '@revolist/ui/react';
import {
  PdfViewer as VuePdfViewer,
  PdfViewerToolbar as VuePdfToolbar,
} from '@revolist/ui/vue';
import { UiComponent, UiSlotDirective } from '@revolist/ui/angular';
import { createPdfViewer } from '@revolist/ui/pdf-viewer';
import PdfSvelteHarness from './PdfSvelteHarness.svelte';
import { pdfProps } from './pdf-common';

function host() {
  const element = document.createElement('div');
  document.body.append(element);
  return element;
}
function ReactHarness() {
  const [mounted, setMounted] = useState(true),
    [configured, setConfigured] = useState(false),
    [page, setPage] = useState(0);
  return reactH(
    'section',
    { 'aria-label': 'React PDF' },
    reactH(
      'button',
      { onClick: () => setMounted(!mounted) },
      'Toggle React PDF',
    ),
    reactH(
      'button',
      { onClick: () => setConfigured(!configured) },
      'Configure React PDF',
    ),
    reactH('output', null, page),
    mounted &&
      reactH(ReactPdfViewer, {
        ...pdfProps(configured),
        onPageChange: setPage,
        renderToolbar: (_controller, _state, props) =>
          reactH(ReactPdfToolbar, props),
      }),
  );
}
function PreactHarness() {
  const [mounted, setMounted] = usePreactState(true),
    [configured, setConfigured] = usePreactState(false),
    [page, setPage] = usePreactState(0);
  return preactH(
    'section',
    { 'aria-label': 'Preact PDF' },
    preactH(
      'button',
      { onClick: () => setMounted(!mounted) },
      'Toggle Preact PDF',
    ),
    preactH(
      'button',
      { onClick: () => setConfigured(!configured) },
      'Configure Preact PDF',
    ),
    preactH('output', null, page),
    mounted &&
      preactH(PreactPdfViewer, {
        ...pdfProps(configured),
        onPageChange: setPage,
        renderToolbar: (_controller, _state, props) =>
          preactH(PreactPdfToolbar, props),
      }),
  );
}
createRoot(host()).render(reactH(ReactHarness));
render(preactH(PreactHarness), host());
createApp({
  setup() {
    const mounted = ref(true),
      configured = ref(false),
      page = ref(0);
    return () =>
      vueH('section', { 'aria-label': 'Vue PDF' }, [
        vueH(
          'button',
          { onClick: () => (mounted.value = !mounted.value) },
          'Toggle Vue PDF',
        ),
        vueH(
          'button',
          { onClick: () => (configured.value = !configured.value) },
          'Configure Vue PDF',
        ),
        vueH('output', page.value),
        mounted.value &&
          vueH(
            VuePdfViewer,
            {
              ...pdfProps(configured.value),
              onPageChange: (next: number) => (page.value = next),
            },
            {
              toolbar: ({ toolbarProps }: any) =>
                vueH(VuePdfToolbar, toolbarProps),
            },
          ),
      ]);
  },
}).mount(host());

@Component({
  selector: 'pdf-angular-harness',
  standalone: true,
  imports: [UiComponent, UiSlotDirective],
  template: `<section aria-label="Angular PDF">
    <button (click)="mounted = !mounted">Toggle Angular PDF</button>
    <button (click)="configure()">Configure Angular PDF</button>
    <output>{{ page }}</output>
    @if (mounted) {
      <rv-ui component="PdfViewer" [props]="props" (uiEvent)="event($event)">
        <ng-template rvUiSlot="toolbar" let-toolbarProps="toolbarProps">
          <rv-ui component="PdfViewerToolbar" [props]="toolbarProps"></rv-ui>
        </ng-template>
      </rv-ui>
    }
  </section>`,
})
class AngularHarness {
  mounted = true;
  configured = false;
  page = 0;
  props = { ...pdfProps(), onPageChange: (_page: number) => {} };
  configure() {
    this.configured = !this.configured;
    this.props = {
      ...pdfProps(this.configured),
      onPageChange: (_page: number) => {},
    };
  }
  event(event: { name: string; args: unknown[] }) {
    if (event.name === 'onPageChange') this.page = event.args[0] as number;
  }
}
const angular = document.createElement('pdf-angular-harness');
document.body.append(angular);
void bootstrapApplication(AngularHarness);
mount(PdfSvelteHarness, { target: host() });

// Native uses the framework-neutral mount and commands, with explicit host teardown.
const section = document.createElement('section');
section.setAttribute('aria-label', 'Native PDF');
const toggle = document.createElement('button');
toggle.textContent = 'Toggle Native PDF';
const configure = document.createElement('button');
configure.textContent = 'Configure Native PDF';
const output = document.createElement('output');
const target = document.createElement('div');
section.append(toggle, configure, output, target);
document.body.append(section);
let configured = false;
const options = () => ({
  ...pdfProps(configured),
  onPageChange: (page: number) => (output.textContent = String(page)),
});
let native: ReturnType<typeof createPdfViewer> | undefined = createPdfViewer(
  target,
  options(),
);
toggle.onclick = () => {
  if (native) {
    native.destroy();
    native = undefined;
  } else native = createPdfViewer(target, options());
};
configure.onclick = () => {
  configured = !configured;
  native?.destroy();
  native = createPdfViewer(target, options());
};
