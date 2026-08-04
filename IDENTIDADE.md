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

**Contraste conferido:** `--ambar` sobre `--void` = 11,4:1. `--branco` sobre `--void` = 16,8:1.
`--void` sobre `--ambar` (texto de botão) = 11,4:1. Todos passam AA e AAA.
⚠️ `--magenta` sobre `--void` dá 5,1:1 — passa AA para texto grande, **reprova para corpo**.
Magenta é ambiente, não texto. Ver a restrição dura.

---

## Assinatura — os dois estados

**Emenda 1 do cliente do projeto, 2026-08-04.** A coluna de pixels sozinha vivia no chrome e
sumiria no mobile — que é de onde vem quase todo o tráfego. Ela deixa de ser a assinatura e
passa a ser a **expressão** dela.

A assinatura é a **transição estrutural entre dois estados da página**:

| | `ESTADO FESTA` | `ESTADO TÉCNICO` |
|---|---|---|
| Cor | magenta (15 anos) · congo (casamento) | `--branco` puro, sem cor |
| O que mostra | foto sangrada, vídeo, emoção | rider, 116 artistas, sonorização, 30 anos |
| Tipografia | display | monoespaçada |
| Movimento | reveals | nenhum |
| Fala com | mãe de debutante, noiva | produtora, casa de show, prefeitura |

O LED vende a festa. O branco de trabalho vende os trinta anos. **A virada entre os dois é a
coisa pela qual a página será lembrada** — e é ela que resolve o buraco da sonorização, que
era o defeito real da direção.

A **coluna de pixels** — tira vertical de pontos discretos, com o espaçamento e a queda de
brilho de um tubo real — é como o estado se manifesta. Ela muda de cor na virada. Nunca é
decorativa e nunca é uma linha contínua.

⚠️ **Testar a assinatura a 380px de largura antes de fechar.** Se a virada não se lê num
aparelho estreito, ela não existe — porque é lá que o público está.

## O beat de blackout

**Emenda 2.** Um blackout curto, **~400 ms**, na entrada do hero ou antes da seção de artistas.
Um só na página inteira. Não toca na paleta.

É o único resquício da direção BLACKOUT: a direção morreu, o momento não.

---

## Tipografia

**Texto: Cabinet Grotesk** — Indian Type Foundry via Fontshare, gratuita para uso comercial.

**Display: 🔴 EM ABERTO — condição 2, bloqueante.**

Melodrama foi a proposta aprovada em princípio, com duas verificações pendentes:

1. A haste de contraste altíssimo sobre `--void` serrilha ou some em Android de baixa
   densidade? Verificação empírica, em aparelho real.
2. O serif de moda briga com o conceito de pixel/técnico? Melodrama tem registro
   editorial-fashion, e a página tem um estado técnico com peso igual.

**Se qualquer uma reprovar, o display muda e a direção não.** Por isso o display fica atrás
de **um único token** — `--font-display` — e a troca é uma linha.

- Utilitária: **monoespaçada**, do estado técnico. A definir junto com o display.
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

Teto: **60 KB gzipped** de JS de animação. O orçamento medido da stack é **~1,1 KB** — a folga
é para gastar em qualidade, não em quantidade.

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
