import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { HtmlEditor, HtmlSyntax, formatRichTextHtml } from '@revolist/ui/rich-text';
import { Example } from './catalog';

export function RichTextEditorExample() {
  const [saved, setSaved] = useState(
    '<h2>Launch notes</h2><p>Keep cell notes <strong>simple</strong> and readable.</p>' +
      '<blockquote><p>Focus on the next useful step.</p></blockquote>' +
      '<pre>const ready = true;\nlaunch();</pre>' +
      '<ul><li>Review changes</li><li>Share with the team</li></ul>',
  );
  const [revision, setRevision] = useState(0);
  const formattedHtml = useMemo(() => formatRichTextHtml(saved) || '<!-- Empty document -->', [saved]);
  return (
    <Example title="HTML Rich Text Editor" wide>
      <HtmlEditor
        key={revision}
        value={saved}
        autoApply={false}
        actions={{ apply: 'Save' }}
        onApply={(value) => {
          setSaved(value);
          setRevision((current) => current + 1);
        }}
        onCancel={() => setRevision((current) => current + 1)}
      />
      <div class="catalog-rich-text-result">
        <span>Saved HTML</span>
        <pre tabIndex={0}><output aria-label="Saved HTML"><HtmlSyntax code={formattedHtml} /></output></pre>
      </div>
    </Example>
  );
}
