# 04 — CARDS, BORDA E LUZ NO CURSOR

Pesquisa de padrões reais (2025–2026) de card e de interação hover/toque para a landing
da Rapa Sound. Tudo abaixo foi aberto e lido, não citado de memória — o código-fonte das
bibliotecas veio do registry/repositório, não da página de documentação (a doc só mostra
uso, não implementação).

Data da pesquisa: 2026-08-04.

---

## 0. DIAGNÓSTICO DO QUE JÁ EXISTE NO REPO

Antes de recomendar, o que `app/globals.css` já resolveu (bom, não mexer):

| Já feito | Onde |
|---|---|
| Escala de raio (2 / 6 / 14 / 22px), não igual em tudo | `globals.css:46-49` |
| `@property --tubo-cor` registrado — permite transicionar cor | `globals.css:58-62` |
| Fio de luz de 1px na aresta de cima via `mask-composite: exclude` | `globals.css:155-169` |
| Gradiente de superfície (painel pega luz de cima) | `globals.css:139-143` |
| `prefers-reduced-motion` com fallback estático real | `globals.css:237-246` |
| Vocabulário de "linha de índice" já existe na página (roteiro do casamento) | `app/page.tsx:137-158` |

O que **não** está resolvido e é o objeto desta pesquisa:

1. **(a)** A borda é `1px solid var(--color-rule)` — um tom só, chapada. O fio de cima é
   bom mas está sozinho: falta o lado escuro. Uma borda de um tom só é o sinal nº1 de
   "card de framework".
2. **(b)** `.card::after` é uma lavagem de luz **fixa**, nascendo sempre de 0% 50%. Não
   responde ao cursor. Para uma empresa de iluminação, luz que não segue nada é uma
   oportunidade perdida.
3. **(c)** `app/page.tsx:193` — `grid gap-2 sm:grid-cols-2 lg:grid-cols-3` com 13 itens.
   Isso é 4 linhas + 1 órfão. É literalmente a grade de framework que o briefing proíbe,
   só que com 13 em vez de 4.

Também: `.card::after` usa `z-index:-1` dentro de `isolation:isolate`. Está correto
(negativos pintam **acima** do background do próprio elemento e abaixo do conteúdo), mas
ocupa o único pseudo-elemento livre. As recomendações abaixo liberam `::before` e
`::after` movendo a borda para o próprio `background` do card.

---

## 1. SUPORTE DE PLATAFORMA — VERIFICADO, NÃO ASSUMIDO

O tráfego é quase todo Safari iOS (link na bio do Instagram). Cada técnica foi checada
contra isso.

