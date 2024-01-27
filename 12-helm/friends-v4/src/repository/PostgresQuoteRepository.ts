import {QuoteRepository} from '../domain/QuoteRepository.ts';
import {FriendsQuote} from '../domain/Quote.ts';
import {Client} from '../deps.ts';

export class PostgresQuoteRepository implements QuoteRepository {

  constructor(private client: Client) {
  }

  async getQuotes(): Promise<FriendsQuote[]> {
    await this.client.connect();
    const { rows: all } = await this.client.queryArray`SELECT character, quote FROM quotes`;
    await this.client.end();
    return all.map(row => ({
      character: row[0] as string,
      quote: row[1] as string,
    }));
  }

  async addQuote(quote: FriendsQuote): Promise<void> {
    await this.client.connect();
    await this.client.queryArray(
        'INSERT INTO quotes (character, quote) VALUES ($1, $2)',
        quote.character,
        quote.quote
    );
    await this.client.end();
  }

}
