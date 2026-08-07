# Tournament intel SQLite database

`tournament-intel.db` is the local sales-intelligence store used by `/intel`.

Populate it with:

```bash
npm run intel:import    # RBFA Antwerp provincial clubs
npm run intel:crawl     # website → Facebook / Instagram / tournament pages
npm run intel:scrape    # ~16 months of FB / IG / blog posts
npm run intel:analyze   # GPT-5.6 Luna (medium) — store tournament hits only
```

Or all at once:

```bash
npm run intel:pipeline
```

Requires `OPENAI_API_KEY` for the analyze step.
