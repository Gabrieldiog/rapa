# 16 — CARDS: ANATOMIA, COMPOSIÇÃO E O QUE FUNCIONA NO CELULAR

> Pesquisa · agosto de 2026 · Rapa Sound
> **Escopo:** por que um card fica *bonito*. Anatomia interna, superfície em tema
> escuro, raio, grid assimétrico para 13 itens, card sem foto, e como o card
> ganha vida no celular — onde **hover não existe**.
> **Fora de escopo:** efeito de cursor/mouse (coberto em `04-cards.md`,
> `08-motion-cards.md`, `09-cards-producao.md`). Aqui a premissa é o contrário:
> **a maioria do tráfego nunca vai passar um mouse por cima de nada.**
> **Nada foi alterado no projeto.** Este arquivo é só pesquisa.
> Toda URL foi verificada com requisição HTTP no dia da redação. Onde não
> consegui confirmar um dado, está escrito `NÃO CONFIRMADO`.
> Quatro domínios responderam à leitura de conteúdo mas recusaram a checagem
> automática de status depois (`adrianroselli.com`, `freedesignmd.com`,
> `digitalheroesco.com`, `ishadeed.com` — este último só responde em
> `www.ishadeed.com`). O conteúdo citado deles foi lido; se algum link falhar,
> é filtro de rede, não link morto.

---

## RESUMO EXECUTIVO

A composição que recomendo para os 13 serviços, em 12 linhas:

1. **Pare de dividir 13 em "3 cards + 10 linhas".** É essa divisão que o cliente
   está vendo como feiura — ela cria uma casta de serviços de segunda, e é
   literalmente por isso que "o som ficou sem nada de card".
2. **Todos os 13 viram card.** O que varia não é *existir card*, é **peso**:
   três níveis (herói / médio / compacto), nunca dois.
3. **13 não fecha em grid — mas 1+2+5+3+2 fecha.** Use os cinco blocos que já
   existem em `lib/conteudo.ts` (som, luz, LED, cenografia, pacotes). A
   assimetria deixa de ser sobra e vira informação.
4. **O bloco de som tem 1 item — então ele é o card mais largo da página**, não o
   mais pobre. Um bloco de um item só é a definição de herói.
5. **Só 4 dos 13 levam foto.** Os outros 9 usam padrões de card-sem-foto
   (ficha técnica em mono, dado grande, padrão gerado, tipografia como imagem).
6. **A mídia sangra até a borda do card** e compartilha o raio externo. Isso
   elimina de vez o problema de raio interno e é o que separa card desenhado de
   `<div>` com `<img>` dentro.
7. **Superfície clareia para elevar** (nunca escurece), com aro de dois tons —
   topo claro, base escura. O repo já faz isso certo; a proposta preserva.
8. **No celular:** `:active` com `scale(0.97)` + camada branca 12% em 160 ms, e
   revelação por scroll uma vez só. Sem carrossel, sem sticky stack, sem hover.
9. **O CTA em texto ("Falar no WhatsApp →") é sempre visível.** Sem hover, ele é
   o significante de "isto é clicável" — a seta sozinha não basta.
10. **Raio em escala (2/6/14/22), nunca igual em tudo** — raio uniforme em tudo é
    um dos sinais mais reconhecíveis de página gerada. O repo já acertou.
11. **Magenta só como luz ambiente atrás/embaixo do card, a ≤12%.** Âmbar em
    código, seta, dado e qualquer card com rosto. Regra dura, sem exceção.
12. **Resultado:** 13 cards, 5 blocos, 3 pesos, 4 fotos, **2 heróis**.
    Nenhum órfão, nenhum card vazio, nenhuma linha de segunda classe.

---

## 0. DIAGNÓSTICO — POR QUE OS CARDS DE HOJE ESTÃO "HORRÍVEIS"

Medido no repo, não suposto. Arquivos: `components/CardServico.tsx`,
`app/globals.css` (bloco `.card`, linhas ~278–335), `lib/conteudo.ts`.

**O que está tecnicamente bom e deve ser preservado:**

- O aro de dois tons já está implementado do jeito certo — dois backgrounds na
  mesma declaração, superfície em `padding-box` e aro em `border-box`, mais
  `inset` box-shadow de 1px claro no topo e escuro na base (`globals.css` ~278).
  Isso é exatamente a técnica descrita na seção 2. Zero DOM extra, zero JS.
- A escala de raio já é **não-uniforme** (`--radius-cut: 2px`,
  `--radius-botao: 6px`, `--radius-card: 14px`, `--radius-placa: 22px`), e o
  próprio comentário no CSS diz que raio igual em tudo é sinal de página gerada.
  Está certo (seção 3 e seção 7).
- `prefers-reduced-motion` tem fallback estático real, não "mais lento".

**As cinco causas reais da feiura, em ordem de impacto:**

1. **A divisão de castas.** `DESTAQUE_LED = ['painel-de-led', 'pista-de-led',
   'tunel-de-led']` — três serviços viram `CardServico` e dez viram
   `LinhaServico`. O critério é interno da empresa ("os três que vendem"), mas
   o visitante não sabe disso: ele lê "três serviços importantes e dez
   sobras". **A reclamação "o som ficou sem nada de card" é a leitura correta
   do layout.** Sonorização é a `bloco: 'som'`, é o serviço-base da empresa, e
   está renderizado como linha de índice.
2. **A foto flutua no meio do card.** No `CardServico` a `<img>` tem
   `mb-6 aspect-16/10 w-full rounded-[calc(var(--radius-card)-0.75rem)]` dentro
   de um card com `padding: 1.75rem 1.5rem 1.5rem 2.25rem`. Ou seja: a foto tem
   moldura de 24px à direita, 36px à esquerda e 28px em cima. Foto com moldura
   grossa e assimétrica é o visual de apresentação de slides, não de card caro.
3. **O raio interno está calculado com o número errado.** O comentário no JSX
   diz "raio interno = externo − distância até a borda", que é a fórmula certa
   (seção 3), mas o código subtrai `0.75rem` (12px) quando a distância real até
   a borda é `1.5rem` (24px) à direita e `2.25rem` (36px) à esquerda. Com
   externo 14px e distância 24px, a fórmula dá negativo — o que significa que
   **nesse layout a foto simplesmente não deveria ter raio nenhum**, ou o
   layout está errado. Está errado: a resposta é a foto sangrar até a borda
   (seção 3).
4. **Não existe estado de pressão.** Não há `:active` em `.card` em lugar
   nenhum do `globals.css`. Toda a vida do card está em `:hover`,
   `:focus-within` e no `.luz` que segue o cursor. Em `(hover: none)` o único
   ajuste é `.linha__seta { opacity: 1 }` — as *linhas* ganham tratamento
   touch, os *cards* não. Para a maioria do tráfego, o card é uma caixa inerte
   (seção 6).
5. **Densidade errada para o tamanho.** O card tem 5 elementos empilhados
   (código, título 18px, descrição 12px, foto, CTA) num container alto. Título
   `text-lg` e descrição `text-xs` não abrem contraste suficiente de escala
   (seção 1), e sobra ar vertical no meio — que é o que faz o card parecer
   "não terminado".

---

## 1. ANATOMIA — A HIERARQUIA INTERNA DE UM CARD QUE FUNCIONA

### 1.1 A definição, e o limite de quantas coisas cabem

