import { cdnExamples } from './cdn-examples';
import { Highlight } from './example-source';

export function CdnGuide() {
  return (
    <article class="framework-guide markdown-guide">
      <h1>JavaScript / CDN</h1>
      <p>
        Load Revo UI from a URL with a standard browser import, or use a classic
        script and the RevoUI global. Both browser builds bundle the rendering
        runtime and shared utilities: no npm install, JSX compiler, import map
        or framework runtime is required. Modern browsers are required.
      </p>
      <p>
        The examples below target version {__UI_VERSION__}. These new browser
        files become available on jsDelivr and unpkg after that npm version is
        published. Keep JavaScript and CSS pinned to the same version; use a
        local HTTP server rather than opening an HTML file directly.
      </p>
      <h2>Browser ES module import</h2>
      <pre>
        <Highlight code={cdnExamples(__UI_VERSION__).module} />
      </pre>
      <h2>Classic script tag</h2>
      <pre>
        <Highlight code={cdnExamples(__UI_VERSION__).classic} />
      </pre>
      <p>
        For unpkg, replace the prefix with{' '}
        <code>https://unpkg.com/@revolist/ui@{__UI_VERSION__}</code> and keep
        the same file paths. Self-hosting the published files uses the same API.
        Call <code>mount.render</code> to update a control and{' '}
        <code>mount.destroy()</code> when its host view is disposed. Your labels
        and callbacks stay in ordinary JavaScript.
      </p>
      <p>
        The complete browser bundles include the component catalog and PDF
        engine. For smaller, tree-shaken application builds, use the npm
        framework entries above. React, Vue, Angular and Svelte adapters still
        require their own framework.
      </p>
      <h2>Optional PDF viewer setup</h2>
      <p>
        Also load <code>browser/pdf-viewer.css</code>. Copy{' '}
        <code>browser/pdf.worker.min.mjs</code> from the same package version to
        your own origin and pass its URL as <code>workerSrc</code>. The worker
        must be served over HTTP(S); a cross-origin CDN worker URL cannot be
        passed directly to the browser Worker constructor. Your PDF files and
        additional PDF assets must allow access from your page.
      </p>
    </article>
  );
}
