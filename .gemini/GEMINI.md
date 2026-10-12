# Contexto do Projeto: ClickBank Affiliate Niche Site (EUA)

## Visão Geral
Este repositório contém o código-fonte de um site estático e editorial de curadoria e reviews de produtos afiliados focados no ecossistema **ClickBank** para o mercado norte-americano (EUA). O objetivo principal é atrair tráfego orgânico qualificado via SEO técnico e converter visitantes através de copywriting persuasivo focado em resolução de dores, autoridade (E-E-A-T), confiança e ofertas de alto ticket/comissão (50% a 75%+).

## Diretrizes Técnicas e de Arquitetura
1. **Stack:** Astro v5+ (geração estática pura para performance máxima, TTFB mínimo e deploy gratuito no GitHub Pages ou Cloudflare Pages).
2. **Estilização:** Tailwind CSS v4 com design limpo, focado em conversão e experiência de leitura fluida (Mobile-First).
3. **Internacionalização:** Conteúdo 100% em inglês nativo americano voltado para intenções de busca transacionais e investigativas (ex: *"Brain Training for Dogs review"*, *"Is Adrienne Farricelli dog training legit"*, *"Best natural pet anxiety supplements"*).
4. **Conformidade Regulatória & ClickBank:**
   - **FTC Disclosure:** Declaração explícita no topo e rodapé de cada artigo informando a relação de afiliação sem custo adicional para o comprador.
   - **ClickBank Legal Disclaimer:** Menção mandatória à Click Sales, Inc. como distribuidora autorizada.
   - **FDA Disclaimer:** Declaração de isenção de responsabilidade médica/suplementar quando aplicável (essencial para nichos de bem-estar/saúde animal ou humana).
   - **Garantia de 60 Dias:** Realce da garantia incondicional de reembolso de 60 dias (padrão ouro de conversão do ClickBank).
5. **Rastreamento de HopLinks:**
   - Construção padronizada de URLs canônicas (`https://hop.clickbank.net/?affiliate={NICKNAME}&vendor={VENDOR}&tid={TRACKING_ID}`).
   - Higienização e aplicação de atributos SEO `rel="nofollow noopener sponsored"`.

## Estrutura de Pastas Esperada
- `/src/content/articles/` -> Artigos profundos, reviews e guias comparativos em Markdown/MDX.
- `/src/components/` -> Componentes de alta conversão (`ProductCard`, `ComparisonTable`, `AffiliateDisclosure`, `MoneyBackGuaranteeBadge`, `StickyMobileBar`, `FaqAccordion`).
- `/src/layouts/` -> Layouts base e templates de artigos otimizados para SEO e schema markup.
- `/src/utils/` -> Utilitários de afiliados ClickBank (`affiliate.ts`) e dados estruturados Schema.org (`seo.ts`).
- `public/` -> Ativos estáticos, favicons e imagens otimizadas.
