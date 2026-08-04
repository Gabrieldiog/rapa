# 08 — CARDS ANIMADOS COM MOTION (framer-motion 12.43)

Pesquisa de 2026-08-04. Método: documentação oficial em `motion.dev` aberta página a
página **e** leitura do código instalado em `node_modules/framer-motion@12.43.0`,
`motion-dom@12.43`, `motion-utils@12.39`. Onde a doc e o código divergem, **o código
manda** e a divergência está anotada. Onde nada confirmou, está escrito
**NÃO CONFIRMADO**.

Contexto: `output: 'export'`, Next 15.5.4 App Router, React 19.1.1, Tailwind 4.1.13.
Teto de peso suspenso pelo cliente — o que não significa que peso deixou de ser custo,
significa que ele deixou de ser veto.

---

## 0. VEREDITO CURTO, ANTES DO RESTO

O repo já resolve em CSS puro (`app/globals.css`) o que 80% dos sites resolvem com
Motion: o reveal (`Reveal.tsx`, IntersectionObserver, ~0,4 KB), o facho no cursor
(`LuzCursor.tsx`, 1 listener delegado, ~480 B), o aro de dois tons, o tubo de pixels,
o `@property --tubo-cor`. **Nada disso deve migrar para Motion.** Migrar seria trocar
1 KB por 35 KB para obter o mesmo pixel.

Motion se justifica em exatamente quatro coisas que CSS não faz:

1. **`layout` / `layoutId`** — FLIP automático entre dois nós diferentes do DOM. CSS não
   tem isso. `view-transition-name` chega perto e não roda em Firefox.
2. **Interrupção com preservação de velocidade** — spring que muda de alvo no meio sem
   pulo. `transition` de CSS reinicia do zero.
3. **Saída de elemento (`exit`)** — CSS não segura um nó que o React já removeu.
4. **Orquestração declarativa em árvore** — `variants` propagando do pai para N filhos
   com stagger, sem escrever índices à mão.

Fora desses quatro, Motion é peso sem retorno neste projeto.

---

## 1. QUAL IMPORT, QUAL PACOTE, QUANTO PESA DE VERDADE

### O rename

A doc oficial (`motion.dev/docs/react-upgrade-guide`) manda:

> `npm uninstall framer-motion` / `npm install motion` — e trocar `"framer-motion"` por
> `"motion/react"`.

E afirma, sobre a v12:

> "There are no breaking changes in Motion for React in version 12."

**Para este projeto:** o pacote instalado é `framer-motion@12.43.0`. O import correto
**aqui** é `from 'framer-motion'`. `motion/react` só existe se o pacote `motion` for
instalado. `framer-motion` continua publicado e versionado em lockstep com `motion`
(ambos 12.43.0, mesma dependência `motion-dom@^12.43.0`) — não é um pacote abandonado,
é o mesmo código com outro nome de embalagem. **Não vale trocar** só pela estética do
import; vale trocar se em algum momento se quiser `motion/react-m` no lugar de
`framer-motion/m`.

### Subpaths que existem no pacote instalado

Lidos de `node_modules/framer-motion/package.json` → `exports`:

| Subpath | O que é |
|---|---|
| `framer-motion` | tudo, componente `motion` completo |
| `framer-motion/m` | os elementos `m.*` mínimos (equivale a `motion/react-m`) |
| `framer-motion/mini` | `animate` mini, WAAPI só, sem React |
| `framer-motion/dom` / `framer-motion/dom/mini` | API vanilla, sem React |
| `framer-motion/client` | re-export com `"use client"` |
| `framer-motion/debug` , `framer-motion/projection` | interno |

`framer-motion/m` exporta os elementos **nomeados** (`m.div`, `m.a`, `m.span`, …), então
o import é `import * as m from 'framer-motion/m'`.

### Peso — números do próprio pacote, não da doc

`node_modules/framer-motion/package.json` → campo `bundlesize` (o orçamento que o build
da lib **falha** se estourar). Estes são os números reais da 12.43.0:

| Bundle | maxSize |
|---|---|
| `size-rollup-motion.js` (componente `motion` inteiro) | **34,9 kB** |
| `size-rollup-m.js` (`m` sem features) | **6 kB** |
| `size-rollup-dom-animation.js` (`domAnimation`) | **17,85 kB** |
| `size-rollup-dom-max.js` (`domMax`) | **29,8 kB** |
| `size-rollup-animate.js` (`animate` híbrido) | **19,1 kB** |
| `size-rollup-scroll.js` (`scroll`) | **5,2 kB** |
| `size-rollup-waapi-animate.js` (mini) | **2,26 kB** |

A doc `motion.dev/docs/react-reduce-bundle-size` publica: `motion` 34kb, `m` 4.6kb,
`domAnimation` +15kb, `domMax` +25kb, `useAnimate` mini 2.3kb, híbrido 17kb. Os dois
conjuntos batem em ordem de grandeza; o `package.json` é o teto de CI e a doc é a medida
arredondada. **Use os do `package.json`** — são os que o build garante.

### O que cada feature bundle contém (lido do código, não da doc)

`dist/es/render/dom/features-animation.mjs` e `features-max.mjs`:

```js
const domAnimation = { renderer, ...animations, ...gestureAnimations }
const domMax       = { ...domAnimation, ...drag, ...layout }
```

E, abrindo:

- `animations` = `animation` + `exit`
- `gestureAnimations` = `inView` + `tap` + `focus` + `hover`
- `layout` = `HTMLProjectionNode` + `MeasureLayout`

**Consequência dura e não óbvia: `layout` e `layoutId` NÃO estão em `domAnimation`.**
Se o site usa `LazyMotion` com `domAnimation`, os padrões 4 e 5 desta pesquisa
silenciosamente não animam. `whileInView`, `whileHover`, `whileTap`, `whileFocus`,
`AnimatePresence`/`exit` estão em `domAnimation`.

### Recomendação de empacotamento para este site

Uma landing única, tudo na mesma rota, sem code-split entre páginas. `LazyMotion` com
carregamento assíncrono aqui **não paga**: adiciona um chunk extra e um segundo
round-trip para economizar bytes num JS que já vai ser baixado. Duas escolhas honestas:

- **Se nenhum padrão de `layout` entrar:** `import * as m from 'framer-motion/m'` +
  `<LazyMotion features={domAnimation} strict>` → 6 + 17,85 = **~24 kB** contra 34,9.
  O `strict` faz o build gritar se alguém escrever `motion.div` por engano.
- **Se `layout`/`layoutId` entrar:** `m` + `domMax` = 6 + 29,8 = **~35,8 kB**, ou seja,
  **pior que importar `motion` direto (34,9)**. Nesse caso use `motion` e pronto.

Isto contraria o conselho reflexo de "sempre LazyMotion". `LazyMotion` só compensa
abaixo de `domMax`.

---

## 2. O QUE É BARATO E O QUE É CARO — A LISTA REAL

Há três níveis, e quase toda a internet confunde dois deles.

### Nível 1 — sai da main thread (WAAPI)

`motion-dom/dist/es/animation/waapi/utils/accelerated-values.mjs`, literal:

```js
const acceleratedValues = new Set([
    "opacity",
    "clipPath",
    "filter",
    "transform",
    "backgroundColor",
])
```

E o portão em `waapi/supports/waapi.mjs` — a animação vira `Element.animate()` **só se**:

- o alvo é `HTMLElement` ou `SVGElement` (nunca em outro timing context, ex. popup);
- `name` está na lista acima (ou é propriedade de cor com formato só-navegador tipo
  `oklch`/`oklab`, que o path JS não parseia);
- `name !== "transform"` **ou** não há `transformTemplate`;
- **não há `onUpdate`** — "there's no way to read the value from WAAPI every frame";
- sem `repeatDelay`, sem `repeatType: "mirror"`, `damping !== 0`, `type !== "inertia"`.

### Nível 2 — interpola em JS na main thread, mas o navegador só compõe

**`x`, `y`, `scale`, `rotate`, `rotateX/Y/Z`, `skew` NÃO estão em `acceleratedValues`.**
A chave que chega em `bindToMotionValue` é `"x"`, `"scale"`, etc. — `acceleratedValues.has("x")`
é `false`. Logo: a **interpolação** de um spring de `x` roda em JS, um `requestAnimationFrame`
por frame, na main thread. O que o navegador faz com o resultado (`transform`) continua
sendo trabalho de compositor — não causa layout nem paint.

Tradução prática: `scale` num card não repinta, mas **compete com o seu JS**. Vinte cards
com spring de `scale` simultâneo são vinte interpolações por frame. `opacity` nos mesmos
vinte cards são zero interpolações por frame — o compositor toca sozinho.

### Nível 3 — força layout, nunca anime

`motion-dom/dist/es/render/utils/keys-position.mjs`:

```js
const positionalKeys = new Set([
    "width", "height", "top", "left", "right", "bottom",
    ...transformPropOrder,
])
```

`width`/`height`/`top`/`left`/`right`/`bottom` animados diretamente = reflow por frame.
A resposta certa para "o card precisa mudar de tamanho" **não** é animar `height`: é
`layout` (padrão 4), que mede duas vezes e anima com `transform`.

### Regra de bolso para este site

