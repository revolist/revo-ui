declare module '*.svg?raw' {
  const svg: string;
  export default svg;
}
declare module '*.scss';
declare module '*.css';

declare module '*.scss?inline' {
  const css: string;
  export default css;
}
