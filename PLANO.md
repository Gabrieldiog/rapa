# Plano — rodada de melhorias

Ordenado do mais fácil ao mais difícil, como pedido. **Um PR por etapa**, você
verifica no localhost, aprova, e só então eu começo a próxima.

Data: 2026-08-05. Fonte dos pedidos: mensagem do cliente do projeto + as seis
telas em `melhorias/` (`inicio.png`, `cerds.png`, `pessoas.png`, `video.png`,
`equipe.png`, `algum.png`).

---

## Antes de tudo: quatro decisões que eu não posso tomar sozinho

### D1 · O estado técnico branco morre?

Você pediu o fundo do `back.md` **idêntico em todo o sistema**. Hoje metade da
página não tem fundo nenhum: é **branco puro**. É o "estado técnico" —
rider, 116 artistas, equipe, dúvidas, contato. É exatamente o que está feio na
`pessoas.png`.

O problema é que esse branco **é a assinatura aprovada da direção de arte**.
Está escrito em `IDENTIDADE.md`: *"a virada entre os dois estados é a coisa pela
qual a página será lembrada"*. Fundo igual em tudo mata a virada.

**Minha recomendação:** mata o branco, mantém os dois estados. O estado técnico
passa a se declarar por **tipografia e disciplina de cor** em vez de cor de
chão — monoespaçada, zero magenta, tubo branco, grade mais apertada. O fundo
fica idêntico em toda a página como você pediu, e a assinatura sobrevive.

Custo honesto: perde-se o soco visual do corte branco. Ganha-se coerência e
resolve-se a `pessoas.png`. Você viu a página; eu só tenho a teoria.

- [ ] **A** — mata o branco, assinatura vira tipografia *(recomendado)*
- [ ] **B** — mantém o branco só no rider, resto ganha o fundo
- [ ] **C** — mantém tudo como está, só melhora o rider

### D2 · A foto do hero sai?

Você pediu fundo do `back.md` + logo centralizado no topo. Hoje o topo é uma
**foto de trinta pessoas reais numa festa real** — é o ativo mais forte da
página inteira, e é prova, não decoração.

**Minha recomendação:** o logo e as partículas entram como você pediu, e a foto
**desce um bloco** em vez de sumir — vira a primeira coisa depois do topo. Você
ganha o topo limpo com a marca e não perde a prova.

- [ ] **A** — logo + partículas no topo, foto desce um bloco *(recomendado)*
- [ ] **B** — logo + partículas, foto sai de vez
- [ ] **C** — logo sobre a foto, partículas só no resto

### D3 · De onde vem o texto dos depoimentos?

As bolinhas em órbita precisam de texto. **Não existe uma linha de depoimento
escrito** em lugar nenhum — nem no site velho. São 4 vídeos do YouTube e mais
nada. O inventário já registrava isso.

**Eu não vou inventar depoimento de cliente.** Caminhos reais:

1. **Transcrever os 4 vídeos.** Todos têm legenda automática em português.
   Sai a fala real da pessoa, eu marco como `// PENDENTE` e o cliente confirma
   antes de publicar. *(recomendado)*
2. **Pedir ao cliente** avaliações escritas — Google, Instagram, WhatsApp.
3. **Trocar o conteúdo da órbita**: em vez de depoimento, as bolinhas são os
   **116 artistas**. Dado real, já transcrito, e é o argumento B2B mais forte
   que a empresa tem. Resolve a órbita e a `pessoas.png` de uma vez.

- [ ] **1** — transcrever os vídeos *(recomendado)*
- [ ] **2** — esperar o cliente mandar texto
- [ ] **3** — órbita de artistas em vez de depoimentos
- [ ] **1 + 3** — as duas coisas, em seções diferentes

### D4 · Posso instalar o `potrace`?

Para vetorizar o logo. Hoje ele é webp de **53 KB**; em SVG cairia para poucos
KB, ficaria nítido em qualquer tamanho, e — o que importa de verdade — **cada
segmento do VU meter vira um elemento animável**. A animação do LED passaria a
sair da marca em vez de sair de mim.

É `brew install potrace`. Ferramenta local, reversível, não toca no projeto.

- [ ] **Sim** *(recomendado)*
- [ ] **Não, usa o webp mesmo**

---

## As dez etapas

