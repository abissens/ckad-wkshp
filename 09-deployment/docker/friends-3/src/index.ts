const apiVersion = '3';
const hostname = Deno.hostname();

const handler = async (request: Request): Promise<Response> => {
  const {url} = request;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${request.method} ${url}`);

  if (url.endsWith('/health')) {
    return new Response('app is running', {
      status: 200,
      headers: {
        'content-type': 'text/plain',
      },
    });
  }

  const randomQuote = friendsQuotes[Math.floor(Math.random() * friendsQuotes.length)];
  return new Response(JSON.stringify({hostname, apiVersion, quote: randomQuote}), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });
};

Deno.serve(handler);


const friendsQuotes = [
  {character: 'Ross Geller', quote: 'We were on a break!'},
  {character: 'Joey Tribbiani', quote: 'How you doin\'?'},
  {character: 'Rachel Green', quote: 'It\'s not that common, it doesn\'t happen to every guy, and it IS a big deal!'},
  {character: 'Monica Geller', quote: 'Welcome to the real world. It sucks. You\'re gonna love it.'},
  {character: 'Ross Geller', quote: 'PIVOT!'},
  {character: 'Chandler Bing', quote: 'Could I BE wearing any more clothes?'},
  {character: 'Phoebe Buffay', quote: 'Smelly Cat, Smelly Cat, what are they feeding you?'},
  {character: 'Chandler Bing', quote: 'I\'m not great at the advice. Can I interest you in a sarcastic comment?'},
  {character: 'Phoebe Buffay', quote: 'I wish I could, but I don\'t want to.'},
  {character: 'Chandler Bing', quote: 'I\'m hopeless and awkward and desperate for love!'},
  {character: 'Rachel Green', quote: 'I got off the plane.'},
  {character: 'Phoebe Buffay', quote: 'They don\'t know that we know they know we know.'},
  {character: 'Janice Litman', quote: 'Oh. My. God!'},
  {character: 'Joey Tribbiani', quote: 'Joey doesn\'t share food!'},
  {
    character: 'Rachel Green',
    quote: 'It\'s like all my life everyone has always told me, ‘You\'re a shoe! You\'re a shoe! You\'re a shoe!\' Well, what if I don\'t want to be a shoe? What if I want to be a purse, you know, or a hat!'
  },
  {character: 'Ross Geller', quote: 'Seven! Seven! Seven!'},
  {character: 'Joey Tribbiani', quote: 'You can\'t just give up! Is that what a dinosaur would do?'},
  {character: 'Ross Geller', quote: 'That\'s not even a word!'},
];
