# Deploying to Vercel

The site now needs a Node runtime for `app/api/chat` and `app/api/contact`
(OpenRouter + Resend), which the previous GitHub Pages static export could not run.
The `.github/workflows/pages.yml` GitHub Pages workflow has been removed.

**Update: this repo already has Vercel's GitHub integration connected** —
opening PR #42 triggered an automatic preview deployment
(`gopalakrishna-maddipalli/portfolio` on Vercel), so steps 1–2 below are
already done. That project currently has Vercel Authentication enabled on
previews, so the preview URL redirects to a Vercel login rather than showing
the site to anyone not on that team — that's a project setting (**Settings →
Deployment Protection**), turn it off there if you want previews to be
publicly viewable. Steps 3–5 (env vars, confirming the deploy, and pointing
the domain) still need you.

These steps need your own accounts/credentials, so they're written for you to
run yourself — I can't create accounts or touch your domain's DNS.

## 1. Install and log in to the Vercel CLI

```bash
npm install -g vercel
vercel login
```

This opens a browser to authenticate (or create a free Vercel account if you
don't have one).

## 2. Link this repo to a Vercel project

From the repo root:

```bash
vercel link
```

Follow the prompts — create a new project (e.g. `gopalakrishna-portfolio`).

## 3. Add environment variables

In the Vercel dashboard for the new project → **Settings → Environment
Variables**, add for Production (and Preview, if you want the assistant/form
working on preview deploys too):

- `OPENROUTER_API_KEY` — used by `app/api/chat/route.ts`
- `RESEND_API_KEY` — used by `app/api/contact/route.ts`

(Or via CLI: `vercel env add OPENROUTER_API_KEY production`, same for
`RESEND_API_KEY`.)

## 4. Deploy

```bash
vercel --prod
```

Vercel will give you a `*.vercel.app` URL — confirm the site, the chat
assistant, and the contact form all work there before moving the domain over.

## 5. Point gopalakrishnagenai.in at Vercel

In the Vercel dashboard for the project → **Settings → Domains**, add
`gopalakrishnagenai.in`. Vercel will show you the exact DNS records to add —
typically, at whatever registrar/DNS host manages `gopalakrishnagenai.in`
today:

- An **A** record for the apex domain (`@`) → the IP Vercel displays
  (currently `76.76.21.21`, but use whatever Vercel's dashboard shows you).
- Optionally a **CNAME** for `www` → `cname.vercel-dns.com`.

DNS changes can take anywhere from a few minutes to ~48 hours to propagate.
Vercel's dashboard will show the domain as "Valid Configuration" once it
detects the records.

## 6. After the domain is live on Vercel

- You can leave the `CNAME` files in the repo (harmless — GitHub Pages just
  won't be serving anything once you stop pointing DNS at it) or delete them
  once you're confident the migration is done.
- If GitHub Pages is still enabled for this repo (Settings → Pages), you can
  turn it off there too, though it's not required once DNS points elsewhere.