| # | Etapa | Por que está nessa posição |
|---|---|---|
| 0 | Fechar o que está solto | Nada novo. Trabalho já feito e não commitado. |
| 1 | Capas dos vídeos | Bug isolado, causa medida, 1 arquivo. |
| 2 | Logo no topo e na nav | Ativo pronto. Só posicionar. |
| 3 | Animação da palavra LED | ~20 linhas de CSS. Tem uma armadilha conhecida. |
| 4 | O fundo único em todo o sistema | Um canvas, mas mexe na estrutura da página. |
| 5 | Leque da equipe → carrossel | Componente inteiro reescrito. |
| 6 | Os 13 cards de serviço | Redesign. O maior pedido visual. |
| 7 | Rider e os 116 artistas | Redesign de uma parede de 116 nomes. |
| 8 | Efeitos de rolagem | Só depois que o layout parar de mudar. |
| 9 | Auditoria de responsividade | Varre tudo. Só faz sentido no fim. |
| 10 | Depoimentos em órbita | Travado no D3, e é o que exige mais cuidado. |

---

### 0 · Fechar o que está solto

Sem PR novo — entra no PR #4, que está aberto.

- Os nove achados da revisão adversarial de código, aplicados e verificados
  contra o build estático, ainda **não commitados**.
- A correção da foto do hero da revisão de design **não está no código**:
  `app/page.tsx:37` ainda tem `object-center opacity-45` sem gradiente. Perdida
  em algum momento. Reaplico.

---

### 1 · Capas dos vídeos  ·  `video.png`

**Causa medida, não suposta.** `maxresdefault.jpg` retorna **404 em 7 dos 10
vídeos** — inclusive no primeiro do filtro "tudo", que é o que você viu com
`...`. Confirmado por `curl` nos dez IDs.

O `onError` em `Palco.tsx:84` existe, mas o navegador desenha o ícone de imagem
quebrada antes de o fallback carregar. Em 4G isso dura segundos.

**O que faço:** baixo as 10 capas na melhor resolução que cada uma tem, converto
para webp, sirvo do próprio projeto. Some a requisição ao `i.ytimg.com`, some o
404, e eu passo a controlar o corte de cada capa.

Sobre "quando escolho casamento o primeiro já fica ali" — isso **já funciona**
(`Palco.tsx:37` faz `setI(0)` ao trocar de filtro). O que quebrava a impressão
era só a capa não carregar.

---

### 2 · Logo no topo e na nav  ·  `inicio.png`

Achei em `rapasound.com.br/wp-content/uploads/2024/09/`. 1427×733, webp com
transparência real. Testei composto sobre o `#09090B`: funciona, a sombra preta
some limpa no fundo.

**A descoberta que importa:** o "p" de *Rapa* é um **VU meter de segmentos
empilhados** — vermelho, laranja, amarelo, verde. A "coluna de pixels" que eu
tinha inventado como assinatura da direção **já estava na marca**. Vou
reescrever esse trecho do `IDENTIDADE.md`: a assinatura deixa de ser invenção
minha e passa a ser extração da marca.

Uma ressalva de cor: o logo traz quatro saturados que não estão na paleta. Um
logo não se recolore — mas na nav, em tamanho pequeno, vai a versão de uma cor
só. Prática normal de marca.

Depende de **D2** (foto sai ou desce) e **D4** (vetorizar ou não).

---

### 3 · Animação da palavra LED

Você pediu: *"pode ficar mudando da amarela pro preto, de uma forma fluida"*.

Preto sobre fundo preto some — então o que eu vou fazer é o que a frase
descreve de verdade: o âmbar **varre a palavra** e atrás dele as letras caem
para o escuro de um LED apagado. É literalmente o que um tubo de LED faz.

A infraestrutura já existe: `@property --led-varredura` e
`@keyframes led-varre` estão em `globals.css` e não estão ligados na palavra.

**Armadilha conhecida:** `background-clip: text` quebra dentro de contexto de
empilhamento (bug 1500148 do Chromium). Por isso o `<h1>` não pode entrar num
`Reveal` — já está comentado no código. Vou testar no Chrome e no Safari antes
de fechar.

---

### 4 · O fundo único em todo o sistema  ·  `pessoas.png`, `cerds.png`

Hoje o `Haze` roda em **uma seção só** (`page.tsx:186`) e é uma releitura minha
— âmbar, mais denso embaixo. Você tem razão: não é o que você mandou. Na
`cerds.png` ele aparece como rabisco fosco atrás dos cards.

**O que faço:** um único canvas `position: fixed` atrás da página inteira,
montado uma vez no layout, com os parâmetros do `back.md` — partícula branca,
alfa 0.07, rastro, ruído de Perlin. Idêntico em toda parte porque é literalmente
o mesmo canvas, não uma cópia por seção. E custa **um** canvas em vez de N.

