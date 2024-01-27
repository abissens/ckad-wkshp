import {FriendsQuote} from './Quote.ts';

export interface QuoteRepository {
  getQuotes(): Promise<FriendsQuote[]>;
  addQuote(quote: FriendsQuote): Promise<void>;
}
