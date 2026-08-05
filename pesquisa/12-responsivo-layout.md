# 12 — Layout fluido e responsivo moderno em CSS

Pesquisa de front-end para o site da Rapa Sound (Next.js 15.5.4 `output: 'export'`, React 19, Tailwind CSS v4.1.13).
Largura crítica de teste: **380px**. A maior parte do tráfego vem do link na bio do Instagram, em celular.

Data da pesquisa: **5 de agosto de 2026**. Todo suporte de navegador abaixo foi conferido contra o
[Web Platform Features Explorer](https://web-platform-dx.github.io/web-features-explorer/) (dados `web-features`, os mesmos
que alimentam o selo Baseline do MDN) ou contra a documentação oficial do fornecedor. Onde não confirmei, está escrito
**"não confirmado"**.

---

## RESUMO EXECUTIVO — as decisões concretas

1. **Escala tipográfica fixa em `rem` é o maior problema de 380px do projeto hoje.** `--text-3xl: 4rem` (64px) e
   `--text-2xl: 2.75rem` (44px) valem igual num iPhone SE e num monitor. Trocar por `clamp()` com termo em `rem` — fórmula e
   valores prontos na §3.
2. **Provável estouro horizontal no `LequeEquipe`, tanto a 380px quanto acima de 1024px.** O componente calcula o
   deslocamento dos cards a partir de `window.innerWidth`, mas vive dentro de uma coluna (`lg:grid-cols-2`). A conta está na §5.4 —
   ~59px de sangria de cada lado a 380px. Rodar o script de diagnóstico da §5.1 antes de qualquer outra coisa.
3. **`overflow-hidden` na seção `#servicos` mata o `lg:sticky` dos títulos de bloco.** `overflow: hidden` cria um
   *scroll container* e vira o scrollport do sticky. A troca é `overflow-clip` (§5.6).
4. **Trocar as 5 media queries de `.leque` por container query + `cqi`.** É o caso de livro-texto: o elemento depende da
   largura da *coluna*, não da janela (§1.4).
5. **Manter `svh` no hero (já está certo).** Não migrar para `dvh`: `dvh` recalcula layout a cada transição da barra do
   Safari (§2).
6. **Adicionar `text-wrap: pretty` nos parágrafos.** `balance` já está nos títulos e está correto. `pretty` é
   enriquecimento progressivo puro — sem Firefox, nada acontece (§7).
7. **`env(safe-area-inset-bottom)` volta 0 no iOS 15+ quando a toolbar some** — o `max()` do `MenuLiquido` já cobre, mas o
   piso de `1rem` (16px) é menor que o indicador de home (34px). Subir para `1.5rem` (§6).
8. **`body { padding-block-end: 6rem }` é número mágico.** Derivar da altura real do menu + safe area (§6.4).
9. **Não adicionar breakpoints novos por largura de aparelho.** Adicionar onde o layout quebra — e preferir container
   query quando o componente está dentro de uma coluna (§8).
10. **Remover CSS morto:** `.navbar`, `.navbar__*`, `.folha`, `.folha__corpo` não têm consumidor em nenhum `.tsx`.
11. **Grid de `auto-fit` só entra se houver contagem variável de itens** — hoje o projeto usa `md:grid-cols-3` fixo com 3
    cards, o que está correto (§4.5).
12. **`min-w-0` / `minmax(0, 1fr)` já aparecem no projeto nos lugares certos.** Falta um caso: as `<ul>` de nomes do rider (§5.5).

---

# 1. Container queries

## 1.1 O que é

Uma media query pergunta *"quanto mede a janela?"*. Uma container query pergunta *"quanto mede a caixa em que eu estou?"*.

```css
/* 1. alguém precisa declarar que é um contêiner de consulta */
.coluna {
  container-type: inline-size;   /* mede o eixo inline (largura, em pt-BR) */
  container-name: coluna;        /* opcional, mas recomendado quando aninha */
}

/* atalho equivalente */
.coluna { container: coluna / inline-size; }

/* 2. os DESCENDENTES consultam */
@container coluna (width >= 30rem) {
  .card { grid-template-columns: 12rem 1fr; }
}
```

Valores de `container-type` ([MDN, atualizado 8 jul 2026](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)):

| valor | o que faz | contenção que aplica |
|---|---|---|
| `normal` | padrão. Não responde a consulta de tamanho; ainda serve para consulta de estilo e para `container-name` | nenhuma |
| `inline-size` | consulta a largura | layout + style + **inline-size** |
| `size` | consulta largura **e** altura | layout + style + **size** (os dois eixos) |

**Use `inline-size`.** `size` só quando você realmente precisa consultar altura — e aí precisa dar altura explícita ao
contêiner (§1.3).

## 1.2 As unidades `cq*`

| unidade | relativa a |
|---|---|
| `cqw` | 1% da **largura** do contêiner |
| `cqh` | 1% da **altura** do contêiner |
| `cqi` | 1% do **inline size** do contêiner (= `cqw` em português) |
| `cqb` | 1% do **block size** do contêiner |
| `cqmin` | o menor entre `cqi` e `cqb` |
| `cqmax` | o maior entre `cqi` e `cqb` |

Prefira `cqi`/`cqb` a `cqw`/`cqh`: são lógicas e continuam corretas se o modo de escrita mudar.

**Fallback:** se não existir nenhum contêiner elegível acima, as unidades `cq*` caem para as unidades de viewport
**pequeno** (`svi`, `svb`) — não para zero, não para erro. Fonte:
[MDN — Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries).
Consequência prática: um `50cqi` num elemento sem contêiner pai vira `50svi`, o que **parece** funcionar e esconde o bug.
Sempre confirme que o `container-type` está mesmo aplicado.

## 1.3 As pegadinhas (as três que importam)

### Pegadinha 1 — o contêiner não pode consultar a si mesmo

`@container` só estiliza **descendentes**. Isso não é limitação de implementação: é proteção contra laço infinito — se um
elemento pudesse mudar a própria largura em resposta à própria largura, a condição se invalidaria sozinha.

