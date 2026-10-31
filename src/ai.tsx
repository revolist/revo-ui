import { h } from 'preact';
import { useRef, useState } from 'preact/hooks';
import {
  AiAssistant,
  AiPromptInput,
  AiSuggestions,
  AiActionStatus,
  AiResult,
  AiRequestTrail,
  type AiRequestTrailItem,
  Button,
  type AiActionPhase,
} from '@revolist/ui/preact';
import { Example } from './catalog';

export function AiExamples() {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState<AiActionPhase>('idle');
  const [running, setRunning] = useState(true);
  const [request, setRequest] = useState('Only Europe');
  const [steps, setSteps] = useState<AiRequestTrailItem[]>([]);
  const nextStep = useRef(0);
  const assistantHost = useRef<HTMLDivElement>(null);
  const busy = phase === 'understanding';
  const submit = (prompt: string) => {
    setValue('');
    const step = { id: String(++nextStep.current), label: prompt };
    setSteps((current) => [...current, step]);
    setMessage(`Example request: ${prompt}`);
    setPhase('completed');
  };
  return (
    <>
      <Example title="View assistant">
        <div ref={assistantHost} style={{ width: '100%', minWidth: 0 }}>
          <AiAssistant footer="Presentation example · Column metadata only">
            <AiSuggestions
              items={[
                'Show orders above €1,000',
                'Sort highest amount first',
                'Only Europe',
                'Exclude cancelled orders',
              ]}
              onSelect={submit}
              disabled={busy}
            />
            <AiPromptInput
              value={value}
              onValueChange={setValue}
              onSubmit={submit}
              busy={busy}
              onStop={() => setPhase('cancelled')}
              hint={steps.length ? '' : undefined}
              actions={
                <AiRequestTrail
                  items={steps}
                  onRemove={(id) => {
                    setSteps((current) =>
                      current.filter((step) => step.id !== id),
                    );
                    setMessage('Request removed.');
                  }}
                  onClear={() => {
                    setSteps([]);
                    setMessage('Starting view restored.');
                  }}
                  onEmpty={() =>
                    assistantHost.current?.querySelector('textarea')?.focus()
                  }
                />
              }
            />
            <AiActionStatus
              phase={phase}
              message={phase === 'completed' ? '' : message}
            />
            {phase === 'completed' && (
              <AiResult
                summary={message}
                matchedRows={24}
                actions={
                  <Button
                    size="compact"
                    onClick={() => {
                      setMessage('Previous view restored.');
                      setSteps((current) => current.slice(0, -1));
                    }}
                  >
                    Restore previous view
                  </Button>
                }
              />
            )}
          </AiAssistant>
        </div>
      </Example>
      <Example title="Prompt states">
        <AiPromptInput
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
        <AiPromptInput
          label="Busy request"
          value="Sort highest amount first"
          onValueChange={() => {}}
          onSubmit={() => {}}
          busy
          hint="Loading matching rows…"
        />
        <AiPromptInput
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
            message="Which date column should be used?"
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
