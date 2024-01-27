import {Router} from '../deps.ts';
import {QuoteRepository} from '../domain/QuoteRepository.ts';

export function quoteRoutesFactory(quoteRepository: QuoteRepository): Router {
  const quotesRouter = new Router();

  quotesRouter.get('/quotes', async (ctx) => ctx.response.body = await quoteRepository.getQuotes());

  quotesRouter.post('/quotes', async (ctx) => {
    const quote: Quote = await ctx.request.body().value;
    await quoteRepository.addQuote(quote);
    ctx.response.status = 201;
  });
  return quotesRouter;
}
