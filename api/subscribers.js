// GET /api/subscribers?token=YOUR_ADMIN_TOKEN
//
// Returns the current subscriber list from Vercel KV. Protected by the
// ADMIN_TOKEN env var — if it isn't set, the endpoint stays disabled.
// Set ADMIN_TOKEN to a long random string in your Vercel project settings.

export default async function handler(req, res) {
  const admin = process.env.ADMIN_TOKEN;
  if (!admin) return res.status(404).json({ error: 'Not found' });

  const provided = req.query && req.query.token;
  if (provided !== admin) return res.status(401).json({ error: 'Unauthorized' });

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return res.status(503).json({ error: 'Storage not configured' });

  try {
    const r = await fetch(`${url}/smembers/astraiono:subscribers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!r.ok) return res.status(502).json({ error: 'Read failed' });
    const data = await r.json();
    const emails = Array.isArray(data.result) ? data.result : [];
    return res.status(200).json({ count: emails.length, emails });
  } catch {
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
