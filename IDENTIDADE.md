# Identidade Rapa Sound — sistema de design

**Direção aprovada: TUBO**, em 2026-08-04, com três condições e duas emendas.

> Este arquivo é a fonte da verdade. A skill `.claude/skills/identidade-rapasound/SKILL.md`
> aponta para cá — ela não é versionada, este arquivo é.

---

## ❗ A restrição dura de cor

> **Magenta e congo colorem ambiente, fundo e foto de pista. Âmbar colore botão, dado e
> qualquer elemento próximo a um rosto. Magenta nunca toca um rosto nem um botão.**
>
> Esta regra é o argumento de venda da empresa, não uma preferência estética — ela demonstra
> domínio técnico sem afirmá-lo.

Não é sugestão. Toda revisão de PR verifica isso antes de qualquer outra coisa.

**Por que ela existe.** Duas medições apontaram para lados opostos e a regra é a síntese:

1. Amostrei as 8 fotos do acervo: **sete são violeta, magenta ou ameixa; uma só é âmbar.**
   A pista de um 15 anos às 22h é LED RGB, não tungstênio.
2. A pesquisa de objeções mostrou que a **segunda** maior objeção da compradora é
   *"a luz colorida não vai estragar as fotos e o vídeo da minha filha?"* — luz colorida
   mancha a pele, e a faixa recomendada para retrato é 2.700–3.200 K.

São duas luzes diferentes. **Saber separá-las é literalmente o que a Rapa Sound vende.**
A paleta que declara a separação responde à objeção sem escrever uma linha de texto.

---

## Cor

| Token | Hex | Papel | Origem física |
|---|---|---|---|
| `--void` | `#09090B` | fundo da página | o preto entre pixels — o único preto real, o do LED apagado |
| `--off` | `#191A1F` | superfície, cards, seções | o difusor do tubo sem sinal |
| `--ambar` | `#FFA300` | **acento** · botão, dado, luz sobre pessoa | LED âmbar de banda estreita, 590 nm |
| `--magenta` | `#D81E7E` | ambiente · seção 15 anos | o mix RGB de um salão às 22h |
| `--congo` | `#21105C` | ambiente · seção casamento | gelatina Lee 181, Congo Blue |
| `--branco` | `#ECEDEF` | texto, estado técnico | LED branco em 100% |
| `--branco-2` | `#8E9199` | texto secundário | derivado — neutro com viés azul, nunca cinza puro |

**Proibido:**
- `#FF6600` e qualquer descendente. É o laranja do tema Elementor antigo.
- Cinza neutro puro. Nenhuma das 15 referências pesquisadas usa; `#262626` era o único e sai.
- Gradiente que não esteja declarado aqui. Nenhum está.
- Mais de **um saturado por seção**. Âmbar não conta como saturado quando é botão.

**Contraste — medido, não estimado** (WCAG 2.x, sRGB):

| Par | Razão | Veredito |
|---|---|---|
| `--branco` sobre `--void` | **16,98:1** | AAA |
| `--void` sobre `--branco` (estado técnico) | **16,98:1** | AAA |
| `--ambar` sobre `--void` | **9,94:1** | AAA |
| `--void` sobre `--ambar` (texto de botão) | **9,94:1** | AAA |
| `--magenta` sobre `--void` | **4,17:1** | ⚠️ passa só para texto grande (≥24px) |
| `--ambar` sobre `--branco` | **1,71:1** | ❌ **reprova em tudo** |

Duas consequências que não são opcionais:

1. **Magenta a 4,17:1 reprova AA para corpo de texto.** Ele é ambiente, nunca texto corrido.
   Reforça a restrição dura por um segundo caminho, independente do argumento de venda.
2. **Âmbar sobre branco a 1,71:1 é ilegível.** No **estado técnico**, que tem fundo branco, o
   acento vira tinta (`--void`) e o âmbar só sobrevive como **fundo** de botão. Vale para
   label, código de rider, texto secundário, filete, seleção e foco.

---

## Assinatura — os dois estados

**Emenda 1 do cliente do projeto, 2026-08-04.** A coluna de pixels sozinha vivia no chrome e
sumiria no mobile — que é de onde vem quase todo o tráfego. Ela deixa de ser a assinatura e
passa a ser a **expressão** dela.

A assinatura é a **transição estrutural entre dois estados da página**:

