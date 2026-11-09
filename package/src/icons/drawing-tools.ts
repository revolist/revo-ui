/** Framework-neutral drawing glyphs; tool behavior stays with each consumer. */
export const DRAWING_TOOL_PATHS = {
  link: 'M10 13a5 5 0 0 0 7 .5l3-3a5 5 0 0 0-7-7l-2 2 M14 11a5 5 0 0 0-7-.5l-3 3a5 5 0 0 0 7 7l2-2',
  select: 'M5 3 19 12 12 13 9 20Z M12 13l5 7',
  rectangle: 'M4 5h16v14H4Z',
  line: 'M5 19 19 5 M4 18l2 2 M18 4l2 2',
  arrow: 'M5 19 19 5 M9 5h10v10',
  note: 'M5 3h14v14l-4 4H5Z M15 21v-4h4 M8 8h8 M8 12h6',
} as const;
