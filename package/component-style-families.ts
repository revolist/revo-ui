/// <reference path="./assets.d.ts" />
import baseCss from './styles/automatic-base.scss?inline';
import formCss from './styles/automatic-form.scss?inline';
import checkboxCss from './styles/automatic-checkbox.scss?inline';
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
const base: ComponentStyles = { id: 'base-button', order: 0, css: baseCss };
const form: ComponentStyles = { id: 'base-form', order: 1, css: formCss };
const checkbox: ComponentStyles = {
  id: 'base-checkbox',
  order: 2,
  css: checkboxCss,
};
const calendar: ComponentStyles = {
  id: 'calendar',
  order: 3,
  css: calendarCss,
};
const dialogs: ComponentStyles = { id: 'dialogs', order: 4, css: dialogsCss };
const pickers: ComponentStyles = { id: 'pickers', order: 5, css: pickersCss };
const layout: ComponentStyles = { id: 'layout', order: 6, css: layoutCss };
const feedback: ComponentStyles = {
  id: 'feedback',
  order: 7,
  css: feedbackCss,
};
const fields: ComponentStyles = { id: 'fields', order: 8, css: fieldsCss };
const charts: ComponentStyles = { id: 'charts', order: 9, css: chartsCss };
const formatting: ComponentStyles = {
  id: 'formatting',
  order: 10,
  css: formattingCss,
};
const timeline: ComponentStyles = {
  id: 'timeline',
  order: 11,
  css: timelineCss,
};
const ai: ComponentStyles = { id: 'ai', order: 12, css: aiCss };
const pdfViewer: ComponentStyles = {
  id: 'pdf-viewer',
  order: 13,
  css: pdfViewerCss,
};
export const buttonStyles = [base] as const;
export const baseStyles = [base, form, checkbox] as const;
export const layoutStyles = [base, form, checkbox, layout] as const;
export const calendarStyles = [base, form, checkbox, calendar] as const;
export const pickerStyles = [
  base,
  form,
  checkbox,
  calendar,
  pickers,
  layout,
  feedback,
  fields,
] as const;
export const dialogsStyles = [base, form, checkbox, dialogs, layout] as const;
export const feedbackStyles = [base, form, checkbox, layout, feedback] as const;
export const fieldsStyles = [
  base,
  form,
  checkbox,
  pickers,
  layout,
  feedback,
  fields,
] as const;
export const chartsStyles = [base, form, checkbox, charts] as const;
export const formattingStyles = [
  base,
  form,
  checkbox,
  pickers,
  layout,
  fields,
  formatting,
] as const;
export const timelineStyles = [base, form, checkbox, timeline] as const;
export const aiStyles = [
  base,
  form,
  checkbox,
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
export const pdfStyles = [base, form, checkbox, layout, pdfViewer] as const;
