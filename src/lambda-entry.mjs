// ES module Lambda entry. Lambda waits for top-level await to finish during
// init, so Nest is fully booted before any request (including on warm /
// provisioned-concurrency instances). Set the image CMD to "lambda-entry.handler".
import lambda from './lambda.js';

const server = await lambda.bootstrap();

export const handler = (event, context) => server(event, context, () => undefined);
