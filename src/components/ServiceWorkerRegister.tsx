'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Registering in dev fights Next.js Fast Refresh: the SW can serve a
    // cached HTML shell that references chunks the dev server has since
    // replaced, forcing a reload loop. Only run this in production builds.
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return null;
}
