# 05 — ANIMAÇÃO DIRIGIDA POR ROLAGEM

Pesquisa de campo, agosto de 2026. Fontes: MDN, CSSWG drafts, WebKit blog,
Chrome for Developers, web.dev, caniuse, webstatus.dev API, BCD (mdn/browser-compat-data),
product-details.mozilla.org, W3C WCAG.

Alvo: landing única da Rapa Sound. Next.js `output:'export'`, Tailwind v4, React 19.
Teto de 60 KB gzip de JS de animação. **A recomendação deste documento gasta 0 KB.**

---

## 0. A CONCLUSÃO, ANTES DA PESQUISA

A virada FESTA→TÉCNICO é **a casa acendendo em degraus**: um plano branco `position: sticky`
cuja `opacity` vai de 0 a 1 em **7 passos discretos** (`steps(7, jump-none)`) ao longo de uma
seção-pivô, dirigido por `animation-timeline` numa *view progress timeline*. Não é um
esmaecimento suave — é um fader de mesa de luz subindo com detentes. A mesma quantização
(`steps()`) governa a coluna de pixels do progresso. **A assinatura da página inteira é uma
função de temporização: `steps()`.** "LED é pixel, não lâmpada" vira código literal.

Custo: 0 KB de JS. Suporte: 84% do tráfego. Fallback (Firefox, Safari < 26): corte seco —
a seção FESTA termina, a faixa branca começa. Que é exatamente o que uma mesa de luz faz
quando você aperta BLACKOUT e depois FULL. O fallback não é pior: é a mesma ideia sem os
degraus intermediários.

---

## 1. `animation-timeline: scroll()` e `view()` — ESTADO EM AGOSTO DE 2026

### 1.1 Baseline: NÃO. "Limited availability".

`webstatus.dev` API, feature `scroll-driven-animations`, consultada hoje:

```json
{ "baseline": { "status": "limited" },
  "browser_implementations": {
    "chrome":         { "version": "115", "date": "2023-07-18" },
    "chrome_android": { "version": "115", "date": "2023-07-21" },
    "edge":           { "version": "115", "date": "2023-07-21" },
    "safari":         { "version": "26",  "date": "2025-09-15" },
    "safari_ios":     { "version": "26",  "date": "2025-09-15" } } }
```

MDN carrega o banner literal: *"Limited availability — This feature is not Baseline because
it does not work in some of the most widely-used browsers."*
O único bloqueio é o Firefox.

### 1.2 Firefox: atrás de flag. Confirmado na fonte, não por boato.

`mdn/browser-compat-data`, `css/properties/animation-timeline.json`:

```json
"firefox": { "version_added": "preview" }
```

`"preview"` em BCD significa **Nightly/flag, não estável**. Confirmação cruzada em
`product-details.mozilla.org/1.0/firefox_versions.json` (hoje):

| canal | versão |
|---|---|
| `LATEST_FIREFOX_VERSION` (estável) | **153.0.3** (2026‑07‑21) |
| beta | 154.0b6 |
| nightly | 155.0a1 |

Flag: `layout.css.scroll-driven-animations.enabled`, ligada por padrão só no Nightly
(Bugzilla 1817303; meta 1676779 / 1676780). É prioridade declarada do **Interop 2026**.
Pontuação WPT do Firefox no canal **estável**: `0.089`. No experimental: `0.783`.
Tradução: no Firefox que as pessoas usam hoje, isto **não existe**.

> ⚠️ **Armadilha do caniuse.** A tabela do caniuse mostra "Firefox 156". Aquilo é a coluna
> de versão futura/nightly, não o limiar de suporte. Ela também mostra "Chrome for Android
> 150", quando o suporte real começou no 115. Não cite esses números. Cite o BCD.

### 1.3 Safari: sim, desde 26.0 — mas mire em 26.5.

Safari 26.0 / iOS 26.0 (15 de setembro de 2025) trouxe a família inteira. O WebKit blog
"A guide to Scroll-driven Animations with just CSS" confirma **`scroll()` e `view()`**.

**Safari 26.5 (11 de maio de 2026) consertou quatro bugs reais** — release notes, verbatim:

1. "Fixed support for the `scroll` animation timeline range name in scroll-driven animations."
2. "Fixed an issue where scroll-driven animations were not properly paused when
   `animation-play-state` was dynamically set to `paused`."
3. **"Fixed an issue where view timeline animations near the 0% and 100% thresholds reported
   incorrect progress values."**
4. **"Fixed an issue where animation timelines could fail to restore correctly after
   navigating back to a page from the back-forward cache."**

O nº 3 é sério para reveals com `view()` (o primeiro e o último quadro davam valor errado)
e o nº 4 é sério para nós: o brasileiro navega com botão voltar. Em iOS 26.0–26.4 há um
risco residual; a partir de 26.5 está limpo. Não há como detectar 26.5 por CSS — desenhe
para que um progresso errado a 0%/100% seja invisível (ver §5, o truque do `steps()`, que
absorve erro de fração).

### 1.4 A família inteira, versão por versão (BCD)

| propriedade | Chrome/Edge | Safari + iOS | Firefox estável |
|---|---|---|---|
| `animation-timeline` (`auto`/`none`/`scroll()`/`view()`) | 115 | 26 | ✗ preview |
| `animation-range`, `-start`, `-end` | 115 | 26 | ✗ preview |
| `scroll-timeline`, `scroll-timeline-name/-axis` | 115 | 26 | ✗ preview |
| `view-timeline`, `view-timeline-name/-axis/-inset` | 115 | 26 | ✗ preview |
| `timeline-scope` | **116** | 26 | ✗ preview |

Nenhum buraco parcial entre Chrome e Safari. Ou tem tudo, ou não tem nada. Isso simplifica
a detecção enormemente.

### 1.5 A detecção correta com `@supports` — e por que a óbvia está errada

Bramus (Chrome DevRel, autor do `scroll-driven-animations.style`) documentou que
`@supports (animation-timeline: scroll())` **passa no Firefox Nightly**, que tem implementação
parcial e roda com temporização errada. A checagem correta acrescenta `animation-range`,
que a implementação parcial do Firefox não tem:

```css
@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%)) {
  /* aqui dentro, e só aqui, mora animação dirigida por rolagem */
}
```

Use exatamente esta condição. É a que este documento usa em todo lugar.

### 1.6 `@supports` NÃO testa media feature. Isto é inválido:

```css
/* ❌ INVÁLIDO — o bloco inteiro é descartado em silêncio */
@supports (animation-timeline: view()) and (prefers-reduced-motion: no-preference) { … }
```

`@supports` avalia **declarações** (`propriedade: valor`), não *media features*
(css-conditional-5: `supports() = supports( <declaration> )`). A função `media()` existe
só para a regra `@when`, que nenhum navegador implementa em 2026. `prefers-reduced-motion:
reduce` não é declaração válida ⇒ a condição inteira dá falso ⇒ suas animações somem sem
aviso. **Aninhe duas at-rules separadas.** Sempre.

### 1.7 A armadilha do atalho `animation`

MDN, verbatim:

> "The `animation-timeline` is reset to the default `auto` value by the `animation` shorthand
> property, but cannot be set using the shorthand. Therefore, when creating scroll-driven
> animations, always declare the `animation-timeline` **after** any `animation` shorthand
> declarations to achieve the desired effect."