| | `ESTADO FESTA` | `REGISTRO TÉCNICO` |
|---|---|---|
| Cor de ambiente | magenta (15 anos) · congo (casamento) | **nenhuma** |
| Tubo | magenta ou congo | `--branco`, luz de trabalho |
| O que mostra | foto sangrada, vídeo, emoção | rider, 116 artistas, sonorização, 30 anos |
| Tipografia | display | monoespaçada, tracking `0.18em` |
| Filete | `--rule` cheio | `--rule` a 70%, a grade é que organiza |
| Movimento | reveals | nenhum |
| Fala com | mãe de debutante, noiva | produtora, casa de show, prefeitura |

O LED vende a festa. O registro técnico vende os trinta anos — e é ele que resolve o buraco da
sonorização, que era o defeito real da direção.

### ⚠️ O fundo branco morreu, em 2026-08-05

**Decisão do cliente do projeto:** o campo de partículas do `back.md` vale para a **página
inteira**, idêntico em todo lugar. O estado técnico tinha `background: var(--color-branco)`, e
isso é incompatível com "mesmo fundo em tudo".

O cliente olhou a seção do rider no branco e disse que estava feia. Ele viu a página; eu tinha
a teoria. Ganhou ele.

**O que morreu junto:**

- `.virada` — 170 svh de rolagem que acendiam a sala em sete degraus até o branco. Sem o branco
  ela vira tela vazia pedindo rolagem por nada. Foram os `@keyframes acender-sala` e
  `acender-nota`.
- Todo o bloco de correção de contraste de `.tecnico`. Ele existia só porque o fundo invertia;
  sem inversão, as razões voltam a ser as da página — branco sobre void, 16,98:1.
- `.sobre-escuro`, a ilha escura que impedia os cargos da equipe de sumirem no branco.

**O que sobreviveu, e é o ponto:** os dois estados continuam existindo. O registro técnico
deixou de se declarar por **cor de chão** e passou a se declarar por **tipografia e disciplina
de cor** — monoespaçada, zero magenta, tubo branco, filete mais seco. A tese "são duas luzes
diferentes e saber separá-las é o que a empresa vende" não dependia do branco. Dependia da
separação, e a separação continua lá.

O fundo mora em `app/layout.tsx`, **uma vez só**, `position: fixed`. Cópia por seção nunca fica
em fase — idêntico de verdade significa *o mesmo canvas*.

A **coluna de pixels** — tira vertical de pontos discretos, com o espaçamento e a queda de
brilho de um tubo real — é como o estado se manifesta. Ela muda de cor na virada. Nunca é
decorativa e nunca é uma linha contínua.

### ❗ A coluna de pixels não foi inventada aqui

**Descoberto em 2026-08-05, ao recuperar o logo.** O "p" de *Rapa* no logo da empresa **é um
VU meter de segmentos empilhados** — duas colunas de oito, vermelho, laranja, amarelo e verde,
dois de cada. Medido pixel a pixel no arquivo original.

A assinatura que eu tinha derivado das fotos e apresentado como decisão de direção **já estava
na marca**. Isso muda o argumento: a coluna de pixels deixa de ser uma escolha estética que o
cliente precisa aceitar e passa a ser **extração da identidade que ele já tem**.

Consequência prática: onde couber, a coluna de pixels deve ter oito segmentos e a mesma
proporção de segmento e vão do logo, não uma quantidade arbitrária.

Uma coincidência que vale registrar: o amarelo do medidor é `#FCCC2F` e o laranja é `#F48B3C`.
O âmbar `#FFA300`, que foi derivado das fotos do acervo sem olhar o logo, **cai exatamente
entre os dois**.

### O arquivo

`public/rapa-sound.svg` · 9,0 KB · traçado com `potrace` a partir de
`rapasound.com.br/wp-content/uploads/2024/09/Rapa-Sound_logo-PNG-1.webp` (1427×733, 53,3 KB).

O componente `components/Logo.tsx` é o mesmo desenho inline, para que **cada segmento seja um
elemento animável**. É o que permite o medidor acender.

- As quatro cores do medidor são as únicas exceções autorizadas à paleta, e só dentro do logo.
- Em tamanho pequeno (nav), o medidor pode ir para uma cor só. Recolorir a marca fora disso, não.
- O logo original é branco com sombra preta chapada no pixel. Sobre `--void` a sombra some
  limpa — foi testado por composição antes de entrar.

⚠️ **Testar a assinatura a 380px de largura antes de fechar.** Se a virada não se lê num
aparelho estreito, ela não existe — porque é lá que o público está.

## O beat de blackout

**Emenda 2.** Um blackout curto, **~400 ms**, na entrada do hero ou antes da seção de artistas.
Um só na página inteira. Não toca na paleta.

É o único resquício da direção BLACKOUT: a direção morreu, o momento não.

---

## Tipografia

