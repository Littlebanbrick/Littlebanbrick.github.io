# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static personal site (React 19 + Vite 8) deployed to GitHub Pages at `Littlebanbrick.github.io`. It has no backend: all content is Markdown files under `src/notes/` bundled at build time. The "My Blog" section links out to a separate dynamic full-stack blog at `littlebanbrick.cn` (described in `src/notes/blog/blog_readme.md`, source in a different `my-blog` repo) — that blog is being deprecated in August 2026 and its content is being migrated into this static site.

## Commands

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
npm run lint       # eslint .
```

There are no tests. Deployment is automatic: pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci` → `npm run build` and uploads `dist/` to GitHub Pages. Do not change `vite.config.js`'s `base: '/'` — it matches the site root on Pages.

## Architecture

### Two-screen state machine (the big picture)

`App.jsx` is not a router — it's a small state machine driving a cover/content transition:

`cover` → (click) → `cover-exit` → (transitionend) → `content` → (back) → `content-exit` → (transitionend) → `cover`

Both `Cover` and `ContentLayout` are `position: fixed` full-screen overlays (see `#cover-root` / `#content-root` in `index.css`). Visibility is animated purely via CSS transform classes (`cover-visible`/`cover-hidden`, `content-visible`/`content-hidden`) toggled from the `stage` state. The transitions complete on the `transitionend` event for `transform` — both components listen for this and call back into `App` to advance the stage. When editing animations, preserve this `transitionend` handshake or the state machine stalls.

### Content loading via `import.meta.glob`

`ContentLayout.jsx` globs Markdown from `src/notes/` at build time using `?raw`. **The glob patterns matter — they differ per section:**

- `study`  → `../notes/study/**/*.md`  (recursive — subfolders become categories)
- `travelogues` → `../notes/travelogues/**/*.md` (recursive)
- `essays` → `../notes/essays/*.md` (flat only — a subfolder here would be ignored)
- `blog` / `about` / `welcome` → single-file loaders (first match wins)

`loadNotesFromGlob` parses each file into `{ id, title, preview, content, pinned }`:
- **title** = first `# ` heading line (falls back to filename)
- **preview** = first 150 chars of the body with Markdown syntax stripped (`stripMarkdown`), unless overridden
- **category** = the subfolder name; root-level files become "Uncategorized"

Within a category, pinned notes sort first, then alphabetical by title.

### Markdown note authoring conventions

Notes are plain `.md` files. Two optional HTML-comment directives are parsed by `loadNotesFromGlob` and must sit in the body (after the `# ` title):

```html
<!-- preview: custom summary text shown on the index -->
<!-- pinned: true -->
```

Notes render through `react-markdown` with `remark-gfm`, `remark-math`, `rehype-katex`, and **`rehype-raw`** (raw HTML in Markdown is allowed and used — the welcome/about notes embed inline `<div>`/`<p>` with styles). `src/utils/math.js` (`normalizeMath`) rewrites `\(...\)` → `$...$` and `\[...\]` → `$$...$$` before rendering, because CommonMark strips the backslash before `remark-math` sees it — keep using `$`/`$$` directly in new notes if possible.

### Theme

Light/dark via a `data-theme` attribute on `<html>`, set in `App.jsx` and persisted to `localStorage` (key `"theme"`). All colors are CSS variables defined in `index.css` (`--bg`, `--text`, `--border`, `--bg-card`, etc.) — use these variables in inline styles, never hardcoded colors, or dark mode breaks. KaTeX CSS is imported once in `main.jsx`; Font Awesome is loaded via CDN in `index.html`.

### Images

Per recent commits, image assets are hosted on **Imgur** (external `https://i.imgur.com/...` URLs), not committed to the repo. `AboutSection.jsx` wraps `<img>` with `ImgWithFallback`, which appends a daily cache-busting query param to external URLs and shows loading/error states. When adding image-heavy notes, route them through this component (or follow the Imgur URL convention) rather than committing binaries to `public/`.

## Conventions to preserve

- **Inline styles over CSS files.** Almost all components use `style={{...}}` objects rather than classNames; `index.css` only defines layout primitives, the `.markdown-body` typography, theme variables, and the cover/content animation classes. Match this style — don't introduce new CSS classes without reason.
- **Styling uses CSS variables.** Hardcoded hex (e.g. `#fff`, `#666`) only appears in `Cover.jsx` (the cover image overlay) and legacy template files.
- **`src/components/Hero.jsx`, `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg` are unused Vite-template leftovers** (not imported anywhere). They can be deleted; don't treat them as part of the app.

## Deploy

Push to `main` → GitHub Actions builds and publishes. No manual deploy step. The workflow uses Node 20 and `npm ci`, so `package-lock.json` must stay in sync with `package.json`.
