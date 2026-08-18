/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SIGHTENGINE_USER?: string;
  readonly VITE_SIGHTENGINE_SECRET?: string;
  readonly VITE_GOOGLE_API_KEY?: string;
  readonly VITE_GOOGLE_CX?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
