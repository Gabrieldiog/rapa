# 18 — Órbita de depoimentos

Pesquisa sobre o componente "Orbiting Circles with Globe" (21st.dev / @shadcnspace) e
sobre como adaptá-lo para a seção de depoimentos da Rapa Sound.

Data da pesquisa: 2026-08-05. Toda afirmação de suporte de navegador e de peso de
biblioteca abaixo foi medida ou lida em fonte primária — onde não foi, está escrito
**não confirmado**.

---

## RESUMO EXECUTIVO

O componente da referência é a soma de duas peças de código aberto: o `OrbitingCircles`
do Magic UI (órbita em CSS puro) e o globo `cobe` (WebGL). A variante 02 "with Globe"
do @shadcnspace é **paga** e não tem fonte pública — mas as duas peças de origem sim.

Proposta fechada, uma só: **não fazer balão preso à bolinha.** Fazer **órbita âmbar com
painel central fixo**. As 4 clientes reais orbitam como bolinhas com foto e aro âmbar
sobre uma **cúpula de partículas em canvas 2D** (congo→magenta, ambiente) — não o globo
Cobe, que é caro em celular e semanticamente errado para uma empresa de Uberlândia. O
depoimento aparece num painel **parado no centro**, tipografia grande, trocando a cada
`duração/4` segundos. A bolinha da vez ganha aro cheio e escala.

Motivo de recusar o balão preso: o `OrbitingCircles` já mantém o filho na vertical
(há contra-rotação no próprio keyframe), então o texto até fica reto — mas ele **viaja
pela tela**, e ler um parágrafo que se desloca é pior que ler um que gira. Painel parado
resolve legibilidade, acessibilidade e caber em 380px de uma vez só.

No celular a órbita é abandonada de verdade: vira **fileira horizontal** de 4 avatares
com o painel embaixo. Fallback de `prefers-reduced-motion` e do HTML exportado sem JS:
os 4 depoimentos empilhados, estáticos, todos legíveis. Botão de pausar obrigatório
(WCAG 2.2.2, nível A). `<cite>` **não** entra no nome da cliente — a especificação proíbe.

---

# PARTE 1 — O COMPONENTE DA REFERÊNCIA

## 1.1 A busca pelo código-fonte real

Tentei, nesta ordem:

| URL | Resultado |
| --- | --- |
| `https://21st.dev/@shadcnspace/orbiting-circles-02` | **HTTP 404** |
| `https://21st.dev/?preview=%2F%40shadcnspace%2Fcomponents%2Forbiting-circles-02` | Carrega o shell do app; nenhum código no HTML servido. Só confirma que @shadcnspace tem 45 componentes |
| `https://shadcnspace.com/components/orbiting-circles` | Carrega. Confirma que existem 2 variantes: **01 Default** (aberta) e **02 with Globe** marcada **"Pro"**, atrás do paywall `/pricing` |

**Conclusão honesta: o código da variante 02 é pago e não está publicado.** O que a
página do @shadcnspace descreve é exatamente o que se vê no preview: logos (Supabase,
Gemini, Make, Figma, Slack, Claude, React, Python) girando em anéis concêntricos sobre
um globo.

As duas peças de origem, essas sim, são abertas — e são o que interessa.

### Peça A — `OrbitingCircles`, do Magic UI (código literal)

Fonte: `https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/registry/magicui/orbiting-circles.tsx`
Documentação: `https://magicui.design/docs/components/orbiting-circles`
Autor declarado no MDX: `dillionverma`, data `2024-04-24`.

```tsx
import React from "react"

import { cn } from "@/lib/utils"

export interface OrbitingCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
  reverse?: boolean
  duration?: number
  delay?: number
  radius?: number
  path?: boolean
  iconSize?: number
  speed?: number
}

export function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  radius = 160,
  path = true,
  iconSize = 30,
  speed = 1,
  ...props
}: OrbitingCirclesProps) {
  const calculatedDuration = duration / speed
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-black/10 stroke-1 dark:stroke-white/10"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}
      {React.Children.map(children, (child, index) => {
        const angle = (360 / React.Children.count(children)) * index
        return (
          <div
            style={
              {
                "--duration": calculatedDuration,
                "--radius": radius,
                "--angle": angle,
                "--icon-size": `${iconSize}px`,
              } as React.CSSProperties
            }
            className={cn(
              `animate-orbit absolute flex size-(--icon-size) transform-gpu items-center justify-center rounded-full`,
              { "[animation-direction:reverse]": reverse },
              className
            )}
            {...props}
          >
            {child}
          </div>
        )
      })}
    </>
  )
}
```

E o CSS que o acompanha, literal, do MDX oficial
(`https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/content/docs/components/orbiting-circles.mdx`):

```css
/* app/globals.css */
@theme inline {
  --animate-orbit: orbit calc(var(--duration) * 1s) linear infinite;

  @keyframes orbit {
    0% {
      transform: rotate(calc(var(--angle) * 1deg))
        translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg));
    }
    100% {
      transform: rotate(calc(var(--angle) * 1deg + 360deg))
        translateY(calc(var(--radius) * 1px))
        rotate(calc((var(--angle) * -1deg) - 360deg));
    }
  }
}
```

O demo oficial
(`https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/registry/example/orbiting-circles-demo.tsx`),
reduzido ao esqueleto — os SVGs de logo foram cortados:

```tsx
export default function OrbitingCirclesDemo() {
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
      <OrbitingCircles iconSize={40}>
        <Icons.whatsapp /> <Icons.notion /> <Icons.openai />
        <Icons.googleDrive /> <Icons.whatsapp />
      </OrbitingCircles>
      <OrbitingCircles iconSize={30} radius={100} reverse speed={2}>
        <Icons.whatsapp /> <Icons.notion /> <Icons.openai /> <Icons.googleDrive />
      </OrbitingCircles>
    </div>
  )
}
```

Dois anéis concêntricos, o de dentro menor, mais rápido (`speed={2}`) e ao contrário
(`reverse`). É literalmente isso que se vê na referência.

### Peça B — o globo `cobe` (código literal)

Fonte: `https://github.com/shuding/cobe` · pacote npm `cobe@2.0.1`

```js
import createGlobe from 'cobe'

const globe = createGlobe(canvas, {
  width: 1000,
  height: 1000,
  markers: [{ location: [37.7595, -122.4367], size: 0.03 }],
  onRender: (state) => { state.phi += 0.01 }
})
```

Opções documentadas: `width`, `height`, `devicePixelRatio`, `phi`, `theta`, `dark`,
`diffuse`, `scale`, `mapSamples`, `mapBrightness`, `baseColor`, `markerColor`,
`glowColor`, `arcColor`, `offset`, `markers`, `arcs`, `markerElevation`, `onRender`.

---

## 1.2 Como o `OrbitingCircles` funciona por dentro

### A matemática do ângulo

Uma linha só:

```tsx
const angle = (360 / React.Children.count(children)) * index
```

N filhos, N fatias iguais de `360/N` graus. Com 4 filhos: 0°, 90°, 180°, 270°.
Não há distribuição por arco parcial, não há offset inicial, não há jitter. É a divisão
mais ingênua possível — e é o certo para o caso.

### Como anima a órbita — e a resposta para a pergunta da contra-rotação

**Não é `rotate` no pai com contra-rotação no filho.** Não há pai girando: cada filho é
um `div` absoluto independente com sua própria animação. E **não usa `@property`**.

O truque está inteiro no keyframe, e é um sanduíche de três transformações:

```
rotate(A)  →  translateY(R)  →  rotate(−A)
```

1. `rotate(A)` gira o sistema de coordenadas do elemento em A graus;
2. `translateY(R)` empurra o elemento R pixels **no eixo Y já girado** — ou seja, para
   um ponto do círculo de raio R, no ângulo A;
3. `rotate(−A)` desfaz a rotação **da orientação do elemento**, sem mexer na posição
   (a translação já aconteceu).

O resultado líquido de rotação é a identidade. **O filho fica sempre em pé.** No frame
final, `A+360` e `−A−360`: mesma posição visual, uma volta completa de percurso, e o
navegador interpola a lista de transformações item a item — dá o movimento circular.

