# Revisão adversarial de código — 2026-08-04

Alvo: commit `608ab14` (working tree limpo). Verificado em Chromium 1223 headless contra o
build de produção (`npm run build` → `out/`, servido em `:4321`), a 380×780 e 1440×900, com e
sem `prefers-reduced-motion`. Contrastes calculados em sRGB a partir da cor **computada**,
não da declarada.

> Durante a revisão os arquivos mudaram duas vezes (commits `0212e02` e `608ab14`). Tudo
> abaixo foi re-verificado contra o HEAD final. Dois achados anteriores já saíram: o `.tubo`
> branco sobre branco em `#rider` (corrigido para `--color-void`) e o `.rev`/`no-js` servido
> com `opacity: 0`.

---

## 🔴 BLOQUEANTE

### B1 — `@layer components` perde para `@layer utilities`: **toda** a correção de cor do estado técnico é inerte

**Arquivo:** `app/globals.css:534-541`

O Tailwind v4 emite `@layer theme, base, components, utilities;` (confirmado no CSS servido,
linha 6). **Ordem de camada vence especificidade, sempre.** As cinco regras do estado técnico
estão em `@layer components`; os utilitários que elas tentam corrigir estão em
`@layer utilities`. Todas perdem:

| Regra em `components` | Utilitário em `utilities` que vence | Cor computada |
|---|---|---|
| `.tecnico .text-branco-2` (535) | `.text-branco-2` | `#8E9199` |
| `.tecnico .border-rule` (536) | `.border-rule` | `#26272D` |
| `.tecnico .text-ambar` (539) | `.text-ambar` | `#FFA300` |
| `.tecnico .hover\:text-ambar:hover` (541) | `.hover\:text-ambar:hover` | `#FFA300` |

Medido no estado técnico (fundo `#ECEDEF`):

| Elemento | arquivo:linha | Cor computada | Razão | Veredito |
|---|---|---|---|---|
| `<p>` do rider | `page.tsx:283` | `#8E9199` 14px | **2,69:1** | reprova AA |
| lista dos 116 | `page.tsx:320` | `#8E9199` 14px | **2,69:1** | reprova AA |
| contagem por categoria | `page.tsx:318` | `#8E9199` 12px | **2,69:1** | reprova AA |
| `<p>` de "Quase 30 anos" | `page.tsx:344,349` | `#8E9199` 19px | **2,69:1** | reprova AA |
| resposta do FAQ | `page.tsx:385` | `#8E9199` 14px | **2,69:1** | reprova AA |
| endereço | `page.tsx:434` | `#8E9199` 14px | **2,69:1** | reprova AA |
| `+` do FAQ | `page.tsx:380` | `#FFA300` 24px | **1,71:1** | o número que o IDENTIDADE.md marca como "reprova em tudo" |
| filete das seções | `page.tsx:339,364,393` | `#26272D` | — | preto duro no lugar de `void@14%` |

Ou seja: **o parágrafo inteiro do IDENTIDADE.md sobre "no estado técnico o acento vira tinta"
está escrito no CSS e não roda.** É praticamente todo o corpo de texto do estado que fala com
produtora, casa de show e prefeitura.

**Correção.** Tirar o bloco `.tecnico` de dentro de `@layer components`. Regra **fora de
qualquer camada** vence todas as camadas — é a saída de uma linha. Alternativas: `@utility`
do Tailwind v4, ou um `@layer utilities { }` declarado depois do `@import "tailwindcss"`.

---

### B2 — As 6 categorias do rider são **brancas sobre branco**

**Arquivo:** `app/page.tsx:316`

```
<h3 className="lab flex items-baseline gap-3 text-branco lg:sticky lg:top-8 lg:self-start">
```

`text-branco` (utilities) vence `.tecnico .lab` (components) pelo mesmo motivo de B1.
Cor computada `rgb(236,237,239)` sobre fundo `rgb(236,237,239)` — **razão 1,00:1**.

