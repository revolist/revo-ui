import { h } from 'preact';
import { useState } from 'preact/hooks';
import {
  AiAssistant,
  AiChatComposer,
  AiSuggestions,
  AiActionStatus,
  AiResult,
} from '@revolist/ui/preact';
import { Example } from './catalog';

export function AiExamples() {
  const [value, setValue] = useState('');
  const [running, setRunning] = useState(true);
  const [request, setRequest] = useState('Only Europe');
  return (
    <>
      <Example title="Prompt states">
        <AiChatComposer
          label="Cancellable request"
          value={request}
          onValueChange={setRequest}
          onSubmit={() => setRunning(true)}
          busy={running}
          onStop={() => setRunning(false)}
          textareaProps={{
            className: 'catalog-ai-sized-prompt',
            rows: 3,
            style: { minHeight: '5rem', maxHeight: '10rem' },
          }}
        />
        <AiActionStatus
          phase={running ? 'understanding' : 'cancelled'}
          message={running ? 'Understanding your request…' : 'Request stopped.'}
        />
        <AiChatComposer
          label="Busy request"
          value="Sort highest amount first"
          onValueChange={() => {}}
          onSubmit={() => {}}
          busy
          hint="Loading matching rows…"
        />
        <AiChatComposer
          label="Unavailable request"
          value=""
          onValueChange={() => {}}
          onSubmit={() => {}}
          disabled
          hint="AI is unavailable for this view."
        />
      </Example>
      <Example title="Action states">
        <AiAssistant>
          <AiActionStatus
            phase="understanding"
            message="Understanding your request…"
          />
          <AiActionStatus phase="applying" message="Loading matching rows…" />
          <AiActionStatus
            phase="error"
            message="The server could not load this view. Your previous view is unchanged."
          />
          <AiActionStatus
            phase="clarification"
            message={
              value ? `Selected ${value}.` : 'Which date column should be used?'
            }
          />
          <AiSuggestions
            items={['Order date', 'Due date']}
            onSelect={setValue}
          />
          <AiResult
            summary="Filtered to Europe. Sorted by amount descending."
            matchedRows={0}
          />
        </AiAssistant>
      </Example>
    </>
  );
}