| Recurso | Chrome | Safari | **Safari iOS** | Firefox | Global | Fonte |
|---|---|---|---|---|---|---|
| `@property` | 85 | 16.4 | **16.4** | 128 | **92,91%** | [caniuse](https://caniuse.com/mdn-css_at-rules_property) |
| `mask` / `mask-composite` | 120 | 15.4 | **15.4** | 53 | **96,71%** | [caniuse](https://caniuse.com/css-masks) |
| `rect()` em `offset-path` | ✔ | ✔ | ✔ | ✔ | Baseline jan/2024 | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/rect) |
| `corner-shape: squircle` | 139+ | ✗ | **✗** | ✗ | Chrome/Edge só | [Smashing, mar/2026](https://www.smashingmagazine.com/2026/03/beyond-border-radius-css-corner-shape-property-ui/) · [squircle.js](https://squircle.js.org/blog/squircles-in-css) |
| `color-mix()` | ✔ | 16.2 | **16.2** | ✔ | Baseline | (já em uso no repo) |

**Conclusões duras:**

- **`@property` está liberado, inclusive Safari iOS 16.4+.** O repo já usa. Além disso o
  próprio Tailwind v4 registra `@property --tw-gradient-from { syntax:"<color>" }`
  internamente — ou seja, a página já carrega regras `@property` de qualquer jeito
  ([Tailwind v4 blog](https://tailwindcss.com/blog/tailwindcss-v4)). Custo marginal: ~0.
- **`mask-composite` sem prefixo serve 96,71%.** Manter o par `-webkit-mask` + `mask` que
  o repo já escreve cobre iOS antigo. Está certo do jeito que está.
- **`corner-shape: squircle` NÃO serve para este projeto.** Chrome/Edge 139+ apenas, sem
  previsão pública de Safari ou Firefox. Como o tráfego é iOS, o squircle simplesmente
  não aconteceria para a maioria — e um raio diferente em desktop e mobile é pior que
  raio nenhum. **Descartado.** (Fica registrado como enhancement futuro atrás de
  `@supports (corner-shape: squircle)`, só quando Safari embarcar.)

---

## 2. CATÁLOGO — 21st.dev

O usuário citou explicitamente. O site é client-rendered e a listagem não sai por fetch;
o catálogo abaixo veio de `https://21st.dev/sitemap.xml` (8.955 URLs) filtrado, mais
leitura das páginas individuais.

Listagens: [`/s/card`](https://21st.dev/s/card) — 1.780 componentes de card ·
[`/s/border`](https://21st.dev/community/components/s/border) — 111+ de borda.

### 2.1 O que vale, e o quê exatamente faz

| Componente | URL | O que faz | JS? | Serve? |
|---|---|---|---|---|
| **Spotlight Card** (easemize) | [link](https://21st.dev/community/components/easemize/spotlight-card/default) | Glow radial segue o ponteiro; hue configurável. Atualiza **custom properties CSS** a partir da posição do mouse — não re-renderiza React a cada frame. | sim | **A técnica sim, o visual não.** O mecanismo (var CSS + pointermove) é a base do padrão P2. O glow colorido genérico, não. |
| **Cursor Spotlight** (pulkitxm) | [link](https://21st.dev/@pulkitxm/components/cursor-spotlight) | Container escurecido, holofote radial claro segue o cursor e **revela** o conteúdo por baixo. | sim | **Sim, conceitualmente.** "Revelar" em vez de "acrescentar brilho" é exatamente a leitura certa para uma empresa de luz. |
| **Magic Card** (dillionverma) | [link](https://21st.dev/community/components/dillionverma/magic-card) | Spotlight + **borda que acende no ponto do cursor**. | sim (motion) | Técnica de borda sim (ver 3.1). Dependência não. |
| **Border Beam** (Jakubantalik / gooseui / badtz) | [link](https://21st.dev/@Jakubantalik/components/border-beam) | Feixe que percorre a aresta do card. | sim (motion) | **Não.** É o efeito mais copiado de 2024–2025; hoje lê como template. |
| **Shine Border 02/03/04** (shadcnspace) | [link](https://21st.dev/@shadcnspace/components/shine-border-02) | Contorno de gradiente animado. | não (CSS) | Técnica de ring aproveitável, animação não. |
| **Animated Glow Card** (easemize) | [link](https://21st.dev/community/components/easemize/animated-glow-card/default) | Borda com glow animado via **filtro SVG `feColorMatrix`** — não é conic-gradient. | SVG + CSS | **Não.** `feColorMatrix` + blur é filtro de pintura por frame; caro em GPU mobile e é neon genérico. |
| **Holo Card** (rmahammad) | [link](https://21st.dev/@rmahammad/components/holo-card) | Tilt 3D por ponteiro (até 16°), foil arco-íris com `mix-blend-mode: soft-light`, sombra de contato que gira junto. | sim | **Não** — tilt 3D em card de serviço é ruído, e arco-íris quebra a paleta. Mas o **`mix-blend-mode: soft-light` numa camada de luz** é uma ideia aproveitável: luz que multiplica a superfície em vez de cobrir. |
| **Image Hover Reveal** (saurabh-2607) | [link](https://21st.dev/@saurabh-2607/components/great-ui-image-hover-reveal) | Linha de índice que revela imagem no hover. | sim | **Sim, para (c).** É o padrão "índice arquivístico" — ver seção 6. |
| **Lens Card** (rmahammad) | [link](https://21st.dev/@rmahammad/components/lens-card) | Lupa que amplia região sob o cursor. | sim | Não para serviço; talvez para a galeria de fotos. |
| **Pulsing Border** (paper-design) | [link](https://21st.dev/@paper-design/components/pulsing-border) | Borda pulsante via shader. | WebGL | **Não.** Estoura o teto de 60 KB sozinho. |
| **Grid Beam** (cult-ui) | [link](https://21st.dev/@cult-ui/components/grid-beam) | Feixes correndo numa malha de fundo. | sim | Não para card. |

**Leitura geral do 21st.dev:** dos ~1.780 cards, a esmagadora maioria depende de `motion`
(Framer Motion), e nenhum dos animados de topo é CSS puro. A própria página de borda
admite: *"They're Tailwind-based and use Motion for the moving-edge animation."*
Framer Motion sozinho é **~34 KB gzip** — mais da metade do teto de 60 KB para um efeito
que dá para fazer com 0,5 KB. **Nada do 21st.dev deve ser instalado; o valor está em ler
o mecanismo e reescrever em CSS.**

---

## 3. CATÁLOGO — ACETERNITY / MAGIC UI / CULT UI / SHADCN

Aqui o código-fonte real, puxado do registry, não da doc.

### 3.1 Magic UI — `MagicCard` — a borda que acende no cursor
`github.com/magicuidesign/magicui` → `apps/www/registry/magicui/magic-card.tsx`

O truque que interessa está no `style`:

```js
background: `
  linear-gradient(var(--color-background) 0 0) padding-box,
  radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
    ${gradientFrom}, ${gradientTo}, var(--color-border) 100%
  ) border-box
`
```

**Isto é a descoberta mais útil da pesquisa toda.** Duas camadas de background no mesmo
elemento com `background-clip` diferente: a primeira recortada no **padding-box** (é a
superfície), a segunda no **border-box** (aparece só na faixa de 1px da borda, porque a
primeira cobre o resto). Com `border: 1px solid transparent`, o gradiente vira a borda.

Zero pseudo-elemento, zero `mask-composite`, zero DOM extra. Funciona com raio.
Suporte universal.

O resto do componente (motion, useSpring, next-themes, modo "orb" com `filter: blur(60px)`
e `mix-blend-mode`) é peso morto para nós.

### 3.2 Magic UI — `ShineBorder` — o anel por máscara
`apps/www/registry/magicui/shine-border.tsx`

```js
backgroundImage: `radial-gradient(transparent,transparent, ${shineColor},transparent,transparent)`,
backgroundSize: "300% 300%",
mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
WebkitMaskComposite: "xor",
maskComposite: "exclude",
padding: "var(--border-width)",
```

O anel clássico: duas máscaras opacas, uma no content-box e outra no border-box,
combinadas com `exclude` → sobra só a moldura. **É exatamente a técnica que
`globals.css:164-167` já usa** para o fio de cima. Está certo.

Detalhe honesto: a animação anima `background-position` (declarado em
`will-change:[background-position]`) — **repinta**, não é compositor. E a classe é
`motion-safe:animate-shine`, ou seja, eles próprios desligam em reduced-motion.

### 3.3 Magic UI — `BorderBeam` — motion path
`apps/www/registry/magicui/border-beam.tsx`

```js
offsetPath: `rect(0 auto auto 0 round ${size}px)`
// animate: offsetDistance: ["0%", "100%"]
```

Tecnicamente elegante — `rect()` em `offset-path` desenha o retângulo arredondado e o
feixe corre por ele. Mas: (1) precisa de `motion`, (2) `offset-distance` não é
`transform`/`opacity`, (3) o efeito virou clichê. **Registrado, descartado.**

### 3.4 Aceternity — `CardSpotlight` — o spotlight como MÁSCARA
`ui.aceternity.com/registry/card-spotlight.json`

```js
maskImage: `radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, white, transparent 80%)`
```

A virada conceitual: o cursor **não adiciona brilho, ele mascara uma camada que já
existe**. No Aceternity a camada por baixo é um `CanvasRevealEffect` — matriz de pontos
em WebGL, com `three` + `@react-three/fiber`. **Isso é ~600 KB. Absolutamente fora.**

Mas a ideia — *o cursor revela uma matriz de pontos* — é a tradução literal de
"LED é pixel, não lâmpada". Fazemos a matriz com `background-image: radial-gradient` +
`background-size: 7px 7px` por **0 KB de JS**. Ver P2.

### 3.5 Aceternity — `HoverBorderGradient`
`ui.aceternity.com/registry/hover-border-gradient.json` — a borda é um `<div>` com
`filter: blur(2px)` cujo `background` alterna entre quatro radial-gradients (TOP/LEFT/
BOTTOM/RIGHT) num `setInterval`. Anima a propriedade `background` inteira. Caro e
impreciso. **Descartado.**

### 3.6 Aceternity — `EvervaultCard`
Gera 1.500 caracteres aleatórios **a cada `mousemove`** e re-renderiza. Serve como
exemplo do que não fazer.

### 3.7 Cult UI — `TextureCard` — a borda cara, feita à mão
`github.com/nolly-studio/cult-ui` → `apps/www/registry/default/ui/texture-card.tsx`

```jsx
<div className="rounded-lg border border-white/60 dark:border-border/30 rounded-[calc(var(--radius))]">
  <div className="border dark:border-neutral-900/80 border-black/10 rounded-[calc(var(--radius)-1px)]">
    <div className="border dark:border-neutral-950 border-white/50 rounded-[calc(var(--radius)-2px)]">
      <div className="border dark:border-neutral-900/70 border-neutral-950/20 rounded-[calc(var(--radius)-3px)]">
        <div className="border border-white/50 dark:border-neutral-700/50 rounded-[calc(var(--radius)-4px)]">
```

Cinco `div` aninhados, cada um com 1px, **alternando claro/escuro**, e o raio caindo
exatamente 1px por nível. É a resposta direta à pergunta "o que faz uma borda parecer
cara": **não é uma borda, é um bisel** — luz na aresta de cima, sombra na de baixo, como
alumínio anodizado usinado.

O custo é 5 níveis de DOM por card × 13 cards = 65 elementos a mais. Reproduzimos o
mesmo efeito ótico com **1 gradiente + 2 box-shadow inset**, sem DOM extra. Ver P1.

**A regra de raio aninhado (`--radius - 1px` por nível) é a lição real aqui** e vale
independente da técnica: raio interno = raio externo − espessura da camada. Sem isso o
canto aninhado fica com "sobra" e parece amador.

### 3.8 shadcn/ui — `Card`
[ui.shadcn.com/docs/components/card](https://ui.shadcn.com/docs/components/card)

Mudança relevante em 2026: o card saiu de `border` para **`rounded-xl ring-1
ring-foreground/10`** — um fio no anel em vez de borda de layout, e sem shadow por
padrão. Também introduziu `--card-spacing` como token. Confirma a direção: **fio
sutil derivado da cor do texto, não linha cinza fixa; raio grande; sem sombra.**

### 3.9 HeroUI
`heroui.com/docs/components/card` retornou 404 na data da pesquisa (a doc foi
reorganizada). Não avaliado. Não é perda: HeroUI é card de aplicação (isPressable /
isHoverable com sombra elevada), vocabulário de dashboard, não de produtora.

---

## 4. CATÁLOGO — SITES REAIS (Awwwards / Godly / Land-book)

- **[Awwwards — Film & TV](https://www.awwwards.com/websites/film-tv/)** (aberto): SOMA
  Maison de production (soma.ca), Partizan (partizan.com, SOTD), RISK (risk.film,
  Developer Award + SOTD), Glitch&Grit (glitchandgrit.com, SOTD), Vigilante
  (vigilante.group), Forms (forms.world), Team Best Productions (teambest.co.za),
  Milledollars (milledollars.fr), House Of Yellow (houseofyellow.nl).
- **[SOMA — ficha Awwwards](https://www.awwwards.com/sites/soma-maison-de-production)**:
  "a site with no main character" — o elenco de diretores carrega em **ordem aleatória a
  cada visita**, e a grade usa **hover-reveal de foto**. O texto do júri é explícito:
  *"discovery and delight through variable content ordering and hidden interactive
  elements rather than conventional card-based hierarchies."*
- **Godly** (`godly.website/websites/agency`) redireciona para `recent.design`;
  **Land-book** devolve 403 a fetch automatizado. Não consegui listagem primária desses
  dois — registrado como limitação, não como resultado.

### O que os sites de produtora de 2025–2026 fazem com listas de serviço

Convergência entre a ficha do SOMA e os levantamentos de tendência
([Figma](https://www.figma.com/resource-library/web-design-trends/) ·
[Elementor](https://elementor.com/blog/web-design-trends-2026/) ·
[DesignModo](https://designmodo.com/web-design-trends/)):

> **Estética de índice arquivístico** — inspirada em catálogo de museu, arquivo de
> biblioteca e manual técnico. Grade limpa, rotulagem clara, estrutura tipográfica forte.
> A organização da informação *é* a declaração de design. E: *"moving away from
> card-based grids toward cleaner, more structured index-style layouts with purposeful
> hover interactions that reveal content rather than decorative transitions."*

Para uma empresa que entrega **rider técnico e patch list**, essa estética não é
tendência emprestada — é o documento nativo do ofício. Ver P5.

---

## 5. OS PADRÕES RECOMENDADOS

Todos os códigos abaixo usam os tokens do projeto e nenhuma cor fora da paleta.
Nenhum usa gradiente roxo→azul, `shadow-*` do Tailwind, glow de neon, numeração 01/02/03,
nem raio idêntico em tudo.

---

### P1 — ARO DE DOIS TONS (o "bisel de equipamento")

> **(a)** Resolve "borda de 1px chapada".
> Origem: Magic UI `MagicCard` (padding-box/border-box) + Cult UI `TextureCard` (bisel
> claro/escuro). Reduzido a zero DOM e zero JS.

A borda deixa de ser uma linha e vira uma **aresta iluminada**: clareia no topo (pega a
luz do ambiente), volta ao filete nos flancos, escurece na base (cai na sombra). Mais um
fio interno de 1px e uma sombra interna de 1px — o bisel do Cult UI, sem os 5 `div`.

```css
@layer components {
  .card {
    position: relative;
    border: 1px solid transparent;          /* reserva a faixa do aro */
    border-radius: var(--radius-card);
    padding: 1.75rem 1.5rem 1.5rem 2.25rem;
    overflow: hidden;
    isolation: isolate;

    /* DUAS camadas: superfície no padding-box, ARO no border-box.
       A de cima cobre o miolo, então a de baixo só aparece no 1px. */
    background:
      linear-gradient(180deg,
        color-mix(in srgb, var(--color-branco) 4%, var(--color-off)) 0%,
        var(--color-off) 38%) padding-box,

      /* o aro: claro em cima, filete no meio, sombra embaixo */
      linear-gradient(175deg,
        color-mix(in srgb, var(--color-branco) 30%, var(--color-rule)) 0%,
        var(--color-rule) 26%,
        var(--color-rule) 62%,
        color-mix(in srgb, var(--color-void) 62%, var(--color-rule)) 100%
      ) border-box;

    /* bisel interno — 1px de luz no topo, 1px de sombra na base.
       Não é a escala shadow-* do Tailwind: é filete, não elevação. */
    box-shadow:
      inset 0  1px 0 0 color-mix(in srgb, var(--color-branco)  7%, transparent),
      inset 0 -1px 0 0 color-mix(in srgb, var(--color-void)   55%, transparent);

    transition: transform 320ms var(--ease-tubo),
                box-shadow 260ms var(--ease-out-cut);
  }

  /* no hover/foco o aro incorpora a cor do tubo — sem trocar a estrutura */
  .card:hover, .card:focus-within {
    background:
      linear-gradient(180deg,
        color-mix(in srgb, var(--color-branco) 5%, var(--color-off)) 0%,
        var(--color-off) 38%) padding-box,
      linear-gradient(175deg,
        color-mix(in srgb, var(--tubo-cor) 46%, var(--color-rule)) 0%,
        color-mix(in srgb, var(--tubo-cor) 22%, var(--color-rule)) 30%,
        var(--color-rule) 70%,
        color-mix(in srgb, var(--color-void) 62%, var(--color-rule)) 100%
      ) border-box;
    transform: translateY(-3px);
  }
}
```

**Por que parece caro:** a aresta de cima e a de baixo têm cores diferentes. É a única
coisa que o olho usa para ler "objeto físico com espessura" em vez de "retângulo com
contorno". Um card com 1px de um tom só é sempre um `<div>`; com dois tons é um painel.

**Regra de raio aninhado** (do Cult UI, obrigatória se houver algo dentro do card com
canto próprio — foto, chip, mini-painel):

```css
/* raio interno = raio externo − distância até a borda. Nunca "mesmo raio". */
.card > .midia   { border-radius: calc(var(--radius-card)  - 1.5rem); } /* padding 1.5rem */
.card .chip      { border-radius: var(--radius-cut); }
```

- **Custo:** 0 KB JS. ~700 bytes de CSS (comprime para ~250 gzip).
- **Touch:** o aro de dois tons é **o estado padrão** — não depende de hover. Este é o
  ponto: 100% do tráfego mobile vê o acabamento inteiro sem tocar em nada.
- **reduced-motion:** o `transform: translateY(-3px)` já é neutralizado pelo bloco em
  `globals.css:245`. O aro é estático, então nada muda — e nada some.
- **Nota:** `.card::before` e `.card::after` ficam **livres** (o fio de cima em
  `globals.css:155-169` pode ser removido — o aro faz o mesmo e ainda faz a base).

---

### P2 — A LUZ QUE ACENDE OS PIXELS (spotlight que segue o cursor)

> **(b)** Resolve "card com luz que responde ao cursor, sem virar glow de neon".
> Origem: Aceternity `CardSpotlight` (spotlight como **máscara**, não como brilho) +
> 21st.dev `Cursor Spotlight` (var CSS a partir do ponteiro). O `CanvasRevealEffect` de
> matriz de pontos do Aceternity — que custa `three` + `@react-three/fiber`, ~600 KB —
> é substituído por um `radial-gradient` repetido, 0 KB.

**O conceito.** O cursor não acrescenta um brilho por cima. Ele **acende a matriz de
LEDs que está por baixo do difusor**. Fora do facho, o painel é `--off` (o difusor sem
sinal — o token já se chama assim). Dentro do facho, aparecem pontos discretos, na cor
do tubo daquele serviço. É o TUBO da direção de arte executado como interação:
*LED é pixel, não lâmpada.* Nenhum concorrente vai ter isso, e nenhum gerador de site vai
produzir isso — o default de IA para "card de empresa de luz" é o glow difuso, que é
exatamente o que estamos recusando.

**A restrição de performance resolvida.** Mover um `radial-gradient` por
`background-position` ou por `mask-position` **repinta a cada frame** (é o que Magic UI e
Aceternity fazem). Aqui a luz é um **elemento de tamanho fixo movido por
`translate3d`** — e a máscara radial dele é *estática em relação a ele mesmo*, então
viaja junto sem repintar. Só `transform`. Compositor puro, regra respeitada ao pé
da letra.

```css
@layer components {
  /* o facho: disco de tamanho fixo, centrado na origem por margem negativa,
     posicionado só por translate3d. NADA de left/top/width/height animados. */
  .luz {
    position: absolute;
    top: 0; left: 0;
    width: 15rem;
    aspect-ratio: 1;
    margin: -7.5rem 0 0 -7.5rem;          /* centraliza o disco na origem */
    pointer-events: none;
    z-index: 0;
    opacity: 0;

    /* A MATRIZ DE PIXELS — pontos discretos, nunca luz contínua.
       Mesma gramática do .tubo: ponto, vão, ponto. */
    background-image: radial-gradient(circle at center,
      var(--tubo-cor) 0 1.1px, transparent 1.5px);
    background-size: 7px 7px;

    /* atenuação do facho. Estática em relação ao disco => viaja
       com o transform, sem repaint. */
    -webkit-mask-image: radial-gradient(closest-side, #000 0%, rgba(0,0,0,.55) 42%, transparent 76%);
            mask-image: radial-gradient(closest-side, #000 0%, rgba(0,0,0,.55) 42%, transparent 76%);

    /* a luz multiplica a superfície em vez de cobrir — lição do Holo Card */
    mix-blend-mode: screen;

    transform: translate3d(var(--mx, 50%), var(--my, 35%), 0);
    transition: opacity 260ms var(--ease-out-cut);
  }

  /* só onde existe ponteiro fino. Em touch o elemento nem é pintado. */
  @media (hover: hover) and (pointer: fine) {
    .card:hover .luz { opacity: .85; }
  }

  /* o conteúdo fica acima do facho */
  .card > :not(.luz) { position: relative; z-index: 1; }
}
```

O JS — **um só listener delegado no container dos 13 cards**, com rAF, passivo:

```tsx
// components/LuzCursor.tsx  — ~480 bytes minificado
'use client'
import { useEffect } from 'react'

/** Escreve --mx/--my no card sob o ponteiro. Um listener para os 13.
 *  Não roda em touch, nem em reduced-motion. Não re-renderiza React. */
export function LuzCursor({ seletor }: { seletor: string }) {
  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const raiz = document.querySelector(seletor)
    if (!raiz) return

    let id = 0
    let ult: PointerEvent | null = null

    const aplica = () => {
      id = 0
      if (!ult) return
      const card = (ult.target as Element).closest<HTMLElement>('.card')
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${ult.clientX - r.left}px`)
      card.style.setProperty('--my', `${ult.clientY - r.top}px`)
    }

    const onMove = (e: Event) => {
      ult = e as PointerEvent
      if (!id) id = requestAnimationFrame(aplica)
    }

    raiz.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      raiz.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(id)
    }
  }, [seletor])

  return null
}
```

- **Custo:** ~480 B minificado (~300 B gzip). Somado ao IntersectionObserver atual: **~1,3 KB
  de 60 KB.** Nenhuma dependência.
- **Não usar `will-change: transform`.** `translate3d` já promove a camada; `will-change`
  em 13 elementos criaria 13 camadas permanentes de 15rem² na GPU — em 4G/mobile isso é
  memória de vídeo jogada fora. (E em touch o `.luz` nem chega a ter opacidade.)
- **Touch:** o `@media (hover: hover) and (pointer: fine)` impede qualquer opacidade, e o
  JS retorna antes de registrar o listener. O card mobile fica com o aro P1 + o tubo em
  0.28 + a lavagem estática de `::after`. **Estado padrão que já funciona sozinho** — é a
  exigência do briefing.
- **`:focus-visible` (teclado):** não usar o facho (a luz seguindo o cursor não tem
  equivalente com teclado, e fingir um é pior). O equivalente honesto é acender o tubo e
  o aro — que é o que `.card:focus-within` já faz em P1. Acrescente só:

```css
.card:focus-within .tubo { opacity: 1; }
.card:focus-within::after { opacity: 1; }   /* a lavagem estática, do repo */
```

- **reduced-motion:** o JS aborta e as vars nunca são escritas; o disco fica em
  `translate3d(50%, 35%, 0)` com `opacity: 0`. Acrescentar a garantia explícita:

```css
@media (prefers-reduced-motion: reduce) {
  .luz { display: none; }
}
```

**Variante barata, sem JS nenhum (0 KB), se o teto apertar:** trocar o facho móvel por um
facho fixo que só liga no hover/foco — mesma matriz de pixels, `translate3d` constante,
`opacity 0 → .85`. Perde o "segue o cursor", mantém "o card acende em pixels". Continua
sendo melhor que o glow genérico.

---

### P3 — GRADIENTE ANIMADO NA BORDA COM `@property` — REGISTRADO, MAS CONTRAINDICADO AQUI

> Pedido explicitamente. Verificado, funcional, e **não recomendado para os 13 cards**.

A técnica (fonte: [Ryan Mulligan](https://ryanmulligan.dev/blog/css-property-new-style/),
lida na íntegra), com os nossos tokens:

```css
@property --giro {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.card-destaque {
  border: 1px solid transparent;
  border-radius: var(--radius-placa);      /* bloco grande, raio 22 */
  background:
    linear-gradient(var(--color-off), var(--color-off)) padding-box,
    conic-gradient(from var(--giro),
      var(--color-rule) 0 64%,
      color-mix(in srgb, var(--color-ambar) 70%, var(--color-rule)) 72%,
      var(--color-ambar) 76%,
      color-mix(in srgb, var(--color-ambar) 70%, var(--color-rule)) 80%,
      var(--color-rule) 88% 100%
    ) border-box;
  animation: giro 9s linear infinite;
}
@keyframes giro { to { --giro: 360deg; } }

@media (prefers-reduced-motion: reduce) {
  .card-destaque { animation: none; --giro: 318deg; } /* para com o âmbar no canto sup. dir. */
}
```

**Funciona em Safari iOS 16.4+** (92,91% global). Não precisa de JS. ~200 B de CSS.

**Por que contraindicado:**

1. **Repinta.** Animar uma custom property registrada que alimenta um `conic-gradient`
   obriga o navegador a **recompor o gradiente e repintar a camada da borda a cada
   frame**. Não é `transform` nem `opacity`. Em 13 cards simultâneos, num Android
   intermediário em 4G, isso é 13 repaints/frame. Viola diretamente a restrição do
   projeto.
2. **É o efeito mais genérico de 2025.** Border-beam e conic-border rotativo são o que
   qualquer gerador entrega. Colocar isso num site cuja tese é "não parecer gerado"
   contradiz a própria tese.
3. **Não conta nada.** O aro de dois tons (P1) diz "equipamento bem feito". A borda
   girando não diz nada sobre som e luz.

**Se for usado, que seja assim:** em **exatamente um** elemento da página — o bloco de
CTA final —, com raio `--radius-placa`, em âmbar (é botão/dado, cor permitida), e nunca
nos cards de serviço. Nunca em magenta: magenta não toca botão.

---

### P4 — A VARREDURA (light sweep) — alternativa a P3 que respeita a restrição

> Se o desejo por "borda que ganha vida" precisar ser atendido sem repaint.
> Origem: [theosoti.com — CSS Light Sweep](https://theosoti.com/short/featured-card-animation/),
> reescrito para `transform` puro.

Uma barra inclinada atravessa o card uma vez, no hover/foco. É a leitura de um **moving
head varrendo o palco** — vocabulário da empresa, não do framework. `transform` +
`opacity`, um disparo só, sem loop.

```css
@layer components {
  .card .varredura {
    position: absolute;
    inset-block: -20%;
    inset-inline-start: 0;
    width: 34%;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    background: linear-gradient(100deg,
      transparent,
      color-mix(in srgb, var(--color-branco) 8%, transparent) 45%,
      color-mix(in srgb, var(--color-branco) 8%, transparent) 55%,
      transparent);
    transform: translate3d(-140%, 0, 0) skewX(-14deg);
  }

  @media (hover: hover) and (pointer: fine) {
    .card:hover .varredura { animation: varre 720ms var(--ease-out-cut) forwards; }
  }
  .card:focus-within .varredura { animation: varre 720ms var(--ease-out-cut) forwards; }

  @keyframes varre {
    0%   { opacity: 0; transform: translate3d(-140%, 0, 0) skewX(-14deg); }
    12%  { opacity: 1; }
    88%  { opacity: 1; }
    100% { opacity: 0; transform: translate3d(400%, 0, 0) skewX(-14deg); }
  }
}

@media (prefers-reduced-motion: reduce) {
  .card .varredura { display: none; }
}
```

- **Custo:** 0 KB JS. ~350 B CSS.
- **Touch:** não dispara (sem hover) — e não faz falta, porque não carrega informação.
- **`:focus-visible`:** dispara igual, via `:focus-within`. Equivalência real.
- **reduced-motion:** removido, não "mais lento".
- **Cuidado:** só faz sentido em 1–3 cards em destaque. Nos 13 vira festa de luz.

---

### P5 — O ÍNDICE TÉCNICO: 13 SERVIÇOS SEM GRADE DE FRAMEWORK

> **(c)** Resolve `app/page.tsx:193` — `grid gap-2 sm:grid-cols-2 lg:grid-cols-3` com 13
> itens (4 linhas + 1 órfão). Origem: estética de índice arquivístico (Figma / Elementor /
> DesignModo, 2026) + a ficha do SOMA no Awwwards ("*rather than conventional card-based
> hierarchies*") + `great-ui-image-hover-reveal` do 21st.dev.

**O erro de origem não é o card, é o número.** 13 é primo. Não existe grade que acomode
13 sem órfão. Toda tentativa de resolver 13 com colunas iguais vai parecer grade quebrada.
A saída é **parar de tratar os 13 como iguais.**

#### 5.1 A taxonomia — 13 vira 4 blocos assimétricos

Os dados em `lib/conteudo.ts:60-99` já contêm a taxonomia; ela só não está sendo usada:

| Bloco | Itens | Serviços | Cor do tubo |
|---|---|---|---|
| **SOM** | 1 | Sonorização e palco | branco (técnico) |
| **LUZ** | 2 | Iluminação cênica · Iluminação de pista | branco / magenta |
| **LED** | 5 | Painel · Pista · Tubos · Túnel · Efeitos especiais | magenta |
| **CENOGRAFIA E CONTEÚDO** | 3 | Projetos 3D · Área instagramável · Criação de conteúdo | branco / magenta |
| **PACOTES** | 2 | Emoções 15 anos · Emoções casamento | magenta / congo |

1 · 2 · 5 · 3 · 2 = 13. Cinco blocos de tamanho **desigual por natureza** — a assimetria
deixa de ser problema de layout e passa a ser informação: o bloco LED é o maior porque é
o que a empresa faz de diferente. Isso é o argumento comercial desenhado.

E resolve a restrição de cor sozinho: SOM e LUZ técnica ficam brancos (perto de rosto),
LED e PACOTES ficam magenta/congo (ambiente). Magenta nunca encosta em botão nem em rosto.

#### 5.2 A forma — linha de índice, não caixa

O vocabulário **já existe na página** em `app/page.tsx:137-158` (o roteiro do casamento:
`grid-cols-[auto_1fr]`, `border-t border-rule`, coluna de pixels + título + label âmbar +
descrição). Reutilizá-lo para os serviços dá coerência de graça e mata a grade.

A coluna monoespaçada **não leva 01/02/03** (proibido, e além disso mentiroso — serviço
não tem ordem). Leva o **código de rider** — a notação que a própria indústria usa numa
call sheet. É o "dado" da direção de arte, e portanto **âmbar**:

```
PA      Sonorização e palco
LX      Iluminação cênica
LX-P    Iluminação de pista
LED-P   Painel de LED
LED-F   Pista de LED
LED-T   Tubos de LED
LED-TN  Túnel de LED
FX      Efeitos especiais
3D      Projetos 3D personalizados
SET     Área instagramável
REC     Criação de conteúdo
15A     Emoções 15 anos
CAS     Emoções casamento
```

`PA` (public address) e `LX` (lighting) são códigos reais de mapa de palco. Quem contrata
som e luz reconhece; quem não reconhece lê como competência técnica. Custo: zero.

```css
@layer components {
  /* a linha de índice. Sem caixa, sem sombra: só filete e ritmo. */
  .linha {
    position: relative;
    display: grid;
    grid-template-columns: 5.5rem 1fr auto;
    align-items: baseline;
    gap: 0 1.5rem;
    min-height: 4.5rem;              /* alvo de toque > 44px, com folga */
    padding-block: 1.15rem;
    border-block-start: 1px solid var(--color-rule);
    transition: background-color 220ms var(--ease-out-cut);
  }
  .bloco .linha:last-child { border-block-end: 1px solid var(--color-rule); }

  /* o código de rider — dado, logo âmbar */
  .linha__cod {
    font-family: var(--font-mono);
    font-size: var(--text-2xs);
    letter-spacing: .12em;
    color: color-mix(in srgb, var(--color-ambar) 78%, var(--color-branco-2));
    font-variant-numeric: tabular-nums;
  }

  /* o pixel do tubo, à esquerda do código: acende no hover/foco.
     Fecha em 3px, raio --radius-cut. Não é bolinha de framework. */
  .linha__px {
    position: absolute;
    inset-inline-start: -1.15rem;
    inset-block-start: 1.6rem;
    width: 3px; height: 12px;
    border-radius: var(--radius-cut);
    background: var(--tubo-cor);
    opacity: .26;
    transition: opacity 220ms var(--ease-out-cut);
  }

  /* o estado ativo: o filete acende do lado do tubo e o texto avança 4px */
  .linha:hover, .linha:focus-within {
    background-color: color-mix(in srgb, var(--tubo-cor) 5%, transparent);
  }
  .linha:hover .linha__px,
  .linha:focus-within .linha__px { opacity: 1; }
  .linha:hover .linha__seta,
  .linha:focus-within .linha__seta { transform: translate3d(4px, 0, 0); opacity: 1; }

  .linha__seta {
    opacity: 0;
    transform: translate3d(0, 0, 0);
    transition: transform 220ms var(--ease-tubo), opacity 220ms var(--ease-out-cut);
  }
  /* em touch a seta é permanente — hover não existe lá */
  @media (hover: none) {
    .linha__seta { opacity: 1; }
  }
}
```

E o cabeçalho de bloco, que é o que impede o conjunto de virar lista de supermercado:

```tsx
{/* app/page.tsx — no lugar do grid de 13 */}
<div className="mt-14 flex flex-col gap-16">
  {BLOCOS.map((b) => (
    <section key={b.id} className="grid gap-x-12 gap-y-6 lg:grid-cols-[14rem_1fr]">
      {/* coluna esquerda: fica parada, sticky no desktop */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <p className="lab text-ambar">{b.cod}</p>
        <h3 className="mt-2 text-lg">{b.titulo}</h3>
        <p className="lab mt-3">{b.itens.length} {b.itens.length === 1 ? 'serviço' : 'serviços'}</p>
      </div>
      {/* coluna direita: as linhas */}
      <ul className="bloco">
        {b.itens.map((s) => <LinhaServico key={s.ancora} servico={s} />)}
      </ul>
    </section>
  ))}
</div>
```

**O que isso ganha:**

- Zero cards de ícone+título+parágrafo. O briefing é cumprido literalmente.
- 13 itens em ~13 × 4,5rem = tela mais curta que 13 cards em grade → menos scroll em 4G.
- Alvo de toque de 72px (`min-height: 4.5rem`), bem acima dos 44px.
- Cada linha continua sendo um `<a>` com `id` próprio, então os 13 redirecionamentos 301
  de `REDIRECTS.md` continuam funcionando exatamente igual.
- Zero imagens novas → zero KB de rede.
- A coluna sticky à esquerda dá a sensação de "sumário técnico sendo percorrido" que a
  estética arquivística produz, sem nenhum JS de scroll.

#### 5.3 Onde o CARD sobrevive

O card não some — ele passa a significar alguma coisa. Reserve **três** cards de verdade
(P1 + P2 + P4), grandes, com foto, para os três serviços que vendem: **Painel de LED**,
**Pista de LED** e **Túnel de LED** — a cenografia de LED, que é a tese do negócio. Esses
três ficam antes do índice, em `lg:grid-cols-3` (3 em 3 colunas: sem órfão), com
`--radius-placa`. Os outros 10 ficam nas linhas.

Resultado: 3 objetos com peso + 13 entradas de índice. Hierarquia real, e **nenhuma
grade de 13**.

---

## 6. ORÇAMENTO — CABE NO TETO

| Item | JS gzip | CSS (bruto) |
|---|---|---|
| IntersectionObserver do `Reveal` (já existe) | ~0,4 KB | — |
| P1 aro de dois tons | 0 | ~700 B |
| P2 `LuzCursor` + `.luz` | ~0,3 KB | ~600 B |
| P4 varredura | 0 | ~350 B |
| P5 índice + blocos | 0 | ~900 B |
| **Total** | **~0,7 KB** | **~2,5 KB (≈800 B gzip)** |
| **Teto** | **60 KB** | — |

Sobra 59,3 KB. Para comparação: instalar **um** componente do 21st.dev traria
`motion` (Framer Motion), **~34 KB gzip**, para fazer menos do que o CSS acima faz.
O `CardSpotlight` do Aceternity traria `three` + `@react-three/fiber`, **~600 KB**.

---

## 7. MATRIZ DE DEGRADAÇÃO

| Padrão | Touch (sem hover) | `:focus-visible` / teclado | `prefers-reduced-motion` | Sem JS |
|---|---|---|---|---|
| **P1** aro de dois tons | **estado padrão** — visível sempre | `:focus-within` acende o aro na cor do tubo | estático, nada muda | idêntico |
| **P2** luz nos pixels | não pintado (`@media hover: hover`), JS não registra listener | tubo + lavagem estática de `::after` acendem | `.luz { display: none }` | disco fica em opacity 0; card completo |
| **P3** conic `@property` | anima (contraindicado) | n/a | `animation: none` + ângulo parado | anima |
| **P4** varredura | não dispara | dispara via `:focus-within` | `display: none` | dispara |
| **P5** índice | seta permanente via `@media (hover: none)`; alvo 72px | `:focus-within` acende pixel + seta | só `transform` de 4px, já neutralizado | tudo visível |

Regra que atravessa tudo: **nada que carregue informação depende de hover.** Hover só
adiciona ênfase. Em mobile — que é quase todo o tráfego — a página já está completa.

---

## 8. O QUE FOI DESCARTADO, E POR QUÊ

| Descartado | Motivo |
|---|---|
| `motion` / Framer Motion | 34 KB gzip para o que o CSS faz com 800 B |
| `CanvasRevealEffect` (three + r3f) | ~600 KB. 10× o teto inteiro |
| Border Beam / conic girando | Repinta por frame; clichê de 2024-25; não diz nada sobre o negócio |
| Glow difuso / `filter: blur()` grande | É o default de IA para "neon"; a direção de arte já recusa (`globals.css:111`) |
| `feColorMatrix` (Animated Glow Card) | Filtro SVG por frame, caro em GPU mobile |
| Tilt 3D (Holo Card) | Ruído em card de serviço; foil arco-íris quebra a paleta |
| `corner-shape: squircle` | Chrome/Edge 139+ só. Sem Safari iOS = sem o nosso tráfego |
| 5 `div` aninhados do `TextureCard` | 65 elementos extras; mesmo resultado ótico com 1 gradiente |
| `will-change: transform` nos 13 `.luz` | 13 camadas GPU permanentes; `translate3d` já promove |
| Numeração 01/02/03 | Proibido no briefing, e falso — serviço não tem ordem. Código de rider no lugar |
| Gradiente roxo→azul, `shadow-*` do Tailwind, raio único | Proibidos no briefing |

---

## 9. ORDEM DE EXECUÇÃO SUGERIDA

1. **P1** — aro de dois tons. Maior ganho por byte, e é o único que melhora o card para
   100% do tráfego mobile. Substitui o `.card::before` atual.
2. **P5** — o índice de 13. Maior ganho estrutural; resolve a proibição do briefing e
   encurta a página.
3. **P2** — a luz nos pixels, nos 3 cards de destaque. É a assinatura.
4. **P4** — a varredura, opcional, só nos mesmos 3.
5. **P3** — só se houver decisão editorial de destacar o CTA final. Um elemento, âmbar.

---

## FONTES ABERTAS

**Bibliotecas (código-fonte real, do registry):**
- `github.com/magicuidesign/magicui` → `apps/www/registry/magicui/{magic-card,shine-border,border-beam}.tsx`
- `github.com/nolly-studio/cult-ui` → `apps/www/registry/default/ui/texture-card.tsx`
- `ui.aceternity.com/registry/{card-spotlight,hover-border-gradient,evervault-card}.json`
- [ui.shadcn.com/docs/components/card](https://ui.shadcn.com/docs/components/card)

**21st.dev:** [/s/card](https://21st.dev/s/card) · [/s/border](https://21st.dev/community/components/s/border) · [sitemap.xml](https://21st.dev/sitemap.xml) (8.955 URLs) · [spotlight-card](https://21st.dev/community/components/easemize/spotlight-card/default) · [magic-card](https://21st.dev/community/components/dillionverma/magic-card) · [animated-glow-card](https://21st.dev/community/components/easemize/animated-glow-card/default) · [holo-card](https://21st.dev/@rmahammad/components/holo-card) · [cursor-spotlight](https://21st.dev/@pulkitxm/components/cursor-spotlight)

**Suporte:** [caniuse @property](https://caniuse.com/mdn-css_at-rules_property) · [caniuse css-masks](https://caniuse.com/css-masks) · [MDN rect()](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/rect) · [Tailwind v4](https://tailwindcss.com/blog/tailwindcss-v4)

**Técnica:** [Ryan Mulligan — CSS @property and the New Style](https://ryanmulligan.dev/blog/css-property-new-style/) · [Smashing — corner-shape](https://www.smashingmagazine.com/2026/03/beyond-border-radius-css-corner-shape-property-ui/) · [squircle.js — Squircles in CSS (2026)](https://squircle.js.org/blog/squircles-in-css) · [master.dev — superellipse](https://master.dev/blog/understanding-css-corner-shape-and-the-power-of-the-superellipse/) · [theosoti — light sweep](https://theosoti.com/short/featured-card-animation/)

**Sites reais:** [Awwwards Film & TV](https://www.awwwards.com/websites/film-tv/) · [SOMA](https://www.awwwards.com/sites/soma-maison-de-production) · [Awwwards Design Agencies](https://www.awwwards.com/websites/design-agencies/) · [Figma — Web Design Trends](https://www.figma.com/resource-library/web-design-trends/) · [Elementor 2026](https://elementor.com/blog/web-design-trends-2026/) · [DesignModo](https://designmodo.com/web-design-trends/)

*Godly (`godly.website/websites/agency`) redireciona para `recent.design`; Land-book
devolve 403 a fetch automatizado. Ambos não puderam ser catalogados diretamente.*
