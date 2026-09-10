import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl}/login`, changeFrequency: 'monthly', priority: 1 }];
}
