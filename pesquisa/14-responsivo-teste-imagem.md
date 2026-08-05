# 14 — Imagem responsiva e metodologia de teste de responsividade

> Pesquisa para o site da Rapa Sound (Next.js 15.5.4 `output: 'export'`, React 19, Tailwind v4).
> Data da pesquisa: **05/08/2026**. Todo dado de suporte de navegador está datado e com fonte.
> Onde não consegui confirmar em fonte primária, está escrito **"não confirmado"**.

---

## RESUMO EXECUTIVO

1. O projeto usa `<img>` puro — está **certo**: `next/image` com o loader padrão está na lista oficial de *Unsupported Features* do `output: 'export'` ([Next.js, atualizado 21/07/2026](https://nextjs.org/docs/app/guides/static-exports)).
2. Hoje **nenhuma** `<img>` do site tem `srcset`/`sizes`. Todo celular baixa a imagem inteira. Esse é o maior ganho de peso disponível.
3. `sizes` errado é o erro nº 1 da web: sem `sizes`, o browser assume **`100vw`** e baixa maior do que precisa ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img)).
4. `sizes="auto"` + `loading="lazy"` resolve isso para tudo abaixo da dobra — mas **só em Chromium 126+ e Firefox 150+**; Safari só a partir do **27 (beta)**. Fallback é obrigatório.
5. O hero que cortava rostos **não** se resolve com `object-position`: se resolve com `<picture media>` trocando o **recorte** (art direction).
6. `object-view-box` seria a solução elegante, mas **não existe em Safari nem Firefox** — inviável num site com 17% de Safari mobile no Brasil.
7. `aspect-ratio` no CSS **não substitui** `width`/`height` no HTML: os atributos chegam no preload scanner, o CSS não.
8. AVIF: 93,42% de suporte global, ~35% menor que WebP — mas decodifica por **software** em Android barato. Use `<picture>` com fallback WebP, nunca AVIF sozinho.
9. `fetchpriority="high"` no LCP vale de verdade: imagens no viewport começam em prioridade **Low** e só sobem depois do layout ([web.dev](https://web.dev/articles/fetch-priority)).
10. Largura crítica real no Brasil: **384×832 é o 2º lugar (5,09%)** — StatCounter, julho/2026. Testar em 380px está correto.
11. DevTools device mode é, nas palavras da própria doc do Chrome, uma *"first-order approximation"*. Não emula WebKit, nem CPU de celular, nem a barra de URL sumindo.
12. WCAG obriga dois testes que quase ninguém roda: **texto a 200%** (1.4.4) e **reflow a 320px CSS** (1.4.10). Checklist no fim do documento.

---

## 0. CONTEXTO: o que o projeto tem hoje

| Arquivo | Linha | O que é | Falta |
|---|---|---|---|
| `app/page.tsx` | 30–38 | Hero, `object-cover object-center`, `fetchPriority="high"`, `decoding="async"` | `srcset`/`sizes`, art direction, `<picture>` |
| `app/page.tsx` | 89–92 | Grid 2 col, `aspect-4/3`, `loading="lazy"` | `srcset`/`sizes` |
| `app/page.tsx` | 164–168 | Mosaico `col-span-2 aspect-16/10` + `aspect-4/5` | `srcset`/`sizes` |
| `components/CardServico.tsx` | 86–90 | `aspect-16/10 w-full object-cover` | `srcset`/`sizes` |
| `components/LequeEquipe.tsx` | 234–236 | `absolute inset-0 object-cover` | `width`/`height`, `srcset`/`sizes` |
| `components/Palco.tsx` | 83–87, 119–121 | Capas de vídeo `object-cover` | `srcset`/`sizes` |
| `components/VideoFacade.tsx` | 37–44 | Capa `absolute inset-0 object-cover` | `srcset`/`sizes` |
| `app/layout.tsx` | 30–35 | `width: 'device-width'`, `initialScale: 1`, `viewportFit: 'cover'` | ✅ nada — **passa** no pré-requisito de WCAG 1.4.4 |
| `next.config.mjs` | — | `images: { unoptimized: true }` | ✅ correto para export |

**Confirmação do bloqueio do `next/image`:** a doc oficial lista, em *Unsupported Features* do static export, *"Image Optimization with the default `loader`"*. A única saída sem servidor é `images.loader: 'custom'` + `loaderFile` apontando para um CDN externo (Cloudinary, imgix), ou `unoptimized: true` — que é o que o projeto faz.
Fonte: <https://nextjs.org/docs/app/guides/static-exports> (versão 16.3.0 da doc, atualizada 21/07/2026).

**Consequência prática:** as variantes de tamanho e formato têm que ser geradas **em build time** (script com `sharp`) ou à mão, e escritas em `srcset` manualmente. Não existe mágica de runtime aqui.

---

## 1. `srcset` + `sizes` DE VERDADE

### 1.1 Descritor `w` vs descritor `x` — a diferença real

Da referência do `<img>` no MDN (<https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img>):

| | Descritor `w` | Descritor `x` |
|---|---|---|
| O que declara | A **largura intrínseca real** do arquivo em px | A **densidade de pixel** do display alvo |
| Exemplo | `foto-800.jpg 800w` | `foto-800.jpg 2x` |
| Exige `sizes`? | **Sim, obrigatório** | Não — `sizes` é ignorado/inválido |
| O `src` entra na disputa? | **Não** | Sim, com descritor padrão `1x` |
| Serve para | Imagem que muda de tamanho com o viewport (fluida) | Imagem de tamanho **fixo** em CSS |
| Se descritor for omitido | inválido misturar | assume `1x` |

Regras que o MDN marca como erro:
- **"It is incorrect to mix width descriptors and pixel density descriptors in the same `srcset` attribute."**
- Descritores duplicados (dois `2x`) são **inválidos**.
- A spec exige que `sizes` só esteja presente quando `srcset` usa descritores `w`.

**Como o browser escolhe (com `w`):** ele divide o descritor `w` pelo comprimento resolvido do `sizes` e obtém uma *densidade de pixel efetiva*; depois compara com o `devicePixelRatio` do aparelho e escolhe o candidato adequado. Ou seja: `800w` com `sizes: 400px` = densidade efetiva 2x. Em um celular com DPR 3, ele vai querer 1200px.

> Nota: a explicação canônica desse cálculo é a do Eric Portis, *"w descriptors and sizes: Under the hood"* (<https://observablehq.com/@eeeps/w-descriptors-and-sizes-under-the-hood>). O conteúdo do notebook não é extraível por fetch (é renderizado por JS), então a fórmula acima está descrita a partir do texto do MDN, não citada dele.

**Qual usar neste projeto:** todas as imagens do site são **fluidas** (`w-full`, `object-cover`, grids). Portanto **`w` + `sizes`**, sempre. `x` só serviria para o logo ou um ícone de largura travada em px.

```html
<!-- ✅ w + sizes: imagem fluida (o caso deste site) -->
<img src="festa-800.jpg"
     srcset="festa-400.jpg 400w, festa-800.jpg 800w, festa-1200.jpg 1200w, festa-1600.jpg 1600w"
     sizes="(min-width: 1024px) 285px, calc(50vw - 24px)"
     width="1600" height="1200" alt="…">

<!-- ✅ x sem sizes: imagem de largura travada -->
<img src="logo.png" srcset="logo@2x.png 2x, logo@3x.png 3x"
     width="160" height="40" alt="Rapa Sound">

<!-- ❌ INVÁLIDO: mistura w e x -->
<img srcset="a.jpg 400w, b.jpg 2x">
```

### 1.2 Por que `sizes` errado é o erro mais comum da web

Três motivos combinados:

**(a) O default silencioso é `100vw`.** MDN: *"If the `sizes` attribute is not provided, it has a default value of `100vw`."* O CSS-Tricks resume o efeito: *"Browsers will assume you're probably going to render this image at 100vw wide. That's unfortunate because the browser may download a larger image than it needs."* (<https://css-tricks.com/sometimes-sizes-is-quite-important/>).
Numa galeria de 2 colunas, isso significa baixar **o dobro** da largura necessária — 4x os pixels, e o peso do arquivo cresce quase quadraticamente.

**(b) `sizes` é CSS escrito em HTML, e desatualiza.** O Cloud Four é explícito: o atributo *"forces presentation information into markup where it doesn't logically belong"*. Você muda o `grid-cols` no Tailwind e o `sizes` continua mentindo. Mat Marquis, ex-presidente do Responsive Images Community Group, citado no mesmo texto: *"I won't miss all those hand-hewn `sizes` attributes; I never had any love for them."* (<https://cloudfour.com/thinks/ending-responsive-images/>).

**(c) Ordem das media conditions.** O browser **para na primeira que casa** (Cloud Four: *"it grabs the first value where the media condition passes"*). Com `max-width`, do menor para o maior; com `min-width`, do maior para o menor. Inverter a ordem faz as regras seguintes nunca rodarem — e o bug é silencioso.

**(d) Unidades relativas.** MDN: no `sizes`, *"all relative length units are relative to the document root, not the `<img>` element"*. `em` no `sizes` = `em` do `:root`, não da fonte do elemento. E **porcentagem é proibida** (`sizes="50%"` é inválido — use `50vw`).

**PEGADINHA nº 1:** `100vw` inclui a barra de rolagem em desktop. Em telas com scrollbar clássica de 15–17px, `100vw` é maior que a largura de conteúdo. Para a última entrada da lista, `calc(100vw - 16px)` é mais honesto do que `100vw`.

**PEGADINHA nº 2:** `sizes` descreve o **slot em CSS pixels**, não em pixels de arquivo. O browser multiplica pelo DPR sozinho. Escrever `sizes="800px"` porque "a foto tem 800px" é o erro clássico — ali vai a largura de **exibição**.

### 1.3 Como escrever `sizes` para um grid responsivo — o método defensável

Não chute. **Meça.** Rode isto no console, em cada largura que importa:

```js
// Cole no console. Retorna, para cada <img>, quanto ela ocupa de verdade
// e quanto o browser baixou a mais.
copy(
  [...document.querySelectorAll('img')].map((i) => {
    const cssW = Math.round(i.getBoundingClientRect().width)
    const precisa = Math.round(cssW * devicePixelRatio)
    return {
      arquivo: (i.currentSrc || i.src).split('/').pop(),
      viewport: innerWidth,
      dpr: devicePixelRatio,
      larguraCSS: cssW,
      precisaDePx: precisa,
      baixouPx: i.naturalWidth,
      desperdicio: precisa ? (i.naturalWidth / precisa).toFixed(2) + 'x' : '—',
    }
  })
)
```

`larguraCSS` medido em cada breakpoint **é** o seu `sizes`. Depois transforme em fórmula.

**Exemplo real — grid de 15 anos deste projeto** (`app/page.tsx:87–93`): `grid-cols-2 gap-2` (gap = 8px), dentro de `Secao` com `px-5` (20px de cada lado) no mobile; em `lg` a coluna direita é `1.15fr` de `grid-cols-[1fr_1.15fr]` com `gap-20` (80px), dentro de `max-w-6xl` (1152px) com `lg:px-8` (32px).

```
Mobile  (<1024px):  (100vw − 40 − 8) / 2  =  calc(50vw − 24px)
lg      (≥1024px):  container = min(1152, 100vw − 64)
                    col.direita = (container − 80) × 1,15/2,15  ≈ (container − 80) × 0,535
                    cada img    = (col.direita − 8) / 2
                    em 1152px  →  (1152 − 80) × 0,535 ≈ 573  →  (573 − 8)/2 ≈ 283px
```

```html
<img
  src="festa-600.jpg"
  srcset="festa-300.jpg 300w, festa-450.jpg 450w, festa-600.jpg 600w, festa-900.jpg 900w"
  sizes="(min-width: 1216px) 283px,
         (min-width: 1024px) calc((100vw - 144px) * 0.267),
         calc(50vw - 24px)"
  width="1200" height="900" loading="lazy" decoding="async"
  class="aspect-4/3 w-full object-cover"
  alt="…">
```

Regra prática: **arredonde `sizes` para cima, nunca para baixo.** `sizes` menor que a realidade = imagem borrada (irreversível). `sizes` maior = alguns KB a mais (reversível, e o browser ainda pode escolher menor por causa de save-data/cache).

**PEGADINHA nº 3:** o `sizes` é avaliado pelo **preload scanner**, antes de o CSS carregar. Ele não sabe nada do seu container, nem de container queries. Por isso ele é escrito em `vw`, e por isso ele erra quando você mexe no layout.

### 1.4 `sizes="auto"` — é padrão hoje? Qual o suporte?

**O que é:** MDN — *"The `auto` keyword indicates that the browser should use the expected layout width of the element to select the image to display — using the concrete size of the image calculated after layout from HTML and CSS has been applied."*

**Restrição dura:** só é válido **combinado com `loading="lazy"`**. Faz sentido: só numa imagem adiada é que o layout já existe quando o download começa. Numa imagem eager, o preload scanner dispara antes de haver layout — daí a "race condition" que o `sizes` manual existe para resolver.

**Cadeia de fallback quando `auto` não resolve** (MDN, na ordem):
1. os *source sizes* seguintes na própria lista;
2. os atributos `width`/`height` do elemento;
3. o tamanho intrínseco padrão do UA stylesheet para `<img>`: **300px × 150px**.

Ou seja: **sempre escreva um `sizes` descritivo depois do `auto`**, senão navegadores sem suporte caem em 300px e servem imagem borrada.

```html
<!-- Forma correta: auto + fallback descritivo na mesma lista -->
<img
  loading="lazy"
  decoding="async"
  width="1200" height="900"
  sizes="auto, (min-width: 1024px) 283px, calc(50vw - 24px)"
  srcset="festa-300.jpg 300w, festa-450.jpg 450w, festa-600.jpg 600w, festa-900.jpg 900w"
  src="festa-600.jpg"
  alt="…">
```

**Suporte HOJE — atenção, as fontes divergem:**

| Fonte | Data | O que diz |
|---|---|---|
| [caniuse.com/wf-sizes-auto](https://caniuse.com/wf-sizes-auto) e [caniuse mdn-html_elements_img_sizes_auto](https://caniuse.com/mdn-html_elements_img_sizes_auto) | dados de **05/03/2026** | Chrome **126+**, Edge **126+**, Firefox **150+**, Opera **112+**, Samsung Internet **28+**. **Safari desktop: não suportado** (até a v27 da tabela). **Safari iOS: não suportado.** Global: **70,9%** |
| [WebKit — News from WWDC26: WebKit in Safari 27 beta](https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/) | 09/06/2026 | O primeiro beta do Safari 27 inclui **`img sizes=auto`** |
| [WebKit — Safari Technology Preview 241](https://webkit.org/blog/17917/release-notes-for-safari-technology-preview-241/) | 10/04/2026 | Adicionado suporte à keyword `auto` no `sizes` do `<img>` |
| [WebKit — Safari Technology Preview 243](https://webkit.org/blog/17953/release-notes-for-safari-technology-preview-243/) | 04/06/2026 | Corrigidos os problemas restantes de `<img sizes="auto">` para alinhar com a spec |
| [web-standards.dev — "The end of responsive images"](https://web-standards.dev/news/2026/04/the-end-of-responsive-images/) (Mat Marquis) | abril/2026 | Afirma suporte cross-browser em Firefox, Safari e Chrome |

**Leitura honesta:** o WebKit implementou e **embarcou no Safari 27 beta** (jun/2026). O caniuse ainda marcava Safari como sem suporte na captura de março/junho de 2026 — provavelmente porque o Safari 27 estável ainda não havia sido liberado. Se o Safari 27 já é estável na data em que você lê isto, **não confirmado por esta pesquisa**; verifique o caniuse antes de confiar.

**Conclusão operacional para este site** (17,16% de Safari no mobile brasileiro — StatCounter, jul/2026):
- Use `sizes="auto, <fallback descritivo>"` em tudo que é `loading="lazy"` — é ganho grátis onde funciona e não custa nada onde não funciona.
- **Nunca** use `sizes="auto"` no hero. Hero é eager, e `auto` só é válido com `lazy`.
- Continue escrevendo o `sizes` descritivo. A recomendação do Cloud Four/Mat Marquis é exatamente essa: *"Descriptive `sizes` values are now recommended only for above-the-fold images"* — mas com Safari na transição, mantenha o descritivo também abaixo da dobra por mais um ciclo.

**PEGADINHA nº 4:** MDN avisa que *"the browser may or may not select a new image to display as the size of the container changes as implementations are not required to react to dynamic changes"*. Se o container muda de tamanho por JS depois do load, `auto` pode não reagir.

---

## 2. `<picture>` COM ART DIRECTION — o caso do hero com rostos

### 2.1 Quando trocar o RECORTE é a resposta certa

A regra de decisão:

| Sintoma | Ferramenta certa |
|---|---|
| A mesma foto, no mesmo enquadramento, só precisa ser **menor** no celular | `srcset` + `sizes` |
| A foto, no enquadramento de desktop, **perde o assunto** no celular (rosto cortado, pessoa fora do quadro, palco virando faixa) | **`<picture>` com `media`** |
| Precisa servir AVIF/WebP com fallback | `<picture>` com `type` |

MDN, sobre o *art direction problem*: *"wanting to serve cropped versions of images suited to different layouts. For example, showing a full landscape on desktop but a zoomed portrait view on mobile where detail matters more."* (<https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images>)

**Por que `object-position` não resolve o hero deste site:** o hero é `absolute inset-0` com `h-full w-full object-cover` dentro de um container `min-h-[88svh]`. Em 380×820, esse container tem razão ~0,46 (bem vertical). Uma foto 3:2 (1,5) dentro de uma caixa de 0,46 precisa ser ampliada ~3,2× em largura para cobrir — e **93% da largura original some**. `object-position` só escolhe *qual* faixa de 7% sobra. Nenhum valor de `object-position` faz caber um grupo de pessoas numa fresta vertical: o problema não é o alinhamento, é a **razão de aspecto**. A única saída é servir um arquivo **recortado em vertical** para o celular.

### 2.2 O código — hero com art direction

```html
<!-- 3 recortes físicos do mesmo negativo, gerados no build:
     hero-vert-*  → 3:4  (celular retrato)  — enquadra o grupo de perto
     hero-quad-*  → 4:3  (tablet / celular deitado)
     hero-wide-*  → 16:9 (desktop)                                    -->
<picture>
  <!-- celular retrato: recorte vertical -->
  <source
    media="(max-width: 47.99rem) and (orientation: portrait)"
    type="image/avif"
    srcset="hero-vert-480.avif 480w, hero-vert-720.avif 720w, hero-vert-1080.avif 1080w"
    sizes="100vw"
    width="1080" height="1440">
  <source
    media="(max-width: 47.99rem) and (orientation: portrait)"
    type="image/webp"
    srcset="hero-vert-480.webp 480w, hero-vert-720.webp 720w, hero-vert-1080.webp 1080w"
    sizes="100vw"
    width="1080" height="1440">

  <!-- celular deitado + tablet: recorte quadrado-ish -->
  <source
    media="(max-width: 63.99rem)"
    type="image/webp"
    srcset="hero-quad-800.webp 800w, hero-quad-1200.webp 1200w"
    sizes="100vw"
    width="1200" height="900">

  <!-- desktop: o panorama -->
  <source
    type="image/avif"
    srcset="hero-wide-1280.avif 1280w, hero-wide-1920.avif 1920w, hero-wide-2560.avif 2560w"
    sizes="100vw"
    width="2560" height="1440">
  <source
    type="image/webp"
    srcset="hero-wide-1280.webp 1280w, hero-wide-1920.webp 1920w, hero-wide-2560.webp 2560w"
    sizes="100vw"
    width="2560" height="1440">

  <!-- fallback obrigatório; TODOS os atributos de comportamento vão AQUI -->
  <img
    src="hero-wide-1280.jpg"
    alt="Debutante erguida pelas convidadas no meio da pista, com arcos de luz ao fundo"
    width="2560" height="1440"
    fetchpriority="high"
    decoding="async"
    class="h-full w-full object-cover object-center opacity-45">
</picture>
```

Em JSX (React 19 / este projeto), lembrando que o React usa `fetchPriority` camelCase no `<img>`:

```tsx
<picture className="absolute inset-0 block h-full w-full">
  <source media="(max-width: 47.99rem) and (orientation: portrait)"
          type="image/avif"
          srcSet="/hero-vert-480.avif 480w, /hero-vert-720.avif 720w, /hero-vert-1080.avif 1080w"
          sizes="100vw" width={1080} height={1440} />
  {/* … demais sources … */}
  <img
    src="/hero-wide-1280.jpg"
    alt="Debutante erguida pelas convidadas no meio da pista, com arcos de luz ao fundo"
    width={2560} height={1440}
    fetchPriority="high"
    decoding="async"
    className="h-full w-full object-cover object-center opacity-45"
  />
</picture>
```

**Regras de `<picture>` que quebram na prática:**

1. **`<picture>` é um wrapper, não um elemento renderizado.** Todo `class`, `style`, `alt`, `loading`, `decoding`, `fetchpriority` vai no **`<img>`** interno. Só `media`, `srcset`, `sizes`, `type`, `width`, `height` vão nos `<source>`.
2. **`<picture>` é `display: inline` por padrão.** No hero atual, o `<img>` tem `h-full w-full` e o pai é `absolute inset-0`. Ao envolver com `<picture>`, o `h-full` do `<img>` passa a se referir ao `<picture>`, que é inline e não tem altura. **Você precisa de `class="block h-full w-full"` no `<picture>` também** — senão o hero some. Este é o bug nº 1 de quem adota `<picture>` em cima de layout com `object-cover`.
3. **O browser usa o PRIMEIRO `<source>` cujo `media` casa e cujo `type` ele suporta.** Ordem importa: do mais específico/moderno para o mais genérico/antigo. AVIF antes de WebP antes do `<img src>` JPEG.
4. **`width`/`height` nos `<source>`** — o web.dev recomenda explicitamente isso para art direction, porque cada recorte tem razão diferente e o browser precisa reservar o espaço certo por breakpoint (<https://web.dev/articles/optimize-cls>):

```html
<picture>
  <source media="(max-width: 799px)" srcset="puppy-480w-cropped.jpg" width="480" height="400" />
  <source media="(min-width: 800px)" srcset="puppy-800w.jpg" width="800" height="400" />
  <img src="puppy-800w.jpg" alt="Puppy with balloons" width="800" height="400" />
</picture>
```

5. **Não deixe buraco entre as media queries.** `(max-width: 799px)` + `(min-width: 800px)` cobre tudo. `(max-width: 799px)` + `(min-width: 801px)` deixa 800px descoberto e cai no `<img>`.
6. **Cuidado com `orientation: portrait`** — em desktop com janela alta e estreita, `portrait` casa. Combine sempre com um `max-width`, como no código acima.

**Suporte de `<picture>`:** Chrome 38+, Edge 13+, Firefox 38+, Safari 9.1+, Safari iOS 9.3+, Opera 25+. **Global: 96,68%.** Sem suporte: IE (todas) e Opera Mini.
Fonte: <https://caniuse.com/picture> (dados de junho/2026).

**PEGADINHA nº 5:** troca de recorte tem **custo de cache**. Girar o celular de retrato para paisagem baixa um arquivo novo. Se o hero for `fetchpriority="high"`, isso é um download prioritário no meio da sessão. Aceite (a alternativa é rosto cortado) — mas não faça art direction em imagem que não precisa.

**PEGADINHA nº 6:** `alt` só existe no `<img>`. Se o recorte mobile mostra outra coisa que o de desktop, o `alt` fica tecnicamente impreciso para um dos dois. Escreva um `alt` que descreva o **assunto**, não o enquadramento — como o `alt` atual do projeto já faz razoavelmente bem.

---

## 3. `object-fit` + `object-position` — as regras para não cortar rostos

### 3.1 Como o `cover` corta

`object-fit: cover` escala a imagem até **cobrir** a caixa preservando a razão de aspecto, e joga fora o excesso no eixo mais longo. `object-position` só decide **de onde** vem o pedaço mantido (padrão: `50% 50%`).

A matemática que você precisa para prever o estrago:

```
R_img   = largura_intrínseca / altura_intrínseca
R_caixa = largura_caixa / altura_caixa

Se R_img > R_caixa  →  corta nas LATERAIS.
    fração horizontal visível = R_caixa / R_img
Se R_img < R_caixa  →  corta em CIMA/EMBAIXO.
    fração vertical visível   = R_img / R_caixa
```

**Aplicado ao hero deste projeto:** container `min-h-[88svh]`. Num 380×820 CSS com barra de URL, `88svh` ≈ 650px → `R_caixa` ≈ 0,58. Uma foto 3:2 tem `R_img` = 1,5. Fração horizontal visível = 0,58/1,5 = **39%**. Some 61% da largura da foto. Se o grupo de pessoas ocupa mais de 39% da largura do quadro, **alguém sai** — e nenhum `object-position` conserta.

### 3.2 As regras práticas

**Regra 1 — Estabeleça um orçamento de corte.** Se a fração visível cair abaixo de **~60%** em qualquer eixo, `object-fit` já não é a ferramenta: vá para `<picture>` com recorte físico.

**Regra 2 — Reduza a diferença de razão antes de mexer no `object-position`.** Em vez de caixa `88svh`, uma caixa com `aspect-ratio` explícito no mobile aproxima `R_caixa` de `R_img` e o corte some sozinho:

```css
.hero-media {
  aspect-ratio: 3 / 4;          /* mobile: caixa vertical, próxima do recorte vertical */
  object-fit: cover;
  object-position: 50% 30%;
}
@media (min-width: 48rem) {
  .hero-media { aspect-ratio: 16 / 9; object-position: 50% 45%; }
}
```

**Regra 3 — Escolha `object-position` medindo, não no olho.** Método defensável, em 4 passos:

1. Abra a foto num editor. Encontre o centro do **assunto** (a linha dos olhos, num retrato; o centro do grupo, numa foto de festa).
2. Meça a posição desse centro em **percentual das dimensões da foto**: `x% = px_x / largura_total`, `y% = px_y / altura_total`.
3. Use esses valores diretamente: `object-position: x% y%`. A semântica de porcentagem em `object-position` alinha o ponto `x%` da **imagem** com o ponto `x%` da **caixa** — que é exatamente o que você quer.
4. **Verifique nos dois extremos** de razão de caixa que o layout produz (mais larga possível e mais estreita possível). Se um dos extremos falha, a resposta não é outro `object-position`: é `<picture>`.

Script para medir o ponto no browser (clique no rosto e ele te dá o valor pronto):

```js
// Cole no console COM A IMAGEM VISÍVEL, depois clique no rosto que deve ficar sempre no quadro.
document.addEventListener('click', function medir(e) {
  const img = e.target.closest('img'); if (!img) return
  const r = img.getBoundingClientRect()
  const rImg = img.naturalWidth / img.naturalHeight
  const rBox = r.width / r.height
  // desfaz o cover para achar a coordenada no arquivo original
  const escala = rImg > rBox ? r.height / img.naturalHeight : r.width / img.naturalWidth
  const desenhoW = img.naturalWidth * escala, desenhoH = img.naturalHeight * escala
  const posX = parseFloat(getComputedStyle(img).objectPosition) / 100 || 0.5
  const posY = parseFloat(getComputedStyle(img).objectPosition.split(' ')[1]) / 100 || 0.5
  const offX = (r.width - desenhoW) * posX, offY = (r.height - desenhoH) * posY
  const x = ((e.clientX - r.left - offX) / desenhoW * 100).toFixed(1)
  const y = ((e.clientY - r.top  - offY) / desenhoH * 100).toFixed(1)
  console.log(`object-position: ${x}% ${y}%   | R_img ${rImg.toFixed(2)} R_caixa ${rBox.toFixed(2)} | visível ${(Math.min(rBox/rImg, rImg/rBox)*100).toFixed(0)}%`)
  document.removeEventListener('click', medir)
})
```

**Regra 4 — Foto de festa cortada nos rostos é problema de *conteúdo*, não de CSS.** Se a foto original já tem os rostos encostados na borda, nenhuma técnica salva. Peça/escolha fotos com **respiro** (margem morta acima e nas laterais) para tudo que vai virar `object-cover`.

**PEGADINHA nº 7:** `object-position` **não** tem efeito sem `object-fit` diferente de `fill`. E `object-fit`/`object-position` só se aplicam a *replaced elements* (`<img>`, `<video>`) — num `background-image` os equivalentes são `background-size: cover` / `background-position`.

**PEGADINHA nº 8:** o Tailwind `object-center` é `object-position: center` = `50% 50%`. Para valores medidos você precisa de valor arbitrário: `object-[50%_30%]`.

### 3.3 `object-view-box` — existe? Serve?

**Existe, e é exatamente a ferramenta conceitualmente certa.** Define um retângulo de visualização dentro do elemento substituído, como o `viewBox` do SVG — permite recortar/zoom **sem wrapper e sem gerar arquivos novos**.

```css
/* Recorta o quadro para o grupo de pessoas, sem tocar no arquivo */
.hero-media {
  aspect-ratio: 3 / 4;
  object-view-box: inset(10% 32% 5% 30%);  /* top right bottom left */
  object-fit: cover;
}
@media (min-width: 48rem) {
  .hero-media { aspect-ratio: 16 / 9; object-view-box: none; }
}
```

Valores aceitos: `none` (inicial), `inset()`, `xywh()`, `rect()`.
Fonte da sintaxe e dos exemplos: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-view-box> e <https://ishadeed.com/article/css-object-view-box/>.

**Suporte HOJE — e é aqui que a coisa morre:**

| Navegador | Suporte |
|---|---|
| Chrome / Edge | **104+** ✅ |
| Samsung Internet | **20+** ✅ |
| Chrome Android | 150 ✅ |
| **Firefox** | **NÃO suportado** (todas as versões até 156) ❌ |
| **Safari desktop** | **NÃO suportado** (todas até 27) ❌ |
| **Safari iOS** | **NÃO suportado** (todas até 26.5) ❌ |
| Global | **75,41%** |

Fonte: <https://caniuse.com/mdn-css_properties_object-view-box> (dados de junho/2026). O MDN marca a propriedade como **experimental / "Limited availability — Not Baseline"**.

**Veredito para este site:** **não use.** 17,16% do tráfego mobile brasileiro é Safari (StatCounter, jul/2026), e nesses aparelhos a propriedade é ignorada — ou seja, o Safari mostraria exatamente o hero cortado que estamos tentando consertar, e você não teria como saber sem testar. É *progressive enhancement* ruim: o fallback é o bug original. Fique no `<picture>`.

---

## 4. `aspect-ratio` NO CSS + `width`/`height` NO HTML — por que os dois

### 4.1 O que cada um faz

**`width`/`height` no HTML:** o browser deriva a razão de aspecto antes de baixar o arquivo. web.dev: *"All browsers will then add a default aspect ratio based on the element's existing `width` and `height` attributes."* E o que ele injeta internamente é:

```css
img[Attributes Style] {
  aspect-ratio: auto 640 / 360;
}
```

O `auto` na frente é essencial: quando a imagem real carrega, a razão **intrínseca** assume — protegendo você de ter digitado o `width`/`height` errado.
Fonte: <https://web.dev/articles/optimize-cls>

**`aspect-ratio` no CSS:** trava a caixa numa razão escolhida por você, independente do arquivo. É o que os `aspect-4/3`, `aspect-16/10`, `aspect-video` do projeto fazem.

**A dupla obrigatória:**

```html
<img src="foto.jpg" width="640" height="360" alt="…">
```
```css
img { height: auto; width: 100%; }
```

### 4.2 Por que os DOIS ainda são necessários

Três razões independentes:

1. **Momento.** Os atributos HTML são lidos pelo **preload scanner**, no parse do HTML, antes do CSSOM existir. Se o CSS estiver num arquivo externo (é o caso: Tailwind), há uma janela — pequena, mas real, e maior em 4G — em que só os atributos HTML existem. Sem eles, a caixa mede 0 e o CLS acontece nessa janela.

2. **Falha do CSS.** Se o CSS não carregar (rede ruim, extensão, modo leitura), os atributos HTML ainda reservam espaço. `aspect-ratio` sozinho evapora.

3. **`loading="lazy"` depende disso para funcionar.** web.dev é categórico: sem `width`/`height` as imagens medem 0×0, *"potentially causing the browser to load everything, defeating lazy-loading benefits"* — MDN diz a mesma coisa por outro ângulo: *"Lazy-loaded images will never be loaded if they do not intersect a visible part of an element, even if loading them would change that (because unloaded images have `width` and `height` of `0`)."*

### 4.3 A interação — e onde ela morde

**`aspect-ratio` no CSS vence os atributos HTML** (é uma declaração de autor; os atributos viram *presentation hints* de menor especificidade). Então `aspect-4/3` num arquivo 16:9 **funciona**, mas: a razão da caixa não é a razão do arquivo, então `object-fit: cover` vai cortar. É exatamente o que o projeto faz nos grids — e está correto, desde que os arquivos tenham respiro.

**Regra do MDN:** *"At least one dimension (width or height) must be automatic for `aspect-ratio` to have any effect."* Se você fixar `w-full h-full`, o `aspect-ratio` é ignorado em silêncio. Fonte: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio> (Baseline: *widely available* desde setembro/2021).

**`aspect-ratio: auto <ratio>` (os dois juntos):** em elemento substituído, o `auto` prevalece **depois** que o conteúdo carrega; a `<ratio>` vale só até lá. Útil como placeholder honesto:

```css
img { width: 100%; aspect-ratio: 3 / 2 auto; }  /* 3:2 até carregar, depois o real */
```

**PEGADINHA nº 9 — a mais comum de todas:** `img { width: 100% }` **sem** `height: auto`. O `height` do atributo HTML vira altura fixa em px, a largura estica, e a foto distorce. Sempre `height: auto` junto. No Tailwind, `w-full` sem `h-auto` tem esse risco — o preflight do Tailwind já aplica `height: auto` a `img`, mas se você adicionar `h-full` (como no hero e no `LequeEquipe`) está sobrescrevendo, e aí `object-cover` é obrigatório para não distorcer.

**PEGADINHA nº 10:** `components/LequeEquipe.tsx:234` tem `<img>` **sem `width`/`height`** com `loading="lazy"` e `absolute inset-0`. Como está absoluto e cheio pelo pai, não gera CLS visível — mas perde a proteção do item 3 acima. Adicione os atributos mesmo assim; custa nada.

**PEGADINHA nº 11:** com `srcset`, **todas as variantes precisam ter a mesma razão de aspecto**. Se `foto-400.jpg` é 4:3 e `foto-800.jpg` é 16:9, a troca de candidato (ex.: ao girar o aparelho) causa layout shift. web.dev mostra o padrão certo: um único `width`/`height` no `<img>` e todas as variantes proporcionais.

---

## 5. FORMATOS: AVIF vs WebP HOJE

### 5.1 Suporte de navegador

**AVIF** — global **93,42%** (<https://caniuse.com/avif>, dados de junho/2026):

| Navegador | Versão mínima |
|---|---|
| Chrome | 85+ |
| Edge | 121+ |
| Firefox | 93+ |
| Safari desktop | 16.4+ |
| Safari iOS | 16.0+ |
| Samsung Internet | 14.0+ |
| Chrome Android | ✅ |
| Opera Mini | ❌ nunca |

**WebP** — global **96,15%** (<https://caniuse.com/webp>, dados de junho/2026):

| Navegador | Versão mínima |
|---|---|
| Chrome | 32+ |
| Edge | 18+ |
| Firefox | 65+ |
| Safari desktop | 16.0+ (parcial desde 14) |
| Safari iOS | 14+ |
| Samsung Internet | ✅ |
| IE | ❌ |

Os ~3 pontos de diferença (93,4% vs 96,2%) são justamente Android antigo e iOS 14–15 — que é **exatamente o perfil do celular barato brasileiro**. Daí a regra: AVIF **com** fallback WebP, nunca AVIF sozinho.

### 5.2 Ganho real de tamanho

Fonte primária: **web.dev, "Deploying AVIF for more responsive websites"** (<https://web.dev/articles/avif-updates-2023>), citando dados do Imgix:
- **60% de economia contra JPEG**
- **35% de economia contra WebP**
- Contra GIF animado: mediana de ~86% de economia

Números de blogs secundários variam entre 20% e 40% de ganho do AVIF sobre WebP; **não confirmados em fonte primária** — trate os 35% do Imgix/web.dev como a estimativa citável.

### 5.3 Custo de decodificação em celular fraco — quanto exatamente?

**O mecanismo (confirmado):** AVIF é um quadro de AV1. Aparelhos sem decodificador **de hardware** para AV1 caem em decodificação por software, que é mais cara em CPU que JPEG/WebP. Suporte de hardware a AV1 chegou a partir de Snapdragon 8 Gen 1 e Tensor G2 — ou seja, **os aparelhos de R$700–R$1.200 vendidos no Brasil (Galaxy A0x, Moto G3x) muito provavelmente decodificam AVIF por software.**

**Quanto isso custa em milissegundos: NÃO CONFIRMADO.** Não encontrei benchmark em fonte primária (Chrome team, WebKit, Mozilla) com números de decode de AVIF vs WebP em SoC de entrada. Os números que circulam (2–3× mais lento que JPEG; "centenas de ms em aparelhos velhos"; "15ms WebP vs 22ms AVIF") vêm de blogs de ferramentas de compressão e **não são citáveis**. Não repita esses números.

O que a fonte primária diz sobre **encoding** (não decoding): o web.dev classifica o AVIF como *"the slowest of all encoders for on-the-fly performance"* comparado a WebP e MozJPEG. Isso é irrelevante aqui — este site gera as imagens em build time, não on-the-fly.

**O que fazer sem o número:** **meça você mesmo** no aparelho real que importa. O `PerformanceObserver` de `element` timing, ou simplesmente o painel Performance do DevTools conectado por `chrome://inspect`, mostra a tarefa `Decode Image` na main thread. Se `Decode Image` do hero passar de ~50ms num Moto G de entrada, o AVIF não está valendo a pena ali.

```js
// Mede o tempo entre "começou a renderizar" e o load da imagem no aparelho real.
new PerformanceObserver((l) => {
  for (const e of l.getEntries()) {
    if (e.initiatorType === 'img') {
      console.log(e.name.split('/').pop(),
        'download', Math.round(e.responseEnd - e.startTime) + 'ms',
        'bytes', e.encodedBodySize)
    }
  }
}).observe({ type: 'resource', buffered: true })
```

### 5.4 Quando NÃO vale AVIF

- **Imagens pequenas (ícones, avatares, thumbs < ~10KB).** O overhead de container do AVIF come o ganho, e às vezes fica maior que o WebP. Confirme arquivo a arquivo.
- **Gráficos/PNG com poucas cores, texto, screenshots.** WebP lossless costuma ganhar; AVIF lossy borra texto.
- **Imagem que não é o LCP e já é pequena.** Você paga decode extra por poucos KB.
- **Se o hero é o LCP num aparelho de entrada** e o `Decode Image` estiver alto na medição do item 5.3 — nesse caso a menor latência total pode vir do WebP, porque LCP mede *render*, não *download*.
- **Se você não tem pipeline de build.** Gerar AVIF na mão para 3 breakpoints × N fotos é insustentável.

### 5.5 O código

```html
<picture>
  <source type="image/avif"
          srcset="festa-400.avif 400w, festa-800.avif 800w, festa-1200.avif 1200w"
          sizes="(min-width: 1024px) 283px, calc(50vw - 24px)">
  <source type="image/webp"
          srcset="festa-400.webp 400w, festa-800.webp 800w, festa-1200.webp 1200w"
          sizes="(min-width: 1024px) 283px, calc(50vw - 24px)">
  <img src="festa-800.jpg"
       srcset="festa-400.jpg 400w, festa-800.jpg 800w, festa-1200.jpg 1200w"
       sizes="(min-width: 1024px) 283px, calc(50vw - 24px)"
       width="1200" height="900" loading="lazy" decoding="async"
       class="aspect-4/3 w-full object-cover" alt="…">
</picture>
```

Script de geração (build time, `sharp` — o Next já traz `sharp` como dependência opcional):

```js
// scripts/gerar-imagens.mjs — rode antes do `next build`
import sharp from 'sharp'
import { readdir } from 'node:fs/promises'

const LARGURAS = [400, 600, 800, 1200, 1600, 2000]
const ENTRADA = 'public/fotos-originais'
const SAIDA = 'public/fotos'

for (const arquivo of await readdir(ENTRADA)) {
  const base = arquivo.replace(/\.\w+$/, '')
  const orig = sharp(`${ENTRADA}/${arquivo}`)
  const { width } = await orig.metadata()
  for (const w of LARGURAS.filter((w) => w <= width)) {
    const r = orig.clone().resize({ width: w })
    await r.clone().avif({ quality: 55 }).toFile(`${SAIDA}/${base}-${w}.avif`)
    await r.clone().webp({ quality: 78 }).toFile(`${SAIDA}/${base}-${w}.webp`)
    await r.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${SAIDA}/${base}-${w}.jpg`)
  }
}
```

**PEGADINHA nº 12:** o `<source type>` é avaliado **antes** do `media`. Se você usa AVIF **e** art direction, precisa de um `<source>` por combinação (formato × recorte) — foi por isso que o hero da seção 2.2 tem 5 `<source>`. Fica verboso; é o preço.

**PEGADINHA nº 13:** o servidor precisa mandar `Content-Type: image/avif`. Alguns hosts estáticos antigos não conhecem a extensão e mandam `application/octet-stream`, e aí o browser mostra download em vez de imagem. Teste com `curl -I`.

---

## 6. PRIORIDADE DE CARREGAMENTO: `fetchpriority`, `loading`, `decoding`, preload

### 6.1 `fetchpriority="high"` no LCP

**Por que é necessário** (web.dev, <https://web.dev/articles/fetch-priority>): *"Images inside the viewport typically start at a `Low` priority. After the layout is complete, Chrome discovers that they're in the viewport and boosts their priority."* Ou seja, **o hero começa em prioridade baixa e só sobe depois do layout** — atrás de CSS e scripts. `fetchpriority="high"` corta essa espera.

**Resultado medido:** no Google Flights, aplicando alta prioridade à imagem de fundo do hero, **LCP caiu de 2,6s para 1,9s**.

**Suporte:** Chrome 102+, Edge 102+, Firefox 132+, Safari 17.2+. Mesma fonte.

**Regras:**
- É **hint, não ordem**: *"The browser tries to respect the developer's preference, but it can also apply its resource priority preferences."*
- **Um só elemento.** web.dev: *"Setting a high priority on more than one or two images makes priority setting unhelpful in reducing LCP."* Prioridade é um jogo de soma zero — subir a imagem desce a fonte ou o script.
- `fetchpriority="low"` é a ferramenta certa para carrossel: web.dev nota que imagens de carrossel podem estar "perto o bastante" para o browser as promover a `high` **mesmo com `loading="lazy"`**, e por isso *"`fetchpriority="low"` is the correct solution"*.

✅ O hero deste projeto **já tem** `fetchPriority="high"` (`app/page.tsx:35`). Está certo. Confirme que é o único no documento.

### 6.2 `loading="lazy"` — corretamente

**Thresholds do Chrome** (web.dev, <https://web.dev/articles/browser-level-image-lazy-loading>, ajuste de julho/2020):
- conexão rápida (4G): **1250px** de distância do viewport (era 3000px)
- conexão lenta (3G ou pior): **2500px** (era 4000px)

Efetividade medida: *"Experiments in Chrome on Android suggest that on 4G, 97.5% of lazy-loaded images were fully loaded within 10ms of becoming visible."*

**A regra absoluta:** *"Don't lazy-load images that are likely to be in-viewport when the page loads, especially LCP images."* Uma `loading="lazy"` no LCP adiciona um round-trip inteiro ao LCP. É o *anti-pattern* mais caro que existe em imagem.

**Suporte:** Chrome 77+, Edge 79+, Firefox 121+, Safari 16.4+. Navegadores sem suporte simplesmente ignoram o atributo.

**Detalhe pouco conhecido (MDN):** *"Loading is only deferred when JavaScript is enabled"* — é medida anti-tracking. Com JS desligado, tudo carrega eager.

**Auditoria neste projeto:** o hero está `eager` (correto — não tem `loading="lazy"`). Todas as demais têm `lazy`. ⚠️ Verifique se em `<480px` alguma imagem do primeiro grid entra no viewport inicial: se a primeira foto de `FOTOS_EVENTO.slice(1,5)` estiver visível na dobra em algum aparelho, ela vira candidata a LCP e o `lazy` a atrasa.

### 6.3 `decoding="async"`

MDN: `async` = *"Decode the image asynchronously, after rendering and presenting the other DOM content. The next paint does not wait for the image to decode."* Padrão é `auto`.

MDN também é honesto sobre o tamanho do efeito: *"On static `<img>` elements, the effect can be difficult to perceive visually… The blocking of rendering while decoding happens is often quite small."* O ganho aparece principalmente ao **inserir `<img>` via JavaScript**.

Custo zero, sem risco. Mantenha em tudo. ✅ O projeto já usa em quase tudo.

**PEGADINHA nº 14:** `decoding="async"` no LCP é **discutível**. Ele permite que o primeiro paint aconteça sem a imagem — o que melhora FCP mas pode *atrasar* o LCP se o decode for caro (voltamos ao AVIF em celular fraco). Se for testar uma variável, teste essa: `decoding="sync"` no hero vs `async`, medindo LCP no aparelho real.

### 6.4 Preload de imagem de hero

**Quando você NÃO precisa:** web.dev — *"It's best to avoid preloading whenever possible by including all images in the initial HTML file."* Se o hero é um `<img>` no HTML estático (é o caso deste projeto, `output: 'export'`), o preload scanner já o descobre imediatamente. **`fetchpriority="high"` sozinho basta.**

**Quando você PRECISA:** quando a imagem é `background-image` no CSS, ou é injetada por JS. web.dev: *"Preload is still required for early discovery of LCP images included as CSS backgrounds. To boost your background images' priority, include `fetchpriority='high'` on the preload."*

**Preload de imagem responsiva** — use `imagesrcset`/`imagesizes`, com a mesma sintaxe do `<img>`:

```html
<link rel="preload" as="image"
      imagesrcset="hero-wide-1280.webp 1280w, hero-wide-1920.webp 1920w, hero-wide-2560.webp 2560w"
      imagesizes="100vw"
      fetchpriority="high">
```

**Suporte:**
- `link rel=preload`: global **95,29%**; Chrome 50+, Edge 79+, Safari 11.1+, Firefox 85+. <https://caniuse.com/link-rel-preload>
- `imagesrcset` no `<link>`: global **93,16%**; Chrome 73+, Edge 79+, Firefox 78+, **Safari 17.2+**, Samsung Internet 11.1+. <https://caniuse.com/mdn-html_elements_link_imagesrcset> (junho/2026)

**PEGADINHA nº 15:** *"Preload is a mandatory fetch, not a hint"* (web.dev). Preload de uma imagem que o `<picture>` acaba não escolhendo = **download inteiro jogado fora**. Com art direction, o preload precisa replicar exatamente os mesmos `media`/`type`, ou não faça preload nenhum.

**PEGADINHA nº 16:** neste projeto, `Blackout.tsx` e as animações de entrada podem atrasar a pintura do hero. Se houver `opacity: 0` inicial no container do hero, o LCP conta a partir de quando fica visível — `fetchpriority` não salva de animação de entrada. O comentário no `app/page.tsx:44-46` mostra que a equipe já sabe disso para o H1; vale a mesma checagem para a imagem.

---

## 7. METODOLOGIA DE TESTE DE RESPONSIVIDADE

### 7.1 A lista de viewports que realmente importa no Brasil

**Fonte primária: StatCounter Global Stats — Mobile Screen Resolution Stats in Brazil, julho/2026.**
<https://gs.statcounter.com/screen-resolution-stats/mobile/brazil>

| Resolução (CSS px) | Participação BR | Aparelhos típicos |
|---|---|---|
| **414 × 896** | **9,07%** | iPhone XR / 11 / 11 Pro Max |
| **384 × 832** | **5,09%** | Android intermediário/entrada |
| **412 × 915** | **5,03%** | Galaxy A / Pixel |
| **390 × 844** | **4,83%** | iPhone 12/13/14 |
| **393 × 873** | **4,32%** | Pixel 7/8, Galaxy S recentes |
| **432 × 960** | **3,75%** | Android grande |

> A página do StatCounter só expõe as 6 primeiras linhas ao fetch. Resoluções menores (360×640, 360×800, 375×667) **não apareceram nesse recorte** — não confirmado se estão abaixo de 3,75% ou apenas não renderizadas. Trate 360px como piso defensivo mesmo assim: é a largura CSS clássica de Android de entrada e de tela dividida.

**Contexto de aparelhos — StatCounter, Mobile Vendor Market Share Brazil, julho/2026** (<https://gs.statcounter.com/vendor-market-share/mobile/brazil>):

| Fabricante | Participação |
|---|---|
| *Unknown* | 31,83% |
| Apple | 22,41% |
| Samsung | 20,32% |
| Motorola | 13,56% |
| Xiaomi | 8,77% |
| Google | 1,43% |

Samsung + Motorola + Xiaomi = **42,65%** — e é onde vivem os Galaxy A0x e Moto G3x baratos, de tela estreita e CPU fraca. Aqueles 31,83% de "Unknown" são majoritariamente Android também.

**Contexto de navegador — StatCounter, Mobile Browser Market Share Brazil, julho/2026** (<https://gs.statcounter.com/browser-market-share/mobile/brazil>):

| Navegador | Participação |
|---|---|
| Chrome | 77,79% |
| **Safari** | **17,16%** |
| Samsung Internet | 3,66% |
| Opera | 0,49% |
| Firefox | 0,33% |
| Brave | 0,25% |

**Um em cada seis visitantes móveis é WebKit.** É esse número que veta `object-view-box` e que exige testar `sizes="auto"` com fallback.

**A lista final de teste, em ordem de prioridade:**

| # | Viewport CSS | DPR | Por quê | Prioridade |
|---|---|---|---|---|
| 1 | **320 × 568** | 2 | Piso de WCAG 1.4.10 (reflow). Se passa aqui, passa em tudo | 🔴 obrigatório |
| 2 | **360 × 800** | 2–3 | Android de entrada; piso realista brasileiro | 🔴 obrigatório |
| 3 | **380 × 820** | 3 | A largura crítica definida no briefing | 🔴 obrigatório |
| 4 | **384 × 832** | 2–3 | 2º lugar no StatCounter BR (5,09%) | 🔴 obrigatório |
| 5 | **390 × 844** | 3 | iPhone 12–14 (4,83%) — **e é Safari** | 🔴 obrigatório |
| 6 | **414 × 896** | 2 | 1º lugar no StatCounter BR (9,07%) — Safari | 🔴 obrigatório |
| 7 | **412 × 915** | 2,6 | Galaxy A / Pixel (5,03%) | 🟠 alta |
| 8 | **844 × 390** | 3 | **Celular deitado** (iPhone, landscape) | 🟠 alta |
| 9 | **768 × 1024** | 2 | iPad retrato — breakpoint `md` | 🟡 média |
| 10 | **1024 × 768** | 2 | iPad deitado — cai no breakpoint `lg` do projeto | 🟡 média |
| 11 | **1280 × 800** | 1 | Notebook pequeno; base do teste de zoom 400% | 🟡 média |
| 12 | **1920 × 1080** | 1 | Desktop comum | 🟢 baixa |

### 7.2 DevTools device mode — e por que ele mente

**A própria doc do Chrome avisa.** Documentação oficial de *Simulate mobile devices with device mode* (<https://developer.chrome.com/docs/devtools/device-mode>): o modo é uma *"**first-order approximation** of how your page looks and feels on a mobile device"*, e a doc acrescenta que ele **não simula a arquitetura de CPU mobile**, recomendando teste em aparelho físico.

**O que ele simula bem:**
- dimensões de viewport (responsivo ou por modelo)
- device pixel ratio (DPR)
- throttling de rede (Fast/Slow 3G) e de CPU (4×, 6×, 20×)
- user agent string
- orientação (retrato/paisagem)
- geolocalização, sensores
- eventos de toque em vez de clique
- device frames

**O que ele NÃO simula — as 7 mentiras:**

1. **Não é WebKit.** Emular um iPhone no Chrome continua rodando **Blink**. Se o Safari não suporta um recurso, o modo iPhone do Chrome **não vai te contar** — ele suporta. Consequência direta: `sizes="auto"`, `object-view-box`, `imagesrcset` e qualquer coisa em transição **passam falsamente** no device mode.
2. **Não renderiza fontes como o sistema.** Antialiasing, hinting e métricas do macOS/Windows ≠ Android/iOS. Textos que "cabem" em 380px no DevTools podem estourar uma linha no aparelho — e uma linha a mais numa `<h1>` `max-w-[16ch]` muda tudo.
3. **Não tem a barra de URL que some.** Em celular real, a altura do viewport **muda durante o scroll**. `min-h-[88svh]` do hero se comporta diferente. Nenhuma emulação reproduz isso.
4. **Não tem a barra de rolagem certa.** Desktop tem scrollbar clássica ocupando ~15px; celular tem overlay ocupando 0. Isso desloca `100vw` e o cálculo de `sizes`.
5. **CPU throttling é um multiplicador, não um SoC.** 4× num M2 não é um Snapdragon 680. Decode de AVIF, blur, `backdrop-filter` e as animações do projeto se comportam de outro jeito.
6. **Não tem os gestos reais.** Pinch-zoom, scroll com momentum, overscroll, `-webkit-overflow-scrolling` — nada disso é fiel.
7. **Não tem a UI do sistema.** Notch, Dynamic Island, barra de gestos, teclado virtual que come 40% da tela. `env(safe-area-inset-*)` retorna 0 no device mode.

**Como usar mesmo assim (ele é útil para triagem):**
- Prefira o modo **"Responsive"** com largura digitada à mão, não os presets de modelo. Presets dão falsa confiança.
- Arraste devagar de 1920 até 320 com a régua ativa e observe onde o layout quebra — isso encontra 80% dos bugs em 2 minutos.
- Ative **"Show media queries"** (menu ⋮ do device toolbar) para ver as barras de breakpoint.
- Sempre com **Network: Slow 4G + CPU: 4× slowdown** ligados. Testar em rede local mente sobre a ordem de carregamento das imagens.
- Ative **"Coverage"** e **"Rendering → Paint flashing"** para achar reflow causado por imagem sem `width`/`height`.

**Regra de ouro:** DevTools **descobre** bugs de layout. Só o aparelho real **confirma** que não há bug.

### 7.3 Landscape em celular e altura pequena — o que quebra

Celular deitado é ~**844 × 390**: largura de tablet, altura de nada. É o viewport mais esquecido e o que mais quebra.

**O que quebra:**

1. **`min-h-[88svh]` no hero.** Em 390px de altura, 88svh = ~343px. O bloco de conteúdo do hero (`pt-28 pb-16` = 112+64 = 176px de padding + eyebrow + h1 de 2 linhas + parágrafo de 3 linhas + 2 CTAs) **não cabe em 343px** e transborda ou empurra. Como o container é `min-h`, ele cresce — mas a imagem de fundo (`absolute inset-0` + `object-cover`) fica com razão ~2,2:1, um corte horizontal extremo.
2. **Breakpoints por largura entram no modo errado.** 844px de largura ativa o `md:` do Tailwind. O site acha que é tablet e serve layout de tablet num aparelho com 390px de altura.
3. **Nada de conteúdo cabe acima da dobra.** Header + hero + CTA competem por 390px, dos quais a barra de URL come ~60–100.
4. **Notch/Dynamic Island viram cortes laterais.** Em paisagem, `safe-area-inset-left` e `safe-area-inset-right` deixam de ser 0. O projeto já usa `viewportFit: 'cover'` (`app/layout.tsx:34`), então **é obrigação dele** tratar os insets — senão texto vai para debaixo do notch. Fonte: <https://webkit.org/blog/7929/designing-websites-for-iphone-x/>.
5. **Teclado virtual.** Ao focar um input em paisagem, sobra ~150px de altura útil. Modais e menus fixos ficam inalcançáveis.
6. **Menus `h-screen`.** O `MenuLiquido.tsx` — se usa altura de tela cheia, em paisagem os itens saem da tela sem scroll.

**As correções:**

```css
/* 1. Nunca trave altura por vh puro. Use svh/dvh + max-height de escape. */
.hero {
  min-height: 88svh;
}
@media (orientation: landscape) and (max-height: 30rem) {
  .hero {
    min-height: 0;          /* deixa o conteúdo mandar */
    padding-block: 3rem 2.5rem;
  }
}

/* 2. Respeite as safe areas — obrigatório com viewport-fit=cover */
.hero-conteudo {
  padding-left:  max(1.25rem, env(safe-area-inset-left));
  padding-right: max(1.25rem, env(safe-area-inset-right));
  padding-top:   max(7rem,    env(safe-area-inset-top));
}

/* 3. Qualquer overlay/menu de tela cheia precisa poder rolar */
.menu-fullscreen {
  height: 100dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

**Unidades de viewport — suporte:** `svh`/`lvh`/`dvh` (e as variantes `sv*`, `lv*`, `dv*`): global **92,52%**; Chrome/Edge **108+**, Firefox **101+**, Safari **15.4+**, Safari iOS **15.4+**, Samsung Internet **21+**. Sem suporte: IE, Opera Mini, UC Browser.
Fonte: <https://caniuse.com/viewport-unit-variants>.

- `svh` = viewport **pequeno** (barra de URL visível) → use para "caber na primeira tela sem cortar"
- `lvh` = viewport **grande** (barra recolhida) → use para imersão total
- `dvh` = **dinâmico**, muda durante o scroll → cuidado: recalcula layout a cada mudança da barra; em layout complexo dá jank

O hero do projeto usa `88svh` — **escolha correta**, é a unidade que garante caber na tela inicial.

**PEGADINHA nº 17:** teste paisagem **rolando a página**, não parado. É durante o scroll que a barra de URL some e a altura muda. Emulação não reproduz isso.

### 7.4 Zoom de texto a 200% (WCAG 1.4.4)

**Critério exato — Nível AA** (<https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html>):

> *"Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality."*

O critério vale **para cada variação da página apresentada automaticamente para cada tamanho de tela** — ou seja, cada breakpoint precisa passar.

**O que REPROVA:**
- *"resizing visually rendered text up to 200 percent causes the text, image or controls to be clipped, truncated or obscured"* — texto cortado, truncado ou escondido
- controles de formulário baseados em texto que não crescem junto
- uso incorreto de unidades de viewport para dimensionar texto (`font-size: 4vw` **não** responde ao zoom de texto — é o erro clássico)
- **`user-scalable=no` ou `maximum-scale=1` no meta viewport** — desabilitar pinch-zoom é violação direta

✅ O `app/layout.tsx:30–35` tem `width: 'device-width'`, `initialScale: 1`, e **não** tem `maximumScale` nem `userScalable` — **passa** no pré-requisito.

**Como testar — dois caminhos, e o critério aceita qualquer um que funcione:**

| Método | Como | O que expõe |
|---|---|---|
| **Zoom de página** | `Ctrl`/`Cmd` + `+` até 200% | Overflow horizontal, elementos fixos que cobrem conteúdo |
| **Zoom SÓ de texto** (mais severo) | Firefox: **Ver → Zoom → Ampliar Apenas o Texto**, depois `Ctrl` `+` ×4 até 200% | Caixas com `height` em px, `overflow: hidden`, `line-height` travado, truncamento com `text-overflow` |

O zoom só de texto é o que realmente encontra bugs, porque **não dispara os breakpoints do CSS** — a caixa fica do mesmo tamanho e o texto cresce dentro dela. Fontes: <https://a11y-guidelines.orange.com/en/articles/zoom/> e <http://adrianroselli.com/2019/12/responsive-type-and-zoom.html>.

**Onde este projeto tem risco (verificar):**
- `max-w-[16ch]` no `<h1>` — `ch` escala com a fonte, então isso é seguro; mas confirme se o container pai não trava.
- `min-h-[88svh]` no hero — em zoom 200% de texto, o conteúdo dobra de altura dentro de uma caixa `min-h`; deve crescer (é `min-h`, não `h`) — confirmar.
- `aspect-4/3` / `aspect-16/10` nos cards: se houver texto **dentro** de caixa com `aspect-ratio` fixo, ele vaza a 200%. Verificar `CardServico.tsx`.
- Qualquer `text-overflow: ellipsis` ou `line-clamp` — a 200% eles escondem conteúdo, o que é *"loss of content"*.
- Botões e o CTA de WhatsApp com `padding` em px e texto que cresce: confirmar que não truncam.

### 7.5 Reflow a 320px CSS (WCAG 1.4.10)

**Critério exato — Nível AA** (<https://www.w3.org/WAI/WCAG22/Understanding/reflow.html>):

> *"Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for:*
> - *Vertical scrolling content at a width equivalent to **320 CSS pixels**;*
> - *Horizontal scrolling content at a height equivalent to **256 CSS pixels**.*
>
> *Except for parts of the content which require two-dimensional layout for usage or meaning."*

**Como testar (a equivalência oficial):** *"320 CSS pixels is equivalent to a starting viewport width of 1280 CSS pixels wide at 400% zoom."* Ou seja: janela do browser em **1280px de largura**, zoom de página em **400%**. Isso é mais fiel do que só arrastar a janela, porque também estressa o texto.

**Exceções permitidas:** conteúdo que **exige** layout bidimensional — *"images required for understanding (such as maps and diagrams), video, games, presentations, data tables (not individual cells), and interfaces where it is necessary to keep toolbars in view."*
Foto de festa **não é exceção**. Nem um grid de cards. Nem uma tabela de rider técnico com poucas colunas (a exceção cobre "tabelas de dados", mas o ônus é seu de mostrar que ela precisa das duas dimensões).

**O que REPROVA:**
- **qualquer** barra de rolagem horizontal na página inteira
- conteúdo cortado, sobreposto ou inalcançável
- funcionalidade perdida (botão fora da tela, menu que não abre)

**O detector de estouro horizontal — cole no console a 320px:**

```js
// Lista todo elemento que passa da borda direita do documento.
const limite = document.documentElement.clientWidth
console.table(
  [...document.querySelectorAll('*')]
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.right > limite + 1 || r.left < -1)
    .map(({ el, r }) => ({
      tag: el.tagName.toLowerCase(),
      classe: (el.className || '').toString().slice(0, 60),
      esquerda: Math.round(r.left),
      direita: Math.round(r.right),
      estouro: Math.round(r.right - limite) + 'px',
    }))
)
```

E o teste rápido de "existe scroll horizontal?":

```js
document.documentElement.scrollWidth > document.documentElement.clientWidth
  ? `❌ FALHA: estoura ${document.documentElement.scrollWidth - document.documentElement.clientWidth}px`
  : '✅ OK: sem scroll horizontal'
```

**Onde este projeto tem risco a 320px (verificar):**
- `grid-cols-2 gap-2` com `px-5`: cada coluna fica com (320−40−8)/2 = **136px**. Foto de festa a 136px é ilegível — considere `grid-cols-1` abaixo de 380px.
- `col-span-2 aspect-16/10` no mosaico: 280px de largura por 175px de altura. OK, mas confirme o conteúdo.
- `LequeEquipe.tsx` — um "leque" de cards sobrepostos com transform é o candidato nº 1 a estourar horizontalmente. **Teste esse primeiro.**
- `Palco.tsx` com miniaturas em linha: se for scroll horizontal **intencional e contido**, tudo bem (scroll em um eixo dentro de um container não viola 1.4.10, desde que a página não role nos dois eixos). Se vazar para o `<body>`, reprova.
- `max-w-[46ch]` no parágrafo do hero: `ch` é seguro, mas com `px-5` sobram 280px — confirme que nenhuma palavra longa ("sonorização") estoura. Adicione `hyphens: auto` + `lang="pt-BR"` se necessário.

### 7.6 Testar num Android real via `chrome://inspect` — passo a passo

Fonte: <https://developer.chrome.com/docs/devtools/remote-debugging/>

**No aparelho Android:**
1. **Ajustes → Sobre o telefone** → toque **7 vezes** em "Número da versão" (ou "Número da compilação") para liberar as Opções do desenvolvedor.
2. **Ajustes → Sistema → Opções do desenvolvedor** → ative **Depuração USB**.
3. Abra o **Chrome** no aparelho.

**No Mac/PC:**
4. Abra o Chrome e vá em **`chrome://inspect#devices`**.
5. Confirme que **"Discover USB devices"** está marcado.
6. Conecte o cabo USB **direto na máquina** (sem hub).
7. Na primeira conexão, **aceite o prompt de autorização de depuração** que aparece no celular ("Permitir depuração USB?" → marque "Sempre permitir deste computador").
8. O modelo do aparelho aparece na lista.
9. Na caixa **"Open tab with url"**, cole a URL e clique **Open** — a página abre numa aba nova no celular.
10. Clique em **Inspect** ao lado da URL. O DevTools abre no desktop, **inspecionando o Chrome real do aparelho real**.

**O que fazer uma vez conectado:**
- **Toggle Screencast** — espelha a tela do celular dentro do DevTools; *"Clicks translate into taps, firing proper touch events on the device. Keystrokes on your computer are sent to the device."* Ótimo para gravar evidência.
- **Aba Network** — veja **qual variante do `srcset` foi realmente escolhida** naquele aparelho, com aquele DPR. Isto é insubstituível: é o único jeito de provar que o `sizes` está certo.
- **Aba Performance** → grave um carregamento → procure as tarefas **`Decode Image`** na main thread. É aqui que você mede o custo real do AVIF (seção 5.3).
- **Aba Elements** → hover num elemento realça no aparelho; o botão "Select Element" deixa escolher tocando na tela.
- **Port forwarding** (em `chrome://inspect`) para apontar o celular para o seu `next dev` local: mapeie a porta do dispositivo para `localhost:3000` da máquina, e acesse `localhost:3000` **no celular**.

**Troubleshooting oficial:**
- Conecte direto, sem hub USB.
- Desconecte e reconecte o cabo **com as duas telas desbloqueadas**.
- Verifique se o cabo é de dados (muitos cabos baratos são só de carga).
- No Windows, instale o driver USB OEM do fabricante.
- Para resetar: **Opções do desenvolvedor → Revogar autorizações de depuração USB**.

**O aparelho certo para comprar/pedir emprestado:** um **Motorola Moto G** ou **Samsung Galaxy A0x** de entrada, de 1–2 gerações atrás. Testar num Pixel topo de linha não descobre nada. É esse perfil que responde por boa parte dos 42,65% de Samsung+Motorola+Xiaomi do StatCounter.

### 7.7 Testar num iPhone real via Safari Web Inspector — passo a passo

Fontes: <https://developer.apple.com/library/archive/documentation/AppleApplications/Conceptual/Safari_Developer_Guide/GettingStarted/GettingStarted.html> e guias derivados.

**No iPhone:**
1. Se iOS recente: **Ajustes → Privacidade e Segurança → Modo de Desenvolvedor** → ative (o aparelho reinicia). Sem isso, o Inspetor da Web pode nem aparecer.
2. **Ajustes → Apps → Safari → Avançado** (em iOS mais antigos: **Ajustes → Safari → Avançado**) → ligue **Inspetor da Web**.

**No Mac:**
3. **Safari → Ajustes → Avançado** → marque **"Mostrar recursos para desenvolvedores web"** (em versões antigas: "Mostrar menu Desenvolvedor na barra de menus").
4. Conecte o iPhone por cabo. Na primeira vez, toque em **Confiar** no iPhone.
5. Abra a página no Safari do iPhone, **numa aba normal (não Navegação Privada)**.
6. No Mac: menu **Desenvolvedor → [nome do iPhone] → [título da página]**.
7. O Web Inspector abre com Console, Elementos, Rede, Fontes, Armazenamento — inspecionando o **WebKit real**.

**Por que isto não é opcional neste projeto:**
- **17,16% do tráfego mobile brasileiro é Safari** (StatCounter, jul/2026). É o único jeito de saber se `sizes="auto"` funcionou.
- É o único jeito de ver `env(safe-area-inset-*)` com valor real (o projeto usa `viewportFit: 'cover'`).
- É o único jeito de ver a barra de URL do Safari sumindo e o `svh` mudando de verdade.
- Suporte a AVIF em Safari começa em **16.4 desktop / 16.0 iOS** — em iPhone mais antigo, o fallback WebP/JPEG do `<picture>` **precisa** ser verificado aqui.

**Alternativa sem Mac:** **Simulador do iOS** via Xcode (roda WebKit de verdade, mas em CPU de Mac) ou serviço de device farm (BrowserStack/LambdaTest). O Simulador é bem melhor que o device mode do Chrome, porque pelo menos o motor é o certo.

**PEGADINHA nº 18:** o Simulador do iOS usa o WebKit **do Mac**, não o do iPhone. Diferenças de versão e de performance permanecem. Para performance, só aparelho físico.

---

## CHECKLIST DE AUDITORIA

Rode em **uma página por vez**. Marque `OK` / `FALHA` / `N/A`. Grave a largura e o aparelho onde testou.

### A. Marcação de imagem

| # | Item | Como verificar | OK / FALHA |
|---|---|---|---|
| A1 | Toda `<img>` tem `alt` (vazio `alt=""` se decorativa) | `$$('img:not([alt])')` no console → deve ser `[]` | ☐ |
| A2 | Toda `<img>` tem `width` **e** `height` no HTML | `$$('img:not([width]),img:not([height])')` → `[]` | ☐ |
| A3 | `width`/`height` batem com a razão real do arquivo | Comparar com `naturalWidth`/`naturalHeight` | ☐ |
| A4 | Toda imagem fluida tem `srcset` com descritores `w` | Inspecionar cada `<img>` | ☐ |
| A5 | Todo `srcset` com `w` tem `sizes` correspondente | `srcset` com `w` sem `sizes` = bug | ☐ |
| A6 | `srcset` **não** mistura descritores `w` e `x` | Inválido pela spec | ☐ |
| A7 | Nenhum `sizes` usa porcentagem (`50%`) | Proibido; use `vw` | ☐ |
| A8 | Media conditions do `sizes` estão na ordem certa | Primeira que casa vence | ☐ |
| A9 | Todas as variantes do `srcset` têm a **mesma** razão de aspecto | Senão dá CLS ao trocar candidato | ☐ |
| A10 | `sizes` medido bate com a largura real (script §1.3) | `desperdicio` ≤ ~1,3× em cada breakpoint | ☐ |
| A11 | `sizes="auto"` só aparece junto de `loading="lazy"` | Inválido em imagem eager | ☐ |
| A12 | Todo `sizes="auto"` tem fallback descritivo depois | `sizes="auto, (min-width:…) …, …"` | ☐ |
| A13 | `<picture>` tem `class`/`alt`/`loading` no `<img>`, não no wrapper | Erro clássico | ☐ |
| A14 | `<picture>` usado como bloco tem `display:block` + tamanho | Senão o `h-full` do `<img>` quebra | ☐ |
| A15 | `media` dos `<source>` não deixa buraco entre breakpoints | Ex.: 799px / 800px | ☐ |

### B. Recorte e enquadramento

| # | Item | Como verificar | OK / FALHA |
|---|---|---|---|
| B1 | Nenhum rosto cortado em 320 / 360 / 380 / 390 / 414 px | Olhar cada foto com pessoas | ☐ |
| B2 | Fração visível de cada `object-cover` ≥ 60% em ambos os eixos | Script da §3.2 | ☐ |
| B3 | Onde a fração cai abaixo disso, existe `<picture media>` com recorte físico | Não `object-position` | ☐ |
| B4 | `object-position` foi **medido**, não chutado | Script da §3.2 | ☐ |
| B5 | Nenhuma imagem distorcida (esticada) | `object-fit` presente onde há `h-full`+`w-full` | ☐ |
| B6 | **Não** há `object-view-box` em produção | 0% de Safari/Firefox | ☐ |
| B7 | Hero verificado em **paisagem** (844×390) sem corte destrutivo | Aparelho real | ☐ |

### C. Layout shift (CLS)

| # | Item | Como verificar | OK / FALHA |
|---|---|---|---|
| C1 | CLS < 0,1 em 4G lento + CPU 4× | Lighthouse mobile | ☐ |
| C2 | Nada pula ao carregar as imagens | DevTools → Performance → Layout Shift | ☐ |
| C3 | Onde há `aspect-ratio` no CSS, existe `height:auto` (ou `object-fit`) | Sem distorção | ☐ |
| C4 | Fontes com `font-display: swap` + `size-adjust` | Texto sobre imagem não pula | ☐ |
| C5 | Nenhum `img { width:100% }` sem `height:auto` | Preflight do Tailwind cobre, salvo override | ☐ |

### D. Carregamento e prioridade

| # | Item | Como verificar | OK / FALHA |
|---|---|---|---|
| D1 | Existe **exatamente uma** imagem com `fetchpriority="high"` | `$$('[fetchpriority="high"]').length === 1` | ☐ |
| D2 | Essa imagem é o LCP de verdade | Lighthouse → "Largest Contentful Paint element" | ☐ |
| D3 | O LCP **não** tem `loading="lazy"` | Regra absoluta | ☐ |
| D4 | Toda imagem abaixo da dobra tem `loading="lazy"` | Em **320px de largura**, onde a dobra é mais alta | ☐ |
| D5 | Toda imagem tem `decoding="async"` (exceto talvez o LCP) | — | ☐ |
| D6 | Não há preload de imagem já presente no HTML | Preload redundante desperdiça prioridade | ☐ |
| D7 | Se há preload de responsiva, usa `imagesrcset` + `imagesizes` idênticos ao `<img>` | Senão baixa duas vezes | ☐ |
| D8 | Nenhuma imagem é baixada e descartada | Network → nenhum arquivo sem uso | ☐ |
| D9 | LCP < 2,5s em 4G lento no **aparelho real** | `chrome://inspect` | ☐ |

### E. Formatos

| # | Item | Como verificar | OK / FALHA |
|---|---|---|---|
| E1 | Existe fallback WebP para todo AVIF | `<picture>` com dois `<source type>` | ☐ |
| E2 | Existe fallback JPEG/PNG no `<img src>` final | Para iOS < 14 e Opera Mini | ☐ |
| E3 | `Content-Type` correto para `.avif` e `.webp` | `curl -I` na URL | ☐ |
| E4 | Nenhuma foto grande servida como PNG | PNG só para gráficos/transparência dura | ☐ |
| E5 | `Decode Image` do LCP medido em Android de entrada | Performance via `chrome://inspect` | ☐ |
| E6 | Ícones/thumbs < 10KB **não** estão em AVIF | Overhead maior que ganho | ☐ |

### F. Viewports (rodar em cada largura)

| # | Viewport | Sem scroll horizontal | Sem texto cortado | Rostos inteiros | Toque ≥ 44px | Status |
|---|---|---|---|---|---|---|
| F1 | 320 × 568 | ☐ | ☐ | ☐ | ☐ | ☐ |
| F2 | 360 × 800 | ☐ | ☐ | ☐ | ☐ | ☐ |
| F3 | 380 × 820 | ☐ | ☐ | ☐ | ☐ | ☐ |
| F4 | 384 × 832 | ☐ | ☐ | ☐ | ☐ | ☐ |
| F5 | 390 × 844 (Safari) | ☐ | ☐ | ☐ | ☐ | ☐ |
| F6 | 414 × 896 (Safari) | ☐ | ☐ | ☐ | ☐ | ☐ |
| F7 | 412 × 915 | ☐ | ☐ | ☐ | ☐ | ☐ |
| F8 | **844 × 390 (paisagem)** | ☐ | ☐ | ☐ | ☐ | ☐ |
| F9 | 768 × 1024 | ☐ | ☐ | ☐ | ☐ | ☐ |
| F10 | 1024 × 768 | ☐ | ☐ | ☐ | ☐ | ☐ |
| F11 | 1280 × 800 | ☐ | ☐ | ☐ | ☐ | ☐ |
| F12 | 1920 × 1080 | ☐ | ☐ | ☐ | ☐ | ☐ |

### G. Acessibilidade responsiva (WCAG)

| # | Item | Critério | Como verificar | OK / FALHA |
|---|---|---|---|---|
| G1 | Meta viewport sem `user-scalable=no` / `maximum-scale` | 1.4.4 | Ver `app/layout.tsx` | ☐ |
| G2 | Pinch-zoom funciona no aparelho real | 1.4.4 | Testar com dois dedos | ☐ |
| G3 | Zoom de **página** a 200%: nada cortado/sobreposto | 1.4.4 | `Cmd`+`+` | ☐ |
| G4 | Zoom **só de texto** a 200%: nada cortado | 1.4.4 | Firefox → Ver → Zoom → Ampliar Apenas o Texto | ☐ |
| G5 | Nenhum `font-size` em `vw` puro | 1.4.4 | Buscar `vw` em font-size | ☐ |
| G6 | Nenhum `line-clamp`/`ellipsis` escondendo conteúdo a 200% | 1.4.4 | Inspecionar | ☐ |
| G7 | **1280px @ 400% zoom** (= 320 CSS px): sem scroll em 2 eixos | 1.4.10 | Script da §7.5 | ☐ |
| G8 | Nada perdido ou inalcançável a 320 CSS px | 1.4.10 | Navegar a página inteira | ☐ |
| G9 | Scroll horizontal, se existir, está **contido** num carrossel, não no `<body>` | 1.4.10 | `documentElement.scrollWidth` | ☐ |
| G10 | Altura de 256 CSS px (conteúdo horizontal) — se aplicável | 1.4.10 | Normalmente N/A em PT-BR | ☐ |
| G11 | `env(safe-area-inset-*)` tratado (projeto usa `viewport-fit=cover`) | — | iPhone com notch, em **paisagem** | ☐ |
| G12 | Alvos de toque ≥ 44×44 CSS px | 2.5.8 | Medir CTAs e menu | ☐ |

### H. Verificação em aparelho real (não emulação)

| # | Item | Aparelho | OK / FALHA |
|---|---|---|---|
| H1 | Página auditada num **Android de entrada real** via `chrome://inspect` | Moto G / Galaxy A | ☐ |
| H2 | Variante do `srcset` escolhida conferida na aba Network do aparelho | idem | ☐ |
| H3 | `Decode Image` do LCP medido na aba Performance | idem | ☐ |
| H4 | Página auditada num **iPhone real** via Safari Web Inspector | qualquer iPhone | ☐ |
| H5 | `sizes="auto"` conferido no Safari (funcionou ou caiu no fallback?) | iPhone | ☐ |
| H6 | Barra de URL sumindo durante o scroll não quebra o hero (`svh`) | ambos | ☐ |
| H7 | Rotação retrato ↔ paisagem não quebra nem baixa imagem desnecessária | ambos | ☐ |
| H8 | Testado em 4G real (não Wi-Fi) | ambos | ☐ |

---

## FONTES

**Especificação e referência**
- MDN — `<img>` (srcset, sizes, sizes=auto, fetchpriority, loading, decoding): <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img>
- MDN — Responsive images guide (art direction, resolution switching, `<picture>`): <https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images>
- MDN — `HTMLImageElement.sizes`: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes>
- MDN — `aspect-ratio`: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio>
- MDN — `object-view-box`: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-view-box>

**web.dev / Chrome Developers**
- Optimize resource loading with the Fetch Priority API: <https://web.dev/articles/fetch-priority>
- Browser-level image lazy loading: <https://web.dev/articles/browser-level-image-lazy-loading>
- Optimize Cumulative Layout Shift: <https://web.dev/articles/optimize-cls>
- Deploying AVIF for more responsive websites: <https://web.dev/articles/avif-updates-2023>
- Learn Design — Responsive images: <https://web.dev/learn/design/responsive-images>
- Preload responsive images: <https://web.dev/articles/preload-responsive-images>
- Simulate mobile devices with device mode: <https://developer.chrome.com/docs/devtools/device-mode>
- Remote debug Android devices: <https://developer.chrome.com/docs/devtools/remote-debugging/>

**Cloud Four / Jason Grigsby / Eric Portis / Mat Marquis**
- Ending Responsive Images: <https://cloudfour.com/thinks/ending-responsive-images/>
- Responsive Images 101, Part 5: Sizes: <https://cloudfour.com/thinks/responsive-images-101-part-5-sizes/>
- Responsive Images 101, Part 4: Srcset Width Descriptors: <https://cloudfour.com/thinks/responsive-images-101-part-4-srcset-width-descriptors/>
- Eric Portis — w descriptors and sizes: Under the hood: <https://observablehq.com/@eeeps/w-descriptors-and-sizes-under-the-hood>
- CSS-Tricks — Sometimes `sizes` is quite important: <https://css-tricks.com/sometimes-sizes-is-quite-important/>
- CSS-Tricks — A Guide to the Responsive Images Syntax in HTML: <https://css-tricks.com/a-guide-to-the-responsive-images-syntax-in-html/>
- Mat Marquis — The end of responsive images (abril/2026): <https://web-standards.dev/news/2026/04/the-end-of-responsive-images/>

**WebKit / Apple**
- News from WWDC26: WebKit in Safari 27 beta (09/06/2026): <https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/>
- Safari Technology Preview 241 (10/04/2026) — `img sizes=auto`: <https://webkit.org/blog/17917/release-notes-for-safari-technology-preview-241/>
- Safari Technology Preview 243 (04/06/2026): <https://webkit.org/blog/17953/release-notes-for-safari-technology-preview-243/>
- Designing Websites for iPhone X (safe-area-inset, viewport-fit): <https://webkit.org/blog/7929/designing-websites-for-iphone-x/>
- Safari Web Inspector Guide: <https://developer.apple.com/library/archive/documentation/AppleApplications/Conceptual/Safari_Developer_Guide/GettingStarted/GettingStarted.html>

**Suporte de navegador (caniuse — dados de março a junho/2026, verificar antes de usar)**
- `sizes="auto"`: <https://caniuse.com/wf-sizes-auto> e <https://caniuse.com/mdn-html_elements_img_sizes_auto>
- `<picture>`: <https://caniuse.com/picture>
- `object-view-box`: <https://caniuse.com/mdn-css_properties_object-view-box>
- AVIF: <https://caniuse.com/avif>
- WebP: <https://caniuse.com/webp>
- `link rel=preload`: <https://caniuse.com/link-rel-preload>
- `imagesrcset`: <https://caniuse.com/mdn-html_elements_link_imagesrcset>
- svh/lvh/dvh: <https://caniuse.com/viewport-unit-variants>

**WCAG**
- 1.4.4 Resize Text (AA): <https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html>
- 1.4.10 Reflow (AA): <https://www.w3.org/WAI/WCAG22/Understanding/reflow.html>
- Adrian Roselli — Responsive Type and Zoom: <http://adrianroselli.com/2019/12/responsive-type-and-zoom.html>
- Orange a11y guidelines — Zoom: <https://a11y-guidelines.orange.com/en/articles/zoom/>

**Dados de mercado (StatCounter Global Stats — Brasil, julho/2026)**
- Mobile Screen Resolution Stats Brazil: <https://gs.statcounter.com/screen-resolution-stats/mobile/brazil>
- Mobile Vendor Market Share Brazil: <https://gs.statcounter.com/vendor-market-share/mobile/brazil>
- Mobile Browser Market Share Brazil: <https://gs.statcounter.com/browser-market-share/mobile/brazil>

**Next.js**
- Static Exports (Unsupported Features → Image Optimization): <https://nextjs.org/docs/app/guides/static-exports>

**Outros**
- Ahmad Shadeed — First Look At The CSS object-view-box Property: <https://ishadeed.com/article/css-object-view-box/>
- Ahmad Shadeed — New Viewport Units: <https://ishadeed.com/article/new-viewport-units/>
- Addy Osmani — Image Optimization (livro, Smashing Magazine): <https://www.smashingmagazine.com/printed-books/image-optimization/>
- Smashing Magazine — Automating Art Direction With The Responsive Image Breakpoints Generator: <https://www.smashingmagazine.com/2016/09/automating-art-direction-with-the-responsive-image-breakpoints-generator/>

---

## NÃO CONFIRMADO — declaração explícita

O que esta pesquisa **não** conseguiu confirmar em fonte primária, e que portanto não deve ser citado como fato:

1. **Tempo exato de decodificação de AVIF vs WebP em milissegundos, em SoC de entrada.** Existe consenso sobre o *mecanismo* (decode por software na ausência de hardware AV1), mas nenhum benchmark de Chrome/WebKit/Mozilla com números. Os valores que circulam vêm de blogs comerciais de ferramentas de compressão.
2. **Se o Safari 27 já está estável em 05/08/2026.** O WebKit confirmou `img sizes=auto` no **beta** (09/06/2026); o caniuse ainda marcava Safari sem suporte. Verifique o caniuse antes de confiar em `sizes="auto"` para tráfego iOS.
3. **Resoluções mobile brasileiras abaixo de 3,75%.** O StatCounter só expõe as 6 primeiras linhas ao fetch. Não sei a participação exata de 360×640, 360×800 ou 375×667 no Brasil.
4. **Percentuais de ganho AVIF vs WebP fora dos 35% do Imgix citados pelo web.dev.** Os números de 20–40% que aparecem em blogs não têm fonte primária.
5. **Participação de modelos específicos de aparelho no Brasil** (Moto G35, Galaxy A07 etc.). Só encontrei fontes comerciais, não medição de tráfego.
