# 15 — Cards com ponteiro: tilt 3D, spotlight e borda que brilha

> Pesquisa para o card de serviço da Rapa Sound.
> Next 15.5.4 `output: 'export'` · React 19 · Tailwind v4 (`@theme`) · framer-motion 12.43 · GSAP 3.15.
> Restrição dura de cor respeitada em todo o documento: **magenta e congo = ambiente / fundo / foto de pista. Âmbar = botão, dado, e qualquer coisa perto de um rosto. Magenta nunca toca um rosto nem um botão.**

---

## RESUMO EXECUTIVO

1. **Tilt sim, mas microscópico: ±4°, nunca 15°.** O tilt de 15° do Aceternity/Motion-Primitives é a assinatura visual de "template de IA". A ±4° o card não parece um brinquedo, parece um objeto físico bem fabricado — que é o que "clean e muito bonito" significa.
2. **`perspective()` dentro do transform de CADA card, não `perspective` na grade.** Numa grade de 13, `perspective` no pai dá um ponto de fuga único e os cards das pontas ficam cisalhados. Um ponto de fuga por card é o que parece certo.
3. **Sem `translateZ` / sem camadas explodidas.** A profundidade vem da luz e do aro, não de a foto saltar do card. Além disso, `overflow:hidden` e `isolation:isolate` — que o `.card` atual usa — **forçam `transform-style: flat`** e matariam o `translateZ` de qualquer jeito.
4. **Spotlight: manter o `.luz` que já existe** (disco de tamanho fixo com máscara estática, movido só por `translate3d`). É a única variante da técnica que é **compositor puro**; `radial-gradient` reposicionado por frame repinta a camada inteira, com ou sem `useMotionTemplate`.
5. **Borda: arco cônico mascarado que APONTA para o cursor**, não conic girando em loop eterno. O loop eterno é o "neon genérico de IA" e ainda queima bateria com o telefone parado.
6. **Dois listeners no total para 13 cards.** O tilt via `onPointerMove` em JSX (o React 17+ já delega no container raiz) e a luz/arco via um listener vanilla delegado na grade com `WeakMap` para o ângulo.
7. **No celular: IntersectionObserver marcando o card no centro da tela.** Giroscópio está descartado — no iOS 13+ exige `DeviceOrientationEvent.requestPermission()` com ativação transiente, ou seja, um botão pedindo "acesso aos sensores de movimento" antes de um card brilhar. Isso é suicídio de conversão num link de bio.
8. **Bug encontrado no CSS atual:** `transition: background 260ms` no `.card` é **inerte** — `background-image` tem tipo de animação `discrete` (MDN). O aro de dois tons hoje pisca, não transiciona.

---

## 1. TILT 3D REAL

### 1.1 A matemática

O tilt é uma projeção perspectiva. Três peças, e a ordem importa:

| Peça | Onde vai | O que faz |
|---|---|---|
| `perspective: Npx` | no **pai** | distância do olho ao plano z=0. Ponto de fuga **compartilhado** por todos os filhos. |
| `perspective(Npx)` | na função `transform` do **próprio** elemento | ponto de fuga **individual**, centrado nesse elemento. |
| `rotateX() / rotateY()` | no filho que gira | a inclinação em si. |
| `transform-style: preserve-3d` | no elemento que gira | permite que os **netos** existam em Z. Sem isto, tudo achata. |
| `translateZ()` | nos netos | eleva camadas em direção ao olho. |

MDN, sobre `perspective`: *"determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective"* e *"the vanishing point is by default placed at the center of the element, but its position can be changed using the `perspective-origin` property"* ([MDN `perspective`](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective)).