> **Isto é o achado mais importante do relatório para a Tarefa 2.** A contra-rotação
> que você imaginou ter que fazer à mão para o balão de fala **já está feita**. Um filho
> do elemento em órbita não herda rotação nenhuma. Ele herda *deslocamento*, que é o
> problema de verdade — e outro.

**Por que não precisa de `@property`:** `--angle` não é animado. Ele é substituído uma
vez em cada extremidade do keyframe, e o que o navegador interpola é o `transform`
resolvido, que é um tipo nativo. `@property` só seria necessário na implementação
alternativa — a que anima `--angle` de `0deg` a `360deg` — porque uma custom property
não registrada interpola de forma **discreta** (pula, não desliza). Se você for por esse
caminho, precisa de:

```css
@property --angulo {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
```

Suporte de `@property`, medido no browser-compat-data da MDN
(`https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/at-rules/property.json`):
**Chrome 85, Firefox 128, Safari 16.4.** Suporte tranquilo hoje — mas continua sendo
código a mais para nada, porque o sanduíche de três rotações não precisa dele.

### Os props

Da tabela oficial do MDX:

| Prop | Tipo | Padrão | O que faz |
| --- | --- | --- | --- |
| `className` | `string` | — | aplicado **em cada** wrapper de filho |
| `children` | `ReactNode` | — | os filhos em órbita |
| `reverse` | `boolean` | `false` | inverte o sentido via `animation-direction: reverse` |
| `duration` | `number` | `20` | segundos por volta |
| `delay` | `number` | `10` | **documentado, mas não implementado — ver pegadinha** |
| `radius` | `number` | `160` | raio em px |
| `path` | `boolean` | `true` | desenha o filete do arco |
| `iconSize` | `number` | `30` | tamanho da bolinha em px |
| `speed` | `number` | `1` | divisor de `duration` |

### As pegadinhas

**Pegadinha 1 — o `delay` não existe.** Está na interface `OrbitingCirclesProps`, está
documentado na tabela com padrão `10`, e **não está no destructuring**. Compare:

```tsx
// declarado:
delay?: number

// destructurado:
{ className, children, reverse, duration = 20, radius = 160,
  path = true, iconSize = 30, speed = 1, ...props }
//  ↑ delay não está aqui
```

Consequência: `<OrbitingCircles delay={5}>` faz o `5` cair em `...props`, que é
espalhado no `<div {...props}>`, e o React tenta renderizar um atributo `delay="5"` no
DOM. O prop não atrasa nada. Se você quer defasar dois anéis, use `animation-delay` na
mão.

**Pegadinha 2 — `{...props}` é espalhado em TODOS os filhos.** O spread está dentro do
`React.Children.map`. Passar `id="orbita"` com 5 filhos cria **cinco elementos com o
mesmo id**. Passar `onClick` registra o mesmo handler cinco vezes. `className` idem —
por design, nesse caso, mas vale saber.

**Pegadinha 3, a que quebra no celular — o componente não se centraliza sozinho.**
Os filhos são `absolute` **sem `top`, `left`, `inset` ou qualquer offset**. Um elemento
absoluto sem offsets fica na sua *posição estática* — onde ele cairia no fluxo normal.
No demo isso funciona por acidente feliz: o pai é

```html
<div class="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
```

`items-center justify-center` colocam a posição estática no meio. **Troque o pai por um
`relative` comum, um `grid`, ou tire o `justify-center`, e o centro da órbita sai do
lugar** — as bolinhas orbitam em torno do canto superior esquerdo. É uma dependência
implícita e não documentada do layout do pai.

### O que quebra quando o container é estreito

`--radius` é um **número puro multiplicado por `1px`** dentro do keyframe:
`translateY(calc(var(--radius) * 1px))`. Três consequências:

1. **O raio é absoluto e não responde a nada.** Não aceita `%`, `vw`, `cqmin`. Com o
   padrão `radius = 160` e `iconSize = 40`, a órbita ocupa `2 × 160 + 40 = 360px` de
   largura. Numa tela de 380px com os 16–24px de padding de sempre, sobram ~332px: **a
   órbita transborda e o `overflow-hidden` corta as bolinhas nas laterais.** Você perde
   exatamente os dois momentos em que a bolinha está mais "de frente".
2. **Não dá para consertar por media query com facilidade.** `--radius` vem no atributo
   `style` inline; sobrescrever exige `!important` ou reescrever o keyframe.
3. **O filete do arco é um `<circle r={radius}>` em SVG sem `viewBox`.** As unidades são
   px de usuário. Ele acompanha o mesmo problema e é cortado junto.

O conserto é passar `radius` calculado em JS a partir da largura medida, ou — o que eu
faço no componente proposto — **abandonar o `--radius` numérico e usar uma variável CSS
que já é um comprimento**, aí `clamp()` resolve tudo sem JS:

```css
--raio: clamp(88px, 30vw, 150px);
```

---

## 1.3 O globo do Cobe vale a pena aqui?

### Os números, medidos — não estimados

Baixei o tarball de `https://registry.npmjs.org/cobe/-/cobe-2.0.1.tgz` e medi:

| Arquivo | Bruto | Gzip -9 |
| --- | --- | --- |
| `dist/index.esm.js` | 12.937 B | **5.845 B (~5,7 KB)** |
| `dist/index.d.ts` | 1.043 B | 427 B |
| pacote inteiro (`unpackedSize` do registry) | 19.292 B | — |

**Dependências: zero.** A alegação de "~5KB" do README bate com a medição. Como peso de
download, `cobe` é honesto e barato.

### Roda WebGL?

Sim. Shaders GLSL próprios, baseados em Spherical Fibonacci Mapping (Keinert et al.),
com referência declarada ao trabalho de Inigo Quilez e à biblioteca Phenomenon. O
"globo" não é geometria: é um **shader de fragmento** que resolve a esfera por pixel.

### O custo em celular fraco

Aqui é preciso ser honesto sobre o que eu confirmei e o que não confirmei:

- **Confirmado:** 5,7 KB gzip, zero dependências, WebGL, shader por fragmento.
- **Não confirmado:** número de FPS ou consumo de bateria em aparelho específico. A
  documentação do cobe não publica dados de performance em mobile, e eu não tinha um
  aparelho para medir. Não vou inventar.

O que dá para afirmar por raciocínio, e que já basta para a decisão:

1. Um shader por fragmento custa **proporcional à área em pixels**, não ao número de
   pontos. Num celular com `devicePixelRatio` 3, um globo de 320 CSS px vira 960×960 =
   **~920 mil fragmentos por quadro**. É a parte cara, e ela cresce com o quadrado do
   DPR. O padrão dos exemplos é passar `devicePixelRatio: 2`, o que ajuda, mas ainda é
   muita área.
2. Criar um contexto WebGL tem custo fixo de inicialização e **memória de GPU**, num
   aparelho que já está rodando as fotos e os vídeos da página.
3. Navegadores limitam o número de contextos WebGL simultâneos e descartam os antigos.
   Se um dia entrar outro elemento WebGL na página, um dos dois morre.

### A alternativa em canvas 2D

Dá para desenhar uma cúpula de partículas muito parecida sem WebGL nenhum. A receita:

1. **Distribuir N pontos uniformemente numa esfera** com a espiral de Fibonacci — a
   mesma ideia matemática que o cobe usa, só que em JS:
   `y = 1 − 2i/(N−1)`, `r = √(1−y²)`, `θ = i × π(3−√5)`, daí `x = cos(θ)·r`,
   `z = sin(θ)·r`.
2. **Girar em torno de Y** por um ângulo `φ` que cresce a cada quadro.
3. **Projetar ortograficamente**: só usar `x` e `y`. Descartar `z < 0` (hemisfério de
   trás) — é isso que dá a leitura de "cúpula" e não de "bola de pontos".
4. **Modular tamanho e alpha por `z`** para dar profundidade.

Cerca de 40 linhas, **0 KB de dependência**, e o custo passa a ser proporcional ao
**número de pontos**, não à área — com 900 pontos a 30fps é barato em qualquer celular.
Está no componente proposto no fim do relatório.

### A recomendação, e a defesa

**Recomendo canvas 2D. Descarte o cobe.** Três argumentos, em ordem de peso:

