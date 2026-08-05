# 11 — Revisão de design

Revisão feita sobre o HTML e o CSS realmente servidos (`http://localhost:3000` e o export em
`out/`), sobre os arquivos de origem e sobre os binários de imagem em `public/img/`. Nenhum
achado abaixo é opinião sobre o código: todos foram verificados no que sai pela rede ou no
pixel do arquivo.

Contexto assumido: tráfego de link na bio do Instagram, 4G, tela de ~380px, decisora é a mãe
da debutante, conversão única é o WhatsApp.

---

## Resumo

O sistema — paleta com origem física, escala tipográfica, códigos de rider no lugar de
`01/02/03`, os 116 artistas em texto, o índice assimétrico de 13 serviços — está bem
construído e não é genérico. O problema não é a direção: é que **a página que sai pela rede
não é a página que os comentários descrevem.**

Cinco coisas bloqueiam publicação. A pior delas é que o defeito que o briefing chama de
"o pior defeito do site antigo" — texto dentro de imagem — **está de volta**, com o
`#FF6600` proibido junto, na seção que recebeu a animação mais cara da página.

| | |
|---|---|
| Bloqueante | 5 |
| Grave | 8 |
| Ajuste | 6 |

---

## BLOQUEANTE

### B1 — Os seis cards de equipe são texto dentro de imagem, em `#FF6600`

**`public/img/equipe/1.webp` … `6.webp`**, renderizados em **`app/page.tsx:353-358`**.

Abri os arquivos. Cada um é um card achatado do tema Elementor antigo:

- nome e cargo **queimados no pixel** — "LEANDRO RAPA (Idealizador)", "DANIEL RIBEIRO
  (Pré-Produção)", "MARCELO AUGUSTO (Dj e Produtor)";
- em bold geométrico tipo Montserrat/Poppins — as duas fontes **vetadas** em
  `IDENTIDADE.md:130`;
- sobre **gradiente laranja da família `#FF6600`**, o hex explicitamente proibido em
  `IDENTIDADE.md:46` e em `BRIEFING-CORRIGIDO.md:28`;
- recortados em paralelogramo enviesado, com o gradiente caindo direto no rosto.

`IDENTIDADE.md:191` diz, com todas as letras: *"Nenhum texto dentro de imagem. Foi o pior
defeito do site antigo."* O `alt` gerado em `app/page.tsx:356` é
`Integrante da equipe da Rapa Sound — foto ${i+1}` — ou seja, **os seis nomes da equipe não
existem como texto em lugar nenhum da página**. É exatamente a mesma falha dos 116 artistas
em PNG, reproduzida, em escala menor, no mesmo projeto que se vendeu por tê-la corrigido.

Agrava: a seção fica dentro de `<div class="tecnico">`, o estado que a assinatura define como
**`--branco` puro, sem cor** (`IDENTIDADE.md:82`). Seis retângulos laranja com tipografia
chapada são a primeira coisa que aparece depois da virada. O estado técnico é desmentido
pelo próprio conteúdo.

**O que fazer:** recortar as seis fotos no rosto, jogar fora o gradiente laranja e o
enviesamento, e escrever nome e cargo em `<figcaption>` de texto real, no `--font-mono` do
estado técnico. Se as fotos originais sem tratamento não existirem, a seção sai da página até
existirem — publicar assim custa mais do que não ter seção de equipe.

---

### B2 — 34 blocos da página são servidos com `opacity: 0` e só aparecem depois da hidratação

- `components/Reveal.tsx:25-44` — a classe `rev-on` só entra num `useEffect`.
- `app/globals.css:614` — `.rev { opacity: 0; transform: translateY(14px) }`.
- `app/layout.tsx:78-79` — o script inline remove `no-js` **de forma síncrona, no `<head>`**,
  antes de qualquer pintura. Ou seja, a rede de segurança `.no-js .rev { opacity: 1 }`
  (`globals.css:622`) é desarmada imediatamente e não cobre o caso real, que não é "sem JS"
  e sim **"JS lento"**.

Medido no export: `grep -c 'rev-on' out/index.html` retorna **0**, e há **34** elementos
`class="rev "` no HTML servido. São os 13 serviços, os 116 artistas, as 9 perguntas do FAQ,
o bloco de contato inteiro e o bloco "A casa".

