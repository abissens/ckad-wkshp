export async function requestLogger(ctx, next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set('X-Response-Time', `${ms}ms`);
  console.log(`${ctx.request.method} ${ctx.request.url} - ${ms}ms`);
}

export async function globalErrHandler(ctx, next) {
  try {
    await next();
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {error: 'Internal Server Error'};
    console.error('Error:', error);
  }
}
