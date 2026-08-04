# CORREÇÕES AO BRIEFING

O [bri.md](bri.md) original fica no repositório como registro histórico. **Onde este arquivo
contradiz o briefing, este arquivo vence.** As correções vieram do [INVENTARIO.md](INVENTARIO.md),
que mediu o site real, e de decisão do cliente do projeto em 2026-08-04.

Leia este arquivo antes do `bri.md`.

---

## 1. São 13 serviços, não 3

O briefing diz "som, luz e efeitos especiais". São treze, e **a maioria é LED e cenografia**:

Emoções 15 Anos · Emoções Casamento · Sonorização e Palco · Iluminação Pista ·
Iluminação Cênica · Painel de LED · Pista de LED · Área Instagramável · Criação de Conteúdo ·
Efeitos Especiais · Túnel de LED · Projetos 3D Personalizados · Tubos de LED

A Rapa Sound vende **ambiente visual** tanto quanto som. Isso muda a direção de arte, não só
a lista da seção de serviços. Uma identidade construída em torno de mesa de som, fader e VU
meter descreveria menos da metade da empresa.

## 2. "Quase 30 anos", nunca "25+"

O site diz "quase 30 anos de atuação", nas duas ocorrências. O briefing dizia 25+.
Nunca misturar os dois. Não inventar ano de fundação — ver [PENDENCIAS.md](PENDENCIAS.md) P4.

## 3. A paleta não é o `#FF6600` do Elementor

O laranja do site atual é hex de tema, chapado e sem origem. **Herdar a família âmbar: sim.
Copiar o hex: não.**

A cor deve ser derivada da luz que os equipamentos deles realmente produzem — os arcos de luz
âmbar ao fundo da foto de hero, o ember do tungstênio, o corte de contraluz, o feixe de moving
head atravessando haze. Temperatura de cor e gel de iluminação (CTO, amber, congo blue), não
swatch de framework.

## 4. A hierarquia de público está invertida no briefing

O briefing lista "noivas e noivos, debutantes e mães de debutantes, RH e marketing". A ordem
correta, por evidência do próprio acervo:

**1º — Festa de 15 anos.** 4 de 4 depoimentos em vídeo são de debutantes e mães de debutante.
3 de 5 vídeos de evento são de 15 anos. 32 DJs e MCs no rider. Não é uma empresa de casamento
que também faz debutante — é o contrário. Quem decide e quem paga costuma ser a **mãe**.

**2º — Casamento.** Forte, mas secundário. Decide a noiva.

**3º — B2B.** Produtora, casa de show, prefeitura, RH.

A hierarquia visual da página tem que refletir essa ordem.

## 5. O rider técnico é um argumento B2B que o site hoje desperdiça

"Rider técnico para artistas" + **116 nomes** — Bruno & Marrone, César Menotti & Fabiano,
Alexandre Pires, Raimundos, Biquini Cavadão, Só Pra Contrariar, entre outros — é prova social
de nível nacional. Hoje está trancada dentro de duas imagens PNG e não vende para ninguém.

A página nova precisa **prever um caminho para esse público**: uma entrada, uma âncora e um
CTA de WhatsApp próprios, com texto pré-preenchido diferente do de festa.

## 6. Arquitetura: página única + 301

**Decidido, não em aberto.** Página única, com `301` de cada uma das 13 URLs de serviço para a
âncora correspondente. As páginas atuais são thin content — título, uma linha, um botão — e
não rankeiam nada. Páginas de serviço enriquecidas ficam para a fase 2 do projeto.

## 7. As perguntas ao cliente não travam o trabalho

Cada uma está em [PENDENCIAS.md](PENDENCIAS.md) com um valor assumido em uso, marcado no
código com `// PENDENTE:`. Direção de arte não depende de CNPJ nem de endereço.

## 8. Core Web Vitals: adiado para a Fase 5

A linha de base de **peso** foi medida de verdade (4,41 MB / 77 requisições — ver
INVENTARIO.md §7). LCP, INP e CLS exigem navegador e ficam como pendência da Fase 5, junto com
os screenshots de antes/depois.

---

## O que continua valendo do briefing original

- Mobile é o produto, não um breakpoint. Tráfego vem do link na bio do Instagram.
- Conversão única: WhatsApp `5534991990994`. **Não alterar o número.**
- Next.js App Router com `output: 'export'`. Tailwind v4 com tokens em `@theme`. TypeScript.
- Teto de 60 KB gzipped de JS de animação. Animar só `transform` e `opacity`.
  `prefers-reduced-motion` com fallback estático real. AOS e Locomotive Scroll vetados.
- A lista de voz proibida: "soluções", "experiências inesquecíveis", "excelência",
  "transforme seu evento", "momentos únicos", "parceira ideal", "conte conosco".
  Botão diz o que acontece: "Falar no WhatsApp", nunca "Saiba mais".
- A lista de defaults de IA a evitar (§ "Os defaults de IA em 2026").
- Gaste ousadia em **um** lugar só.
- Nenhuma linha de CSS antes de uma direção de arte aprovada.
