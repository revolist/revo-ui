import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Button } from '@revolist/ui/preact';

// Vite supplies the authored source, so documentation stays aligned with its preview.
const files = import.meta.glob('./*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
export const slug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const sections = [
  ...(files['./main.tsx'] ?? '').matchAll(
    /<Section\s+title="([^"]+)"[^>]*>([\s\S]*?)<\/Section>/g,
  ),
];
export const examples = Object.entries(files)
  .flatMap(([file, source]) =>
    [
      ...source.matchAll(
        /<(?:Example|Specimen)\s+title="([^"]+)"[^>]*>([\s\S]*?)<\/(?:Example|Specimen)>/g,
      ),
    ].map((match) => {
      const lines = match[2].replace(/^\n|\n\s*$/g, '').split('\n');
      const indent = Math.min(
        ...lines
          .filter((line) => line.trim())
          .map((line) => line.match(/^\s*/)![0].length),
      );
      const owner = [
        ...source.slice(0, match.index).matchAll(/export function (\w+)/g),
      ].at(-1)?.[1];
      const family = sections.find((section) =>
        file === './main.tsx'
          ? section[2].includes(match[0])
          : owner && section[2].includes(`<${owner}`),
      )?.[1];
      return {
        family,
        title: match[1],
        id: slug(match[1]),
        file: file.slice(2),
        source,
        code: lines.map((line) => line.slice(indent)).join('\n'),
      };
    }),
  )
  .sort((a, b) => a.title.localeCompare(b.title));

export function Highlight({ code }: { code: string }) {
  const tokens = code.split(
    /("[^"\n]*"|'[^'\n]*'|`[^`]*`|\/\/[^\n]*|\b(?:import|from|const|let|return|function|export|type|if|true|false|null)\b|\b[A-Z][A-Za-z0-9]*\b)/g,
  );
  return (
    <code>
      {tokens.map((token, index) => (
        <span
          key={index}
          class={
            /^["'`]/.test(token)
              ? 'syntax-string'
              : token.startsWith('//')
                ? 'syntax-comment'
                : /^(import|from|const|let|return|function|export|type|if|true|false|null)$/.test(
                      token,
                    )
                  ? 'syntax-keyword'
                  : /^[A-Z]\w*$/.test(token)
                    ? 'syntax-component'
                    : undefined
          }
        >
          {token}
        </span>
      ))}
    </code>
  );
}

export function ExampleCode({ title }: { title: string }) {
  const example = examples.find((item) => item.title === title);
  const [expanded, setExpanded] = useState(false);
  const [full, setFull] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!example) return null;
  const code = full ? example.source : example.code;
  return (
    <div class={`example-code${expanded ? ' is-expanded' : ''}`}>
      <div class="example-code-toolbar">
        <span>{full ? example.file : 'Usage · TSX'}</span>
        <div>
          {expanded && (
            <Button
              size="compact"
              variant="ghost"
              onClick={() => setFull(!full)}
            >
              {full ? 'Usage only' : 'Full source'}
            </Button>
          )}
          {expanded && (
            <Button
              size="compact"
              variant="ghost"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? 'Copied' : 'Copy code'}
            </Button>
          )}
        </div>
      </div>
      <div
        id={`code-${slug(title)}`}
        class="example-code-body"
        aria-hidden={!expanded}
      >
        <pre tabIndex={expanded ? 0 : -1} aria-label={`${title} usage`}>
          <Highlight code={code} />
        </pre>
      </div>
      <div class="example-code-toggle">
        <Button
          aria-expanded={expanded}
          aria-controls={`code-${slug(title)}`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Collapse code' : 'View code'}
        </Button>
      </div>
    </div>
  );
}
