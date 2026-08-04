# Rapa Sound — landing page

Reconstrução da landing page da **Rapa Sound** (Uberlândia/MG) — sonorização, iluminação
cênica, efeitos especiais e cenografia de LED para eventos. Quase 30 anos de mercado.

Stack alvo: Next.js (App Router, `output: 'export'`) · Tailwind v4 · TypeScript.
Conversão única: WhatsApp. Mobile-first — o tráfego vem do link na bio do Instagram.

## Estado

**Fase 3 — direção de arte.** Nenhuma linha de CSS até uma direção ser aprovada.

| Fase | O quê | Status |
|---|---|---|
| 0 | Inventário do site atual | ✅ [INVENTARIO.md](INVENTARIO.md) |
| 1 | Pesquisa em subagentes paralelos | 🔄 `pesquisa/` |
| 2 | Skills do projeto | ⏳ |
| 3 | Direção de arte | ⏳ aguardando pesquisa |
| 4 | Implementação | ⏳ |
| 5 | Auditoria | ⏳ |

## Por onde começar

1. **[BRIEFING-CORRIGIDO.md](BRIEFING-CORRIGIDO.md)** — leia antes do `bri.md`. O inventário
   derrubou premissas do briefing original; onde os dois divergem, vence o corrigido.
2. **[INVENTARIO.md](INVENTARIO.md)** — o que existe hoje no site, medido e transcrito.
   Inclui os 116 artistas do rider técnico, extraídos de dentro de imagem pela primeira vez.
3. **[PENDENCIAS.md](PENDENCIAS.md)** — o que depende do cliente, com o valor assumido em uso.
4. **[REDIRECTS.md](REDIRECTS.md)** — o mapa `301` das 13 URLs antigas para âncoras, e as duas
   armadilhas técnicas que ele esconde.
5. [bri.md](bri.md) — briefing original, mantido como registro histórico.

## Os três achados que mudaram o plano

- **São 13 serviços, não 3**, e a maioria é LED e cenografia. A empresa vende ambiente visual
  tanto quanto som.
- **Metade do conteúdo está trancada dentro de imagem.** Os cards de serviço e os 116 nomes do
  rider técnico são PNGs achatados — invisíveis para busca e para leitor de tela. As 34
  imagens da home têm `alt=""`.
- **Festa de 15 anos é o público principal**, não casamento. 4 de 4 depoimentos e 3 de 5
  vídeos de evento são de debutantes.

## Convenções

- Valor que depende do cliente é marcado no código com `// PENDENTE:` e registrado em
  `PENDENCIAS.md`.
- Nenhuma cor ou tamanho hardcoded no JSX — tokens em `@theme` do Tailwind.
- Teto de 60 KB gzipped de JS de animação.
