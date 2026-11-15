import { useEffect, useState } from 'preact/hooks';

const latestUrl = 'https://registry.npmjs.org/@revolist%2Fui/latest';

/** Display the published release, independently of the gallery build version. */
export function PublishedVersion() {
  const [version, setVersion] = useState<string>();
  useEffect(() => {
    let request: AbortController | undefined;
    const refresh = async () => {
      request?.abort();
      const current = new AbortController();
      request = current;
      try {
        const response = await fetch(latestUrl, {
          signal: current.signal,
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('npm metadata unavailable');
        const metadata: unknown = await response.json();
        const published =
          metadata && typeof metadata === 'object' && 'version' in metadata
            ? metadata.version
            : undefined;
        if (!current.signal.aborted) {
          setVersion(
            typeof published === 'string' &&
              /^\d+\.\d+\.\d+(?:-[\da-zA-Z.-]+)?(?:\+[\da-zA-Z.-]+)?$/.test(
                published,
              )
              ? published
              : undefined,
          );
        }
      } catch {
        if (!current.signal.aborted) setVersion(undefined);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    void refresh();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      request?.abort();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  return version ? (
    <small class="catalog-version" aria-label="UI library version">
      v{version}
    </small>
  ) : null;
}
