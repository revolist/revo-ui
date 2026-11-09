# Standalone chat UI

Chat presentation lives in `@revolist/ui`. Standalone components do not call a model, execute tools or own model conversation; their host supplies those behaviors. The existing grid assistant can optionally mount these same primitives with `ui: { mode: 'chat' }`. No new SDK or Markdown dependency is required. Mounted assistants accept `controlsMountTo` to render reactive undo/redo and view controls in a separate host, and `showClearChat: false` to omit the chat-clearing button. Both are optional; view controls stay inline and New conversation is a separate icon. It clears chat/draft and AI context without changing the workspace. Request history is hidden in chat by default, and uses an icon without a step count in toolbar mode (`showRequestHistory`). Workspace reset belongs to the application.

Inspired by the composition of shadcn's [Chat](https://ui.shadcn.com/docs/ai-elements/base/chat), [Message](https://ui.shadcn.com/docs/ai-elements/base/message), [Reasoning](https://ui.shadcn.com/docs/ai-elements/base/reasoning) and [Task](https://ui.shadcn.com/docs/ai-elements/base/task); implemented with the library's existing controls, disclosure, theme tokens and translation helpers.

```tsx
import {
  AiChat,
  AiChatContent,
  AiChatComposer,
  AiChatEmptyState,
  AiMessage,
  AiMessageContent,
  AiMessageActions,
  AiReasoning,
  AiTask,
  AiTaskItem,
  Button,
} from '@revolist/ui/ai';
import '@revolist/ui/styles.css';

// A bounded, natural-height panel. Use a defined host height for a docked, full-height chat.
// Host state is omitted here.
<AiChat label="Orders assistant" style={{ height: 'auto', maxHeight: '480px' }}>
  <AiChatContent busy={busy}>
    {messages.length === 0 && <AiChatEmptyState />}
    {messages.map((message) => (
      <AiMessage
        key={message.id}
        from={message.role}
        isStreaming={message.streaming}
      >
        <AiMessageContent>{message.text}</AiMessageContent>
        {message.role === 'assistant' && (
          <AiMessageActions>
            <Button
              variant="ghost"
              size="compact"
              onClick={() => retry(message.id)}
            >
              Retry
            </Button>
          </AiMessageActions>
        )}
      </AiMessage>
    ))}
  </AiChatContent>
  <AiChatComposer
    value={draft}
    onValueChange={setDraft}
    onSubmit={send}
    busy={busy}
    onStop={stop}
  />
</AiChat>;
```

Both mounted toolbar and chat presentations use this composer. Suggested requests appear inside its footer below the textarea; two are shown directly by default; `ui.maxVisibleSuggestions` controls that count, with a More (…) dropdown for additional choices. There is no separate suggestion row above the input.

The same exports are available from `@revolist/ui/preact`. React and Vue use `@revolist/ui/react` and `@revolist/ui/vue`; Angular/Svelte can use the existing generic component catalog. These are the existing UI adapters, not framework-specific copies of the chat implementation. Vue's composer supports its default `v-model`.

## Parts and contracts

| Component          | Main props / purpose                                                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AiChat`           | `label`, `style`, `children`; transcript/composer shell.                                                                                                                                                                                         |
| `AiChatContent`    | `autoScroll` (default true), `busy`, `label`, `jumpLabel`; accessible log with bounded overflow. Follows new content only at the live edge. Scrolling up pauses following; Jump to latest resumes it. Resize observation disconnects on unmount. |
| `AiChatEmptyState` | `title`, `description`, `children`; host chooses when to show it.                                                                                                                                                                                |
| `AiChatComposer`   | Same controlled props as `AiPromptInput`, with Message / Type a message… defaults. Reuses Enter/Shift+Enter/IME handling and Send/Stop. `actions` and `footer` compose suggestions or context.                                                   |
| `AiMessage`        | `from: 'user' \| 'assistant' \| 'system'`, optional `label`, `isStreaming`, `children`. Use stable keys when updating a streamed reply.                                                                                                          |
| `AiMessageContent` | `children`; text stays text. Host may pass a trusted Markdown renderer; no raw HTML parsing.                                                                                                                                                     |
| `AiMessageActions` | `label`, `children`; compose existing buttons for retry/edit/feedback/copy using host callbacks.                                                                                                                                                 |
| `AiReasoning`      | `isStreaming`, `title`, optional host-measured `duration` in seconds, `open`, `defaultOpen`, `onOpenChange`, `children`. Displays only a provider/host-published summary. Does not invent or expose hidden model reasoning.                      |
| `AiTask`           | `title`, `status`, disclosure props, `children`; shows actual task work.                                                                                                                                                                         |
| `AiTaskItem`       | `status`, `children`; compose each reported step. Status supports pending/running/completed/error/cancelled and includes accessible text.                                                                                                        |

All parts accept `className`. Components with built-in labels accept `translations` using `AiUiTranslations`; custom title/label text remains host-owned. Preact compositions can inherit `AiTranslationProvider`; independent framework adapters can receive translations explicitly.

Reasoning and tasks open automatically while running and close when finished unless `defaultOpen`, controlled `open`, or a manual choice determines otherwise. A user's manual choice wins until that component is remounted; key it by task/message ID. Before content arrives, the summary is a non-interactive status line; it becomes a disclosure once there is content. Native disclosure retains keyboard semantics. Durations and status updates are host inputs, not timers in the UI.

```tsx
<AiReasoning isStreaming={streaming} duration={elapsedSeconds}>
  {publishedSummary}
