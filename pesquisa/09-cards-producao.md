# 09 — CARD ANIMADO, CÓDIGO DE PRODUÇÃO · 2025–2026

> Pesquisa para escolha de adaptação. Teto de peso **suspenso pelo cliente**,
> então cada peso aqui vem **medido**, não estimado — e cada um vem com a
> justificativa do que compra.
>
> Documento irmão de `04-cards.md` (que catalogou efeito de borda e luz) e de
> `02-motion.md` (que mediu as libs). Este aqui responde três coisas que
> aqueles dois não responderam: **quando GSAP e quando Motion**, **card que
> expande para painel**, e **quando parar de animar num grid**.

---

## 0. O ESTADO REAL DESTE REPO — MEDIDO, NÃO ASSUMIDO

Antes de recomendar qualquer coisa, o que já está pago.

### 0.1 O `gsap@3.15.0` instalado JÁ TEM TODOS OS PLUGINS

Verificado em `node_modules/gsap/dist/`. Não é preciso token do Club, nem
registro privado, nem `npm config set @gsap:registry`. O pacote **público**
do npm entrega:

```
Flip · SplitText · MorphSVGPlugin · DrawSVGPlugin · InertiaPlugin
ScrollSmoother · ScrollTrigger · Observer · Draggable · MotionPathPlugin
CustomEase · CustomBounce · CustomWiggle · Physics2DPlugin
PhysicsPropsPlugin · ScrambleTextPlugin · GSDevTools · PixiPlugin
```

Confirmação extra: o `SplitText.min.js` instalado contém as strings
`autoSplit`, `onSplit`, `mask`, `aria-label`, `deepSlice` — ou seja **é a
reescrita 3.13+**, não o SplitText antigo. Isso importa para acessibilidade
(o `aria-label` automático resolve o problema clássico de leitor de tela
soletrando letra por letra).

### 0.2 Peso real dos plugins — `gzip -9` sobre o arquivo instalado

| Arquivo | raw | **gzip** | brotli |
|---|---:|---:|---:|
| `gsap.min.js` (core + CSSPlugin) | 72.927 | **28.314** | 25.706 |
| `ScrollTrigger.min.js` | 44.575 | **17.982** | 16.224 |
| `Draggable.min.js` | 35.762 | **13.504** | 12.136 |
| `Flip.min.js` | 25.534 | **9.706** | 8.730 |
| `MorphSVGPlugin.min.js` | 21.195 | **9.553** | 8.672 |
| `ScrollSmoother.min.js` | 13.373 | **5.531** | 4.948 |
| `Observer.min.js` | 10.014 | **4.320** | 3.857 |
| `CustomEase.min.js` | 7.143 | **3.673** | 3.326 |
| `SplitText.min.js` | 7.732 | **3.658** | 3.257 |
| `InertiaPlugin.min.js` | 7.335 | **3.260** | 2.945 |
| `DrawSVGPlugin.min.js` | 4.351 | **2.211** | 1.948 |

Método: `gzip -9 -c <arquivo> | wc -c` em `node_modules/gsap/dist/`.
Reproduzível. Não é bundlephobia, não é chute.

### 0.3 Peso real da Motion — os *size rollups* que a própria lib publica

O `framer-motion@12.43.0` publica em `dist/` arquivos `size-rollup-*.js` que
são **bundles reais já tree-shaken**, usados pelo CI da lib para medir
tamanho. Medindo eles:

| Rollup | o que é | raw | **gzip** |
|---|---|---:|---:|
| `size-rollup-motion.js` | `motion` completo (o que este repo importa hoje) | 123.725 | **39.415** |
| `size-rollup-dom-max.js` | features `domMax` (layout projection + drag) | 84.869 | **27.471** |
| `size-rollup-animate.js` | `animate()` standalone | 63.184 | **22.127** |
| `size-rollup-dom-animation.js` | features `domAnimation` (sem layout) | 37.526 | **14.025** |
| `size-rollup-m.js` | `m` + `LazyMotion` (só a casca) | 16.223 | **6.426** |
| `size-rollup-scroll.js` | `scroll()` | 15.864 | **6.316** |
| `size-rollup-waapi-animate.js` | `animate()` mini (WAAPI) | 8.134 | **3.256** |

**O número que decide a seção 2 deste documento:**

```
domMax (27.471) − domAnimation (14.025) = 13.446 bytes gzip
```

**13,4 KB gzip é o preço exato de `layoutId` + `drag` na Motion.**
E `Flip.min.js` custa **9,7 KB gzip**. Os dois fazem FLIP. Guarde isso.

#### 0.3-bis — ARMADILHA: os *size rollups* NÃO somam linearmente

Os rollups acima são os probes de CI da própria lib e **excluem o
`AnimatePresence`** e parte do runtime compartilhado. Bundle real, montado
com `esbuild --bundle --minify --format=esm` e React externalizado:

| Entrada real | min | **gzip** |
|---|---:|---:|
| `motion.div` + `AnimatePresence` + `layout` + `drag` (import cheio) | 128.389 | **42.653** |
| `LazyMotion` + `domAnimation` + `m` + `AnimatePresence` (import estático) | 81.605 | **29.191** |
| `LazyMotion` + `domMax` + `m` + `layout` + `drag` (import estático) | 128.870 | **42.816** |

> ### ⚠️ CORREÇÃO IMPORTANTE
> **`LazyMotion` + `domMax` importado ESTATICAMENTE não é menor que o
> `motion` cheio.** 42.816 contra 42.653 — é 163 bytes **a mais**. Todo
> tutorial que diz "use LazyMotion e economize" está falando só do
> `domAnimation`.
>
> - **`domAnimation` estático: 29,2 KB — economia real de 13,5 KB.** ✅
> - **`domMax` estático: 42,8 KB — economia zero.** ❌
> - **A economia do `domMax` só existe com import DINÂMICO:**
>   ```tsx
>   <LazyMotion strict features={() => import('framer-motion').then(m => m.domMax)}>
>   ```
>   Aí o payload inicial é só a casca `m` (~6 KB gzip) e o resto chega
>   assíncrono. Para uma landing onde o menu e o painel não estão na
>   primeira dobra, **esta é a resposta certa** — não o import estático.

**Custo honesto de `layoutId`, então:**

```
lean  (domAnimation estatico) ......... 29,2 KB
com layoutId (domMax estatico) ........ 42,8 KB
                                        ────────
preco real do layoutId ................ +13,6 KB gzip

Flip sobre o gsap core (ja pago) ...... + 9,7 KB gzip
```

**Flip é 3,9 KB mais barato que `layoutId`** se você fizer a limpeza do
Motion. Se **não** fizer (estado atual, `motion` cheio), `layoutId` sai de
graça, porque o `domMax` já está lá dentro. Os bytes não decidem: a
diferença é pequena nos dois sentidos. **Quem decide é o mecanismo
(seção 2.2).**

### 0.4 O que o repo importa hoje

```
components/LequeEquipe.tsx  →  import gsap from 'gsap'          ~28,3 KB gzip
components/MenuLiquido.tsx  →  import { motion, AnimatePresence }
                                 from 'framer-motion'           ~39,4 KB gzip
                                                                ─────────────
                                                       total   ~67,7 KB gzip
```

Ou seja: **a página já paga 67,7 KB gzip de runtime de animação para dois
componentes.** Um leque de fotos e um menu. Esse é o custo afundado real, e
é o argumento honesto a favor de usar mais os dois — não a favor de somar um
terceiro.

> **Correção barata, independente de tudo neste documento:** o
> `MenuLiquido` não usa `layout` nem `layoutId` nem `drag` — só `animate`,
> `initial`, `exit`, `whileTap`. Isso é `domAnimation`. Trocar `motion`
> por `LazyMotion` + `domAnimation` + `m` derruba **42,7 → 29,2 KB gzip**
> (bundle real, não rollup). **−13,5 KB por meia hora de trabalho.**
> Código na seção 6.4.

---

## 1. (a) GSAP OU MOTION — O CRITÉRIO OBJETIVO

Existe critério objetivo, e não é "GSAP é mais rápido". É este:

> ### A REGRA
> **Motion é dona do que o React re-renderiza. GSAP é dono do que o React
> não sabe que mudou.**

Reformulado como teste de uma pergunta só:

**"A animação é consequência de uma mudança de estado do React?"**

- **Sim** → Motion. O estado mudou, o DOM mudou, a Motion interpola entre o
  antes e o depois. `AnimatePresence` para saída, `layoutId` para
  compartilhado, variants para orquestração.
- **Não** → GSAP. Ponteiro, rolagem, física, tempo, timeline. Coisas que
  acontecem 60 vezes por segundo e que, se virassem `setState`, causariam
  60 re-renders por segundo.

### 1.1 A tabela de decisão

| Situação | Dona | Por quê — o motivo técnico, não a preferência |
|---|---|---|
| Item entra/sai de uma lista React | **Motion** | `AnimatePresence` segura o nó no DOM depois do unmount. Fazer isso na mão com GSAP significa duplicar o nó ou adiar o `setState`, e as duas coisas dão bug de dupla-render |
| Card vira painel (shared element) | **Motion** *se React já monta os dois*; **Flip** se não | seção 2 inteira |
| Hover que segue o cursor | **GSAP** (`quickTo`) ou CSS var | `mousemove` em `setState` = re-render por frame. `gsap.quickTo` escreve direto, zero render do React |
| Sequência com 5+ passos e sobreposição | **GSAP** | `gsap.timeline()` com labels e position parameter (`"<"`, `"-=0.2"`). A Motion não tem timeline: ela tem `delay`, e coordenar delay na mão é somar milissegundos à mão |
| Scrub de rolagem, pin, snap | **GSAP** ScrollTrigger | `useScroll` da Motion lê progresso; ScrollTrigger **pina, prende e reverte** com `invalidateOnRefresh`. Não é a mesma categoria de ferramenta |
| Arrastar com inércia e snap | **GSAP** Draggable + Inertia | `drag` da Motion tem `dragMomentum` (decaimento exponencial fixo). Draggable+Inertia tem `throwProps` real, `snap` com função, e `inertia: {x:{end: fn}}` |
| Texto quebrado em linha/palavra/char | **GSAP** SplitText | seção 3.2 |
| Morph de path SVG | **GSAP** MorphSVG | a Motion **não tem**. Ela interpola `d` como string complexa: só funciona se os dois paths tiverem exatamente os mesmos comandos e a mesma contagem de pontos. Fora disso, salta |
| Estado de UI (aberto/fechado, ativo) | **Motion** | é `animate={{...}}` derivado de prop. Uma linha |
| Entrada por viewport | **nenhuma das duas** | `whileInView` custa a Motion inteira. Este repo já tem `Reveal` por IntersectionObserver (~0,4 KB). Não regrida |

### 1.2 O que ACONTECE se as duas animarem o mesmo elemento

Não é "pode dar conflito". É determinístico e eu verifiquei no código-fonte
instalado. **As duas escrevem a propriedade `transform` inteira, como
string, e nenhuma das duas lê a contribuição da outra.**

**Motion** — `node_modules/motion-dom/dist/es/render/html/utils/build-transform.mjs`:

```js
export function buildTransform(latestValues, transform, transformTemplate) {
    let transformString = ""
    for (let i = 0; i < numTransforms; i++) {
        const key = transformPropOrder[i]
        const value = latestValues[key]        // ← SÓ o estado interno da Motion
        ...
        transformString += `${transformName}(${valueAsType}) `
    }
    return transformString                      // ← escrito em style.transform inteiro
}
```

**GSAP** — `node_modules/gsap/src/CSSPlugin.js`, ~linha 790–814: monta
`transforms` a partir do `cache` interno (`_gsap`) e escreve o
`transform` inteiro também.

Consequência 1 — **o último a escrever no frame ganha, e o outro some.**
Não há mescla. Não há aditivo. Se a Motion roda depois do GSAP naquele
frame, o `translateY` do GSAP desaparece naquele frame e volta no próximo,
quando o GSAP escrever de novo. Isso é **tremor a 60 Hz**, não é
"animação estranha".

Consequência 2 — **a ordem de composição é DIFERENTE nas duas.** Isto é o
detalhe que quase ninguém menciona e é o argumento definitivo:

