import rawTheme from './shared-theme.json';
import { themeToCss, type UiTheme } from '@revolist/ui/presets';
export const theme = rawTheme as UiTheme;
const style = document.createElement('style');
style.textContent = themeToCss(theme);
document.head.append(style);