Confirmado em captura: "Sertanejo", "Pop e rock", "Samba, pagode e axé", "DJs e MCs",
"Bandas de estilos variados" e "Orquestras e grupos de receptivo" **não aparecem**. Sobram os
numerais (27, 17, 14, 32, 18, 8) soltos, sem o rótulo a que pertencem. A lista de 116 nomes
— que é o argumento inteiro do estado técnico — fica sem nenhuma estrutura visível.

O `text-branco` é resto do estado festa e não deveria estar num elemento dentro de `.tecnico`.

---

### B3 — O cargo de cada pessoa da equipe é **preto sobre preto**

**Arquivo:** `components/LequeEquipe.tsx:241`

```
<span className="lab mt-1 block">{c.papel}</span>
```

O `<figcaption>` (238-239) tem `bg-gradient-to-t from-void via-void/85 to-transparent`, e
`.tecnico .lab` (globals.css:534) pinta o texto de `#09090B` a 58% — preto sobre preto.
Cor computada: `color(srgb 0.0353 0.0353 0.0431 / 0.58)` sobre `rgb(9,9,11)`.

Confirmado em captura: "Daniel Souvile" e "Daniel Ribeiro" aparecem em branco e legíveis; a
linha de cargo abaixo de cada nome está **totalmente invisível**. Aqui `.tecnico .lab`
funciona (é regra de componente contra regra de componente) — o defeito é o oposto de B1: a
correção do estado técnico foi aplicada a um elemento que está sobre fundo escuro.

Consequência direta do texto que o próprio comentário de `lib/conteudo.ts:260-267` comemora
ter recuperado: os cargos voltaram a ser texto real, e continuam ilegíveis.

---

## 🟠 GRAVE

### G1 — O haze congela para sempre depois de trocar de aba

**Arquivo:** `components/Haze.tsx:147-152`

```js
const onVis = () => {
  const antes = visivel
  visivel = !document.hidden && visivel   // ← ao voltar, `visivel` já é false
  if (!document.hidden && !antes) id = requestAnimationFrame(quadro)
```

Ao esconder a aba, `visivel` vai a `false`. Ao voltar, a expressão é `true && false` → `false`.
O `requestAnimationFrame` na linha seguinte roda, mas `quadro` termina em
`if (visivel) id = requestAnimationFrame(quadro)` (135) e **não se reagenda**: pinta um quadro
e morre.

Medido: `animava antes = true`, `anima depois de voltar = false`. A partir daí o fundo das
seções `#servicos` e `#eventos` fica estático até o `IntersectionObserver` (139-144) disparar
de novo — o que só acontece se o usuário rolar para fora e voltar.

Correção: `visivel = !document.hidden && naTela`, guardando o estado do IO numa variável
separada. De quebra, o `id` deveria ser zerado no `cancelAnimationFrame` e checado antes de
reagendar — hoje IO e `visibilitychange` podem agendar dois loops concorrentes.

---

### G2 — A invariante "no máximo UM `<iframe>` no DOM" é falsa

**Arquivos:** `components/Palco.tsx:9`, `app/page.tsx:105` e `app/page.tsx:257`

Os 4 `DEPOIMENTOS` são renderizados **duas vezes**: como `<VideoFacade>` na seção
`#quinze-anos` (105) e de novo dentro do `<Palco>` (`[...EVENTOS, ...DEPOIMENTOS]`, 257).
O `Palco` de fato só mantém um iframe, mas o `VideoFacade` (`VideoFacade.tsx:14`) nunca
desliga: uma vez `ligado`, fica.

Medido: **2 iframes** após dois cliques (um depoimento + o palco). O teto real é **5**, todos
com `autoplay=1` — cinco players de YouTube e dois áudios tocando ao mesmo tempo.

O comentário de `Palco.tsx:9-13` ("É estruturalmente impossível abrir dois players") descreve
o componente, não a página.

---

### G3 — O orçamento de motion do IDENTIDADE.md está estourado em ~28%

