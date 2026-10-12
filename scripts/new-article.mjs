#!/usr/bin/env node
/**
 * Script de Automação para Criação de Novos Artigos de Afiliados ClickBank.
 *
 * Gera um arquivo MDX pronto para publicação em src/content/articles/
 * com frontmatter validado, componentes de conversão (ProductCard, ComparisonTable, FaqAccordion, MoneyBackGuaranteeBadge),
 * e estrutura editorial para ranqueamento no Google US e vendas no ClickBank.
 *
 * Uso:
 *   node scripts/new-article.mjs --title "Ted's Woodworking Review 2026" --vendor "tedwood" --category "Home & Crafts"
 */

import fs from 'node:fs';
import path from 'node:path';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    title: '',
    vendor: 'bt4dogs',
    category: 'Dog Training & Pet Care',
    author: 'Canine Behavior & Training Team',
    tags: '',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title' && args[i + 1]) {
      options.title = args[i + 1];
      i++;
    } else if (args[i] === '--vendor' && args[i + 1]) {
      options.vendor = args[i + 1];
      i++;
    } else if (args[i] === '--category' && args[i + 1]) {
      options.category = args[i + 1];
      i++;
    } else if (args[i] === '--author' && args[i + 1]) {
      options.author = args[i + 1];
      i++;
    } else if (args[i] === '--tags' && args[i + 1]) {
      options.tags = args[i + 1];
      i++;
    }
  }

  return options;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const options = parseArgs();

if (!options.title) {
  options.title = 'Best Dog Anxiety Solutions of 2026: Natural Calming Methods Tested';
}

const slug = slugify(options.title);
const targetDir = path.resolve(process.cwd(), 'src/content/articles');
const targetFile = path.join(targetDir, `${slug}.mdx`);

if (fs.existsSync(targetFile)) {
  console.error(`❌ Erro: O arquivo ${targetFile} já existe!`);
  process.exit(1);
}

const today = new Date().toISOString().split('T')[0];
const parsedTags = options.tags
  ? options.tags.split(',').map((t) => `"${t.trim()}"`).join(', ')
  : '"dog-training", "pet-care", "clickbank-review"';

const mdxTemplate = `---
title: "${options.title}"
description: "Comprehensive evaluation and testing of top solutions for American pet owners. In-depth analysis of results, pricing, and refund policies."
publishDate: ${today}
author: "${options.author}"
category: "${options.category}"
heroImage: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80"
heroImageAlt: "${options.title}"
featured: false
rating: 4.8
tags: [${parsedTags}]
topPickName: "Recommended Solution"
topPickVendor: "${options.vendor}"
guaranteeDays: 60
showGuaranteeBadge: true
includeFdaDisclaimer: false
---

import ProductCard from '../../components/ProductCard.astro';
import ComparisonTable from '../../components/ComparisonTable.astro';
import FaqAccordion from '../../components/FaqAccordion.astro';
import MoneyBackGuaranteeBadge from '../../components/MoneyBackGuaranteeBadge.astro';

When dealing with behavioral or training hurdles, finding a proven and humane approach can save months of frustration. In this guide, we break down the top recommended methods and test whether they truly work.

## Quick Recommendation & Top Pick

<ProductCard
  name="Featured Program"
  vendor="${options.vendor}"
  tagline="The Science-Backed Solution for American Pet Owners"
  badge="#1 Editor's Pick"
  image="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80"
  rating={4.8}
  reviewCount={3100}
  originalPrice="$97.00"
  currentPrice="$67.00"
  pros={[
    "100% positive, force-free methodology",
    "Easy-to-follow step-by-step video instructions",
    "Backed by certified behavioral specialists"
  ]}
  cons={[
    "Requires 10-15 minutes of regular daily commitment",
    "Digital access format"
  ]}
  verdict="An outstanding, high-value program that delivers tangible results without aversive corrections."
  ctaText="Visit Official Website & Claim Discount"
  showSchema={true}
/>

## Key Evaluation Criteria

1. **Safety and Humanness:** Completely free from pain-inducing or aversive mechanisms.
2. **Speed of Improvement:** Noticeable behavioral changes within 14-21 days of consistent practice.
3. **Refund Integrity:** Backed by an unconditional 60-day money-back guarantee.

<MoneyBackGuaranteeBadge days={60} variant="banner" />

<FaqAccordion
  title="Frequently Asked Questions"
  items={[
    {
      question: "Is this program suitable for all dog breeds?",
      answer: "Yes, positive reinforcement principles apply across all breeds, sizes, and ages."
    },
    {
      question: "What is the return policy?",
      answer: "All orders are protected by ClickBank's official 60-day 100% money-back guarantee."
    }
  ]}
/>
`;

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetFile, mdxTemplate, 'utf-8');

console.log(`✅ Artigo criado com sucesso em: ${targetFile}`);
