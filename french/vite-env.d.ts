// Fixes: "Cannot find type definition file for 'vite/client'" and "Cannot redeclare block-scoped variable 'process'"

// Manually define ImportMetaEnv since vite/client is reported as missing/unresolvable
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment NodeJS.ProcessEnv to include API_KEY. 
// This merges with the existing NodeJS namespace (provided by @types/node) instead of redeclaring 'process' which causes conflicts.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