Contra os **179,6 KB gzip de JS** que a página carrega (ver B4), em 4G isso é uma janela de
vários segundos em que a mãe da debutante recebe um hero e depois **rolagem em branco**.

O comentário em `globals.css:611` e em `Reveal.tsx:6` afirma *"Caminho rápido em CSS puro onde
`animation-timeline` existe; fallback por IntersectionObserver"*. **Esse caminho não existe.**
`grep -n animation-timeline app/globals.css` só encontra ocorrências dentro do bloco da
virada (linhas 564-602). O reveal é 100% JS. O comentário descreve código que não foi escrito.

**O que fazer:** inverter o padrão. `.rev` nasce visível; a classe que esconde é adicionada
pelo JS no mount, antes do observer. Quem tiver JS lento vê a página inteira; quem tiver JS
rápido vê o reveal. Ou implementar de fato o `@supports (animation-timeline: view())` que o
comentário promete.

---

### B3 — A 380px não há nenhum alvo de WhatsApp na tela durante a hidratação

Duas causas somadas:

1. **A pílula flutuante é servida invisível.** No `out/index.html`, o `<a>` do WhatsApp em
   `MenuLiquido.tsx:180-193` sai com
   `style="background:…;opacity:0;transform:translateY(20px)"` — o `initial` do
   framer-motion. Ela só aparece quando o framer hidrata. O comentário em
   `MenuLiquido.tsx:22-23` diz *"O WhatsApp fica FORA do morph, sempre visível"*. No HTML
   servido ele não está visível: está com `opacity: 0`.
2. **O CTA do hero fica abaixo da dobra.** `app/page.tsx:43-64`: `min-h-[88svh]`,
   `pt-28` (112px), `pb-16` (64px), `justify-end`. Com `--text-3xl: 4rem`
   (`globals.css:40`), o H1 quebra em ~4 linhas de 65px num viewport de 380px, o parágrafo
   em ~6 linhas de 30px. A caixa do hero fecha em ~814px; o botão começa em ~698px. Num
   viewport de 380×668 ele não é visto sem rolar.

Resultado: durante toda a janela de hidratação, num telefone, **a única conversão da página
não está alcançável**.

**O que fazer:** `initial={false}` na pílula (ou trocar o framer por CSS puro — ver B4) e
encurtar o hero: `min-h-[76svh]`, `pt-20`, e H1 em `text-2xl` (2,75rem) no mobile.

---

### B4 — O orçamento de JS de animação foi estourado em ~3x

`package.json:11-12` traz **framer-motion** e **gsap**. Medido nos chunks do export:

| chunk | gzip | contém |
|---|---|---|
| `677-f6375ee5910b8627.js` | 49,0 KB | gsap + framer-motion |
| `c15bf2b0-52e8419f34af26ab.js` | 19,8 KB | gsap |
| `4bd1b696-…js` | 54,4 KB | react-dom |
| `255-…js` | 46,0 KB | |
| `polyfills-…js` | 39,5 KB | |
| **total carregado pelo `index.html`** | **179,6 KB gzip** | |

As bibliotecas de animação sozinhas somam **~68,8 KB gzip**. O teto de `IDENTIDADE.md:145` é
**60 KB**, e a linha seguinte diz que *"o orçamento medido da stack é ~1,1 KB"*. A página
entregue está **60x** acima do que o próprio documento mediu, e acima do teto que ele fixou.

Onde entram:

- `app/layout.tsx:3,84` — `MotionConfig` no root layout: framer-motion vira dependência de
  **todo** visitante, inclusive de quem nunca abre o menu.
- `components/MenuLiquido.tsx:4` — morph de pílula.
- `components/NavDesktop.tsx:4` — uma barra fixa que só existe acima de 1024px, cujo JS é
  baixado por 100% do tráfego mobile.
- `components/LequeEquipe.tsx:4` — GSAP com `elastic.out(1.05,.78)`, para apresentar os seis
  cards do item B1.

**O que fazer:** apagar as duas dependências. O morph do menu é `height`/`border-radius` em
CSS com `@starting-style`; a `NavDesktop` é `position: fixed` com uma classe trocada por um
`IntersectionObserver` de uma linha no hero; o leque sai junto com B1.

