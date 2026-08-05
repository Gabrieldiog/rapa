# 13 — Interação por toque, carrosséis e listas roláveis horizontais

Pesquisa para o site da Rapa Sound (Next.js 15.5.4 `output: 'export'`, React 19, Tailwind v4,
framer-motion 12.43, GSAP 3.15). Tráfego majoritariamente celular, largura crítica **380px**,
iOS Safari e Chrome Android.

Todos os números de suporte foram conferidos em **04–05/08/2026** contra caniuse.com, MDN,
Chrome for Developers e bugs.webkit.org. Onde a fonte é um blog e não uma tabela de suporte,
está dito no texto.

---

## RESUMO EXECUTIVO (decisões concretas)

1. **Rolagem nativa, não drag.** `overflow-x: auto` + `scroll-snap-type: x mandatory`. Drag do framer-motion não é operável por teclado, não gera `scrollend`, não tem momentum do iOS e exige `touch-action` correto para não sequestrar a rolagem vertical. Reprovado para o item principal.
2. **O primeiro item começa colado à esquerda com respiro** usando o par obrigatório `padding-inline-start` **+** `scroll-padding-inline-start` **com o mesmo valor**. Só um dos dois é o bug clássico do "primeiro item cortado".
3. **O último item respira com um `::after` espaçador dentro da fita flex**, não com `padding-right` no scroller — o padding final é ignorado no overflow do flex em vários motores.
4. `scroll-snap-stop: always` ligado (Safari 15+, 94,18% global) para o dedo não passar voando por cima de duas pessoas.
5. **Setas: `<button>` reais de 48×48px**, `disabled` nas pontas, alvo detectado por `scrollLeft <= 1` e `scrollLeft >= scrollWidth - clientWidth - 1` (a tolerância existe porque `scrollWidth`/`clientWidth` são arredondados para inteiro e `scrollLeft` é fracionário).
6. **`scrollend` só chegou ao iOS Safari 26.2** (86,68% global). Fallback obrigatório com debounce de ~140ms.
7. **CSS Carousel (`::scroll-button()`, `::scroll-marker`) é Chromium-only** (68,07%, zero Safari/Firefox). Não use como mecanismo único — no máximo como enfeite futuro.
8. **`whileHover` não dispara no toque** (é filtrado por design pela Motion). Feedback no celular vem de `whileTap` + item ativo marcado por `IntersectionObserver`.
9. **Alvo de toque:** WCAG 2.2 SC 2.5.8 (AA) = **24×24 CSS px**; Apple = 44×44pt; Material = 48×48dp. Ficamos em 48px — as `.leque-seta` atuais (3rem) já passam.
10. **Sem `role="carousel"`** (não existe). `role="group"` + `aria-label` + **`tabindex="0"` no container rolável** (exigência de WCAG 2.1.1; Safari nunca faz sozinho).
11. **`overscroll-behavior-x: contain` não impede o "voltar" por gesto no iOS** — bug WebKit 240183, aberto desde 2022. Ponha mesmo assim (segura Chrome Android e corta o scroll chaining), mas não conte com ele.
12. **Desktop mantém o leque GSAP**, isolado por `gsap.matchMedia()` — que reverte os estilos inline sozinho ao cruzar o breakpoint.

---

## TABELA DE SUPORTE — conferida em 04/08/2026

| Recurso | Chrome/Edge | Safari desktop | **Safari iOS** | Firefox | Samsung | Global |
|---|---|---|---|---|---|---|
| CSS Scroll Snap (`scroll-snap-type`, `-align`) | 69+ | 11+ | **11+** | 68+ | 10.1+ | **95,01%** |
| `scroll-snap-stop: always` | 75+ / 79+ | 15+ | **15+** | 103+ | 11.1+ | **94,18%** |
| `scroll-padding` / `scroll-margin` | ✅ | ✅ | ✅ | ✅ | ✅ | Baseline widely available (abr/2021) |
| `overscroll-behavior` | 65+ / 79+ | 16+ | **16+** | 59+ | 8.2+ | **94,13%** |
| `scrollIntoView({options})` | 61+ / 79+ | 14+ | **14+** | 36+ | ✅ | **94,28%** |
| **`scrollend`** | 114+ | 26.2+ | **26.2+** | 109+ | — | **86,68%** |
| `::scroll-marker` / `::scroll-marker-group` | **135+** | ❌ | ❌ | ❌ | 29+ | **68,07%** |
| `::scroll-button()` | **135+** | ❌ | ❌ | ❌ | 29+ | **68,07%** |
| `@container scroll-state()` | **133+** | ❌ | ❌ | ❌ | — | — |
| Scroller focável por teclado sem `tabindex` | 132+ (só sem filhos focáveis) | ❌ | ❌ | ✅ (desde FF4) | — | — |

Fontes: <https://caniuse.com/css-snappoints> · <https://caniuse.com/mdn-css_properties_scroll-snap-stop> ·
<https://caniuse.com/css-overscroll-behavior> · <https://caniuse.com/mdn-api_element_scrollintoview_options_parameter> ·
<https://caniuse.com/mdn-api_element_scrollend_event> · <https://caniuse.com/mdn-css_selectors_scroll-marker> ·
<https://caniuse.com/mdn-css_selectors_scroll-button> · <https://developer.chrome.com/blog/css-scroll-state-queries> ·
<https://developer.chrome.com/blog/keyboard-focusable-scrollers> ·
<https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding>

> **Nota sobre a tabela:** o caniuse lista "Chrome for Android 150" e "Safari iOS 26.5" como
> versões *correntes*, não como versão de estreia. Para Chrome Android a estreia acompanha a do
> Chrome desktop (ex.: `scrollend` = 114). Para `scrollend` no iOS, a estreia é **26.2** e isso
> importa: **13% do mundo ainda não tem `scrollend`**, e uma boa fatia disso é iPhone antigo.

---

## 1. CSS Scroll Snap, completo

### 1.1 `mandatory` vs `proximity`

MDN, *Basic concepts of scroll snap*
(<https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap/Basic_concepts>):

- **`mandatory`** — "the browser **must** snap to each scroll point". O container nunca descansa
  fora de uma posição de encaixe.
- **`proximity`** — o navegador decide; só encaixa se a parada já ficou perto de um ponto.

O aviso normativo, na letra da MDN:

> "Never use `mandatory` if the content inside one of your child elements will overflow the parent
> container because user will not be able to scroll the overflowing content into view."

