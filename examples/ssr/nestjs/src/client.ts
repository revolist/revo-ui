import { createFrameworkMount } from "@revolist/ui/framework/unstyled";
import { SvgButton } from "@revolist/ui/preact/unstyled";
import "@revolist/ui/styles/base.css";

const host = document.getElementById("report-action")!;
const mount = createFrameworkMount(host, () => {}, { styles: false });
let count = 0;

function render() {
  mount.render(SvgButton, {
    label: `Save ${count}`,
    visibleLabel: `Save ${count}`,
    onClick: () => {
      count += 1;
      render();
    },
  });
}

render();
