# 06 — Tipografia animada e sistema de títulos

Rapa Sound · direção TUBO · pesquisa de 2026-08-04
Tudo abaixo foi verificado abrindo a fonte. Onde não deu para fechar, está marcado ⚠️.
Dados de suporte vêm de `mdn/browser-compat-data` (JSON cru), `api.webstatus.dev` e caniuse —
**não** da tabela renderizada do MDN, que é montada no cliente e devolve números errados quando
raspada.

---

## 0. Resumo

**A palavra é `LED`.** Não porque emite luz. Porque é a **única palavra da linha que a restrição
dura autoriza a receber magenta**. Ver §1 — o argumento importa mais que a escolha.

**A técnica é** `@property` + `background-clip: text`, com uma banda âmbar→magenta→congo varrendo
as três letras. **Duas passadas e para** — nada de loop eterno, e por isso mesmo não precisa de
timeline de rolagem para se justificar (§3.3 explica por que a versão "ligada ao scroll", que
parecia mais sofisticada, era pior aqui). Custo medido: **478 bytes gzip de CSS, 0 byte de JS.**

**O sistema de títulos** passa a ter dois estados, como o resto da página: FESTA (Zodiak, uma
palavra com cor, marcador de pixel aceso) e TÉCNICO (Chivo Mono, branco, filete, número).

**Cinco correções**, todas verificadas:
1. `--magenta` sobre `--void` dá **4,17:1**, não 5,1:1 como diz o `IDENTIDADE.md` (§7).
2. `chivomono-400.woff2` e `chivomono-500.woff2` são **o mesmo arquivo** — MD5 idêntico (§7).
3. `text-wrap: balance` vale até **seis** linhas no Chromium, não quatro (§4.4).
4. O `-webkit-` de `background-clip` **não** é mais pelo Safari iOS (14+, 2020) — é pelo
   **Chrome abaixo de 120** e pelo Firefox (§2.1).
5. Detectar animação de rolagem só com `animation-timeline` **tem furo**: o Firefox Nightly passa
   no teste e não suporta `animation-range` (§3.2).

**Duas armadilhas que derrubariam a implementação**, e que não são óbvias:
- `will-change`, `transform`, `opacity` ou `position` no `.led` **fazem a palavra sumir** no
  Chrome — contexto de empilhamento quebra `background-clip: text` (§2.2).
- Um espaço **dentro** do `inline-block` de uma palavra impede a quebra de linha do título (§5).

---

## 1. Que palavra recebe a cor — e por quê

H1: **"Som, luz e LED para 15 anos e casamento"**

### A escolha: `LED`

Quatro argumentos, em ordem de força.

**1. É a única palavra que a restrição dura deixa colorir.** Este é o argumento decisivo e é o
único que não é estético.

> Magenta e congo colorem ambiente. Âmbar colore botão, dado e qualquer elemento próximo a um rosto.

- **`luz`** é o candidato óbvio e está **proibido**. Nesse negócio "luz" é o que cai no rosto da
  debutante. A página inteira argumenta que essa luz tem que ser âmbar, 2.700–3.200 K. Pintar a
  palavra *luz* de magenta contradiz, em cima do H1, exatamente a tese que responde à segunda
  maior objeção da compradora. Seria o site desmentindo o próprio argumento de venda.
- **`LED`** é permitido porque **um tubo de LED é o ambiente**. É a luminária que faz o magenta
  do salão às 22h. Magenta na palavra LED é a cor de ambiente fazendo o trabalho dela, não
  enfeite. A restrição não é contornada — é **demonstrada**.

Isso é o que separa esta escolha de uma questão de gosto: existe uma resposta certa, e ela **sai
da regra que a empresa já escreveu** — não da minha preferência.

**2. A palavra se autodemonstra.** Um LED muda de cor — é RGB, é o que ele faz. Uma palavra que
muda de cor *é* um LED. O efeito para de ser decoração e vira definição. Nenhuma outra palavra
da linha tem essa propriedade: som não muda de cor, casamento não muda de cor.

**3. Três letras caixa-alta = três pixels.** A direção é "LED é pixel, não lâmpada".
`L`, `E`, `D` em Zodiak a 96 px formam três blocos densos e separados. Com a banda de cor
varrendo na horizontal, **cada letra fica num estado diferente ao mesmo tempo** — é literalmente
um trecho de três pixels de um tubo em chase. A coluna de pixels da assinatura, deitada, dentro
do H1. Nenhuma outra palavra da frase é caixa-alta, então nenhuma outra vira bloco gráfico.

**4. É a palavra que diferencia.** Som e luz são commodity — todo concorrente em Uberlândia tem.
Cenografia de LED é o que a Rapa Sound vende que os outros não vendem. Destacar a commodity
seria gastar o único destaque da página no lugar errado.

**Bônus técnico:** três glifos são a menor área possível de repintura. Isso importa de verdade,
porque a técnica repinta (§4.4). A palavra certa esteticamente é também a mais barata.

### Por que não as outras

| Palavra | Veredito | Motivo |
|---|---|---|
| `luz` | **Proibida** | Magenta em "luz" contradiz a tese de 2.700 K. Ver acima. |
| `15` | Não | Âmbar já é a cor de número e dado. O sistema de sobretítulo (§3) usa numeral âmbar em "116 artistas", "13 serviços", "quase **30** anos". Colorir o 15 no H1 briga com esse sistema e ainda quebra o composto "15 anos" no meio. |
| `casamento` | Não | Palavra longa. Cor correndo por nove letras vira exatamente o "enfeite" que o briefing veta. E casamento é congo, cor de *uma seção* — não pode reivindicar o hero inteiro, onde a outra metade do negócio é 15 anos. |
| `Som` | Não | É o buraco que a direção já admitia ter. Mas som resolve-se com o **estado técnico** (rider, 116 artistas), não pintando a palavra. Som não tem cor — essa é a questão. |

### Consequência de marcação

```html
<h1 class="max-w-[16ch] text-3xl lg:text-4xl">
  Som, luz e <span class="led">LED</span> para 15&nbsp;anos e casamento
</h1>
```

O `<span>` não muda a semântica, não muda o texto acessível, não muda o SEO. O leitor de tela lê
a frase inteira, sem interrupção. Não usar `<em>` nem `<strong>`: a distinção é visual, não é
ênfase semântica.

---

## 2. A técnica — `@property` + `background-clip: text`

### 2.1 Suporte, verificado

**`@property`** — `mdn/browser-compat-data` `css/at-rules/property.json` e
`api.webstatus.dev/v1/features/registered-custom-properties`:

| | versão | data |
|---|---|---|
| Chrome / Edge | **85** | 2020-08-25 |
| Safari **e iOS Safari** | **16.4** | 2023-03-27 |
| Firefox | **128** | 2024-07-09 |

**Baseline "newly available" desde 2024-07-09.** Uso global 92,91% (caniuse). Vira "widely
available" só por volta de janeiro/2027 (a régua é 30 meses).
→ **Safari iOS suporta desde 16.4.** Não é problema.

**`background-clip: text`** — BCD `css/properties/background-clip.json`, subfeature `text`:

| | sem prefixo | observação |
|---|---|---|
| Safari / iOS Safari | **14** (2020-09-16) | antes disso só `-webkit-` |
| Chrome / Edge | **120** (2023-12-05) | **antes disso só `-webkit-`** |
| Firefox | 49, `partial_implementation: true` | web-features **não lista o Firefox**; caniuse diz que funciona com `-webkit-` |

