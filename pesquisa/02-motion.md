# 02 — Motion / Animação Web · Estado real em 2026

**Data da pesquisa:** 2026-08-04
**Projeto:** landing única · Next.js App Router · `output: 'export'` · Tailwind v4 · TS · tráfego ~100% mobile (Instagram, 4G) · setor iluminação cênica/LED
**Teto rígido:** 60 KB gzipped de JS de animação

---

## 0. Metodologia — como cada número foi obtido

Nada aqui vem de blog ou tutorial. As fontes são:

| Tipo de dado | Fonte |
|---|---|
| Versão e licença | `registry.npmjs.org/<pkg>/latest` (registro oficial npm) + `LICENSE` dentro do tarball publicado |
| Peso gzipped | **medido localmente**: tarball oficial baixado do npm, bundle real gerado com `esbuild --bundle --minify --format=esm --target=es2020`, depois `gzip -9` e `brotli -q 11` |
| Suporte de browser | `mdn/browser-compat-data` (JSON bruto do repo oficial) + `web-platform-dx/web-features` (fonte canônica do Baseline, v3.34.3) |
| Comportamento de lib | código-fonte do pacote publicado (grep no dist) + docs oficiais + issues no GitHub oficial |

Os pesos abaixo são **do bundle final tree-shaken**, não do arquivo UMD inteiro. É a única medida que importa para o orçamento.

---

## 1. Ficha por biblioteca

### 1.1 GSAP + ScrollTrigger

| | |
|---|---|
| **Versão** | **3.15.0** (npm `gsap`, confirmado no registro) |
| **Licença** | **Standard "no charge" GSAP License** — campo `license` do package.json aponta literalmente para `https://gsap.com/standard-license` |
| **Import 2026** | `import { gsap } from "gsap"` + `import { ScrollTrigger } from "gsap/ScrollTrigger"` + `gsap.registerPlugin(ScrollTrigger)` |
| **Peso medido (gzip)** | core sozinho **27,6 KB** · core + ScrollTrigger **45,1 KB** · (brotli: 25,0 / 40,7 KB) |
| **Extras medidos (min+gzip, UMD)** | SplitText 3,7 KB · Observer 4,3 KB · ScrollSmoother 5,5 KB · ScrollToPlugin 2,0 KB |
| **`@gsap/react`** | v2.1.2 · 0,8 KB gzip · licença: `SEE LICENSE AT https://gsap.com/standard-license` |

#### (a) O estado da licença do GSAP — CONFIRMADO, houve mudança

Sim, mudou, e a mudança é grande. Fonte: `https://gsap.com/licensing/`.

- A licença atual é a **Standard "No Charge" GSAP License**, **em vigor desde 30/04/2025**, última modificação 30/05/2025.
- **A GSAP é da Webflow.** Texto literal da licença: *"All intellectual property rights in GSAP Products… remain the exclusive property of Webflow."*
- **Uso comercial é permitido sem pagar.** FAQ oficial, literal: *"Can I really use GSAP in commercial projects without paying anything? Yes, really! Commercial usage is covered under the standard license."*
- **Club GreenSock acabou.** Todos os plugins antes pagos são grátis: SplitText, MorphSVG, ScrollSmoother, DrawSVG, etc. Texto oficial: *"now free for everyone, thanks to Webflow's support."*
- Página de instalação oficial confirma: *"GSAP and all the plugins are now freely available on npm."* O repositório privado do Club foi descontinuado.

**O que isso permite no seu caso (projeto comercial de cliente):** você pode usar GSAP + ScrollTrigger + SplitText na landing do cliente, cobrar pelo trabalho, entregar e não pagar nada nem pedir licença. Não há royalty, não há seat, não há atribuição obrigatória.

**A única restrição real** é uma cláusula anticoncorrência: você não pode usar GSAP para construir *"a solution that competes with Webflow's visual animation building capabilities"* — ou seja, não pode fazer um construtor visual de animação tipo Webflow/Framer em cima do GSAP. Fazer site de cliente não chega nem perto dessa fronteira.

**Armadilha de licença remanescente:** se você tem um `package.json` legado apontando para `npm.greensock.com` (o registro privado do Club) ou uma dependência `gsap-trial`, isso está morto. Migre para `gsap` do npm público.

#### Armadilhas técnicas do ScrollTrigger (documentadas oficialmente)

1. **Pin quebra com `transform` em ancestral.** Qualquer ancestral com `transform` ou `will-change` quebra `position: fixed` no browser, e o pin sai do lugar. Workaround oficial: `pinReparent: true` — mas ele reparenta o elemento para o `<body>`, o que quebra qualquer CSS que dependa do aninhamento. Em Tailwind isso morde fácil (um `transform` de utilitário num wrapper).
2. **Ordem de criação importa.** Doc oficial: *"Always create things in the order they'll happen on the page."* Criar fora de ordem corrompe o cálculo de pin. Se não der, `ScrollTrigger.sort()`.
3. **`content-visibility: auto`** torna *"impossible for ScrollTrigger to properly calculate start/end positions"*. Isso é um conflito direto com uma otimização que você provavelmente quer numa página pesada de foto.
4. **Barra de endereço no mobile.** Mostrar/esconder a URL bar dispara resize e desalinha tudo. Mitigações oficiais: `ScrollTrigger.config({ ignoreMobileResize: true })` e `ScrollTrigger.normalizeScroll()` — mas `normalizeScroll` *"forces scrolling to be done on the JavaScript thread"*, o que é exatamente o que você não quer num 4G com 10 iframes.
5. **`ScrollTrigger.refresh()`** precisa ser chamado manualmente quando o layout muda depois da criação. Numa página pesada de imagem, imagem carregando tarde = trigger no lugar errado. Você **precisa** de um `refresh()` no `load` / `ResizeObserver`.
6. **Integração com Lenis** exige `ScrollTrigger.scrollerProxy()`. Não é plug-and-play.

---

### 1.2 Lenis

| | |
|---|---|
| **Versão** | **1.3.25** |
| **Licença** | **MIT** © darkroom.engineering |
| **Import 2026** | `import Lenis from 'lenis'` · CSS obrigatório: `import 'lenis/dist/lenis.css'` · React: `import { ReactLenis } from 'lenis/react'` |
| **Peso medido (gzip)** | core **5,5 KB** (brotli 4,9) · `lenis/react` 1,7 KB · `lenis/snap` 2,0 KB |

#### (b) O Lenis quebra `position: sticky`? — **NÃO. Confirmado por código e pelo mantenedor.**

Evidência direta, em três camadas:

**1. Código-fonte.** `grep -cE "translate3d|transform:" dist/lenis.mjs` retorna **0**. O Lenis 1.x **não usa transform em wrapper nenhum** — ele dirige o scroll nativo via `window.scrollTo()` / `scrollTop`. É por isso que `position: sticky` e `position: fixed` continuam funcionando: do ponto de vista do browser, é scroll de verdade. Isso é o oposto do Locomotive v4 e do smooth-scrollbar antigos, que transformavam um `<div>` e por isso destruíam sticky/fixed. (Locomotive está vetado neste projeto de qualquer forma.)

**2. README oficial.** Lista `position: sticky` e âncoras como funcionando normalmente, justamente por embrulhar o scroll nativo.

**3. Mantenedor, na issue #499** ("Mobile Safari position: sticky jitter", aberta 08/02/2026, fechada como *completed* em 25/02/2026). `clementroche` (mantenedor), literal:

> "if you don't use `syncTouch` then Lenis has 0 impact on what you just mentionned about sticky."

**A ressalva é `syncTouch`.** Se você ligar `syncTouch: true`, o Lenis passa a interceptar touch no iOS e **aí sim** aparecem jitter de 1px em sticky e scroll com sensação não-nativa. Relatos na mesma issue: *"SyncTouch fix this on mobile but causes a horrible mobile scrolling experience"* e *"The response feels quite slow… not particularly native in its responsiveness."*

#### A descoberta que decide o projeto: no seu público, o Lenis não faz nada

Defaults verificados no `dist/lenis.mjs`:

```
smoothWheel = true
syncTouch   = false   ← default
autoRaf     = false
```

`smoothWheel` só afeta **roda de mouse / trackpad**. `syncTouch` é `false` por padrão, ou seja, **em touch o Lenis passa o scroll nativo direto, sem tocar em nada**.

Seu tráfego é "quase todo mobile vindo do Instagram, em 4G". Nesse público, o Lenis custa 5,5 KB gzip + um `requestAnimationFrame` rodando eternamente + a folha de CSS, e **entrega zero efeito visual**. E se você ligar `syncTouch` para "fazer valer", degrada o scroll no iOS e volta a ameaçar o sticky.

**Armadilha extra e específica deste projeto — os 10 embeds de YouTube.** O `lenis.css` oficial contém:

```css
.lenis.lenis-smooth iframe { pointer-events: none; }
```

Ou seja: **enquanto o smooth scroll estiver ativo, todos os iframes ficam sem eventos de ponteiro.** Numa página com 10 players de YouTube isso é uma fonte previsível de "o vídeo não responde ao toque".

**Outras armadilhas documentadas no README:** sem suporte a CSS `scroll-snap` (precisa de `lenis/snap`); `position: fixed` lagando em Safari macOS pré-M1; capado a 60fps no Safari e 30fps em low power mode; touch imprevisível com `syncTouch` em iOS < 16; `allowNestedScroll` marcado com *"⚠️ Can create performance issues since it checks the DOM tree on every scroll event"*.

**Veredito: cortar o Lenis.** Não por bug, e não porque quebra sticky — não quebra. Por ser 5,5 KB inertes no público-alvo, com efeito colateral nos iframes.

---

### 1.3 Motion (ex-Framer Motion)

| | |
|---|---|
| **Versão** | **12.43.0** (`motion` e `framer-motion` publicados em lockstep na mesma versão) |
| **Licença** | **MIT** (`LICENSE.md` no pacote publicado) |
| **Import 2026** | vanilla: `import { animate, scroll, inView } from "motion"` · mini: `import { animate } from "motion/mini"` · React: `import { motion } from "motion/react"` |
| **Nota** | O pacote `motion` tem `framer-motion` como *dependency*. Isso assusta, mas medi: **não vaza React para bundle vanilla**, o tree-shaking corta certo. |

#### Pesos medidos (gzip, bundle real tree-shaken) — a informação mais útil deste relatório

| Import | gzip | brotli |
|---|---:|---:|
| `inView` de `"motion"` | **0,45 KB** | 0,39 KB |
| `animate` de `"motion/mini"` | **3,1 KB** | 2,8 KB |
| **`animate` (mini) + `inView`** | **3,3 KB** | **3,0 KB** |
| `scroll` de `"motion"` (sozinho, com callback) | 6,3 KB | 5,8 KB |
| `animate` + `inView` + `scroll` (mini + full) | 9,1 KB | 8,4 KB |
| `animate` + `scroll` + `inView`, tudo do `"motion"` full | 25,5 KB | 23,2 KB |
| `scroll(animate(...))` — full | 25,3 KB | 23,0 KB |

A doc oficial declara `"motion"` = 18 kb e `"motion/mini"` = 2,3 kb. A minha medição real dá 25,5 KB e 3,1 KB — a diferença é normal (a doc mede o mínimo teórico do módulo isolado; eu medi o bundle emitido). **Use os meus números para orçamento.**

**Armadilhas:**
- `motion/mini` usa só WAAPI nativo. Segundo a doc oficial, ele **não** anima: transforms independentes (`x`, `y`, `rotateZ`), `mask-image`, gradientes, variáveis CSS (exceto propriedades registradas via `@property`), paths SVG, sequences, cores/strings/números soltos, objetos JS e WebGL. Para reveal (opacity + `transform` como string única) é suficiente. Para parallax por eixo, não é.
- A grande armadilha de orçamento: **`scroll()` combinado com `animate()` do entry full puxa o motor JS inteiro e salta de 6 KB para 25 KB.** Se você precisa de scroll-linked, ou usa `scroll()` com callback manual (6,3 KB), ou usa CSS nativo (0 KB).
- Em React Server Components, `motion/react` precisa de `"use client"`. Existe `motion/react-client` que já traz a diretiva embutida, e `motion/react-m` para o import mínimo.

---

### 1.4 Anime.js v4

| | |
|---|---|
| **Versão** | **4.5.0** no npm. ⚠️ A página oficial de instalação ainda diz "4.0.0" — está desatualizada. O registro npm é a fonte autoritativa. |
| **Licença** | **MIT** © 2025 Julian Garnier (`LICENSE.md` no tarball). A doc do site diz só "© 2026 Julian Garnier" sem termos — o arquivo no pacote é MIT. |
| **Import 2026** | `import { animate, stagger, createTimeline } from 'animejs'` — **named exports**, o default export do v3 (`anime()`) acabou. Submódulos: `animejs/svg`, `animejs/text`, `animejs/scope`. |

#### Pesos medidos (gzip)

| | gzip | brotli |
|---|---:|---:|
| bundle UMD completo (`anime.umd.min.js`) | 40,6 KB | — |
| bundle ESM completo (`anime.esm.min.js`) | 40,9 KB | — |
| tree-shaken: só `animate` | **12,7 KB** | 11,6 KB |
| tree-shaken: `animate` + `onScroll` | **17,2 KB** | 15,7 KB |
| tree-shaken: `animate` + `createTimeline` + `onScroll` + `stagger` + `text` | 13,9 KB | 12,8 KB |

