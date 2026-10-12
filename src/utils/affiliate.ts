/**
 * Utilitários para tratamento de HopLinks e conformidade de afiliados ClickBank.
 *
 * Fornece métodos para extração de vendor, higienização e construção de HopLinks
 * canônicos com tags rastreáveis (TID) e atributos de conformidade FTC e ClickBank.
 */

export const DEFAULT_CLICKBANK_AFFILIATE =
  (typeof process !== 'undefined' && process.env?.PUBLIC_CLICKBANK_AFFILIATE_ID) ||
  'cbafiliado';

const VENDOR_REGEX = /(?:vendor=([a-z0-9_-]+))|(?:^https?:\/\/([a-z0-9_-]+)\.([a-z0-9_-]+)\.hop\.clickbank\.net)/i;

export interface ClickbankUrlOptions {
  affiliate?: string;
  tid?: string;
  page?: string;
}

/**
 * Extrai o identificador do vendor (vendedor/produto) do ClickBank.
 *
 * Args:
 *   input: String contendo o código de vendor direto ou uma URL HopLink completa.
 *
 * Returns:
 *   O identificador do vendor em letras minúsculas ou null caso não encontrado.
 */
export function extractVendor(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();

  // Verifica se a string já é diretamente um código de vendor alfanumérico (ex: bt4dogs, tedwood)
  if (/^[a-z0-9_-]{3,20}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  // Tenta extrair de URL com parâmetro ?vendor=
  try {
    const url = new URL(trimmed);
    const vendorParam = url.searchParams.get('vendor');
    if (vendorParam) {
      return vendorParam.toLowerCase();
    }
  } catch {
    // Não é URL padrão válida, segue para regex
  }

  const match = trimmed.match(VENDOR_REGEX);
  if (match) {
    if (match[1]) {
      return match[1].toLowerCase();
    }
    // Formato subdomínio: affiliate.vendor.hop.clickbank.net -> vendor é o match[3]
    if (match[3]) {
      return match[3].toLowerCase();
    }
  }

  return null;
}

/**
 * Constrói uma URL canônica HopLink do ClickBank com rastreamento.
 *
 * Args:
 *   vendorOrUrl: Código de vendor ou URL HopLink pré-existente.
 *   options: Opções com nickname de afiliado, parâmetro de rastreamento (TID) e página de destino.
 *
 * Returns:
 *   URL canônica HopLink do ClickBank ou a URL original se o vendor não for reconhecido.
 */
export function buildClickbankUrl(
  vendorOrUrl: string,
  options: ClickbankUrlOptions = {}
): string {
  const vendor = extractVendor(vendorOrUrl);

  if (!vendor) {
    return vendorOrUrl;
  }

  const affiliate = options.affiliate || DEFAULT_CLICKBANK_AFFILIATE;
  const params = new URLSearchParams();

  params.set('affiliate', affiliate);
  params.set('vendor', vendor);

  if (options.tid) {
    params.set('tid', options.tid);
  }

  if (options.page) {
    params.set('page', options.page);
  }

  return `https://hop.clickbank.net/?${params.toString()}`;
}

/**
 * Retorna os atributos 'rel' recomendados para links de afiliados.
 *
 * Cumpre as diretrizes do Google Search Central para links patrocinados
 * (sponsored, nofollow) e protege contra vulnerabilidades de aba (noopener).
 *
 * Returns:
 *   String com os atributos rel para tags <a>.
 */
export function getAffiliateRel(): string {
  return 'nofollow noopener sponsored';
}

/**
 * Retorna a declaração padrão de divulgação da FTC (Federal Trade Commission).
 *
 * Exigido para conformidade regulatória nos Estados Unidos ao promover ofertas.
 *
 * Returns:
 *   Texto em inglês para o público norte-americano.
 */
export function getFtcDisclosure(): string {
  return 'We are reader-supported. When you purchase through links on our site, we may earn an affiliate commission at no additional cost to you. Product pricing, discounts, and availability are subject to change on the official merchant website.';
}

/**
 * Retorna o aviso legal obrigatório da ClickBank (Click Sales, Inc.).
 *
 * Obrigatório pelos termos de afiliados e conformidade da ClickBank para divulgações online.
 *
 * Returns:
 *   Texto legal formal em inglês sobre a Click Sales, Inc.
 */
export function getClickbankDisclaimer(): string {
  return 'ClickBank is the retailer of products on this site. CLICKBANK® is a registered trademark of Click Sales, Inc., a Delaware corporation located at 1444 S. Entertainment Ave., Suite 410 Boise, ID 83709, USA and used by permission. ClickBank\'s role as retailer does not constitute an endorsement, approval or review of these products or any claim, statement or opinion used in promotion of these products.';
}

/**
 * Retorna o aviso padrão de isenção de responsabilidade médica e da FDA.
 *
 * Recomendado para nichos de bem-estar animal, nutrição, suplementação e saúde.
 *
 * Returns:
 *   Texto de isenção de responsabilidade médica em inglês.
 */
export function getFdaDisclaimer(): string {
  return 'The information provided on this website is for educational and informational purposes only. Statements on this website have not been evaluated by the Food and Drug Administration. Products are not intended to diagnose, treat, cure, or prevent any disease.';
}

/**
 * Retorna o texto explicativo da garantia incondicional de reembolso.
 *
 * ClickBank oferece por padrão 60 dias incondicionais em praticamente todo o catálogo.
 *
 * Args:
 *   days: Quantidade de dias da garantia (padrão: 60).
 *
 * Returns:
 *   Texto persuasivo informando a garantia incondicional de devolução.
 */
export function getGuaranteeText(days: number = 60): string {
  return `Backed by a 100% money-back guarantee for ${days} full days from your original purchase. If you are not satisfied, you can request a full refund directly through ClickBank with zero hassle.`;
}
