# Hens Party Itinerary Site

This is a static site you can host on GitHub Pages.

## Local preview

Open `hens-party-site/index.html` in your browser (double-click).

## Edit the content

Everything is in `hens-party-site/content/program-data.js`.

## Publishing (share a public link)

This folder includes a **GitHub Actions** workflow (`.github/workflows/pages.yml`) that publishes the site to **GitHub Pages** on every push to `main`.

1. Create a **new empty repository** on GitHub (any name, e.g. `hens-itinerary`).
2. From **this folder** (`hens-party-site/`) in Terminal:

   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions** (not “Deploy from a branch”).
4. Open the **Actions** tab; the “Deploy to GitHub Pages” workflow should run. When it finishes, **Settings → Pages** shows the site URL.

**Your link** will look like:

- `https://YOUR_USERNAME.github.io/YOUR_REPO/` (if the repo is named `hens-itinerary`), or  
- `https://YOUR_USERNAME.github.io/` only if the repo is **`YOUR_USERNAME.github.io`** (special naming rule).

To edit the trip later: change `content/program-data.js` in GitHub (or locally, then push).

### Option B (non-technical editor): Decap CMS (GitHub login)

GitHub Pages cannot securely support “anyone with a passcode can edit and save”
because a static site has no trusted server to store changes.

The closest secure workflow on GitHub Pages is: editors log in with **GitHub**
and edits are committed to the repo.

1. In `admin/config.yml`, set:
   - `repo:` to your repo (e.g. `hensparty/hensparty.github.io`)
   - `branch:` to your default branch
2. Enable Decap CMS authentication via **OAuth**.
   - This typically requires deploying an OAuth helper (e.g. Netlify or a small
     serverless endpoint). If you want, I can set up the simplest hosted option.
3. Editors then go to `/admin/` on your site.

## Notes

- The itinerary uses direct Google Maps links (`https://www.google.com/maps/search/?api=1&query=...`).
- Printing works well: use the **Print / Save PDF** button.

