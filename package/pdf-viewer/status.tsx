import { h, Fragment } from 'preact';
import { Button, Spinner, EmptyState } from '../controls';
import { Alert } from '../alert';
import { type PdfViewerText } from './translations';
import type { PdfViewerController } from './controller';
import type { PdfViewerState } from './types';

export function PdfViewerStatus({
  state,
  text,
  controller,
  canOpen,
  onOpen,
}: {
  state: Readonly<PdfViewerState>;
  text: PdfViewerText;
  controller: PdfViewerController;
  canOpen: boolean;
  onOpen: () => void;
}) {
  return state.status === 'loading' ? (
    <>
      <Spinner label={text.loading} />
      <span>{text.loading}</span>
    </>
  ) : state.status === 'error' ? (
    <Alert
      tone="danger"
      title={text.error}
      description={text.errorDescription}
      actions={
        <>
          {controller.canRetry && (
            <Button size="compact" onClick={() => void controller.retry()}>
              {text.retry}
            </Button>
          )}
          {canOpen && (
            <Button size="compact" onClick={() => onOpen()}>
              {text.open}
            </Button>
          )}
        </>
      }
    />
  ) : (
    <EmptyState title={text.empty} description={text.emptyHint}>
      {canOpen && (
        <Button variant="primary" onClick={() => onOpen()}>
          {text.open}
        </Button>
      )}
    </EmptyState>
  );
}
