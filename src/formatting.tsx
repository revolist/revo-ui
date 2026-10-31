import { h } from 'preact';
import { useState } from 'preact/hooks';
import bold from '@fortawesome/fontawesome-free/svgs/solid/bold.svg?raw';
import italic from '@fortawesome/fontawesome-free/svgs/solid/italic.svg?raw';
import underline from '@fortawesome/fontawesome-free/svgs/solid/underline.svg?raw';
import strike from '@fortawesome/fontawesome-free/svgs/solid/strikethrough.svg?raw';
import left from '@fortawesome/fontawesome-free/svgs/solid/align-left.svg?raw';
import center from '@fortawesome/fontawesome-free/svgs/solid/align-center.svg?raw';
import right from '@fortawesome/fontawesome-free/svgs/solid/align-right.svg?raw';
import sliders from '@fortawesome/fontawesome-free/svgs/solid/sliders.svg?raw';
import {
  TypographyControls,
  IconChoiceGroup,
  InspectorSection,
  ComparisonPreview,
  type TypographyValue,
} from '@revolist/ui/formatting';
import { Input } from '@revolist/ui/native-control';
import { Example } from './catalog';
export function FormattingExamples() {
  const [typography, setTypography] = useState<TypographyValue>({});
  const [alignment, setAlignment] = useState('left');
  return (
    <>
      <Example title="Typography controls">
        <TypographyControls
          value={typography}
          icons={{ bold, italic, underline, strike }}
          labels={{
            fontFamily: 'Font',
            defaultFont: 'Default',
            fontSize: 'Size',
            typographySection: 'Text style',
            bold: 'Bold',
            italic: 'Italic',
            underline: 'Underline',
            strike: 'Strikethrough',
          }}
          onChange={(patch) =>
            setTypography((value) => ({ ...value, ...patch }))
          }
        />
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.fontSize
              ? `${typography.fontSize}px`
              : undefined,
            fontWeight: typography.bold ? '700' : '400',
            fontStyle: typography.italic ? 'italic' : 'normal',
            textDecoration: [
              typography.underline ? 'underline' : '',
              typography.strike ? 'line-through' : '',
            ].join(' '),
          }}
        >
          The quick brown fox
        </p>
      </Example>
      <Example title="Icon choice group">
        <IconChoiceGroup
          value={alignment}
          ariaLabel="Text alignment"
          options={[
            { value: 'left', label: 'Align left', icon: left },
            { value: 'center', label: 'Align center', icon: center },
            { value: 'right', label: 'Align right', icon: right },
          ]}
          onChange={setAlignment}
        />
        <p style={{ textAlign: alignment as 'left' | 'center' | 'right' }}>
          Aligned text
        </p>
      </Example>
      <Example title="Inspector section">
        <InspectorSection
          title="Details"
          icon={sliders}
          expandLabel="Expand Details"
          collapseLabel="Collapse Details"
          open
        >
          <label class="rv-field">
            <span class="rv-field__label">Display name</span>
            <Input placeholder="Display name" />
          </label>
        </InspectorSection>
      </Example>
      <Example title="Comparison preview">
        <ComparisonPreview
          originalValue="1234.5"
          formatted="$1,234.50"
          formattedStyle={{
            justifyContent: 'flex-end',
            display: 'flex',
            alignItems: 'center',
          }}
          labels={{
            title: 'Preview',
            original: 'Original',
            formatted: 'Formatted',
            hint: 'Presentation only. The stored value is unchanged.',
          }}
        />
      </Example>
    </>
  );
}
