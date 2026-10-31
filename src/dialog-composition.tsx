import { Alert } from '@revolist/ui/controls';
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { DialogActionFooter, DialogBody, DialogForm, EditableDialogHeader } from '@revolist/ui/dialog/dialog.parts';
import { ButtonControl, Input } from '@revolist/ui/native-control';
import { Example } from './catalog';

/** The same composition consumed by Scheduler, Kanban and Gantt. */
export function DialogCompositionExamples() {
  const [title, setTitle] = useState('Project review');
  const [locked, setLocked] = useState(false);
  const [customOnly, setCustomOnly] = useState(false);
  const [result, setResult] = useState('');
  return <Example title="Editable dialog and standard footer" wide>
    <div class="catalog-row">
      <label><Input type="checkbox" checked={locked} onChange={event => setLocked(event.currentTarget.checked)} /> Locked item</label>
      <label><Input type="checkbox" checked={customOnly} onChange={event => setCustomOnly(event.currentTarget.checked)} /> Hide standard actions</label>
    </div>
    <DialogForm aria-label="Shared editor composition" onSubmit={event => { event.preventDefault(); setResult(`Saved ${title}`); }}>
      <EditableDialogHeader titleId="shared-editor-title" title={title} name="Edit event" inputLabel="Event title"
        inputProps={{ value: title, disabled: locked, onInput: event => setTitle(event.currentTarget.value) }}
        closeLabel="Close example" onClose={() => setResult('Closed')} />
      {locked && <Alert class="rv-dialog__message" tone="danger">This item is locked. Editing is disabled.</Alert>}
      <DialogBody><p>Shared editable heading, body, and bottom action panel.</p></DialogBody>
      <DialogActionFooter
        deleteAction={customOnly ? false : { disabled: locked, onClick: () => setResult('Deleted') }}
        reset={customOnly ? false : { disabled: locked, onClick: () => { setTitle('Project review'); setResult('Reset'); } }}
        cancel={customOnly ? false : { onClick: () => setResult('Canceled') }}
        save={customOnly ? false : { disabled: locked }}
        start={<ButtonControl type="button" onClick={() => setResult('Custom start')}>Custom start</ButtonControl>}
        end={<ButtonControl type="button" onClick={() => setResult('Custom end')}>Custom end</ButtonControl>}
      />
    </DialogForm>
    <output aria-label="Dialog action result">{result}</output>
  </Example>;
}
