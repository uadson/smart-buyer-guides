import { describe, expect, it, vi } from 'vitest';
import {
  buildIndexNowPayload,
  submitIndexNow,
  type IndexNowPayload,
} from '../src/utils/indexnow';

describe('indexnow utils (integração e envio para o protocolo IndexNow)', () => {
  describe('buildIndexNowPayload', () => {
    it('deve construir payload IndexNow válido com host, chave e lista de URLs', () => {
      const payload = buildIndexNowPayload({
        host: 'uadson.github.io',
        key: '3b2b8bc725895243551b907a5ed520e3',
        keyLocation: 'https://uadson.github.io/smart-buyer-guides/3b2b8bc725895243551b907a5ed520e3.txt',
        urls: [
          'https://uadson.github.io/smart-buyer-guides/articles/brain-training-for-dogs-review/',
          'https://uadson.github.io/smart-buyer-guides/articles/prodentim-oral-health-review/',
        ],
      });

      expect(payload.host).toBe('uadson.github.io');
      expect(payload.key).toBe('3b2b8bc725895243551b907a5ed520e3');
      expect(payload.keyLocation).toBe(
        'https://uadson.github.io/smart-buyer-guides/3b2b8bc725895243551b907a5ed520e3.txt'
      );
      expect(payload.urlList).toHaveLength(2);
      expect(payload.urlList[0]).toContain('brain-training-for-dogs-review');
    });

    it('deve desduplicar URLs e remover entradas vazias', () => {
      const payload = buildIndexNowPayload({
        host: 'uadson.github.io',
        key: 'testkey123',
        urls: [
          'https://uadson.github.io/smart-buyer-guides/',
          'https://uadson.github.io/smart-buyer-guides/',
          '',
          '   ',
        ],
      });

      expect(payload.urlList).toEqual(['https://uadson.github.io/smart-buyer-guides/']);
    });

    it('deve lançar erro se a lista de URLs estiver vazia', () => {
      expect(() =>
        buildIndexNowPayload({
          host: 'uadson.github.io',
          key: 'testkey123',
          urls: [],
        })
      ).toThrow('Nenhuma URL válida fornecida para submissão no IndexNow');
    });

    it('deve lançar erro se a chave ou o host forem inválidos', () => {
      expect(() =>
        buildIndexNowPayload({
          host: '',
          key: 'testkey123',
          urls: ['https://uadson.github.io/'],
        })
      ).toThrow('Host e Key são obrigatórios');
    });
  });

  describe('submitIndexNow', () => {
    it('deve submeter payload com sucesso ao receber status 200 ou 202', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => 'OK',
      });

      const payload: IndexNowPayload = {
        host: 'uadson.github.io',
        key: '3b2b8bc725895243551b907a5ed520e3',
        urlList: ['https://uadson.github.io/smart-buyer-guides/'],
      };

      const result = await submitIndexNow(payload, undefined, mockFetch as unknown as typeof fetch);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.indexnow.org/indexnow',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json; charset=utf-8',
          }),
        })
      );
    });

    it('deve retornar falha quando o endpoint retornar erro HTTP 403', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Key not valid',
      });

      const payload: IndexNowPayload = {
        host: 'uadson.github.io',
        key: 'invalidkey',
        urlList: ['https://uadson.github.io/smart-buyer-guides/'],
      };

      const result = await submitIndexNow(payload, undefined, mockFetch as unknown as typeof fetch);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(403);
      expect(result.message).toContain('Forbidden');
    });
  });
});
