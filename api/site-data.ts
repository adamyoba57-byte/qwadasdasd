// Vercel Serverless Function: /api/site-data
// Handles persistent data sync on Vercel deployments with optional Upstash / Vercel KV support

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (req.method === 'POST') {
    const payload = req.body;
    if (!payload || !payload.data) {
      return res.status(400).json({ error: 'Missing data payload' });
    }

    if (kvUrl && kvToken) {
      try {
        const cleanUrl = kvUrl.replace(/\/+$/, '');
        const resp = await fetch(`${cleanUrl}/set/easyacss_site_data`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload.data)
        });
        const result = await resp.json();
        return res.status(200).json({ success: true, cloud: 'upstash_kv', result });
      } catch (err: any) {
        console.error('KV save error on Vercel:', err);
        return res.status(500).json({ error: 'Failed to write to KV store' });
      }
    }

    // If no KV is configured on Vercel
    return res.status(200).json({
      success: true,
      persisted: false,
      notice: 'Vercel serverless is running in static mode. To enable cross-visitor cloud sync, connect Vercel KV or Upstash Redis.'
    });
  }

  if (req.method === 'GET') {
    if (kvUrl && kvToken) {
      try {
        const cleanUrl = kvUrl.replace(/\/+$/, '');
        const resp = await fetch(`${cleanUrl}/get/easyacss_site_data`, {
          headers: {
            Authorization: `Bearer ${kvToken}`
          }
        });
        const json = await resp.json();
        if (json && json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          return res.status(200).json({
            initialized: true,
            data: parsed,
            cloud: 'upstash_kv'
          });
        }
      } catch (err: any) {
        console.error('KV fetch error on Vercel:', err);
      }
    }

    return res.status(200).json({
      initialized: false,
      notice: 'No cloud database configured on Vercel yet.'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
