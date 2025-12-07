import type { Handler } from '@netlify/functions';

const FACEIT_BASE_URL = 'https://open.faceit.com/data/v4';

export const handler: Handler = async (event) => {
  const apiKey = process.env.FACEIT_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'FACEIT_API_KEY not configured' })
    };
  }

  const params = event.queryStringParameters || {};
  const type = params.type;

  let url: string | null = null;

  try {
    switch (type) {
      case 'hubMatches': {
        const hubId = params.hubId;
        const offset = params.offset ?? '0';
        const limit = params.limit ?? '100';

        if (!hubId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing hubId' })
          };
        }

        url = `${FACEIT_BASE_URL}/hubs/${hubId}/matches?type=past&offset=${offset}&limit=${limit}`;
        break;
      }

      case 'matchMeta': {
        const matchId = params.matchId;
        if (!matchId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing matchId' })
          };
        }
        url = `${FACEIT_BASE_URL}/matches/${matchId}`;
        break;
      }

      case 'matchStats': {
        const matchId = params.matchId;
        if (!matchId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing matchId' })
          };
        }
        url = `${FACEIT_BASE_URL}/matches/${matchId}/stats`;
        break;
      }

      case 'matchLeaderboard': {
        const leaderboardId = params.leaderboardId;
        if (!leaderboardId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing leaderboardId' })
          };
        }
        url = `${FACEIT_BASE_URL}/leaderboards/${leaderboardId}`;
        break;
      }

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Unknown type' })
        };
    }

    const resp = await fetch(url!, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const text = await resp.text();

    return {
      statusCode: resp.status,
      body: text,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // optional, but handy
      }
    };
  } catch (err: any) {
    console.error('FACEIT proxy error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch from FACEIT' })
    };
  }
};