Josh Comeau, em *Folding the DOM*: *"The value is given in px, and represents the distance that the viewer is from the item being transformed. The smaller the number, the more intense the transform effect."* ([joshwcomeau.com/react/folding-the-dom](https://www.joshwcomeau.com/react/folding-the-dom/))

Relação inversa: `perspective: 300px` é violento, `1200px` é quase ortográfico. Para card de serviço, **1000–1400px**.

### 1.2 Por que `perspective` no pai dá resultado DIFERENTE

Esta é a decisão que mais muda o resultado numa grade e quase ninguém explica.

- **`perspective` no pai (a grade):** um único ponto de fuga, no centro da grade. O card da coluna 1 é visto "de lado" e o da coluna 3 também, em espelho. Ao inclinar, eles inclinam *de forma diferente entre si* — os das pontas parecem cisalhados, tortos. É correto fisicamente (é como uma sala de verdade), e errado esteticamente para um grid de 13 objetos que deveriam parecer idênticos.
- **`perspective()` no transform de cada card:** cada card tem o próprio olho, centrado nele. Todos inclinam igual. É o que o Motion-Primitives faz (`perspective(1000px) rotateX() rotateY()` numa `useMotionTemplate`) e o que o Aceternity emula colocando um wrapper com `perspective: 1000px` **por card**, não por grade.

**Para 13 cards: `perspective()` dentro do transform.** Sem wrapper extra, sem ponto de fuga compartilhado.

**Pegadinha:** `perspective` (a propriedade) **cria stacking context** e vira **containing block para `position: fixed`** descendente (MDN). Se você põe `perspective` num wrapper de grade e tem qualquer coisa `fixed` dentro (um modal, o `.navbar`), ela para de ser fixa em relação à viewport. Mais um motivo para usar a função, não a propriedade.

### 1.3 A pegadinha que mata `preserve-3d` NESTE projeto

MDN, `transform-style`: *"The spec lists some grouping property values, which require the user agent to create a flattened representation of the descendant elements before they can be applied, and therefore force the element to have a used value of `transform-style: flat`, even when `preserve-3d` is specified."* ([MDN `transform-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style))

A lista completa que força `flat`:

- `overflow` diferente de `visible`/`clip`
- `opacity` < 1
- `filter` diferente de `none`
- `clip` / `clip-path`
- `isolation: isolate`
- `mask-image` / `mask-border-source`
- `mix-blend-mode` diferente de `normal`
- `contain: paint` (e `content-visibility: hidden`)

O `.card` de hoje (`app/globals.css` linha 278) tem `overflow: hidden` **e** `isolation: isolate`. O `.luz` tem `mask-image` **e** `mix-blend-mode: screen`. Ou seja: **`translateZ` em camadas dentro do card atual não funciona hoje e não vai funcionar sem reescrever o recorte.**

Se você quiser mesmo camadas em Z, a receita é descer o recorte um nível:

```tsx
{/* ERRADO — o card recorta, logo achata tudo dentro */}
<a className="card overflow-hidden isolate [transform-style:preserve-3d]">
  <img className="[transform:translateZ(30px)]" />   {/* não vai levantar */}
</a>

{/* CERTO — quem recorta é o invólucro da foto, que não tem filhos em 3D */}
<a className="card [transform-style:preserve-3d]">   {/* sem overflow, sem isolation */}
  <span className="block overflow-hidden rounded-xl [transform:translateZ(30px)]">
    <img />
  </span>
  <h3 className="[transform:translateZ(12px)]">…</h3>
</a>
```

E aí a luz do cursor precisa ser recortada por conta própria (com `mask`/`clip-path` **nela**, que não tem filhos 3D), não pelo `overflow` do card.

**Minha recomendação para este projeto: não usar `translateZ`.** Três razões: (a) obriga a desmontar o recorte do card e a luz vaza; (b) foto saltando sobre o texto é exatamente o demo do Aceternity, que é o oposto de "caro e sóbrio"; (c) todo elemento levantado em Z fica borrado (ver 1.5).

### 1.4 Código real — React + framer-motion, zero re-render

Regra inegociável do brief: nada de `useState` no `mousemove`. A doc da Motion é explícita: *"Changes to the motion value will update the DOM **without triggering a React re-render**"* ([motion.dev/docs/react-motion-value](https://motion.dev/docs/react-motion-value)).

```tsx
// components/useTilt3D.ts
'use client'

import { useRef } from 'react'
import { useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion'

/**
 * Tilt 3D sem re-render.
 *
 * Cada card tem 2 motion values (posição normalizada -0.5..0.5), 2 springs e
 * 2 transforms. Nada disso passa pelo React: `.set()` escreve no valor, o
 * frameloop da Motion escreve no DOM na fase de render do próprio rAF.
 *
 * `graus` pequeno de propósito. 15° (o default do Aceternity e do
 * Motion-Primitives) é o visual de template; 3 a 5° é o visual de objeto.
 */
export function useTilt3D({
  graus = 4,
  perspectiva = 1200,
  ativo = true,
}: { graus?: number; perspectiva?: number; ativo?: boolean } = {}) {
  // -0.5 (borda esquerda/topo) .. +0.5 (borda direita/base)
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  // A mola é o que separa "segue o mouse" de "tem massa".
  // stiffness alto + damping alto = assenta rápido e não balança.
  const mola = { stiffness: 320, damping: 34, mass: 0.6 } as const
  const sx = useSpring(px, mola)
  const sy = useSpring(py, mola)

  // Sinal: mouse EMBAIXO deve inclinar o topo PARA TRÁS -> rotateX negativo.
  const rotateX = useTransform(sy, [-0.5, 0.5], [graus, -graus])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-graus, graus])

  // perspective() DENTRO do transform: ponto de fuga por card.
  const transform = useMotionTemplate`perspective(${perspectiva}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`

  // Guarda o rect medido na ENTRADA. getBoundingClientRect a cada
  // pointermove é uma leitura de layout por frame; medindo uma vez por
  // hover, o custo cai a ~1 leitura por card visitado.
  const rect = useRef<DOMRect | null>(null)

  const onPointerEnter = (e: React.PointerEvent<HTMLElement>) => {
    if (!ativo || e.pointerType === 'touch') return
    rect.current = e.currentTarget.getBoundingClientRect()
  }

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!ativo || e.pointerType === 'touch') return
    const r = rect.current ?? e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }

  const onPointerLeave = () => {
    if (!ativo) return
    px.set(0)
    py.set(0)     // a mola devolve ao repouso; sem `transition` CSS envolvida
    rect.current = null
  }

  return { transform, onPointerEnter, onPointerMove, onPointerLeave }
}
```

Uso:

```tsx
const tilt = useTilt3D({ graus: 4 })

<motion.div
  style={{ transform: tilt.transform, transformStyle: 'flat' }}
  onPointerEnter={tilt.onPointerEnter}
  onPointerMove={tilt.onPointerMove}
  onPointerLeave={tilt.onPointerLeave}
>
  <a className="card">…</a>
</motion.div>
```

**"Mas isso não é um listener por card?"** Não em DOM real. Handlers em JSX são delegados: desde o React 17, *"React will no longer attach event handlers at the `document` level. Instead, it will attach them to the root DOM container into which your React tree is rendered"* ([React v17 RC — Changes to Event Delegation](https://legacy.reactjs.org/blog/2020/08/10/react-v17-rc.html)). 13 `onPointerMove` em JSX = **1** listener nativo no container raiz.

**Pegadinha do `useSpring`:** `useSpring(motionValue, opções)` cria um valor derivado que só roda o loop enquanto está longe do alvo. Com 13 cards, 12 estão parados em 0 e não custam nada. O que custa é `useSpring` com `stiffness` baixo: a mola fica viva por segundos depois do `pointerleave`. Com `stiffness: 320 / damping: 34` ela assenta em ~250 ms.

**Pegadinha do `useMotionTemplate`:** ele produz uma **string**. A Motion escreve `style.transform = "perspective(1200px) rotateX(...)"`. Isso ainda é compositor (é `transform`), mas você perde as otimizações de valor independente da Motion — não dá para animar `transform` por template e `x`/`scale` por prop ao mesmo tempo sem conflito. Se você quiser combinar tilt com `whileTap={{ scale: .985 }}`, use as props separadas (`rotateX`, `rotateY`, `transformPerspective`) em vez do template:

```tsx
<motion.div style={{ rotateX, rotateY, transformPerspective: 1200 }} whileTap={{ scale: 0.985 }} />
```

`transformPerspective` da Motion emite `perspective()` **dentro** do transform do próprio elemento — exatamente o comportamento que queremos. **É a forma preferida** e é a que uso no card final.

### 1.5 Como não deformar o texto

O borrão de texto sob rotação 3D é real e tem causa concreta: o navegador **rasteriza a camada uma vez e depois aplica a matriz na GPU**. O texto foi desenhado para o plano e está sendo esticado. Além disso, sob transform o antialiasing de subpixel (LCD) é trocado por escala de cinza.

Mitigações, em ordem de eficácia:

1. **Ângulo pequeno.** A ±4° o erro de amostragem é sub-pixel na maior parte do card. A ±15° a linha de 12 px do `.lab` (mono, tracking 0.15em) vira mingau. **Esta é 80% da solução.**
2. **Não escale o texto.** `scale` sobre texto rasterizado é o pior caso. Se quiser feedback de toque, escale o **card**, não o conteúdo, e volte ao repouso rápido.
3. **Nada de `translateZ` no texto.** Levantar o texto em Z o aproxima do olho = ampliação = re-amostragem da mesma rasterização.
4. **`will-change: transform` só durante o hover.** Enquanto ativo, a camada fica rasterizada uma vez; ao sair, o navegador re-rasteriza no plano e o texto volta ao nítido. Deixar `will-change` permanente **congela** o texto no estado borrado (ver seção 4).
5. **Evite `filter` no card.** Além de forçar `flat`, `filter` cria camada e piora o remapeamento.
6. **Não use `backface-visibility: hidden` como "correção mágica".** Ele existe para esconder o verso em rotações > 90°; a ±4° não faz nada e só adiciona uma camada.

Referência do React Bits: eles põem `[transform:translateZ(0)]` e `will-change-transform` **só na `<img>`**, e o texto de tooltip fica **fora** do elemento que gira ([TiltedCard.tsx](https://github.com/DavidHDev/react-bits/blob/main/src/ts-tailwind/Components/TiltedCard/TiltedCard.tsx)). É a mesma conclusão por outro caminho: quem gira não deve conter tipografia fina.

---

## 2. SPOTLIGHT / GLOW QUE SEGUE O MOUSE

Existem três técnicas, não duas. As duas do brief mais a que este projeto já usa — que é a melhor.

### (a) `radial-gradient` posicionado por `--x/--y`

O padrão da indústria. Cruip, Magic UI, React Bits, Aceternity, ibelick — todos fazem alguma variação disso.

```css
.card__brilho {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 300ms var(--ease-out-cut);
  background: radial-gradient(
    240px circle at var(--mx, 50%) var(--my, 50%),
    color-mix(in srgb, var(--tubo-cor) 22%, transparent),
    transparent 70%
  );
}
.card:hover .card__brilho { opacity: 1; }
```

**Custo:** cada frame muda `background-image` → **repaint da camada inteira**, do tamanho do card. Não vai para o compositor. Em desktop com 1 card ativo é irrelevante. Em 13 simultâneos num Android médio, é queda de frame.

**A versão framer-motion é exatamente igual em custo.** O `MagicCard` do Magic UI usa `useMotionTemplate` para montar a string do `background` a cada frame ([magic-card.tsx](https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/magic-card.tsx)):

```tsx
style={{
  background: useMotionTemplate`
    linear-gradient(var(--color-background) 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom}, ${gradientTo}, var(--color-border) 100%) border-box
  `,
}}
```

Isso evita re-render do React, mas **não evita o repaint** — o pixel pipeline não sabe nem se importa se a string veio de JS, de CSS var ou de um motion value. Ou seja: **`useMotionTemplate` para spotlight não compra performance, compra sintaxe.** Se o objetivo é performance, a CSS var com um listener delegado é mais barata (menos JS carregado, menos objeto por card).

O `SpotlightCard` do React Bits ([fonte](https://github.com/DavidHDev/react-bits/blob/main/src/ts-tailwind/Components/SpotlightCard/SpotlightCard.tsx)) é a variante a **não** copiar: usa `useState` para posição e opacidade, ou seja, **re-render do React a cada pixel de mouse**, 13 vezes na grade. É o anti-padrão exato que o brief proíbe.

### (b) `mask-image` com gradiente radial revelando uma camada colorida

Duas camadas idênticas empilhadas; a de cima é colorida e está quase toda mascarada. A máscara é um disco no cursor.

O Aceternity `CardSpotlight` faz isso ([card-spotlight.tsx](https://ui.aceternity.com/components/card-spotlight)):

```tsx
style={{
  backgroundColor: color,
  maskImage: useMotionTemplate`
    radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, white, transparent 80%)
  `,
}}
```

E o artigo *How To Build a Glowing Hover Effect that Follows the Pointer* (Amit Sheen, Frontend Masters/Master.dev) clona o HTML e revela o clone colorido ([master.dev/blog/glowing-hover-effect](https://master.dev/blog/glowing-hover-effect/)):

```css
.overlay {
  -webkit-mask: radial-gradient(25rem 25rem at var(--x) var(--y), #000 1%, transparent 50%);
          mask: radial-gradient(25rem 25rem at var(--x) var(--y), #000 1%, transparent 50%);
  transition: 400ms mask ease;
}
```

```js
const applyOverlayMask = (e) => {
  const x = e.pageX - main.offsetLeft
  const y = e.pageY - main.offsetTop
  overlayEl.style = `--opacity: 1; --x: ${x}px; --y:${y}px;`
}
document.body.addEventListener('pointermove', applyOverlayMask)
```

**Custo:** igual ou pior que (a) — a máscara é reavaliada e a camada é recomposta por frame. Vantagem: o resultado é **revelar conteúdo real** (uma segunda cópia do card com cor), não somar um borrão por cima. É por isso que fica bonito de verdade: o brilho tem estrutura.

**Suporte:** `mask-image` é Baseline desde dezembro 2023; Safari sem prefixo a partir de 15.4 (macOS e iOS). Antes disso, só `-webkit-mask-image`. Escreva as duas linhas — o projeto já faz isso no `.luz`.

### (c) A que este projeto já usa — e que é melhor que as duas

O `.luz` de `app/globals.css` (linha 350) é um **disco de tamanho fixo com máscara estática**, movido só por `translate3d(var(--mx), var(--my), 0)`.

```css
.luz {
  position: absolute; top: 0; left: 0;
  width: 15rem; aspect-ratio: 1;
  margin: -7.5rem 0 0 -7.5rem;              /* centraliza no ponto */
  background-image: radial-gradient(circle at center, var(--tubo-cor) 0 1.1px, transparent 1.5px);
  background-size: 7px 7px;                 /* matriz de LEDs, não borrão */
  -webkit-mask-image: radial-gradient(closest-side, #000 0%, rgba(0,0,0,.55) 42%, transparent 76%);
          mask-image: radial-gradient(closest-side, #000 0%, rgba(0,0,0,.55) 42%, transparent 76%);
  transform: translate3d(var(--mx, 50%), var(--my, 35%), 0);
}
```

**Por que é superior:** o gradiente e a máscara são **estáticos em relação ao elemento**. Eles são rasterizados **uma vez** numa camada de composição; o que muda por frame é apenas a matriz de translação da camada. Isso é **compositor puro** — mesma categoria de `transform` e `opacity`, sem paint. A técnica (a) repinta 240×240 px por frame; esta não repinta nada.

Custo de entrada: uma camada extra por card enquanto visível. Com `opacity: 0` fora do hover e `pointer-events: none`, o navegador descarta cedo.

**Recomendação: manter (c).** Ela já está no projeto, é a mais barata, e o *dot matrix* (pontos discretos de 1,1 px em grade de 7 px) é a única versão desse efeito que não parece "glow de IA" — parece uma matriz de LED sob um difusor, que é literalmente o produto que a empresa vende.

### 2.1 UM listener no grid para 13 cards

O truque tem três partes: `closest()` para achar o card, `requestAnimationFrame` para coalescer, e `passive: true` para não bloquear o scroll.

```tsx
// components/PonteiroNaGrade.tsx
'use client'

import { useEffect } from 'react'

/**
 * UM listener delegado na grade inteira. Escreve, no card sob o ponteiro:
 *   --mx / --my   posição do ponteiro em px, relativa ao card
 *   --angulo      ângulo do centro do card até o ponteiro (para o arco da borda)
 *   --brilho      0 | 1
 *
 * Custo: 1 listener nativo, 1 rAF pendente no máximo, 0 re-render React.
 * ~0,9 KB. Não roda em toque nem em reduced-motion.
 */
export function PonteiroNaGrade({ grade = '[data-grade]' }: { grade?: string }) {
  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const raiz = document.querySelector<HTMLElement>(grade)
    if (!raiz) return

    let rafId = 0
    let ultimo: PointerEvent | null = null
    let anterior: HTMLElement | null = null
    // guarda o ângulo DESENROLADO por card, sem poluir o DOM nem vazar memória
    const angulos = new WeakMap<HTMLElement, number>()

    const aplica = () => {
      rafId = 0
      const e = ultimo
      if (!e) return

      const card = (e.target as Element).closest<HTMLElement>('[data-card]')

      // saiu de um card e entrou em outro (ou no vão da grade): apaga o antigo.
      // PEGADINHA: removeProperty, NUNCA setProperty('--brilho','0'). Estilo
      // inline vence qualquer regra do stylesheet, então um '0' inline
      // deixado para trás mataria o `.card:focus-within { --brilho: 1 }`
      // e o card ficaria apagado no Tab. Removendo, o CSS volta a mandar.
      if (anterior && anterior !== card) anterior.style.removeProperty('--brilho')
      anterior = card
      if (!card) return

      const r = card.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top

      card.style.setProperty('--mx', `${x}px`)
      card.style.setProperty('--my', `${y}px`)
      card.style.setProperty('--brilho', '1')

      // ---- ângulo do arco da borda ----
      // atan2 dá -180..180; +90 alinha 0deg do conic-gradient (que aponta pra cima)
      const alvo = (Math.atan2(y - r.height / 2, x - r.width / 2) * 180) / Math.PI + 90
      const atual = angulos.get(card) ?? alvo
      // PEGADINHA: sem desenrolar, ir de 359deg a 1deg faz o arco varrer 358deg
      // para trás. O delta tem que ser trazido para -180..180.
      const delta = ((((alvo - atual + 180) % 360) + 360) % 360) - 180
      const novo = atual + delta
      angulos.set(card, novo)
      card.style.setProperty('--angulo', `${novo}deg`)
    }

    const onMove = (ev: Event) => {
      ultimo = ev as PointerEvent
      if (!rafId) rafId = requestAnimationFrame(aplica)
    }
    const onLeave = () => {
      anterior?.style.removeProperty('--brilho')
      anterior = null
    }

    raiz.addEventListener('pointermove', onMove, { passive: true })
    raiz.addEventListener('pointerleave', onLeave, { passive: true })
    return () => {
      raiz.removeEventListener('pointermove', onMove)
      raiz.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(rafId)
    }
  }, [grade])

  return null
}
```

**A pegadinha do ângulo é real e está errada no Aceternity.** O `GlowingEffect` deles ([glowing-effect.tsx](https://ui.aceternity.com/components/glowing-effect)) faz:

```js
const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180
```

Com `targetAngle - currentAngle = -350`, isso dá `-350` em vez de `+10`, porque `%` em JavaScript preserva o sinal do dividendo. O arco dá uma volta inteira ao contrário. A forma correta é o duplo módulo: `((((a - b + 180) % 360) + 360) % 360) - 180`.

**Por que delegar, e não 13 listeners:** 13 listeners de `pointermove` = 13 closures vivas, 13 chamadas por evento, e cada uma faz `getBoundingClientRect()` = 13 leituras de layout por frame no pior caso. O delegado faz 1. A Cruip usa exatamente essa arquitetura ("It creates a `Spotlight` instance for each element with the `data-spotlight` attribute, which is supposed to be the container holding the cards" — [cruip.com](https://cruip.com/how-to-create-a-spotlight-card-hover-effect-with-tailwind-css/)), e o Amit Sheen delega direto no `body` ([master.dev](https://master.dev/blog/css-spotlight-effect/)):

```js
document.body.addEventListener('mousemove', (e) => {
  document.body.style.setProperty('--clientX', e.clientX + 'px')
  document.body.style.setProperty('--clientY', e.clientY + 'px')
})
```

**Prova de que a técnica é de produção:** o clerk.com serve, hoje, HTML com `style="--x:-76.66%;--y:-264.45%"` e classes `md:translate-y-(--y)` — sintaxe de custom property do Tailwind v4. É a mesma ideia.

---

## 3. BORDA QUE BRILHA / CONIC GRADIENT

### 3.1 A borda em gradiente sem pseudo-elemento

Duas camadas no mesmo `background`: a superfície em `padding-box`, o gradiente em `border-box`. A de cima cobre o miolo; a de baixo só aparece no 1 px da borda. **O projeto já faz isso** no `.card` e no `.leque-card`. É a melhor técnica: zero DOM, zero pseudo-elemento, e respeita `border-radius` (ao contrário de `border-image`).

```css
.aro {
  border: 1px solid transparent;
  background:
    linear-gradient(var(--color-off), var(--color-off)) padding-box,
    conic-gradient(from var(--angulo), var(--tubo-cor), transparent 25%) border-box;
}
```

Equivalente com `background-origin`/`background-clip`, que é como o web.dev escreve ([web.dev/articles/css-border-animations](https://web.dev/articles/css-border-animations)):

```css
background-origin: border-box;
background-clip: padding-box, border-box;
```

### 3.2 `@property --angle` + `conic-gradient` + `animation`

Sem registro, uma custom property é uma string opaca: o navegador não sabe que `45deg` é um ângulo e **não interpola**. `@property` dá tipo, e com tipo vem transição e keyframe.

```css
@property --angulo {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes girar { to { --angulo: 360deg; } }

.aro-girando {
  border: 1px solid transparent;
  border-radius: var(--radius-card);
  background:
    linear-gradient(var(--color-off), var(--color-off)) padding-box,
    conic-gradient(from var(--angulo),
      transparent 0deg,
      var(--tubo-cor) 40deg,
      transparent 80deg,
      transparent 360deg) border-box;
  animation: girar 4s linear infinite;
}
```

**Suporte (não invento — é o número do web.dev):** `@property` é **Baseline Newly available desde 9 de julho de 2024**; Chrome 85+, Edge 85+, **Firefox 128+**, **Safari 16.4+** ([web.dev/articles/css-border-animations](https://web.dev/articles/css-border-animations); [web.dev/blog/at-property-baseline](https://web.dev/blog/at-property-baseline), Una Kravets, 12/07/2024). Atenção: muito texto na internet ainda diz "só Chromium" — é informação de 2023, anterior ao Firefox 128.

Requisitos do `@property` (MDN): `syntax` e `inherits` são **obrigatórios** — faltando qualquer um dos dois a regra inteira é inválida e ignorada. `initial-value` é obrigatório para qualquer `syntax` que não seja `*`, e precisa ser **computacionalmente independente** (`10px` vale, `3em` não). Este projeto já usa `@property` duas vezes (`--tubo-cor`, `--led-varredura`), então o compromisso já está tomado.

**Pegadinha grande, e é de produto, não de suporte:** `animation: girar 4s linear infinite` repinta o `conic-gradient` **na main thread, para sempre**. O próprio comentário do `globals.css` (linha 161) já cravou a regra da casa: *"Nunca infinite: a tecnica repinta na main thread, e loop eterno custa bateria com o telefone parado na mesa."* Multiplique por 13 cards. **Não use a versão girando neste projeto.**

### 3.3 A alternativa boa: arco que APONTA para o cursor (`mask-composite`)

Em vez de girar sozinho, o arco cônico segue o ponteiro. Sem loop, sem bateria, e é a leitura correta: a luz está do lado de onde vem o cursor. Técnica do jh3y: *"You can use mask-composite and some JavaScript to create this pointer proximity following glow border"* ([@jh3yy, 12/12/2023](https://x.com/jh3yy/status/1734369933558010226)).

```css
@property --angulo  { syntax: '<angle>';   inherits: false; initial-value: 180deg; }
@property --abertura{ syntax: '<angle>';   inherits: false; initial-value: 55deg;  }

.card__arco {
  position: absolute;
  inset: -1px;                       /* cobre exatamente a borda de 1px do card */
  border-radius: inherit;
  padding: 1px;                      /* espessura do arco */
  pointer-events: none;

  background: conic-gradient(
    from calc(var(--angulo) - var(--abertura)),
    transparent 0deg,
    var(--tubo-cor) var(--abertura),
    transparent calc(var(--abertura) * 2)
  );

  /* recorta o miolo: sobra só o anel de 1px.
     `exclude` = o que está no content-box é subtraído do border-box. */
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;        /* keyword antiga do WebKit */
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;    /* keyword padrão */

  opacity: var(--brilho, 0);
  /* o --angulo transiciona porque foi REGISTRADO. Sem @property, snap. */
  transition: opacity 260ms var(--ease-out-cut), --angulo 320ms var(--ease-out-cut);
}
```

**Suporte de `mask-composite`:** Baseline **Widely available desde dezembro de 2023** ([MDN `mask-composite`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite)). Valores padrão: `add` (default), `subtract`, `intersect`, `exclude`. O WebKit antigo usa outras palavras (`xor`, `source-out`) — por isso as duas declarações acima.

O Aceternity `GlowingEffect` usa a variante com `intersect` e `mask-clip`, que é a formulação original do jh3y:

```
after:[mask-clip:padding-box,border-box]
after:[mask-composite:intersect]
after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]
```

As duas funcionam. A com `padding-box`/`content-box` + `exclude` é mais fácil de ler e não depende de `mask-clip`.

### 3.4 Comparação com `::before` rotacionado + `overflow: hidden`

A técnica clássica: um pseudo-elemento **maior que o card** com um `linear-gradient` cônico falso, girando por `transform: rotate()`, e o card com `overflow: hidden` cortando as pontas.

```css
.card { position: relative; overflow: hidden; isolation: isolate; }
.card::before {
  content: '';
  position: absolute;
  inset: -150%;                        /* precisa ser maior que a diagonal */
  background: conic-gradient(var(--tubo-cor), transparent 30%);
  animation: gira 5s linear infinite;
  z-index: -1;
}
@keyframes gira { to { transform: rotate(1turn); } }
```

| | `@property --angle` + conic | `::before` rotacionado |
|---|---|---|
| Suporte | Baseline jul/2024 (Ch 85+, FF 128+, Sa 16.4+) | Universal há uma década |
| O que anima | uma custom property → **repaint do gradiente por frame** | `transform` → **compositor**, sem repaint |
| DOM | zero elementos | 1 pseudo-elemento por card |
| Recorte | nenhum necessário | exige `overflow: hidden` |
| Efeito colateral | nenhum estrutural | `overflow: hidden` **força `transform-style: flat`** → mata o tilt em Z |
| Raio | segue `border-radius` naturalmente | segue, mas só porque o pai recorta |
| Controlável por ponteiro | trivial (um `--angulo`) | difícil (teria que setar `rotate` por JS = mesma coisa) |

**Veredito:** o `::before` rotacionado é mais barato **por frame** (compositor vs paint), e é a escolha certa se você quiser um loop eterno. Como aqui **não queremos loop eterno** — queremos um arco que aponta para o cursor, um card por vez —, o repaint acontece só enquanto há hover num único card, e a versão `@property` ganha por não exigir `overflow: hidden` (que quebraria qualquer tentativa futura de 3D) e por não adicionar 13 pseudo-elementos gigantes de 400% de área.

**Terceira via, honesta:** `border-image: conic-gradient(...) 1` funciona desde Chrome 16 / Firefox 15 / Safari 6 e é o que o Adam Argyle mostra em [web.dev/articles/conic-gradient-border](https://web.dev/articles/conic-gradient-border). **Mas o próprio artigo avisa:** *"does not follow the border-radius; it will always remain rectangular"*. Com `--radius-card: 14px`, está fora.

---

## 4. CUSTO DE PERFORMANCE

### 4.1 Quem vai para o compositor e quem repinta

Do guia oficial ([web.dev/articles/animations-guide](https://web.dev/articles/animations-guide)): *"Before using any CSS property for animation (other than `transform` and `opacity`), determine the property's impact on the rendering pipeline."*

| Propriedade | Estágio | Veredito |
|---|---|---|
| `transform` (translate/rotate/scale) | **composite** | ✅ o tilt e o `.luz` vivem aqui |
| `opacity` | **composite** | ✅ é assim que se acende e apaga qualquer coisa |
| `filter` | composite, **mas com custo de GPU real** | ⚠️ `blur(60px)` num orb de 420 px (o modo `orb` do MagicCard) é caro em GPU integrada |
| `background-image` / posição de `radial-gradient` | **paint** | ⚠️ o spotlight clássico. 1 card = ok. 13 = não. |
| `mask-image` / `mask-position` | **paint** (+ recomposição) | ⚠️ idem |
| custom property em gradiente (`--angulo`) | **paint** | ⚠️ idem |
| `box-shadow` | **paint**, com blur | ❌ o mais caro da lista |
| `width` / `height` / `top` / `left` / `padding` | **layout** → paint → composite | ❌ nunca |

### 4.2 `box-shadow` — por que é caro e o que fazer

`box-shadow` com blur exige, a cada frame, gerar um retângulo desfocado (convolução gaussiana aproximada) **em área maior que o elemento**, e recompor. O `.card:hover` de hoje transiciona `box-shadow: 0 18px 40px -24px ...` — 40 px de blur, 13 cards, e o repaint cobre o card + 40 px de folga em cada direção.

A alternativa canônica (web.dev): **pré-renderize a sombra num pseudo-elemento e anime só a `opacity`.**

```css
.card { position: relative; }

/* a sombra do estado HOVER, desenhada UMA vez, invisível */
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  box-shadow: 0 18px 40px -24px color-mix(in srgb, var(--tubo-cor) 55%, transparent);
  opacity: 0;                                   /* <- só isto anima */
  transition: opacity 260ms var(--ease-out-cut);
}
.card:hover::before,
.card:focus-within::before { opacity: 1; }
```

O blur é rasterizado uma vez, vira textura, e o resto é composite. Mesmo pixel, custo de `opacity`.

### 4.3 O bug do `transition: background`

`.card` (globals.css linha 299) declara:

```css
transition: transform 320ms var(--ease-tubo),
            box-shadow 260ms var(--ease-out-cut),
            background 260ms var(--ease-out-cut);
```

**`background 260ms` não faz nada.** MDN, `background-image`: **Animation type: `discrete`.** Gradientes não interpolam em CSS. Hoje o aro de dois tons **troca de cor num único frame** enquanto a sombra e o transform deslizam por 260–320 ms — é exatamente essa dessincronia que faz um card "parecer barato" sem que ninguém saiba explicar por quê.

**Correção:** empilhe a versão hover como uma camada separada e anime a `opacity` dela. Vale para o aro e para a sombra, com o mesmo pseudo-elemento.

### 4.4 `will-change` — quando ajuda e quando piora

MDN é direto:

> *"Don't apply `will-change` to too many elements: The browser already tries as hard as it can to optimize everything. […] Overusing the property can cause the page to slow down instead of improving it's performance."*

> *"adding `will-change` directly to a stylesheet implies that the targeted elements are always a few moments away from changing and the browser will keep the optimizations for a much longer time than it would have otherwise."*

> *"`will-change` is intended to be used as a last resort to try to deal with existing performance problems. It should not be used to anticipate performance problems."*

([MDN `will-change`](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change))

Aplicado aqui:

- **Piora:** `will-change: transform` fixo em 13 cards = 13 camadas de composição permanentes na GPU. Em Android de entrada isso é memória de vídeo real, e o texto fica congelado na rasterização de baixa qualidade (seção 1.5). O `.leque-card` tem `will-change: transform` permanente — justificável ali porque são 6 cards que giram o tempo todo; **não replique nos 13**.
- **Ajuda:** aplicar só durante o gesto.

```css
@media (hover: hover) and (pointer: fine) {
  .card-tilt:hover { will-change: transform; }
}
```

Um card por vez, promovido só enquanto o ponteiro está nele, e liberado ao sair (aí o navegador re-rasteriza e o texto volta ao nítido).

O comentário do `LuzCursor.tsx` já tinha a intuição certa: *"Sem will-change: translate3d ja promove a camada, e will-change em N elementos criaria N camadas permanentes na GPU."* Correto — `translate3d`/`translateZ(0)` já força camada. Está certo como está.

### 4.5 O que acontece com 13 cards animando ao mesmo tempo

Cenário realista: **não acontece.** Com ponteiro há **um** card sob o cursor; com toque não há hover nenhum. O único jeito de ter 13 animando é uma animação de entrada em cascata — e a de entrada já é `opacity` + `y` com `viewport={{ once: true }}`, ou seja, compositor e uma vez só.

Se acontecesse (13 spotlights de `radial-gradient` a 60 fps):

- **13 repaints por frame**, cada um do tamanho do card. Num grid de 3 colunas em 1440 px, ~400×300 px por card = ~1,5 M px repintados por frame. Um desktop aguenta; um Snapdragon de linha média cai para 20–30 fps.
- **13 camadas de composição** se cada uma tiver `will-change` ou `translate3d`. Memória de vídeo: largura × altura × 4 bytes × 13.
- **Layout thrash** se cada card chamar `getBoundingClientRect()` no seu próprio handler: 13 leituras forçadas de layout intercaladas com 13 escritas de estilo, por frame. É o pior padrão possível e é o motivo #1 para delegar num único listener com `requestAnimationFrame`.

Três defesas, todas já embutidas na arquitetura recomendada:

1. **Um listener + um rAF** — coalesce N eventos de ponteiro num frame e agrupa as leituras antes das escritas.
2. **`--brilho: 0` no card anterior** — garante literalmente que só um card por vez tem camada acesa.
3. **`@media (hover: hover) and (pointer: fine)`** — no celular a camada não chega a ser pintada.

Sobre o frameloop da Motion: motion values escrevem o DOM na fase de *render* do rAF interno da biblioteca, separada da fase de *read*. Por isso `getBoundingClientRect()` dentro de um handler de ponteiro que só chama `.set()` **não** causa thrash — a escrita não acontece ali. Ainda assim, o `useTilt3D` acima mede na entrada e reusa, o que é uma leitura por hover em vez de uma por frame.

---

## 5. ACESSIBILIDADE E DEGRADAÇÃO

### 5.1 `prefers-reduced-motion` — o card tem que ser bonito PARADO

Este é o teste real do design. Se o card só fica bom com o mouse em cima, ele não é um bom card — é um truque.

O que sobrevive parado, e deve carregar o peso visual sozinho:

- o **aro de dois tons** (claro em cima, filete no meio, sombra na base) — sugere um objeto iluminado de cima, sem animar nada;
- o **bisel de 1 px** (`inset 0 1px 0` claro no topo, `inset 0 -1px 0` escuro na base);
- o **tubo de pixels** em `--tubo-cor` a 26–28% de opacidade;
- o **código de rider em âmbar** — o dado, que é o que dá ar técnico;
- a **hierarquia tipográfica** (mono 12 px tracking largo / sans 24 px bold / sans 14 px `--branco-2`).

Nenhum desses depende de ponteiro.

O bloco de reduced-motion do projeto já está bem construído (globals.css 666–685) e o comentário está certo: *"fallback ESTATICO REAL, nao 'mais lento'"*. O que precisa entrar a mais:

```css
@media (prefers-reduced-motion: reduce) {
  /* tilt: nem começa. Também é desligado no JS, pois .set() num motion
     value não passa por MotionConfig reducedMotion — é escrita direta. */
  .card-tilt { transform: none !important; }

  /* o arco não segue nem transiciona; fica num ângulo fixo e discreto */
  .card__arco { transition: none; --angulo: 200deg; opacity: .32; }

  .luz { display: none; }   /* já existe */
}
```

**Pegadinha específica da Motion:** `<MotionConfig reducedMotion="user">` desliga animações de transform, mas **não** desliga `motionValue.set()`, que é escrita direta e não é uma animação. O tilt tem que ser desligado à mão com `useReducedMotion()`. O projeto já tropeçou nisso antes — o comentário do `[data-pixel]` (globals.css 680) documenta o caso análogo com `opacity`.

### 5.2 Foco por teclado precisa do MESMO destaque

Um card que só existe no hover é invisível para quem navega por Tab. E como o card inteiro é um `<a>`, `:focus-visible` cai nele.

```css
/* o mesmo estado, dois gatilhos */
.card:hover,
.card:focus-within { /* aro + sombra */ }

.card:hover  .card__arco,
.card:focus-visible .card__arco { --brilho: 1; }

/* no foco não há ponteiro: o arco assume uma posição fixa e legível */
.card:focus-visible .card__arco { --angulo: 180deg; }

/* o contorno do sistema NÃO some — ele é o sinal acessível de verdade.
   O brilho é enfeite; o outline é o requisito. */
:focus-visible { outline: 2px solid var(--color-ambar); outline-offset: 3px; }
```

Três regras que valem sempre:

1. **`:focus-visible`, não `:focus`.** `:focus` acende ao clicar com o mouse e parece bug.
2. **Nunca `outline: none`** trocando por "só o glow". O glow do arco em `--tubo-cor` magenta sobre `#09090B` não tem contraste suficiente para ser o único indicador; o âmbar `#FFA300` tem.
3. **`:focus-within` no card** faz o card inteiro reagir quando qualquer coisa focável dentro dele recebe foco. Já está no CSS atual — mantenha.

O React Bits acerta neste ponto e vale citar: o `SpotlightCard` deles trata `onFocus`/`onBlur` acendendo o spotlight com opacidade 0.6, e trava a posição enquanto focado (`if (!divRef.current || isFocused) return`) para o mouse não roubar o destaque do teclado.

### 5.3 Quando não há ponteiro fino

```css
@media (hover: hover) and (pointer: fine) {
  /* só aqui o tilt, a luz e o arco que segue existem */
}
```

MDN, `@media/hover`: `none` = *"the primary input mechanism cannot hover at all, or hovering is inconvenient (e.g. mobile devices that emulate hovering through long taps)"*; `hover` = *"can conveniently hover"*. Baseline desde dezembro de 2018 ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover)).

