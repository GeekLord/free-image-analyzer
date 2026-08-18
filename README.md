# Image Analyzer

An AI-powered image safety evaluator and reverse image search web application built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## Features

- **Content Safety Analysis**: Integrates SightEngine to detect and breakdown Nudity, Suggestive, and Violence scores with visual indicators and warnings.
- **Reverse Image / Source Search**: Finds matching image instances across the web with titles, direct links, and thumbnails.
- **Drag & Drop + Paste**: Upload files via standard file dialog, drag-and-drop, or direct clipboard paste (`Ctrl+V` / `Cmd+V`).
- **Dark Mode Support**: Seamless light/dark theme switching with persistent user preferences.

## Tech Stack & Code Versions

- **Build Tool**: Vite 6
- **Frontend**: React 18 / TypeScript 5
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **HTTP Client**: Axios 1.7
- **Notifications**: React Hot Toast
- **Upload Helper**: React Dropzone 14

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Build for production
npm run build
```

---

## Netlify Deployment

This project is pre-configured for instant zero-configuration deployment on **Netlify**.

### Deployment Configurations Included:
- **`netlify.toml`**: Configures the build command (`npm run build`), publish directory (`dist`), SPA 200 rewrite rule, static asset cache headers, and HTTP security headers.
- **`public/_redirects`**: Secondary SPA redirect backup rule (`/* /index.html 200`).
- **`.env.example`**: Reference for optional environment variables.

### How to Deploy to Netlify:

#### Option A: Via GitHub / Git (Recommended)
1. Push this repository to GitHub / GitLab / Bitbucket.
2. In the Netlify dashboard, click **"Add new site" > "Import an existing project"**.
3. Select your repository. Netlify will automatically detect `netlify.toml` and configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **"Deploy site"**.

#### Option B: Via Netlify CLI
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login and deploy
ntl init
ntl deploy --prod
```

#### Option C: Manual Drag & Drop
1. Run `npm run build` locally.
2. Drag and drop the generated `dist/` folder into [Netlify Drop](https://app.netlify.com/drop).

### Environment Variables (Optional):
Under **Site configuration > Environment variables**, you can customize:
- `VITE_SIGHTENGINE_USER`
- `VITE_SIGHTENGINE_SECRET`
- `VITE_GOOGLE_API_KEY`
- `VITE_GOOGLE_CX`