```
GSAP    (CSSPlugin.js:790–814)
  perspective() translate(xPercent%,yPercent%) translate3d(x,y,z)
  rotate() rotateY() rotateX() skew() scale()
                                       ↑ scale por ÚLTIMO

Motion  (motion-dom/render/utils/keys-transform.mjs)
  transformPerspective, x, y, z, translateX/Y/Z,
  scale, scaleX, scaleY, rotate, rotateX/Y/Z, skew...
                ↑ scale ANTES de rotate
```

Multiplicação de matriz não é comutativa: `rotate(30deg) scale(2,1)` **não é**
`scale(2,1) rotate(30deg)`. Logo, mesmo que as duas libs escrevessem
exatamente os mesmos números, **o resultado renderizado seria diferente**
sempre que houver escala não-uniforme junto de rotação. Não existe conserto.

Consequência 3 — GSAP **apaga as longhands independentes**. Ainda em
`CSSPlugin.js:616`, ao ler o estado inicial o GSAP dobra `translate`,
`rotate` e `scale` (as propriedades CSS separadas) para dentro do
`transform` shorthand. Se você animar `translate` por CSS/Motion e `x` por
GSAP no mesmo nó, o GSAP consome o seu valor de CSS na primeira leitura e
ele nunca mais existe.

Consequência 4 — **são DOIS `requestAnimationFrame` independentes, e a
ordem entre eles não é estável.** O GSAP roda tudo num único rAF
(`gsap-core.js`: `_ticker.add(Timeline.updateRoot)`). A Motion tem o
próprio batcher, com pipeline ordenado
(`setup → read → resolveKeyframes → preUpdate → update → preRender →
render → postRender`). Quem escreve por último no frame depende da **ordem
de registro dos dois callbacks de rAF** — ou seja, da ordem de import — e
**pode inverter** quando qualquer um dos dois dorme e acorda (o GSAP tem
`_ticker.sleep()`/`wake()` sob `autoSleep`; a Motion para de agendar
quando as filas esvaziam). O vencedor não é estável ao longo da vida da
página.

### 1.2-bis O modo de falha PIOR, que não é transform

Aqui está a correção de uma crença comum — inclusive da minha primeira
versão desta seção. **A Motion não usa WAAPI para transforms
independentes.** Verificado em
`node_modules/motion-dom/dist/es/animation/waapi/utils/accelerated-values.mjs`:

```js
const acceleratedValues = new Set([
    "opacity", "clipPath", "filter", "transform", "backgroundColor",
]);
```

O gate é `acceleratedValues.has(name)` onde `name` é a chave da
MotionValue. Animar `x` dá `name === "x"`, que **não está no conjunto**.
Logo:

| o que você anima na Motion | por onde ela roda |
|---|---|
| `x`, `y`, `scale`, `rotate`, `skewX`… | **JSAnimation**, no rAF próprio da Motion → escreve `style.transform` |
| `opacity`, `filter`, `clipPath`, `backgroundColor`, `transform` como string | **WAAPI** (`NativeAnimationExtended`) |

E é aí que mora o problema sério:

> ### **Uma animação WAAPI fica ACIMA do inline style na cascata enquanto
> toca.** Se a Motion estiver animando `opacity` por WAAPI e o GSAP
> escrever `style.opacity`, o GSAP **não tem efeito visível nenhum** — e
> o estado interno dele diz que funcionou. Depois, quando a animação WAAPI
> termina e faz commit, o valor **salta**.

Isso é pior que o clobbering de transform porque é **silencioso**. No
transform você vê tremor e vai investigar. Na opacidade você vê "nada
acontece", conclui que errou o seletor, e perde uma tarde.

(A Motion também recusa o caminho WAAPI quando há `transformTemplate`,
`onUpdate`, `repeatDelay`, `repeatType: "mirror"`, `damping: 0`,
`type: "inertia"`, ou quando o alvo não é `HTMLElement`/`SVGElement`. Ou
seja: **qual caminho roda depende da config**, o que torna o bug
intermitente entre componentes.)

Consequência prática: **`overwrite: 'auto'` do GSAP não salva ninguém.**
Ele mata só tweens do *próprio GSAP* que conflitam. Não enxerga
MotionValue nem `Animation` do WAAPI. E vice-versa.

### 1.3 A regra de propriedade — como conviver

**Um elemento tem um dono. Sempre.** Se precisar de dois efeitos de fontes
diferentes no mesmo lugar visual, **use dois elementos aninhados**:

```tsx
{/* dono: Motion — layout, entrada, saída */}
<motion.div layoutId="painel-led" data-dono="motion">
  {/* dono: GSAP — ponteiro, timeline, física */}
  <div ref={interno} data-dono="gsap">
    …
  </div>
</motion.div>
```

O wrapper externo transforma; o interno transforma; o navegador compõe.
Zero conflito, custo zero, e fica **legível para quem mexer depois** — que é
metade do motivo de escrever a regra.

**"Canais separados" NÃO é alternativa segura.** A tentação é dizer "GSAP
fica com `transform`, Motion fica com `opacity`". Depois da seção 1.2-bis
está claro por quê não: `opacity` é justamente onde a Motion usa **WAAPI**,
que ganha da cascata de inline style. Você trocaria um bug ruidoso por um
bug mudo. **Aninhe.**

**A única ponte legítima: MotionValue, nunca style.** Se o GSAP precisar
mesmo dirigir um elemento da Motion, tweene um objeto simples e empurre o
número para dentro:

```tsx
const x = useMotionValue(0)

gsap.to({ v: 0 }, {
  v: 200, duration: 1, ease: 'power3.out',
  onUpdate() { x.set(this.targets()[0].v) },
})

// <m.div style={{ x }} />   ← a Motion continua sendo a UNICA a escrever transform
```

O GSAP contribui só um número; a Motion continua dona do `style`. (Bônus:
uma MotionValue com `onUpdate` **não é elegível a WAAPI**, o que aqui é
exatamente o que se quer.) A ponte inversa:
`useMotionValueEvent(x, 'change', v => gsap.set(elGsap, { x: v }))`.

**Entrega de posse** (raro, evite): quem solta tem de soltar de verdade.
GSAP → Motion: `gsap.set(el, { clearProps: 'transform,willChange' })` antes
de a Motion inicializar. Motion → GSAP: desmonte o componente `m.*` e só
então estabeleça a base com `gsap.set`. Sempre num frame em que nenhum dos
dois está animando.

**Nunca deixe `layout`/`layoutId` da Motion e `Flip` do GSAP na mesma
subárvore.** Os dois medem-e-invertem. Um por subárvore, sempre.

**`will-change`:** o GSAP não escreve `will-change` em lugar nenhum
(`grep willChange node_modules/gsap/CSSPlugin.js` → vazio). A dica de
camada dele é `force3D` (padrão `"auto"`), que usa `translate3d`. Então
aqui não há briga — mas também não há proteção: elemento animado por GSAP
não ganha hint de compositor a menos que você escreva no CSS. Este repo já
põe `will-change: transform` no `.leque-card`. Mantenha o padrão.

### 1.4 Reduced motion — o padrão certo em cada uma

**Motion** — `MotionConfig reducedMotion="user"`. Verificado na doc oficial
(motion.dev/docs/react-motion-config): *"Transform and layout animations
will be disabled. Other animations, like opacity and backgroundColor, will
persist."* Ou seja: **nada se move, mas nada fica invisível.** É exatamente a
lei da casa deste projeto. Uma linha no `layout.tsx`:

```tsx
<MotionConfig reducedMotion="user">{children}</MotionConfig>
```

**GSAP** — `gsap.matchMedia()` com a condição como *conditions object*:

```ts
const mm = gsap.matchMedia()
mm.add({
  fino:    '(hover: hover) and (pointer: fine)',
  reduzir: '(prefers-reduced-motion: reduce)',
}, (ctx) => {
  const { fino, reduzir } = ctx.conditions as Record<string, boolean>
  if (reduzir) { gsap.set(alvos, estadoFinal); return }   // corte seco
  if (!fino) return                                        // hover nem existe
  …
}, escopo)
return () => mm.revert()
```

`matchMedia` cria um `gsap.context()` por dentro, então `mm.revert()` limpa
tudo — inclusive os estilos inline que o GSAP escreveu. É o único cleanup de
que você precisa.

> **Nota sobre o `globals.css` atual.** O reset atômico
> (`*,*::before,*::after { animation-duration:1ms !important }`) desliga a
> animação, mas **não desfaz um `gsap.set()`** — GSAP escreve inline style,
> que não é transição. Componente com GSAP **precisa** do ramo explícito de
> `reduzir` acima. O CSS não cobre.

---

## 2. (b) O CARD QUE EXPANDE PARA PAINEL — `layoutId` vs `Flip`

O padrão profissional tem nome: **shared element transition**, e a técnica
por baixo dos dois é a mesma — **FLIP** (First, Last, Invert, Play), de
Paul Lewis, 2015. Mede a caixa antes, mede depois, aplica a transformada
inversa, anima até a identidade. Ninguém anima `width`/`top`: anima
`transform`, que é composto na GPU.

As duas implementações que este repo pode usar de graça fazem exatamente
isso. A diferença está em **quem controla o DOM**.

### 2.1 A comparação honesta

| | **Motion `layoutId`** | **GSAP `Flip`** |
|---|---|---|
| Custo adicional aqui | +13,4 KB gzip (`domMax` − `domAnimation`) | **+9,7 KB gzip** |
| Quem move o nó | **React**. Você desmonta o card e monta o painel; a Motion casa pelo `layoutId` | **você**. `Flip.getState()` → mexe no DOM como quiser → `Flip.from()` |
| Muda de PAI no DOM | funciona (é o caso de uso) | funciona, e é o caso de uso canônico — `Flip.from(state, { absolute: true })` |
| Redimensiona com | **`scale`** — sempre | `width`/`height` por padrão; `scale: true` é **opt-in** |
| Distorce texto/borda? | **sim**, e você corrige com `layout` nos filhos | **não**, no modo padrão. Layout real, sem correção |
| Corrige `border-radius`/`box-shadow` | sim, automático — **mas só se vier de `style`/`animate`**, não de classe CSS | não precisa corrigir: não escala |
| SVG | **não suportado** (doc oficial) | suportado |
| Elemento fora do React | impossível | trivial |
| Interrupção no meio | boa (motion values são contínuas) | boa (`Flip.killFlipsOf`, `Flip.isFlipping`) |
| Muitos elementos de uma vez | 1 `layoutId` por par | `Flip.batch()` coordena N flips num ciclo de leitura |
| `position: fixed` no caminho | precisa de `layoutRoot` | `absolute: true` resolve |
| Container rolável | precisa de `layoutScroll` | resolve sozinho (mede viewport) |
| Linhas de código no caso simples | **~8** | ~25 |

Mais três diferenças que a doc do GSAP confirma e que a tabela não coube:

- **`data-flip-id`** — o Flip correlaciona elementos por **atributo**, não
  por posição na árvore. É por isso que reparentar funciona: o nó pode ir
  para qualquer lugar do DOM. `layoutId` casa dois **componentes React**;
  um nó genuinamente reparentado está fora do modelo dela.
- **`Flip.from()` devolve uma Timeline.** Você pode `.add()` mais coisa
  nela, aninhar, dar `timeScale()`, ou scrubar com ScrollTrigger. A
  animação de layout da Motion é efeito colateral de render — não é
  objeto, não compõe.
- **Flip não faz transform 3D** (`rotationX/Y`, `z`) e exige
  `box-sizing: border-box`. Este repo usa o reset do Tailwind, então
  `border-box` já é padrão. ✔

### 2.2 O veredito — e ele mudou depois de medir

