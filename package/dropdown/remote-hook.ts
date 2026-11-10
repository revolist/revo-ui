import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  RemoteDropdownController,
  defaultDropdownRemoteText,
  type RemoteDropdownState,
} from './remote';
import type { DropdownProps } from './dropdown.types';

export function useRemoteDropdown<T>(
  props: Pick<
    DropdownProps<T>,
    'dataSource' | 'dataContext' | 'remoteText' | 'value' | 'disabled'
  > & {
    source: import('./dropdown.types').DropdownOption<T>[];
    open: boolean;
    initialQuery: string;
  },
) {
  const text = useMemo(
    () => ({ ...defaultDropdownRemoteText, ...props.remoteText }),
    [props.remoteText],
  );
  const [state, setState] = useState<RemoteDropdownState<T>>({
    items: [],
    selected: [],
    loading: false,
    error: false,
    hasMore: false,
  });
  const controller = useRef<RemoteDropdownController<T>>();
  const ids =
    props.value === null || props.value === undefined
      ? []
      : Array.isArray(props.value)
        ? props.value
        : [props.value];
  const idsKey = JSON.stringify(ids);
  useLayoutEffect(() => {
    if (!props.dataSource || props.disabled) {
      setState({
        items: [],
        selected: [],
        loading: false,
        error: false,
        hasMore: false,
      });
      return;
    }
    const session = new RemoteDropdownController(
      props.dataSource,
      props.dataContext,
      setState,
      text,
    );
    controller.current = session;
    return () => {
      session.destroy();
      if (controller.current === session) controller.current = undefined;
    };
  }, [props.dataSource, props.dataContext, props.disabled, text]);
  useLayoutEffect(() => {
    controller.current?.setSelected(ids, props.source);
  }, [
    idsKey,
    props.source,
    props.dataSource,
    props.dataContext,
    props.disabled,
    text,
  ]);
  // Finish opening/closing before user input can queue a newer search.
  useLayoutEffect(() => {
    if (props.open) controller.current?.search(props.initialQuery, true);
    else controller.current?.close();
  }, [
    props.open,
    props.dataSource,
    props.dataContext,
    props.disabled,
    props.initialQuery,
    text,
  ]);
  return {
    ...state,
    text,
    search: (query: string) => controller.current?.search(query),
    loadMore: () => controller.current?.loadMore(),
    retry: () => controller.current?.retry(),
  };
}