**Armadilhas:**
- Se alguém importar do bundle (`animejs/dist/bundles/anime.esm.min.js`) em vez do entry, você come 40 KB — 2/3 do teto — sem perceber. Sempre importe de `'animejs'`.
- API totalmente reescrita no v4. Nada de v3 funciona. Código antigo de `anime.timeline()` precisa virar `createTimeline()`.
- Doc oficial desatualizada na versão (ver acima) — desconfie de outras páginas dela.

**Posição no projeto:** 12,7 KB só para `animate` é caro demais para fazer fade-in. O Anime.js v4 se paga se você precisar de timeline complexa, morph SVG ou animação de texto por caractere — nenhum dos quais é essencial numa landing única.

---

### 1.5 Trig.js

| | |
|---|---|
| **Pacote npm real** | **`trig-js`** (não `trig.js` — esse nome não existe no npm) |
| **Versão** | **4.2.1** |
| **Licença** | **MIT** |
| **Repo** | `github.com/iDev-Games/trig` |
| **Import 2026** | Não é ESM. `main` aponta para `src/trig.js`, **sem `module`, sem `exports`, sem build ESM**. Uso real: `<script src="/js/trig.min.js">` ou copiar o arquivo. |
| **Peso medido (gzip)** | `src/trig.js` (**não minificado**, é o único JS publicado) **2,1 KB** gzip / 1,9 KB brotli · `trig-animations.css` 2,2 KB gzip |
| **Peso declarado oficialmente** | **NÃO CONFIRMADO** — o README só mostra um badge de bundle size, não declara KB em texto |
| **Suporte de browser declarado** | **NÃO CONFIRMADO** — o README não menciona |

**Como funciona:** você marca elementos com `data-trig` / classe `enable-trig`; a lib adiciona classes `trig`, `trig-up`, `trig-down` quando entram na viewport, e com `data-trig-var="true"` expõe variáveis CSS `--trig` (porcentagem), `--trig-px` e `--trig-deg` que você usa direto no CSS. É o padrão certo: JS mínimo publicando um número, CSS fazendo a animação.

**Armadilhas:**
1. **O pacote npm não contém `trig.min.js`.** Verifiquei a listagem de arquivos do jsDelivr para `trig-js@4.2.1`: existem apenas `src/trig.js`, `src/trig-animations.css`, `LICENSE`, `README.md`, `package.json`, `.gitattributes`. Mas o README manda usar `https://cdn.jsdelivr.net/npm/trig-js/src/trig.min.js` — essa URL responde **200** porque o jsDelivr minifica on-the-fly, e não porque o arquivo esteja publicado. Se você fizer self-host a partir do `node_modules`, o arquivo não está lá.
2. **Sem ESM / sem tipos TypeScript.** Num projeto TS com Next.js você vai precisar de `declare module` manual ou `@ts-ignore`, e o import em componente cliente não é natural.
3. Projeto pequeno, mantenedor único. Risco de manutenção maior que o das outras.

**Veredito:** a ideia é ótima e o peso é excelente, mas a falta de ESM/TS num projeto Next.js + TypeScript é atrito real. Um `IntersectionObserver` seu, escrito à mão, faz a mesma coisa em ~15 linhas, integra nativamente com TS e pesa menos.

---

### 1.6 Lottie — `lottie-web` e `dotlottie`

#### `lottie-web`

| | |
|---|---|
| **Versão** | **5.13.0** |
| **Licença** | **MIT** |
| **Import** | `import lottie from 'lottie-web'` (traz o build completo) ou build específico: `import lottie from 'lottie-web/build/player/lottie_light'` |

**Pesos medidos (min + gzip) — todos os builds publicados:**

| Build | gzip |
|---|---:|
| `lottie.min.js` (completo) | **76,1 KB** |
| `lottie_canvas.min.js` | 67,7 KB |
| `lottie_html.min.js` | 67,8 KB |
| `lottie_svg.min.js` | 62,4 KB |
| `lottie_light.min.js` | **46,5 KB** |
| `lottie_light_html.min.js` | 51,7 KB |
| `lottie_light_canvas.min.js` | 54,3 KB |
| `lottie_worker.min.js` | 79,5 KB |

**O build mais leve que existe, o `lottie_light`, é 46,5 KB gzip — 78% do seu teto de 60 KB, e isso antes de um único byte de JSON de animação.** Fim da conversa para esta landing.

#### `@lottiefiles/dotlottie-web`

| | |
|---|---|
| **Versão** | **0.78.2** |
| **Licença** | **MIT** |
| **Import** | `import { DotLottie } from '@lottiefiles/dotlottie-web'` · React: `@lottiefiles/dotlottie-react` v0.19.12 |
| **JS medido** | 29,1 KB gzip (`dist/index.js`) |
| **WASM medido** | `dotlottie-player.wasm` = **1.813.460 bytes crus / 675 KB gzipped** |

**A armadilha crítica, confirmada no código publicado.** Fiz grep de URLs no `dist/index.js` e o pacote embute, hardcoded:

```
https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0.78.2/dist/dotlottie-player.wasm
https://unpkg.com/@lottiefiles/dotlottie-web@0.78.2/dist/dotlottie-player.wasm
```

Por padrão, **o runtime baixa 675 KB (gzip) de WASM de um CDN de terceiro em runtime**, no dispositivo do usuário. Num 4G isso é catastrófico e é uma dependência de disponibilidade externa que você não controla. Existe `DotLottie.setWasmUrl(url)` (confirmado no `index.d.ts`) para self-host, mas o custo de 675 KB continua existindo — só muda de servidor.

**Veredito: cortar Lottie inteiro.** 29 KB de JS + 675 KB de WASM, ou 46,5 KB de JS no melhor caso do `lottie-web`. Não cabe.

---

### 1.7 Rive

| | |
|---|---|
| **Versão do runtime** | **`@rive-app/canvas` 2.39.1** |
| **Licença do runtime** | **MIT** (campo `license` do package.json + `LICENSE` no repo `rive-app/rive-wasm`) |
| **Import** | `import { Rive } from '@rive-app/canvas'` |
| **JS medido** | `rive.js` = **95,9 KB gzip** |
| **WASM medido** | `rive.wasm` = 1.992.578 bytes crus / **734,7 KB gzipped**. Mais um `rive_fallback.wasm` de tamanho idêntico. |

**Mesma armadilha do dotLottie, confirmada em código.** O `rive.js` embute referências a `https://unpkg.com/` e `https://cdn.jsdelivr.net/npm/`. O `runtimeLoader.d.ts` publicado declara, textualmente:

```ts
/**
 * Sets the URL used as a fallback when the primary WASM URL fails to load.
 * Pass `null` to disable the fallback entirely.
 *
 * Defaults to pulling from the jsdelivr CDN.
 */
static setWasmFallbackUrl(url: string | null): void;
```

Ou seja: **o padrão é puxar WASM do jsDelivr.** Existem `RuntimeLoader.setWasmUrl()` e `setWasmBinary()` para self-host, mas o peso permanece.

**Licença/preço do editor (rive.app/pricing, 2026):** Free $0/seat (3 arquivos colaborativos, 1 projeto) · Cadet $9/seat/mês (máx 3 seats, arquivos ilimitados) · Voyager $32/seat/mês (máx 25 seats) · Enterprise $120/seat/mês (empresas com $10M+ de receita anual). Não há restrição declarada de uso comercial em nenhum tier. O runtime é MIT e grátis; **o que se paga é o editor.**

**Veredito:** 96 KB de JS + 735 KB de WASM ultrapassa o teto sozinho, em 1,6×, só no JS. Cortado. (Rive é excelente para um mascote interativo num app; é a ferramenta errada para uma landing de conversão em 4G.)

---

### 1.8 CSS nativo

#### `animation-timeline: scroll()` / `view()` — scroll-driven animations

**Suporte real, do `browser-compat-data` e do `web-features` (Baseline):**

| Browser | `animation-timeline`, `scroll-timeline`, `view-timeline`, `animation-range` |
|---|---|
| Chrome / Edge | **115** |
| Chrome Android | **115** |
| **Safari (macOS)** | **26** |
| **Safari iOS** | **26** |
| Firefox / Firefox Android | **não lançado** — `version_added: "preview"` |

**Status Baseline: `false`.** Não é Baseline, e a razão única é o Firefox, que em agosto/2026 ainda tem isso só em canal preview.

#### (e) O que isso significa para o *seu* público — a resposta prática

O Safari iOS **ganhou** scroll-driven animations, na versão **26**. Isso é uma virada real: até 2025 esse recurso era Chrome-only.

Mas repare no timing: o iOS 26 é do ciclo de setembro/2025. Em agosto/2026 a adoção do iOS 26+ é alta, mas longe de 100% — e o restante do seu público (iPhones em iOS 18/25, WebViews antigas do app do Instagram) simplesmente **não vê a animação**. E aí está a boa notícia: **`animation-timeline` falha de forma silenciosa e segura.** Um browser que não conhece a propriedade ignora a declaração; o elemento fica no estado final do CSS. Não há erro, não há tela em branco, não há conteúdo invisível — **desde que você escreva o estado padrão como "visível"** e trate a animação como enfeite.

Portanto: **use `animation-timeline` como progressive enhancement dentro de `@supports`, nunca como mecanismo de reveal do qual o conteúdo depende.**

#### View Transitions API

| | Chrome/Edge | Chrome Android | Safari | **Safari iOS** | Firefox |
|---|---|---|---|---|---|
| `document.startViewTransition` / `view-transition-name` | 111 | 111 | **18** | **18** | 144 |
| `ViewTransition.types` | 125 | 125 | 18.2 | 18.2 | 147 |
| `@view-transition` (cross-document) | 126 | 126 | 18.2 | 18.2 | **não suportado** |
| `document.activeViewTransition` | 142 | 142 | 26.2 | 26.2 | 147 |
| `ViewTransition.waitUntil` | 144 | 144 | ✗ | ✗ | ✗ |

**Status Baseline:**
- **View Transitions same-document: Baseline "newly available" desde 2025-10-14.** Suportado nos três motores. **Safari iOS 18+** — cobertura bem melhor que scroll-driven animations.
- **Cross-document view transitions (`@view-transition`): Baseline `false`** — Firefox não implementou.

**Relevância para este projeto: quase nenhuma.** É uma **landing única**. Não há navegação entre páginas para transicionar. View Transitions só entraria se você fizesse troca de estado dentro da página (abrir lightbox de foto, trocar aba de portfólio). Nesse caso vale, é 0 KB de JS, e degrada sozinho — mas o padrão obrigatório é o guard:

```js
function withVT(update) {
  if (!document.startViewTransition) return update();   // fallback: troca instantânea
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return update();
  return document.startViewTransition(update);
}
```

#### `linear()` easing

| | Chrome/Edge | Chrome Android | Safari | Safari iOS | Firefox |
|---|---|---|---|---|---|
| `linear()` | 113 | 113 | 17.2 | **17.2** | 112 |

**Status Baseline: `high` (widely available) desde 2026-06-11** (newly available desde 2023-12-11). **Pode usar sem `@supports`, sem fallback, sem medo.** É a ferramenta que dá curvas de "moving head" acelerando e travando, spring e bounce, tudo em CSS puro, com 0 KB de JS. É a coisa mais subestimada desta lista para o seu setor.

#### Outras primitivas confirmadas (Baseline widely available, seguras)

`prefers-reduced-motion` (2022-07-15) · `IntersectionObserver` (2021-09-25) · Web Animations API (2023-03-16) · `mix-blend-mode` (2022-07-15) · `filter` (2019-03-07) · `clip-path` (2023-07-21) · `animation-composition` (2026-01-04) · `:has()` (2026-06-19) · propriedades de transform individuais `translate`/`rotate`/`scale` (2022-08-05) · `loading="lazy"` (2026-06-19).

Baseline **newly available** (funciona nos 3 motores, mas ainda não "widely"): `@property` / registered custom properties (Safari iOS 16.4+, Firefox 128+) · `@starting-style` (Safari iOS 17.5+) · `backdrop-filter` (Safari iOS 18+) · `content-visibility` (Safari iOS 26+ — e lembre que conflita com ScrollTrigger).

---

## 2. (c) O que quebra em React Server Components / Next.js App Router

Fonte: docs oficiais Next.js 16.3.0 (`nextjs.org/docs/app/getting-started/server-and-client-components` e `.../guides/static-exports`).

### O que quebra

**Toda biblioteca de animação desta lista é client-only.** Todas tocam `window`, `document`, `IntersectionObserver`, `requestAnimationFrame` ou WASM. Nenhuma delas roda em Server Component. Você precisa de `"use client"` em toda a lista, sem exceção: GSAP, ScrollTrigger, Lenis, Motion, Anime.js, Trig.js, Lottie, Rive.

Regras oficiais que importam:

1. Server Components não têm `useState`, `useEffect`, event handlers, nem APIs de browser (`window`, `localStorage`, `navigator`).
2. `"use client"` vai **no topo do arquivo, acima dos imports**.
3. **Contágio do bundle** — texto literal da doc: *"Once a file is marked with `use client`, **all of its imports and the components it directly renders are included in the client bundle**."* Isso é o erro de orçamento mais comum: um `"use client"` num layout grande arrasta a árvore inteira, e junto com ela toda a lib de animação, para todo mundo.
4. Server Components passados como `children` **não** entram no grafo de módulos do Client Component. É assim que você mantém foto e texto no servidor e só o wrapper de animação no cliente.
5. React Context não existe em Server Component — precisa de um provider `"use client"`.

