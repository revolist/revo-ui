# AiPromptInput

Presentation for messages, prompts, suggestions, reasoning, tasks, action state and result summaries. Applications provide the model and tools.

[Live examples and formatted usage](https://ui.rv-grid.com/#ai-assistant) · [Component index](../../README.md#complete-component-reference)

Preact: `import { AiPromptInput } from '@revolist/ui/preact'`

React: `import { AiPromptInput } from '@revolist/ui/react'`

Vue: `import { AiPromptInput } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="AiPromptInput"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `translations` | `Partial<Record<"AI chat" \| "Clear chat" \| "Conversation messages" \| "Jump to latest" \| "You" \| "Assistant" \| "System" \| "Message actions" \| "Start a conversation" \| "Ask a question to get started." \| "Message" \| "Type a message…" \| "Working…" \| "Reasoning summary" \| "Pending" \| "Running" \| "Completed" \| "Failed" \| "Cancelled" \| "{seconds}s" \| "Data history" \| "Review changes" \| "Apply changes" \| "Cancel changes" \| "Undo data change" \| "Redo data change" \| "Ask AI to change this view" \| "Filter or sort your data…" \| "Send" \| "Stop" \| "Enter to send · Shift+Enter for a new line" \| "Suggested requests" \| "More" \| "Activity" \| "Collapse activity" \| "Expand activity" \| "AI view assistant" \| "View steps" \| "Clear all" \| "Restore the starting view" \| "Restore previous view" \| "Reset view" \| "The view changed manually. Start a new request to continue." \| "Remove request: {label}" \| "{count} step" \| "{count} steps" \| "{count} applied request" \| "{count} applied requests" \| "{count} matching rows", string>> \| undefined` | No |  |
| `value` | `string` | Yes |  |
| `onValueChange` | `(value: string) => void` | Yes |  |
| `onSubmit` | `(value: string) => void` | Yes |  |
| `onStop` | `(() => void) \| undefined` | No |  |
| `busy` | `boolean \| undefined` | No |  |
| `disabled` | `boolean \| undefined` | No |  |
| `label` | `string \| undefined` | No |  |
| `placeholder` | `string \| undefined` | No |  |
| `submitLabel` | `string \| undefined` | No |  |
| `stopLabel` | `string \| undefined` | No |  |
| `promptHistory` | `readonly string[] \| undefined` | No | Opt-in local prompt recall. Arrow keys retain normal multiline behavior away from text edges. |
| `hint` | `string \| undefined` | No | Empty-draft keyboard guidance. An empty string lets toolbar context replace it. |
| `actions` | `ComponentChildren` | No | Host-supported actions or context, displayed in the composer toolbar. |
| `footer` | `ComponentChildren` | No | Applied context or supplemental content above the bottom toolbar. |
| `textareaProps` | `Pick<Omit<h.JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & { className?: string; onValueChange?: (value: string) => void; }, "className" \| "rows" \| "style"> \| undefined` | No | Native textarea presentation and sizing; input behavior stays controlled here. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