**Regra da casa: nesta base de código, animação dirigida por rolagem usa só longhands.**
Nada de atalho `animation`. Elimina a classe inteira de bug, inclusive o caso perverso de um
`animation: none` num bloco de reduced-motion apagar junto o `animation-timeline`.

### 1.8 Timeline nomeada só olha para cima. `timeline-scope` conserta.

Chrome for Developers, verbatim: *"even for named Scroll Timelines the lookup from the subject
to the scroller happens across ancestors only."* Um elemento `position: fixed` fora da árvore
da seção-pivô **não enxerga** a timeline dela. Solução (usada em §3 e §5):

```css
:root { timeline-scope: --virada; }      /* eleva o nome ao topo do documento */
```

### 1.9 Faixas nomeadas (`animation-range`) — definições da spec

`drafts.csswg.org/scroll-animations-1`, resumido:

| faixa | quando |
|---|---|
| `cover` | do instante em que o elemento **encosta** no viewport até sair dele por completo |
| `contain` | período em que o elemento está **inteiramente contido** no viewport — ou, se for **maior que o viewport, o cobre por inteiro**. É exatamente a janela de "pin". |
| `entry` | `cover 0%` → `contain 0%` (a entrada) |
| `exit` | `contain 100%` → `cover 100%` (a saída) |
| `entry-crossing` / `exit-crossing` | variantes que medem o cruzamento da borda, úteis com elementos maiores que o viewport |

E a nota da spec que autoriza tudo o que vem a seguir:

> "For sticky-positioned boxes the 0% and 100% progress conditions can sometimes be satisfied
> by a range of scroll positions rather than just one. Each range therefore indicates whether
> to use the earliest or latest qualifying position."

### 1.10 Veredito

**Use.** 84% do tráfego, zero JS, roda fora da main thread. Os 16% restantes (essencialmente
Firefox e iOS < 26) recebem a página estática — que é uma página boa, não uma página quebrada,
porque a arquitetura de §2 garante isso por construção.

---

## 2. A LEI DA CASA: ESTADO FINAL NA BASE, ANIMAÇÃO POR CIMA

Este é o item (d) do briefing, e ele vem **antes** das receitas porque governa todas elas.

### 2.1 O antipadrão (é o que está hoje no `app/globals.css`)

```css
.rev { opacity: 0; transform: translateY(14px); }   /* ❌ base = invisível */
```

Base invisível cria uma dívida que se paga com JS (`Reveal.tsx`, IntersectionObserver),
com `.no-js`, e com `!important` no bloco de reduced-motion. Três mecanismos para consertar
um erro de um. E se qualquer um dos três falhar — JS bloqueado, erro de hidratação, CSP —
o conteúdo **fica invisível para sempre**. Numa landing que vende para mãe de debutante, isso
é a página inteira sumindo.

### 2.2 O padrão

```css
/* 1. BASE = o estado final, visível, completo. Sem JS, sem animação, sem condição. */
.rev { }                       /* literalmente nada. O elemento já está certo. */

/* 2. A animação é OPT-IN, atrás de dois portões aninhados. */
@supports ((animation-timeline: view()) and (animation-range: 0% 100%)) {
  @media (prefers-reduced-motion: no-preference) {
    .rev { /* longhands aqui */ }
  }
}

/* 3. O estado inicial escondido existe SÓ dentro do @keyframes. */
@keyframes entrar { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
```

Três consequências que resolvem o briefing inteiro:

- **Nada pode encalhar invisível.** O estado escondido só existe dentro de `@keyframes`, que
  só existe dentro dos dois portões.
- **`prefers-reduced-motion` é atendido por construção**, com portão positivo
  (`no-preference`). Não há nada para desfazer ⇒ não há risco de ordem de cascata.
- **Zero JS.** `components/Reveal.tsx` pode ser deletado inteiro.

### 2.3 O risco de ordem de cascata que o portão positivo elimina

`@supports` e `@media` são *conditional group rules*: **contribuem zero especificidade**.
Logo, com especificidade igual, quem vem depois no arquivo ganha:

```css
@media (prefers-reduced-motion: reduce) { .rev { animation: none } }
@supports (animation-timeline: view()) { .rev { animation-name: entrar; … } }
/* ❌ o @supports vem depois e vence. O usuário com reduced-motion recebe a animação. */
```

Com o portão positivo (`no-preference`) esse bug não existe, porque a animação **nunca chega
a ser declarada** para quem pediu menos movimento.

### 2.4 Delete o reset atômico do `globals.css`

Hoje:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; … }   /* ❌ */
}
```

MDN diz explicitamente que isto está errado, verbatim
(*Using media queries for accessibility*):

> "The value of `prefers-reduced-motion` is `reduce`, **not 'none'**. This preference does not
> mean all animations must be removed, which could be achieved with `* {animation: none
> !important;}`. Rather, users expect motion animation, including those triggered by user
> interaction, **to be disabled unless the animation is essential** to the functionality or
> the information being conveyed."

web.dev apresenta o reset `animation-duration: 0.01ms !important` **numa seção "bonus"
explicitamente destinada a extensões de navegador**, com o aviso de que quebra sites.
Além disso o reset dispara `animationend` no primeiro quadro e mata indicadores de
carregamento, que são *essenciais*.

Com a arquitetura de §2.2 o bloco de reduced-motion encolhe para meia dúzia de linhas
honestas (transições de hover, `scroll-behavior`), sem um único `!important`.

### 2.5 O que a WCAG realmente exige aqui

**2.3.3 Animation from Interactions (AAA)**, verbatim:

> "Motion animation triggered by interaction can be disabled, unless the animation is
> essential to the functionality or the information being conveyed."

E o entendimento oficial nomeia a rolagem:

> "Moving new content into the viewport is essential for scrolling. The user controls the
> essential scrolling movement so it is allowed. **Only add non-essential animation to the
> scrolling interaction in a responsible way.**"

O primeiro exemplo do critério é literalmente *"Parallax scrolling with option to turn off
unnecessary motion globally"*. Ou seja: parallax e cinemática de rolagem estão **dentro do
escopo** e precisam morrer sob `reduce`. Fade puro de `opacity` pode ficar — é a substituição
que a própria MDN demonstra, e o WebKit registra que *"simple crossfades are not known to
cause adverse effects in those with motion sensitivity"*.

Relacionado, e de nível A (obrigatório): **2.2.2 Pause, Stop, Hide** cobre movimento que
começa sozinho e dura mais de 5s. O `blackout` de 400ms da página está fora desse escopo.

---

## 3. (a) A VIRADA FESTA→TÉCNICO

### 3.1 A ideia

A página tem dois estados. Entre eles, uma seção-pivô alta, vazia, que existe só para dar
distância de rolagem. Dentro dela um plano branco `position: sticky` que preenche o viewport
e **acende em 7 degraus** conforme você rola. Enquanto ele está preso, a tela é o plano: a
seção FESTA já saiu por cima, a seção TÉCNICO ainda não chegou. Você rola e a casa acende,
clique a clique, como um fader com detentes.

Depois do pivô, tudo é TÉCNICO: `--branco` sólido, mono, sem foto. Estático. Nada anima
mais para baixo. **Um evento na página inteira.** Isso atende à proibição de "efeito que
dispara a cada rolagem e cansa" — não há efeito recorrente, há um acontecimento.

Por que `steps()` e não um fade: um fade suave de preto para branco é o cross-fade genérico
de qualquer template. Sete degraus é a leitura literal da direção — LED é pixel, dimmer é
canal DMX de 8 bits, luz de casa sobe em nível, não em rampa contínua. Um técnico de som
reconhece em meio segundo. E, praticamente, `steps()` esconde qualquer imprecisão de fração
do Safari 26.0–26.4 (§1.3): entre degraus, erro de 2% não produz quadro nenhum.

### 3.2 Marcação

```tsx
{/* ...fim de #eventos (FESTA)... */}

