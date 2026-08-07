import type { MetadataRoute } from 'next'

/**
 * O mapa do site.
 *
 * É UMA URL SÓ, e isso é o ponto. O site antigo tinha 14 páginas — uma
 * por serviço — e virou uma rolagem única. As âncoras (`#servicos`,
 * `#rider`) NÃO entram aqui: fragmento não é URL para o Google, ele
 * indexa a página e escolhe sozinho o trecho a mostrar.
 *
 * Os 301 das 13 URLs antigas ficam na camada de hospedagem, não aqui —
 * com `output: 'export'` a chave `redirects` do next.config é ignorada
 * em silêncio, porque ela exige servidor Node. Ver REDIRECTS.md.
 *
 * `lastModified` sai da data do build. Mentir aqui é pior que omitir:
 * data futura ou sempre-hoje faz o rastreador desconfiar do arquivo
 * inteiro.
 */
/* `output: 'export'` gera arquivo, nao rota — e o Next exige que a
   rota diga isso em voz alta, senao o build para. Sem esta linha:
   "export const dynamic = force-static not configured on route with
   output: export". */
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://rapasound.com.br',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