### Armadilha específica de `output: 'export'`

Com export estático, **os Client Components ainda são pré-renderizados para HTML no `next build`**. Doc literal: *"Client Components are prerendered to HTML during `next build`. Because Web APIs like `window`, `localStorage`, and `navigator` are not available on the server, you need to safely access these APIs only when running in the browser."*

Ou seja, `"use client"` **não** te protege de erro de build. Se você chamar `gsap.registerPlugin(ScrollTrigger)` no corpo do módulo, ou ler `window.innerHeight` no corpo do componente, o build quebra. Tem que estar dentro de `useEffect` / `useLayoutEffect` / `useGSAP`.

Lista oficial de features **não suportadas** com `output: 'export'` (verbatim): Dynamic Routes com `dynamicParams: true`; Dynamic Routes sem `generateStaticParams()`; Route Handlers que dependem de `Request`; Cookies; Rewrites; Redirects; **Headers**; Proxy; ISR; **Image Optimization com o `loader` padrão**; Draft Mode; Server Actions; Intercepting Routes.

Dois pontos mordem este projeto diretamente:

- **`next/image` com loader padrão não funciona.** Numa landing "pesada em foto", isso é o problema número um. Ou você configura `images: { loader: 'custom', loaderFile: './my-loader.ts' }` apontando para um serviço externo (Cloudinary/imgix), ou você gera AVIF/WebP responsivos no build e usa `<picture>` com `srcset` à mão. Não existe terceira opção.
- **`headers` não funciona.** Sem `Cache-Control`, `Content-Security-Policy` ou `Link: rel=preload` vindos do Next. Isso tem que ser configurado no host (Netlify `_headers`, Vercel `vercel.json`, Nginx, Cloudflare).

---

## 3. (d) O padrão correto de `"use client"` + cleanup para GSAP/ScrollTrigger

A doc oficial de React da GSAP é explícita sobre App Router:

> "If you're using the app router / react server components, you need to drop a `'use client'` at the top of your file for `useGSAP()` to work"

### Padrão recomendado — `useGSAP` (`@gsap/react` v2.1.2, +0,8 KB gzip)

```tsx
// app/(components)/BeamReveal.tsx
'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function BeamReveal({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // gsap.matchMedia() é o padrão oficial para prefers-reduced-motion.
      // Ele reverte sozinho quando a condição deixa de bater.
      const mm = gsap.matchMedia()

      mm.add(
        {
          isMobile: '(max-width: 767px)',
          isDesktop: '(min-width: 768px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const { reduceMotion } = ctx.conditions as { reduceMotion: boolean }

          gsap.from('.reveal', {
            opacity: 0,
            y: reduceMotion ? 0 : 40,
            duration: reduceMotion ? 0 : 0.8,
            stagger: reduceMotion ? 0 : 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: container.current,
              start: 'top 80%',
              once: true,             // dispara uma vez; não fica recalculando no scroll
            },
          })
        }
      )
      // useGSAP já reverte o contexto no unmount; nada de cleanup manual aqui.
    },
    { scope: container }
  )

  return <div ref={container}>{children}</div>
}
```

**Por que este padrão e não `useEffect`:**
- `useGSAP()` é drop-in de `useLayoutEffect`/`useEffect` e faz cleanup automático via `gsap.context()` — reverte **todas** as animações e **todos** os ScrollTriggers criados dentro dele no unmount.
- Isso resolve o Strict Mode do React 18/19, que roda efeitos duas vezes em dev. Sem contexto, você acaba com ScrollTriggers duplicados e animação dobrada.
- `scope: container` escopa os seletores (`'.reveal'`) ao subtree do ref, então você não vaza para o resto da página.

### Se você não quiser a dependência `@gsap/react` — equivalente com `useEffect`

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function BeamReveal() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // registrar DENTRO do efeito: no build estático o módulo é avaliado no Node
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.reveal', {
          opacity: 0, y: 40, stagger: 0.08,
          scrollTrigger: { trigger: container.current, start: 'top 80%', once: true },
        })
      })
    }, container)

    // Numa página pesada de foto, imagens carregando tarde desalinham os triggers.
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)

    return () => {
      window.removeEventListener('load', onLoad)
      ctx.revert()          // <- o cleanup que realmente importa
    }
  }, [])

  return <div ref={container}>{/* ... */}</div>
}
```

**Erros que este padrão evita:**
- `gsap.registerPlugin()` no topo do módulo → executa no build (Node) e pode quebrar `next build` com `output: 'export'`.
- Sem `ctx.revert()` → ScrollTriggers órfãos, listeners acumulados, memory leak em navegação client-side.
- Sem `ScrollTrigger.refresh()` depois do `load` → numa página pesada de imagem, todos os triggers ficam no lugar errado.
- `once: true` ausente → o ScrollTrigger continua ativo para sempre, custando trabalho a cada frame de scroll.

---

## 4. Dá para fazer "feixe de luz varrendo" e "blackout antes do reveal" só com CSS? — **Sim, os dois, e melhor do que com lib.**

Esta é a parte mais importante do relatório para o seu setor. Feixe de luz, haze, blackout e pixel mapping são, todos, efeitos de **gradiente + blend mode + transform**. Nenhum deles precisa de interpolação em JavaScript. Uma lib de animação existe para interpolar valores arbitrários ao longo do tempo — e aqui o tempo é linear e o valor é uma transform. O CSS faz isso na thread do compositor, o JS faz na main thread. No 4G, com 10 iframes de YouTube brigando pela main thread, **o CSS ganha por engenharia, não por economia de KB.**

### 4.1 Feixe de luz varrendo (light beam sweep) — 0 KB de JS

```css
/* Curva "moving head": acelera, cruza rápido, desacelera na saída.
   linear() é Baseline WIDELY AVAILABLE desde 2026-06-11 — pode usar direto. */
:root {
  --ease-beam: linear(
    0, 0.006 2.7%, 0.025 5.5%, 0.101 11.1%, 0.539 29%, 0.721 38%,
    0.849 47%, 0.937 57%, 0.98 67%, 0.998 80%, 1
  );
  --luz: oklch(0.92 0.14 95);  /* âmbar de gel quente */
}

.feixe {
  position: relative;
  isolation: isolate;          /* prende o blend mode a este stacking context */
  overflow: hidden;
}

