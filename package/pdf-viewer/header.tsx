import { TooltipText } from '../core/tooltip-text';
import { h, Fragment } from 'preact';
import { Button } from '../controls';
import { SvgIcon } from '../icons/icon';
import { pdfViewerIcons as icons } from './icons';
import { formatPdfText as format, type PdfViewerText } from './translations';
import type { PdfViewerState } from './types';

export function PdfViewerHeader({
  state,
  text,
  onCancelPrint,
  showDetails = true,
}: {
  showDetails?: boolean;
  state: Readonly<PdfViewerState>;
  text: PdfViewerText;
  onCancelPrint: () => void;
}) {
  const ready = state.status === 'ready';
  return (
    <header class="rv-pdf-viewer__header">
      {showDetails && (
        <>
          <SvgIcon
            svg={icons.document}
            className="rv-svg-icon rv-pdf-viewer__document-icon"
          />
          <TooltipText class="rv-pdf-viewer__filename" title={state.fileName}>
            {state.fileName}
          </TooltipText>
        </>
      )}
      <span class="rv-pdf-viewer__summary" aria-live="polite">
        {state.printing
          ? text.printing
          : ready
            ? format(text.pageSummary, {
                page: state.page,
                of: text.of,
                pages: state.pageCount,
              })
            : ''}
      </span>
      {state.printing && (
        <Button variant="ghost" size="compact" onClick={() => onCancelPrint()}>
          {text.cancelPrint}
        </Button>
      )}
    </header>
  );
}
