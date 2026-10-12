import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Coleção de artigos e análises comparativas de produtos para afiliados ClickBank.
 */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Canine Behavior & Training Team'),
    category: z.string().default('Dog Training & Pet Care'),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    featured: z.boolean().default(false),
    rating: z.number().min(0).max(5).default(4.8),
    tags: z.array(z.string()).default([]),
    topPickName: z.string().optional(),
    topPickVendor: z.string().optional(),
    topPickUrl: z.string().optional(),
    guaranteeDays: z.number().default(60),
    showGuaranteeBadge: z.boolean().default(true),
    includeFdaDisclaimer: z.boolean().default(false),
  }),
});

export const collections = { articles };