| Quero | Use | Custo |
|---|---|---|
| aparecer / sumir | `opacity` | compositor, WAAPI |
| corte seco, revelação de faixa | `clipPath` | compositor, WAAPI |
| queimar / dessaturar | `filter` | compositor, WAAPI (mas repinta a camada) |
| deslocar, inclinar, escalar | `x`/`y`/`rotate*`/`scale` | compositor + 1 interpolação JS/frame |
| trocar cor de superfície | `backgroundColor` | WAAPI |
| trocar cor de **borda**/texto | `borderColor`, `color` | JS + paint. Prefira CSS `transition` |
| mudar tamanho | `layout` | 2 medições + transform. Nunca `height` |

Nota sobre `filter`: é acelerado no sentido de rodar em WAAPI, mas `blur()` continua caro
de rasterizar. Como a direção de arte proíbe brilho difuso, isso não é problema aqui —
`filter` neste site só serve para `saturate()`/`brightness()` em corte seco.

---

## 3. SPRING OU CURVA — E OS NÚMEROS QUE A DOC ERRA

### Os defaults reais

`motion-dom/dist/es/.../springDefaults` (código, verbatim):

```js
const springDefaults = {
    stiffness: 100,
    damping: 10,
    mass: 1.0,
    velocity: 0.0,
    duration: 800,        // ms
    bounce: 0.3,
    visualDuration: 0.3,  // s
    restSpeed:  { granular: 0.01,  default: 2 },
    restDelta:  { granular: 0.005, default: 0.5 },
    minDuration: 0.01, maxDuration: 10.0,
    minDamping: 0.05, maxDamping: 1,
}
```

⚠️ **A tabela publicada em `motion.dev/docs/react-transitions` lista `stiffness` com
default `1` e `bounce` com default `0.25`.** O código instalado diz `100` e `0.3`.
Confie no código. (Provável erro de renderização da tabela na doc.)

### O que o Motion faz quando você NÃO pede transition

Isto quase ninguém sabe e muda tudo.
`motion-dom/dist/es/animation/utils/default-transitions.mjs`, verbatim:

```js
const underDampedSpring     = { type: "spring", stiffness: 500, damping: 25, restSpeed: 10 }
const criticallyDampedSpring = (target) => ({
    type: "spring", stiffness: 550,
    damping: target === 0 ? 2 * Math.sqrt(550) : 30,
    restSpeed: 10,
})
const keyframesTransition = { type: "keyframes", duration: 0.8 }
const ease = { type: "keyframes", ease: [0.25, 0.1, 0.35, 1], duration: 0.3 }

const getDefaultTransition = (valueKey, { keyframes }) => {
    if (keyframes.length > 2) return keyframesTransition
    else if (transformProps.has(valueKey))
        return valueKey.startsWith("scale") ? criticallyDampedSpring(keyframes[1]) : underDampedSpring
    return ease
}
```

Ou seja, sem `transition` nenhum:

- **qualquer transform** (`x`, `y`, `rotate`) → spring `stiffness 500 / damping 25`;
- **qualquer `scale*`** → spring `stiffness 550 / damping 30` (criticamente amortecido);
- **tudo o mais** (`opacity`, cor, `filter`, `clipPath`) → tween 300 ms com
  `cubic-bezier(.25,.1,.35,1)`;
- **mais de 2 keyframes** → 800 ms.

### Quando spring, quando curva

**Spring é certo quando o alvo pode mudar antes de chegar.** É o único caso em que ele
ganha de verdade: o spring carrega velocidade, então trocar de alvo no meio não produz
salto. Isso vale para: tilt seguindo cursor, drag, arrasto de carrossel, painel que abre
e o usuário fecha antes de terminar.

**Spring é errado quando o movimento tem que terminar num instante conhecido.** Spring
não tem duração — tem `restSpeed`/`restDelta`. Se três coisas precisam pousar juntas, ou
se há stagger, ou se o movimento tem que sincronizar com um corte de vídeo/áudio, use
`duration` + `ease`. Um stagger de spring parece desalinhado porque cada elemento chega
num momento diferente conforme a distância que percorreu.

**Spring é errado para `opacity`.** Fade com bounce passa de 1 e volta; sobrescreve
ou vira flicker. O default do Motion já é tween aqui — não mude.

**A saída moderna: `visualDuration` + `bounce`.** A doc:

> "The visual duration is a time, set in seconds, that the animation will take to
> visually appear to reach its target."

Isso dá o controle temporal de uma curva com a interrompibilidade de um spring. Para a
gramática "corte seco" desta marca, `bounce: 0` é obrigatório — **bounce é o oposto do
brief**. Um LED não quica.

Valores que este projeto deve usar:

```ts
// dicionário único, um arquivo, importado por todos os cards
export const T = {
  // corte seco — o default da casa
  cut:    { duration: 0.22, ease: [0.2, 0, 0, 1] as const },
  // entrada de card
  entra:  { duration: 0.34, ease: [0.16, 1, 0.3, 1] as const },
  // painel que abre/fecha e pode ser interrompido
  painel: { type: 'spring', visualDuration: 0.34, bounce: 0 } as const,
  // tilt / cursor — precisa carregar velocidade
  segue:  { type: 'spring', stiffness: 260, damping: 26, mass: 0.6 } as const,
}
```

`ease: [0.2, 0, 0, 1]` é uma saída quase-instantânea com pouso duro — a tradução em
bezier do `--ease-out-cut` que já existe no `globals.css`.

⚠️ **Motion não aceita a sintaxe `linear()` do CSS em `ease`.** Os tokens
`--ease-tubo` e `--ease-out-cut` do `globals.css` são strings `linear(...)` e **não podem
ser passadas para o Motion** — nem como `var()`, nem como literal. `mapEasingToNativeEasing`
aceita: função JS, `BezierDefinition` (array de 4), array de segmentos, ou nome
(`"easeOut"` etc.). Nada mais. Para manter paridade visual entre o CSS e o Motion,
mantenha os dois dicionários lado a lado e assuma que são aproximações um do outro.

### O achado que vale por si só: `steps()`

`framer-motion` reexporta `steps` de `motion-utils`:

```js
function steps(numSteps, direction = "end") {
    return (progress) => {
        progress = direction === "end" ? Math.min(progress, 0.999) : Math.max(progress, 0.001)
        const expanded = progress * numSteps
        const rounded = direction === "end" ? Math.floor(expanded) : Math.ceil(expanded)
        return clamp(0, 1, rounded / numSteps)
    }
}
```

**Isto é literalmente "LED é pixel, não lâmpada" como função de easing.** Uma opacidade
que sobe em 4 degraus não é um fade — é um dimmer DMX de 4 passos.

E roda no compositor: `mapEasingToNativeEasing` converte função JS em `linear()` nativo
via `generateLinearEasing`, que amostra a função a cada **10 ms**:

```js
const generateLinearEasing = (easing, duration, resolution = 10) => { … }
```

Consequência precisa: numa animação de 400 ms, a escada é reproduzida com 40 pontos —
cada "degrau" tem uma rampa de ~10 ms em vez de 0 ms. Imperceptível a olho, mas é a
verdade técnica: não é um corte matematicamente instantâneo.

---

## 4. O PONTO CENTRAL — MOTIONVALUE CONTRA ESTADO DO REACT

### O modelo errado

```tsx
// NÃO FAÇA ISSO
const [pos, setPos] = useState({ x: 0, y: 0 })
<div onPointerMove={e => setPos({ x: e.clientX, y: e.clientY })}
     style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }} />
```

O `pointermove` dispara na cadência do dispositivo — em telas de 120 Hz, até 120 vezes
por segundo, e em alguns ponteiros mais que isso via eventos coalescidos. Cada `setPos`
agenda um render do React: reconciliação do componente, de todos os filhos que não estão
memoizados, e commit. Um único card faz isso 120×/s; um grid de 13 faz o pai re-renderizar
e derruba os 13. É a diferença entre 0 ms e 6–10 ms de main thread por frame — e um frame
a 60 fps tem 16,7 ms no total.

### O modelo certo

A doc (`motion.dev/docs/react-motion-value`) é explícita:

> "Changes to the motion value will update the DOM **without triggering a React re-render**."
> "Using motion values instead of React state to update `style` will also avoid re-renders."

Um `MotionValue` é um sinal com subscrição própria. `x.set(120)` notifica os assinantes
e o `VisualElement` agenda uma escrita de DOM no próximo frame — batched, sem passar pelo
React. O componente React renderiza **uma vez**, na montagem, e nunca mais.

Em `VisualElement.bindToMotionValue`:

```js
const removeOnChange = value.on("change", (latestValue) => {
    this.latestValues[key] = latestValue
    this.props.onUpdate && frame.preRender(this.notifyUpdate)
    …
    this.scheduleRender()
})
```

`scheduleRender` é o render **do Motion** (escrita de estilo), não do React.

Nota importante: `this.props.onUpdate && …` — **passar `onUpdate` reintroduz custo e
mata o caminho WAAPI** (ver §2). `onUpdate` é o antônimo de performance aqui.

### A cadeia

```
useMotionValue  →  fonte crua (você escreve)
      ↓
useSpring       →  suaviza / carrega velocidade  (opcional)
      ↓
useTransform    →  mapeia faixa→faixa, sem re-render
      ↓
style={{ … }}   →  o Motion escreve no DOM
```