**Medido com `npm run build`:** `First Load JS` da rota `/` = **189 kB**.

| Chunk | Conteúdo | gzip |
|---|---|---|
| `c15bf2b0` | gsap | 19,8 KB |
| `242` | gsap | 8,2 KB |
| `282` | framer-motion (`AnimatePresence`, `useScroll`) | 49,3 KB |

≈ **77 KB gzipped de JS de animação**, contra o teto de **60 KB** do IDENTIDADE.md §Motion —
que ainda afirma "o orçamento medido da stack é ~1,1 KB". Referência: `framer-motion` publica
`size-rollup-motion.js` em 39,6 KB gz e `gsap.min.js` em 28,4 KB gz; os números do bundle
batem com as bibliotecas inteiras, não com um subconjunto.

Agravante: o **gsap entra no primeiro carregamento** por causa do `LequeEquipe`, que fica
depois de 9 telas de rolagem. E com 6 fotos de equipe, `total > MAX_VISIVEL` é falso — o
paginador nunca renderiza e `girar()` (`LequeEquipe.tsx:73-78`) é código morto. São 28 KB gz
carregados na dobra para uma animação de entrada única.

(`PENDENCIAS.md` adia *Core Web Vitals* para a fase 5, mas o teto de 60 KB é regra do sistema
de design, não medição de campo.)

---

### G4 — O `.eyebrow` não tem correção nenhuma para o estado técnico

**Arquivo:** `app/globals.css:221-243`

Existem `.tecnico .eyebrow b` (242) e `.tecnico .eyebrow i` (243). **Não existe
`.tecnico .eyebrow`.** O texto simples da linha — " · quase", " · artistas", " · o que
perguntam antes de fechar", " · resposta no WhatsApp" — herda
`color: var(--color-branco-2)` de 229.

Medido: `#8E9199` sobre `#ECEDEF` = **2,69:1** a 12px, nas quatro seções do estado técnico.

Este **não** é o bug de camada de B1: a regra simplesmente não foi escrita. Consertar B1 não
conserta este.

---

### G5 — IDs duplicados: `quinze-anos` e `casamento` aparecem 2× no DOM

**Arquivos:** `lib/conteudo.ts:114` e `:117` (campo `ancora`) contra `app/page.tsx:69` e `:120`
(`<Secao id>`); o duplicado é emitido por `LinhaServico` (`CardServico.tsx:115`) via
`page.tsx:240`.

Confirmado no HTML servido: `quinze-anos` ×2, `casamento` ×2. HTML inválido, e os 301 de
`/emocoes-15-anos/` e `/emocoes-casamento/` do `REDIRECTS.md` param na seção, não no serviço —
o navegador usa a primeira ocorrência. Os dois pacotes do bloco "Pacotes" ficam sem âncora
alcançável.

---

### G6 — O menu flutuante estoura a viewport a 380px

**Arquivo:** `components/MenuLiquido.tsx:99-110`

Aberto, a raiz `fixed left-1/2 -translate-x-1/2` mede **393px dentro de 380px**:
`left = −6,5px`, `right = 386,5px` (medido). O painel perde o canto arredondado esquerdo e o
anel de foco do primeiro link é cortado; a pílula de WhatsApp — descrita no cabeçalho do
arquivo como "a única conversão da página" e "sempre visível" — perde a borda direita e parte
do rótulo. A 360px (Galaxy S / iPhone SE) o corte vai a 16,5px de cada lado.

Como o elemento é `fixed`, não gera barra de rolagem: ele é simplesmente cortado, e sem
navegador isso não aparece em lugar nenhum.

Contas: 268 (pílula aberta) + 12 (gap) + 113 (WhatsApp) = 393. Cabe a partir de ~400px.

---

## 🟡 AJUSTE