---

### B5 — As 13 descrições de serviço são a copy proibida, literal

`lib/conteudo.ts`, verificado no texto renderizado do `out/index.html`:

| linha | texto servido | regra violada |
|---|---|---|
| 88 | "…**transformam seu evento** em um espetáculo visual" | `IDENTIDADE.md:164` "transforme seu evento" |
| 97 | "ambientes dinâmicos e **inesquecíveis**" | "experiências inesquecíveis" |
| 118 | "histórias de amor **inesquecíveis**" | idem |
| 100 | "Uma **experiência** envolvente que leva você para uma nova dimensão" | idem |
| 106 | "ambientes **únicos** e exclusivos" | "momentos únicos" |
| 109 | "eternizar o **momento perfeito**" | idem |
| 115 | "Um **momento mágico**… repleto de brilho e encanto" | idem |
| 82 | "som **impecável** e palco digno de grandes shows" | "alta qualidade" |
| 91 | "**tecnologias avançadas** para um visual impactante" | jargão de agência |
| 242 | "além de **milhares** de casamentos e festas de 15 anos" | `IDENTIDADE.md:187` — número fora da lista de fatos |

O cabeçalho do arquivo (`lib/conteudo.ts:4-5`) se defende com *"tudo aqui é literal do site
atual"*. Fidelidade ao site antigo não é uma exceção à regra de voz — o site antigo **é a
origem da lista de proibições** (`IDENTIDADE.md:166`). E o efeito de leitura é pior do que a
soma das partes: a copy escrita à mão (hero, casamento, FAQ) é boa e específica; ao lado
dela, a seção de serviços — a maior da página — soa como texto de template. O leitor não
sabe qual metade veio de onde; ele só sente a queda.

**O que fazer:** reescrever as 13 em uma linha cada, no registro do FAQ. Exemplo, para
`pista-de-led` no lugar de "Onde o brilho e a grandiosidade se encontram": *"Piso de LED de
4x4 m ou 6x6 m, montado sobre o piso do salão. Sincroniza com a luz da pista."*
E trocar "milhares de casamentos" por um fato da lista, ou cortar a oração.

---

## GRAVE

### G1 — Magenta colorindo botão (violação da restrição dura)

`components/CardServico.tsx:8-9`:

```ts
export const corDoTubo = (s: Servico) =>
  s.estado === 'festa' ? 'var(--color-magenta)' : 'var(--color-branco)'
```

Os três cards de destaque (`painel-de-led`, `pista-de-led`, `tunel-de-led`) são
`estado: 'festa'`, logo recebem `--tubo-cor: magenta` inline (`CardServico.tsx:31`). E cada
um desses cards **é um `<a href={zap(...)}>`** — um botão de WhatsApp inteiro
(`CardServico.tsx:24-32`), com o rótulo "Falar no WhatsApp" dentro.

No hover, `app/globals.css:319-333`:

- o aro vira `color-mix(… var(--tubo-cor) 46% …)` → **magenta**;
- a sombra vira `0 18px 40px -24px color-mix(… var(--tubo-cor) 55% …)` → **halo magenta**.

`IDENTIDADE.md:12-13`: *"Âmbar colore botão… **Magenta nunca toca um rosto nem um botão.**"*
Mesma violação, mais fraca, em `globals.css:411-414`: `.linha:hover` pinta o fundo de
`--tubo-cor` a 5% em dez âncoras que também vão para o WhatsApp.

**O que fazer:** `corDoTubo` devolve `var(--color-ambar)` para tudo que é clicável. O magenta
fica no `<Tubo>` da seção `#quinze-anos` (`page.tsx:70`) e no ambiente — que é o papel que a
tabela de `IDENTIDADE.md:40` dá a ele.

---

### G2 — A coluna de pixels some exatamente no estado técnico

`app/page.tsx:276`:

```tsx
<Tubo cor="var(--color-branco)" aceso />
```

Esse `<Tubo>` vive dentro de `<div class="tecnico">`, cujo fundo é `var(--color-branco)`
(`globals.css:531`). O CSS já previa isso e define `.tecnico { --tubo-cor: var(--color-void) }`
em `globals.css:533` — mas o `cor` do componente escreve `--tubo-cor` **inline no próprio
elemento** (`ui.tsx:10`), e estilo inline vence herança de classe.

