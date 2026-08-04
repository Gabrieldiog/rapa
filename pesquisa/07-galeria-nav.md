# 07 — Galeria / showcase de vídeo + navegação mobile

Pesquisa de campo, agosto de 2026. Tudo que aparece como "suporte" foi conferido
contra a API do **webstatus.dev** (dados do Baseline/BCD) ou contra o
**mdn/browser-compat-data** cru, não contra memória. Os pesos em KB vieram do
bundlephobia e de `gzip -c` no arquivo publicado no unpkg/jsdelivr.

Contexto do projeto: Next.js `output:'export'`, Tailwind v4, React 19, teto de
60 KB gzip de JS de animação (hoje ~1 KB), tráfego quase todo mobile 4G vindo do
link na bio do Instagram, `viewportFit: 'cover'` já ligado no `layout.tsx`.

---

# PARTE 1 — GALERIA / SHOWCASE DE VÍDEO

## 1. O que existe de fato no 21st.dev

O cliente citou o 21st.dev por nome, então vale catalogar o que realmente há lá,
não o que se imagina. O site é client-rendered e as páginas de busca não entregam
nada por fetch; o caminho que funciona é o `sitemap.xml` (8.955 URLs), que lista
cada componente publicado.

Contagem real por palavra no nome do componente:

| termo no nome | componentes |
|---|---|
| carousel | 66 |
| slider | 53 |
| dialog | 49 |
| gallery | 38 |
| modal | 31 |
| bento | 28 |
| video | 22 |
| showcase | 16 |
| masonry | 3 |
| **lightbox** | **0** |

> **Achado que muda a decisão: não existe um único componente chamado "lightbox"
> no 21st.dev.** O padrão que o ecossistema shadcn usa para "abrir o vídeo grande"
> é `dialog` + thumbnail, não um lightbox de galeria clássico. Ou seja: o que o
> cliente viu e chamou de "o negócio do 21st.dev" quase certamente é uma das
> variantes de *card grande + trilho*, não um lightbox.

### 1.1 Os que interessam para vídeo (URLs verificadas)

| componente | URL | o que faz | dependências |
|---|---|---|---|
| **Hero Video Dialog** — Dillion Verma (magicui) | `21st.dev/@dillionverma/components/hero-video-dialog` | thumbnail → modal com o YouTube dentro. Animações `from-center` e `top-in-bottom-out`. É *a* referência do padrão facade+modal no ecossistema | `framer-motion`, `lucide-react` |
| **YouTube Video Player** — cult-ui | `21st.dev/@cult-ui/components/youtube-video-player` | **usa fachada de verdade**: thumbnail própria com play, expande para modal fullscreen e só aí monta o iframe | `motion`, `lucide-react` |
| **Video Thumbnail Player** — Ravi Katiyar | `21st.dev/@ravikatiyar162/components/video-thumbnail-player` | thumbnail full-width, play centralizado, título/descrição no canto inferior esquerdo. **Um vídeo só**, não é galeria | `lucide-react` |
| **Side Panel Video** — cult-ui | `21st.dev/@cult-ui/components/side-panel-video` | apesar do nome, é um vídeo único num painel que abre/fecha. Não tem lista lateral | `motion`, `react-player`, `react-use-measure` |
| **Thumbnail Button Video Player** — arunachalam | `21st.dev/@arunachalam/components/thumbnail-button-video-player` | botão-thumbnail que troca o player | — |
| **Video Modal** — nyxbui | `21st.dev/@nyxbui/components/video-modal` | modal de vídeo | — |
| **Clipped Video Tab** — shaiksameer8921 | `21st.dev/@shaiksameer8921/components/clipped-video-tab` | abas que trocam o vídeo em destaque — é o padrão do item 2, aplicado a vídeo | — |
| **Glass Video Hero** — rahil1202 | `21st.dev/@rahil1202/components/glass-video-hero` | hero com vídeo de fundo | — |
| **HLS Video Player** — joyco | `21st.dev/@joyco/components/hls-video-player` | player HLS, adaptive bitrate. Irrelevante aqui (nossos vídeos são do YouTube) | `hls.js` |
| **Video Player Pro** — ruixen | `21st.dev/@ruixen.ui/components/video-player-pro` | player custom com controles | — |
| **Video Player** — haydenbleasel / thegridcn / preetsuthar17 / chetanverma16 | 4 componentes homônimos | players de `<video>` self-hosted estilizados | variam |
| **Scroll-Linked Video Scrubber** — pulkitxm | `21st.dev/@pulkitxm/components/scroll-linked-video-scrubber` | rola a página, o vídeo avança quadro a quadro | scroll-driven |
| **Video Ambient** — unlumen | `21st.dev/@unlumen/components/video-ambient` | vídeo com "ambilight" atrás — **é exatamente o glow proibido** | — |

### 1.2 Os que interessam para *escolha* (trilho / miniatura selecionável)

| componente | URL | padrão |
|---|---|---|
| **Thumbnail Slider** — uilayout | `21st.dev/@uilayout.contact/components/thumbnail-slider` | mídia grande + fileira de miniaturas selecionáveis embaixo. **É literalmente o que o cliente descreveu** |
| **Vertical Thumbnail Slider** — uilayout | `.../vertical-thumbnail-slider` | mesma coisa, miniaturas em coluna à direita |
| **Vertical Thumbnail Autostart Slider** — uilayout | `.../vertical-thumbnail-autostart-slider` | igual, **com autoplay** → vetado pelo briefing |
| **Framer Thumbnail Carousel** / **Framer Moveable Thumbnails** — uilayout | `.../framer-thumbnail-carousel`, `.../framer-moveable-thumbnails` | mesmo padrão, movido a framer-motion |
| **Thumbnail Carousel** — avanishverma4 | `21st.dev/@avanishverma4/components/thumbnail-carousel` | trilho de miniaturas |
| **Snap Carousel** — ddoemonn | `21st.dev/@ddoemonn/components/snap-carousel` | scroll-snap puro, sem lib |
| **Slider Detents** — ddoemonn | `21st.dev/@ddoemonn/components/slider-detents` | snap com "detentes" |
| **Gallery4 / Gallery6** — shadcnblocks | `21st.dev/@shadcnblockscom/components/gallery4` | trilho horizontal de cards altura cheia com texto de case por cima. Só `lucide-react` |
| **Playlist Carousel** — ruixen | `21st.dev/@ruixen.ui/components/playlist-carousel` | lista de faixas + destaque (áudio, mas o layout serve) |
| **Gallery Grid Block** — Moumen Soliman | `21st.dev/@moumensoliman/components/gallery-grid-block-shadcnui` | grade + modal (o "gallery grid with lightbox" que aparece nas buscas) |
| **Expandable Gallery** — 0xUrvish | `21st.dev/@0xUrvish/components/expandable-gallery` | acordeão horizontal: o card sob o cursor cresce |
| **Interactive Bento Gallery** — Anurag Mishra | `21st.dev/@anurag-mishra22/components/interactive-bento-gallery` | bento com mídia, item abre em destaque |
| **Horizontal Scroll Gallery** — pulkitxm | `21st.dev/@pulkitxm/components/horizontal-scroll-gallery` | galeria que anda com o scroll vertical |
| **Circular Gallery / 3D Gallery / Coverflow / Card Fan / Arc Gallery** | vários autores | efeitos 3D. Bonitos em desktop, caros e ruins de toque em 4G |

### 1.3 O custo escondido do 21st.dev

Quase todo componente "bonito" de lá importa `framer-motion` ou `motion`. Medido:

| pacote | versão | min | **gzip** |
|---|---|---|---|
| `framer-motion` | 12.43.0 | 179,6 KB | **60,1 KB** |
| `motion` | 12.43.0 | 132,5 KB | **44,2 KB** |
| `swiper` | 14.0.7 | 63,7 KB | **19,4 KB** |
| `photoswipe` | 5.4.4 | 57,7 KB | **16,6 KB** |
| `yet-another-react-lightbox` | 3.32.2 | — | **16,4 KB** (dist/index.js gzipado) |
| `embla-carousel-react` | 8.6.0 | 17,6 KB | **7,1 KB** |
| `lite-youtube-embed` | — | — | **3,9 KB JS + 1,2 KB CSS** |
| `react-player` | 3.4.0 | 5,4 KB | **2,2 KB** (só o wrapper; os adapters vêm depois) |

