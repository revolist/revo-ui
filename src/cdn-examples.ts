/** Shared by the documentation and the plain-HTTP packed-package browser test. */
export function cdnExamples(
  version: string,
  base = `https://cdn.jsdelivr.net/npm/@revolist/ui@${version}`,
) {
  const counter = `const mount = createFrameworkMount(document.querySelector('#report-action'), () => {});
let count = 0;
function update() {
  mount.render(uiComponents.Button, {
    variant: 'primary',
    children: 'Create report · ' + count,
    onClick: () => { count++; update(); },
  });
}
update();
// For a single-page app, call mount.destroy() before removing this view.
window.addEventListener('pagehide', () => mount.destroy(), { once: true });`;
  const prefix = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Revo UI without a build step</title>
<link rel="stylesheet" href="${base}/styles.css">
<body class="rv-ui">
<div id="report-action"></div>`;
  return {
    module: `${prefix}
<script type="module">
import { createFrameworkMount, uiComponents } from '${base}/browser/revo-ui.js';
${counter}
</script>
</body>
</html>`,
    classic: `${prefix}
<script src="${base}/browser/revo-ui.global.js"></script>
<script>
const { createFrameworkMount, uiComponents } = RevoUI;
${counter}
</script>
</body>
</html>`,
  };
}
