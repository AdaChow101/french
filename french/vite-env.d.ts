// Explicitly declare the global process variable to fix TS2580
// This is required because we are not using @types/node but the SDK requires process.env.API_KEY
declare var process: {
  env: {
    API_KEY: string;
    [key: string]: any;
  }
};

// Manually define Vite's ImportMetaEnv
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