E o web.dev reforça (<https://web.dev/articles/css-scroll-snap>):

> "Avoid using mandatory snapping when target elements are widely spaced apart. This can cause
> content in between the snap positions to become inaccessible."

**Decisão para o leque:** `x mandatory`. São 6 cards de largura fixa, nenhum maior que o
scrollport, nenhum com texto longo que precise ser lido em rolagem livre. É exatamente o caso
canônico de `mandatory`. Use `proximity` só se em algum aparelho você observar o "bounce-back"
descrito em 1.4.

### 1.2 O par que resolve o "primeiro item cortado" — a parte que quase todo mundo erra

Esse é o núcleo do problema. `scroll-snap-align: start` alinha a borda inicial do item com a borda
inicial da **"optimal viewing region"** do scrollport — e essa região é definida pelo
`scroll-padding`. MDN, *scroll-padding*:

> "The `scroll-padding` property defines insets that establish the **optimal viewing region** of a
> scrollport within a scroll container."
> "While defined in the CSS scroll snap module, this property applies to all scroll containers, no
> matter the value of the `scroll-snap-type` property."

A aritmética, que é o que ninguém explica:

```
posição de encaixe do item = deslocamento do item − scroll-padding-inline-start
```

- Se você põe **só** `padding-inline-start: 20px` no scroller: o item 1 fica a 20px do conteúdo,
  o `scroll-padding` é 0, então a posição de encaixe é `20 − 0 = 20`. O navegador **rola para 20**
  e come exatamente o respiro que você acabou de criar. O item cola na borda. É esse o bug.
- Se você põe **só** `scroll-padding-inline-start: 20px`: o item 1 fica a 0 do conteúdo, a posição
  de encaixe é `0 − 20 = −20`, que é clampado a 0. Funciona, mas você não tem o respiro visual, o
  card encosta na borda da tela.
- **Os dois juntos, com o mesmo valor:** encaixe = `20 − 20 = 0`. O container descansa em
  `scrollLeft === 0`, o primeiro item aparece com 20px de folga, e a seta "anterior" fica
  corretamente desabilitada. É a combinação certa.

```css
.trilho {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-inline-start: 1.25rem;        /* respiro visual */
  scroll-padding-inline-start: 1.25rem; /* mesma medida: encaixe em scrollLeft 0 */
}
.trilho > li { scroll-snap-align: start; }
```

Alternativa equivalente, se você preferir a folga por item: `scroll-margin-inline-start: 1.25rem`
nos filhos. MDN: `scroll-margin` "defines an outset from a child element's box". Nunca use os dois
mecanismos ao mesmo tempo — eles somam.

**A pegadinha:** `scroll-padding` **não é** `padding`. Ele não empurra pixel nenhum; ele só move o
alvo do encaixe. Se você usar só ele, o card encosta na borda. Se usar só o `padding`, o encaixe
pula o respiro. Tem que ser o par.

### 1.3 O último item — por que `padding-right` não funciona e o que funciona

Bug histórico e ainda vivo: o padding do lado final de um container flex com overflow horizontal
é ignorado na área rolável em vários motores. A discussão normativa está aberta no CSSWG:
*"Should scrolling area contain the last item's margin in flexbox?"* (issue #4577) —
<https://lists.w3.org/Archives/Public/public-css-archive/2019Dec/0144.html>.

A solução robusta, do Ryan Mulligan
(<https://ryanmulligan.dev/blog/x-scrolling-centered-max-width-container/>): um **`::after` que é um
item flex de verdade**, dentro da fita, não no scroller.

```css
/* o scroller: overflow, snap, padding inicial */
.trilho {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-inline-start: var(--respiro);
  scroll-padding-inline-start: var(--respiro);
}

/* a fita: flex, gap, e o espaçador */
.fita {
  display: flex;
  gap: var(--gap);
  margin: 0; padding: 0; list-style: none;
}
.fita::after {
  content: '';
  flex: 0 0 auto;
  /* o gap já entrega var(--gap); só falta a diferença */
  inline-size: calc(var(--respiro) - var(--gap));
}
```

Estrutura de dois níveis (`div.trilho > ul.fita > li`) porque:
- o `overflow` e o `scroll-padding` precisam ficar no scroller;
- o `::after` precisa ser um **item flex irmão dos `<li>`**, logo precisa ficar na fita;
- e assim o `<ul>` continua sendo uma lista de verdade para o leitor de tela, sem `role` por cima.

**A pegadinha:** se você puser o `::after` no scroller (que não é flex), ele vira um bloco e nada
acontece. Ele tem que ser filho do container flex.

### 1.4 `scroll-snap-stop: always`

MDN (<https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-stop>): com `always` o container
"must not pass over a possible snap position" — um gesto rápido avança **um** item, não cinco.

Para um mural de 6 pessoas isso é o comportamento certo: o objetivo é a pessoa ver cada rosto, não
chegar rápido ao fim. Suporte: Safari 15+, iOS 15+, Chrome 75+, Firefox 103+ (94,18%).

**A pegadinha:** há relatos consistentes de que alguns motores móveis ignoram `always` em telas
pequenas durante flings muito rápidos. Não é garantia contratual — é uma melhoria. Não construa
lógica que dependa de "só avança um por gesto"; derive o estado sempre da posição real de rolagem.
Nos navegadores onde o snap está ativo, o iOS **desliga o momentum de fling** dentro do scroller
(um flick = um item), o que aqui é vantagem.

### 1.5 Esconder a barra de rolagem sem quebrar a rolagem

```css
.trilho { scrollbar-width: none; }              /* padrão, Firefox e Chromium modernos */
.trilho::-webkit-scrollbar { width: 0; height: 0; } /* WebKit/Blink antigos */
```

Não use `overflow: hidden` para "esconder a barra": isso mata a rolagem por teclado e por gesto.

---

## 2. Setas de navegação

### 2.1 Como calcular o alvo

Três opções, da pior para a melhor:

**(a) `scrollBy` com largura fixa do item** — quebra se os itens tiverem larguras diferentes e
ignora `scroll-padding`. Só serve para grades rígidas.

```ts
el.scrollBy({ left: dir * larguraDoItem, behavior: 'smooth' })
```

**(b) `scrollBy` com o passo medido** — a distância entre o início de dois itens consecutivos já
inclui o `gap`:

```ts
function passo(trilho: HTMLElement, itens: HTMLElement[]) {
  if (itens.length < 2) return trilho.clientWidth
  return itens[1].offsetLeft - itens[0].offsetLeft
}
el.scrollBy({ left: dir * passo(el, itens), behavior: 'smooth' })
```

**(c) `scrollIntoView({ inline: 'start', block: 'nearest' })` — recomendado.** O navegador respeita
`scroll-padding` e `scroll-margin` de graça, então o item cai exatamente onde o snap o colocaria.
Suporte de opções: Chrome 61+, Safari 14+, iOS 14+, Firefox 36+ (94,28%).

```ts
alvo.scrollIntoView({
  behavior: reduzido ? 'auto' : 'smooth',
  inline: 'start',
  block: 'nearest',   // ← obrigatório
})
```

> **A pegadinha mais cara desta seção:** sem `block: 'nearest'`, `scrollIntoView` rola **todos os
> ancestrais roláveis**, inclusive a página. O usuário clica na seta do carrossel e a página inteira
> pula na vertical. `block: 'nearest'` diz "na vertical, só mexa se for necessário" — e como o item
> já está visível, nada acontece.

### 2.2 Desabilitar nas pontas — e a razão do `-1`

```ts
const max = el.scrollWidth - el.clientWidth
setNoInicio(el.scrollLeft <= 1)
setNoFim(max <= 0 || el.scrollLeft >= max - 1)
```

**Por que a tolerância de 1px:** `scrollWidth` e `clientWidth` são devolvidos **arredondados para
inteiro**, enquanto `scrollLeft` é fracionário (subpixel) desde o Chrome 39. MDN, `Element.scrollWidth`:
o valor "will round the value to an integer. If you need a fractional value, use
`element.getBoundingClientRect()`". A thread do Blink sobre precisão subpixel diz o mesmo, na letra:

> "Today setting `scrollLeft = scrollWidth - clientWidth` does not guarantee that it scrolls to the
> end as `scrollWidth` and `clientWidth` are both rounded."
> — <https://groups.google.com/a/chromium.org/g/blink-dev/c/_Q7A4AQBFKY/m/S4ahQ5iE28QJ>

Na prática, num iPhone com `devicePixelRatio: 3` e larguras em `vw`, o container encosta no fim em
`scrollLeft = 812.6667` enquanto `scrollWidth - clientWidth = 813`. Sem tolerância a seta "próximo"
nunca desabilita. Com zoom de navegador o erro cresce; se você observar falha, `<= 2` é aceitável —
não passe disso ou a seta desabilita cedo demais.

Dois cuidados extras:
- **`max <= 0`** significa "não há o que rolar" — as duas setas desabilitam e você pode esconder a
  barra de controles inteira. Isso resolve o desktop de graça.
- **RTL:** em `direction: rtl` o `scrollLeft` é negativo no Chrome/Firefox modernos. Não é o caso do
  site (PT-BR), mas se um dia for, troque por `Math.abs()` nas comparações.

### 2.3 Ouvir isso sem matar a performance

**`scrollend` é a resposta certa e ainda não é universal.** MDN
(<https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event>): "fires when element
scrolling has completed… User gestures like touch panning or trackpad scrolling aren't complete
until pointers or keys have been released." Baseline *newly available* desde **dezembro de 2025**;
**Safari iOS só a partir do 26.2**; global **86,68%**.

Detecção e fallback:

```ts
/** chama `cb` quando a rolagem assenta; usa scrollend onde existir */
function aoAssentar(el: HTMLElement, cb: () => void): () => void {
  if ('onscrollend' in window) {
    el.addEventListener('scrollend', cb)
    return () => el.removeEventListener('scrollend', cb)
  }
  // fallback: debounce. 140ms cobre a pausa do momentum do iOS sem
  // parecer travado. Abaixo de ~100ms dispara no meio do fling.
  let t: ReturnType<typeof setTimeout>
  const h = () => { clearTimeout(t); t = setTimeout(cb, 140) }
  el.addEventListener('scroll', h, { passive: true })
  return () => { clearTimeout(t); el.removeEventListener('scroll', h) }
}
```

**Para o estado das setas, `scrollend` é tarde demais** — a seta ficaria acesa durante todo o
gesto. Use rAF no `scroll` e reserve `scrollend` para o que é caro (anúncio no leitor de tela):

```ts
useEffect(() => {
  const el = ref.current
  if (!el) return
  let raf = 0
  const aoRolar = () => {
    if (raf) return
    raf = requestAnimationFrame(() => { raf = 0; medir() })
  }
  medir()
  el.addEventListener('scroll', aoRolar, { passive: true })
  const ro = new ResizeObserver(medir)   // reavalia quando a largura muda
  ro.observe(el)
  return () => {
    el.removeEventListener('scroll', aoRolar)
    ro.disconnect()
    if (raf) cancelAnimationFrame(raf)
  }
}, [medir])
```

Notas honestas sobre esse trecho:
- `{ passive: true }` em `scroll` é **cosmético** — o evento `scroll` não é cancelável, então
  `passive` não muda nada. Ele importa em `touchstart`/`wheel`. Deixe assim mesmo, documenta a
  intenção e não custa nada.
- Ler `scrollLeft`/`scrollWidth` força recálculo de layout. Uma vez por frame é barato; uma vez por
  evento `scroll` (que pode disparar várias vezes por frame no iOS) não é. Daí o rAF.
- `ResizeObserver` é necessário porque `scrollWidth - clientWidth` muda com rotação de tela e com a
  barra de endereço do iOS colapsando.

**Para o "item ativo" (marcadores, destaque), `IntersectionObserver` com `root` no scroller** — zero
leitura de layout, zero reflow:

```ts
const io = new IntersectionObserver(
  (entradas) => {
    for (const e of entradas) {
      e.target.classList.toggle('is-ativo', e.isIntersecting)
      if (e.isIntersecting) setAtivo(itens.indexOf(e.target as HTMLLIElement))
    }
  },
  { root: el, threshold: 0.65 },   // root = o container rolável
)
itens.forEach((li) => io.observe(li))
```

É o mesmo desenho do carrossel do Adam Argyle (GUI Challenges), que usa
`new IntersectionObserver(…, { root: this.elements.scroller, threshold: .6 })` e
`scroller.addEventListener('scrollend', this.#synchronize)` —
<https://github.com/argyleink/gui-challenges/blob/main/carousel/carousel.js>.

O `threshold: 0.65` importa: com um item espiando à direita, só o item majoritariamente visível
cruza o limiar. Se você usar `0.5` com dois itens visíveis, os dois ficam ativos.

### 2.4 O caminho puro-CSS para desabilitar as setas (Chromium)

`@container scroll-state(scrollable: …)` faz isso sem JS, mas só no **Chrome/Edge 133+**
(<https://developer.chrome.com/blog/css-scroll-state-queries>):

```css
.trilho { container-type: scroll-state; }

@supports (container-type: scroll-state) {
  .seta-esq { @container scroll-state(not (scrollable: left))  { opacity: .3; } }
  .seta-dir { @container scroll-state(not (scrollable: right)) { opacity: .3; } }
}
```

Não substitui o JS: sem Safari, não há como desabilitar de fato o `<button>` (opacidade não é
`disabled`), e o iOS é metade do tráfego aqui. **Use apenas como enfeite, se usar.**

---

## 3. CSS Carousel do Chrome 135+ — o que dá e o que não dá hoje

Chrome for Developers, *Carousels with CSS* (<https://developer.chrome.com/blog/carousels-with-css>),
implementando o CSS Overflow 5:

```css
.carrossel {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-marker-group: after;         /* grupo de marcadores DEPOIS do scroller */

  > li { scroll-snap-align: center; }
  > li::scroll-marker { content: ' '; }
  > li::scroll-marker:target-current { background: var(--accent); }

  &::scroll-button(left)  { content: "⬅" / "Rolar para a esquerda"; }
  &::scroll-button(right) { content: "⮕" / "Rolar para a direita"; }
  &::scroll-button(*):focus-visible { outline-offset: 5px; }
}
```

O que o navegador entrega de brinde (fonte: mesmo artigo):
- botões `<button>` de verdade, com ordem de tabulação correta;
- o grupo de marcadores é exposto como **`tablist`** ao leitor de tela e opera como *focusgroup*;
- `:target-current` marca o item encaixado;
- cada `::scroll-button()` rola **85% da área visível** por clique;
- a sintaxe `content: "⮕" / "Rolar para a direita"` separa o glifo do **nome acessível** — o texto
  depois da barra é o que o leitor de tela lê.

**Suporte real hoje (04/08/2026):** Chrome/Edge **135+**, Opera 120+, Samsung Internet 29+.
**Zero Safari (nenhuma versão), zero Firefox (nenhuma versão).** Global **68,07%**.
<https://caniuse.com/mdn-css_selectors_scroll-marker> · <https://caniuse.com/mdn-css_selectors_scroll-button>

**Veredito para este projeto: não usar como mecanismo.** O problema não é só o percentual — é que
metade do tráfego é iOS Safari e você precisaria manter os dois caminhos (botões CSS + botões React)
com o risco real de **aparecerem duas fileiras de setas** no Chrome. Se um dia quiser, o degrade
correto é esconder o seu JS quando o nativo existir:

```css
/* condição desconhecida => falso => os botões React continuam. Direção segura. */
@supports selector(::scroll-button(right)) {
  .minhas-setas { display: none; }
}
```

`@supports selector(...)` avalia como falso em navegadores que não conhecem a função, então o
fallback é o comportamento padrão — exatamente o que se quer. Ainda assim: **teste em aparelho**
antes de confiar, e prefira um caminho só.

---

## 4. Arrastar com framer-motion **versus** rolagem nativa

### 4.1 O que a Motion oferece

`drag`, `drag="x"`, `dragConstraints` (objeto de pixels ou `ref` de um elemento), `dragElastic`
(0–1, elasticidade ao passar do limite), `dragMomentum` (inércia, `false` desliga),
`dragTransition` (`bounceStiffness`/`bounceDamping`), `dragDirectionLock` ("lock an element to the
first axis it's dragged on") — <https://motion.dev/docs/react-drag>.

### 4.2 Argumento: **rolagem nativa vence**, para acessibilidade e para iOS

**(a) Teclado.** É o argumento que fecha a questão. A doc da Motion lista teclado só para o gesto de
*tap*: "`Enter` pressed activates `onTapStart` and `whileTap`; `Enter` released triggers `onTap`"
(<https://motion.dev/docs/react-gestures>). **Não existe operação por setas para `drag`.** Um
carrossel de drag puro é conteúdo inalcançável por teclado, o que viola **WCAG 2.1.1 Keyboard
(Nível A)** — "all functionality of the content is operable through a keyboard interface". Um
container `overflow-x: auto` com `tabindex="0"`, ao contrário, **já rola com as setas do teclado
sem uma linha de JS**, e com `scroll-snap-type` ativo ele encaixa item a item.

**(b) Leitor de tela.** Quando o VoiceOver ou o TalkBack move o foco/leitura para um filho fora da
área visível de um **container rolável real**, o navegador rola o container. Num `<div>` deslocado
por `transform`, não há container rolável: o conteúdo continua fora da tela e o leitor lê algo que o
usuário com baixa visão não consegue enxergar. O `tabindex` + rolagem nativa é a base de todo o
material do Adrian Roselli sobre áreas roláveis
(<https://adrianroselli.com/2022/06/keyboard-only-scrolling-areas.html>).

**(c) iOS.** Desde o iOS 13 o WebKit aplica *one-finger accelerated scrolling* a todos os
`overflow: scroll` — a inércia é do sistema, roda no compositor, e sobrevive a JS travado na main
thread. Drag em JS reproduz isso à mão a cada frame. Além disso, só a rolagem nativa emite
`scroll`/`scrollend`, funciona com `scroll-snap-*`, com `scrollIntoView`, com `overscroll-behavior`
e com o *scroll anchoring* do navegador. Com drag, você perde tudo isso de uma vez.

**(d) Sequestro do scroll vertical.** É o defeito mais visível em campo: o usuário tenta rolar a
página com o dedo em cima do carrossel e a página não anda. A doc da Motion diz explicitamente,
sobre pan: *"For touch inputs, disable touch scrolling via the `touch-action` CSS property on the
x/y axis or both."* Se você errar isso, quebra a página.

**(e) Peso.** Rolagem nativa custa ~0 KB de JS. É relevante num `output: 'export'` que quer LCP baixo.

### 4.3 Se mesmo assim você usar drag (só desktop, só como enfeite)

```tsx
<motion.div
  drag="x"
  dragDirectionLock                       /* o 1º movimento decide o eixo */
  dragConstraints={{ left: -maxX, right: 0 }}
  dragElastic={0.06}                      /* quase nada: 0.5 dá "borracha" e engana */
  dragMomentum={false}                    /* sem inércia falsa competindo com o snap */
  style={{ touchAction: 'pan-y' }}        /* ← A LINHA QUE SALVA A PÁGINA */
/>
```

`touch-action: pan-y` diz ao navegador: *"a rolagem vertical é sua; a horizontal é minha"*. Com
`drag="y"` seria `pan-x`; com `drag` nos dois eixos seria `none` (e aí a página trava mesmo, por
definição). Não confie na biblioteca aplicar isso — **declare explicitamente**, é o que a própria
doc manda. Discussão de referência: <https://github.com/framer/motion/issues/429>.

E, mesmo assim, **feche o drag atrás de um `matchMedia`**, para o celular nunca cair nesse caminho:

```ts
const [ponteiroFino, setPonteiroFino] = useState(false)
useEffect(() => {
  const mq = matchMedia('(hover: hover) and (pointer: fine)')
  const sync = () => setPonteiroFino(mq.matches)
  sync(); mq.addEventListener('change', sync)
  return () => mq.removeEventListener('change', sync)
}, [])
```

> **Cuidado com SSG:** o projeto é `output: 'export'`. Ler `matchMedia` no primeiro render causa
> mismatch de hidratação. O padrão acima (estado inicial `false`, ajuste no `useEffect`) é o correto:
> o HTML estático sai sempre no caminho "celular", que é o caminho que importa aqui.

---

## 5. `whileHover` não existe no toque — o que colocar no lugar

### 5.1 A confirmação, na doc

Motion for React, guia de hover (<https://motion.dev/docs/react-hover-animation>), na letra:

> `onHoverStart` e `onHoverEnd` **"won't fire as the result of a touch event."**

> A função `hover()` **"automatically filters out polyfilled hover events from touch screens, which
> can normally lead to broken visual states."**

Ou seja: a Motion **filtra por tipo de ponteiro de propósito**, justamente para você não herdar o
"hover grudado" do `:hover` do CSS no iOS (onde o estado fica preso até o próximo toque em outro
lugar). Consequência direta: **tudo que estiver em `whileHover` é invisível para 100% do seu tráfego
principal.** Se o destaque do card só existe em `whileHover`, no celular ele simplesmente não existe.

O componente atual já acerta a metade CSS disso, ao fechar o hover do GSAP com
`matchMedia('(hover: hover) and (pointer: fine)')` (`LequeEquipe.tsx:154`). O que falta é dar o
*equivalente* no toque, não só suprimir.

### 5.2 Os três substitutos, e quando usar cada um

| Padrão | Quando | Custo |
|---|---|---|
| `whileTap` | feedback de **pressão** (o card afunda ao encostar) | ~0; funciona com `Enter` no teclado |
| `whileInView` | destaque de **entrada** (o card acende ao aparecer) | dispara uma vez; não segue a rolagem |
| **`IntersectionObserver` + classe `is-ativo`** | destaque do **item central/encaixado** | um observer; é o padrão correto para carrossel |

**O padrão correto aqui é o terceiro.** O "hover" de um leque no desktop significa *"este é o card
em foco"*. No celular, o card em foco é **o que está encaixado no snap**. Logo:

```tsx
// mesmo observer da seção 2.3 — ele já dá a classe e o índice ativo
```

```css
.equipe-item          { opacity: .55; transition: opacity 300ms var(--ease-out-cut); }
.equipe-item.is-ativo { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .equipe-item { opacity: 1; transition: none; }
}
```

E o feedback de pressão, que é o que o dedo espera:

```tsx
<motion.figure whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }}>
```

### 5.3 A versão CSS pura (Chromium, enfeite)

`@container scroll-state(snapped: x)` marca o item encaixado sem JS nenhum — Chrome/Edge 133+,
sem Safari, sem Firefox (<https://developer.chrome.com/blog/css-scroll-state-queries>):

```css
.equipe-item {
  container-type: scroll-state;
  scroll-snap-align: start;
}
@supports (container-type: scroll-state) {
  .equipe-item > * {
    transition: opacity .4s ease;
    @container not scroll-state(snapped: x) { opacity: .55; }
  }
}
```

Como o `IntersectionObserver` já resolve em todos os navegadores, isso é redundância. Fica aqui como
registro do caminho que a plataforma está tomando.

---

## 6. Alvo de toque — os números

### WCAG 2.2 — SC 2.5.8 Target Size (Minimum), **Nível AA**
<https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>

> "The size of the target for pointer inputs is at least **24 by 24 CSS pixels**, except when:"

As cinco exceções, na letra:

1. **Spacing** — "Undersized targets (those less than 24 by 24 CSS pixels) are positioned so that if
   a **24 CSS pixel diameter circle** is centered on the bounding box of each, the circles do not
   intersect another target or the circle for another undersized target".
2. **Equivalent** — "The function can be achieved through a different control on the same page that
   meets this criterion".
3. **Inline** — "The target is in a sentence or its size is otherwise constrained by the line-height
   of non-target text".
4. **User agent control** — "The size of the target is determined by the user agent and is not
   modified by the author".
5. **Essential** — "A particular presentation of the target is essential or is legally required for
   the information being conveyed".

**SC 2.5.5 Target Size (Enhanced)** é **AAA** e pede **44×44 CSS px**.

### Plataformas

- **Apple HIG:** mínimo **44×44 pt** para todos os controles tocáveis. A Apple distingue área
  *visual* de área *de toque* — o desenho pode ser menor desde que a região sensível chegue a 44.
  <https://developer.apple.com/design/human-interface-guidelines/layout>
- **Material Design 3:** mínimo **48×48 dp**, com expansão do alvo além da borda visível.

### Decisão para o site

**48×48 CSS px** para as setas — passa AA (24), passa AAA (44), passa Apple (44) e bate com o
Material (48). O `.leque-seta` de hoje já é `width: 3rem; height: 3rem` = 48px
(`app/globals.css:204`). **Está correto, não mexa.**

Ponto de atenção nos **marcadores de posição**. Hoje eles são `h-3 w-[3px]` (3×12px) dentro de um
`aria-hidden` — como **não são interativos**, o SC 2.5.8 não se aplica. Duas saídas legítimas:

- **Mantenha decorativos** (recomendado): `aria-hidden`, sem clique. Zero risco.
- **Se virarem clicáveis**, cada um precisa de 24×24 de alvo. Expanda com pseudo-elemento, sem
  engordar o desenho:

```css
.marcador { position: relative; width: 3px; height: 12px; }
.marcador::before {
  content: '';
  position: absolute;
  inset: -50% -12px;      /* alvo ≥ 24×27, visual continua 3×12 */
}
```

E lembre da exceção "Spacing": marcadores de 3px lado a lado precisam de **24px de centro a centro**
para os círculos imaginários não se cruzarem. Com 6 marcadores isso são 144px só de marcadores —
mais um motivo para deixá-los decorativos.

---

## 7. Acessibilidade de carrossel

### 7.1 `role="carousel"` **não existe**

Não está na lista de roles do WAI-ARIA. O ARIA APG monta carrossel assim
(<https://www.w3.org/WAI/ARIA/apg/patterns/carousel/>):

- container: `role="region"` **ou** `role="group"`;
- `aria-roledescription="carousel"`;
- nome acessível via `aria-label`/`aria-labelledby`, e **o rótulo não deve conter a palavra
  "carrossel"** (o `roledescription` já diz);
- slides: `role="group"` + `aria-roledescription="slide"`, com nome tipo `"3 de 10"`;
- botões prev/next: `<button>` nativo, e **"rotation/next/previous buttons do not move focus"**;
- `aria-live="off"` se gira sozinho, `"polite"` se não gira.

### 7.2 Mas: `aria-roledescription` é caro — e aqui não é um carrossel

Adrian Roselli, *Avoid aria-roledescription*
(<https://adrianroselli.com/2020/04/avoid-aria-roledescription.html>):

> "Once you override its role with `aria-roledescription`, they will hear it in whatever language
> you provided. **There is no auto-translation.**"

> "Until you get it in front of your users, it is nothing but a potential for technical debt and poor
> user experience."

Suporte fragmentado documentado por ele: JAWS e NVDA inconsistentes, VoiceOver diferente entre macOS
e iPadOS, TalkBack ignora em boa parte dos casos.

**Recomendação fechada para a Rapa Sound:** o leque da equipe **não é um carrossel** — é uma **lista
rolável de 6 pessoas**, sem rotação automática, sem slides, sem conteúdo escondido atrás de um
temporizador. A marcação honesta é melhor que a marcação de carrossel:

```tsx
<div
  ref={trilho}
  className="equipe-trilho"
  tabIndex={0}                       /* WCAG 2.1.1 — ver 7.3 */
  role="group"
  aria-label="Fotos da equipe da Rapa Sound"
>
  <ul className="equipe-fita">       {/* continua sendo uma lista de verdade */}
    <li className="equipe-item">…</li>
  </ul>
</div>
```

Por que `role="group"` e não `role="region"`: `region` cria um **landmark**, e a seção "Equipe" já é
um landmark. `group` nomeia sem poluir o mapa de landmarks. Roselli aceita os dois
("`role="region"` since it's a generic landmark, though `role="group"` may work"). E por que o `role`
fica no `<div>` e não no `<ul>`: se você puser `role` no `<ul>` você **destrói a semântica de
lista** e o leitor perde o "lista com 6 itens".

Ganho colateral: se você não usa `aria-roledescription`, você não precisa traduzir nada, não depende
de suporte de AT, e não corre risco de o leitor anunciar "grupo, carrossel, grupo".

### 7.3 `tabindex="0"` no container rolável — a fonte

É requisito, não preferência. As três fontes:

1. **Adrian Roselli**, *Keyboard-Only Scrolling Areas*
   (<https://adrianroselli.com/2022/06/keyboard-only-scrolling-areas.html>): a área rolável precisa
   de `tabindex`, de **nome acessível** e de um **role não-apresentacional**. Ele registrou o bug
   WebKit **277290** em julho de 2024 pedindo o comportamento nativo no Safari — **sem resposta**.
2. **Chrome for Developers**, *Keyboard focusable scrollers*
   (<https://developer.chrome.com/blog/keyboard-focusable-scrollers>): a partir do **Chrome 132** o
   scroller vira tab stop sozinho — mas com uma condição decisiva: *"This behavior only happens if
   the scroller has no focusable children."* E se você quiser o scroller focável **junto com** filhos
   focáveis, *"set a tabindex value of 0 or higher."* A justificativa citada é WCAG 2.1.1 Nível A.
3. A regra automatizada do axe-core **`scrollable-region-focusable`** falha exatamente esse caso.

Resumo prático: **Firefox faz desde 2011, Chrome faz desde a 132 e só sem filhos focáveis, Safari
não faz. Ponha `tabIndex={0}` sempre.** E dê anel de foco visível — sem isso o `tabindex` cria um
tab stop invisível, que é pior que nada:

```css
.equipe-trilho:focus-visible {
  outline: 2px solid var(--color-ambar);
  outline-offset: 4px;
}
```

### 7.4 Anunciar a mudança de item

Não ponha `aria-live` no scroller. Durante um fling ele emitiria seis anúncios em cima uns dos
outros. Use uma região de status separada, atualizada **só quando a rolagem assenta**:

```tsx
const [anuncio, setAnuncio] = useState('')   // começa vazio: role=status com conteúdo
                                             // inicial pode ser lido na montagem
// …
useEffect(() => aoAssentar(el, () => {
  const p = cards[ativoRef.current]
  setAnuncio(`${ativoRef.current + 1} de ${cards.length}: ${p.nome}, ${p.papel}`)
}), [cards])
```

```tsx
<p role="status" aria-live="polite" className="sr-only">{anuncio}</p>
```

E as setas:

```tsx
<button type="button" onClick={() => ir(-1)} disabled={noInicio} aria-label="Pessoa anterior" />
<button type="button" onClick={() => ir(+1)} disabled={noFim}    aria-label="Próxima pessoa" />
```

- `disabled` (e não `aria-disabled`) tira o botão da ordem de tabulação — é o mesmo comportamento do
  `::scroll-button()` nativo do Chrome, que desabilita nas pontas. Se você preferir manter o foco
  no lugar quando a pessoa chega ao fim, troque por `aria-disabled="true"` e um `return` cedo no
  handler; as duas escolhas são defensáveis. Com **duas** setas lado a lado, `disabled` é mais
  simples e o foco cai na seta vizinha, que continua útil.
- **Não mova o foco** ao clicar (regra do APG). O `scrollIntoView` não move foco — não adicione
  `.focus()` no card.
- Teclado extra (opcional, mas bom): setas ← → movendo item a item. Sem isso, o scroller com
  `tabindex` **já rola com as setas nativamente** e o snap encaixa; o handler só torna o passo exato.

```tsx
const aoTeclar = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); ir(+1) }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); ir(-1) }
}
```

`preventDefault()` **apenas** nessas duas teclas. Não intercepte Tab, Home, End, PageUp/PageDown.

---

## 8. iOS Safari — específico

### 8.1 `-webkit-overflow-scrolling: touch` — apague

Desde o **iOS 13** o WebKit aplica *one-finger accelerated scrolling* a todos os frames e a todos os
elementos `overflow: scroll`; a propriedade virou não-padrão e sem efeito. Jake Archibald, na época:
*"As of iOS 13, we no longer need `-webkit-overflow-scrolling: touch` (and the set of
bugs/behaviour changes that introduced)…"*
<https://x.com/jaffathecake/status/1136246215430086657>

**A pegadinha:** ela ainda *parseia* (então `CSS.supports()` devolve `true`), o que engana detecção
de feature. E, historicamente, ela criava uma camada de composição separada que quebrava
`position: fixed` em filhos e atrapalhava scroll-snap. **Não copie de tutorial antigo.**

### 8.2 O bug do `overflow: hidden` no `<body>` com modal

`overflow: hidden` no `body` **não segura** o toque no iOS Safari — o sistema de eventos de toque
passa por cima e a página de trás rola. Relevante aqui porque o site tem `MenuLiquido` e `Blackout`.
Padrões que funcionam:

```ts
// travar
const y = window.scrollY
document.body.style.position = 'fixed'
document.body.style.top = `-${y}px`
document.body.style.width = '100%'
document.body.dataset.travaY = String(y)

// destravar
const y2 = Number(document.body.dataset.travaY || 0)
document.body.style.position = ''
document.body.style.top = ''
document.body.style.width = ''
window.scrollTo(0, y2)   // sem isso a página volta para o topo
```

Referências do padrão: <https://www.jayfreestone.com/writing/locking-body-scroll-ios/> ·
<https://benfrain.com/preventing-body-scroll-for-modals-in-ios/> ·
<https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/>

Alternativa moderna: `<dialog>` com `showModal()` — o navegador aplica `inert` no resto do documento
e trata o scroll do backdrop nativamente. É a rota preferível se o menu já for reescrito.

### 8.3 Momentum scroll e `scrollend`

- Com `scroll-snap-type` ativo, o iOS **desliga o momentum de fling** dentro do scroller: um flick =
  um item. Aqui isso é vantagem.
- `scrollend` só existe a partir do **Safari iOS 26.2**. Antes disso, um `setTimeout` de debounce é a
  única saída. **Cuidado:** durante o momentum o iOS pode emitir `scroll` em rajadas com pausas
  perceptíveis. Debounce curto demais (< 100ms) dispara no meio do gesto. **140ms** é um bom ponto.
- Bug conhecido desde o Safari 15.4: `scroll-behavior: smooth` no CSS interfere em
  `element.scrollTop`/`element.scrollTo` via JS
  (<https://developer.apple.com/forums/thread/703294>). **Por isso o código abaixo não põe
  `scroll-behavior: smooth` no CSS** — ele passa `behavior: 'smooth'` na chamada de
  `scrollIntoView`, que é a via confiável e que respeita `prefers-reduced-motion` por escolha nossa.

### 8.4 `overscroll-behavior-x: contain` — o que ele faz e o que ele **não** faz no iOS

MDN, `overscroll-behavior` (<https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior>):

> "**The `contain` value disables native browser navigation, including the vertical pull-to-refresh
> gesture and horizontal swipe navigation.**"

Suporte: Safari **16+**, iOS **16+** (94,13% global) — o WebKit implementou no Safari 16
(<https://webkit.org/blog/13152/webkit-features-in-safari-16-0/>).

**A pegadinha, e é grande:** o Safari **não** aplica isso à navegação de histórico. Bug WebKit
**240183 — "CSS overscroll-behavior-x: contain does not disable history navigation"**, aberto em
**06/05/2022**, status **NEW**, último comentário **03/11/2025**, **não corrigido**.
<https://bugs.webkit.org/show_bug.cgi?id=240183>

Consequência prática no iPhone: com o carrossel em `scrollLeft === 0`, um swipe para a direita pode
disparar o "voltar" do Safari e **tirar a pessoa do site**. Mitigações reais:

1. **Não deixe o scroller encostar em `x = 0` da tela.** O gesto de voltar do iOS nasce na borda da
   tela; com `padding-inline-start` no scroller e a seção com margem lateral, a área de "borda" fica
   fora do trilho. Nossa `--respiro: 1.25rem` já ajuda; num container com margem lateral da seção,
   melhor ainda.
2. **Ponha `overscroll-behavior-x: contain` mesmo assim** — resolve o Chrome Android (que respeita) e
   corta o *scroll chaining* para a página em todos.
3. Não tente `preventDefault` em `touchstart` para bloquear: isso mata a rolagem legítima e o
   listener teria que ser não-passivo, o que degrada a rolagem do resto da página.

### 8.5 Miudezas de iOS que valem a linha

```css
.equipe-trilho {
  -webkit-tap-highlight-color: transparent;  /* tira o retângulo cinza do toque */
  overscroll-behavior-x: contain;
  overflow-y: hidden;                        /* trava qualquer deriva vertical no trilho */
}
.equipe-item img { -webkit-user-drag: none; } /* e draggable={false} no JSX */
```

- **`100vh` vs `100dvh`:** a barra do Safari colapsando faz `100vh` ser maior que o visível. Não
  afeta o carrossel (altura fixa em `rem`), mas afeta o hero.
- **Larguras em `%` nos filhos do snap:** há relatos de falha silenciosa em iOS antigo. O código
  abaixo usa `min(68vw, 15rem)`, que é `vw`/`rem`, não `%`.

---

## COMO REFAZER O LEQUE DA EQUIPE

### A recomendação, fechada

**Um componente, um DOM, dois comportamentos separados por media query.**

- **Até 1023px** (o caso que importa): trilho rolável com scroll-snap, começando **no item 1**,
  com **espiada** no item 2, setas de 48px abaixo e destaque no item encaixado.
- **A partir de 1024px:** o leque GSAP de hoje, com os 6 cards abertos. Como são 6 (< `MAX_VISIVEL`),
  o leque já mostra todo mundo e **não precisa de setas** — e a lógica `max <= 0` da seção 2.2
  desabilita/esconde a barra de controle sozinha.
- **A troca de faixa é feita por `gsap.matchMedia()`**, que reverte os estilos inline do GSAP quando
  a media query deixa de casar. Sem isso, girar o iPhone de paisagem para retrato deixa `transform`
  e `position` presos e o trilho quebra. É a razão técnica de trocar o `useEffect` manual de hoje.

**Por que 1024px:** é o `lg` do projeto e o ponto em que `.leque-card` chega a 16rem. Entre 768 e
1023 o leque hoje usa multiplicador 0.5 e fica apertado; melhor entregar o trilho ali.

**Aritmética a 380px** (a largura crítica), com `--respiro: 1.25rem` e `--gap: .75rem`:
card = `min(68vw, 15rem)` = `min(258, 240)` = **240px**; sobra
`380 − 20 − 240 − 12 = 108px` do próximo card à mostra. A NN/g é explícita sobre isso ser o sinal
mais forte de que há mais conteúdo: *"Half images or text that look like they are continued beyond
the vertical edge of the screen, is a strong carousel cue"*
(<https://www.nngroup.com/articles/mobile-carousels/>) — e que **"most people stop after viewing 3–4
different pages in the carousel"**, o que com 6 pessoas está no limite: as setas e os marcadores
existem justamente para encurtar o caminho até a sexta.

---

### O componente

`components/EquipeEmLeque.tsx` (substitui `LequeEquipe.tsx`):

```tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export type CardEquipe = { src: string; alt: string; nome: string; papel: string }

/* as sete posições do leque, preservadas do componente atual */
const LEQUE = [
  { rot: -21, escala: 0.7756, x: -30, y: 7.3, z: 1 },
  { rot: -14, escala: 0.8498, x: -22, y: 4.0, z: 2 },
  { rot: -7,  escala: 0.9346, x: -11, y: 1.3, z: 3 },
  { rot: 0,   escala: 1.0,    x: 0,   y: 0.0, z: 10 },
  { rot: 7,   escala: 0.9346, x: 11,  y: 1.3, z: 3 },
  { rot: 14,  escala: 0.8498, x: 22,  y: 4.0, z: 2 },
  { rot: 21,  escala: 0.7756, x: 30,  y: 7.3, z: 1 },
]

/** interpola a geometria do leque para um total < 7 (aqui, 6) */
function config(total: number, slot: number) {
  if (total >= 7) return LEQUE[slot]
  const centro = (total - 1) / 2
  const d = centro > 0 ? (slot - centro) / centro : 0
  const ad = Math.abs(d)
  return {
    rot: d * 21,
    escala: 1 - 0.2244 * ad * ad,
    x: d * 30,
    y: ad * ad * 7.3,
    z: 10 - Math.round(Math.abs(slot - centro)),
  }
}

/**
 * Dispara `cb` quando a rolagem assenta.
 * Usa `scrollend` onde existe (Chrome 114+, Firefox 109+, Safari iOS 26.2+),
 * senão faz debounce de 140ms — que cobre a pausa do momentum do iOS.
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event
 */
function aoAssentar(el: HTMLElement, cb: () => void): () => void {
  if ('onscrollend' in window) {
    el.addEventListener('scrollend', cb)
    return () => el.removeEventListener('scrollend', cb)
  }
  let t: ReturnType<typeof setTimeout>
  const h = () => { clearTimeout(t); t = setTimeout(cb, 140) }
  el.addEventListener('scroll', h, { passive: true })
  return () => { clearTimeout(t); el.removeEventListener('scroll', h) }
}

export function EquipeEmLeque({ cards }: { cards: CardEquipe[] }) {
  const trilho = useRef<HTMLDivElement>(null)
  const fita = useRef<HTMLUListElement>(null)

  const [noInicio, setNoInicio] = useState(true)
  const [noFim, setNoFim] = useState(true)      // true até medir: setas nascem desligadas
  const [ativo, setAtivo] = useState(0)
  const [anuncio, setAnuncio] = useState('')    // vazio na montagem, senão role=status lê sozinho
  const ativoRef = useRef(0)

  const itens = useCallback(
    () => Array.from(fita.current?.querySelectorAll<HTMLLIElement>(':scope > li') ?? []),
    [],
  )

  /* ---------- estado das setas ---------------------------------
     Tolerância de 1px porque scrollWidth/clientWidth voltam inteiros
     e scrollLeft é fracionário (subpixel). Sem isso, num iPhone com
     devicePixelRatio 3 a seta "próximo" nunca desabilita.
     ------------------------------------------------------------ */
  const medir = useCallback(() => {
    const el = trilho.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setNoInicio(el.scrollLeft <= 1)
    setNoFim(max <= 0 || el.scrollLeft >= max - 1)
  }, [])

  useEffect(() => {
    const el = trilho.current
    if (!el) return
    let raf = 0
    const aoRolar = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { raf = 0; medir() })
    }
    medir()
    el.addEventListener('scroll', aoRolar, { passive: true })
    const ro = new ResizeObserver(medir)   // rotação de tela, barra do Safari colapsando
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', aoRolar)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [medir])

  /* ---------- item ativo, sem ler layout ----------------------- */
  useEffect(() => {
    const el = trilho.current
    const lis = itens()
    if (!el || !lis.length) return
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          e.target.classList.toggle('is-ativo', e.isIntersecting)
          if (e.isIntersecting) {
            const i = lis.indexOf(e.target as HTMLLIElement)
            ativoRef.current = i
            setAtivo(i)
          }
        }
      },
      { root: el, threshold: 0.65 },   // 0.65: só o item majoritariamente visível
    )
    lis.forEach((li) => io.observe(li))
    return () => io.disconnect()
  }, [itens, cards.length])

  /* ---------- anúncio só quando a rolagem para ------------------ */
  useEffect(() => {
    const el = trilho.current
    if (!el) return
    return aoAssentar(el, () => {
      const p = cards[ativoRef.current]
      if (!p) return
      setAnuncio(`${ativoRef.current + 1} de ${cards.length}: ${p.nome}, ${p.papel}`)
    })
  }, [cards])

  /* ---------- navegação ---------------------------------------- */
  const ir = useCallback((dir: -1 | 1) => {
    const lis = itens()
    const alvo = lis[Math.min(lis.length - 1, Math.max(0, ativoRef.current + dir))]
    if (!alvo) return
    const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches
    alvo.scrollIntoView({
      behavior: reduzido ? 'auto' : 'smooth',
      inline: 'start',
      block: 'nearest',   // ← sem isto a PÁGINA rola na vertical junto
    })
  }, [itens])

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); ir(-1) }
  }

  /* ---------- o leque, só no desktop --------------------------
     gsap.matchMedia() liga/desliga o contexto sozinho e, no revert,
     devolve os estilos inline. É o que impede que uma rotação de
     tela deixe transform/position presos e quebre o trilho.
     https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
     ------------------------------------------------------------ */
  useEffect(() => {
    const el = fita.current
    if (!el) return
    const mm = gsap.matchMedia()

    mm.add(
      { desktop: '(min-width: 1024px)', reduzido: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        const { desktop, reduzido } = ctx.conditions as Record<string, boolean>
        if (!desktop) return

        const lis = gsap.utils.toArray<HTMLElement>(':scope > li', el)
        const total = lis.length

        lis.forEach((li, i) => {
          const { x, y, rot, escala, z } = config(total, i)
          const alvo = { x: `${x}rem`, y: `${y}rem`, rotation: rot, scale: escala, opacity: 1, zIndex: z }
          if (reduzido) { gsap.set(li, alvo); return }
          gsap.set(li, { x: 0, y: '12rem', rotation: 0, scale: 0.5, opacity: 0 })
          gsap.to(li, {
            ...alvo,
            duration: 1.2,
            ease: 'elastic.out(1.05,.78)',
            delay: 0.2 + i * 0.06,
            scrollTrigger: undefined,
          })
        })
      },
    )

    return () => mm.revert()
  }, [cards.length])

  if (!cards.length) return null

  const seta = (d: 'esq' | 'dir') => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <polyline points={d === 'esq' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  )

  return (
    <div className="equipe">
      {/* o SCROLLER: overflow, snap, foco de teclado, nome acessível.
          role="group" (e não region) para não criar mais um landmark;
          o role fica aqui e NÃO no <ul>, para a lista continuar lista. */}
      <div
        ref={trilho}
        className="equipe-trilho"
        tabIndex={0}
        role="group"
        aria-label="Fotos da equipe da Rapa Sound"
        onKeyDown={aoTeclar}
      >
        <ul ref={fita} className="equipe-fita">
          {cards.map((c, i) => (
            <li key={c.src} className="equipe-item">
              <figure className="equipe-card">
                <img
                  src={c.src}
                  alt={c.alt}
                  width={440}
                  height={635}
                  draggable={false}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <figcaption className="sobre-escuro absolute inset-x-0 bottom-0
                                       bg-gradient-to-t from-void via-void/85 to-transparent
                                       px-4 pb-4 pt-10">
                  <span className="block text-sm font-bold leading-tight text-branco">{c.nome}</span>
                  <span className="lab mt-1 block">{c.papel}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      {/* controles: some quando não há o que rolar (desktop) */}
      {!(noInicio && noFim) && (
        <div className="equipe-controles">
          <button type="button" onClick={() => ir(-1)} disabled={noInicio}
                  aria-label="Pessoa anterior" className="leque-seta">
            {seta('esq')}
          </button>

          {/* decorativos: sem clique, logo o SC 2.5.8 não se aplica */}
          <div className="flex items-center gap-1.5" aria-hidden>
            {cards.map((c, i) => (
              <span key={c.src}
                    className={`block h-3 w-[3px] rounded-[1px] transition-colors duration-300
                                ${i === ativo ? 'bg-ambar' : 'bg-rule'}`} />
            ))}
          </div>

          <button type="button" onClick={() => ir(1)} disabled={noFim}
                  aria-label="Próxima pessoa" className="leque-seta">
            {seta('dir')}
          </button>
        </div>
      )}

      <p role="status" aria-live="polite" className="sr-only">{anuncio}</p>
    </div>
  )
}
```

### O CSS

Em `app/globals.css`, substituindo o bloco `.leque` atual:

```css
/* ---------- A EQUIPE: trilho no celular, leque no desktop ---------- */
.equipe {
  --respiro: 1.25rem;   /* folga na borda esquerda E alvo do snap */
  --gap: 0.75rem;
  --card: min(68vw, 15rem);   /* 380px → 240px, sobram 108px do próximo à mostra */
}

/* ===== O SCROLLER ===== */
.equipe-trilho {
  overflow-x: auto;
  overflow-y: hidden;                 /* nada de deriva vertical dentro do trilho */
  overscroll-behavior-x: contain;     /* corta o scroll chaining; NÃO segura o
                                         "voltar" do iOS — WebKit bug 240183 */
  scroll-snap-type: x mandatory;

  /* O PAR. Só o padding => o snap come o respiro (primeiro item colado).
     Só o scroll-padding => o card encosta na borda.
     Os dois com o mesmo valor => encaixe exato em scrollLeft 0.        */
  padding-inline-start: var(--respiro);
  scroll-padding-inline-start: var(--respiro);
  padding-block: 0.5rem;              /* espaço para a sombra dos cards */

  scrollbar-width: none;
  -webkit-tap-highlight-color: transparent;
}
.equipe-trilho::-webkit-scrollbar { width: 0; height: 0; }

/* tabindex sem anel de foco = tab stop invisível. Pior que nada. */
.equipe-trilho:focus-visible {
  outline: 2px solid var(--color-ambar);
  outline-offset: 4px;
  border-radius: var(--radius-card);
}

/* ===== A FITA (container flex) ===== */
.equipe-fita {
  display: flex;
  gap: var(--gap);
  margin: 0; padding: 0;
  list-style: none;
}

/* O espaçador do fim. padding-inline-end no scroller é ignorado no
   overflow do flex em vários motores — csswg-drafts#4577.
   O gap já entrega var(--gap); aqui só a diferença.                */
.equipe-fita::after {
  content: '';
  flex: 0 0 auto;
  inline-size: calc(var(--respiro) - var(--gap));
}

/* ===== OS ITENS ===== */
.equipe-item {
  flex: 0 0 auto;
  inline-size: var(--card);
  scroll-snap-align: start;
  scroll-snap-stop: always;   /* Safari 15+, iOS 15+, 94,18% */

  /* o "hover" do desktop traduzido para o toque: o item encaixado
     é o item ativo. A classe vem do IntersectionObserver.        */
  opacity: 0.55;
  transition: opacity 300ms var(--ease-out-cut);
}
.equipe-item.is-ativo { opacity: 1; }

.equipe-card {
  position: relative;
  aspect-ratio: 628 / 793;
  border-radius: var(--radius-card);
  overflow: hidden;
  margin: 0;
  border: 1px solid transparent;
  background:
    var(--color-off) padding-box,
    linear-gradient(175deg,
      color-mix(in srgb, var(--color-branco) 34%, var(--color-rule)) 0%,
      var(--color-rule) 26%,
      var(--color-rule) 62%,
      color-mix(in srgb, var(--color-void) 62%, var(--color-rule)) 100%) border-box;
  box-shadow:
    inset 0 1px 0 0 color-mix(in srgb, var(--color-branco) 8%, transparent),
    0 24px 50px -30px var(--color-void);
}
.equipe-card img { -webkit-user-drag: none; user-select: none; }

/* ===== CONTROLES: 48×48 (AA=24, AAA=44, Apple=44, Material=48) ===== */
.equipe-controles {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}
.equipe-controles .leque-seta:disabled {
  opacity: 0.35;
  cursor: default;
}
/* o hover das setas só onde existe ponteiro fino: no iOS o :hover gruda */
@media (hover: hover) and (pointer: fine) {
  .equipe-controles .leque-seta:hover:not(:disabled) {
    color: var(--color-ambar);
    border-color: var(--color-ambar);
  }
}

@media (prefers-reduced-motion: reduce) {
  .equipe-item { opacity: 1; transition: none; }
}

/* ===== DESKTOP: o leque ===== */
@media (min-width: 1024px) {
  .equipe-trilho {
    overflow: visible;
    scroll-snap-type: none;
    padding: 0;
    scroll-padding-inline-start: 0;
  }
  .equipe-fita {
    position: relative;
    height: 38rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
  }
  .equipe-fita::after { content: none; }

  .equipe-item {
    position: absolute;     /* posição estática = centro do flex, como no leque atual */
    inline-size: 16rem;
    opacity: 1;             /* o GSAP assume a partir daqui */
    transition: none;
    will-change: transform;
  }
}
```

### Checklist de verificação antes de considerar pronto

- [ ] **380px, iOS Safari:** abre no rosto do Leandro (item 1), com folga de ~20px à esquerda e o
      item 2 espiando. `scrollLeft === 0`, seta esquerda `disabled`.
- [ ] **Chegar ao fim:** o Marcelo (item 6) aparece inteiro, com ~20px de folga à direita, e a seta
      direita fica `disabled`. Se ele ficar cortado, o `::after` não virou item flex — confira se
      ele está no `.equipe-fita` e não no `.equipe-trilho`.
- [ ] **Se ao chegar no item 6 o container pular de volta ao 5:** o snap `start` do último item está
      fora do alcance. Troque para `scroll-snap-type: x proximity` ou dê
      `.equipe-item:last-child { scroll-snap-align: end; }`.
- [ ] **Clicar na seta não move a página na vertical** (é o `block: 'nearest'`).
- [ ] **Tab chega no trilho** e as setas ← → rolam item a item, com anel de foco âmbar visível.
- [ ] **VoiceOver:** ao parar num item, anuncia "3 de 6: Daniel Souvile, Conteúdo audiovisual e VJ".
- [ ] **Girar o iPhone** para paisagem e voltar: nada de card preso ou trilho quebrado (é o
      `mm.revert()`).
- [ ] **1024px:** o leque de 6 abre como hoje e a barra de controles some sozinha.
- [ ] **`prefers-reduced-motion: reduce`:** setas saltam sem `smooth`, leque monta estático, itens
      todos com opacidade 1.
- [ ] **Swipe para a direita no item 1, iPhone:** se o Safari voltar de página, afaste o trilho da
      borda da tela (margem lateral na seção). É o bug WebKit 240183, não tem conserto em CSS.

---

## FONTES

**Especificação e referência**
- MDN — Basic concepts of scroll snap: <https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap/Basic_concepts>
- MDN — `scroll-snap-type`: <https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type>
- MDN — `scroll-snap-stop`: <https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-stop>
- MDN — `scroll-padding`: <https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding>
- MDN — `overscroll-behavior`: <https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior>
- MDN — `overscroll-behavior-x`: <https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-x>
- MDN — `Element: scrollend` event: <https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event>
- MDN — `Element.scrollWidth`: <https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth>
- CSS Overflow 5 (draft): <https://drafts.csswg.org/css-overflow-5/>
- CSSWG issue #4577 (margem/padding final no flex rolável): <https://lists.w3.org/Archives/Public/public-css-archive/2019Dec/0144.html>

**Suporte de navegador (conferido em 04/08/2026)**
- <https://caniuse.com/css-snappoints> · <https://caniuse.com/mdn-css_properties_scroll-snap-stop>
- <https://caniuse.com/css-overscroll-behavior> · <https://caniuse.com/mdn-api_element_scrollend_event>
- <https://caniuse.com/mdn-api_element_scrollintoview_options_parameter>
- <https://caniuse.com/mdn-css_selectors_scroll-marker> · <https://caniuse.com/mdn-css_selectors_scroll-button>

**Chrome / WebKit**
- Carousels with CSS: <https://developer.chrome.com/blog/carousels-with-css>
- CSS `scroll-state()` queries: <https://developer.chrome.com/blog/css-scroll-state-queries>
- Keyboard focusable scrollers: <https://developer.chrome.com/blog/keyboard-focusable-scrollers>
- Take control of your scroll (`overscroll-behavior`): <https://developer.chrome.com/blog/overscroll-behavior>
- WebKit Features in Safari 16.0: <https://webkit.org/blog/13152/webkit-features-in-safari-16-0/>
- **WebKit bug 240183** (`overscroll-behavior-x: contain` não bloqueia o voltar): <https://bugs.webkit.org/show_bug.cgi?id=240183>
- Safari: `scroll-behavior: smooth` x `scrollTo` (fórum Apple): <https://developer.apple.com/forums/thread/703294>
- Blink: precisão subpixel em `scrollLeft`/`clientWidth`: <https://groups.google.com/a/chromium.org/g/blink-dev/c/_Q7A4AQBFKY/m/S4ahQ5iE28QJ>

**Acessibilidade**
- WCAG 2.2 — Understanding SC 2.5.8 Target Size (Minimum): <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>
- ARIA APG — Carousel pattern: <https://www.w3.org/WAI/ARIA/apg/patterns/carousel/>
- Adrian Roselli — Keyboard-Only Scrolling Areas: <https://adrianroselli.com/2022/06/keyboard-only-scrolling-areas.html>
- Adrian Roselli — Keyboard and Overflow: <https://adrianroselli.com/2016/02/keyboard-and-overflow.html>
- Adrian Roselli — Avoid aria-roledescription: <https://adrianroselli.com/2020/04/avoid-aria-roledescription.html>
- axe-core — `scrollable-region-focusable`: <https://accessibilityinsights.io/info-examples/web/scrollable-region-focusable/>
- Apple HIG — Layout (44×44 pt): <https://developer.apple.com/design/human-interface-guidelines/layout>

**Motion (framer-motion)**
- Gestures (hover, tap, pan, drag): <https://motion.dev/docs/react-gestures>
- Hover — filtragem de eventos de toque: <https://motion.dev/docs/react-hover-animation>
- Drag — constraints, elastic, momentum, direction lock: <https://motion.dev/docs/react-drag>
- Issue #429 — `touch-action` e rolagem em drag de eixo único: <https://github.com/framer/motion/issues/429>

**Técnica e UX**
- Ahmad Shadeed — CSS Scroll Snap: <https://ishadeed.com/article/css-scroll-snap/>
- web.dev — Well-controlled scrolling with CSS Scroll Snap: <https://web.dev/articles/css-scroll-snap>
- Ryan Mulligan — Horizontal Scrolling in a Centered Max-Width Container (o `::after` espaçador): <https://ryanmulligan.dev/blog/x-scrolling-centered-max-width-container/>
- Adam Argyle — GUI Challenges, carousel (código): <https://github.com/argyleink/gui-challenges/blob/main/carousel/carousel.js>
- CSS-Tricks — CSS Carousels: <https://css-tricks.com/css-carousels/>
- NN/g — Carousels on Mobile Devices: <https://www.nngroup.com/articles/mobile-carousels/>
- Jay Freestone — Locking body scroll for modals on iOS: <https://www.jayfreestone.com/writing/locking-body-scroll-ios/>
- Ben Frain — Preventing body scroll for modals in iOS: <https://benfrain.com/preventing-body-scroll-for-modals-in-ios/>
- Jake Archibald — `-webkit-overflow-scrolling` desnecessário desde iOS 13: <https://x.com/jaffathecake/status/1136246215430086657>
