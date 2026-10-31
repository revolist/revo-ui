import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import {
  AiChat,
  AiChatContent,
  AiChatComposer,
  AiMessage,
  AiMessageContent,
  AiMessageActions,
  AiReasoning,
  AiTask,
  AiTaskItem,
  AiSuggestions,
  Button,
} from '@revolist/ui/preact';
import { Example } from './catalog';

interface DemoMessage {
  id: number;
  from: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
  cancelled?: boolean;
}
const response =
  'The visible view contains 20 Europe orders. This is a scripted UI example; no data was queried and no model was called.';
export function AiChatExample() {
  const [messages, setMessages] = useState<DemoMessage[]>([
    { id: 1, from: 'user', text: 'Summarize the Europe orders.' },
    { id: 2, from: 'assistant', text: response },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const next = useRef(2);
  const timer = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => () => clearInterval(timer.current), []);
  const submit = (text: string) => {
    if (busy || !text.trim()) return;
    const userId = ++next.current;
    const replyId = ++next.current;
    setMessages((current) => [
      ...current,
      { id: userId, from: 'user', text },
      { id: replyId, from: 'assistant', text: '', streaming: true },
    ]);
    setDraft('');
    setBusy(true);
    let length = 0;
    timer.current = setInterval(() => {
      length = Math.min(response.length, length + 9);
      const streaming = length < response.length;
      setMessages((current) =>
        current.map((message) =>
          message.id === replyId
            ? { ...message, text: response.slice(0, length), streaming }
            : message,
        ),
      );
      if (!streaming) {
        clearInterval(timer.current);
        setBusy(false);
      }
    }, 160);
  };
  const stop = () => {
    clearInterval(timer.current);
    setBusy(false);
    setMessages((current) =>
      current.map((message) =>
        message.streaming
          ? {
              ...message,
              streaming: false,
              cancelled: true,
              text: message.text || 'Reply stopped.',
            }
          : message,
      ),
    );
  };
  return (
    <Example title="Chat UI">
      <div style={{ width: '100%', minWidth: 0 }}>
        <p>
          Independent presentation components · Scripted streaming · No model
          calls
        </p>
        <Button
          size="compact"
          onClick={() =>
            setMessages((current) => [
              ...current,
              ...Array.from(
                { length: 8 },
                (_, index): DemoMessage => ({
                  id: ++next.current,
                  from: index % 2 ? 'assistant' : 'user',
                  text:
                    index % 2
                      ? response
                      : 'Show another example of the visible view.',
                }),
              ),
            ])
          }
        >
          Add sample turns
        </Button>
        <div
          style={{
            border: '1px solid var(--rv-ui-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            marginTop: '12px',
          }}
        >
          <AiChat style={{ height: 'auto', maxHeight: '480px' }}>
            <AiChatContent busy={busy}>
              {messages.map((message) => (
                <AiMessage
                  key={message.id}
                  from={message.from}
                  isStreaming={message.streaming}
                >
                  {message.from === 'assistant' && (
                    <>
                      <AiReasoning
                        isStreaming={message.streaming}
                        duration={message.streaming ? undefined : 1}
                      >
                        Host-provided work summary: read only approved fields
                        and keep the answer scoped to the visible view.
                      </AiReasoning>
                      <AiTask
                        title={
                          message.cancelled
                            ? 'Stopped reading visible orders'
                            : message.streaming
                              ? 'Reading visible orders'
                              : 'Read visible orders'
                        }
                        status={
                          message.cancelled
                            ? 'cancelled'
                            : message.streaming
                              ? 'running'
                              : 'completed'
                        }
                      >
                        <AiTaskItem>Read approved column metadata</AiTaskItem>
                        <AiTaskItem
                          status={
                            message.cancelled
                              ? 'cancelled'
                              : message.streaming
                                ? 'running'
                                : 'completed'
                          }
                        >
                          Summarize the visible Europe orders
                        </AiTaskItem>
                      </AiTask>
                    </>
                  )}
                  <AiMessageContent>
                    {message.text || 'Preparing a reply…'}
                  </AiMessageContent>
                  {message.from === 'assistant' && !message.streaming && (
                    <AiMessageActions>
                      <Button
                        variant="ghost"
                        size="compact"
                        onClick={() => setDraft('Show orders above 1000')}
                      >
                        Follow up
                      </Button>
                    </AiMessageActions>
                  )}
                </AiMessage>
              ))}
            </AiChatContent>
            <AiChatComposer
              value={draft}
              onValueChange={setDraft}
              onSubmit={submit}
              busy={busy}
              onStop={stop}
              footer={
                <AiSuggestions
                  items={[
                    'Only Europe',
                    'Summarize visible orders',
                    'Sort by amount',
                  ]}
                  onSelect={submit}
                  disabled={busy}
                />
              }
            />
          </AiChat>
        </div>
      </div>
    </Example>
  );
}
