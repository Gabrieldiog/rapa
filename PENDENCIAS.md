# PENDÊNCIAS — aguardando decisão do cliente

Nenhum item aqui trava o trabalho. Cada um tem um **valor assumido** que está em uso no
projeto e marcado no código com `// PENDENTE:`. Quando o cliente responder, procure pela
tag e troque.

Status: `🔴 bloqueia publicação` · `🟡 troca fácil` · `🟢 só melhora`

---

## 🔴 P1 — Qual é o endereço válido?

**Assumido:** `Av. Maria Silva Garcia, 575 — Sala 603 — Granja Marileusa — 38406-634 — Uberlândia/MG`

**Por quê.** Não foi chute. Cruzando o endereço de cada página com a data de última
modificação no sitemap, a correlação é perfeita:

| Endereço | Páginas | Última modificação |
|---|---|---|
| Granja Marileusa | home, sonorizacaopalco, emocoes-casamento, emocoes-15-anos, iluminacao-cenica, tubos-de-led | **todas em abril/2026** |
| Bom Jesus | area-instagramavel, criacao-de-conteudo, efeitos-especiais, iluminacao-pista, painel-de-led, pista-de-led, projetos-3d, tunel-de-led | **todas em fevereiro/2026** |

Toda página tocada em abril diz Granja Marileusa. Toda página parada desde fevereiro diz Bom
Jesus. O padrão é de uma **mudança de endereço em curso**, atualizada página a página e
interrompida no meio.

**Confirmar:** Granja Marileusa é o endereço atual? E o da Rua Antônio Crescêncio — virou
galpão, foi desativado, ou os dois funcionam?
**Impacto se errado:** Google Business Profile e schema `LocalBusiness` apontando para o lugar
errado. É o pior erro possível para SEO local.

---

## 🔴 P2 — Qual é o CNPJ?

**Assumido:** nenhum. O campo fica fora do schema até o cliente informar.

Não aparece em nenhuma das 14 páginas. É necessário para o `LocalBusiness` completo e é
exigido na política de privacidade (a LGPD pede a identificação do controlador dos dados).

---

## 🔴 P3 — Consentimento e política de privacidade

**Assumido:** a nova página nasce com cookie banner e Consent Mode v2 — nenhum pixel dispara
antes do aceite. Texto da política a redigir sobre um modelo, com os dados que faltam
marcados.

O site atual dispara Meta Pixel (`1037241428673660`), GTM (`GTM-P3J5DF42`) e Google Tag
(`AW-17926727806`) **sem banner e sem política**. Isso é exposição real, não formalidade.

**Confirmar:** quem é o responsável pelos dados e qual e-mail recebe pedido de titular?
Manter os três rastreadores ou só o que é usado de fato?

---

## 🟡 P4 — "Quase 30 anos" — qual o ano de fundação?

**Assumido:** a expressão literal do site, **"quase 30 anos"**. Sem ano, sem "desde 19xx",
sem "25+".

Um ano de fundação real permite trocar por "desde 1996" — mais concreto e melhor para o
schema `foundingDate`. Enquanto não vier, fica a frase do próprio cliente.

⚠️ O briefing dizia "25+ anos". O site diz "quase 30", duas vezes. **O site venceu.**

---

## 🟡 P5 — Existem os originais das fotos?

**Assumido:** não. A direção de arte é feita para funcionar com o que existe — as 8 fotos do
carrossel em 1033×690.

Isso **restringe o hero**: 1033px não sustenta uma foto sangrada em tela de 1440px+ sem
suavizar. A saída projetada é usar a foto em recorte contido, com a composição resolvendo o
resto, em vez de esticar o arquivo.

O prefixo `AnyConv.com__` nos nomes indica conversão por ferramenta web — quase certamente
existe um JPG maior no computador de alguém. **Vale muito perguntar.** É o item desta lista
com maior retorno visual.

---

## 🟡 P6 — Faltam depoimentos de casamento e de corporativo

**Assumido:** usar os 4 que existem, todos de 15 anos, com nome real. E deixar isso reforçar
a hierarquia corrigida — 15 anos primeiro.

Os 4 depoimentos em vídeo são de debutantes e mães de debutante. Não há um único de casamento
nem de corporativo. Para o público de casamento, a prova social fica sendo foto e vídeo de
evento, não depoimento.

**Pedir:** um depoimento de noiva e um de contratante corporativo. Dois vídeos de celular
resolvem.

---

## 🟡 P7 — A imagem gerada por IA sai?

**Assumido:** **sai.** Não vai para o site novo.

O card de *Emoções Casamento* foi trocado em março/2026 por uma imagem gerada pelo Gemini
(`Gemini_Generated_Image_vo3t48vo3t48vo3t-Editado.png`), com o nome do gerador ainda exposto na
URL pública. É o maior arquivo do site — 747 KB — e ocupa o lugar do serviço mais importante,
numa empresa que tem acervo fotográfico real. Manter contraria a regra do briefing (foto real
de evento deles, sem banco de imagens) e enfraquece justamente onde precisa ser mais forte.

---

## 🟡 P8 — A assinatura "Desenvolvido por: Oliveira" permanece?

**Assumido:** **não migra.**

O link dela aponta para `wa.me/5534996528844` — WhatsApp da agência, não do cliente. Se
permanecer no site novo, um visitante que clicar ali cai no atendimento de outra empresa.

Se houver acordo contratual que obrigue o crédito, informe: ele volta, mas como texto, sem
imagem invisível e sem link de WhatsApp concorrente.

---

## 🟢 P9 — `atendimento@rapasound.com.br` ainda existe?

**Assumido:** não. Só `vendas@rapasound.com.br` vai para o site.

O briefing cita os dois; o site publica só `vendas@`. Publicar um e-mail morto é pior que
publicar um só.