.feixe::after {
  content: "";
  position: absolute;
  inset: -30% -80%;
  pointer-events: none;
  z-index: 2;

  /* O "blur" está BAKED nos color-stops do gradiente.
     NÃO use filter: blur() — em mobile isso força uma layer cara a cada frame. */
  background: linear-gradient(
    100deg,
    transparent            30%,
    color-mix(in oklab, var(--luz) 0%,  transparent) 42%,
    color-mix(in oklab, var(--luz) 55%, transparent) 50%,
    color-mix(in oklab, var(--luz) 0%,  transparent) 58%,
    transparent            70%
  );

  mix-blend-mode: screen;      /* luz é aditiva: screen, nunca normal */
  transform: translate3d(-100%, 0, 0);
  will-change: transform;
}

@media (prefers-reduced-motion: no-preference) {
  .feixe::after {
    animation: varrer 5s var(--ease-beam) infinite;
  }
}

@keyframes varrer {
  from { transform: translate3d(-100%, 0, 0); }
  to   { transform: translate3d(100%,  0, 0); }
}
```

**Por que isso é rápido:** anima só `transform`, que é propriedade de compositor — não dispara layout nem paint. Roda na GPU, na compositor thread, e continua fluido mesmo com a main thread ocupada carregando fotos.

**Variante "varre com o scroll"** (progressive enhancement, degrada para o sweep em loop acima):

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .feixe::after {
      animation: varrer linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 60%;
    }
  }
}
```

Chrome/Edge 115+ e Safari iOS 26+ ligam o feixe ao scroll. Todo o resto (iOS 18–25, Firefox) fica com o loop temporal. Ninguém vê página quebrada.

### 4.2 Haze / névoa — 0 KB de JS

```css
.haze {
  position: fixed;
  inset: -20%;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(60% 45% at 30% 20%, color-mix(in oklab, var(--luz) 18%, transparent), transparent 70%),
    radial-gradient(50% 40% at 75% 65%, oklch(0.75 0.12 250 / 0.14), transparent 70%);
  mix-blend-mode: screen;
  filter: saturate(1.2);       /* filter estático: pago uma vez, não por frame */
}

@media (prefers-reduced-motion: no-preference) {
  .haze { animation: deriva 32s ease-in-out infinite alternate; }
}

@keyframes deriva {
  from { transform: translate3d(-3%, -2%, 0) scale(1.05); }
  to   { transform: translate3d( 3%,  2%, 0) scale(1.12); }
}
```

Duas camadas de radial-gradient em `screen`, à deriva lentíssima por `transform`. Zero JS, zero jank.

### 4.3 Blackout antes do reveal — 0 KB de JS (com um detalhe crítico)

**Blackout na entrada do hero** (não depende de scroll, é só entrada — 0 KB, funciona em 100% dos browsers):

```css
.hero-blackout > * {
  animation: acender 1.4s var(--ease-beam) both;
}
.hero-blackout > *:nth-child(2) { animation-delay: 0.18s; }
.hero-blackout > *:nth-child(3) { animation-delay: 0.34s; }

@keyframes acender {
  0%   { opacity: 0; filter: brightness(0);   transform: translate3d(0, 14px, 0); }
  22%  { opacity: 1; filter: brightness(2.4); }  /* estouro do strobe */
  38%  { opacity: 0.72; filter: brightness(0.3); } /* piscada do dimmer */
  100% { opacity: 1; filter: brightness(1);   transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-blackout > * { animation: none; }   /* já visível, nada acontece */
}
```

**Blackout por scroll (blocos abaixo da dobra).** Aqui está a decisão de arquitetura, e ela vale mais que qualquer escolha de biblioteca:

> **O conteúdo tem que estar visível por padrão. O blackout é opt-in, ativado por JS.**

Se você escrever `.bloco { opacity: 0 }` no CSS e depender de JS para revelar, então: JS falhar = página em branco; JS lento no 4G = flash de conteúdo invisível; crawler sem JS = conteúdo invisível. Numa landing de conversão, isso é inaceitável.

O padrão correto — um script inline de ~40 bytes no `<head>`, síncrono, que marca que o JS está vivo:

```tsx
// app/layout.tsx  — Server Component, sem "use client"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* síncrono e antes do paint: nunca há flash */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js')` }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

```css
/* Sem JS, ou com JS morto: conteúdo visível. Ponto. */
.bloco { opacity: 1; }

/* Só com JS vivo E sem preferência por menos movimento, o blackout entra. */
@media (prefers-reduced-motion: no-preference) {
  .js .bloco {
    opacity: 0;
    filter: brightness(0);
    transform: translate3d(0, 24px, 0);
    transition:
      opacity   .7s var(--ease-beam),
      filter    .7s var(--ease-beam),
      transform .7s var(--ease-beam);
  }
  .js .bloco.aceso {
    opacity: 1;
    filter: brightness(1);
    transform: none;
  }
}

/* Se o browser tem scroll-driven animations, dispensa até o IntersectionObserver. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .js .bloco {
      animation: acender-scroll linear both;
      animation-timeline: view();
      animation-range: entry 5% entry 55%;
      transition: none;    /* a timeline assume o controle */
    }
  }
}
@keyframes acender-scroll {
  from { opacity: 0; filter: brightness(0); transform: translate3d(0, 24px, 0); }
  to   { opacity: 1; filter: brightness(1); transform: none; }
}
```

A classe `.aceso` é a única coisa que precisa de JS — e são 15 linhas de `IntersectionObserver`, não uma biblioteca.

### 4.4 Pixel mapping e forma de onda — 0 KB de JS

**Grade de pixel mapping** com `@property` (Baseline newly available, Safari iOS 16.4+) e delays escalonados:

```css
@property --px { syntax: "<color>"; inherits: false; initial-value: transparent; }

.pixelmap { display: grid; grid-template-columns: repeat(16, 1fr); gap: 2px; }
.pixelmap i {
  aspect-ratio: 1;
  background: var(--px);
  border-radius: 2px;
}
@media (prefers-reduced-motion: no-preference) {
  .pixelmap i {
    animation: pulso 2.4s var(--ease-beam) infinite;
    /* --i vem de um style inline gerado no build (Server Component, 0 KB de runtime) */
    animation-delay: calc(var(--i) * 38ms);
  }
}
@keyframes pulso {
  0%, 70% { --px: oklch(0.22 0.02 260); }
  35%     { --px: var(--luz); }
}
```

Os `--i` são gerados no `next build` dentro de um Server Component (`style={{ '--i': i }}`) — custo de runtime zero.

**Forma de onda:** um SVG estático com `stroke-dasharray` + `stroke-dashoffset` animados, ou um `<path>` com `animate` SMIL. Também 0 KB de JS. Para forma de onda *reativa a áudio* real aí sim precisaria de JS (`AnalyserNode`), mas numa landing você quer a estética, não o sinal.

