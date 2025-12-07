const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event) => {
  const apiKey = process.env.FACEIT_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: 'FACEIT_API_KEY not configured' };
  }

  const faceitPath = event.path.replace('/.netlify/functions/faceit-proxy', '');

  const query = event.rawQueryString ? `?${event.rawQueryString}` : '';
  const url = `https://open.faceit.com${faceitPath}${query}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const body = await res.text();

    return {
      statusCode: res.status,
      body,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (err) {
    console.error('Faceit proxy error', err);
    return { statusCode: 500, body: 'Error calling FACEIT API' };
  }
};
