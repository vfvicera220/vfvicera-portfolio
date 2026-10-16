# vfvicera-portfolio

Personal portfolio for Victor Francis Vicera — Next.js 14, statically exported.

## Develop

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
```

## Deploy (Cloudflare Pages)

The site is a static export, so Cloudflare Pages serves `./out` directly.

Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick this repo, then:

| Setting | Value |
| --- | --- |
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npx next build` |
| Build output directory | `out` |
| Environment variable | `NODE_VERSION` = `20` |

Every push to `main` deploys to production; every other branch gets a preview URL.
