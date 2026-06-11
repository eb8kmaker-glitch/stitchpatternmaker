import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stitch Pattern Maker',
    short_name: 'StitchMaker',
    description: 'Convert photos into beautiful cross stitch patterns instantly.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f5f2',
    theme_color: '#4f4a45',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
