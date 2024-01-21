import { Application, Router } from './deps.ts';
import {friendsQuotes} from './quotes.ts';

const apiVersion = '1';

const app = new Application();

// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get('X-Response-Time');
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});
// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Routes
const router = new Router();
router.get('/', (ctx) => {
  const randomQuote = friendsQuotes[Math.floor(Math.random() * friendsQuotes.length)];
  ctx.response.type = 'application/json';
  ctx.response.body = {apiVersion, quote: randomQuote};
});

router.get('/health', (ctx) => {
  ctx.response.body = 'app is running';
});

app.use(router.routes());
app.use(router.allowedMethods());



await app.listen({ port: 8000 });
