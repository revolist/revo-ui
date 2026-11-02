export function componentApi(
  library: string,
  gallery: string,
  watchSource?: (file: string) => void,
): import('../src/component-api').ComponentApi[];
export function apiModule(
  api: import('../src/component-api').ComponentApi[],
): string;