### 4.5 Onde o CSS puro **não** chega

Sendo honesto sobre os limites: sequenciamento complexo com dependências entre elementos (timeline com labels, "espere A terminar, então B e C juntos, então D"); animação orquestrada por evento arbitrário do usuário com estado; pinning real de seção com scrub; morph de path SVG. Nada disso está na sua lista de efeitos. Feixe, haze, blackout, pixel mapping e waveform são todos gradiente + blend + transform.

---

## 5. `prefers-reduced-motion` — o padrão correto por lib

**Regra geral:** `prefers-reduced-motion` é Baseline *widely available* desde 2022-07-15 (Safari iOS 10.3+, Chrome 74+, Firefox 63+). Não há desculpa para não implementar.

**Não** use o "reset nuclear" (`*, *::before, *::after { animation-duration: .01ms !important }`) como única medida — ele também mata loaders, transições de foco e feedback de UI. Prefira gatilhos direcionados.

### 5.1 CSS nativo (camada base)

```css
/* Padrão: envolva TODA decoração em no-preference. Assim o default acessível
   é "sem movimento" e o movimento é aditivo, não subtrativo. */
@media (prefers-reduced-motion: no-preference) {
  .feixe::after { animation: varrer 5s var(--ease-beam) infinite; }
  .haze         { animation: deriva 32s ease-in-out infinite alternate; }
  .js .bloco    { opacity: 0; transform: translate3d(0,24px,0); transition: /* ... */; }
}

/* Rede de segurança só para o que é puramente decorativo. */
@media (prefers-reduced-motion: reduce) {
  .feixe::after, .haze { animation: none !important; }
  html { scroll-behavior: auto; }
}
```

### 5.2 IntersectionObserver próprio (a camada recomendada — ~0,4 KB)

```tsx
// app/(components)/Reveal.tsx
'use client'

import { useEffect, useRef } from 'react'

export default function Reveal({
  children,
  className = '',
}: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 1) respeita reduced-motion: acende na hora, sem observar nada
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) { el.classList.add('aceso'); return }

    // 2) se o browser tem scroll-driven animations, o CSS já resolve
    if (CSS.supports('animation-timeline: view()')) return

    // 3) fallback universal (Safari iOS < 26, Firefox)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { el.classList.add('aceso'); io.disconnect() }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return <div ref={ref} className={`bloco ${className}`}>{children}</div>
}
```

### 5.3 Motion — vanilla

⚠️ **NÃO CONFIRMADO:** não encontrei API pública documentada de reduced-motion para o Motion vanilla. O entry `"motion"` exporta `prefersReducedMotion`, `hasReducedMotionListener` e `initPrefersReducedMotion` (verifiquei carregando o módulo), mas **nenhum desses aparece na documentação oficial**. Não dependa deles — podem sumir sem aviso de semver. Use `matchMedia`:

```ts
'use client'
import { animate } from 'motion/mini'
import { inView } from 'motion'

const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches

inView('.bloco', (el) => {
  animate(
    el,
    { opacity: 1, transform: 'none' },
    reduz ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  )
}, { amount: 0.15 })
```

### 5.4 Motion — React

API oficial confirmada (`motion.dev/docs/react-use-reduced-motion` + tipos do pacote):

```tsx
'use client'
import { MotionConfig, useReducedMotion, motion } from 'motion/react'

// Opção A — global. reducedMotion aceita "user" | "always" | "never".
<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>

// Opção B — por componente
function Bloco() {
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.7 }}
    />
  )
}
```

> ⚠️ `<MotionConfig>` e `motion.div` só existem no entry `motion/react`, que traz o runtime React inteiro do Motion. Se você só precisa de reveal, isso é caro — fique no `motion/mini` + `inView` de 3,3 KB.

### 5.5 GSAP

Padrão oficial, `gsap.matchMedia()` com a condição nomeada `reduceMotion` (código verbatim da doc de `gsap.matchMedia()`):

```ts
let mm = gsap.matchMedia(), breakPoint = 800;
mm.add({
  isDesktop: `(min-width: ${breakPoint}px)`,
  isMobile:  `(max-width: ${breakPoint - 1}px)`,
  reduceMotion: "(prefers-reduced-motion: reduce)",
}, (context) => {
  let { isDesktop, isMobile, reduceMotion } = context.conditions;
  gsap.to(".box", {
    rotation: isDesktop ? 360 : 180,
    duration: reduceMotion ? 0 : 2,
  });
});
```

O ponto forte: quando a condição deixa de bater (o usuário liga "reduzir movimento" no meio da sessão), o GSAP **reverte automaticamente** tudo o que foi criado naquele bloco. Nenhuma outra lib desta lista faz isso.

### 5.6 Anime.js v4

Sem API dedicada documentada — **NÃO CONFIRMADO**. Use `matchMedia` e zere a duração:

```ts
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches
animate('.bloco', { opacity: 1, y: 0, duration: reduz ? 0 : 700 })
```

### 5.7 Lenis

Sem opção documentada — **NÃO CONFIRMADO**. Simplesmente não inicialize:

```ts
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const lenis = new Lenis({ autoRaf: true })
}
```

(Mas veja a §6: neste projeto o Lenis não deve ser inicializado de todo jeito.)

---

## 6. A stack mínima — orçamento em KB por camada

### 6.1 Recomendada

| # | Camada | Implementação | KB gzip |
|---|---|---|---:|
| 1 | Feixe, haze, blackout, pixel map, waveform | CSS nativo: gradiente + `mix-blend-mode: screen` + `transform` + `linear()` | **0 KB JS** (~4 KB de CSS) |
| 2 | Detector de JS (anti-FOUC) | `<script>` inline síncrono no `<head>` (`classList.add('js')`) | **0,05 KB** |
| 3 | Reveal on scroll — caminho rápido | `@supports (animation-timeline: view())` → CSS puro (Chrome 115+, Safari iOS 26+) | **0 KB** |
| 4 | Reveal on scroll — fallback | `IntersectionObserver` próprio, componente `<Reveal>` (~15 linhas) | **0,4 KB** |
| 5 | Guarda de `prefers-reduced-motion` | `matchMedia` dentro do §4 | **0 KB** (incluso) |
| 6 | Fachada dos 10 embeds de YouTube | poster estático + `<iframe>` injetado no clique | **0,6 KB** |
| 7 | Lenis | **cortado** | 0 KB |
| 8 | Lottie / dotLottie | **cortado** | 0 KB |
| 9 | Rive | **cortado** | 0 KB |
| 10 | GSAP / ScrollTrigger | **cortado** | 0 KB |
| | **TOTAL** | | **≈ 1,1 KB gzip** |