**1. O globo está semanticamente errado nesta página.** O globo existe na referência
porque o produto dela é um SaaS com integrações mundiais — Slack, Figma, Supabase. É a
metáfora "conectamos o mundo". A Rapa Sound faz som, luz e LED para festa de 15 anos em
**Uberlândia/MG**. Um planeta girando atrás de quatro debutantes não comunica alcance:
comunica template. É exatamente o tipo de elemento que denuncia que a página foi montada
a partir de um componente pronto.

**2. A cúpula de partículas comunica o produto; o globo não.** A empresa vende **luz no
ar**. O `Haze.tsx` que já existe no projeto acertou essa leitura — o comentário do
arquivo diz, corretamente, que "a fumaça é o que faz o feixe aparecer". Uma cúpula de
partículas em congo→magenta subindo do rodapé da seção lê como **haze pegando luz de
palco**, que é literalmente o que a empresa faz acontecer. O mesmo pixel, custando
menos, dizendo a coisa certa.

**3. O tráfego é majoritariamente celular, e o projeto já tem canvas 2D resolvido.**
`Haze.tsx` já resolveu rAF cancelado no unmount, pausa fora do viewport, pausa quando a
aba perde foco e porta de `prefers-reduced-motion`. Trazer o cobe significa reimplementar
esse ciclo de vida inteiro em cima de um contexto WebGL, para um efeito que o público
não pediu. **A economia real não é o 5,7 KB — é não abrir um contexto WebGL num Android
de entrada no meio de uma página que já tem fotos e vídeo.**

Se um dia o cliente exigir o globo literalmente, o cobe é a escolha certa e o peso é
aceitável. Mas ele não é a escolha certa *aqui*.

---

# PARTE 2 — ADAPTAR PARA DEPOIMENTOS

Pedido literal: *"isso poderia ser a parte de depoimentos que quando as bolinhas vão
passando vai aparecendo o depoimento em forma de balão em cada bolinha falando bem da
Rapa"*.

Os dados existentes, de `lib/conteudo.ts` — são 4, e todos de 15 anos:

```ts
export const DEPOIMENTOS: Video[] = [
  { id: 'Duu55y9-doc',  titulo: 'Diana, mãe da debutante Lana Ribeiro', tipo: 'mãe de debutante' },
  { id: '-4uQIpkfB3E', titulo: 'Vitória Francis, debutante',            tipo: 'debutante' },
  { id: 'Mg31EitG_YY', titulo: 'Maria Antônia, debutante',              tipo: 'debutante' },
  { id: '5hAsVfeDe_4', titulo: 'Ana Laura (Ani), debutante',            tipo: 'debutante' },
]
```

Quatro é um número bom para órbita: `360/4 = 90°`, distribuição limpa.

## 2.1 Ancorar um balão a um alvo que se move

### Opção A — CSS Anchor Positioning

A API: `anchor-name` no alvo, `position-anchor` no balão, `position-area` para escolher
a célula da grade 3×3 em volta da âncora, `position-try-fallbacks` para virar o balão
quando ele encosta na borda.

```css
.bolinha  { anchor-name: --cliente-1; }
.balao    { position: absolute;
            position-anchor: --cliente-1;
            position-area: block-start;   /* acima da âncora */
            position-try-fallbacks: flip-block, flip-inline; }
```

**Suporte HOJE, de fonte primária.** Aqui há uma armadilha de informação: vários blogs
de SEO indexados afirmam "Baseline 2026, Chrome 125+, Firefox 132+, Safari 18.2+, ~91%
do tráfego". **Isso está errado.** Fui ao dado primário.

`https://api.webstatus.dev/v1/features/anchor-positioning` (consultado em 2026-08-05)
retorna, literalmente:

```json
"baseline": { "status": "limited" }
```

E o browser-compat-data da MDN, por propriedade
(`https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/*.json`):

| Propriedade | Chrome | Firefox | Safari |
| --- | --- | --- | --- |
| `anchor-name` | 125 | **147** | **26** |
| `position-area` | 129 | 147 | 26 |
| `position-try-fallbacks` | 128 | 147 | 26 |
| `anchor-scope` | 131 | 147 | 26 |
| `position-anchor` | 144 (parcial) | 151 | 26 (parcial) |

Ou seja: **Firefox 147, não 132. Safari 26, não 18.2. Baseline "limited", não "widely
available".** E `position-anchor` — a propriedade sem a qual nada funciona — está
marcada **`partial_implementation: true` em Chrome e Safari**, com o valor inicial
divergindo da especificação (`crbug.com/501399489`, `webkit.org/b/308981`). O Chrome já
trocou esse valor inicial três vezes: 125 → 127 → 144.

E o detalhe que mata para este projeto: o WPT (web-platform-tests) de
`anchor-positioning`, no mesmo endpoint do webstatus, dá **`chrome_android: 0.678` no
canal stable**, contra `0.948` no Chrome desktop. **O suporte em Android é medido como
sensivelmente pior que no desktop**, e o tráfego desta página é majoritariamente celular.

**Veredito: não usar em produção aqui.** Não pelo "vai que não pega" — pelo dado.

### Opção B — Floating UI com `autoUpdate({ animationFrame: true })`

Fonte: `https://floating-ui.com/docs/autoUpdate`. Opções e padrões:

| Opção | Padrão |
| --- | --- |
| `ancestorScroll` | `true` |
| `ancestorResize` | `true` |
| `elementResize` | `true` |
| `layoutShift` | `true` |
| `animationFrame` | **`false`** |

```js
const cleanup = autoUpdate(referenceEl, floatingEl, update, {
  animationFrame: true,
})
```

A doc lista como caso de uso exatamente o nosso — *"the reference element is animating
on the screen with `transform`s"* — e diz que a opção *"should be used sparingly"*.
Sendo rigoroso: **a documentação não publica um número de custo**; ela chama a opção de
"optimized for performance" e ao mesmo tempo manda usar com parcimônia. O custo em ms
por quadro é **não confirmado**.

O custo estrutural, esse dá para descrever com precisão, e é o que decide:
`animationFrame: true` roda `getBoundingClientRect()` **a cada quadro, para cada par
âncora/balão**. Com 4 balões são 8 leituras de geometria por quadro. `getBoundingClientRect()`
força **reflow síncrono** — e o pior é a ordem: ler geometria e em seguida escrever
`transform` no balão, 4 vezes seguidas, é o padrão clássico de *layout thrashing*. A
animação da órbita roda no compositor, de graça; ligar o Floating UI por cima **traz o
trabalho de volta para a main thread**, que é justamente o recurso escasso no celular.

Some a isso ~
o peso de `@floating-ui/react` (**não confirmado** — não medi, e não vou chutar) numa
página que hoje tem só framer-motion e GSAP.

**Veredito: overkill.** Floating UI existe para posicionar menus e tooltips contra
bordas de viewport com colisão e flip. Nada disso é o nosso problema.

### Opção C — o balão como filho do próprio elemento em órbita

E aqui a Parte 1 já entregou a resposta: **o filho não herda rotação nenhuma.** O
keyframe do Magic UI é `rotate(A) translateY(R) rotate(−A)`, e a rotação líquida é a
identidade. Um `<div>` filho do elemento em órbita **já nasce em pé** e continua em pé
durante a volta inteira. Não há contra-rotação a fazer.

Custo: **zero JS, zero medição, zero reflow.** O balão anda junto porque está dentro do
mesmo elemento que o compositor já está movendo. Uma camada, uma transformação.

```tsx
{/* o balão é filho — sobe junto, e já vem em pé, de graça */}
<div className="orb absolute left-1/2 top-1/2" style={{ '--a': '90deg' } as React.CSSProperties}>
  <img src="/clientes/vitoria.webp" alt="" className="size-14 rounded-full" />
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56">
    …balão aqui, sem rotação nenhuma…
  </div>
</div>
```

**Se fosse para fazer balão preso, seria assim — Opção C, sem discussão.** Anchor
Positioning ainda não está pronto e Floating UI cobra caro por um problema que não temos.

**A pegadinha da Opção C**, que é o que faz eu não recomendar balão nenhum: o balão
**não gira, mas viaja**. Um retângulo de 224px de largura preso a uma bolinha que
percorre um círculo de 300px de diâmetro varre uma área enorme, sai da caixa da seção,
passa por cima das outras bolinhas, e quando a bolinha está à direita o balão precisa
abrir para a esquerda — senão sai da tela. Isso é lógica de colisão. E aí você acabou de
reinventar o Floating UI, na mão e pior.

