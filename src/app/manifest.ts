import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Musicograma',
    short_name: 'Musicograma',
    description: 'Crea musicogramas para educación musical y proyéctalos en modo presentación.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5EFE3',
    theme_color: '#B5482A',
    categories: ['education', 'music'],
    icons: [
      { src: '/icon-192', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
