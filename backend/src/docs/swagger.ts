import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { getOpenApiSpec } from './openapi';

export function buildDocsRouter() {
  const r = Router();
  const spec = getOpenApiSpec();

  // Raw JSON for tooling (Postman import, codegen, etc.).
  r.get('/docs.json', (_req, res) => res.json(spec));

  // Swagger UI at /docs
  r.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      explorer: false,
      customSiteTitle: 'SYNC API — Swagger UI',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        defaultModelsExpandDepth: 1,
        tagsSorter: 'alpha',
      },
    }),
  );

  return r;
}