Josh Comeau ([*A Friendly Introduction to Container Queries*](https://www.joshwcomeau.com/css/container-queries-introduction/)):
a saída é sempre a mesma — **um wrapper**. O elemento externo vira o contêiner, o interno recebe os estilos.

```html
<!-- ERRADO: o .card quer se medir e se estilizar -->
<div class="card" style="container-type: inline-size">…</div>

<!-- CERTO -->
<div class="card-wrap">   <!-- container-type: inline-size -->
  <div class="card">…</div>
</div>
```

### Pegadinha 2 — `container-type: size` colapsa a altura

Esta é a pegadinha que o briefing pediu. `container-type: size` aplica **contenção de tamanho nos dois eixos**. Contenção
de tamanho significa: *"calcule meu tamanho ignorando meus filhos"*. Sem altura explícita, o contêiner colapsa para `0`
(mais padding) e o conteúdo vaza por baixo.

```css
/* BOMBA */
.painel {
  container-type: size;   /* altura vira 0; o texto sai pela borda */
}

/* OK: a altura foi declarada, o contêiner não precisa perguntar aos filhos */
.painel {
  container-type: size;
  block-size: 24rem;
}

/* MELHOR na quase totalidade dos casos */
.painel {
  container-type: inline-size;   /* só o eixo inline é contido;
                                    a altura continua crescendo com o conteúdo */
}
```

Formulação de Comeau que vale decorar: **"we can't change what we measure"** — se você contém o eixo, perde a capacidade
de o conteúdo definir aquele eixo.

Corolário direto para este projeto (§1.4): **`.leque` não pode ser, ao mesmo tempo, o contêiner e o elemento cuja altura
depende de `cqi`.** A altura precisa vir de um contêiner *acima* dele.

### Pegadinha 3 — não faça de `html`/`body` um contêiner sem pensar

Aplicar `container-type` na raiz aplica contenção na raiz, com efeitos colaterais em rolagem e em `position: fixed`.
Exceção legítima e conhecida: transformar o `<body>` em contêiner **de propósito** para usar `100cqw` no lugar de
`100vw` e resolver o problema da barra de rolagem clássica (§5.2). Fora disso, evite.

## 1.4 Quando substituem media query — e quando não

**Substituem** quando o componente aparece em larguras diferentes na mesma janela. Regra prática: *se o componente pode
viver numa coluna, é container query; se ele define a coluna, é media query.*

Neste projeto o caso mais claro é o `.leque` (`components/LequeEquipe.tsx` + `app/globals.css:172-199`):

```css
/* HOJE — cinco media queries que medem a JANELA */
.leque { height: 22rem; }
@media (min-width: 480px)  { .leque { height: 26rem; } }
@media (min-width: 640px)  { .leque { height: 28rem; } }
@media (min-width: 768px)  { .leque { height: 34rem; } }
@media (min-width: 1024px) { .leque { height: 38rem; } }

.leque-card { width: 11rem; }
@media (min-width: 768px)  { .leque-card { width: 14rem; } }
@media (min-width: 1024px) { .leque-card { width: 16rem; } }
```

O problema: em `app/page.tsx:327` o leque vive dentro de `lg:grid-cols-2`. A 1280px de janela, o `max-w-6xl` (72rem =
1152px) menos `px-8` (64px) dá 1088px de conteúdo; menos `lg:gap-20` (80px), dividido por 2 → **cada coluna tem ~504px**.
A media query em 1024px dispara achando que tem a janela inteira, e entrega ao leque uma geometria dimensionada para 1024px
dentro de uma caixa de 504px.

Correção com container query (mede a coluna, não a janela):

```css
/* o wrapper vira o contêiner — NUNCA o próprio .leque (pegadinha 2) */
.leque-wrap { container-type: inline-size; }

.leque-wrap .leque {
  /* uma linha substitui as cinco media queries */
  --card: clamp(11rem, 44cqi, 16rem);
  height: calc(var(--card) * 2.4);
  position: relative;
}
.leque-wrap .leque-card { width: var(--card); }
```

Em Tailwind v4 o wrapper é só uma classe:

```tsx
<Reveal delay={90} className="@container">
  <LequeEquipe … />
</Reveal>
```

**Nota importante:** o `LequeEquipe` também lê `window.innerWidth` e `window.innerHeight` em JavaScript
(`multLargura`, `multAltura`). CSS sozinho não resolve isso. Para o JS, o equivalente da container query é um
`ResizeObserver` no wrapper — trocar `window.innerWidth` por `entry.contentRect.width` do contêiner. Ver §5.4.

## 1.5 Como usar no Tailwind v4

Em v4 as container queries são **nativas** — o plugin `@tailwindcss/container-queries` do v3 não é mais necessário.
Fonte: [tailwindcss.com/docs/responsive-design](https://tailwindcss.com/docs/responsive-design).

```html
<!-- marca o contêiner -->
<div class="@container">
  <!-- variantes mobile-first: aplicam a partir do tamanho -->
  <div class="flex flex-col @md:flex-row">…</div>

  <!-- variante max: aplica ABAIXO do tamanho -->
  <div class="flex-row @max-md:flex-col">…</div>

  <!-- faixa: empilha as duas -->
  <div class="@sm:@max-md:flex-col">…</div>

  <!-- unidades cq* em valor arbitrário -->
  <div class="w-[50cqw]">…</div>
</div>

<!-- contêiner nomeado -->
<div class="@container/painel">
  <div class="@sm/painel:flex-col">…</div>
</div>

<!-- para cqb/cqh (eixo block) é preciso container-type: size -->
<div class="@container-size">
  <div class="h-[50cqb]">…</div>
</div>
```

Escala padrão das variantes `@` (namespace `--container-*`):

| variante | largura mínima | CSS |
|---|---|---|
| `@3xs` | 16rem (256px) | `@container (width >= 16rem)` |
| `@2xs` | 18rem (288px) | `@container (width >= 18rem)` |
| `@xs`  | 20rem (320px) | … |
| `@sm`  | 24rem (384px) | |
| `@md`  | 28rem (448px) | |
| `@lg`  | 32rem (512px) | |
| `@xl`  | 36rem (576px) | |
| `@2xl` | 42rem (672px) | |
| `@3xl` | 48rem (768px) | |
| `@4xl` | 56rem (896px) | |
| `@5xl` | 64rem (1024px) | |
| `@6xl` | 72rem (1152px) | |
| `@7xl` | 80rem (1280px) | |

> **⚠️ Pegadinha específica do Tailwind v4 que afeta este projeto:** o namespace `--container-*` alimenta **duas coisas ao
> mesmo tempo** — as variantes `@sm:`/`@md:`… **e** os utilitários `max-w-*`. O `max-w-6xl` usado em
> `components/ui.tsx` (`Secao`) e no `NavDesktop` é literalmente `--container-6xl: 72rem`. Se alguém redefinir
> `--container-6xl` no `@theme` para ajustar uma container query, **a largura de todas as seções da página muda junto**.
> Para tamanhos de container query próprios, crie nomes novos (`--container-leque: 30rem` → `@leque:`), nunca sobrescreva os
> existentes. Fonte: [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme).

## 1.6 Suporte HOJE

**Baseline: Widely available desde 14 de agosto de 2025.**
Fonte: [Web Platform Features Explorer — container-queries](https://web-platform-dx.github.io/web-features-explorer/features/container-queries/) (consultado em 5 ago 2026).

| navegador | versão | data |
|---|---|---|
| Chrome / Chrome Android | 105 | 2 set 2022 |
| Edge | 105 | 1 set 2022 |
| Safari / Safari iOS | 16 | 12 set 2022 |
| Firefox / Firefox Android | 110 | 14 fev 2023 |

Para um site cujo tráfego vem do navegador embutido do Instagram (WebView do iOS ≥16 / Android WebView moderno), isso é
suporte total. **Não precisa de fallback.** Se quiser cinto e suspensório:

```css
@supports not (container-type: inline-size) {
  /* a media query antiga fica aqui */
}
```

---

# 2. Unidades de viewport dinâmicas

## 2.1 Por que `100vh` quebra no Safari iOS

O navegador móvel tem duas alturas de viewport, e a barra de endereço se move entre elas:

- quando a barra está **expandida** (estado inicial da página), a área visível é **menor**;
- quando a barra **encolhe** (depois que o usuário rola), a área visível é **maior**.

`vh` foi definido antes disso existir, e nos UAs móveis resolve para o **viewport grande** — a altura com a UI retraída.
Resultado: no carregamento, `height: 100vh` é **maior** que o que se vê, e o rodapé do hero fica escondido atrás da barra
de endereço exatamente no primeiro segundo, que é o único que importa num link na bio.

Fontes:
[Ahmad Shadeed — *New Viewport Units*](https://ishadeed.com/article/new-viewport-units/) ·
[Bram.us — *The Large, Small, and Dynamic Viewports*](https://www.bram.us/2021/07/08/the-large-small-and-dynamic-viewports/) ·
[MDN — Numeric data types / viewport-percentage lengths](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_values_and_units/Numeric_data_types).

## 2.2 As três famílias

| prefixo | nome | valor |
|---|---|---|
| `sv*` | **small** viewport | altura com **toda** a UI do navegador **visível**. Constante. |
| `lv*` | **large** viewport | altura com **toda** a UI do navegador **retraída**. Constante. |
| `dv*` | **dynamic** viewport | o valor atual, entre `sv` e `lv`. **Muda durante o scroll.** |

Cada uma tem `h` (height), `w` (width), `i` (inline), `b` (block), `min` e `max`:
`svh svw svi svb svmin svmax`, `lvh lvw lvi lvb lvmin lvmax`, `dvh dvw dvi dvb dvmin dvmax`.

- `dvi` = 1% do inline size do viewport dinâmico. Em português (modo horizontal), `dvi` ≡ `dvw`.
- Prefira as formas lógicas (`svb`, `dvi`) quando o valor é conceitualmente "no eixo do texto".

## 2.3 `dvh` repinta? Causa jank?

**Sim, recalcula. Sim, pode causar jank — e é por isso que ele não deve ser o padrão.**

`dvh` não é uma constante: toda vez que a UA muda a altura da barra, todo elemento dimensionado em `dvh` sofre
**layout + paint**. Não é uma animação composta em GPU; é reflow na main thread, e a barra do Safari não muda de altura de
uma vez — ela desliza.

Ahmad Shadeed, no artigo primário citado acima, é explícito: *"I would be careful when using it… it might impact the
performance of the page, as it will be a lot of work for the browser to recalculate"*, e recomenda **nunca** usar `dvh`
em `font-size`.

Sintoma visível, mesmo sem "jank" medido: o hero **cresce** quando a pessoa começa a rolar para baixo e **encolhe** quando
volta. O conteúdo se reposiciona durante o gesto de rolagem. Com header/footer sticky por perto, o efeito é pior.

> **Nota de honestidade sobre fontes:** relatos quantificados de jank de `dvh` (ex.: "visivelmente travado num iPhone 8")
> circulam em blogs de terceiros que não consegui verificar em fonte primária. O que **está** em fonte primária (Shadeed) é
> a recomendação de cautela e o mecanismo (recálculo contínuo). Trate a magnitude do jank como **não confirmado**;
> trate o mecanismo e o layout shift visível como confirmados.

## 2.4 Qual usar para hero de tela cheia

**`svh`** — e o projeto já está certo (`app/page.tsx:41`, `min-h-[88svh]`).

Racional:
1. `svh` é **constante**. Zero recálculo durante o scroll, zero layout shift, zero contribuição para CLS.
2. `svh` é a altura **garantidamente visível**. Nada do hero fica atrás da barra de endereço no primeiro paint — que é o
   frame que decide se a pessoa fica ou volta pro Instagram.
3. O "custo" do `svh` é sobrar um pouco de espaço quando a barra encolhe. Num hero isso é invisível: aparece um pouco mais
   da seção seguinte, o que é até bom (afordância de rolagem).

Regra de decisão:

| caso | unidade |
|---|---|
| hero, seção de tela cheia, `min-height` de página | **`svh`** |
| painel/sheet/modal ancorado à borda inferior que precisa colar no visível | `dvh` |
| pin de scroll-driven animation (`.virada__plano` deste projeto) | **`svh`** — usar `dvh` faria a distância do pin mudar durante o próprio pin |
| elemento que precisa da altura máxima possível, sem importar o corte | `lvh` (raro) |

O projeto já usa `svh` em `.folha` (`max-height: 72svh`) e em `.virada` (`min-block-size: 170svh`,
`block-size: 100svh`). Está correto e **não deve ser mudado**.

```css
/* padrão defensivo com fallback para UAs antigos (WebViews embutidos legados) */
.hero {
  min-height: 88vh;   /* fallback: só é usado se a linha de baixo não fizer parse */
  min-height: 88svh;
}
```

> **Pegadinha de campo:** há relatos de WebViews embutidos (Line, alguns in-app browsers) simplesmente **ignorarem** as
> unidades novas. O fallback de duas linhas acima cobre isso a custo zero. Este projeto vive dentro do WebView do
> Instagram — vale colocar. Origem do relato: comentários em artigos de terceiros; **não confirmado** em fonte primária.

## 2.5 O que as unidades novas NÃO resolvem: a barra de rolagem clássica

`100vw`, `100svw`, `100lvw` e `100dvw` **todas** incluem a largura da barra de rolagem clássica. Se a página tem barra
vertical clássica (Windows, Linux, macOS com "sempre mostrar"), `100vw` é ~15-17px **maior** que o viewport de layout →
barra horizontal parasita.

O CSSWG **decidiu não resolver** isso com unidade nova, por dois motivos: (a) o problema de UI móvel e o de scrollbar de
desktop são distintos e uma unidade única criaria efeito colateral cruzado; (b) as unidades de viewport precisam ser
resolvíveis em *computed-value time*, sem depender de layout — e largura de scrollbar depende de layout.

Fonte: [Šime Vidas — *New CSS Viewport Units Do Not Solve The Classic Scrollbar Problem*, Smashing Magazine, dez 2023](https://www.smashingmagazine.com/2023/12/new-css-viewport-units-not-solve-classic-scrollbar-problem/) ·
[csswg-drafts #6026](https://github.com/w3c/csswg-drafts/issues/6026).

Solução sem JS (a que Vidas recomenda) — usa container query justamente para isso:

```css
body {
  margin: 0;
  container-type: inline-size;
}
.sangria-total {
  width: 100vw;    /* fallback */
  width: 100cqw;   /* mede o <body>, que JÁ desconta a scrollbar */
}
```

Resolução futura do CSSWG (ainda **não confirmada como enviada em navegador**): com `scrollbar-gutter: stable` na raiz,
`100vw` passaria a descontar a goteira.

## 2.6 Suporte HOJE

**Baseline: Widely available desde 5 de junho de 2025.**
Fonte: [Web Platform Features Explorer — viewport-unit-variants](https://web-platform-dx.github.io/web-features-explorer/features/viewport-unit-variants/) (consultado em 5 ago 2026).

| navegador | versão | data |
|---|---|---|
| Safari / Safari iOS | 15.4 | 14 mar 2022 |
| Firefox | 101 | 31 mai 2022 |
| Chrome | 108 | 29 nov 2022 |
| Edge | 108 | 5 dez 2022 |

---

# 3. `clamp()` fluido

## 3.1 A derivação matemática

Você quer uma reta que passe por dois pontos: `(larguraMin, tamanhoMin)` e `(larguraMax, tamanhoMax)`. Tudo em px para a conta.

Reta: `y = m·x + b`

**Inclinação (vira o termo `vw`):**

```
m = (y₂ − y₁) / (x₂ − x₁)
v = 100 · m        → o valor em vw
```

**Intercepto (vira o termo `rem`):**

```
b = y₁ − m·x₁
  = (x₁·y₂ − x₂·y₁) / (x₁ − x₂)      ← forma fechada, sem arredondar m antes
r = b / 16                            → o valor em rem (raiz = 16px)
```

**Resultado:**

```css
font-size: clamp(<tamanhoMin>rem, <r>rem + <v>vw, <tamanhoMax>rem);
```

Fonte da forma fechada: [Adrian Bece — *Modern Fluid Typography Using CSS Clamp*, Smashing Magazine, jan 2022](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/).

**Exemplo conferido** (o mesmo do artigo): min 36px @ 600px, max 52px @ 1400px.

```
m = (52 − 36) / (1400 − 600) = 16/800 = 0,02      → v = 2vw
b = (600·52 − 1400·36) / (600 − 1400)
  = (31200 − 50400) / (−800) = 24px               → r = 1,5rem

clamp(2.25rem, 1.5rem + 2vw, 3.25rem)
```
Verificação: em 600px → `24 + 0,02·600 = 36` ✓ · em 1400px → `24 + 0,02·1400 = 52` ✓

## 3.2 Por que `clamp` com `vw` puro quebra o zoom (WCAG 1.4.4)

**O mecanismo.** Zoom do navegador a 200% **não muda o viewport em px CSS de forma neutra**: ele dobra o tamanho de
renderização do px CSS **e** metade da largura em px CSS. Então:

- `1rem` renderiza com o dobro de pixels de dispositivo → o texto **cresce**;
- `5vw` fica com metade do valor em px CSS, renderizado com o dobro de pixels → **exatamente o mesmo tamanho de antes**.
  O texto **não cresce**.

Ou seja: **`vw` é imune ao zoom**. Se o `font-size` for `vw` puro, a pessoa pode ir a 500% e o texto continua igual.
Isso é a [Falha F94 do WCAG](https://www.w3.org/WAI/WCAG21/Techniques/failures/F94.html) contra o
[Critério de Sucesso 1.4.4 Resize Text (AA)](https://www.w3.org/WAI/WCAG21/quickref/#resize-text), que exige poder
ampliar até 200%.

Adrian Roselli ([*Responsive Type and Zoom*, dez 2019](https://adrianroselli.com/2019/12/responsive-type-and-zoom.html)):

> *"When people zoom a page, it is typically because they want the text to be bigger. When we anchor the text to the
> viewport size, even with a (fractional) multiplier, we can take away their ability to do that."*

## 3.3 A correção: termo em `rem` no valor variável

```css
/* ERRADO — vw puro, imune ao zoom */
font-size: clamp(1rem, 4vw, 3rem);

/* CERTO — o rem carrega parte da variação, e o rem responde ao zoom */
font-size: clamp(1rem, 0.5rem + 2.5vw, 3rem);
```

Com o termo `rem` presente, ampliar a página faz **a parte `rem` crescer**, mesmo com a parte `vw` congelada. Não é 100%
do crescimento, mas é crescimento real — e é a diferença entre passar e reprovar.

## 3.4 A regra quantitativa — e a discordância entre fontes

Maxwell Barvian ([*Addressing Accessibility Concerns With Using Fluid Type*, Smashing Magazine, nov 2023](https://www.smashingmagazine.com/2023/11/addressing-accessibility-concerns-fluid-type/))
estabelece:

> *"If the maximum font size is less than or equal to 2.5 times the minimum font size, then the text will always pass
> WCAG SC 1.4.4."*

**A derivação (que o artigo não escreve, mas é o que sustenta o número):** o pior caso é o texto começar no
`tamanhoMax` (janela larga). Ao ampliar para o zoom máximo, a largura em px CSS despenca e o `clamp` trava no
`tamanhoMin`; mas cada px CSS renderiza `Z×` maior. Tamanho aparente final = `Z · min`. Para passar, precisa de `≥ 2 · max`:

```
Z · min ≥ 2 · max    →    max ≤ (Z/2) · min
```

Com `Z = 5` (zoom máximo de 500% do Chrome) → `max ≤ 2,5 · min`.

**Discordância que encontrei.** Roselli documenta que **o Firefox trava em 300%**. Aplicando a mesma derivação com
`Z = 3`, o limite seguro cai para **`max ≤ 1,5 · min`** — muito mais restritivo que os 2,5× do Smashing.

**Qual vence, e por quê:** os dois estão certos dentro da própria premissa; o que muda é o `Z`. Como não dá para escolher
o navegador do usuário, **este relatório adota a razão conservadora de ~1,5× a 1,6×** para as escalas fluidas propostas
na §3.5. É um custo baixo — nenhuma das escalas do projeto precisa de mais que isso — e elimina a discussão.

Regras adicionais que valem sempre:

1. **Nunca aplique tipografia fluida ao corpo de texto.** Só a display (h1, h2, números grandes). O corpo em `rem` fixo é
   o que garante que a preferência de fonte do sistema funcione.
2. **O `min` do `clamp` tem que ser um tamanho legível de verdade** — se ele for 12px, ninguém "ganha" ao ampliar até lá.
3. **Teste.** Barvian: *"ensure you test thoroughly before using it in production"*. Roselli também. Método: 380px de
   largura, zoom no máximo do navegador, medir se o texto chega a 200% do original.

## 3.5 Escala fluida pronta para este projeto

Escala atual (`app/globals.css:37-40`), toda em `rem` fixo:

```css
--text-2xs: 0.75rem;   --text-xs: 0.875rem;  --text-sm: 1rem;
--text-base: 1.1875rem; --text-lg: 1.5rem;   --text-xl: 2rem;
--text-2xl: 2.75rem;   --text-3xl: 4rem;     --text-4xl: 6rem;
```

Diagnóstico a 380px: o `<h1>` (`text-3xl` = **64px**) e os `<h2>` (`text-2xl` = **44px**) são fixos. Com `px-5` (20px de
cada lado), sobram **340px** de conteúdo. 64px de Zodiak dá ~10 caracteres por linha. Funciona, mas é aperto máximo — e
qualquer título um pouco mais longo passa dos 6 caracteres/linha e o `text-wrap: balance` deixa de dar conta.

Só os três degraus grandes precisam virar fluidos. Os pequenos (2xs → lg) devem ficar fixos.

```css
@theme {
  /* … tokens pequenos inalterados … */

  /* --- degraus fluidos ------------------------------------------------
     Fórmula: clamp(min, intercepto_rem + inclinação_vw, max).
     O termo em rem é OBRIGATÓRIO: sem ele o zoom não move o texto (F94).
     Razão max/min mantida ≤ 1,6 para passar 1.4.4 até em Firefox (300%).
     -------------------------------------------------------------------- */

  /* 2rem (32px) @ 380px  →  2.75rem (44px) @ 1024px    razão 1,375 */
  --text-2xl: clamp(2rem, 1.5575rem + 1.86vw, 2.75rem);

  /* 2.5rem (40px) @ 380px  →  4rem (64px) @ 1024px      razão 1,600 */
  --text-3xl: clamp(2.5rem, 1.615rem + 3.73vw, 4rem);

  /* 4rem (64px) @ 1024px  →  6rem (96px) @ 1600px       razão 1,500 */
  --text-4xl: clamp(4rem, 0.444rem + 5.56vw, 6rem);
}
```

Conferência de cada um:

| token | em 380px | em 1024px | em 1600px |
|---|---|---|---|
| `--text-2xl` | `24,92 + 0,01863·380 = 32,0px` ✓ | `24,92 + 19,08 = 44,0px` ✓ | trava em 44px |
| `--text-3xl` | `25,84 + 0,03727·380 = 40,0px` ✓ | `25,84 + 38,16 = 64,0px` ✓ | trava em 64px |
| `--text-4xl` | trava em 64px | `7,11 + 0,05556·1024 = 64,0px` ✓ | `7,11 + 88,9 = 96,0px` ✓ |

> **Pegadinha de derivação que quase aconteceu aqui:** se você ancorar `--text-4xl` em `4rem @ 1024px → 6rem @ 1536px`, o
> intercepto dá **exatamente 0** (porque `64/1024 = 96/1536`), e o `clamp` vira `clamp(4rem, 6.25vw, 6rem)` — **`vw` puro,
> sem termo em `rem`**. Sempre confira se `b ≠ 0`. Se der 0, mude um dos pontos de ancoragem (foi por isso que 1536 virou
> 1600 acima).

**Efeito colateral a verificar:** `--text-3xl` e `--text-2xl` também alimentam os utilitários `text-3xl`/`text-2xl` do
Tailwind e nada mais — a busca no projeto mostra que só `h1`/`h2` os usam. Seguro.

**Alternativa em `cqi`.** Se um título fluido viver dentro de uma coluna (não é o caso hoje, mas será se o hero virar
duas colunas), troque `vw` por `cqi` no contêiner apropriado. A matemática é idêntica; muda só o denominador.
**Atenção:** `cqi` tem o mesmo problema de zoom que `vw` — o termo em `rem` continua obrigatório.

---

# 4. Grid moderno

## 4.1 A receita e por que o `min()` interno é obrigatório

```css
.grade {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
}
```

**O que acontece sem o `min()`:**

`minmax(18rem, 1fr)` diz: *"a trilha nunca é menor que 18rem"*. `18rem` é uma **largura fixa** — não um mínimo relativo.
Quando o contêiner mede menos que 18rem (288px), a trilha continua com 288px e o grid **estoura**. A 380px de janela com
`px-5`, o conteúdo tem 340px — ainda cabe. Mas com `px-8` num nível interno, ou num aparelho de 320px, quebra.

**O que o `min(100%, 18rem)` faz:** `100%` resolve contra a largura da caixa de conteúdo do contêiner de grid. Quando o
contêiner é largo, `18rem` é o menor dos dois e vence → trilhas de no mínimo 288px. Quando o contêiner encolhe abaixo de
288px, `100%` passa a ser o menor e vence → a trilha vira exatamente a largura do contêiner. **Zero estouro, em qualquer
largura, sem media query.**

Fontes:
[CSSWG issue #4043 — *[css-grid] Overflow with auto-repeat and minmax()*](https://github.com/w3c/csswg-drafts/issues/4043) ·
[9elements — *Building a Rock Solid Auto Grid*](https://9elements.com/blog/building-a-rock-solid-auto-grid/) ·
[MDN — grid-template-columns](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-columns).

## 4.2 `auto-fit` vs `auto-fill`

A diferença só aparece **quando sobra espaço** — ou seja, quando há menos itens do que trilhas caberiam.

| | `auto-fill` | `auto-fit` |
|---|---|---|
| trilhas vazias | **são criadas e ocupam espaço** | são criadas e depois **colapsam para 0** |
| efeito com 2 itens numa linha de 5 trilhas | os 2 itens ficam com 1/5 da largura cada, e sobram 3 buracos | os 2 itens **esticam** e dividem a linha inteira |

```css
/* dois cards ficam estreitos, alinhados como se houvesse cinco */
grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));

/* dois cards esticam e preenchem a linha */
grid-template-columns: repeat(auto-fit,  minmax(min(100%, 18rem), 1fr));
```

Fonte: [CSS-Tricks — *Auto-Sizing Columns in CSS Grid: auto-fill vs auto-fit*](https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/).

**Qual escolher:** `auto-fit` quando os itens devem preencher a linha (galeria, cards de serviço). `auto-fill` quando o
ritmo da grade importa mais que o preenchimento (um item novo deve entrar exatamente na próxima "casa", sem os antigos
mudarem de tamanho).

## 4.3 O outro estouro: `1fr` não é `minmax(0, 1fr)`

Essa é a causa de estouro de grid mais comum e a menos óbvia. `1fr` é açúcar para `minmax(auto, 1fr)`. O `auto` de
mínimo, num item de grid, resolve para **min-content** — o menor tamanho indivisível do conteúdo. Se o conteúdo tem uma
URL de 400px sem espaço, ou um `<pre>`, ou um trilho `overflow-x: auto`, a trilha **não encolhe abaixo disso** e o grid
estoura.

```css
/* estoura se o conteúdo da segunda coluna tiver algo indivisível */
grid-template-columns: 248px 1fr;

/* não estoura */
grid-template-columns: 248px minmax(0, 1fr);
```

Este projeto **já faz isso certo** em `app/page.tsx:216` e `:301` (`lg:grid-cols-[minmax(0,13rem)_1fr]`,
`lg:grid-cols-[minmax(0,15rem)_1fr]`) — vale documentar por quê, para não perderem na próxima refatoração.

## 4.4 `subgrid`

Faz o item de grid herdar as linhas do grid pai, em vez de criar linhas próprias. Serve para alinhar **as partes
internas** de cards irmãos (todos os títulos na mesma altura, todos os botões na mesma linha de base), coisa que nenhum
truque de flexbox resolve bem.

```css
.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 1rem;
}

.card {
  display: grid;
  grid-template-rows: subgrid;   /* herda as linhas da linha do pai */
  grid-row: span 4;              /* declare quantas linhas você ocupa */
  gap: 0;
}
/* agora foto, código, título e descrição de TODOS os cards
   se alinham entre si, mesmo com textos de tamanhos diferentes */
```

Requisito que confunde: o item precisa **declarar quantas linhas ocupa** (`grid-row: span N`) e o pai precisa ter essas
linhas definidas (`grid-template-rows: auto auto auto auto` ou `repeat(4, auto)`).

**Suporte HOJE — Baseline: Widely available desde 15 de março de 2026.**
Fonte: [Web Platform Features Explorer — subgrid](https://web-platform-dx.github.io/web-features-explorer/features/subgrid/) (consultado em 5 ago 2026).

| navegador | versão | data |
|---|---|---|
| Firefox | 71 | 10 dez 2019 |
| Safari / Safari iOS | 16 | 12 set 2022 |
| Chrome / Chrome Android | 117 | 12 set 2023 |
| Edge | 117 | 15 set 2023 |

Widely available há ~5 meses. Seguro, mas ainda é o mais novo dos recursos deste relatório. Como o efeito é puramente de
alinhamento, degrada bem sozinho — sem subgrid, os cards só ficam com alturas internas diferentes.

## 4.5 O que fazer neste projeto

**Nada, por enquanto, nos cards de serviço.** `app/page.tsx:196` usa `md:grid-cols-3` com exatamente 3 itens
(`DESTAQUE_LED`). `auto-fit` só ganha de `grid-cols-3` quando a contagem é variável. Trocar agora seria complexidade sem
benefício.

**Vale se e quando** a contagem de destaques virar dado editável. Aí:

```html
<div class="mt-14 grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
```

**Vale hoje** o `subgrid` nesses 3 cards: eles têm `flex-col` com `flex-1` na descrição (`CardServico.tsx`), o que
alinha o link do rodapé mas **não** alinha o título entre cards com nomes de 1 e de 2 linhas. Ver §"O QUE APLICAR", item 9.

---

# 5. Overflow horizontal

## 5.1 Como diagnosticar sistematicamente

### Passo 0 — confirmar que existe estouro

```js
const d = document.documentElement;
console.log(d.scrollWidth > d.clientWidth
  ? `ESTOURA ${d.scrollWidth - d.clientWidth}px`
  : 'sem estouro horizontal');
```

### Passo 1 — o script que acha o culpado

O script clássico do CSS-Tricks/Shadeed lista *todos* os elementos mais largos que o documento — e num site real isso
devolve 40 elementos, dos quais 39 são filhos do único culpado. Esta versão devolve só o **culpado mais raso**, ignora
`position: fixed` (que não gera scroll do documento) e destaca visualmente:

```js
(() => {
  const limite = document.documentElement.clientWidth;
  const suspeitos = [];

  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;            // invisível
    const est = getComputedStyle(el);
    if (est.position === 'fixed') return;                    // não gera scroll
    if (est.visibility === 'hidden' || est.display === 'none') return;
    if (r.right > limite + 1 || r.left < -1) {
      suspeitos.push({
        el,
        esq: Math.round(r.left),
        dir: Math.round(r.right),
        sangra: Math.round(Math.max(r.right - limite, 0) + Math.max(-r.left, 0)),
        tag: el.tagName.toLowerCase() + (el.className
              ? '.' + String(el.className).split(/\s+/).slice(0, 3).join('.')
              : ''),
      });
    }
  });

  // fica só quem NÃO tem um ancestral já listado: o culpado de verdade
  const raiz = suspeitos.filter(
    (c) => !suspeitos.some((o) => o !== c && o.el.contains(c.el)),
  );

  console.table(raiz.map(({ tag, esq, dir, sangra }) => ({ tag, esq, dir, sangra })));
  raiz.forEach((c) => { c.el.style.outline = '3px solid magenta'; });
  return raiz.map((c) => c.el);
})();
```

### Passo 2 — se o passo 1 não achar nada

Estouro sem elemento "largo demais" quase sempre é **um contêiner rolando por dentro**. Este script acha:

```js
document.querySelectorAll('body *').forEach((el) => {
  if (el.scrollWidth > el.clientWidth + 1) {
    console.log(el, `scrollWidth ${el.scrollWidth} > clientWidth ${el.clientWidth}`);
  }
});
```

(Falsos positivos esperados e legítimos: o `.trilho` do `Palco`, que é `overflow-x-auto` de propósito.)

### Passo 3 — bissecção manual

Se ainda assim não achar, o método bruto funciona sempre: no DevTools, delete elementos de nível superior um a um até a
barra sumir; devolva com Ctrl+Z e desça um nível dentro do último deletado.

### Passo 4 — DevTools

**Firefox tem o melhor recurso disponível para isso:** no Inspetor, elementos que causam estouro recebem um badge
**`overflow`**, e é possível clicar para ir direto ao filho que está estourando. Chrome e Safari não têm equivalente.
Vale abrir o site no Firefox só para essa checagem. Fonte:
[Ahmad Shadeed — *A Guide To CSS Debugging*, Smashing Magazine](https://www.smashingmagazine.com/2021/10/guide-debugging-css/).

### Passo 5 — o truque do contorno (para ver, não para achar)

```js
document.querySelectorAll('*').forEach((el) => {
  el.style.outline = '1px solid #' + ((Math.random() * 0xffffff) | 0).toString(16).padStart(6, '0');
});
```

`outline` e não `border`: `outline` não ocupa espaço e não altera o layout que você está diagnosticando.
Fonte: [Polypane — *How to find the cause of horizontal scrollbars*](https://polypane.app/blog/strategies-for-dealing-with-horizontal-overflows/).

## 5.2 Causa: `100vw` com barra de rolagem

Já explicado em §2.5. Resumo operacional:

```css
/* ERRADO no desktop com scrollbar clássica */
.sangria { width: 100vw; }

/* CERTO — a mais simples, quando o elemento já é filho direto do fluxo */
.sangria { width: 100%; }

/* CERTO — quando precisa mesmo furar o contêiner */
body { container-type: inline-size; }
.sangria { width: 100vw; width: 100cqw; }
```

**Neste projeto:** `components/MenuLiquido.tsx:84` usa `min(17rem, calc(100vw - 1.5rem))`. Risco **baixo**, porque o
componente é `lg:hidden` — nunca aparece em desktop, e mobile não tem scrollbar clássica. Não é urgente. Mas ver §5.3.

## 5.3 Causa: `left-1/2 + translate`

O padrão de centralização:

```css
.centrado { position: absolute; left: 50%; transform: translateX(-50%); }
```

**Por que estoura:** o elemento é primeiro posicionado com a borda esquerda no meio do pai (já 50% para fora à direita) e
só depois puxado de volta. Se ele for **mais largo que o pai**, o `translate(-50%)` não devolve o suficiente, e a caixa
transformada continua contribuindo para a região de overflow rolável do ancestral. Transform **não** é só pintura: caixas
transformadas entram no cálculo de scrollable overflow.

Substitutos que não estouram:

```css
/* 1. o mais robusto: amarra os dois lados */
.centrado { position: absolute; inset-inline: 0; margin-inline: auto; width: max-content;
            max-width: 100%; }

/* 2. quando o pai é grid */
.pai { display: grid; }
.centrado { grid-area: 1 / 1; justify-self: center; max-width: 100%; }

/* 3. mantendo o padrão antigo, mas travando o crescimento */
.centrado { left: 50%; transform: translateX(-50%); max-width: calc(100% - 2rem); }
```

**Neste projeto** o comentário em `MenuLiquido.tsx:71-72` mostra que essa armadilha **já foi encontrada e corrigida**
(`inset-x-3` no lugar de `left-1/2 + translate`, porque a 380px "a raiz media 393px e cortava a pílula"). O padrão
continua vivo em `MenuLiquido.tsx:97` no círculo decorativo (`left-1/2 … width: 220% … x: '-50%'`), mas ali está dentro de
`overflow-hidden` no `motion.div` pai — está contido. **OK.**

**Pendência a verificar a 380px:** a linha do menu é `fixed inset-x-3 … flex … gap-2.5` com dois filhos. Quando aberta,
a soma é: pílula `min(17rem, calc(100vw − 1.5rem))` = **272px** + `gap-2.5` = **10px** + pílula do WhatsApp
(`px-4` = 32px + texto mono 12px/8 chars com `tracking-[0.14em]` ≈ 75px + borda 2px) ≈ **109px** → **391px**. O espaço
disponível é `380 − 24` (`inset-x-3`) = **356px**. Sobram 35px de conflito. Como o contêiner é `position: fixed`, isso
**não gera barra de rolagem no documento** — mas o flex vai encolher a pílula do menu (ela não tem `shrink-0`) e o painel
morfado sai menor que os 17rem que a animação pede. Sintoma: os rótulos das seções podem quebrar de linha dentro do painel.
**Confirmar visualmente a 380px com o menu aberto.**

## 5.4 Causa provável neste projeto: `LequeEquipe` (o achado mais importante)

`components/LequeEquipe.tsx` posiciona os cards do leque com GSAP:

```js
const multLargura = (w) => w < 480 ? 0.28 : w < 640 ? 0.38 : w < 768 ? 0.5 : w < 1024 ? 0.75 : 1;
// …
const mw = multLargura(window.innerWidth);
gsap.to(el, { x: `${x * mw}rem`, … });   // x ∈ [-30, 30] vindo de LEQUE[]
```

**Conta a 380px de janela:**

| | valor |
|---|---|
| `multLargura(380)` | `0,28` |
| deslocamento do card extremo | `30 × 0,28 = 8,4rem = ` **134px** |
| largura do card (`.leque-card`) | `11rem = ` **176px** |
| altura do card (`aspect-ratio: 628/793`) | `176 × 793/628 = ` **222px** |
| escala do card extremo (`LEQUE[0].escala`) | `0,7756` → 136,5 × 172px |
| rotação do card extremo | `±21°` |
| meia-largura da caixa girada | `(136,5/2)·cos21° + (172/2)·sin21° = 63,7 + 30,8 = ` **94,5px** |
| borda direita, a partir do centro | `134 + 94,5 = ` **228,5px** |
| meia-largura disponível (`380 − px-5×2 = 340`) | **170px** |
| **sangria de cada lado** | **≈ 58,5px** |

**Conta a 1280px de janela:**

| | valor |
|---|---|
| `multLargura(1280)` | `1` |
| deslocamento do card extremo | `30rem = ` **480px** |
| largura do card | `16rem = ` **256px** → escalado 0,7756 ≈ 199px |
| borda direita, a partir do centro da coluna | `480 + ~110 = ` **~590px** |
| meia-largura da coluna (`(1088 − 80)/2 = 504` → metade **252px**) | **252px** |
| **sangria de cada lado** | **≈ 338px** |

**Nada clipa isso.** A cadeia é `.leque` (sem overflow) → `Reveal` → `<div class="grid lg:grid-cols-2">` →
`Secao#sobre` (`border-t border-rule`, sem overflow) → `<div class="tecnico">` (sem overflow) → `<body>`.

**Predição:** barra de rolagem horizontal na página inteira assim que a seção "A casa" entra na tela — nos dois extremos
de largura. **Esta é uma predição calculada, não uma observação.** Rode o script da §5.1 **na seção `#sobre`, depois de
rolar até ela** (o leque só se posiciona depois que o `IntersectionObserver` dispara) para confirmar.

Três correções possíveis, da mais barata à mais correta:

```css
/* A — contenção imediata (1 linha). Clipa a sangria sem criar scroll container. */
.leque { overflow-x: clip; }
```
Cuidado: `clip` corta os cards das pontas. Aceitável se a geometria for decorativa; ruim se os cards das pontas mostram
rostos da equipe (mostram).

```css
/* B — reduzir o alcance do leque e amarrá-lo ao contêiner */
.leque-wrap { container-type: inline-size; }
.leque-wrap .leque { --alcance: min(30cqi, 12rem); }
```
…e no JS trocar `x * mw` por `calc(var(--alcance) * ${x / 30})`.

```css
/* C — a correta: o JS mede o CONTÊINER, não a janela */
```
```js
// substitui window.innerWidth por ResizeObserver no wrapper
const [larguraCont, setLarguraCont] = useState(0);
useEffect(() => {
  const el = ref.current;
  if (!el) return;
  const ro = new ResizeObserver(([e]) => setLarguraCont(e.contentRect.width));
  ro.observe(el);
  return () => ro.disconnect();
}, []);

// e o multiplicador passa a derivar da largura real disponível:
//   alcance máximo = (larguraCont/2 − meiaLarguraCardGirado) / 30rem-em-px
```
C é a única que resolve os dois extremos (380px e desktop em coluna) de uma vez. É também a que o briefing descreve como
"container query" — só que na versão JS, porque o posicionamento é JS.

## 5.5 Causa: palavras longas e conteúdo indivisível

```css
/* o mínimo defensivo, em qualquer texto vindo de dado */
.texto { overflow-wrap: break-word; }

/* quebra também dentro de palavras quando não há alternativa (URLs, e-mails) */
.url { overflow-wrap: anywhere; }

/* último recurso, quebra em qualquer caractere — piora a leitura */
.forcado { word-break: break-all; }
```

`overflow-wrap: break-word` só quebra a palavra **se ela sozinha não couber**. `anywhere` também permite que a palavra
longa influencie o cálculo de `min-content`, o que é justamente o que salva grid e flex.

**Neste projeto:**
- `app/page.tsx:414` já usa `break-all` no e-mail. Funciona, mas `overflow-wrap: anywhere` (`wrap-anywhere` no Tailwind
  v4) daria quebra mais legível — quebra na arroba/ponto antes de partir a palavra ao meio.
- **Faltando:** `app/page.tsx:307-318`, a `<ul>` de nomes do rider. São 116 nomes de artistas vindos de dados. Um nome
  longo ("Banda XYZ do Forró Pé de Serra") num `<li class="flex items-center gap-3">` dentro de
  `<ul class="flex flex-wrap">` — os `<li>` são itens de flex e **não encolhem abaixo do min-content** (§5.7). A 380px isso
  é candidato real a estouro. Correção: `overflow-wrap: break-word` no `<span>` do nome, ou `min-w-0` no `<li>`.

## 5.6 Causa: `overflow: hidden` no lugar de `overflow: clip` (bug ativo no projeto)

Diferença que quase ninguém sabe: **`overflow: hidden` cria um scroll container; `overflow: clip` não.**

`hidden` significa "é rolável, mas sem barra e sem gesto do usuário" — `scrollTo()`, `scrollLeft` e a rolagem por foco de
teclado continuam funcionando. `clip` significa "corte e pronto; não é rolável de forma nenhuma".

**A consequência que morde:** `position: sticky` usa o **scrollport mais próximo** como referência. Se um ancestral tem
`overflow: hidden`, esse ancestral vira o scrollport. Como ele não rola de verdade (o conteúdo cabe), o sticky **nunca
gruda** — fica parado na posição estática, sem erro no console, sem aviso.

Fontes: [MDN — overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow) ·
[Terluin Webdesign — *position: sticky not working? Try overflow: clip, not overflow: hidden*](https://www.terluinwebdesign.nl/en/blog/position-sticky-not-working-try-overflow-clip-not-overflow-hidden/) ·
[Bram.us — *Scroll-Driven Animations: You want `overflow: clip`, not `overflow: hidden`*](https://www.bram.us/2024/02/14/scroll-driven-animations-you-want-overflow-clip-not-overflow-hidden/).

**Ocorrência neste projeto:**

```tsx
// app/page.tsx:185
<Secao id="servicos" className="relative overflow-hidden">
  …
  // app/page.tsx:217 — dentro dela
  <div className="lg:sticky lg:top-8 lg:self-start">
    <h3>{b.titulo}</h3>
```

O `overflow-hidden` está lá para clipar o `<Haze />` e o `.luz` do `LuzCursor`. Mas ele torna a `<section>` o scrollport
dos cinco cabeçalhos de bloco — **e os `lg:sticky` não grudam.** Correção de uma palavra:

```tsx
<Secao id="servicos" className="relative overflow-clip">
```

`overflow-clip` clipa igual, nos dois eixos, e **não** cria scroll container. Baseline widely available desde
**12 de março de 2025** ([Web Platform Features Explorer — overflow-clip](https://web-platform-dx.github.io/web-features-explorer/features/overflow-clip/)):
Firefox 81 (22 set 2020), Chrome/Edge 90 (13 abr 2021), Safari 16 (12 set 2022).

O mesmo vale, por consistência, para `#casamento` (`app/page.tsx:104`) e o `<header>` do hero (`:28`) — nenhum dos dois tem
sticky dentro hoje, mas a troca é gratuita e evita a armadilha na próxima edição.

> **Nota:** `overflow-clip-margin` (que permite sangrar N pixels antes de clipar) é outra coisa e **não** é Baseline —
> o MDN a marca como não-Baseline por falta de suporte em navegadores amplamente usados. Não use.

## 5.7 Causa: `min-width: auto` em filhos de flex e de grid

Por especificação, um item de flex tem `min-width: auto`, que resolve para o **automatic minimum size** — na prática, o
`min-content` do conteúdo. Item de grid tem a mesma regra. Efeito: **eles se recusam a encolher abaixo do conteúdo**, e
estouram o pai em vez de truncar.

Especificação: [CSS Flexbox 1 §4.5 *Automatic Minimum Size of Flex Items*](https://www.w3.org/TR/css-flexbox-1/#min-size-auto) ·
[CSS Grid 1 §6.6 *Automatic Minimum Size of Grid Items*](https://www.w3.org/TR/css-grid-1/#min-size-auto).

```css
/* filho de flex que precisa truncar/quebrar */
.item { min-width: 0; }

/* trilha de grid que precisa poder encolher */
.grade { grid-template-columns: 14rem minmax(0, 1fr); }

/* eixo block (colunas em flex-direction: column) */
.item-vertical { min-height: 0; }
```

Em Tailwind: `min-w-0`, `min-h-0`, e `grid-cols-[minmax(0,1fr)]`.

**Neste projeto:** `components/CardServico.tsx:132` já tem `<span className="min-w-0">` no meio da `.linha` — correto e
pelo motivo certo (a `.linha` é `grid-template-columns: 4.5rem 1fr auto`). Os `minmax(0, …)` das §4.3 também. Só falta
o caso da `<ul>` de nomes do rider (§5.5).

## 5.8 Tabela-resumo das causas

| causa | sintoma | correção |
|---|---|---|
| `100vw` com scrollbar clássica | ~15px de estouro só em desktop | `100%` ou `100cqw` |
| `left: 50% + translateX(-50%)` num filho mais largo que o pai | estouro à direita | `inset-inline: 0; margin-inline: auto` |
| palavra/URL indivisível | estouro em 1 elemento de texto | `overflow-wrap: break-word` / `anywhere` |
| `<img>` sem `max-width` | estouro do tamanho da imagem | `img { max-width: 100%; height: auto }` — **já está em `globals.css:120`** ✓ |
| `1fr` com conteúdo indivisível | trilha não encolhe | `minmax(0, 1fr)` |
| filho de flex/grid com `min-width: auto` | item não encolhe | `min-width: 0` |
| `minmax(18rem, 1fr)` sem `min()` | estouro abaixo de 288px | `minmax(min(100%, 18rem), 1fr)` |
| decoração `position: absolute` fora da caixa | estouro invisível | `overflow: clip` no pai |
| `position: fixed` largo demais | **não** gera scroll de documento; só sobrepõe/aperta | corrigir com `inset-inline` + `max-width` |

---

# 6. `env(safe-area-inset-*)` e o iPhone

## 6.1 O que é e o pré-requisito

`env()` injeta variáveis de ambiente definidas pelo user-agent. As quatro que importam:
`safe-area-inset-top | right | bottom | left`. Valem `0px` em viewport retangular e `> 0px` quando há notch, Dynamic
Island, indicador de home, cantos arredondados ou teclado.

```css
/* sintaxe, com fallback obrigatório em navegador que não define a variável */
padding-block-end: env(safe-area-inset-bottom, 0px);
```

**Pré-requisito absoluto:** sem `viewport-fit=cover` no meta viewport, o navegador **nunca** deixa o conteúdo entrar na
área insegura, e todos os `safe-area-inset-*` retornam `0`. O MDN é explícito ao recomendar as variáveis de safe area
**junto** com `cover`.

Fontes: [MDN — env()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) ·
[MDN — `<meta name="viewport">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport).

**Neste projeto já está certo** (`app/layout.tsx:30-35`):

```ts
export const viewport: Viewport = {
  themeColor: '#09090B',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',   // ✓
}
```

Valores de `viewport-fit`: `auto` (padrão, não altera o viewport de layout) · `contain` (o viewport cabe no maior
retângulo inscrito) · `cover` (o viewport preenche a tela — e aí as safe areas passam a valer).

## 6.2 A pegadinha do iOS 15+: `safe-area-inset-bottom` volta 0

O bug que mais quebra barra fixa no rodapé:

| iOS | toolbar superior escondida | retrato | paisagem |
|---|---|---|---|
| 14 | sim | 34px | 21px |
| **15+** | sim | **0px** | **0px** |

O indicador de home **continua na tela**, mas o Safari reporta `0`. Barra fixa no rodapé calculada só com
`env(safe-area-inset-bottom)` **cola no indicador de home** exatamente quando a pessoa está rolando.

Fonte: [Apple Developer Forums — *Safari returns 0 for --safe-area-inset-bottom when the toolbar is hidden*](https://developer.apple.com/forums/thread/716552)
(reportado set 2022; sem resposta oficial da Apple; ainda reproduzível em iOS 16 segundo a própria thread).

**A correção padrão é `max()`** — um piso literal que sobrevive ao 0:

```css
padding-block-end: max(env(safe-area-inset-bottom), 1.5rem);
```

**Neste projeto o `max()` já existe** em `globals.css:466` (`.navbar`, morta), `:512` (`.folha`, morta) e no vivo
`components/MenuLiquido.tsx:75`:

```tsx
bottom-[max(1rem,env(safe-area-inset-bottom))]
```

**O problema que sobra:** o piso é `1rem` = **16px**, e o indicador de home mede **34px**. Quando o bug dispara, o menu
sobe só 16px — fica 18px **dentro** da zona do indicador. Numa barra que é a única conversão da página, isso significa
toques perdidos. **Subir o piso para `1.5rem` (24px) ou `2rem` (32px).**

## 6.3 `safe-area-max-inset-*` — a solução que ainda não serve

O MDN documenta `safe-area-max-inset-top | right | bottom | left`: os valores **máximos estáticos**, com toda a UI
dinâmica retraída. Seria exatamente o remédio para o bug da §6.2 — um valor constante que não some.

**Suporte: só Chromium.** Sem Safari (nem no iOS) e sem Firefox — ou seja, **não resolve o bug**, que é do Safari.
Versões exatas de envio: **não confirmado**. Se usar, use sempre com fallback aninhado, e mantenha o `max()`:

```css
padding-block-end: max(
  env(safe-area-max-inset-bottom, env(safe-area-inset-bottom, 0px)),
  1.5rem
);
```

Fonte: [MDN — env()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) ·
[Polypane — *Using safe-area-inset to build mobile-safe layouts*](https://polypane.app/blog/using-safe-area-inset-to-build-mobile-safe-layouts/).

## 6.4 O que quebra numa barra fixa no rodapé — checklist

**(a) A barra invade o indicador de home.** Corrigido por §6.2. ✓ parcialmente no projeto.

**(b) O conteúdo termina embaixo da barra.** Precisa de padding no fim do documento igual à altura total ocupada.

```css
/* HOJE — globals.css:488-491 */
@media (max-width: 1023px) {
  html { scroll-padding-block-end: 6rem; }
  body { padding-block-end: 6rem; }
}
```

`6rem` = 96px é um número mágico. A altura real é `h-13` do menu (3,25rem = 52px) + o `bottom` (`max(1rem, safe-area)`).
Com indicador de home: `52 + 34 = 86px`. Sem: `52 + 16 = 68px`. Os 96px cobrem, mas por sorte — qualquer mudança de altura
do menu quebra silenciosamente. Derive:

```css
:root {
  --menu-altura: 3.25rem;                                   /* h-13 do MenuLiquido */
  --menu-folga: max(env(safe-area-inset-bottom), 1.5rem);   /* o piso da §6.2 */
  --menu-total: calc(var(--menu-altura) + var(--menu-folga) + 1rem); /* +1rem de respiro */
}

@media (max-width: 1023px) {
  html { scroll-padding-block-end: var(--menu-total); }
  body { padding-block-end:        var(--menu-total); }
}
```

E no `MenuLiquido.tsx`, trocar o valor arbitrário por `bottom-[var(--menu-folga)]` — assim há **uma** fonte de verdade.

**(c) A âncora para embaixo da barra.** `scroll-padding-block-end` resolve, e já existe. ✓

**(d) O `100vh`/`100svh` conta a barra fixa.** Não conta — `position: fixed` sai do fluxo. É por isso que (b) existe.

**(e) O teclado virtual sobe e cobre a barra.** Não afeta este projeto (não há `<input>`), mas para registro:

```html
<meta name="viewport" content="…, interactive-widget=resizes-content">
```

Valores: `resizes-visual` (**padrão** — só o viewport visual encolhe; a barra fixa fica escondida atrás do teclado) ·
`resizes-content` (o viewport de layout encolhe; a barra fixa sobe junto) · `overlays-content` (nada encolhe).
Suporte: adicionado em 2023 no Chromium; Firefox tem [bug aberto #1831649](https://bugzilla.mozilla.org/show_bug.cgi?id=1831649);
status no Safari **não confirmado**. Fonte: [MDN — meta viewport](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport).

**(f) Barra lateral em paisagem no iPhone com notch.** Se algum dia a barra virar horizontal em landscape:

```css
.barra {
  padding-inline: max(env(safe-area-inset-left), 1rem) max(env(safe-area-inset-right), 1rem);
}
```

## 6.5 Suporte HOJE

**Baseline: Widely available desde 15 de julho de 2022.**
Fonte: [Web Platform Features Explorer — safe-area-inset](https://web-platform-dx.github.io/web-features-explorer/features/safe-area-inset/) (consultado em 5 ago 2026).

| navegador | versão | data |
|---|---|---|
| Safari iOS | 11.3 | 29 mar 2018 |
| Safari (macOS) | 11.1 | 12 abr 2018 |
| Chrome / Chrome Android | 69 | 4 set 2018 |
| Firefox / Firefox Android | 65 | 29 jan 2019 |
| Edge | 79 | 15 jan 2020 |

---

# 7. `text-wrap: balance` e `pretty`

## 7.1 `balance` — equilibrar as linhas de um título

Distribui os caracteres entre as linhas para que fiquem com comprimentos parecidos, eliminando a "linha órfã de duas
palavras" embaixo de um título de três linhas.

```css
h1, h2, h3, blockquote, figcaption { text-wrap: balance; }
```

**Os limites, e eles são diferentes por motor:**

| motor | limite |
|---|---|
| **Chromium** | **6 linhas.** Acima disso o `balance` é **ignorado silenciosamente** |
| **Firefox** | 10 linhas |
| **WebKit** | **sem limite** — "every line will be balanced with all of the others" |

Fontes: [Chrome for Developers — *CSS text-wrap: balance*](https://developer.chrome.com/docs/css-ui/css-text-wrap-balance)
("it only works for six wrapped lines and under") ·
[MDN — text-wrap-style](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style) (6 no Chromium, 10 no Firefox) ·
[WebKit — *Better typography with text-wrap pretty*](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/).

O limite existe por custo: o motor precisa iterar larguras até achar o ponto de equilíbrio. Com o teto de 6 linhas, o
custo é desprezível — mas **só** com o teto. O Chrome avisa explicitamente para **não** fazer `* { text-wrap: balance }`.

Outras pegadinhas do `balance`:
- **não muda o `inline-size` do elemento** — só quebra as linhas dentro da largura que já existe. Não é "shrink to fit";
- é ignorado com `white-space: nowrap` e com `display: -webkit-box` + `-webkit-line-clamp`;
- a 380px, um `<h1>` de 64px quebra em ~4 linhas — dentro do limite. Se a fonte crescer ou o texto aumentar e passar de 6,
  o `balance` **para de funcionar sem avisar**. Mais um argumento a favor da tipografia fluida da §3.5, que reduz as
  linhas a 3.

**Suporte HOJE — Baseline: Newly available desde 13 de maio de 2024.** Previsão de Widely available: **13 de novembro de 2026**.
Fonte: [Web Platform Features Explorer — text-wrap-balance](https://web-platform-dx.github.io/web-features-explorer/features/text-wrap-balance/) (consultado em 5 ago 2026).

| navegador | versão | data |
|---|---|---|
| Chrome / Chrome Android | 114 | 30 mai 2023 |
| Edge | 114 | 2 jun 2023 |
| Firefox / Firefox Android | 121 | 19 dez 2023 |
| Safari / Safari iOS | 17.5 | 13 mai 2024 |

**Neste projeto já está aplicado** em `globals.css:104-107` (`h1, h2` e `h3`). Correto e no lugar certo.

## 7.2 `pretty` — cuidar do fim do parágrafo

Algoritmo mais lento que prioriza qualidade tipográfica sobre velocidade. Objetivos: eliminar a **órfã** (última linha com
uma palavra só), reduzir hifenização em sequência e melhorar o *rag* (o perfil da borda direita).

```css
p, li, dd { text-wrap: pretty; }
```

**As implementações são diferentes:**

| motor | escopo |
|---|---|
| **Chromium** | ajusta **só as últimas 4 linhas** do parágrafo. Foco em evitar última linha curta |
| **WebKit** | avalia **o parágrafo inteiro**. Trata órfã, rag e hifenização |
| **Firefox** | **não suporta** |

Fontes: [Chrome for Developers — *CSS text-wrap: pretty*](https://developer.chrome.com/blog/css-text-wrap-pretty) ·
[WebKit — *Better typography with text-wrap pretty*](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/).

Sobre desempenho, a WebKit é a mais concreta: o custo escala com o **comprimento do parágrafo**, não com a contagem de
elementos, e o texto precisaria ter "many hundreds or thousands of lines" para pesar. Para parágrafos de site, o custo é
irrelevante. **Nota:** a página do Chrome sobre `pretty` **não** apresenta números de custo, e o MDN o classifica como
tendo "negative effect on performance". Onde as duas discordam, vence a WebKit — porque quantifica o mecanismo (custo por
parágrafo, não global) enquanto o MDN faz uma afirmação genérica. Na prática, a decisão não muda: use em `p`, nunca em `*`.

**Suporte HOJE — Baseline: Limited availability.** Bloqueado pelo Firefox.
Fonte: [Web Platform Features Explorer — text-wrap-pretty](https://web-platform-dx.github.io/web-features-explorer/features/text-wrap-pretty/) (consultado em 5 ago 2026).

| navegador | versão | data |
|---|---|---|
| Chrome / Chrome Android | 117 | 12 set 2023 |
| Edge | 117 | 15 set 2023 |
| Safari / Safari iOS | 26 | 15 set 2025 |
| Firefox | — | **não suporta** (posição "positive", sem data) |

**Verifiquei também** as notas de versão do [Chrome 137](https://developer.chrome.com/release-notes/137): **não há**
menção a mudança no algoritmo do `text-wrap: pretty`. Se você viu essa afirmação em algum lugar, trate como **não
confirmada**.

**Por que aplicar mesmo com Firefox de fora:** é enriquecimento progressivo puro. Onde não há suporte, a declaração é
descartada no parse e o texto quebra como sempre quebrou. Zero risco, zero fallback, zero custo. E cobre **todo** o
tráfego real deste projeto (WebView do Instagram no iOS = WebKit; no Android = Chromium).

## 7.3 Quando usar cada um

| | `balance` | `pretty` |
|---|---|---|
| objetivo | linhas de comprimento parecido | último(s) fim(ns) de linha decentes |
| onde | `h1`–`h6`, `blockquote`, `figcaption`, `.eyebrow`, rótulo de botão de 2 linhas | `p`, `li`, `dd`, corpo de FAQ |
| tamanho ideal | 2 a 6 linhas | 3+ linhas |
| custo | desprezível (teto de linhas) | proporcional ao parágrafo |
| **nunca** | em corpo de texto longo (passa do teto e vira no-op) | em `*` |

```css
/* a receita completa e conservadora */
h1, h2, h3, h4, blockquote, figcaption, .eyebrow, summary { text-wrap: balance; }
p, li, dd, details > p                                    { text-wrap: pretty;  }
```

Em Tailwind v4: `text-balance` e `text-pretty`.

---

# 8. Breakpoints

## 8.1 O argumento contra a escala fixa

**1. Larguras de aparelho são um alvo móvel.** A escala `sm/md/lg/xl/2xl` do Tailwind (40/48/64/80/96rem) não descreve
aparelho nenhum em particular — são números redondos herdados do Bootstrap. Nunca houve um "tablet de 768px" canônico, e
hoje há menos ainda: dobráveis, split-screen do iPad, janelas de desktop redimensionadas, WebView do Instagram com
altura própria.

**2. Breakpoint de janela mede a coisa errada.** O que quebra o layout é a largura **do componente**, não a da janela.
Um card dentro de `lg:grid-cols-2` tem metade da largura da janela — mas a media query em 1024px não sabe disso. É
exatamente o bug do `.leque` (§1.4 e §5.4).

**3. `rem` no breakpoint, não `px`.** Josh Comeau defende `rem` porque quem aumenta o tamanho de fonte padrão do
navegador recebe, com `px`, o layout apertado do desktop com texto grande. Tailwind v4 já usa `rem` na escala padrão. ✓

## 8.2 A abordagem certa

Stephen Hay, citado por toda a comunidade desde 2012:

> *"Start with the small screen first, then expand until it looks like shit. Time for a breakpoint!"*

Brad Frost formaliza em [*7 Habits of Highly Effective Media Queries*](https://bradfrost.com/blog/post/7-habits-of-highly-effective-media-queries/):
breakpoints saem do **conteúdo**, não do catálogo de aparelhos. Os números resultantes são feios de propósito — `642px`,
`911px` — e isso é o sinal de que você mediu o layout em vez de copiar uma tabela.

**Procedimento operacional:**

1. Comece em **380px** (a largura crítica deste projeto), mobile-first.
2. Alargue a janela devagar.
3. Pare quando: a medida de linha passar de ~75 caracteres, um card ficar largo demais para o conteúdo, sobrar espaço
   branco esquisito, ou algo se desalinhar.
4. **Ali** vai o breakpoint. Anote o número real.
5. Se o elemento que quebrou está dentro de uma coluna → **container query**, não media query.
6. Repita.

## 8.3 A hierarquia de decisão

Ordem de preferência, do mais robusto ao menos:

1. **Nada.** Flexbox com `flex-wrap`, `grid` com `auto-fit` + `min()`, `clamp()`. Se o layout se adapta sem condicional,
   não há breakpoint para errar.
2. **Container query.** Quando o componente pode viver em larguras diferentes.
3. **Media query.** Só para a **casca da página** — quando muda a estrutura de colunas de nível superior.
4. **JavaScript.** Só quando o posicionamento já é JS (caso do `LequeEquipe`), e aí com `ResizeObserver`, nunca com
   `window.innerWidth`.

## 8.4 Contagem no projeto

Media queries hoje em `globals.css`:

| linha | condição | motivo | veredito |
|---|---|---|---|
| 93 | `prefers-reduced-motion` | preferência do usuário | ✓ manter |
| 173-176 | `min-width: 480/640/768/1024` em `.leque` | altura de um componente em coluna | ✗ **virar container query** (§1.4) |
| 198-199 | `min-width: 768/1024` em `.leque-card` | largura de um card em coluna | ✗ **virar `cqi`** |
| 370 | `(hover: hover) and (pointer: fine)` | capacidade de entrada | ✓ manter (não é largura) |
| 424 | `(hover: none)` | capacidade de entrada | ✓ manter |
| 488 | `max-width: 1023px` | reserva de espaço do menu fixo | ✓ manter — é casca de página |
| 547 | `prefers-reduced-motion: no-preference` | preferência | ✓ manter |
| 666 | `prefers-reduced-motion: reduce` | preferência | ✓ manter |
| 688 | `forced-colors: active` | preferência | ✓ manter |

**Resultado:** de 9 blocos, só **6 dos 9** são breakpoints de largura, e desses, **5 são as do `.leque`** — todas
substituíveis por uma linha de container query. Sobra **uma** media query de largura na folha inteira (`max-width: 1023px`),
que é legítima porque descreve a casca. Isso é um bom lugar para chegar.

Nas classes utilitárias, os prefixos `lg:` do `page.tsx` são todos de casca (grid de 1 → 2 colunas). Legítimos.

## 8.5 Como customizar no Tailwind v4

```css
@import "tailwindcss";

@theme {
  /* adicionar um breakpoint */
  --breakpoint-3xl: 120rem;          /* habilita 3xl:* */

  /* sobrescrever um existente */
  --breakpoint-sm: 30rem;

  /* jogar fora a escala inteira e definir a sua, medida no conteúdo */
  --breakpoint-*: initial;
  --breakpoint-coluna: 42rem;        /* onde a coluna de texto quebra */
  --breakpoint-duas:   64rem;        /* onde cabem duas colunas */

  /* tamanhos de container query — NOMES NOVOS, nunca sobrescreva os
     existentes: --container-* também alimenta os utilitários max-w-* */
  --container-leque: 30rem;          /* habilita @leque:* */
}
```

Fonte: [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme).

**Recomendação para este projeto:** **não** trocar a escala. Os `lg:` existentes funcionam, são poucos, e são de casca.
O ganho está em **remover** breakpoints (os do `.leque`), não em renomear os que sobram.

---

# O QUE APLICAR NESTE PROJETO

Ordem de prioridade: impacto no público real (celular a 380px, vindo do link na bio) primeiro.

---

### 1. Trocar `overflow-hidden` por `overflow-clip` na seção de serviços — **bug ativo**

**Arquivo/seletor:** `app/page.tsx:185` → `<Secao id="servicos" className="relative overflow-hidden">`
**Mudança:** `overflow-hidden` → `overflow-clip`
**Motivo:** `overflow: hidden` cria um scroll container e vira o scrollport dos `lg:sticky lg:top-8` de
`app/page.tsx:217`. Os cinco cabeçalhos de bloco **não grudam** hoje. `overflow: clip` clipa igual (mantendo o
`<Haze />` e o `.luz` contidos) sem criar scroll container. Uma palavra, bug resolvido.
**Estender por consistência a:** `app/page.tsx:104` (`#casamento`) e `app/page.tsx:28` (o `<header>` do hero).
**Custo:** trivial. **Risco:** nenhum — Baseline widely available desde mar 2025.

---

### 2. Rodar o script de diagnóstico de estouro a 380px, com foco na seção `#sobre`

**Arquivo:** nenhum — é medição.
**Motivo:** a conta da §5.4 prevê **~59px de sangria de cada lado a 380px** e **~338px no desktop** por causa do
`LequeEquipe`. É predição calculada, não observação. Confirme antes de mexer: abra a página, **role até "A casa"**
(o leque só se posiciona depois do `IntersectionObserver`), cole o script da §5.1.
**Faça também:** a mesma medição a 1280px, e com o menu do `MenuLiquido` **aberto** a 380px (§5.3).

---

### 3. Corrigir o `LequeEquipe` para medir o contêiner, não a janela

**Arquivos:** `components/LequeEquipe.tsx` (`multLargura`, `multAltura`, o `useEffect` do GSAP) e
`app/globals.css:172-199` (`.leque`, `.leque-card`).
**Mudança em CSS:**
```css
.leque-wrap { container-type: inline-size; }
.leque-wrap .leque {
  --card: clamp(11rem, 44cqi, 16rem);
  height: calc(var(--card) * 2.4);
}
.leque-wrap .leque-card { width: var(--card); }
/* apagar as 5 media queries de altura e as 2 de largura do card */
```
**Mudança em TSX:** `<Reveal delay={90} className="@container">` em `app/page.tsx:341`, e trocar
`window.innerWidth` por um `ResizeObserver` no `ref` do leque.
**Motivo:** o leque vive dentro de `lg:grid-cols-2`; a media query em 1024px entrega geometria de janela cheia numa
coluna de ~504px. É a causa provável do item 2 e é o caso de livro-texto de container query.
**Pegadinha a respeitar:** o `container-type` vai no **wrapper**, nunca no `.leque` — ele não pode ser o contêiner e ao
mesmo tempo derivar a própria altura de `cqi` (§1.3, pegadinha 1 e 2).

---

### 4. Tornar fluidos os três degraus grandes da escala tipográfica

**Arquivo/seletor:** `app/globals.css:39-40`, dentro do `@theme`.
```css
--text-2xl: clamp(2rem,   1.5575rem + 1.86vw, 2.75rem);  /* 32px→44px, 380→1024  */
--text-3xl: clamp(2.5rem, 1.615rem  + 3.73vw, 4rem);     /* 40px→64px, 380→1024  */
--text-4xl: clamp(4rem,   0.444rem  + 5.56vw, 6rem);     /* 64px→96px, 1024→1600 */
```
**Motivo:** `--text-3xl: 4rem` = **64px fixos** no `<h1>` a 380px, onde só há 340px de conteúdo. É o maior problema
tipográfico de mobile do projeto. Como bônus, reduz o `<h1>` de ~4 para ~3 linhas, o que mantém o `text-wrap: balance`
seguro sob o teto de 6 linhas do Chromium.
**Por que os três têm termo em `rem`:** sem ele, o zoom do navegador não move o texto → falha F94 / WCAG 1.4.4 (§3.2).
**Razões max/min:** 1,375 · 1,600 · 1,500 — todas ≤ 2,5 (regra do Smashing) e ≤ 1,6 (regra conservadora que também vale
no Firefox, cujo zoom trava em 300%).
**Não mexer** nos degraus `2xs` a `xl`: corpo de texto fica em `rem` fixo, sempre.

---

### 5. Subir o piso da safe area no menu fixo

**Arquivo/seletor:** `components/MenuLiquido.tsx:75` →
`bottom-[max(1rem,env(safe-area-inset-bottom))]` → `bottom-[max(1.5rem,env(safe-area-inset-bottom))]`
**Motivo:** o iOS 15+ retorna **0** para `safe-area-inset-bottom` quando a toolbar do Safari se esconde
([Apple Forums #716552](https://developer.apple.com/forums/thread/716552)), mas o indicador de home continua ocupando
34px. Com piso de 16px, o menu fica 18px dentro da zona do indicador — toques perdidos na **única conversão da página**.
24px reduz a exposição a 10px; 32px elimina.
**Não use** `safe-area-max-inset-bottom` como remédio: é só Chromium, e o bug é do Safari (§6.3).

---

### 6. Derivar `body { padding-block-end }` da altura real do menu

**Arquivo/seletor:** `app/globals.css:487-491`.
```css
:root {
  --menu-altura: 3.25rem;                                  /* = h-13 do MenuLiquido */
  --menu-folga:  max(env(safe-area-inset-bottom), 1.5rem); /* mesmo piso do item 5   */
  --menu-total:  calc(var(--menu-altura) + var(--menu-folga) + 1rem);
}
@media (max-width: 1023px) {
  html { scroll-padding-block-end: var(--menu-total); }
  body { padding-block-end:        var(--menu-total); }
}
```
E em `MenuLiquido.tsx`, usar `bottom-[var(--menu-folga)]`.
**Motivo:** `6rem` é número mágico que hoje cobre por sorte (a altura real varia entre 68px e 86px). Uma fonte de verdade
única impede que uma mudança de altura do menu quebre o fim da página em silêncio.

---

### 7. Adicionar `text-wrap: pretty` aos parágrafos

**Arquivo/seletor:** `app/globals.css`, no `@layer base`, junto das regras de `h1, h2, h3`:
```css
p, li, dd { text-wrap: pretty; }
```
**Motivo:** a 380px os parágrafos de `max-w-[46ch]`/`max-w-[44ch]` quebram em 5-8 linhas e produzem órfãs constantemente.
`pretty` é enriquecimento progressivo puro — Firefox ignora a declaração e nada muda. Cobre 100% do tráfego real
(WebKit no iOS ≥26 / Chromium no Android).
**Cuidado:** aplicar em `p, li, dd`, **nunca** em `*`.

---

### 8. Defender a lista de nomes do rider contra estouro

**Arquivo/seletor:** `app/page.tsx:307-318`, a `<ul class="flex flex-wrap …">` e os `<li>` dentro.
**Mudança:** `overflow-wrap: break-word` no `<span>` do nome, ou `min-w-0` no `<li>`.
**Motivo:** são 116 nomes de artistas vindos de `lib/conteudo`. Um `<li>` é item de flex e, por
[CSS Flexbox §4.5](https://www.w3.org/TR/css-flexbox-1/#min-size-auto), tem `min-width: auto` → não encolhe abaixo do
min-content. Um nome longo a 380px estoura. O resto do projeto já se defende disso (`min-w-0` em `CardServico.tsx:132`,
`minmax(0,…)` nos grids); esta é a lacuna.
**Bônus:** trocar `break-all` do e-mail (`app/page.tsx:414`) por `wrap-anywhere` — quebra em posição mais legível.

---

### 9. `subgrid` nos três cards de serviço (opcional, ganho estético)

**Arquivo/seletor:** `app/page.tsx:196` e `components/CardServico.tsx`.
```css
.grade-cards { display: grid; grid-template-rows: repeat(4, auto); }
.card        { display: grid; grid-template-rows: subgrid; grid-row: span 4; }
```
**Motivo:** hoje o `flex-1` na descrição alinha o link do rodapé, mas **não** alinha o `<h3>` entre cards com nomes de 1 e
de 2 linhas. Subgrid alinha foto, código, título e descrição entre os três de uma vez.
**Suporte:** Baseline widely available desde 15 mar 2026 — o recurso mais novo desta lista. Degrada bem: sem subgrid, os
cards voltam ao alinhamento atual.

---

### 10. Remover CSS morto

**Arquivo/seletor:** `app/globals.css:449-515` — `.navbar`, `.navbar__alvo`, `.navbar__zap`, `.folha`, `.folha__corpo`,
`.folha::backdrop`.
**Motivo:** nenhum `.tsx` do projeto referencia essas classes (a barra fixa real é o `MenuLiquido`). São ~65 linhas de CSS
enviado a todo visitante, e — pior — contêm o padrão de safe area **correto** (`max(env(...), .5rem)`), o que faz parecer
que o problema do item 5 já está resolvido quando não está. Remover, ou reaproveitar o padrão no componente vivo.

---

### 11. Documentar o porquê dos `minmax(0, 1fr)` já existentes

**Arquivo/seletor:** `app/page.tsx:216` e `:301`.
**Motivo:** `lg:grid-cols-[minmax(0,13rem)_1fr]` está certo, mas parece arbitrário. Sem um comentário, a próxima
refatoração "simplifica" para `13rem 1fr` e reintroduz o blowout de min-content. Uma linha de comentário no padrão do
resto do arquivo (que é excelente nisso) resolve.

---

### 12. Se um dia a contagem de cards de destaque virar variável

**Arquivo/seletor:** `app/page.tsx:196` → `md:grid-cols-3`.
```html
<div class="mt-14 grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
```
**Motivo:** `md:grid-cols-3` está **correto hoje** — são exatamente 3 itens em `DESTAQUE_LED`. `auto-fit` só ganha quando
a contagem varia. O `min(100%, 18rem)` interno é obrigatório: sem ele, `minmax(18rem, 1fr)` mantém trilha de 288px mesmo
num contêiner de 250px e estoura ([CSSWG #4043](https://github.com/w3c/csswg-drafts/issues/4043)).
**Não aplicar agora.** Deixar registrado.

---

## Referências (todas consultadas em 5 de agosto de 2026)

**Especificação e MDN**
- [MDN — CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) (atualizado 8 jul 2026)
- [MDN — env()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env)
- [MDN — text-wrap-style](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style)
- [MDN — overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow)
- [MDN — grid-template-columns](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-columns)
- [MDN — `<meta name="viewport">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport)
- [MDN — Numeric data types (unidades de viewport)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_values_and_units/Numeric_data_types)
- [CSS Flexbox 1 §4.5 — Automatic Minimum Size of Flex Items](https://www.w3.org/TR/css-flexbox-1/#min-size-auto)
- [CSS Grid 1 §6.6 — Automatic Minimum Size of Grid Items](https://www.w3.org/TR/css-grid-1/#min-size-auto)
- [CSSWG #4043 — Overflow with auto-repeat and minmax()](https://github.com/w3c/csswg-drafts/issues/4043)
- [CSSWG #6026 — 100vw causa barras horizontais desnecessárias](https://github.com/w3c/csswg-drafts/issues/6026)
- [WCAG 2.1 SC 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG21/quickref/#resize-text) · [Falha F94](https://www.w3.org/WAI/WCAG21/Techniques/failures/F94.html)

**Dados de suporte**
- [Web Platform Features Explorer](https://web-platform-dx.github.io/web-features-explorer/) — container-queries, viewport-unit-variants, subgrid, safe-area-inset, overflow-clip, text-wrap-balance, text-wrap-pretty

**Fornecedores**
- [Chrome for Developers — CSS text-wrap: balance](https://developer.chrome.com/docs/css-ui/css-text-wrap-balance)
- [Chrome for Developers — CSS text-wrap: pretty](https://developer.chrome.com/blog/css-text-wrap-pretty)
- [Chrome 137 release notes](https://developer.chrome.com/release-notes/137) (sem menção a text-wrap: pretty)
- [WebKit — Better typography with text-wrap pretty](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/)
- [Apple Developer Forums #716552 — safe-area-inset-bottom volta 0](https://developer.apple.com/forums/thread/716552)
- [Tailwind CSS — Responsive design (container queries)](https://tailwindcss.com/docs/responsive-design)
- [Tailwind CSS — Theme variables](https://tailwindcss.com/docs/theme)

**Blogs de autoridade**
- [Ahmad Shadeed — New Viewport Units](https://ishadeed.com/article/new-viewport-units/)
- [Ahmad Shadeed — Overflow Issues in CSS (Smashing, abr 2021)](https://www.smashingmagazine.com/2021/04/css-overflow-issues/)
- [Ahmad Shadeed — A Guide To CSS Debugging (Smashing, out 2021)](https://www.smashingmagazine.com/2021/10/guide-debugging-css/)
- [Josh W. Comeau — A Friendly Introduction to Container Queries](https://www.joshwcomeau.com/css/container-queries-introduction/)
- [Adrian Roselli — Responsive Type and Zoom (dez 2019)](https://adrianroselli.com/2019/12/responsive-type-and-zoom.html)
- [Adrian Bece — Modern Fluid Typography Using CSS Clamp (Smashing, jan 2022)](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/)
- [Maxwell Barvian — Addressing Accessibility Concerns With Using Fluid Type (Smashing, nov 2023)](https://www.smashingmagazine.com/2023/11/addressing-accessibility-concerns-fluid-type/)
- [Šime Vidas — New CSS Viewport Units Do Not Solve The Classic Scrollbar Problem (Smashing, dez 2023)](https://www.smashingmagazine.com/2023/12/new-css-viewport-units-not-solve-classic-scrollbar-problem/)
- [Bram Van Damme — The Large, Small, and Dynamic Viewports](https://www.bram.us/2021/07/08/the-large-small-and-dynamic-viewports/)
- [Bram Van Damme — You want overflow: clip, not overflow: hidden](https://www.bram.us/2024/02/14/scroll-driven-animations-you-want-overflow-clip-not-overflow-hidden/)
- [CSS-Tricks — auto-fill vs auto-fit](https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/)
- [CSS-Tricks — Finding/Fixing Unintended Body Overflow](https://css-tricks.com/findingfixing-unintended-body-overflow/)
- [Polypane — How to find the cause of horizontal scrollbars](https://polypane.app/blog/strategies-for-dealing-with-horizontal-overflows/)
- [Polypane — Using safe-area-inset to build mobile-safe layouts](https://polypane.app/blog/using-safe-area-inset-to-build-mobile-safe-layouts/)
- [Terluin Webdesign — position: sticky not working? Try overflow: clip](https://www.terluinwebdesign.nl/en/blog/position-sticky-not-working-try-overflow-clip-not-overflow-hidden/)
- [Brad Frost — 7 Habits of Highly Effective Media Queries](https://bradfrost.com/blog/post/7-habits-of-highly-effective-media-queries/)
- [Samuel Kraft — Using Bottom Tab Bars on Safari iOS 15](https://samuelkraft.com/blog/safari-15-bottom-tab-bars-web)
- [9elements — Building a Rock Solid Auto Grid](https://9elements.com/blog/building-a-rock-solid-auto-grid/)