Verificado no HTML servido:

```html
<div class="tecnico"><section id="rider" …>
  <span aria-hidden class="tubo tubo-aceso" style="--tubo-cor:var(--color-branco)">
```

`#ECEDEF` sobre `#ECEDEF`. **Invisível.**

`IDENTIDADE.md:92-94` chama a coluna de pixels de "a expressão da assinatura" e diz que "ela
muda de cor na virada". Na página servida ela não muda de cor: ela desaparece, no exato
momento em que a assinatura acontece. Metade da assinatura não chega à tela.

**O que fazer:** apagar a prop `cor` em `page.tsx:276` e deixar o `.tecnico` herdar. Uma
linha.

---

### G3 — O `alt` é gerado por índice de array e por isso mente

- `app/page.tsx:93` — `Festa de 15 anos … — foto ${i+1}`
- `app/page.tsx:182` — `Casamento sonorizado e iluminado … — foto ${i+1}`
- `app/page.tsx:217` + `CardServico.tsx:39` — `${servico.nome} montado pela Rapa Sound`

Abri os arquivos e confrontei:

| arquivo | o que a imagem mostra | o que o `alt` afirma |
|---|---|---|
| `eventos/8.webp` | primeira dança de **casamento**, luz **verde** em todos os rostos | *"Túnel de LED montado pela Rapa Sound"* (`page.tsx:217`, i=2) — **não há túnel nenhum na foto** |
| `eventos/6.webp` | pista de LED vazia com painel escrito "Dinah Boaventura" | *"Pista de LED"* (card) **e** *"Casamento sonorizado e iluminado — foto 1"* (`page.tsx:182`) — a mesma imagem com duas legendas incompatíveis, e nada nela identifica um casamento |
| `eventos/1.webp` | mulher de vestido branco de cetim e tiara, erguida sobre a cauda | *"Debutante erguida pelas convidadas"* (`page.tsx:35` **e** `layout.tsx:25`, o card de OpenGraph que o link da bio renderiza) |

O terceiro é o mais caro: `IDENTIDADE.md:187` diz *"Qualquer outro número é invenção"*, e a
mesma disciplina vale para afirmação de fato. A foto não estabelece que a moça é debutante —
o vestido e a tiara aparecem igualmente em `eventos/7.webp`, que a própria página rotula
como casamento. A afirmação está no `alt` do LCP e no `og:image`.

**O que fazer:** um campo `alt` escrito à mão por arquivo em `lib/conteudo.ts`, e confirmar
com o cliente o que é cada foto antes de publicar. Nenhum `alt` gerado por template.

---

### G4 — A única foto que prova o argumento está no menor quadro

`app/page.tsx:179-185`, seção `#casamento`, `FOTOS_EVENTO.slice(5,8)` = fotos 6, 7 e 8. O
`i === 0` recebe `col-span-2 aspect-16/10` — o quadro grande. Quem cai no `i === 0` é a
**foto 6**, uma pista de LED vazia, sem uma pessoa.

A **foto 7** é uma noiva real, em luz quente dourada, pele limpa, sem dominante de cor —
literalmente a imagem da tese de `IDENTIDADE.md:20-29` e da resposta ao FAQ de
`conteudo.ts:221`. Ela está num tile `aspect-4/5` pequeno, ao lado da foto 8, onde a mesma
noiva de outro casamento aparece com o rosto verde.

A seção que existe para responder *"a luz colorida vai estragar minha foto?"* dá o quadro
grande a uma pista vazia e o quadro pequeno à prova.

**O que fazer:** trocar a ordem — foto 7 no `col-span-2`, e legenda de texto real embaixo
dizendo a temperatura de cor.

---

### G5 — Luz verde em rosto vendendo um serviço

`eventos/8.webp` no topo do card `tunel-de-led` (`page.tsx:217`). Verde não está na paleta —
não é `--ambar`, nem `--magenta`, nem `--congo` — e cai em cheio no rosto dos noivos e de
toda a mesa de convidados. A página inteira argumenta que isso é o erro que a Rapa Sound
sabe evitar. A imagem escolhida para vender o serviço é a contraprova do argumento.