## 2.2 O problema da legibilidade

O enunciado dizia "um texto que gira junto com a órbita é ilegível". A pesquisa corrigiu
a premissa: **o texto não gira** (Seção 1.2). Mas ele **translada**, e translação é
igualmente fatal para leitura de parágrafo.

Por quê, concretamente: com `duration = 20s` num círculo de raio 150px, a bolinha
percorre `2π × 150 ≈ 942px` em 20s, ou seja **~47 px/s**. Um depoimento de 3 linhas leva
uns 6 a 8 segundos para ser lido. Nesse tempo o balão andou **entre 280 e 375 px** e
mudou de lado da tela. O olho precisa perseguir (*smooth pursuit*) enquanto sacada de
leitura acontece — as duas coisas competem pelo mesmo sistema oculomotor. Não é questão
de gosto: é ruim para todo mundo, e pior para quem tem baixa visão, dislexia ou
sensibilidade vestibular.

Soluções reais, e o que cada uma custa:

| Solução | Como | O problema |
| --- | --- | --- |
| Reduzir a velocidade | `duration: 60s` | 47 px/s vira 16 px/s. Ainda anda 100px durante a leitura. E a órbita fica tão lenta que parece travada |
| Pausar a órbita quando o balão abre | `animation-play-state: paused` | Funciona bem, mas com 4 balões trocando a órbita fica parada mais tempo do que andando — a animação perde a razão de existir |
| Balão só no hover/tap | interação | Mata o autoplay que o cliente pediu ("vai passando, vai aparecendo"), e no celular hover não existe |
| Órbita com pausa no topo | keyframes com platô | Melhor dos balões: a bolinha para 4s no topo, o balão abre parado, depois segue. Movimento irregular, mais complexo, mas legível |
| **Painel fixo no centro** | bolinhas orbitam, texto não se move | O balão deixa de existir |

### Comparação fechada das duas abordagens

| Critério | Balão preso à bolinha | **Painel fixo no centro** |
| --- | --- | --- |
| **Legibilidade** | Texto viaja ~300px durante a leitura. Corpo tem que ser pequeno para o balão caber. Ruim | Texto parado, pode usar `--text-lg`/`--text-xl` da escala do projeto. Ótimo |
| **Acessibilidade** | Alvo de toque em movimento — viola WCAG 2.5.x na prática; leitor de tela lê um balão que aparece e some | Texto num container estável; ordem de leitura previsível; os 4 sempre no DOM |
| **Beleza** | Efeito "wow" nos primeiros 3s, depois vira bagunça: 4 retângulos de texto girando sobre um fundo escuro viram ruído. Em 380px, impossível | Órbita limpa como elemento gráfico + tipografia grande no centro. A órbita vira **moldura**, não competidor |
| **380px** | 4 balões de 224px num círculo de 228px de diâmetro: sobreposição total | Painel usa o miolo do círculo; no celular vira fileira + painel embaixo |
| **Custo de implementação** | Colisão, flip, z-index, pausa | Um `setInterval` e um crossfade |
| **O pedido do cliente** | Literal | Cumprido no espírito: "quando as bolinhas vão passando vai aparecendo o depoimento" |

### Recomendação fechada

**Painel fixo no centro. A bolinha da vez se destaca; o texto não se move.**

A defesa, e ela não é "é mais fácil":

**O balão preso resolve o problema errado.** O balão de fala existe na linguagem visual
para dizer *quem* está falando quando há ambiguidade — numa HQ, com seis personagens no
quadro. Aqui não há ambiguidade nenhuma: só uma pessoa fala por vez. O rabicho do balão
está resolvendo um problema que não existe, e cobra por isso a legibilidade inteira do
texto.

**O destaque na bolinha faz o mesmo trabalho por menos.** A bolinha da vez ganha aro
âmbar cheio, escala 1.25 e as outras caem para 45% de opacidade. A ligação entre rosto e
frase fica igualmente inequívoca — e o nome ainda aparece escrito no `<figcaption>`, o
que o balão não garantia.

**E o painel central é o que salva o elemento visualmente.** O ponto fraco da referência
do 21st.dev é que o miolo do círculo fica **vazio** — é por isso que eles enfiaram um
globo ali. Colocando o depoimento no centro, o buraco vira o assunto, a órbita vira
moldura, e a cúpula de partículas some para o papel de ambiente, que é onde ela deve
estar pela restrição de cor. **Você resolve legibilidade e composição com a mesma
decisão.**

Isso não é abrir mão do pedido. O cliente pediu que "quando as bolinhas vão passando vai
aparecendo o depoimento". Continua exatamente assim: a bolinha passa, ela acende, o
depoimento dela aparece. Só que aparece onde dá para ler.

## 2.3 Como escolher qual depoimento aparece

### Por posição na órbita — e como detectar sem ler o DOM a cada quadro

Não precisa ler o DOM **nunca**. A órbita é determinística e tem forma fechada.

O ângulo do filho `i` no instante `t`:

```
ângulo_i(t) = A_i + 360·(t/D),  onde A_i = 360·i/N
```

Como `translateY(+R)` com rotação 0 empurra o elemento para **baixo** (Y positivo é para
baixo no CSS), o filho está no **topo** quando o ângulo vale 180°:

```
360·i/N + 360·t/D ≡ 180   (mod 360)
t_i = D·(1/2 − i/N)       (mod D)
```

Duas consequências práticas, e são as duas úteis:

1. **Filhos consecutivos cruzam o topo a cada `D/N` segundos, exatamente.** Com `D = 24s`
   e `N = 4`: um a cada **6 segundos**. Então "trocar por posição na órbita" e "trocar por
   tempo" **são a mesma coisa** — basta escolher o intervalo `D/N`. Não há nada a detectar.
2. A fase inicial sai da fórmula: o filho 0 chega ao topo em `t = D/2 = 12s`; e como o
   ângulo cresce, a ordem de chegada é `i` **decrescente** (0, N−1, N−2, …).

Se você quiser tolerância zero a drift entre o texto e a posição visual, **não** use
`getBoundingClientRect` num rAF. Leia o relógio da própria animação, uma vez por troca:

```ts
// leitura pontual do relógio da animação — não roda por quadro
const anim = elemento.getAnimations()[0]
const progresso = (Number(anim.currentTime) / 1000) % D / D   // 0..1
const ativo = Math.round((0.5 - progresso) * N) % N
```

`Animation.currentTime` vem do relógio do próprio compositor, então não acumula drift
com o CSS. Custo: uma leitura a cada 6s, não 60 por segundo.

### As três opções

| Estratégia | A favor | Contra |
| --- | --- | --- |
| **Por tempo (`D/N`)** | Uma linha. Idêntico ao "por posição" pela matemática acima. Funciona igual quando a órbita não existe (celular, reduced-motion) | Pode dessincronizar do CSS ao longo de minutos, se você exigir amarração ao topo |
| Por posição com `getAnimations()` | Amarração exata ao topo | Só funciona quando há órbita. No celular e em reduced-motion não há animação para ler — precisa de um segundo caminho de qualquer jeito |
| Por interação (tap/hover) | Controle total do usuário | Sozinho, mata o autoplay pedido. Hover não existe no celular |

### Recomendação

**Por tempo, `D/N`, com interação por cima — e sem amarrar ao topo.**

O argumento decisivo é o segundo item da tabela: o celular **não vai ter órbita** (Seção
2.5) e `prefers-reduced-motion` também não. Se a escolha do depoimento depender de ler
o relógio de uma animação, você precisa escrever um caminho alternativo para os dois
casos mais importantes. **Um `setInterval(D/N)` é o mesmo código nas três situações.**

E como o destaque é por aro âmbar e escala — e não por posição no topo — a bolinha da
vez é reconhecível **onde quer que ela esteja no círculo**. A amarração ao topo deixa de
ter função. Menos código e mais robusto pela mesma decisão.

Por cima: tocar/clicar numa bolinha troca para aquele depoimento e reinicia o
temporizador. É o que dá controle a quem quer reler.

## 2.4 Acessibilidade

### Os 4 textos sempre no DOM

Duas exigências que se juntam bem aqui:

- Depoimento é **conteúdo**, não decoração. Tem que estar no DOM e legível pelo leitor de
  tela mesmo que a animação nunca rode.