As quatro correções que eu já tinha feito no original ficam, porque são bugs
reais dele e não estilo: o `rAF` nunca era cancelado; o `noise` era recriado a
cada render e estava nas dependências do `useEffect`, o que remontava em laço;
sem porta de `prefers-reduced-motion`; sem pausa fora da tela.

Depende de **D1**.

---

### 5 · Leque da equipe → carrossel  ·  `equipe.png`

Na sua foto: começa no meio, "aniel Souvile" cortado à esquerda, André Wink
cortado à direita, e não dá para chegar nos outros três.

**O que faço:** começa no primeiro, setas para os dois lados, os 6 alcançáveis,
`scroll-snap` nativo com `scroll-padding` para o primeiro e o último não
encostarem na borda. A seta desabilita no início e no fim.

Sobre *"deixe em uma cor mais sobre a rapa"*: hoje as fotos estão em cinza puro
— e cinza neutro puro está proibido no `IDENTIDADE.md`. Vou levar para o âmbar,
que é a cor que a regra dura manda usar perto de rosto.

Aguardando o agente de toque e carrossel.

---

### 6 · Os 13 cards de serviço  ·  `cerds.png`

*"esses cards estão horríveis"* e *"o som ficou sem nada de card"*.

Você está certo nas duas. Os três cards de LED são caixa escura com foto e
texto, sem hierarquia interna. E o Som virou linha de índice — o serviço que dá
nome à empresa não tem card.

Aguardando os dois agentes de card. O que já está decidido antes deles:

- **13 é primo.** Nenhuma grade de colunas iguais fecha sem órfão. A saída não é
  achar a grade certa, é parar de tratar os 13 como iguais.
- O Som **precisa** de presença. Um card sem foto não fica pobre se o que ocupa
  o lugar da foto for dado, número ou tipografia grande — é o que eu pedi ao
  agente para levantar com exemplo real.
- Efeito de mouse tem que ter contrapartida no toque, senão não existe para a
  maior parte do seu público.

`melhorias/cards.md` chegou com **0 byte** — vou pela pesquisa.

---

### 7 · Rider e os 116 artistas  ·  `pessoas.png`

*"o jeito que ta sobre as pessoas esta muito perdido"*. Concordo: 116 nomes
soltos em linha corrida não têm forma. Peso igual é peso nenhum.

Depende de **D1** e conversa direto com **D3** — se a órbita for de artistas,
essa seção e a de depoimentos viram a mesma peça.

---

### 8 · Efeitos de rolagem

*"quando a pessoa for passando para baixo as coisas vão aparecendo"*.

Vem depois de 4, 6 e 7 de propósito: animar layout que eu ainda vou refazer é
trabalho jogado fora.

Uma restrição que eu não abro mão, porque já tomei esse tombo: **o HTML não pode
nascer invisível**. Já teve uma versão em que 34 blocos eram servidos com
`opacity: 0` — em 4G a página ficava em branco por segundos, e se o JS falhasse
ficavam invisíveis para sempre. O que entrar aqui esconde depois de montar, ou
não esconde.

Aguardando o agente de rolagem.

---

### 9 · Auditoria de responsividade

Os 3 agentes vão voltar com muita coisa. Mas responsividade não é etapa no fim —
**cada PR das etapas 1 a 8 é verificado a 380px antes de eu te chamar**. Esta
etapa 9 é a varredura sistemática do que sobrar: checklist item a item, zoom de
texto a 200%, reflow a 320px, landscape, e o script que caça quem estoura a
largura.

---

### 10 · Depoimentos em órbita  ·  `algum.png`

`algum.png` é o **Orbiting Circles with Globe** do 21st.dev, do @shadcnspace —
uma cúpula de partículas com círculos orbitando em arcos concêntricos.
`melhorias/algumlugar.md` veio com **0 byte**, então mandei o agente atrás do
código na origem.

Está por último por três motivos: depende do **D3**, é o único item travado em
conteúdo que não existe, e você pediu com carinho — então ele merece a rodada
inteira de atenção, não as sobras.

Uma coisa que já sei que vou ter que resolver: texto que gira junto com a órbita
é ilegível, e depoimento é conteúdo — precisa estar no DOM e legível para leitor
de tela mesmo que a animação nunca rode. O agente está avaliando as duas saídas.

---

## O que eu faço a cada PR

1. Implemento a etapa inteira.
2. Verifico contra o build estático, não contra o dev server.
3. Testo a 380px.
4. Rodo a revisão adversarial — você pediu isso e continua valendo.
5. Te chamo com o link do PR e o que olhar.
6. Só começo a próxima depois do seu OK.
