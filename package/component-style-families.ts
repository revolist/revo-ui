/// <reference path="./assets.d.ts" />
import baseCss from './styles/base.scss?inline';
import calendarCss from './styles/calendar.scss?inline';
import dialogsCss from './styles/dialogs.scss?inline';
import pickersCss from './styles/pickers.scss?inline';
import layoutCss from './styles/layout.scss?inline';
import feedbackCss from './styles/feedback.scss?inline';
import fieldsCss from './styles/fields.scss?inline';
import chartsCss from './styles/charts.scss?inline';
import formattingCss from './styles/formatting.scss?inline';
import timelineCss from './styles/timeline.scss?inline';
import aiCss from './styles/ai.scss?inline';
import pdfViewerCss from './styles/pdf-viewer.scss?inline';
import type { ComponentStyles } from './core/component-styles';

// Strings remain attached only to retained adapter factories, never a global registry.
const base: ComponentStyles = { id: 'base', order: 0, css: baseCss };
const calendar: ComponentStyles = {
  id: 'calendar',
  order: 1,
  css: calendarCss,
};
const dialogs: ComponentStyles = { id: 'dialogs', order: 2, css: dialogsCss };
const pickers: ComponentStyles = { id: 'pickers', order: 3, css: pickersCss };
const layout: ComponentStyles = { id: 'layout', order: 4, css: layoutCss };
const feedback: ComponentStyles = {
  id: 'feedback',
  order: 5,
  css: feedbackCss,
};
const fields: ComponentStyles = { id: 'fields', order: 6, css: fieldsCss };
const charts: ComponentStyles = { id: 'charts', order: 7, css: chartsCss };
const formatting: ComponentStyles = {
  id: 'formatting',
  order: 8,
  css: formattingCss,
};
const timeline: ComponentStyles = {
  id: 'timeline',
  order: 9,
  css: timelineCss,
};
const ai: ComponentStyles = { id: 'ai', order: 10, css: aiCss };
const pdfViewer: ComponentStyles = {
  id: 'pdf-viewer',
  order: 11,
  css: pdfViewerCss,
};
export const baseStyles = [base] as const;
export const layoutStyles = [base, layout] as const;
export const calendarStyles = [base, calendar] as const;
export const pickerStyles = [
  base,
  calendar,
  pickers,
  layout,
  feedback,
  fields,
] as const;
export const dialogsStyles = [base, dialogs, layout] as const;
export const feedbackStyles = [base, layout, feedback] as const;
export const fieldsStyles = [base, pickers, layout, feedback, fields] as const;
export const chartsStyles = [base, charts] as const;
export const formattingStyles = [
  base,
  pickers,
  layout,
  fields,
  formatting,
] as const;
export const timelineStyles = [base, timeline] as const;
export const aiStyles = [
  base,
  calendar,
  dialogs,
  pickers,
  layout,
  feedback,
  fields,
  charts,
  formatting,
  ai,
] as const;
export const pdfStyles = [base, layout, pdfViewer] as const;
