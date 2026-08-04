# BRIEFING — Landing page Rapa Sound (React, do zero)

> **Uso:** salve na raiz do projeto, abra o Claude Code na pasta e cole:
> `Leia BRIEFING-RAPASOUND.md por completo. Comece pela Fase 0 e me mostre o INVENTARIO.md antes de continuar.`

---

## 1. O projeto

Reconstruir do zero, em React, a **landing page única** da Rapa Sound. Todo o conteúdo vem do site atual — o trabalho é **visual**, não editorial. Não invente serviços, não invente números, não invente depoimentos.

**Cliente:** Rapa Sound — Uberlândia/MG. Sonorização, iluminação e efeitos especiais para eventos sociais. 25+ anos de mercado.

**Público:** noivas e noivos, debutantes e mães de debutantes, RH e marketing de empresas. A maioria chega pelo **link na bio do Instagram** — a URL de origem trazia `utm_source=ig&utm_content=link_in_bio`. Ou seja: **mobile não é um breakpoint, é o produto.** Projete o mobile primeiro; o desktop é a adaptação.

**Conversão:** um único destino — WhatsApp.

```
+55 34 99199-0994  →  https://wa.me/5534991990994
```

**Dados já verificados** (confirme contra o site na Fase 0):

| | |
|---|---|
| E-mails | vendas@rapasound.com.br · atendimento@rapasound.com.br |
| Fixo | (34) 3231-0632 |
| Endereço A | Av. Maria Silva Garcia, 575 — Sala 603 — Granja Marileusa — 38406-634 |
| Endereço B | Rua Antônio Crescêncio, 310 — Bom Jesus — 38400-636 |
| Redes | Instagram @rapasound · Facebook /rapasoundoficial · YouTube @RapaSound |

⚠️ Os dois endereços aparecem em lugares diferentes do material atual. **Pergunte ao cliente qual é o válido** antes de publicar — endereço errado quebra Google Business Profile e schema.

---

## FASE 0 — Ir ao site e extrair tudo

O site bloqueia crawler simples. **Abra num navegador de verdade** (Playwright MCP ou Chrome DevTools MCP — ver Fase 2) e leia o DOM renderizado. Se ainda assim bloquear, baixe o HTML via `curl` com User-Agent de browser.

Produza `INVENTARIO.md` com:

1. **Todo o texto da página**, na ordem em que aparece. Literal.
2. **A lista de artistas/cantores** que a página exibe — nomes exatos, grafia exata, e qualquer foto ou logo associada. Essa é a prova social mais forte que eles têm e vai virar uma seção própria.
3. **Todas as imagens e vídeos** de eventos reais: baixe, catalogue por tipo de evento (casamento / 15 anos / formatura / corporativo), anote resolução e quais prestam para hero.
4. **Todos os contatos** que estiverem no HTML: telefones, e-mails, endereços, CNPJ, links `wa.me`, redes sociais.
5. **Serviços listados**, com a descrição atual de cada um.
6. **Números reais** que a página use (anos de mercado, eventos realizados, etc.) — só use no site novo o que estiver ali.
7. **Diagnóstico:** screenshot mobile e desktop + Lighthouse mobile (LCP, INP, CLS, peso). É a sua linha de base para provar a melhoria no fim.
8. **Outras URLs** do domínio que existam (ex.: `/area-instagramavel/`) — decidir com o cliente se viram âncora nesta página ou se ficam de fora.

**Pare aqui e me mostre o `INVENTARIO.md`.** Não escreva código antes disso.

---

## FASE 1 — Quatro subagentes de pesquisa, em paralelo

Crie em `.claude/agents/` e dispare os quatro de uma vez. Cada um roda em contexto isolado e devolve só o relatório, o que mantém a sua janela limpa para a implementação. Saída em `pesquisa/`.

### `pesquisa-referencias.md`
```markdown
---
name: pesquisa-referencias
description: Pesquisa referências visuais reais de sites de produção de eventos, AV, iluminação cênica, casamentos e casas de show. Use na definição de direção de arte.
tools: WebSearch, WebFetch, Write
---
Você é diretor de arte. Encontre 12–15 sites REAIS e atuais (2025–2026) de produtoras de
evento, empresas de som e luz, rental houses de AV, cerimonialistas e fotógrafos de casamento
premium, e casas de show. Fontes: Awwwards, Godly, Land-book, SiteInspire, Httpster,
One Page Love, Minimal Gallery. Pelo menos 4 brasileiros. Foque em LANDING PAGES ÚNICAS.

Para cada: URL, o que faz de específico, tipografia, paleta em hex, como trata FOTO DE
EVENTO (o ativo central desse setor), como resolve prova social, e qual o elemento assinatura.

Entregue 3 direções de arte possíveis para a Rapa Sound — cada uma com 5 hex, par
tipográfico display+texto, e elemento assinatura. Para cada direção, explique por que ela
NÃO é o default que qualquer IA produziria.

Saída: pesquisa/01-referencias.md
```