- O projeto é `output: 'export'`. **O HTML no disco é o que o Google e o leitor de tela
  veem primeiro.**

Isso empurra para uma arquitetura de *progressive enhancement* que resolve os dois de
uma vez:

> **O HTML exportado contém os 4 depoimentos empilhados, estáticos e legíveis. O
> JavaScript, se rodar e se for bem-vindo, promove aquilo a órbita.**

Na prática: `const [animado, setAnimado] = useState(false)` — o estado inicial, que é o
que sai no HTML, é a lista estática. Um `useEffect` liga a animação só se
`prefers-reduced-motion` não estiver ativo e a tela for larga. Sem JS: lista. Com
reduced-motion: lista. Com JS e tela grande: órbita.

E no modo animado os 4 continuam no DOM: os `<figure>` ficam todos **na mesma célula de
grid** (`[grid-area:1/1]`), os inativos com `opacity-0`. `opacity: 0` **mantém o
elemento na árvore de acessibilidade** — ao contrário de `display: none`,
`visibility: hidden` e `hidden`, que o removem. O leitor de tela lê os quatro, em ordem,
independente de qual está visível.

Bônus do `grid` com todos na mesma célula: o painel se dimensiona pelo depoimento mais
alto e **não pula de altura** a cada troca.

### A marcação correta — e a pegadinha do `<cite>`

O par certo é `<figure>` + `<blockquote>` + `<figcaption>`. `<blockquote>` é a citação;
`<figcaption>` é a atribuição. A atribuição **não pode ficar dentro do `<blockquote>`**,
porque não faz parte do que foi dito.

**E `<cite>` no nome da pessoa está errado.** É a pegadinha, e é explícita na
especificação. WHATWG HTML, seção do elemento `cite`
(`https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-cite-element`),
literalmente:

> "The `cite` element represents the title of a work (e.g. a book, a paper, an essay, a
> poem, a score, a song, a script, a film, a TV show, a game, a sculpture, a painting, a
> theatre production, a play, an opera, a musical, an exhibition, a legal case report, a
> computer program, etc.)."

E, sem margem para interpretação:

> "**A person's name is not the title of a work — even if people call that person a piece
> of work — and the element must therefore not be used to mark up people's names.**"

A própria spec traz o exemplo do que **não** fazer:

```html
<!-- do not copy this example, it is an example of bad usage! -->
<p><q>This is still wrong!</q>, said <cite>Ian</cite>.</p>
```

A confusão é histórica e legítima: o HTML5.1 do W3C chegou a permitir nome de autor em
`<cite>`, e a maioria dos tutoriais de "testimonial component" por aí copia isso. A
WHATWG — que é a spec viva — proíbe. Para nome de pessoa, use `<span>` ou, se houver
razão tipográfica, `<b>`.

```html
<figure>
  <blockquote>
    <p>Superou tudo o que a gente tinha imaginado. A pista não esvaziou um minuto.</p>
  </blockquote>
  <figcaption>
    <span>Diana</span> — mãe da debutante Lana Ribeiro
  </figcaption>
</figure>
```

Note também que a foto na bolinha leva `alt=""`: ela é **redundante** com o nome no
`<figcaption>`, e alt repetido é ruído para quem usa leitor de tela.

### `aria-live`: o erro comum é ligar

Instinto natural: o texto troca sozinho, então `aria-live="polite"`. **Errado**, e a
ARIA Authoring Practices é explícita. Padrão Carousel
(`https://www.w3.org/WAI/ARIA/apg/patterns/carousel/`):

> "aria-live set to: **off**: if the carousel is automatically rotating."
> "**polite**: if the carousel is NOT automatically rotating."

O motivo é prático: um `aria-live` num carrossel automático interrompe o leitor de tela
a cada 6 segundos, para sempre, inclusive quando a pessoa está lendo outra parte da
página. No nosso caso é ainda mais claro — **os 4 textos já estão todos no DOM**, então
não há nada que o usuário de leitor de tela perderia. A camada visual que gira é
duplicata: marque-a `aria-hidden="true"` e pronto.

Também da APG:

> "role region or role group" com "aria-roledescription property set to carousel",
> cada slide com "role group" e "aria-roledescription set to slide".

### O botão de pausar — WCAG 2.2.2, critério confirmado

Confirmado em `https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html`.
**Success Criterion 2.2.2 Pause, Stop, Hide — Nível A** (não AA):

> "**Moving, blinking, scrolling:** For any moving, blinking or scrolling information
> that (1) starts automatically, (2) lasts more than five seconds, and (3) is presented
> in parallel with other content, there is a mechanism for the user to pause, stop, or
> hide it unless the movement, blinking, or scrolling is part of an activity where it is
> essential"

> "**Auto-updating:** For any auto-updating information that (1) starts automatically and
> (2) is presented in parallel with other content, there is a mechanism for the user to
> pause, stop, or hide it or to control the frequency of the update unless the
> auto-updating is part of an activity where it is essential"

A seção proposta dispara **as duas** cláusulas: a órbita é *moving* e dura muito mais que
5 segundos; a troca de depoimento é *auto-updating*. E "essential" não salva — o
movimento não é essencial para entender um depoimento.

A nota do documento reforça que isso não é opcional:

> "content that does not meet this success criterion can interfere with a user's ability
> to use the whole page, [so] all content on the web page (whether it is used to meet
> other success criteria or not) must meet this success criterion."

**Portanto: botão de pausar visível, sempre. Nível A.** Mais o que a APG pede de brinde:

> "Stops rotating when keyboard focus enters the carousel. It does not restart unless the
> user explicitly requests it to do so."
> "Stops rotating whenever the mouse is hovering over the carousel."

Atenção ao detalhe: **foco de teclado para e NÃO volta sozinho**; hover para e volta ao
sair. São regras diferentes, e é comum implementar as duas como hover.

O botão é âmbar (é botão — restrição de cor), com `aria-pressed` refletindo o estado.

A pausa em si: `animation-play-state: paused`, suporte antigo em todos os motores
(Chrome 43, Firefox 16, Safari 9 — BCD), mais parar o `setInterval`.

## 2.5 No celular

Uma órbita de raio 150px pede `2 × 150 + 56 = 356px` só de largura, antes de qualquer
padding. Em 380px, com os 16px de padding de cada lado, sobram 348. **Não cabe.** E se
couber, o painel central fica com um miolo de ~240px de largura para acomodar 3 linhas
de citação em `--text-lg` — não cabe também.

As três saídas:

| Saída | Veredito |
| --- | --- |
| **Reduzir o raio** | `clamp(88px, 30vw, 150px)` faz a órbita caber em 380px (raio 114, largura 284). Mas o miolo cai para ~170px de largura: o painel central **deixa de caber**. Resolve a órbita e quebra o conteúdo |
| **Reduzir o número de bolinhas** | São 4 depoimentos. Mostrar 2 é jogar fora metade da prova social — o ativo mais caro da seção. Descartado |
| **Trocar o arranjo** | A órbita vira **fileira horizontal** de 4 avatares, o painel vai para baixo dela |

### Recomendação

**Trocar o arranjo. No celular a órbita não existe.**

Não é degradação: é o layout certo para a proporção certa. Um retrato de 380×800 quer
empilhamento vertical; um círculo é a forma que pior aproveita uma tela estreita e alta —
desperdiça os quatro cantos e come a largura, que é o recurso escasso. Uma fileira de 4
avatares de 56px ocupa `4×56 + 3×16 = 272px`, sobra folga, e **os 4 rostos aparecem ao
mesmo tempo** — que em prova social é melhor do que um de cada vez.

O movimento não some: a fileira ganha o mesmo destaque de aro âmbar e escala na ativa, e
o painel embaixo faz crossfade. É a mesma leitura, na proporção certa.

Vantagem estrutural que decide a implementação: **a fileira é o mesmo DOM da lista
estática do fallback**, só com autoplay ligado. Ou seja, `orbita` e `autoplay` viram dois
booleanos independentes e cobrem os quatro casos com um componente só:

| Situação | `orbita` | `autoplay` | Resultado |
| --- | --- | --- | --- |
| HTML exportado, sem JS | `false` | `false` | 4 depoimentos empilhados, estáticos |
| `prefers-reduced-motion` | `false` | `false` | idem — fallback estático real |
| Celular (< 640px) | `false` | `true` | fileira + painel com crossfade |
| Desktop | `true` | `true` | órbita + painel central |

