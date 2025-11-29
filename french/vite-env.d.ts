/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment the global NodeJS namespace to include API_KEY in ProcessEnv.
// This allows TypeScript to recognize process.env.API_KEY without redeclaring the process variable,
// which avoids conflicts when @types/node is present.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