### `pesquisa-motion.md`
```markdown
---
name: pesquisa-motion
description: Valida na documentação oficial as versões, APIs e custo de bibliotecas de animação web. Use antes de instalar qualquer lib de motion.
tools: WebSearch, WebFetch, Write
---
Valide na documentação OFICIAL (não em blog) versão atual, peso gzipped, import correto em
2026, licença e armadilhas de: GSAP + ScrollTrigger, Lenis, Motion (ex-Framer Motion),
Anime.js v4, Trig.js, Lottie, Rive, e o nativo de CSS (animation-timeline/scroll(),
View Transitions API, easing linear()).

Confirme especificamente:
(a) estado atual da licença do GSAP;
(b) se Lenis quebra position:sticky;
(c) o que quebra em React Server Components / Next.js App Router;
(d) padrão correto de "use client" para GSAP e ScrollTrigger.

Entregue a stack mínima para uma landing page pesada em foto, com orçamento em KB e o
padrão de prefers-reduced-motion de cada lib.

Saída: pesquisa/02-motion.md
```

### `pesquisa-conversao-seo.md`
```markdown
---
name: pesquisa-conversao-seo
description: Pesquisa SEO local, schema, Core Web Vitals, LGPD e padrões de conversão via WhatsApp para prestador de serviço em cidade do interior. Use na fase de pesquisa.
tools: WebSearch, WebFetch, Write
---
Aplicado a uma empresa de sonorização e iluminação de eventos em Uberlândia/MG:
1. SEO local 2026 numa página única: Google Business Profile, schema LocalBusiness +
   Service + FAQPage, seções âncora vs páginas separadas, sinais de proximidade.
2. Metas atuais de LCP, INP e CLS, e o que mais as destrói em página com muita foto e vídeo.
3. Conversão por WhatsApp: link wa.me com texto pré-preenchido por serviço, posição do botão
   flutuante sem cobrir conteúdo no mobile, WhatsApp direto vs formulário longo.
4. LGPD: cookie banner, política de privacidade, consentimento.
5. Objeções reais de noivas e mães de debutantes antes de fechar som e luz — o que elas
   perguntam, o que as faz desistir. Isso vira o FAQ.

Saída: pesquisa/03-conversao-seo.md
```

### `auditor-visual.md`
```markdown
---
name: auditor-visual
description: Audita interface pronta contra checklist anti-genérico, acessibilidade e performance. Use DEPOIS de construir, nunca antes.
tools: Read, Glob, Grep, Bash, WebFetch
---
Você é um crítico severo e não bajulador. Reprova sem cerimônia.

ANTI-GENÉRICO — reprove se houver: gradiente roxo/violeta; Inter, Poppins ou Montserrat como
display; grid de 4 cards ícone+título+parágrafo; hero centralizado com dois botões lado a
lado; creme #F4F1EA + serifada + terracota #D97757; preto com um acento verde-ácido;
numeração 01/02/03 em conteúdo que não é sequência; foto de banco de imagens; frase tipo
"transforme seu evento em uma experiência inesquecível"; emoji em heading; border-radius
idêntico em tudo; sombra padrão do Tailwind em card.

ACESSIBILIDADE: contraste AA, foco visível, ordem de tabulação, alt em imagem informativa,
headings em ordem, prefers-reduced-motion honrado, alvo de toque ≥44px.

PERFORMANCE: peso total, formato de imagem, fonte com preload e font-display, JS bloqueante,
CLS por imagem sem width/height.

Relatório com severidade (bloqueante / grave / ajuste) e arquivo:linha. Não elogie.
Se algo estiver bom, omita.
```

---

## FASE 2 — Skills e ferramentas ("deixar a Claude sensacional")

### Dê olhos a ela — isto é o de maior impacto
Por padrão o Claude Code **não vê** o que constrói; ele escreve CSS às cegas. Conecte pelo menos um:

- **Playwright MCP** — navega, clica, tira screenshot, lê o DOM renderizado. Serve também para vencer o bloqueio do site na Fase 0.
- **Chrome DevTools MCP** — console, rede, profiling de performance.

Sem isso, nenhuma skill de design compensa. Com isso, ela consegue olhar o próprio resultado e se corrigir.

