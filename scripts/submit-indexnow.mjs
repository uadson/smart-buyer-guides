#!/usr/bin/env node
/**
 * Script de Submissão de URLs ao Protocolo IndexNow (Bing, Yandex, Seznam).
 *
 * Pode ser executado manualmente ou automaticamente pelo GitHub Actions
 * após o deploy de cada novo artigo.
 *
 * Uso:
 *   node scripts/submit-indexnow.mjs
 *   node scripts/submit-indexnow.mjs https://uadson.github.io/smart-buyer-guides/articles/novo-artigo/
 */

import fs from 'node:fs';
import path from 'node:path';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '3b2b8bc725895243551b907a5ed520e3';
const HOST = process.env.SITE_HOST || 'uadson.github.io';
const BASE_PATH = process.env.BASE_PATH || '/smart-buyer-guides';
const KEY_LOCATION = `https://${HOST}${BASE_PATH}/${INDEXNOW_KEY}.txt`;

/**
 * Coleta as URLs para submissão a partir dos argumentos ou do sitemap gerado.
 *
 * Returns:
 *   Array de URLs completas para notificar o IndexNow.
 */
function collectUrls() {
  const cliArgs = process.argv.slice(2).filter((arg) => arg.startsWith('http'));
  if (cliArgs.length > 0) {
    return cliArgs;
  }

  // Tenta extrair do sitemap gerado no build em dist/sitemap-0.xml
  const sitemapPath = path.resolve(process.cwd(), 'dist/sitemap-0.xml');
  if (fs.existsSync(sitemapPath)) {
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    if (matches.length > 0) {
      return matches;
    }
  }

  // Fallback: lê artigos do diretório src/content/articles
  const articlesDir = path.resolve(process.cwd(), 'src/content/articles');
  const urls = [`https://${HOST}${BASE_PATH}/`];

  if (fs.existsSync(articlesDir)) {
    const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
    for (const file of files) {
      const slug = file.replace(/\.mdx?$/, '');
      urls.push(`https://${HOST}${BASE_PATH}/articles/${slug}/`);
    }
  }

  return urls;
}

async function main() {
  const urls = collectUrls();

  if (urls.length === 0) {
    console.log('⚠️ Nenhuma URL encontrada para submeter ao IndexNow.');
    process.exit(0);
  }

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  console.log(`🚀 Notificando IndexNow (Bing / Yandex) sobre ${urls.length} URL(s)...`);
  console.log(`📍 Host: ${HOST}`);
  console.log(`🔑 Key Location: ${KEY_LOCATION}`);

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const bodyText = await response.text().catch(() => '');

    if (response.status === 200 || response.status === 202) {
      console.log(`✅ Sucesso! Status HTTP ${response.status}: URLs enviadas com sucesso ao Bing/IndexNow.`);
    } else {
      console.error(`⚠️ IndexNow retornou código ${response.status} ${response.statusText}: ${bodyText}`);
    }
  } catch (err) {
    console.error('❌ Erro de conexão ao enviar para IndexNow:', err.message);
  }
}

main();
