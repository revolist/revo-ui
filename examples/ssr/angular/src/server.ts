import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { resolve } from 'node:path';

const app = express();
const angular = new AngularNodeAppEngine();
app.use(express.static(resolve(import.meta.dirname, '../browser')));
app.use((request, response, next) => {
  angular
    .handle(request)
    .then((result) =>
      result ? writeResponseToNodeResponse(result, response) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  app.listen(Number(process.env['PORT'] ?? 3000), '127.0.0.1');
}

export const reqHandler = createNodeRequestHandler(app);