### A1 — Estouro horizontal de 1px e leque cortado a 380px
`app/page.tsx:339` — `#sobre` é a única seção com conteúdo transformado que **não** tem
`overflow-hidden`. Medido a 380px: `scrollWidth 381 / clientWidth 380`, card mais à esquerda
em `left = −39px` (cortado pela borda da tela), o mais à direita em `right = 381px`. O corte é
assimétrico, o que lê como erro e não como sangria proposital.

### A2 — O painel do menu continua no DOM ~650ms depois do Esc
`components/MenuLiquido.tsx:161` — o `transition={{ duration: 0.3, delay: 0.35 }}` vale
também para a saída, enquanto a pílula colapsa em 150ms (112). Nesse intervalo os 8 links
estão clipados por `overflow-hidden` mas continuam na ordem de tabulação. Um `exit`
com `delay: 0` resolve. (Foco e Esc estão certos: `aria-expanded` alterna, o foco vai para o
primeiro link ao abrir e volta para o gatilho no Esc — verificado.) `aria-controls="menu-secoes"`
aponta para um id que não existe enquanto fechado.

### A3 — `Houselights · 100%` a 3,42:1
`app/globals.css:555` — `void@48%` sobre branco, 12px. Reprova AA para texto pequeno.

### A4 — CSS morto e reserva de espaço desatualizada
`app/globals.css:456-484` (`.navbar*`) e `494-514` (`.folha*`) não têm consumidor — a barra
inferior virou o `MenuLiquido`. E `body { padding-block-end: 6rem }` (490) reserva 96px para
aquela barra; a pílula atual ocupa ~72px.

---

## Verificado e **sem** defeito

Registrado para não ser re-litigado:

- **`.led` não cria contexto de empilhamento.** Computado no elemento: `position: static`,
  `transform: none`, `opacity: 1`, `filter: none`, `isolation: auto`, `will-change: auto`,
  `contain: none`, `mix-blend-mode: normal`. O `@supports` duplo faz parse, o gradiente resolve
  (`linear-gradient(95deg, ... oklab(...) ...)`) e a animação `led-varre` roda. A palavra
  aparece. Os ancestrais não importam para o bug 1500148 — só o próprio elemento.
- **A virada prende e funciona.** Medido a 380 e a 1440: `.virada` = 170svh,
  `view-timeline-name: --virada` aplicado, o `.virada__plano` fica com `top = 0` durante toda a
  passagem e a opacidade sobe em degraus exatos `0 → 0,333 → 0,667 → 1` na faixa
  `contain 0% .. contain 100%`. O aninhamento `@supports` > `@media` é válido. Com
  `prefers-reduced-motion: reduce` o plano vira `display: none`, `.virada` cai para 40svh e a
  nota fica estática — fallback estático real, como prometido.
- **Sem overflow horizontal a 1440px** (`scrollWidth == clientWidth`), e a 380px só o 1px de A1.
- **Limpeza de efeitos.** `Reveal`, `LuzCursor`, `LequeEquipe` e `Haze` desconectam
  observers, removem listeners e cancelam rAF/timeout no unmount. Nenhuma dependência de
  `useEffect` remonta em loop. Zero erros no console.
- **`alt` em todas as `<img>`.** Nenhuma sem o atributo. Os `alt=""` estão todos dentro de
  `<button>` com `aria-label` ou texto visível (fachadas de vídeo e miniaturas do palco) — é a
  prática correta, não omissão.
- **Os 13 serviços e os 116 nomes estão no HTML servido como texto real**, incluindo os da
  cauda (`SuitX`, `Grupo Arte Fantástica`, `DJ Samhara`). A afirmação se sustenta.
- **`<details>` do FAQ** é nativo, o `+` é `aria-hidden`, o `summary` tem 56px de altura.
  `aria-current` na lista de botões do `Palco` é uso válido, e o `aria-live="polite"` do título
  não rouba foco.
- **A nav de desktop** aparece só depois de 0,75 viewport, tem `pointer-events: none` enquanto
  invisível e não cobre nenhum título `lg:sticky` (as linhas `lg:top-8` medidas ficam em 105px
  e 106px, abaixo dos 65px da barra).