**O que fazer:** trocar por uma foto sem rosto, ou por uma em que o rosto esteja em luz
quente. Se não houver foto de túnel de LED no acervo, o card não leva foto — melhor um card
sem imagem do que um card cuja imagem desmente a copy.

---

### G6 — A assinatura custa 170svh de rolagem vazia e é rotulada em inglês

`app/globals.css:568`: `.virada { min-block-size: 170svh }`. Num telefone de 668px de altura
isso é **~1.140px de rolagem** em que a única coisa que acontece é um plano branco subindo de
opacidade em sete degraus. Não há conteúdo dentro do pivô. Sem `animation-timeline`
(Firefox, e Safari antigo), o caminho base é `min-block-size: 40svh; padding-block: 17svh`
(`globals.css:551-553`) — uma faixa branca de ~270px com uma linha cinza no meio.

E a linha é **`Houselights · 100%`** (`app/page.tsx:269`). Em inglês, jargão de casa de
espetáculo, num `<p>` que **não** é `aria-hidden` — o leitor de tela lê "Houselights · 100%"
entre os vídeos e o rider. A voz especificada em `IDENTIDADE.md:162` é *"português brasileiro
do interior de Minas. Direto, sem jargão"*. A mãe da debutante não sabe o que é houselight.

**O que fazer:** `min-block-size: 90svh`; puxar a primeira linha do rider (`Rider técnico ·
116 artistas`) para dentro do plano, de modo que algo **chegue** com a luz em vez de a luz
chegar sozinha; e trocar o rótulo por `Luz de trabalho · 100%` ou `A casa acende`.

---

### G7 — O leque provavelmente estoura a largura a 380px

- `globals.css:178` — `.leque-card { width: 11rem }` = 176px.
- `LequeEquipe.tsx:34-35` — `multLargura` devolve **0,28** abaixo de 480px.
- `LequeEquipe.tsx:24-32` — os cards das pontas têm `x: ±30` → `±30 × 0,28 = ±8,4rem` =
  **±134px** do centro.

Borda externa em `134 + 88 = 222px` do centro. A caixa de conteúdo a 380px tem `px-5` de cada
lado → ~170px do centro. **Sobra ~52px para fora, de cada lado.** Nenhum ancestral tem
`overflow` declarado: `.leque` é `relative flex` sem clip (`globals.css:172`), e nem a
`Secao` (`ui.tsx:44`) nem `#sobre` (`page.tsx:338`) recortam. O provável é rolagem horizontal
do body — o defeito de mobile mais fácil de sentir e mais fácil de evitar.

Não consegui abrir navegador; a conta está acima e é aritmética simples. **Verificar num
aparelho antes de qualquer outra coisa.** Correção mínima: `overflow: hidden` em `.leque`.
Correção certa: o leque sai (ver B1 e Q6) e a equipe vira uma tira de retratos com nome em
texto.

---

### G8 — A melhor foto do acervo foi apagada no hero

`app/page.tsx:31-41`:

- `opacity-45` na `<img>`;
- por cima, `bg-gradient-to-t from-void via-void/70 to-void/30` — o terço inferior, onde o
  H1 e o CTA moram, fica praticamente em `--void`;
- `object-cover object-center` sobre uma fonte 1033×690 (razão 1,50) dentro de uma caixa de
  ~380×814 (razão 0,47). Para cobrir, a imagem escala 1,18x e o navegador **descarta ~69% da
  largura**, mantendo só o centro.

O centro de `eventos/1.webp` é a saia de cetim branco. A multidão de rostos rindo — a carga
emocional inteira da foto, e a coisa que faz a mãe da debutante parar — está nas bordas, e
some. O que o telefone mostra é uma mancha clara a 45% de opacidade sob um véu preto.

**O que fazer:** `opacity-70`, gradiente só nos 45% de baixo, `object-position` escolhido por
foto, e hero mais curto (ver B3). Ou trocar por uma foto cuja informação sobreviva a um
recorte 0,47.

---

## AJUSTE