### Skills de primeira mão da Anthropic
Rode `/plugin` e `/skills` para ver o que já está disponível. Do repositório oficial `anthropics/skills`, as relevantes aqui:

| Skill | Para quê |
|---|---|
| **frontend-design** | A principal. Força decisões visuais deliberadas em vez do output mediano. Instala também como plugin oficial. |
| **webapp-testing** | Dirige um browser real para validar a página pronta. |
| **theme-factory** | Paletas e tipografia com critério profissional. |
| **skill-creator** | Para gerar as duas skills customizadas abaixo. |

⚠️ **Cuidado com skill de terceiro.** Pesquisa da Snyk encontrou prompt injection numa fatia significativa das skills da comunidade. Leia o `SKILL.md` e qualquer script incluso antes de instalar — trate como qualquer código de terceiro que você roda na sua máquina.

### Duas skills customizadas do projeto
Crie em `.claude/skills/`. Diferente do `CLAUDE.md`, skills carregam só quando a tarefa combina — não gastam contexto toda sessão.

**`.claude/skills/identidade-rapasound/SKILL.md`**
```markdown
---
name: identidade-rapasound
description: Sistema de design da Rapa Sound — tokens de cor, tipografia, escala, espaçamento, motion e voz. Use SEMPRE que escrever ou editar CSS, componentes React ou copy deste projeto.
---
# Identidade Rapa Sound

[Preencher na Fase 3, depois da direção de arte aprovada. Antes disso a skill fica vazia
de propósito — não invente tokens.]

## Cor
5–6 hex nomeados. Nada fora desta lista. Nenhum gradiente que não esteja aqui.

## Tipografia
Display: ___ (uso restrito a H1 e H2)
Texto: ___
Utilitária: ___ (legenda, dado, label)
Escala: ___ · Pesos permitidos: ___

## Espaçamento
Base ___px. Ritmo vertical entre seções: ___

## Motion
Durações: ___ · Curvas: ___ · Tudo com fallback em prefers-reduced-motion: reduce

## Assinatura
___ (o UM elemento pelo qual a página será lembrada — não repetir em outro lugar)

## Voz
Português brasileiro do interior de Minas. Direto, sem jargão de agência.
Proibido: "soluções", "experiências inesquecíveis", "excelência", "transforme seu evento",
"momentos únicos", "parceira ideal", "conte conosco".
Botão diz o que acontece: "Falar no WhatsApp", nunca "Saiba mais".
```

**`.claude/skills/revisao-antigenerica/SKILL.md`**
```markdown
---
name: revisao-antigenerica
description: Checklist final para garantir que a interface não pareça gerada por IA. Use antes de dar qualquer entrega por concluída.
---
Responda por escrito antes de entregar:
1. Se este mesmo layout servisse para uma pizzaria, uma clínica ou uma startup, ele está
   genérico. Refaça.
2. Qual é o elemento assinatura? Se não sei apontar um, não existe.
3. Onde está a foto real de um evento da Rapa Sound acima da dobra?
4. O que eu removi? (Regra Chanel: tire um acessório antes de sair.)
5. Alguma frase da copy eu já li em outro site esta semana?
6. Cada animação significa alguma coisa, ou é enfeite? Excesso de animação é o sinal mais
   óbvio de página feita por IA. Corte.
```

---

## FASE 3 — Direção de arte (planejar antes de codar)

Leia os três relatórios. **Não abra editor de código ainda.** Escreva um plano:

- **Paleta:** 5–6 hex nomeados
- **Tipografia:** display + texto + utilitária, com justificativa de por que essas
- **Layout:** conceito em uma frase + wireframe ASCII, mobile e desktop
- **Assinatura:** o único elemento memorável

Depois **critique o próprio plano**: se alguma parte é o que sairia por default para qualquer cliente, troque e diga o que trocou. Só então codifique — e siga o plano à risca.

### De onde tirar a linguagem visual
O mundo do cliente é palco: moving head, feixe no haze, gobo, blackout antes da entrada da noiva, contraluz, mesa de som, fader, VU meter, forma de onda. **É aí** que mora a identidade — não em card com ícone de estrela.

Gaste ousadia em **um** lugar só. O resto fica quieto e disciplinado.

### Os defaults de IA em 2026 — não caia neles
1. Gradiente roxo → azul
2. Inter em tudo + quatro cards em grid + hover discreto
3. Creme #F4F1EA + serifada de alto contraste + terracota #D97757
4. Preto + um acento verde-ácido
5. Layout de jornal, filete fino, zero border-radius
6. Foto de banco de imagens de gente brindando

Cada um é legítimo em algum brief. O problema é que aparecem **independente do brief**.