**Folga contra o teto de 60 KB: ~59 KB.** Você não está perto de estourar — está usando 1,8% do orçamento.

### 6.2 Se você quiser uma lib de verdade em vez do IO próprio

| Camada | KB gzip | Total acumulado |
|---|---:|---:|
| CSS nativo + inline script + fachada YouTube | 0,65 | 0,65 |
| `animate` de `motion/mini` + `inView` de `motion` | **3,3** | **3,95** |
| *(opcional)* `scroll()` de `motion` com callback, para o feixe scroll-linked onde não há `animation-timeline` | 6,3 | 10,25 |

**Total com Motion: 4,0 KB · com scroll-linked JS: 10,3 KB.** Folga de 50–56 KB.

Este é o caminho que eu recomendo **se** você quer API declarativa em vez de escrever o `IntersectionObserver`. O ganho sobre o IO próprio é ergonomia, não capacidade. O custo de 3,3 KB é baixo o bastante para não discutir.

### 6.3 O que **cortar** e por quê (nesta ordem)

1. **Rive** — 96 KB JS + 735 KB WASM. Estoura o teto sozinho, em 1,6×, só no JS. E puxa WASM do jsDelivr por padrão.
2. **Lottie (`lottie-web` ou `dotlottie`)** — o build mais leve que existe (`lottie_light`) é 46,5 KB gzip = 78% do teto, e ainda sem o JSON. O `dotlottie` é 29 KB + 675 KB de WASM de CDN de terceiro.
3. **Anime.js v4** — 12,7 KB só para `animate()`, 17,2 KB com `onScroll`. Cabe no teto, mas é 4–5× o Motion mini para fazer a mesma coisa. Só se justifica com timeline complexa ou animação de texto.
4. **Lenis** — 5,5 KB que, com `syncTouch: false` (o default), **não fazem absolutamente nada no seu público mobile**. E o `lenis.css` desliga `pointer-events` em todos os iframes durante o smooth scroll, o que é uma bomba com 10 players de YouTube.
5. **GSAP + ScrollTrigger** — 45,1 KB gzip (+0,8 do `@gsap/react`) = **45,9 KB, ou 76% do teto**, para fazer fade-in. Tecnicamente cabe, e a licença hoje permite sem pagar nada. Mas gastar 3/4 do orçamento numa landing única, cujos efeitos são todos gradiente+transform, é má alocação. **Traga o GSAP de volta somente se aparecer um requisito de timeline scrubbed com pin real** — e aí orce 46 KB, aceite as armadilhas de pin/`content-visibility`/`refresh()` da §1.1, e mantenha tudo o mais em zero.
6. **Trig.js** — não corte por peso (2,1 KB é ótimo), corte por atrito: sem ESM, sem tipos TS, sem `trig.min.js` publicado no npm. Num projeto Next + TypeScript o seu próprio IO é mais limpo.

### 6.4 O verdadeiro problema de performance deste projeto não é o JS de animação

Vale dizer com clareza, porque o teto de 60 KB pode dar uma falsa sensação de segurança: **10 embeds de YouTube são de longe o maior custo desta página.** Cada `<iframe>` de `youtube.com/embed` carrega centenas de KB de JS de terceiro, cookies e requisições — multiplicado por 10, num 4G, isso é uma ordem de grandeza acima de tudo que discutimos aqui.

A fachada (item 6 da tabela) — imagem de poster estática + `<iframe>` injetado só no clique — custa ~0,6 KB e economiza megabytes. Use `youtube-nocookie.com` no `src` injetado. Isso vale mais para a conversão da landing do que qualquer decisão entre GSAP e Motion.

Segundo: com `output: 'export'` o `next/image` padrão não funciona (§2). Numa landing "pesada em foto", resolver isso — AVIF/WebP responsivos, `srcset`, `loading="lazy"` (Baseline widely available desde 2026-06-19), `decoding="async"`, `width`/`height` explícitos contra CLS — importa mais que toda a camada de animação somada.

---

## 7. Resumo executivo por biblioteca

| Lib | Versão | Licença | gzip (tree-shaken real) | Veredito |
|---|---|---|---:|---|
| **CSS nativo** | — | — | **0 KB** | ✅ **Base de tudo** |
| **Motion mini** (`animate` + `inView`) | 12.43.0 | MIT | **3,3 KB** | ✅ Opcional, se quiser API |
| Trig.js (`trig-js`) | 4.2.1 | MIT | 2,1 KB | ⚠️ Sem ESM/TS |
| Lenis | 1.3.25 | MIT | 5,5 KB | ❌ Inerte em touch |
| Motion full | 12.43.0 | MIT | 25,5 KB | ❌ Caro para o uso |
| Anime.js v4 | 4.5.0 | MIT | 12,7–17,2 KB | ❌ Sem justificativa |
| GSAP + ScrollTrigger | 3.15.0 | Standard No-Charge (Webflow) | 45,1 KB | ❌ 76% do teto |
| lottie-web (light) | 5.13.0 | MIT | 46,5 KB | ❌ Estoura na prática |
| dotLottie web | 0.78.2 | MIT | 29 KB + **675 KB WASM** | ❌ Fora |
| Rive canvas | 2.39.1 | MIT (runtime) | 95,9 KB + **735 KB WASM** | ❌ Fora |

---

## 8. Itens NÃO CONFIRMADOS em fonte oficial

Registrados honestamente, sem estimativa:

1. **Trig.js:** peso declarado em KB e suporte de browser — o README oficial não declara nenhum dos dois. Os 2,1 KB gzip são **medição minha** do `src/trig.js` publicado (não minificado).
2. **Motion vanilla:** API pública documentada para `prefers-reduced-motion`. O entry exporta `prefersReducedMotion` / `initPrefersReducedMotion` / `hasReducedMotionListener`, mas nenhum consta na doc oficial. Tratados como internos.
3. **Anime.js v4:** API dedicada para `prefers-reduced-motion` — não existe na doc.
4. **Lenis:** opção de configuração para `prefers-reduced-motion` — não existe na doc.
5. **Anime.js v4:** a versão declarada na página oficial de instalação (4.0.0) **conflita** com o npm (4.5.0). A doc oficial está desatualizada; adotei o npm como autoritativo.
6. **Safari 26 / scroll-driven animations:** o post do WebKit blog que eu tentei buscar retornou 404 na URL testada. O dado de suporte (Safari 26 / Safari iOS 26) vem do `mdn/browser-compat-data` e do `web-features` v3.34.3, ambos fontes canônicas — mas o anúncio narrativo do WebKit não foi lido diretamente.
7. **Rive:** a página de pricing não declara a licença do runtime. O MIT vem do `package.json` publicado de `@rive-app/canvas@2.39.1` e do arquivo `LICENSE` no repo `rive-app/rive-wasm`.
