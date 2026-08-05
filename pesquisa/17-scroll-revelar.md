# 17 — Animação disparada por rolagem: revelar elementos e orquestrar a página

> Pesquisa fechada em **05/08/2026**. Todo dado de suporte de navegador tem fonte e data de consulta.
> Este documento é pesquisa. Não altera nada no projeto.

---

## Resumo executivo — a estratégia que este projeto deve adotar

1. **Padrão da casa = CSS scroll-driven (`animation-timeline: view()`), dentro de `@supports` + `@media (prefers-reduced-motion: no-preference)`.** Roda fora da main thread, custo ~zero, **não precisa de uma linha de JS** e por isso é imune ao bug do "nasce invisível". Cobre ~84% do tráfego hoje (Chrome/Edge 115+, Safari e iOS Safari 26+, Samsung Internet 23+).
2. **Quem não suporta (Firefox estável, navegadores velhos) vê a página pronta e estática.** Isso é o comportamento correto, não um defeito. Não vale carregar polyfill.
3. **Nada no HTML exportado pode nascer com `opacity: 0`.** A causa do bug anterior tem nome: `<motion.div initial={{opacity:0}}>` **serializa `style="opacity:0"` no HTML estático** — o Motion renderiza o `initial` no SSR de propósito. Com `output: 'export'` isso fica gravado no `.html`.
4. Se um efeito precisar rodar no Firefox também, use a camada 2: **JS arma a invisibilidade *depois* de montar e *só* no que está abaixo da dobra**, com IntersectionObserver. `no-js` **não** resolve o problema de 4G (só o de JS desligado) — está detalhado na seção 2.
5. **GSAP ScrollTrigger fica reservado para os 2–3 momentos fortes da página** (scrub com timeline de vários alvos). Ele é 70 kB de JS para um efeito que a maior parte do site não precisa.
6. **`pin` do ScrollTrigger está proibido no celular deste projeto.** Use `position: sticky` no CSS para grudar e ScrollTrigger só com `scrub` para animar o miolo — é o mesmo resultado, sem `pin-spacer`, sem salto de barra de endereço.
7. **Zero efeito de rolagem em cima dos players de YouTube.** Nem transform, nem sticky, nem pin. Facade com thumbnail e injeção do iframe no clique.
8. framer-motion entra só onde já há estado React (contadores, carrossel), com `whileInView` + `viewport={{once:true}}` — **nunca** com `initial` que zere opacidade em conteúdo indexável.
9. `prefers-reduced-motion: reduce` desliga movimento (translate, scale, parallax, scrub); **fade de opacidade puro pode ficar** — o W3C diz explicitamente que opacidade não é "motion animation".
10. Orçamento de efeito: **um reveal discreto repetido em toda a página + 3 momentos fortes**. Repetição vira linguagem visual; variedade vira ruído e lê como site gerado por IA.
11. `SplitText` do GSAP é grátis desde 30/04/2025 (todos os plugins) — use para o título do hero e nada mais.
12. Medir em celular real com throttling 4G, não no MacBook.

---

## 0. Tabela de suporte de navegador — consultada em 05/08/2026

