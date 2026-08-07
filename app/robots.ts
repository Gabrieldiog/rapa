import type { MetadataRoute } from 'next'

/**
 * robots.txt gerado no build.
 *
 * Não havia nenhum, e a ausência não é neutra: sem `Sitemap:` aqui o
 * Google só encontra o mapa se alguém o enviar à mão no Search Console,
 * e metade da aquisição desta empresa é busca local — "sonorização
 * Uberlândia", "som e luz para 15 anos". O robots é a única linha que
 * um rastreador lê antes de qualquer outra coisa do site.
 *
 * A página é uma rolagem só e tudo nela é público, então não há o que
 * bloquear. O `disallow` fica vazio de propósito: escrever regra que
 * não bloqueia nada é a forma mais comum de bloquear sem querer.
 */
/* `output: 'export'` gera arquivo, nao rota — e o Next exige que a
   rota diga isso em voz alta, senao o build para. Sem esta linha:
   "export const dynamic = force-static not configured on route with
   output: export". */
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://rapasound.com.br/sitemap.xml',
    host: 'https://rapasound.com.br',
  }
}