**Primeiro, a correção.** A conclusão intuitiva ("a Motion já está paga,
então `layoutId` é de graça") **não sobrevive à medição da seção 0.3-bis**:

```
Motion enxuta   (LazyMotion + domAnimation, estatico) ....  29,2 KB gzip
Motion c/ layout(LazyMotion + domMax,       estatico) ....  42,8 KB gzip
                                                            ────────────
preco real do layoutId ..................................  +13,6 KB

Flip sobre o gsap core, que ja esta pago ................  + 9,7 KB
```

**Flip é 3,9 KB mais barato que `layoutId`.** Se a página mantiver o
import cheio de `motion` (estado de hoje), aí sim `layoutId` sai de graça —
mas só porque você já está pagando 13,5 KB desnecessários. Não é economia,
é desperdício preexistente.

**Então o critério não é peso. É mecanismo:**

> **Se os dois estados são componentes React que montam e desmontam →
> `layoutId`.** Oito linhas contra vinte e cinco, e a Motion cuida da
> orquestração de presença sozinha.
>
> **Se o nó não é React, ou o texto não pode distorcer, ou são N itens
> reorganizando → `Flip`.**

**`Flip` ganha em três casos concretos, e só neles:**

1. **O nó não é React** — a capa do YouTube que precisa virar palco
   (seção 6.3). O `<iframe>` só pode existir depois do clique; o
   `layoutId` precisaria que os dois estados fossem React ao mesmo tempo.
2. **O texto não pode distorcer.** `Zodiak` em `--text-2xl` (44px) esticado
   por `scale` e depois "corrigido" fica visivelmente mole por ~300 ms. O
   Flip no modo padrão anima `width`/`height` e **reflui de verdade**. Para
   um site que vende precisão técnica, isso não é detalhe.
3. **N elementos reorganizam de uma vez** — filtrar a galeria por tipo e
   ver os itens se recolocarem. `Flip.batch()` faz uma leitura e uma
   escrita para o conjunto. N `layoutId` fazem N projeções.

### 2.3 Código — `layoutId`, adaptado aos tokens

Fonte da API: https://motion.dev/docs/react-layout-animations (verificada).

```tsx
'use client'

import { useState, useId } from 'react'
import { LazyMotion, domMax, m, AnimatePresence } from 'framer-motion'
import type { Servico } from '@/lib/conteudo'

/**
 * CARD QUE VIRA PAINEL — shared layout pela Motion.
 *
 * Por que `m` e nao `motion`: o `m` nao carrega feature nenhuma; as
 * features chegam por `LazyMotion features={domMax}`. Medido: 6,4 + 27,5
 * = 33,9 KB gzip, contra 39,4 do `motion` completo. E o `domMax` e o
 * unico que traz layout projection — sem ele `layoutId` nao faz nada
 * e falha em SILENCIO.
 *
 * `border-radius` vai em `style`, nunca em classe: a doc e explicita —
 * a correcao de distorcao so acontece para valores que a Motion
 * enxerga em `style`/`animate`.
 */
export function PainelExpansivel({ itens }: { itens: Servico[] }) {
  const [aberto, setAberto] = useState<string | null>(null)
  const grupo = useId()                       // isola os layoutId por instancia
  const item = itens.find((s) => s.ancora === aberto)

  return (
    <LazyMotion features={domMax} strict>
      <div className="grid gap-5 md:grid-cols-3">
        {itens.map((s) => (
          <m.button
            key={s.ancora}
            type="button"
            layoutId={`${grupo}-${s.ancora}`}
            onClick={() => setAberto(s.ancora)}
            aria-expanded={aberto === s.ancora}
            className="card text-left"
            /* raio no style, nao na classe — exigencia da correcao */
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            {/* `layout` no filho cancela a distorcao de escala do pai */}
            <m.span layout="position" className="lab text-ambar">{s.codigo}</m.span>
            <m.h3 layout="position" className="mt-2 text-lg">{s.nome}</m.h3>
          </m.button>
        ))}
      </div>

      <AnimatePresence>
        {item && (
          <>
            {/* blackout: opacidade pura, sobrevive a reduced-motion */}
            <m.div
              className="fixed inset-0 z-40 bg-void/80"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAberto(null)}
            />
            <m.div
              layoutId={`${grupo}-${item.ancora}`}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-2xl
                         -translate-y-1/2 border border-rule bg-off p-8"
              style={{ borderRadius: 'var(--radius-placa)' }}
              role="dialog" aria-modal="true" aria-label={item.nome}
            >
              <m.span layout="position" className="lab text-ambar">{item.codigo}</m.span>
              <m.h3 layout="position" className="mt-2 text-xl">{item.nome}</m.h3>
              <m.p layout="position" className="mt-4 text-xs text-branco-2">{item.desc}</m.p>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}
```

**Armadilhas que a doc lista e que mordem aqui:**

- `layout` **não funciona em `display: inline`** — o `.lab` tem que ser
  `inline-block` ou `block`.
- **SVG não é suportado.** A seta `→` deste projeto é texto, então passa.
  Se virar `<svg>`, não pode receber `layout`.
- **`box-shadow` só é corrigido se vier de `style`.** O `.card` do
  `globals.css` põe `box-shadow` por classe → durante o flip ele estica.
  Nesta variante do card, mova o `box-shadow` para `style` ou aceite o
  esticamento (é ~300 ms num inset de 1px; na prática não se vê).
- **Animação de layout é bloqueada durante resize horizontal da janela**
  (doc oficial). Não é bug, é otimização.

**Degradação:**
- **touch** — é `<button>` com `onClick`. Funciona igual. Não há hover no
  caminho crítico.
- **`prefers-reduced-motion`** — `MotionConfig reducedMotion="user"` no
  `layout.tsx` desliga transform **e layout**. O painel passa a **aparecer**
  em vez de crescer. Continua visível e utilizável. Corte seco, que é a
  lei da casa.
- **sem JS** — não abre. Por isso o card deve ser `<a href="#ancora">`
  progressivamente melhorado, ou o painel deve existir como `<details>`.

### 2.4 Código — `Flip`, adaptado aos tokens

Fonte da API: https://gsap.com/docs/v3/Plugins/Flip/ (verificada). Opções
confirmadas na doc: `absolute`, `absoluteOnLeave`, `nested`, `targets`,
`scale`, `simple`, `props`, `spin`, `prune`, `toggleClass`, `zIndex`,
`fade`, `onEnter`, `onLeave`; e os estáticos `Flip.fit()`, `Flip.batch()`,
`Flip.makeAbsolute()`, `Flip.isFlipping()`, `Flip.killFlipsOf()`.

```tsx
'use client'

import { useRef, useCallback, useEffect } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(Flip)

/**
 * O MESMO EFEITO, PELO FLIP.
 *
 * Diferenca que importa: aqui o card ANIMA width/height de verdade —
 * o texto reflui, nao estica. `scale: true` existe e e mais barato de
 * pintar, mas distorce a Zodiak. Nao usamos.
 *
 * `absolute: true` tira o alvo do fluxo durante o flip, senao os irmaos
 * do grid saltam de uma vez enquanto ele viaja.
 */
export function usarFlip() {
  const emVoo = useRef(false)

  const expandir = useCallback((alvo: HTMLElement, mutar: () => void) => {
    if (emVoo.current) return
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches

    // F + L: mede antes, incluindo as props que nao sao geometria
    const estado = Flip.getState(alvo, { props: 'borderRadius,backgroundColor' })
    mutar()                                    // troca classe / move no DOM

    if (reduzir) return                        // corte seco: ja esta no lugar

    emVoo.current = true
    Flip.from(estado, {
      duration: 0.52,
      ease: 'power3.inOut',
      absolute: true,        // tira do fluxo — o grid nao salta
      nested: true,          // pai e filho animando: nao soma offset duas vezes
      props: 'borderRadius,backgroundColor',
      toggleClass: 'flipando',                 // gancho de CSS durante o voo
      onComplete: () => { emVoo.current = false },
    })
  }, [])

  useEffect(() => () => { Flip.killFlipsOf('.card') }, [])
  return expandir
}
```

```css
/* durante o voo: nada de facho nem de bisel — sao ruido em movimento */
.flipando .luz  { opacity: 0 !important; }
.flipando       { box-shadow: none; }
```

---

## 3. (c) GRID COM MUITOS ITENS — A REGRA DE QUANDO PARAR

Esta é a pergunta mais mal respondida da internet, então vou responder com
aritmética em vez de gosto.

### 3.1 Os dois números que fecham a conta

**Número 1 — o limite perceptual da NN/g.**
https://www.nngroup.com/articles/animation-duration/ (verificada):
*"a range of 100–400 ms is appropriate, with 400 ms being a very slow
animation, to be used only for big movements across large screens."* E a
regra clássica de tempo de resposta: **1 s é o limite do fluxo de
pensamento**. Uma sequência inteira de entrada não pode passar disso sem
virar espera.

**Número 2 — o piso do que se lê como sequência.**
Para o olho perceber "um depois do outro" e não "todos juntos", o atraso
entre vizinhos precisa ser de pelo menos **~2 frames ≈ 33 ms**; na prática,
**50 ms** é onde o escalonamento fica legível.

### 3.2 A regra, derivada

```
duração de sequência  =  duração do item  +  atraso × (N − 1)

teto de sequência ......... 1000 ms   (NN/g, limite do fluxo)
duração do item ...........  280 ms   (dentro da faixa 100–400)
orçamento de espalhamento .  720 ms
atraso mínimo legível .....   50 ms

N_máx = 720 / 50 + 1  ≈  15
```

> ### **ACIMA DE ~14 ITENS, O ESCALONAMENTO POR ITEM DEIXA DE EXISTIR
> COMO EFEITO — ou ele estoura 1 s, ou o atraso cai abaixo do que se vê.**
> As duas saídas são ruins. A saída boa é **mudar a unidade escalonada**.

**A escada, então:**

| N | o que escalona | atraso |
|---|---|---|
| **≤ 8** | o item | 60–80 ms |
| **9–14** | o item, com `amount` fixo (não `each`) | 720/(N−1) ms |
| **15–40** | a **linha** ou o **bloco**, não o item | 90–120 ms por linha |
| **> 40** | **nada entra animado.** Um fade no bloco inteiro, e ponto | — |

### 3.3 A tradução técnica: `amount`, nunca `each`

Fonte: https://gsap.com/docs/v3/Staggers/ (verificada). A diferença exata,
citando a doc: `each` é o atraso **entre elementos consecutivos** — com
`each: 1` e 100 elementos, a sequência dura 100 s. `amount` é o tempo
**total distribuído** — com `amount: 1` e 100 elementos, o GSAP calcula
0,01 s entre cada um, e **a sequência dura 1 s tenha 10 ou 1.000 elementos**.

> **`each` é uma bomba-relógio de conteúdo.** O dia em que o cliente
> cadastrar o 14º serviço, a animação passa de 0,72 s para 0,78 s se for
> `amount`, e de 0,72 s para 1,04 s se for `each`. `amount` é a única forma
> de um grid dirigido por CMS não degradar sozinho.

```ts
// ERRADO — a duracao cresce com o conteudo
gsap.from('.item', { y: 14, opacity: 0, duration: .28, stagger: 0.06 })

// CERTO — a duracao e um contrato
gsap.from('.item', {
  y: 14, opacity: 0, duration: .28,
  stagger: { amount: 0.72, from: 'start', grid: 'auto', axis: 'y' },
})
```

`grid: 'auto'` + `axis: 'y'` faz o GSAP medir com `getBoundingClientRect()`
e escalonar **por linha visual**, não por índice do array. Isso é
exatamente o degrau "15–40" da tabela acima, e resolve sozinho o problema
de o grid ter 3 colunas no desktop e 1 no celular.

### 3.4 As outras três regras de parada, que ninguém escreve

**Regra do movimento simultâneo.** Nunca mais de **um** elemento em
movimento *não iniciado pelo usuário* na dobra visível. Entrada é uma coisa
só por vez; hover é do usuário e portanto não conta. Um grid com 12
`::after` girando em loop não é "vivo", é uma sala com 12 pessoas falando.

**Regra do laço.** Animação em `infinite` sem interação **não existe** neste
projeto — o `globals.css` já registra o porquê no comentário do `.led`
("loop eterno custa bateria com o telefone parado na mesa"). Vale para grid:
nada de borda correndo em N cards ao mesmo tempo. `BorderBeam` da Magic UI
e `ShineBorder` reprovam por isso, e reprovam **N vezes**.

**Regra da diferença.** Se todos os itens fazem a mesma coisa, o efeito
carrega zero informação — vira textura. A saída boa não é animar menos:
é **animar um diferente**. Este repo já faz isso certo, e é a resposta
inteira da seção 6.1: 3 cards em destaque **têm** facho; as 10 linhas
**não têm**. A diferença é o que informa.

**Regra do dispositivo.** `pointer: coarse` não tem hover. Se o efeito é
hover-only, no celular ele **não existe** — então o estado padrão precisa
já entregar a informação. O `globals.css` deste repo faz isso na `.linha__seta`
(`@media (hover: none) { opacity: 1 }`). Repita o padrão em qualquer card novo.

---

## 4. GSAP OFICIAL — ONDE GSAP GANHA DE VERDADE, NUM CARD

Licença: a mudança é real e já está no npm público. **O `gsap@3.15.0` deste
repo já traz todos os plugins abaixo** (verificação em `node_modules`,
seção 0.1). Nenhuma instalação nova. Só `import` + `registerPlugin`.

O critério desta seção: **não listo o que a Motion também faz.** Listo só o
que ela **não faz** ou faz visivelmente pior.

### 4.1 `Flip` — +9,7 KB gzip

Doc: https://gsap.com/docs/v3/Plugins/Flip/ (verificada)

**Onde GANHA da Motion:**

1. **Anima nó que o React não renderiza.** É o desbloqueio da galeria
   (seção 6.3): a capa `<img>` do YouTube precisa virar palco antes do
   `<iframe>` existir. Com `layoutId` os dois teriam que ser React ao
   mesmo tempo — e o requisito duro do projeto é que o iframe só nasça no
   clique.
2. **Anima `width`/`height`, não `scale`.** A Motion **sempre** usa
   `scale` (doc: *"Because layout animations use `transform: scale()`,
   they can sometimes visually distort children"*) e depois corrige. O Flip
   escala só se você pedir `scale: true`. Para display serifada em 44 px,
   a diferença é visível.
3. **`Flip.batch()`** — N elementos reorganizando numa leitura/escrita só.
   Filtrar a galeria por tipo com 10 itens: 1 batch contra 10 projeções.
4. **`Flip.fit(a, b)`** — encaixa A exatamente sobre B **sem tocar no DOM**.
   Não existe equivalente na Motion. É a ferramenta certa para
   miniatura → palco.
5. **SVG.** A doc da Motion é explícita: *"SVG components aren't currently
   supported with layout animations."* O Flip suporta.
6. **`props: 'borderRadius,backgroundColor'`** — leva propriedades não
   geométricas junto no mesmo flip. Na Motion isso é um `animate` separado
   que você sincroniza na mão.

**Onde PERDE:** ~25 linhas contra ~8; e você gerencia o DOM. Em fluxo
puramente React, `layoutId` é menos código e menos bug.

### 4.2 `SplitText` — +3,7 KB gzip

Doc: https://gsap.com/docs/v3/Plugins/SplitText/ (verificada). O 3.13+ é
reescrita completa; o `node_modules` deste repo tem a nova (seção 0.1).

**Onde GANHA — e aqui não é perto:**

1. **`mask: 'lines'`** — *"wraps every line or word or character in an
   extra element with `visibility: clip`"*. É o wrapper de overflow que
   todo mundo escreve à mão para o efeito "linha sobe de baixo". Uma
   palavra de config contra um componente inteiro. O `Rolar` do
   `MenuLiquido.tsx` deste repo é exatamente isso feito à mão, em 27
   linhas de JSX.
2. **`autoSplit: true` + `onSplit()`** — **re-divide sozinho quando a fonte
   carrega ou o container muda de largura.** Este é o bug que mata todo
   split feito à mão: você divide em linhas, a `Zodiak` termina de baixar
   com `font-display: swap`, a métrica muda, e as "linhas" ficam no lugar
   errado. Fonte self-hosted com swap **é exatamente o caso**. Não há como
   resolver isso com Motion sem reimplementar `autoSplit`.
3. **`aria: 'auto'` (padrão)** — põe `aria-label` no pai e `aria-hidden`
   nos filhos. Split à mão faz o leitor de tela soletrar. Split à mão
   **sem isso** é bug de acessibilidade, e é o estado de 90% dos
   componentes de "text reveal" dos catálogos da seção 5.
4. **`revert()`** — devolve o HTML original. Depois da animação, o DOM
   volta a ser um `<h2>` com texto, não 140 `<div>`.
5. **`deepSlice`** — subdivide elementos aninhados que atravessam linhas
   (um `<em>` no meio de uma frase) sem estourar a altura.

**Aplicação neste site:** o H2 de cada seção entrando por linha, com
máscara. E **não** no H1 — o `.led` usa `background-clip: text`, que
`globals.css` já documenta como incompatível com contexto de empilhamento
(Chrome bug 1500148). SplitText criaria wrappers com `overflow` → a palavra
"LED" sumiria. **Não divida o H1.**

```tsx
'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(SplitText, ScrollTrigger)

/** H2 entrando linha a linha por mascara. Nunca no H1 (.led). */
export function TituloFatiado({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const split = SplitText.create(ref.current!, {
        type: 'lines',
        mask: 'lines',        // o wrapper de overflow, de graca
        autoSplit: true,      // re-divide quando a Zodiak terminar de carregar
        aria: 'auto',         // aria-label no pai, aria-hidden nos filhos
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 100, opacity: 0,
            duration: 0.62, ease: 'power3.out',
            stagger: { amount: 0.24 },        // amount, nunca each (secao 3.3)
            scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
          }),
      })
      return () => split.revert()             // o DOM volta a ser um <h2>
    })
    return () => mm.revert()
  }, [])

  return <h2 ref={ref} className="text-2xl">{children}</h2>
}
```

**Degradação:** `matchMedia` com `no-preference` significa que sob
`reduce` **o split nem acontece** — o `<h2>` fica intacto, texto normal,
sem wrapper. Melhor que "animar rápido". Em touch é idêntico: o gatilho é
rolagem, não hover.

### 4.3 `Observer` — +4,3 KB gzip

Doc: https://gsap.com/docs/v3/Plugins/Observer/ (verificada)

**Onde GANHA:** unifica `wheel` + `touch` + `pointer` + `scroll` numa
configuração só e entrega, de graça, quatro coisas que você escreveria à mão:

1. **velocidade e delta cumulativo** (`velocityX/Y`, `deltaX/Y`) — handlers
   crus do React não calculam nem uma nem outra;
2. **debounce por tick de rAF** — *"deltas are additive over the course of
   each requestAnimationFrame() tick"*. Sem isso, um trackpad de macOS
   dispara ~120 eventos `wheel` por segundo e você anima 120 vezes por
   frame;
3. **prioridade automática** quando vários inputs disparam juntos: vence
   *"the event with the largest delta"*;
4. **eventos direcionais semânticos** — `onUp/onDown/onLeft/onRight`,
   `onStop` com `onStopDelay`, `tolerance`, `dragMinimum`, `lockAxis`.

**Aplicação neste site:** o **trilho de miniaturas da galeria** e o **leque
da equipe** com scroll horizontal por wheel/trackpad no desktop e swipe no
celular, no mesmo handler. Hoje o `LequeEquipe` só responde a botão de seta;
o `Palco` só ao scroll nativo. `Observer` com `type: 'wheel,touch,pointer'`
resolve os dois com um objeto.

**Onde a Motion chega perto:** ela não chega. `useScroll` lê progresso de
rolagem; não há nada equivalente a Observer para gesto unificado. O `drag`
da Motion cobre arrasto — mas não wheel, não trackpad, não velocidade fora
do arrasto.

### 4.4 `Draggable` + `InertiaPlugin` — +13,5 e +3,3 KB gzip

Doc: https://gsap.com/docs/v3/Plugins/Draggable/ (verificada)

**Onde GANHA do `drag` da Motion:**

1. **`snap` como FUNÇÃO** — `snap: v => Math.round(v/90)*90`. A Motion tem
   `dragConstraints` e `dragSnapToOrigin` (booleano). Snap arbitrário na
   Motion é `onDragEnd` + `animate()` calculado à mão.
2. **`liveSnap`** — encaixa **durante** o arrasto, não só ao soltar. É o
   que faz o leque parecer detentado, como uma roda com click. A Motion
   não tem.
3. **`inertia: true`** — física de arremesso de verdade
   (`throwResistance`, `maxDuration`, `minDuration`,
   `overshootTolerance`), e expõe `endX`/`endY` **previstos** para você
   decidir o destino antes de a animação começar. O `dragMomentum` da
   Motion é decaimento exponencial fixo, sem previsão de destino e sem
   snap combinado com inércia — que é exatamente a combinação que um
   carrossel precisa.
4. **`type: 'rotation'`** — arrastar em ângulo, nativamente. Um leque de
   fotos girado pelo dedo. Na Motion você faria `drag="x"` e converteria
   deslocamento em ângulo à mão.
5. **`edgeResistance`** — o efeito de borracha do iOS na borda, com um
   número.
6. **`allowNativeTouchScrolling`** e **`dragClickables`** — as duas
   armadilhas clássicas de carrossel em celular (roubar o scroll vertical
   da página; matar o clique nos links dentro do slide) resolvidas por
   config.

**Peso combinado: 16,8 KB gzip.** É caro. Só se paga se o arrasto for o
gesto principal daquela seção — o que é o caso do leque da equipe
(seção 6.2), e não é o caso do resto.

### 4.5 `MorphSVG` — +9,6 KB gzip

Doc: https://gsap.com/docs/v3/Plugins/MorphSVGPlugin/ (verificada)

**Onde GANHA: a Motion não tem equivalente. Ponto.** A Motion interpola `d`
como "complex value" — quebra a string em números e interpola posição a
posição. Isso só funciona se os dois `d` tiverem **os mesmos comandos na
mesma ordem e a mesma contagem de pontos**. Fora disso, o resultado é lixo
ou um salto seco. O MorphSVG converte tudo para bezier cúbico e
**subdivide dinamicamente** até casar a contagem de âncoras.

Utilitários que não existem em lugar nenhum:
- **`MorphSVGPlugin.convertToPath()`** — transforma `<circle>`, `<rect>`,
  `<ellipse>`, `<line>`, `<polygon>`, `<polyline>` em `<path>` equivalente;
- **`shapeIndex`** + **`findShapeIndex()`** (GUI interativa) — controla
  qual ponto do início casa com o primeiro ponto do fim. É a diferença
  entre um morph limpo e um morph que se torce;
- **`type: 'rotational'`** — interpola por rotação e comprimento em vez de
  coordenada linear. Morph orgânico em vez de esmagado.

**Aplicação honesta neste site: quase nenhuma, e digo por quê.** A direção
TUBO é retangular, quantizada, de pontos discretos. Morph orgânico é a
gramática **oposta**. O único uso que sobrevive ao briefing: o ícone de
play do `Palco` (o segmento de tubo) morfando para pause quando o vídeo
toca. Nove KB e meio por isso é ruim negócio. **Recomendação: não use
MorphSVG neste projeto.** Fica registrado como verificado e descartado, com
motivo — para não ser pesquisado de novo.

### 4.6 `useGSAP` (`@gsap/react`) — +~0,8 KB gzip, **não instalado**

Doc: https://gsap.com/resources/React/

Faz três coisas: envolve tudo em `gsap.context()` com escopo, faz o cleanup
no unmount, e expõe `contextSafe()` para animações criadas dentro de
handlers de evento. **Sobrevive ao StrictMode do React 19** (o
double-invoke do dev criaria animações duplicadas com `useEffect` cru).

**Vale a pena aqui?** É uma dependência nova para resolver um problema que
`gsap.matchMedia()` + `mm.revert()` já resolve (a própria doc do
`matchMedia` diz que ele *"creates a gsap.context() internally"*). O
`LequeEquipe.tsx` atual usa `useEffect` cru e faz cleanup à mão — funciona.
**Veredito: não instale.** Padronize em `gsap.matchMedia()`, que já está
pago e cobre reduced-motion e ponteiro no mesmo lugar.

### 4.7 `output: 'export'` + React 19 — as três armadilhas

1. **`gsap.registerPlugin()` no topo do módulo roda no servidor** durante o
   pré-render estático. GSAP core aguenta; alguns plugins tocam `window`.
   Regra: `registerPlugin` só em arquivo com `'use client'` — e este repo
   já faz isso.
2. **StrictMode do React 19 monta, desmonta e monta de novo em dev.** Sem
   cleanup real, você tem duas timelines. `mm.revert()` no retorno do
   `useEffect` resolve.
3. **`output: 'export'` não muda nada para GSAP nem para Motion** — as duas
   são 100% cliente, sem rota de API, sem middleware. O que quebra em
   `export` é `next/image` com loader padrão e `revalidate` — nenhum dos
   dois está no caminho aqui.

---

## 5. CATÁLOGO — 21ST.DEV E OS REGISTROS

### 5.0 Duas descobertas que mudam o método de pesquisa

**(1) O 21st.dev não é mais copiável por CLI.**
`https://21st.dev/r/{autor}/{slug}` hoje devolve:

```json
{"error":"Authentication required","reason":"authentication_required"}
```

O fluxo `npx shadcn add` contra o 21st.dev **exige chave de API**.
Componentes antigos ainda saem por `cdn.21st.dev/user_{autor}/{slug}.tsx`;
os novos (layout `{autor}/{slug}/default/`) expõem publicamente **só o
demo**. Planeje copiar à mão pela interface.

**(2) O `WebFetch` não enxerga o 21st.dev** — devolve só a casca de
navegação ("Buttons2043", "Cards1780"). O payload RSC do Next existe
(~1,4 MB por página), mas escapado. Toda verificação abaixo veio de `curl`
com User-Agent de navegador + leitura do CDN. **Registro isso para a
próxima pesquisa não repetir o beco.**

Teste de validade da URL: `21st.dev/handlefalso12345/glare-card` →
"Component Not Found". Logo, título real **é** sinal, não 200 genérico.

### 5.1 As três armadilhas verificadas — leia antes de escolher

> #### ⚠️ `aceternity/card-spotlight` arrasta three.js
> Ele declara `direct_registry_dependencies: ["aceternity/canvas-reveal-effect"]`
> e importa `<CanvasRevealEffect>`, que declara
> `{"three":"latest","@react-three/fiber":"latest"}`. **O "spotlight card"
> mais recomendado da plataforma traz uma stack WebGL de ~150 KB gzip.**
> Se você quiser spotlight que segue o ponteiro, `magicui/magic-card` faz
> sem WebGL nenhum. Retire o `CanvasRevealEffect` e sobram ~40 linhas de
> spotlight por máscara — que é a parte boa.

> #### ⚠️ `llaxmi/tilt-card` NÃO é um tilt card
> Resultados de busca o descrevem como "mova o cursor e a perspectiva
> curva revelando o spotlight". **A descrição é inventada.** O fonte real
> tem 20 linhas e é um botão-pílula:
> `hover:-rotate-2 hover:scale-110`. Sem perspectiva, sem rastreio de
> ponteiro, sem spotlight.

> #### ⚠️ `aceternity/expandable-card` NÃO EXISTE
> A URL é soft-404. O card expansível da Aceternity, que é o mais citado
> em blog para "shared layout", **não está no 21st.dev**. O que existe é
> `21st.dev/aghasisahakyan1/expandable-card` (deps `framer-motion`) — de
> outro autor, e cujo fonte principal está atrás de autenticação.

> #### ⚠️ Dois `console.log` em produção
> `aceternity/glare-card` tem `console.log(state.current)` **dentro do
> `updateStyles()`, que dispara a cada pointermove**.
> `aceternity/direction-aware-hover` tem `console.log("direction", …)`.
> Apague antes de subir.

> #### ⚠️ `aceternity/spotlight-new` importa `motion`, não `framer-motion`
> Todos os outros componentes da Aceternity importam `framer-motion`.
> Este importa o pacote novo `motion`. **Misturar embarca duas cópias da
> mesma biblioteca.** Este repo tem `framer-motion`; padronize nele.

### 5.2 O que vale, e o que cada um faz — verificado no fonte

| Componente | URL | Mecânica real | Dep | Peso |
|---|---|---|---|---|
| **Border Beam** | `21st.dev/magicui/border-beam` | **CSS puro, zero JS.** Div com borda transparente + `mask-composite: intersect` (só o anel pinta) e um `::after` correndo em `offset-path: rect(0 auto auto 0 round …)` — CSS Motion Path | **nenhuma** | ~1 KB de markup |
| **Glare Card** | `21st.dev/aceternity/glare-card` | Foil estilo Linear. `onPointerMove` escreve **seis custom properties por `style.setProperty`** (`--m-x/--m-y`, `--r-x/--r-y`, `--bg-x/--bg-y`), **de propósito fora do state do React** → zero re-render. Camadas em `mix-blend-soft-light` sobre `color-dodge`, `::after` em `exclusion` | **nenhuma** | 133 linhas |
| **Magic Card** | `21st.dev/magicui/magic-card` | Dois `useMotionValue` + `useMotionTemplate` compõem `radial-gradient(200px circle at Xpx Ypx, …)` como `background` de um overlay `opacity-0 → group-hover:opacity-100` (300 ms). Ao sair, os valores voltam para `-gradientSize` (estaciona fora da tela) | framer-motion | grátis se a Motion já está no bundle |
| **Tilt** | `21st.dev/motion-primitives/tilt` | O tilt mais limpo da lista. Ponteiro normalizado → `useMotionValue` → **`useSpring`** → `useTransform` `[-0.5,0.5] → [-fator,fator]` → `useMotionTemplate` monta `perspective(1000px) rotateX() rotateY()`. É **wrapper genérico**: inclina qualquer filho | framer-motion | 92 linhas |
| **Focus Cards** | `21st.dev/aceternity/focus-cards` | Índice de hover no **nível do grid**: os IRMÃOS não-focados recebem `blur-sm scale-[0.98]`. Tailwind puro | **nenhuma** | ~0 |
| **Bento Grid** | `21st.dev/aceternity/bento-grid` | CSS puro: `group-hover:-translate-y-10` no conteúdo, ícone `group-hover:scale-75`, CTA sobe. `transform-gpu` em tudo | **nenhuma** | ~0 |
| **Direction Aware Hover** | `21st.dev/aceternity/direction-aware-hover` | `atan2` no ponto de entrada → quadrante 0–3 → overlay entra **por aquela borda** via `AnimatePresence` | framer-motion | — |
| **Shine Border** | `21st.dev/magicui/shine-border` | `background-size: 300%` animado por `background-position`, mascarado com `mask-composite: exclude` só na borda. **Respeita `motion-safe:`** | **nenhuma** (precisa keyframe no config) | ~0 |
| **3D Card Effect** | `21st.dev/aceternity/3d-card-effect` | `CardContainer / CardBody / CardItem`, com `translateZ="50\|60\|100"` por camada. **`dependencies: {}` — sem framer-motion**, mousemove cru + `perspective` | **nenhuma** | — |
| **Torch Reveal** | `21st.dev/rmahammad/torch-reveal` | Tocha seguindo o cursor limpando uma camada escondida por máscara suave | clsx, tailwind-merge | — |
| **Image Spotlight** | `21st.dev/tonyzebastian/image-spotlight` | Imagem borrada por padrão, **nítida só dentro do spotlight** | **nenhuma** | — |
| **Expandable Card** | `21st.dev/aghasisahakyan1/expandable-card` | O único card→painel real do catálogo. API pelo demo: `<ExpandableCard title src description classNameExpanded>` | framer-motion | fonte atrás de auth |

**Descartados com motivo:** `evervault-card` (regenera uma string de 1500
caracteres **a cada mousemove** — custo de CPU mensurável), `card-spotlight`
(three.js), `canvas-reveal-effect` (shader GLSL), `neon-gradient-card`
(pseudo-elemento borrado com hue animado = glow difuso, **proibido pelo
briefing**), `hover-border-gradient` (cônicas girando em timer = laço
eterno, viola a regra do laço da seção 3.4).

### 5.3 O que serve a ESTE site, e o que não serve

A restrição dura filtra o catálogo com brutalidade. Magenta é ambiente;
âmbar é botão e dado; glow difuso e gradiente roxo→azul estão proibidos.
Sobra pouco — e o pouco que sobra é o melhor da lista:

| Veredito | Componentes | Por quê |
|---|---|---|
| **USAR** | `glare-card` (mecânica), `motion-primitives/tilt`, `focus-cards` (mecânica), `image-spotlight` / `torch-reveal` | zero dependência nova; a mecânica é **revelação**, não brilho somado — que é exatamente a tese do `.luz` que já existe aqui |
| **USAR SÓ A IDEIA** | `border-beam` | o padrão `#ffaa40` **é** quase o `--ambar #FFA300`. Mas é **laço infinito**, e a regra do laço proíbe. Roube o `mask-composite: intersect` para o aro; jogue fora o `offset-path` animado |
| **NÃO USAR** | `magic-card`, `shine-border`, `neon-gradient-card`, `card-spotlight`, `evervault-card`, `hover-border-gradient` | glow difuso, laço eterno, ou WebGL. Os três estão fora do briefing |

**O achado que mais importa para este repo:** o `glare-card` escreve
**seis CSS custom properties por `style.setProperty`, fora do state do
React**. É *exatamente* a técnica que o `.luz` do `globals.css` já usa
(`--mx`, `--my`) e que a seção 6.1 recomenda para o índice
(`gsap.quickTo`). **A validação independente de uma decisão já tomada aqui
vale mais que qualquer componente novo.** Não copie o componente: copie a
confirmação de que o caminho está certo.

**`focus-cards` merece atenção especial** e por um motivo que ninguém
escreve: ele é o único da lista em que o hover afeta os **irmãos**, não o
alvo. Isso satisfaz sozinho a regra do movimento simultâneo (seção 3.4) —
um item ganha foco *porque* os outros recuam, então a atenção é dirigida
sem somar movimento. Nos 3 cards de destaque, é a alternativa mais barata
ao painel expansível. Mas **troque `blur-sm` por dessaturação**: desfoque
em foto de palco escuro some; dessaturar tira o magenta do ambiente e
deixa só o card ativo colorido — o que é a própria demonstração do produto.

---

## 7. CATÁLOGO — OITO SITES REAIS, 2025–2026

Verificação: cada URL foi buscada duas vezes — por conversor de markdown e
por `curl` com User-Agent de navegador. "Vivo" = HTTP 200 + `<title>`
correspondente + conteúdo real, em 04/08/2026. **Ninguém rodou um
navegador headless**, então as descrições de interação vêm de quatro
evidências duras: as seções que os editores do Awwwards listam, nomes de
classe e atributos `data-` no DOM, custom properties resolvidas no CSS, e
grep de símbolos nos bundles servidos. Onde a duração saiu do CSS, o número
é exato; onde não saiu, está dito.

> **Uma correção que vale registrar.** A primeira passada casou `flip` nos
> bundles de Partizan e RISK e quase reportou "GSAP Flip". Grep pela API
> de verdade (`Flip.getState`, `Flip.from`, registro do plugin) deu **zero**
> — os 30+ casamentos eram `flipY`/`flipSided` do three.js. `ogl` casava
> dentro de "g**oogl**eapis". **GSAP Flip só está confirmado onde eu digo
> que está.**

### 7.1 Os quatro que mais interessam

#### 1 · Podium — https://podium.global/ ★ a melhor referência
Listagem: https://www.awwwards.com/sites/podium — SOTD 27/06/2026.
Verificado: 200, 275 KB, `Podium | Creative Studio & Video Production for Sports`.
Produtora de filme esportivo em Montreal; Nike, Puma, Salomon, ON Running.

**Por que é A referência deste projeto:** a paleta é **`#000000` +
`#e7dfd7`** — um osso quente que aparece **69 vezes** no HTML contra 3 do
preto puro de texto. É literalmente "escuro + um acento quente", numa
produtora de vídeo. É o argumento visual de que a direção deste site está
certa, feito por outra equipe, para outro cliente.

**O card (alta confiança, do markup):** flip 3D de verdade — 12 instâncias
de `ww-card`, `ww-card-flip`, `ww-card-front`, sobre container com
`perspective-[var(--spacing-perspective)]`, faces com `backface-hidden` +
`[transform:translateZ(1px)]`. **Rotação em Y entre duas faces, não
crossfade.** Custo: zero JS.

**Card → painel:** `project-list-panel`, `project-list-scroll-content` e,
o revelador, **`project-list-mobile-transition-poster-frame`** — um
poster que **persiste através da transição** card→painel. Ou seja: a
miniatura vira a vista de detalhe. É exatamente a coreografia da
seção 6.3 deste documento, num site premiado.

**O detalhe para roubar inteiro:** o toggle grade/lista troca o rótulo por
**duas máscaras `clipPath` empilhadas** (`…-mask-line-1`/`-2`, retângulos
31×12 em y=16 e y=28). As palavras **deslizam atrás de uma máscara** em vez
de fazer crossfade. Barato, e não parece template.

Tech: Next.js, **Lenis**, DatoCMS, 74 `.mp4`. Tags Awwwards: 3D, WebGL,
GSAP, Three.js, Transitions, Microinteractions.

#### 2 · Partizan — https://partizan.com/
Listagem: https://www.awwwards.com/sites/partizan — SOTD 26/07/2026, por Beaucoup.
Verificado: 200, 154 KB, `Home | Partizan`. Michel Gondry; Daft Punk, Björk,
White Stripes; Chanel, Ford, Alpine.

**A interação, com os números EXATOS lidos do CSS servido**
(`app.a215b9.css`, 200): 14 cards `card-work`. Cada um tem um
`card-work-video` parado em `opacity-0 scale-105` que sobe no hover, e um
`card-work-content` em `xl:opacity-0 → xl:group-hover:opacity-100`. Tokens
resolvidos:

```
.duration-smooth  = 0.6s
.duration-fast    = 0.3s
--ease-out        = cubic-bezier(0.23, 1, 0.32, 1)
```

> **600 ms num ease-out quint, com o vídeo começando em `scale-105` e se
> ASSENTANDO para 100% em vez de crescer.** Esses são valores medidos de
> CSS em produção, não estimativa. E essa curva é metade do motivo de o
> site parecer caro.

**Card → painel:** todo card também tem `popup-el`, e existe um
`slider-popup` (`fixed top-0 left-0 w-full h-screen z-popup`) com
`slider-popup-toggler-prev`/`-next`. Clicar abre um **slider de projeto em
viewport cheia que você navega sem voltar para a grade.** Para um
portfólio de eventos, é a arquitetura certa: a pessoa vê cinco produções
sem nunca voltar ao índice.

Bundle (`app.c275b0.js`, 1,08 MB, 200): 153 `THREE.`, 36 `WebGLRenderer`,
16 `ShaderMaterial`, 58 `gsap`, 26 `scrollTrigger`, 18 `lenis`, 2
`CustomEase`. Transição de página por **Taxi.js**. WordPress + Tailwind.
**Sem GSAP Flip.**

#### 3 · RISK — https://www.risk.film/
Listagem: https://www.awwwards.com/sites/risk — SOTD 15/07/2026, FLOT NOIR.
Verificado: 200, 70 KB, `RISK FILM`. Marselha. Projetos: Salomon, Deezer, Pepsi.

**Paleta `#000000` + `#e4d5be`** — de novo escuro + um quente, e é casa de
pós-produção. Irmão tonal do Podium.

**A interação que interessa ao índice de 10 linhas (seção 6.1):** a lista
de trabalhos é coleção do Webflow (`home-works__list`/`__item`) em que
**cada linha é um `<video class="video-bg-test">` mudo em loop, full-bleed**,
servido por Bunny CDN (`…-Short-Muted.mp4`), sob um scrim
`overlay-work-home`, com `info-titre-work`/`info-directeur-work` por cima.

> É o padrão "passe o mouse na linha, veja a prévia" **elevado a
> movimento**: a prévia é um corte mudo do próprio filme, não um still.
> Para a Rapa Sound isso é diretamente traduzível — a linha "Pista de LED"
> mostrando 4 segundos de pista acesa é mais argumento de venda que
> qualquer foto.

**Texto:** 28 elementos com atributo `line=""` — gancho de divisão por
linha, corroborado por `SplitText` no bundle. É a seção 4.2 deste
documento vista em produção.

Bundle (`main.js`, 1,28 MB, 200): 93 `THREE.`, 77 `gsap`, 22
`scrollTrigger`, 14 `lenis`, 2 `SplitText`, 5 `UnicornStudio`. Webflow +
jQuery + Taxi.js. **Sem GSAP Flip.**
*Curiosidade:* o HTML ainda embarca `<script src="http://localhost:3000/src/main.js">`.
Lembrete de limpar entrada de dev antes de subir.

#### 4 · Vigilante — https://vigilante.group/
Listagem: https://www.awwwards.com/sites/vigilante — **Nominee**, 04/08/2026,
por Rich Brown. Tags: WordPress, GSAP, Film & TV, Typography, Microinteractions.

**Aviso de verificação:** o buscador de markdown levou **403** (Cloudflare
anti-bot). `curl` com UA de navegador deu **200, 91 KB**, título
`Vigilante | Advertising Production Studio | Film & Stills`. **Está vivo** —
o 403 é anti-bot, não site morto. Registro porque as duas ferramentas
discordaram.

**A interação, e é a mais roubável das oito:** classes `hero__thumb-wrapper`,
`hero__thumb-reveal`, `hero__thumb-poster` e **24 `hero__thumb-corner`**
divididos em `--tl`/`--tr`/`--br`. Ou seja: a prévia que aparece no hover
da linha é emoldurada por **quatro cantoneiras animadas** — marca de corte
/ visor de câmera, não retângulo liso.

> **É por isso que não parece genérico, e é linguagem de câmera** — o que
> serve a uma produtora. Para este projeto, troque cantoneira de corte por
> **quatro cantos de moldura de painel de LED**, e a prévia da seção 6.1
> deixa de ser "imagem no hover" e vira "o painel montando".

`data-original-poster` (10×) = troca de poster no hover; `data-speed` =
parallax; `data-sticker-index` (17×) = sistema de colagem em camadas.

Bundle (`site.min.js`, 316 KB, 200): **108 `ScrollTrigger`**, 20
`gsap.registerPlugin`, 50 `gsap.set`, 37 `gsap.to`, 24 `gsap.timeline`,
**12 `mousemove`** (cursor-follow), 17 `IntersectionObserver`. Muito GSAP,
**zero WebGL**. Acento `#ff0000`.

### 7.2 Os outros quatro

#### 5 · Made With GSAP — https://madewithgsap.com/
https://www.awwwards.com/sites/made-with-gsap-1 — SOTD 29/07/2026.
Verificado: 200, `Made With Gsap`. Catálogo de 111 efeitos GSAP.

**A evidência técnica mais forte de tudo que encontrei**, porque o site
serve os plugins como arquivos nomeados separados em vez de bundle. A
própria landing carrega: `Draggable.min.js`, `InertiaPlugin.min.js`,
`SplitText.min.js`, `MorphSVGPlugin.min.js`, `customease.js`,
`scrolltrigger.js`, `gsap.js`, `lenis.js` + `matter-js@0.20.0`. `gsap`
aparece 211× no HTML.

**A coleção em si é um baralho de cards com "arraste para explorar"** —
Draggable + InertiaPlugin, que é precisamente o leque com arremesso da
seção 6.2. Referência **e** atalho. (Os efeitos são pagos, US$ 20–25/mês; a
landing é livre para estudar.)

#### 6 · ELLE & Esquire — The New Hollywood — https://www.hollywoodexhibit2026.com/
https://www.awwwards.com/sites/hearst-exhibit-2026 — SOTD 02/08/2026, OSMOS + HearstCC.
Verificado: 200, 42 KB. 40 anos de fotografia de Hollywood, Hearst Tower NY.

**Toggle grade ⇄ lista** sobre arquivo fotográfico, mais uma transição
**"paper curl" em WebGL** — as páginas enrolam como revista virando. Para
um portfólio de eventos o curl é o memorável: metáfora de material físico
em vez de slide ou fade. Paleta `#252525` / `#E3E3E3`.

Chunks do Next verificados um a um: `03c90768fa0ba64d.js` tem
`gsap.registerPlugin` + `ScrollTrigger`; três chunks têm `SplitText`;
`e731e01936617f80.js` tem `WebGLRenderer`, `createProgram` e
`precision highp float` (GLSL escrito à mão). Markup é client-rendered,
então a descrição da interação apoia-se na lista do Awwwards + na
evidência de shader.

#### 7 · Serotoninn — https://serotoninn.com/
https://www.awwwards.com/sites/serotoninn — SOTD + **Developer Award**, 04/08/2026, BL/S®.
Verificado: 200, 922 KB. Moda feminina, Kiev.

Relevância: **`#000000` + `#ED3833`** — a mesma fórmula de um acento quente
sobre preto, num site **comercial** com sliders de card pesados. 22
`swiper-slide`, 4 `swiper-wrapper`, mais um `swiper-mob` — Swiper.js
dirigindo desktop e celular **separadamente**.

**A lição de arquitetura, e é a melhor das oito:** os scripts são
separados por propósito — `main.js`, `custom-cursor.js`, `arrivals-anim.js`,
`footer-anim.js`, `loader.js`, `video-load.js`, com `arrivals-anim.css` e
`loader.css` correspondentes. Um bundle de animação por seção, não um
monólito. **É a resposta certa para "o teto de peso foi suspenso":
suspender o teto não é motivo para pôr tudo no chunk inicial.**

*Limite honesto:* `main.js` tem só 39 KB e o grep por símbolos de
GSAP/Swiper dentro dele deu vazio — as libs vêm de outro lugar. Swiper
está confirmado por classe; GSAP, pela tag do Awwwards, não por leitura de
bundle.

#### 8 · 2xA Studio — https://2xa.studio/
https://www.awwwards.com/sites/2xa-studio — SOTD 31/07/2026. Amsterdã/Atenas.
Verificado: 200, 123 KB, `2xA — Home`. Paleta `#0F0F0F` / `#FDFDFD`.

**O mais fraco dos oito para este fim, e digo por quê:** é bundle Vite
único e opaco (`main-CzlVfecv.js`), sem gancho de classe legível, e o
Awwwards só lista tags genéricas. **Não consegui verificar mecânica de card
nenhuma.** Fica pela hierarquia tipográfica sobre quase-preto. **Se quiser
um oitavo firme, prefira o demo Palmer do Codrops abaixo — esse você lê o
fonte.**

### 7.3 Codrops — código copiável, licença MIT

Licença confirmada em https://tympanus.net/codrops/licensing/: os **demos
baixáveis são MIT** — *"permission is hereby granted, free of charge… to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies."* Uso comercial liberado. (Separadamente: *design freebies* proíbem
revenda do asset, e artigos não podem ser republicados — mas o **código do
demo é MIT**.) Os quatro demos e os quatro repositórios devolveram 200.

| Demo | Artigo | Repositório | Mecânica |
|---|---|---|---|
| [PalmerDraggableGrid](https://tympanus.net/Tutorials/PalmerDraggableGrid/) | [01/09/2025](https://tympanus.net/codrops/2025/09/01/recreating-palmers-draggable-product-grid-with-gsap/) | [joffreysp/draggable-grid](https://github.com/joffreysp/draggable-grid) | **carrossel arrastável → detalhe** |
| [GridToFullPreview](https://tympanus.net/Tutorials/GridToFullPreview/) | [27/05/2025](https://tympanus.net/codrops/2025/05/27/animated-product-grid-preview-with-gsap-clip-path/) | [gwen-bo/codrops-grid-to-preview](https://github.com/gwen-bo/codrops-grid-to-preview) | **hover → prévia por `clip-path`** |
| [InfiniteScrollGSAPGallery](https://tympanus.net/Tutorials/InfiniteScrollGSAPGallery/) | [30/07/2026](https://tympanus.net/codrops/2026/07/30/building-an-infinite-gsap-scroll-gallery-with-parallax-and-flip-transitions/) | [surya-aditya/…](https://github.com/surya-aditya/codrops-infinite-scroll-and-content-transition) | **miniatura → tela cheia com Flip** |
| [GridLayoutTransitions](https://tympanus.net/Tutorials/GridLayoutTransitions/) | [20/01/2026](https://tympanus.net/codrops/2026/01/20/animating-responsive-grid-layout-transitions-with-gsap-flip/) | [Ibaliqbal/grid-layout-transition](https://github.com/Ibaliqbal/grid-layout-transition) | **re-layout por Flip, durações exatas** |

**Palmer Draggable Grid** — arraste ou roda percorre um grid com colunas
desencontradas; **GSAP Draggable com inércia e bounds**. Itens entram de
`scale 0.5→1` em ordem randomizada; IntersectionObserver ajusta por
visibilidade; **clicar dá Flip da imagem do slot do grid para um overlay de
detalhe** enquanto SplitText revela título e corpo. **É o leque da
seção 6.2 e o card expansível da seção 6.1 no mesmo arquivo, MIT.** Se
houver um único download a fazer desta pesquisa, é este.

**Grid to Full Preview** — hover num card e o `clip-path` **abre a partir
de uma cruz com braços visíveis** até a revelação completa, "como peças de
quebra-cabeça se encaixando", **enquanto os cards vizinhos se movem para
dentro `2,5vw`** (metade da calha) e o container da prévia encolhe para
encontrá-los. **A grade inteira participa do hover de um card.**

> Para a seção de LED isto é on-brief de um jeito raro: painéis revelando
> em forma de cruz **lêem como ladrilhos/pixels se montando**, que é
> literalmente o produto. Fica melhor aqui do que fica no demo original de
> móveis. É a minha segunda escolha depois do Palmer.

**Infinite Scroll GSAP Gallery** — roda/toque dirigem uma **timeline
pausada usada como cabeçote de scrub**, então o laço é contínuo; parallax
por slide dá profundidade; legendas revelam caractere a caractere. Clique →
**Flip morfa a miniatura para tela cheia**, Escape fecha. Plugins:
**Observer, Flip, SplitText** — os três da seção 4.

**Grid Layout Transitions** — o único lugar onde confirmei GSAP Flip **no
fonte**: o demo carrega `./js/Flip.js` e `./js/gsap.js` diretamente. Clicar
num botão de tamanho (50/75/100/125/150%) → `Flip.getState()` → troca um
data-attribute que muda o CSS grid → `Flip.from()`.
**Durações exatas: v1 = 0,8 s; v2 = 1 s + 0,3 s de stagger (1,3 s total)**
com tempo randomizado por item e uma varredura simultânea de
blur/brightness no container.

> **Confronto com a seção 3.2:** 1,3 s **estoura** o teto de 1 s do fluxo de
> pensamento. Num demo de Codrops, tudo bem — o objetivo é impressionar.
> Numa landing que vende, não. **Use a mecânica do Flip, use a duração
> do Partizan (0,6 s).**

### 7.4 Verificados e DESCARTADOS — para não repesquisar

| Site | Status | Motivo |
|---|---|---|
| `soma.ca` | **HTTP 000** | falha de conexão repetida. Não verificável. Excluído |
| `ilcapoproduction.com` | **403** com página de erro real | servidor de pé, conteúdo inalcançável. Excluído |
| `rosshalfin.com` | vivo (200, 386 KB) | tonalmente perfeito (arquivo de fotografia de rock) mas é WooCommerce com MailPoet, PayPal, Complianz, reCAPTCHA e bloqueador de botão direito. **Sem animação de card notável** |
| `therecord.institute` | vivo | **conto de advertência:** 4 casamentos de `draggable` eram a lista interna de nomes de atributo do React DOM, não interação de arrasto. React + ~6 refs de `motion`, sem GSAP |
| `linkaproduction.com` | vivo | tem `horizontal-slider__slide` e `homepage-hero__showreel`, mas é WordPress cacheado com WP-Rocket e paleta de acento de estoque (`#ff6900`, `#fcb900`). Marginal |

### 7.5 O que os oito ensinam, em três linhas

1. **Dois dos quatro melhores (Podium `#e7dfd7`, RISK `#e4d5be`) são
   produtoras de vídeo com preto + UM quente.** A direção deste projeto
   não é aposta: é o consenso de 2026 na categoria.
2. **A prévia no hover da linha venceu o card em grade.** RISK usa vídeo
   mudo por linha; Vigilante usa poster com cantoneiras. Nenhum dos dois
   põe os projetos em caixas iguais. É a seção 6.1(ii) confirmada por
   três sites premiados.
3. **Nenhum dos oito usa laço eterno em grade, glow difuso ou
   gradiente roxo→azul.** As proibições do briefing coincidem com o que os
   sites premiados de 2026 já não fazem.

---

## 6. APLICAÇÃO — OS TRÊS LUGARES DESTE SITE

### 6.1 OS 13 SERVIÇOS — 3 cards + índice de 10 em 5 blocos

**O diagnóstico.** A estrutura atual já está certa e não deve virar grade:
13 é primo, não existe grid de colunas iguais sem órfão, e o
`globals.css:379` já registra isso. O erro a evitar não é de layout — é de
**animação uniforme**: se os 3 cards e as 10 linhas fizerem a mesma coisa,
a hierarquia que o layout construiu é destruída pelo movimento.

**A regra da diferença (seção 3.4) aplicada:** os três destaques e as dez
linhas precisam ter **gramáticas de movimento diferentes**, não intensidades
diferentes da mesma.

| | os 3 destaques | as 10 linhas |
|---|---|---|
| gramática | **volume** — o facho revela a matriz sob o difusor | **plano** — a linha revela um retângulo de imagem |
| gatilho | hover/foco | hover/foco |
| dono | CSS (`.luz`, já existe) | **GSAP** `quickTo` |
| clique | **abre painel** (novo) | vai para o WhatsApp (já existe) |
| entrada | `Reveal` com stagger de 80 ms × 3 | `Reveal` por bloco, `amount` |

#### (i) Os 3 destaques ganham um painel — e é isso que os faz merecer ser cards

Hoje o card de destaque leva direto ao WhatsApp. Ele é grande, tem foto,
tem facho — e entrega **menos** informação que a linha de índice, que pelo
menos mostra o `desc`. **Um card que não abre não justifica ser card.**

A proposta: clique **abre o painel** com o que o cliente realmente pergunta
(medida do painel, pitch do LED, tempo de montagem, o que já foi feito), e
o WhatsApp vira o CTA **dentro** do painel, com o texto já preenchido pelo
serviço. Ganho de conversão: a pessoa chega ao WhatsApp já informada, e
não abre a conversa para perguntar "quanto custa o painel".

**Técnica: `layoutId` da Motion** (seção 2.3). Motivo: os dois estados são
React, o painel nasce de `useState`, e o custo real é **negativo** (−5,5 KB
gzip via `LazyMotion`, seção 0.3). Não é Flip aqui.

Duas adaptações à direção TUBO que o código genérico da seção 2.3 não tem:

```tsx
/* O facho morre no voo — luz que segue cursor durante um flip e ruido puro */
<m.button
  layoutId={`serv-${s.ancora}`}
  onLayoutAnimationStart={() => setVoando(true)}
  onLayoutAnimationComplete={() => setVoando(false)}
  className="card"
  style={{ borderRadius: 'var(--radius-card)' }}
>
  {!voando && <span className="luz" aria-hidden />}
  …
</m.button>
```

```tsx
/* O TUBO e a continuidade visual: e a mesma coluna de pixels no card e no
   painel, entao ela tambem recebe layoutId. E o fio que costura os dois
   estados — mais legivel que o card inteiro crescendo. */
<m.span layoutId={`tubo-${s.ancora}`} className="tubo" aria-hidden
        style={{ ['--tubo-cor' as string]: corDoTubo(s) }} />
```

**Degradação:**
- **touch** — `<button>`, `onClick`. Idêntico. O `.luz` já é
  `@media (hover:hover) and (pointer:fine)` e nem é pintado.
- **`prefers-reduced-motion`** — `MotionConfig reducedMotion="user"`
  desliga transform e layout; o painel **aparece**. Nada invisível.
- **sem JS** — o card precisa continuar sendo `<a href="#ancora">` no HTML
  e ser promovido a `<button>` só no cliente. Sem isso, `.no-js` perde
  10 serviços. (Este repo já tem a classe `.no-js` no `globals.css`.)

#### (ii) As 10 linhas ganham a imagem que segue o cursor — o padrão editorial

É **o** padrão de 2025–2026 para lista longa, e é o oposto de "grade
genérica": nenhum item ganha caixa, nenhum ganha sombra, e ainda assim
cada um tem uma imagem. A informação aparece **sob demanda**, uma por vez
— o que satisfaz a regra do movimento simultâneo (seção 3.4) por
construção.

Por que **GSAP** e não Motion: `mousemove` a 60 Hz. Com `useState`, são 60
re-renders por segundo em 10 linhas. `gsap.quickTo()` é uma função
pré-compilada que escreve direto no elemento, **zero render do React**.
Este é o caso mais limpo da regra da seção 1.

```tsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import type { Servico } from '@/lib/conteudo'

/**
 * ÍNDICE COM PRÉVIA — a imagem que segue o cursor.
 *
 * Um unico <img> para as N linhas: trocar `src` e mais barato que montar
 * N imagens e revelar uma. Fica `loading="lazy"` e so recebe src no
 * primeiro hover — em touch nunca baixa nada.
 *
 * A revelacao NAO e fade: e clip-path por degraus. Mesma quantizacao do
 * .tubo e da .virada — "LED e pixel, nao lampada" na terceira camada.
 */
export function IndicePrevia({ itens }: { itens: Servico[] }) {
  const previa = useRef<HTMLDivElement>(null)
  const img    = useRef<HTMLImageElement>(null)
  const lista  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    // so onde ha ponteiro fino E o usuario nao pediu menos movimento
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const box = previa.current!, el = img.current!, raiz = lista.current!

      // quickTo: funcao pre-compilada. Nao cria tween por evento.
      const px = gsap.quickTo(box, 'x', { duration: 0.45, ease: 'power3.out' })
      const py = gsap.quickTo(box, 'y', { duration: 0.45, ease: 'power3.out' })

      const mover = (e: PointerEvent) => {
        const r = raiz.getBoundingClientRect()
        px(e.clientX - r.left + 24)
        py(e.clientY - r.top  - 90)
      }

      const linhas = gsap.utils.toArray<HTMLElement>('[data-previa]', raiz)
      const limpar: (() => void)[] = []

      linhas.forEach((linha) => {
        const entrar = () => {
          const src = linha.dataset.previa!
          if (el.getAttribute('src') !== src) el.setAttribute('src', src)
          gsap.to(box, {
            // 5 degraus: a persiana de LED abrindo, nao um fade
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.42, ease: 'steps(5)', overwrite: 'auto',
          })
        }
        const sair = () => gsap.to(box, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.24, ease: 'steps(3)', overwrite: 'auto',
        })
        linha.addEventListener('pointerenter', entrar)
        linha.addEventListener('pointerleave', sair)
        limpar.push(() => {
          linha.removeEventListener('pointerenter', entrar)
          linha.removeEventListener('pointerleave', sair)
        })
      })

      raiz.addEventListener('pointermove', mover)
      limpar.push(() => raiz.removeEventListener('pointermove', mover))
      return () => limpar.forEach((f) => f())
    })

    return () => mm.revert()     // desfaz inclusive os inline styles do GSAP
  }, [])

  return (
    <div ref={lista} className="relative">
      {/* a previa: fora do fluxo, sem eventos, invisivel ate o primeiro hover */}
      <div ref={previa} aria-hidden
           className="pointer-events-none absolute left-0 top-0 z-20 hidden
                      w-[18rem] overflow-hidden lg:block"
           style={{
             borderRadius: 'var(--radius-card)',
             clipPath: 'inset(0% 0% 100% 0%)',
             /* o aro de dois tons do .card, para a previa nao ser "so uma foto" */
             border: '1px solid var(--color-rule)',
             background: 'var(--color-off)',
           }}>
        <img ref={img} alt="" width={576} height={360} loading="lazy" decoding="async"
             className="block aspect-16/10 w-full object-cover" />
      </div>

      {itens.map((s) => (
        <a key={s.ancora} data-previa={`/fotos/servico-${s.ancora}.avif`}
           /* … o resto e a .linha que ja existe … */
           className="linha" href="#">…</a>
      ))}
    </div>
  )
}
```

**Por que `ease: 'steps(5)'` e não um fade.** É a assinatura da casa. O
`.virada` já usa `steps(7, jump-none)` e o comentário do `globals.css`
explica: *"a casa acendendo em SETE DEGRAUS… a mesma quantização do tubo"*.
Um `clip-path` em 5 degraus é a persiana de um painel de LED subindo. Um
fade é o default de qualquer template.

**Degradação — e aqui está o melhor argumento do padrão:**
- **touch** — a `@media (hover:hover) and (pointer:fine)` da `matchMedia`
  não casa, o bloco **nunca roda**, e a `<img>` **nunca recebe `src`** —
  logo **zero byte de imagem baixado no celular**. A prévia é
  `hidden lg:block`, então nem ocupa espaço. A linha continua sendo a
  linha que já funciona hoje, com a seta permanente
  (`@media (hover:none){.linha__seta{opacity:1}}`).
- **`prefers-reduced-motion`** — mesma coisa: a condição
  `no-preference` não casa, nada roda, nada aparece. Não é "animação
  rápida", é **ausência**. Que é a lei.
- **sem JS** — as linhas são `<a href>`. Funcionam inteiras.

**Custo: 0 KB novos.** `quickTo` e `matchMedia` são core do GSAP, já pago.

#### (iii) A entrada dos 5 blocos — `amount`, por bloco

```ts
// 5 blocos, cada um com <= 4 linhas. N por bloco esta na faixa "<= 8" da
// tabela da secao 3.2, entao escalona o ITEM. Mas com `amount`, para o
// dia em que o cliente cadastrar o 14o servico.
gsap.from(linhasDoBloco, {
  y: 12, opacity: 0, duration: 0.28, ease: 'power2.out',
  stagger: { amount: Math.min(0.08 * (n - 1), 0.4), from: 'start' },
  scrollTrigger: { trigger: bloco, start: 'top 85%', once: true },
})
```

> Ou **não use GSAP nenhum aqui**: o `Reveal` por IntersectionObserver que
> este repo já tem (~0,4 KB) faz o mesmo com `transition-delay: var(--d)`.
> ScrollTrigger custa **17,9 KB gzip**, e não vale para cinco fades.
> **Recomendação: mantenha o `Reveal`.**

---

### 6.2 A EQUIPE — o leque, com GSAP

**O que já existe** (`components/LequeEquipe.tsx`, adaptado de
`melhorias/card.md` / 21st.dev): geometria de 7 posições, `elastic.out`
na entrada, rearranjo no hover empurrando os vizinhos, `prefers-reduced-motion`
tratado, hover só em ponteiro fino. Está bem feito.

**O buraco real, e é grande: no celular o leque só anda por botão de seta.**
`FOTOS_EQUIPE` tem 6 itens, abaixo do `MAX_VISIVEL = 7`, então hoje as setas
**nem aparecem** (`total > MAX_VISIVEL` é falso) — no celular o leque é uma
imagem estática. E swipe é o gesto que qualquer pessoa tenta primeiro num
leque de fotos.

**A correção usa exatamente os plugins que agora são grátis.**

#### Opção A — `Observer` (+4,3 KB gzip) · **recomendada**

Um objeto resolve wheel de trackpad, swipe de dedo e arrasto de mouse, com
`tolerance` para não disparar em toque acidental e `lockAxis` para não
roubar a rolagem vertical da página.

```tsx
import { Observer } from 'gsap/Observer'
gsap.registerPlugin(Observer)

// dentro do useEffect que ja existe, depois do bloco de hover:
const obs = Observer.create({
  target: cont,                       // o proprio .leque
  type: 'wheel,touch,pointer',
  lockAxis: true,                     // trava no eixo do 1o movimento
  tolerance: 24,                      // ignora tremida de dedo
  dragMinimum: 12,
  preventDefault: false,              // NUNCA sequestre a rolagem vertical
  onLeft:  () => girar('dir'),
  onRight: () => girar('esq'),
  onStop:  () => { /* opcional: reassenta */ },
  onStopDelay: 0.18,
})
return () => obs.kill()
```

Por que `preventDefault: false` é inegociável: com `true`, o leque come o
scroll vertical da página no celular e a pessoa fica presa na seção da
equipe. É o bug número 1 de carrossel em touch.

E **remova o gate `total > MAX_VISIVEL` das setas**: com 6 fotos a
navegação por teclado hoje não existe. As setas são o caminho acessível —
`Observer` não é operável por teclado.

#### Opção B — `Draggable` + `InertiaPlugin` (+16,8 KB gzip)

Vale se o leque tiver que parecer um baralho **na mão**, com o dedo
arrastando as cartas continuamente e elas se assentando com física.

```tsx
Draggable.create(cont, {
  type: 'x',
  inertia: true,                       // fisica de arremesso de verdade
  edgeResistance: 0.82,                // borracha do iOS na borda
  dragClickables: false,               // o link dentro da carta continua clicavel
  allowNativeTouchScrolling: true,     // a pagina continua rolando na vertical
  liveSnap: { x: (v) => Math.round(v / passo) * passo },   // detenta DURANTE
  onDrag() { setCentro(indiceDe(this.x)) },
})
```

`liveSnap` é o que a Motion não tem e é o que dá a sensação de roda com
click. Mas **16,8 KB gzip é caro para 6 fotos.**

> **Veredito: Opção A.** `Observer` a 4,3 KB entrega o gesto que falta.
> Draggable só se o leque virar a peça central da seção — o que ele não é.

**Degradação:**
- **touch** — é justamente o que está sendo consertado. `Observer` com
  `type` incluindo `touch` é o caminho principal.
- **`prefers-reduced-motion`** — envolva o `Observer.create` no mesmo ramo
  de `matchMedia` que o resto. Sob `reduce`, mantenha as setas: o leque
  **troca** de foto sem animar (o componente já faz `gsap.set` no ramo
  `reduzido`). Navegação preservada, movimento zero.
- **teclado** — as setas. Torne-as sempre visíveis.

---

### 6.3 A GALERIA — vídeo grande + trilho, **com a fachada intacta**

**O requisito duro:** o `<iframe>` só nasce no clique, e no máximo um
existe no DOM. O `components/Palco.tsx` atual já garante isso
estruturalmente, e o comentário do arquivo explica o custo (10 players ×
~1,2 MB). **Qualquer proposta que quebre isso está errada por definição.**

**Por que `layoutId` não serve aqui, e é o caso didático da seção 2.2.**
Para a Motion casar dois elementos, os dois têm de ser componentes React
existentes no mesmo commit. A miniatura é `<img>`; o palco é `<img>` que
**vira** `<iframe>` depois. Se você desse `layoutId` ao par, teria de
manter o palco montado o tempo todo — e o palco, depois do clique, é um
iframe. Você acabaria animando o iframe, o que **recarrega o player** (o
navegador remonta o documento do iframe quando o nó é mexido).

**A solução: `Flip.fit()`** — encaixa A exatamente sobre B **sem tocar no
DOM** (doc verificada: *"repositions/resizes one element so that it appears
to fit exactly into the same area as another element"*). O iframe nunca
entra na conta.

**A coreografia, em dois gestos separados — e isso é feature, não limitação:**

```
gesto 1 · clicar na MINIATURA
   → clona a <img> da miniatura (nao move a original)
   → Flip.fit(clone, caixaDoPalco) — o clone voa e cresce
   → ao chegar, troca a capa do palco e mata o clone
   → nenhum iframe existe ainda

gesto 2 · clicar no PALCO
   → so agora o <iframe> monta
```

Duas ações onde o site antigo tinha uma. Mas a primeira agora **mostra**
qual vídeo você escolheu, o que a versão atual comunica só por `aria-live`
e por opacidade de miniatura. E o custo de rede continua **zero** até o
gesto 2.

```tsx
'use client'

import { useCallback, useRef } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
gsap.registerPlugin(Flip)

/**
 * A MINIATURA VOA PARA O PALCO.
 *
 * Clona a <img>, encaixa o clone sobre a caixa do palco com Flip.fit e
 * descarta. A <img> original nao sai do trilho; o <iframe> nao existe.
 *
 * `scale: true` de proposito AQUI (ao contrario da secao 2.4): o conteudo
 * e uma foto, nao tipografia — escalar nao distorce nada perceptivel, e
 * escalar e mais barato de pintar que reflow de layout.
 */
export function useVooDaMiniatura(palco: React.RefObject<HTMLElement | null>) {
  const voando = useRef(false)

  return useCallback((miniatura: HTMLImageElement, aoChegar: () => void) => {
    const alvo = palco.current
    if (!alvo || voando.current) { aoChegar(); return }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      aoChegar()                       // corte seco de mesa de luz
      return
    }

    voando.current = true
    const r = miniatura.getBoundingClientRect()
    const clone = miniatura.cloneNode(true) as HTMLImageElement
    clone.removeAttribute('id')
    clone.setAttribute('aria-hidden', 'true')
    Object.assign(clone.style, {
      position: 'fixed', margin: '0', zIndex: '70',
      left: `${r.left}px`, top: `${r.top}px`,
      width: `${r.width}px`, height: `${r.height}px`,
      objectFit: 'cover', pointerEvents: 'none',
      borderRadius: 'var(--radius-botao)',
    })
    document.body.append(clone)

    Flip.fit(clone, alvo, {
      duration: 0.56,
      ease: 'power3.inOut',
      scale: true,                     // foto: pode escalar
      absolute: true,
      props: 'borderRadius',           // botao (6px) → placa (22px), junto
      onComplete: () => {
        aoChegar()                     // agora o palco troca de capa
        gsap.to(clone, {
          opacity: 0, duration: 0.14,
          onComplete: () => { clone.remove(); voando.current = false },
        })
      },
    })
  }, [palco])
}
```

Ligação no `Palco.tsx` existente — três linhas:

```tsx
const palcoRef = useRef<HTMLDivElement>(null)
const voar = useVooDaMiniatura(palcoRef)

// no <button> da miniatura:
onClick={(e) => {
  const img = e.currentTarget.querySelector('img')!
  voar(img, () => escolher(n))
}}
```

**Custo: +9,7 KB gzip** (`Flip`). Justificativa: é o único jeito de dar
continuidade visual entre trilho e palco **sem** que o player entre no DOM
nem seja tocado. O que se compra é a preservação do invariante de
performance mais valioso da página.

**Degradação:**
- **touch** — o gatilho é `onClick`, não hover. Funciona igual. Em telas
  estreitas o palco e a miniatura estão perto, o voo é curto; se quiser,
  reduza `duration` para 0.36 sob `(max-width: 640px)` via `matchMedia`.
- **`prefers-reduced-motion`** — o `if` no topo faz `aoChegar()` direto:
  a capa troca, sem voo. Zero movimento, zero perda de função.
- **sem JS** — o `Palco` inteiro já depende de JS. O caminho sem JS são
  os links diretos para o YouTube, que devem existir no HTML como
  `<noscript>` ou como `<a>` real por trás do botão.
- **rede** — inalterado. Nenhum byte novo baixado no voo: o clone reusa a
  `<img>` já decodificada da miniatura.

#### O que **não** fazer na galeria

- **Não** dê `layoutId` ao `<iframe>` — remontar o nó recarrega o player.
- **Não** pré-carregue `maxresdefault.jpg` das 10 miniaturas para o voo
  ficar nítido: são ~10 × 90 KB. O clone da miniatura fica levemente
  suave por 560 ms e depois a capa boa entra por cima. Ninguém percebe.
- **Não** ponha autoplay no trilho. Já é proibição do briefing, e
  `Observer.onStop` deixa tentador. Não.

---

### 6.4 O CONSERTO DE −18,9 KB QUE INDEPENDE DE TUDO ISSO

`MenuLiquido.tsx` importa `motion` completo (39,4 KB gzip) e usa
**zero** features de `domMax`: só `animate`, `initial`, `exit`, `whileTap`.
Isso é `domAnimation`.

```tsx
// app/layout.tsx — uma vez, no topo da arvore cliente
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'

<MotionConfig reducedMotion="user">
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
</MotionConfig>
```

```tsx
// MenuLiquido.tsx — trocar motion.X por m.X
- import { motion, AnimatePresence } from 'framer-motion'
+ import { m, AnimatePresence } from 'framer-motion'
- <motion.div … />
+ <m.div … />
```

`strict` faz a Motion **lançar erro em dev** se alguém importar `motion` em
vez de `m` — é o que impede a regressão daqui a três meses.

```
antes:  motion completo ................ 39.415 B gzip
depois: m + LazyMotion + domAnimation ... 6.426 + 14.025 = 20.451 B gzip
                                          ─────────────────────────────
                                          −18.964 B gzip  (−48%)
```

E se você adotar o painel expansível da seção 6.1, troque `domAnimation`
por `domMax`: **6.426 + 27.471 = 33.897 B**, ainda **−5.518 B** contra
hoje — com `layoutId` incluído de brinde.

---
