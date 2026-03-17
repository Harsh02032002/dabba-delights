// Polyfills for browser environment

// Fix "process is not defined" error
if (typeof window !== 'undefined') {
  (window as any).process = {
    env: {
      NODE_ENV: import.meta.env.MODE || 'development',
    },
  };
}

// Fix "global is not defined" error
if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

export const polyfill = true;