<div className="virada">
  <div className="virada__plano" aria-hidden="true" />
  <p className="virada__nota lab">HOUSELIGHTS · 100%</p>
</div>

<div className="tecnico">
  {/* #rider, #sobre, #duvidas, #contato */}
</div>
```

Três nós de DOM. `virada__plano` é decoração pura (`aria-hidden`). `virada__nota` é conteúdo
real e legível nos dois caminhos.

### 3.3 CSS — base estática primeiro

```css
@layer components {
  /* ---------- ESTADO TÉCNICO: estático, sempre, em todo navegador ---------- */
  .tecnico {
    background: var(--color-branco);
    color: var(--color-void);
    --tubo-cor: var(--color-void);
  }
  .tecnico .lab { color: color-mix(in srgb, var(--color-void) 55%, transparent); }

  /* ---------- A VIRADA — CAMINHO BASE (fallback) ----------------------------
     Sem animação dirigida por rolagem, a virada é um CORTE SECO: a faixa
     branca começa e pronto. É o que uma mesa de luz faz. Não é uma versão
     pior — é a mesma ideia sem os degraus.
     ------------------------------------------------------------------------ */
  .virada {
    position: relative;
    background: var(--color-branco);
    min-block-size: 40svh;
    padding-block: 17svh;
    text-align: center;
  }
  .virada__plano { display: none; }
  .virada__nota  { color: color-mix(in srgb, var(--color-void) 45%, transparent); }
}
```

`display: block` de propósito — nada de grid nem flex. Um item `sticky` dentro de container
flex/grid é uma fonte conhecida de comportamento estranho de dimensionamento, e aqui não há
nenhum benefício em troca.

### 3.4 CSS — a camada dirigida por rolagem

```css
@keyframes acender-sala { from { opacity: 0 } to { opacity: 1 } }
@keyframes acender-nota { from { opacity: 0 } to { opacity: 1 } }