---

## 🟢 P10 — Há vídeo de portfólio mais recente que o de 2022?

**Assumido:** usar o de 2022, **sem exibir o ano**. O título no YouTube é
"RAPA SOUND - PORTFÓLIO 2022", mas na página ele entra sem a data.

Os vídeos de evento individuais não têm data no título e envelhecem melhor. Um portfólio
2025/2026 seria o ideal.

---

## 🟢 P11 — Horário de atendimento e área de cobertura

**Assumido:** `openingHours` fica fora do schema. A área de cobertura cita **só o que está
provado**: Uberlândia, Araguari e Tiradentes (MG) — as três cidades que aparecem nos títulos
dos vídeos do próprio cliente.

Chama atenção que Tiradentes fica a ~400 km de Uberlândia: eles atendem fora da região. Isso
é argumento de venda, mas não dá para afirmar "atendemos todo o estado" sem confirmação.

**Confirmar:** horário comercial, e até onde vão sem custo extra de deslocamento.

---

## 🔴 P12 — O FAQ promete coisas que o cliente ainda não confirmou

**Assumido:** as respostas estão no ar em `lib/conteudo.ts`, cada uma marcada com
`confirmar: true`. **Não publicar antes do aceite do cliente.**

A pesquisa levantou as objeções reais em fóruns e blogs do setor, e redigiu respostas com a
melhor prática. O problema é que essas respostas **afirmam compromissos operacionais da Rapa
Sound que vieram de norma do setor, não do cliente**:

| Resposta afirma | Precisa confirmar |
|---|---|
| "tem técnico nosso do início ao fim" | vocês deixam operador na festa inteira? |
| "levamos equipamento reserva — microfone, mesa e as peças críticas" | existe kit reserva? |
| "todo orçamento vem com a lista dos equipamentos, modelo e quantidade" | o orçamento é assim hoje? |
| "fazemos visita técnica no espaço" | é praxe? é cobrada? |
| "luz quente entre 2.700K e 3.200K nos momentos que vão para a foto" | é assim que vocês operam? |
| "mandamos o projeto de luz para o seu fotógrafo revisar" | topam fazer isso? |
| "som ambiente e pista com controle separado por setor" | o equipamento permite? |

Isso não é texto de marketing — **é promessa contratual**. Se o site diz que tem técnico a
festa inteira e não tem, o problema deixa de ser de copy.

As faixas de preço da pesquisa (R$ 2.500–7.000) **já removi** da resposta publicada: são médias
de mercado de outras praças e não valem como preço da Rapa Sound.

Duas perguntas não precisam de confirmação (`confirmar: false`) porque só usam fato já provado:
cobertura em Araguari e Tiradentes, e "quase 30 anos" com os 116 artistas.

---

---

## P13 · Apagar `public/__diag.html` antes de publicar

**Bloqueia publicação. Não bloqueia desenvolvimento.**

É uma ferramenta de auditoria, não faz parte do site. Ela existe porque o Chrome headless
**trava a janela em 500px de largura mínima**: pedir `--window-size=380` devolve
`innerWidth=500`, e o print sai um recorte de um render de 500px. Isso me fez ler estouro
horizontal onde não havia. Um iframe de mesma origem tem viewport próprio de verdade.

Ela mede, num viewport arbitrário: estouro horizontal real (tentando rolar, porque
`scrollWidth` dá falso positivo), quem passa da borda descontando quem tem ancestral que
recorta, alvos de toque abaixo de 44px, e elementos invisíveis separando os que esperam o
observer dos que são defeito. Com `?seek=` e `?vr=` dá para adiantar o relógio das animações,
que o `--virtual-time-budget` não faz.

Não expõe nada — é HTML e JS estáticos, sem dado nenhum. Mas um `__diag.html` no ar no site do
cliente é desleixo. **Apagar no PR de publicação.**

---

## P14 · A ficha técnica dos cards herói

**Não bloqueia publicação. Melhora muito se vier.**

Os dois cards de peso 1 — Sonorização e Painel de LED — têm espaço para uma ficha
técnica em monoespaçada, e é o único caso em que o rótulo pode ser primário. É o que
tira o card de "descrição genérica" e o põe em "quem entende, entende".

Hoje a ficha usa **fatos já provados**: 116 artistas, quase 30 anos, e as três praças.
Não inventei número de caixa nem de canal de mesa.

O que o cliente poderia confirmar, e que valeria mais:

| Card | Dado | Por que importa |
|---|---|---|
| **PA** | quantas caixas, quantos subs, quantos canais na mesa | produtor decide por isso |
| **PA** | potência total em watts | é a primeira pergunta de rider |
| **LED-P** | passo do painel (P2, P3, P4) e área máxima em m² | idem |
| **LED-F** | área da pista de LED em m² | a noiva pergunta o tamanho |
| **LED-TN** | comprimento do túnel em metros | idem |

Cinco números resolvem o vazio de dois cards e dão argumento B2B de graça.

---

## Decisões já tomadas (não são pendência)

| Tema | Decisão | Quem decidiu |
|---|---|---|
| Arquitetura | Página única + `301` de cada uma das 13 URLs para a âncora correspondente. Páginas de serviço enriquecidas ficam para a fase 2 do projeto. | cliente do projeto, 2026-08-04 |
| Escopo dos serviços | 13, não 3. Maioria é LED e cenografia. | inventário |
| Público | 15 anos > casamento > B2B | inventário |
| Tempo de mercado | "quase 30 anos" | inventário |
| Paleta | Derivada da luz âmbar das fotos do acervo. Não usar o `#FF6600` do tema Elementor. | cliente do projeto |
| Core Web Vitals | Adiado. Vira pendência da Fase 5. | cliente do projeto |
