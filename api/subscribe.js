// POST /api/subscribe  —  newsletter signup for Astra Iono
//
// Stores emails in Vercel KV (Upstash Redis) via its REST API. No npm deps:
// it uses the global fetch and the env vars Vercel injects when you connect a
// KV store to the project:
//   KV_REST_API_URL, KV_REST_API_TOKEN
//
// Data model:
//   set  "astraiono:subscribers"  -> unique lowercased emails (dedupe)
//   list "astraiono:signups"      -> JSON records {email, ts, source}
//
// See NEWSLETTER.md for the one-time setup steps.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body whether Vercel pre-parsed it or handed us a raw string.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const email = (body && body.email ? String(body.email) : '').trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    // Storage isn't connected yet — surface a clear 503 instead of pretending.
    return res.status(503).json({ error: 'Signup is not configured yet. Please try again later.' });
  }

  const record = JSON.stringify({
    email,
    ts: new Date().toISOString(),
    source: 'astraiono-web'
  });

  try {
    const r = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['SADD', 'astraiono:subscribers', email],
        ['LPUSH', 'astraiono:signups', record]
      ])
    });

    if (!r.ok) {
      return res.status(502).json({ error: 'Could not save your signup. Please try again.' });
    }

    const results = await r.json();              // [{result: 1|0}, {result: n}]
    const added = Array.isArray(results) && results[0] && results[0].result === 1;
    return res.status(200).json({ ok: true, alreadySubscribed: !added });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error. Please try again.' });
  }
}