@supports ((animation-timeline: view()) and (animation-range: 0% 100%)) {
  @media (prefers-reduced-motion: no-preference) {

    /* o pivô cresce e deixa de pintar sozinho: quem pinta agora é o plano */
    .virada {
      min-block-size: 170svh;
      padding-block: 0;
      background: transparent;
      view-timeline-name: --virada;
      view-timeline-axis: block;
    }

    /* o plano que acende — preso no topo do viewport durante o pivô */
    .virada__plano {
      display: block;
      position: sticky;
      inset-block-start: 0;
      block-size: 100svh;
      margin-block-end: -100svh;      /* não ocupa espaço no fluxo */
      background: var(--color-branco);
      pointer-events: none;
      z-index: 0;

      /* SÓ LONGHANDS — ver §1.7 */
      animation-name: acender-sala;
      animation-duration: 1ms;
      animation-timing-function: steps(7, jump-none);   /* 0 · 1/6 · … · 1 */
      animation-fill-mode: both;
      animation-timeline: --virada;
      animation-range: contain 0% contain 100%;         /* = a janela presa */
    }

    /* a nota mono acompanha o plano e entra nos últimos degraus,
       quando já há branco suficiente para lê-la */
    .virada__nota {
      position: sticky;
      inset-block-start: calc(50svh - 0.6em);
      z-index: 1;
      animation-name: acender-nota;
      animation-duration: 1ms;
      animation-timing-function: steps(4, jump-none);
      animation-fill-mode: both;
      animation-timeline: --virada;
      animation-range: contain 62% contain 100%;
    }
  }
}
```

### 3.5 Por que `contain 0% → contain 100%` é exatamente o pin

O pivô tem 170svh, mais alto que o viewport. Pela spec, para um elemento **maior que o
viewport** a faixa `contain` é o intervalo em que ele **cobre o viewport por inteiro** — que
é, letra por letra, o período em que o filho `sticky` está grudado. Sem GSAP, sem cálculo,
sem JS: a faixa `contain` **é** a janela de pin. A distância de rolagem da virada é
`170svh − 100svh = 70svh`. Ajustar a duração da virada = mudar um número.

`margin-block-end: -100svh` no plano é o detalhe que faz o sticky não empurrar o layout:
o plano ocupa 100svh de altura mas devolve os 100svh ao fluxo, então `min-block-size: 170svh`
no pai define sozinho a distância. A nota também é `sticky`, presa a meia altura, e se solta
sozinha quando `.virada` termina — sem uma linha de cálculo.

### 3.6 A 380px

Funciona sem ajuste. `100svh` (small viewport height) é a unidade correta: é a altura **com**
as barras do navegador visíveis, então o plano nunca fica curto quando a barra do Safari iOS
reaparece. `svh` é Baseline widely available desde 2023.

Um ajuste vale a pena — 70svh de rolagem em 7 degraus dá 10svh por degrau no celular, o que
é bastante. Encurte no mobile:

```css
@media (max-width: 640px) {
  @supports ((animation-timeline: view()) and (animation-range: 0% 100%)) {
    @media (prefers-reduced-motion: no-preference) { .virada { min-block-size: 150svh } }
  }
}
```

### 3.7 O que fazer com o `.tubo` na virada — `@property` bem usado

O `@property --tubo-cor` já existe no `globals.css`. A coluna de pixels precisa trocar de
âmbar (sobre void) para grafite (sobre branco) **no mesmo momento** da virada — e trocar
**seco**, não desbotando por um roxo intermediário. `steps(2, jump-none)` dá exatamente dois
valores, 0 e 1: uma troca, sem meio-termo.

```css
@supports ((animation-timeline: view()) and (animation-range: 0% 100%)) {
  :root { timeline-scope: --virada; }     /* §1.8 — o .prog é fixed, fora da árvore do pivô */

  @media (prefers-reduced-motion: no-preference) {
    @keyframes virar-cor {
      from { --tubo-cor: #FFA300; --tubo-fundo: #09090B }
      to   { --tubo-cor: #09090B; --tubo-fundo: #ECEDEF }
    }
    .prog {
      animation-name: virar-cor;
      animation-duration: 1ms;
      animation-timing-function: steps(2, jump-none);
      animation-fill-mode: both;
      animation-timeline: --virada;
      animation-range: contain 45% contain 55%;   /* troca no meio da subida */
    }
  }
}
```

Isto exige um segundo registro, irmão do que já existe:

```css
@property --tubo-fundo { syntax: '<color>'; inherits: true; initial-value: #09090B; }
```

**`@property` é muito mais seguro que `animation-timeline`** — ver §6. Chrome 85,
**Safari/iOS 16.4**, Firefox 128; Baseline *newly available* desde 09/07/2024. É a única peça
desta arquitetura que roda em Firefox — mas aqui ela está dentro do `@supports`, então não
roda. Tudo bem: no fallback o `.prog` nem aparece (§5.5).

---

## 4. (b) REVEALS ESCALONADOS SEM UM BYTE DE JS

### 4.1 A revelação central: com `view()`, o escalonamento é geometria, não tempo

O `Reveal.tsx` de hoje calcula `--d` (delay em ms) por índice. Isso é desnecessário. Com uma
*view progress timeline*, cada elemento tem **sua própria** timeline, ancorada na posição dele
no documento. Dois cards em linhas diferentes entram no viewport em posições de rolagem
diferentes ⇒ **o escalonamento acontece sozinho, e é dirigido pelo dedo do usuário**, não por
um cronômetro. A 380px, onde o grid é de uma coluna, você ganha o stagger perfeito de graça,
sem uma linha de configuração.

Delay temporal em reveal de rolagem é, na verdade, um defeito: o usuário rola rápido, o
conteúdo ainda está esperando um `transition-delay` de 240ms. Com `view()` isso não existe.

### 4.2 O código

```css
@keyframes entrar {
  from { opacity: 0; transform: translateY(14px) }
  to   { opacity: 1; transform: none }
}

/* BASE: nada. O elemento já está no estado final. */

@supports ((animation-timeline: view()) and (animation-range: 0% 100%)) {
  @media (prefers-reduced-motion: no-preference) {
    .rev {
      animation-name: entrar;
      animation-duration: 1ms;
      animation-timing-function: var(--ease-out-cut);
      animation-fill-mode: both;
      animation-timeline: view();
      animation-range: entry 8% cover 24%;
    }
  }
}
```

`entry 8% cover 24%`: começa quando o elemento já cruzou 8% da entrada (evita o quadro exato
de 0%, onde o Safari 26.0–26.4 reportava valor errado — §1.3) e termina cedo, a 24% do
`cover`. O elemento fica **inteiro** muito antes de chegar ao centro da tela. Reveal que
termina no centro da tela é o erro clássico: o usuário lê conteúdo meio transparente.

### 4.3 Escalonamento dentro de uma linha do grid (só desktop)

Cards lado a lado na mesma linha entram juntos. Deslocamento por índice:

```tsx
<article className="card rev" style={{ ['--i' as string]: i }}>
```

```css
@supports ((animation-timeline: view()) and (animation-range: 0% 100%)) {
  @media (prefers-reduced-motion: no-preference) and (min-width: 768px) {
    .rev {
      animation-range: entry calc(8% + var(--i, 0) * 7%)
                       cover calc(24% + var(--i, 0) * 7%);
    }
  }
}
```

`--i` é um número puro, o `calc()` resolve a porcentagem. Abaixo de 768px a regra não se
aplica e o escalonamento volta a ser geométrico — que é melhor.

> **Verificar em navegador:** `calc()` dentro de `animation-range` é gramaticalmente válido
> (`<length-percentage>`), mas não achei nota explícita na MDN nem exemplo oficial. Se falhar,
> o plano B custa três classes estáticas (`.rev-1{animation-range:entry 15% cover 31%}` etc.)
> e nenhum JS.

### 4.4 Incompatibilidade a registrar

**Não coloque `content-visibility: auto` numa seção que contenha `.rev`.** A spec é normativa:
animações em subárvore pulada *"do not advance in their timeline"*, e novas *"are not created"*.
O mesmo vale para IntersectionObserver, que nunca reporta interseção em conteúdo pulado.
Detalhe em §9.4.

### 4.5 O que deletar

- `components/Reveal.tsx` — inteiro. **−0,4 KB gzip.**
- `.rev { opacity: 0; transform: … }`, `.rev-on`, `.no-js .rev` do `globals.css`.
- A classe `no-js` e o script que a remove no `layout.tsx`, se existir só para isso.
- Os `!important` de `.rev` no bloco de reduced-motion.

Resultado: **~1 KB → 0 KB** de JS de animação. O teto de 60 KB fica com 60 KB de folga.

---

## 5. (c) A COLUNA DE PIXELS DISCRETOS — O INDICADOR DE PROGRESSO

### 5.1 O princípio

Uma barra de progresso é uma linha contínua. A direção proíbe linha contínua. A solução
não é estilizar a linha: é **quantizar o tempo**. `animation-timing-function: steps(22, end)`
faz a animação avançar em 22 saltos, e cada salto acende exatamente um ponto. A coluna nunca
está "62% acesa" — ela está com 13 pixels acesos e 9 apagados. É um vúmetro de LED.
Sem glow, sem gradiente, sem blur.

### 5.2 A mecânica: translação exata, não escala

O erro óbvio é escalar (`scaleY`) a coluna acesa — isso **deforma o padrão de pontos**.
A solução: uma **capa opaca** que desliza para baixo por `translateY`, revelando a coluna
acesa que está por baixo, intacta. E como o deslocamento total é exatamente a altura da
coluna, cada um dos 22 passos vale exatamente **um passo de pixel** ⇒ o padrão de pontos da
capa continua alinhado com o da coluna acesa em todos os quadros. É por isso que `translateY`
e `steps(N)` casam com N = número de pixels.

Só `transform` e `opacity`. Nenhum reflow. Roda no compositor.

### 5.3 Marcação

```tsx
export function Progresso() {
  return (
    <div className="prog" aria-hidden="true">
      <i />                {/* a capa que desce */}
    </div>
  )
}
```

Um elemento e um filho. `aria-hidden` — o leitor de tela já sabe onde está; um indicador de
progresso decorativo só polui. Sem `role="progressbar"`, que exigiria `aria-valuenow` e,
portanto, JS.

### 5.4 CSS

```css
@layer components {
  .prog {
    --pitch: 9px;    /* passo entre pixels */
    --ponto: 4px;    /* altura do pixel aceso */
    --n: 22;         /* quantos pixels — mantenha igual ao steps() abaixo */

    display: none;                        /* base: não existe. Ver §5.5 */
    position: fixed;
    z-index: 40;
    inset-block-start: 50%;
    inset-inline-start: calc(8px + env(safe-area-inset-left, 0px));
    inline-size: 3px;
    block-size: calc(var(--n) * var(--pitch));   /* 198px */
    translate: 0 -50%;                    /* propriedade independente: não briga com o transform animado */
    overflow: hidden;
    pointer-events: none;
  }

  /* camada ACESA — a coluna inteira, na cor do estado corrente */
  .prog::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to bottom,
      var(--tubo-cor) 0 var(--ponto),
      transparent var(--ponto) var(--pitch));
    background-size: 100% var(--pitch);
    background-repeat: repeat-y;
  }

  /* CAPA — opaca, com os mesmos pontos em versão apagada. Desce em degraus. */
  .prog > i {
    position: absolute;
    inset: 0;
    background-color: var(--tubo-fundo);
    background-image: linear-gradient(to bottom,
      color-mix(in srgb, var(--tubo-cor) 20%, var(--tubo-fundo)) 0 var(--ponto),
      var(--tubo-fundo) var(--ponto) var(--pitch));
    background-size: 100% var(--pitch);
    background-repeat: repeat-y;
  }
}

@keyframes prog-acender { from { transform: translateY(0) } to { transform: translateY(100%) } }

@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%)) {
  @media (prefers-reduced-motion: no-preference) {
    .prog { display: block; }
    .prog > i {
      animation-name: prog-acender;
      animation-duration: 1ms;
      animation-timing-function: steps(22, end);   /* == --n */
      animation-fill-mode: both;
      animation-timeline: scroll(root block);
      animation-range: 0% 100%;
    }
  }
}
```

`translateY(100%)` é 100% da **própria altura da capa** = `22 × 9px` = a coluna inteira.
Com `steps(22, end)` cada passo vale `9px` = um `--pitch` exato. Alinhamento perfeito em
todos os 22 quadros. Se você mudar `--n`, mude o `steps()` junto — são o mesmo número.

`steps(22, end)` (= `jump-end`) produz 0, 1/22 … 21/22 e só chega a 1 no fim absoluto da
página. Correto: o último pixel só acende quando você chega ao rodapé de verdade.

`scroll(root block)` usa o scroller do documento. Não precisa de `timeline-scope` (só
timelines *nomeadas* precisam) — mas o `.prog` também escuta `--virada` para trocar de cor
(§3.7), e **essa** precisa, por isso o `:root { timeline-scope: --virada }`.

### 5.5 O fallback: a coluna simplesmente não existe

`display: none` na base. Um indicador de progresso que não indica progresso é ruído.
Isto **não empobrece** o Firefox: a assinatura de pixels discretos continua presente em toda
a página no `.tubo` das laterais dos cards, que é CSS estático e roda em qualquer lugar. A
coluna fixa é o bônus de quem tem o motor.

### 5.6 A 380px

`8px + safe-area` da borda esquerda, 3px de largura, 198px de altura, centrada verticalmente.
Não colide com texto (o container tem padding lateral) nem com o CTA de WhatsApp, que fica
no canto inferior direito. Se o CTA for uma barra inferior de largura total, suba a coluna:
`inset-block-start: 42%`.

### 5.7 Uma decisão de moderação

Considere fazer a coluna **aparecer só depois da dobra** e sumir no rodapé, com um segundo
par de keyframes de `opacity` em `steps(1)` — mas só se ela incomodar em teste real.
Efeito permanente na periferia é justamente o tipo de coisa que cansa. Meça antes de adicionar.

---

## 6. `@property` — SUPORTE E USO

### 6.1 Estado

`webstatus.dev`, feature `registered-custom-properties`:

| | versão | data |
|---|---|---|
| Chrome / Chrome Android | 85 | 2020‑08‑25 |
| Edge | 85 | 2020‑08‑27 |
| **Safari / iOS Safari** | **16.4** | 2023‑03‑27 |
| Firefox / Firefox Android | 128 | 2024‑07‑09 |

**Baseline: newly available desde 09/07/2024.** Vira *widely available* em janeiro de 2027
(30 meses). Na prática, em agosto de 2026: seguro, inclusive iOS. É a peça mais bem suportada
desta pesquisa — melhor que `animation-timeline` por larga margem, e a única que também roda
em Firefox.

### 6.2 Por que é obrigatório para animar cor em custom property

Custom property não registrada é `syntax: '*'` — um token qualquer, sem tipo. O motor não
sabe interpolar entre dois tokens, então a transição é **discreta**: salta no meio.
Registrar com `syntax: '<color>'` dá tipo à propriedade e habilita interpolação real.
`inherits: true` é o que faz o valor descer para `::before`, `::after` e filhos —
indispensável no `.tubo`/`.prog`, onde o valor é declarado no pai e consumido nas camadas.

`initial-value` é **obrigatório** para qualquer `syntax` que não seja `'*'`; sem ele a regra
`@property` inteira é inválida e ignorada. O `globals.css` já faz certo.

Em navegador sem `@property` (não é mais o caso de nenhum navegador relevante), o custom
property continua funcionando como texto — a animação só perde a suavidade e salta. Falha
elegante por natureza.

Detalhe da spec que é fácil violar: `initial-value` precisa ser **computacionalmente
independente**. `#FFA300` serve. `currentColor`, `3em` e qualquer coisa com `var()` **não
servem** e invalidam a regra `@property` inteira, em silêncio. O `globals.css` está correto.

