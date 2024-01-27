import {Application} from '../deps.ts';

import {globalErrHandler, requestLogger} from './tooling.ts';
import {QuoteRepository} from '../domain/QuoteRepository.ts';
import {quoteRepositoryFactory} from './repositoryFactory.ts';
import {quoteRoutesFactory} from './quoteRoutes.ts';

const quoteRepository: QuoteRepository = await quoteRepositoryFactory();
const quoteRoutes = quoteRoutesFactory(quoteRepository);

const port = 8000;
const app = new Application();
app.use(requestLogger);
app.use(globalErrHandler);
app.use(quoteRoutes.routes());
app.use(quoteRoutes.allowedMethods());

console.log(`Server is running on port ${port}`);

app.addEventListener('close', () => {
  closeConnection();
});

await app.listen({ port });
