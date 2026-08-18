# Image Analyzer

[![Netlify Status](https://img.shields.io/badge/Netlify-Deployed-00C7B7?logo=netlify&logoColor=white)](https://free-image-analyzer.netlify.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?logo=github&logoColor=white)](https://github.com/GeekLord/free-image-analyzer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/GeekLord/free-image-analyzer/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A client-side web application that evaluates uploaded images for content safety metrics and queries the web for matching sources and duplicate images.

[**Live Demo**](https://free-image-analyzer.netlify.app/) | [**GitHub Repository**](https://github.com/GeekLord/free-image-analyzer)

All analysis runs directly in the browser with no backend server required.

## Features

- **Content safety scoring**: Evaluates images for nudity, suggestive material, and violence scores using the SightEngine API.
- **Image metadata extraction**: Reads image dimensions, file size, format, and aspect ratio client-side upon selection.
- **Reverse search quick-links**: Provides direct lookup links to Google Lens, Bing Visual Search, TinEye, and Yandex Images.
- **Web source matching**: Searches for matching web pages and image occurrences using the Google Custom Search API.
- **Flexible upload options**: Supports drag-and-drop, standard file picker, and direct clipboard pasting (Ctrl+V / Cmd+V).
- **Theme support**: Includes dark mode and light mode with persistent theme preference.

## Supported formats

The application accepts single image uploads up to standard browser memory limits in the following formats:

- PNG
- JPG / JPEG
- GIF
- WEBP

## Getting started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/GeekLord/free-image-analyzer.git
   cd free-image-analyzer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## Environment configuration

Create a `.env` file in the project root with the following variables:

```env
# SightEngine API credentials (required for safety scoring)
# Create a free account at https://sightengine.com/ to get your credentials
VITE_SIGHTENGINE_USER=your_sightengine_api_user
VITE_SIGHTENGINE_SECRET=your_sightengine_api_secret

# Google Custom Search API (optional: used for web source search)
# Create credentials in the Google Cloud Console and set up a search engine at https://programmablesearchengine.google.com/
VITE_GOOGLE_API_KEY=your_google_custom_search_api_key
VITE_GOOGLE_CX=your_google_custom_search_engine_cx
```

Note: Because Vite bundles environment variables prefixed with `VITE_` into client code, never expose sensitive private tokens with write permissions.

## Available scripts

- `npm run dev`: Runs the local development server with Hot Module Replacement (HMR).
- `npm run build`: Runs TypeScript type checks (`tsc`) and bundles production assets into `dist/`.
- `npm run preview`: Starts a local server to test the production build output.

## Architecture

The project is structured as a single-page application with unidirectional data flow:

```
src/
├── components/
│   ├── AnalysisResults.tsx   # Displays metadata, safety scores, and search results
│   ├── ImageUploader.tsx     # Dropzone and clipboard paste interface
│   └── ThemeToggle.tsx       # Dark/light mode button
├── context/
│   └── ThemeContext.tsx      # Theme state and local storage persistence
├── services/
│   └── api.ts                # SightEngine and Google Custom Search HTTP requests
├── types/
│   └── index.ts              # Shared TypeScript interfaces
├── App.tsx                   # Top-level state and orchestrator
├── main.tsx                  # React entry point
└── index.css                 # Tailwind directives and base animations
```

## Deployment

### Netlify

This repository includes a pre-configured `netlify.toml` file with SPA routing rules, security headers, and asset caching.

#### Deploy with Git

1. Push your repository to GitHub: `https://github.com/GeekLord/free-image-analyzer`
2. Log in to Netlify and choose **Add new site** > **Import an existing project**.
3. Select your repository. Netlify automatically detects build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Under **Project configuration** > **Environment variables**, add your `VITE_SIGHTENGINE_USER`, `VITE_SIGHTENGINE_SECRET`, and optional Google search keys.
5. Click **Deploy site**.

#### Deploy with Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## Author

**Shobhit Kumar Prabhakar**  

- GitHub: [@GeekLord](https://github.com/GeekLord)
- Live App: [free-image-analyzer.netlify.app](https://free-image-analyzer.netlify.app/)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