## 2.6 Referências

Todas verificadas — cada URL foi carregada. Onde a mecânica não pôde ser confirmada,
está escrito.

**Os que mais importam para este caso** (citação atrelada a elemento que se move):

1. **Aceternity UI — Animated Testimonials** — `https://ui.aceternity.com/components/animated-testimonials`
   As fotos ficam empilhadas com rotação aleatória de −10° a +10°, e a ativa vai para
   `rotate: 0` fazendo um arco vertical `y: [0, −80, 0]` (pula e assenta) enquanto a
   citação é revelada palavra por palavra com `filter: blur(10px) → blur(0)` — é a prova
   de que **texto parado + foto que se move** funciona melhor que os dois se movendo.

2. **Stripe** — `https://stripe.com/`
   A citação é ancorada a uma barra de seleção que desliza sobre a fileira de logos dos
   clientes (`testimonial-carousel__navigation-selection-bar`, com `aria-label` real por
   cliente: "Mostrar depoimento de Lightspeed") — a navegação vira prova social por si só,
   e é exatamente o padrão "elemento indicador se move, texto não".

3. **Assemble** — `https://www.awwwards.com/inspiration/animated-testimonial-cards-assemble`
   Os cards trocam de posição física entre si a cada clique (`Desktop - Position 1/2/3`),
   então a citação viaja junto com o card — o caso raro em que texto em movimento foi
   bem resolvido, porque o deslocamento é curto e termina antes da leitura começar.

**Os demais:**

4. **Magic UI — Marquee** — `https://magicui.design/docs/components/marquee`
   A demo oficial é de cards de review com avatar e @username, e a variante 3D empilha
   várias esteiras em perspectiva rodando em sentidos opostos — quebra a leitura de
   "carrossel plano" sem custar interatividade.

5. **Intercom** — `https://www.intercom.com/`
   A esteira de `<figure data-analytics-region="testimonial">` some suavemente nas duas
   bordas por máscara (`linear-gradient(to right, transparent 0%, black 20%, black 80%,
   transparent 100%)`) e pausa no hover (`animation-play-state: paused`) — o detalhe da
   máscara é o que evita a sensação de corte seco típica de marquee mal feito.

6. **Raycast** — `https://www.raycast.com/`
   Carrossel Embla arrastável em que cada card cita a *extensão específica* que a pessoa
   usa, amarrando a prova social a uma funcionalidade concreta em vez de elogio genérico.

7. **Cash App** — `https://cash.app/`
   O depoimento é um vídeo em formato retrato rodando em loop mudo dentro de uma grade de
   três colunas, o que dá cara de conteúdo social nativo em vez de card de citação —
   diretamente aplicável, já que os 4 depoimentos da Rapa **já são vídeo**.

8. **Webyansh** — `https://www.awwwards.com/inspiration/testimonials-interaction-and-animation-webyansh-ux-design-webflow`
   Fileira de depoimentos arrastável com inércia via GSAP Draggable que continua
   deslizando ao soltar, transformando a leitura em manipulação direta em vez de clique
   de seta.

9. **Depict.ai** — `https://www.awwwards.com/inspiration/testimonial-depict-ai`
   Uma citação única em destaque dentro de um bento que se monta conforme o scroll — a
   prova de que **um** depoimento bem apresentado tem mais peso editorial que seis em
   grade.

10. **SystemOne** — `https://www.awwwards.com/inspiration/testimonial-system-one`
    A troca de depoimento é dirigida pelo scroll, não por timer, então o usuário controla
    o ritmo da leitura — resolve o WCAG 2.2.2 por construção, já que nada se move sozinho.
    *Detalhe da transição não confirmado — a página do Awwwards só expõe tags e vídeo.*

11. **Qudrix** — `https://www.awwwards.com/inspiration/testimonial-page-qudrix`
    Os depoimentos são organizados como **linhas de tabela** animadas — formato raro, e a
    saída mais distante de "grade de cards" que encontrei. *Mecânica de animação não
    confirmada.*

**Descartados por não baterem com o brief:** Vercel (o `animate-marquee` é logo cloud,
não depoimento), Linear `/customers` (bloco de métricas + cards de case study genéricos),
Arc, Superlist, Framer, Attio, Resend, Clerk, Wise, Basecamp — nenhum expôs seção de
depoimento animada e distintiva no HTML servido.

---

# O COMPONENTE PROPOSTO

Três arquivos: um bloco de CSS em `app/globals.css`, o componente da cúpula, e o
componente da seção.

Sem `shadcn`, sem `cn()`, `<img>` puro, tokens do `@theme` do projeto.

## Arquivo 1 — bloco para `app/globals.css`

```css
/* ============================================================
   ORBITA DE DEPOIMENTOS
   O keyframe e o mesmo do Magic UI, com duas correcoes:
   1. --raio e um COMPRIMENTO, nao um numero puro. Isso deixa o
      raio responder a clamp() sem passar por JS — era a razao
      pela qual o original transbordava em 380px.
   2. translate(-50%,-50%) entra na propria transformacao, entao
      a orbita se centraliza sozinha. O original dependia, sem
      documentar, de o pai ser flex com items/justify-center.
   O sanduiche rotate(A) translateY(R) rotate(-A) mantem a
   rotacao liquida em identidade: o filho NAO gira. Nao ha
   contra-rotacao a fazer na mao, e nao e preciso @property
   porque --a nao e animado, so substituido nas duas pontas.
   ============================================================ */
@keyframes orbita {
  from {
    transform: translate(-50%, -50%)
      rotate(var(--a)) translateY(var(--raio)) rotate(calc(var(--a) * -1));
  }
  to {
    transform: translate(-50%, -50%)
      rotate(calc(var(--a) + 360deg)) translateY(var(--raio))
      rotate(calc((var(--a) * -1) - 360deg));
  }
}

.orb {
  animation: orbita var(--dur, 24s) linear infinite;
  will-change: transform;
}

/* pausa: WCAG 2.2.2 (nivel A) exige o mecanismo; a APG pede
   ainda parar no hover e ao receber foco de teclado. */
[data-pausado='true'] .orb { animation-play-state: paused; }

/* prefers-reduced-motion — fallback ESTATICO REAL.
   Cinto e suspensorio: o React ja nao monta a orbita nesse caso
   (ver `animado` no componente), mas se por qualquer motivo o
   markup aparecer, aqui ele para de vez. Nada de "mais lento". */
@media (prefers-reduced-motion: reduce) {
  .orb { animation: none !important; }
}
```

## Arquivo 2 — `components/CupulaHaze.tsx`

