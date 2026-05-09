# PDF Page Editor

A browser-based PDF viewer that lets you open a PDF, remove unwanted pages, and download the edited result — no server, no install, runs entirely in-browser.

## Features

- Open any local PDF file
- Thumbnail sidebar showing all pages (like macOS Preview)
- Click a thumbnail to view the full page
- Delete individual pages from the sidebar
- Download a new PDF containing only the remaining pages

## Usage

Open the deployed app in any modern browser, then:

1. Click **Open PDF** and pick a `.pdf` file from your computer
2. Browse pages in the left sidebar — click any thumbnail to see it full-size
3. Hover a thumbnail to reveal the **✕** delete button, then click it to remove that page
4. Click **Save as PDF** when done — the edited file downloads automatically

The PDF never leaves your device; all processing is done locally in the browser.

---

## Running Locally

Requires Node.js 20+ and npm.

```bash
cd pdf-page-editor
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## Deploying to Netlify

### Option A — Drag & Drop (quickest, no Git needed)

1. Run `npm run build` inside the `pdf-page-editor` directory
2. Go to https://app.netlify.com and log in
3. Drag the `pdf-page-editor/dist` folder onto the Netlify "Deploy manually" drop zone
4. Copy the generated URL and share it

### Option B — Git-linked (auto-deploys on every push)

1. Push this repository to GitHub / GitLab / Bitbucket
2. In Netlify, click **Add new site → Import an existing project**
3. Connect your repo; Netlify will auto-detect `netlify.toml` and use these settings:
   - Base directory: `pdf-page-editor`
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy site**

Once deployed, open the Netlify URL on any Windows 11 laptop with a modern browser — no install required.

---

## Stack

| Library | Purpose |
|---------|---------|
| React 19 + TypeScript + Vite | App shell and build tooling |
| react-pdf (PDF.js) | Rendering PDF pages as canvas thumbnails and full-page view |
| pdf-lib | Copying selected pages to a new PDF for download |

## Known Limitations

- Large PDFs (100+ pages, >50 MB) may be slow to load thumbnails — rendering is progressive so you can start editing before all thumbnails appear
- Password-protected PDFs are not supported
- The app is stateless: refreshing the page resets everything
