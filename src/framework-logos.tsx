import react from './assets/frameworks/react.svg';
import vue from './assets/frameworks/vue.svg';
import angular from './assets/frameworks/angular.svg';
import svelte from './assets/frameworks/svelte.svg';
import preact from './assets/frameworks/preact.svg';
import typescript from './assets/frameworks/typescript.svg';

export const frameworkLogos: Record<string, string> = {
  React: react, Vue: vue, Angular: angular, Svelte: svelte, Preact: preact,
  'Vanilla TypeScript': typescript,
};
export function FrameworkLogo({ name }: { name: string }) {
  return <img class="framework-logo" src={frameworkLogos[name]} alt="" width="24" height="24" aria-hidden="true" />;
}