`framer-motion` sozinho é 60,1 KB gzip — **estoura o teto inteiro de 60 KB e
sobra zero para o resto**. `motion` come 74% do teto. Conclusão prática:
**dá para copiar a ideia de layout do 21st.dev, não o código.** Todo componente
de lá que interessa vira ~40 linhas de CSS nativo aqui.

---

## 2. Padrão "player em destaque + lista de seleção"

É o que o cliente descreveu com as próprias palavras ("um negócio maior onde ele
escolhe"). O nome de mercado é *featured player + playlist rail* ou
*hero + thumbnail strip*. Onde ele aparece de verdade:

- **YouTube** (desktop): player + fila à direita. É o modelo mental que o cliente já tem.
- **Vimeo Showcase**: player + grid de miniaturas embaixo, com filtro.
- **EmbedSocial Video Playlist Widget**, **YouTube Showcase (plugin WP)**: player grande + trilho rolável de miniaturas. Comercialmente o padrão dominante para "acervo de vídeo de empresa".
- **`mattrdude/accessible-youtube-playlist-viewer`** (GitHub): implementação explicitamente acessível do padrão — miniaturas geradas a partir de uma playlist.
- **Able Player**: player HTML5 acessível com playlist via `data-*`. Referência de a11y, mas pesado e voltado a mídia self-hosted.

### 2.1 A decisão de semântica: tabs ou lista de botões?

A APG do W3C manda usar `role="tablist"` só quando os "tabs" trocam painéis na
mesma página — que é tecnicamente o nosso caso. Mas o padrão completo exige
**roving tabindex** (o selecionado com `tabindex=0`, os outros `-1`) mais setas,
Home e End. Dois problemas concretos aqui:

1. roving tabindex briga com trilho horizontal rolável: o usuário de teclado perde o Tab como forma de percorrer e descobrir os itens;
2. custa ~0,6 KB a mais de JS e um bug de foco a cada refactor.

A orientação corrente ("HTML-first accessibility": HTML semântico primeiro, ARIA
só onde não existe elemento nativo) aponta para o caminho mais simples quando os
itens são **selecionáveis independentes** e o painel é **um só**: uma lista de
`<button>` com `aria-current="true"` no ativo, todos no fluxo de Tab. É o que
recomendo. Registro a alternativa de tabs abaixo para quem quiser trocar depois.

### 2.2 A regra inegociável da fachada

O peso real de um embed do YouTube está medido e é público: **~1,2 MB por embed**
(zachleat.com; Frontend Masters mede 1,3–2,6 MB). Dez players = ~12 MB e o LCP
sai de "bom" para "ruim" sozinho. O `VideoFacade.tsx` atual já resolve isso a
~0,6 KB. **Qualquer padrão novo precisa manter a invariante: no máximo UM iframe
existe no DOM ao mesmo tempo.**

O desenho de "palco único" que recomendo é mais forte que a grade atual nesse
quesito: hoje a grade permite o usuário abrir 6 iframes simultâneos clicando em
todos. Com palco único isso é **estruturalmente impossível** — trocar de vídeo
desmonta o iframe anterior.

Thumbnails do YouTube, medidas:

| arquivo | dimensão | proporção | uso |
|---|---|---|---|
| `mqdefault.jpg` | 320×180 | **16:9 limpo** | trilho de miniaturas |
| `hqdefault.jpg` | 480×360 | 4:3 com tarjas pretas | serve se cortado com `object-cover` (é o que o código atual faz, e funciona) |
| `sddefault.jpg` | 640×480 | 4:3 com tarjas | — |
| `maxresdefault.jpg` | 1280×720 | 16:9 limpo | palco — **mas não existe para todo vídeo**, precisa de fallback |

---

## 3. Lightbox moderno: `<dialog>`, `popover` ou biblioteca?

### 3.1 Suporte real, medido

`<dialog>` — **Baseline widely available**. Low date 2022-03-14, high date 2024-09-14.

| navegador | versão | data |
|---|---|---|
| Chrome / Chrome Android | 37 | 2014-08-26 |
| Edge | 79 | 2020-01-15 |
| Firefox / Firefox Android | 98 | 2022-03-08 |
| **Safari / Safari iOS** | **15.4** | **2022-03-14** |

Popover API — **Baseline newly available**, low date 2025-01-27.

| navegador | versão | data |
|---|---|---|
| Chrome / Chrome Android | 116 | 2023-08-15 |
| Edge | 116 | 2023-08-21 |
| Firefox / Firefox Android | 125 | 2024-04-16 |
| Safari (desktop) | 17 | 2023-09-18 |
| **Safari iOS** | **18.3** | **2025-01-27** |

O detalhe do iOS importa para nós: o *light dismiss* (fechar clicando fora)
estava quebrado no iOS/iPadOS e **só foi corrigido no Safari 18.3**. Um iPhone
que não atualizou desde 2024 abre o popover e não consegue fechar clicando fora.
`<dialog>` não tem esse buraco — está sólido desde o iOS 15.4, quatro anos atrás.

`<dialog closedby>` — **limited**: Chrome 134, Firefox 141, **Safari ausente**.
Ou seja, `closedby="any"` (clique fora fecha) **não funciona no iOS hoje**. Tem
que implementar o clique no backdrop na mão. Duas linhas, mas não dá para pular.

### 3.2 O que cada um entrega de graça

|  | `<dialog>` + `showModal()` | `popover` |
|---|---|---|
| top layer | sim | sim |
| `::backdrop` | sim | sim |
| **prende o foco** | **sim** | **não** |
| **`inert` no fundo** | **sim** (automático) | **não, a página fica viva** |
| Esc fecha | sim | sim |
| light dismiss (clique fora) | não por padrão (precisa de `closedby`, sem Safari) | sim (auto) |
| devolve o foco ao invocador | sim | sim |
| abre sem JS | só com `command`/`commandfor` | **sim**, `popovertarget` |

A regra que a comunidade convergiu, e que eu assino: *se clicar fora e ignorar
for aceitável, é popover; se clicar fora e ignorar for um bug, é dialog.*

**Um vídeo tocando é modal por definição** — o resto da página não pode continuar
navegável e lida por leitor de tela atrás de um vídeo em reprodução. Então:
**lightbox de vídeo = `<dialog>` + `showModal()`. Não é popover.**

### 3.3 Biblioteca: vale a pena?

`photoswipe` 16,6 KB gzip, `yet-another-react-lightbox` 16,4 KB gzip. Ambas
resolvem coisas que **não temos**: pinch-zoom em imagem de alta resolução,
galeria com swipe entre slides dentro do lightbox, deep-link por hash. Para
"abrir um iframe de 16:9 numa caixa preta", é 16 KB para não escrever 25 linhas.
**Não compensa.** `<dialog>` nativo faz o serviço a ~0,4 KB.

### 3.4 Veredito do item 3

Para a Rapa Sound eu **não uso lightbox na galeria principal**. Num telefone o
palco já ocupa a largura toda; abrir um modal por cima do palco é uma camada sem
ganho e um toque a mais entre o cliente e o vídeo. O `<dialog>` fica reservado
para: (a) os 4 depoimentos, que são conteúdo secundário e não merecem tomar a
seção; (b) o menu de seções da Parte 2. Código nos anexos A e D.

---

## 4. Carrossel: scroll-snap puro e os CSS Carousels novos

### 4.1 `scroll-snap` — **Baseline widely available desde 2020-01-15**

Chrome 69, Firefox 68, Safari 11, Safari iOS 11. Zero risco, zero KB.
É a base do trilho.

Detalhes que a maioria erra:

- `scroll-snap-type: x proximity`, **não `mandatory`**. `mandatory` causa problema real de acessibilidade — prende o scroll e atrapalha quem usa lupa ou tem controle motor reduzido.
- `scroll-snap-stop: always` nos itens impede que um *flick* rápido pule miniaturas.
- `scroll-padding-inline` no contêiner faz o item focado por Tab parar na posição certa em vez de colar na borda.
- `overscroll-behavior-inline: contain` impede o scroll do trilho de "vazar" e rolar a página inteira. **Atenção ao BCD**: até Chrome 143 e Firefox 149 a propriedade tem `partial_implementation` — não faz efeito em contêiner sem overflow rolável. Chrome 144 e Firefox 150 corrigiram; Safari 16+ ainda consta como parcial. No nosso caso o trilho **sempre** tem overflow, então funciona em todos.

### 4.2 CSS Carousels (`::scroll-button()`, `::scroll-marker`) — **não use como base**

Dados crus do webstatus.dev:

| feature | status | onde existe |
|---|---|---|
| Scroll markers (`::scroll-marker`, `scroll-marker-group`) | **limited** | Chrome/Chrome Android **135** (2025-04-01), Edge 135 |
| `::scroll-button` | **limited** | Chromium apenas |
| `scroll-marker-targets` (`:target-current`) | **limited** | Chrome 142 (2025-10-28), Edge 142 |
| `scroll-target-group` | **limited** | Chrome 140 (2025-09-02), Edge 140 |

**Firefox e Safari não implementaram nenhuma delas.** Com ~25% do nosso tráfego
em Safari iOS, isso não é base — é enfeite.

A boa notícia é que degradam de forma perfeita: o contêiner continua sendo um
scroller normal, as setas e bolinhas simplesmente não aparecem. Então entram
dentro de `@supports` e custam **0 KB**. E onde funcionam, o browser entrega
sozinho os papéis ARIA (os marcadores viram `tablist`), a ordem de tabulação e o
comportamento de focusgroup — coisa que nenhuma lib JS faz tão bem.

O `scroll-target-group` + `:target-current` merece nota separada: é *scrollspy
sem JavaScript nenhum*, duas linhas de CSS. Volto nele na Parte 2, item 8.

```css
/* progressive enhancement, 0 KB, some no Safari/Firefox sem quebrar nada */
@supports selector(::scroll-button(*)) {
  .trilho { scroll-marker-group: after; }
  .trilho::scroll-button(inline-start) { content: "‹" / "Anterior"; }
  .trilho::scroll-button(inline-end)   { content: "›" / "Próximo"; }
  .trilho::scroll-button(*) {
    inline-size: 2.75rem; block-size: 2.75rem;   /* 44px, alvo de toque */
    background: var(--color-off); color: var(--color-branco);
    border: 1px solid var(--color-rule);
  }
  .trilho::scroll-button(*):disabled { opacity: .35; }
  .trilho > li::scroll-marker {
    content: ""; inline-size: 3px; block-size: .75rem;
    background: var(--color-rule);                /* o pixel do tubo, apagado */
  }
  .trilho > li::scroll-marker:target-current { background: var(--color-ambar); }
}
```

---

## 5. Como sites reais de produtora e de fotógrafo apresentam acervo de vídeo

Oito sites vivos, cada URL conferida duas vezes: `curl` para status HTTP e HTML
cru (é assim que se responde "usa fachada?" — pelo markup servido, não por
impressão), e um fetch renderizado para confirmar que a página existe de verdade.
Awwwards, Godly e Land-book serviram de ponto de partida; o que entrou na lista
foi só o que respondeu 200 com galeria funcionando.

### 5.1 Os oito

**1. RB2 Produtora** — `https://www.rb2produtora.com.br/` · Jundiaí/SP, casamento e 15 anos
*200, 61.803 bytes.* **É o mais parecido com o nosso caso, de longe.** Grade de
18 thumbnails → clique abre lightbox de tela cheia. Fachada exemplar: cada card é
`<div class="vid-card" data-vimeo="1049318671" data-cat="casamento">` com poster
estático do `i.vimeocdn.com`, e existe **um único `<iframe id="lbFrame" src="">`
vazio** na página, preenchido só no clique:

```js
card.addEventListener('click', () => {
  lbFrame.src = "https://player.vimeo.com/video/" + card.dataset.vimeo + "&autoplay=1…"
  lb.classList.add('open')
})
function closeLb(){ lb.classList.remove('open'); lbFrame.src = "" }   // zera o src ao fechar
```

Vimeo. **Tem chips de filtro de verdade** — `<div class="filter-bar">` com
`data-filter="all|casamento|15anos"`, rotulados **Todos / Casamentos / 15 Anos**,
casados com o `data-cat` de cada card. É literalmente o filtro que precisamos.
Feito na mão, sem framework.
*Bug para não copiar:* montam a URL com `+ id + "&autoplay=1"`, sem `?` — sai
`.../video/1049318671&autoplay=1`, query malformada. No nosso código, `?autoplay=1`.
*O que roubar:* um iframe compartilhado, `src=""` ao fechar, e os chips por `data-cat`.

**2. Partizan** — `https://www.partizan.com/`
*200.* Grade de cards de projeto com **preview em hover** e trilhos "Prev/Next".
36 `<video>` no HTML e **nenhum com `src` ativo** — todos carregam `data-src` e
nascem invisíveis:

```html
<video data-src="…/Michel-Gondry_Chanel_Handbag-25_800px.mp4"
       class="card-work-video absolute-full object-cover opacity-0 …"
       playsinline muted loop>
```

mp4 **self-hosted**, encodes de 800px de largura, zero iframe, zero terceiro.
`playsinline` em todos. Sem barra de filtro; a categoria é uma tag no card.
*O que roubar:* o padrão `data-src` + `opacity-0` é a fachada mais limpa que vi
para preview em loop.

**3. Old North Film Company** — `https://www.oldnorthfilmcompany.com/portfolio/`
*200, 710.527 bytes.* Grade → lightbox Fancybox (570 referências a `fancybox`).
**Duas fachadas ao mesmo tempo:** `rll-youtube-player` × 11 (a fachada do WP
Rocket: thumb do `img.youtube.com` + play, iframe só no clique) e o template do
Fancybox com `<iframe class="fancybox-iframe" src="">` vazio. Mistura Vimeo,
YouTube e mp4/webm próprios em loop mudo. Sem chips — as categorias são páginas
separadas. *Serve como referência de "o que a stack WordPress te dá de graça".*

**4. Worth It Docs** — `https://www.worthitdocs.com/films/`
*200.* **Coluna vertical única, não grade** — tipografia grande, uma linha por
filme com título, duração e `(PLAY)`. Editorial, bonito, e muito mais leve de
projetar que uma grade. Fachada nativa do Webflow: os 22 embeds existem como HTML
escapado dentro de `data-*` e nenhum iframe carrega no page view. Vimeo via
embedly, posters do `i.vimeocdn.com`. Tem um gatilho separado só para mobile
(`lightbox-link-15---mobile`). Sem chips.
*O que roubar:* a ideia de que "lista vertical com tipografia grande" pode ser
mais forte que grade — e casa melhor com a nossa direção tipográfica.

**5. Taylor Cut Films** — `https://www.taylorcutfilms.com/ourwork`
*200.* Grade paginada (7 páginas, Previous/Next) → lightbox. As flags no `body`
descrevem a configuração inteira: `gallery-design-grid`, `lightbox-style-dark`,
`gallery-navigation-thumbnails`, `gallery-aspect-ratio-169-widescreen`. Fachada
do Squarespace — o iframe fica escapado num atributo e só é parseado no clique:

```html
<div class="sqs-video-wrapper" data-html="&lt;iframe … src=&quot;//www.youtube.com/embed/8eDgZtFJqoU?…&quot;…">
```

YouTube com `enablejsapi=1`. Categoria por página (Commercials / Music Videos /
Films) mais tags secundárias. *Nota:* `gallery-navigation-thumbnails` é o nome
que o Squarespace dá exatamente ao padrão do item 2.

**6. NOTW Films** — `https://notwfilms.com/`
*200.* Slider horizontal de projetos com preview em loop + grade estática abaixo.
**Não usa fachada nos previews** — autoplay imediato — mas é self-hosted e barato.
Markup interessante, escolhe o formato por browser:

```html
<video class="project-slider__item-video" muted autoplay loop preload playsinline
  data-webm="…/chimo_website_loop_v1-720p.webm"
  data-mp4="…/chimo_website_loop_v1-720p.mp4">
```

13 `<video>`, loops em 720p. Um Vimeo só, para o filme completo. Sem chips.

**7. Chapman Films** — `https://chapman-films.com/featured-films`
*200, 62.313 bytes.* **Entra na lista como contraexemplo.** Coluna de 6 filmes
de casamento com **os 6 iframes do Vimeo hard-coded no HTML servido**, todos
carregando de imediato:

```html
<iframe title="1024594840" src="//player.vimeo.com/video/1024594840?api=1&color=404040" …>
```

Seis players do Vimeo bootando num page load. É exatamente o que a fachada evita,
e é exatamente o que o site antigo da Rapa fazia com 10.
Na home eles usam outro truque útil: `player.vimeo.com/video/1167372130?autoplay=1&background=1&muted=1&quality=1080p`
— o `background=1` remove toda a cromagem do player. (Não serve para nós: o
YouTube não tem equivalente limpo e a gente quer o clique explícito.)

**8. Iris Films** — `https://www.iris-films.com/portfolio`
*200, 864.554 bytes.* Lista seccionada por categoria — **WEDDINGS / EVENTS /
CORPORATE** — cada seção com o próprio **"Load More"**. Fachada por padrão do Wix:
**zero `<iframe>` no HTML servido**, apesar de 49 referências a Vimeo e 123 ao
YouTube; tudo é configuração, thumbnails vêm do `i.vimeocdn.com`, o player monta
no clique. *O que roubar:* "divulgação progressiva por seção" como alternativa a
filtro — em vez de chips, títulos de categoria com "Ver mais".

### 5.2 O que os oito ensinam

1. **6 dos 8 usam fachada.** Os dois que não usam (Chapman, e os previews da NOTW) são os dois mais pesados. **Fachada é o padrão do setor, não uma otimização.** Nossa decisão está alinhada com o mercado, não contra ele.
2. **Existem duas fachadas diferentes, para propósitos diferentes:**
   - *poster → lightbox/palco*, para o filme completo com som (RB2, Worth It Docs, Taylor Cut, Iris, Old North);
   - *poster → loop mudo em hover*, para navegação (Partizan, NOTW).
   A segunda não serve para nós: dez loops mudos em 4G é o mesmo pecado com outro nome, e no telefone não existe hover.
3. **Divisão de hospedagem consistente:** loop de preview é sempre self-hosted em 720–800px; filme completo é sempre Vimeo. **Ninguém self-hospeda o filme completo.** Nós usamos YouTube, o que é uma escolha de SEO e de canal (eles já têm `@RapaSound`), não um erro.
4. **Chips de filtro são raros** — só o RB2 tem. Os outros usam páginas separadas ou títulos de seção. **O RB2 é a referência primária para o requisito "casamento / 15 anos".**
5. **`playsinline` está em 100% dos loops com autoplay.** Sem ele o iOS sequestra para fullscreen.
6. **Reutilize UM iframe e zere o `src` ao fechar** (o RB2 faz certo) em vez de montar um player por card. É a mesma invariante que o `Palco` do Anexo A garante estruturalmente.

### 5.3 Verificados e descartados (para não repetir a busca)

`fingervideo.com` — sem resposta (`000`) · `rmweddingfilms.co.uk` — **403** ·
`cinedirektor.com` — **404** · `seventh.tv` — falha de handshake TLS ·
`wanda.pictures` — DNS não resolve · `composerinvent.com.br/portfolio/` — 200 mas
o corpo é "Nothing Found", galeria quebrada · `produtora7.com.br` — 200, mas a
"galeria" é um feed embedado do Instagram e `/casamentos/` e `/meus-15/` dão 404 ·
`ilcapoproduction.com` — real e no ar, mas o acervo é uma grade estática de 5
cards linkando páginas, sem preview, filtro ou lightbox.

---

## 6 → 10. PARTE 2 — NAVEGAÇÃO MOBILE

## 6. Menu hambúrguer acessível em 2026: o que é obrigatório

Consolidando Level Access, a11y-collective, Erwin Hofman e a APG:

1. **Um `<button type="button">` de verdade.** Não `<div onclick>`, não `<a href="#">`. Botão dá Enter, Espaço e papel de botão de graça.
2. **`aria-expanded="false" | "true"`** no botão, sincronizado com o estado. É o mínimo absoluto.
3. **`aria-controls="id-do-painel"`** apontando para o painel.
4. **Nome acessível estável.** "Menu" ou "Abrir menu" — **não** troque o rótulo para "Fechar" quando abrir; `aria-expanded` já comunica o estado, e trocar o nome faz o leitor de tela anunciar um controle diferente do que o usuário acabou de acionar.
5. **Foco preso no painel aberto.** Tab não pode escapar para trás do overlay. A forma correta hoje **não é** gerenciar `aria-hidden` + `tabindex` na mão: é `inert` no resto (Baseline widely, Safari 15.5 / Chrome 102 / Firefox 112) ou, melhor, `<dialog>.showModal()`, que aplica `inert` sozinho.
6. **Esc fecha.** Grátis com `showModal()`.
7. **Foco volta para o botão ao fechar.** O `<dialog>` já restaura o foco para o invocador; ainda assim vale um `.focus()` explícito porque é 1 linha e blinda contra o caso em que o botão foi re-renderizado.
8. **Travar a rolagem do fundo sem pular o layout.** `overflow: hidden` no `<body>` remove a barra de rolagem no desktop e a página salta uns 15px. A correção moderna é `scrollbar-gutter: stable` no `<html>` (Chrome 94, Firefox 97, **Safari 18.2** — conferido no BCD). No mobile não há barra, então não há salto; o problema lá é outro: **o `overflow:hidden` no body não segura o toque no iOS Safari**, o scroll do fundo passa por baixo. As soluções conhecidas são `position: fixed` no body guardando o `scrollY`, ou — muito mais barato — **fazer o painel não cobrir a tela inteira e usar `overscroll-behavior: contain` nele**, aceitando que o fundo role atrás. Ver item 7.
9. **Uma única fonte de verdade para o estado aberto**, para `aria-expanded`, o atributo `hidden`/`open` e o foco nunca discordarem.
10. **Alvo ≥44×44 px** (WCAG 2.5.5) — já é regra do projeto.
11. **`<nav>` com `<ul>`/`<li>`/`<a>` dentro.** Não use `role="menu"`/`menuitem`: isso é padrão de *menu de aplicação* (tipo barra de menu de editor), não de navegação de site, e faz o leitor de tela anunciar coisa errada.

## 7. Dá para fazer sem JS? Custo de cada caminho

| caminho | abre sem JS | prende o foco | `inert` no fundo | Esc | a11y correta | suporte | custo |
|---|---|---|---|---|---|---|---|
| **checkbox hack** (`<input type=checkbox>` + `<label>` + `~`) | sim | **não** | **não** | **não** | ruim — `<label>` não é botão, não tem `aria-expanded`, passa em teste automático e falha com usuário real | universal desde ~2010 | 0 KB, dívida de a11y |
| **`<details>`/`<summary>`** | sim | **não** | não | não | boa para *acordeão/disclosure*: dá `aria-expanded` e teclado de graça. Errada para *overlay*, porque empurra o layout | universal | 0 KB |
| **`popover` + `popovertarget`** | **sim** | **não** | **não** | sim | boa para dropdown/disclosure flutuante. Como overlay de navegação, deixa a página inteira viva e tabulável atrás | Baseline newly; **Safari iOS só 18.3+** | 0 KB |
| **`<dialog>` + `showModal()`** | não (precisa de JS) | **sim** | **sim** | **sim** | correta para overlay modal | Baseline widely, **Safari iOS 15.4** | ~0,4 KB |
| **`<dialog>` + `command="show-modal" commandfor="…"`** (invoker commands) | **sim** | sim | sim | sim | correta | **Baseline newly, 2025-12-12** — Chrome 135, Firefox 144, **Safari 26.2** | 0 KB, mas exige fallback |

Notas de verificação:

- `<details>` ganhou animação de altura decente com `interpolate-size: allow-keywords`, mas isso anima `height`, que **não é transform nem opacity** — fora das nossas regras.
- Invoker commands (`command`/`commandfor`) é a resposta "certa" do futuro: `<dialog>` completo, zero JS. Só que chegou ao Safari em **26.2 (dezembro de 2025)**. Em agosto de 2026, com público brasileiro em iPhone, ainda há base relevante de iOS 17/18. Serve como *enhancement*, não como base.

**Veredito do item 7:** a resposta honesta é **não, não dá para fazer certo sem
JS hoje** — não sem abrir mão do foco preso, que é justamente o requisito que
separa um menu acessível de um menu que passa no Lighthouse. O caminho correto é
`<dialog>` + `showModal()` a ~0,4 KB gzip, com degradação real sem JS (item 8).

## 8. Alternativas ao hambúrguer numa landing de âncoras

A página tem **8 âncoras** já existentes no `page.tsx` (`#quinze-anos`,
`#casamento`, `#servicos`, `#eventos`, `#rider`, `#sobre`, `#duvidas`,
`#contato`) e um CTA de WhatsApp que precisa estar sempre ao alcance.

### 8.1 Barra inferior fixa

Números que a literatura de 2026 repete: **+25% de engajamento** e **~40% mais
rápido para completar tarefa** trocando hambúrguer por navegação inferior; o
hambúrguer reduz descoberta sistematicamente porque *ninguém toca no que não vê*.
E o consenso ergonômico: em 2026, ignorar a metade inferior da tela é ignorar
onde o polegar mora.

Limite conhecido: barra inferior funciona bem com **3 a 5 alvos**. Temos 8 âncoras
+ CTA = 9. Não cabe direto.

### 8.2 Nav que aparece ao rolar para cima (hide-on-scroll)

Em CSS puro exige scroll-driven animations. Dado cru: `animation-timeline` é
**limited** — Chrome 115, Safari **26** (2025-09-15), e **Firefox consta como
`"preview"` no BCD, ou seja, não enviou em versão estável**. Sem isso, precisa de
~0,5 KB de JS ouvindo scroll. Além do custo, é movimento constante no campo de
visão do usuário durante toda a sessão — briga com a direção do projeto e com o
`prefers-reduced-motion`. **Rejeitado.**

### 8.3 Chips de seção (trilho horizontal rolável de âncoras)

Bom para 8 itens: cabe tudo, é rolável, cada chip é uma âncora real que funciona
sem JS. O estado "seção atual" é o problema — historicamente exige
IntersectionObserver. Hoje há uma saída sem JS nenhum: **`scroll-target-group`
(Chrome 140+) + `:target-current`**, que promove os `<a href="#...">` de um
contêiner a marcadores e o browser marca sozinho o ativo. Duas linhas de CSS,
0 KB. Só Chromium → entra como `@supports`, com o observer de ~0,3 KB como
fallback (ou sem estado ativo nenhum, que também é aceitável).

### 8.4 A combinação que eu recomendo

Nenhum dos três isolado serve. **A barra inferior com 4 alvos, sendo um deles o
disparador do menu completo**, serve — e entrega o hambúrguer que o cliente pediu,
só que colocado onde o polegar está:

```
┌──────────────────────────────────────────────┐
│  15 ANOS   CASAMENTO   ☰ SEÇÕES   [WHATSAPP] │  ← fixo, 56px + safe area
└──────────────────────────────────────────────┘
```

- **15 anos** e **Casamento** são as duas âncoras que vendem — visíveis, sem toque extra, sem menu.
- **Seções** abre um `<dialog>` em folha inferior (*bottom sheet*) com as 8 âncoras. É o hambúrguer, com `aria-expanded`, foco preso, Esc e devolução de foco.
- **WhatsApp** em âmbar, sempre presente. É botão → âmbar, conforme a restrição dura.

Por que folha inferior e não overlay de tela cheia: o briefing proíbe "menu que
ocupa a tela inteira com animação lenta"; a folha sobe do mesmo lugar onde o dedo
tocou (continuidade de origem), fica em `max-height: 72svh`, e a transição é de
220 ms em `translateY`/`opacity`. Além disso, um painel de 72svh com
`overscroll-behavior: contain` contorna o buraco do `overflow:hidden` no iOS sem
precisar do truque de `position:fixed` no body.

## 9. Convivência com o botão flutuante de WhatsApp

O problema clássico é documentado e chato: FAB de WhatsApp cobrindo barra fixa,
cobrindo o botão de compra, brigando por z-index. A solução limpa é não ter dois
elementos disputando o canto inferior direito:

> **Recomendação: mata o FAB flutuante. O WhatsApp vira o quarto slot da barra
> inferior.**

Ganhos concretos:
1. **Zero sobreposição.** Um único elemento fixo no rodapé, um único `padding-bottom` a compensar no `<body>`.
2. **Zero conteúdo coberto.** `body { padding-block-end: calc(3.5rem + env(safe-area-inset-bottom)) }` e nada mais fica escondido — hoje um FAB solto cobre o canto do último card em qualquer viewport curta.
3. **Alvo maior.** Um FAB circular de 56px tem área útil menor que um retângulo de 56px de altura ocupando 40% da largura.
4. **Uma só disputa de z-index**, resolvida de uma vez.
5. **Rótulo de texto**, não só ícone verde — melhor para leitor de tela e para quem não decodifica o glifo.

Se o cliente insistir no FAB redondo separado (ele costuma insistir), a regra é:
FAB no canto **inferior direito** com `inset-block-end: calc(3.5rem + env(safe-area-inset-bottom) + 0.75rem)` — ou seja, empilhado **acima** da barra, nunca sobre ela — e a barra passa a ter 3 slots. Fica pior, mas não fica quebrado.

Sobre a zona do polegar: os 4 alvos ficam todos na faixa inferior. O único
cuidado é o WhatsApp na **extremidade direita**, que é o alcance mais confortável
para destro e o menos confortável para canhoto — em barra de 4 slots iguais a
diferença é irrelevante, todos estão dentro do arco.

## 10. `env(safe-area-inset-bottom)` e a barra de endereço do iOS Safari

### O que quebra

1. **`100vh` mente.** Alguns browsers incluem a altura das barras dinâmicas no cálculo de `100vh`, outros não. Quando a barra de endereço encolhe, o viewport efetivamente cresce e o que está fixado embaixo é empurrado.
2. **`env(safe-area-inset-bottom)` retorna `0` quando a toolbar do Safari está escondida** — bug reportado no fórum da Apple para iOS 15+, em retrato e paisagem. Ou seja: quando o usuário rola e a toolbar some, o inset zera exatamente no momento em que o *home indicator* fica exposto.
3. **`env()` só funciona com `viewport-fit=cover`.** Sem isso o valor é sempre `0`. ✅ Já está no projeto: `viewport: { viewportFit: 'cover' }` no `layout.tsx`.

### Como resolver

Unidades de viewport `svh`/`lvh`/`dvh` — **Baseline widely available desde
2022-12-05**: Chrome 108, Firefox 101, **Safari e Safari iOS 15.4**. Sem risco.

| unidade | comportamento | quando usar |
|---|---|---|
| `svh` | menor viewport (toolbars **visíveis**) | **padrão para qualquer altura fixa.** Nunca corta conteúdo |
| `lvh` | maior viewport (toolbars escondidas) | quase nunca |
| `dvh` | acompanha em tempo real | evita: recalcula durante o scroll, causa *debounce* visível e reflow por quadro |

Regras que aplico aqui:

```css
/* 1. nunca 100vh. A folha usa svh e por isso nunca é cortada. */
.folha { max-block-size: 72svh; }

/* 2. blinda o inset zerado do Safari com um piso mínimo */
:root { --barra-h: 3.5rem; --safe-b: max(env(safe-area-inset-bottom), 0.5rem); }

/* 3. a barra cresce para dentro do safe area em vez de flutuar acima dele */
.barra {
  position: fixed; inset-inline: 0; inset-block-end: 0;
  block-size: calc(var(--barra-h) + var(--safe-b));
  padding-block-end: var(--safe-b);
}

/* 4. o conteúdo nunca fica embaixo da barra */
body { padding-block-end: calc(var(--barra-h) + var(--safe-b)); }

/* 5. âncora não para embaixo de nada */
html { scroll-padding-block-end: calc(var(--barra-h) + var(--safe-b) + 1rem); }

/* 6. sem salto de layout ao travar o scroll (desktop) */
html { scrollbar-gutter: stable; }
```

O item 5 é o que quase todo mundo esquece: sem `scroll-padding-block-end`, clicar
numa âncora do menu leva o topo da seção para o topo da tela, mas o rodapé da
seção fica atrás da barra fixa.

---

# ANEXOS — CÓDIGO

Tudo abaixo usa os tokens de `app/globals.css` (`--color-void`, `--color-off`,
`--color-ambar`, `--color-magenta`, `--color-congo`, `--color-branco`,
`--color-rule`, `--ease-out-cut`, `--ease-tubo`).

Restrição de cor respeitada em todo o código: **magenta e congo só aparecem como
`background` de ambiente ou tinta de moldura. Nenhum `<button>` recebe magenta.
Âmbar é o único acento de botão, de dado e de estado ativo.**

## Anexo A — `components/Palco.tsx` (galeria: palco + trilho)

```tsx
'use client'

import { useCallback, useRef, useState } from 'react'
import type { Video } from '@/lib/conteudo'

/**
 * PALCO — um vídeo grande + trilho de miniaturas selecionáveis.
 *
 * Invariante de performance: NO MAXIMO UM <iframe> existe no DOM.
 * Trocar de item desmonta o iframe anterior. E estruturalmente
 * impossivel abrir 2 players — coisa que a grade antiga permitia.
 *
 * Sem dependencia nova. ~1,6KB gzip a mais que o VideoFacade atual.
 */

const CAPA_RAIL = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`   // 320x180, 16:9 limpo
const CAPA_PALCO = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` // 1280x720
const CAPA_FALLBACK = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`  // 480x360, cortada

export function Palco({ videos, titulo }: { videos: Video[]; titulo: string }) {
  const [i, setI] = useState(0)
  const [tocando, setTocando] = useState(false)
  const palcoRef = useRef<HTMLDivElement>(null)
  const v = videos[i]

  // trocar de video sempre volta para a fachada: um iframe por vez.
  const escolher = useCallback((n: number) => {
    setI(n)
    setTocando(false)
  }, [])

  // preconnect so na intencao de clique — 0,1KB, poupa ~200ms de handshake em 4G
  const aquecer = useCallback(() => {
    if (document.getElementById('yt-preconnect')) return
    const l = document.createElement('link')
    l.id = 'yt-preconnect'
    l.rel = 'preconnect'
    l.href = 'https://www.youtube-nocookie.com'
    document.head.append(l)
  }, [])

  return (
    <div className="relative">
      {/* ---------- PALCO ---------- */}
      <div
        ref={palcoRef}
        className="relative aspect-video w-full overflow-hidden bg-off"
      >
        {tocando ? (
          <iframe
            key={v.id}
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
            title={v.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setTocando(true)}
            onPointerEnter={aquecer}
            onTouchStart={aquecer}
            className="group absolute inset-0 block w-full text-left"
            aria-label={`Assistir: ${v.titulo}`}
          >
            <img
              key={v.id}
              src={CAPA_PALCO(v.id)}
              onError={(e) => { e.currentTarget.src = CAPA_FALLBACK(v.id) }}
              alt=""
              width={1280}
              height={720}
              /* o primeiro palco e LCP: eager. Trocas seguintes ja estao em cache */
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-75
                         transition-opacity duration-300 group-hover:opacity-100"
            />
            {/* botao de play = segmento aceso do tubo. Ambar, nunca magenta. */}
            <span
              aria-hidden
              className="absolute bottom-4 left-4 flex h-11 items-center gap-3 bg-ambar px-4
                         text-void transition-transform duration-300 group-hover:translate-x-1"
            >
              <span className="block h-3 w-[3px] bg-void" />
              <span className="font-mono text-2xs font-medium uppercase tracking-[0.14em]">
                Assistir
              </span>
            </span>
          </button>
        )}
      </div>

      {/* ---------- LEGENDA ----------
          aria-live avisa quem usa leitor de tela que o palco mudou,
          sem roubar o foco do trilho. */}
      <p className="mt-3 min-h-[3rem]" aria-live="polite">
        <span className="block font-sans text-base leading-tight">{v.titulo}</span>
        <span className="lab mt-1 block">
          {v.tipo}{v.local ? ` · ${v.local}` : ''}
        </span>
      </p>

      {/* ---------- TRILHO ---------- */}
      <ul
        className="trilho mt-4 flex snap-x gap-3 overflow-x-auto pb-2"
        aria-label={`Escolha um vídeo — ${titulo}`}
      >
        {videos.map((item, n) => (
          <li key={item.id} className="shrink-0 snap-start">
            <button
              type="button"
              onClick={() => escolher(n)}
              aria-current={n === i ? 'true' : undefined}
              className="mini group relative block w-[8.5rem] sm:w-[10.5rem]"
            >
              <span className="relative block aspect-video overflow-hidden bg-off">
                <img
                  src={CAPA_RAIL(item.id)}
                  alt=""
                  width={320}
                  height={180}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </span>
              {/* o tubo: pixels discretos, acende so no item atual. Sem glow. */}
              <span aria-hidden className="tubo mini-tubo" />
              <span className="mt-2 block px-1 text-left font-sans text-xs leading-snug">
                {item.titulo}
              </span>
              {/* nome acessivel completo sem poluir o visual */}
              <span className="sr-only">
                {n === i ? ' — em exibição' : ` — exibir no palco (${item.tipo})`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

CSS que acompanha, em `@layer components` do `globals.css`:

```css
@layer components {
  /* ---------- TRILHO ----------
     scroll-snap e Baseline widely desde 2020. Zero KB, zero risco.
     `proximity` e nao `mandatory`: mandatory prende o scroll e e
     problema de acessibilidade real para lupa e controle motor. */
  .trilho {
    scroll-snap-type: x proximity;
    scroll-padding-inline: 1rem;         /* Tab para o item na posicao certa */
    overscroll-behavior-inline: contain;  /* nao vaza scroll para a pagina */
    scrollbar-width: none;
  }
  .trilho::-webkit-scrollbar { display: none; }
  .trilho > li { scroll-snap-align: start; scroll-snap-stop: always; }

  /* ---------- MINIATURA ---------- */
  .mini { min-block-size: 2.75rem; }      /* 44px garantido */
  .mini img {
    opacity: .45;
    transition: opacity 220ms var(--ease-out-cut),
                transform 260ms var(--ease-tubo);
  }
  .mini:hover img, .mini:focus-visible img { opacity: .8; }
  .mini[aria-current="true"] img { opacity: 1; }
  .mini[aria-current="true"] > span:first-child { transform: translateY(-2px); }

  /* o tubo da miniatura: 3px de pixels discretos na base.
     Herda .tubo de globals.css e so muda a orientacao. */
  .mini-tubo {
    inset-block: auto 100%;
    inset-inline: 0;
    inline-size: auto;
    block-size: 3px;
    background-image: linear-gradient(
      to right, var(--color-ambar) 0 4px, transparent 4px 10px);
    background-size: 10px 100%;
    background-repeat: repeat-x;
    opacity: 0;
    transition: opacity 220ms var(--ease-out-cut);
  }
  .mini[aria-current="true"] .mini-tubo { opacity: 1; }

  /* ---------- AMBIENTE ----------
     magenta e congo SO como fundo. Nenhum botao encostado neles. */
  .palco-15   { background: color-mix(in srgb, var(--color-magenta) 12%, var(--color-void)); }
  .palco-casa { background: color-mix(in srgb, var(--color-congo)  22%, var(--color-void)); }
}

@media (prefers-reduced-motion: reduce) {
  .trilho { scroll-behavior: auto; }
  .mini img { opacity: 1; transition: none; }
  .mini[aria-current="true"] > span:first-child { transform: none; }
  /* estado ativo continua legivel: some o movimento, fica a cor */
  .mini:not([aria-current="true"]) img { opacity: .55; }
}
```

**Degradação sem JS:** o `Palco` é `'use client'`; sem JS ele renderiza o palco
com a fachada do vídeo 0 e o trilho inteiro, mas os botões não respondem. Para
não entregar uma UI morta, o `page.tsx` mantém uma `<noscript>` com os 10 links
diretos para o YouTube:

```tsx
<noscript>
  <ul className="mt-6 grid gap-2">
    {[...EVENTOS, ...DEPOIMENTOS].map((v) => (
      <li key={v.id}>
        <a className="underline decoration-ambar underline-offset-4"
           href={`https://www.youtube.com/watch?v=${v.id}`}
           target="_blank" rel="noopener">
          {v.titulo} — assistir no YouTube
        </a>
      </li>
    ))}
  </ul>
</noscript>
```

**Custo:** `Palco.tsx` ≈ **1,6 KB gzip**, contra ~0,6 KB do `VideoFacade`.
Delta ≈ **+1,0 KB**. Nenhuma dependência nova. Total de JS de animação/interação
da página fica em ~2 KB dos 60 KB — **3% do teto**.

## Anexo B — filtro por tipo (chips), sem lib

```tsx
const TIPOS = ['Tudo', '15 anos', 'Casamento', 'Depoimento'] as const

// dentro do componente:
const [filtro, setFiltro] = useState<typeof TIPOS[number]>('Tudo')
const lista = filtro === 'Tudo'
  ? todos
  : todos.filter((v) => v.tipo.toLowerCase().startsWith(filtro.toLowerCase().slice(0, 5)))
```

```tsx
<div role="group" aria-label="Filtrar por tipo de evento"
     className="trilho mb-4 flex gap-2 overflow-x-auto">
  {TIPOS.map((t) => (
    <button key={t} type="button" onClick={() => { setFiltro(t); setI(0); setTocando(false) }}
      aria-pressed={filtro === t}
      className="h-11 shrink-0 border border-rule px-4 font-mono text-2xs uppercase
                 tracking-[0.14em] text-branco-2
                 aria-pressed:border-ambar aria-pressed:text-ambar">
      {t}
    </button>
  ))}
</div>
```

`aria-pressed:` é variante nativa do Tailwind v4. Estado ativo em **âmbar**, como
manda a restrição. Reduzir o filtro reseta o palco para o item 0 e desmonta o
iframe — a invariante continua valendo.

## Anexo C — lightbox `<dialog>` para os 4 depoimentos (opcional)

```tsx
'use client'
import { useRef, useState } from 'react'
import type { Video } from '@/lib/conteudo'

export function Depoimento({ video }: { video: Video }) {
  const d = useRef<HTMLDialogElement>(null)
  const b = useRef<HTMLButtonElement>(null)
  /* estado, NAO `d.current?.open`: ler um ref durante o render nao
     dispara re-render e o iframe nunca apareceria. */
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button ref={b} type="button"
              onClick={() => { setAberto(true); d.current?.showModal() }}
              className="group relative block aspect-video w-full overflow-hidden bg-off">
        <img src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} alt=""
             width={320} height={180} loading="lazy" decoding="async"
             className="h-full w-full object-cover opacity-70 transition-opacity
                        duration-300 group-hover:opacity-100" />
        <span className="sr-only">Ver depoimento de {video.titulo}</span>
      </button>

      <dialog
        ref={d}
        /* closedby="any" seria o certo, mas e `limited`: Chrome 134 e
           Firefox 141 apenas — Safari NAO tem. Logo, clique-fora na mao. */
        onClick={(e) => { if (e.target === d.current) d.current?.close() }}
        /* onClose cobre Esc, backdrop e o form method="dialog" de uma vez:
           desmonta o iframe (mata o audio e a rede) e devolve o foco. */
        onClose={() => { setAberto(false); b.current?.focus() }}
        className="lb"
      >
        {/* o iframe so entra no DOM depois que o dialog abre */}
        {aberto && (
          <iframe className="aspect-video w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.titulo} allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen />
        )}
        <form method="dialog">
          <button className="mt-3 h-11 bg-ambar px-4 font-mono text-2xs uppercase
                             tracking-[0.14em] text-void">Fechar</button>
        </form>
      </dialog>
    </>
  )
}
```

```css
.lb {
  inline-size: min(92vw, 64rem);
  padding: 1rem;
  background: var(--color-void);
  border: 1px solid var(--color-rule);
  color: var(--color-branco);
}
.lb::backdrop { background: color-mix(in srgb, var(--color-void) 88%, transparent); }

/* animar dialog exige @starting-style + allow-discrete.
   Baseline newly desde 2024-08-06: Safari 17.4/17.5, Chrome 117, Firefox 129.
   So transform e opacity. */
.lb {
  opacity: 0; transform: translateY(8px) scale(.99);
  transition: opacity 200ms var(--ease-out-cut),
              transform 200ms var(--ease-tubo),
              overlay 200ms allow-discrete,
              display 200ms allow-discrete;
}
.lb[open] { opacity: 1; transform: none; }
@starting-style { .lb[open] { opacity: 0; transform: translateY(8px) scale(.99); } }

@media (prefers-reduced-motion: reduce) {
  .lb, .lb[open] { transition: none; opacity: 1; transform: none; }
}
```

**Custo:** ~0,4 KB gzip. `showModal()` entrega top layer, `::backdrop`, foco
preso, `inert` no fundo e Esc — de graça, sem nenhuma linha de focus-trap.

## Anexo D — `components/NavInferior.tsx` (barra + folha de seções)

```tsx
'use client'

import { useRef, useState } from 'react'
import { CONTATO } from '@/lib/conteudo'

const SECOES = [
  { id: 'quinze-anos', rot: '15 anos' },
  { id: 'casamento',   rot: 'Casamento' },
  { id: 'servicos',    rot: 'Serviços' },
  { id: 'eventos',     rot: 'Veja como fica' },
  { id: 'rider',       rot: 'Rider técnico' },
  { id: 'sobre',       rot: 'Sobre a Rapa' },
  { id: 'duvidas',     rot: 'Dúvidas' },
  { id: 'contato',     rot: 'Contato' },
]

export function NavInferior() {
  const folha = useRef<HTMLDialogElement>(null)
  const gatilho = useRef<HTMLButtonElement>(null)
  const [aberta, setAberta] = useState(false)

  const abrir = () => { folha.current?.showModal(); setAberta(true) }
  const fechar = () => folha.current?.close()

  return (
    <>
      {/* ---------- BARRA ----------
          <nav> + <ul> + <a>. Nada de role="menu": isso e padrao de
          menu de aplicacao, nao de navegacao de site. */}
      <nav className="barra" aria-label="Navegação principal">
        <ul className="barra-grade">
          <li><a className="alvo" href="#quinze-anos">15 anos</a></li>
          <li><a className="alvo" href="#casamento">Casamento</a></li>
          <li>
            <button
              ref={gatilho}
              type="button"
              className="alvo"
              onClick={abrir}
              aria-expanded={aberta}
              aria-controls="folha-secoes"
            >
              <span aria-hidden className="hamb" />
              Seções
            </button>
          </li>
          <li>
            <a className="alvo alvo-cta" href={CONTATO.whatsappLink}
               target="_blank" rel="noopener">WhatsApp</a>
          </li>
        </ul>
      </nav>

      {/* ---------- FOLHA ---------- */}
      <dialog
        ref={folha}
        id="folha-secoes"
        aria-label="Seções da página"
        className="folha"
        onClick={(e) => { if (e.target === folha.current) fechar() }}
        onClose={() => { setAberta(false); gatilho.current?.focus() }}
      >
        <div className="folha-corpo">
          <p className="lab mb-3">Ir para</p>
          <ul className="grid gap-px bg-rule">
            {SECOES.map((s) => (
              <li key={s.id} className="bg-void">
                <a className="folha-item" href={`#${s.id}`} onClick={fechar}>
                  <span aria-hidden className="pix" />
                  {s.rot}
                </a>
              </li>
            ))}
          </ul>
          <form method="dialog" className="mt-4">
            <button className="alvo w-full bg-off text-branco-2">Fechar</button>
          </form>
        </div>
      </dialog>
    </>
  )
}
```

```css
@layer components {
  :root {
    --barra-h: 3.5rem;                                   /* 56px */
    --safe-b: max(env(safe-area-inset-bottom), 0.5rem);  /* blinda o bug do Safari */
    --barra-total: calc(var(--barra-h) + var(--safe-b));
  }

  /* nada de conteudo por baixo da barra, e ancora nao para atras dela */
  body { padding-block-end: var(--barra-total); }
  html { scroll-padding-block-end: calc(var(--barra-total) + 1rem);
         scrollbar-gutter: stable; }

  .barra {
    position: fixed; inset-inline: 0; inset-block-end: 0; z-index: 60;
    background: color-mix(in srgb, var(--color-off) 94%, transparent);
    backdrop-filter: blur(10px);
    border-block-start: 1px solid var(--color-rule);
    padding-block-end: var(--safe-b);
  }
  .barra-grade {
    display: grid; grid-template-columns: repeat(4, 1fr);
    max-inline-size: 40rem; margin-inline: auto;
  }
  /* >=48rem a barra some: no desktop o header comum ja resolve */
  @media (min-width: 48rem) { .barra { display: none; } body { padding-block-end: 0; } }

  .alvo {
    display: flex; align-items: center; justify-content: center; gap: .5rem;
    inline-size: 100%; block-size: var(--barra-h);   /* 56px > 44px exigidos */
    font-family: var(--font-mono); font-size: var(--text-2xs);
    letter-spacing: .12em; text-transform: uppercase;
    color: var(--color-branco-2);
    transition: color 180ms var(--ease-out-cut);
  }
  .alvo:hover, .alvo:focus-visible { color: var(--color-branco); }

  /* CTA: ambar. Botao SEMPRE ambar — magenta nunca encosta num botao. */
  .alvo-cta {
    background: var(--color-ambar); color: var(--color-void); font-weight: 700;
  }

  /* hamburguer: tres pixels do tubo, nao tres tracos genericos.
     Vira X sem animar largura — so transform. */
  .hamb, .hamb::before, .hamb::after {
    content: ""; display: block; inline-size: 14px; block-size: 2px;
    background: currentColor;
    transition: transform 200ms var(--ease-out-cut), opacity 200ms linear;
  }
  .hamb { position: relative; }
  .hamb::before { position: absolute; inset-block-start: -5px; }
  .hamb::after  { position: absolute; inset-block-start:  5px; }
  [aria-expanded="true"] .hamb          { opacity: 0; }
  [aria-expanded="true"] .hamb::before  { transform: translateY(5px) rotate(45deg); opacity: 1; }
  [aria-expanded="true"] .hamb::after   { transform: translateY(-5px) rotate(-45deg); opacity: 1; }

  /* ---------- FOLHA INFERIOR ----------
     NAO e overlay de tela cheia: 72svh, sobe do rodape, 220ms.
     svh e nao vh: com vh o iOS corta o topo quando a toolbar recolhe. */
  .folha {
    margin: auto auto 0;                 /* cola no rodape, centrada */
    inline-size: min(100%, 34rem);
    max-block-size: 72svh;
    background: var(--color-void);
    border: 1px solid var(--color-rule);
    border-block-end: none;
    color: var(--color-branco);
    padding: 0;
  }
  .folha::backdrop { background: color-mix(in srgb, var(--color-void) 82%, transparent); }
  .folha-corpo {
    overflow-y: auto;
    overscroll-behavior: contain;        /* nao encadeia scroll para o fundo */
    padding: 1.25rem 1rem calc(1rem + var(--safe-b));
  }
  .folha-item {
    display: flex; align-items: center; gap: .875rem;
    block-size: 3rem;                    /* 48px */
    padding-inline: .75rem;
    font-family: var(--font-sans); font-size: var(--text-base);
    color: var(--color-branco);
  }
  .pix { inline-size: 3px; block-size: .875rem; background: var(--color-rule); }
  .folha-item:hover .pix, .folha-item:focus-visible .pix { background: var(--color-ambar); }

  /* transicao: so transform e opacity, com @starting-style */
  .folha {
    opacity: 0; transform: translateY(12px);
    transition: opacity 220ms var(--ease-out-cut),
                transform 220ms var(--ease-tubo),
                overlay 220ms allow-discrete,
                display 220ms allow-discrete;
  }
  .folha[open] { opacity: 1; transform: none; }
  @starting-style { .folha[open] { opacity: 0; transform: translateY(12px); } }

  /* ---------- SCROLLSPY SEM JS ----------
     scroll-target-group + :target-current. Chrome/Edge 140+.
     Firefox e Safari ignoram e nada quebra: 0 KB, puro enhancement. */
  @supports (scroll-target-group: auto) {
    .barra-grade { scroll-target-group: auto; }
    .barra-grade a:target-current { color: var(--color-ambar); }
  }
}

@media (prefers-reduced-motion: reduce) {
  .folha, .folha[open] { transition: none; opacity: 1; transform: none; }
  .hamb, .hamb::before, .hamb::after { transition: none; }
  .alvo { transition: none; }
}
```

**Sem JS:** os três primeiros slots da barra são `<a href="#...">` puros e
funcionam. O quarto é um link externo para o WhatsApp — funciona. Só o botão
"Seções" fica inerte, e para isso o projeto já tem o gancho `.no-js` no `<html>`:

```css
.no-js .barra-grade { grid-template-columns: repeat(3, 1fr); }
.no-js .barra-grade li:has(> button) { display: none; }
```

Sem JS a barra vira 15 anos / Casamento / WhatsApp — perde uma feature, não
apresenta nada quebrado. As 8 âncoras continuam alcançáveis pelo `<nav>` do
rodapé, que é HTML estático.

**Caminho futuro, 0 KB:** quando a base de iOS 26.2+ justificar, o gatilho vira
`<button command="show-modal" commandfor="folha-secoes">` e o `showModal()` some
do bundle. Invoker commands é **Baseline newly desde 2025-12-12** (Chrome 135,
Firefox 144, Safari 26.2). Hoje ainda precisa do fallback, então não compensa.

**Custo:** `NavInferior.tsx` ≈ **0,9 KB gzip**. CSS ≈ 1,3 KB gzip (não conta no
teto de JS). Nenhuma dependência.

---

# ORÇAMENTO FINAL

| item | JS gzip |
|---|---|
| `Reveal` + anti-FOUC (hoje) | ~1,0 KB |
| `Palco.tsx` (substitui `VideoFacade`) | +1,0 KB |
| `Depoimento.tsx` (dialog, opcional) | +0,4 KB |
| `NavInferior.tsx` | +0,9 KB |
| **total** | **~3,3 KB de 60 KB — 5,5% do teto** |

Zero dependência nova. Zero `framer-motion` (60,1 KB), zero `embla` (7,1 KB),
zero `photoswipe` (16,6 KB), zero `swiper` (19,4 KB).

# CHECKLIST DAS PROIBIÇÕES

| proibido | como fica |
|---|---|
| menu de tela cheia com animação lenta | folha de 72svh, 220 ms, `translateY` + `opacity` |
| carrossel com autoplay | nenhum autoplay em lugar nenhum; o trilho só anda no dedo |
| galeria que carrega todos os players | um `<iframe>` por vez, garantido pela estrutura do `Palco` |
| glow de neon | nenhum `box-shadow` colorido, nenhum `filter: blur` de cor. O tubo é `linear-gradient` de pixels discretos |
| magenta em botão | os únicos usos de magenta/congo são `background` de seção via `color-mix` |
| `100vh` | `svh` em toda altura fixa |
| `width`/`height`/`top`/`left` animados | só `transform` e `opacity` |
