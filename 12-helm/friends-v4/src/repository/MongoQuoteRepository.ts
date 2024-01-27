import {QuoteRepository} from '../domain/QuoteRepository.ts';
import {FriendsQuote} from '../domain/Quote.ts';
import {Database, ObjectId} from '../deps.ts';

export class MongoQuoteRepository implements QuoteRepository {

  constructor(private db: Database) {
  }

  async addQuote(quote: FriendsQuote): Promise<void> {
    await this.db.collection<Quote>('quotes').insertOne(quote);

  }

  async getQuotes(): Promise<FriendsQuote[]> {
    const quotes: Array<Quote> = await this.db.collection<Quote>('quotes').find().toArray();

    return quotes.map(quote => ({
      character: quote.character,
      quote: quote.quote,
    }))
  }

}

interface Quote {
  _id?: ObjectId;
  character: string;
  quote: string;
}
