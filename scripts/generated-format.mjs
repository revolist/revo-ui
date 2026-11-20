import { format } from 'prettier';
import svelte from 'prettier-plugin-svelte';

/** Keep generated files aligned with the repository formatter. */
export function formatGenerated(content, filepath) {
  return format(content, { filepath, singleQuote: true, plugins: [svelte] });
}