**Pegadinha dos híbridos:** `hover`/`pointer` descrevem **apenas o mecanismo primário**. Num notebook com tela sensível ao toque, o navegador reporta `hover: hover` mesmo quando o usuário está usando o dedo. Se isso importar, `any-hover`/`any-pointer` testam *qualquer* mecanismo — mas na prática, para este site, o par `(hover: hover) and (pointer: fine)` é o corte certo: prefere-se um híbrido perdendo o tilt ocasional a um celular pagando por camadas que nunca vai usar.

**Defesa em profundidade, em três camadas:**

1. CSS: `@media (hover: hover) and (pointer: fine)` — a camada nem é pintada.
2. JS: `matchMedia(...).matches` no `useEffect` — o listener nem é registrado.
3. Handler: `if (e.pointerType === 'touch') return` — se um híbrido escapar das duas primeiras, o toque não dispara tilt.

A Motion já faz a camada 3 sozinha para hover: *"These events differ from the browser's native pointer event handling by only firing on devices where hover is truly possible. They explicitly **won't** fire as the result of a touch event."* ([motion.dev/docs/react-hover-animation](https://motion.dev/docs/react-hover-animation)). É o mesmo raciocínio que o `CardServico.tsx` já documenta na linha 33.

E `@media (hover: none)` deve **promover a versões permanentes** o que no desktop era revelado: a `.linha__seta` já faz isso (`@media (hover: none) { .linha__seta { opacity: 1 } }`). Mesma lógica para o card.

---

## 6. NO CELULAR — A CONTRAPARTIDA HONESTA

O tráfego é majoritariamente celular. Isso significa que **a versão de toque é a versão principal**, e o tilt de mouse é a exceção de nicho — não o contrário.

### Opção A — `whileTap`

```tsx
<motion.a whileTap={{ scale: 0.985 }} transition={{ duration: 0.12 }} />
```

- ✅ Zero custo, funciona em 100% dos aparelhos, é a convenção nativa (iOS e Android encolhem o alvo ao pressionar).
- ✅ A Motion filtra `pointerType` corretamente, então não há estado "grudado".
- ❌ Dura 150 ms e acontece **no momento em que o usuário já decidiu clicar**. Não vende nada; só confirma.

### Opção B — Giroscópio (`deviceorientation`)

Como funciona: `window.addEventListener('deviceorientation', e => …)` com `alpha` (0–360, eixo z), `beta` (−180–180, frente-trás) e `gamma` (−90–90, esquerda-direita). Requer **contexto seguro (HTTPS)** ([MDN `deviceorientation`](https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientation_event)).

E o bloqueio: no **iOS 13+**, `DeviceOrientationEvent.requestPermission()` é obrigatório. MDN: *"This method requires **transient activation** (triggered by UI events like button clicks) and must be called in a **secure context (HTTPS)**"*, e lança `NotAllowedError` se chamado sem ativação transiente ([MDN `DeviceOrientationEvent.requestPermission()`](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static)). O status da API é **"Limited availability — not Baseline"**.

```js
// o que seria necessário no iOS — e por que não vamos fazer isso
botao.addEventListener('click', async () => {
  if (typeof DeviceOrientationEvent.requestPermission !== 'function') return
  const p = await DeviceOrientationEvent.requestPermission()   // "granted" | "denied"
  if (p === 'granted') window.addEventListener('deviceorientation', aoInclinar)
})
```

**Descartado, e com convicção.** Motivos, em ordem:

1. **Exige um botão explícito antes.** A pessoa chega do link na bio do Instagram e a primeira coisa que o site faz é pedir acesso aos sensores de movimento do telefone dela para que um card balance. Isso não parece "profissional"; parece suspeito. Quem quer contratar iluminação para o aniversário da filha vai fechar a aba.
2. **A taxa de "denied" mata o efeito para a maioria** — e você fica com um card que ficou pior do que se nunca tivesse tentado, mais o custo do botão descartado.
3. **Briga com o scroll.** O usuário está rolando, o telefone está inclinando o tempo todo, e 13 cards ficam tremendo. É náusea, não elegância.
4. **`prefers-reduced-motion` existe justamente por isso**, e movimento vestibular ligado à inclinação do aparelho é o gatilho clássico.
5. **Bateria.** Um listener de orientação a ~60 Hz mantém o sensor e a main thread acordados durante toda a sessão.

### Opção C — IntersectionObserver marcando o card central ✅ **RECOMENDADA**

**No desktop, o ponteiro escolhe. No celular, o scroll escolhe.** É a tradução honesta do gesto: em ambos os casos, "o card que você está olhando é o card que acende". E é o modelo mental que o site inteiro já defende — uma mesa de luz onde um refletor está aceso por vez.

```tsx
// components/CardCentralAceso.tsx
'use client'

import { useEffect } from 'react'

/**
 * No toque, o card que cruza a faixa central da tela recebe --brilho: 1.
 * É a contrapartida do hover. Um observer para os 13 cards.
 *
 * rootMargin -45% em cima e embaixo transforma a raiz numa faixa de 10%
 * da altura, no meio da tela. Só um card ocupa essa faixa por vez num
 * layout de coluna única — que é o layout de celular.
 */
export function CardCentralAceso({ seletor = '[data-card]' }: { seletor?: string }) {
  useEffect(() => {
    // se existe ponteiro fino, quem manda é o hover — não duplica estado
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) return
    // com movimento reduzido, todos ficam num repouso estático agradável
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cards = Array.from(document.querySelectorAll<HTMLElement>(seletor))
    if (!cards.length) return

    const obs = new IntersectionObserver(
      (entradas) => {
        for (const en of entradas) {
          const el = en.target as HTMLElement
          // acende com inline; apaga REMOVENDO, para não sobrescrever
          // `.card:focus-within { --brilho: 1 }` com um '0' inline.
          if (en.isIntersecting) el.style.setProperty('--brilho', '1')
          else el.style.removeProperty('--brilho')
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    cards.forEach((c) => obs.observe(c))
    return () => obs.disconnect()
  }, [seletor])

  return null
}
```

No CSS, o estado de toque usa uma posição de luz **fixa** (nada de seguir dedo) e um ângulo de arco **fixo**, então nada repinta por frame — só `opacity` transiciona:

```css
/* posição de repouso da luz: canto superior esquerdo, de onde nasce o tubo */
.card { --mx: 18%; --my: 34%; --angulo: 200deg; }

@media (hover: none) {
  .luz { display: block; opacity: calc(var(--brilho, 0) * .5); }
  .card__arco { opacity: calc(var(--brilho, 0) * .9); }
}
```

**Por que esta é a resposta e não as outras:**

- **Custo:** um `IntersectionObserver`, callbacks fora da main thread crítica, ~0,4 KB. Nenhuma leitura de layout, nenhum listener de scroll, nada por frame. Comparado ao giroscópio, é ordens de grandeza mais barato.
- **Zero permissão, zero prompt, zero fricção.** Funciona no primeiro segundo, para todo mundo, inclusive no in-app browser do Instagram, onde APIs de sensor são as primeiras a serem podadas.
- **Guia o olho.** No celular os 13 serviços viram uma coluna longa. Acender o do centro é *wayfinding*: diz onde você está na lista. O giroscópio não diz nada.
- **Combina com `whileTap`.** As duas não competem: o IO dá o estado ambiente, o `whileTap` dá a confirmação tátil. Use as duas.
- **Degrada sozinha.** Sem JS, sem observer, sem reduced-motion: o card fica no repouso, que já é bonito.

**Uma ressalva honesta:** em grade de 2 colunas (tablet, 640–1023 px), dois cards cruzam a faixa juntos e os dois acendem. Duas saídas: (a) aceitar — visualmente lê como "esta linha está ativa", o que também funciona; (b) no callback, escolher entre os intersectantes o de menor `Math.abs(centroDoCard - centroDaViewport)` e apagar o resto. Comece por (a); é menos código e não está errado.

**Upgrade progressivo (opcional, mesma pegada do `.virada`):** onde houver animação guiada por scroll, isto vira CSS puro e o JS some:

```css
@supports ((animation-timeline: view()) and (animation-range: 0% 100%)) {
  @media (hover: none) and (prefers-reduced-motion: no-preference) {
    @keyframes acende-no-centro { 0%, 100% { --brilho: 0 } 45%, 55% { --brilho: 1 } }
    .card {
      animation-name: acende-no-centro;
      animation-duration: 1ms;
      animation-fill-mode: both;
      animation-timeline: view(block);
      animation-range: cover 0% cover 100%;
    }
  }
}
```
(exige `@property --brilho { syntax: '<number>'; inherits: true; initial-value: 0 }`, e só longhands — o atalho `animation` reseta `animation-timeline`, como o próprio `globals.css` já documenta na linha 566.)

---

## 7. REFERÊNCIAS VISUAIS

Critério: sóbrio, caro, sem neon genérico. Todas verificadas ao vivo — as marcas de produção foram conferidas pelo HTML/CSS servido, e os componentes, pelo código-fonte.

**Produção**

1. **Clerk** — https://clerk.com/
   *Por que funciona:* a cor mora no fundo e nos aros; o conteúdo do card permanece neutro e legível. Nunca há um halo colorido em cima de texto.
   *Técnica:* variáveis CSS de ponteiro (`style="--x:…;--y:…"` servido no HTML) consumidas por utilitários Tailwind v4 (`md:translate-y-(--y)`), mais `conic-gradient`, `radial-gradient` e `rotateX` no CSS. É, hoje, a melhor demonstração pública de que a técnica de CSS var é de produção.

2. **Linear** — https://linear.app/
   *Por que funciona:* o card não brilha — a **borda** ganha ~10% de luminância no hover, e só. É o exemplo de que o gesto mínimo lê como caro.
   *Técnica:* borda de 1 px em duas camadas de background (`padding-box`/`border-box`) + `opacity` de uma camada de glow pré-renderizada.

3. **Vercel** — https://vercel.com/
   *Por que funciona:* superfície quase plana, filete de 1 px, tipografia fazendo todo o trabalho. Prova de que dá para ser bonito sem efeito nenhum — a régua contra a qual medir se o efeito está valendo a pena.
   *Técnica:* `radial-gradient` estático de canto + mudança de cor de borda na transição.

4. **Resend** — https://resend.com/
   *Por que funciona:* usa `conic-gradient` com muita parcimônia, em um ou dois elementos por página. O contraste com o resto sóbrio é o que dá valor ao efeito.
   *Técnica:* `conic-gradient` + `radial-gradient` em camadas de fundo.

5. **Raycast** — https://www.raycast.com/
   *Por que funciona:* fundo escuro com luz ambiente difusa, e os cards de conteúdo permanecem escuros e calmos. Exatamente a divisão que a restrição dura deste projeto pede: cor no ambiente, neutro no conteúdo.
   *Técnica:* múltiplos `radial-gradient` de fundo, estáticos.

6. **Nemo Design** — https://nemo.design/
   *Por que funciona:* dark, editorial, tipografia grande, e a luz aparece só como gradiente de ambiente. Nada pisca.
   *Técnica:* pesado em `radial-gradient` de fundo (32 ocorrências no documento servido), sem borda animada.

7. **Rive** — https://rive.app/
   *Por que funciona:* usa 3D de verdade em pouquíssimos lugares e mantém os cards de conteúdo planos. Boa lição de dosagem.
   *Técnica:* `rotateX` em elementos isolados, não na grade.

**Componentes com código aberto (para copiar a mecânica, não o visual)**

8. **Aceternity — Glowing Effect** — https://ui.aceternity.com/components/glowing-effect
   *Por que funciona:* o arco de luz **aponta** para o cursor em vez de girar sozinho. É a diferença entre "reage a mim" e "está ligado na tomada".
   *Técnica:* `mask-composite: intersect` + `mask-clip: padding-box, border-box` + `conic-gradient(from calc(var(--start) * 1deg))`, com `animate()` da Motion suavizando o ângulo. **Copie a técnica, corrija o bug do módulo (seção 2.1) e troque a paleta arco-íris pelo `--tubo-cor`.**

9. **Aceternity — Card Spotlight** — https://ui.aceternity.com/components/card-spotlight
   *Por que funciona:* o spotlight **revela** uma camada que existe embaixo, em vez de somar brilho por cima. Brilho com estrutura.
   *Técnica:* `maskImage: radial-gradient(Npx circle at Xpx Ypx, white, transparent 80%)` via `useMotionTemplate`. (Ignore o `CanvasRevealEffect` — three.js num card de serviço é peso morto.)

10. **Motion Primitives — Tilt** — https://motion-primitives.com/docs/tilt
    *Por que funciona:* é o tilt mais limpo em código aberto: `useMotionValue` → `useSpring` → `useTransform` → `useMotionTemplate`, sem `useState` em lugar nenhum.
    *Técnica:* `perspective(1000px) rotateX() rotateY()` no transform do próprio elemento. **Baixe `rotationFactor` de 15 para 4.**

11. **Magic UI — Magic Card** — https://magicui.design/docs/components/magic-card
    *Por que funciona:* a borda em gradiente e o spotlight interno são a **mesma** montagem de background em duas camadas (`padding-box` + `border-box`), o que garante que nunca desalinhem.
    *Técnica:* `useMotionTemplate` no `background`. Estude o tratamento de saída: eles ouvem `pointerout` no window, `blur` e `visibilitychange` para apagar o brilho quando o mouse sai pela janela — um detalhe que quase todo mundo esquece e que deixa o card "aceso para sempre".

12. **Frontend Masters / Master.dev — Glowing Hover Effect (Amit Sheen)** — https://master.dev/blog/glowing-hover-effect/
    *Por que funciona:* o brilho é uma **cópia colorida do próprio card**, revelada por máscara. O texto dentro do facho fica colorido de verdade, não lavado por um véu.
    *Técnica:* clone do DOM + `mask: radial-gradient(… at var(--x) var(--y) …)` + **um** listener no `body`. É a referência canônica do listener único.

13. **jh3y — Proximity Glow Cards** — https://codepen.io/jh3y/pen/QWYPaax (contexto: [tweet original](https://x.com/jh3yy/status/1734369933558010226))
    *Por que funciona:* a borda responde à **proximidade**, não só ao hover — cards vizinhos acendem parcialmente. Dá a sensação de um campo de luz, não de 13 botões.
    *Técnica:* `mask-composite` + `conic-gradient` + um listener escrevendo custom properties.

---

## O CARD RECOMENDADO

Composição final: **tilt ±4° com mola** (framer-motion, sem re-render) · **luz de matriz de LED** compositor-puro que segue o ponteiro · **arco de borda que aponta para o cursor** · **IntersectionObserver** como contrapartida no toque · **âmbar no CTA e no dado, `--tubo-cor` só no ambiente, e a foto sempre por cima da luz** — magenta nunca chega perto de um rosto.

### CSS — `app/globals.css`

```css
/* ============================================================
   CARD DE SERVIÇO — v2
   Registro das custom properties: sem @property, --angulo e
   --brilho são strings opacas e NÃO transicionam.
   @property é Baseline desde 09/07/2024 (Ch/Ed 85+, FF 128+, Sa 16.4+).
   ============================================================ */
@property --angulo   { syntax: '<angle>';  inherits: false; initial-value: 200deg; }
@property --abertura { syntax: '<angle>';  inherits: false; initial-value: 52deg;  }
@property --brilho   { syntax: '<number>'; inherits: true;  initial-value: 0;      }

@layer components {

  /* ---------- O INVÓLUCRO QUE GIRA ---------------------------
     Existe separado do .card por um motivo estrutural: o .card
     tem overflow:hidden e isolation:isolate, e AMBOS forçam
     transform-style:flat (MDN, grouping property values). Quem
     gira precisa estar livre disso.
     Não tem perspective PROPRIEDADE: a perspectiva entra como
     FUNÇÃO no transform (via transformPerspective da Motion),
     para cada card ter o próprio ponto de fuga. `perspective`
     no pai daria um ponto de fuga só para os 13 e cisalharia
     os das pontas — além de criar containing block para
     position:fixed, o que quebraria a .navbar.
     --------------------------------------------------------- */
  .card-tilt {
    display: block;
    height: 100%;
    /* transform vem por motion value; nada de transition aqui:
       quem amortece é a mola, e as duas juntas brigam. */
  }

  /* promove a camada SÓ durante o gesto. will-change permanente em
     13 cards = 13 camadas na GPU e texto congelado na rasterização
     de baixa qualidade. MDN: "use as a last resort". */
  @media (hover: hover) and (pointer: fine) {
    .card-tilt:hover { will-change: transform; }
  }

  /* ---------- A SUPERFÍCIE ----------------------------------
     Repouso: aro de dois tons + bisel. É este estado que precisa
     ser bonito sozinho — é o que 100% dos visitantes veem, o que
     o teclado vê, e o que reduced-motion vê.
     --------------------------------------------------------- */
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid transparent;
    border-radius: var(--radius-card);
    padding: 1.75rem 1.5rem 1.5rem 2.25rem;
    overflow: hidden;
    isolation: isolate;
    background:
      linear-gradient(180deg,
        color-mix(in srgb, var(--color-branco) 4%, var(--color-off)) 0%,
        var(--color-off) 38%) padding-box,
      linear-gradient(175deg,
        color-mix(in srgb, var(--color-branco) 30%, var(--color-rule)) 0%,
        var(--color-rule) 26%,
        var(--color-rule) 62%,
        color-mix(in srgb, var(--color-void) 62%, var(--color-rule)) 100%) border-box;
    box-shadow:
      inset 0  1px 0 0 color-mix(in srgb, var(--color-branco)  7%, transparent),
      inset 0 -1px 0 0 color-mix(in srgb, var(--color-void)   55%, transparent);
    /* posição de repouso da luz e do arco, usada no toque e no foco */
    --mx: 18%;
    --my: 34%;
  }

  /* CORREÇÃO: `transition: background` era INERTE — background-image
     tem tipo de animação `discrete` (MDN). O aro trocava de cor num
     frame só enquanto o resto deslizava. Agora o estado hover é uma
     CAMADA e o que anima é opacity, que é compositor. */
  .card__hover {
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    pointer-events: none;
    opacity: var(--brilho, 0);
    transition: opacity 300ms var(--ease-out-cut);
    /* a luz que o tubo joga na superfície, nascendo do próprio tubo */
    background: radial-gradient(120% 100% at 0% 50%,
      color-mix(in srgb, var(--tubo-cor) 16%, transparent) 0%, transparent 62%);
    /* sombra colorida PRÉ-RENDERIZADA. box-shadow animado é paint com
       blur por frame; aqui ele é rasterizado uma vez e vira textura. */
    box-shadow: 0 18px 40px -24px color-mix(in srgb, var(--tubo-cor) 55%, transparent);
  }

  /* ---------- O ARCO DA BORDA -------------------------------
     Aponta para o cursor. NÃO gira em loop: loop eterno repinta
     na main thread e queima bateria com o telefone na mesa —
     a mesma regra que já vale para a palavra LED.
     --------------------------------------------------------- */
  .card__arco {
    position: absolute;
    inset: -1px;                 /* cobre exatamente o 1px de borda */
    border-radius: inherit;
    padding: 1px;                /* espessura do arco */
    pointer-events: none;
    z-index: 2;
    background: conic-gradient(
      from calc(var(--angulo) - var(--abertura)),
      transparent 0deg,
      var(--tubo-cor) var(--abertura),
      transparent calc(var(--abertura) * 2));
    /* recorta o miolo e sobra só o anel */
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;         /* keyword antiga do WebKit */
            mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            mask-composite: exclude;     /* keyword padrão, Baseline dez/2023 */
    opacity: calc(var(--brilho, 0) * .9);
    transition: opacity 260ms var(--ease-out-cut),
                --angulo 300ms var(--ease-out-cut);  /* só funciona por causa do @property */
  }

  /* ---------- O FACHO -----------------------------------------
     Disco de tamanho FIXO com máscara ESTÁTICA, movido só por
     translate3d. A textura é rasterizada uma vez e a camada
     viaja: compositor puro, zero repaint por frame. É a única
     variante de spotlight que não repinta.

     z-index 0 e o conteúdo em 1: a luz fica SOB a foto. É assim
     que o magenta nunca toca um rosto — não por disciplina de
     quem escreve o CSS, mas por geometria.
     --------------------------------------------------------- */
  .luz {
    position: absolute;
    top: 0; left: 0;
    width: 15rem; aspect-ratio: 1;
    margin: -7.5rem 0 0 -7.5rem;
    pointer-events: none;
    z-index: 0;
    background-image: radial-gradient(circle at center,
      var(--tubo-cor) 0 1.1px, transparent 1.5px);
    background-size: 7px 7px;            /* matriz de LED, não borrão */
    -webkit-mask-image: radial-gradient(closest-side, #000 0%, rgba(0,0,0,.55) 42%, transparent 76%);
            mask-image: radial-gradient(closest-side, #000 0%, rgba(0,0,0,.55) 42%, transparent 76%);
    mix-blend-mode: screen;
    transform: translate3d(var(--mx), var(--my), 0);
    opacity: 0;
    transition: opacity 260ms var(--ease-out-cut);
  }
  .card > :not(.luz):not(.card__hover) { position: relative; z-index: 1; }

  @media (hover: hover) and (pointer: fine) {
    .card:hover .luz { opacity: .85; }
  }
  /* no toque a luz é ambiente, fixa, acesa pelo IntersectionObserver */
  @media (hover: none) {
    .luz { opacity: calc(var(--brilho, 0) * .5); }
  }

  /* ---------- ESTADOS ---------------------------------------- */
  .card:hover, .card:focus-within { --brilho: 1; }
  /* o teclado recebe o MESMO destaque, com o arco num ângulo fixo */
  .card:focus-visible { --brilho: 1; --angulo: 180deg; }
}

/* ---------- DEGRADAÇÃO ------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .card-tilt   { transform: none !important; }
  .luz         { display: none; }
  .card__arco  { transition: none; --angulo: 200deg; opacity: .3; }
  .card__hover { transition: none; }
}

@media (forced-colors: active) {
  .card__arco, .luz, .card__hover { display: none; }
  .card { border-color: CanvasText; }
}
```

### Componente — `components/CardServico.tsx`

```tsx
'use client'

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Servico } from '@/lib/conteudo'
import { zap } from '@/lib/conteudo'

/* A COR DO AMBIENTE deste card.
   RESTRIÇÃO DURA: magenta e congo são AMBIENTE. Aqui eles só chegam
   ao aro, ao arco e ao facho — que ficam SOB a foto (z-index 0 vs 1).
   Nenhum deles encosta num rosto nem no botão.
   Congo puro sobre #09090B dá 1,23:1 e some; por isso o casamento
   entra como congo puxado para o magenta, ainda ambiente e visível. */
export const corDoTubo = (s: Servico) =>
  s.estado !== 'festa'         ? 'var(--color-branco)'
  : s.ancora === 'casamento'   ? 'color-mix(in oklab, var(--color-congo) 55%, var(--color-magenta))'
  :                              'var(--color-magenta)'

/** Existe ponteiro fino? Lido UMA vez, no cliente.
 *  Precisa de useState porque é decisão de montagem, não de movimento —
 *  não roda no mousemove, roda no mount. output:'export' obriga a
 *  calcular isto depois da hidratação. */
function usePonteiroFino() {
  const [fino, setFino] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(hover: hover) and (pointer: fine)')
    setFino(mq.matches)
    const on = () => setFino(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return fino
}

const GRAUS = 4          // 4°, não 15°. 15° é assinatura de template.
const PERSPECTIVA = 1200 // função dentro do transform: ponto de fuga POR card
const MOLA = { stiffness: 320, damping: 34, mass: 0.6 } as const

export function CardServico({ servico, i, foto }:
  { servico: Servico; i: number; foto?: string }) {

  const cor = corDoTubo(servico)
  const fino = usePonteiroFino()
  const reduzido = useReducedMotion()
  /* PEGADINHA: <MotionConfig reducedMotion="user"> NÃO desliga isto.
     motionValue.set() é escrita direta, não é uma animação — a Motion
     não tem como interceptar. O gate tem que ser à mão. */
  const ativo = fino && !reduzido

  // posição normalizada do ponteiro: -0.5 (esquerda/topo) .. +0.5
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, MOLA)
  const sy = useSpring(py, MOLA)

  // ponteiro EMBAIXO -> topo inclina PARA TRÁS -> rotateX negativo
  const rotateX = useTransform(sy, [-0.5, 0.5], [GRAUS, -GRAUS])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-GRAUS, GRAUS])

  // mede o rect na ENTRADA e reusa: 1 leitura de layout por hover,
  // em vez de 1 por frame. (E a Motion escreve o DOM na fase de
  // render do próprio frameloop, então não há thrash de leitura/escrita.)
  const rect = useRef<DOMRect | null>(null)

  return (
    <motion.div
      className="card-tilt"
      /* rotateX/rotateY/transformPerspective como PROPS, não como
         useMotionTemplate: assim `whileTap: scale` pode coexistir no
         mesmo transform sem uma string sobrescrever a outra. */
      style={ativo ? { rotateX, rotateY, transformPerspective: PERSPECTIVA } : undefined}
      onPointerEnter={(e) => {
        if (!ativo || e.pointerType === 'touch') return
        rect.current = e.currentTarget.getBoundingClientRect()
      }}
      onPointerMove={(e) => {
        if (!ativo || e.pointerType === 'touch') return
        const r = rect.current ?? e.currentTarget.getBoundingClientRect()
        px.set((e.clientX - r.left) / r.width - 0.5)
        py.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onPointerLeave={() => {
        if (!ativo) return
        px.set(0); py.set(0)   // a mola devolve ao repouso
        rect.current = null
      }}
      /* entrada: opacity + y, compositor, uma vez só */
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.a
        data-card
        id={servico.ancora}
        href={zap(`Oi! Quero orçamento de ${servico.nome.toLowerCase()}.`)}
        target="_blank"
        rel="noopener noreferrer"
        data-zap
        className="card group scroll-mt-24"
        style={{ ['--tubo-cor' as string]: cor }}
        /* a contrapartida do hover no toque: confirmação tátil.
           whileHover NUNCA dispara em touch (a Motion filtra pointerType),
           então sem isto a maioria do tráfego não teria retorno nenhum. */
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.12 }}
      >
        {/* camada de estado: aro colorido + sombra pré-renderizada.
            Só a opacity anima. z-index -1, atrás de tudo. */}
        <span className="card__hover" aria-hidden />

        {/* o facho: SOB a foto, sempre. É a geometria que garante que
            o magenta não toque um rosto. */}
        <span className="luz" aria-hidden />

        {/* o arco da borda: aponta para o cursor, não gira sozinho */}
        <span className="card__arco" aria-hidden />

        {foto && (
          /* raio interno = externo − distância até a borda.
             A foto NÃO recebe luz colorida por cima: ela é a coisa
             mais cara do card e tem rosto dentro. */
          <img
            src={foto} width={1033} height={690} loading="lazy" decoding="async"
            alt={`${servico.nome} montado pela Rapa Sound`}
            className="mb-6 aspect-16/10 w-full rounded-[calc(var(--radius-card)-0.75rem)] object-cover"
          />
        )}

        {/* o código de rider é DADO -> âmbar, sempre */}
        <span className="lab text-ambar">{servico.codigo}</span>
        <h3 className="mt-2 text-lg">{servico.nome}</h3>
        <p className="mt-3 flex-1 text-xs leading-relaxed text-branco-2">{servico.desc}</p>

        {/* o CTA é BOTÃO -> âmbar, sempre. Magenta nunca chega aqui. */}
        <span className="lab mt-6 inline-flex items-center gap-2 text-ambar
                         transition-transform duration-300 group-hover:translate-x-1">
          Falar no WhatsApp
          <span aria-hidden>→</span>
        </span>
      </motion.a>
    </motion.div>
  )
}
```

### Montagem na página

```tsx
<section>
  <ul data-grade className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {servicos.map((s, i) => (
      <li key={s.ancora}><CardServico servico={s} i={i} foto={fotos[s.ancora]} /></li>
    ))}
  </ul>

  {/* 1 listener nativo para os 13: --mx/--my/--angulo/--brilho */}
  <PonteiroNaGrade grade="[data-grade]" />

  {/* a contrapartida do hover no celular: 1 observer para os 13 */}
  <CardCentralAceso seletor="[data-card]" />
</section>
```

### Orçamento final

| Item | Custo |
|---|---|
| Listeners nativos de ponteiro, 13 cards | **2** (1 na raiz do React via JSX + 1 delegado na grade) |
| `IntersectionObserver` | **1**, só no toque |
| Re-renders do React por movimento de mouse | **0** |
| Leituras de layout por frame | **0** (medido na entrada, reusado) |
| Propriedades animadas no compositor | `transform` (tilt, facho), `opacity` (aro, sombra, arco) |
| Propriedades que repintam | `--angulo` no `conic-gradient`, **1 card por vez**, só com ponteiro fino |
| Camadas GPU permanentes | **0** (`will-change` só no `:hover`) |
| Loops de animação eternos | **0** |
| JS extra além do framer-motion já instalado | ~1,3 KB (`PonteiroNaGrade` + `CardCentralAceso`) |

### O que deliberadamente ficou de fora, e por quê

- **`translateZ` / camadas explodidas** — exige desmontar `overflow: hidden` + `isolation` do card (que forçam `transform-style: flat`), borra o texto, e é o visual de demo do Aceternity.
- **Conic girando em loop** — repaint eterno na main thread × 13 cards; contradiz a regra que o próprio projeto já escreveu para a palavra LED.
- **Giroscópio** — `requestPermission()` com ativação transiente no iOS 13+ significa pedir acesso a sensores antes de mostrar um efeito. Custo de conversão maior que qualquer ganho estético.
- **`box-shadow` animado** — trocado por pseudo-camada com `opacity`.
- **`useState` no `mousemove`** (o que o React Bits faz) — 13 re-renders por pixel de mouse.
- **three.js / `CanvasRevealEffect`** — o peso de JS foi liberado, mas um WebGL context por card num Android médio continua sendo o fim da página.

---

## FONTES

**Especificação e referência**
- [MDN — `perspective`](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective)
- [MDN — `transform-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style) (lista das *grouping property values* que forçam `flat`)
- [MDN — `@property`](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
- [MDN — `mask-composite`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite) (Baseline widely available desde dez/2023)
- [MDN — `background-image`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-image) (Animation type: **discrete**)
- [MDN — `will-change`](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)
- [MDN — `@media/hover`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover)
- [MDN — `Window: deviceorientation` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientation_event)
- [MDN — `DeviceOrientationEvent.requestPermission()`](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static)

**Artigos**
- [web.dev — Animations guide (compositor, `will-change`, `box-shadow`)](https://web.dev/articles/animations-guide)
- [web.dev — CSS border animations](https://web.dev/articles/css-border-animations) (versões exatas de suporte de `@property`)
- [web.dev — `@property`: next-gen CSS variables now with universal browser support](https://web.dev/blog/at-property-baseline) — Una Kravets, 12/07/2024
- [web.dev — Use conic gradients to create a cool border](https://web.dev/articles/conic-gradient-border) — Adam Argyle (e a limitação do `border-image` com `border-radius`)
- [Josh W. Comeau — Folding the DOM](https://www.joshwcomeau.com/react/folding-the-dom/)
- [Master.dev / Frontend Masters — CSS Spotlight Effect](https://master.dev/blog/css-spotlight-effect/) — Amit Sheen, 26/05/2025
- [Master.dev / Frontend Masters — How To Build a Glowing Hover Effect that Follows the Pointer](https://master.dev/blog/glowing-hover-effect/) — Amit Sheen
- [Cruip — How to Create a Spotlight Card Hover Effect with Tailwind CSS](https://cruip.com/how-to-create-a-spotlight-card-hover-effect-with-tailwind-css/)
- [ibelick — Crafting a modern spotlight effect with React and CSS](https://ibelick.com/blog/create-modern-spotlight-effect-with-react-css)
- [jh3y no X — pointer proximity following glow border com `mask-composite`](https://x.com/jh3yy/status/1734369933558010226)
- [jh3y no X — `@property --angle` + conic border](https://x.com/jh3yy/status/1714711273345065131)

**Código-fonte lido**
- [Aceternity — 3D Card Effect](https://ui.aceternity.com/components/3d-card-effect) (`perspective: 1000px` no wrapper por card, divisor `/25`, `preserve-3d`)
- [Aceternity — Card Spotlight](https://ui.aceternity.com/components/card-spotlight) (`maskImage` via `useMotionTemplate`)
- [Aceternity — Glowing Effect](https://ui.aceternity.com/components/glowing-effect) (`mask-composite: intersect` + desenrolamento de ângulo — **com o bug do módulo**)
- [Aceternity — Evervault Card](https://ui.aceternity.com/components/evervault-card) (máscara radial revelando camada)
- [Magic UI — `magic-card.tsx`](https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/magic-card.tsx) (borda + spotlight na mesma montagem `padding-box`/`border-box`; reset por `pointerout`/`blur`/`visibilitychange`)
- [Motion Primitives — Tilt](https://motion-primitives.com/docs/tilt) e [Spotlight](https://motion-primitives.com/docs/spotlight)
- [React Bits — `SpotlightCard.tsx`](https://github.com/DavidHDev/react-bits/blob/main/src/ts-tailwind/Components/SpotlightCard/SpotlightCard.tsx) (o anti-padrão de `useState`) e [`TiltedCard.tsx`](https://github.com/DavidHDev/react-bits/blob/main/src/ts-tailwind/Components/TiltedCard/TiltedCard.tsx)

**Bibliotecas e plataforma**
- [Motion — Motion values](https://motion.dev/docs/react-motion-value) ("without triggering a React re-render")
- [Motion — Hover animations](https://motion.dev/docs/react-hover-animation) (hover não dispara em toque)
- [React v17 RC — Changes to Event Delegation](https://legacy.reactjs.org/blog/2020/08/10/react-v17-rc.html) (handlers no container raiz)
- [Tailwind CSS v4.0 — New 3D transform utilities](https://tailwindcss.com/blog/tailwindcss-v4) (`rotate-x-*`, `translate-z-*`, `perspective-*`)
- [Tailwind CSS — `perspective`](https://tailwindcss.com/docs/perspective) e [`transform-style`](https://tailwindcss.com/docs/transform-style)

**Referências visuais verificadas ao vivo (04–05/08/2026)**
- https://clerk.com/ · https://linear.app/ · https://vercel.com/ · https://resend.com/ · https://www.raycast.com/ · https://nemo.design/ · https://rive.app/