**A1 — `id` duplicado.** `page.tsx:69` (`<Secao id="quinze-anos">`) e `CardServico.tsx:67`
(`LinhaServico` do serviço `quinze-anos`) emitem o mesmo `id`; idem `casamento`
(`page.tsx:120`). Verificado: `grep -oE 'id="[^"]+"' out/index.html | sort | uniq -c` mostra
`2 id="quinze-anos"` e `2 id="casamento"`. HTML inválido, e os 301 de `REDIRECTS.md` acertam
a seção por sorte de ordem no DOM. Renomear as âncoras do índice para
`servico-quinze-anos` / `servico-casamento`.

**A2 — Os 4 depoimentos são renderizados duas vezes.** Como `VideoFacade` em `page.tsx:103`
e de novo dentro do `Palco` em `page.tsx:257` (`[...EVENTOS, ...DEPOIMENTOS]`). Quatro capas
extras de `i.ytimg.com` e conteúdo repetido. Tirar os depoimentos do `Palco`.

**A3 — Nenhuma imagem tem `srcset`/`sizes`.** 14 arquivos, 868 KB, todos em largura fixa
(1033px e 628px), entregues inteiros a uma tela de 380px em 4G. `next.config.mjs` está em
`output: 'export'`, então `next/image` não otimiza — é preciso gerar as variantes na mão e
escrever `srcset` em `conteudo.ts`.

**A4 — Dois sistemas de easing e tamanhos hardcoded no JSX.** `MenuLiquido.tsx:26` e
`NavDesktop.tsx:42` usam `[0.22, 1, 0.36, 1]`, contra `IDENTIDADE.md:149` que manda `linear()`
e proíbe curva padrão. `MenuLiquido.tsx:107-109,184` tem `width: 268/132`, `height: 316/52`,
`borderRadius: 24/26` e `rounded-[26px]` — nenhum na escala de raio de `globals.css:48-51`,
contra `IDENTIDADE.md:194` ("nenhuma cor ou tamanho hardcoded no JSX"). Some junto com o
framer, em B4.

**A5 — O blackout dispara tarde e vira um susto.** `Blackout.tsx:18-28`: o `useEffect` roda
depois da hidratação, e o componente retorna `null` até lá. Com 179,6 KB gzip de JS em 4G, a
cortina preta de tela cheia cai sobre uma página que a pessoa **já está lendo**. Não há
guarda de tempo decorrido. Ou some (recomendado — ver Q6), ou ganha
`if (performance.now() > 800) return`.

**A6 — `scroll-behavior: smooth` global.** `globals.css:92`, num documento de 191 KB com 8
âncoras de menu. Uma âncora do topo até `#contato` vira uma animação longa de rolagem no
telefone. Trocar por `scroll-behavior: auto` e deixar o salto seco.

---

## As sete perguntas

### 1. Se este layout servisse para uma pizzaria, uma clínica ou uma startup, ele está genérico. Está?

**Não — e é o mérito principal do trabalho.** O índice de cinco blocos de tamanho desigual
para 13 serviços (`page.tsx:223-246`), os códigos de rider `PA / LX / LED-T` no lugar de
`01/02/03` (`conteudo.ts:61`, `globals.css:394-400`), os 116 nomes em texto corrido separados
por pixel (`page.tsx:311-334`), o percurso das três luzes da noite (`page.tsx:139-169`) e a
estrutura de dois estados não se transplantam para lugar nenhum. Nada disso sai de um
template.

O que **é** genérico na página é justamente o que foi herdado sem edição: as 13 frases de
serviço (B5) e os seis cards de equipe laranja com texto no pixel (B1). Esses dois blocos
serviriam a qualquer empresa brasileira de eventos, e são os dois blocos que a revisão manda
refazer. A página não falha por ser de IA; falha por ter deixado o site velho vazar de volta.

### 2. Qual é o elemento assinatura?

**A virada FESTA→TÉCNICO.** Ela existe, é apontável e é a coisa da página que não se acha em
outro lugar: `globals.css:564-606` prende um plano branco com `position: sticky` dentro de
uma `view-timeline`, sem uma linha de GSAP, e acende em `steps(7, jump-none)`. Como ideia,
está certa: LED é pixel, e um fader com detentes é a metáfora honesta.

**Como página entregue, ela não aterrissa.** Três razões, todas verificadas: a coluna de
pixels — que `IDENTIDADE.md:92` chama de "a expressão da assinatura" — é branca sobre branco
no estado técnico e some (G2); o primeiro conteúdo dentro do estado "sem cor" são seis cards
com gradiente laranja (B1); e o pivô é 170svh de rolagem sem nada dentro, rotulado em inglês
(G6). Existe no CSS. Não existe na tela.

