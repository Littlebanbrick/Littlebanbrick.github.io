# Littlebanbrick.github.io

My personal website, built with [MkDocs](https://www.mkdocs.org/) and hosted on [GitHub Pages](https://pages.github.com/).

**Live site:** [https://littlebanbrick.github.io](https://littlebanbrick.github.io)

## Project structure

- `docs/` – Markdown source files
- `mkdocs.yml` – MkDocs configuration
- `gh-pages` branch – deployed site (auto-generated)

## Local development

1. Clone the repo  
   `git clone https://github.com/Littlebanbrick/Littlebanbrick.github.io.git`
2. Install MkDocs  
   `pip install mkdocs`
3. Start the live preview server  
   `mkdocs serve`
4. Open **http://127.0.0.1:8000** in your browser

## Deploy

Build and publish the site to GitHub Pages with a single command:

```bash
mkdocs gh-deploy
```

The site will be available at **https://littlebanbrick.github.io** after deployment.
