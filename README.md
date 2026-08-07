# UwTornooi — Marketing ideas board

Internal Next.js site that maps growth ideas for [uwtornooi.be](https://uwtornooi.be).

## Tracks

1. **Club data** — lead list from Voetbal Vlaanderen + social tournament signals (spec later)
2. **Cold outreach** — 5-day direct sequence (IG DM → FB DM → email → call) ([`/ideeen/cold-outreach`](./src/app/ideeen/cold-outreach/page.tsx))
3. **SEO + SEA vs Tournify** — full strategy hub + Dutch content drafts ready to ship
4. **Social alerts** — daily cron on club FB/IG for new tournament announcements → notify → comment + DM ([`/ideeen/social-alerts`](./src/app/ideeen/social-alerts/page.tsx)) (outline only)

### SEO / SEA cluster

- Strategy: [`/ideeen/seo-concurrent`](./src/app/ideeen/seo-concurrent/page.tsx)
- Draft pages live under `/ideeen/seo-concurrent/<slug>` (vs, alternatief, migratie, feature pages)
- Target paths on uwtornooi.be are documented on each draft (e.g. `/tournify-alternatief`)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