E o modo de falha em navegador sem `@property` não é "nada acontece": a propriedade fica
não registrada, e o tipo de animação de custom property não registrada é **`discrete`** —
ela salta para o valor final na marca de 50% do trecho. Ou seja, sem registro você tem uma
troca seca. O que, nesta página, seria… quase o efeito desejado. Falha elegante de graça.

### 6.3 Interpolação de cor — a armadilha que quase todo mundo erra

**Não é oklab por padrão para as nossas cores.** CSS Color 4 §13.1 é normativo e explícito:

> "If the host syntax does not define what color space interpolation should take place in,
> **it defaults to Oklab**. However, user agents **must** handle interpolation between legacy
> sRGB color formats (**hex colors**, named colors, `rgb()`, `hsl()` or `hwb()` …) in
> **gamma-encoded sRGB space**. This provides Web compatibility."

Todos os tokens do projeto são hex (`#D81E7E`, `#FFA300`, `#ECEDEF`) ⇒ **interpolação em sRGB
gama-codificado**, que é justamente o espaço que produz o roxo lavado entre magenta e branco.
Não é bug de navegador que passa: é um MUST da spec.

Duas saídas:

1. **`steps()`** — com `steps(2, jump-none)` não existe valor intermediário nenhum, então o
   espaço de cor deixa de importar. **É a saída que este documento adota** (§3.7): o LED muda
   de estado, não desbota. Coerente com a direção e imune ao problema por construção.
2. Se algum dia você precisar de uma transição de cor contínua, basta escrever **um** dos dois
   extremos em notação não-legada (`oklch(…)` ou `color(srgb …)`) e a interpolação inteira
   passa para Oklab. Não existe sintaxe para escrever `in oklab` num `@keyframes` de custom
   property — a notação dos valores é a **única** alavanca.

### 6.4 Tailwind v4

Tailwind v4 emite `@property` para suas próprias variáveis internas (`--tw-gradient-from`,
`--tw-rotate-x` etc.) — o anúncio do v4.0 cita "Registered custom properties" como dependência
fundacional. O piso de compatibilidade declarado do Tailwind v4 é **Chrome 111 / Safari 16.4 /
Firefox 128**, que é exatamente a matriz de `@property` + `color-mix()`. O v4.1 acrescentou
fallbacks para Safari e Firefox antigos.

Funciona normalmente com `output: 'export'` — é CSS estático de build, sem runtime. Nenhum bug
de `@property` específico de export estático foi encontrado.

