# vfvicera-portfolio

Personal portfolio for Victor Francis Vicera — Next.js 14, statically exported.

## Develop

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
```

## Deploy (Cloudflare Workers, static assets)

Live at **https://vvicera.kx-lab.org**.

`wrangler.jsonc` serves the static export in `./out` and binds the custom domain.
In the Cloudflare Workers project (connected to this repo):

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Every push to `main` builds and deploys.

### Contact requests

Email and socials are not published. The form in the Contact section posts to
`/api/contact-request` (`worker/index.ts`), which emails the request via
Cloudflare Email Routing with `Reply-To` set to the visitor.

One-time setup in Cloudflare:

1. **kx-lab.org → Email → Email Routing**: enable it (adds the MX/SPF records).
2. **Destination addresses**: add your inbox and click the verification link.
3. Set the destination as a Worker secret (kept out of this public repo):
   `npx wrangler secret put CONTACT_TO` (or Worker → Settings → Variables and Secrets).

Requests are rate-limited to 3/min per IP, with a honeypot field for bots.