`useTransform` tem duas formas e **elas não são equivalentes** (código de
`framer-motion/dist/es/value/use-transform.mjs`):

- **forma de faixa** — `useTransform(v, [0,1], [-6,6])`. Propaga o descritor `accelerate`
  do valor de origem. É a que permite aceleração nativa (ver §7).
- **forma de função** — `useTransform(() => …)` ou `useTransform(v, fn)`. **Não** propaga
  `accelerate`. Também não propaga se `options.clamp === false` ou se a saída for objeto.

Regra: **prefira sempre a forma de faixa.** Só caia na função quando precisar combinar
valores que a faixa não expressa.

`useMotionTemplate` monta string a partir de motion values:

```tsx
const filter = useMotionTemplate`saturate(${sat}%)`
```

Cuidado: uma string escrita em `maskImage`/`background` a cada frame **repinta a camada**.
`useMotionTemplate` é elegante e caro. Para o facho no cursor, mover um elemento de
tamanho fixo por `x`/`y` (compositor) é várias ordens de grandeza mais barato que
recalcular a posição de um `radial-gradient` numa máscara — que é exatamente o que
`LuzCursor.tsx` já faz hoje, e está certo.

---

## 5. `prefers-reduced-motion` — O QUE O MOTION FAZ SOZINHO E O QUE NÃO FAZ

### O que faz sozinho

Com `<MotionConfig reducedMotion="user">`, em
`motion-dom/.../animation/interfaces/visual-element-target.mjs`:

```js
const shouldReduceMotion = reduceMotion ?? visualElement.shouldReduceMotion
value.start(animateMotionValue(
    key, value, valueTarget,
    shouldReduceMotion && positionalKeys.has(key) ? { type: false } : valueTransition,
    visualElement, isHandoff
))
```

`{ type: false }` = **salta para o valor final instantaneamente**. Não cancela, não pula
o alvo: aplica o destino de imediato.

Lista exata do que salta = `positionalKeys` = `width, height, top, left, right, bottom` +
todos os transforms. **`opacity`, cor, `filter`, `clipPath` continuam animando
normalmente.** Layout animations também são desligadas (doc:
*"transform and layout animations will be disabled"*).

Isso é exatamente a degradação certa: um card com
`initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}` vira, sob reduced
motion, um fade puro. Sem uma linha a mais.

Default do contexto é `"never"` (lido de `MotionConfigContext.mjs`) — ou seja, **se você
não colocar o `MotionConfig`, nada disso acontece.** Coloque-o no `app/layout.tsx`.

### O que você ainda precisa fazer à mão

1. **`whileHover={{ scale: 1.02 }}` sob reduced motion não some — ele salta.** O card
   pula de tamanho de um frame para o outro a cada hover. Pior que animar. Para hover,
   troque o alvo em vez de confiar no automático: anime `opacity`/`borderColor` e nada
   de transform.
2. **Qualquer coisa dirigida por `MotionValue`** — tilt, parallax, facho no cursor — o
   Motion **não sabe** que existe. Você escreveu `x.set(…)` na mão; ele obedece. Precisa
   de guarda explícita.
3. **`repeat: Infinity`** continua repetindo. Reduced motion não é "sem loop".
4. **Autoplay de vídeo** — a própria doc cita "disabling the autoplay of a background
   `video` element" como responsabilidade sua.

### O hook, e por que ele é uma armadilha de hidratação

`framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs`:

```js
function useReducedMotion() {
    !hasReducedMotionListener.current && initPrefersReducedMotion()
    const [shouldReduceMotion] = useState(prefersReducedMotion.current)
    …
    return shouldReduceMotion
}
```

E o estado inicial, em `motion-dom/.../reduced-motion/state.mjs`, com o comentário do
próprio autor:

```js
// Does this device prefer reduced motion? Returns `null` server-side.
const prefersReducedMotion = { current: null }
```

Duas coisas:

- **Retorna `null` no servidor.** Com `output: 'export'`, o HTML é gerado no build com
  `null`; no cliente, `initPrefersReducedMotion()` roda *durante o render*, então o
  primeiro render do cliente já tem `true`/`false`. **Se você ramificar JSX nesse valor,
  há mismatch de hidratação.**
- **O hook não reage a mudanças**, apesar do docstring dizer que reage. O código tem
  `useState` sem `useEffect` e um `// TODO See if people miss automatically updating
  shouldReduceMotion setting`. Mudar a preferência do SO não re-renderiza nada.

`MotionConfig reducedMotion="user"`, ao contrário, é seguro: a decisão é tomada em
`VisualElement.mount()` — depois da hidratação, nunca no render.

**Regra:** `MotionConfig` sempre; `useReducedMotion()` só dentro de `useEffect`, nunca
para escolher markup.

---

## 6. NÃO QUEBRAR A HIDRATAÇÃO COM `output: 'export'`

### O que o Motion garante

Doc de `react-motion-component`, verbatim:

> "`motion` components are fully compatible with server-side rendering, meaning the
> initial state of the component will be reflected in the server-generated output."

E:

> `<motion.div initial={false} animate={{ x: 100 }} />` → "Server will output
> `translateX(100px)`"

Ou seja: `initial={{ opacity: 0, y: 14 }}` vai para o HTML estático como
`style="opacity:0;transform:translateY(14px)"`. **Isso é uma faca de dois gumes com
`output: 'export'`**: se o JS falhar em carregar (rede ruim, bloqueador, erro de outro
script), o card fica invisível para sempre. O `Reveal.tsx` atual resolve isso com
`.no-js .rev` no CSS — o Motion não tem equivalente.

**Mitigação obrigatória para conteúdo que vende:** nunca use `initial` com `opacity: 0`
em texto de conversão (nome do serviço, preço, CTA de WhatsApp). Anime só o invólucro,
ou anime a partir de `opacity: 0.001`… não — melhor: use `whileInView` com
`initial={{ opacity: 0 }}` **só em elementos decorativos**, e deixe o conteúdo textual
entrar por `y` apenas. Um card que chega 14 px deslocado e não animou ainda é um card
legível; um card com `opacity: 0` é uma página em branco.

### As três coisas que realmente quebram

1. **`'use client'` no seu arquivo.** O barril `dist/es/index.mjs` do `framer-motion`
   **não** tem a diretiva `"use client"` no topo (65 arquivos internos têm, o índice
   não). O proxy `motion` também não. Portanto **importar `motion` num Server Component
   quebra o build**. Toda folha que usa Motion precisa da própria diretiva. Como o
   `page.tsx` desta landing é servidor, isso significa: os cards viram componentes de
   cliente. Isole — não promova a página inteira.

2. **`useId` do React 19.** `AnimatePresence` com `mode="popLayout"` usa `useId()` para
   gerar o seletor `[data-motion-pop-id="…"]`. É estável entre servidor e cliente por
   construção do React; não é problema. Mas **injeta um `<style>` em `document.head` em
   `useInsertionEffect`** — sob CSP com nonce isso é bloqueado. `MotionConfig nonce="…"`
   repassa o nonce (o código lê `const { nonce } = useContext(MotionConfigContext)` e faz
   `style.nonce = nonce`). Como este site é estático e provavelmente sem CSP com nonce,
   é só uma nota.

3. **Ramificar markup em `matchMedia`, `window`, ou `useReducedMotion()` durante o
   render.** Vale para hover/touch também: **não** faça
   `{isTouch ? <A/> : <B/>}`. Renderize um markup só e deixe o CSS
   (`@media (hover: hover) and (pointer: fine)`) decidir — que é o que o `globals.css`
   já faz com `.luz`.

---

## 7. `useScroll` + `useTransform` — E QUANDO O CSS NATIVO GANHA

### O estado do CSS nativo em 2026

MDN browser-compat-data (`css/properties/animation-timeline.json`), lido do repositório:

| Navegador | `animation-timeline` |
|---|---|
| Chrome | **115** |
| Edge | espelha Chrome |
| Safari | **26** |
| Safari iOS | espelha Safari |
| Firefox | **`preview`** — não enviado em release |

MDN classifica: *"This feature is not Baseline because it does not work in some of the
most widely-used browsers."* WebKit confirma o envio em Safari 26 (blog de 2025-06-20:
*"Scroll-driven animations … are available in Safari 26 beta"*).

Ou seja: **CSS puro deixa o Firefox sem nada.**

### O que o Motion 12.43 faz — e isso é novo e pouco divulgado

`framer-motion/dist/es/value/use-scroll.mjs`:

```js
function canAccelerateScroll(target, offset) {
    if (typeof window === "undefined") return false
    return target
        ? supportsViewTimeline() && !!offsetToViewTimelineRange(offset)
        : supportsScrollTimeline()
}

function useScroll({ container, target, ...options } = {}) {
    const values = useConstant(createScrollMotionValues)
    if (canAccelerateScroll(target, options.offset)) {
        values.scrollXProgress.accelerate = makeAccelerateConfig("x", options, container, target)
        values.scrollYProgress.accelerate = makeAccelerateConfig("y", options, container, target)
    }
    …
```

E em `VisualElement.bindToMotionValue`:

```js
if (value.accelerate && acceleratedValues.has(key) && this.current instanceof HTMLElement) {
    const animation = new NativeAnimation({ element: this.current, name: key, keyframes, times, ease, duration })
    const cleanup = factory(animation)
    …
    return
}
```