| Papel | Fonte | Origem | Uso |
|---|---|---|---|
| Display | **Zodiak** | Indian Type Foundry · Fontshare · grátis comercial | só H1 e H2 |
| Texto | **Cabinet Grotesk** | Indian Type Foundry · Fontshare · grátis comercial | corpo |
| Utilitária | **Chivo Mono** | Omnibus-Type · SIL OFL | estado técnico, dado, label |

**Condição 2 resolvida em 2026-08-04**, por teste em aparelho real contra quatro candidatos.
Melodrama era a aprovada em princípio e **perdeu**: a ressalva do cliente do projeto — de que
um serif de moda brigaria com o conceito de pixel/técnico — se confirmou no aparelho.

Zodiak mantém a tese da direção (haste de contraste alto em âmbar sobre preto lendo como pixel
de LED aceso) com terminais mais duros e menos registro editorial. Sobrevive ao estado técnico
sem desmenti-lo.

O display continua atrás do token **`--font-display`**. A direção sobrevive à troca do display;
se algo mudar, é uma linha.

- Escala: `12 · 14 · 16 · 19 · 24 · 32 · 44 · 64 · 96`
- Pesos permitidos: 400 e 700. Nada entre.

**Vetados como display:** Inter, Poppins, Montserrat (defaults de IA) e Roboto (a do site antigo).

---

## Espaçamento

Base **4px**. Escala: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`.

Ritmo vertical entre seções: `96px` no mobile, `160px` acima de 1024px.
Alvo de toque mínimo: **44px**, sem exceção.

---

## Motion

**Teto de 60 KB suspenso pelo cliente do projeto em 2026-08-04** ("pode esquecer esse trem
de teto, vamos fazer negócio bonito"), para usar os componentes de `melhorias/`.

Orçamento real hoje, medido: **gsap 28,0 KB + framer-motion 49,3 KB ≈ 77 KB gzipped**, contra
o teto original de 60 KB. First Load JS da página: **189 KB**.

Para comparar: o site antigo entregava **4.516 KB em 77 requisições**. A decisão é defensável,
mas está registrada como decisão, não como acidente — e se um dia o LCP em 4G reprovar, é aqui
que se corta primeiro.

- Durações: `160ms` micro · `320ms` reveal · `400ms` o beat de blackout
- Curvas: `linear()` — já é Baseline, custo zero. Nada de `ease-in-out` padrão.
- Animar **só** `transform` e `opacity`. Nunca `width`, `height`, `top`, `left`.
- Tudo dentro de `@media (prefers-reduced-motion: reduce)` com fallback **estático real**
- **Um momento orquestrado > oito efeitos espalhados.** A página tem um: o beat de blackout.

**Vetados:** AOS, Locomotive Scroll, e **Lenis** — `syncTouch` é `false` por padrão, então ele
não faz nada em touch, e seu CSS zera `pointer-events` de iframe, o que quebraria os 10
players de YouTube. Ver `pesquisa/02-motion.md`.

---

## Voz

Português brasileiro do interior de Minas. Direto, sem jargão de agência.

**Proibido:** "soluções" · "experiências inesquecíveis" · "excelência" · "transforme seu
evento" · "momentos únicos" · "parceira ideal" · "conte conosco" · "alta qualidade" ·
"profissionalismo" · "atendimento personalizado". Todos vieram do site antigo.

**Botão diz o que acontece:** "Falar no WhatsApp", nunca "Saiba mais".

**Quem está do outro lado, em ordem:**
1. **Mãe de debutante** — decide e paga. Escreva para ela.
2. **Noiva** — decide. Teme que a luz estrague a foto.
3. **Produtora / casa de show / prefeitura** — quer rider, não emoção. Entra pelo estado técnico.

## Fatos — nada fora desta lista

| Dado | Valor |
|---|---|
| Tempo de mercado | **"quase 30 anos"** — nunca "25+", nunca um ano específico |
| Artistas atendidos | **116** |
| Serviços | **13** |
| Cidades provadas | Uberlândia, Araguari, Tiradentes (MG) |
| Locais provados | Palácio de Cristal, Clube Pica Pau |
| WhatsApp | `5534991990994` — **não alterar** |
| E-mail | `vendas@rapasound.com.br` · Fixo `(34) 3231-0632` |

Qualquer outro número é invenção. Ver `PENDENCIAS.md`.

## Conteúdo

**Nenhum texto dentro de imagem.** Foi o pior defeito do site antigo. Título, descrição e nome
de artista são texto real, sempre. Toda imagem informativa leva `alt` descritivo.

Nenhuma cor ou tamanho hardcoded no JSX — tudo pelos tokens em `@theme`.
