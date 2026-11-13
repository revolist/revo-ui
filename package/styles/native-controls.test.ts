import { describe, expect, it } from 'vitest';
import { compileString } from 'sass-embedded';
import { resolve } from 'node:path';

function nativeControls(options = '') {
  return compileString(`@use 'native-styles' ${options};`, {
    loadPaths: [resolve(import.meta.dirname, '..')],
  }).css;
}

describe('native control edition boundaries', () => {
  it('keeps history control presentation enabled for existing consumers', () => {
    expect(nativeControls()).toContain('.rv-history-controls');
  });

  it('can omit history presentation while keeping ordinary native controls', () => {
    const css = nativeControls('with ($include-history-controls: false)');
    expect(css).not.toContain('.rv-history-controls');
    expect(css).toContain('.rv-btn');
    expect(css).toContain('.rv-control');
    expect(css).toContain('.rv-native-controls');
  });
});