### 3. Onde está a foto real de um evento acima da dobra?

Está em `page.tsx:31-39` — `/img/eventos/1.webp`, foto real do acervo, `fetchPriority="high"`,
candidata a LCP. Formalmente cumprido.

**Na prática, não.** `opacity-45` + gradiente `from-void` + `object-cover` de uma fonte
landscape numa caixa portrait: a 380px o telefone mostra o centro ~31% do quadro, a menos de
metade do brilho, e o centro é tecido branco. Os rostos — a coisa que faz a foto valer — são
recortados fora. E o `alt` (e o `og:image:alt` que o link da bio renderiza) chama a moça de
debutante sem que a imagem estabeleça isso (G3). Ver G8.

### 4. O que deveria ter sido removido e não foi?

1. **framer-motion e gsap** — 68,8 KB gzip, acima do teto de 60 KB, contra uma stack que o
   próprio documento mediu em 1,1 KB. (B4)
2. **As 13 descrições de serviço do site antigo** — 10 violações de voz explícitas. (B5)
3. **Os seis JPEGs de equipe com nome queimado no pixel e gradiente `#FF6600`.** (B1)
4. **O leque de equipe inteiro** — o efeito mais caro da página existe para apresentar o item
   3, provavelmente estoura a largura a 380px, e sua interação principal (`mouseenter`) não
   existe em touch. (G7, Q6)
5. **Os 4 depoimentos duplicados** no `Palco`. (A2)
6. **Um dos dois canvas de haze** — `page.tsx:251`, `#eventos`, atrás de uma seção que já é
   feita de miniaturas de vídeo. (Q6)
7. **O blackout** — dispara depois da hidratação, o que em 4G é uma cortina preta caindo
   sobre uma página já lida. (A5)
8. **80svh do pivô da virada.** (G6)
9. **O rolar de letra do menu** — `MenuLiquido.tsx:40-67`, 760ms por caractere, disparado por
   `onMouseEnter`, num componente `lg:hidden`. É código morto para 100% do público-alvo. (Q6)

### 5. Alguma frase da copy parece escrita por IA?

**Sim, de duas maneiras diferentes.**

A primeira é a copy herdada, e é a pior: *"Uma experiência envolvente que leva você para uma
nova dimensão"* (`conteudo.ts:100`), *"Onde o brilho e a grandiosidade se encontram"* (`:94`),
*"Um momento mágico que celebra o início de uma nova fase, repleto de brilho e encanto"*
(`:115`). Isso é indistinguível de saída de LLM — a ironia é que veio de um humano, do site
Elementor antigo. O leitor não faz essa distinção; ele só sente o registro.

A segunda está na copy escrita à mão, que no geral é boa, e é um **tique de cadência**: a
antítese "não é A — é B" aparece seis vezes.

- `page.tsx:77` "é aí que a festa vira lembrança ou vira foto ruim"
- `page.tsx:135` "A resposta não é abrir mão da cor — é saber onde ela entra"
- `page.tsx:350` "O equipamento qualquer um aluga. O que não se aluga é a equipe…"
- `conteudo.ts:227` "Montar e ir embora é o erro mais comum do setor"
- `conteudo.ts:230` "É a diferença entre uma pane de 30 segundos e uma festa que acaba cedo"
- `conteudo.ts:233` "O ponto certo é aquele em que você dança e ainda consegue falar…"

Uma vez é voz. Seis vezes numa página é ritmo de modelo. **Cortar três** e deixar a frase
seca no lugar. E `page.tsx:133` — *"É a pergunta que toda noiva faz, e ela está certa em
fazer"* — é elogio à pergunta antes de responder: outro maneirismo de assistente. Começar
direto em "Luz colorida reflete na pele e quase não tem conserto na edição."

### 6. Cada animação significa alguma coisa, ou é enfeite? É demais?

**É demais.** `IDENTIDADE.md:152` fixa a régua: *"Um momento orquestrado > oito efeitos
espalhados. A página tem um."* A página tem **onze**. O documento previu o defeito e o código
o cometeu.

Cortar, nominalmente:

