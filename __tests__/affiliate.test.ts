import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CLICKBANK_AFFILIATE,
  buildClickbankUrl,
  extractVendor,
  getAffiliateRel,
  getClickbankDisclaimer,
  getFdaDisclaimer,
  getFtcDisclosure,
  getGuaranteeText,
} from '../src/utils/affiliate';

describe('affiliate utils (utilitários de afiliado ClickBank)', () => {
  describe('extractVendor', () => {
    it('deve extrair o código de vendor diretamente de uma string de vendor', () => {
      const vendor = 'brainydogs';
      expect(extractVendor(vendor)).toBe('brainydogs');
    });

    it('deve extrair o vendor de uma URL canônica hop.clickbank.net', () => {
      const url = 'https://hop.clickbank.net/?affiliate=myaccount&vendor=brainydogs&tid=seo_review';
      expect(extractVendor(url)).toBe('brainydogs');
    });

    it('deve extrair o vendor de uma URL clássica do formato subdomínio', () => {
      const url = 'https://myaccount.brainydogs.hop.clickbank.net';
      expect(extractVendor(url)).toBe('brainydogs');
    });

    it('deve retornar null para strings vazias ou URLs inválidas sem vendor', () => {
      expect(extractVendor('')).toBeNull();
      expect(extractVendor('https://google.com')).toBeNull();
    });
  });

  describe('buildClickbankUrl', () => {
    it('deve gerar a URL canônica do ClickBank a partir de um código de vendor', () => {
      const vendor = 'brainydogs';
      const result = buildClickbankUrl(vendor);
      expect(result).toBe(`https://hop.clickbank.net/?affiliate=${DEFAULT_CLICKBANK_AFFILIATE}&vendor=brainydogs`);
    });

    it('deve permitir especificar um nickname de afiliado customizado', () => {
      const vendor = 'tedsplans';
      const result = buildClickbankUrl(vendor, { affiliate: 'customnick' });
      expect(result).toBe('https://hop.clickbank.net/?affiliate=customnick&vendor=tedsplans');
    });

    it('deve incluir o tracking id (tid) quando fornecido', () => {
      const vendor = 'brainydogs';
      const result = buildClickbankUrl(vendor, { tid: 'hero_cta' });
      expect(result).toBe(`https://hop.clickbank.net/?affiliate=${DEFAULT_CLICKBANK_AFFILIATE}&vendor=brainydogs&tid=hero_cta`);
    });

    it('deve incluir a página customizada (page) quando fornecida', () => {
      const vendor = 'brainydogs';
      const result = buildClickbankUrl(vendor, { page: 'discount' });
      expect(result).toBe(`https://hop.clickbank.net/?affiliate=${DEFAULT_CLICKBANK_AFFILIATE}&vendor=brainydogs&page=discount`);
    });

    it('deve higienizar uma URL HopLink existente e reinjetar parâmetros canônicos', () => {
      const url = 'https://hop.clickbank.net/?affiliate=oldnick&vendor=brainydogs&bad=123';
      const result = buildClickbankUrl(url, { affiliate: 'newnick', tid: 'vsl' });
      expect(result).toBe('https://hop.clickbank.net/?affiliate=newnick&vendor=brainydogs&tid=vsl');
    });

    it('deve retornar a URL original caso não seja possível identificar o vendor', () => {
      const fallbackUrl = 'https://example.com/external-resource';
      expect(buildClickbankUrl(fallbackUrl)).toBe(fallbackUrl);
    });
  });

  describe('getAffiliateRel', () => {
    it('deve retornar nofollow noopener sponsored para compliance com o Google e FTC', () => {
      expect(getAffiliateRel()).toBe('nofollow noopener sponsored');
    });
  });

  describe('disclaimers de compliance legal', () => {
    it('deve retornar a divulgação de afiliado da FTC', () => {
      const ftc = getFtcDisclosure();
      expect(ftc).toContain('affiliate commission');
      expect(ftc).toContain('no additional cost');
    });

    it('deve retornar o aviso legal oficial da ClickBank (Click Sales, Inc.)', () => {
      const cb = getClickbankDisclaimer();
      expect(cb).toContain('Click Sales, Inc.');
      expect(cb).toContain('CLICKBANK');
      expect(cb).toContain('1444 S. Entertainment Ave');
    });

    it('deve retornar o aviso de isenção médica/FDA', () => {
      const fda = getFdaDisclaimer();
      expect(fda).toContain('Food and Drug Administration');
      expect(fda).toContain('diagnose, treat, cure, or prevent');
    });

    it('deve retornar o texto de garantia incondicional com prazo configurável', () => {
      const guarantee60 = getGuaranteeText(60);
      expect(guarantee60).toContain('60 full days');
      expect(guarantee60).toContain('100% money-back guarantee');

      const guarantee30 = getGuaranteeText(30);
      expect(guarantee30).toContain('30 full days');
    });
  });
});
