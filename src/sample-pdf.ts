/** A deterministic, local three-page PDF. No network or document-generation dependency. */
export function createSamplePdf(): Uint8Array {
  const escape = (text: string) => text.replace(/[\\()]/g, '\\$&');
  const text = (value: string, x: number, y: number, size = 12, bold = false) =>
    `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${escape(value)}) Tj ET`;
  const contents = [
    [
      'PROJECT BRIEF',
      'A clearer view of your data',
      'RevoGrid product overview',
      'Build focused experiences for complex work.',
      'One shared interface. Every framework.',
      '01   Explore your documents',
      'Navigate pages, select text and find what matters.',
      '02   Keep your workflow moving',
      'Open local files, adjust your view and share a copy.',
      '03   Make it feel like your product',
      'Shared controls, accessible labels and light or dark themes.',
    ],
    [
      'CAPABILITIES',
      'Everything in one workspace',
      'RevoGrid document tools',
      'DOCUMENT TOOLS                         AVAILABLE',
      'Page navigation                           Yes',
      'Search and text selection                 Yes',
      'Fit width and fit page                    Yes',
      'Zoom and rotation                         Yes',
      'Download original PDF                     Yes',
      'Print all pages                           Yes',
      'Open a local PDF                          Yes',
    ],
    [
      'GET STARTED',
      'Designed to fit your app',
      'RevoGrid shared UI library',
      'A small integration. A complete reading experience.',
      'Use a URL, byte array or local file as the document source.',
      'The PDF engine loads only when the viewer mounts.',
      'Use the toolbar to find RevoGrid anywhere in this document.',
      'Your document stays in the browser.',
      'Thank you for exploring.',
    ],
  ];
  const objects = [
    '',
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [5 0 R 7 0 R 9 0 R] /Count 3 >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ];
  contents.forEach((lines, index) => {
    const commands = [
      '0.96 0.97 0.99 rg 0 0 612 792 re f',
      '0.08 0.14 0.26 rg 0 570 612 222 re f',
      '0.45 0.7 1 rg',
      text('REVO / DOCUMENTS', 44, 747, 12, true),
      '0.7 0.8 0.95 rg',
      text(lines[0], 44, 682, 10, true),
      '1 1 1 rg',
      text(lines[1], 44, 635, 25, true),
      text(lines[2], 44, 604, 12),
      '0.15 0.21 0.31 rg',
      ...lines
        .slice(3)
        .map((line, row) =>
          text(line, 44, 518 - row * 44, row === 0 ? 15 : 12, row === 0),
        ),
      '0.75 0.79 0.85 RG 44 68 m 568 68 l S',
      '0.4 0.45 0.53 rg',
      text('SHARED UI / PDF VIEWER', 44, 44, 9),
      text(`${index + 1} / 3`, 540, 44, 9),
    ].join('\n');
    objects.push(
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' +
        (6 + index * 2) +
        ' 0 R >>',
    );
    objects.push(
      `<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`,
    );
  });
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 1; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf +=
    `xref\n0 ${objects.length}\n0000000000 65535 f \n` +
    offsets
      .slice(1)
      .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
      .join('');
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}
