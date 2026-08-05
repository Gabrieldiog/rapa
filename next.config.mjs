/** @type {import('next').NextConfig} */
const nextConfig = {
  // HTML estatico de verdade. Metade da aquisicao deles e busca local
  // ("sonorizacao Uberlandia") e SPA entrega HTML vazio para o Google.
  output: 'export',

  // ATENCAO: com output 'export' a chave `redirects` abaixo NAO roda —
  // ela exige servidor Node e e ignorada em silencio. Os 301 das 13 URLs
  // antigas ficam na camada de hospedagem. Ver REDIRECTS.md.

  images: { unoptimized: true },
  trailingSlash: true,

  // ha um yarn.lock solto no home do usuario; sem isto o Next elege
  // /Users/<user> como raiz do workspace e avisa a cada boot.
  outputFileTracingRoot: import.meta.dirname,
}

export default nextConfig