> ⚠️ **Um detalhe de ordem que afeta este arquivo.** O v4 emite um `@layer properties;` vazio
> no topo só para fixar a ordem, e o Lightning CSS **iça todo o conteúdo para a primeira
> ocorrência do nome da camada**. Regra prática: `@layer properties` precisa vir **depois** de
> qualquer `@import` externo. O `globals.css` começa com `@import "tailwindcss"` e só depois
> tem `@font-face` e `@theme` — ordem correta. Não reordene. Os relatos de quebra
> (tailwindlabs #18274, #15278) são de minificador/hoisting de camada, não do at-rule.

---

## 7. `position: sticky` + `animation-timeline` — SIM, SUBSTITUI O ScrollTrigger

### 7.1 A receita, em seis linhas

```css
.pin        { block-size: 300svh; view-timeline-name: --pin; }
.pin__palco { position: sticky; inset-block-start: 0; block-size: 100svh;
              margin-block-end: -100svh; }
.pin__item  { animation-name: X; animation-duration: 1ms; animation-fill-mode: both;
              animation-timeline: --pin; animation-range: contain 0% contain 100%; }
```

- **`.pin` alto** = a distância de rolagem "gasta" enquanto o palco fica preso.
- **`sticky` no filho** = o pin. É o navegador fazendo, não JS medindo.
- **`contain 0% → contain 100%`** = exatamente a janela em que o pai cobre o viewport =
  exatamente a janela em que o filho está preso. A spec autoriza isso na nota sobre
  sticky-positioned boxes (§1.9).

Isso cobre ~90% do que se usa GSAP ScrollTrigger para fazer numa landing: sequência presa,
capítulos que trocam, item que atravessa a tela enquanto o fundo fica parado. A 0 KB.

### 7.2 A regra que evita a dor de cabeça

**Declare a timeline no PAI alto, nunca no elemento `sticky`.** A spec diz que, para caixas
sticky, as condições de 0% e 100% podem ser satisfeitas por um *intervalo* de posições de
rolagem em vez de uma só — o que torna a timeline de um elemento sticky ambígua e
contra-intuitiva. O pai alto não é sticky, sua geometria é estável, e sua timeline é exata.
Esta é a regra prática mais importante desta seção.

### 7.3 Aplicação nesta página

Já está aplicada: a virada de §3 **é** um pin. `.virada` é o `.pin`, `.virada__plano` é o
`.pin__palco`. Não construa um segundo. Uma sequência presa numa landing é memorável; duas
são um site de agência.

---

## 8. VIEW TRANSITIONS API — IRRELEVANTE PARA A VIRADA. ÚTIL PARA UMA OUTRA COISA.

### 8.1 Estado

| | same-document | cross-document (`@view-transition`) |
|---|---|---|
| Baseline | **newly available**, 14/10/2025 | **limited** — não é Baseline |
| Chrome/Edge | 111 | 126 |
| Safari / iOS | 18.0 | 18.2 |
| Firefox | 144 | ✗ (não suportado) |

### 8.2 Âncora `#secao` NÃO dispara view transition. Ponto.

Um salto de fragmento **não é navegação entre dois documentos**. A spec css-view-transitions-2
é explícita: *"In cross-document view transition, what triggers a view transition is a
navigation between two documents."* E `navigation: auto` exige que o **documento de destino**
também opte pela regra — numa âncora não existe documento de destino, é o mesmo. Além disso,
uma view transition anima uma **mudança de DOM**; uma âncora muda só o offset de rolagem, que
está fora do modelo de snapshot.

**Conclusão: `@view-transition { navigation: auto }` numa landing de página única é código
morto.** Não custa nada e não faz nada. Não coloque.

> ⚠️ Nenhuma página oficial afirma isso nessas palavras literais — a exclusão é estrutural,
> deduzida da spec + HTML Standard. A citação mais próxima é a definição de `navigation: auto`
> na MDN (o `navigationType` precisa ser `traverse`/`push`/`replace`).

Para âncoras, a ferramenta certa é `scroll-behavior: smooth` com o portão de reduced-motion —
que o `globals.css` já faz corretamente. Não mexa.

### 8.3 Onde ELA serve nesta página: a fachada do YouTube

São 10 embeds com fachada. A troca fachada → `<iframe>` real **é** uma mudança de DOM, e é
o caso de uso legítimo:

```ts
function abrirVideo(id: string) {
  const troca = () => setAtivo(id)
  if (!document.startViewTransition) return troca()   // detecção obrigatória
  document.startViewTransition(troca)
}
```

Custo: ~10 linhas, sem lib. O Chrome (post *View transitions misconceptions*) mede o overhead
do snapshot como *"negligible though, in reality only a few frames"* — os dados vêm do
compositor, sem layout nem repaint extra. E o novo estado é **ao vivo**, não um screenshot:
o vídeo já começa a tocar durante a transição.

Duas condições, se você adotar:

```css
/* reduced-motion NÃO é automático em nenhum navegador. Você tem que escrever. */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
    animation: none !important;
  }
}
```

E `view-transition-name` precisa ser **único entre elementos renderizados ao mesmo tempo** —
spec: *"If this name is not unique … then the view transition will abort."* Com 10 fachadas
na tela, nomear todas igual aborta tudo. Use nome único por vídeo, ou nenhum (o cross-fade
raiz padrão já resolve).

**Recomendação: opcional, baixa prioridade.** O cross-fade padrão de um facade→iframe é
sutil demais para justificar JS numa página que hoje tem 0 KB. Deixe para depois de medir.

---

## 9. `content-visibility: auto` — GANHO REAL, E UM CONFLITO PIOR DO QUE SE IMAGINA

### 9.1 Estado — e uma discrepância entre fontes oficiais

| fonte | Baseline | Chrome | Firefox | Safari + iOS |
|---|---|---|---|---|
| MDN (banner) | newly, **set/2024** | 85 | 125 | 18 |
| webstatus.dev | newly, **15/09/2025** | 108 | 130 | **26** |

**A data do webstatus é a correta em substância.** O BCD registra, verbatim, que o Safari
18–25 tinha implementação **parcial**:

```json
"safari": [ {"version_added": "26"},
            {"version_added": "18", "version_removed": "26",
             "partial_implementation": true,
             "notes": "Skipped content is not findable via find-in-page."} ]
```

Release notes do Safari 26.0: *"Fixed content skipped with `content-visibility: auto` to be
findable."* Ou seja: **em iOS 18 a 25 — base instalada enorme em agosto de 2026 —
`content-visibility: auto` quebra o Ctrl+F / "Buscar na página" em silêncio.** Numa landing
cujo tráfego é busca local, deixar o conteúdo invisível para a busca dentro da própria
página é o tipo de dano que ninguém detecta em QA.

### 9.2 Ganho medido, segundo a fonte oficial

web.dev, demo do blog de viagem: tempo de renderização inicial **232ms → 30ms**, descrito como
*"a 7x rendering performance boost on initial load"*; orientação geral de *"a reduction of 50%
or more from the rendering cost of loading"*. São custos de **layout + paint**, não LCP nem TTI.
Não há número oficial específico para página pesada de imagem.

### 9.3 O conflito de rolagem — texto da spec

`content-visibility: auto` que está pulando conteúdo força **size containment**: a seção faz
layout **como se não tivesse conteúdo** ⇒ colapsa para altura ~zero ⇒ a altura total do
documento encolhe assim que ela sai de alcance. css-contain-2 §4.3, verbatim:

> "if the element depends on its contents to determine its size, the layout of the page
> (or at least, the scrollbar position) **can 'jump around' as elements go off-screen and
> start skipping**."

Antídoto, também da spec — a forma com a palavra-chave `auto`:

> "using `contain-intrinsic-size: auto` to automatically **'snapshot' the exact size of the
> element from the last time it was rendered**, before it was skipped (along with providing an
> estimate of the size to be used before it's rendered and can have its size snapshotted)"

```css
contain-intrinsic-size: auto 900px;   /* estimativa até medir; depois, tamanho lembrado */
```

O Chrome 117+ e o Firefox já **implicam** o `auto`; o Safari nunca sinalizou. Escreva a
palavra-chave de qualquer jeito — é inofensiva onde já é implícita. E note: a implicação dá
só a metade "lembrar". **A estimativa em pixels continua sendo obrigação sua**, senão a
primeira renderização de uma seção nunca vista ainda colapsa para 0.

**Por que isso bate direto na assinatura desta página:** `animation-timeline: scroll(root)`
mede progresso como `scrollTop / (scrollHeight − clientHeight)`. Se `scrollHeight` muda
enquanto o usuário rola, **a coluna de pixels de §5 pula para trás** — chega a 60%, volta
para 48% porque uma seção lá embaixo resolveu ter altura de verdade. Com `steps(22)` isso
aparece como pixels **apagando**, que é a coisa mais chamativa que a coluna pode fazer.

E o efeito sobre as âncoras, css-contain-2 §4.5, verbatim:

> "For the purposes of scrolling operations, such as `scrollIntoView()`, an element with
> `content-visibility: auto` that is skipping its contents has its size and location determined
> **with size containment still active**. … Once it's scrolled into view, the element will no
> longer skip its contents … **if this changes the element's size, it might not align in the
> viewport exactly as requested.**"

A página tem menu de âncoras. Estimativas ruins ⇒ o link `#rider` erra o alvo.

### 9.4 O conflito que MATA a arquitetura deste documento

Este é o achado decisivo, e é normativo. css-contain-2 §4.5, verbatim:

> "While an element is skipped, CSS transitions and animations on the element do not update:
> **New animations are not created** even if newly-applied style would start one.
> **Existing animations do not advance in their timeline.** … When an element stops being
> skipped, animations and transitions are sampled and then resume advancing on their timelines
> as normal from that point."
> "Note: Overall, this is similar to the behavior of transitions/animations when a background
> tab is brought back to the foreground."

E, para quem ainda usa IntersectionObserver:

> "From the perspective of an **IntersectionObserver**, the skipped contents of an element are
> **never intersecting the intersection root**. This is true even if both the root and the
> target elements are in the skipped contents."

Tradução para esta página:

- **`content-visibility: auto` numa seção + `.rev` com `view()` nos filhos = os reveals nunca
  rodam** enquanto a seção está pulada, e "pulada" inclui o momento anterior à entrada, que é
  exatamente quando a animação deveria começar. Autodestrutivo.
- O mesmo vale para reveal por IntersectionObserver — o que, aliás, é mais um argumento para
  deletar o `Reveal.tsx` de vez.
- Se você quiser os dois, o alvo animado tem de ser **o próprio container** que carrega o
  `content-visibility`, não um descendente. (Rastreado em csswg-drafts#5611.)

### 9.5 `position: sticky` / `fixed` dentro: não faça

`content-visibility: auto` aplica **paint containment de forma permanente** — a spec é
explícita: *"layout containment, style containment, and paint containment persist even if the
element is **not** skipped."* Paint containment recorta o conteúdo na borda do box e
*"establishes an absolute positioning containing block and a **fixed positioning containing
block**"*.

Consequências: um `sticky` dentro some no instante em que sairia do box da seção, e — pior —
qualquer `position: fixed` descendente passa a ser posicionado **em relação à seção**, não ao
viewport. **Nunca em `.virada`. Nunca numa seção que contenha o `.prog`.**

> ⚠️ Não existe bug report nem nota de spec falando de `sticky` + `content-visibility` em
> palavras literais — a palavra "sticky" não aparece em css-contain-2. O raciocínio acima é
> derivado do texto normativo de paint containment.

### 9.6 Onde aplicar, então

Depois de tudo isso, a superfície segura é pequena — e tudo bem, porque o ganho também é
pequeno numa página que já é HTML estático:

```css
/* seções finais, longas, sem sticky, sem reveal por descendente */
#duvidas, #sobre {
  content-visibility: auto;
  contain-intrinsic-size: auto 900px;   /* MEDIR de verdade, por seção */
}
```

**NUNCA:** hero / seção do LCP (adiar o trabalho de layout do elemento do LCP só pode atrasar
o LCP — proibição explícita do briefing); `.virada`; qualquer seção com `.rev` dentro;
qualquer fachada de YouTube individualmente.

Sobre as fachadas: aplique no nível da **seção**, nunca por vídeo. Uma fachada já é `<img>` +
botão, não iframe; a contabilidade de containment por elemento não se paga, e 10 caixas
colapsando separadamente multiplicam a instabilidade da barra de rolagem. O ganho real ali é
`loading="lazy"` + `decoding="async"` + `width`/`height` explícitos (ou `aspect-ratio`) — que
de quebra já te dão a estimativa de `contain-intrinsic-size` de graça.

### 9.7 Acessibilidade e busca

`auto` **deve** manter o conteúdo encontrável por Ctrl+F, foco e navegação por Tab
(*"the skipped contents must still be available as normal to user-agent features"*) — mas isso
está quebrado no Safari 18–25 (§9.1). Foco tem tratamento especial e seguro: o elemento
**deixa de pular** antes de ser rolado até a posição.

`content-visibility: hidden` é outra coisa: esconde de verdade, `scrollIntoView` **não** rola
até ele, e o conteúdo **deve** sair da árvore de acessibilidade. É para isso que existe
`hidden="until-found"` (Chrome 102+), cuja folha de estilo do UA aplica
`content-visibility: hidden` mas mantém o conteúdo buscável e dispara `beforematch` no acerto.
Se você usar `<details>` ou acordeão nas dúvidas, `hidden="until-found"` é o caminho certo.

E um detalhe que a MDN não conta: para `auto`, a spec **permite** ao UA omitir o conteúdo
pulado da árvore de acessibilidade se não conseguir detectar tecnologia assistiva. Não conte
com conteúdo fora da tela estar na árvore.

### 9.8 Recomendação final

**Baixa prioridade. Aplique em duas seções finais, com estimativa medida, e valide com a
lista de §10.3.** Se a coluna de progresso piscar uma única vez, remova — a assinatura vale
mais que 30ms de renderização inicial numa página que já é estática.

---

## 10. PLANO DE APLICAÇÃO

### 10.1 O atalho no Tailwind v4

Um `@custom-variant` que significa "o navegador tem o motor **e** o usuário aceita movimento":

```css
/* app/globals.css, depois do @import "tailwindcss" */
@custom-variant sda {
  @supports ((animation-timeline: view()) and (animation-range: 0% 100%)) {
    @media (prefers-reduced-motion: no-preference) {
      @slot;
    }
  }
}
```

Uso: `class="sda:opacity-0"`, `class="sda:[animation-timeline:view()]"`.
Sintaxe confirmada na doc do v4 (forma de bloco com `@slot` e at-rules aninhadas).

**Mas:** para os blocos longos de §3 e §5, escreva CSS de verdade em `@layer components`,
como o projeto já faz. Utilitário arbitrário com `steps(7, jump-none)` e `contain 0% contain 100%`
dentro de colchetes é ilegível e frágil. Use a variante `sda:` para ajustes pontuais.

### 10.2 Ordem de execução

1. **Deletar** `components/Reveal.tsx`, `.rev`/`.rev-on`/`.no-js .rev`, o reset atômico de
   reduced-motion e os `!important` associados. Ganho imediato: −1 KB de JS, −3 mecanismos.
2. **Reescrever** `.rev` no padrão de §4.2. Verificar que, com JS desligado no DevTools,
   a página inteira está visível.
3. **Registrar** `@property --tubo-fundo` ao lado do `--tubo-cor` que já existe.
4. **Construir** `.virada` (§3) entre `#eventos` e `#rider`, e envolver `#rider`…`#contato`
   em `.tecnico`.
5. **Construir** `.prog` (§5) e montá-lo no `layout.tsx`, fora do `<main>`.
6. **Testar**, nesta ordem: iOS 26.5 Safari em 380px → Chrome Android → Firefox estável
   (deve ver a versão estática, íntegra) → macOS com "Reduzir movimento" ligado.
7. **Só então** avaliar `content-visibility` (§9) e `startViewTransition` (§8.3).

### 10.3 Checklist de verificação

- [ ] JS desligado: toda a página visível, nada escondido.
- [ ] Firefox 153: corte seco na virada, sem coluna de progresso, nada quebrado.
- [ ] Reduzir movimento ligado: idêntico ao Firefox 153. Nada se move.
- [ ] 380px: o plano da virada cobre o viewport inteiro com a barra do Safari visível **e**
      recolhida (isso é o `svh` fazendo o trabalho).
- [ ] Botão voltar do navegador, depois da virada: o estado volta correto (bug corrigido só
      no Safari 26.5 — §1.3).
- [ ] Coluna de progresso: rolar de cima a baixo devagar. Nenhum pixel pode apagar. Se
      apagar, é `content-visibility` (§9.3).
- [ ] Se adotar `content-visibility`: todos os links de âncora do menu acertam o alvo; Ctrl+F
      acha texto das seções finais (testar em iOS ≤ 25, onde isso é sabidamente quebrado);
      nenhum `.rev` dentro de seção com `content-visibility` (§9.4).
- [ ] KB de JS de animação no bundle: **0**.

---

## 11. RESUMO DE SUPORTE — TABELA ÚNICA

| recurso | Baseline | Chrome | Safari + iOS | Firefox estável | veredito |
|---|---|---|---|---|---|
| `animation-timeline` `scroll()`/`view()` | **limited** | 115 | **26** (mire 26.5) | **✗ flag** (153) | usar com `@supports` |
| `animation-range` | limited | 115 | 26 | ✗ | idem — e é o que detecta |
| `timeline-scope` | limited | **116** | 26 | ✗ | idem |
| `@property` | newly (07/2024) | 85 | **16.4** | 128 | **seguro, usar** |
| `content-visibility` | newly (**09/2025**, não 09/2024) | 108 | **26** (18–25 parcial) | 130 | usar pouco — §9.4 e §9.5 |
| View Transitions (same-doc) | newly (10/2025) | 111 | 18.0 | 144 | opcional, fora da virada |
| `@view-transition` (cross-doc) | **limited** | 126 | 18.2 | ✗ | **não usar** — página única |
| `prefers-reduced-motion` | widely (2020) | — | — | — | obrigatório |

---

## 12. FONTES

**Spec e dados de suporte**
- CSSWG, Scroll-driven Animations — https://drafts.csswg.org/scroll-animations-1/
- CSSWG, CSS Conditional Rules 5 — https://drafts.csswg.org/css-conditional-5/
- CSSWG, View Transitions 1 e 2 — https://drafts.csswg.org/css-view-transitions-1/ · https://drafts.csswg.org/css-view-transitions-2/
- CSSWG, CSS Containment 2 §4.3/§4.5/§4.6 — https://drafts.csswg.org/css-contain-2/
- CSSWG, CSS Sizing 4 §5.2 "Last Remembered Size" — https://drafts.csswg.org/css-sizing-4/
- CSSWG, CSS Color 4 §13.1 (espaço de interpolação) — https://drafts.csswg.org/css-color-4/#interpolation
- Houdini, CSS Properties and Values API 1 — https://drafts.css-houdini.org/css-properties-values-api-1/
- webstatus.dev API — `/v1/features/scroll-driven-animations`, `/registered-custom-properties`, `/content-visibility`, `/view-transitions`
- mdn/browser-compat-data — `css/properties/animation-timeline.json` e irmãos
- product-details.mozilla.org — `firefox_versions.json`

**MDN**
- animation-timeline — https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline
- Guia: Scroll-driven animations / Timelines — https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines
- Using media queries for accessibility — https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility
- prefers-reduced-motion · @property · content-visibility · @view-transition · view-transition-name

**WebKit / Chrome / web.dev**
- WebKit, A guide to Scroll-driven Animations with just CSS — https://webkit.org/blog/17101/
- WebKit Features in Safari 26.0 — https://webkit.org/blog/17333/
- WebKit Features for Safari 26.5 — https://webkit.org/blog/17938/
- Chrome, Animate elements on scroll — https://developer.chrome.com/docs/css-ui/scroll-driven-animations
- Chrome, NRK case study (o exemplo oficial mais próximo de reduced-motion + SDA) — https://developer.chrome.com/blog/nrk-casestudy
- Chrome, View transitions misconceptions — https://developer.chrome.com/blog/view-transitions-misconceptions
- web.dev, prefers-reduced-motion — https://web.dev/articles/prefers-reduced-motion
- web.dev, content-visibility — https://web.dev/articles/content-visibility

**Outros**
- Bram.us, Feature detecting Scroll-Driven Animations: check animation-range too — https://www.bram.us/2024/09/24/feature-detecting-scroll-driven-animations-you-want-to-check-for-animation-range-too/
- scroll-driven-animations.style (Bramus) — catálogo de demos
- W3C, WCAG 2.3.3 Understanding — https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- W3C, WCAG técnica C39 — https://www.w3.org/WAI/WCAG21/Techniques/css/C39
- Bugzilla 1676779 / 1676780 / 1817303 — implementação no Firefox
- Tailwind v4, `@custom-variant` com `@slot` — https://tailwindcss.com/docs/adding-custom-styles

---

## 13. O QUE NÃO FOI CONFIRMADO

- `calc()` dentro de `animation-range` (§4.3): gramaticalmente válido, sem exemplo oficial.
  Testar; plano B sem JS já descrito.
- `steps(var(--n))`: substituição de custom property em `animation-timing-function` deve
  funcionar (substituição ocorre antes do parse do valor), mas não achei confirmação oficial.
  **Por isso o código de §5.4 escreve `steps(22, end)` literal.**
- `animation-timeline` em pseudo-elemento (`::after`): não achei declaração oficial de suporte
  no Safari além de `::marker`. **Por isso §5.3 usa um `<i>` real para a camada animada**, e
  reserva o pseudo-elemento para a camada estática.
- Nenhuma fonte oficial afirma em palavras literais que navegação por fragmento não dispara
  `@view-transition` (§8.2); a conclusão é estrutural, derivada da spec + HTML Standard.
- MDN e Chrome não têm seção dedicada a `prefers-reduced-motion` nos guias de scroll-driven
  animations. A receita de §2.2 é sintetizada do NRK case study + orientação geral da MDN.
- Números de "primeira versão" do caniuse para navegadores móveis (Chrome Android 150,
  Firefox 156) são colunas de versão corrente, não limiares de suporte. Use o BCD.
- Nenhum bug específico de `@property` + `animation-timeline: scroll()` no Safari, nem de
  `@property` + `color-mix()`, foi encontrado. Ausência de relato, não prova de ausência.
- Não existe lista oficial enumerando quais propriedades são compostas fora da main thread.
  A consequência prática — animar custom property é recálculo de estilo por quadro, na main
  thread, ao contrário de `transform`/`opacity` — é dedução, não citação. Mais um motivo para
  a troca de cor de §3.7 usar `steps(2)`: dois quadros de trabalho na página inteira.
- Nenhuma citação oficial da web.dev/Chrome proíbe `content-visibility: auto` no elemento do
  LCP em palavras literais. A proibição segue do mecanismo e da orientação geral.
- `sticky` + `content-visibility` (§9.5): derivado do texto de paint containment, sem bug
  report citável.
- Discrepância a relatar: MDN data o Baseline de `content-visibility` em set/2024;
  webstatus.dev em 15/09/2025. **A segunda está certa** — Safari 18–25 embarcou `auto` com
  find-in-page quebrado (webkit.org/b/283846), corrigido só no Safari 26.