```tsx
'use client'

import { useEffect, useRef } from 'react'

/**
 * CUPULA HAZE — a cupula de particulas atras da orbita.
 *
 * Substitui o globo Cobe da referencia do 21st.dev. Cobe pesa
 * 5,7 KB gzip (medido no tarball de cobe@2.0.1) e abre um contexto
 * WebGL cujo custo cresce com a AREA em pixels — num celular com
 * devicePixelRatio 3 sao ~920 mil fragmentos por quadro. Aqui o
 * custo cresce com o NUMERO DE PONTOS, que eu controlo.
 *
 * E um globo seria semanticamente errado: a empresa atende
 * Uberlandia/MG, nao o planeta. Uma cupula de particulas le como
 * haze pegando luz de palco — que e literalmente o produto.
 *
 * COR: congo -> magenta. Isto e AMBIENTE e fica atras de tudo.
 * Magenta nunca encosta em rosto nem em botao (restricao dura).
 *
 * Ciclo de vida copiado do que Haze.tsx ja acertou: rAF cancelado
 * no unmount, pausa fora do viewport, pausa com a aba sem foco.
 */
export function CupulaHaze({ pontos = 900 }: { pontos?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // porta de reduced-motion: nada se move, e nada e desenhado.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    let raf = 0
    let phi = 0
    let visivel = true

    // espiral de Fibonacci: distribui N pontos uniformemente numa
    // esfera. E a mesma ideia matematica que o Cobe usa no shader
    // (Spherical Fibonacci Mapping), so que em 30 linhas de JS.
    const INC = Math.PI * (3 - Math.sqrt(5)) // ~2.399963 rad
    const base = Array.from({ length: pontos }, (_, i) => {
      const y = 1 - (2 * i) / (pontos - 1)      // -1 .. 1
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const t = i * INC
      return { x: Math.cos(t) * r, y, z: Math.sin(t) * r }
    })

    // dpr limitado a 2: acima disso o ganho visual e nulo e o
    // custo de preenchimento dobra. Decisao de celular.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function medir() {
      const { width, height } = cv!.getBoundingClientRect()
      cv!.width = Math.round(width * dpr)
      cv!.height = Math.round(height * dpr)
    }
    medir()

    function quadro() {
      const w = cv!.width
      const h = cv!.height
      ctx!.clearRect(0, 0, w, h)

      // o centro da esfera fica ABAIXO da borda de baixo: so o
      // topo aparece, e e isso que le como cupula e nao como bola.
      const cx = w / 2
      const cy = h * 1.15
      const raio = Math.min(w * 0.62, h * 1.5)

      const cos = Math.cos(phi)
      const sen = Math.sin(phi)

      for (const p of base) {
        // rotacao em torno de Y
        const x = p.x * cos - p.z * sen
        const z = p.x * sen + p.z * cos
        if (z < 0) continue // descarta o hemisferio de tras

        // projecao ortografica: so x e y importam
        const px = cx + x * raio
        const py = cy - p.y * raio
        if (py > h || py < -20) continue

        // profundidade controla tamanho e opacidade
        const prof = 0.35 + z * 0.65
        // congo (#21105C) no fundo, magenta (#D81E7E) na frente.
        // AMBIENTE — nao encosta em rosto nem em botao.
        const mix = z * z
        const r = Math.round(0x21 + (0xd8 - 0x21) * mix)
        const g = Math.round(0x10 + (0x1e - 0x10) * mix)
        const b = Math.round(0x5c + (0x7e - 0x5c) * mix)

        ctx!.fillStyle = `rgba(${r},${g},${b},${(0.10 + prof * 0.34).toFixed(3)})`
        ctx!.fillRect(px, py, dpr * prof * 1.6, dpr * prof * 1.6)
      }

      phi += 0.0016 // ~1 volta a cada 65s: presenca, nao distracao
      raf = requestAnimationFrame(quadro)
    }

    function ligar() {
      if (raf || !visivel || document.hidden) return
      raf = requestAnimationFrame(quadro)
    }
    function desligar() {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting
      visivel ? ligar() : desligar()
    })
    io.observe(cv)

    const aba = () => (document.hidden ? desligar() : ligar())
    document.addEventListener('visibilitychange', aba)
    const ro = new ResizeObserver(medir)
    ro.observe(cv)

    ligar()
    return () => {
      desligar()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', aba)
    }
  }, [pontos])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 w-full"
    />
  )
}
```

## Arquivo 3 — `components/OrbitaDepoimentos.tsx`

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { CupulaHaze } from './CupulaHaze'

export type Depoimento = {
  nome: string        // "Diana"
  papel: string       // "mae da debutante Lana Ribeiro"
  texto: string       // a citacao, sem aspas — as aspas sao tipograficas
  foto?: string       // opcional: cai na inicial se faltar
}

const DUR = 24                    // segundos por volta da orbita
const passoMs = (n: number) => (DUR / n) * 1000
// Por que DUR/N: o filho i cruza o topo em t = D·(1/2 − i/N), entao
// filhos consecutivos passam pelo topo a cada D/N segundos EXATOS.
// "Trocar por tempo" e "trocar por posicao na orbita" sao, portanto,
// a mesma coisa — e por tempo funciona igual quando nao ha orbita
// (celular e reduced-motion), sem escrever um segundo caminho.

