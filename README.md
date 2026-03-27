# Hens Party Itinerary Site

This is a static site you can host on GitHub Pages.

## Local preview

Open `hens-party-site/index.html` in your browser (double-click).

## Edit the content

Everything is in `hens-party-site/content/program-data.js`.

### Excel (edit in Excel / Google Sheets)

1. Install tools: `python3 -m pip install -r tools/requirements.txt`
2. **Export** the current program to a spreadsheet:

   ```bash
   python3 tools/export_program_to_xlsx.py
   ```

   This creates **`Tian-Hens-program-FOR-EDITING.xlsx`** in this folder (open it, edit, save).

3. **Re-import** into the site after editing:

   ```bash
   python3 tools/import_xls.py "Tian-Hens-program-FOR-EDITING.xlsx"
   ```

   Then commit and push `content/program-data.js` (or copy the updated file to GitHub).

Legacy **`.xls`** files still work with `import_xls.py`; new exports use **`.xlsx`**.

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

3. **Required:** On GitHub go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**. If this stays “None” or only “Deploy from a branch”, you will get **404 — There isn’t a GitHub Pages site here** even when workflows succeed.
4. Open the **Actions** tab; wait until **Deploy static content to Pages** finishes with a green check. Then reload your site URL after 1–2 minutes.

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

