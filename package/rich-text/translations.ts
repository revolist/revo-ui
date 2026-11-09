/** Visible and accessible labels for the shared HTML editor. */
export interface HtmlEditorText {
  keyboardHelp?: string;
  codeHelp?: string;
  visual: string;
  source: string;
  label: string;
  unsafeLink: string;
  requiredValue?: string;
  tooLong?: string;
  link: string;
  linkUrl: string;
  popupLabel?: string;
  formatting?: string;
  inlineFormatting?: string;
  headings?: string;
  structure?: string;
  links?: string;
  bold?: string;
  italic?: string;
  strike?: string;
  code?: string;
  heading1?: string;
  heading2?: string;
  bullets?: string;
  numberedList?: string;
  quote?: string;
  codeBlock?: string;
}
export const defaultHtmlEditorText: Required<HtmlEditorText> = {
  keyboardHelp:
    'Shift+Enter for a line break. Alt+F10 for formatting; Esc returns to text.',
  codeHelp:
    'Code: Enter for a new line. Press Enter three times or ↓ at the end to continue outside.',
  visual: 'Visual',
  source: 'HTML',
  label: 'Rich text',
  unsafeLink: 'Use an HTTP, HTTPS, mailto or relative link.',
  requiredValue: 'Enter a value.',
  tooLong: 'The value exceeds the maximum length.',
  link: 'Add link',
  linkUrl: 'Link URL',
  popupLabel: 'Edit rich text',
  formatting: 'Text formatting',
  inlineFormatting: 'Inline formatting',
  headings: 'Headings',
  structure: 'Lists and blocks',
  links: 'Links',
  bold: 'Bold',
  italic: 'Italic',
  strike: 'Strike',
  code: 'Code',
  heading1: 'H1',
  heading2: 'H2',
  bullets: 'Bullets',
  numberedList: 'Numbered list',
  quote: 'Quote',
  codeBlock: 'Code block',
};