| corte | por quê |
|---|---|
| **O leque com GSAP e elástica** (`LequeEquipe.tsx`) | O efeito mais caro da página, para apresentar seis imagens que violam a regra de conteúdo mais dura do projeto. `elastic.out` é enfeite puro: não há nada de LED nem de mesa de luz em física de mola. |
| **O rolar de letra do menu** (`MenuLiquido.tsx:40-67`) | Dispara em `onMouseEnter` dentro de um componente `lg:hidden`. Nunca roda para o público. |
| **O círculo líquido subindo no morph** (`MenuLiquido.tsx:119-125`) | Linguagem de app de agência, sem relação com LED nem com som. Um painel que abre resolve. |
| **O haze de `#eventos`** (`page.tsx:251`) | Duas telas de partículas em canvas na mesma página é decoração. Manter só o de `#servicos`, e a 600. |
| **O blackout** (`Blackout.tsx`) | 400ms que em 4G chegam segundos depois da pintura. O momento existe na ideia e não na entrega. |
| **80svh da virada** (`globals.css:568`) | Ver G6. |
| **`translateY(-3px)` no hover do card** (`globals.css:320`) | Card que levanta no hover é o gesto mais genérico que existe. O aro que incorpora a cor do tubo já faz o trabalho, e faz melhor. |

**Manter:** a varredura da palavra LED (`globals.css:148-166` — duas passadas, para, custa
nada, e é o único lugar da página onde o magenta é autorizado a tocar tipografia); o
`.luz` do cursor (`globals.css:350-372` — revela a matriz de pixels sob o difusor, é o
conceito virando interação, e é `@media (hover: hover)`, então nem chega ao telefone); o
tubo acendendo; e a virada, encurtada.

O reveal fica, mas invertido (B2). Trinta e quatro blocos entrando em cascata já é, por si
só, o efeito mais associado a página gerada — e aqui ele também esconde a página em 4G.

### 7. A assinatura funciona a 380px, ou só existe no desktop?

**Ela dispara a 380px, mas não se lê como um momento.** `view-timeline` é relativa ao
viewport, então o pivô acontece igual no telefone. O que o telefone recebe é:

- **~1.140px de rolagem** (170svh) em que a única mudança é um plano branco subindo de
  opacidade em sete degraus, sem nenhum conteúdo dentro do pivô;
- **uma linha em inglês** — `Houselights · 100%` — como toda a explicação do que aconteceu;
- **sem a coluna de pixels**, que é branca sobre branco do outro lado (G2) — ou seja, o
  telefone recebe o degrau de luz sem o objeto que deveria mudar de cor com ele;
- e, logo depois, **seis cards com gradiente laranja** dentro do estado que a assinatura
  acabou de definir como "sem cor" (B1).

`IDENTIDADE.md:96-97` já tinha escrito a condição: *"Testar a assinatura a 380px antes de
fechar. Se a virada não se lê num aparelho estreito, ela não existe."* Pelo que está no
código, ela não se lê. Não porque a técnica esteja errada — a técnica é boa e é barata — mas
porque **nada chega junto com a luz**.

Para fazer existir a 380px, três mudanças, nesta ordem:

1. apagar `cor="var(--color-branco)"` em `page.tsx:276` — uma linha, e a coluna de pixels
   volta a existir do outro lado, em preto (G2);
2. `min-block-size: 90svh` em `globals.css:568` e mover `Rider técnico · 116 artistas` para
   dentro do `.virada__plano`, de modo que a casa acenda **sobre alguma coisa**;
3. rótulo em português.

---

## Ordem de execução sugerida

1. G2 — uma linha, devolve metade da assinatura.
2. B3 + A5 — `initial={false}` e guarda de tempo: a conversão volta a existir em 4G.
3. B2 — inverter o reveal.
4. B1 — refazer os seis cards de equipe; cortar o leque junto.
5. B5 + G3 — reescrever as 13 descrições e os `alt`, com o cliente na mesa.
6. B4 — apagar framer-motion e gsap.
7. G6 + Q7 — encurtar e legendar a virada em português.
8. G1, G4, G5, G8 — cor, hierarquia de foto e hero.
9. Ajustes.

Os itens 1 a 3 são de uma tarde e mudam a página mais do que todo o resto somado.
