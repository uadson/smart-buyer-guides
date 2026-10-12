#!/usr/bin/env node
/**
 * Robô Publicador da Fila Editorial (Auto-Publisher) para o ClickBank Niche Site.
 *
 * Lê a fila em data/editorial-queue.json, seleciona o próximo tópico pendente,
 * compila o artigo MDX estruturado com os componentes de conversão de afiliados ClickBank,
 * atualiza o status na fila e prepara o repositório para deploy.
 */

import fs from 'node:fs';
import path from 'node:path';

const queuePath = path.resolve(process.cwd(), 'data/editorial-queue.json');
const articlesDir = path.resolve(process.cwd(), 'src/content/articles');

if (!fs.existsSync(queuePath)) {
  console.error(`❌ Fila editorial não encontrada em: ${queuePath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(queuePath, 'utf-8');
const queue = JSON.parse(rawData);

// Encontra o próximo artigo pendente
const nextIndex = queue.findIndex((item) => item.status === 'pending');

if (nextIndex === -1) {
  console.log('🎉 Todos os artigos da fila editorial já foram publicados!');
  process.exit(0);
}

const item = queue[nextIndex];
const today = new Date().toISOString().split('T')[0];
const targetPath = path.join(articlesDir, `${item.slug}.mdx`);

if (fs.existsSync(targetPath)) {
  console.warn(`⚠️ Arquivo já existe em ${targetPath}. Marcando como publicado.`);
  item.status = 'published';
  item.publishedAt = today;
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2), 'utf-8');
  process.exit(0);
}

const topProduct = item.detailedProducts[0] || {};

// Gera o conteúdo MDX formatado
const mdxContent = `---
title: "${item.title.replace(/"/g, '\\"')}"
description: "${item.description.replace(/"/g, '\\"')}"
publishDate: ${today}
updatedDate: ${today}
author: "${item.author}"
category: "${item.category}"
heroImage: "${item.heroImage}"
heroImageAlt: "${item.heroImageAlt.replace(/"/g, '\\"')}"
featured: false
rating: 4.8
tags: [${item.tags.map((t) => `"${t}"`).join(', ')}]
topPickName: "${topProduct.name ? topProduct.name.replace(/"/g, '\\"') : ''}"
topPickVendor: "${topProduct.vendor || ''}"
guaranteeDays: 60
showGuaranteeBadge: true
includeFdaDisclaimer: ${item.category.includes('Health') ? 'true' : 'false'}
---

import ProductCard from '../../components/ProductCard.astro';
import ComparisonTable from '../../components/ComparisonTable.astro';
import FaqAccordion from '../../components/FaqAccordion.astro';
import MoneyBackGuaranteeBadge from '../../components/MoneyBackGuaranteeBadge.astro';

${item.intro}

---

## Quick Comparison: Top Picks at a Glance

<ComparisonTable
  products={${JSON.stringify(item.comparisonProducts, null, 2)}}
/>

---

## Detailed In-Depth Reviews

${item.detailedProducts.map((p) => `<ProductCard
  rank={${p.rank}}
  badge={${JSON.stringify(p.badge)}}
  name={${JSON.stringify(p.name)}}
  tagline={${JSON.stringify(p.tagline)}}
  creator={${JSON.stringify(p.creator)}}
  vendor={${JSON.stringify(p.vendor)}}
  image={${JSON.stringify(p.image)}}
  rating={${p.rating}}
  reviewCount={${p.reviewCount}}
  originalPrice={${JSON.stringify(p.originalPrice)}}
  currentPrice={${JSON.stringify(p.currentPrice)}}
  verdict={${JSON.stringify(p.verdict)}}
  specs={${JSON.stringify(p.specs, null, 4)}}
  pros={${JSON.stringify(p.pros)}}
  cons={${JSON.stringify(p.cons)}}
  ctaText={${JSON.stringify(p.ctaText || 'Visit Official Website & Claim Discount')}}
  showSchema={true}
/>`).join('\n\n')}

---

## Essential Buyer's Guide

Before ordering, evaluate these critical factors:

${item.buyersGuide.map((bg, idx) => `### ${idx + 1}. ${bg.title}\n${bg.text}`).join('\n\n')}

<MoneyBackGuaranteeBadge days={60} variant="banner" />

---

<FaqAccordion
  items={${JSON.stringify(item.faqs.map((f) => ({ question: f.question, answer: f.answer })), null, 2)}}
/>
`;

fs.mkdirSync(articlesDir, { recursive: true });
fs.writeFileSync(targetPath, mdxContent.trimStart(), 'utf-8');

// Atualiza a fila
item.status = 'published';
item.publishedAt = today;
fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2), 'utf-8');

const remainingCount = queue.filter((i) => i.status === 'pending').length;

console.log(`✅ Artigo publicado com sucesso: ${item.title}`);
console.log(`📄 Salvo em: ${targetPath}`);
console.log(`📊 Artigos restantes na fila: ${remainingCount}`);