**Tradução:** em Chrome e Safari, `useScroll` + `useTransform` vira uma
`ScrollTimeline`/`ViewTimeline` nativa — fora da main thread, idêntico ao CSS. Em
Firefox, cai no listener de scroll em JS. **Você escreve uma vez e ganha o melhor dos
dois.** Isso inverte o conselho de 2024 ("use CSS nativo, Motion é caro").

### As quatro condições — todas obrigatórias, todas fáceis de perder

1. **A propriedade destino tem que estar em `acceleratedValues`** — `opacity`, `clipPath`,
   `filter`, `transform`, `backgroundColor`. **`y`, `scale`, `rotate` não aceleram por
   este caminho.** Parallax por `y` ligado a scroll roda em JS mesmo no Chrome.
2. **`useTransform` na forma de faixa**, com arrays, `clamp !== false`, sem função.
3. **Com `target`, o `offset` precisa casar com um dos quatro presets.**
   `offsetToViewTimelineRange` só reconhece:

   | offset (forma de string) | forma normalizada | range nativo |
   |---|---|---|
   | `["start end", "end end"]` | `[[0,1],[1,1]]` | `entry 0%..100%` |
   | `["start start", "end start"]` | `[[0,0],[1,0]]` | `exit 0%..100%` |
   | `["end start", "start end"]` | `[[1,0],[0,1]]` | `cover 0%..100%` |
   | `["start start", "end end"]` | `[[0,0],[1,1]]` | `contain 0%..100%` |
   | *omitido* | — | `contain 0%..100%` |

   **Pegadinha real:** o offset mais copiado da internet, `["start end", "end start"]`,
   normaliza para `[[0,1],[1,0]]` e **não casa com preset nenhum** — cai em JS
   silenciosamente. É `["end start", "start end"]` que dá `cover`. E qualquer `"center"`,
   `"0.5"`, `"100px"` ou `"50%"` derruba a aceleração (o parser só aceita `start`/`end`).
4. **O alvo tem que ser `HTMLElement`** — não SVG, não elemento em popup.

### Quando ainda assim usar CSS nativo

Quando o efeito é **puramente decorativo e você aceita que o Firefox não veja nada** —
aí `animation-timeline: view()` custa 0 KB de JS e é sempre a resposta certa. Exemplo
neste site: uma barra de progresso de leitura, ou o próprio `.tubo` acendendo conforme
a seção entra. Não vale importar `useScroll` (5,2 KB só do `scroll` + o resto) para isso.

**A regra:** decorativo e degradável → CSS. Estrutural, ou precisa do mesmo comportamento
em todos os navegadores → `useScroll`.

---

## 8. `layout` / `layoutId` — AS ARMADILHAS ANTES DO CÓDIGO

### Como funciona

O Motion mede o elemento antes e depois do render do React (FLIP), e reproduz a diferença
com `transform`. Nunca anima `width`/`height` de verdade — daí a distorção.

### Armadilha 1 — texto esticado

Escalar a caixa escala o texto dentro. A doc: *"Text/content distortion … Children need
the `layout` prop applied."* O exemplo oficial do repo
(`dev/react/src/examples/Animation-layout-text-size.tsx`) confirma que `layout` sozinho
num `<p>` cuida do próprio `fontSize`. Para um card que expande:

- Pai: `layout` (anima posição **e** tamanho).
- Filhos de texto: `layout="position"` — **anima só a posição, o tamanho salta**. A doc:
  *"Animates only positional changes while allowing size to snap instantly."* É
  exatamente o que se quer para texto: nenhuma escala, logo nenhuma distorção.
- `layout="size"` é o inverso — usado quando o elemento deve mudar de tamanho mas seguir
  o pai na posição sem animar.

### Armadilha 2 — `borderRadius` da classe do Tailwind é ignorado

Esta é a mais cara neste projeto. A correção de escala funciona assim
(`motion-dom/.../projection/node/create-projection-node.mjs`):

```js
for (const key in scaleCorrectors) {
    if (valuesToRender[key] === undefined) continue
    …
}
```

`valuesToRender` vem de `latestValues`, que só contém valores que o Motion conhece — isto
é, o que está em `style` / `animate` / motion values. **Uma classe `rounded-card` nunca
entra ali.** Logo o raio não é corrigido e o canto vira elipse durante a animação.

A doc diz o mesmo em uma linha: *"Motion automatically corrects distortion on these
properties, but they must be set via `style`."* Os corretores registrados são exatamente
`borderRadius`, os quatro cantos individuais, e `boxShadow`.

**Regra dura para este repo:** em qualquer elemento com `layout` ou `layoutId`, o raio
sai da classe e vai para `style={{ borderRadius: 14 }}`. Tem que ser **número** ou string
em px — o corretor converte px→% para evitar repaint:

> "We always correct borderRadius as a percentage rather than pixels to reduce paints."

Se for `%` na origem, ele devolve imediatamente sem correção; se não for px nem %, devolve
o valor cru.

O aro de dois tons do `.card` (dois `linear-gradient` em `padding-box`/`border-box`)
**não é corrigível** — não existe corretor para `background`. Durante uma animação de
layout o gradiente do aro estica. Solução: no estado expandido, trocar o aro por
`borderColor` chapada, ou aceitar a distorção durante ~300 ms.

### Armadilha 3 — borda de 1 px

Doc: *"Borders can't render below 1px during scaling, limiting correction effectiveness."*
O filete de 1 px do `.card` vai engrossar/afinar visivelmente se a escala for grande
(3× ou mais). Mantenha a razão de escala do card expandido abaixo de ~2,2× ou troque a
borda por um pseudo-elemento com `layout` próprio.

### Armadilha 4 — `layoutRoot` e `layoutScroll`

- `layoutRoot` — obrigatório em container `position: fixed`. Doc: *"so Motion can account
  for the page's scroll offset when measuring children."* Sem isso, um modal fixo mede
  errado assim que a página tem scroll.
- `layoutScroll` — no pai com `overflow: auto`, *"lets Motion account for the element's
  scroll offset"*.

### Armadilha 5 — `LayoutGroup`

Quando dois componentes irmãos precisam animar juntos mas **não re-renderizam no mesmo
ciclo**, o Motion não sabe que o layout do vizinho mudou. Doc: envolver em `LayoutGroup`
e *"layout animations will trigger across all of them"*. No caso do grid de serviços: se
um card expande e empurra os outros, sem `LayoutGroup` os outros saltam.

### Armadilha 6 — precisa de `domMax`

Repetindo §1 porque é onde mais se erra: `layout` está em `domMax`, não em `domAnimation`.

---

## 9. `AnimatePresence` — OS TRÊS MODOS E O QUE QUEBRA

Doc, verbatim:

- **`sync`** (default) — *"elements animate in and out as soon as they're added/removed"*.
  O elemento que sai continua ocupando o layout enquanto anima. Num grid, isso empurra
  tudo e depois puxa de volta.
- **`wait`** — *"the entering element will wait until the exiting child has animated out"*.
  **Só suporta um filho por vez.** Se houver dois, o comportamento é indefinido.
  Custo: a duração total é a soma das duas animações — para um card, ~600 ms de espera
  antes de qualquer coisa aparecer. Percebido como travamento.
- **`popLayout`** — *"Exiting elements will be 'popped' out of the page layout, allowing
  surrounding elements to immediately reflow."* É o certo para grid filtrável.

### O que `popLayout` faz por baixo (código de `PopChild.mjs`)

Em `getSnapshotBeforeUpdate` ele mede `offsetTop`, `offsetLeft`, `offsetParent.offsetWidth/Height`,
`getComputedStyle().width/height`. Depois, em `useInsertionEffect`, injeta uma regra:

```css
[data-motion-pop-id="…"] {
  position: absolute !important;
  width: …px !important; height: …px !important;
  left: …px !important;  top: …px !important;
}
```

Daí as duas exigências da doc, agora explicadas:

1. **O pai precisa de `position` diferente de `static`** — porque as coordenadas vêm de
   `offsetTop`/`offsetLeft`, relativas ao `offsetParent`. Se o `offsetParent` não for o
   pai que você imagina, o card sai voando para o canto da tela. Sintoma clássico e
   confuso.
2. **A ref precisa chegar ao nó DOM.** O código já lida com React 19
   (`children.props?.ref ?? children?.ref`), então componentes-função com `ref` em props
   funcionam sem `forwardRef`. Mas o filho tem que **repassar a ref para o elemento**.

Extras que a doc de superfície não menciona e existem na API (lidos de `index.d.ts`):
`anchorX?: "left" | "right"`, `anchorY?: "top" | "bottom"` (para elementos ancorados à
direita/embaixo, senão a saída ancora errado em RTL ou em flex reverso), e `root` (onde
injetar o `<style>`).

### Regras que valem para os três modos

- **`key` estável e única.** Doc: *"Direct children must each have a unique `key` prop"*.
  Índice de array como key **quebra** quando a lista reordena. Use o `codigo` do rider
  (`PA`, `LX`, `LED-T`) — já existe no conteúdo e é naturalmente único.
