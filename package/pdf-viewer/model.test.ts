import { describe, expect, it } from 'vitest';
import {
  normalizePdfPage,
  normalizePdfZoom,
  pdfFileName,
  pdfSourceParameters,
} from './model';

describe('PDF inputs and navigation bounds', () => {
  it('copies binary sources so worker transfer cannot detach the caller buffer', async () => {
    const source = new Uint8Array([0, 1, 2, 3]);
    const data = (await pdfSourceParameters(source.subarray(1, 3))).data!;
    expect(data).toEqual(new Uint8Array([1, 2]));
    data[0] = 99;
    expect(source[1]).toBe(1);
    const buffer = (await pdfSourceParameters(source.buffer)).data!;
    expect(buffer.buffer).not.toBe(source.buffer);
    expect(await pdfSourceParameters('/document.pdf')).toEqual({
      url: '/document.pdf',
    });
  });
  it('accepts local blobs', async () => {
    expect((await pdfSourceParameters(new Blob(['%PDF']))).data).toEqual(
      new TextEncoder().encode('%PDF'),
    );
  });
  it('uses safe filenames and keeps a PDF extension', () => {
    expect(pdfFileName('https://example.com/My%20file.pdf?token=secret')).toBe(
      'My file.pdf',
    );
    expect(pdfFileName(null, '../report')).toBe('.._report.pdf');
    expect(pdfFileName(new File([''], 'local.pdf'))).toBe('local.pdf');
    expect(pdfFileName('bad%zz.pdf')).toBe('bad%zz.pdf');
  });
  it('bounds page numbers and zoom without losing fit presets', () => {
    expect(normalizePdfPage(100, 3)).toBe(3);
    expect(normalizePdfPage(-1, 3)).toBe(1);
    expect(normalizePdfPage(NaN, 3)).toBe(1);
    expect(normalizePdfZoom(Infinity)).toBe(1);
    expect(normalizePdfZoom(10)).toBe(5);
    expect(normalizePdfZoom(0)).toBe(0.25);
    expect(normalizePdfZoom('page-fit')).toBe('page-fit');
  });
});
