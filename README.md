# Moonroot Apothecary — Landing Page

A single-page site: hero, mission/vision, founder story, product direction, and two signup forms (waitlist + newsletter) that actually save emails.

## What's in here

```
index.html          the whole page (HTML + CSS + a small script that wires the forms)
images/              your logo files
api/subscribe.js     serverless function the forms submit to — saves each signup
api/export.js        private endpoint for you to pull the saved emails back out
package.json         one dependency (@upstash/redis)
```

No build step, no framework — Vercel serves `index.html` and everything in `images/`
as-is, and treats each file in `api/` as its own serverless function automatically.

## Before you touch code: fill in your bio

Open `index.html`, search for `[Founder Name]`, and replace it with whatever name
you want on the page (your own, "Indigo," — your call). The bio paragraphs are
filled in below it from what we drafted together; edit them freely. There's also
a "Your photo goes here" placeholder in the same section (the `.founder-photo`
div) — swap that div for an `<img>` tag pointing at a photo in `images/` once
you have one.

## 1. Push this to GitHub

If you don't already have a repo for this:

```bash
cd moonroot-site
git init
git add .
git commit -m "Moonroot Apothecary landing page"
```

Then create a new repository on github.com (leave it empty, no README/license),
and push:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

## 2. Import it into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in (GitHub login is easiest).
2. Choose "Import" next to the repo you just pushed.
3. Framework preset: leave it as **Other** — no build command, no output directory needed.
4. Click **Deploy**. You'll get a live `.vercel.app` URL in under a minute.

At this point the page is live, but the forms will fail (there's no storage
connected yet) — that's step 3.

## 3. Add free email storage (Upstash Redis, via Vercel)

1. In your Vercel project, open the **Storage** tab.
2. Find **Upstash** under the Marketplace database options and click **Install** (or **Create Database**, wording varies).
3. Pick the free plan and a region close to where your Vercel functions run (same region Vercel suggests is fine).
4. **Connect** it to this project. Vercel automatically adds environment variables to your project — depending on how the integration connects, these come through either as `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` or as `KV_REST_API_URL` / `KV_REST_API_TOKEN`. The code checks for both, so either naming works — you don't need to copy or rename anything.
5. Go to **Settings → Environment Variables** in your Vercel project and add one more, of your own choosing:
   - `ADMIN_SECRET` = any password-like string you pick (e.g. `moonroot-2026-xy7`). This protects the export endpoint in step 5 below.
6. Redeploy the project (Vercel → Deployments → click the ⋯ menu on the latest deployment → **Redeploy**). Environment variables only take effect after a redeploy.

That's it — no separate Upstash account to create, no credit card required on
the free tier.

## 4. Test the forms

Visit your live site and submit both forms with a test email address. You
should see "You're on the list — thank you!" appear under the form. If you
see an error instead, double check step 3 (the two Upstash env vars need to
exist and you need to have redeployed after adding them).

## 5. Pull your signups later

Once you have real signups, fetch them from:

```
https://YOUR-SITE.vercel.app/api/export?secret=YOUR_ADMIN_SECRET
```

Add `&list=waitlist` or `&list=newsletter` to see just one list, or
`&format=csv` to download a CSV you can open in a spreadsheet:

> **One Vercel project, not two.** If you ever end up with two Vercel
> projects for this repo (this can happen if you imported the repo more
> than once), storage and env vars live on whichever project you connected
> Upstash to — but your GitHub pushes might be deploying the *other* one.
> Check **Settings → Git** on each project to see which repo/branch it
> deploys, delete the duplicate you're not using, and make sure Storage
> (Upstash) is connected to the one that's actually live.

```
https://YOUR-SITE.vercel.app/api/export?secret=YOUR_ADMIN_SECRET&format=csv
```

Keep that URL/secret private — anyone with it can see your signup list.

## 6. Custom domain (optional)

In Vercel → your project → **Settings → Domains**, add your own domain
(e.g. `moonrootapothecary.com`) and follow the DNS instructions Vercel gives
you. Your registrar (GoDaddy, Namecheap, etc.) is where you'll add the DNS
records it asks for.

## Making changes later

Edit `index.html` (or anything else), commit, and push to GitHub — Vercel
redeploys automatically on every push to `main`. No dashboard steps needed
for content changes, only for things like adding storage or env vars.
