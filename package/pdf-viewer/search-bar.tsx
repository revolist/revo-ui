import { h, type RefObject } from 'preact';
import { useLayoutEffect } from 'preact/hooks';
import { IconButton } from '../controls';
import { SearchInput } from '../search-input';
import { SvgIcon } from '../icons/icon';
import { pdfViewerIcons as icons } from './icons';
import { formatPdfText as format, type PdfViewerText } from './translations';
import type { PdfViewerController } from './controller';
import type { PdfViewerState } from './types';

export function PdfViewerSearchBar({
  id,
  controller,
  state,
  text,
  onClose,
  inputRef: search,
}: {
  inputRef: RefObject<HTMLInputElement>;
  id: string;
  controller: PdfViewerController;
  state: Readonly<PdfViewerState>;
  text: PdfViewerText;
  onClose: () => void;
}) {
  const ready = state.status === 'ready';
  useLayoutEffect(() => {
    search.current?.focus();
  }, []);
  return (
    <div
      id={id}
      class="rv-pdf-viewer__search"
      role="search"
      aria-label={text.search}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <SearchInput
        icon={<SvgIcon svg={icons.search} />}
        inputRef={search}
        aria-label={text.search}
        placeholder={text.search}
        value={state.query}
        disabled={!ready}
        onValueChange={(value) => controller.search(value)}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            controller.search(state.query, event.shiftKey, true);
          }
        }}
      />
      <div class="rv-pdf-viewer__find-controls">
        <span role="status" class="rv-pdf-viewer__matches">
          {state.query
            ? state.searching
              ? text.searching
              : state.matchCount
                ? format(text.matchSummary, {
                    match: state.match,
                    total: state.matchCount,
                    matches: text.matches,
                  })
                : text.noMatches
            : ''}
        </span>
        <IconButton
          label={text.previousMatch}
          icon={icons.up}
          size="compact"
          disabled={!ready || !state.matchCount}
          onClick={() => controller.search(state.query, true, true)}
        />
        <IconButton
          label={text.nextMatch}
          icon={icons.down}
          size="compact"
          disabled={!ready || !state.matchCount}
          onClick={() => controller.search(state.query, false, true)}
        />
        <IconButton
          label={text.closeSearch}
          icon={icons.close}
          size="compact"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
