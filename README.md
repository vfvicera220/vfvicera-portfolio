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
