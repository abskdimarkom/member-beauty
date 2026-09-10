import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/login',
      // Member routes and the API return one customer's data — never crawl them.
      disallow: ['/riwayat', '/info', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
