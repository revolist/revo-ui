import { createContext } from 'preact';
import { useContext, useLayoutEffect, useRef } from 'preact/hooks';

export type EditorCommit = () => boolean | void;
/** A popup registers one draft owner. Programmatic close and Escape never commit. */
export const EditorCommitContext = createContext<
  ((commit: EditorCommit) => () => void) | undefined
>(undefined);

export function useEditorAutoApply(commit: EditorCommit, enabled = true) {
  const register = useContext(EditorCommitContext);
  const current = useRef(commit);
  current.current = commit;
  useLayoutEffect(() => {
    if (enabled) return register?.(() => current.current());
  }, [register, enabled]);
}
