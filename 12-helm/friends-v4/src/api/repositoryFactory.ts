import {DATABASE_TYPE, DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER} from './config.ts';
import {Client, Database, MongoClient} from '../deps.ts';
import {QuoteRepository} from '../domain/QuoteRepository.ts';
import {PostgresQuoteRepository} from '../repository/PostgresQuoteRepository.ts';
import {MongoQuoteRepository} from '../repository/MongoQuoteRepository.ts';

export async function quoteRepositoryFactory(): Promise<QuoteRepository> {
  if (DATABASE_TYPE === "postgres") {
    const client = new Client({
      hostname: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
    });
    return new PostgresQuoteRepository(client);
  } else if (DATABASE_TYPE === "mongo") {
    const client = new MongoClient();
    await client.connect({
      db: DB_DATABASE,
      servers: [
        {
          host: DB_HOST,
          port: DB_PORT,
        },
      ],
      credential: {
        username: DB_USER,
        password: DB_PASSWORD,
        db: DB_DATABASE,
        mechanism: "SCRAM-SHA-1",
      },
    });
    const db = client.database(DB_DATABASE);
    return new MongoQuoteRepository(db);
  } else {
    throw new Error(`unknown database type ${DATABASE_TYPE}`);
  }
}
