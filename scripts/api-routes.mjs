import { resolve } from 'node:path';
import { componentApi } from './component-api.mjs';
const gallery = resolve(import.meta.dirname, '..');
export const apiRoutes = [
  'api/',
  ...componentApi(gallery, gallery).map(
    (component) => `api/${component.name.toLowerCase()}/`,
  ),
];