- `initial={false}` desliga a animação de entrada dos filhos já presentes no primeiro
  render. **Com `output: 'export'` isto quase sempre é o que você quer** para conteúdo
  above-the-fold: o HTML estático já mostra a lista, e não faz sentido animar a entrada
  de algo que o usuário já viu pintado.
- `propagate` (default `false`) — só ligue se este `AnimatePresence` estiver dentro de
  outro e as saídas devam encadear.

---

## 10. `whileHover` / `whileTap` / `whileInView` — E O QUE ACONTECE NO DEDO

### `whileHover` simplesmente não existe em touch

Código de `motion-dom/dist/es/gestures/hover.mjs`, verbatim:

```js
function isValidHover(event) {
    return !(event.pointerType === "touch" || isDragActive())
}
```

e, no `pointerleave`:

```js
const onPointerLeave = (leaveEvent) => {
    if (leaveEvent.pointerType === "touch") return
    …
}
```

**Isto é melhor que CSS.** `:hover` em touch gruda: o navegador emula um hover no toque e
ele só sai quando você toca em outro lugar — daí cards que ficam "acesos" depois do
scroll. O Motion filtra `pointerType === "touch"` na entrada **e** na saída. Zero eventos.

Consequência: **tudo que estiver só em `whileHover` é invisível no celular.** Como esta
landing é de evento em Uberlândia e o tráfego é majoritariamente mobile vindo de
Instagram/WhatsApp, isso não é detalhe — é a maioria dos usuários.

### `whileTap` / press

`gestures/press/index.mjs` → `isPrimaryPointer(event) && !isDragActive()`. Doc:
*"the primary pointer (like a left click or first touch point) presses down and releases
on the same component"*; cancela se o ponteiro sair; e *"if the tappable component is a
child of a draggable component, it'll automatically cancel the tap gesture if the pointer
moves further than 3 pixels"*.

**Perigo específico deste site:** os cards são `<a href={zap(...)}>`. Um `whileTap` com
`scale: 0.98` num link que abre WhatsApp dá feedback bom, mas se o usuário estiver
scrollando com o dedo em cima do card, o press dispara e cancela — flicker durante o
scroll. Mitigação: `whileTap` só em `opacity`/`backgroundColor` (sem geometria), ou usar
`whileFocus` + CSS `:active` e deixar o `whileTap` fora.

### `whileFocus`

É o que dá teclado. **Todo padrão que só tem `whileHover` está quebrado para teclado.**
O `globals.css` já resolve isso em CSS com `:focus-within` no `.card` — se o card migrar
para Motion, `whileFocus` no `motion.a` não cobre `:focus-within` (foco em filho). Nesse
caso, mantenha o CSS.

### `whileInView`

`ViewportOptions` (de `motion-dom/dist/index.d.ts`):

```ts
interface ViewportOptions {
    root?: { current: Element | null }
    once?: boolean            // default false
    margin?: string           // default "0px"
    amount?: "some" | "all" | number   // default "some"
}
```

Doc: usa `IntersectionObserver` "pooled" — vários elementos com as mesmas opções
compartilham um observer. Ou seja, 13 cards com `viewport={{ once: true, amount: 0.3 }}`
custam **um** observer, não treze. (Isso é o mesmo que o `Reveal.tsx` já faz à mão.)

`once: true` é obrigatório aqui. Sem ele, o card re-anima toda vez que sai e volta —
irritante em scroll de celular, que oscila.

---

## OS PADRÕES

Todos assumem `import` de `framer-motion` e `'use client'` no topo do arquivo.
Todos usam os tokens do `@theme` (`bg-off`, `text-ambar`, `rounded-card`, `text-2xs`,
`border-rule`, `font-mono`).

Arquivo de apoio, uma vez só:

```tsx
// components/motion/tokens.ts
export const T = {
  cut:    { duration: 0.22, ease: [0.2, 0, 0, 1] },
  entra:  { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
  painel: { type: 'spring', visualDuration: 0.34, bounce: 0 },
  segue:  { type: 'spring', stiffness: 260, damping: 26, mass: 0.6 },
} as const
```

```tsx
// app/layout.tsx — uma vez, envolvendo o body
import { MotionConfig } from 'framer-motion'   // arquivo precisa de 'use client'
// ou, melhor: um <Providers> cliente fino, para o layout continuar servidor
<MotionConfig reducedMotion="user" transition={T.cut}>{children}</MotionConfig>
```

---

### PADRÃO 1 — Grade que acende em cascata (`variants` + `stagger` + `whileInView`)

O único stagger que não precisa de índice à mão. O pai orquestra; os filhos só declaram
seus dois estados.

```tsx
'use client'
import { motion, stagger, type Variants } from 'framer-motion'
import { T } from './tokens'
import type { Servico } from '@/lib/conteudo'

const grade: Variants = {
  off: {},
  // staggerChildren foi DEPRECIADO na 12.22.0 — o correto é delayChildren: stagger()
  on:  { transition: { delayChildren: stagger(0.055, { from: 'first' }) } },
}

const card: Variants = {
  off: { opacity: 0, y: 12 },
  on:  { opacity: 1, y: 0, transition: T.entra },
}

export function GradeServicos({ itens }: { itens: Servico[] }) {
  return (
    <motion.ul
      variants={grade}
      initial="off"
      whileInView="on"
      viewport={{ once: true, amount: 0.25 }}
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
    >
      {itens.map((s) => (
        <motion.li key={s.codigo} variants={card} className="card flex flex-col">
          <span className="lab text-ambar">{s.codigo}</span>
          <h3 className="mt-2 text-lg">{s.nome}</h3>
          <p className="mt-3 flex-1 text-xs leading-relaxed text-branco-2">{s.desc}</p>
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

**Variante "quantizada" (a que combina com o brief).** Troque a transição do filho por um
dimmer de 4 degraus — a opacidade sobe em degraus, o deslocamento continua contínuo:

```tsx
import { steps } from 'framer-motion'

const card: Variants = {
  off: { opacity: 0, y: 12 },
  on:  {
    opacity: 1, y: 0,
    transition: {
      default: T.entra,
      opacity: { duration: 0.28, ease: steps(4, 'end') },  // vira linear() nativo
    },
  },
}
```

**Custo.** Um `IntersectionObserver` compartilhado pelos N cards. `opacity` vai para
WAAPI (fora da main thread). `y` é interpolado em JS — N interpolações/frame durante
~340 ms, e só uma vez na vida da página graças a `once: true`. Desprezível.

**Touch.** Idêntico. `whileInView` não depende de ponteiro.

**Reduced motion.** Automático e correto: `y` está em `positionalKeys` → salta para 0;
`opacity` continua animando. Vira um fade escalonado. Nada a fazer.

**Não use quando:** o grid está acima da dobra e é o conteúdo principal. Com
`output: 'export'` o `opacity: 0` vai para o HTML estático; se o JS não carregar, a
seção fica invisível. Para o herói, use só `y` (sem `opacity`) — ou não anime. O
`Reveal.tsx` atual já faz isto por 0,4 KB e tem fallback `.no-js`; este padrão só se
justifica se você **também** precisar de `variants` para outra coisa no mesmo card.

---

### PADRÃO 2 — Facho de pixels seguindo o ponteiro (MotionValue puro, zero re-render)

O padrão central. Compare com o modelo por `useState` da §4: aqui o componente React
renderiza **uma vez**.

```tsx
'use client'
import { motion, useMotionValue } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'

