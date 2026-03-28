# Catch That Dog

A tiny static web game where a dog keeps jumping away when the pointer gets too close.

## Run locally

Because this is a plain HTML/CSS/JS site, you can open `index.html` directly in a browser.

For a local web server, run one of these commands from the project folder:

```powershell
python -m http.server 8000
```

or

```powershell
py -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy publicly with GitHub Pages

This project is ready for static hosting. GitHub Pages is the simplest free option.

1. Create a new public GitHub repository.
2. Upload these files to the repository root.
3. In GitHub, open `Settings` -> `Pages`.
4. Under `Build and deployment`, set `Source` to `Deploy from a branch`.
5. Select the `main` branch and the `/ (root)` folder.
6. Save, then wait for GitHub to publish the site.

Your site will be available at a URL like:

`https://your-username.github.io/your-repository-name/`

## Files

- `index.html` contains the page structure.
- `styles.css` contains the visual design and animations.
- `app.js` contains the dog movement game logic.