A Nielsen Norman Group define card como
*"a container for a few short, related pieces of information … intended as a
linked, short representation of a conceptual unit"* — um **contêiner para
poucos** pedaços curtos de informação relacionada, que é uma **representação
curta e linkada** de uma unidade conceitual
(https://www.nngroup.com/articles/cards-component/).

Duas consequências que valem como regra:

- **O card é resumo, não é a coisa.** Ele é "a linked entry point to further
  details". Se o card tenta contar o serviço inteiro, ele fica feio por excesso.
- **A NN/g diz explicitamente quando NÃO usar card:** quando o conteúdo é
  homogêneo (aí lista é melhor, porque é mais escaneável) e quando o usuário vai
  comparar opções (cards "carecem de tratamento visual consistente"). Cards
  funcionam melhor para *"collections of heterogeneous items"*
  (https://www.nngroup.com/articles/cards-component/).
  **Isto é importante para o nosso caso:** 13 serviços de naturezas diferentes
  (som, luz, LED, cenografia, pacote) são exatamente uma coleção heterogênea.
  Card é a escolha certa aqui — o erro atual não é usar card, é usar card só em
  três deles.

### 1.2 As cinco partes, e o que cada uma pesa

A anatomia canônica que aparece em toda a literatura de card (cabeçalho / corpo
/ rodapé de ação) — ver o resumo de LogRocket
(https://blog.logrocket.com/ux-design/ui-card-design/) e da Webflow
(https://webflow.com/blog/ui-design-cards) — se desdobra, num card de serviço,
em cinco slots:

| Slot | O que é | Peso relativo | Regra |
|---|---|---|---|
| **Eyebrow / label** | categoria, código, contexto | o **menor** de todos | mono, caixa alta, tracking aberto, cor de acento **ou** secundária |
| **Título** | o nome do serviço | o **maior** de todos | o único elemento com peso tipográfico alto |
| **Corpo** | uma frase, não duas | 40–55% do tamanho do título | cor secundária, `text-wrap: pretty` |
| **Ação** | "Falar no WhatsApp →" | tamanho de eyebrow | **cor de acento**, sempre visível |
| **Mídia** | foto, padrão, dado, ícone | ocupa área, não escala de tipo | sangra até a borda |

A convenção tipográfica do eyebrow é bem estabelecida: caixa alta, corpo pequeno
(~11–12px), peso alto e **tracking aumentado** — o tracking é o que salva o
texto em caixa alta em corpo pequeno
(https://techstacker.com/typography-uppercase-letterspacing-tracking/,
https://pimpmytype.com/spacing-all-caps/, e a especificação de eyebrow do design
system Verdigris: https://design.verdigris.co/categories/typography/eyebrow).
No repo isso já existe como `.lab` (`font-mono`, `--text-2xs`,
`letter-spacing: 0.15em`, `text-transform: uppercase`) — está correto.

### 1.3 Por que "menos elementos, mais contraste entre eles" ganha

Este é o núcleo da resposta ao "está horrível". O argumento tem três fontes:

**(a) Hierarquia se faz com três alavancas, não uma.** Refactoring UI:
*"Instead of solely using font size to structure the page, also use colors and
font weights"* — tamanho, peso e cor
(https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886).
Um card com cinco elementos e cinco tamanhos diferentes parece bagunça; um card
com cinco elementos e **três níveis** (primário branco/pesado, secundário
cinza/leve, utilitário mono/acento) parece desenhado.

**(b) Emphasize by de-emphasizing.** Ainda de Refactoring UI:
*"instead of trying to further emphasize the element you want to draw attention
to, figure out how you can de-emphasize the elements that are competing with
it."* Ou seja — o título do serviço não fica forte porque você aumentou o
título; fica forte porque a descrição virou 12px cinza e o código virou 10px
mono. É contraste, não tamanho absoluto
(https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886).

**(c) Todo peso igual = zero hierarquia.** Refactoring UI, no capítulo aberto
*"Labels are a last resort"*: o formato `rótulo: valor` *"makes it difficult to
present the data with any sort of hierarchy; every piece of data is given equal
emphasis"* (https://refactoringui.com/previews/labels-are-a-last-resort). Um
card em que código, título, descrição e CTA têm pesos parecidos é a mesma
patologia: nada é primeiro, então nada é bonito.

**A regra operacional, para este projeto:**

> Um card de serviço tem **no máximo 4 elementos de texto** e **exatamente 3
> níveis de ênfase**. Se um quinto elemento entrar, algo sai.
> A razão entre título e corpo é de **pelo menos 1.5×** — abaixo disso os dois
> lêem como o mesmo bloco. Escalas modulares padrão (1.25 major third, 1.333
> perfect fourth) existem justamente para garantir que passos vizinhos sejam
> *inconfundivelmente* diferentes
> (https://medium.com/eightshapes-llc/typography-in-design-systems-6ed771432f1e).

Hoje o card usa `text-lg` (18px) no título e `text-xs` (12px) no corpo — razão
1.5×, no limite inferior. Com Zodiak no título (serif de alto contraste) dá para
subir para 22–24px sem inchar o card, porque a serif ocupa menos altura-x
aparente que a grotesca. **Isso sozinho já muda a percepção de "card caro".**

### 1.4 O que cortar

- **Corte o segundo parágrafo.** Uma frase. As descrições em `conteudo.ts` já
  são de uma frase — mantenha assim e não adicione "saiba mais sobre…".
- **Corte a duplicação de rótulo.** Não escreva "Serviço: Painel de LED". O
  código de rider (`LED-P`) já é o rótulo, e ele é do tipo que Refactoring UI
  autoriza: um dado cujo formato é auto-explicativo dentro do contexto
  (https://refactoringui.com/previews/labels-are-a-last-resort).
- **Corte a borda dentro da borda.** Refactoring UI, tip #4: *"Use fewer
  borders"* — para separar dois elementos, prefira sombra, mudança de fundo ou
  simplesmente mais espaço
  (https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886).
  Card com aro + foto com aro + chip com aro é o visual "gerado".
- **Corte ícones pequenos ampliados.** Refactoring UI, tip #5:
  *"Icons that were drawn at 16–24px are never going to look very professional
  when you blow them up."* Se você quer um ícone grande num card sem foto,
  ou desenha em tamanho grande, ou coloca o ícone pequeno **dentro de uma forma
  com fundo** (mesma fonte).

---

## 2. SUPERFÍCIE EM TEMA ESCURO

### 2.1 Elevar é clarear, não sombrear — e a fonte

O Material diz o motivo com todas as letras, na documentação oficial do
Material Components for Android:

> *"shadows are less effective in an app using a dark theme, because they will
> have less contrast with the dark background colors"* e
> *"Material surfaces become lighter and more colorful at higher elevations,
> when they are closer to the implied light source"*
> (https://raw.githubusercontent.com/material-components/material-components-android/master/docs/theming/Dark.md)

E o codelab oficial do Google:

> *"In dark themes built with Material, elevated surfaces and components are
> colored using overlays. The more elevated the surface is, the stronger and
> brighter the overlay becomes. This is a way of communicating elevation and
> hierarchy when the background is too dark to reliably portray dark shadows."*
> (https://codelabs.developers.google.com/codelabs/design-material-darktheme)

**Nota de método:** `m3.material.io` e `m2.material.io` são SPAs — não retornam
conteúdo para leitura automatizada. Os valores abaixo foram confirmados no
**código-fonte oficial do Google**, que é fonte mais forte que a página.

A curva de overlay não é uma tabela arbitrária, é uma fórmula. Do
`ElevationOverlayProvider.java` do Material:

```java
private static final float FORMULA_MULTIPLIER = 4.5f;
private static final float FORMULA_OFFSET = 2f;
// alphaFraction = (4.5 * ln(elevationDp + 1) + 2) / 100
// com guard: elevation <= 0 -> return 0
```
(https://raw.githubusercontent.com/material-components/material-components-android/master/lib/java/com/google/android/material/elevation/ElevationOverlayProvider.java —
a mesma fórmula está no Flutter:
https://raw.githubusercontent.com/flutter/flutter/3.13.0/packages/flutter/lib/src/material/elevation_overlay.dart)

Aplicando sobre `#121212`:

| dp | overlay branco | resultado |
|---|---|---|
| 0 | 0% | `#121212` |
| 1 | 5% | `#1E1E1E` |
| 2 | 7% | `#232323` |
| 3 | 8% | `#252525` |
| 4 | 9% | `#272727` |
| 6 | 11% | `#2C2C2C` |
| 8 | 12% | `#2E2E2E` |
| 12 | 14% | `#333333` |
| 16 | 15% | `#363636` |
| 24 | 16% | `#383838` |

No M3 o overlay branco virou **surface tint** (derivado da cor primária), mas os
pares dp→opacidade continuam os mesmos, agora em 6 níveis:
0dp/0%, 1dp/5%, 3dp/8%, 6dp/11%, 8dp/12%, 12dp/14%
(https://raw.githubusercontent.com/flutter/flutter/3.13.0/packages/flutter/lib/src/material/elevation_overlay.dart).

**Convergência independente:** a escada de superfícies da Linear em produção
(`#08090a` → `#1c1c1f` → `#232326` → `#28282c`) cai praticamente em cima da
curva logarítmica do Material — `#1c1c1f` fica entre 2 e 3dp, `#232326` ≈ 6dp,
`#28282c` ≈ 8dp
(https://static.linear.app/web/_next/static/css/index.ONusDM1Q.css).

**Para este projeto:** `#09090B` (fundo) → `#191A1F` (card em repouso) é
aproximadamente 3–4dp de overlay. Está certo. O card em estado ativo deve
**clarear** para algo em torno de `#202127`, não escurecer nem só ganhar sombra.

### 2.2 Preto puro como fundo de card é erro — halação

O Google descreve o fenômeno (sem nomear) no codelab oficial: texto `#FFFFFF`
puro *"would visually 'vibrate' against our dark backgrounds"* e
*"pure #FFFFFF text against a dark background can harm legibility since the
light from that text appears to bleed or blur against the dark background"*
(https://codelabs.developers.google.com/codelabs/design-material-darktheme).
O mesmo codelab estabelece `#121212` como a camada mais baixa da interface —
**não** `#000`.

O nome do fenômeno e o dado de acessibilidade:

> *"White text on black backgrounds creates a visual fuzzing effect for people
> with astigmatism called 'halation'."* … *"Whenever possible, avoid using white
> text on pure black backgrounds."*
> (https://www.levelaccess.com/blog/accessibility-for-people-with-astigmatism/)

O ponto mais importante dessa fonte, e que vale gravar:
**verificador automático de contraste aprova `#FFF` sobre `#000` com 21:1 — a
razão máxima possível — e ainda assim a combinação prejudica usuários reais.**
Contraste máximo não é legibilidade máxima. A WCAG normatiza razão de contraste
e **não** protege contra halação.

`NÃO CONFIRMADO`: não existe frase literal do Material dizendo "não use #000",
nem o argumento de "fadiga visual" atribuído ao Material. O que existe na fonte
é o baseline `#121212` e o argumento das sombras. O mecanismo óptico do
astigmatismo e o estudo Piepenbrock et al. (2013) aparecem em fontes
secundárias (https://www.boia.org/blog/dark-mode-can-improve-text-readability-but-not-for-everyone)
e não foram verificados no paper.

**Para este projeto:** a paleta já está certa — fundo `#09090B` (não é preto),
texto `#ECEDEF` (não é branco). Não mexa. A tentação de "escurecer o card para
destacar" é o erro clássico: card mais escuro que o fundo, em tema escuro, lê
como buraco, não como elevação.

### 2.3 Borda de duas tonalidades — onde a técnica realmente está documentada

**Correção de atribuição, importante:** a técnica **não** está em
`rauno.me/craft/interaction-design` (que trata de gestos e física de animação),
nem em `rauno.me/craft/depth` (que trata de composição fotográfica), nem em
`interfaces.rauno.me` (que só cita box-shadow para focus ring), nem em nenhum
dos 9 posts de `emilkowal.ski/ui/*`, nem nos 22 posts de `paco.me/writing`.
Isso foi verificado índice por índice.

O **princípio** está em Refactoring UI, na dica de sombras:

> *"add a vertical offset"* — *"looks a lot more natural because it simulates a
> light source shining down from above like we're used to seeing in the real
> world."*
> (https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886)

A borda de dois tons é o corolário: se a luz vem de cima, a aresta **superior**
capta luz (mais clara) e a **inferior** fica em sombra própria (mais escura).

A **implementação** está no CSS de produção, que é evidência melhor que um blog
post. Linear, botão:

```css
/* static.linear.app/web/_next/static/css/Button.dcAi4KbO.css */
box-shadow:
  inset 0 0 0 1px #ffffff08,   /* anel interno branco ~3% (todo o perímetro) */
  inset 0 1px    #ffffff0a,    /* reforço branco ~4% SÓ no topo              */
  0 0 0 1px #0009,             /* anel externo preto 60%                     */
  0 4px 4px #0000001a;         /* sombra difusa preta 10%                    */
```

Raycast, a versão canônica de duas tonalidades:

```css
box-shadow:
  inset 0 -1px .4px 0 rgba(0,0,0,.2),   /* base ESCURA */
  inset 0  1px .4px 0 #fff,             /* topo CLARO  */
  0 0 0 2px rgba(0,0,0,.5),
  0 0 14px 0 rgba(255,255,255,.19);
```

Raycast, variante de **card** (não botão) — mais próxima do nosso caso:

```css
box-shadow:
  0 4px 40px 8px rgba(0,0,0,.4),          /* ambiente ampla        */
  0 0 0 .5px rgba(0,0,0,.8),              /* hairline de separação */
  inset 0 .5px 0 0 rgba(255,255,255,.3);  /* filete de luz no topo */
```

Vercel, produção:

```css
box-shadow:
  inset 0 1px #ffffff40,      /* filete branco 25% só no topo */
  0 1px 1px #00000005,
  0 4px 8px -4px #00000008,
  0 16px 24px -8px #00000008;
```

**Detalhe que vale roubar: `.5px` em vez de `1px`.** Em tela 2x isso rende
exatamente um pixel físico — um filete verdadeiramente fino, que é uma das
diferenças perceptíveis entre "caro" e "template". Raycast usa até
`inset 0 .33px 0 0 rgba(255,255,255,.57)`.

**O repo já faz isso.** O `.card` em `globals.css` usa
`inset 0 1px 0 0 branco 7%` + `inset 0 -1px 0 0 void 55%`, mais o aro em
gradiente `175deg` que vai de claro no topo a escuro na base. É a mesma família
de técnica. A única melhoria a considerar é trocar `1px` por `.5px` no filete
superior.

### 2.4 `inset` box-shadow em vez de `border` — as cinco vantagens

Refactoring UI: *"When you need to create separation between two elements, try
to resist immediately reaching for a border"* e *"Box shadows do a great job of
outlining an element like a border would, but can be more subtle"*
(https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886).

1. **Não entra no box model.** `box-shadow` não afeta layout — a spec é
   explícita (https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow).
   Adicionar/remover no estado ativo não desloca 1px nem causa reflow. Dispensa
   o hack de `border: 1px solid transparent`.
2. **Várias camadas numa propriedade só.** Anel + topo + base + ambiente numa
   declaração (ver Linear acima). Com `border` você tem uma camada.
3. **Meia-borda é trivial.** `inset 0 1px 0 0 …` desenha só o topo;
   `inset 2px 0 0 0 var(--cor)` desenha só a esquerda — é assim que a Vercel faz
   as barras coloridas de status (`inset 2px 0 0 0 var(--ds-amber-900)`).
   **Para nós isso é ouro:** o "tubo" à esquerda do card pode virar
   `inset 3px 0 0 0 var(--tubo-cor)` em vez de nove `<span>` no DOM, quando o
   chase não estiver acontecendo.
4. **Sub-pixel.** `.5px` e `.33px` funcionam.
5. **Respeita `border-radius`** — ao contrário de `outline` no Safari antigo,
   ponto levantado nas diretrizes do Rauno (https://interfaces.rauno.me/).

Anti-padrão: `inset 0 0 0 1px` é desenhado **por cima** do padding. Se o
conteúdo encostar na borda, ele é sobreposto. Com padding adequado, irrelevante.

### 2.5 Sombra colorida vs. neutra — e o dado da Linear

Josh Comeau demonstra que preto semitransparente **dessatura** além de escurecer,
e a saída é casar hue/saturation do fundo e só baixar a lightness
(https://www.joshwcomeau.com/css/designing-shadows/). Esse artigo trata de tema
claro — não extrapole direto.

Em tema escuro, o dado empírico mais útil é a Linear, que publica os mesmos
tokens nos dois temas:

| token | light | dark |
|---|---|---|
| `--shadow-low` | `0 1px 4px -1px #00000017` (~9%) | `0 2px 4px #0000001a` (~10%) |
| `--shadow-medium` | `0 3px 12px #00000017` (~9%) | `0 4px 24px #0003` (**20%**) |
| `--shadow-high` | `0 7px 24px #0000000f` (**~6%**) | `0 7px 32px #00000059` (**~35%**) |

(https://static.linear.app/web/_next/static/css/index.ONusDM1Q.css)

Ou seja: no nível alto a Linear **multiplica a opacidade por ~6× no escuro**
(6% → 35%) e aumenta o blur. A sombra preta não é abandonada em dark — é
radicalmente intensificada. **E isso só funciona porque o fundo não é `#000`.**
Sobre preto puro a sombra seria literalmente invisível — mais um argumento
contra preto puro (§2.2).

As três substituições reais em tema escuro, todas verificadas em produção:

- **(a) contraste de superfície** — a escada da Linear acima, também disponível
  em alpha para empilhar sobre qualquer fundo: `#ffffff08` / `#ffffff12` /
  `#ffffff26`;
- **(b) borda/anel** — `--color-border-primary: #ffffff14` (~8%),
  `secondary: #ffffff1f` (~12%), `tertiary: #ffffff26` (~15%);
- **(c) glow — sombra *clara*, não escura.** Raycast:
  `0 0 40px 20px rgba(255,255,255,.03)`, e a versão tingida com o matiz da
  marca: `0 0 10px 5px rgba(255,67,7,.1), 0 0 3px 2px rgba(255,67,7,.1)`.

**A regra para este projeto:** sombra **tingida** existe, mas como *glow* de
spread positivo em cor de marca com opacidade ≤ 12% — nunca como sombra
projetada colorida. E, pela restrição dura de cor, o glow de card com rosto é
**âmbar**; o glow magenta só em card de pista/ambiente. O `.card:hover` atual já
faz `0 18px 40px -24px var(--tubo-cor) 55%` — está na família certa, mas 55% é
alto para um glow; a referência de produção fica em 10–20%.

### 2.6 Gradiente sutil e grão anti-banding

Raycast, produção — a versão radial é mais sofisticada que a linear porque
simula luz *pontual* acima em vez de plano infinito:

```css
background:
  linear-gradient(180deg, rgba(7,8,10,.8) .1%, #07080a 32.45%) padding-box,
  radial-gradient(49.41% 64.58% at 49.4% 0,
    rgba(255,255,255,.03) 0, rgba(255,255,255,0) 100%) padding-box;
```

Amplitudes reais são baixíssimas: **3% a 10% de branco**. Acima de ~12% deixa de
ler como iluminação e passa a ler como "gradiente" — que é sinal de template
(§7).

O grão. Raycast, decodificado do CSS minificado de produção:

```css
.card::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-color: rgba(255 255 255 / 8%);
  background-image: url("data:image/svg+xml,<svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='3' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  background-size: 256px 256px;
  background-blend-mode: overlay;
  opacity: .07;
}
```

`baseFrequency='3'` = grão bem fino; `stitchTiles='stitch'` = sem costura
visível ao tilar (https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence).
**O `#` do `url(#n)` precisa virar `%23` quando o SVG é inline no CSS** — é o
erro mais comum dessa técnica.

Linear tem dois detalhes de produção que valem muito:

```css
/* static.linear.app/web/_next/static/css/Grain.D_EBlr94.css */
.grain { position:absolute; inset:0; pointer-events:none;
         border-radius: inherit;      /* o grão respeita o raio do card */
         opacity:.9; mix-blend-mode: overlay; background-size:256px 256px; }
.grain::after { content:""; position:absolute; inset:0; background:#ffffff0f; }
@supports ((-webkit-hyphens: none)) {  /* feature-detection de Safari */
  .grain::after { background: 0 0; }   /* Safari renderiza overlay diferente */
}
```

O `@supports (-webkit-hyphens: none)` é detecção de Safari: a Linear **desliga**
a camada branca lá porque `mix-blend-mode: overlay` renderiza diferente. Bug
real de produção que vale conhecer antes de descobrir sozinho.

A técnica canônica documentada está em https://css-tricks.com/grainy-gradients/.
`NÃO CONFIRMADO` em fonte normativa: a afirmação "grão elimina banding". O
mecanismo é sólido (dithering rompe fronteiras de quantização de 8 bits, muito
visíveis justamente em gradientes escuros de baixa amplitude — o nosso caso),
mas é prática consolidada, não fato documentado. Aviso de performance: a versão
com `filter: contrast()/brightness()` do CSS-Tricks é cara se animada; a versão
data-URI estática da Raycast/Linear é barata.

## 3. RAIO DE CANTO

### 3.1 A regra do raio interno — a cadeia de fontes, e a mais forte de todas

Não existe um único post canônico. Existe uma linhagem rastreável:

| Fonte | Data | O que diz |
|---|---|---|
| Chris Coyier, CSS-Tricks (https://css-tricks.com/public-service-announcement-careful-with-your-nested-border-radii/) | dez/2011 | Registro mais antigo. Nos comentários aparece `externo − padding = interno`. Coyier ressalva: *"I find eyeballing it works pretty well"* |
| Paul Hebert, Cloud Four (https://cloudfour.com/thinks/the-math-behind-nesting-rounded-corners/) | out/2022 | Deriva a geometria: **`outerRadius - gap = innerRadius`**, com `calc()` |
| Andy Bell, Piccalilli (https://piccalil.li/blog/relative-rounded-corners/) | mar/2023 | Formula como **P + R = RO**, e entrega o utilitário CSS pronto |
| **Apple, WWDC25 sessão 356** (https://developer.apple.com/videos/play/wwdc2025/356/) | jun/2025 | **A fonte mais forte.** *"By aligning radii and margins around a shared center, shapes can comfortably nest within each other."* A "concentric shape" da Apple **calcula seu raio subtraindo o padding do raio do pai** |

A fórmula, e o raciocínio do Cloud Four: `border-radius` desenha o raio de
pequenos círculos nos cantos. Para aninhar um círculo dentro de outro, o interno
precisa de raio menor, e **a diferença entre os dois raios é exatamente a
distância entre eles**. Quando os dois usam o mesmo valor,
*"the space between elements increase awkwardly in the corners"*
(https://cloudfour.com/thinks/the-math-behind-nesting-rounded-corners/).

```
raio_interno = raio_externo − distância_até_a_borda
raio_externo = raio_interno + distância_até_a_borda
```

CSS de Andy Bell, que é a forma limpa de expressar isso
(https://piccalil.li/blog/relative-rounded-corners/):

```css
.card {
  --pad: 8px;
  --raio-interno: 12px;
  padding: var(--pad);
  border-radius: calc(var(--raio-interno) + var(--pad));
}
.card__midia { border-radius: var(--raio-interno); }
```

Repare na inversão: você define o raio **da mídia** e o card se ajusta. É mais
robusto que definir o card e torcer para a conta fechar — que é exatamente o
erro que este repo cometeu (§0.3).

**O truque alternativo** (Adam Argyle, via Coyier
https://master.dev/blog/the-classic-border-radius-advice-plus-an-unusual-trick/):
deixe o clip fazer a conta.

```css
.card { overflow: clip; overflow-clip-margin: content-box; }
```

Equivalente nativo em iOS 26: `ConcentricRectangle` e `.containerConcentric` no
SwiftUI calculam o raio interno sozinhos
(https://developer.apple.com/documentation/swiftui/edge/corner/style/concentric).

### 3.2 O que dá errado

O sintoma tem nome, na formulação de Coyier: raios iguais criam
*"kind of a too-thick 'hump' around the edges"* — uma **corcunda no canto**
(https://css-tricks.com/public-service-announcement-careful-with-your-nested-border-radii/).

A geometria: os dois círculos de canto têm centros **deslocados** pela distância
do padding. A "casca" entre pai e filho fica fina nas laterais retas e grossa na
diagonal do canto. O olho lê isso como **erro de fabricação**, não como decisão
— e é uma das razões mais comuns pelas quais um card "parece amador" sem que
ninguém saiba dizer por quê. A Apple chama o problema pelo nome oposto: falta de
**concentricidade** (https://developer.apple.com/videos/play/wwdc2025/356/).

**Aplicado a este projeto (§0.3):** externo 14px, distância real até a borda 24px
(direita) / 36px (esquerda) / 28px (topo). A conta dá negativo em todas as
direções. Existem três saídas, em ordem de qualidade:

1. **A mídia sangra até a borda** e recebe o raio externo nos dois cantos de
   cima. Distância = 0 → raio interno = raio externo. É a solução que resolve o
   problema em vez de administrá-lo, e é o que faz o card parecer projetado.
   ```css
   .card { padding: 0; overflow: clip; }
   .card__midia { border-radius: var(--radius-card) var(--radius-card) 0 0;
                  aspect-ratio: 16/10; object-fit: cover; }
   .card__texto { padding: 1.25rem 1.25rem 1.5rem; }
   ```
2. **Padding pequeno e raio grande**: padding 8px, card 22px, mídia 14px. Card
   com moldura fina e concêntrica — visual de moldura de painel.
3. **Raio 0 na mídia.** Honesto, e nunca fica errado. Aceitável só se o resto do
   sistema também tiver cantos fechados.

### 3.3 Que faixa de raio lê como "profissional" vs "brinquedo"

Aqui está o dado mais interessante da pesquisa, porque **contraria a intuição
comum**. Valores medidos direto nos bundles CSS de produção, agosto/2026:

| Produto | Escala declarada | Literais mais usados |
|---|---|---|
| **Linear** | `--radius-4/6/8/12/16/24/32`, `--app-radius: 12px` | **4px (27×), 6px (21×), 8px (16×), 12px (14×)** — 16px+ quase não aparece |
| **Vercel** | `--geist-radius: 6px`, `--geist-marketing-radius: 8px` | **6px (27×), 12px (17×), 8px (8×)**. Doc: 6px base/tooltip, 12px medium/modal, 16px fullscreen (https://vercel.com/geist/materials) |
| **Stripe** | `--cardBorderRadius: 4px`, `--accentedCardBorderRadius: 8px` | **8px, 4px, 2px** |
| **Raycast** | `--radius-md: 6px` | **6px (15×), 8px (14×), 4px (10×), 12px (9×)** |

**Conclusão empírica: o cluster "caro" em produto de ferramenta é 4–12px, com 6
e 8 dominando. Nenhum dos quatro usa 16px como raio padrão de card.** O
`rounded-2xl` (16px) do Tailwind — que é o default do shadcn e portanto o
default de tudo que é gerado — está **acima** de tudo que Linear, Vercel, Stripe
e Raycast usam no dia a dia.

Escalas publicadas, para calibrar:

- **Material 3**: None 0 · ExtraSmall **4dp** · Small **8dp** · Medium **12dp** ·
  Large **16dp** · ExtraLarge **28dp** · Full 50%; extensões LargeIncreased 20dp,
  ExtraLargeIncreased 32dp, ExtraExtraLarge 48dp
  (https://github.com/material-components/material-components-android/blob/master/docs/theming/Shape.md
  — a página `m3.material.io/styles/shape/corner-radius-scale` é SPA e não
  renderiza; o repo oficial do Google é a fonte confirmável).
- **Tailwind v4**: `xs` 2 · `sm` 4 · `md` 6 · `lg` 8 · `xl` 12 · `2xl` 16 ·
  `3xl` 24 · `4xl` 32 (https://tailwindcss.com/docs/border-radius).
- **Apple**: ícone iOS é squircle com raio ≈ **22,37% da largura** e corner
  smoothing ≈ 60% (https://squircle.js.org/blog/squircles-in-apple-design). O
  contorno real da Apple **não é superelipse pura** — são Béziers ajustadas
  (https://www.figma.com/blog/desperately-seeking-squircles/).

Leitura qualitativa das faixas — **é opinião consolidada de designer, não
pesquisa empírica; nenhuma das fontes abaixo tem estudo controlado**:

- **0–4px** = técnico, editorial, denso, "ferramenta"
  (https://medium.com/design-bootcamp/building-a-consistent-corner-radius-system-in-ui-1f86eed56dd3)
- **6–12px** = o equilíbrio profissional, onde os quatro produtos medidos vivem
- **16px** = hoje é o valor mais *neutro-genérico possível*, justamente por ser o
  default do shadcn
- **24–32px+** = consumer, friendly, jovem
  (https://www.supercharge.design/articles/master-corners-in-ui-design)

`NÃO CONFIRMADO`: a alegação de que "cantos agudos disparam resposta de medo no
cérebro" circula em blogs (https://www.zazzy.studio/jots/rounded-corners-vs-sharp-edges)
**sem citação de estudo primário**. Trate como folclore.

**A regra que importa mais que a faixa:** o raio escala com o tamanho do
elemento. Botão de 32px de altura com raio 16px vira pílula; card de 400px com
raio 4px parece plano. **O sinal de "feito por IA" não é escolher 16px — é usar
o mesmo 16px em tudo** (§7.1).

**Para este projeto:** a escala 2/6/14/22 do repo está dentro do cluster
profissional e é não-uniforme. Está certa. A única observação é que 14px para
card é ligeiramente acima do que os quatro produtos medidos usam — 12px seria
ainda mais "Linear/Vercel". Diferença marginal; não vale mexer.

### 3.4 Squircle em CSS — o status REAL, verificado

**Sim, existe. E está em produção — só no Chromium.**

Dado bruto do `browser-compat-data` da MDN
(`raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/corner-shape.json`):

```json
"chrome": { "version_added": "139" },
"chrome_android": "mirror", "edge": "mirror", "opera": "mirror",
"firefox": { "version_added": false },
"safari":  { "version_added": false }, "safari_ios": "mirror",
"status": { "experimental": true, "standard_track": true }
```

Da API do Chrome Platform Status (`chromestatus.com/api/v0/features/5357329815699456`):
`"chrome": { "desktop": 139, "android": 139, "webview": 139, "ios": null,
"flag": false, "origintrial": false }`.

Traduzindo:

- **Chrome / Edge / Opera 139+: sem flag, sem origin trial, ligado por padrão.**
  Chrome 139 saiu em 5/ago/2025 (https://developer.chrome.com/release-notes/139).
- **Firefox: não suporta.** Posição oficial = *"No signal"*
  (https://github.com/mozilla/standards-positions/issues/823).
- **Safari: não suporta** — mas a posição oficial do WebKit é **`position:
  support`** (https://github.com/WebKit/standards-positions/issues/229). As
  release notes do Safari 26.6 (jul/2026) **não mencionam** `corner-shape`
  (https://webkit.org/blog/18178/webkit-features-for-safari-26-6/). WebKit quer,
  mas ainda não entregou.
- MDN marca **"Limited availability — not Baseline"**
  (https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape).
  caniuse concorda (https://caniuse.com/mdn-css_properties_corner-shape).

**Isto é decisivo para este projeto: tráfego majoritariamente celular no Brasil
significa uma fatia grande de iPhone, e no iPhone todo navegador é WebKit. O
squircle nativo simplesmente não vai aparecer para boa parte do público.**

Sintaxe real — `corner-shape` **não faz nada sozinho**, ele molda a área já
definida por `border-radius`:

```css
.card { border-radius: 24px; corner-shape: squircle; }

corner-shape: bevel;                              /* 4 cantos */
corner-shape: notch superellipse(0.6);            /* TL+BR / TR+BL */
corner-shape: superellipse(-1.2) square squircle; /* TL / TR+BL / BR */
```

Mapeamento (https://css-tricks.com/almanac/functions/s/superellipse/, corroborado
por https://www.smashingmagazine.com/2026/03/beyond-border-radius-css-corner-shape-property-ui/):
`round` = `superellipse(1)` (default) · **`squircle` = `superellipse(2)`** ·
`bevel` = `superellipse(0)` · `scoop` = `superellipse(-1)` ·
`square` = `superellipse(∞)` · `notch` = `superellipse(-∞)`.

Fallback correto — degradação silenciosa, sem hack:

```css
.card { border-radius: 24px; }        /* todos: canto redondo normal */
@supports (corner-shape: bevel) {
  .card { corner-shape: squircle; }   /* Chromium 139+ */
}
```

Como a propriedade é ignorada por quem não a conhece, o `@supports` só é
necessário se você precisar **compensar** (o squircle parece um pouco menor, e
você pode querer subir o raio no fallback).

Alternativas cross-browser, todas verificadas:

| Lib | URL | Como |
|---|---|---|
| `figma-squircle` | https://github.com/tienphaw/figma-squircle | Base de tudo. `getSvgPath({width,height,cornerRadius,cornerSmoothing})` → path SVG |
| `@squircle-js/react` | https://github.com/bring-shrubbery/squircle-js | Wrapper; aplica SVG `clip-path`. 2.1kB gz, MIT |
| `corner-smoothing` | https://github.com/sanalabs/corner-smoothing | `clip-path`, hover/click seguem a curva |
| `CornerKit` | https://bejarcode.github.io/cornerKit/ | Cascata: CSS nativo → Houdini Paint → SVG clipPath → `border-radius` |

**Cuidado grave com `clip-path`: ele corta `box-shadow` e `outline`.** Num card
cuja identidade inteira é aro de dois tons + glow (§2), usar squircle via
`clip-path` **destrói o efeito** ou exige um wrapper extra. Essa é a razão
prática pela qual o `corner-shape` nativo é superior: ele molda a borda de
verdade, não recorta a caixa.

Por que squircle importa, na origem (Daniel Furse, Figma, abr/2018,
https://www.figma.com/blog/desperately-seeking-squircles/): o retângulo
arredondado tem **curvatura descontínua** — no ponto em que a reta encontra o
arco há um salto que o olho lê como "recortado cirurgicamente". O squircle tem
curvatura contínua. Furse chegou a ξ ≈ 0,6 como melhor aproximação do iOS 7 —
que é o "60% corner smoothing" do Figma.

**Recomendação para este projeto: NÃO use squircle.** Motivos, em ordem: (1) não
existe no iPhone, que é onde está o tráfego; (2) as alternativas por `clip-path`
matam o aro de dois tons e o glow, que são a assinatura visual do card; (3) a
linguagem do projeto é equipamento de palco — rack, case, painel —, e rack tem
canto usinado, não canto de app de banco. O raio 14px reto está certo aqui.

`NÃO CONFIRMADO`: `rauno.me/craft/radii` **não existe** (o índice de
`rauno.me/craft` não tem esse item). `tonsky.me` **não tem** post sobre corner
radius — o post de centralização (https://tonsky.me/blog/centering/) trata de
métricas de fonte, não de cantos. Josh Comeau tem a lição "Nested Radiuses", mas
está dentro do curso pago *CSS for JavaScript Developers*
(https://courses.joshwcomeau.com/css-for-js/09-little-big-details/02.01-nested-radius)
— não é artigo público.

## 4. GRID ASSIMÉTRICO / BENTO — APRESENTAR 13 SEM PARECER ERRO

### 4.1 O achado que muda a decisão inteira

Duas descobertas viram o problema do avesso.

**Primeira: 13 só é primo no desktop.** No celular todo bento vira 1 coluna, e
**13 é divisível por 1**. Isso está em todas as fontes de bento
(https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide,
https://brainy.ink/paper/bento-grid-design-guide,
https://www.superdesign.dev/styles/bento-grid). Com tráfego majoritariamente
celular, gastar o orçamento de design resolvendo o órfão do desktop é otimizar
para a minoria dos usuários.

O problema real no celular é outro, e as fontes o nomeiam com dureza:

> *"A 4-column bento collapses to 8 to 12 stacked cards, which is just a long,
> hierarchy-free scroll."* (https://www.superdesign.dev/styles/bento-grid)

> *"Simply stacking containers 1 through 10 creates an endless scroll that
> defeats the purpose."* (https://inkbotdesign.com/bento-grid-design/)

**Segunda, e a mais importante: 13 está acima do teto de todas as fontes.**

| Fonte | Células recomendadas por bloco |
|---|---|
| https://digitalheroesco.com/styles/bento-grid/ | 6–9 |
| https://inkbotdesign.com/bento-grid-design/ | 5–9 |
| https://landdding.com/blog/bento-grid-design-by-website-category-where-the-pattern-wins | 4–8 |
| https://www.freecodecamp.org/news/bento-grids-in-web-design/ | ≤ 9 |
| https://senorit.de/en/blog/bento-grid-design-trend-2025 | 6–12 |
| https://www.deck.gallery/blog/apple-bento-grid-breakdown/ | 8–12, "colapsa acima de ~12" |
| https://brainy.ink/paper/bento-grid-design-guide | 6–7 por seção |

**Nenhuma fonte recomenda 13 num bloco só.** A base teórica citada é a Lei de
Miller (~7 chunks). Isso empurra fortemente para **segmentar**, não para achar o
span mágico que faz 13 fechar.

**Consequência direta para este projeto:** os cinco blocos já definidos em
`lib/conteudo.ts` — som (1), luz (2), LED (5), cenografia (3), pacotes (2) —
resolvem os dois problemas de uma vez. Nenhum bloco passa de 5 células, todos
abaixo do teto de qualquer fonte, e **a contagem 13 deixa de existir**: você
nunca tem 13 numa grade, tem 1, depois 2, depois 5, depois 3, depois 2. Cada um
fecha sozinho. O comentário no `conteudo.ts` já intuía isso; a pesquisa
confirma.

### 4.2 Origem, e o que a Apple realmente faz

O nome vem da marmita japonesa compartimentada; a linhagem visual tem duas
raízes que as fontes concordam — o Swiss Style dos anos 50 e o Metro / Live
Tiles da Microsoft (Windows Phone 7 / Windows 8) — com o revival catalisado pela
Apple (https://desinance.com/design/bento-grid-web-design/,
https://www.galaxyux.studio/blog/bento-grids-the-new-standard-for-modular-ui-design/).

A análise mais concreta que existe é a do Deck.gallery, que destrinchou quatro
slides do evento Apple de setembro de 2023
(https://www.deck.gallery/blog/apple-bento-grid-breakdown/):

- **8 a 12 tiles por slide.**
- **"Tile size encodes priority"** — no slide do 15 Pro, a câmera ocupa o maior
  espaço, depois titânio, depois o A17 Pro; USB-C e ProMotion ficam pequenos e
  nas bordas.
- **Canvas preto `#080808`** — *"cria separação entre tratamentos de tile
  diversos sem forçar uniformidade"*. **Isto é o achado mais relevante para
  nós:** o tema escuro não é estética, é o mecanismo que permite blocos
  heterogêneos conviverem. Traduzindo — **é o fundo escuro que permite o herói
  ter foto e os outros terem só texto sem que os outros pareçam inacabados.**
  Em fundo claro, a célula sem imagem lê como buraco.
- **"Numbers are the loudest type"** (48MP, 2000 nits, 5x) — legibilidade em
  tamanho de miniatura. Reforça o padrão 5.2.

### 4.3 O que torna um bento legível em vez de aleatório

**(a) Sem variação de tamanho não é bento.**
> *"If all tiles are the same size, you have a card layout with rounded corners,
> not a bento grid."* (https://digitalheroesco.com/styles/bento-grid/)

O https://www.superdesign.dev/styles/bento-grid chama isso de **"false bento"**:
*"Equal cells = not a bento — uniform grids lack visual hierarchy and waste the
complexity cost of spans and dense flow."*

**(b) Um herói, no máximo dois.** Proporções da Apple: herói 40–50% da área,
secundária 20–25% (https://digitalheroesco.com/styles/bento-grid/). Distribuição
de peso do https://inkbotdesign.com/bento-grid-design/: **herói 50%, células de
prova 20%, célula de ação (CTA) 15%, micro-dados 15%**. E o
https://brainy.ink/paper/bento-grid-design-guide: **âncora ≈ 2× a maior célula
de apoio**. O erro oposto tem nome: *"when everything is big, nothing is
important"*.

**Note a implicação:** a hierarquia canônica já é de **três níveis** — herói /
secundária / resto — não de dois. Isso confirma a recomendação do resumo
executivo.

**(c) Espaçamento proporcional.** A única regra proporcional que achei
(https://brainy.ink/paper/bento-grid-design-guide): **gutter ≈ 50% do padding
interno** (padding 32 → gutter 16); margem externa ≥ 1,5× o gutter; 20–30% de
whitespace interno por célula. Números absolutos para calibrar: gutter 12–16px,
padding interno 24–32px (https://digitalheroesco.com/styles/bento-grid/); gutter
16–24px desktop e 12px mobile
(https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide).
**Gutter uniforme é inegociável** — é o que faz o layout parecer intencional em
vez de acidental.

**(d) Padding escala com o bloco.** 1×1 → 16–20px; 2×2 → 24–32px
(https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide).
Motivo: se o herói tiver o mesmo padding das pequenas, ele parece vazio e as
pequenas parecem apertadas — que é exatamente a percepção de "sobra".

**(e) Uma ideia por célula.** Teste do https://brainy.ink/paper/bento-grid-design-guide:
*"se o conteúdo pudesse ser retirado e jogado em um parágrafo qualquer sem
perder sentido, a célula está fazendo seu trabalho"*. Anatomia interna sugerida:
visual 60–70% da altura, headline 20–30%, apoio 10–20%; **headline de 1–6
palavras, corpo de 1–2 linhas**
(https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide).

> **Desconfie destas estatísticas.** Vários blogs trazem números sem estudo
> linkado: "2,6× mais fixação em itens maiores", "+31% de tempo na página",
> "+14% de AOV", "67% dos top 100 SaaS do ProductHunt", "usuários avaliam
> interfaces 18% melhor com raio consistente". **Nenhuma tem fonte primária.**
> Não use em apresentação para o cliente.

### 4.4 Exemplos reais — separados por nível de confiança

**Verificado lendo a página (estrutura confirmada):**

- **Linear — https://linear.app/features** — grid assimétrico com **8 cards de
  feature** (Planning, Building, Artificial Intelligence, Insights, Mobile,
  Customer Requests, Linear Asks, Security); cada card carrega **exatamente três
  elementos**: ícone, título, uma linha de descrição. Sem exceção.
  *O que roubar:* a disciplina de densidade. É ela que faz o tema escuro
  funcionar — e 8 é o número em que os fabricantes de bento convergem.
- **Stripe — https://stripe.com/** — mistura deliberada de sistemas: bento
  assimétrico na seção de soluções, **grid uniforme** nos depoimentos de
  enterprise, carrossel para startups.
  *O que roubar:* **a Stripe não usa bento para tudo.** Bento onde os itens são
  heterogêneos, grid uniforme onde são comparáveis. Para 13 serviços de
  naturezas diferentes, bento é a escolha certa — e é por isso que o índice de
  linhas atual está errado: ele trata heterogêneo como homogêneo.
- **Framer — https://www.framer.com/** — assimetria clara com blocos de
  capacidade em tratamentos visuais diferentes, e um bloco de métricas de
  plataforma em formatos mistos em vez de cards uniformes.
  *O que roubar:* número grande como tipo dominante em célula pequena.

**Verificado que a URL está viva, mas NÃO encontrei bento no conteúdo lido** —
isto contraria vários blogs que os citam como exemplos:

- **https://vercel.com/** — pilha vertical: hero, três blocos de caso de uso com
  imagem grande + headline + lista, três cards "Recently shipped".
- **https://www.raycast.com/** — fluxo vertical linear, seções full-width, tema
  claro, quatro traços em apresentação textual sem cards.
- **https://www.apple.com/apple-intelligence/** — pilha de ~6 seções narrativas;
  o único grid é de 4 tiles de proporção **uniforme** no fim.
- **https://rive.app/**, **https://clerk.com/**, **https://supabase.com/** —
  pilha vertical / listas, sem grade de cards evidente.

**Leitura disso, e é importante:** o bento de features está em **refluxo** nos
sites que os artigos citam como referência. Vercel, Raycast e Apple Intelligence
hoje contam história em **pilha vertical**, não em grade. Se a referência
canônica abandonou a grade para 8 itens, forçar uma grade para 13 é remar contra
a corrente.

**Terceiros afirmam (não verificado visualmente)**, do teardown nomeado em
https://brainy.ink/paper/bento-grid-design-guide: Apple usa âncora 3–4× as
células de apoio; Linear usa âncora à esquerda com 2× a maior célula de apoio e
duas colunas de três células menores à direita, gutters apertados e padding
interno largo — com a observação de que *"um sistema tipográfico mais fraco
faria o padrão colapsar"*; Vercel usa âncora a 1,5× com 4–6 células de apoio;
Arc *"quebra as regras de propósito"*.

Galerias para curar: https://bentogrids.com/ (SPA, precisa abrir no navegador;
tem filtro light/dark), https://onepagelove.com/tag/bento (23 exemplos),
https://www.a1.gallery/websites/bento-landing, https://land-book.com/design/landing-page,
https://godly.website/, https://www.awwwards.com/websites/bento-grid/.

### 4.5 Os padrões de contagem, com CSS

**Padrão A — herói 2×2 em grade de 4 (encaixe exato para 13).** Coincidência
aritmética a favor: **13 itens caem exatamente numa grade 4×4 quando o primeiro
é 2×2** (4 + 12 = 16 células, zero buraco).

```css
.bento {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: minmax(180px, auto);
  gap: 14px;
}
.bento > :first-child { grid-column: span 2; grid-row: span 2; }
```

*Ponto fraco honesto:* as 12 células 1×1 ficam todas iguais — o "false bento" do
§4.3(a).

**Padrão B — 12 + 1 em largura total (o mais à prova de balas).** Derivado de
https://css-irl.info/controlling-leftover-grid-items/, que é a melhor referência
técnica sobre órfãos em grid:

```css
/* mata o órfão em QUALQUER contagem, 4 colunas */
.bento > :last-child:nth-child(4n + 1) { grid-column: span 4; } /* sozinho */
.bento > :last-child:nth-child(4n + 2) { grid-column: span 3; } /* 2 na linha */
.bento > :last-child:nth-child(4n + 3) { grid-column: span 2; } /* 3 na linha */
```

Com 13: 13 = 4·3 + 1 → `span 4`. Zero buraco, e continua funcionando quando o
cliente adicionar o 14º serviço. O código literal do artigo, para 3 colunas:

```css
li:last-child:nth-child(3n - 2) { grid-column: span 3; }
li:last-child:nth-child(3n - 1) { grid-column: span 2; }
```

**Ressalva do próprio artigo: não funciona com `auto-fill` / `auto-fit`**,
porque não dá para prever a posição na linha. Use contagem de colunas fixa por
breakpoint.

**Padrão C — o órfão vira CTA.** Não é remendo: o
https://inkbotdesign.com/bento-grid-design/ já modela uma **"Action Cell" com
15% do peso visual** como parte da anatomia canônica do bento. O olho lê "a
grade termina aqui e me pede algo" em vez de "faltou um card". E a faixa baixa
horizontal **quebra o ritmo vertical de graça** no celular.

**Padrão D — 2 colunas com span-2 no meio.** `.bento > :nth-child(7) {
grid-column: 1 / -1 }` → 6 + 1 + 6, simétrico em torno do sétimo. Com 13 itens é
uma coincidência bonita. Ótimo para tablet.

**Padrão E — destaques + índice.** É o padrão atual do repo, e é o único
endossado por pesquisa real, não por blog: a NN/g, em
https://www.nngroup.com/articles/mobile-carousels/, diz que *"designers should
use list views for high-item-count scenarios to enable direct access instead of
sequential browsing"*. **Mas** — e é isto que o cliente está sentindo — a NN/g
recomenda lista para conteúdo **homogêneo e de contagem alta**, e o mesmo artigo
de card da NN/g diz que cards servem a **coleções heterogêneas** (§1.1). 13
serviços de naturezas diferentes são heterogêneos. **A lista está resolvendo o
problema errado.**

**Padrão F — masonry.** Status real, confirmado na MDN
(https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Masonry_layout):
a spec fechou em **`display: grid-lanes`**, não no `grid-template-rows: masonry`
dos tutoriais antigos. CSS Grid Level 3, **"Limited availability — not
Baseline"**, experimental. Safari 26 foi o primeiro a enviar; Chrome e Firefox
atrás de flag (https://caniuse.com/mdn-css_properties_grid-template-rows_masonry).
**Não use ainda** — e note que em 1 coluna masonry não faz nada, então ele não
resolve nenhum problema de celular.

**Padrão G — carrossel.** A NN/g é dura
(https://www.nngroup.com/articles/mobile-carousels/):

- *"Users should be able to reach the last item in the carousel in 3–4 steps."*
- *"Most people stop after viewing 3–4 different pages in the carousel."*
- Sinalizador mais forte de que há mais conteúdo: **item meio-visível na borda**.
  Setas vêm depois. **Dots são os mais fracos** e passam batido.

**13 itens em carrossel = 13 swipes = mais de 3× o limite pesquisado. Não use
como estrutura principal.** Use para **subgrupo de 3–5** — que é exatamente o
tamanho dos nossos blocos.

```css
.trilha {
  display: flex; gap: 12px; overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 16px; padding-inline: 16px;
  scrollbar-width: none;
}
.trilha::-webkit-scrollbar { display: none; }
.trilha > * {
  flex: 0 0 78%;              /* < 100% ⇒ o próximo card "espia" */
  scroll-snap-align: start;
  scroll-snap-stop: always;   /* não pula itens num swipe rápido */
}
@media (min-width: 700px) { .trilha > * { flex-basis: 36%; } }
```

`flex-basis: 78%` implementa literalmente o sinalizador mais forte da NN/g.
`flex-shrink: 0` é obrigatório para o snap calcular certo
(https://www.builder.io/blog/css-carousel).

**Padrão H — centralizar o órfão.** Existe (https://ryanmulligan.dev/blog/grid-stacks/,
https://www.billerickson.net/css-grid-center-last-item/), mas o próprio Bill
Erickson avisa que **só funciona se a última linha estiver curta por um**. Com
13 em 4 colunas você fica curto por três. Não serve.

### 4.6 Como um item vira herói sem os outros parecerem sobra

**Escala é o sinal primário, não posição** — *"size é o sinal primário de
hierarquia, não o posicionamento"*
(https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide).
Isso significa que você **não precisa** de cor, borda ou peso extra no herói. O
tamanho já fez o trabalho. **Adicionar mais é justamente o que faz os outros
parecerem sobra.**

Quatro movimentos, derivados das fontes acima:

1. **Herói ganha mídia; os outros ganham número.** Não deixe as pequenas com
   "menos coisa" — dê a cada uma **um objeto dominante próprio** (§5). A célula
   pequena passa a ter seu próprio ponto de fixação em vez de ser uma versão
   encolhida do herói.
2. **Herói ganha altura, não largura.** `grid-row: span 2` com a mesma largura
   mantém a linha-mestra vertical intacta — nenhuma célula fica empurrada. Menos
   disruptivo que `span 2 / span 2`.
3. **Três níveis de peso, não dois.** Com dois níveis, tudo que não é herói vira
   "não-herói". Com três, cada nível tem identidade.
4. **Borda mais clara no herói é seguro; cor só no herói é arriscado.** No
   escuro, aro a `rgba(255,255,255,.14)` contra `.08` lê como elevação. Cor de
   marca em um card só lê como "esse é patrocinado".

### 4.7 Acessibilidade — a armadilha que ninguém menciona

**Não use `grid-auto-flow: dense`.** A MDN
(https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_layout_and_accessibility)
reproduz a própria spec: *"Grid layout gives authors great powers of
rearrangement over the document. However, these are not a substitute for correct
ordering of the document source."* `dense` tira itens da ordem do DOM; tab order
e leitor de tela seguem o DOM. O https://www.superdesign.dev/styles/bento-grid
coloca isso como limite nº 1 do bento e classifica como **violação de WCAG 2.4.3
(Focus Order)**. Rachel Andrew escreveu sobre isso em
https://rachelandrew.co.uk/archives/2019/06/04/grid-content-re-ordering-and-accessibility/.

A solução emergente (`reading-order: auto` + `reading-order-items`) está em
https://developer.chrome.com/blog/reading-order — **proposta em discussão no
CSSWG, sem suporte**. O próprio artigo avisa: *"Source order still matters."*

**Boa notícia:** os padrões A, B, C e D **não precisam de `dense`**. Ordem no
HTML = ordem de importância = ordem no celular. Resolve sozinho.

Mais dois pontos: texto sobre mídia exige checagem individual de **4.5:1**, e
*"glass-blur cells over photos"* reprovam com frequência — use scrim
(`linear-gradient(to top, rgba(0,0,0,.78), transparent 55%)`), não só
`backdrop-filter` (https://www.superdesign.dev/styles/bento-grid). E declare
`aspect-ratio` em toda mídia, para não gerar CLS
(https://inkbotdesign.com/bento-grid-design/).

### 4.8 No celular: as quatro alavancas contra a pilha monótona

**(a) Reordenar por importância, não por posição no desktop** — *"the 2×2 hero
card should be first, even if it was bottom-right on desktop"*
(https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide).

**(b) Variar altura.** *"Tile height becomes content-driven; do not force equal
heights on mobile"* (https://digitalheroesco.com/styles/bento-grid/). Instrução
concreta de CSS: **remova `grid-auto-rows` fixo no breakpoint móvel**. O
https://iamsteve.me/blog/bento-layout-css-grid faz exatamente isso — só aplica
`grid-auto-rows: 1fr` a partir de 1280px.

**(c) Reajustar padding e gutter, não só encolher**
(https://brainy.ink/paper/bento-grid-design-guide).

**(d) Testar a 360px de largura, no mínimo**
(https://digitalheroesco.com/styles/bento-grid/).

E o item que resolve tudo: **agrupar por categoria com cabeçalho sticky.** Com
13 itens, agrupar é o que transforma "13 caixas" em "5 grupos de 1 a 5".

```css
.bloco > h2 {
  position: sticky; top: 0; z-index: 2;
  margin: 0; padding: 12px 16px;
  background: color-mix(in oklab, var(--color-void) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-rule);
  font-family: var(--font-mono);
  font-size: .8125rem; letter-spacing: .1em; text-transform: uppercase;
}

@media (max-width: 640px) {
  .bento { grid-template-columns: 1fr; grid-auto-rows: auto; gap: 12px; }
  .bento > * { grid-column: auto; grid-row: auto; }
  .bento > .n1 { min-height: 58svh; }   /* herói continua herói: altura */
  .bento > .n2 { min-height: 34svh; }
}
```

Use `svh` (small viewport height) e não `vh` — evita o salto de layout quando a
barra do navegador móvel esconde/aparece.

## 5. CARD SEM FOTO — O QUE OCUPA O ESPAÇO PARA NÃO FICAR POBRE

Esta é a seção que responde direto à reclamação **"o serviço de som ficou sem
nada de card"**. O problema não é falta de foto. O problema é que, sem foto,
ninguém decidiu o que ocupa a área — e área não decidida lê como área vazia.

**A regra que governa a seção inteira:** num card sem imagem, alguma coisa tem
que assumir o papel visual que a imagem teria. Não é "tirar a foto e encolher o
card". É **trocar a foto por outro objeto visual de peso equivalente**. Se você
só remove, sobra buraco; foi exatamente isso que aconteceu.

Seis padrões, cada um com exemplo real e CSS.

### 5.1 Ficha técnica em mono — o padrão onde o rótulo VIRA o conteúdo

Refactoring UI diz que rótulos são último recurso — **com uma exceção
explícita**, e é justamente a nossa: em páginas de especificação, o usuário
procura o rótulo, então o rótulo passa a ser primário.
*"If a user is trying to find out what modem is in a laptop, they're probably
scanning the page for the words 'Modem', 'WiFi' or 'Wireless.'"*
(https://refactoringui.com/previews/labels-are-a-last-resort).

Locação de som e luz é **exatamente** um domínio de especificação. Quem pede
orçamento de PA quer saber quantas caixas, quantos subs, qual mesa. Uma ficha em
Chivo Mono ocupa área, dá informação real e parece equipamento — não parece
enfeite.

Referência real do padrão: a página de especificações técnicas da Apple, onde a
página inteira é `rótulo → valor` em colunas, e ela **não** parece pobre
(https://www.apple.com/macbook-pro/specs/).

```jsx
<dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[--color-rule] pt-4">
  {[['Caixas', '12 vias'], ['Subgraves', '4'],
    ['Mesa', 'digital 32ch'], ['Equipe', '2 técnicos']].map(([k, v]) => (
    <div key={k} className="flex items-baseline justify-between gap-3">
      <dt className="lab">{k}</dt>
      <dd className="font-mono text-xs text-branco">{v}</dd>
    </div>
  ))}
</dl>
```

> **Atenção de conteúdo:** os números acima são ilustrativos. Nenhum número de
> equipamento consta em `lib/conteudo.ts` nem no `INVENTARIO.md`. Isto entra em
> `PENDENCIAS.md` como pergunta ao cliente — e é uma pergunta que **vale muito**,
> porque quatro pares rótulo/valor por serviço resolvem o vazio de nove cards.

### 5.2 Dado grande — um número domina o card

O número é a imagem. O padrão canônico é o card de preço: a taxa é a coisa maior
do card por uma margem larga, e o texto de apoio é *notavelmente menor*, e não há
imagem nenhuma dentro do card — verificado na página de preços da Stripe
(https://stripe.com/pricing). Basecamp faz o mesmo com métricas de escala
("84 million people", "60 million projects") em blocos sem foto
(https://basecamp.com).

Para nós: `120 dB`, `9 m de LED`, `+400 festas`, `2 técnicos`. O número em Zodiak
grande, a unidade em mono pequeno, colados na linha de base.

```jsx
<p className="flex items-baseline gap-1.5">
  <span className="font-display text-[3.5rem] leading-[0.85] tracking-tight text-ambar">9</span>
  <span className="lab pb-1">m de painel</span>
</p>
```

Regra: **um único número por card.** Dois números competem e o card volta a não
ter primeiro lugar (§1.3).

### 5.3 Tipografia como imagem — o código de rider em escala de pôster

O código já existe (`PA`, `LX`, `LED-P`, `LED-TN`, `FX`, `3D`, `SET`, `REC`,
`15A`, `CAS`) e é curto o bastante para virar objeto gráfico. Colocado grande,
em mono, com opacidade baixa e sangrando pela borda inferior direita, ele vira
marca d'água — ocupa área, reforça a linguagem de rider e **não some no
celular**, porque é vetorial e não pesa nada.

Referência do princípio (bloco conduzido por tipografia, sem foto, sem parecer
pobre): Linear Method (https://linear.app/method/introduction) e Basecamp
(https://basecamp.com), ambos verificados como páginas em que o texto é o
visual.

```css
.card__marca {
  position: absolute;
  right: -0.15em; bottom: -0.28em;
  font-family: var(--font-mono);
  font-size: clamp(4rem, 22vw, 9rem);
  line-height: 0.7;
  letter-spacing: -0.04em;
  color: color-mix(in srgb, var(--color-branco) 5%, transparent);
  pointer-events: none;
  user-select: none;
}
```

Cuidado: 5% de branco sobre `#191A1F` é quase nada — é para ser quase nada. Se
ficar legível como texto, virou ruído. Ele tem que ser **textura**.
E `aria-hidden`, sempre: o código já está no eyebrow, repetir é poluir o leitor
de tela.

### 5.4 Padrão gerado — trama técnica em CSS puro

Trama de pontos, hachura diagonal ou grade de projeto. Custa zero KB, escala em
qualquer densidade de tela e dá ao card a mesma "textura de equipamento" que a
foto daria. É a estética de grade técnica que a Vercel usa em páginas de produto
— o caso mais visível é a página de segurança, onde o próprio Rauno Freiberg
documenta a interação "X-Ray" como trabalho de produção
(https://rauno.me/craft → item *X-Ray Interaction*, link de produção
https://vercel.com/security).

```css
/* trama de pontos — o "difusor de LED" */
.card--trama::before {
  content: "";
  position: absolute; inset: 0;
  background-image: radial-gradient(
    color-mix(in srgb, var(--color-branco) 9%, transparent) 1px,
    transparent 1.2px);
  background-size: 10px 10px;
  /* some no rodapé para o texto nunca disputar com a trama */
  mask-image: linear-gradient(200deg, #000 0%, transparent 62%);
  pointer-events: none;
}

/* hachura diagonal — o "risco de caixa de transporte" */
.card--hachura::before {
  content: "";
  position: absolute; inset: 0;
  background: repeating-linear-gradient(
    -45deg,
    color-mix(in srgb, var(--color-branco) 5%, transparent) 0 1px,
    transparent 1px 9px);
  mask-image: radial-gradient(120% 90% at 100% 0%, #000 0%, transparent 70%);
}
```

Duas tramas diferentes na mesma página já bastam para os nove cards não
parecerem clones. Não use três.

### 5.5 Desenho de linha grande — ícone desenhado no tamanho em que é usado

Não amplie ícone de 24px. Refactoring UI é explícito: *"Icons that were drawn at
16–24px are never going to look very professional when you blow them up"*, e a
saída recomendada é encerrar o ícone pequeno numa forma com fundo
(https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886).

O padrão que funciona num card sem foto é o **desenho de linha em tamanho
grande**, com traço de 1–1.5px — silhueta de caixa acústica, treliça de Q30,
tubo, moldura de painel. Referência real do padrão em produção: a grade de
recursos nativos da Raycast, que é uma grade de ladrilhos onde o objeto gráfico
é o conteúdo (https://www.raycast.com/).

Regras: `vector-effect="non-scaling-stroke"`, `stroke-width` 1–1.5, cor
`--color-branco-2`, e **nunca preenchimento**. Ícone preenchido em card escuro
vira mancha.

### 5.6 Luz ambiente + filete — o card que é iluminado, não decorado

Este é o padrão que casa com a restrição dura de cor do projeto: **magenta e
congo são ambiente**. Um lavado radial de magenta muito diluído, nascendo fora
do card e entrando pela quina, dá volume sem tocar em nada. É o mesmo mecanismo
do `.card::after` que já existe no `globals.css` — só que como estado de
repouso, e não só no hover.

```css
.card--ambiente::after {
  content: "";
  position: absolute; inset: 0; z-index: -1;
  border-radius: inherit;
  background: radial-gradient(
    130% 100% at 100% 0%,
    color-mix(in srgb, var(--color-magenta) 12%, transparent) 0%,
    color-mix(in srgb, var(--color-congo)  10%, transparent) 38%,
    transparent 72%);
}
```

Combinado com o aro de dois tons (§2), isso já é suficiente para um card só de
texto parecer objeto físico. **Nenhum card com rosto pode usar este padrão** —
nesses, o lavado é âmbar a 8%.

### 5.7 Tabela de decisão — qual padrão para qual dos 13

| Padrão | Serve para | Não serve para |
|---|---|---|
| 5.1 Ficha técnica | PA, LX, LED-P, LED-F | pacotes (não é spec, é emoção) |
| 5.2 Dado grande | LED-F (m² de pista), LED-TN (m de túnel) | serviços sem número real |
| 5.3 Tipografia-marca | qualquer card compacto | herói com foto (compete) |
| 5.4 Trama gerada | LED-T, FX, 3D | card que já tem ficha (excesso) |
| 5.5 Desenho de linha | LX, PA, 3D | 15A, CAS (frio demais) |
| 5.6 Luz ambiente | LX-P, LED-*, SET | qualquer card com rosto → âmbar |

**Nunca dois padrões visuais no mesmo card.** Foto **ou** ficha **ou** trama
**ou** desenho. O lavado ambiente (5.6) é o único que pode se somar a outro,
porque é fundo e não objeto.

---

## 6. NO CELULAR, SEM HOVER — COMO O CARD COMUNICA QUE É CLICÁVEL

### 6.1 O ponto de partida: o hover não existe, e a MDN define isso

A MDN, sobre `@media (hover)` com valor `none`: *"The primary input mechanism
cannot hover at all or cannot conveniently hover (e.g., many mobile devices
emulate hovering when the user performs an inconvenient long tap)"*
(https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover).

Consequência dura: **num celular, todo significante de clicabilidade tem que ser
estático e permanente.** Não existe "descobrir passando o mouse".

E a NN/g já mediu o custo de tirar os significantes:

> *"A major issue with many flat designs is that one of the strongest
> clickability signifiers — the 3-D effect — is removed from the equation"* e
> *"stripping away too much undermines this objective by making the interaction
> more complex"* (https://www.nngroup.com/articles/clickable-elements/).

A saída recomendada é **Flat 2.0** — *"subtle shadows, highlights, and layers to
create some depth in the UI"*, que *"provides an opportunity for compromise —
visual simplicity without sacrificing signifiers"*
(https://www.nngroup.com/articles/flat-design/).

**Correção de mito, importante:** o artigo "Long-Term Exposure to Flat Design"
(https://www.nngroup.com/articles/flat-design-long-exposure/) é citado por toda
a internet com percentuais que **ele não contém**. O único número quantitativo
do artigo inteiro é este:

> *"According to the guidelines for website-response time, the perception of
> immediate feedback for a click means within **0.1 seconds**."*

Não há percentual de hesitação nem contagem de fixações. **Mas os 0,1s são o
número que importa: o feedback do toque tem que aparecer em ≤ 100 ms.**

### 6.2 O que dizem as fontes oficiais sobre feedback de toque

**Apple HIG — Buttons** (https://developer.apple.com/design/human-interface-guidelines/buttons),
e esta é a frase canônica do assunto:

> *"As a general rule, a button needs a hit region of at least **44x44 pt** — in
> visionOS, 60x60 pt — to ensure that people can select it easily… **Always
> include a press state for a custom button. Without a press state, a button can
> feel unresponsive, making people wonder if it's accepting their input.**"*

**Apple HIG — Accessibility** (https://developer.apple.com/design/human-interface-guidelines/accessibility),
tabela oficial: iOS/iPadOS 44×44pt padrão, **28×28pt mínimo**; watchOS 44×44 /
28×28; visionOS 60×60 / 28×28. E o ponto que quase todos ignoram:

> *"**Consider spacing between controls as important as size.** … it works well
> to add about **12 points of padding** around elements that include a bezel.
> For elements without a bezel, about **24 points of padding** works well."*

**Material 3 — state layers.** A página `m3.material.io/foundations/interaction/states/state-layers`
**não abre** (SPA que retorna só "This website requires JavaScript"). Os valores
vieram do arquivo de tokens oficial do Google, gerado a partir do design system
(https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-state.scss):

```scss
'dragged-state-layer-opacity': 0.16,
'focus-state-layer-opacity':   0.12,
'hover-state-layer-opacity':   0.08,
'pressed-state-layer-opacity': 0.12
```

| Estado | State layer |
|---|---|
| enabled | 0% |
| **hovered** | **8%** |
| **focused** | **12%** |
| **pressed** | **12%** |
| dragged | 16% |

Circula muito a versão "pressed = 10%" — é **M2 antigo**. O token vigente do M3
é **0.12**. E `focused` e `pressed` têm o mesmo valor: no M3 eles se diferenciam
pelo focus *ring*, não pela camada.

A state layer é uma camada semitransparente **da cor do conteúdo** sobre o
container. Em tema escuro, sobrepor branco a 12% é o jeito correto de "acender"
o card — e é a mesma lógica de "elevar = clarear" do §2.1.

**Alvo mínimo Material: 48dp.** Como a doc não abre, confirmado em
https://developer.android.com/guide/topics/ui/accessibility/apps (*"at least
48dp x 48dp"*) e https://support.google.com/accessibility/android/answer/7101858
(*"A touch target of 48x48dp results in a physical size of about **9mm**"*).

**NN/g**: *"Interactive elements must be at least **1cm × 1cm** … to support
adequate selection time and prevent fat-finger errors"*
(https://www.nngroup.com/articles/touch-target-size/), com base no estudo de
Parhi, Karlson & Bederson (2006). **As três fontes convergem em ~9–10 mm
físicos.**

**WCAG 2.2 — SC 2.5.8 Target Size (Minimum), nível AA**
(https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html):
*"The size of the target for pointer inputs is at least **24 by 24 CSS
pixels**"*, com exceções para spacing, equivalent, inline, user agent e
essential. **SC 2.5.5 (Enhanced), AAA**: **44×44 CSS px**
(https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).

**Hierarquia prática:** 24px é o piso legal, 44px é o alvo de qualidade, 48px é o
Material. **Num card de serviço você está muito acima de todos — o card inteiro
é o alvo.** E a NN/g é explícita sobre isso
(https://www.nngroup.com/articles/cards-component/): *"Clicking or tapping
**anywhere** on the card link to a details page… This larger touch zone
**substantially improves usability**."*

### 6.3 O bug do `:active` no iOS — o detalhe que quebra 90% das implementações

Documentado pela própria Apple, no Safari Web Content Guide
(https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/AdjustingtheTextSize/AdjustingtheTextSize.html):

> *"On iOS, mouse events are sent so quickly that the down or active state is
> never received. Therefore, **the `:active` pseudo state is triggered only when
> there is a touch event set on the HTML element** — for example, when
> `ontouchstart` is set on the element."*

**Consequência: um `:active { scale(.97) }` em CSS puro simplesmente não dispara
no iPhone sem `ontouchstart=""` no elemento.** É a causa nº 1 de "coloquei o
press state e no iOS não acontece nada".

**Boa notícia para este repo:** o `CardServico` usa `whileTap` do Motion, que
escuta pointer events em JS e **não** depende do `:active` do CSS. O comentário
no código sobre `whileHover` nunca disparar em touch está correto e a escolha de
`whileTap` foi acertada. **Se você adicionar um `:active` em CSS como reforço,
precisa do `ontouchstart` junto.**

```jsx
// A forma que a própria Apple documenta — no elemento, não no document
<motion.a href={zap(...)} className="card" onTouchStart={() => {}}>
```

Prefira isso a um listener global em `document`: o listener global faz o
`:active` disparar em qualquer toque, **inclusive durante o scroll** — e os
cards piscam enquanto a pessoa rola.

### 6.4 Os números do press state

**Emil Kowalski** — "7 Practical Animation Tips"
(https://emilkowal.ski/ui/7-practical-animation-tips): a dica nº 1 é literalmente
"Scale your buttons", com **`scale(0.97)` no `:active`**. E o padrão exato no
repositório de padrões dele
(https://github.com/emilkowalski/skills/blob/main/skills/review-animations/STANDARDS.md):

> *"Button press feedback. `transform: scale(0.97)` on `:active`,
> `transition: transform 160ms ease-out`."*

Faixa: **0.95–0.98**. Tabela de durações dele: **press feedback 100–160 ms**;
tooltip 125–200; dropdown 150–250; modal 200–500. Regra dura: *"UI animations
stay under 300ms"*. E **"never `ease-in` on UI"** — atrasa a resposta percebida.
Easings dele: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. Stagger: **30–80 ms**
entre itens; *"longer delays feel slow"*.

**NN/g** (https://www.nngroup.com/articles/animation-duration/):
*"Simple feedback animations… should be roughly **100 ms**"*; faixa útil
100–400 ms; *"At **500ms**, animations start to feel like a real drag"*; e
*"Most frequently, you'll want to use an **ease-out** animation"*.

**Convergência: 160 ms com `ease-out` é o número.** Abaixo de ~100 ms parece
corte seco; acima de ~250 ms parece borrachudo, porque o dedo já saiu da tela
antes de a animação terminar.

**Por que `scale` e não `background`** — Vercel Web Interface Guidelines
(https://github.com/vercel-labs/web-interface-guidelines): *"MUST: Animate
compositor-friendly props (`transform`, `opacity`) only"*; *"NEVER: Animate
layout props"*; *"NEVER: `transition: all` — list properties explicitly"*.

E Rauno, sobre por que o flash importa
(https://rauno.me/craft/interaction-design): descrevendo o menu de contexto do
macOS, *"the selected item briefly blinks the accent color to **provide
assurance that the element was successfully selected**"*. **É exatamente o
modelo mental do card que abre o WhatsApp:** o press garante que o toque pegou,
antes de o contexto trocar de aplicativo.

### 6.5 O CSS completo, correto

```css
.card {
  position: relative;
  /* NN/g: o par de significantes estáticos — borda + fundo distinto do canvas */
  background: var(--color-off);                    /* canvas é --color-void */
  border: 1px solid transparent;                   /* aro de dois tons, §2.3 */
  border-radius: var(--radius-card);
  min-height: 96px;                                /* >> 44px AAA e 48dp M3 */

  touch-action: manipulation;      /* MDN: remove o delay do double-tap-to-zoom */
  -webkit-tap-highlight-color: transparent;  /* SÓ porque há :active próprio */

  /* nunca transition: all */
  transition: transform 160ms var(--ease-out-cut),
              box-shadow 160ms var(--ease-out-cut);
}

/* state layer — Material 3 */
.card::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: #fff; opacity: 0; pointer-events: none;
  transition: opacity 160ms var(--ease-out-cut);
}

/* PRESSED — o único "hover" que existe no celular */
.card:active { transform: scale(0.97); }
.card:active::before { opacity: 0.12; }            /* M3 pressed = 12% */

/* hover só onde hover existe de verdade */
@media (hover: hover) and (pointer: fine) {
  .card:hover::before { opacity: 0.08; }           /* M3 hover = 8% */
}

.card:focus-within { outline: 2px solid var(--color-ambar); outline-offset: 3px; }

/* reduced motion: reduz, não zera */
@media (prefers-reduced-motion: reduce) {
  .card:active { transform: none; }                /* a camada de 12% permanece */
}
```

**`-webkit-tap-highlight-color`** — a MDN abre com aviso: *"Non-standard: … We do
not recommend using non-standard features in production"*, mas explica para que
serve: *"The highlighting indicates to the user that their tap is being
successfully recognized"*
(https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-tap-highlight-color).

| ✅ Fazer | ❌ Não fazer |
|---|---|
| Zerar **apenas** onde você forneceu `:active` próprio | `html { -webkit-tap-highlight-color: transparent }` global — a propriedade **é herdada** e apaga o feedback de todos os links, inclusive os que você esqueceu de estilizar |
| `touch-action: manipulation` no card | `touch-action: none` em conteúdo — quebra o zoom, viola WCAG 1.4.4 |
| Deixar `pinch-zoom` sempre habilitado | `user-scalable=no` no viewport |

### 6.6 Revelação por scroll — e por que NÃO animar tudo

Opções do `viewport` no Motion (https://motion.dev/docs/react-motion-component):
`once` (**default `false`** — elementos re-animam ao sair e voltar), `amount`
(**default `"some"`**), `margin` (default `"0px"`), `root`. O Motion usa um
**`IntersectionObserver` pooled**, com overhead mínimo
(https://motion.dev/docs/react-scroll-animations).

A NN/g pesquisou isso. **Aviso de honestidade: o artigo
https://www.nngroup.com/articles/scroll-animations/ é qualitativo — não contém
percentuais.** A citação de participante:

> *"I don't like how everything comes together when I'm scrolling down. … I hate
> that it has to load every single section. Sometimes I just want to see
> information there without having to see a cool little movement."*

Recomendações literais: *"use them for **secondary, supporting content** rather
than for the main bodies of text"*; *"**Scroll-triggered effects should only be
activated the first time** the user navigates down the page"*; *"**Task-focused
users don't want to be wowed** by a website"*.

E "Scroll Fading 101" (https://www.nngroup.com/articles/scroll-fading-101/) traz
o que é operacional:

- **Uma vez só:** *"the same users **did not have the patience to find the exact
  scroll position** that caused the desired information to reappear."*
- **Duração:** 100–400 ms; muito lento e *"users scanning quickly often skipped
  it altogether"*.
- **Um tipo de elemento por vez:** *"Either text or images"* — nunca os dois.
- **Ilusão de completude:** *"scroll fading can also contribute to the **illusion
  of completeness**"* — o usuário acha que a página acabou.
- **No celular é pior:** os problemas *"were **exacerbated on mobile** due to the
  smaller screen lengths"*.

```jsx
<motion.a
  href={zap(...)} className="card" onTouchStart={() => {}}
  initial={reduce ? false : { opacity: 0, y: 16 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.25, margin: '0px 0px -10% 0px' }}
  transition={{
    duration: 0.28,
    ease: [0.23, 1, 0.32, 1],
    delay: Math.min(i, 3) * 0.05,   // TETO no 4º card
  }}
  whileTap={reduce ? {} : { scale: 0.97 }}
/>
```

**Os dois erros que quase todo mundo comete:**

1. **`Math.min(i, 3)`.** Sem teto, o 13º card teria `delay: 0.65s` — o stagger
   linear vira espera. **O `CardServico` atual usa `delay: i * 0.08` sem teto**,
   o que dá 0,96 s no décimo terceiro. Corrija.
2. **`once: true` não é o default.** O default do Motion é `false` — os cards
   re-animam toda vez que saem e voltam, que é exatamente o comportamento que a
   NN/g documenta como o que faz o usuário perder a paciência. (O repo já passa
   `once: true`. Está certo.)

`prefers-reduced-motion`: a MDN avisa que *"Animations such as **scaling or
panning large objects** can be vestibular motion triggers"*
(https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
Mas **"reduce" não é "zero"** — a própria MDN mostra trocar `pulse` (scale) por
`dissolve` (opacity). Emil: *"Reduced motion means fewer and gentler animations,
not zero."* Na prática: **corte o `scale` e o `translateY`, mantenha a state
layer de 12%** (é opacidade, não movimento).

### 6.7 Item central em destaque — o status real, e por que não usar

**Status de `animation-timeline`, do `browser-compat-data` da MDN:**

```json
"chrome": { "version_added": "115" },
"safari": { "version_added": "26"  }, "safari_ios": "mirror",
"firefox": { "version_added": "preview" },
"status": { "experimental": false, "standard_track": true }
```

Confirmação independente: Safari 26.0 saiu em **15/set/2025** com scroll-driven
animations (https://webkit.org/blog/17333/webkit-features-in-safari-26-0/), e o
guia da WebKit está em https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/.

**Resposta direta: SIM, funciona no Safari iOS a partir do iOS 26.** Como o iOS
força todos os navegadores a usarem WebKit, vale para Chrome e Firefox no iPhone
também. **Mas Firefox desktop ainda não** — está em `preview`, não em release.
MDN classifica como **"Limited availability — not Baseline"**.

**Desmentidos ativos** (encontrados em blogs de 2026): ❌ "Safari 18+ (set/2024)"
— falso, é Safari 26; ❌ "Firefox 132 com suporte completo" — falso, é `preview`;
❌ "cross-browser baseline" — falso.

```css
@supports (animation-timeline: view()) {
  @media not (prefers-reduced-motion) {
    .card {
      animation: holofote linear both;
      animation-timeline: view(block);
      animation-range: cover 25% cover 75%;
    }
  }
}
@keyframes holofote {
  0%, 100% { opacity: .55; scale: .96; }
  50%      { opacity: 1;   scale: 1;   }
}
```

**Duas armadilhas reais:**

1. **`view()` é reversível por natureza** — é ligado à *posição*, não a um
   evento, então **re-anima toda vez que a pessoa rola de volta**. É exatamente o
   que a NN/g diz para não fazer. `whileInView` com `once: true` é tecnicamente
   superior para reveal-once.
2. **Fallback obrigatório.** Sem `@supports`, no Firefox os cards ficam presos no
   keyframe `0%` — **permanentemente a `opacity: .55`**. Cards apagados.

**E o argumento decisivo, que é conceitual:** destacar o card do centro **confunde
dois significantes diferentes**. O usuário lê "este card está aceso" como "este
está selecionado", quando significa apenas "este está no meio da tela". Como
cabem 2–3 cards por tela, o destaque muda o tempo todo sem intenção do usuário.
O padrão nasceu no TikTok, onde há **um** item por tela e o destaque *é* a
seleção. **Não transfere para uma lista de serviços.**

### 6.8 `scroll-snap` horizontal — e a armadilha que fecha a questão

Suporte é sólido (Chrome 69, Safari 11, Firefox 99). O problema não é técnico.

Ahmad Shadeed (https://ishadeed.com/article/css-scroll-snap/) distingue
`mandatory` ("o browser **deve** snapar") de `proximity` (o browser decide), e a
regra dele: **"Don't use `mandatory` on text-heavy content."**

Adrian Roselli testou a fundo
(https://adrianroselli.com/2021/07/scroll-snap-challenges.html):

| Problema | Detalhe |
|---|---|
| Teclado | usuários não conseguem *"use the arrow keys to scroll for only part of a cell"* |
| Conteúdo inalcançável | usuários *"often wanted to straddle a cell to compare with others"* — *"particularly difficult"* com mandatory |
| Zoom / reflow | quebra sob aumento de texto; cita **WCAG 1.4.4, 1.4.10, 1.4.12** |
| Bugs | Safari: cabeçalhos cortados, snap horizontal não funcional. Chrome: *"scroll-snapping 'stickily' positioned elements can cause inaccurate snap positions"* |

**E o argumento que fecha a questão.** A solução moderna e acessível para
carrossel existe — `scroll-state()` container queries + `interactivity`
(https://developer.chrome.com/blog/accessible-carousel):

```css
.item { container-type: scroll-state; }
.item > * {
  interactivity: inert;
  @container scroll-state(snapped: inline) { > .content { interactivity: auto; } }
}
```

**Mas o suporte, no `browser-compat-data`, é Chrome-only:** `scroll-state()`
Chrome 133 / **Safari `false`** / Firefox `false`; `interactivity` Chrome 135
(experimental) / **Safari `false`** / Firefox `false`.

**Ou seja: a solução acessível para carrossel não existe no iPhone em 2026.** Num
site com tráfego majoritariamente móvel e fatia grande de iOS, usar `scroll-snap`
horizontal é **assumir os problemas de foco e leitor de tela sem a ferramenta que
os resolve.**

### 6.9 Empilhamento com sobreposição — e a aritmética que o descarta

A técnica (https://css-tricks.com/stacked-cards-with-sticky-positioning-and-a-dash-of-sass/,
https://codyhouse.co/tutorials/how-stacking-cards): cada card é
`position: sticky` com `top` incrementalmente maior.

```css
.pilha .card { position: sticky; top: calc(24px + var(--i) * 16px); }
```

**Três problemas para 13 itens:**

1. **Aritmética:** 13 × 16px = **208px de topo consumido** só pela pilha. Numa
   tela de iPhone, ~25% da viewport permanentemente ocupada por cards ilegíveis.
2. **Bug documentado:** sticky + snap se atrapalham (Roselli, acima).
3. **Todo card fica com o topo coberto** pelo próximo — e o topo é onde está o
   título.

**Sticky stacking é efeito de storytelling para 3–5 seções longas, não padrão de
navegação para 13 itens curtos.**

### 6.10 Haptics — não existe

Confirmado no `browser-compat-data` (`api/Navigator.json`, chave `vibrate`):
`"safari": { "version_added": false }`, `"safari_ios": "mirror"`;
`"firefox": [{ "version_added": "16", "version_removed": "129" }]`.
caniuse concorda: **Safari iOS não suporta em nenhuma versão, de 3.2 a 26.5**
(https://caniuse.com/vibration,
https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate).

Pior: o Firefox Android **mente** — `navigator.vibrate()` retorna `true` e nada
vibra, "não reabilitado por preocupações com abuso". Nem feature-detection
resolve.

**Não implemente. Todo o "peso tátil" tem que vir do visual** — o que reforça a
importância do press state.

### 6.11 O padrão fechado, recomendado

> **Grade vertical estática de 13 cards — 1 coluna até 480px, 2 colunas acima —
> agrupada em cinco blocos com cabeçalho. Todos os cards renderizados. Sem
> carrossel. Sem empilhamento sticky. Sem destaque do centro. A vida vem
> inteiramente do press state, não do scroll.**

Rejeitados, com fundamento:

- **Carrossel** — o mecanismo que o torna acessível é Chrome-only (§6.8); o
  usuário está **escolhendo** entre serviços e precisa ver quantos existem; a
  NN/g mede o limite em 3–4 passos e 13 são 13 swipes (§4.5-G).
- **Sticky stacking** — 208px de viewport morta e o título coberto (§6.9).
- **Destaque do centro** — confunde "está no meio da tela" com "está
  selecionado" (§6.7).
- **Reveal agressivo nos 13** — a NN/g diz que é pior no celular e que gera
  ilusão de completude (§6.6).

O orçamento de movimento defensável, item por item:

| O quê | Decisão | Fonte |
|---|---|---|
| Press state | `scale(0.97)` + camada branca 12%, 160 ms `ease-out` | Emil Kowalski; M3 `pressed: 0.12`; Apple ("always include a press state") |
| `ontouchstart=""` | Obrigatório se usar `:active` em CSS | Apple Safari Web Content Guide |
| `touch-action` | `manipulation` | MDN |
| `-webkit-tap-highlight-color` | `transparent` **só nos cards**, nunca global | MDN + Apple |
| Reveal | `whileInView` + `once: true` + `amount: .25`, stagger **com teto no 4º**, 280 ms | Motion; NN/g; Emil |
| Destaque do centro | **Não** | §6.7 |
| Haptics | **Não** — não existe no iOS | MDN BCD; caniuse |
| `prefers-reduced-motion` | corta `scale`/`translate`, **mantém** a camada de 12% | MDN; Emil |
| Hover | só dentro de `@media (hover: hover) and (pointer: fine)`, a 8% | MDN; M3 `hover: 0.08` |

### 6.12 Markup — card inteiro clicável sem quebrar o leitor de tela

Heydon Pickering (https://inclusive-components.design/cards/) **desaconselha
envolver o card inteiro num `<a>`**: todo o conteúdo vira o rótulo do link e o
leitor de tela anuncia um parágrafo inteiro; além disso coloca `<h3>` dentro de
elemento inline. **O `CardServico` atual faz exatamente isso** (`<motion.a>`
envolvendo `<h3>` e `<p>`).

A solução: o `<a>` fica **só no título**, e um `::after` absoluto cobre o card.

```jsx
<li className="card">
  <span className="lab text-ambar">{servico.codigo}</span>
  <h3 className="card__titulo">
    <a href={zap(`Oi! Quero orçamento de ${servico.nome.toLowerCase()}.`)}
       target="_blank" rel="noopener noreferrer" data-zap>
      {servico.nome}
    </a>
  </h3>
  <p className="card__desc">{servico.desc}</p>
  <span className="card__cta lab text-ambar" aria-hidden>Falar no WhatsApp →</span>
</li>
```

```css
.card { position: relative; }
.card__titulo a::after { content: ""; position: absolute; inset: 0;
                          border-radius: inherit; }
.card:focus-within { outline: 2px solid var(--color-ambar); outline-offset: 3px; }
.card__titulo a:focus { outline: none; }
```

**Trade-off que o próprio Heydon admite:** o overlay impede seleção de texto
dentro do card. Para card de serviço isso é aceitável; para card com preço ou
telefone que a pessoa queira copiar, não use.

Duas regras da Vercel que fecham o assunto
(https://github.com/vercel-labs/web-interface-guidelines): *"NEVER: Use
`<div onClick>` for navigation"* e *"**MUST: If it looks clickable, it must be
clickable**"*.

**E o significante que resolve tudo:** um CTA explícito com texto. A NN/g diz que
um ícone *"should be combined with another visual cue, such as a **text
label**, to indicate clickability"*
(https://www.nngroup.com/articles/clickable-elements/). **Não confie no card
"parecer" clicável — diga.** No repo, `.linha__seta` já fica visível em
`@media (hover: none)`; os cards precisam do mesmo tratamento.

Por fim, formato do link (https://faq.whatsapp.com/5913398998672934):
`https://wa.me/<número>?text=<texto>`, número internacional completo,
*"omit any zeroes, brackets or dashes"*. O `zap()` do repo já faz isso certo, e o
texto pré-preenchido por serviço **é o rastreamento de qual dos 13 gerou o
lead**, sem nenhuma ferramenta de analytics.

---

## 7. O QUE FAZ UM CARD PARECER FEITO POR IA — SINAIS E ANTÍDOTOS

**Aviso de qualidade de fonte, e é sério:** boa parte do conteúdo indexado sobre
"AI slop design" é ele próprio conteúdo SEO provavelmente gerado por IA. Não
consegui localizar threads primárias de designers no X nem discussões no Reddit
— as buscas retornam Dribbble e banco de imagens. As afirmações abaixo estão
marcadas por nível de confiança, e as estatísticas do relatório Sailop são as
**menos confiáveis de tudo**.

A causa-raiz, na formulação mais precisa que achei
(https://freedesignmd.com/blog/shadcn-looks-generic):

> *"As pessoas rodam o comando de install, aceitam o tema default, aceitam o
> radius default, aceitam a fonte Inter default, e começam a construir. O kit
> inicial é o mesmo kit inicial que todo mundo recebeu."*

E o agravante, que é diretamente relevante a este projeto: *"quando um agente de
código chega e vê shadcn no codebase, ele puxa os defaults do shadcn em cada
componente novo."*

### 7.1 A tabela

| # | Sinal | Confiança | Antídoto | Estado neste projeto |
|---|---|---|---|---|
| 1 | **Raio uniforme em tudo** (16px em card, botão, input, avatar) | **Alta** — *"uniform 16px border radius everywhere"* (https://www.925studios.co/blog/ai-slop-web-design-guide); *"eight pixel radius on everything"* como impressão digital do shadcn (https://freedesignmd.com/blog/shadcn-looks-generic) | Escala proporcional ao tamanho **+ fórmula do §3.1 em tudo aninhado**. Ou o extremo oposto assumido: 0px ou 999px — qualquer extremo lê como intenção, o meio-termo default lê como ausência de escolha | **OK.** 2/6/14/22 já é escala. Manter |
| 2 | **Gradiente roxo→azul** | **Alta — é o sinal nº 1.** A "VibeCode purple", *"um tom específico de lavanda-roxo que vaza da maioria dos modelos de imagem"* (https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it). Valores nomeados: `blue-600 #2563eb`, `purple-500 #8b5cf6` — defaults do Tailwind | Máximo **três matizes**; expanda por tints/shades, **nunca por matizes novos**. Evite `#fff` e `#000` puros — tinja | **Risco real.** Magenta `#D81E7E` + congo `#21105C` num gradiente vira exatamente a mancha roxo-magenta genérica. **Regra: magenta e congo nunca no mesmo gradiente do mesmo card.** Um por vez, e sempre a ≤ 12% |
| 3 | **Borda 1px cinza puro em todo card** | **Alta.** *"Card com borda de um pixel em slate-200"* (https://freedesignmd.com/blog/shadcn-looks-generic) | Escada de prioridade: (1) whitespace, (2) deslocamento de 3–5% no fundo, (3) elevação. Borda só se as três falharem — e **nunca cinza chapado** | **OK.** O aro é gradiente de dois tons, não cinza chapado |
| 3b | **Tarja colorida de 3–4px na borda esquerda do card** | **Alta** — descrita como *"quase tão confiável quanto travessões em texto"* para identificar design gerado por IA (https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it) | Se precisar de marcador lateral, que ele seja **estrutural** (uma régua de pixels, um filete de 2–3px que faz parte da linguagem) e não uma tarja de status | **Atenção.** O "tubo" à esquerda do card é exatamente uma tarja lateral colorida. O que o salva é ser **matriz de 9 pixels discretos**, não barra contínua — a assinatura do LED. **Não transforme em barra sólida** |
| 4 | **Tudo centralizado + três colunas iguais** | **Alta.** Hero centralizado com badge acima do H1, dois CTAs, `lg:grid-cols-3` com três cards idênticos ícone-em-cima (https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it) | Splits 2/3 + 1/3; hero alinhado à esquerda; **uma seção que sai da grade de propósito**. Teste operacional: **squint test** — reduza a página a miniatura; se todas as caixas têm o mesmo peso, não há hierarquia (https://vibecodekit.dev/ai-slop-design) | **A proposta resolve** — cinco blocos de tamanhos diferentes, nenhum de três colunas iguais |
| 5 | **Sombra padrão do Tailwind** (`shadow-lg`, `rounded-2xl shadow-lg p-6`) | **Alta** (https://vibecodekit.dev/ai-slop-design) | Borda ou deslocamento de fundo no lugar. Se sombra: camadas calibradas à mão (uma curta e opaca de contato + uma longa e difusa de elevação), tingida com o matiz do fundo | **OK.** As sombras são `inset` calibradas |
| 6 | **Tipografia só Inter** | **Alta.** Combos repetidos: Space Grotesk, Instrument Serif, Geist, Poppins, Cal Sans. E o tique da **palavra-acento em serifada itálica** no meio de uma headline Inter (https://www.925studios.co/blog/ai-slop-web-design-guide) | Pareamento display + body real. Escala fixa de ~7 degraus; hierarquia por **peso**, não por família nova | **OK, e é uma força.** Zodiak + Cabinet Grotesk + Chivo Mono é um pareamento de três papéis. **Cuidado com o tique da serifada itálica** — Zodiak em itálico no meio de uma frase de Cabinet é exatamente o sinal |
| 7 | **Espaçamento uniforme sem ritmo** (96–128px idêntico em toda seção) | **Alta** (https://vibecodekit.dev/ai-slop-design) | Grade de 8pt **e** ritmo vertical variável. Proximidade carrega significado: dentro do componente < entre componentes < entre seções. *"Variedade no ritmo vertical é 80% do motivo pelo qual sites custom parecem custom"* (https://superdesign.dev/blog/how-to-make-ai-ui-look-less-generic) | **A verificar.** Cinco blocos de alturas diferentes ajudam |
| 8 | **Ícone emoji** | **Confirmado, mas com correção importante.** O tique mais frequente hoje não é emoji: é o **Lucide gigante centralizado acima do heading**, com elenco recorrente — **Sparkles, Zap, Shield, Check, BarChart3, ArrowRight** (https://www.sailop.com/blog/ai-slop-2026-state-of-the-ai-generated-web) | **Remova a decoração de ícone e deixe a tipografia carregar** — é o antídoto mais citado. Se precisar, conjunto coeso, tamanho pequeno e inline, nunca 48px centralizado | **Atenção.** O padrão 5.5 (desenho de linha grande) é legítimo **porque o desenho é do objeto real** (caixa acústica, treliça, tubo) — não é um Zap genérico. Se virar ícone de biblioteca, vira sinal |
| 9 | **Glassmorphism sem motivo** | **Alta** (https://vibecodekit.dev/ai-slop-design) | *"Aplicação seletiva lê como considerada; aplicação geral lê como imitação de tendência"* — **uma superfície de vidro por tela, no máximo** (https://timgraf.com/ui/the-glass-cube-evolution-mastering-glassmorphism-ux-in-2026/) | **Atenção.** O `backdrop-filter` do cabeçalho sticky (§4.8) é o único permitido |
| 10 | **Copy genérica** | **Alta.** "Transform your X with Y", "Unleash the power of", tricolons ("faster, smarter, simpler"), densidade de travessão 4–6 por 1.000 palavras vs. 1–2 típico | Primeira pessoa, resultado concreto. Padrão-ouro citado: *"Financial infrastructure for the internet"* (Stripe) — específico, não aspiracional (https://www.925studios.co/blog/ai-slop-web-design-guide) | **Risco.** As descrições atuais em `conteudo.ts` são exatamente do gênero aspiracional ("Uma experiência envolvente que leva você para uma nova dimensão"). São literais do site antigo, então mexer é decisão do cliente — mas vale registrar em `PENDENCIAS.md` |
| 11 | **Badge/pill logo acima do H1** | **Confirmado como padrão estrutural**, independente do texto. O "✨ Powered by AI" literal **não confirmei** | Integre o rótulo dentro da headline, ou apague | — |
| 12 | **Estados vazios de interação** — hover que não faz nada; fade-in idêntico em todo elemento (Framer Motion `opacity 0→1` + `y 20→0`, stagger 0.1s) | **Alta** (https://www.sailop.com/blog/ai-slop-2026-state-of-the-ai-generated-web) | **Todo estado desenhado**: hover, focus, **active**, disabled, loading, empty, error | **Falha atual.** Não existe `:active` (§0.4). E o reveal atual é literalmente `opacity 0→1` + `y 16→0` com stagger — o padrão citado. Salva-se pelo chase de pixels, que é autoral |
| 13 | **Cardocalypse** — cards dentro de cards dentro de cards | **Alta** (https://vibecodekit.dev/ai-slop-design) | Achate. Um nível de superfície por seção | **A vigiar** na proposta: bloco não é card, é seção. Só o item é card |
| 14 | **Periferia default** — OG image padrão, 404 default, favicon default, footer de 4 colunas, logo wall genérico | **Média** | OG 1200×630 custom, 404 com conteúdo real, favicon feito à mão | — |
| 15 | **Imagens 3D abstratas flutuantes** (blobs) e foto de banco "grupo diverso olhando um laptop" | **Alta** (https://www.925studios.co/blog/ai-slop-web-design-guide) | Foto real do próprio trabalho, com dado real | **Força enorme deste projeto.** Existem fotos reais de festas reais montadas pela empresa. Use-as |

### 7.2 O antídoto estrutural, e o "signature token"

Dois testes operacionais que valem mais que a tabela:

**O lookalike test** (https://freedesignmd.com/blog/shadcn-looks-generic): abra
cinco sites do mesmo setor lado a lado com o seu. **Se dá para trocar as logos
sem ninguém notar, não terminou.**

**O signature token** (mesma fonte): uma coisa que nenhum default produziria —
uma textura de grão, uma sombra assinatura, uma curva de easing específica, um
tratamento de borda não-default.

**Este projeto já tem três signature tokens, e eles são a razão pela qual os
cards *não* parecem gerados por IA mesmo estando "horríveis":**

1. `--ease-tubo`, uma `linear()` de 9 paradas com overshoot — nenhum default
   produz isso;
2. o chase de 9 pixels discretos, com `from: 'last'` na saída;
3. o aro de gradiente `175deg` de quatro paradas em `border-box`.

**O problema dos cards não é que pareçam feitos por IA. É que a composição não
foi terminada.** São coisas diferentes, e a segunda é mais fácil de resolver.

---

## 8. REFERÊNCIAS — CARDS QUE VALE ROUBAR

Todas as URLs foram verificadas com requisição HTTP. Onde a descrição vem de
leitura estrutural da página, está marcado **[lido]**; onde vem do CSS de
produção, **[CSS]**; onde vem de terceiro, **[terceiro]**.

| # | Referência | O print numa frase | O que roubar |
|---|---|---|---|
| 1 | **Linear — features** https://linear.app/features **[lido]** | Grade de 8 cards de feature, cada um com **exatamente três elementos**: ícone, título, uma linha | A disciplina de densidade. Três elementos, sem exceção, em todos. É isso que faz a grade parecer sistema |
| 2 | **Linear — botão, CSS de produção** https://static.linear.app/web/_next/static/css/Button.dcAi4KbO.css **[CSS]** | Quatro camadas de `box-shadow` numa declaração: anel interno 3%, reforço de topo 4%, anel externo preto 60%, difusa 10% | A estratégia em camadas: **anel uniforme fraco + reforço só no topo**. Topo ~7%, laterais ~3% |
| 3 | **Linear — sombras nos dois temas** https://static.linear.app/web/_next/static/css/index.ONusDM1Q.css **[CSS]** | O mesmo token `--shadow-high` a 6% no claro e **35% no escuro** | A prova de que sombra preta **não** é abandonada em dark — é intensificada ~6×. E de que isso só funciona porque o fundo não é `#000` |
| 4 | **Raycast — card, CSS de produção** https://www.raycast.com/ **[CSS]** | `inset 0 .5px 0 0 rgba(255,255,255,.3)` + hairline escura + ambiente ampla | O **`.5px`**. Em tela 2× rende um pixel físico. É uma das diferenças perceptíveis entre "caro" e "template" |
| 5 | **Raycast — grade de recursos nativos** https://www.raycast.com/ **[lido]** | Grade de 12 ladrilhos (Notes, Flight Tracker, Calculator, Window Management…) onde o objeto gráfico é o conteúdo | Card sem foto em que **o desenho é o assunto**, não decoração ao lado do texto |
| 6 | **Vercel — Geist materials** https://vercel.com/geist/materials **[lido]** | Presets **nomeados** — `material-base` (raio 6px), `material-tooltip` (canto 6px) — em vez de tokens soltos | Nomear o **material**, não o valor. "Rack", "case", "painel" — não "radius-14" |
| 7 | **Vercel — filete e barra lateral, CSS de produção** https://vercel.com/ **[CSS]** | `inset 0 1px #ffffff40` no topo; e `inset 2px 0 0 0 var(--ds-amber-900)` como barra lateral de status | A **meia-borda por `inset`**: substitui elemento no DOM por uma linha de CSS |
| 8 | **Vercel — security / X-Ray** https://vercel.com/security **[lido]**, documentado em https://rauno.me/craft **[terceiro]** | Interação de "raio-X" sobre uma superfície de grade técnica | Trama gerada como mídia. O padrão vira o assunto do bloco |
| 9 | **Stripe — pricing** https://stripe.com/pricing **[lido]** | A taxa é a coisa maior do card por margem larga; o texto de apoio é notavelmente menor; **nenhuma imagem dentro do card** | O card de dado grande. Um número manda, tudo mais é legenda |
| 10 | **Stripe — home** https://stripe.com/ **[lido]** | Bento assimétrico nas soluções, **grid uniforme** nos depoimentos, carrossel nas startups | **Dois sistemas na mesma página.** Bento para heterogêneo, grid uniforme para comparável |
| 11 | **Apple — especificações técnicas** https://www.apple.com/macbook-pro/specs/ **[lido]** | Página inteira de `rótulo → valor` em colunas, e não parece pobre | Ficha densa é conteúdo, não vazio. É o padrão §5.1 no seu estado mais puro |
| 12 | **Apple — bento de keynote**, teardown https://www.deck.gallery/blog/apple-bento-grid-breakdown/ **[lido]** | 8–12 tiles sobre canvas **`#080808`**, com o tamanho do tile codificando prioridade e números como o tipo mais alto | Duas coisas: **"tile size encodes priority"** e o fundo escuro como **cola** entre tratamentos heterogêneos |
| 13 | **Basecamp** https://basecamp.com **[lido]** | Blocos conduzidos por tipografia e por métricas ("84 million people"), sem card de foto | Texto pode ser o visual. Nenhuma caixa, e mesmo assim há estrutura |
| 14 | **Linear — Method** https://linear.app/method/introduction **[lido]** | Blocos de texto curto sob cabeçalhos, sem imagem | Cabeçalho + parágrafo curto **é** um card, se o espaço e o filete estiverem certos |
| 15 | **Framer** https://www.framer.com/ **[lido]** | Blocos de capacidade em tratamentos visuais diferentes + métricas de plataforma em formatos mistos | Número grande como tipo dominante em célula pequena. Mesma lógica do "numbers are the loudest type" |
| 16 | **Family** https://www.family.co **[lido]** | Blocos de feature sem nenhuma fotografia — só mockups de tela e elementos abstratos | **Coerência de mídia**: escolher um tipo de imagem e não misturar. Foto + ilustração + ícone no mesmo grid é o que faz parecer colcha de retalhos |

**Galerias para curar (verificadas vivas):** https://godly.website/ ·
https://bentogrids.com/ (SPA, abra no navegador — tem filtro dark) ·
https://onepagelove.com/tag/bento · https://www.a1.gallery/websites/bento-landing ·
https://land-book.com/design/landing-page · https://www.awwwards.com/websites/bento-grid/ ·
https://mobbin.com/ · https://curated.design/

**Vivos mas não verificados visualmente** (citados por terceiros como referência
de bento/card em tema escuro): https://superlist.com/ · https://arc.net/ ·
https://resend.com/ · https://www.cursor.com/ · https://clerk.com/ ·
https://supabase.com/ · https://rive.app/

---

## A PROPOSTA PARA OS 13 SERVIÇOS

### P.1 O princípio, em uma frase

**Pare de tratar os 13 como uma lista.** Os cinco blocos já existem em
`lib/conteudo.ts` — som (1), luz (2), LED (5), cenografia (3), pacotes (2). Cada
bloco fecha sozinho, nenhum passa de 5 células, e **a contagem 13 deixa de
existir**: você nunca tem 13 numa grade. O número primo era um problema de
grade única; cinco grades pequenas não têm esse problema.

Isso não é um truque de layout — é o que toda a pesquisa de bento recomenda
(teto de 4–9 células por bloco, §4.1) e o que a Apple faz (tamanho do tile
codifica prioridade, §4.2). E resolve a reclamação do cliente pela raiz: **o
bloco de som tem um item só, então esse item recebe a maior área da página.**

### P.2 O layout — desktop

```
DESKTOP ≥1024px · cinco blocos · cada um fecha exato · zero órfão

┌ SOM ─────────────────────────────────── A base de tudo ─┐   1 item
│ ╔══════════════════════════════════════════════════════╗ │
│ ║ [ foto de palco — sangra até a borda, raio no topo ] ║ │   N1 HERÓI
│ ║ PA                                                   ║ │   span 4/4
│ ║ Sonorização e palco               CAIXAS ··· 12      ║ │
│ ║ Estruturas que elevam...          SUBS   ···  4      ║ │
│ ║                                   MESA   ··· 32c     ║ │
│ ║ Falar no WhatsApp →               EQUIPE ···  2      ║ │
│ ╚══════════════════════════════════════════════════════╝ │
└──────────────────────────────────────────────────────────┘

┌ LUZ ─────────────────────────────── Cênica e de pista ─┐    2 itens
│ ┌───────────────────────┬──────────────────────────────┐ │
│ │ LX                    │ LX-P                         │ │
│ │ Iluminação cênica     │ Iluminação de pista          │ │
│ │ ▱ desenho de linha    │ ░ lavado magenta 12%         │ │
│ │ N3 · compacto      →  │ N2 · médio                →  │ │
│ └───────────────────────┴──────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘

┌ LED ──────────────────── A metade que nos diferencia ──┐    5 itens
│ ┌──────────────────────────┬─────────────┬─────────────┐ │
│ │ ╔══════════════════════╗ │ LED-F       │ LED-T       │ │
│ │ ║ [ foto sangrada ]    ║ │             │ ∴∴∴ trama   │ │
│ │ ║ LED-P                ║ │   9 m²      │ marca LED-T │ │
│ │ ║ Painel de LED        ║ │   de pista  │             │ │
│ │ ║ PASSO ··· P3         ║ ├─────────────┼─────────────┤ │
│ │ ║ ÁREA  ··· 18 m²      ║ │ LED-TN      │ FX          │ │
│ │ ║ Falar no WhatsApp →  ║ │             │ ▨▨▨ hachura │ │
│ │ ╚══════════════════════╝ │  12 m       │ marca FX    │ │
│ │  N1 HERÓI · span 2×2     │ N2      →   │ N3       →  │ │
│ └──────────────────────────┴─────────────┴─────────────┘ │
│   4 colunas × 2 linhas = 8 células · herói 4 + quatro 1×1 │
└──────────────────────────────────────────────────────────┘

┌ CENOGRAFIA E CONTEÚDO ──────────── O que fica na foto ─┐    3 itens
│ ┌──────────────────────────────────────────────────────┐ │
│ │ SET · Área instagramável       ░ lavado magenta      │ │
│ │ N2 · médio, largura total                         →  │ │
│ ├───────────────────────┬──────────────────────────────┤ │
│ │ 3D                    │ REC                          │ │
│ │ Projetos 3D           │ Criação de conteúdo          │ │
│ │ ▱ wireframe de linha  │ marca d'água REC             │ │
│ │ N3                 →  │ N3                        →  │ │
│ └───────────────────────┴──────────────────────────────┘ │
│   1 largo + 2 estreitos — nunca três colunas iguais (§7.4)│
└──────────────────────────────────────────────────────────┘

┌ PACOTES ────────────────────────────── A festa inteira ─┐   2 itens
│ ┌───────────────────────┬──────────────────────────────┐ │
│ │ [ foto com rosto ]    │ [ foto com rosto ]           │ │
│ │ 15A                   │ CAS                          │ │
│ │ Emoções 15 anos       │ Emoções casamento            │ │
│ │ acento ÂMBAR       →  │ acento ÂMBAR              →  │ │
│ │ N2 · lavado âmbar 8%  │ N2 · lavado âmbar 8%         │ │
│ └───────────────────────┴──────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘

Total: 1 + 2 + 5 + 3 + 2 = 13. Nenhum órfão. Nenhuma linha de índice.
```

### P.3 O layout — celular (o que importa de verdade)

```
CELULAR ≤480px · uma coluna · ALTURA VARIÁVEL é o que salva

╔═══════════════════════════╗  ← cabeçalho sticky, mono, caixa alta
║ SOM · A base de tudo      ║     backdrop-filter, borda inferior
╚═══════════════════════════╝
┌───────────────────────────┐
│ [ foto de palco ]         │
│ PA                        │   N1 · min-height 58svh
│ Sonorização e palco       │   foto sangrada + ficha 2×2
│ CAIXAS 12 · SUBS 4        │
│ MESA 32c · EQUIPE 2       │
│ Falar no WhatsApp      →  │
└───────────────────────────┘

╔═══════════════════════════╗
║ LUZ · Cênica e de pista   ║
╚═══════════════════════════╝
┌────┬──────────────────────┐
│ LX │ Iluminação cênica  → │   N3 · FAIXA HORIZONTAL ~96px
│ ▱  │ desenho de linha     │   quebra o ritmo vertical
└────┴──────────────────────┘
┌───────────────────────────┐
│ LX-P                      │
│ Iluminação de pista       │   N2 · min-height 34svh
│ ░ lavado magenta          │
│ Falar no WhatsApp      →  │
└───────────────────────────┘

╔═══════════════════════════╗
║ LED · A metade que...     ║
╚═══════════════════════════╝
┌───────────────────────────┐
│ [ foto sangrada ]         │
│ LED-P · Painel de LED     │   N1 · min-height 58svh
│ PASSO P3 · ÁREA 18 m²     │
│ Falar no WhatsApp      →  │
└───────────────────────────┘
┌───────────────────────────┐
│ LED-F                     │
│    9 m²                   │   N2 · dado grande em âmbar
│    de pista de LED     →  │
└───────────────────────────┘
┌────┬──────────────────────┐
│LED │ Tubos de LED       → │   N3 · faixa
│ -T │ ∴∴∴ trama            │
└────┴──────────────────────┘
┌───────────────────────────┐
│ LED-TN · 12 m de túnel  → │   N2
└───────────────────────────┘
┌────┬──────────────────────┐
│ FX │ Efeitos especiais  → │   N3 · faixa
└────┴──────────────────────┘

… CENOGRAFIA (SET N2, 3D N3 faixa, REC N3 faixa)
… PACOTES  (15A N2 foto, CAS N2 foto)

Ritmo resultante: alto → faixa → médio ‖ alto → médio → faixa → médio →
faixa ‖ médio → faixa → faixa ‖ médio → médio
NUNCA duas alturas iguais seguidas dentro do mesmo bloco.
```

O ponto: **é o cabeçalho de bloco que transforma "13 caixas" em "5 grupos de 1 a
5"**, e é a variação de altura que impede a pilha monótona
(https://digitalheroesco.com/styles/bento-grid/ — *"tile height becomes
content-driven; do not force equal heights on mobile"*).

### P.4 Quem vira herói, e por quê

**Dois heróis. Não três** — *"three hero tiles cancel each other out"*
(https://inkbotdesign.com/bento-grid-design/).

| Herói | Por quê |
|---|---|
| **PA · Sonorização e palco** | É o serviço-base da empresa (o nome é Rapa **Sound**), é o único item do seu bloco, e é o que o cliente reclamou que sumiu. Um bloco de um item só **é** a definição de herói |
| **LED-P · Painel de LED** | É o topo do bloco maior, e o bloco LED é *"a metade que nos diferencia"* segundo o próprio `conteudo.ts` |

Os outros não parecem sobra porque cada um tem **objeto dominante próprio**
(§4.6): LED-F e LED-TN têm um número grande; LED-T e FX têm trama; LX e 3D têm
desenho de linha; SET e LX-P têm lavado ambiente; 15A e CAS têm foto com rosto.
**Nenhum card é "o herói, só que menor".**

E a regra que evita o efeito sobra: **o herói ganha área e padding, não cor**.
*"Size é o sinal primário de hierarquia, não o posicionamento"*
(https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide).
Padding escala com o bloco: N1 = 28–32px, N2 = 24px, N3 = 18px.

### P.5 O que cada um dos 13 mostra

| Cód. | Serviço | Nível | Objeto dominante | Acento | Ambiente |
|---|---|---|---|---|---|
| PA | Sonorização e palco | **N1** | foto de palco sangrada + ficha 4 pares (§5.1) | âmbar | nenhum (técnico) |
| LX | Iluminação cênica | N3 | desenho de linha: treliça + moving head (§5.5) | âmbar | nenhum |
| LX-P | Iluminação de pista | N2 | lavado magenta 12% (§5.6) | âmbar | magenta |
| LED-P | Painel de LED | **N1** | foto sangrada + ficha: passo, área, brilho | âmbar | magenta ≤10% |
| LED-F | Pista de LED | N2 | **dado grande**: `9 m²` (§5.2) | âmbar | magenta |
| LED-T | Tubos de LED | N3 | trama de pontos + marca d'água `LED-T` (§5.3/5.4) | âmbar | — |
| LED-TN | Túnel de LED | N2 | **dado grande**: `12 m` | âmbar | congo |
| FX | Efeitos especiais | N3 | hachura diagonal + marca d'água `FX` | âmbar | — |
| 3D | Projetos 3D | N3 | wireframe de linha (§5.5) | âmbar | nenhum |
| SET | Área instagramável | N2 | lavado magenta + tipografia | âmbar | magenta |
| REC | Criação de conteúdo | N3 | marca d'água `REC` + desenho de câmera | âmbar | nenhum |
| 15A | Emoções 15 anos | N2 | **foto com rosto** | **âmbar** | **âmbar 8%** |
| CAS | Emoções casamento | N2 | **foto com rosto** | **âmbar** | **âmbar 8%** |

**A restrição de cor, aplicada sem exceção:** magenta e congo aparecem **só**
como lavado radial de fundo (`::after`, `z-index: -1`), a ≤ 12%, e **nunca** nos
dois cards com rosto. Âmbar é código, seta, dado grande e o lavado dos dois
cards de pacote. **Magenta nunca toca rosto nem botão.**

Foto em **4 dos 13** — os dois heróis e os dois pacotes. Regra memorável: *foto
só no herói de bloco e nos dois pacotes*. Os outros 9 usam padrão sem foto.

### P.6 Por que o card de som deixa de parecer vazio

São seis mudanças, e cada uma sozinha já ajudaria:

1. **Ele deixa de ser linha de índice.** Hoje `sonorizacao-palco` renderiza como
   `LinhaServico` porque não está em `DESTAQUE_LED`. Sai da casta de segunda.
2. **Ele recebe a maior área da página.** É o único item do bloco `som`, então
   ocupa a largura toda. Não é compensação: é a consequência natural de agrupar.
3. **A foto sangra até a borda** e compartilha o raio externo nos dois cantos de
   cima. Acaba a moldura assimétrica de 24/36/28px que hoje faz a foto parecer
   colada num slide (§0.2, §3.2).
4. **Ganha ficha técnica em mono** — quatro pares rótulo/valor. É o padrão §5.1,
   e é o caso em que Refactoring UI **autoriza** o rótulo a ser primário:
   *"On specification-heavy pages, emphasize the label over the value"*
   (https://refactoringui.com/previews/labels-are-a-last-resort). Locação de PA é
   exatamente uma página de especificação. **Isso preenche com informação real a
   área que hoje é ar.**
5. **Ganha o cabeçalho do bloco como contexto** — "SOM · A base de tudo". Deixa de
   ser um item numa lista e passa a ser a abertura de uma seção.
6. **Ganha press state.** Hoje não existe `:active` em `.card` (§0.4). Com
   `scale(0.97)` + camada branca 12% em 160 ms, o card responde ao dedo —
   *"Without a press state, a button can feel unresponsive, making people wonder
   if it's accepting their input"*
   (https://developer.apple.com/design/human-interface-guidelines/buttons).

### P.7 O CSS de grade, copiável

```css
/* cada bloco é uma seção, não um card — evita "cardocalypse" (§7.13) */
.bloco { display: grid; gap: var(--gutter); }
.bloco > h2 {                      /* cabeçalho sticky, §4.8 */
  position: sticky; top: 0; z-index: 2;
  grid-column: 1 / -1; margin: 0; padding: 12px 16px;
  background: color-mix(in oklab, var(--color-void) 88%, transparent);
  backdrop-filter: blur(12px);
  border-block-end: 1px solid var(--color-rule);
  font-family: var(--font-mono); font-size: .8125rem;
  letter-spacing: .1em; text-transform: uppercase;
}

/* ---- CELULAR: uma coluna, altura pelo conteúdo ---------------- */
:root { --gutter: 12px; }
.bloco--som, .bloco--luz, .bloco--led,
.bloco--cenografia, .bloco--pacotes { grid-template-columns: 1fr; }

.n1 { min-height: 58svh; padding: 24px; }   /* svh, não vh */
.n2 { min-height: 34svh; padding: 20px; }
.n3 {                                        /* faixa horizontal */
  display: grid; grid-template-columns: 56px 1fr;
  align-items: center; gap: 16px; padding: 16px 20px;
  min-height: 96px;                          /* >> 48dp Material */
}

/* ---- DESKTOP -------------------------------------------------- */
@media (min-width: 1024px) {
  :root { --gutter: 14px; }
  .n1 { min-height: 0; padding: 32px; }
  .n2 { min-height: 0; padding: 24px; }
  .n3 { grid-template-columns: none; display: block; padding: 18px; }

  .bloco--som        { grid-template-columns: 1fr; }
  .bloco--luz        { grid-template-columns: 1fr 1.4fr; }
  .bloco--pacotes    { grid-template-columns: 1fr 1fr; }

  /* LED: 4 col × 2 linhas = 8 células. Herói 2×2 + quatro 1×1. Exato. */
  .bloco--led {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: minmax(190px, auto);
  }
  .bloco--led > .n1 { grid-column: span 2; grid-row: span 2; }

  /* CENOGRAFIA: 1 largo + 2 estreitos — nunca três iguais */
  .bloco--cenografia { grid-template-columns: 1fr 1fr; }
  .bloco--cenografia > .n2 { grid-column: 1 / -1; }
}

/* rede de segurança: se um dia entrar um 14º serviço, o órfão morre
   sozinho — técnica de https://css-irl.info/controlling-leftover-grid-items/ */
.bloco--led > :last-child:nth-child(4n + 1) { grid-column: span 4; }
.bloco--led > :last-child:nth-child(4n + 2) { grid-column: span 3; }
.bloco--led > :last-child:nth-child(4n + 3) { grid-column: span 2; }
```

Sem `grid-auto-flow: dense` em lugar nenhum — a ordem do HTML já é a ordem de
importância, e `dense` quebraria WCAG 2.4.3 (§4.7).

### P.8 O card, em JSX

```jsx
export function CardServico({ servico, nivel, foto, ficha, dado }) {
  const reduce = useReducedMotion()
  return (
    <li className={`card ${nivel}`}>
      {foto && (
        <img src={foto} alt={`${servico.nome} montado pela Rapa Sound`}
             width={1033} height={690} loading="lazy" decoding="async"
             className="card__midia" />   /* sangra: raio só nos cantos de cima */
      )}

      <span className="lab text-ambar">{servico.codigo}</span>

      <h3 className="card__titulo">
        <a href={zap(`Oi! Quero orçamento de ${servico.nome.toLowerCase()}.`)}
           target="_blank" rel="noopener noreferrer" data-zap
           onTouchStart={() => {}}>   {/* destrava :active no iOS, §6.3 */}
          {servico.nome}
        </a>
      </h3>

      {nivel !== 'n3' && <p className="card__desc">{servico.desc}</p>}

      {dado && (
        <p className="card__dado">
          <span className="card__dado-num">{dado.valor}</span>
          <span className="lab">{dado.unidade}</span>
        </p>
      )}

      {ficha && (
        <dl className="card__ficha">
          {ficha.map(([k, v]) => (
            <div key={k}><dt className="lab">{k}</dt>
                         <dd>{v}</dd></div>
          ))}
        </dl>
      )}

      {/* sempre visível — sem hover, é o único significante de clicável */}
      <span className="card__cta lab text-ambar" aria-hidden>
        Falar no WhatsApp →
      </span>
    </li>
  )
}
```

Três decisões dentro disso:

- `<li>` com `<a>` só no título e `::after` cobrindo o card — Heydon Pickering
  (https://inclusive-components.design/cards/), §6.12. **Muda em relação ao
  código atual**, que envolve tudo num `<motion.a>`.
- `nivel !== 'n3'` corta a descrição no card compacto. **Menos elementos, mais
  contraste** (§1.3). O N3 tem só código + nome + seta.
- O CTA é texto, não só seta. A NN/g: ícone *"should be combined with another
  visual cue, such as a text label, to indicate clickability"*
  (https://www.nngroup.com/articles/clickable-elements/).

### P.9 Checklist de verificação, antes de dar por pronto

- [ ] **Squint test** — reduza a página a miniatura. Dois pontos escuros
      (os heróis) devem se destacar. Se tudo tem o mesmo peso, não há hierarquia
      (https://vibecodekit.dev/ai-slop-design)
- [ ] **Teste a 360px de largura** (https://digitalheroesco.com/styles/bento-grid/)
- [ ] Nenhuma linha de índice sobrou; os 13 são cards
- [ ] Nenhum bloco tem três colunas iguais (§7.4)
- [ ] Todo card tem `:active` **e** `ontouchstart` — teste **num iPhone real**,
      não no simulador do DevTools (§6.3)
- [ ] Stagger com teto (`Math.min(i, 3)`), `once: true` (§6.6)
- [ ] `prefers-reduced-motion` corta `scale`/`translate` e **mantém** a camada
      de 12%
- [ ] Nenhuma mídia sem `aspect-ratio` declarado (CLS)
- [ ] Alvo de toque ≥ 96px de altura em todo card, ≥ 12pt de respiro entre eles
      (Apple, §6.2)
- [ ] Magenta e congo só como lavado de fundo ≤ 12%; **zero magenta nos dois
      cards com rosto**
- [ ] **Lookalike test** — cinco sites de locação de som/luz ao lado. Se dá para
      trocar as logos, não terminou

### P.10 O que precisa do cliente — para `PENDENCIAS.md`

1. **Os quatro pares de ficha técnica de cada serviço.** É o insumo que resolve
   o vazio de nove cards. Sem isso, o padrão §5.1 não existe e sobra só trama e
   tipografia. **Esta é a pergunta de maior retorno da lista.**
2. **Os números para os cards de dado grande** — m² de pista de LED, metros de
   túnel, passo do painel (P3/P4), potência do PA. Um número por card, real.
3. **Fotos por serviço.** Hoje `public/img/eventos/` tem 8 fotos genéricas de
   evento (três já em uso nos cards de LED, via `page.tsx`), e
   `public/img/equipe/` tem 6. **Não há foto identificada de palco/PA nem de
   painel de LED isolado.** Os dois heróis precisam de foto que mostre o
   equipamento, não a festa em geral.
4. **As descrições atuais são aspiracionais** ("Uma experiência envolvente que
   leva você para uma nova dimensão") — o gênero que a pesquisa identifica como
   sinal de texto genérico (§7.10). São literais do site antigo, então trocar é
   decisão do cliente. Vale propor.

---

## FONTES

Todas verificadas com requisição HTTP na redação. Onde a página é SPA e não
retorna conteúdo, está anotado e foi substituída por fonte primária equivalente.

**Anatomia e hierarquia**
- Nielsen Norman Group — Cards: UI-Component Definition · https://www.nngroup.com/articles/cards-component/
- Refactoring UI — Labels are a last resort (capítulo aberto) · https://refactoringui.com/previews/labels-are-a-last-resort
- Adam Wathan & Steve Schoger — 7 Practical Tips for Cheating at Design · https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886
- Nathan Curtis — Typography in Design Systems · https://medium.com/eightshapes-llc/typography-in-design-systems-6ed771432f1e
- LogRocket — Card interface design · https://blog.logrocket.com/ux-design/ui-card-design/
- Webflow — How to use card UI design · https://webflow.com/blog/ui-design-cards
- Verdigris — Eyebrow typography · https://design.verdigris.co/categories/typography/eyebrow
- Techstacker — Uppercase letterspacing · https://techstacker.com/typography-uppercase-letterspacing-tracking/
- Pimp my Type — Spacing all caps · https://pimpmytype.com/spacing-all-caps/

**Superfície em tema escuro**
- Material Components Android — Dark theme (repo oficial do Google) · https://raw.githubusercontent.com/material-components/material-components-android/master/docs/theming/Dark.md
- Google Codelab — Material dark theme · https://codelabs.developers.google.com/codelabs/design-material-darktheme
- `ElevationOverlayProvider.java` (fórmula do overlay) · https://raw.githubusercontent.com/material-components/material-components-android/master/lib/java/com/google/android/material/elevation/ElevationOverlayProvider.java
- Flutter `elevation_overlay.dart` (tabela M3 de surface tint) · https://raw.githubusercontent.com/flutter/flutter/3.13.0/packages/flutter/lib/src/material/elevation_overlay.dart
- Level Access — Acessibilidade e astigmatismo (halação) · https://www.levelaccess.com/blog/accessibility-for-people-with-astigmatism/
- Bureau of Internet Accessibility — Dark mode readability · https://www.boia.org/blog/dark-mode-can-improve-text-readability-but-not-for-everyone
- Linear — CSS de produção (tokens de sombra e superfície) · https://static.linear.app/web/_next/static/css/index.ONusDM1Q.css
- Linear — CSS de produção (botão) · https://static.linear.app/web/_next/static/css/Button.dcAi4KbO.css
- Linear — CSS de produção (grão) · https://static.linear.app/web/_next/static/css/Grain.D_EBlr94.css
- Rauno Freiberg — Web Interface Guidelines · https://interfaces.rauno.me/
- Josh Comeau — Designing Beautiful Shadows in CSS · https://www.joshwcomeau.com/css/designing-shadows/
- MDN — `box-shadow` · https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
- MDN — `feTurbulence` · https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence
- CSS-Tricks — Grainy Gradients · https://css-tricks.com/grainy-gradients/

**Raio de canto e squircle**
- CSS-Tricks — Careful with your nested border radii (2011) · https://css-tricks.com/public-service-announcement-careful-with-your-nested-border-radii/
- Cloud Four — The Math Behind Nesting Rounded Corners · https://cloudfour.com/thinks/the-math-behind-nesting-rounded-corners/
- Andy Bell / Piccalilli — Relative rounded corners · https://piccalil.li/blog/relative-rounded-corners/
- Apple WWDC25 sessão 356 — Get to know the new design system · https://developer.apple.com/videos/play/wwdc2025/356/
- Apple — `ConcentricRectangle` / `.containerConcentric` · https://developer.apple.com/documentation/swiftui/edge/corner/style/concentric
- Chris Coyier — The classic border-radius advice, plus an unusual trick · https://master.dev/blog/the-classic-border-radius-advice-plus-an-unusual-trick/
- Material 3 — Shape (repo oficial; a página m3.material.io é SPA) · https://github.com/material-components/material-components-android/blob/master/docs/theming/Shape.md
- Vercel Geist — Materials · https://vercel.com/geist/materials
- Tailwind v4 — border-radius · https://tailwindcss.com/docs/border-radius
- MDN — `corner-shape` · https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape
- MDN browser-compat-data · https://github.com/mdn/browser-compat-data
- caniuse — corner-shape · https://caniuse.com/mdn-css_properties_corner-shape
- Chrome 139 release notes · https://developer.chrome.com/release-notes/139
- Mozilla standards-positions #823 (corner-shape) · https://github.com/mozilla/standards-positions/issues/823
- WebKit standards-positions #229 (corner-shape) · https://github.com/WebKit/standards-positions/issues/229
- WebKit Features in Safari 26.6 · https://webkit.org/blog/18178/webkit-features-for-safari-26-6/
- Smashing Magazine — Beyond border-radius: the CSS corner-shape property · https://www.smashingmagazine.com/2026/03/beyond-border-radius-css-corner-shape-property-ui/
- CSS-Tricks Almanac — `superellipse()` · https://css-tricks.com/almanac/functions/s/superellipse/
- Figma — Desperately seeking squircles · https://www.figma.com/blog/desperately-seeking-squircles/
- squircle.js — Squircles in Apple design · https://squircle.js.org/blog/squircles-in-apple-design
- `figma-squircle` · https://github.com/tienphaw/figma-squircle
- `@squircle-js/react` · https://github.com/bring-shrubbery/squircle-js
- `corner-smoothing` · https://github.com/sanalabs/corner-smoothing
- CornerKit · https://bejarcode.github.io/cornerKit/

**Bento e grid assimétrico**
- Deck.gallery — Apple bento grid breakdown · https://www.deck.gallery/blog/apple-bento-grid-breakdown/
- Digital Heroes — Bento tile + cells grid layout · https://digitalheroesco.com/styles/bento-grid/
- Brainy Papers — Bento grid design guide · https://brainy.ink/paper/bento-grid-design-guide
- SaaSFrame — Designing bento grids that actually work · https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide
- Superdesign — Bento grid: recipe, real examples and limits · https://www.superdesign.dev/styles/bento-grid
- Inkbot Design — Bento grid design · https://inkbotdesign.com/bento-grid-design/
- Landdding — Bento grid by website category · https://landdding.com/blog/bento-grid-design-by-website-category-where-the-pattern-wins
- freeCodeCamp — How to use bento grids · https://www.freecodecamp.org/news/bento-grids-in-web-design/
- iamsteve — Bento layout with CSS grid and container queries · https://iamsteve.me/blog/bento-layout-css-grid
- Desinance — Bento grid web design · https://desinance.com/design/bento-grid-web-design/
- Galaxy UX — Bento grids: the new standard · https://www.galaxyux.studio/blog/bento-grids-the-new-standard-for-modular-ui-design/
- CSS { In Real Life } — Controlling leftover grid items · https://css-irl.info/controlling-leftover-grid-items/
- CSS-Tricks — Implicit grids, repeatable layout patterns, and danglers · https://css-tricks.com/implicit-grids-repeatable-layout-patterns-and-danglers/
- Ryan Mulligan — Center items in first row with CSS Grid · https://ryanmulligan.dev/blog/grid-stacks/
- Bill Erickson — CSS Grid center last item · https://www.billerickson.net/css-grid-center-last-item/
- MDN — Masonry layout (`display: grid-lanes`) · https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Masonry_layout
- caniuse — masonry · https://caniuse.com/mdn-css_properties_grid-template-rows_masonry
- MDN — Grid layout and accessibility · https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_layout_and_accessibility
- Rachel Andrew — Grid, content re-ordering and accessibility · https://rachelandrew.co.uk/archives/2019/06/04/grid-content-re-ordering-and-accessibility/
- Chrome for Developers — Solving the CSS layout and source order disconnect · https://developer.chrome.com/blog/reading-order

**Celular, toque e movimento**
- NN/g — Beyond Blue Links (clickability signifiers) · https://www.nngroup.com/articles/clickable-elements/
- NN/g — Touch targets on touchscreens · https://www.nngroup.com/articles/touch-target-size/
- NN/g — Flat design: origins, problems, Flat 2.0 · https://www.nngroup.com/articles/flat-design/
- NN/g — Long-term exposure to flat design · https://www.nngroup.com/articles/flat-design-long-exposure/
- NN/g — Executing UX animations: duration and motion · https://www.nngroup.com/articles/animation-duration/
- NN/g — Scroll-triggered text animations delay users · https://www.nngroup.com/articles/scroll-animations/
- NN/g — Scroll fading 101 · https://www.nngroup.com/articles/scroll-fading-101/
- NN/g — Carousels on mobile devices · https://www.nngroup.com/articles/mobile-carousels/
- Apple HIG — Buttons · https://developer.apple.com/design/human-interface-guidelines/buttons
- Apple HIG — Accessibility · https://developer.apple.com/design/human-interface-guidelines/accessibility
- Apple HIG — Gestures · https://developer.apple.com/design/human-interface-guidelines/gestures
- Apple HIG — Feedback · https://developer.apple.com/design/human-interface-guidelines/feedback
- Apple — Safari Web Content Guide, Highlighting Elements (o bug do `:active` no iOS) · https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/AdjustingtheTextSize/AdjustingtheTextSize.html
- Apple — Handling Events · https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html
- Material 3 — tokens `_md-sys-state.scss` v0.192 (a doc m3.material.io é SPA) · https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-state.scss
- Android — Acessibilidade, alvo de 48dp · https://developer.android.com/guide/topics/ui/accessibility/apps
- Google — Touch target size (9mm) · https://support.google.com/accessibility/android/answer/7101858
- WCAG 2.2 — SC 2.5.8 Target Size (Minimum) · https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- WCAG 2.2 — SC 2.5.5 Target Size (Enhanced) · https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
- MDN — `@media (hover)` · https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover
- MDN — `-webkit-tap-highlight-color` · https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-tap-highlight-color
- MDN — `touch-action` · https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
- MDN — `prefers-reduced-motion` · https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- MDN — `animation-timeline` · https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline
- MDN — `animation-range` · https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range
- MDN — `Navigator.vibrate()` · https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
- MDN — Scroll snap, conceitos básicos · https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap/Basic_concepts
- caniuse — Vibration API · https://caniuse.com/vibration
- WebKit — Features in Safari 26.0 · https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- WebKit — A guide to scroll-driven animations with just CSS · https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/
- Chrome for Developers — Make accessible carousels · https://developer.chrome.com/blog/accessible-carousel
- Emil Kowalski — 7 practical animation tips · https://emilkowal.ski/ui/7-practical-animation-tips
- Emil Kowalski — Great animations · https://emilkowal.ski/ui/great-animations
- Emil Kowalski — review-animations STANDARDS.md · https://github.com/emilkowalski/skills/blob/main/skills/review-animations/STANDARDS.md
- Rauno Freiberg — Invisible details of interaction design · https://rauno.me/craft/interaction-design
- Vercel — Web Interface Guidelines · https://github.com/vercel-labs/web-interface-guidelines
- Ahmad Shadeed — CSS scroll snap · https://ishadeed.com/article/css-scroll-snap/
- Ahmad Shadeed — Enhancing the clickable area size · https://ishadeed.com/article/clickable-area/
- Adrian Roselli — Scroll snap challenges · https://adrianroselli.com/2021/07/scroll-snap-challenges.html
- Heydon Pickering — Inclusive Components: Cards · https://inclusive-components.design/cards/
- CSS-Tricks — Stacked cards with sticky positioning · https://css-tricks.com/stacked-cards-with-sticky-positioning-and-a-dash-of-sass/
- CodyHouse — Stacking cards · https://codyhouse.co/tutorials/how-stacking-cards
- Codrops — A practical introduction to scroll-driven animations · https://tympanus.net/codrops/2024/01/17/a-practical-introduction-to-scroll-driven-animations-with-css-scroll-and-view/
- Motion — motion component API (`viewport`) · https://motion.dev/docs/react-motion-component
- Motion — Scroll animations · https://motion.dev/docs/react-scroll-animations
- Builder.io — Build buttery smooth carousels with pure CSS · https://www.builder.io/blog/css-carousel
- WhatsApp — Como usar o click to chat · https://faq.whatsapp.com/5913398998672934

**Sinal de "feito por IA"** *(fontes de qualidade variável — ver aviso no §7)*
- Impeccable — Slop · https://impeccable.style/slop/
- freedesignmd — Why shadcn looks generic · https://freedesignmd.com/blog/shadcn-looks-generic
- Developers Digest — AI design slop and how to spot it · https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it
- 925 Studios — AI slop web design guide · https://www.925studios.co/blog/ai-slop-web-design-guide
- VibeCodeKit — AI slop design · https://vibecodekit.dev/ai-slop-design
- Superdesign — How to make AI UI look less generic · https://superdesign.dev/blog/how-to-make-ai-ui-look-less-generic
- Tim Graf — Glassmorphism UX in 2026 · https://timgraf.com/ui/the-glass-cube-evolution-mastering-glassmorphism-ux-in-2026/
- Sailop — AI slop 2026 (⚠️ estatísticas não verificáveis) · https://www.sailop.com/blog/ai-slop-2026-state-of-the-ai-generated-web

**Sites de referência (verificados vivos)**
- https://linear.app/features · https://linear.app/method/introduction · https://stripe.com/ · https://stripe.com/pricing · https://vercel.com/ · https://vercel.com/security · https://vercel.com/geist/materials · https://www.raycast.com/ · https://www.framer.com/ · https://basecamp.com · https://www.family.co · https://www.apple.com/macbook-pro/specs/ · https://www.apple.com/apple-intelligence/ · https://superlist.com/ · https://arc.net/ · https://resend.com/ · https://www.cursor.com/ · https://clerk.com/ · https://supabase.com/ · https://rive.app/

**Galerias**
- https://godly.website/ · https://bentogrids.com/ · https://onepagelove.com/tag/bento · https://www.a1.gallery/websites/bento-landing · https://land-book.com/design/landing-page · https://www.awwwards.com/websites/bento-grid/ · https://mobbin.com/ · https://curated.design/

---

## O QUE NÃO FOI CONFIRMADO — LISTA CONSOLIDADA

| Item | Situação |
|---|---|
| `m3.material.io` e `m2.material.io` (todas as páginas) | **SPAs que retornam só "This website requires JavaScript".** Substituídas por repositórios oficiais do Google e pelo Codelab — os números são confiáveis, mas vêm do código, não da doc |
| `developer.apple.com/design/...` | Também SPA; contornado pela API JSON interna (`developer.apple.com/tutorials/data/...`). Os textos citados são literais |
| Frase literal do Material dizendo "não use `#000`" | **Não existe.** O que existe é o baseline `#121212` e o argumento das sombras |
| Técnica de borda de dois tons em `rauno.me`, `emilkowal.ski`, `paco.me` | **Não existe nesses sites.** Verifiquei os três índices. A técnica foi confirmada no CSS de produção de Vercel, Linear e Raycast |
| `rauno.me/craft/radii` | **Não existe.** O índice de `/craft` não tem esse item |
| `tonsky.me` sobre corner radius | **Não existe.** O post de centralização trata de métricas de fonte |
| Josh Comeau — "Nested Radiuses" | Existe, mas dentro do curso pago *CSS for JavaScript Developers* |
| Citação verbatim do livro *Refactoring UI* | Livro pago. Usei o artigo dos próprios autores no Medium e o capítulo aberto |
| Percentuais atribuídos ao artigo de flat design da NN/g | **Não existem.** O único número do artigo é "0.1 seconds" |
| Métricas de "Scroll-Triggered Text Animations Delay Users" | **Não existem.** O artigo é qualitativo |
| "Cliques aumentaram 416%" | A NN/g menciona, mas o estudo primário não foi rastreado |
| Paco Coursey sobre press states | **Não encontrado.** Não citei o que não li |
| Valores de press state da Linear | Nenhuma fonte pública citável |
| "Cantos agudos disparam resposta de medo no cérebro" | **Folclore.** Sem estudo primário |
| "Grão elimina banding" em fonte normativa | Prática consolidada, mecanismo sólido, evidência formal não |
| Estatísticas de bento (2,6×, +31%, +14%, 67%, "18% mais profissional") | **Nenhuma tem estudo linkado.** Não use em apresentação |
| Estatísticas do relatório Sailop (70%, 75%, 78%) | Metodologia e amostra não verificáveis |
| Penalidade de SEO por carrossel | **Nenhuma declaração oficial do Google encontrada.** O conteúdo está no DOM e é indexável; o problema é de descoberta |
| `entry-crossing` / `exit-crossing` em `animation-range` | A MDN **não define** esses dois valores; remete à spec do CSSWG |
| Badge literal "✨ Powered by AI" como sinal | Não confirmado. O que se confirma é o padrão estrutural de badge acima do H1 |
| **Desmentidos ativos** | Blogs de 2026 afirmam "`animation-timeline` no Safari 18" e "Firefox 132 com suporte completo" — **ambos falsos**. MDN BCD: Safari **26**, Firefox **`preview`** |
