import { describe, expect, it } from 'vitest';
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildProductSchema,
} from '../src/utils/seo';

describe('seo utils (utilitários de Schema.org e metadados)', () => {
  describe('buildArticleSchema', () => {
    it('deve gerar schema Article válido com autor, datas e imagem', () => {
      const input = {
        title: 'Brain Training for Dogs Review 2026: Does It Really Work?',
        description: 'Comprehensive review and test of Adrienne Farricelli dog training course.',
        url: 'https://uadson.github.io/clickbank-affiliate-niche-site/articles/brain-training-for-dogs-review',
        publishDate: '2026-03-01T10:00:00Z',
        updatedDate: '2026-03-05T12:00:00Z',
        author: 'Canine Behavior Specialists',
        image: 'https://uadson.github.io/images/hero.jpg',
      };

      const schema = buildArticleSchema(input);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Article');
      expect(schema.headline).toBe(input.title);
      expect((schema.author as { name: string }).name).toBe(input.author);
      expect(schema.datePublished).toBe('2026-03-01T10:00:00.000Z');
      expect(schema.dateModified).toBe('2026-03-05T12:00:00.000Z');
      expect(schema.image).toEqual([input.image]);
    });
  });

  describe('buildProductSchema', () => {
    it('deve gerar schema Product com AggregateRating', () => {
      const input = {
        name: 'Brain Training for Dogs',
        description: 'Revolutionary positive reinforcement dog training program.',
        image: 'https://uadson.github.io/images/btd-cover.jpg',
        rating: 4.8,
        reviewCount: 3420,
        brand: 'Adrienne Farricelli',
      };

      const schema = buildProductSchema(input);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Product');
      expect(schema.name).toBe(input.name);
      expect((schema.brand as { name: string }).name).toBe(input.brand);
      expect((schema.aggregateRating as { ratingValue: number }).ratingValue).toBe(4.8);
      expect((schema.aggregateRating as { reviewCount: number }).reviewCount).toBe(3420);
    });
  });

  describe('buildBreadcrumbSchema', () => {
    it('deve gerar lista ordenada BreadcrumbList com numeração sequencial', () => {
      const items = [
        { name: 'Home', url: 'https://uadson.github.io/' },
        { name: 'Dog Training', url: 'https://uadson.github.io/#dog-training' },
        { name: 'Brain Training Review', url: 'https://uadson.github.io/articles/btd-review' },
      ];

      const schema = buildBreadcrumbSchema(items);

      expect(schema['@type']).toBe('BreadcrumbList');
      const list = schema.itemListElement as Array<{ position: number; name: string; item: string }>;
      expect(list).toHaveLength(3);
      expect(list[0].position).toBe(1);
      expect(list[0].name).toBe('Home');
      expect(list[2].position).toBe(3);
      expect(list[2].name).toBe('Brain Training Review');
    });
  });

  describe('buildFaqSchema', () => {
    it('deve gerar schema FAQPage com perguntas e respostas estruturadas', () => {
      const faqs = [
        { question: 'Is Brain Training for Dogs legit?', answer: 'Yes, created by CPDT-KA certified trainer.' },
        { question: 'What is the refund policy?', answer: 'It comes with an unconditional 60-day money-back guarantee.' },
      ];

      const schema = buildFaqSchema(faqs);

      expect(schema['@type']).toBe('FAQPage');
      const entities = schema.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>;
      expect(entities).toHaveLength(2);
      expect(entities[0].name).toBe('Is Brain Training for Dogs legit?');
      expect(entities[0].acceptedAnswer.text).toBe('Yes, created by CPDT-KA certified trainer.');
    });
  });
});
