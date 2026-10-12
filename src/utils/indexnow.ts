/**
 * Módulo de Integração com o Protocolo IndexNow.
 *
 * Permite notificar motores de busca (Bing, Yandex, Seznam, Naver)
 * instantaneamente sobre URLs novas ou atualizadas.
 */

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation?: string;
  urlList: string[];
}

export interface BuildPayloadOptions {
  host: string;
  key: string;
  keyLocation?: string;
  urls: string[];
}

export interface SubmitResult {
  success: boolean;
  statusCode: number;
  message: string;
}

/**
 * Constrói e valida o payload da requisição IndexNow.
 *
 * Args:
 *   options: Configurações de host, chave e lista de URLs a submeter.
 *
 * Returns:
 *   IndexNowPayload formatado e validado.
 *
 * Raises:
 *   Error: Caso host, chave ou lista de URLs sejam inválidos ou vazios.
 */
export function buildIndexNowPayload(options: BuildPayloadOptions): IndexNowPayload {
  const { host, key, keyLocation, urls } = options;

  if (!host || !host.trim() || !key || !key.trim()) {
    throw new Error('Host e Key são obrigatórios para a requisição IndexNow');
  }

  const cleanedUrls = Array.from(
    new Set(
      urls
        .map((u) => u.trim())
        .filter((u) => u.length > 0 && (u.startsWith('http://') || u.startsWith('https://')))
    )
  );

  if (cleanedUrls.length === 0) {
    throw new Error('Nenhuma URL válida fornecida para submissão no IndexNow');
  }

  const payload: IndexNowPayload = {
    host: host.trim(),
    key: key.trim(),
    urlList: cleanedUrls,
  };

  if (keyLocation && keyLocation.trim()) {
    payload.keyLocation = keyLocation.trim();
  }

  return payload;
}

/**
 * Envia o payload IndexNow para o endpoint especificado.
 *
 * Args:
 *   payload: Objeto com host, chave e lista de URLs.
 *   endpoint: URL do endpoint IndexNow (padrão: https://api.indexnow.org/indexnow).
 *   fetchFn: Função de fetch (injetável para testes).
 *
 * Returns:
 *   Promise com resultado contendo success, statusCode e message descritiva.
 */
export async function submitIndexNow(
  payload: IndexNowPayload,
  endpoint = 'https://api.indexnow.org/indexnow',
  fetchFn: typeof fetch = fetch
): Promise<SubmitResult> {
  try {
    const response = await fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const bodyText = await response.text().catch(() => '');
    const isSuccess = response.status === 200 || response.status === 202;

    return {
      success: isSuccess,
      statusCode: response.status,
      message: isSuccess
        ? `IndexNow: ${payload.urlList.length} URLs submetidas com sucesso (HTTP ${response.status}).`
        : `Erro IndexNow (HTTP ${response.status} ${response.statusText}): ${bodyText || 'Falha na submissão'}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      statusCode: 0,
      message: `Erro de conexão ao submeter ao IndexNow: ${errorMessage}`,
    };
  }
}
