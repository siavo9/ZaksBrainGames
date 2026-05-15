# Zak's Brain Games

A friendly, kid-friendly home page for fun brain-boosting games.

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this folder to a new GitHub repo
2. On vercel.com, click "New Project" and import the repo
3. Vercel auto-detects Node.js — no config needed
4. Done! Your site will be live at a `*.vercel.app` URL (and you can add a custom domain)

## File structure

```
package.json       Express + start script
server.js          Tiny Express server
vercel.json        Vercel deployment config
public/
  index.html       The whole site (HTML + CSS + JS in one file)
  privacy.html     Privacy policy
  robots.txt       SEO
  sitemap.xml      SEO
```

## Customizing

- **Add a game:** edit the `GAMES` array near the top of `<script>` in `public/index.html`
- **Add a brain fact:** add a string to the `FACTS` array in the same file
- **Change colors:** edit the `:root` CSS variables at the top of the `<style>` block
