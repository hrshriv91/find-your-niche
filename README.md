# Find Your Niche

A responsive, browser-based career exploration site for students. It uses plain HTML, CSS, and vanilla JavaScript, with JSON files for the profile and exam examples.

## Run locally

Serve the project folder over HTTP so the quiz and matching pages can load their JSON data. From this folder, run one of these commands:

```powershell
py -m http.server 8000
```

```sh
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). Stop the server with `Ctrl+C`.

Opening `index.html` directly as a `file://` URL may prevent the browser from loading the JSON data files.

## Deploy to GitHub Pages

The production CSS and JavaScript bundles are already included in this repository. No package installation, framework, build command, or GitHub Actions workflow is required for deployment.

1. Create a GitHub repository. On GitHub Free, use a public repository for Pages.
2. Put the **contents of this project folder** at the repository root, so `index.html`, `css/`, `js/`, `data/`, and `pages/` are at the top level.
3. Commit and push the files to the `main` branch.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Set the branch to `main` and the folder to `/(root)`, then save.
7. After GitHub finishes publishing, use the site URL shown in the Pages settings. A project site URL generally follows `https://<github-user>.github.io/<repository-name>/`.

The included `.nojekyll` file tells GitHub Pages to serve the project as static files without running Jekyll. The site uses relative links, so it works from the repository subpath used by project sites.

## Editing

- Edit page content in `index.html`, `pages/`, and `affiliates.html`.
- Profile and exam example data live in `data/profiles.json` and `data/exams.json`.
- The editable CSS and JavaScript sources are in `css/style.css` and `js/`.
- Pages load the checked-in production files `css/style.min.css` and `js/app.min.js`. If you change the source CSS or JavaScript, optionally refresh those production bundles with `node scripts/build.js` before publishing. This command is not needed for a fresh deployment.

The example profile and exam content is starter material; check official sources before relying on changing eligibility, dates, or admissions details.

## Project files

```text
index.html
affiliates.html
pages/                 Additional site pages
css/style.css          Editable stylesheet
css/style.min.css      Production stylesheet used by the pages
js/                    Editable JavaScript modules and production bundle
data/                  Profile and exam example data
.nojekyll              Serve the repository as static files
```

For current publishing options and access requirements, see [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