**Baseline: `limited`** — não é Baseline, justamente por causa do Firefox.

> **Conclusão prática, e ela é o contrário do que se costuma dizer:** o `-webkit-` **não** é mais
> necessário para o Safari iOS (14+, setembro de 2020). Ele continua necessário para o **Chrome
> abaixo de 120** e para o **Firefox**. Mandar as duas declarações continua certo em 2026 — mas
> o motivo mudou de dono.

⚠️ Divergência não resolvida: caniuse só marca Safari como suporte pleno na **15.5**, não na 14,
por causa do bug de flex/grid (WebKit #169125). BCD e web-features dizem 14. As duas bases
discordam; nenhuma das duas leituras muda o código, porque mandamos o prefixo de qualquer jeito.

### 2.2 ⚠️ A armadilha que quebra tudo — contexto de empilhamento

caniuse, nota #1, aplicada ao Chrome **inclusive depois da 120**:

> "Doesn't work with a stacking context (e.g. `position: relative`), see Chromium bug 1500148"

Ou seja: se o elemento com `background-clip: text` criar um contexto de empilhamento, no Chrome
o recorte falha — e com `-webkit-text-fill-color: transparent` aplicado, **o texto some**.

**Regra dura para o `.led`:** nunca colocar no próprio `<span>`:
`position: relative/absolute` · `transform` · `opacity` menor que 1 · `filter` · `isolation` ·
`will-change` · `mix-blend-mode` · `contain: paint`.

Isso tem duas consequências concretas neste projeto:

1. **`will-change` está fora.** O reflexo de "é uma animação, bota `will-change`" aqui **quebra a
   feature**. Não promover a camada.
2. **O H1 não pode entrar num `<Reveal>`.** `.rev` aplica `opacity: 0` e `transform: translateY()`.
   Hoje o H1 do hero está fora do `Reveal` — está certo, e tem que continuar assim. Se um dia o
   `.led` for reaproveitado num H2, ele **não pode** ficar dentro de `Reveal`.
   (O H1 também não deve ter reveal por outro motivo: é candidato a LCP.)

`display: inline-block` é seguro — sozinho não cria contexto de empilhamento — e dá geometria
previsível ao gradiente, além de impedir que "LED" quebre no meio.

### 2.3 O código

Vai em `app/globals.css`. O `@property` fica **no topo do arquivo, fora de qualquer `@layer`**:
o registro é global e não participa de cascata em camadas.

```css
/* ============================================================
   A PALAVRA LED — a banda de cor varrendo tres pixels.
   Ambar nas duas pontas do ciclo: o tubo descansa aceso,
   nao apagado. Ver pesquisa/06-tipografia.md
   ============================================================ */
@property --led-varredura {
  syntax: "<percentage>";
  inherits: false;
  initial-value: -60%;   /* fora da palavra: comeca 100% ambar */
}

@keyframes led-varre {
  0%, 10%   { --led-varredura: -60%; }
  90%, 100% { --led-varredura: 160%; }
}
```

E dentro de `@layer components`:

```css
/* Base: ambar solido. Pinta sempre, em todo browser, sem depender
   de nada. E este o estado que o LCP mede. */
.led { color: var(--color-ambar); }

/* As DUAS condicoes no mesmo @supports, de proposito: se o
   `in oklab` nao fizer parse, o background-image inteiro cai e o
   -webkit-text-fill-color: transparent sozinho apagaria a palavra. */
@supports ((-webkit-background-clip: text) or (background-clip: text))
      and (background-image: linear-gradient(in oklab, red, blue)) {
  .led {
    display: inline-block;          /* NAO usar position/transform/will-change */
    background-image: linear-gradient(95deg in oklab,
      var(--color-ambar)   calc(var(--led-varredura) - 55%),
      var(--color-magenta) calc(var(--led-varredura) - 18%),
      color-mix(in oklab, var(--color-congo) 50%, var(--color-branco))
                           calc(var(--led-varredura) + 12%),
      var(--color-ambar)   calc(var(--led-varredura) + 50%));
    -webkit-background-clip: text;  /* Chrome < 120 e Firefox */
    background-clip: text;
    -webkit-text-fill-color: transparent;
    /* DUAS passadas e para. Nunca `infinite` — ver 2.7. */
    animation: led-varre 2400ms var(--ease-out-cut) 240ms 2 both;
  }
}

@media (prefers-reduced-motion: reduce) {
  .led {
    animation: none;
    background-image: none;
    -webkit-text-fill-color: var(--color-ambar);
  }
}

/* Windows High Contrast: o gradiente sai, a cor do sistema entra. */
@media (forced-colors: active) {
  .led { background-image: none; -webkit-text-fill-color: currentColor; }
}
```

**Validado** com o `lightningcss` que já está no `node_modules` do projeto: faz parse sem erro,
`@supports` aninhado é aceito. **1.120 bytes minificado · 478 bytes gzip · 0 byte de JS.**
Não encosta no teto de 60 KB, que é de JS.

> **Por que duas passadas e não `infinite`.** Um loop eterno repinta com o telefone parado na
> mesa (§2.7) — custo puro, benefício zero. Duas passadas de 2,4 s dão os ~5 s de "cor que vai
> mudando" no momento em que a pessoa está de fato olhando o hero, e depois o tubo **descansa
> aceso em âmbar**. É a resposta ao item 2 do briefing sem precisar de timeline de rolagem: o
> jeito de não ter animação eterna é **não fazer uma**.
>
> Isto é uma decisão de direção, não uma limitação. Se o cliente pedir o loop mesmo assim, trocar
> por `infinite` é uma palavra — mas aí o custo de bateria é real e fica registrado aqui.

### 2.4 Por que estes números de parada de gradiente

Os quatro stops andam junto com `--led-varredura`. A palavra ocupa 0%–100%. Conferido com script:

| `--led-varredura` | âmbar | magenta | congo | âmbar | resultado |
|---|---|---|---|---|---|
| **-60%** | -115 | -78 | -48 | -10 | **âmbar puro** |
| 0% | -55 | -18 | 12 | 50 | banda visível |
| 50% | -5 | 32 | 62 | 100 | banda visível |
| 100% | 45 | 82 | 112 | 150 | banda visível |
| **160%** | 105 | 142 | 172 | 210 | **âmbar puro** |

O intervalo tem que ser **-60% → 160%**. Minha primeira versão usava -20% → 140% e **estourava**:
em 140% a palavra estava toda âmbar, mas em -20% já havia magenta no terço esquerdo, então o
loop dava um salto visível ao reiniciar. Com -60%/160% as duas pontas são âmbar sólido e a
emenda é invisível.

Os `0%, 10%` e `90%, 100%` do `@keyframes` seguram a palavra em âmbar por 10% do ciclo em cada
ponta. O tubo **descansa aceso**, não apagado — combina com `.tubo-aceso` e evita a leitura de
pisca-pisca.

`95deg` faz a banda correr da esquerda para a direita com uma inclinação mínima: na direção da
leitura, e L/E/D pegam a cor em sequência.

### 2.5 Congo tem que ser levantado — senão a palavra some

Contraste calculado sobre `--void #09090B` (WCAG 2.x):

| token | hex | razão |
|---|---|---|
| `--ambar` | `#FFA300` | **9,94:1** |
| `--branco` | `#ECEDEF` | 16,98:1 |
| `--branco-2` | `#8E9199` | 6,31:1 |
| `--magenta` | `#D81E7E` | **4,17:1** ⚠️ (o `IDENTIDADE.md` diz 5,1:1 — está errado) |
| `--congo` | `#21105C` | **1,23:1 — ilegível** |

Congo puro em texto é invisível. **Nunca pode ser um stop.** A solução não é um truque, é física:

> A cor de catálogo de uma gelatina é a transmissão dela contra a luz. O **feixe** de uma Lee 181
> num LED branco em intensidade não é aquele violeta quase preto — é bem mais claro. `#21105C` é
> o *swatch*; o que a câmera vê no haze é o *feixe*.

`color-mix(in oklab, var(--color-congo) 50%, var(--color-branco))` ≈ `#867EA6` → **5,26:1**.
Continua lendo como Congo Blue e é o que o feixe realmente parece.

Pior ponto do ciclo: magenta puro, **4,17:1**. O H1 roda a 64–96 px, muito acima do corte de
texto grande (18,66 px em negrito), onde o mínimo AA é **3:1**. Passa com folga. Passaria até
o AA de texto normal (4,5:1)? Não — por 0,33. Por isso o `.led` **só existe no H1**. Em corpo
de texto, nunca.

### 2.6 LCP — por que isto não atrasa nada

O H1 é candidato a LCP. Três garantias:

1. **`color: var(--color-ambar)` está fora do `@supports`.** Todo browser pinta a palavra na
   primeira passada. O gradiente é acréscimo, nunca pré-condição.
2. **Nenhuma animação segura paint.** O `@keyframes` interpola uma cor; o glifo já está na tela
   no frame 1, em âmbar. O `animation-delay: 240ms` conta a partir de quando o estilo é aplicado
   ao elemento — que é depois de ele existir e ser pintado. E a animação **termina sozinha** em
   ~5 s. Em nenhum momento ela é pré-condição para o texto aparecer.
3. **Nenhum recurso novo.** Zero requisição, zero JS, zero fonte adicional. `.led` é CSS que já
   vem no bundle que já é crítico.

⚠️ O que **não** consegui verificar: se o Chrome mede um elemento de texto com
`-webkit-text-fill-color: transparent` como candidato a LCP normalmente. Não há fonte primária
sobre esse caso. **Mitigação já embutida:** como o `color` sólido está fora do `@supports`, mesmo
na pior hipótese o elemento tem cor computada real. Vale medir com WebPageTest depois de subir —
está anotado como pendência em §8.

### 2.7 ⚠️ A honestidade sobre "só transform e opacity"

Verificado em `web.dev/blog/at-property-performance` (Bramus, 2024-10-02), literal:

> "At the time of writing, **custom properties–registered or not–animate on the Main Thread.**"

E `web.dev/articles/stick-to-compositor-only-properties…`:

> "Today there are only two properties for which that is true - `transform`s and `opacity`"

**Então sim: esta técnica repinta, na main thread. Ela viola a regra do `IDENTIDADE.md` como
está escrita.** Não dá para maquiar. O que dá para fazer é dimensionar e escolher.

**O tamanho.** A área repintada é só o `<span>`, e ela é minúscula nos dois cenários:

| | H1 | caixa do "LED" | tela | fatia repintada |
|---|---|---|---|---|
| Celular 390×844 | ~45 px (§4.1) | ~84 × 45 px | 329.160 px² | **~1,1%** |
| Desktop 1440×900 | 96 px | ~179 × 96 px | 1.296.000 px² | **~1,3%** |

Cerca de **1% da tela**. Não é a página repintando; é uma palavra de três letras. Foi por isso
que o critério "palavra curta" apareceu em §1 como bônus técnico — a escolha estética certa é
também a mais barata.

**A escolha que resolve de verdade: a animação acabar.** Um `infinite` repinta 60 vezes por
segundo **com o telefone parado na mesa** — custo puro, benefício zero, e é o pior lugar possível
para gastar bateria num público que está em 4G. Duas passadas gastam ~5 s e depois a conta zera:
**em repouso, zero repintura, para sempre.**

Note que ligar à rolagem **não** resolveria isso melhor: repintaria a cada frame de scroll, e a
§3.3 mostra que ainda por cima entregaria o efeito para as pessoas erradas.

⚠️ Ressalva: `developer.chrome.com/docs/css-ui/scroll-driven-animations` fala em animações
"running off the main thread". Isso vale para a **condução** da timeline, não para a propriedade
animada. Gradiente conduzido por rolagem continua repintando.

**Se a regra tiver que valer ao pé da letra**, existe versão 100% compositor: empilhar cópias da
palavra em `::before`/`::after` com `content: "LED" / ""` (a barra zera o texto acessível), cada
uma numa cor sólida, e fazer cross-fade de `opacity`. Só `opacity` anima, zero repintura.
**Custo:** perde-se a banda correndo pelas três letras — vira troca de cor chapada. É bem menos
bonito, e a banda é justamente a ideia dos três pixels. **Recomendo a exceção medida, não esta.**

---

## 3. Gradiente que responde à rolagem

### 3.1 Suporte, verificado — e a notícia boa

BCD `css/properties/animation-timeline.json` + `api.webstatus.dev/v1/features/scroll-driven-animations`:

| | versão | data |
|---|---|---|
| Chrome / Edge | **115** | 2023-07-18 |
| **Safari e iOS Safari** | **26** | **2025-09-15** |
| Firefox | **não lançou** — `"version_added": "preview"` | só Nightly, atrás de `layout.css.scroll-driven-animations.enabled` |

Confirmado no blog da WebKit, *WebKit Features in Safari 26.0*, 2025-09-15. E o MDN carimba:
> "This feature is not Baseline because it does not work in some of the most widely-used browsers."

Baseline: `limited`. Escores WPT: Chrome 0,878 · Safari 0,865 · **Firefox 0,089**.

> **O que isso muda para este projeto — e é o contrário do que se esperaria.** O Firefox é o único
> ausente, e o caso principal aqui é celular em 4G, onde o mundo é Chrome Android e iOS Safari:
> os dois têm suporte. Ou seja, animação de rolagem **está disponível para quase todo o tráfego
> real da Rapa Sound**. Não é luxo de desktop.
>
> Só que disponibilidade não é motivo para usar. **É justamente porque a cobertura é quase total
> que a versão ligada ao scroll seria um erro aqui** — ela deixaria a palavra parada para quase
> todo mundo até a pessoa rolar. Ver §3.3.

### 3.2 ⚠️ Detecção de feature — a forma simples tem furo

Existem três formas circulando, e **duas delas estão erradas**. Esta é a correção mais
importante desta seção.

| Forma | Onde aparece | Veredito |
|---|---|---|
| `@supports (animation-timeline: view())` | tutoriais em geral | ⚠️ **insuficiente** |
| `@supports not (scroll-timeline: --main-timeline)` | **MDN**, guia *CSS scroll-driven animations* | funciona, mas incompleta |
| `@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%))` | **Bramus**, 2024-09-24 | ✅ **é esta** |

**Por quê.** Bramus (Chrome DevRel), em *Feature detecting Scroll-Driven Animations? You want to
check for animation-range too*:

> O Firefox Nightly suporta `animation-timeline` mas **não** suporta `animation-range`.

Ou seja: testar só `animation-timeline` **deixa passar um browser que entra no bloco e executa a
animação sem respeitar o intervalo** — o efeito roda no lugar errado. Testar `scroll-timeline`
sozinho tem o mesmo furo. Só o teste composto fecha.

```css
@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%)) { /* … */ }
```

⚠️ **Isto corrige o que eu mesmo tinha escrito.** A versão anterior deste documento usava
`@supports (scroll-timeline: --t)`, copiado do MDN. Não está errado por si, mas tem o furo do
Firefox Nightly. O código de §3.4 já usa a forma composta.

### 3.2.1 Outra pegadinha: `animation-delay` não funciona em timeline de rolagem

Chris Coyier, *Numbers That Fall*, 2025-10-07: numa timeline **baseada em progresso**, e não em
tempo, `animation-delay` é **ignorado**. Muito tutorial ensina a escalonar com
`animation-delay: calc(var(--i) * 5%)` — não funciona. O escalonamento correto é por
`animation-range-start`, ou embutindo o índice no próprio keyframe.

Não afeta o §5 daqui (lá o escalonamento é `transition-delay`, em timeline de **tempo**, onde
delay funciona normalmente). Fica registrado para não cair nessa se o §5 migrar para rolagem.

### 3.3 ⚠️ O erro que quase cometi, e por que a rolagem não conduz a varredura

A primeira versão deste documento punha a varredura na timeline de rolagem, substituindo a
animação de entrada:

```css
/* NAO fazer isto */
@supports (scroll-timeline: --t) {
  .led { animation: led-varre linear both;
         animation-timeline: scroll(root block); animation-range: 0 92svh; }
}
```

Parecia mais sofisticado e é o que o item 2 do briefing sugere. **Está errado para este caso**, e
o defeito só aparece quando se pensa em quem usa: em Chrome e Safari 26 — ou seja, na **maioria
esmagadora do tráfego** — a palavra ficaria **parada em âmbar até a pessoa rolar**. O hero é
justamente o momento em que ela está olhando e ainda não rolou. O pedido era "uma cor que vai
mudando"; a versão "sofisticada" entregava cor nenhuma exatamente nos primeiros segundos, e
entregava o efeito **só para quem já decidiu continuar**.

Pior: quem tem browser **pior** (Firefox, iOS antigo) veria o efeito, e quem tem browser **melhor**
não veria. Progressive enhancement de cabeça para baixo.

**Então a varredura fica no tempo, finita, para todo mundo** (§2.3). Não é concessão: uma animação
de 2 passadas que termina **já resolve** o problema que o scroll-linking resolveria — não existe
loop eterno para consertar.

### 3.3.1 A evidência de campo: ninguém faz isso

Varredura de **106 páginas ao vivo** de sites premiados (Awwwards, Godly, minimal.gallery,
httpster), baixando o CSS compilado e procurando as propriedades:

| Sinal | Ocorrências |
|---|---|
| `animation-timeline` (rolagem em CSS) | **0** |
| `view-timeline` / `scroll-timeline` | **0** |
| GSAP `ScrollTrigger` | 16 |
| GSAP `SplitText` | 12 |

**Nenhum site do conjunto conduz cor de título por rolagem em CSS.** Tudo que é ligado a scroll
nesses sites é GSAP com `scrub`, e é ligado a **transform**, não a cor. O caso mais próximo, a
**Nudot** (`nudot.com.tw`), escorrega as palavras do título para cima com `yPercent:-130` num
`scrub:1.2` — movimento, não cor.

Três sites deram falso positivo em `background-clip:text` (Bauhaus Clock, AGR Studio, Karol
Ortyl): é o `[data-text-fill]` que o **Framer** injeta por padrão, gradiente **estático**, não
um título gradiente projetado.

⚠️ Ausência de exemplo não é prova de que seja ruim — pode ser só suporte recente (Safari 26 é
de setembro/2025). Mas somada ao raciocínio de §3.3, reforça: **cor de título conduzida por
rolagem ainda não é uma técnica assentada**, e este projeto não precisa ser quem descobre isso.

> **O contra-argumento, que vale ter à mão.** Chris Coyier, *Death to Scroll Fade!* (2026-02-20),
> citando David Bushell: *"movement for the sake of it… when it catches our eye for no useful
> reason, we end up resenting it."* É exatamente o risco de uma cor que passeia sem ir a lugar
> nenhum — e a razão de a varredura daqui **terminar**.

### 3.4 Onde a rolagem entra de verdade — a drenagem

A timeline de rolagem tem um trabalho melhor neste projeto, e é um trabalho que **só ela** faz:
não mover a banda, e sim **drenar a cor da palavra em direção ao branco** conforme o hero sai —
a virada FESTA → TÉCNICO anunciada no H1, antes de o usuário saber que ela existe.

Propriedade separada, sem conflito com a varredura:

```css
@property --led-lavagem { syntax: "<percentage>"; inherits: false; initial-value: 0%; }

@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%)) {
  .led {
    animation: led-varre 2400ms var(--ease-out-cut) 240ms 2 both,   /* continua */
               led-lava  linear both;                                /* soma */
    animation-timeline: auto, scroll(root block);
    animation-range: normal, 0 92svh;
  }
}
@keyframes led-lava { to { --led-lavagem: 100%; } }
```

…com os stops coloridos embrulhados em
`color-mix(in oklab, var(--color-branco) var(--led-lavagem), <cor>)`.

`scroll()` e não `view()`: o H1 **já nasce dentro do viewport**, e `view()` mede um elemento
entrando e saindo — para quem começa dentro, o início do intervalo já passou.
`92svh` casa com o `min-h-[88svh]` do hero. **`svh` e não `vh`**: com a barra de endereço
recolhendo no Safari iOS, `vh` muda de valor durante a rolagem e o intervalo respira junto.

⚠️ **Não estou propondo para a primeira entrega.** Soma uma segunda propriedade registrada e
mais repintura, para um efeito que só se vê saindo da tela. Fica documentado como o próximo
passo natural, depois de medir o LCP (§8). **A varredura de §2.3 é o que vai ao ar.**

---

## 4. Sistema de títulos — os dois estados

### 4.1 A escala

A escala do `IDENTIDADE.md` (12·14·16·19·24·32·44·64·96) fica de pé, mas passa a ser **os extremos
de um `clamp()`**, não degraus fixos. Motivo concreto: hoje o H1 é `text-3xl` (64 px) no celular.
"Som, luz e LED para 15 anos e casamento" com `max-w-[16ch]` a 64 px, numa tela de 380 px, dá
quatro linhas de título — o hero vira parede. Os degraus continuam sendo os valores das pontas;
o meio é fluido.

```css
@theme {
  --text-h1: clamp(2.75rem, 1.6rem + 5.2vw, 6rem);      /*  44 → 96 */
  --text-h2: clamp(2rem,    1.4rem + 2.8vw, 4rem);      /*  32 → 64 */
  --text-h3: clamp(1.1875rem, 1.05rem + 0.6vw, 1.5rem); /*  19 → 24 */
}
```

Conferido, H1 resolvido em larguras reais:

| viewport | H1 | linhas do título (estimativa) |
|---|---|---|
| 380 px (o teste obrigatório) | **45 px** | ~3 |
| 390 px | 46 px | ~3 |
| 768 px | 65 px | 2 |
| 1024 px | 79 px | 2 |
| **1354 px ou mais** | **96 px** (trava no teto) | 2 |

Hoje, a 64 px fixos numa tela de 380 px, sobram ~340 px úteis depois do `px-5`; em Zodiak isso dá
~10 caracteres por linha e os 39 caracteres do título viram **4 linhas**. A 45 px cabem ~15 por
linha → **3 linhas**. ⚠️ A contagem de linhas é estimada por largura média de caractere, não
medida em browser — está na lista de §8 para conferir a 380 px de verdade.

### 4.2 A tabela

| Nível | Fonte | Tamanho | Peso | Tracking | Leading | Tratamento |
|---|---|---|---|---|---|---|
| **Eyebrow FESTA** | Chivo Mono 400 | 12 | 400 | `.16em` | 1 | marcador de pixel aceso na cor da seção · termo em `--branco`, qualificador em `--branco-2` · numeral em `--ambar` |
| **Eyebrow TÉCNICO** | Chivo Mono 400 | 12 | 400 | `.16em` | 1 | marcador **branco** · **filete de 1px acima** · índice `01`–`08` tabular |
| **H1** | Zodiak 700 | 44 → 96 | 700 | `-.025em` | 1.0 | `--branco`; **uma** palavra com `.led` · `text-wrap: balance` |
| **H2 FESTA** | Zodiak 700 | 32 → 64 | 700 | `-.02em` | 1.05 | `--branco`, **sem cor** · revelação por palavra (§5) |
| **H2 TÉCNICO** | Zodiak 700 | 32 → 64 | 700 | `-.02em` | 1.05 | `--branco` · sem revelação, entra pronto |
| **H3** | Cabinet 700 | 19 → 24 | 700 | `-.005em` | 1.15 | `--branco` |
| **H3 técnico** (rider) | Chivo Mono 400 | 12 | 400 | `.12em` | 1.4 | caixa-alta · filete inferior · contagem em `--ambar` |

**A cor é escassa de propósito.** Uma única palavra na página inteira recebe tratamento de cor: o
`LED` do H1. Nenhum H2 recebe. É isso que faz o H1 funcionar — se três títulos tivessem gradiente,
nenhum teria. Um momento orquestrado, como diz o `IDENTIDADE.md`.

⚠️ **Peso 500 não existe hoje.** `chivomono-400.woff2` e `chivomono-500.woff2` têm **MD5
idêntico** — são o mesmo arquivo. Todo `font-weight: 500` (o `.lab`, o botão `Zap`) está sendo
sintetizado pelo browser ou simplesmente renderizando 400. Ou se baixa o arquivo 500 de verdade,
ou se apaga o `@font-face` e o `font-weight: 500` do projeto. A tabela acima já assume **400**,
que é o que de fato está na tela. Ver §7.

### 4.3 O eyebrow — o que muda

Hoje:
```tsx
<p className="lab mb-5">Uberlândia · quase 30 anos</p>
```
Mono, 12 px, caixa-alta, `tracking .15em`, tudo em `--branco-2`. **Um valor só, nenhuma
hierarquia, nenhuma ligação com a marca.** É o default de "sobretítulo" — daí o sem-graça. O
problema não é o tamanho nem o tracking; é que **não há nada para o olho pousar**.

Quatro mudanças, todas baratas:

**1. Marcador de pixel.** Um quadrado de 3×3 px na cor do tubo da seção, 12 px antes do texto.
Não é bolinha, não é traço — é **um pixel**, do mesmo jeito e do mesmo tamanho que a coluna da
assinatura. O eyebrow deixa de ser tipografia genérica e vira **uma instância do sistema da
marca**. É a mudança mais importante das quatro, porque é a única que só funciona nesta marca.

**2. Contraste de valor dentro da linha.** O termo em `--branco`, o qualificador em `--branco-2`.
"**UBERLÂNDIA** · quase 30 anos" ganha hierarquia dentro de 12 px, sem mudar corpo nem peso.

**3. O número que significa alguma coisa, em âmbar.** Âmbar é a cor de dado — a restrição já diz
isso. `quase 30 anos` · `13 serviços` · `116 artistas`: o numeral em `--ambar`, `font-variant-numeric:
tabular-nums`. Dá um ponto focal de alto contraste (9,94:1) num elemento de 12 px, e reforça a
prova social sem uma linha de texto a mais.

**4. O filete é exclusivo do estado TÉCNICO.** Filete de 1px em `--color-rule` acima do eyebrow,
com um índice `01`–`08`. Assim o filete vira **sinal de estado**, não decoração: apareceu filete,
a página virou luz de trabalho. FESTA nunca tem filete.

Componente de dois estados:

```tsx
export function Eyebrow({
  children, cor = 'var(--color-ambar)', indice, tecnico = false,
}: {
  children: ReactNode; cor?: string; indice?: string; tecnico?: boolean
}) {
  return (
    <p className={`lab mb-5 flex gap-3 ${
        tecnico ? 'border-t border-rule pt-4' : ''}`}>
      {/* o pixel — a assinatura em escala de 3px.
          shrink-0 para nao achatar; mt-[0.45em] alinha a PRIMEIRA linha,
          nao ao centro do bloco, para quando o sobretitulo quebrar em duas. */}
      <span aria-hidden className="mt-[0.45em] block size-[3px] shrink-0"
            style={{ background: tecnico ? 'var(--color-branco)' : cor }} />
      {indice && <span className="shrink-0 text-branco-2">{indice}</span>}
      <span>{children}</span>
    </p>
  )
}
```

Detalhes que não são decoração: `mt-[0.45em]` prende o pixel à **primeira linha** — com
`items-center` ele iria para o meio do bloco e ficaria boiando quando o sobretítulo quebrasse em
duas linhas. `shrink-0` nos dois primeiros filhos impede que o marcador vire retângulo e que o
índice quebre. `tabular-nums` mora no `.lab`, então o índice já herda.

E o `.lab` ganha os pedaços que faltavam:

```css
.lab {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-branco-2);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
/* o termo que o olho pousa */
.lab strong { color: var(--color-branco); font-weight: 400; }
/* o dado */
.lab b, .lab .num { color: var(--color-ambar); font-weight: 400; }
```

`font-weight: 400` nos dois: a distinção é de **cor**, não de peso — porque só temos 400 e 700 e
o 500 nem existe (§7). Menos peso, mais valor. É mais sofisticado assim de qualquer jeito.

**O eyebrow do hero fica:**

```tsx
<Eyebrow>
  <strong>Uberlândia</strong> · quase <b>30</b> anos
</Eyebrow>
```

→ pixel âmbar aceso · **UBERLÂNDIA** em branco · `quase` apagado · **30** em âmbar tabular ·
`anos` apagado. Quatro valores numa linha de 12 px, zero enfeite, e cada valor significa uma
coisa. Compare com a chapa cinza de hoje.

**Por seção:**

| Seção | Eyebrow | Marcador | Estado |
|---|---|---|---|
| Hero | **Uberlândia** · quase **30** anos | âmbar | FESTA |
| 15 anos | O que mais fazemos | magenta | FESTA |
| Casamento | Cerimônia, recepção e pista | congo | FESTA |
| Serviços | **13** serviços · monta junto ou separado | âmbar | FESTA |
| Eventos | Festas que já aconteceram | âmbar | FESTA |
| Rider | `01` Rider técnico · **116** artistas | branco | **TÉCNICO** + filete |
| Sobre | `02` Desde o começo | branco | **TÉCNICO** + filete |
| Dúvidas | `03` O que perguntam antes de fechar | branco | **TÉCNICO** + filete |
| Contato | `04` Falar com a gente | branco | **TÉCNICO** + filete |

O índice só começa **depois da virada**. Numerar é um gesto de documentação técnica — é a página
mudando de registro, não uma contagem decorativa. Antes da virada não há número, porque festa
não se numera.

### 4.4 `text-wrap` — onde usar

**`balance`** — BCD + webstatus: Chrome 114 · Firefox 121 · **Safari 17.5 (2024-05-13)**.
**Baseline newly available, 2024.**

⚠️ **Correção:** o teto **não é 4 linhas**. Chrome, no blog do Adam Argyle:
> "This performance cost is mitigated by a rule, it only works for **six wrapped lines and under**."

E o MDN: "**six or less for Chromium and ten or less for Firefox**".

Chrome também documenta que não se deve aplicar em tudo: *"It is not a good idea to apply text-wrap
balancing to your entire design."*

→ **`balance` em H1, H2, H3 e eyebrow.** Todos têm poucas linhas. Já está certo no `globals.css`.
**Nunca em `<p>`.**

**`pretty`** — Chrome 117 · **Safari 26 (2025-09-15)** · **Firefox: não implementou**
(`version_added: false`). Baseline **`limited`**.

E as duas implementações **não fazem a mesma coisa** — WebKit, literal:
> "**In WebKit, all lines of text in an element are improved by `pretty`, not just a select group
> of lines at the end of the paragraph.**"

Chrome só mexe nas últimas linhas (evita viúvas). Safari roda o algoritmo bom no bloco inteiro
(rag, hifenização, última linha curta).

→ **`pretty` nos `<p>` de corpo.** Degrada para `wrap` no Firefox sem nenhum prejuízo — é
melhoria pura onde existe. Não usar em título: lá quem manda é `balance`.

```css
h1, h2, h3, .lab { text-wrap: balance; }
p { text-wrap: pretty; }
```

---

## 5. Revelação por palavra — CSS puro, 0 KB de JS

`SplitText` e GSAP estão fora, e nem fazem falta: **`output: 'export'` significa que a quebra em
palavras acontece no build**. O HTML sai do Next já com os `<span>`s dentro. Custo em runtime:
**zero**. É a vantagem que uma stack estática tem sobre o SplitText, que faz o mesmo trabalho no
browser do usuário, toda vez.

```tsx
/** Quebra em palavras no BUILD. Zero JS no cliente.
 *  O texto acessivel nao muda: leitor de tela le a frase inteira. */
export function PorPalavra({ children }: { children: string }) {
  const palavras = children.split(' ')
  return (
    <>
      {palavras.map((p, i) => (
        <Fragment key={i}>
          <span className="pal" style={{ ['--i' as string]: i }}>{p}</span>
          {/* o espaco fica FORA do inline-block — ver nota */}
          {i < palavras.length - 1 && ' '}
        </Fragment>
      ))}
    </>
  )
}
```

```css
.pal {
  display: inline-block;
  opacity: 0;
  transform: translateY(0.22em);
}
.rev-on .pal {
  opacity: 1;
  transform: none;
  transition: opacity 320ms var(--ease-out-cut), transform 320ms var(--ease-tubo);
  /* 18ms por palavra, TETO de 200ms no acumulado */
  transition-delay: min(calc(var(--i) * 18ms), 200ms);
}
.no-js .pal { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  .pal { opacity: 1 !important; transform: none !important; transition: none !important; }
}
```

⚠️ **O espaço tem que ficar fora do `<span>`.** Um espaço *dentro* de um `inline-block` não é
ponto de quebra de linha válido — o título pararia de quebrar direito e estouraria a caixa no
celular. É o tipo de erro que só aparece a 380 px. Vai **entre** os spans, como nó de texto irmão.
(Requer `import { Fragment } from 'react'`.)

> **Isto não é teoria — tem site no ar fazendo exatamente assim.** A **Kraken Industries**
> (`krakenindustries.co`, Awwwards) revela palavra a palavra em CSS puro, sem biblioteca, com o
> índice numa custom property, igual ao `--i` daqui:
> ```css
> .rv-mask{display:inline-block;overflow:hidden;vertical-align:bottom;
>          padding-bottom:.04em;margin-bottom:-.04em}
> .rv-word{display:inline-block;transform:translateY(112%);
>          transition:transform .7s var(--ease-out-quint);
>          transition-delay:calc(var(--i,0) * 80ms + var(--base,.15s))}
> ```
> **O truque que vale roubar:** `padding-bottom:.04em` + `margin-bottom:-.04em` no elemento que
> tem `overflow:hidden` — sem isso a máscara **corta as descendentes** (o "p" de "para", o "ç"
> de "coração"). Só aparece em palavra com perna. Nosso `.pal` não usa `overflow:hidden`, então
> não precisa; fica anotado para se um dia trocarmos o fade por máscara.
>
> Eles usam 80 ms de escalonamento e sem teto. **Mantenho 18 ms e teto de 200 ms**: o título
> deles tem 4 palavras, os nossos H2 têm até 6, e o briefing proíbe atrasar a leitura.

**As regras que impedem isso de virar o efeito proibido:**

1. **Teto de 200 ms no acumulado**, via `min()`. Um H2 de 12 palavras não leva 12×18 = 216 ms
   escalonando; para em 200 ms. O briefing proíbe texto que atrasa a leitura — o teto é o que
   garante isso, e ele está no CSS, não na disciplina de quem escreve.
2. **Por palavra, nunca por letra.** Letra por letra está vetado.
3. **Nunca no H1.** É LCP. O H1 entra pronto, inteiro, na primeira pintura.
4. `opacity` + `transform` apenas — 100% compositor, sem exceção aqui.
5. Reaproveita o `.rev-on` do `Reveal` que já existe. **Nenhum JS novo.**

⚠️ **Por linha é impossível em CSS puro.** Não existe seletor de linha (`::first-line` só aceita
um punhado de propriedades e não anima). Quebrar por linha exige medir a quebra no browser, em
runtime, a cada `resize` — é exatamente o que o GSAP SplitText faz e o que está vetado. **Por
palavra é o mais próximo que dá para chegar de graça**, e visualmente a diferença é pequena.

### 5.1 Nota de campo: isto é menos comum do que parece

`scroll-driven-animations.style` — o catálogo de referência do assunto, feito pelo **Bramus**
(Chrome DevRel), tudo em HTML/CSS/JS na mão, sem framework — tem demos de barra de progresso,
parallax, cartões empilhados, carrossel, scroll horizontal, sombras. **De texto, só a barra de
progresso de leitura.** Não há nenhuma demo de revelação por palavra ou por caractere.

Isso é informação, não lacuna: **revelação de texto granular não é um padrão resolvido em CSS**,
é território de biblioteca. O que dá para fazer de graça é o que está em §5 — palavra inteira,
`opacity` + `transform`, escalonamento com teto. Quem promete mais está carregando JS.

**A referência mais próxima do que queremos** é o *CSS Scroll-triggered Animations with Style
Queries*, do **Ryan Mulligan** — usa `animation-timeline: view()` só para virar uma custom
property, e uma style query (`@container style(--animate: true)`) dispara o efeito no filho:

```css
.box { animation: trigger steps(1) both; animation-timeline: view();
       animation-range: entry 80% contain 40%; }
@keyframes trigger { to { --animate: true; } }
@container style(--animate: true) { .text { /* anima */ } }
```

Elegante, e o CodePen dele traz **fallback por IntersectionObserver** — a mesma arquitetura que
este projeto já tem no `Reveal`. **Não estou propondo adotar**: style queries somam uma segunda
feature de suporte parcial para resolver um problema que o `Reveal` já resolve com 0,4 KB que já
estão pagos. Fica registrado como a técnica de referência caso o `Reveal` saia um dia.

---

## 6. Fontes

### 6.1 Suporte e especificação — todas abertas e conferidas

| Assunto | Fonte |
|---|---|
| `@property` | `raw.githubusercontent.com/mdn/browser-compat-data/main/css/at-rules/property.json` · `api.webstatus.dev/v1/features/registered-custom-properties` · `caniuse.com/mdn-css_at-rules_property` |
| `background-clip: text` | BCD `css/properties/background-clip.json` · `api.webstatus.dev/v1/features/background-clip-text` · `caniuse.com/background-clip-text` (notas #1 e #2) |
| Animações de rolagem | BCD `css/properties/animation-timeline.json` · `api.webstatus.dev/v1/features/scroll-driven-animations` · `webkit.org/blog/17333/webkit-features-in-safari-26-0/` (2025-09-15) · `developer.mozilla.org/…/Mozilla/Firefox/Experimental_features` |
| `text-wrap: balance` | `developer.chrome.com/blog/css-text-wrap-balance` (Argyle) · `developer.mozilla.org/…/CSS/text-wrap` · `api.webstatus.dev/v1/features/text-wrap-balance` |
| `text-wrap: pretty` | `webkit.org/blog/17333/…` · `api.webstatus.dev/v1/features/text-wrap-pretty` · `github.com/mozilla/standards-positions/issues/993` |
| Custo de `@property` | `web.dev/blog/at-property-performance` (Bramus, 2024-10-02) · `web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count` · `web.dev/articles/animations-guide` |
| Detecção de feature | `developer.mozilla.org/…/CSS/Guides/Scroll-driven_animations` · `tympanus.net/codrops/2024/01/17/…` (Argyle) |
| Técnica de rolagem em texto | `ryanmulligan.dev/blog/scroll-triggered-animations-style-queries/` · `scroll-driven-animations.style` (Bramus) |
| Zodiak | `fontsinuse.com/typefaces/124907/zodiak` ⚠️ procedência sim, lista de estilos não |

> ⚠️ **Aviso de método, e vale para a próxima pesquisa também.** A tabela de compatibilidade do
> MDN é montada no cliente. Raspar a página renderizada devolve **números inventados** — nesta
> pesquisa uma raspagem devolveu "Chrome 78" para `@property` (o certo é 85) e "Firefox 156" para
> `animation-timeline` (o Firefox não lançou; a 154 é de agosto/2026). **Usar o JSON do
> `mdn/browser-compat-data` e a `api.webstatus.dev`**, nunca o HTML do MDN.

### 6.2 Galerias — tratamento de título memorável, 2025–2026

Método: 106 páginas baixadas ao vivo, `<h1>`/`<h2>` e o CSS compilado lidos na fonte. Nada
inferido de captura de tela.

#### Uma palavra destacada no título — o que existe de verdade

| # | Site | O tratamento |
|---|---|---|
| 1 | **digitz.fr** | Uma **letra** só: o `g` de "di**g**itale" em ciano. A segunda linha vira itálico **e** ciano. O display é forçado a romano (`font-style:normal!important`), então o itálico é override deliberado. |
| 2 | **khasiyev.com** | Serifada itálica dentro da grotesca: `.oi-serif{font-family:var(--font-accent);font-size:1.03em;font-style:italic;font-weight:200}`. **O `1.03em` é o detalhe** — compensação óptica para a serifada leve não encolher ao lado da Inter. |
| 3 | **bellhopco.com** | Uma frase trocada por manuscrita, **cor diferente por seção** (verde/azul/laranja). Cada instância tem `margin-top` negativo à mão (−30 a −70 px) para encaixar na linha de base. |
| 4 | **trevornoah.com** | `Finding the <span class="u-text-accent">extraordinary</span>`, com `--color-accent:#ff9bb4`. E itálico noutro ponto: `only three things are certain: <em>death</em>…` |
| 5 | **wiz.io** | `Protect <span class="text-primary-blue">Everything</span>`. O `<span>` duplo com `relative z-10` existe para deitar uma camada atrás da palavra. |
| 6 | **viens-la.com** | **O mais sistemático, e o mais próximo do nosso caso.** A cor de cada palavra destacada vem de um atributo: `<span data-surrounded="#ffe375">Digital</span>`, com rotação de 5 cores pelo site. **A cor é dado, não classe.** |
| 7 | **vigilante.group** | A palavra vira **imagem**: só os substantivos que carregam sentido ("ideas", "impact") ganham miniatura pareada. |
| 8 | **eirdis.com** | Itálico em **parte de uma palavra**: `<em>Ragnars</em>dóttir`. ⚠️ Marcação verificada; a regra compilada não foi localizada. |
| 9 | **cofounder.co** | Título em dois tons, cada metade com **filtro SVG** próprio (`feGaussianBlur`/`feComposite`). Noutro ponto a oração subordinada leva `background-clip:text` com gradiente branco→branco translúcido. |
| 10 | **hex.tech** | Oração de abertura em itálico, resto romano — e num terceiro caso o itálico vai para o **fim**. ⚠️ CSS injetado em runtime. |
| 11 | **serotoninn.com** | Palavra entre parênteses em itálico, com os parênteses em peso diferente: `CORSETS<i><strong>(</strong>witch<strong>)</strong></i>`. |
| 12 | **kommakomma.is** | Palavras que **se trocam** no lugar: "You only quote" → "We only design", com âncora lateral para a linha não refluir. |

**O que isso confirma para nós.** Destacar **uma palavra** de um título é padrão vivo e corrente
em 2025–2026 — não é invenção. Os dois eixos usados são **cor** e **itálico**; o mais comum é cor.
E o exemplo 6 (viens-là) valida a arquitetura proposta aqui: cor como **valor**, não como classe.
Nosso `.led` é a versão de um destaque só — mais disciplinada que a rotação de 5 cores deles,
porque a nossa restrição dura só autoriza uma palavra.

#### Sobretítulo além de caixa-alta + tracking

| Site | Dispositivo |
|---|---|
| **krakenindustries.co** | `.kicker{font-family:var(--mono);font-size:10px;letter-spacing:.24em}` num `flex justify-between align-items:baseline` — o eyebrow é **alinhado pela base contra um segundo elemento na borda oposta**, virando linha de texto, não etiqueta empilhada. Divisor interno de travessão: `CUSTOM ORDER — MADE BY HAND`. |
| **krakenindustries.co** | `.how-num{font-family:var(--mono);font-size:40px;color:var(--acc)}` — o índice `01`/`02` **a 40 px**, maior que tudo no bloco. O oposto do número miudinho. |
| **aspensearch.com** | `grid-cols-[auto_1fr]` põe o número em coluna própria ao lado do conteúdo, com `pt-[0.2em]` para alinhá-lo à **altura de maiúscula**. ✅ **Confirma o `mt-[0.45em]` de §4.3** — é o mesmo problema, resolvido do mesmo jeito. |
| **aspensearch.com** | Etiqueta em caixa **só com `border-b` + `border-l`**: encaixa no canto do cartão em vez de flutuar como pílula. Inverte no `peer-hover`. |
| **digitz.fr** | Marcador de **comentário de código** como dispositivo: `// COOKIES & MESURE D'AUDIENCE`. |
| **serotoninn.com** | Índice **dentro** do `<h2>`, não como elemento à parte: `02. New Arrivals`, `03. Campaign`. |
| **nudot.com.tw** | Rótulos entre parênteses, usando largura plena vs. meia para controlar o vão óptico. |

**Leitura:** os quatro dispositivos que aparecem repetidamente são **(a)** monoespaçada contra a
display, **(b)** número de índice, **(c)** filete/borda parcial e **(d)** alinhamento pela base
contra outro elemento. O sistema de §4.3 usa (a), (b) e (c) — mais o marcador de pixel, que é o
único item que nenhum deles tem, porque é a assinatura desta marca.

#### Revelação de texto em CSS puro — os que realmente existem

| Fonte | Técnica |
|---|---|
| **krakenindustries.co** | Palavra a palavra, CSS puro, `--i` + `transition-delay`. **É a nossa arquitetura, no ar.** Ver §5. |
| Chris Coyier, 2024-01-23, `master.dev` | `<mark>` com `background-size:0 100%` → `100%` em `animation-timeline:view()`. Zero JS, zero span, e a marcação **quebra de linha naturalmente**. |
| Tyler Gaw, 2023-07-19 | `view-timeline-name` + `clip-path:polygon()` varrendo o bloco. **Lê como linha a linha sem dividir nada.** |
| Roman Komarov / Coyier, 2024-10-31 | `animation-timeline:view(inline)` escalando texto até cada linha preencher o contêiner. |
| Lee Meyer, CSS-Tricks, 2026-02-17 | `animation-range-start: calc(90%/sibling-count() * sibling-index())` — CSS puro depois do split. |
| Bramus, 2025-12-12 | **`animation-trigger`**, o substituto nativo do IntersectionObserver. MDN BCD: **só Chrome 146**. |

⚠️ **`nerdy.dev`** (Adam Argyle) é o único site pessoal encontrado com scroll-driven de texto de
verdade no ar — 14 ocorrências de `animation-timeline` no CSS, incluindo um sumário que se
acende por `view-timeline` nomeado por heading.

⚠️ **Não citar** `tympanus.net/codrops/2025/11/04/…3d-scroll-driven-text-animations…`: o título
diz scroll-driven, o CSS tem **zero** `animation-timeline`. É 100% GSAP.

#### Novidade que simplifica o §5 no futuro

**`sibling-index()`** já é cross-browser — Chrome 138, Firefox 154, Safari 26.2. Quando a base
instalada amadurecer, ele **elimina o `style={{'--i': i}}`** do `PorPalavra`: o índice passa a
sair do CSS, e o componente vira um `split` puro sem atributo inline. Ainda é cedo (Safari 26.2
é recentíssimo), mas é o caminho.

#### Galerias que não renderam nada

`land-book.com` **403** · `siteinspire.com` **429** · `thefwa.com` listagem **500** ·
`godly.website` e `21st.dev` respondem 200 mas são renderizados no cliente, sem links no HTML —
não dá para extrair sem browser. Os 12 exemplos acima saíram de **awwwards.com/websites/typography**,
**awwwards.com/websites/sites_of_the_day**, **minimal.gallery** e **httpster.net**.

---

## 7. Três coisas erradas no projeto, achadas nesta pesquisa

**1. O contraste do magenta no `IDENTIDADE.md` está errado.**
O arquivo diz `--magenta` sobre `--void` = **5,1:1**. O cálculo WCAG dá **4,17:1**.
(`L(#D81E7E)` = 0,17028 · `L(#09090B)` = 0,002777 · (0,17028+0,05)/(0,002777+0,05) = 4,173.)
A conclusão do documento **continua valendo** — magenta reprova em corpo de texto — mas por uma
margem maior do que ele supõe. E muda um caso: a 4,17:1 o magenta passa em texto **grande**
(mínimo 3:1) mas reprova em texto normal (4,5:1), enquanto a 5,1:1 passaria nos dois. Vale
corrigir o número no `IDENTIDADE.md`.

**2. `chivomono-500.woff2` é uma cópia do `chivomono-400.woff2`.**
```
e0025de46ac134214931f68a600da4ac  chivomono-400.woff2
e0025de46ac134214931f68a600da4ac  chivomono-500.woff2
```
MD5 idêntico. O `@font-face` declara `font-weight: 500` apontando para o arquivo de 400, então
`.lab` e o botão `Zap` (`font-medium`) não estão em medium — estão em regular, ou o browser
sintetiza. São 26 KB baixados à toa. Corrigir de um dos dois jeitos: baixar o Chivo Mono 500 de
verdade, ou remover o `@font-face` de 500 e os `font-weight: 500` do código.

**3. `text-wrap: balance` — o limite é seis linhas, não quatro.**
Sem impacto prático aqui (nossos títulos têm 2–4 linhas), mas o número correto é **6 no Chromium,
10 no Firefox**, e vale registrar para não virar folclore.

**Bônus — a Zodiak tem itálico e o projeto não baixou.** ⚠️ Confirmado só em fonte secundária:
`fontsinuse.com/typefaces/124907/zodiak` dá a procedência — desenhada por Alisa Nowak, Gaëtan
Baehr, Jean-Baptiste Morizot, Jérémie Hornus e Théo Guillard, "originally released with Indian
Type Foundry in 2020 as Claire. Moved to Fontshare, ITF's platform for free fonts, in 2021 and
renamed Zodiak" — mas **não** lista os estilos. Buscas secundárias (befonts, supafonts) falam em
12 estilos, Thin a Black, com itálico nos seis pesos, mais variável. **Não consegui confirmar na
Fontshare**: a página é uma SPA em JS e devolve só "Fontshare: Quality Fonts. Free." quando
buscada. Checar à mão antes de contar com isso.

De todo jeito, **não estou propondo usar** — a cor já resolve o destaque, e um itálico de
contraste alto puxa para o registro editorial que o `IDENTIDADE.md` descartou de propósito quando
reprovou a Melodrama. Fica anotado como alavanca de ~22 KB, caso um dia se queira destacar uma
palavra **sem** cor.

---

## 8. Pendências para depois de subir

1. **Medir o LCP com o `.led` no ar.** Confirmar que o Chrome trata o H1 como candidato a LCP
   normalmente mesmo com `-webkit-text-fill-color: transparent`. Não há fonte primária sobre isso
   (§2.6). WebPageTest, celular, 4G.
2. **Testar a 380 px**, como o `IDENTIDADE.md` exige para a assinatura. Conferir que "LED" não
   quebra e que o H1 fica em 3 linhas ou menos com o `clamp()` de §4.1.
3. **Conferir no iOS Safari 26** se o `scroll(root block)` com `animation-range` em `svh` se
   comporta com a barra de endereço recolhendo.
4. **Decidir o Chivo Mono 500** (§7.2) antes de fechar a tabela de §4.2.
5. **Conferir a contagem de linhas do H1 a 380 px** em browser de verdade — a tabela de §4.1 é
   estimada por largura média de caractere, não medida.
6. **Se um dia a drenagem de §3.4 for ao ar**, usar o `@supports` composto de §3.2 — não a
   forma simples.
