# Newsletter signup (Vercel + KV)

The fan signup form posts to a Vercel Serverless Function that stores emails in
**Vercel KV** (Upstash Redis). No build step and no npm dependencies — the
function uses the global `fetch` and the env vars Vercel injects for KV.

```
api/subscribe.js      POST  – validates + stores the email (deduped)
api/subscribers.js    GET   – returns the list (protected by ADMIN_TOKEN)
```

## One-time setup (≈2 minutes)

1. **Create the KV store**
   - Vercel Dashboard → your **astraiono** project → **Storage** tab → **Create
     Database** → **KV** (Upstash Redis) → give it a name → **Create**.
2. **Connect it to the project**
   - On the store, click **Connect Project** → select `astraiono` → connect for
     **Production** (and Preview if you want test signups too).
   - This automatically adds the env vars `KV_REST_API_URL` and
     `KV_REST_API_TOKEN` to the project.
3. **(Optional) Enable the admin list endpoint**
   - Project → **Settings → Environment Variables** → add `ADMIN_TOKEN` set to a
     long random string (e.g. from a password manager).
4. **Redeploy** (Vercel does this automatically when env vars change, or push any
   commit). Done — the form now stores real signups.

## Viewing subscribers

- **Quickest:** Storage tab → your KV store → **Data Browser** → look at the set
  `astraiono:subscribers` (unique emails) and the list `astraiono:signups`
  (full records with timestamps).
- **Via the API** (if you set `ADMIN_TOKEN`):
  ```
  https://YOUR-DOMAIN/api/subscribers?token=YOUR_ADMIN_TOKEN
  ```
  returns `{ "count": N, "emails": [...] }`.

## Notes

- Emails are lowercased and de-duplicated (`SADD`), so re-signups don't create
  duplicates — the API reports `alreadySubscribed: true` in that case.
- Until KV is connected, the endpoint returns HTTP 503 and the form shows a
  friendly "not configured yet" message instead of silently dropping signups.
- To export to a real email tool later (Mailchimp/ConvertKit/Beehiiv), pull the
  set from the Data Browser or the admin endpoint and import the CSV.
