// Fixes TS2580: Cannot find name 'process'
// The error "Cannot redeclare block-scoped variable 'process'" indicated that process is already defined
// (likely by @types/node). We augment the existing NodeJS namespace to include API_KEY in ProcessEnv
// instead of redeclaring the global variable which causes conflicts.

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: any;
  }
}

// Manually define Vite's ImportMetaEnv since we are not using the full vite/client types
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