---

## FASE 4 — Implementação

### Stack base

**Next.js (App Router) com `output: 'export'`.** É React, e gera HTML estático de verdade — o que importa porque metade da aquisição deles é busca local ("sonorização Uberlândia"), e SPA de Vite entrega HTML vazio para o Google. Hospeda em qualquer lugar, inclusive no host atual.

*Alternativa aceitável:* Vite + React, **se** você adicionar prerender. Sem prerender, não.

- **Tailwind v4** com os tokens da skill `identidade-rapasound` declarados em `@theme`. Nenhuma cor ou tamanho hardcoded no JSX.
- **TypeScript.**
- Componentes por seção, um arquivo cada.

### Stack de motion
Confirme versões com `pesquisa/02-motion.md` antes de instalar.

| Camada | Lib | Papel |
|---|---|---|
| Rolagem | **Lenis** (~3KB) | Inércia. Maior impacto percebido por menor custo. Não quebra `position: sticky` |
| Sequências | **GSAP + ScrollTrigger** | Timeline do hero, reveals encadeados, SVG. Precisa de `"use client"` |
| UI React | **Motion** (ex-Framer Motion) | Enter/exit, lightbox da galeria, transições |
| Nativo | `animation-timeline`, View Transitions, `linear()` | Custo zero — prefira sempre que resolver |

**Vetados:** AOS (quebra em React Server Components) e Locomotive Scroll (altera a origem do DOM e quebra sticky). O setor migrou para Lenis.

**Regras rígidas:**
- Tudo dentro de `@media (prefers-reduced-motion: reduce)` com fallback estático real
- Animar só `transform` e `opacity` — nunca `width`, `height`, `top`, `left`
- Um momento orquestrado > oito efeitos espalhados
- Teto de **60KB gzipped** de JS de animação. Estourou, corta a lib, não o conteúdo

### Estrutura da página
Seções em âncora, com nav fixa curta no mobile:

1. **Hero** — foto ou vídeo real de evento deles. A prova de uma empresa de luz é visual e o acervo já existe. Sem banco de imagens.
2. **Serviços** — som, luz, efeitos especiais. Descrição real, extraída do site.
3. **Tipos de evento** — casamento, 15 anos, formatura, corporativo. Cada um com CTA de WhatsApp com texto pré-preenchido diferente.
4. **Artistas / cantores** — a lista extraída na Fase 0. Trate com peso: é o argumento mais forte que eles têm e provavelmente está subaproveitado hoje.
5. **Galeria** — filtrada por tipo de evento, com lazy loading e lightbox.
6. **Sobre / 25 anos** — a história real.
7. **Depoimentos** — com nome, foto e tipo de evento. Depoimento anônimo não converte.
8. **FAQ** — construído sobre as objeções reais do relatório 03. Com schema `FAQPage`.
9. **Contato** — WhatsApp em destaque, e-mail, fixo, endereço, mapa, redes.

### WhatsApp
Use `https://wa.me/5534991990994` — **não altere o número**.

Texto pré-preenchido por seção, ex.:
```
?text=Oi!%20Quero%20orçamento%20de%20som%20e%20luz%20para%20casamento.
?text=Oi!%20Quero%20orçamento%20para%20festa%20de%2015%20anos.
?text=Oi!%20Quero%20orçamento%20para%20evento%20corporativo.
```
A pessoa já chega dizendo o que quer e o atendimento responde melhor.

Botão flutuante: `aria-label` descritivo, alvo ≥44px, `rel="noopener"`, sem cobrir conteúdo no mobile, evento de clique rastreado.

### Qualidade base
Responsivo até 320px · foco de teclado visível · contraste AA · imagens AVIF/WebP com `width`/`height` declarados · fontes com `preload` e `font-display: swap` · LCP < 2,5s em 4G · schema `LocalBusiness` + `Service` + `FAQPage` · `alt` descritivo em toda foto · Open Graph com foto real (o tráfego vem de link na bio — o preview importa) · cookie banner e política de privacidade (LGPD).

---

## FASE 5 — Auditoria

1. Rode o subagente `auditor-visual`.
2. Rode a skill `revisao-antigenerica` e responda as 6 perguntas por escrito.
3. Lighthouse mobile contra a linha de base da Fase 0 — mostre antes/depois com números.
4. Screenshots lado a lado, mobile e desktop.
5. Teste o link de WhatsApp de cada seção num celular real.
6. Corrija tudo **bloqueante** e **grave**.
7. Liste o que ficou pendente de decisão do cliente: endereço correto, fotos a substituir, textos a revisar, depoimentos a coletar.