export function CardFacho({ cor, children }: { cor: string; children: ReactNode }) {
  // Fonte crua. Escrever nestes valores NÃO re-renderiza o React.
  const x = useMotionValue(-9999)
  const y = useMotionValue(-9999)

  function mover(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return          // espelha o filtro do Motion
    const r = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - r.left)
    y.set(e.clientY - r.top)
  }

  return (
    <div
      onPointerMove={mover}
      className="card group relative isolate overflow-hidden"
      style={{ ['--tubo-cor' as string]: cor }}
    >
      {/* Disco de tamanho FIXO. A matriz de pontos e a máscara são estáticas em
          relação a ele — viajam junto sem repintar. Só translate. */}
      <motion.span
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none absolute left-0 top-0 z-0 -ml-30 -mt-30
                   h-60 w-60 opacity-0 mix-blend-screen
                   transition-opacity duration-300
                   group-hover:opacity-85
                   [background-image:radial-gradient(circle_at_center,var(--tubo-cor)_0_1.1px,transparent_1.5px)]
                   [background-size:7px_7px]
                   [mask-image:radial-gradient(closest-side,#000_0%,rgba(0,0,0,.55)_42%,transparent_76%)]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
```

**Custo.** `x.set()` agenda uma escrita de `transform` no próximo frame; zero
reconciliação do React. `transform` de um elemento promovido = trabalho de compositor.
Um `getBoundingClientRect()` por evento de ponteiro — é uma leitura de layout, e é o
único ponto quente. Em cards que não mudam de tamanho, cacheie o rect em
`onPointerEnter` e invalide em `resize`.

**A versão cara que a internet copia** e que você deve evitar:

```tsx
// NÃO: recalcula um radial-gradient e REPINTA a camada a cada frame
const mask = useMotionTemplate`radial-gradient(9rem at ${x}px ${y}px, #000, transparent)`
<motion.span style={{ maskImage: mask, WebkitMaskImage: mask }} />
```

Funciona, é elegante, e troca compositor puro por paint por frame.

**Touch.** O `pointerType === 'touch'` sai cedo; o `group-hover` em CSS já não dispara em
`(hover: none)` se você adicionar o guard de media query. Melhor ainda: mantenha o
`opacity` do facho controlado por
`@media (hover: hover) and (pointer: fine)` no CSS, como `globals.css` já faz. Em touch o
elemento nunca é pintado.

**Reduced motion.** ⚠️ **O Motion não cobre isto.** `x.set()` é escrita direta, não é
animação. Guarda explícita obrigatória:

```tsx
const reduz = useRef(false)
useEffect(() => { reduz.current = matchMedia('(prefers-reduced-motion: reduce)').matches }, [])
// dentro de mover(): if (reduz.current) return
```

Repare que a leitura fica em `useEffect`, nunca no render — §6.

**Não use quando:** já existe `LuzCursor.tsx`. Ele faz o mesmo com **um** listener
delegado para todos os cards, por ~480 B, e sem componente de cliente por card. Este
padrão só ganha se o facho precisar de física (spring/inércia, veja padrão 3) ou se
precisar alimentar `useTransform` para outra coisa.

---

### PADRÃO 3 — Contraluz que segue o ponteiro com inércia (`useSpring` + `useTransform`)

Quando o facho precisa **atrasar** em relação ao dedo — a sensação de massa que só spring
dá. Aqui o spring é a escolha certa (§3): o alvo muda antes de o movimento terminar.

```tsx
'use client'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { T } from './tokens'
import type { PointerEvent, ReactNode } from 'react'

export function CardTilt({ children }: { children: ReactNode }) {
  // 0..1 normalizado dentro do card
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  // O spring carrega velocidade: mudar de alvo no meio não produz salto.
  const sx = useSpring(px, T.segue)
  const sy = useSpring(py, T.segue)

  // Forma de FAIXA (não função) — ver §4.
  const rotateY = useTransform(sx, [0, 1], [-5, 5])
  const rotateX = useTransform(sy, [0, 1], [4, -4])

  function mover(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const soltar = () => { px.set(0.5); py.set(0.5) }

  return (
    <motion.article
      onPointerMove={mover}
      onPointerLeave={soltar}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      className="card [will-change:transform]"
    >
      {children}
    </motion.article>
  )
}
```

**Amplitude.** 5° é o teto para esta marca. Acima de ~8° o card lê como brinquedo e a
sombra do `.card` denuncia que a geometria é falsa. Palco tem contraluz rasante, não
carrossel de loja.

**Custo.** Quatro MotionValues encadeados; dois springs interpolando em JS por frame
enquanto não repousam (`restSpeed`/`restDelta`), depois param sozinhos. Nenhum
re-render. `rotateX/Y` **não** vão para WAAPI (§2) — são JS. Com 13 cards na tela isso
é aceitável **porque só um está sob o ponteiro por vez**; os outros doze estão parados e
não custam nada. Não replique isto em algo que anime N elementos simultaneamente.

**`will-change: transform`.** Aqui vale, porque é **um** card por vez. `globals.css` já
alerta corretamente que `will-change` em N elementos cria N camadas permanentes na GPU —
não coloque na classe `.card`, coloque só neste componente.

**Touch.** Sai cedo. O card fica plano — que é o estado correto e legível.

**Reduced motion.** Não coberto pelo Motion (mesma razão do padrão 2 — é `set`, não
`animate`). Guarda explícita, e o card fica plano.

**Não use quando:** o card contém foto de equipe ou rosto. Tilt sobre rosto distorce
proporção facial em perspectiva e é exatamente o oposto de "sabemos iluminar pessoas".
Também não use em card que é `<a>` de conversão em mobile — não vai aparecer para
ninguém e você pagou 35 KB por isso.

---

### PADRÃO 4 — Card que vira painel (`layoutId` + `AnimatePresence`)

O único padrão que justifica Motion sozinho. Nenhum CSS faz FLIP entre dois nós.

```tsx
'use client'
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion'
import { useState } from 'react'
import { T } from './tokens'
import type { Servico } from '@/lib/conteudo'

// RAIO EM style, NUNCA em className — a correção de escala só lê valores
// que o Motion conhece (§8, armadilha 2).
const RAIO = { borderRadius: 14 }

export function DossieServicos({ itens }: { itens: Servico[] }) {
  const [aberto, setAberto] = useState<Servico | null>(null)

  return (
    <LayoutGroup>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((s) => (
          <motion.li
            key={s.codigo}
            layoutId={`card-${s.codigo}`}
            style={RAIO}
            onClick={() => setAberto(s)}
            transition={T.painel}
            className="cursor-pointer border border-rule bg-off p-6"
          >
            <motion.span layout="position" layoutId={`cod-${s.codigo}`}
                         className="lab text-ambar block">{s.codigo}</motion.span>
            <motion.h3 layout="position" layoutId={`nome-${s.codigo}`}
                       className="mt-2 text-lg">{s.nome}</motion.h3>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {aberto && (
          <>
            <motion.div
              key="blackout"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={T.cut}
              onClick={() => setAberto(null)}
              className="fixed inset-0 z-40 bg-void/85"
            />
            <motion.div
              key="painel"
              layoutId={`card-${aberto.codigo}`}
              layoutRoot                        {/* obrigatório: container fixed (§8) */}
              style={RAIO}
              transition={T.painel}
              role="dialog" aria-modal="true"
              className="fixed left-1/2 top-1/2 z-50 w-[min(38rem,92vw)]
                         -translate-x-1/2 -translate-y-1/2
                         border border-rule bg-off p-8"
            >
              <motion.span layout="position" layoutId={`cod-${aberto.codigo}`}
                           className="lab text-ambar block">{aberto.codigo}</motion.span>
              <motion.h3 layout="position" layoutId={`nome-${aberto.codigo}`}
                         className="mt-2 text-xl">{aberto.nome}</motion.h3>
              {/* conteúdo novo entra por opacity, com delay para o layout pousar */}
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ ...T.cut, delay: 0.16 }}
                className="mt-4 text-xs leading-relaxed text-branco-2"
              >{aberto.desc}</motion.p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}
```

**As seis coisas que fazem isto funcionar (e sem as quais quebra):**

1. `borderRadius` em `style`, não em `className`. Sem isso o canto vira elipse.
2. `layout="position"` nos textos — anima posição, o tamanho salta, zero distorção.
3. `layoutRoot` no painel `fixed` — sem isso ele mede errado com a página rolada.
4. `LayoutGroup` — para os cards vizinhos reagirem mesmo sem re-render próprio.
5. `layoutId` idêntico nos dois lados, incluindo nos filhos, e `key` estável.
6. `domMax` se estiver usando `LazyMotion` — `layout` não está em `domAnimation`.

**Custo.** O mais caro de todos. Duas medições de layout completas por transição
(`getBoundingClientRect` em cada nó com `layout`), mais o custo de projeção por frame.
`AnimatePresence` no modo default (`sync`) é o certo aqui — o overlay entra enquanto o
card sai. `mode="wait"` daria ~600 ms de tela morta.

**Touch.** Funciona igual — é `onClick`, não hover. É o único padrão desta lista que
entrega valor integral no celular. Exige `aria-modal`, foco preso no painel e `Esc`
para fechar (não incluído acima, mas obrigatório).

**Reduced motion.** A doc diz que layout animations são desligadas com
`reducedMotion="user"`. O card então **aparece** no lugar final em vez de voar. O
`opacity` do blackout continua animando, o que preserva a leitura de "algo abriu". É a
degradação certa. **Não** confirmei no código exatamente onde a projeção é cortada —
**NÃO CONFIRMADO** no nível de fonte; confirmado apenas na documentação.

**Não use quando:** o conteúdo do painel é longo o suficiente para rolar. Um `layoutId`
entre um card de 200 px e um painel de 900 px dá razão de escala > 4×, e o filete de 1 px
do aro engrossa visivelmente (§8, armadilha 3). Também não use se a mesma informação
couber numa `<details>` nativa — que é gratuita, acessível por padrão e funciona sem JS.

---

### PADRÃO 5 — Filtro de grade com corte seco (`AnimatePresence mode="popLayout"`)

Para "mostrar só casamento / só 15 anos / só corporativo". O único modo que faz os
sobreviventes reflowarem **imediatamente** enquanto os removidos saem.

```tsx
'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { T } from './tokens'
import type { Servico } from '@/lib/conteudo'

export function GradeFiltravel({ itens }: { itens: Servico[] }) {
  const [filtro, setFiltro] = useState<'todos' | 'festa' | 'tecnico'>('todos')
  const visiveis = filtro === 'todos' ? itens : itens.filter((s) => s.estado === filtro)

  return (
    <>
      <div role="tablist" className="mb-6 flex gap-2 font-mono text-2xs uppercase tracking-[0.15em]">
        {(['todos', 'festa', 'tecnico'] as const).map((f) => (
          <button key={f} role="tab" aria-selected={filtro === f} onClick={() => setFiltro(f)}
                  className="rounded-botao border border-rule px-3 py-2
                             aria-selected:border-ambar aria-selected:text-ambar">
            {f}
          </button>
        ))}
      </div>

      {/* relative é OBRIGATÓRIO: popLayout usa position:absolute + offsetParent (§9) */}
      <ul className="relative grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visiveis.map((s) => (
            <motion.li
              key={s.codigo}                        // key estável, nunca o índice
              layout                                // reflow animado dos sobreviventes
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={T.cut}
              style={{ borderRadius: 14 }}          // raio em style, por causa do layout
              className="border border-rule bg-off p-6"
            >
              <span className="lab text-ambar">{s.codigo}</span>
              <h3 className="mt-2 text-lg">{s.nome}</h3>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </>
  )
}
```

**Variante blackout (a que combina com o brief).** Troque `scale` por `clipPath` — corte
seco de cortina, sem escala e **inteiramente em WAAPI**:

```tsx
initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
exit={{    opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
transition={{ duration: 0.24, ease: steps(3, 'end') }}
```

Três degraus: o card não desliza, ele **acende em três linhas**. `clipPath` está em
`acceleratedValues`, então isto sai da main thread.

**Custo.** Alto, mas só no momento do clique. Cada saída dispara
`getComputedStyle` + medições em `getSnapshotBeforeUpdate`, e injeta um `<style>` em
`document.head` por elemento que sai. Filtrar 13 cards de uma vez = 13 regras CSS
injetadas e removidas. Aceitável para uma interação deliberada; inaceitável se o filtro
mudar em `onChange` de um slider.

**Touch.** Idêntico — é clique.

**Reduced motion.** `scale` salta (positionalKey); `opacity` e `clipPath` animam. Na
variante blackout a degradação é praticamente invisível, porque nada de geometria é usado.
Esta é a razão de preferir `clipPath` a `scale` aqui.

**Não use quando:** só há uma coluna (mobile). Com uma coluna, `popLayout` transforma
cada remoção num salto vertical de toda a lista abaixo. Em mobile, prefira `mode="sync"`
sem `layout`, ou simplesmente troque o conteúdo sem animar. Também não use se o `<ul>`
não puder ser `position: relative` — o `offsetParent` errado joga os cards para o canto
da janela, e o sintoma parece um bug de CSS aleatório.

---

### PADRÃO 6 — Barra de sinal ligada à rolagem (`useScroll` acelerado)

O card mostra o quanto da seção passou. Escrito uma vez, roda em `ScrollTimeline` nativa
no Chrome/Safari e cai em JS no Firefox.

```tsx
'use client'
import { motion, useScroll, useTransform, steps } from 'framer-motion'
import { useRef } from 'react'

export function CardSinal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  // offset TEM que casar com um preset para acelerar (§7).
  // ["start end","end end"] = entry 0%..100%. NÃO use ["start end","end start"].
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })

  // Forma de FAIXA + clamp default → propaga `accelerate`.
  // opacity está em acceleratedValues → vira WAAPI + ScrollTimeline.
  const opacity = useTransform(scrollYProgress, [0, 1], [0.18, 1], { ease: steps(6, 'end') })

  return (
    <div ref={ref} className="card relative">
      <motion.span
        aria-hidden
        style={{ opacity }}
        className="absolute inset-y-4 left-3.5 w-[3px] rounded-cut
                   [background-image:linear-gradient(to_bottom,var(--color-ambar)_0_4px,transparent_4px_10px)]
                   [background-size:100%_10px] [background-repeat:repeat-y]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
```

Seis degraus de opacidade num tubo de pontos = um bargraph de LED. É a imagem exata do
brief, e é uma única linha de `ease`.

**Custo.** Chrome/Safari: **zero main thread** — o navegador conduz a animação pela
ScrollTimeline. Firefox: um listener de scroll passivo + interpolação por frame.

**As quatro condições, de novo, porque cada uma delas some sozinha:** propriedade em
`acceleratedValues` (aqui `opacity` ✓); `useTransform` em faixa ✓; offset casando com
preset ✓; alvo `HTMLElement` ✓. Trocar `opacity` por `scaleY` mataria a aceleração e
ninguém avisa.

**Touch.** Idêntico — é rolagem.

**Reduced motion.** ⚠️ **Não coberto.** `useScroll` não passa por
`animateMotionValue`, então `MotionConfig` não o desliga. Guarda manual:

```tsx
const reduz = useReducedMotion()               // só dentro de efeito, ou…
// …mais simples e sem risco de hidratação: passe pelo CSS
className="motion-reduce:!opacity-100"
```

O utilitário `motion-reduce:` do Tailwind com `!important` sobrescreve o estilo inline
que o Motion escreve. É a saída mais barata e não toca em hidratação.

**Não use quando:** o efeito é decorativo e você aceita perder o Firefox. Aí
`animation-timeline: view()` em CSS puro custa 0 KB e faz o mesmo. `useScroll` se paga
quando o comportamento precisa ser **igual em todo lugar**.

---

### PADRÃO 7 — Chase de pixels no hover (variantes propagando para os filhos)

O tubo de LED acendendo pixel a pixel quando o card recebe o ponteiro. Demonstra
propagação de variante a partir de um gesto — o pai declara o gesto, os filhos só
declaram os dois estados, e o `stagger` faz o chase.

```tsx
'use client'
import { motion, stagger, steps, type Variants } from 'framer-motion'

const PIXELS = 9

const tubo: Variants = {
  apagado: {},
  aceso:   { transition: { delayChildren: stagger(0.035) } },
}

const pixel: Variants = {
  apagado: { opacity: 0.28 },
  aceso:   { opacity: 1, transition: { duration: 0.12, ease: steps(2, 'end') } },
}

export function CardChase({ cor, children }: { cor: string; children: React.ReactNode }) {
  return (
    <motion.a
      href="#"
      initial="apagado"
      whileHover="aceso"
      whileFocus="aceso"        {/* teclado — whileHover sozinho é inacessível */}
      whileTap="aceso"          {/* touch: o chase acontece no toque */}
      style={{ ['--tubo-cor' as string]: cor }}
      className="card group block"
    >
      <span aria-hidden className="absolute inset-y-4 left-3.5 flex w-[3px] flex-col gap-[6px]">
        {Array.from({ length: PIXELS }, (_, i) => (
          <motion.span
            key={i}
            variants={pixel}
            className="h-1 w-full rounded-cut bg-[var(--tubo-cor)]"
          />
        ))}
      </span>
      <div className="relative z-10">{children}</div>
    </motion.a>
  )
}
```

**Por que isto não é possível em CSS:** `transition-delay` escalonado exigiria nove
seletores `:nth-child` escritos à mão, e não haveria como inverter o chase na saída.
Com variantes, `stagger(0.035, { from: 'last' })` inverte com uma palavra.

**Custo.** Nove elementos, nove animações de `opacity` — todas em WAAPI (§2), portanto
fora da main thread. É o padrão mais barato desta lista depois do 1. O DOM extra (9
`<span>`) é o preço; se incomodar, o `.tubo` em `background-image` do `globals.css`
resolve o estado estático por zero nós, e este padrão só entra nos três cards de
destaque.

**Touch.** `whileHover` **nunca dispara** em `pointerType === 'touch'` (§10, código
verificado). Por isso `whileTap="aceso"` está na lista: no celular o chase acontece no
toque, no meio caminho para o WhatsApp. Sem `whileTap`, o padrão simplesmente não existe
para a maioria do tráfego.

**Reduced motion.** `opacity` não está em `positionalKeys`, então o Motion **continua
animando**. Nove opacidades escalonadas ainda são movimento percebido. Aqui é preciso
agir à mão — o jeito limpo, sem tocar em hidratação, é matar o stagger no CSS:

```css
@media (prefers-reduced-motion: reduce) {
  /* os pixels acendem juntos, sem varredura */
  .card [data-pixel] { transition: none !important; }
}
```

…ou, mais honesto, envolver o `stagger` numa constante lida em `useEffect`. **Este é o
caso que prova que `MotionConfig reducedMotion="user"` não é suficiente sozinho.**

**Não use quando:** o card tem mais de um elemento animado por variante. A propagação
desce por toda a subárvore de `motion` components — um `whileHover` no pai dispara
variantes com o mesmo nome em qualquer descendente, inclusive onde você não quer. Nomeie
as variantes de forma específica (`tubo-aceso`, não `aceso`) assim que houver dois
sistemas no mesmo card.

---

### PADRÃO 8 — Blackout no toque (`whileTap` + `clipPath`, o card que funciona no dedo)

Todos os padrões acima que dependem de ponteiro somem no celular. Este é o inverso:
existe **só** para touch e teclado, e é o que a maioria dos visitantes desta landing vai
ver.

```tsx
'use client'
import { motion } from 'framer-motion'
import { zap } from '@/lib/conteudo'
import { T } from './tokens'
import type { Servico } from '@/lib/conteudo'

export function CardToque({ s }: { s: Servico }) {
  return (
    <motion.a
      href={zap(`Oi! Quero orçamento de ${s.nome.toLowerCase()}.`)}
      target="_blank" rel="noopener noreferrer" data-zap
      // SEM geometria: só cor. whileTap com scale flicka durante o scroll (§10).
      whileTap={{ backgroundColor: '#21105C' }}
      transition={{ duration: 0.09, ease: 'linear' }}
      className="card group relative block min-h-[4.5rem]"
    >
      {/* a varredura de confirmação: uma faixa que corta em 3 degraus */}
      <motion.span
        aria-hidden
        initial={false}
        variants={{ rest: { clipPath: 'inset(0 100% 0 0)' }, press: { clipPath: 'inset(0 0% 0 0)' } }}
        transition={{ duration: 0.18, ease: 'linear' }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-ambar"
      />
      <span className="lab text-ambar">{s.codigo}</span>
      <h3 className="mt-2 text-lg">{s.nome}</h3>
      <span className="lab mt-6 inline-flex items-center gap-2 text-ambar">
        Falar no WhatsApp <span aria-hidden>→</span>
      </span>
    </motion.a>
  )
}
```

(Para acionar a variante da faixa, o `<motion.a>` recebe
`initial="rest" whileTap="press" whileFocus="press"` e a faixa só declara `variants`.)

**Por que `backgroundColor` e não `scale`.** `backgroundColor` está em
`acceleratedValues` → WAAPI. E, decisivo: um `scale: 0.98` num `<a>` durante o scroll com
o dedo em cima dispara press → move 3 px → cancela, e o card pisca. Cor não tem essa
falha porque não desloca nada.

**A restrição dura.** A faixa é **âmbar** — ela é dado (confirmação de ação) e toca um
botão. O `backgroundColor` do press é **congo** — é ambiente, é fundo, e não toca rosto
nem botão. Está dentro da regra.

**Custo.** Uma animação de cor + uma de `clipPath`, ambas em WAAPI. ~90 ms. Praticamente
zero.

**Touch.** É o alvo. `isPrimaryPointer` aceita o primeiro ponto de toque; cancela se sair
do elemento — comportamento correto de botão.

**Reduced motion.** `backgroundColor` e `clipPath` não são `positionalKeys`, então
continuam animando. Aqui isso é **desejável**: feedback de toque não é decoração, é
affordance. Uma pessoa com reduced motion ligado ainda precisa saber que o toque
registrou. Não desligue.

**Não use quando:** o card já é um `<button>`/`<a>` com `:active` em CSS que faz a mesma
coisa. Um `transition: background-color 90ms` em CSS custa 0 KB e não precisa de
`'use client'`. Este padrão só se paga se o card **já** for um componente de cliente por
outro motivo — e nesse caso é ganho marginal.

---

## 11. TABELA DE DECISÃO

| # | Padrão | Peso incremental | Main thread | Touch | Reduced motion | Vale a pena? |
|---|---|---|---|---|---|---|
| 1 | Grade em cascata | `domAnimation` | ~0 | ✅ igual | ✅ automático | Só se já houver Motion. `Reveal.tsx` faz por 0,4 KB |
| 2 | Facho no ponteiro | `motion` base | 1 rect/evento | ❌ inexistente | ⚠️ manual | ❌ `LuzCursor.tsx` já faz melhor |
| 3 | Tilt com inércia | `motion` base | 2 springs JS | ❌ inexistente | ⚠️ manual | ⚠️ só fora de rostos |
| 4 | Card → painel | **`domMax`** | 2 medições/transição | ✅ integral | ✅ (doc) | ✅ **impossível sem Motion** |
| 5 | Filtro popLayout | `domMax` (com `layout`) | medições + `<style>` | ✅ igual | ✅ na variante clipPath | ✅ se houver filtro |
| 6 | Scroll quantizado | `domAnimation` + scroll | **0** em Chrome/Safari | ✅ igual | ⚠️ `motion-reduce:` | ✅ se precisar de Firefox |
| 7 | Chase de pixels | `domAnimation` | 0 (WAAPI) | ✅ via `whileTap` | ⚠️ manual | ✅ mais LED da lista |
| 8 | Blackout no toque | `domAnimation` | 0 (WAAPI) | ✅ é o alvo | ✅ manter | ⚠️ CSS `:active` faz igual |

**Se só três entrarem:** 4 (impossível sem Motion), 7 (a assinatura da marca) e 6 (o
único jeito de ter scroll acelerado em Chrome/Safari e funcional em Firefox com um código
só). Esses três justificam os ~35 KB. Os outros cinco não.

---

## 12. CHECKLIST DE IMPLANTAÇÃO

- [ ] `<MotionConfig reducedMotion="user" transition={T.cut}>` num provider de cliente
      fino, para o `layout.tsx` continuar sendo Server Component.
- [ ] `'use client'` em cada arquivo de card. **Nunca** no `page.tsx`.
- [ ] Dicionário `T` num arquivo único. Zero números mágicos espalhados.
- [ ] Se houver `LazyMotion`: `domMax` se algum padrão usar `layout`; senão `domAnimation`
      + `strict`. Abaixo de `domMax`, LazyMotion não compensa.
- [ ] `borderRadius` em `style` em **todo** elemento com `layout`/`layoutId`.
- [ ] `key` = `servico.codigo`, jamais índice.
- [ ] `viewport={{ once: true }}` em tudo com `whileInView`.
- [ ] `whileFocus` ao lado de todo `whileHover`. `whileTap` também, se o efeito importar
      no celular.
- [ ] Nenhum texto de conversão nasce com `opacity: 0` no HTML estático.
- [ ] Guarda manual de reduced motion em tudo que use `MotionValue` (padrões 2, 3, 6, 7).
- [ ] `position: relative` no container de qualquer `AnimatePresence mode="popLayout"`.
- [ ] `bounce: 0` em qualquer spring. Esta marca não quica.

---

## 13. O QUE NÃO CONFIRMEI

- **Ponto exato do código onde `reducedMotion` desliga as *layout animations*.** A doc
  afirma (*"transform and layout animations will be disabled"*) e o comportamento é
  consistente, mas não localizei o gate na projeção. Confirmado só em documentação.
- **Código-fonte oficial do exemplo "Tilt card"** (`motion.dev/tutorials/react-tilt-card`
  e `examples.motion.dev/react/tilt-card`). Ambas as páginas trazem só o markup parcial;
  a fonte completa está atrás do Motion+. **Os números de spring do padrão 3 são meus**,
  não da fonte oficial. As APIs usadas (`useMotionValue`, `useSpring`, `useTransform`,
  `transformPerspective`) estão todas confirmadas na doc.
- **Números de peso *gzipped* reais em produção.** Os valores de §1 são orçamentos de CI
  do `package.json` e as medidas publicadas na doc. Não rodei um build deste projeto para
  medir o delta real no bundle do Next.
- **`gsap@3.15` como alternativa** para estes mesmos oito padrões. Fora do escopo pedido;
  não pesquisado. Vale notar que GSAP não tem equivalente a `layoutId`, e que ter as duas
  libs no bundle por causa de cards seria desperdício.
- **Se `framer-motion` publicará além da 12.x** ou se `motion` passará a ser o único
  pacote mantido. A doc só diz que `motion` é o recomendado; não achei aviso de
  descontinuação de `framer-motion`.
- **Suporte a `linear()` do CSS em `ease` do Motion.** Li `mapEasingToNativeEasing` e ela
  não trata strings `linear(...)` — cairia em `supportedWaapiEasing["linear(...)"]` =
  `undefined`. Confirmado por leitura de código, **não** testado em runtime.

---

## FONTES

Documentação (todas abertas):
`motion.dev/docs/react-upgrade-guide` · `react-quick-start` · `react-reduce-bundle-size` ·
`react-lazy-motion` · `react-motion-component` · `react-motion-config` · `react-animation` ·
`react-transitions` · `stagger` · `react-gestures` · `react-scroll-animations` ·
`react-use-scroll` · `react-use-transform` · `react-use-spring` · `react-use-in-view` ·
`react-motion-value` · `react-use-motion-template` · `react-layout-animations` ·
`react-animate-presence` · `react-accessibility`

Código lido em `node_modules/`: `framer-motion@12.43.0` (`package.json` exports +
bundlesize, `dist/es/render/dom/features-*.mjs`, `value/use-scroll.mjs`,
`value/use-transform.mjs`, `components/AnimatePresence/PopChild.mjs`,
`utils/reduced-motion/*`, `context/MotionConfigContext.mjs`, `m.mjs`) ·
`motion-dom@12.43` (`animation/utils/default-transitions.mjs`,
`animation/waapi/utils/accelerated-values.mjs`, `animation/waapi/supports/waapi.mjs`,
`animation/waapi/easing/map-easing.mjs`, `animation/waapi/utils/linear.mjs`,
`animation/interfaces/visual-element-target.mjs`, `render/VisualElement.mjs`,
`render/utils/keys-position.mjs`, `render/utils/keys-transform.mjs`,
`render/utils/reduced-motion/*`, `gestures/hover.mjs`, `gestures/press/index.mjs`,
`projection/styles/scale-*.mjs`, `projection/node/create-projection-node.mjs`,
`utils/supports/scroll-timeline.mjs`, springDefaults) ·
`motion-utils@12.39` (`easing/steps.mjs`)

Repositório oficial: `motiondivision/motion` →
`dev/react/src/examples/Animation-layout-text-size.tsx` e
`Layout-Projection-scale-correction-border-radius.tsx`

Suporte de navegador: `mdn/browser-compat-data` →
`css/properties/animation-timeline.json` · MDN `animation-timeline` ·
WebKit blog "A guide to Scroll-driven Animations with just CSS" (2025-06-20)
