import { h } from 'preact';
import { createPreactElement } from '../preact-mount';

/** Preact owns the surface root; PDF.js owns the page content inserted within it. */
export const createPdfPages = (owner: Document) =>
  createPreactElement<HTMLDivElement>(owner, <div class="pdfViewer" />);
export const createPdfDownload = (owner: Document, url: string, name: string) =>
  createPreactElement<HTMLAnchorElement>(
    owner,
    <a href={url} download={name} />,
  );
export const createPdfPrintFrame = (owner: Document, title: string) =>
  createPreactElement<HTMLIFrameElement>(
    owner,
    <iframe
      title={title}
      style="position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0"
    />,
  );
export const createPdfPrintStyle = (owner: Document) =>
  createPreactElement<HTMLStyleElement>(
    owner,
    <style>
      {
        '@page{margin:0}body{margin:0}canvas{display:block;width:100%;height:auto;break-after:page}canvas:last-child{break-after:auto}'
      }
    </style>,
  );
export const createPdfPrintCanvas = (
  owner: Document,
  width: number,
  height: number,
) =>
  createPreactElement<HTMLCanvasElement>(
    owner,
    <canvas width={width} height={height} />,
  );
