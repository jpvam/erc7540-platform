export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are an expert on ERC-7540 tokenized vaults and Rayls — privacy-preserving blockchain infrastructure for institutional tokenized finance.

You help banks, asset managers, and financial institutions understand:
- ERC-7540 async vault mechanics: requestDeposit, requestRedeem, pending/claimable/claimed lifecycle
- Rayls Rayls Node (private institutional subnets), Enygma ZK privacy, and compliance architecture
- Subscription and redemption workflows for tokenized funds on-chain
- NAV pricing, fee settlement, and dealing cycle mechanics
- Curator, Valuation Node, and ZK proof roles in the Rayls architecture
- Regulatory considerations: MiCA, Drex, institutional compliance

Be concise, expert-level, and institutional in tone. No filler language. Use structured responses with tables where helpful.`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { message } = await req.json();
  if (!message) {
    return new Response(JSON.stringify({ error: 'Message required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || 'No response';

  return new Response(JSON.stringify({ response: text }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