export function OrbitaDepoimentos({ itens }: { itens: Depoimento[] }) {
  const n = itens.length

  // ESTADO INICIAL = O QUE SAI NO HTML EXPORTADO.
  // O projeto e output:'export'. O HTML no disco precisa conter os
  // depoimentos legiveis, sem depender de JS. Entao comeca estatico
  // e o JS PROMOVE para animado — nunca o contrario.
  const [animado, setAnimado] = useState(false)  // orbita circular?
  const [rodando, setRodando] = useState(false)  // troca sozinho?
  const [ativo, setAtivo] = useState(0)
  const [pausado, setPausado] = useState(false)

  // decide o arranjo depois da hidratacao
  useEffect(() => {
    const mqReduz = matchMedia('(prefers-reduced-motion: reduce)')
    const mqLargo = matchMedia('(min-width: 640px)')

    function decidir() {
      if (mqReduz.matches) {
        // FALLBACK ESTATICO REAL: os 4 empilhados, nada se move,
        // nada pisca, nada fica invisivel. Nao e "mais lento".
        setAnimado(false)
        setRodando(false)
        return
      }
      // Celular: a orbita nao cabe em 380px (2·raio + bolinha
      // passa de 350px antes do padding, e o miolo nao acomoda o
      // painel). Vira fileira horizontal + painel embaixo.
      setAnimado(mqLargo.matches)
      setRodando(true)
    }
    decidir()
    mqReduz.addEventListener('change', decidir)
    mqLargo.addEventListener('change', decidir)
    return () => {
      mqReduz.removeEventListener('change', decidir)
      mqLargo.removeEventListener('change', decidir)
    }
  }, [])

  // o relogio da troca
  const tRef = useRef<number | null>(null)
  useEffect(() => {
    if (!rodando || pausado) return
    tRef.current = window.setInterval(
      () => setAtivo((i) => (i + 1) % n),
      passoMs(n),
    )
    return () => {
      if (tRef.current) clearInterval(tRef.current)
    }
  }, [rodando, pausado, n])

  function escolher(i: number) {
    setAtivo(i)
    // reinicia o relogio: quem tocou quer ler, nao ser interrompido
    if (tRef.current) clearInterval(tRef.current)
    if (rodando && !pausado) {
      tRef.current = window.setInterval(
        () => setAtivo((x) => (x + 1) % n),
        passoMs(n),
      )
    }
  }

  return (
    <section
      aria-labelledby="tit-depo"
      className="relative overflow-hidden bg-void px-4 py-20 sm:py-28"
      // APG: para no hover e volta ao sair...
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      // ...mas com foco de teclado NAO volta sozinho: a APG diz
      // "It does not restart unless the user explicitly requests it".
      onFocusCapture={() => setPausado(true)}
      data-pausado={pausado ? 'true' : 'false'}
    >
      {/* AMBIENTE — congo/magenta, atras de tudo, nao encosta em rosto */}
      <CupulaHaze />

      <h2
        id="tit-depo"
        className="relative mb-14 text-center font-display text-xl text-branco sm:text-2xl"
      >
        Quem já dançou na nossa pista
      </h2>

      {/* ---------- CAMADA VISUAL ----------
          aria-hidden: e DUPLICATA do conteudo semantico que vem
          logo abaixo. A APG manda aria-live="off" em carrossel que
          gira sozinho; como os 4 textos ja estao no DOM, o certo
          aqui e simplesmente esconder a camada decorativa. */}
      <div
        aria-hidden="true"
        className={
          animado
            ? 'relative mx-auto grid h-[520px] w-full max-w-[560px] place-items-center'
            : 'relative mx-auto mb-10 flex w-full max-w-[560px] items-end justify-center gap-4'
        }
        style={
          animado
            ? ({
                // COMPRIMENTO, nao numero puro: clamp resolve o
                // 380px sem passar por JS. Era o defeito do original.
                '--raio': 'clamp(96px, 30vw, 168px)',
                '--dur': `${DUR}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {/* o filete do arco: uma div com border acompanha --raio
            automaticamente. O <circle r={n}> em SVG do original nao
            acompanhava, e era cortado junto com as bolinhas. */}
        {animado && (
          <div
            className="pointer-events-none absolute rounded-full border border-rule"
            style={{
              width: 'calc(var(--raio) * 2)',
              height: 'calc(var(--raio) * 2)',
            }}
          />
        )}

        {itens.map((d, i) => {
          const ehAtivo = i === ativo
          return (
            <button
              key={d.nome}
              type="button"
              tabIndex={-1}                    /* o botao real esta na lista semantica */
              onClick={() => escolher(i)}
              className={
                (animado ? 'orb absolute left-1/2 top-1/2 ' : 'relative ') +
                'grid size-14 place-items-center rounded-full border-2 ' +
                'transition-[opacity,border-color] duration-500 sm:size-16 ' +
                // COR: aro AMBAR — a bolinha e um rosto, e ambar e a
                // cor que pode encostar em rosto. Magenta, nunca.
                (ehAtivo
                  ? 'border-ambar opacity-100'
                  : 'border-rule opacity-45')
              }
              style={
                animado
                  ? ({
                      '--a': `${(360 / n) * i}deg`,
                      // a escala do ativo entra como variavel para nao
                      // brigar com o transform da orbita
                      zIndex: ehAtivo ? 2 : 1,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <span
                className={
                  'grid size-full place-items-center overflow-hidden rounded-full bg-off ' +
                  'transition-transform duration-500 ' +
                  (ehAtivo ? 'scale-110' : 'scale-100')
                }
              >
                {d.foto ? (
                  // alt vazio: o nome ja esta no <figcaption> abaixo,
                  // e alt repetido e ruido para leitor de tela.
                  <img
                    src={d.foto}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="font-mono text-sm text-ambar">
                    {d.nome.charAt(0)}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* ---------- CAMADA SEMANTICA ----------
          Os 4 depoimentos SEMPRE no DOM, sempre na arvore de
          acessibilidade. No modo animado eles ficam empilhados na
          MESMA celula de grid: o painel assume a altura do maior e
          nao pula a cada troca. Os inativos usam opacity-0, que
          — ao contrario de display:none, visibility:hidden e hidden —
          MANTEM o elemento legivel para leitor de tela. */}
      <div
        className={
          'relative mx-auto w-full max-w-[34rem] ' +
          (animado ? 'grid' : 'grid gap-10')
        }
      >
        {itens.map((d, i) => {
          const ehAtivo = i === ativo
          const empilhado = animado || rodando
          return (
            <figure
              key={d.nome}
              className={
                (empilhado ? '[grid-area:1/1] ' : '') +
                'text-center transition-opacity duration-500 ' +
                (empilhado && !ehAtivo
                  ? 'pointer-events-none opacity-0'
                  : 'opacity-100')
              }
            >
              <blockquote>
                <p className="font-display text-lg leading-snug text-branco sm:text-xl">
                  {/* aspas tipograficas em ambar: e "dado", nao ambiente */}
                  <span aria-hidden="true" className="text-ambar">“</span>
                  {d.texto}
                  <span aria-hidden="true" className="text-ambar">”</span>
                </p>
              </blockquote>
              <figcaption className="mt-5 font-mono text-2xs uppercase tracking-wider text-branco-2">
                {/* <cite> NAO entra aqui. A spec do WHATWG diz, literal:
                    "A person's name is not the title of a work (...) the
                    element must therefore not be used to mark up people's
                    names." <cite> e para TITULO DE OBRA. */}
                <span className="text-branco">{d.nome}</span>
                {' — '}
                {d.papel}
              </figcaption>
            </figure>
          )
        })}
      </div>

      {/* ---------- CONTROLES ----------
          Um botao real por depoimento (o da camada visual tem
          tabIndex={-1}) + o botao de pausar. */}
      {rodando && (
        <div className="relative mt-10 flex items-center justify-center gap-3">
          {itens.map((d, i) => (
            <button
              key={d.nome}
              type="button"
              onClick={() => escolher(i)}
              aria-current={i === ativo ? 'true' : undefined}
              className={
                'h-1.5 rounded-cut transition-all duration-300 ' +
                (i === ativo ? 'w-7 bg-ambar' : 'w-3 bg-rule hover:bg-branco-2')
              }
            >
              <span className="sr-only">Ver depoimento de {d.nome}</span>
            </button>
          ))}

          {/* WCAG 2.2.2 Pause, Stop, Hide — NIVEL A.
              Dispara pelas duas clausulas: a orbita e "moving" e dura
              mais de 5s, e a troca de depoimento e "auto-updating".
              "Essential" nao salva: o movimento nao e necessario para
              entender um depoimento. Botao AMBAR — e botao. */}
          <button
            type="button"
            onClick={() => setPausado((p) => !p)}
            aria-pressed={pausado}
            className="ml-3 rounded-botao border border-rule px-3 py-1.5 font-mono text-2xs
                       uppercase tracking-wider text-ambar transition-colors
                       hover:border-ambar focus-visible:outline focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-ambar"
          >
            {pausado ? 'Retomar' : 'Pausar'}
          </button>
        </div>
      )}
    </section>
  )
}
```

### Como usar

```tsx
<OrbitaDepoimentos
  itens={[
    { nome: 'Diana', papel: 'mãe da debutante Lana Ribeiro',
      texto: 'Superou tudo o que a gente tinha imaginado.',
      foto: '/clientes/diana.webp' },
    { nome: 'Vitória Francis', papel: 'debutante',
      texto: 'A pista não esvaziou um minuto.' },
    { nome: 'Maria Antônia', papel: 'debutante',
      texto: 'A luz mudou a festa inteira.' },
    { nome: 'Ana Laura', papel: 'debutante',
      texto: 'Foi exatamente o que eu tinha pedido.' },
  ]}
/>
```

Os textos acima são **placeholders**. Os 4 depoimentos reais existem hoje só em vídeo
(`DEPOIMENTOS` em `lib/conteudo.ts`) — é preciso transcrever uma frase de cada. Vale
lembrar a pendência P6 já anotada no arquivo: os 4 são de 15 anos, nenhum de casamento.

### Conferência final

| Exigência | Como é cumprida |
| --- | --- |
| Restrição dura de cor | Cúpula em congo→magenta = ambiente, atrás de tudo. Aro das bolinhas, inicial, aspas e botão = âmbar. **Magenta não encosta em rosto nem em botão** |
| Funciona a 380px | Órbita desligada abaixo de 640px; vira fileira de 4 avatares de 56px (272px de largura) + painel embaixo. E mesmo se ligasse, `--raio: clamp(96px, 30vw, 168px)` é comprimento e cabe |
| 4 textos sempre no DOM | Os 4 `<figure>` são renderizados sempre. Inativos com `opacity-0`, que preserva a árvore de acessibilidade |
| Fallback estático real | Estado inicial `animado=false, rodando=false` → é o que sai no HTML exportado. `prefers-reduced-motion` mantém esse estado. Mais `animation: none !important` no CSS |
| WCAG 2.2.2 (nível A) | Botão Pausar/Retomar com `aria-pressed`, visível sempre que há autoplay |
| APG carousel | Para no hover e volta; para no foco de teclado e **não** volta sozinho; sem `aria-live` (camada visual é `aria-hidden`) |
| Semântica | `<figure>` + `<blockquote>` + `<figcaption>`; **sem `<cite>`** no nome — proibido pela spec |
| Sem shadcn / sem `cn()` | Concatenação de string nas classes; `<img>` puro com `width`/`height`/`loading`/`decoding` |
| Custo no celular | Zero dependência nova. Órbita em CSS no compositor. Canvas 2D com pausa fora do viewport e com a aba sem foco, `dpr` limitado a 2 |

---

## Fontes

- `https://21st.dev/?preview=%2F%40shadcnspace%2Fcomponents%2Forbiting-circles-02` — referência do cliente
- `https://21st.dev/@shadcnspace/orbiting-circles-02` — **HTTP 404**
- `https://shadcnspace.com/components/orbiting-circles` — confirma variante 02 "Pro", paga
- `https://magicui.design/docs/components/orbiting-circles`
- `https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/registry/magicui/orbiting-circles.tsx`
- `https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/registry/example/orbiting-circles-demo.tsx`
- `https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/content/docs/components/orbiting-circles.mdx`
- `https://github.com/shuding/cobe`
- `https://registry.npmjs.org/cobe/latest` e `https://registry.npmjs.org/cobe/-/cobe-2.0.1.tgz` — peso medido
- `https://api.webstatus.dev/v1/features/anchor-positioning` — `baseline: limited`
- `https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/anchor-name.json` (e `position-anchor`, `position-area`, `position-try-fallbacks`, `anchor-scope`)
- `https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/at-rules/property.json`
- `https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/animation-play-state.json`
- `https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning/Using`
- `https://floating-ui.com/docs/autoUpdate`
- `https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html`
- `https://www.w3.org/WAI/ARIA/apg/patterns/carousel/`
- `https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-cite-element`
- Referências de design: ver seção 2.6