| Recurso | Chrome/Edge | Safari | iOS Safari | Firefox | Samsung Internet | Uso global | Fonte |
|---|---|---|---|---|---|---|---|
| `animation-timeline` / `view()` / `scroll()` | **115+** (jul/2023) | **26.0+** (set/2025) | **26.0+** | ❌ **não em estável** — atrás do pref `layout.css.scroll-driven-animations.enabled`; caniuse aponta **156** (previsto 15/09/2026) como 1ª versão | **23+** | **83,66%** | [caniuse](https://caniuse.com/mdn-css_properties_animation-timeline), [WebKit blog 20/06/2025](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/), [MDN Experimental features](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features) |
| `IntersectionObserver` | ✅ | ✅ | ✅ | ✅ | ✅ | Baseline **widely available desde mar/2019** | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) |
| `@starting-style` | 117+ | 18+ | 18+ | 128+ | ✅ | Baseline **2024** (ago/2024) | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) |
| `content-visibility` | ✅ | ✅ | ✅ | ✅ | ✅ | Baseline **2024** (set/2024) | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility) |
| `sibling-index()` | 138+ | 26.2+ | 26.2+ | 154+ | ❌ **não suportado (4–30)** | **76,77%** | [caniuse](https://caniuse.com/mdn-css_types_sibling-index) |
| `position: sticky` | ✅ | ✅ | ✅ | ✅ | ✅ | Baseline | — |
| `background-attachment: fixed` | ✅ | ✅ desktop | ❌ **iOS/iPadOS não suporta** (desabilitado por performance) | ✅ | parcial | — | [Elementor troubleshooting](https://elementor.com/help/troubleshooting-fixed-background-attachment-not-working-in-safari-iphone-ipad/), [Apple Developer Forums](https://developer.apple.com/forums/thread/99883?page=3) |

**Leitura para este projeto (tráfego majoritariamente celular brasileiro):**
- `view()`/`scroll()` cobre Chrome Android + iOS 26 + Samsung Internet 23+. É a maioria esmagadora do tráfego móvel. ✅ pode ser o padrão.
- `sibling-index()` **está fora**: Samsung Internet não suporta em nenhuma versão, e Samsung Internet é relevante no Android brasileiro. Use `--i` via `style` inline.
- Firefox no celular (Firefox for Android) **não suporta** `animation-timeline`. É uma fatia pequena, e a degradação é "conteúdo visível e parado". Aceitável.

---

## 1. As quatro famílias e quando usar cada uma

### (a) CSS scroll-driven animations — `animation-timeline: view()` / `scroll()`

Duas linhas do tempo, conceitualmente diferentes ([Chrome Developers](https://developer.chrome.com/docs/css-ui/scroll-driven-animations), [MDN — Scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)):

- **`scroll()` — scroll progress timeline.** 0% = topo do contêiner de rolagem, 100% = fim. Para barra de progresso de leitura, header que encolhe.
- **`view()` — view progress timeline.** 0% = o elemento *começa* a entrar no viewport, 100% = o elemento *terminou* de sair. Para revelar. **É o que a maioria dos "reveals" quer.**

```css
/* Revelar por rolagem — o padrão desta página */
@keyframes revelar {
  from { opacity: 0; translate: 0 24px; }
  to   { opacity: 1; translate: 0 0; }
}

@supports (animation-timeline: view()) and (animation-range: entry 0% cover 40%) {
  @media (prefers-reduced-motion: no-preference) {
    [data-revelar] {
      animation: revelar linear both;
      animation-timeline: view();
      animation-range: entry 15% cover 35%;
    }
  }
}
```

**As faixas de `animation-range` de uma view timeline** ([Chrome Developers](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)):

| Faixa | Significa |
|---|---|
| `cover` | do primeiro pixel entrando ao último saindo (padrão, 0%→100%) |
| `entry` | só o trecho de entrada (borda de baixo do viewport → elemento inteiro dentro) |
| `exit` | só o trecho de saída |
| `contain` | o período em que o elemento está inteiramente contido no viewport |
| `entry-crossing` / `exit-crossing` | variantes que medem o cruzamento da borda |

Dá para embutir a faixa direto nos keyframes:

```css
@keyframes entra-e-sai {
  entry 0%   { opacity: 0; }
  entry 100% { opacity: 1; }
  exit  0%   { opacity: 1; }
  exit  100% { opacity: 0; }
}
```

**Timeline nomeada** (quando quem anima não é quem rola):

```css
.secao      { view-timeline-name: --secao; view-timeline-axis: block; }
body        { timeline-scope: --secao; }          /* eleva o escopo */
.indicador  { animation: acende linear both; animation-timeline: --secao; }
```

`timeline-scope` existe exatamente porque uma timeline nomeada só é visível para o próprio elemento e seus descendentes ([Chrome Developers](https://developer.chrome.com/docs/css-ui/scroll-driven-animations), [Josh W. Comeau](https://www.joshwcomeau.com/animation/scroll-driven-animations/)).

**Por que é a família padrão:** o Chrome afirma que essas animações "rodam fora da main thread", entregando "silky smooth animations, driven by scroll" sem o jank típico de handlers de scroll na main thread ([Chrome Developers](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)). O Safari 26.4 acrescentou *threaded* scroll-driven animations.

**As pegadinhas (4, todas já me morderam em alguém):**

1. **`animation-timeline` é reset-only no atalho `animation`.** Se você escrever `animation: revelar 1s linear both` *depois* de `animation-timeline: view()`, o atalho zera a timeline para `auto` e a animação vira temporal. **Ordem importa**: sempre declare `animation-timeline` por último. ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline); o WebKit diz a mesma coisa: *"it's important to set the `animation` property first. Otherwise, this won't work."*)
2. **`@supports` só com `animation-timeline` deixa passar implementação parcial.** Bramus Van Damme documentou: o Firefox Nightly suporta `animation-timeline: scroll()` mas **não** `animation-range`, então passa no teste e roda com o timing errado. A checagem correta é:
   ```css
   @supports ((animation-timeline: scroll()) and (animation-range: 0% 100%)) { /* ... */ }
   ```
   ([bram.us, 24/09/2024](https://www.bram.us/2024/09/24/feature-detecting-scroll-driven-animations-you-want-to-check-for-animation-range-too/))
3. **`animation-fill-mode`.** Se a faixa não começa em 0, sem `both`/`backwards` o estado inicial só é aplicado quando a faixa começa — o elemento aparece pronto e depois "pula" para o estado inicial. Comeau: *"you must explicitly set `animation-fill-mode: backwards`"*.
4. **Não coloque `animation-duration`.** Com timeline de rolagem a duração é ignorada. Mas se algum navegador cair no fallback temporal, uma duração explícita faz *tudo animar de uma vez no load*. Sem duração, o default é `0s` → estado final imediato → degradação perfeita.

### (b) IntersectionObserver + classe CSS

O mais barato e robusto. Roda assíncrono e fora da main thread; o navegador decide quando checar. A alternativa histórica — `scroll` + `getBoundingClientRect()` — *"runs synchronously on main thread every scroll event, causing performance issues"* ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)).

Opções do construtor: `root`, `rootMargin`, `threshold`, e mais recentemente `scrollMargin`, `trackVisibility`, `delay`.

```js
const io = new IntersectionObserver((entries, obs) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('revelado');
    obs.unobserve(e.target);           // dispara UMA vez e some
  }
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
```

`rootMargin` negativo embaixo (`-10%`) evita que o elemento anime quando só a borda apareceu.

**Pegadinha:** `unobserve` é obrigatório. Sem ele o callback continua rodando na saída e volta do elemento a vida inteira, e você acumula trabalho por elemento observado.

### (c) GSAP ScrollTrigger

Vale quando você precisa de pelo menos um destes, e **não** vale para reveal simples:
- **`scrub`** — progresso amarrado ao scroll com controle fino de ease e de suavização;
- **timeline com muitos alvos coreografados** (A entra, B sai, C gira, tudo com overlaps negativos);
- **`pin`** (que aqui vamos substituir por `sticky`);
- callbacks (`onEnter`, `onLeaveBack`) que precisam disparar lógica de React.

A doc afirma que ele é *"highly optimized"*, com eventos de scroll debounced sincronizados ao `requestAnimationFrame`, e que **calcula as posições antecipadamente** em vez de monitorar elementos continuamente ([GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)).

### (d) framer-motion / Motion

Duas modalidades, nomeadas na própria doc ([Motion — Scroll animations](https://motion.dev/docs/react-scroll-animations)):
- **scroll-triggered**: `whileInView` / `useInView` — dispara ao entrar;
- **scroll-linked**: `useScroll` + `useTransform` — valor amarrado ao scroll.

A doc reivindica: *"Motion is the only animation library that runs scroll-linked animations on the browser's native ScrollTimeline where possible, for fully hardware-accelerated animations."*

**Pegadinha fatal para `output: 'export'`:** o Motion **renderiza o `initial` no HTML do servidor**. `<motion.div initial={{opacity:0}}>` vira `style="opacity:0"` no arquivo `.html` exportado. É *exatamente* o bug dos 34 blocos. Use `whileInView` **sem** `initial` que zere opacidade, ou arme o `initial` só no cliente (seção 2).

---

### Tabela de decisão

| Efeito que você quer | Família | Por quê |
|---|---|---|
| Bloco/card aparece ao entrar na tela (o reveal padrão) | **CSS `view()`** | zero JS, zero risco de nascer invisível, fora da main thread |
| O mesmo reveal, mas obrigatório também no Firefox | **IO + classe, armado após montar** | única forma de cobrir 100% sem servir HTML invisível |
| Barra de progresso de leitura no topo | **CSS `scroll()`** | 4 linhas de CSS, sem JS, sem listener |
| Header que encolhe/ganha fundo ao rolar | **CSS `scroll()`** ou **IO com sentinela** | nunca listener de scroll |
| Parallax sutil de imagem dentro da seção | **CSS `view()` com `animation-range: cover`** | compositor; substitui `background-attachment: fixed`, que é proibido no iOS |
| Momento coreografado: imagem cresce enquanto texto sobe e legenda entra, amarrado ao scroll | **GSAP ScrollTrigger `scrub` + CSS `sticky`** | precisa de timeline com overlaps; `sticky` cuida do grudar |
| Texto revelando linha a linha | **GSAP SplitText + ScrollTrigger** ou **CSS `view()` com `--i`** | SplitText resolve o quebra-linhas responsivo e a acessibilidade (aria) |
| Contador que sobe ao entrar | **IO + `requestAnimationFrame`** (ou `useInView` + `animate()`) | precisa de valor numérico, não de estilo |
| Carrossel/lista horizontal com item central destacado | **CSS `scroll-snap` + `view(inline)`** | nativo, funciona no toque, não sequestra o gesto |
| Qualquer coisa perto de um `<iframe>` do YouTube | **nada** | transform/sticky/pin sobre iframe = repaint caro e risco de perder estado do player |
| Valor que precisa virar estado React (índice de seção ativa, progresso) | **`useScroll`/`useInView` do Motion** | já está no ciclo do React |

---

## 2. O erro do "nasce invisível" — como revelar sem servir `opacity: 0`

### O diagnóstico

O HTML exportado continha `opacity: 0` porque **o Motion serializa o `initial` no SSR**. Isso é comportamento documentado e intencional: *"Motion components are fully compatible with server-side rendering, meaning the initial state of the component will be reflected in the server-generated output"* ([Motion, componente](https://www.framer.com/motion/component)). Em app com `output: 'export'` esse estado inicial fica **gravado no arquivo**. Em 4G, entre o `first paint` e a hidratação do bundle React há segundos de página em branco parcial. Em JS quebrado, é permanente. E o Googlebot pode indexar conteúdo com `opacity:0`, mas o usuário não lê.

### As quatro soluções, comparadas honestamente

#### Solução A — CSS scroll-driven (`view()`) — **recomendada**

O HTML nasce com opacidade 1. O CSS só liga o efeito onde há suporte. **Não existe JS no caminho crítico**, então não existe janela de invisibilidade.

```css
@keyframes revelar { from { opacity: 0; translate: 0 24px; } to { opacity: 1; translate: 0 0; } }

@supports ((animation-timeline: view()) and (animation-range: entry 0% cover 40%)) {
  @media (prefers-reduced-motion: no-preference) {
    [data-revelar] {
      animation: revelar linear both;
      animation-timeline: view();
      animation-range: entry 15% cover 35%;
    }
  }
}
```

- ✅ impossível ficar invisível por falha de JS
- ✅ custo ~zero, roda fora da main thread
- ✅ SEO e leitores de tela intactos
- ⚠️ Firefox estável e navegadores antigos não animam (conteúdo aparece pronto)
- ⚠️ elemento já visível no primeiro paint (acima da dobra) pode começar com `opacity: 0` porque a view timeline dele já está em progresso 0 → **exclua o hero do seletor** ou use `animation-range: cover 0% cover 40%` que já está adiantado no load

#### Solução B — classe `no-js` — **não resolve o problema real**

Padrão clássico: `<html class="no-js">` + script inline no `<head>` que remove a classe; CSS escreve `.no-js [data-revelar] { opacity: 1 }`.

**Por que não serve aqui:** o script inline roda antes do paint. Ele remove `no-js` imediatamente. A partir daí `[data-revelar] { opacity: 0 }` volta a valer — e o conteúdo fica invisível até o **bundle React** chegar e o observer rodar. Ou seja: `no-js` protege contra **JS desativado**, e não contra **JS lento**. O bug de 4G continua idêntico. Use `no-js` só como cinto de segurança adicional, nunca como a solução.

#### Solução C — "esconde só o que está abaixo da dobra, depois de montar" — **camada 2 recomendada**

O CSS servido não esconde nada. O JS, **depois** de montar, mede uma vez, marca só o que está abaixo da dobra, e só então aplica a classe que zera opacidade.

```tsx
'use client';
import { useEffect } from 'react';

export function ArmarRevelar() {
  useEffect(() => {
    const raiz = document.documentElement;

    // 1. reduced motion: nem arma
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // 2. se o CSS scroll-driven funciona, ele já cuidou. Não duplica.
    const temCSS =
      CSS.supports('animation-timeline', 'view()') &&
      CSS.supports('animation-range', 'entry 0% cover 40%');
    if (temCSS) return;

    // 3. espera o restore de scroll do navegador (bfcache / #ancora) antes de medir
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const alvos = Array.from(document.querySelectorAll<HTMLElement>('[data-revelar]'));

      // UMA leitura em lote — nada disso acontece durante scroll
      const abaixoDaDobra = alvos.filter(
        (el) => el.getBoundingClientRect().top > innerHeight * 0.9
      );
      if (!abaixoDaDobra.length) return;

      // só agora a página passa a poder esconder algo
      raiz.classList.add('js-revelar-ativo');
      abaixoDaDobra.forEach((el) => el.classList.add('armado'));

      const io = new IntersectionObserver((entries, obs) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('revelado');
          obs.unobserve(e.target);
        }
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });

      abaixoDaDobra.forEach((el) => io.observe(el));

      // rede de segurança: se algo falhar, tudo aparece em 3s
      const t = setTimeout(() => {
        abaixoDaDobra.forEach((el) => el.classList.add('revelado'));
      }, 3000);

      return () => { io.disconnect(); clearTimeout(t); };
    }));
  }, []);

  return null;
}
```

```css
/* nada esconde nada até o JS provar que está vivo */
.js-revelar-ativo [data-revelar].armado {
  opacity: 0;
  translate: 0 24px;
}
.js-revelar-ativo [data-revelar].armado.revelado {
  opacity: 1;
  translate: 0 0;
  transition: opacity .5s ease, translate .5s cubic-bezier(.22,1,.36,1);
}
@media (prefers-reduced-motion: reduce) {
  .js-revelar-ativo [data-revelar].armado { opacity: 1; translate: 0 0; }
}
```

- ✅ pior caso (JS nunca chega, JS quebra, 4G ruim) = **página inteira visível**
- ✅ cobre Firefox e navegadores antigos
- ✅ nada acima da dobra pisca
- ⚠️ é mais código para manter
- ⚠️ o `getBoundingClientRect` em lote no mount é aceitável (uma leitura, um frame). **Nunca** repita isso em `scroll`

#### Solução D — `@starting-style` — **ferramenta errada para este caso**

`@starting-style` define os valores *de partida* para a primeira atualização de estilo do elemento — foi feito para entradas de `popover`, `<dialog>` e elementos que saem de `display: none` ou entram no DOM ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style)). Baseline 2024.

```css
.cartao {
  transition: opacity .4s, translate .4s;
  opacity: 1; translate: 0 0;
  @starting-style { opacity: 0; translate: 0 24px; }
}
```

**Por que não serve para revelar por rolagem:** ele dispara quando o elemento é *inserido/exibido*, não quando entra no viewport. Para usá-lo como reveal você teria que **montar o elemento via IO** — o que significa que o HTML exportado **não conteria o conteúdo**, o que é pior que `opacity:0` para SEO. Guarde `@starting-style` para modais, toasts e menus. Não para o corpo da página.

### Recomendação final

> **A (CSS `view()`) como padrão para tudo. C (arma-depois-de-montar) só se o cliente exigir que o efeito também apareça no Firefox.** B e D não entram como solução do reveal.
>
> E uma regra de higiene, verificável em CI: **nenhum arquivo em `out/` pode conter `opacity:0`, `opacity: 0` ou `visibility:hidden` fora de `<template>`/`<noscript>`.**
> ```bash
> grep -rn 'opacity: *0[^.]' out/*.html && echo "FALHOU: HTML servido com opacidade zero"
> ```

---

## 3. Stagger — escalonar a entrada de uma lista

### 3.1 CSS puro

**Variante 1 — `nth-child` (lista curta e fixa, ex.: 4 cards de serviço):**

```css
@media (prefers-reduced-motion: no-preference) {
  .revelado > li { animation: revelar .5s cubic-bezier(.22,1,.36,1) both; }
  .revelado > li:nth-child(1) { animation-delay:  0ms; }
  .revelado > li:nth-child(2) { animation-delay: 70ms; }
  .revelado > li:nth-child(3) { animation-delay: 140ms; }
  .revelado > li:nth-child(4) { animation-delay: 210ms; }
}
```

**Variante 2 — `--i` com `calc()` (lista dinâmica; é o que este projeto deve usar):**

```tsx
{itens.map((item, i) => (
  <li key={item.id} style={{ '--i': i } as React.CSSProperties}>…</li>
))}
```

```css
@media (prefers-reduced-motion: no-preference) {
  .revelado > li {
    animation: revelar .5s cubic-bezier(.22,1,.36,1) both;
    animation-delay: calc(var(--i, 0) * 70ms);
  }
}
```

**Variante 3 — stagger *geométrico* com `view()`, sem delay nenhum (a mais elegante):**

Como cada item tem a **própria** view timeline, em uma coluna única (celular) o escalonamento acontece sozinho: o item 2 entra depois do 1 porque está mais abaixo. **Não escreva delay no celular.**

```css
@supports ((animation-timeline: view()) and (animation-range: entry 0% cover 40%)) {
  @media (prefers-reduced-motion: no-preference) {
    .grade > * {
      animation: revelar linear both;
      animation-timeline: view();
      animation-range: entry 10% cover 30%;
    }
  }
}
```

Para a **grade multi-coluna do desktop**, onde a linha inteira entra junto, aí sim escalone dentro da linha usando uma timeline nomeada do contêiner + `--i`:

```css
@media (min-width: 768px) {
  @supports ((animation-timeline: view()) and (animation-range: entry 0% cover 40%)) {
    .grade { view-timeline-name: --grade; }
    .grade > * {
      animation: revelar linear both;
      animation-timeline: --grade;
      animation-range:
        entry calc(20% + var(--i, 0) * 5%)
        entry calc(75% + var(--i, 0) * 5%);
    }
  }
}
```

> **Pegadinha:** a tentação é usar `sibling-index()` e apagar o `--i`. **Não use ainda**: Samsung Internet não suporta em nenhuma versão (4–30) e o uso global é 76,77% ([caniuse, 05/08/2026](https://caniuse.com/mdn-css_types_sibling-index)). Num site com tráfego Android brasileiro isso é um buraco real.

### 3.2 framer-motion / Motion

Variantes **propagam automaticamente** pela subárvore: o filho não precisa de `whileInView`, só de `variants` com os mesmos nomes de estado ([Motion — Animation](https://motion.dev/docs/react-animation)).

```tsx
'use client';
import { motion, stagger } from 'motion/react';

const lista = {
  oculto:  { opacity: 1 },                                  // pai NÃO zera nada
  visivel: {
    opacity: 1,
    transition: { when: 'beforeChildren', delayChildren: stagger(0.08) },
  },
};

const item = {
  oculto:  { opacity: 0, y: 24 },
  visivel: { opacity: 1, y: 0, transition: { duration: .5, ease: [.22,1,.36,1] } },
};

export function Grade({ itens }) {
  return (
    <motion.ul
      variants={lista}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, amount: 0.25 }}
    >
      {itens.map((it) => (
        <motion.li key={it.id} variants={item}>{it.titulo}</motion.li>
      ))}
    </motion.ul>
  );
}
```

`stagger()` aceita `{ from: 'last' | 'first' | 'center' | número }` ([Motion — Transitions](https://motion.dev/docs/react-transitions)). `when: 'beforeChildren'` / `'afterChildren'` ordena pai×filhos.

> **Pegadinha (a que causou o bug):** esse `initial="oculto"` **será serializado no HTML exportado** como `style="opacity:0;transform:translateY(24px)"` em cada `<li>`. Se você for usar Motion neste projeto, ou (i) monte o componente só no cliente com um estado `montado` e sirva o HTML sem `initial`, ou (ii) **prefira a Solução A** e esqueça o Motion para reveal. Reveal de lista **não** é motivo suficiente para carregar Motion.

### 3.3 GSAP

`stagger` numérico simples ou objeto com `each` / `amount` / `from` / `grid` / `axis` / `ease` ([GSAP — Staggers](https://gsap.com/resources/getting-started/Staggers/)).

```js
// each: intervalo ENTRE cada elemento
gsap.from('.card', { opacity: 0, y: 24, duration: .6, stagger: 0.07 });

// amount: tempo TOTAL distribuído — melhor para listas de tamanho variável,
// porque 40 itens não viram 2,8 s de espera
gsap.from('.card', {
  opacity: 0, y: 24, duration: .6, ease: 'power2.out',
  stagger: { amount: 0.45, from: 'start', grid: 'auto', axis: 'y' },
  scrollTrigger: { trigger: '.grade', start: 'top 80%', once: true },
});

// grid explícito, saindo do centro (efeito "onda" em galeria)
gsap.from('.foto', {
  scale: .92, opacity: 0, duration: .5,
  stagger: { amount: .6, grid: [3, 4], from: 'center', ease: 'power2.inOut' },
});
```

Para **muitos** elementos espalhados, `ScrollTrigger.batch()` é o caminho — ele agrupa os elementos que entram no mesmo intervalo e entrega um array ao callback, em vez de disparar N callbacks ([GSAP — ScrollTrigger.batch()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.batch()/)):

```js
ScrollTrigger.batch('.card', {
  start: 'top 85%',
  once: true,
  batchMax: 4,
  onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, stagger: .08, overwrite: true }),
});
```

> **Pegadinha do `gsap.from()` com ScrollTrigger:** tweens `from` têm `immediateRender: true` por padrão. O elemento vai para `opacity: 0` **no instante em que o tween é criado**, mesmo que esteja acima da dobra — piscada garantida. Solução: `gsap.fromTo(..., { immediateRender: false })`, ou `once: true` + só em elementos abaixo da dobra, ou `.batch()` com `gsap.to()` a partir de um estado armado.

---

## 4. Scrub e pin com ScrollTrigger

### `scrub: true` vs `scrub: 1`

Da doc oficial ([GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)):

- **`scrub: true`** — o playhead da animação é **atrelado diretamente** à barra de rolagem. Rolou 1 px, a timeline avança a fração correspondente. Instantâneo, sem inércia.
- **`scrub: <número>`** — o número é o **tempo em segundos que o playhead leva para alcançar** a posição da rolagem. `scrub: 0.5` = "meio segundo de catch-up". É um lerp: dá inércia, absorve a natureza *discreta e brusca* do scroll por toque, e esconde micro-travadas.

**Para este projeto, celular:** `scrub: 0.5` a `1`. `scrub: true` no toque fica nervoso porque o scroll por dedo chega em saltos, não contínuo. `scrub: 2+` fica lento e o usuário sente "atraso", não "suavidade".

```js
gsap.timeline({
  scrollTrigger: {
    trigger: '.secao-15-anos',
    start: 'top top',
    end: '+=100%',      // 100vh de rolagem para o momento inteiro
    scrub: 0.6,
  },
})
  .to('.foto',   { scale: 1, clipPath: 'inset(0% round 20px)', ease: 'none' }, 0)
  .from('.titulo', { yPercent: 30, opacity: 0, ease: 'none' }, 0.1)
  .from('.legenda',{ opacity: 0, ease: 'none' }, 0.55);
```

> **Pegadinha:** com `scrub`, o `toggleActions` é ignorado (não há "play/reverse", há só posição). E, para a relação com o scroll parecer linear, as sub-tweens do parallax devem ter `ease: 'none'` — ease dentro de scrub faz o elemento acelerar sozinho enquanto o dedo está parado, e o usuário lê isso como bug.

### `pin` e o que ele faz com o layout

`pin: true` **não** aplica `position: fixed` direto. O ScrollTrigger **envolve o elemento numa `div.pin-spacer`** e adiciona padding nessa div igual à distância pinada, para o restante da página não colapsar (`pinSpacing: true`, o padrão). `pinSpacing: 'margin'` usa margem em vez de padding; `pinSpacing: false` remove o espaço e deixa o conteúdo seguinte sobrepor. Em contêiner `display: flex` o padrão passa a ser `false`.

**O que isso quebra no seu CSS** (o custo real, pouco documentado):
- seletores de irmão (`+`, `~`) entre a seção pinada e a seguinte param de casar — agora há um `pin-spacer` no meio;
- `:first-child` / `:last-child` / `:nth-child` do pai mudam de sentido;
- se o pai é `grid` ou `flex`, quem vira item do grid é o `pin-spacer`, não o seu elemento — `grid-area`, `align-self`, `gap` se comportam diferente;
- `position: sticky` de filhos passa a ser relativo ao spacer.

### Por que pin em celular é arriscado

1. **Barra de endereço.** Ela aparece/some conforme o scroll, o viewport muda de altura, o navegador dispara `resize`, o ScrollTrigger chama `refresh()`, todas as posições `start`/`end` são recalculadas e a página **salta**. Mitigação documentada: `ScrollTrigger.config({ ignoreMobileResize: true })` ([fórum GSAP](https://gsap.com/community/forums/topic/34737-feature-suggestion-for-ignoremobileresize-of-scrolltrigger/)) — que, segundo relatos, **não funciona em navegadores embutidos** (Instagram, Facebook in-app browser), justamente por onde chega parte do tráfego social deste tipo de site.
2. **Threads diferentes.** A rolagem acontece no compositor; o pin é aplicado por JS na main thread. Em rolagem rápida a tela repinta como se já tivesse passado do ponto de pin, e milissegundos depois o JS aplica o pin — o famoso "flash de conteúdo não pinado". `anticipatePin: 1` estima pela velocidade e reduz, não elimina.
3. **A "solução" seria `normalizeScroll`**, que faz o GSAP assumir o controle do toque para forçar tudo na main thread. **Está fora deste projeto pelo mesmo motivo que o Lenis:** sequestrar o gesto de toque quebra players e áreas roláveis internas.

### A alternativa que este projeto deve usar: `sticky` do CSS + `scrub`

É o padrão do tutorial do Codrops "Sticky Grid Scroll": o CSS cuida de grudar, o GSAP só avança a timeline. *"The sticky section behaves like a fixed stage. Scrolling does not move the scene, it advances time inside it."* ([Codrops, 02/03/2026](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/))

```css
.momento           { height: 200vh; }         /* espaço de rolagem */
.momento__palco    { position: sticky; top: 0; height: 100svh; overflow: hidden; }
```

```js
gsap.timeline({
  scrollTrigger: { trigger: '.momento', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
})
  .to('.momento__foto', { scale: 1.06, ease: 'none' }, 0);
```

- ✅ sem `pin-spacer`, sem quebra de seletor
- ✅ o "grudar" é feito pelo compositor do navegador, não por JS → **imune ao problema da barra de endereço**
- ✅ se o JS falhar, a seção continua grudando e o conteúdo continua legível
- ⚠️ use `100svh` (small viewport height), não `100vh`, senão o palco fica maior que a tela quando a barra está visível
- ⚠️ `overflow: hidden` em qualquer ancestral mata `sticky`

### Limpeza no unmount com React 19 + StrictMode

**O correto hoje é `useGSAP()` do `@gsap/react`.** A doc oficial o descreve como *"a drop-in replacement for `useEffect()` or `useLayoutEffect()` that automatically handles cleanup"*, e diz que ele "envolve `gsap.context()` internamente" ([GSAP — React](https://gsap.com/resources/React/)). `gsap.context()` manual continua funcionando e é o que roda por baixo, mas **não é mais o recomendado em React**.

Reverte automaticamente no unmount: tweens, timelines, **ScrollTriggers**, `Draggable` e **`SplitText`**.

```tsx
'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Momento() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
      celular: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
      reduzido: '(prefers-reduced-motion: reduce)',
    }, (ctx) => {
      const { reduzido, celular } = ctx.conditions as Record<string, boolean>;
      if (reduzido) return;                        // fallback estático real

      gsap.timeline({
        scrollTrigger: {
          trigger: raiz.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: celular ? 0.8 : 0.5,
        },
      }).to('.momento__foto', { scale: 1.06, ease: 'none' }, 0);
    });
    // useGSAP reverte tudo: não precisa de return de cleanup
  }, { scope: raiz });

  return <section ref={raiz} className="momento">…</section>;
}
```

Pontos obrigatórios:
- `'use client'` — o App Router exige, e a doc do GSAP confirma que `useGSAP` é SSR-safe desde que em componente cliente;
- `gsap.registerPlugin(useGSAP, ScrollTrigger)` **uma vez**, no topo do módulo;
- `scope: raiz` — escopa o texto dos seletores (`'.momento__foto'`) aos descendentes do ref. Sem isso, `.momento__foto` pega **todas** as ocorrências da página;
- `dependencies: []` (padrão) roda uma vez; `revertOnUpdate: true` reverte a cada mudança de dependência;
- animação criada **depois** do hook (num `onClick`, num `setTimeout`) **não** é rastreada — envolva em `contextSafe()`;
- após carregar imagem/fonte/conteúdo assíncrono, chame `ScrollTrigger.refresh()` (é debounced em 200 ms).

---

## 5. Parallax honesto

**Regra única:** só `transform` (ou as propriedades individuais `translate`/`scale`/`rotate`) e `opacity`. Nunca `top`, `margin`, `height`, `background-position` — essas passam por layout e/ou paint a cada frame.

### `background-attachment: fixed` está proibido

O Safari no **iOS e iPadOS não suporta** `background-attachment: fixed` — foi desabilitado deliberadamente por performance ([Elementor](https://elementor.com/help/troubleshooting-fixed-background-attachment-not-working-in-safari-iphone-ipad/), [Apple Developer Forums](https://developer.apple.com/forums/thread/99883?page=3)). Num site com tráfego majoritariamente celular, isso significa que o efeito simplesmente **não existe para metade do público** — e, onde existe, força repaint da área inteira a cada frame de scroll.

### A versão CSS (preferida — roda fora da main thread, sem `will-change`)

```html
<figure class="parallax">
  <img src="/foto.avif" alt="" width="1600" height="1067" />
</figure>
```

```css
.parallax { overflow: hidden; border-radius: 20px; }
.parallax img {
  width: 100%;
  height: 118%;            /* folga para os ±8% de deslocamento */
  object-fit: cover;
  translate: 0 -8%;        /* estado base = também o fallback estático */
}

@keyframes parallax-y {
  from { translate: 0 -8%; }
  to   { translate: 0  8%; }
}

@supports ((animation-timeline: view()) and (animation-range: entry 0% cover 40%)) {
  @media (prefers-reduced-motion: no-preference) {
    .parallax img {
      animation: parallax-y linear both;
      animation-timeline: view();
      animation-range: cover;      /* do primeiro ao último pixel visível */
    }
  }
}
```

### A versão GSAP (só se já houver ScrollTrigger na seção por outro motivo)

```js
gsap.fromTo('.parallax img',
  { yPercent: -8 },
  {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: {
      trigger: '.parallax',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  }
);
```

`translate3d` explícito não é mais necessário: `yPercent`/`translate` já geram matriz composta. Se quiser forçar camada, prefira `will-change` a hacks de `translateZ(0)`.

### O `will-change` correto

MDN é enfático ([will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)):
- *"Don't apply `will-change` to too many elements… Overusing the property can cause the page to slow down instead of improving its performance."*
- *"Use sparingly… it is a good practice to switch `will-change` on and off using script code before and after the change occurs."*
- *"`will-change` is intended to be used as a last resort to try to deal with existing performance problems. It should not be used to anticipate performance problems."*

Para este projeto:

```css
/* aceitável: escopo estreito + só quando a seção está em jogo */
.momento__palco:has(.momento__foto) .momento__foto { will-change: transform; }
```

Ou, melhor, aplique e retire por JS:

```js
ScrollTrigger.create({
  trigger: '.momento',
  start: 'top bottom', end: 'bottom top',
  onToggle: ({ isActive }) => {
    foto.style.willChange = isActive ? 'transform' : 'auto';
  },
});
```

> **Não** coloque `will-change: transform` no seletor `[data-revelar]` — se ele pega 34 blocos, você criou 34 camadas de compositor e comeu a memória de GPU do celular. **Com CSS scroll-driven você não precisa de `will-change` nenhum**: o navegador já promove o alvo porque sabe que a animação é do compositor.

---

## 6. Efeitos concretos, com código

### 6.1 Texto revelando linha a linha / palavra a palavra

**SplitText é grátis, sim.** Desde **30/04/2025** a Webflow tornou o GSAP inteiro gratuito, **incluindo os plugins antes exclusivos do Club** (SplitText, MorphSVG, ScrollSmoother, DrawSVG…), inclusive para uso comercial ([Webflow Updates](https://webflow.com/updates/gsap-becomes-free), [CSS-Tricks](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/), [gsap.com/pricing](https://gsap.com/pricing/)).

```tsx
'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function TituloRevelado({ children }: { children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    SplitText.create(ref.current, {
      type: 'lines',
      mask: 'lines',          // cria a máscara de overflow — o efeito "sobe por trás"
      linesClass: 'linha++',
      autoSplit: true,        // re-divide sozinho quando a fonte carrega / a tela muda
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          opacity: 0,
          duration: .8,
          ease: 'power3.out',
          stagger: .08,
          scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
        });
      },
    });
  }, { scope: ref });

  return <h2 ref={ref}>{children}</h2>;
}
```

**Acessibilidade:** o SplitText, com `aria: "auto"` (padrão), adiciona `aria-label` no elemento original e `aria-hidden` nos pedaços criados — o leitor de tela lê a frase inteira, não letra por letra ([GSAP SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)).

> **Pegadinhas:** (1) o HTML servido continua com o texto normal — a divisão só acontece no cliente, então SEO está seguro; (2) sem `autoSplit: true`, o texto quebra errado quando a webfont carrega depois; (3) `revert()` restaura o `innerHTML` original — o `useGSAP` faz isso sozinho no unmount; (4) **use isto em UM título por página**, não em todos. Texto voando em toda a página é a assinatura mais óbvia de site gerado.

**Alternativa sem JS**, para um título curto (palavras marcadas no JSX):

```tsx
{'Quinze anos em uma noite'.split(' ').map((p, i) => (
  <span key={i} className="palavra" style={{ '--i': i } as React.CSSProperties}>{p} </span>
))}
```

```css
@supports ((animation-timeline: view()) and (animation-range: entry 0% cover 40%)) {
  @media (prefers-reduced-motion: no-preference) {
    h2 { view-timeline-name: --tit; }
    .palavra {
      display: inline-block;
      animation: revelar linear both;
      animation-timeline: --tit;
      animation-range: entry calc(30% + var(--i) * 4%) entry calc(80% + var(--i) * 4%);
    }
  }
}
```

### 6.2 Imagem que revela por `clip-path`

**CSS puro:**

```css
@keyframes abrir {
  from { clip-path: inset(0 50% 0 50% round 20px); }
  to   { clip-path: inset(0 0    0 0    round 20px); }
}

@supports ((animation-timeline: view()) and (animation-range: entry 0% cover 40%)) {
  @media (prefers-reduced-motion: no-preference) {
    .revelar-clip {
      animation: abrir linear both;
      animation-timeline: view();
      animation-range: entry 20% cover 45%;
    }
  }
}
```

**Motion, se precisar amarrar ao progresso** (padrão da própria doc, [Motion](https://motion.dev/docs/react-scroll-animations)):

```tsx
const ref = useRef(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
const clipPath = useTransform(scrollYProgress, [0, 1],
  ['inset(0% 50% 0% 50%)', 'inset(0% 0% 0% 0%)']);
return <motion.img ref={ref} style={{ clipPath }} src="…" alt="…" />;
```

> **Pegadinha:** `clip-path` **recorta, não esconde** — o texto dentro continua no DOM, indexável e acessível. Isso é bom. Mas `clip-path` em elemento com `border-radius` + `overflow: hidden` no pai pode gerar serrilhado no Safari; use `round` dentro do próprio `inset()` como acima.

### 6.3 Contador de número que sobe ao entrar na tela

**Regra inegociável: o número final está no HTML.** O script só reanima a partir do que já está lá.

```html
<span class="contador" data-contador>2 400</span>
```

```tsx
'use client';
import { useEffect, useRef } from 'react';

export function Contador({ valor, sufixo = '' }: { valor: number; sufixo?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // fica o valor final

    const fmt = new Intl.NumberFormat('pt-BR');
    const io = new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      obs.disconnect();

      const dur = 1200;
      const t0 = performance.now();
      const passo = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);           // easeOutCubic
        el.textContent = fmt.format(Math.round(valor * eased)) + sufixo;
        if (p < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }, { threshold: 0.6 });

    io.observe(el);
    return () => io.disconnect();
  }, [valor, sufixo]);

  // HTML servido já tem o número final
  return <span ref={ref}>{new Intl.NumberFormat('pt-BR').format(valor)}{sufixo}</span>;
}
```

> **Pegadinhas:** (1) `font-variant-numeric: tabular-nums` no CSS, senão a largura do número dança e empurra o layout a cada frame (CLS); (2) reserve a largura com `min-width` em `ch`; (3) não anime mais de 2–3 contadores na mesma tela; (4) sob `prefers-reduced-motion`, **não anime** — número correndo é movimento.

### 6.4 Barra de progresso de leitura — CSS puro, zero JS

```css
.progresso {
  position: fixed; inset-block-start: 0; inset-inline: 0;
  block-size: 3px; z-index: 50;
  background: var(--cor-destaque);
  transform-origin: 0 50%;
  scale: 0 1;                                   /* fallback: invisível, mas é 3px de barra */
}

@keyframes crescer { from { scale: 0 1; } to { scale: 1 1; } }

@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%)) {
  .progresso {
    animation: crescer linear both;
    animation-timeline: scroll(root block);
  }
}
```

Sem suporte, a barra fica com `scale: 0` — ou seja, invisível. É uma barra decorativa de 3 px; nenhum conteúdo se perde. **Este é o único lugar onde vale servir algo "invisível", porque não há informação nele.**

> **Nota de acessibilidade:** barra de progresso é *feedback funcional*, não decoração. Sob `prefers-reduced-motion` ela **pode ficar** (é uma mudança de tamanho amarrada 1:1 a um gesto do usuário, não uma animação autônoma). Não a coloque dentro do `@media (no-preference)`.

### 6.5 Seção que troca a cor de fundo ao entrar

**Errado:** animar `background-color` do `<body>` — repinta a tela inteira a cada frame.

**Certo:** uma camada de cor fixa por seção, animando **só a opacidade** (composite, não paint).

```html
<body>
  <div class="fundo" aria-hidden="true">
    <div class="fundo__cor fundo__cor--casamento"></div>
  </div>
  <main>… <section id="casamento">…</section> …</main>
</body>
```

```css
.fundo { position: fixed; inset: 0; z-index: -1; }
.fundo__cor { position: absolute; inset: 0; opacity: 0; }
.fundo__cor--casamento { background: var(--casamento-fundo); }

@keyframes acender { 0% { opacity: 0 } 25%,75% { opacity: 1 } 100% { opacity: 0 } }

@supports ((animation-timeline: view()) and (animation-range: entry 0% cover 40%)) {
  #casamento { view-timeline-name: --casamento; }
  body       { timeline-scope: --casamento; }
  .fundo__cor--casamento {
    animation: acender linear both;
    animation-timeline: --casamento;
    animation-range: cover;
  }
}
```

> **Pegadinhas:** (1) precisa de `timeline-scope` no `body` porque a camada de cor **não é descendente** da seção; (2) opacidade não é "motion animation" segundo o W3C, então **não** precisa ser desligada sob reduced-motion — mas garanta contraste de texto suficiente nas duas pontas da transição; (3) verifique o contraste **no meio** da transição, não só nos extremos.

### 6.6 Elemento que "gruda" e troca de conteúdo

```html
<section class="gruda">
  <div class="gruda__fixo">
    <h2>Nossa equipe</h2>
    <p data-slot>Coordenação</p>
  </div>
  <div class="gruda__rolagem">
    <article data-i="0" data-titulo="Coordenação">…</article>
    <article data-i="1" data-titulo="Som e luz">…</article>
    <article data-i="2" data-titulo="Fotografia">…</article>
  </div>
</section>
```

```css
.gruda { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }
.gruda__fixo { position: sticky; top: 12vh; }
@media (max-width: 767px) { .gruda { grid-template-columns: 1fr } .gruda__fixo { position: static } }
```

```tsx
'use client';
useEffect(() => {
  const slot = document.querySelector('[data-slot]')!;
  const io = new IntersectionObserver((entries) => {
    const visivel = entries.filter(e => e.isIntersecting)
                           .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visivel) slot.textContent = (visivel.target as HTMLElement).dataset.titulo!;
  }, { rootMargin: '-40% 0px -40% 0px', threshold: [0, .5, 1] });

  document.querySelectorAll('.gruda__rolagem article').forEach(a => io.observe(a));
  return () => io.disconnect();
}, []);
```

`rootMargin: '-40% 0px -40% 0px'` cria uma "faixa de leitura" no meio da tela: só conta quem estiver ali.

> **Pegadinha:** no celular, `sticky` lado a lado não cabe — vire pilha e desligue o sticky. E troque texto por `textContent`, não por remontagem React, para não invalidar o layout a cada scroll.

### 6.7 Players do YouTube — facade, e nenhum efeito de rolagem

Não é "efeito", mas é o item de rolagem mais importante da página deste cliente.

```tsx
'use client';
import { useState } from 'react';

export function VideoYouTube({ id, titulo }: { id: string; titulo: string }) {
  const [ativo, setAtivo] = useState(false);

  if (ativo) {
    return (
      <iframe
        className="video"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={titulo}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button className="video video--facade" onClick={() => setAtivo(true)} aria-label={`Reproduzir: ${titulo}`}>
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" width={480} height={360} />
      <span className="video__play" aria-hidden="true" />
    </button>
  );
}
```

> **Regras:** nenhum `transform`, `sticky`, `pin`, `filter` ou `will-change` em ancestral do `<iframe>`. Qualquer um deles cria contexto de empilhamento/camada e pode custar repaint da área do vídeo a cada frame, além de brigar com o fullscreen. O reveal da seção de vídeos anima **o título e a legenda**, não o player.

---

## 7. Performance

### Quantos ScrollTriggers é demais

A doc não dá número: *"No official limit exists on ScrollTrigger quantity, but excessive numbers may impact performance — consider `batch()` for many similar triggers"* ([GSAP](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)).

O custo **não** está no scroll — o ScrollTrigger pré-calcula `start`/`end` e só compara números num `rAF` debounced. O custo está no **`refresh()`**: a cada resize (leia-se: a cada vez que a barra de endereço aparece no celular) ele recalcula as posições de **todos** os triggers, e isso força layout síncrono. Com `pin`, cada refresh ainda mexe no DOM (`pin-spacer`).

Régua prática para este projeto:
- **até ~20 triggers sem pin:** imperceptível;
- **20–60:** ok, mas passe listas para `ScrollTrigger.batch()`;
- **acima de 60, ou mais de 2 pins:** o `refresh()` no celular vira um travamento visível;
- **meta deste site: ≤ 10 ScrollTriggers**, porque o reveal padrão é CSS e não conta.

### Por que `getBoundingClientRect()` no evento de scroll destrói tudo

Isso é *forced synchronous layout*. Ler geometria depois de escrever estilo obriga o navegador a aplicar o estilo e **rodar layout imediatamente**, fora da ordem normal ([web.dev](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)):

```js
// ❌ layout thrashing: ciclo ler-escrever-ler-escrever
function resizeAll() {
  for (let i = 0; i < paragraphs.length; i++) {
    paragraphs[i].style.width = `${box.offsetWidth}px`;   // lê DEPOIS de escrever, N vezes
  }
}

// ✅ lê tudo primeiro, escreve depois
const width = box.offsetWidth;                            // uma leitura
function resizeAll() {
  for (let i = 0; i < paragraphs.length; i++) {
    paragraphs[i].style.width = `${width}px`;             // só escritas
  }
}
```

Num handler de `scroll` isso acontece 60–120 vezes por segundo, em cima da main thread que já está disputando com a rolagem. **Por isso a regra: nenhum listener de `scroll` neste projeto.** Use `view()`, IntersectionObserver ou ScrollTrigger — os três resolvem sem ler geometria por frame.

### `content-visibility: auto` e o risco

Ele faz o navegador **pular layout e paint** de conteúdo fora da tela ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility), Baseline 2024).

```css
.secao-longa {
  content-visibility: auto;
  contain-intrinsic-size: auto 800px;   /* altura estimada enquanto está pulada */
}
```

**Os riscos, na ordem em que vão te morder:**
1. **`contain-intrinsic-size` errado = barra de rolagem pulando.** Você chuta 800 px, o real são 1400, e ao chegar perto a página cresce e o scroll salta.
2. **Ele quebra medições do ScrollTrigger.** Seções puladas reportam a altura *estimada*, não a real → `start`/`end` calculados errado → a animação dispara na hora errada. **Nunca ponha `content-visibility: auto` numa seção que tem ScrollTrigger.**
3. **Ele cria contexto de contenção** (`layout paint style`). Descendentes com `position: fixed`/`sticky` passam a se referenciar a ele. Combinado com `sticky`, quebra.
4. **Âncoras e find-in-page.** O conteúdo continua encontrável (diferente de `content-visibility: hidden`), mas o pulo até ele pode ser abrupto.

**Veredito para este site:** use **só** no rider técnico, se ele for uma lista realmente longa (>100 itens), e **só** se essa seção não tiver nenhum ScrollTrigger nem `sticky`. Em qualquer outro lugar, o ganho não paga o risco.

### Como medir

**Chrome DevTools → Rendering** (Cmd+Shift+P → "Show Rendering") ([Chrome Developers](https://developer.chrome.com/docs/devtools/rendering/performance)):
- **Paint flashing** — *"Chrome flashes the screen green whenever repainting happens."* Role a página: se áreas grandes piscam verde a cada frame, você está animando algo que não é `transform`/`opacity`.
- **Layout Shift Regions** — áreas de instabilidade piscam roxo. Um reveal correto não deve gerar nenhuma.
- **Layer borders** — laranja/oliva marcam camadas, ciano marca tiles. Se você vê dezenas de camadas, seu `will-change` está espalhado demais.
- **Frame Rendering Stats** — FPS ao vivo, com azul = frame ok, amarelo = parcial, vermelho = descartado.
- **Scrolling performance issues** — destaca elementos com listeners de scroll que podem prejudicar a performance. **Nesta página, esse painel tem que ficar vazio.**

**Performance panel:** grave 5 s rolando, com **CPU throttling 4×** e **Network Fast 4G**. Procure barras roxas (Layout/Recalculate Style) dentro de frames de scroll — cada uma é um `getBoundingClientRect` ou uma escrita de estilo mal colocada. O aviso "Forced reflow" aparece nomeado.

**Teste obrigatório deste projeto:** DevTools → Network → **Fast 4G** + recarregar, e conferir com o olho que **nenhum bloco fica invisível** entre o first paint e a hidratação.

---

## 8. `prefers-reduced-motion`

### O que exatamente desligar e o que pode ficar

A base normativa é o **WCAG 2.1/2.2 SC 2.3.3 Animation from Interactions** (nível AAA):

> *"Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed."*

E a nota que responde a pergunta diretamente:

> *"Motion animation does not include changes of color, blurring, or opacity which do not change the perceived size, shape, or position of the element."*
> — [W3C, Understanding SC 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

O mesmo documento nomeia parallax:

> *"Parallax scrolling"* é citado como animação frequentemente **não essencial**; *"Only add non-essential animation to the scrolling interaction in a responsible way. Always give users the ability to turn off unnecessary movement."*

> ⚠️ Há uma errata que reconsidera **blur** como parte de motion animation. Na dúvida, **não** use blur animado sob reduced-motion.

| Efeito | Sob `reduce` |
|---|---|
| Parallax | ❌ desligar |
| `translate` / `y` no reveal | ❌ desligar (fica só o fade) |
| `scale` / zoom | ❌ desligar |
| Rotação | ❌ desligar |
| Scrub + sticky (o "momento") | ❌ desligar a timeline; a seção vira estática e legível |
| SplitText linha a linha | ❌ desligar (o texto aparece inteiro) |
| Contador subindo | ❌ desligar (mostra o valor final) |
| Blur animado | ❌ desligar (errata) |
| **Fade de opacidade puro, sem deslocamento** | ✅ **pode ficar** |
| **Mudança de cor de fundo** | ✅ pode ficar |
| **Barra de progresso de leitura** | ✅ pode ficar (feedback funcional, 1:1 com o gesto) |

### O padrão CSS

Sempre **`no-preference` liga o efeito**, nunca "`reduce` desliga". Assim o estado padrão do CSS é o estático e o efeito é aditivo — se alguém esquecer o media query, o pior caso é não ter animação, não é ter animação indesejada.

```css
/* estado base = estado final. Ninguém nasce escondido. */
[data-revelar] { opacity: 1; translate: 0 0; }

@media (prefers-reduced-motion: no-preference) {
  @supports ((animation-timeline: view()) and (animation-range: entry 0% cover 40%)) {
    [data-revelar] {
      animation: revelar linear both;
      animation-timeline: view();
      animation-range: entry 15% cover 35%;
    }
  }
}

/* e o fade puro, que É permitido sob reduce, se você quiser algum sinal */
@media (prefers-reduced-motion: reduce) {
  @supports ((animation-timeline: view()) and (animation-range: entry 0% cover 40%)) {
    [data-revelar] {
      animation: so-fade linear both;
      animation-timeline: view();
      animation-range: entry 20% cover 40%;
    }
  }
}
@keyframes so-fade { from { opacity: .35 } to { opacity: 1 } }
```

(Se preferir simplicidade: sob `reduce`, não anime nada. É defensável e é o que eu faria.)

### O padrão `gsap.matchMedia()`

`gsap.matchMedia()` cria um `gsap.context()` internamente e **reverte automaticamente** tudo (tweens e ScrollTriggers) quando a condição deixa de casar ([GSAP](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/)). Isso é o que faz o fallback ser *real*: o usuário liga "reduzir movimento" no sistema e os ScrollTriggers **somem**, com os elementos restaurados aos valores originais.

```tsx
useGSAP(() => {
  const mm = gsap.matchMedia();

  mm.add({
    animar:  '(prefers-reduced-motion: no-preference)',
    celular: '(max-width: 767px)',
  }, (ctx) => {
    const { animar, celular } = ctx.conditions as Record<string, boolean>;
    if (!animar) return;                      // fallback estático real: não cria nada

    gsap.timeline({
      scrollTrigger: {
        trigger: raiz.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: celular ? 0.8 : 0.5,
      },
    })
      .to('.foto', { scale: 1.06, ease: 'none' }, 0)
      .from('.legenda', { opacity: 0, ease: 'none' }, .5);

    // cleanup opcional; NÃO chame ctx.revert() aqui — o matchMedia já faz
    return () => {};
  }, raiz);
}, { scope: raiz });
```

**Teste manual:** macOS → Ajustes → Acessibilidade → Tela → **Reduzir movimento**. iOS → Acessibilidade → Movimento → **Reduzir movimento**. Chrome DevTools → Rendering → **Emulate CSS prefers-reduced-motion**.

---

## 9. O ROTEIRO DE ROLAGEM DESTA PÁGINA

Princípio: **um vocabulário, três sotaques.** O reveal padrão (fade + 24 px, CSS `view()`) repete em toda a página e vira a "assinatura" do site. Em cima dele, **três** momentos fortes — e só três. É a diferença entre "as coisas acontecem" e "esse site foi gerado por IA".

| # | Seção | O que acontece | Técnica | Custo de JS |
|---|---|---|---|---|
| — | **Global** | Barra de progresso de leitura de 3 px no topo | CSS `animation-timeline: scroll(root block)` | **0** |
| — | **Global** | Header ganha fundo/sombra depois de ~80 px | CSS `scroll()` com `animation-range: 0 80px`, ou IO com sentinela de 1 px | **0** |
| 1 | **Hero** | **Nada de reveal** — está acima da dobra. Entrada no load: título por linhas (SplitText, 0,8 s) + subtítulo e CTA em fade de 0,4 s. Ao rolar: parallax de −8%→+8% na imagem de fundo | SplitText + `gsap.from` (sem ScrollTrigger) para a entrada; CSS `view()` `animation-range: cover` para o parallax | ~SplitText |
| 2 | **Serviços** (grade de cards) | Cada card aparece ao entrar. Celular (1 coluna): stagger **geométrico**, zero delay. Desktop (3 colunas): stagger de 60 ms por `--i` dentro da linha | CSS `view()` — celular anônimo, desktop com `view-timeline-name` no contêiner | **0** |
| 3 | **15 anos** | **MOMENTO 1.** Palco `sticky` de 100svh dentro de um bloco de 200vh. A foto abre de `clip-path: inset(0 22% round 24px)` para `inset(0 round 24px)` e ganha 6% de escala; o título sobe 30%; a legenda entra em fade no fim. Tudo amarrado ao scroll | CSS `position: sticky` + **GSAP ScrollTrigger `scrub: 0.6`**, `start: 'top top'`, `end: 'bottom bottom'`. **Sem `pin`** | 1 ScrollTrigger |
| 4 | **Casamento** | **MOMENTO 2 — o espelho do 3.** Mesma mecânica, imagem do outro lado, e a **cor de fundo da página** cruza para a paleta de casamento enquanto a seção atravessa | mesmo padrão do #3 (repetição = linguagem) + camada de cor fixa com opacidade por `view()` + `timeline-scope` no `body` | 1 ScrollTrigger |
| 5 | **Vídeos** | Título e legenda em fade. **Nada acontece com os players.** Thumbnails em facade; o iframe só nasce no clique | CSS `view()` no título; facade em React (`useState`) | ~0 |
| 6 | **Equipe** | Cards de pessoa entram em fade + 20 px. No desktop, o painel esquerdo **gruda** e o rótulo da função troca conforme o card entra na faixa central | CSS `view()` para os cards; `position: sticky` + IntersectionObserver com `rootMargin: '-40% 0 -40% 0'` para o rótulo | 1 IO |
| 7 | **Rider técnico** | Lista longa: itens entram com stagger curto (40 ms). Se houver números ("32 canais", "12 kW"), eles sobem uma vez ao entrar. Se a lista passar de ~100 itens, `content-visibility: auto` **nesta seção só** | CSS `view()` + `--i`; contador com IO + `rAF` | 1 IO por contador |
| 8 | **Depoimentos** | **MOMENTO 3.** Faixa horizontal com `scroll-snap` nativo; o depoimento no centro cresce para escala 1 e ganha opacidade total, os vizinhos ficam em 0,94 / 60%. **Sem pin horizontal, sem sequestro de gesto** | CSS `scroll-snap-type: x mandatory` + `animation-timeline: view(inline)` no item, `animation-range: contain` | **0** |
| 9 | **Contato** | **Nada.** Formulário e telefone aparecem prontos. No máximo, a linha de destaque acima do título "desenha" de `scaleX(0)` a `scaleX(1)` | CSS `view()` numa `::after` de 2 px | **0** |

### Orçamento total

- **2 ScrollTriggers** (15 anos, casamento) + **2–4 IntersectionObservers** (rótulo da equipe, contadores).
- **Todo o resto é CSS.** Nenhum listener de `scroll`. Nenhum `pin`. Nenhum `will-change` global.
- GSAP entra na página só pelo hero (SplitText) e pelos dois momentos → dá para carregar `gsap` + `ScrollTrigger` + `SplitText` num chunk dinâmico atrás de `import()` disparado por um IO na seção "15 anos", com o hero usando CSS puro se você quiser cortar mais.

### O que **não** fazer, mesmo que dê vontade

- ❌ Reveal diferente em cada seção (uma sobe, outra vem da esquerda, outra gira). É a assinatura mais reconhecível de site de template.
- ❌ Scroll horizontal com `pin` no celular.
- ❌ Cursor customizado seguindo o mouse — o cliente falou "efeitos de mouse", mas 80% do tráfego não tem mouse; o que ele quer é o **reveal**.
- ❌ Texto que revela **letra por letra** em parágrafo corrido: destrói a leitura e o `aria` fica frágil.
- ❌ Contador em número que não é impressionante. "15 anos de experiência" animando é bom; "3 pacotes" animando é constrangedor.
- ❌ Qualquer efeito acima da dobra que dependa de JS.

---

## Fontes

**CSS scroll-driven animations**
- MDN — [`animation-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline)
- MDN — [CSS scroll-driven animations (guia)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- Chrome Developers — [Scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)
- WebKit — [A guide to scroll-driven animations with just CSS](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/) (20/06/2025, Safari 26)
- Bramus Van Damme — [scroll-driven-animations.style](https://scroll-driven-animations.style/) (demos, curso, debugger)
- Bramus Van Damme — [Feature detecting Scroll-Driven Animations: you want to check for `animation-range` too](https://www.bram.us/2024/09/24/feature-detecting-scroll-driven-animations-you-want-to-check-for-animation-range-too/) (24/09/2024)
- Codrops — [A Practical Introduction to Scroll-Driven Animations with CSS `scroll()` and `view()`](https://tympanus.net/codrops/2024/01/17/a-practical-introduction-to-scroll-driven-animations-with-css-scroll-and-view/)
- Josh W. Comeau — [Scroll-Driven Animations](https://www.joshwcomeau.com/animation/scroll-driven-animations/)
- caniuse — [`animation-timeline`](https://caniuse.com/mdn-css_properties_animation-timeline) (consultado 05/08/2026 — 83,66%)
- MDN — [Experimental features in Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features) (pref `layout.css.scroll-driven-animations.enabled`)

**GSAP**
- [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [`ScrollTrigger.batch()`](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.batch()/)
- [`ScrollTrigger.normalizeScroll()`](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll()/)
- [React & GSAP / `useGSAP`](https://gsap.com/resources/React/)
- [`@gsap/react` no npm](https://www.npmjs.com/package/@gsap/react)
- [`gsap.matchMedia()`](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/)
- [Staggers](https://gsap.com/resources/getting-started/Staggers/)
- [SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)
- [GSAP pricing — 100% grátis](https://gsap.com/pricing/) · [Webflow Updates — GSAP becomes free](https://webflow.com/updates/gsap-becomes-free) · [CSS-Tricks — GSAP is now completely free](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/) (30/04/2025)
- Fórum GSAP — [`ignoreMobileResize`](https://gsap.com/community/forums/topic/34737-feature-suggestion-for-ignoremobileresize-of-scrolltrigger/) · [ScrollTrigger pinning and mobile](https://gsap.com/community/forums/topic/35277-scrolltrigger-pinning-and-mobile/)

**Motion / framer-motion**
- [Scroll animations](https://motion.dev/docs/react-scroll-animations)
- [Animation / variants](https://motion.dev/docs/react-animation)
- [Transitions / `stagger()`](https://motion.dev/docs/react-transitions)
- [`useInView`](https://motion.dev/docs/react-use-in-view)
- [`motion` component (SSR)](https://www.framer.com/motion/component)

**Plataforma e performance**
- MDN — [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- MDN — [`@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style)
- MDN — [`content-visibility`](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)
- MDN — [`will-change`](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)
- web.dev — [Avoid large, complex layouts and layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)
- Chrome Developers — [Analyze rendering performance (Rendering panel)](https://developer.chrome.com/docs/devtools/rendering/performance)
- caniuse — [`sibling-index()`](https://caniuse.com/mdn-css_types_sibling-index) (76,77%, Samsung Internet sem suporte)
- Elementor — [`background-attachment: fixed` não funciona no Safari iOS](https://elementor.com/help/troubleshooting-fixed-background-attachment-not-working-in-safari-iphone-ipad/) · [Apple Developer Forums](https://developer.apple.com/forums/thread/99883?page=3)

**Acessibilidade**
- W3C WAI — [Understanding SC 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- MDN — [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- CSS-Tricks — [`prefers-reduced-motion` (almanac)](https://css-tricks.com/almanac/rules/m/media/prefers-reduced-motion/)
- Pope Tech — [Design accessible animation and movement](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) (08/12/2025)

**Estudos de caso**
- Codrops — [Sticky Grid Scroll: Building a Scroll-Driven Animated Grid](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/) (02/03/2026) — origem do padrão `sticky` + `scrub` recomendado aqui
- Codrops — [Building a Scroll-Revealed WebGL Gallery with GSAP, Three.js, Astro and Barba.js](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/) (02/02/2026)
- Awwwards — [Scroll Animation Ideas for Image Grids](https://www.awwwards.com/inspiration/scroll-animation-ideas-for-image-grids)