</AiReasoning>
<AiTask title="Read visible orders" status={running ? 'running' : 'completed'}>
  <AiTaskItem>Read approved column metadata</AiTaskItem>
  <AiTaskItem status={running ? 'running' : 'completed'}>Summarize the visible rows</AiTaskItem>
</AiTask>
```

Existing `AiSuggestions` and `AiChangePreview` can be placed directly inside messages or the composer. The host keeps approval, authorization, cancellation and disclosure policy. Never infer tool success from presentation status.

The shared UI gallery's **AI assistant → Chat UI** example exercises scripted streaming, Stop, work summaries, task steps, suggestions and follow-up actions without a provider key.

## Optional grid assistant chat mode

Set `aiAssistant.ui.mode` to `'chat'` to show submitted user requests and actual assistant/status responses with the existing `AiChat` and `AiMessage` components. Omit it to retain the toolbar presentation. The grid demo enables this shared configuration for TypeScript, Vue, React and Angular.

The mounted transcript is local and bounded to 50 messages and 64 KiB. It displays application-visible feedback, not hidden prompts or model reasoning. Read/action results and approval controls use the existing shared components; prepared changes still need Apply/Cancel. Undo/Redo, Restore and Reset remain separate grid operations.

Chat display is independent of model `conversation` and local `promptHistory`. Showing a message does not automatically send it or its data to a model. Existing `conversation`, `samples` and `answerFromAction` policies remain the only configured disclosure paths. Scripted interpreters still return scripted results; chat presentation does not create free-form AI answers.

The plugin's `clearChat()` restores the conversation’s starting view configuration and clears the displayed transcript, request steps and opt-in model memory. Source data edits and their undo history remain intact. Clearing is disabled during an active request or pending approval. It does not erase separately host-persisted prompt recall.

Structured action output uses `AiResultView` with separate `AiResultTable`, `AiResultMetrics`, and `AiResultText` components. Supply `AiActionResult.presentation` (or `AiAssistantMountState.result` for a standalone mount) instead of serializing JSON into chat. The presentation is explicit and bounded; raw action `data` stays outside the UI and model context unless the host discloses it. See [result components](./results/README.md) for types and extension steps.

For an optional welcome area, configure `ui.emptyState` on the grid assistant (or `emptyState` on `mountAiAssistant`). It appears only when the local transcript is empty and returns after clearing chat:

```ts
ui: {
  mode: 'chat',
  emptyState: {
    title: 'What would you like to do?',
    description: 'Ask about your data or choose a suggested request.',
    renderContent(host) {
      const image = host.ownerDocument.createElement('img');
      image.src = '/assistant-welcome.svg';
      image.alt = 'Your assistant';
      host.append(image);
      return () => image.remove();
    },
  },
}
```

`renderContent` is a framework-independent content slot; return a disposer if you mount a view or attach listeners. Set title/description to empty strings for a fully custom slot. Standalone `AiChatEmptyState` also accepts normal framework children. Omit `emptyState` or set it to `false` to keep the mounted chat empty.

Hosts may supply `onClearChart` and publish `canClearChart` to offer Clear chart in the same actions area. `viewSwitching` disables it during a transition. The host owns switching and configuration retention.

Applied request steps can mix editable commands with informational plugin actions. Set `AiRequestTrailItem.removable` to `false` when the host cannot selectively undo an item; it remains numbered and counted without displaying a remove button. The grid assistant retains successful chart/view actions in this form, including accepted previews, and omits failed or cancelled actions. Only the newest reversible command has an undo control. New conversation is a separate icon. It clears chat/draft and AI context without changing the workspace. Request history is hidden in chat by default, and uses an icon without a step count in toolbar mode (`showRequestHistory`). Workspace reset belongs to the application.

`ViewSwitcherControls` accepts a `translations` dictionary for its default labels, view names and surfaced errors. The Pro view-switcher mount forwards `viewSwitcher.translations`; per-mount labels and translations can override it.

Mounted chat hides request history by default. `showRequestHistory` enables it explicitly; toolbar mode shows it by default. The trigger is a translated Request history icon, and New conversation is always separate. The mounted assistant does not render workspace reset/restore buttons. `showHistoryControls` controls only native data Undo/Redo.
