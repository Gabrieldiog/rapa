# 03 — Conversão, SEO local e LGPD
### Pesquisa aplicada à landing page única da Rapa Sound (Uberlândia/MG)

Data da pesquisa: **agosto de 2026**.
Método: busca na web com validação em fonte oficial sempre que o assunto for norma técnica ou métrica
(Google Search Central, schema.org, web.dev, developer.chrome.com, gov.br/ANPD, faq.whatsapp.com,
developers.facebook.com). Onde não existe dado público confiável, isso está **declarado**, não estimado
em silêncio.

**Hierarquia de público adotada em todo o documento** (corrigida por evidência, não por briefing):

| # | Público | Quem decide | Evidência |
|---|---|---|---|
| 1 | **Festa de 15 anos** | **A mãe da debutante** | 4 de 4 depoimentos em vídeo; 3 de 5 vídeos de evento |
| 2 | Casamento | A noiva | 2 de 5 vídeos de evento; zero depoimento |
| 3 | B2B (produtora, casa de show, prefeitura, RH) | Comprador técnico | Rider com 116 artistas — **hoje não atendido pelo site** |

---

## Os 9 achados que mudam decisão

Se você só ler uma parte deste documento, leia esta.

1. 🔴 **O texto pré-preenchido do WhatsApp está com acento cru na URL e retorna HTTP 400 quando enviado
   literalmente.** Falha intermitente e invisível — funciona no browser comum, quebra em webview
   in-app, encurtador e QR code. **A correção mais barata e mais concreta de todo o projeto.** (§3.1)
2. 🔴 **O `WKWebView` do Instagram não processa universal links.** O tráfego vem quase todo do link na
   bio; nesse contexto o `wa.me` **não abre o app** — cai numa página de intermediação. Provavelmente
   o maior vazamento de conversão do funil, e invisível em qualquer teste de desktop. (§3.2)
3. 🔴 **O FAQ rich result foi encerrado pelo Google em 07/05/2026 — para todo mundo.** `FAQPage` virou
   schema puramente semântico. **Não venda acordeão na SERP como entregável.** A FAQ continua valendo
   muito, mas por outro motivo: passage ranking, AI Overviews e o botão "Ask" que substituiu o Q&A do
   Google Business Profile em nov/2025. (§1.2)
4. 🔴 **O 301 das 13 URLs para âncoras só é legítimo se a landing contiver o conteúdo delas.** Caso
   contrário o Google trata como **soft 404** e a consolidação destrói o pouco de SEO que existe.
   Criar o conteúdo é **pré-requisito do redirect**, não etapa seguinte. (§1.4)
5. **Os 10 embeds de YouTube custam ~5,4 MB e 10 contextos de browsing.** Trocá-los por facade resolve
   LCP, INP **e** LGPD com a mesma implementação — e o Lighthouse 13 **não avisa mais** sobre isso.
   Maior impacto isolado de performance. (§2.3)
6. **O formulário de 4 campos está exatamente em cima do penhasco medido.** Omnisend 2026, 1,24 bilhão
   de exibições: 3 campos = 2,1%, **4 campos = 1,5%** (−29%). Até 3 campos o atrito é desprezível. (§3.4)
7. ⚠️ **Não existe estudo comparando WhatsApp vs formulário em taxa de lead.** A recomendação se
   sustenta em outras evidências, não nessa. Quem afirmar o contrário está citando material de
   fornecedor. O "98% de abertura do WhatsApp" também **não tem fonte primária**. (§3.4)
8. **A exposição de LGPD é baixa em multa e alta em contrato.** O total de multas pecuniárias da ANPD
   desde 2020 soma **R$ 14.400** (um caso), e **nunca houve sanção por cookie ou pixel**. O risco real
   é comercial: **licitação e due diligence B2B exigem conformidade** — e B2B é justamente o público
   que a Rapa Sound quer abrir. (§4.6)
9. **A objeção mais valiosa e menos explorada não é preço — é "a luz vai estragar a foto".** O
   fotógrafo é o influenciador oculto da decisão, os números técnicos existem (2.700–3.200K), e
   **nenhum concorrente local publica uma palavra sobre isso**. A Rapa Sound vende LED, painel, túnel e
   área instagramável: ela vende a foto. (§5.3)

---

# 1. SEO local 2026 numa página única

> Convenção: **[OFICIAL]** = validado em `support.google.com`, `developers.google.com/search`,
> `schema.org`, `httpd.apache.org`, `nginx.org` ou RFC. **[TERCEIRO]** = blog/agência, não é norma.
> **[ESTIMATIVA]** = raciocínio explícito, não dado.

## 1.1 Google Business Profile — o que de fato move o ponteiro

O Google mantém **exatamente três** fatores declarados. **[OFICIAL]**
([support.google.com/business/answer/7091](https://support.google.com/business/answer/7091))

| Fator | Texto oficial |
|---|---|
| **Relevância** | "A relevância determina a melhor combinação entre um Perfil da Empresa e a pesquisa de um usuário." |
| **Distância** | "A distância considera o quanto cada empresa está longe do cliente que faz a pesquisa." |
| **Destaque** | "O destaque é o nível de popularidade de uma empresa." |

E o aviso que mata qualquer promessa de fornecedor:
**"There's no way to request or pay for a better local ranking on Google."**

Ações que o Google **lista nominalmente**: verificar a empresa; manter dados completos e precisos
(endereço, horário, categoria, atributos — *"empresas com informações completas e precisas têm mais
chances de aparecer nos resultados"*); horário atualizado; **gerenciar e responder avaliações**;
adicionar **fotos e vídeos**.

Sobre "destaque", o texto oficial cita links/menções na web + **quantidade de avaliações** + **nota**.
⚠️ **Não há declaração oficial de que "recência > volume" de review.** Isso é correlação de terceiros.

**Categoria** ([answer/3038177](https://support.google.com/business/answer/3038177)): *"Use as few
categories as possible… Choose categories that are as specific as possible."* O teste oficial é
"this business **IS** a" vs "this business **HAS** a", e categorias específicas já implicam as
genéricas — **não empilhe redundância**.
- **Primária** para a Rapa Sound: depende do núcleo do faturamento. Como o inventário mostrou que
  **a maior parte dos 13 serviços é cenografia e LED, não sonorização**, a primária provavelmente
  não é "sonorização". Decisão a levar ao cliente.
- **Secundárias:** locação de equipamento de iluminação, serviço de tecnologia para eventos, locação
  de equipamento para festas. Categoria que a empresa não executa = risco de suspensão.

**Avaliações** ([answer/3474122](https://support.google.com/business/answer/3474122)): o Google
recomenda pedir via link direto ou QR code e responder a todas. **Proibido incentivar** com desconto
ou brinde — *"is considered fake & misleading content and is strictly prohibited"*.
→ Para 15 anos, o pedido deve sair **48–72h após o evento**, e a resposta pública pode trazer contexto
natural do serviço ("obrigado pelos 15 anos da Júlia — painel de LED e pista espelhada").

**Serviços no GBP** ([answer/9455399](https://support.google.com/business/answer/9455399)): permitem
nome, descrição e preço, e *"are viewable on Google Maps"*. Proibido pôr preço ou telefone no **nome**
do serviço. **→ É aqui que se recupera boa parte da cauda longa perdida ao consolidar as 13 URLs.**

**NAP:** não existe um documento do Google com esse nome. O que existe é a exigência de dados
completos e precisos + "destaque" contar menções na web. Divergência não gera penalidade — gera
**ambiguidade de entidade**, que degrada relevância.
⚠️ **A Rapa Sound tem hoje dois endereços diferentes espalhados por 13 páginas.** Isso é exatamente o
caso de ambiguidade. **Bloqueante.**

### Mudanças recentes que importam

| Mudança | Data | Fonte |
|---|---|---|
| Chat e histórico de chamadas removidos do GBP | 31/07/2024 | [TERCEIRO, confirmado] |
| **API My Business Q&A descontinuada**; Q&A público substituído pelo botão **"Ask"** com IA | **03/11/2025** | **[OFICIAL]** [change-log](https://developers.google.com/my-business/content/qanda/change-log) |
| Sitelinks Search Box removida | out/2024 | **[OFICIAL]** [Search Central blog](https://developers.google.com/search/blog/2025/06/simplifying-search-results) |

**Consequência direta:** o Q&A do GBP deixou de ser canal confiável de cauda longa. **O FAQ tem que
morar na página, em HTML visível.** E como o botão "Ask" é alimentado por IA lendo perfil + site,
**o texto do site em linguagem natural passou a valer mais** — o que dá peso extra à seção 5.

⚠️ **Aviso sobre números que circulam:** "GBP = 32% do peso", "reviews = 16%", "AI Overviews em 68%
das queries locais" vêm de blogs de agência e **não têm respaldo oficial**. Não usar em proposta.

## 1.2 Schema numa página estática única

### O que ainda gera rich result em 2026

Galeria oficial atualizada em **15/06/2026**
([search-gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)):
Article, Breadcrumb, Carousel, Event, **Local business**, Organization, Product, Profile page,
Q&A, Review snippet, **Video**, entre outros.

### 🔴 FAQPage — a resposta direta, e ela mudou este ano

1. **08/08/2023** — Google restringe FAQ rich results a *"well-known, authoritative government and
   health websites"*. ([Search Central blog](https://developers.google.com/search/blog/2023/08/howto-faq-changes))
2. **2026 — o Google encerrou completamente:**
   - **07/05/2026:** FAQ rich results deixam de aparecer no Google Search **para todo mundo**,
     inclusive gov/health.
   - **junho/2026:** removido o relatório no Search Console e o suporte no Rich Results Test.
   - **agosto/2026:** removido o suporte na Search Console API.
   ([nota de depreciação oficial](https://developers.google.com/search/docs/appearance/structured-data/faqpage),
   [Search Engine Land](https://searchengineland.com/google-to-no-longer-support-faq-rich-results-476957))

**Em agosto de 2026, ninguém tem elegibilidade a FAQ rich result.** Manter `FAQPage` no JSON-LD é
opcional e **puramente semântico** — o próprio Google diz que se pode remover ou deixar, porque
*"search engines and other systems can better understand your web page"*.

> **Isso NÃO invalida o FAQ da seção 5 — muda o motivo dele existir.** A FAQ em HTML visível continua
> valendo muito (passage ranking, AI Overviews, AI Mode, e o botão "Ask" do GBP). O que muda é a
> expectativa: **não haverá acordeão na SERP.** Não venda isso ao cliente como entregável.

### Service — 100% semântico

Não aparece na galeria de rich results. John Mueller **[TERCEIRO]**: *"you're always welcome to use
structured data to provide better machine-readable context for your pages, which may not always result
in visible changes, but can still help our systems show your pages for relevant queries."*
([SEJ](https://www.searchenginejournal.com/google-uses-unsupported-structured-data/349444/))

→ Para uma landing única com 13 serviços, **`Service` é exatamente o mecanismo certo**: declara 13
entidades distintas dentro de 1 URL sem inventar 13 páginas.

### VideoObject

**[OFICIAL]** ([video structured data](https://developers.google.com/search/docs/appearance/structured-data/video))
- **Obrigatórios:** `name`, `thumbnailUrl`, `uploadDate` (ISO 8601).
- **Recomendados:** `description`, `contentUrl`, `embedUrl`, `duration`, `publisher`.
- Google é literal: *"We recommend that you provide the `contentUrl` property, if possible. This is
  the most effective way for Google to fetch your video content files."*

⚠️ **Ressalva dura para os 10 vídeos da Rapa Sound (todos do YouTube):** o vídeo do YouTube já é
indexado pelo próprio YouTube, e o rich result tende a apontar **para o YouTube, não para a landing**.
Marcar embed rende pouco. O caminho que realmente traz o rich result para o site é **hospedar o MP4 no
próprio domínio/CDN e fornecer `contentUrl`** — o que conflita com a estratégia de facade da §2.3 e
com custo de banda. **Decisão de trade-off a tomar com o cliente**; a recomendação padrão é manter no
YouTube e aceitar que o rich result de vídeo não é um objetivo realista aqui.

### LocalBusiness — qual subtipo

🔴 **`ProfessionalService` está DEPRECIADO.** Verbatim do schema.org: *"The general ProfessionalService
type for local businesses was deprecated due to confusion with Service."*
([schema.org/ProfessionalService](https://schema.org/ProfessionalService)) **Não use.**

`EntertainmentBusiness` = *"A business providing entertainment"*, mas nenhum de seus subtipos descreve
locação de AV, e o schema.org **não tem** tipo para locação de equipamento audiovisual.

**Recomendação:**
```json
"@type": ["LocalBusiness", "EntertainmentBusiness"],
"additionalType": "http://www.productontology.org/id/Audiovisual_equipment_rental"
```
Se `EntertainmentBusiness` parecer exagero, o caminho conservador é **`LocalBusiness` puro +
`additionalType`**. Google aceita os dois; não há penalidade.

### Combinar tudo numa página sem conflito

**[OFICIAL]** ([sd-policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)):
- *"Multiple items on a page means that there is more than one kind of thing on a page."* — suportado.
- *"If there are items that are more helpful when they are linked together… use `@id` in both items."*
  → **sim, use `@graph` com `@id`.**
- 🔴 *"Your structured data must be a true representation of the page content."*
- 🔴 **"Don't mark up content that is not visible to readers of the page."**

> ⚠️ **Esta última regra é a que quebra a maioria das landings consolidadas.** Se você declara 13
> `Service`, os 13 precisam existir como seções reais e visíveis, com texto real. **13 âncoras vazias
> com schema é violação de política.** É exatamente o risco que o `INVENTARIO.md` já apontava ao dizer
> que "como âncora vazia, não melhora nada".

### JSON-LD `@graph` — esqueleto correto

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": "https://rapasound.com.br/#website",
      "url": "https://rapasound.com.br/", "name": "Rapa Sound", "inLanguage": "pt-BR",
      "publisher": { "@id": "https://rapasound.com.br/#org" } },

    { "@type": "WebPage", "@id": "https://rapasound.com.br/#webpage",
      "url": "https://rapasound.com.br/",
      "name": "Som, Iluminação e Painel de LED para Festa de 15 Anos e Casamento em Uberlândia | Rapa Sound",
      "isPartOf": { "@id": "https://rapasound.com.br/#website" },
      "about": { "@id": "https://rapasound.com.br/#org" }, "inLanguage": "pt-BR" },

    { "@type": ["LocalBusiness", "EntertainmentBusiness"],
      "@id": "https://rapasound.com.br/#org",
      "additionalType": "http://www.productontology.org/id/Audiovisual_equipment_rental",
      "name": "Rapa Sound",
      "url": "https://rapasound.com.br/",
      "telephone": "+553491990994",
      "email": "vendas@rapasound.com.br",
      "priceRange": "$$",
      "address": { "@type": "PostalAddress",
        "streetAddress": "CONFIRMAR COM O CLIENTE",
        "addressLocality": "Uberlândia", "addressRegion": "MG",
        "postalCode": "CONFIRMAR", "addressCountry": "BR" },
      "geo": { "@type": "GeoCoordinates", "latitude": -18.91230, "longitude": -48.27560 },
      "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
        "opens": "09:00", "closes": "18:00" }],
      "areaServed": [
        { "@type": "City", "name": "Uberlândia", "@id": "https://www.wikidata.org/wiki/Q170218" },
        { "@type": "City", "name": "Araguari" },
        { "@type": "AdministrativeArea", "name": "Triângulo Mineiro" } ],
      "sameAs": [ "https://www.instagram.com/rapasound",
                  "https://www.facebook.com/rapasoundoficial",
                  "https://www.youtube.com/@RapaSound" ],
      "makesOffer": [
        { "@id": "https://rapasound.com.br/#service-painel-led" },
        { "@id": "https://rapasound.com.br/#service-pista-led" }
      ] },

    { "@type": "Service", "@id": "https://rapasound.com.br/#service-painel-led",
      "name": "Aluguel de Painel de LED para Eventos",
      "serviceType": "Locação de painel de LED",
      "description": "Locação, montagem e operação de painel de LED para festas de 15 anos, casamentos e eventos em Uberlândia e região.",
      "provider": { "@id": "https://rapasound.com.br/#org" },
      "areaServed": { "@type": "City", "name": "Uberlândia" },
      "url": "https://rapasound.com.br/#painel-de-led",
      "mainEntityOfPage": { "@id": "https://rapasound.com.br/#webpage" } },

    { "@type": "VideoObject", "@id": "https://rapasound.com.br/#video-15anos-julia",
      "name": "15 anos Júlia Pacheco — Palácio de Cristal, Uberlândia/MG",
      "description": "…",
      "thumbnailUrl": ["https://i.ytimg.com/vi/wWSYRAXXh8Y/maxresdefault.jpg"],
      "uploadDate": "CONFIRMAR",
      "embedUrl": "https://www.youtube.com/embed/wWSYRAXXh8Y",
      "publisher": { "@id": "https://rapasound.com.br/#org" },
      "isPartOf": { "@id": "https://rapasound.com.br/#webpage" } },

    { "@type": "FAQPage", "@id": "https://rapasound.com.br/#faq",
      "isPartOf": { "@id": "https://rapasound.com.br/#webpage" },
      "mainEntity": [ /* as perguntas da §5.11, texto IDÊNTICO ao visível */ ] }
  ]
}
```

**Notas críticas:**
1. `FAQPage` está no grafo **apenas como semântica** — nenhum rich result após 07/05/2026.
2. ⚠️ **Não há `aggregateRating`.** Só adicione se coletar avaliações **no próprio site**. **Copiar as
   estrelas do Google para o JSON-LD viola a política de "true representation".**
3. Cada `Service` tem `url` com fragmento — semanticamente correto, **mas não cria URL indexável**.
4. Cada `Service` declarado **precisa de seção visível correspondente**.
5. Valide em [Rich Results Test](https://search.google.com/test/rich-results) **e** no
   [validator.schema.org](https://validator.schema.org/) — este último aceita tipos sem rich result,
   como `Service`.

## 1.3 Seções âncora vs páginas separadas

### O Google indexa fragmentos `#`? Não como URLs separadas.

**[OFICIAL]** ([url-structure](https://developers.google.com/search/docs/crawling-indexing/url-structure)):
> *"Don't use fragments to change the content of a page, as Google Search generally doesn't support
> URL fragments."*

**`https://rapasound.com.br/#painel-de-led` não é uma URL indexável.** Para o índice do Google existe
**uma única URL**: `https://rapasound.com.br/`. Todo o link equity e todo o title se concentram ali.

### Jump-to links — existem, são algorítmicos

**[OFICIAL]** ([Search Central 2009](https://developers.google.com/search/blog/2009/09/using-named-anchors-to-identify)).
Receita para aumentar a chance: (1) página longa e multi-tópico quebrada em **seções lógicas
distintas**; (2) cada seção com âncora de **nome descritivo** (não `secao-2-1`) e a página com um
**índice/sumário** linkando essas âncoras; (3) o Google só exibe *"when we think that a link to a
section would be highly useful for a particular query"*.

**Isso é apresentação, não ranqueamento.** Melhora CTR quando a página já ranqueia.

### Passage ranking — o que viabiliza a página única

**[OFICIAL]** ([ranking-systems-guide](https://developers.google.com/search/docs/appearance/ranking-systems-guide)):
> *"Passage ranking is an AI system we use to identify individual sections or 'passages' of a web page
> to better understand how relevant a page is to a search."*

⚠️ **É passage *ranking*, não passage *indexing*.** O Google usa o trecho para ranquear **a página
inteira**; a URL exibida continua sendo a raiz.
([Search Engine Roundtable](https://www.seroundtable.com/google-passage-ranking-not-passage-indexing-30287.html))

→ **É exatamente isso que torna a landing única viável para 13 termos** — desde que cada seção tenha
conteúdo substantivo e autocontido.

### Uma página pode ranquear para 13 termos? Sim, com três limitadores

1. **Um único `<title>` para 13 intenções.** É um dos sinais mais fortes de correspondência de query e
   você só tem um. O Google **pode** reescrever o title usando headings
   ([title-link](https://developers.google.com/search/docs/appearance/title-link)) — o que ajuda
   parcialmente, mas você não controla.
2. **Site diversity:** *"we generally won't show more than two web page listings from the same site in
   our top results"*. Com 1 página você abre mão da chance de ocupar **2 posições** numa SERP.
3. **Diluição de foco.** Página que fala de tudo tem menos densidade de sinal por tópico.

### O que o Google diz sobre a escolha

**John Mueller, 30/09/2021** [TERCEIRO, transcrição]:
> *"If you're starting out, probably having fewer pages is a good idea so that you can be as strong as
> possible in that area. And then over time as you see like we're very good here, you can split off
> individual pages for more niche topics."*
> ([SEJ](https://www.searchenginejournal.com/build-fewer-but-stronger-pages-or-create-lots-of-pages/421587/))

**Isso descreve exatamente a estratégia certa para a Rapa Sound:** comece com uma landing forte, divida
depois, quando um tópico provar tração. As 13 páginas atuais são vazias — **não são o cenário "13
páginas fortes"**, são o pior dos dois mundos.

**Páginas separadas ganhariam quando:** o termo tem volume e intenção própria e o concorrente já tem
página dedicada; o tópico exige mais de 800–1000 palavras genuínas; você quer medir por URL no Search
Console; o serviço tem potencial de link building próprio; ou há **segmentação geográfica**
(Uberlândia vs Uberaba vs Araguari) — nesse caso páginas separadas são quase obrigatórias.

## 1.4 O 301 para âncora — o ponto crítico

### O fragmento é preservado? A regra do RFC

**[OFICIAL — RFC 9110 §10.2.2]** ([rfc-editor.org](https://www.rfc-editor.org/rfc/rfc9110.html#name-location)):
> *"If the Location value provided in a 3xx (Redirection) response does not have a fragment component,
> a user agent MUST process the redirection as if the value inherits the fragment component of the URI
> reference used to generate the target URI."*

**Destrinchando `/painel-de-led/` → `/#painel-de-led`:**

| Ator | O que acontece |
|---|---|
| **Servidor** | O fragmento **nunca chega ao servidor** — o browser não envia `#` na request line. O servidor **injeta** o fragmento no header `Location`. |
| **`Location: /#painel-de-led`** | Tem fragmento próprio → a herança do RFC não se aplica; o browser usa esse fragmento. |
| **Browser** | Segue o 301, carrega `/`, rola até `id="painel-de-led"`. ✅ Funciona em todos os principais. |
| **Googlebot** | **Descarta o fragmento.** Registra 301 de `/painel-de-led/` para `https://rapasound.com.br/`. |

🔴 **Conclusão dura: o fragmento no 301 é puramente UX.** Para SEO, são **13 redirects many-to-one para
a home**.

### O risco de soft 404 — o risco nº 1 desta operação

**[OFICIAL]** ([site-move-with-url-changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)):
> *"Don't redirect many old URLs to one irrelevant single URL destination, such as the home page of the
> new site."* — e isso *"can confuse users and might be treated as a **soft 404** error."*

**A exceção que salva o projeto**, na mesma página:
> *"if you have consolidated content previously hosted on multiple pages to a new single page, you can
> redirect the older URLs to that new, consolidated page."*

🔴 **O 301 das 13 URLs só é legítimo se a landing REALMENTE contiver o conteúdo delas.** Redirecionar
para uma home com um bullet "painel de LED" = soft 404 e perda total.
Evite também cadeias de redirect (máximo 3 hops; o ideal é ir direto ao destino final).

### O que se perde ao consolidar

| Perda | Gravidade | Explicação |
|---|---|---|
| 13 `<title>` distintos → 1 | 🔴 Alta | Sinal forte de correspondência de query. Um title não cobre "sonorização" + "painel de LED" + "pista de LED" + "iluminação 15 anos". |
| **Cauda longa** | 🔴 Alta | Páginas dedicadas capturam variações; menos texto por tópico = menos variações. |
| Profundidade por tópico | 🔴 Alta | 13 seções × 200 palavras = 2.600. 13 páginas × 800 = 10.400. É o material do passage ranking. |
| "Canibalização inversa" | 🟠 Média-alta | Uma URL servindo 13 intenções fica **medíocre em todas**. Sintoma: posição 15–30 para tudo, 1–5 para nada. |
| 13 entry points para backlinks | 🟡 Média | Contrapartida positiva real: **toda autoridade externa se concentra em 1 URL**. É trade-off, não só perda. |
| Granularidade no Search Console | 🟡 Média | Perde relatório por página; migra a análise para filtro por **query**. |
| Ocupar 2 slots na mesma SERP | 🟡 Média | Site diversity permite 2; com 1 URL, impossível. |
| 13 meta descriptions → 1 | 🟡 Média | O Google reescreve com frequência; perda menor. |
| 13 slugs com keyword | 🟢 Baixa | Sinal fraco em 2026. |

### Como mitigar — checklist executável

**Antes de redirecionar**
1. **Baseline no Search Console:** exporte queries e impressões dos últimos 16 meses **de cada uma das
   13 URLs**. É a sua linha de base e a lista do que a landing precisa cobrir. **Faça isso antes de
   qualquer mudança** — depois do 301 o dado por URL some.
2. **Transplante de conteúdo real** — cada seção absorve o conteúdo substantivo da página antiga, não
   um resumo. É o que evita soft 404. (No caso da Rapa Sound as 13 páginas são vazias, então o
   conteúdo tem que ser **criado**, não transplantado — e isso é pré-requisito, não opcional.)

**No HTML**
3. **Seções + IDs descritivos + sumário no topo**: `<section id="painel-de-led"><h2>…</h2></section>`.
4. **H2 = a query.** Como há um único title, use os H2 como títulos alternativos:
   `<h2>Aluguel de pista de LED para casamento em Uberlândia</h2>`, não `<h2>Pista</h2>`.
5. **Title híbrido priorizando head term + cidade**, sem tentar enfiar 13 termos.
6. **Cada seção autocontida:** 250–500 palavras, com pergunta-resposta embutida, faixa de preço, foto
   real e CTA de WhatsApp próprio (com texto pré-preenchido do serviço — ver §3).
7. **Schema `Service` por seção** com `@id` e `url` no fragmento.

**Na infraestrutura**
8. **301, nunca 302**, mantidos por no mínimo 1 ano.
9. **Sem cadeias.** `/painel-de-led/` → `/#painel-de-led` direto.
10. **Sitemap só com a URL nova.** E **apagar `/sample-page/`**.
11. **Monitorar "Soft 404" e "Página com redirecionamento"** no Search Console por 8 semanas.

**Compensação da cauda longa — o mais importante**
12. **GBP Services: crie os 13 serviços nomeados no perfil**, com descrição. Recupera boa parte do que
    se perde. É a compensação mais direta que existe.
13. **Posts e fotos por serviço no GBP**, com legenda descritiva.
14. **Plano B de des-consolidação:** na baseline do passo 1, identifique os **2 a 3 termos de maior
    valor comercial**. Se em 4–6 meses a landing não ranquear top-5 neles, **promova essas seções de
    volta a páginas dedicadas** (mantendo a âncora como link interno). É literalmente o que Mueller
    descreve.

### Apache — o flag `[NE]` é obrigatório

**[OFICIAL]** ([httpd rewrite flags](https://httpd.apache.org/docs/2.4/rewrite/flags.html)):
> *"Omitting the [NE] will result in the # being converted to its hexcode equivalent, `%23`, which will
> then result in a 404 Not Found error condition."*

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  # [NE] = noescape -> impede que "#" vire "%23" (OBRIGATÓRIO)
  RewriteRule ^painel-de-led/?$              /#painel-de-led              [NE,R=301,L]
  RewriteRule ^pista-de-led/?$               /#pista-de-led               [NE,R=301,L]
  RewriteRule ^sonorizacaopalco/?$           /#sonorizacao-e-palco        [NE,R=301,L]
  RewriteRule ^emocoes-15-anos/?$            /#quinze-anos                [NE,R=301,L]
  RewriteRule ^emocoes-casamento/?$          /#casamento                  [NE,R=301,L]
  RewriteRule ^iluminacao-pista/?$           /#iluminacao-pista           [NE,R=301,L]
  RewriteRule ^iluminacao-cenica/?$          /#iluminacao-cenica          [NE,R=301,L]
  RewriteRule ^area-instagramavel/?$         /#area-instagramavel         [NE,R=301,L]
  RewriteRule ^criacao-de-conteudo/?$        /#criacao-de-conteudo        [NE,R=301,L]
  RewriteRule ^efeitos-especiais/?$          /#efeitos-especiais          [NE,R=301,L]
  RewriteRule ^tunel-de-led/?$               /#tunel-de-led               [NE,R=301,L]
  RewriteRule ^projetos-3d-personalizados/?$ /#projetos-3d               [NE,R=301,L]
  RewriteRule ^tubos-de-led/?$               /#tubos-de-led               [NE,R=301,L]
</IfModule>
```

Alternativa com `mod_alias` (não percent-encoda o fragmento), mas cuidado: `Redirect` faz **prefix
match**. Use `RedirectMatch` com `$` para exatidão:
```apache
RedirectMatch 301 ^/painel-de-led/?$ /#painel-de-led
```

**Verificação obrigatória:**
```bash
curl -sI https://rapasound.com.br/painel-de-led/ | grep -i '^location'
# ESPERADO: location: /#painel-de-led
# ERRADO:   location: /%23painel-de-led   <-- faltou [NE]
```

### Nginx — o erro é outro: `#` inicia comentário

**[OFICIAL]** ([nginx beginners guide](https://nginx.org/en/docs/beginners_guide.html)):
*"The rest of a line after the `#` sign is considered a comment."*

```nginx
# ❌ ERRADO — quebra silenciosamente, redireciona só para "/"
location = /painel-de-led/ { return 301 /#painel-de-led; }

# ✅ CORRETO — aspas são OBRIGATÓRIAS
location = /painel-de-led/ { return 301 "/#painel-de-led"; }
location = /painel-de-led  { return 301 "/#painel-de-led"; }
```

Para 13 regras, `map` é mais limpo:
```nginx
map $uri $anchor_redirect {
    default              "";
    "/painel-de-led/"    "/#painel-de-led";
    "/painel-de-led"     "/#painel-de-led";
    "/pista-de-led/"     "/#pista-de-led";
}
server { if ($anchor_redirect) { return 301 $anchor_redirect; } }
```
Verificar com `nginx -t` e o mesmo `curl -sI`.

### A alternativa honesta

Não existe configuração de redirect que preserve **simultaneamente** (a) URL única consolidada e
(b) 13 title tags distintos. **É trade-off de arquitetura, não problema de servidor.**

O caminho intermediário defensável: manter **2 ou 3** das URLs de maior valor comercial como páginas
reais e profundas (200 OK, title/H1 próprios), e consolidar as outras 10–11 em âncoras. O
`INVENTARIO.md` já sinalizava isso como decisão pendente — **esta é a recomendação técnica: consolidar
a maioria, preservar as 2–3 de maior valor, e decidir quais com base na baseline do Search Console.**

## 1.5 Volume e intenção de busca

### 🔴 Não há dado público confiável de volume. Declarado, não estimado em silêncio.

**Não foi encontrado nenhum número de volume de busca confiável e publicamente verificável para
nenhum dos 4 termos, nem para Brasil, nem para Uberlândia.** O que foi testado:

| Fonte | Resultado |
|---|---|
| **Google Trends (API)** | Bloqueado (HTTP 429). E mesmo funcionando **não dá volume absoluto**. |
| **Google Trends (doc oficial)** | Dados normalizados de 0 a 100 e — crítico — **"search terms with low volume appear as '0'"**. Termos locais de nicho quase certamente retornam **0**. ([support.google.com/trends](https://support.google.com/trends/answer/4365533?hl=pt-br)) |
| **Keyword Planner (doc oficial)** | *"Your search volume statistics are rounded."* Contas sem gasto ativo veem **faixas amplas** (ex.: 100–1K), não números. ([support.google.com/google-ads](https://support.google.com/google-ads/answer/3022575)) |
| **Blogs do setor BR** | Nenhum publica volume — são páginas comerciais. |

**Como obter o número real (única via honesta):**
1. **Google Search Console** — o relatório de Desempenho **já mostra impressões reais por query nas 13
   URLs atuais**. É o dado mais confiável que existe para este negócio, e é grátis. **Fonte primária.**
2. Google Ads → Keyword Planner com localização = Uberlândia/MG. **Rode uma campanha com gasto mínimo
   (R$ 20–50) para desbloquear números exatos em vez de faixas.**
3. GBP → Desempenho → "Buscas que exibiram sua empresa".

### Intenção — isso sim é analisável com rigor

| Termo | Intenção | Justificativa | Funil |
|---|---|---|---|
| **"sonorização Uberlândia"** | **Comercial local / transacional** | Modificador geográfico explícito. Quem digita cidade + serviço procura fornecedor. **Dispara local pack quase certamente.** | Fundo |
| **"iluminação para festa de 15 anos"** | **Comercial investigativa, tendendo a informacional** | Sem geo. Mistura quem procura fornecedor com quem procura **inspiração visual** — compete com Pinterest, Instagram e blogs de decoração. SERP com imagem/vídeo. | Meio |
| **"painel de LED para casamento"** | **Comercial investigativa** | Sem geo, com contexto de uso. O usuário avalia **se vale a pena** o painel; ainda comparando. | Meio |
| **"aluguel de pista de LED"** | **Transacional** | **"Aluguel" é o verbo transacional mais forte do português comercial.** Sem geo, mas o Google injeta geo implícito. | Fundo |

**Prioridade comercial, com raciocínio explícito:**
1. **"sonorização Uberlândia"** — geo + serviço = maior taxa de conversão por sessão, mesmo com volume baixo.
2. **"aluguel de pista de LED"** — verbo transacional; o Google adiciona geo automaticamente.
3. **"painel de LED para casamento"** — volume provavelmente maior (público nacional), conversão local menor.
4. **"iluminação para festa de 15 anos"** — provavelmente o maior volume dos quatro e a **pior**
   qualidade de tráfego local: muita busca por inspiração, público nacional, competição com Pinterest.

### **[ESTIMATIVA]** — marcada como tal

- Uberlândia tem ~700 mil habitantes (IBGE) ≈ **0,33% da população brasileira**. Termos com geo
  explícito na cidade tendem a volumes de **dezenas, não centenas**, por mês.
- **[ESTIMATIVA]** "sonorização Uberlândia" provavelmente está na faixa de **10–100 buscas/mês** — a
  faixa que o Keyword Planner exibe para contas sem gasto. **Não confirmado.**
- **Sazonalidade forte e previsível:** 15 anos concentram-se em **julho–dezembro**; casamentos em
  **abril–junho e setembro–novembro**. Qualquer média anual **subestima o pico e superestima a baixa**.
- **Regra estrutural (não número):** em serviço local B2C, a soma da cauda longa supera o head term.
  "sonorização Uberlândia" vale menos que a soma de "quanto custa som e iluminação para festa de 15
  anos", "som e luz para festa Uberlândia", "empresa de sonorização Uberlândia MG" etc. **Isso reforça
  o valor de conteúdo profundo por seção — é a cauda longa que o passage ranking pesca.**
- **Implicação estratégica:** com volumes absolutos baixos, **o local pack do GBP vale mais que a
  posição orgânica**. Para "sonorização Uberlândia" o pack ocupa o topo e leva a maior parte dos
  cliques. **Priorize GBP acima de tudo nesta seção.**

## 1.6 Ordem de prioridade da seção 1

| # | Ação | Impacto |
|---|---|---|
| 1 | **GBP:** categoria primária correta, verificação, **13 serviços nomeados**, fotos reais de eventos em Uberlândia, resposta a 100% das reviews em ≤48h, **um único endereço** | 🔴 Máximo — o local pack domina essas SERPs |
| 2 | **Criar conteúdo real** para as 13 seções **antes** de redirecionar | 🔴 Máximo — evita soft 404 e viabiliza passage ranking |
| 3 | **Baseline do Search Console** das 13 URLs antes de qualquer mudança | 🔴 Máximo — depois some |
| 4 | **301 com `[NE]` (Apache) / aspas (Nginx)** + sumário com âncoras descritivas | 🟠 Alto |
| 5 | **JSON-LD `@graph`** com LocalBusiness+EntertainmentBusiness e 13 `Service` com `@id` | 🟡 Médio — semântico, alimenta AI Overviews e o "Ask" do GBP |
| 6 | **Transcrever os 116 artistas para texto real** (hoje são 2 PNGs) | 🟠 Alto — é a prova social B2B e está invisível para o Google |
| 7 | **Não prometer FAQ rich result** — encerrado em 07/05/2026 | ⚪ Zero SERP; a FAQ em HTML continua valendo |
| 8 | **Plano de des-consolidação** em 4–6 meses para os 2–3 termos de maior valor | 🟡 Médio — rede de segurança |

---

# 2. Core Web Vitals — metas, o que destrói, e o padrão de embed de YouTube

## 2.1 Metas atuais (2026) — inalteradas

| Métrica | Good | Precisa melhorar | Ruim |
|---|---|---|---|
| **LCP** | ≤ 2,5 s | 2,5 – 4,0 s | > 4,0 s |
| **INP** | ≤ 200 ms | > 200 e ≤ 500 ms | > 500 ms |
| **CLS** | ≤ 0,1 | > 0,1 e ≤ 0,25 | > 0,25 |

Percentil **p75**, com **mobile e desktop avaliados separadamente**. Como o tráfego da Rapa Sound é
quase todo mobile vindo do Instagram, **só o segmento mobile importa**.
([web.dev/vitals](https://web.dev/articles/vitals),
[defining thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds))

**INP substituiu FID em 12/03/2024**; FID foi descontinuado e saiu do CrUX em agosto de 2024.
([web.dev/blog/inp-cwv-march-12](https://web.dev/blog/inp-cwv-march-12), [blog/fid](https://web.dev/blog/fid))

**Nenhuma métrica nem limiar mudou em 2025 ou 2026.** O que mudou no ecossistema:

- **Soft Navigations (SPA)** em origin trial final no Chrome 147, previsto sem flag a partir do
  Chrome 151. **Ainda não alimenta CrUX nem ranqueamento.** Irrelevante aqui — é página única.
  ([developer.chrome.com](https://developer.chrome.com/blog/final-soft-navigations-origin-trial))
- **LCP subparts e LCP resource type** entraram na API do CrUX — diagnóstico novo, não métrica nova.
- **LCP e INP viraram Baseline Newly available em 12/12/2025** (Safari 26.2). **CLS continua exclusivo
  do Chromium.** ([web.dev/blog](https://web.dev/blog/lcp-and-inp-are-now-baseline-newly-available))
- **CrUX Dashboard foi descontinuado no fim de novembro de 2025.**
- **CLS mais rígido é intenção declarada, não agendada:** o Google escreve que espera que o ecossistema
  resolva os shifts causados por embeds de terceiros, *"which would allow for using a more stringent
  CLS 'good' threshold of 0.05 or 0 in a future iteration"*.

### CWV é fator de ranqueamento? Sim, mas pequeno.

Palavras do Google (doc atualizada em 2025-12-10): *"Core Web Vitals are used by our ranking systems"*,
*"There is no single signal"*, *"Google Search always seeks to show the most relevant content, even if
the page experience is sub-par"*.
([Search Central — Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals))

**Leitura honesta para este projeto:** CWV só desempata entre conteúdos de relevância parecida.
Como o tráfego vem de link na bio, **o valor real de performance aqui é conversão, não SEO** — mãe de
debutante em 4G rolando o Instagram abandona antes de ver o botão de WhatsApp.

## 2.2 O que mais destrói cada métrica nesta página

### LCP — breakdown oficial em subparts

| Subpart | % do LCP | Orçamento para 2,5 s |
|---|---|---|
| TTFB | ~40% | ~1000 ms |
| Resource load delay | < 10% | < 250 ms |
| Resource load duration | ~40% | ~1000 ms |
| Element render delay | < 10% | < 250 ms |

([web.dev/optimize-lcp](https://web.dev/articles/optimize-lcp))

Assassinos numa página com muita foto:

- **`loading="lazy"` no hero.** Dado oficial: páginas com lazy acima da dobra tiveram **p75 de LCP de
  3.546 ms contra 2.922 ms sem lazy** (≈ +21%). ([web.dev/lcp-lazy-loading](https://web.dev/articles/lcp-lazy-loading))
  **Este é exatamente o risco no site atual**, que usa WP Rocket com lazy global.
- **Hero sem `fetchpriority="high"`.** Imagens no viewport começam em prioridade *Low*. O Google
  Flights baixou LCP de **2,6 s para 1,9 s** só com esse atributo. ([web.dev/fetch-priority](https://web.dev/articles/fetch-priority))
- **Hero como `background-image` em CSS** — não é descoberto pelo preload scanner; exige
  `<link rel="preload" fetchpriority="high">`.
- **LCP injetado por JS ou dentro de slider inicializado por script** — infla o *resource load delay*.
  O carrossel Swiper da home atual é candidato a este problema.
- **26 arquivos CSS separados e a Roboto sem preload** (ver `INVENTARIO.md` §7) inflam o
  *element render delay*.

### CLS — causas oficiais

Session window: shifts em sucessão com menos de 1 s entre eles, janela máxima de 5 s.
([web.dev/cls](https://web.dev/articles/cls), [optimize-cls](https://web.dev/articles/optimize-cls))

1. **Imagem/vídeo sem dimensão** → `width` + `height` no HTML, `img { height:auto; width:100% }` no CSS.
   Com `srcset`, **todas as variantes precisam do mesmo aspect ratio**.
2. **Fontes web** → `font-display: optional` é a recomendação oficial para eliminar re-layout, mais
   `size-adjust` e overrides de métrica. (O site atual usa `swap`, que ainda gera shift.)
3. **Conteúdo injetado sem interação** — **o cookie banner é o caso arquetípico.** Regra oficial:
   nunca inserir conteúdo empurrando o topo. **O banner de LGPD desta página tem que ser overlay
   fixo / bottom sheet.** Isso liga diretamente à seção 4.
4. **Embeds e iframes** → reservar espaço com `aspect-ratio: 16/9` no container.
5. **Animações** → só `transform` e `opacity`.
6. **Carrossel** → o container precisa de altura reservada **antes** do JS rodar.

### INP — o que destrói

Só contam **clique, tap e tecla**. Scroll e hover não. As três fases: *input delay → processing
duration → presentation delay*. **Long task = qualquer tarefa acima de 50 ms.**
([web.dev/inp](https://web.dev/articles/inp), [optimize-inp](https://web.dev/articles/optimize-inp),
[optimize-long-tasks](https://web.dev/articles/optimize-long-tasks))

Vilões presentes hoje no site: **GTM + gtag (527 KB) + PixelYourSite (157 KB)**, **jQuery +
jquery-migrate**, **Elementor**, **Swiper (140 KB)**, DOM grande.

Recomendação oficial de yielding, em ordem:

```js
function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise(resolve => setTimeout(resolve, 0));
}
```

`scheduler.yield()` tem suporte em Chrome/Edge 129+ e Firefox 142+; Safari ainda não.
**`isInputPending()` não é mais recomendado** pelo web.dev.

## 2.3 YouTube embed — o padrão correto hoje (2026)

### O custo real, medido

- `GET https://www.youtube.com/embed/{id}` (UA mobile): **139.124 bytes só do documento HTML do
  iframe**, antes de qualquer JS, CSS, fonte ou thumbnail.
- Player completo: **~540 KB**, contra **~3 KB** de uma facade.
  ([Lighthouse — third-party facades](https://developer.chrome.com/docs/lighthouse/performance/third-party-facades))
- Lazy de um embed economiza **~500 KB** no load inicial; a Chrome.com obteve **10 segundos a menos de
  Time To Interactive** ao fazer lazy dos embeds fora da tela.
  ([web.dev/iframe-lazy-loading](https://web.dev/articles/iframe-lazy-loading))
- `lite-youtube-embed` renderiza **~224× mais rápido** que o embed real.

**Com os 10 embeds da home isso é ~5,4 MB e 10 contextos de browsing separados disputando main thread
e rede. É o item nº 1 de performance da página.**

### youtube-nocookie.com — o que muda de fato (medido)

| | Cookies setados no load |
|---|---|
| `www.youtube.com/embed/{id}` | **6 cookies**: `__Secure-YNID`, `YSC`, `__Secure-YEC`, `VISITOR_INFO1_LIVE` (expira 2027), `VISITOR_PRIVACY_METADATA`, `__Secure-ROLLOUT_TOKEN` |
| `www.youtube-nocookie.com/embed/{id}` | **nenhum `Set-Cookie`** |

- **Performance: não muda nada** (139 KB vs 138 KB). Trocar de domínio não é otimização.
- **Privacidade: muda de verdade quanto a cookies HTTP** — o domínio padrão seta 6 cookies de
  rastreamento **antes de qualquer clique e antes de qualquer consentimento**.
- **Mas nocookie não basta para LGPD:** o iframe ainda envia o **IP do visitante ao Google** no load e
  grava em **localStorage** (`yt-remote-device-id`, `ytidb::LAST_RESULT_ENTRY_KEY`).

### A facade — padrão recomendado

⚠️ **Mudança importante:** a auditoria `third-party-facades` **foi removida no Lighthouse 13**. A
técnica continua recomendada em [web.dev/embed-best-practices](https://web.dev/articles/embed-best-practices);
o que sumiu foi o aviso automático. **O relatório do Lighthouse não vai mais apontar este problema.**

Padrão de interação oficial: (1) facade estática no load; (2) `preconnect` no `mouseover`/`touchstart`;
(3) troca pelo iframe real no `click`.

**Bibliotecas, estado verificado:**

| Lib | Versão | Data | Notas |
|---|---|---|---|
| [`paulirish/lite-youtube-embed`](https://github.com/paulirish/lite-youtube-embed) | **v0.3.4** | 10/11/2025 | Ativo. A 0.3.4 corrige o **Error 153** do YouTube via `referrer-policy: strict-origin-when-cross-origin` — **versões anteriores podem falhar ao tocar**. Já usa nocookie por padrão. |
| [`justinribeiro/lite-youtube`](https://github.com/justinribeiro/lite-youtube) | **v1.9.0** | 28/10/2025 (push abr/2026) | 1,7 KB min+br. Tem `nocookie`, `autoPause`, `--lite-youtube-aspect-ratio`, e **noscript injector para indexação de busca** (v1.7). |

**Recomendação para a Rapa Sound: `justinribeiro/lite-youtube` v1.9**, pelo noscript injector (resolve
o problema de `VideoObject`, abaixo) e pelo aspect-ratio como custom property. Não há substituto mais
novo consolidado em 2025/2026.

### Thumbnail — qual usar (medido)

| Nome | Dimensões | Sempre existe? | JPG | **WebP** |
|---|---|---|---|---|
| `maxresdefault` | 1280×720 (16:9) | **NÃO** | 65,3 KB | 28,6 KB |
| `sddefault` | 640×480 (4:3) | **NÃO** | 31,0 KB | 14,5 KB |
| `hqdefault` | 480×360 (4:3) | **SIM** | 21,0 KB | 10,4 KB |
| `mqdefault` | 320×180 (16:9) | **SIM** | 10,3 KB | 6,7 KB |
| `default` | 120×90 (4:3) | **SIM** | 2,9 KB | 2,0 KB |

- **Use sempre o WebP nativo do YouTube:** `https://i.ytimg.com/vi_webp/{ID}/{size}.webp` — ~55% menor
  que o JPG. **Não existe AVIF servido pelo YouTube.**
- **Armadilha do 404:** o YouTube retorna 404 **com `content-type: image/jpeg` e um JPEG válido no
  corpo** — portanto `img.onerror` **não dispara**. Detecte via `onload` + `naturalWidth`.
- Estratégia: tentar `maxresdefault.webp`, cair para `hqdefault.jpg`. Regra confirmada: *"if they have
  the maxresdefault webp, then they definitely have the sddefault webp"*.
- `sddefault`/`hqdefault`/`default` são **4:3** e geram tarja preta em container 16:9 — resolva com
  `background-position: center` sobre `aspect-ratio: 16/9`.
- **Cuidado com os 6 vídeos de evento da Rapa Sound:** vídeos antigos frequentemente não têm
  `maxresdefault`. Teste um a um antes de fixar.
  ([doc técnica de thumbnails](https://github.com/paulirish/lite-youtube-embed/blob/master/youtube-thumbnail-urls.md))

### `loading="lazy"` em iframe basta? Não.

Suporte: Chrome 77+, Edge 79+, Firefox 121+, Safari 16.4+. Ganho: ~500 KB por embed fora da tela.

**Por que não basta:** o lazy só adia. Numa landing longa que o usuário rola inteira, os 10 embeds
acabam **todos** carregando — e carregam **exatamente enquanto ele rola e interage**, que é o pior
momento possível para o INP. A facade ganha porque em geral **9 dos 10 nunca carregam**, elimina
cookie/IP pré-consentimento, e o preconnect no hover deixa o clique mais rápido que um iframe frio.
Use os dois juntos: facade + `loading="lazy"` na `<img>` do poster.

### Evitar que a facade vire LCP ou cause CLS

```css
lite-youtube, .yt-facade {
  aspect-ratio: 16 / 9;
  width: 100%;
  display: block;
}
/* abaixo da dobra */
.secao-videos {
  content-visibility: auto;
  contain-intrinsic-size: auto 100% auto 400px;
}
```

- **Nenhum embed acima da dobra** — competiria com o hero pelo LCP.
- Poster com `loading="lazy"` e `fetchpriority="low"`.
- `content-visibility: auto` reduz trabalho de render (exemplo oficial: 232 ms → 30 ms, 7×), mas
  **`contain-intrinsic-size` é obrigatório junto** — sem ele o elemento colapsa e você **cria** CLS.
  ([web.dev/content-visibility](https://web.dev/articles/content-visibility))

### A facade atrapalha o `VideoObject`? Sim — e tem mitigação

O Google Search Central diz explicitamente (doc de 2025-12-18):
**"Don't rely on user actions (such as swiping, clicking, or typing) to load the video."**
Uma facade é exatamente isso. Sem mitigação, o Googlebot não encontra iframe no HTML renderizado.
([Video SEO best practices](https://developers.google.com/search/docs/appearance/video))

**Faça os três:**
1. **`<noscript>` com o iframe real** dentro do componente — o `justinribeiro/lite-youtube` v1.7+ já
   injeta isso automaticamente. Com o `lite-youtube-embed`, adicione à mão.
2. **JSON-LD `VideoObject`** por vídeo, com `name`, `thumbnailUrl`, `uploadDate` (obrigatórios) e
   `description`, `duration`, **`embedUrl`** (URL do player, não a página do vídeo).
3. **Thumbnail em URL estável** — se reservir o poster no seu domínio, não gere hash volátil.

Na prática, para tráfego vindo de link na bio, indexação de vídeo importa pouco. Mas o `<noscript>`
custa zero — mantenha.

### Resumo LGPD do embed (liga com a seção 4)

| Abordagem | Cookies antes do consentimento | IP ao Google no load | localStorage | Conforme |
|---|---|---|---|---|
| `youtube.com/embed` | **6 (medido)** | Sim | Sim | **Não** |
| `youtube-nocookie.com/embed` | Nenhum (medido) | Sim | Sim | **Não** |
| nocookie + `loading="lazy"` | Nenhum até rolar | Sim, ao rolar | Sim | **Não** |
| **Facade com clique explícito** | **Nenhum** | **Não** | **Não** | **Sim** |

**A facade é simultaneamente a melhor opção de performance e a única conforme. Não há trade-off.**

## 2.4 Imagens — AVIF, WebP e o padrão do hero

- **WebP: baseline.** Widely available, ~96–98% de cobertura.
- **AVIF: com fallback obrigatório.** Baseline *Newly available* (2024), ~93–94%. Ganho registrado
  pelo web.dev: *"greater than 50% savings when compared to JPEG in some cases"*. Ordem correta no
  `<picture>`: **AVIF → WebP → JPEG**. Nunca sirva AVIF sozinho.
  ([web.dev/learn/images/avif](https://web.dev/learn/images/avif),
  [serve-responsive-images](https://web.dev/articles/serve-responsive-images))

**Hero (o LCP da Rapa Sound — a foto da noiva erguida pelas convidadas):**

```html
<picture>
  <source type="image/avif" srcset="hero-480.avif 480w, hero-768.avif 768w, hero-1080.avif 1080w, hero-1440.avif 1440w" sizes="100vw" width="1440" height="810">
  <source type="image/webp" srcset="hero-480.webp 480w, hero-768.webp 768w, hero-1080.webp 1080w, hero-1440.webp 1440w" sizes="100vw" width="1440" height="810">
  <img src="hero-1080.jpg" srcset="hero-480.jpg 480w, hero-768.jpg 768w, hero-1080.jpg 1080w, hero-1440.jpg 1440w"
       sizes="100vw" width="1440" height="810" alt="…"
       fetchpriority="high" decoding="sync">
  <!-- NUNCA loading="lazy" aqui -->
</picture>
```

- `width`/`height` **em todas as `<source>` e na `<img>`**.
- Todas as variantes do `srcset` com **o mesmo aspect ratio**.
- `decoding="async"` **é contraindicado no hero** — use `sync` ou omita.
- **O hero atual tem 1033×690.** É baixo demais para servir 1440w. Ver pergunta 5 ao cliente no
  `INVENTARIO.md`: pedir os originais é pré-requisito desta seção.

**Abaixo da dobra:** `loading="lazy"`, `decoding="async"`, `fetchpriority="low"`, e `sizes` correto —
`sizes="100vw"` num container de 50% desperdiça metade da banda em mobile.

**Erro clássico a auditar:** plugins de WordPress/Elementor aplicam `loading="lazy"` globalmente,
inclusive na primeira imagem. É a causa nº 1 de LCP ruim em landing de WordPress. **Confira o HTML
final e garanta que o hero não tem `lazy`.**

## 2.5 Ordem de ataque

1. **Trocar os 10 iframes por facade** — remove ~5 MB e 10 contextos de browsing. Resolve LCP, INP e
   LGPD de uma vez. Maior impacto isolado do projeto inteiro.
2. **Tirar `lazy` do hero + `fetchpriority="high"`** — o ganho mais barato que existe.
3. **`aspect-ratio` em todo container de vídeo; `width`/`height` em toda imagem.**
4. **Cookie banner como overlay/bottom sheet**, jamais empurrando o topo.
5. **`font-display: optional` + preload** da Roboto (ou trocar a fonte).
6. **AVIF + WebP + JPEG** com `sizes` correto. Eliminar o PNG de 747 KB e o de 430 KB.
7. **Auditar GTM, gtag e PixelYourSite** — carregar após consentimento (seção 4) resolve performance
   e conformidade juntos.
8. **Medir no p75 mobile** via CrUX/PageSpeed Insights, não no Lighthouse desktop. E lembrar: o
   Lighthouse 13 **não avisa mais** sobre facades.

---

# 3. Conversão por WhatsApp

> Marcações desta seção: **[OFICIAL]** doc do fabricante ou norma · **[TESTE]** verificação empírica
> executada por `curl` durante esta pesquisa · **[ESTUDO]** pesquisa publicada com metodologia ·
> **[NÃO CITÁVEL]** número que circula sem fonte primária — listado aqui **para que não seja usado**.

## 3.1 O link `wa.me` — e o bug que existe no site hoje

### Qual formato usar

Doc oficial ([faq.whatsapp.com/425247423114725](https://faq.whatsapp.com/425247423114725) e
[/5913398998672934](https://faq.whatsapp.com/5913398998672934)), verbatim **[OFICIAL]**:

> **"Universal links are the preferred method of linking to a WhatsApp account."**
> Use `https://wa.me/<number>` where the `<number>` is a full phone number in international format.

> Use `https://wa.me/whatsappphonenumber?text=urlencodedtext` where … `urlencodedtext` is the
> URL-encoded pre-filled message.

**[TESTE]** — os três formatos, testados hoje com UA de iPhone, Android e desktop:

| URL | UA | Resposta |
|---|---|---|
| `wa.me/5534991990994/?text=…` | iPhone / Android / desktop | `302 →` **a mesma** `api.whatsapp.com/send/?phone=…&text=…` |
| `web.whatsapp.com/send?phone=…` | iPhone | `302 →` página "baixe o app" |
| `web.whatsapp.com/send?phone=…` | desktop | **`400 Bad Request`** |

1. **`wa.me` e `api.whatsapp.com/send` são o mesmo destino** — `wa.me` é literalmente um 302 para o
   outro. Não há diferença funcional. A diferença de comportamento acontece **no cliente**.
   O site atual já usa `api.whatsapp.com/send/?phone=5534991990994` — **está correto**; só falta o
   encoding (abaixo).
2. 🔴 **`web.whatsapp.com/send` é proibido nesta landing.** No mobile joga o usuário numa página de
   download; no desktop retorna 400. Perda de lead garantida.
3. A Meta usa `api.whatsapp.com/send` como destino canônico dos anúncios click-to-WhatsApp
   ([developers.facebook.com](https://developers.facebook.com/docs/marketing-api/ad-creative/messaging-ads/click-to-whatsapp/)) **[OFICIAL]** — confirma que são intercambiáveis.

**Mecanismo por plataforma:** no iOS/Android **com o app instalado**, `wa.me` é *universal link* /
*App Link* — o SO intercepta o clique e abre o app **sem nunca executar o HTTP request**. No desktop
ou sem app, o HTTP roda e cai na página "Continuar para o Chat".

### Encoding — e o bug real do site atual

`encodeURIComponent` **é suficiente**. Ele não escapa `A–Z a–z 0–9 - _ . ! ~ * ' ( )` — nenhum desses
quebra a query do WhatsApp — e codifica não-ASCII como UTF-8 percent-encoded
([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)) **[OFICIAL]**.
⚠️ Ele **lança `URIError`** em surrogate solitário; se o texto vier de input do usuário, aplique
`String.prototype.toWellFormed()` antes.

| Caractere | Bytes UTF-8 | Percent-encoding |
|---|---|---|
| `ç` / `ã` / `é` / `õ` | 2 | `%C3%A7` / `%C3%A3` / `%C3%A9` / `%C3%B5` |
| quebra de linha `\n` | 1 | `%0A` |
| espaço | 1 | `%20` |
| `&` · `#` · `+` | 1 | `%26` · `%23` · `%2B` |
| emoji BMP `❤` U+2764 | 3 | `%E2%9D%A4` |
| emoji astral `🎉` U+1F389 | **4** | `%F0%9F%8E%89` |
| bandeira `🇧🇷` (2 codepoints) | **8** | `%F0%9F%87%A7%F0%9F%87%B7` |

Nota conceitual: *surrogate pair* é detalhe de **UTF-16** (representação interna do JS), não de UTF-8.
`🎉` tem `.length === 2` em JS mas são **4 bytes UTF-8**. `encodeURIComponent` resolve sozinho.

### 🔴 O bug: acento cru retorna HTTP 400 — **[TESTE]**

O site atual tem `?text=Olá, gostaria de solicitar um orçamento!` **cru** na URL (`INVENTARIO.md` §4).
Testado contra o servidor real:

| Enviado literalmente | Resposta do `wa.me` |
|---|---|
| `?text=Olá` (acento cru) | **`400 Bad Request`** |
| `?text=Ola gostaria` (espaço cru) | **`400 Bad Request`** |
| `?text=som & luz` (`&` cru) | **`400 Bad Request`** |
| `?text=#LED` (`#` cru) | `302` — mas a Location vem `&text&`: **o texto foi silenciosamente descartado** |
| `?text=Ol%C3%A1%2C%20or%C3%A7amento` | `302` correto, texto intacto |

**Leitura honesta:** um navegador moderno normalmente auto-encoda o acento antes de enviar, então o
link *muitas vezes* funciona. Mas a URL é inválida por RFC 3986 e falha assim que passa por qualquer
intermediário que não perdoe: **webview in-app (o do Instagram!), encurtador, gerador de QR, parser de
link-in-bio, o linkificador do próprio WhatsApp**. **É uma falha intermitente e invisível — o pior
tipo.** Encodar não é preciosismo.

⚠️ **O `#` é o mais perigoso: não dá erro.** É tratado como início de fragmento, nunca chega ao
servidor, e o WhatsApp abre com a **caixa vazia**. Falha 100% silenciosa. Nunca use `#` no texto.

Link correto para o número da Rapa Sound:
```
https://wa.me/5534991990994?text=Ol%C3%A1%21%20Vim%20pelo%20Instagram.%20Quero%20or%C3%A7amento%20de%20SOM%20e%20LUZ%20para%20festa%20de%2015%20anos%20em%20Uberl%C3%A2ndia.
```

### Três descobertas não documentadas — **[TESTE]**

1. **`%20` vira `+` na Location.** Consequência: um `+` literal no texto ("som + luz", "+55")
   **precisa** ser `%2B`, senão colide com a codificação de espaço.
2. 🔴 **Emoji são substituídos por U+FFFD (`%EF%BF%BD`) no redirect.** Verificado no hexdump do header
   bruto. `á` (U+00E1), `—` (U+2014) e `✓` (U+2713) passam intactos; `❤`, `🎉`, `💡` **são destruídos**.
   Não é questão de bytes — é sanitização de emoji na camada de redirect.
   **Ressalva de honestidade:** isso afeta **apenas o caminho HTTP de fallback** (desktop, ou mobile
   sem app). No mobile com app, o universal link é interceptado pelo SO e o redirect nunca roda —
   o emoji chega intacto. **Recomendação segura: não depender de emoji na mensagem pré-preenchida.**
   Se quiser usar, **teste em device real antes de subir**.
3. **Não há limite de tamanho do lado do servidor** — testado até 30.000 caracteres, todos `302`.
   O limite real é do browser/SO (na prática, fique abaixo de ~2.000). **[NÃO CITÁVEL]:** o "limite de
   4.096 caracteres" que circula é da **mensagem do WhatsApp**, não da URL do click-to-chat.

### Formato do número — **[OFICIAL] + [TESTE]**

> *"Omit any brackets, dashes, plus signs, and leading zeros when adding the phone number in
> international format."* — faq.whatsapp.com/425247423114725

| Formato | Resultado **[TESTE]** |
|---|---|
| `wa.me/5534991990994` | `302` correto ✅ |
| `wa.me/55-34-99999-9999` | `302 → …&`**`not_found=1`** ❌ |
| `wa.me/+5534999999999` | `+` propagado, falha depois na resolução ❌ |
| `wa.me/05534999999999` | zero à esquerda propagado, falha depois ❌ |

**Regra: só dígitos, começando por 55.**

## 3.2 🔴 O que quebra no iOS — provavelmente o maior vazamento do funil atual

**A causa raiz é uma só: `WKWebView` não processa universal links.**

A Apple documenta universal links em
[developer.apple.com](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app) **[OFICIAL]**,
mas **não menciona WKWebView**. O comportamento está documentado de facto no Apple Developer Forums,
[thread 33767](https://developer.apple.com/forums/thread/33767) — relatos persistindo de iOS 9.2.1 até
iOS 15, **sem nenhuma resposta oficial de engenheiro da Apple**. O único workaround é nativo, e o
próprio autor o chama de *"hacky solution which doesn't always work"*. Mesmo padrão em
[react-native-webview#1993](https://github.com/react-native-webview/react-native-webview/issues/1993).

> **Consequência direta para a Rapa Sound:** o link na bio do Instagram abre no in-app browser do
> Instagram, **que é um WKWebView**. O `wa.me` **não vira universal link ali** — ele executa o HTTP,
> cai na página "Continuar para o Chat" do `api.whatsapp.com`, e o usuário vê uma página de
> intermediação em vez do app abrindo. **Parte dos leads desiste nesse ponto, e isso não aparece em
> nenhum teste de desktop.** Como o tráfego é quase todo `utm_source=ig, link_in_bio`, este é
> provavelmente o maior vazamento de conversão do funil atual.

Outros modos de falha, com fonte:

- 🔴 **Universal link disparado por JavaScript não funciona.** Precisa ser gesto de usuário sobre um
  `<a href>` real. Documentado repetidamente no Apple Developer Forums
  ([659322](https://developer.apple.com/forums/thread/659322),
  [772550](https://developer.apple.com/forums/thread/772550)).
  **Nunca use `window.open()` nem `location.href` para abrir o WhatsApp.**
- **`target="_blank"` + bloqueio de popup:** navegação programática para nova aba fora do handler de
  clique é bloqueada no Safari iOS. Combinado com o ponto acima, **`target="_blank"` num link de
  WhatsApp é risco sem benefício no mobile.**
- **WhatsApp Business vs pessoal:** ambos aceitam o mesmo `wa.me`. Qual app abre quando os dois estão
  instalados no iOS **não é documentado** por WhatsApp nem Apple — **[NÃO CITÁVEL]**. Do lado da
  empresa, o que importa é que o número esteja registrado no app que de fato é atendido.

**Mitigações concretas:**
1. Sempre `<a href="https://wa.me/…">` real. Sem JS. **Sem `target="_blank"` no mobile.**
2. `rel="noopener"` se mantiver `_blank` no desktop.
3. Fallback progressivo com esquema nativo — iOS `whatsapp://send?phone=&text=`, Android
   `intent://send?phone=&text=#Intent;scheme=whatsapp;package=com.whatsapp;end`. O esquema
   `whatsapp://send` com `text` é **[OFICIAL]** (faq.whatsapp.com/425247423114725, "Custom URL Scheme").
4. Na bio do Instagram, apontar para a **landing**, não direto para `wa.me`.
5. 🔴 **Testar em iPhone real, de dentro do Instagram, é obrigatório antes do go-live.**

## 3.3 O botão flutuante no mobile

### Tamanho mínimo de alvo — os números exatos

| Norma | Número | Nível |
|---|---|---|
| [WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) Target Size (Minimum) | **24 × 24 px CSS** | **AA** |
| [WCAG 2.1 SC 2.5.5](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) Target Size | **44 × 44 px CSS** | **AAA** |
| [Apple HIG](https://developer.apple.com/design/tips/) — Hit Targets | **44 × 44 pt** | norma iOS |
| [Google / Material](https://support.google.com/accessibility/android/answer/7101858) | **48 × 48 dp** + **8 dp** de espaçamento | norma Android |
| [NN/g](https://www.nngroup.com/articles/touch-target-size/) (Harley, 2019) | **1 cm × 1 cm** físico | pesquisa |
| [Hoober](https://www.uxmatters.com/mt/archives/2017/07/design-for-fingers-touch-and-people-part-3.php) (2017) | precisão 7 mm no centro, **12 mm nos cantos** | pesquisa |

WCAG 2.2 é W3C Recommendation de **12/12/2024**. As 5 exceções do SC 2.5.8: *Spacing*, *Equivalent*,
*Inline*, *User Agent Control*, *Essential*.

✅ **Recomendação: 56 × 56 px CSS.** Satisfaz simultaneamente 48dp Android, 44pt Apple, AAA do WCAG e
o 1 cm da NN/g, com folga. Mínimo 8 px de gap para qualquer outro clicável.

### ⚠️ Thumb zone: o consenso popular está errado

A pesquisa original é **Steven Hoober, UXmatters, 18/02/2013** — **1.333 observações** em espaços
públicos; das 780 com contato na tela: uma mão 49%, cradled 36%, duas mãos 15% → **~75% da interação é
com o polegar**. ([UXmatters](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php))
**Cite sempre com o ano — é dado de 2012–2013, era pré-telas-grandes.**

Mas a **NN/g contradiz explicitamente** o uso da "thumb zone" como justificativa (Laubheimer, 11/06/2023):
> *"A common (but largely incorrect) rationale… the bottom of the screen is often not the most easily
> reachable screen region (**the middle of the screen represents the most easily tappable area**)."*
> — [nngroup.com/articles/bottom-sheet](https://www.nngroup.com/articles/bottom-sheet/)

**Portanto: o argumento honesto para o canto inferior direito é convenção, não ergonomia.** E convenção
tem valor medido — NN/g, "The UX of Customer-Service Chat" (Budiu, 13/01/2019):
- Os dois motivos pelos quais usuários **ignoram** botões flutuantes: **posição fora do padrão** e
  **baixo contraste**. O botão da Forever 21 era *"so tiny and blended in with the rest of the page,
  that users ignored it"*.
- 🔴 **Guideline 2: não dependa do botão flutuante como única via de acesso** — alguns participantes
  simplesmente não o viram.
  ([nngroup.com/articles/chat-ux](https://www.nngroup.com/articles/chat-ux/))

### Safe area, viewport e não cobrir o rodapé

**`env(safe-area-inset-bottom)`** só funciona **com `viewport-fit=cover`**. Sem ele o comportamento é
`auto`, o layout viewport já é o retângulo seguro e **`env()` resolve para `0`**
([MDN env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env),
[MDN meta viewport](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport)).
Os dois são indivisíveis:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

**`100vh` é o bug clássico.** MDN: *"`vh` is equivalent to `lvh`"* — altura com a barra de endereço
**retraída**. Com a barra visível (estado inicial no Safari/Chrome mobile) o conteúdo transborda e o fim
fica cortado. Use `svh` com fallback; evite `dvh` em elementos grandes (a MDN alerta que *"can lead to
degradation of the user interface and cause a performance hit"*). Suporte a `svh/lvh/dvh`: **92,52%
global, Safari iOS a partir da 15.4** ([caniuse](https://caniuse.com/viewport-unit-variants), jun/2026).

```css
:root {
  --fab-size: 56px; --fab-gap: 16px;
  --fab-reserve: calc(var(--fab-size) + var(--fab-gap)*2 + env(safe-area-inset-bottom, 0px));
}
.fab {
  position: fixed;
  right:  calc(var(--fab-gap) + env(safe-area-inset-right, 0px));
  bottom: calc(var(--fab-gap) + env(safe-area-inset-bottom, 0px));
  inline-size: var(--fab-size); block-size: var(--fab-size);
}
body { padding-block-end: var(--fab-reserve); }     /* não cobre o rodapé */
html { scroll-padding-block-end: var(--fab-reserve); }
@media (max-height: 450px) { .fab { display: none; } }  /* regra Baymard */
```

`scroll-padding-bottom` existe exatamente para isto: *"allows the author to exclude regions of the
scrollport that are obscured by other content (such as fixed-positioned toolbars)"*
([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-bottom)). E Baymard (Holst,
18/08/2015): *"Fixated content effectively makes the screen real estate smaller for the actual page
content"* — recomenda media query de altura
([baymard.com](https://baymard.com/blog/responsive-upscaling)).

### Sticky bar vs FAB circular — a evidência que você pediu não existe

🔴 **Não há nenhum estudo rigoroso comparando FAB circular vs sticky bar.** Buscado em Baymard, NN/g,
GoodUI, CXL, VWO e Optimizely. Zero.

**[NÃO CITÁVEL]** — *"Baymard: sticky add-to-cart aumenta conversão mobile em 5–12%"* e *"sticky banner
consome 15–20% da tela mobile"*: aparecem só em blogs de marketing e vendedores de app Shopify;
**não existem em nenhuma página do baymard.com**. Não use.

O que **é** citável:
- **[ESTUDO]** GoodUI Pattern #41 "Sticky Call To Action" — **28 testes A/B** meta-analisados; o teste
  mais recente com **1.238.014 visitantes** (28/06/2026). ⚠️ **O tamanho de efeito combinado está atrás
  de paywall**, e o "Leak #98" (Etsy) traz **−0,5 de evidência**: sticky CTA **não vence sempre**.
  ([goodui.org/patterns/41](https://goodui.org/patterns/41/))
- **[ESTUDO]** Growth Rock: sticky add-to-cart desktop **+7,9% de pedidos (99% de significância)**;
  mobile, variação drawer **+5,2% (98%)**, >3.000 conversões por variação em 14 dias. Agência,
  e-commerce, não peer-reviewed. ([growthrock.co](https://growthrock.co/sticky-add-to-cart-button-example/))
- ⚠️ **Contra-argumento forte e específico ao caso** — Baymard (Hugo, 15/10/2019): *"sticky chat
  elements often block key page content in much more obtrusive ways than the same sticky element will
  do on a desktop site"*. **A Baymard chega a recomendar limitar o chat sticky ao desktop.**
  ([baymard.com](https://baymard.com/blog/live-chat-usability-issues))

✅ **Recomendação defensável: FAB circular** — **não porque converte mais** (ninguém provou), mas porque
um círculo de 56 px viola menos o achado da Baymard do que uma barra de largura total permanente, e é a
posição convencional que a NN/g mostra ser a única que os usuários procuram. Compense as fraquezas
documentadas: **alto contraste + rótulo textual (não só ícone)** e **CTA de WhatsApp duplicado no hero
e no rodapé** (NN/g Guideline 2).

## 3.4 WhatsApp direto vs formulário — os números, com as fontes

### Taxa de conversão de landing page por setor

| Número | Fonte | Ano |
|---|---|---|
| Mediana geral **6,6%** — amostra **41.000+ LPs, 464M visitas, 57M conversões** | [Unbounce Conversion Benchmark Report](https://unbounce.com/conversion-benchmark-report/) | 2024 |
| **Commercial & Professional Services: 6,1%** | [Unbounce CBR](https://unbounce.com/conversion-benchmark-report/professional-services-conversion-rate/) | 2024 |
| Entertainment 12,3% — **mas** decomposto em Sweepstakes 47,5%, Publishing 9,8%, Games 8,1% | [Unbounce](https://unbounce.com/conversion-benchmark-report/entertainment-conversion-rate/) | 2024 |
| Google Ads CVR geral **8,18%**; **Personal Services 12,34% / CPL US$ 54,60**; Arts & Entertainment 5,91%. Amostra **13.474 campanhas**, 04/2025–03/2026 | [WordStream/LOCALiQ](https://www.wordstream.com/blog/2026-google-ads-benchmarks) | 2026 |
| Média geral **5,13%**; Professional Services **6,1%**. Amostra **110M+ sessões, 5M+ conversões** | [Ruler Analytics](https://www.ruleranalytics.com/blog/insight/conversion-rate-by-industry/) | 2026 |
| Em Legal, **56,3% das conversões chegam por telefone** vs 43,7% por formulário | Ruler Analytics | 2026 |
| LP média todos os setores **5,89%** — ⚠️ **autorrelato de marketers em survey**, não dado observado | [HubSpot](https://blog.hubspot.com/marketing/landing-page-stats) | 2023 |

⚠️ **Duas advertências:**
1. **Não use os 12,3% de "Entertainment".** A própria Unbounce diz que a mediana é *"heavily influenced
   by the sweepstakes subcategory"* (47,5%). Sorteio ≠ contratar estrutura de festa. **O benchmark
   honesto para a Rapa Sound é 6,1% (Professional Services).**
2. 🔴 **Não existe categoria "Events / Event Planning"** em nenhum benchmark grande, e **não existe
   benchmark público brasileiro de conversão de LP por setor.** Qualquer "média brasileira" em blog é
   invenção.

### Número de campos — a literatura é fraca, e o dado recente contradiz o senso comum

**O melhor dado que existe (recente, enorme, verificável):**

| Número | Fonte | Ano |
|---|---|---|
| Amostra: **1,24 bilhão de exibições de popup**, ano-calendário 2025 | [Omnisend](https://www.omnisend.com/blog/email-popup-statistics/) | 2026 |
| **1 campo 2,1% · 2 campos 2,2% · 3 campos 2,1% · 4 campos 1,5% · 5+ campos 1,4%** | Omnisend | 2026 |
| **Mobile-only 2,2% vs desktop-only 1,4%** | Omnisend | 2026 |

> **Leitura correta — e ela muda a recomendação:** o penhasco **não** está em "1 vs 3 campos". Está
> **entre 3 e 4** (2,1% → 1,5%, **−29% relativo**). Até 3 campos o atrito é desprezível.
> **O formulário atual da Rapa Sound tem 4 campos** (Nome, Email, Telefone, Mensagem) — está
> exatamente **em cima do penhasco**. Cortar para 3 é a mudança com melhor evidência disponível.

**Estudos clássicos, com as ressalvas devidas:**

| Número | Fonte | Ano | Ressalva |
|---|---|---|---|
| **5 campos = 13,4% (CPL US$ 31,24) · 7 = 12% · 9 = 10% (CPL US$ 41,90)** → de 9 para 5, **+34% relativo** | [Marketo via MarketingExperiments](https://marketingexperiments.com/lead-generation/lead-generation-testing-form-field-length-reduces-cost-per-lead-by-10-66) | **2011** | ⚠️ **Amostra e significância não divulgadas.** É o estudo mais citado do mundo e é, na prática, um case de fornecedor |
| Achado qualitativo: pedir telefone/idade/endereço reduz conversão | [HubSpot/Zarrella](https://blog.hubspot.com/blog/tabid/6307/bid/6748/3-form-fields-that-kill-landing-page-conversion-rates.aspx) | ~2011 | ⚠️ **Os percentuais famosos ("telefone 19%→13,5%", "3 campos 25% vs 5 campos 21%") NÃO estão no texto da página** — estavam em gráficos de webinar de 2011, hoje não verificáveis. **Não use** |
| Média de **11,3 campos** no checkout; recomenda 8; **17%** já abandonaram por checkout longo; abandono médio **70,22%** (50 estudos) | [Baymard](https://baymard.com/blog/checkout-flow-average-form-fields) | 2024/25 | É checkout, não lead form. **Baymard não publica lift por redução de campos** |
| Michael Aagaard: reduzir campos causou **queda de 14%**; renomear campos **+19,21%**. MarketingExperiments: formulário de **15 campos** teve **+109%** | [Venture Harbour](https://ventureharbour.com/how-form-length-impacts-conversion-rates/) | 2026 | Sem amostra. Serve para uma coisa: **provar que "menos campos = mais conversão" NÃO é robusto** |

🔴 **[NÃO CITÁVEL]:** *"reduzir de 11 para 4 campos aumenta conversão em 160%"* e *"cada campo acima de
3 reduz 4–5%"* atribuídos à Unbounce — **não existem em nenhuma página da Unbounce.**
*"Remover um campo aumenta 26%"* (Formstack, citando fonte não identificada). O Formstack Form
Conversion Report tem versões conflitantes e o PDF original está fora do ar.

### WhatsApp no Brasil — dados sólidos

**Mobile Time / Opinion Box, "Mensageria no Brasil"** — mar/2024. **n=2.112**, 16+, campo 10–23/01/2024,
MoE 2,1 p.p., 95% de confiança. ([PDF](https://static.poder360.com.br/2024/03/Panorama-Mensageria-MAR-24.pdf))

| Número | Detalhe |
|---|---|
| **98%** dos smartphones brasileiros têm WhatsApp | Instagram 88%, Telegram 63% |
| **94% abrem todo dia** (98% diário ou quase) | |
| **79%** dos usuários ativos **se comunicam com marcas pelo app** | Instagram Direct 64% |
| **81%** consideram adequado para **"tirar dúvidas / pedir informações"**; 62% para "comprar produtos e serviços" | base 1.628 |
| **89%** já foram atendidos por robô; satisfação com bot **3,1/5 — a pior de todos os canais** | Instagram 3,8 |
| 83% já receberam mensagem de venda sem ter dado o número; **43% bloqueiam** | |

⚠️ Os 62% são *"acho adequado comprar"*, **não** *"já comprei"*. Não confunda.

**Opinion Box, "Pesquisa WhatsApp no Brasil"** — 2025, **n=1.126**, campo jun/2025, MoE 2,9 p.p.
([blog.opinionbox.com](https://blog.opinionbox.com/pesquisa-whatsapp-no-brasil/))
**97%** acessam ao menos 1x/dia · **82%** já se comunicaram com marcas · **60% já compraram** produtos e
serviços pelo app · **61% já contrataram serviços mais de uma vez** · **69%** consideram ótimo canal
para falar com empresas · **59% não gostam de respostas automáticas**.

**Octadesk + Opinion Box, CX Trends 2026** — n=2.000, MoE 2,2 p.p.: **59% usam WhatsApp para
atendimento** (chat no site 49%, e-mail 43%, telefone 35%); no processo de compra o WhatsApp
**superou o chat** (37% vs 36%). **48% dos brasileiros já abandonaram uma compra por falta de confiança
no site**. ([E-Commerce Brasil](https://www.ecommercebrasil.com.br/noticias/67-dos-consumidores-desistem-de-compras-online-entenda-os-motivos))

**Sebrae, Pulso dos Pequenos Negócios, 12ª ed.** — n=8.200+, campo fev–mar/2026: **82% dos MEIs e MPEs
vendem por WhatsApp**; Instagram 57%, loja própria 10%.
([Agência Sebrae](https://agenciasebrae.com.br/dados/whatsapp-se-consolida-nas-vendas-on-line-enquanto-facebook-e-lojas-proprias-perdem-folego/))

**CNDL/SPC Brasil** — n=562 empresas, CATI 07/2024, MoE 4,1 p.p.: **67% usam WhatsApp como principal
canal de venda**. ⚠️ Os números "do lado do consumidor" atribuídos à CNDL (62% preferem, 73% compraram)
**não estão nessa fonte** — não citáveis.
([CNDL](https://site.cndl.org.br/67-das-empresas-vendem-principalmente-pelo-whatsapp-aponta-pesquisa-cndlspc-brasil/))

**Velocidade de resposta** — o argumento mais direto contra o formulário:
- **MIT/InsideSales (Oldroyd)**: 15.000 leads, 100+ empresas, 3 anos — contato em até 5 minutos =
  **100× mais chance de contato** e **21× mais chance de qualificar** vs 30 minutos.
- **Harvard Business Review, "The Short Life of Online Sales Leads"** (2011): 1,25 milhão de leads,
  2.241 empresas — responder em até 1 hora = **7× mais chance de qualificar** vs a hora seguinte.
  ([HBR](https://hbr.org/2011/03/the-short-life-of-online-sales-leads))
- Casa com a red flag da §5.8: **"demora nas respostas"** é motivo declarado de desistência de noiva.

### 🔴 Taxa de abertura WhatsApp vs e-mail — **[NÃO CITÁVEL]**

**Dito claramente:** o famoso **"98% de taxa de abertura do WhatsApp"** **não tem fonte primária
verificável**. Rastreia-se a material de marketing sem metodologia, amostra ou período. Há ainda um
problema estrutural: **os read receipts podem ser desativados pelo usuário**, o que torna "taxa de
abertura de WhatsApp" um indicador não mensurável de forma confiável. Os alternativos ("68% read rate",
"90–94%") são igualmente de blogs de fornecedor.

**Não use nenhuma comparação de abertura WhatsApp vs e-mail neste projeto.** Se precisar do argumento,
use **"94% abrem o app todo dia"** (Mobile Time/Opinion Box, jan/2024) — esse é medido e tem metodologia.

### 🔴 Clique-para-WhatsApp vs formulário — o estudo não existe

**Declaração explícita:** não existe nenhum estudo rigoroso — A/B test publicado com metodologia, paper
acadêmico ou relatório independente com amostra e significância — comparando botão de WhatsApp contra
formulário em taxa de lead. Buscado em inglês e em português, em termos acadêmicos e de indústria.
**Não existe.** Idem para "chatbot vs formulário": *"conversas convertem 4x mais"*, *"formulários 2–3%
vs chat 15–25%"* — todos de empresas que vendem chatbot, sem amostra e sem controle. **[NÃO CITÁVEL]**.

O que é citável, sempre rotulado como **case da Meta**:
- **Braip (Brasil)**: campanha 13–26/03/2025, teste A/B click-to-WhatsApp otimizado para **leads** vs
  para **mensagens** → **+45% leads qualificados, −30% custo por lead**.
  ⚠️ **Não compara WhatsApp vs formulário** — compara duas otimizações **dentro** do click-to-WhatsApp.
  Um anunciante, sem amostra divulgada.
  ([whatsappbusiness.com](https://whatsappbusiness.com/pt-br/resources/success-stories/braip/))
- Formulário instantâneo **+ Messenger** → **−8% CPL** e **+48% alcance** vs só formulário instantâneo.
  ([Meta for Business](https://www.facebook.com/business/ads/ad-objectives/lead-generation/lead-ads-with-messaging))

🔴 **[NÃO CITÁVEL]:** *"CTWA entrega 94% mais conversão e 92% menor CPL"* atribuído a um estudo Forrester
encomendado pela Meta — o estudo original não foi localizado.

### Os 8 números defensáveis, e o que NÃO dá para afirmar

1. **6,1%** — mediana Professional Services (Unbounce CBR 2024, 41k páginas). **Meta realista.**
2. **12,34% CVR / US$ 54,60 CPL** — Personal Services no Google Ads (WordStream 2026, 13.474 campanhas).
3. **2,1% → 1,5%** — a queda entre 3 e 4 campos (Omnisend 2026, 1,24 bi de exibições). **Teto de 3 campos.**
4. **2,2% mobile-only vs 1,4% desktop-only** (Omnisend). Justifica mobile-first com dado.
5. **98% têm WhatsApp; 94% abrem todo dia** (Mobile Time/Opinion Box, jan/2024, n=2.112).
6. **79% já falaram com marcas pelo app; 81% acham adequado para "pedir informações"** — exatamente o
   comportamento de quem busca orçamento de festa.
7. **61% já contrataram serviços mais de uma vez + 59% não gostam de resposta automática**
   (Opinion Box 2025). **O par que define o produto: botão de WhatsApp com humano do outro lado.**
8. **82% dos pequenos negócios já vendem por WhatsApp** (Sebrae 2026, n=8.200+). Enquadra o botão como
   **paridade competitiva**, não vantagem — o diferencial está na prova social e no tempo de resposta.

> 🔴 **E o que não dá para afirmar: que o botão de WhatsApp converte mais que um formulário.** Ninguém
> mediu isso publicamente. A recomendação de trocar o formulário de 4 campos pelo WhatsApp se sustenta
> em três coisas defensáveis — (a) o penhasco medido entre 3 e 4 campos, (b) o comportamento declarado
> do brasileiro, (c) a evidência de velocidade de resposta —, **não em um estudo comparativo direto.**
> Se essa hipótese for central para o projeto, **ela precisa ser testada pela própria Rapa Sound.**
> Sugestão honesta: manter um formulário **de 3 campos** como alternativa secundária e medir os dois.

## 3.5 Rastreamento do clique

### GA4

O enhanced measurement **pega**, mas não confie nele sozinho. O evento `click` dispara *"each time a
user clicks a link that leads away from the current domain"*, com `link_url`, `link_domain`,
`link_classes`, `link_id`, `outbound`
([support.google.com/analytics/answer/9216061](https://support.google.com/analytics/answer/9216061)) **[OFICIAL]**.

Duas limitações reais: (1) o `click` agrega **todos** os cliques externos — marcá-lo como key event
contaria links que não são conversão; (2) a navegação para o app pode abortar o request antes do envio,
e **o Google não documenta** o comportamento para links que abrem apps. **Verifique no DebugView em
device real.**

**Implementação em duas camadas:**

**(a) Evento explícito** — use o recommended event `generate_lead`
([referência oficial](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)):
```js
gtag('event', 'generate_lead', {
  currency: 'BRL',
  value: 0,                      // ou valor médio estimado de lead
  lead_source: 'whatsapp_fab',   // qual botão: fab | hero | card_servico | footer
  servico: 'som_15anos'          // qual dos 13 serviços
});
```

**(b) Key event a partir do `click`** — Admin › Eventos › Criar evento, com `event_name equals click`
**E** `link_url contains wa.me`. Limite: **50 eventos criados e 50 modificados por propriedade**
([answer/10085872](https://support.google.com/analytics/answer/10085872)).

**Marcar como key event:** "conversion" foi renomeado para **"key event"** em 2024. Admin › Eventos ›
ícone de estrela. Limite **30 key events** (50 no 360). *"Allow for up to 24 hours for it to show up in
standard reports"* e **"it doesn't change historic data"**
([answer/13128484](https://support.google.com/analytics/answer/13128484)).

**Via GTM:** trigger **Click - Just Links**, condição `Click URL contains wa.me`. **Ative "Wait for
Tags"** — sem isso o usuário navega antes da tag disparar (timeout padrão 2000 ms)
([answer/7679320](https://support.google.com/tagmanager/answer/7679320)).

> 🔴 **Cuidado crítico no mobile:** "Wait for Tags" funciona **cancelando a navegação e reemitindo-a**.
> Combinado com a regra do iOS de que universal links precisam de **gesto direto** (§3.2), isso pode
> **quebrar a abertura do app**. Se usar GTM com Wait for Tags, **teste em iPhone real**. A alternativa
> segura é `gtag` direto no handler, sem interceptar a navegação.

### Meta Pixel

🔴 **Use `Contact`, não `Lead`.** Definições oficiais
([meta-pixel/reference](https://developers.facebook.com/docs/meta-pixel/reference)):
- **Contact**: *"When a person initiates contact with your business via telephone, SMS, email, **chat**,
  etc."* ← descreve exatamente um clique em WhatsApp
- **Lead**: *"When a sign up is completed."* ← não é o caso

```js
fbq('track', 'Contact', { content_name: 'som_15anos', content_category: 'som' });
```

**iOS 14+ / ATT:** a resposta da Meta é o **Aggregated Event Measurement**, que exige **verificação de
domínio** e permite **no máximo 8 eventos de conversão priorizados por domínio**
([facebook.com/business/help/721422165168355](https://www.facebook.com/business/help/721422165168355)).
Com uma conversão única, 8 slots é folga — **priorize `Contact` como #1**.

**Vale CAPI aqui?** **Baixa prioridade neste projeto.** A CAPI envia eventos servidor → Meta; uma
landing estática não tem servidor, exigiria CAPI Gateway ou parceiro, e o ganho é maior onde há valor de
compra e otimização por ROAS. Se implementar, dedupe com `event_id` idêntico no browser e no servidor,
mesmo `event_name`, janela máxima de **7 dias** — *"Meta keeps the first event and drops the later ones"*
([doc de deduplicação](https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events)).

⚠️ **Nada disso pode disparar antes do consentimento** — ver §4.7.

### Preservar `utm_source=ig` até o clique

**Esclarecendo a premissa: para o GA4 você não precisa passar UTM nenhuma ao WhatsApp.** A UTM é lida na
chegada à landing e o GA4 atribui a **sessão**; o `generate_lead` disparado no clique já carrega
`session_source`/`session_medium` daquela sessão
([answer/11080067](https://support.google.com/analytics/answer/11080067)). Recomendação do Google: se
definir uma UTM, defina **todas** (`utm_source`, `utm_medium`, `utm_campaign`, `utm_id`,
`utm_source_platform`).

**O que realmente se perde é o contexto do lado humano** — quem atende no WhatsApp não sabe de onde a
pessoa veio. Duas opções:

**(a) Codificar a origem no próprio texto** (mais simples, funciona sempre):
`…?text=Ol%C3%A1%21%20Vim%20pelo%20Instagram.%20Quero%20or%C3%A7amento%20de%20SOM…`

**(b) Código curto no fim da mensagem:**
```js
const origem = new URLSearchParams(location.search).get('utm_source') || 'dir';
const cod = `${servico}-${origem}`;            // ex.: "som15-ig"
const msg = `${textoBase}\n\n[${cod}]`;        // \n vira %0A automaticamente
const url = `https://wa.me/5534991990994?text=${encodeURIComponent(msg)}`;
```
Guarde o mesmo `cod` no `generate_lead` para casar a conversa com a sessão.
⚠️ **Sem emoji** (§3.1) e **jamais `#`** — descarta o texto silenciosamente.

### Diferenciar qual dos 13 serviços gerou o clique

**GA4:** parâmetros `servico` e `lead_source` registrados em Admin › Definições personalizadas ›
Dimensões personalizadas, escopo **Evento**. Disponíveis em 24–48h; o Google recomenda **valores
alfanuméricos** ([answer/14239696](https://support.google.com/analytics/answer/14239696)).
🔴 **Não é retroativo — registre ANTES do lançamento.**
No GTM, prefira `data-servico="som_15anos"` no `<a>` + variável de atributo (mais estável que
`Click Text`).

**Meta:** `content_name` no `fbq('track','Contact', {...})`. Segmentar públicos por `content_name` não
gasta slots de AEM — mantenha **um** evento `Contact` e diferencie por parâmetro.

⚠️ **Alerta de dimensionamento:** 13 serviços × 4 posições = **52 combinações**. Numa landing local o
volume por célula será baixo demais para decidir qualquer coisa. **Agrupe em 3–4 categorias**
(som / iluminação / LED / estrutura) como dimensão principal, mantendo o serviço exato como parâmetro
secundário.

## 3.6 Ações imediatas da seção 3, por impacto

1. 🔴 **Encodar todos os 13 links.** O texto cru atual retorna **HTTP 400** quando enviado literalmente.
   É a falha mais concreta e mais barata de corrigir de todo o projeto.
2. 🔴 **Confirmar que nenhum link usa `web.whatsapp.com`** — no mobile vira página de download.
3. 🔴 **`<a href>` real, sem JS, sem `target="_blank"` no mobile.**
4. 🔴 **Testar em iPhone real, de dentro do Instagram.** O WKWebView não processa universal links.
   Provavelmente o maior vazamento do funil, e invisível em teste de desktop.
5. **Texto pré-preenchido diferente por serviço** — hoje os 5 botões têm o mesmo texto
   ("Vim pelo site e gostaria de marcar um atendimento"), o que joga fora a informação mais valiosa
   do clique.
6. **FAB 56×56 px**, canto inferior direito, alto contraste, **com rótulo textual**, mais CTA duplicado
   no hero e no rodapé. `viewport-fit=cover` + `env(safe-area-inset-bottom)` + `padding-block-end` no
   `body`.
7. **Formulário: de 4 campos para 3, ou eliminar.** 4 campos está exatamente em cima do penhasco medido.
8. **GA4:** `generate_lead` com `servico` e `lead_source` como custom dimensions **antes** do
   lançamento. **Meta:** `fbq('track','Contact')` + verificação de domínio — **depois do consentimento**.

---

# 4. LGPD — exposição real e implementação mínima correta

**Situação atual do site (de `INVENTARIO.md` §7):** Google Tag `AW-17926727806`, GTM `GTM-P3J5DF42` e
Meta Pixel `1037241428673660` via PixelYourSite, **sem cookie banner e sem política de privacidade**.

Convenção usada nesta seção:
🔴 **EXIGÊNCIA LEGAL** (texto de lei ou resolução vinculante) · 🟡 **ORIENTAÇÃO DA ANPD** (guia de boas
práticas, mas é o parâmetro de fiscalização) · 🟢 **BOA PRÁTICA** (reduz risco, não é exigido).

## 4.1 O que existe hoje de norma

| Documento | Data | Status em ago/2026 |
|---|---|---|
| [Lei 13.709/2018 — LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) | 14/08/2018 | Vigente |
| [**Guia Orientativo "Cookies e Proteção de Dados Pessoais"** v1.0 (PDF)](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf) | **out/2022** | **Ainda é a única versão.** |
| [Res. CD/ANPD 1/2021 — Regulamento de Fiscalização](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no1-2021) | 28/10/2021 | Vigente (alterada pela 4/2023) |
| [Res. CD/ANPD 2/2022 — agentes de pequeno porte](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022) | 27/01/2022 | Vigente |
| Res. CD/ANPD 4/2023 — dosimetria de sanções | 24/02/2023 | Vigente |
| [**Lei 15.352/2026** — transforma a ANPD em agência reguladora](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-ganha-nova-estrutura-e-se-consolida-como-agencia-reguladora) | **25/02/2026** | Vigente — autonomia + 200 cargos de especialista |
| [Mapa de Temas Prioritários 2026–2027](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-mapa-de-temas-prioritarios-para-o-bienio-2026-2027-e-atualiza-agenda-regulatoria-2025-2026) | 24/12/2025 | Vigente |

**Não existe** nenhuma resolução, norma vinculante ou nova edição do guia sobre cookies entre
out/2022 e ago/2026. O Guia v1.0 continua sendo o único pronunciamento da ANPD sobre o tema.

**Mas dois sinais recentes apontam direto para este site:** a Agenda Regulatória 2025–2026 inclui
*mecanismos de consentimento em plataformas digitais*, e o Mapa 2026–2027 lista como ação de
fiscalização o *"monitoramento de uso secundário de dados pessoais para entrega de publicidade
comercial direcionada"*. **Meta Pixel + Google Ads sem consentimento é literalmente a hipótese descrita.**

## 4.2 Base legal: por que "legítimo interesse" não salva o Pixel

O Guia da ANPD, p. 25, sobre cookies de publicidade:

> *"é possível afirmar que o legítimo interesse dificilmente será a hipótese legal mais apropriada nas
> hipóteses em que os dados coletados por meio de cookies são utilizados para fins de publicidade…
> em especial, se a coleta é efetuada por meio de cookies de terceiros e quando associada a práticas
> que podem implicar maior risco… como as de formação de perfis comportamentais… ou, ainda,
> rastreamento do usuário por páginas eletrônicas distintas. (…) Assim, o consentimento pode ser
> considerado uma hipótese legal mais apropriada para o uso de cookies de publicidade."*

Sobre cookies analíticos (p. 24), o legítimo interesse **é possível**, mas só *"quando o tratamento se
limitar à finalidade específica de identificação de padrões e tendências, com base em dados agregados
e **sem a combinação com outros mecanismos de rastreamento** ou sem a formação de perfis de usuários"*.

| Tag do site | Base legal viável | Por quê |
|---|---|---|
| **Meta Pixel** | 🔴 **Consentimento** | Cookie de terceiro (`_fbp`), perfis comportamentais, Custom/Lookalike Audiences |
| **Google Tag AW-** | 🔴 **Consentimento** | Tag de conversão publicitária, `_gcl_*`, remarketing |
| GA4 (se existir isolado) | 🟡 Legítimo interesse **possível** — mas só sem Google Signals, sem vínculo com Ads, sem exportação de audiências | Se o GA4 estiver linkado ao Ads (o normal quando há tag AW-), a condição do Guia se rompe |
| GTM (container) | Não é base legal — é o carregador. Bloquear as tags dentro dele. | |

⚠️ Invocar legítimo interesse exige **avaliação prévia documentada** (LIA / teste de balanceamento —
art. 10, §§ 1º a 3º) e mecanismo de oposição (art. 18, § 2º). Sem documento, é alegação vazia.

## 4.3 Consentimento prévio: pode disparar antes do aceite?

**Não.** O Guia (p. 32) manda *"desativar cookies baseados no consentimento por padrão"* e lista como
prática a evitar (p. 33) *"apresentar cookies não necessários ativados por padrão"*.

O fundamento legal é 🔴:
- **Art. 8º, caput** — o consentimento deve ser fornecido por meio que *"demonstre a manifestação de
  vontade"*, que é ato prévio ao tratamento.
- **Art. 9º, § 1º** — *"o consentimento… será considerado nulo caso as informações fornecidas ao
  titular… não tenham sido apresentadas **previamente** com transparência, de forma clara e inequívoca."*
- Guia, p. 18–19 — *"não se admitindo a sua inferência ou a obtenção de forma tácita ou a partir de
  uma omissão do titular"*.

**Conclusão:** disparar Pixel e Google Ads no page-load não é "consentimento tardio" — é **ausência de
hipótese do art. 7º**. Todo o dado coletado pelo Pixel do site atual está, hoje, **sem base legal**.

**Outros pontos, com a literalidade do Guia:**

- **Cookie wall:** *"não é compatível com a LGPD a obtenção 'forçada' do consentimento… sem o
  fornecimento de opções efetivas ao titular"* (p. 18). Para uma landing institucional, não faz
  sentido nem é defensável. Não use.
- **"Aceitar tudo" sem "rejeitar tudo" equivalente:** vedado em três lugares do Guia. É preciso
  *"disponibilizar botão que permita rejeitar todos os cookies não necessários, de fácil visualização,
  nos banners de primeiro e segundo nível"* (p. 30–31), e é prática a evitar *"dificultar a
  visualização ou compreensão dos botões de rejeitar… e conferir maior destaque apenas ao botão de
  aceite"* (p. 33). O modelo **aprovado** pela ANPD (Exemplo 2, p. 22) tem *"três opções, todas com o
  mesmo formato e destaque"*. **Paridade visual absoluta: mesma cor, tamanho e tipografia.**
- **Pré-marcação:** *"não é recomendável a utilização de banners de cookies com opções de autorização
  pré-selecionadas ou a adoção de mecanismos de consentimento tácito, como a pressuposição de que, ao
  continuar a navegação… o titular forneceria consentimento"* (p. 18–19). Mata o "ao continuar
  navegando, você concorda".

## 4.4 Política de privacidade: obrigatória?

A LGPD não diz literalmente "publique uma política". Ela cria um **dever de informação** que, na
internet, só se cumpre com um documento publicado. 🔴

**Conteúdo mínimo — art. 9º:** I finalidade específica; II forma e duração; III identificação do
controlador; IV contato do controlador; V uso compartilhado e finalidade; VI responsabilidades dos
agentes; VII direitos do titular com menção explícita ao art. 18.

**A sanção da omissão é técnica e imediata — art. 9º, § 1º: sem informação prévia, o consentimento é
nulo.** Ou seja: **banner sem política linkada produz consentimento juridicamente inválido**, e o site
continua sem base legal mesmo tendo banner.

Sobre a Política de Cookies, o Guia (p. 28–29) aceita três formatos: seção do aviso de privacidade,
documento separado, ou no próprio banner. Mas alerta (Exemplo 7, p. 36) que *"disponibilizar
informações sobre cookies somente por meio da Política de Privacidade pode não ser suficiente, pois o
titular nem sempre irá consultar a página"*. → **Política de Privacidade com seção de Cookies + as
informações essenciais também no banner de 2º nível.**

⚠️ **Dependência bloqueante:** a política exige **CNPJ e endereço válido**. O `INVENTARIO.md` registra
que o site **não tem CNPJ em nenhuma página** e que **7 páginas dizem um endereço e 6 dizem outro**.
Isso precisa ser resolvido com o cliente antes de publicar.

## 4.5 Encarregado/DPO — a PME precisa?

**Art. 41:** *"O controlador deverá indicar encarregado."* Mas a **Res. 2/2022, art. 11** dispensa:
*"Os agentes de tratamento de pequeno porte não são obrigados a indicar o encarregado"* — **desde que
disponibilizem canal de comunicação com o titular**.

Outras flexibilizações da Res. 2/2022: registro simplificado das operações (art. 9º), política
simplificada de segurança (art. 13), **prazo em dobro** para atender titulares e comunicar incidentes
(art. 14).

🔴 **O que ela NÃO dispensa — art. 6º:** *"A dispensa ou flexibilização das obrigações não isenta os
agentes de tratamento de pequeno porte do cumprimento dos demais dispositivos da LGPD, **inclusive das
bases legais e dos princípios**."* Ser pequena empresa **não dispensa de ter base legal para o Pixel**.

🟢 Indicar encarregado voluntariamente conta como política de boas práticas e governança para o
art. 52, § 1º, IX — ou seja, **é atenuante de sanção**. Para a Rapa Sound, pode ser o próprio sócio,
com `privacidade@rapasound.com.br` publicado.

## 4.6 Exposição real — a avaliação honesta

**Sanções — art. 52:** advertência; **multa simples de até 2% do faturamento no Brasil, limitada a
R$ 50 milhões por infração**; multa diária; publicização da infração; bloqueio; eliminação; suspensão
parcial do banco de dados (até 6 meses); suspensão da atividade de tratamento; proibição de atividades.
O § 1º traz 11 critérios de dosimetria, incluindo **boa-fé**, **condição econômica do infrator**,
**cooperação** e **pronta adoção de medidas corretivas**. O § 2º deixa claro que Procon, MP e ações
civis correm **em paralelo**.

> ⚠️ Para uma PME, "R$ 50 milhões" é teto teórico e não tem relação com a realidade. Quem vende
> consultoria de LGPD citando esse número para uma empresa de eventos de Uberlândia está exagerando.

**A ANPD já multou alguém?** Praticamente não.

- **Telekall Infoservice** — primeira e (em termos pecuniários) praticamente única sanção ao setor
  privado, DOU 06/07/2023: **R$ 7.200 por violação ao art. 5º do Regulamento de Fiscalização +
  R$ 7.200 por violação ao art. 7º da LGPD (ausência de base legal) + advertência** pelo art. 41.
  **Total: R$ 14.400.**
  ([ANPD](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aplica-a-primeira-multa-por-descumprimento-a-lgpd))
- O **total de multas pecuniárias aplicadas pela ANPD desde a vigência da LGPD soma R$ 14.400** — só
  esse caso. As demais sanções foram contra o setor público, que não paga multa.
- Em dez/2024 a ANPD abriu fiscalização contra **20 grandes empresas** por falta de encarregado; até
  abr/2025 **todas se adequaram e nenhuma foi multada**.
- **Casos envolvendo cookies ou pixel: nenhum, até ago/2026.**
- A própria ANPD registra que *"todos os processos sancionadores resultaram de conduta não
  colaborativa"*. **Na prática, quem responde e corrige não é multado.**
  ([Saiba como fiscalizamos](https://www.gov.br/anpd/pt-br/assuntos/fiscalizacao/saiba-como_fiscalizamos))

**Jurisprudência de dano moral por cookie/pixel:** não há jurisprudência consolidada. O que existe é o
precedente do **STJ de 05/09/2025** reconhecendo **dano moral presumido (*in re ipsa*)** por
disponibilização indevida de dados pessoais, mesmo não sensíveis.
([STJ](https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2025/05092025-Disponibilizacao-indevida-de-informacoes-pessoais-em-banco-de-dados-gera-dano-moral-presumido.aspx))
Na primeira instância, ações fundadas só em cookies costumam ser **julgadas improcedentes por ausência
de dano concreto** — mas esse precedente enfraquece a defesa.

**Risco real para a Rapa Sound:**

| Vetor | Probabilidade | Impacto |
|---|---|---|
| Multa da ANPD por cookies/pixel | 🟢 Muito baixa (< 1% ao ano) | Baixo (centenas a poucos milhares de R$) |
| Fiscalização por denúncia no Fala.BR | 🟡 Baixa, não desprezível | Baixo se cooperar — custo é tempo, não multa |
| **Cláusula de LGPD em licitação / due diligence B2B** | 🔴 **Alta e crescente** | **Perda de contrato** |
| Procon / Senacon | 🟡 Baixa | Médio |
| Ação individual de dano moral | 🟡 Baixa | Baixo (R$ 3–10 mil) |

> **O argumento correto para o cliente não é medo de multa.** É: (1) a correção custa cerca de um dia
> de trabalho; (2) **o público B2B que se quer conquistar — prefeitura, produtora, RH de empresa —
> exige declaração de conformidade LGPD em contrato e licitação**, e sem isso a empresa é
> desclassificada; (3) hoje o consentimento é nulo, então todo dado do Pixel está sem base legal; e
> (4) o vetor regulatório é claramente ascendente (Lei 15.352/2026 + 200 novos especialistas).

## 4.7 Implementação mínima correta

### Google Consent Mode v2

O Consent Mode **não é um banner** — a doc do Google é explícita: *"Consent mode does not provide a
consent banner or widget. Rather, it interacts with it."*
([support.google.com/analytics](https://support.google.com/analytics/answer/9976101))

Os 7 parâmetros: `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`,
`functionality_storage`, `personalization_storage`, `security_storage`.
([developers.google.com/tag-platform](https://developers.google.com/tag-platform/security/guides/consent))

```html
<!-- ANTES de qualquer tag do Google -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'granted',
    'wait_for_update': 500
  });
</script>
<!-- só depois: gtag.js / GTM -->
```

Após o aceite: `gtag('consent', 'update', { … 'granted' })`.

**No GTM:** todo container já traz o gatilho **"Consent Initialization – All Pages"**, que
*"will always fire before all other tags"*. Coloque os defaults nesse gatilho e **somente nele**; cada
tag recebe os *Additional consent checks* correspondentes.
([support.google.com/tagmanager](https://support.google.com/tagmanager/answer/10718549))

**Basic vs Advanced:** no **Basic** as tags **não carregam** antes do consentimento. No **Advanced**
elas carregam com defaults `denied` e enviam **pings sem cookies**, o que dá modelagem de conversão
específica do anunciante.
🟡 **Recomendação: Basic.** O Advanced envia sinal ao Google antes do consentimento; sob a leitura da
ANPD (IP + user-agent são dado pessoal) isso é discutível. Para uma landing de PME a perda de
modelagem é irrelevante e o ganho de defensabilidade é grande.

**Consent Mode v2 é obrigatório no Brasil?** 🔴 **Não.** A [Política de Consentimento do Usuário da UE
do Google](https://www.google.com/about/company/user-consent-policy-help/) aplica-se *"only to end
users located in the EEA, the UK, or Switzerland"*. O site não será suspenso do Google Ads por não
implementá-lo para tráfego brasileiro. **Mas a exigência de consentimento prévio para as tags AW- vem
da LGPD, e o Consent Mode é o mecanismo padrão de atendê-la.**

### Meta Pixel

Padrão oficial da Meta — a ordem é rígida
([developers.facebook.com](https://developers.facebook.com/docs/meta-pixel/implementation/gdpr)):

```javascript
fbq('consent', 'revoke');   // "You need to call revoke on every page."
fbq('init', '1037241428673660');
fbq('track', 'PageView');
// ... após consentimento afirmativo:
fbq('consent', 'grant');
```

| Abordagem | Prós | Contras |
|---|---|---|
| `fbq('consent','revoke')` antes do `init` | Padrão documentado; nenhum `_fbp`; nenhuma requisição de tracking | **`fbevents.js` ainda é baixado de `connect.facebook.net`** → o IP do visitante chega à Meta no load |
| **Não injetar o script até o aceite** | 🟢 **Zero contato com servidores da Meta antes do consentimento** | Primeiro PageView só após o aceite |

🟢 **Recomendação: não injetar o script antes do aceite.** É a única forma de garantir que nem o IP
trafegue sem base legal. Mantenha o `revoke` como fallback, caso o script já esteja em cache.

**Limited Data Use (LDU):** ❌ **exclusivo dos EUA** — 14 estados listados na doc. **Não há nenhum
suporte para o Brasil, nem flag da Meta para LGPD.**
([Data Processing Options](https://developers.facebook.com/docs/marketing-apis/data-processing-options))
🔴 Para o Brasil, a Meta não oferece atalho técnico. O controle tem que estar no seu site.

### Requisitos do banner

| Requisito | Classificação | Fundamento |
|---|---|---|
| Granularidade por finalidade (mín.: Necessários / Analíticos / Publicidade) | 🔴 | Art. 8º, § 4º — *"as autorizações genéricas… serão nulas"*; Guia p. 32 |
| Rejeitar com o **mesmo destaque** do aceitar | 🟡 forte | Guia p. 30–31 e 33; Exemplo 2 |
| Não necessários **desativados por padrão** | 🟡 forte | Guia p. 32–33 |
| **Registro/log do consentimento** | 🔴 | **Art. 8º, § 2º — *"Cabe ao controlador o ônus da prova de que o consentimento foi obtido em conformidade"*** |
| **Revogação fácil e gratuita** | 🔴 | **Art. 8º, § 5º.** Na análise do Exemplo 2, a ausência de mecanismo de revogação foi o **único defeito** de um banner no mais correto |
| Banner de 2º nível | 🟡 | Guia p. 33 |
| Em português | 🟡 | Guia p. 33 |
| Não granularizar demais | 🟡 | Guia alerta contra *"lista demasiadamente granularizada… fadiga"* — **3 categorias é o ponto certo** |

**Log a guardar** (art. 8º, § 2º): `consent_id` (UUID), timestamp, categorias escolhidas, ação,
versão do banner, **versão da política**, user-agent, URL de origem. Guarde em `localStorage` **e** em
endpoint próprio. 🟢 **Não armazene o IP completo** — o log não deve criar um tratamento novo e
desproporcional. Versionar a política é essencial: se o texto mudar, o consentimento antigo não cobre
a nova finalidade (art. 8º, § 6º).

**IAB TCF é relevante no Brasil?** ❌ Não. É padrão da IAB Europe para GDPR/ePrivacy. **Não existe TCF
brasileiro, nem certificação de CMP exigida pela ANPD, nem lista de CMPs homologadas.** Um banner
próprio bem feito é juridicamente equivalente a uma CMP paga.

### Ferramenta: banner próprio vs CMP

🟢 **Recomendação para esta landing: [`vanilla-cookieconsent`](https://github.com/orestbida/cookieconsent)
auto-hospedado** — MIT, sem dependências, ~14 KB, suporte nativo a Google Consent Mode, categorias
configuráveis. Custo zero, nenhum terceiro adicional processando dados dos visitantes (uma CMP externa
é, ela mesma, mais um tratamento), e atende ao desenho de banner que a ANPD chancela no Exemplo 6 do
Guia. Alternativa com bloqueio automático de iframes: [Klaro!](https://klaro.org).
CMP paga (CookieYes, Cookiebot, iubenda, goadopt.io) só se justifica com múltiplos domínios ou
necessidade de scanner automático — o iubenda tem a vantagem de gerar a política em português.

⚠️ **Ligação com a seção 2:** o banner **não pode empurrar o conteúdo do topo** — é a causa
arquetípica de CLS segundo o web.dev. Use overlay fixo ou bottom sheet.

### YouTube embed e Google Fonts

- **Embed do YouTube seta cookie antes do consentimento: sim.** E `youtube-nocookie.com` **não
  resolve completamente** — não seta cookie no load (medido, ver §2.3), **mas grava imediatamente um
  identificador persistente de dispositivo em `localStorage`** (`yt-remote-device-id`, ~1 ano). A LGPD
  trata identificador persistente como dado pessoal (art. 5º, I c/c art. 12, § 2º). O Guia classifica
  expressamente *"exibir anúncios ou **outros conteúdos incorporados**"* como cookie **não necessário** (p. 10).
  🟢 **Solução correta: a facade click-to-load da §2.3**, com `youtube-nocookie.com` após o clique e um
  aviso curto no overlay. **Resolve performance e LGPD com a mesma implementação.**
- **Google Fonts externo** transmite o IP do visitante ao Google a cada pageview. Precedente:
  **LG München I, 3 O 17493/20, 20/01/2022** — €100 de indenização por Google Fonts, com ameaça de
  €250.000 por reincidência. **No Brasil não há decisão equivalente nem posicionamento da ANPD.**
  🟢 Boa prática, não exigência — mas o custo é quase zero: baixe os `.woff2` e sirva do próprio
  domínio. Ganha conformidade e performance (§2.2). Vale para qualquer CDN de terceiro.

## 4.8 Plano de ação priorizado

| # | Ação | Classificação | Esforço |
|---|---|---|---|
| 1 | **Não injetar Meta Pixel nem Google Tag AW- até o aceite** | 🔴 art. 7º/8º | 2h |
| 2 | `gtag('consent','default', … 'denied')` inline no `<head>`; no GTM, no gatilho *Consent Initialization* | 🔴 meio de cumprimento | 30min |
| 3 | Banner de 1º nível, **3 botões com destaque idêntico**: Aceitar todos / Rejeitar não necessários / Gerenciar | 🟡 forte | incluído em 1 |
| 4 | Banner de 2º nível, 3 categorias, publicidade e analytics **desativados por padrão** | 🟡 forte | 1h |
| 5 | **Publicar Política de Privacidade** com os 7 incisos do art. 9º + seção de Cookies. **Sem ela o consentimento é nulo** | 🔴 arts. 6º, 9º e 9º § 1º | 3h |
| 6 | Link "Preferências de cookies" no rodapé (revogação) | 🔴 art. 8º, § 5º | 15min |
| 7 | Log de consentimento com timestamp, escolhas e versão da política | 🔴 art. 8º, § 2º | 1h |
| 8 | Publicar canal do titular (`privacidade@rapasound.com.br`) | 🔴 Res. 2/2022, art. 11 | 15min |
| 9 | YouTube → facade click-to-load com `youtube-nocookie` | 🟡 + ganho de performance | 1h (já na §2.5) |
| 10 | Self-host das fontes | 🟢 | 30min |
| 11 | Documentar o LIA se mantiver GA4 em legítimo interesse (e desvincular GA4 do Ads) | 🔴 se usar LI — art. 10 | 2h |
| 12 | Indicar encarregado voluntariamente | 🟢 atenuante — art. 52, § 1º, IX | 15min |

**Total: 1 a 1,5 dia de trabalho.** Desproporcional ao risco de multa (baixo), **proporcional ao risco
comercial B2B** — que é o público que a Rapa Sound quer abrir.

⚠️ **Bloqueantes para executar:** CNPJ, endereço fiscal válido e e-mail de privacidade. Nenhum dos
três existe hoje no site. Ver perguntas 1, 2 e 8 ao cliente no `INVENTARIO.md`.

---

# 5. As objeções reais — o que mãe de debutante e noiva de fato perguntam

Esta é a parte que vira conteúdo de página e FAQ com `FAQPage`. Tudo abaixo veio de fonte real —
fórum de noivas, artigos de cerimonialista, checklist de fornecedor, reclamação registrada,
material de fotógrafo e de empresa do próprio setor. As frases entre aspas são **literais da fonte**.

Uma observação metodológica honesta antes de tudo: **`comunidade.casamentos.com.br` e
`casamentos.pt` bloqueiam crawler (HTTP 403)**. O conteúdo desses fóruns entrou por snippet de
busca, que é literal mas parcial. Fóruns em português com discussão aberta sobre som/luz de festa
são poucos e rasos; o Reddit brasileiro praticamente não cobre o tema. **Comentários de YouTube e
Instagram foram buscados e não produziram nenhuma citação literal aproveitável** — o conteúdo de
vídeo de 15 anos no YouTube brasileiro é vlog e inspiração, e os comentários indexáveis são elogios,
não dúvidas de contratação. O material mais denso e mais citável está em **blogs de casamento,
checklists de cerimonialista, reclamações registradas e nas FAQs das próprias empresas do setor** —
que existem justamente porque essas perguntas chegam todo dia.

---

## 5.1 Preço e o que está incluso — a objeção nº 1, disparada

Esta domina tudo. Nos fóruns de noiva, quase todo tópico sobre som e luz é sobre preço.

**Perguntas literais e falas encontradas:**

- *"Qual a média dos orçamentos de som e iluminação?!"* — título de tópico do fórum de noivas.
  ([comunidade.casamentos.com.br](https://comunidade.casamentos.com.br/forum/qual-a-media-dos-orcamentos-de-som-e-iluminacao--t56882))
- *"Iluminação… preços."* / *"Quanto custa um dj para casamento?"* / *"Faixa de preço dj"* —
  títulos de outros quatro tópicos do mesmo fórum. O padrão é inequívoco.
- Uma noiva relata orçamento de **R$ 5.100** para som de cerimônia + festa + iluminação de pista e
  o considera **"muito alto"**. Outra cita **R$ 3.200 de som e luz + R$ 1.500 de DJ**. Faixas
  relatadas de DJ vão de **R$ 600 a R$ 18.000**. ([mesmo fórum](https://comunidade.casamentos.com.br/forum/qual-a-media-dos-orcamentos-de-som-e-iluminacao--t56882))
- Uma participante afirma que profissionais de casamento *"cobram preços altos às custas dos
  noivos"*.

**Faixas de mercado publicadas (para calibrar a resposta, não para publicar como tabela de preço):**

| Item | Faixa publicada | Fonte |
|---|---|---|
| Som só de cerimônia | R$ 800 – R$ 1.500 | [Lápis de Noiva](https://lapisdenoiva.com/som-para-casamento/) |
| Som de recepção e festa | R$ 2.500 – R$ 7.000 | Lápis de Noiva |
| Pacote completo (cerimônia + festa + iluminação) | R$ 5.000 – R$ 15.000 | Lápis de Noiva |
| Iluminação — pacote básico | R$ 1.500 – R$ 3.500 | [Casar365](https://casar365.com.br/iluminacao-para-casamento/) |
| Iluminação — intermediário | R$ 3.500 – R$ 8.000 | Casar365 |
| Iluminação — completo com light designer | R$ 8.000 – R$ 20.000+ | Casar365 |
| **Iluminação como % do orçamento total** | **5% a 10%** | Casar365 |
| Som e luz de festa de 15 anos (quando não incluso no espaço) | R$ 700 – R$ 7.000 | [Eventos Brasília](https://eventosbrasilia.com.br/quanto-custa-festa-15-anos/) |
| DJ para 15 anos | R$ 1.800 – R$ 4.000 | [Revista Oeste, fev/2026](https://revistaoeste.com/oestegeral/2026/02/21/quanto-custa-contratar-um-dj-para-festa-e-o-que-realmente-influencia-no-preco/) |
| Pista de LED (locação por noite) | R$ 500 – R$ 2.500 | [DDR Eventos](https://ddreventos.com.br/produto/pista-de-danca-de-led-4m-x-4m-locacao/) e correlatos |
| Festa de 15 anos completa, ~100 convidados | R$ 15.000 – R$ 50.000 (média ~R$ 25 mil) | [Ademicon](https://www.ademicon.com.br/blog/quanto-custa-uma-festa-de-15-anos) |

**O que realmente derruba a venda aqui não é o preço — é a opacidade.** Três achados:

1. **"Orçamento muito abaixo da média sem justificativa"** é listado como **sinal de alerta** pelo
   próprio guia de contratação de iluminação ([Casar365](https://casar365.com.br/iluminacao-para-casamento/)).
   Ser o mais barato é contraproducente nesse público.
2. **"Contrato genérico sem lista de equipamentos"** é o segundo sinal de alerta da mesma fonte.
   O que constrói confiança é **"lista detalhada dos equipamentos com modelo, marca e quantidade"**.
3. **48% dos brasileiros já abandonaram uma compra por falta de confiança no site ou aplicativo**;
   67% já desistiram de uma compra ao menos uma vez no último ano — CX Trends 2026, Octadesk +
   Opinion Box, 2.000 entrevistas, margem de 2,2 p.p.
   ([E-Commerce Brasil](https://www.ecommercebrasil.com.br/noticias/67-dos-consumidores-desistem-de-compras-online-entenda-os-motivos))

**Implicação para a página:** não publicar tabela de preço fechada, mas publicar **faixa a partir de**
e, sobretudo, **a lista do que está incluso em cada serviço**. O que está incluso é o que ela quer
saber; o preço é consequência disso.

---

## 5.2 Som alto demais / baixo demais — a objeção emocional da mãe

Esta é a objeção que ninguém escreve no formulário e todo mundo tem. A vovó não consegue conversar
no jantar; a pista fica sem graça; o vizinho chama a polícia.

**Falas literais:**

- *"Som ideal é aquele que você dança, curte, consegue conversar perto do ouvido de seu amigo sem
  precisar gritar."* E: se tiver **"apito na orelha"** no fim da noite, o som estava regulado errado
  e alto demais.
  ([Constance Zahn](https://www.constancezahn.com/tira-duvidas-7-dicas-para-ter-o-som-perfeito-no-casamento/))
- Volume muito alto no jantar *"frustra os convidados, sobretudo os familiares mais velhos, e
  dificulta a conversa entre eles"*; um jantar de casamento *"não é uma discoteca onde só se
  conversa aos gritos"*.
  ([O Nosso Casamento](https://onossocasamento.pt/artigos/musica-recepcao-casamento-que-nao-fazer) /
  [Casamentos.pt — 10 reclamações mais frequentes](https://www.casamentos.pt/artigos/as-10-reclamacoes-de-convidados-mais-frequentes-nos-casamentos-e-como-evita-las--c5201))
- A recomendação técnica é **volume progressivo**: som ambiente baixo e agradável no jantar,
  volume máximo só nas últimas músicas.
- **A causa raiz é técnica, não de gosto:** o maior problema é *"a ausência do sistema de sonorização
  ambiente"*, que deveria manter som homogêneo em toda a área **com controle de volume separado por
  setor**. Sistemas *"Four Point"* minimizam a projeção e permitem festa animada sem impedir conversa.
  (Constance Zahn)
- **Dimensionamento**: casamento ao ar livre precisa de ~40% mais potência. Um salão de 400 pessoas
  precisa de ~8.000 W fechado contra ~14.000 W aberto. (Constance Zahn)
- **Subdimensionar para economizar** é listado como erro clássico: *"quem está no fundo não escuta"*.
  ([Equipe Técnica](https://equipetecnica.com.br/sonorizacao-para-eventos-corporativos-em-sao-paulo-o-guia-definitivo-para-nao-errar-na-escolha/))
- Risco externo real: em Goiânia, festa de aniversário de casamento **terminou em briga com vizinho de
  62 anos** por som alto.
  ([Mais Goiás](https://www.maisgoias.com.br/cidades/goiania/go-festa-de-aniversario-de-casamento-termina-com-briga-entre-vizinhos-apos-discussao-por-som-alto/))

**Implicação:** a Rapa Sound tem aqui um diferencial vendável e nunca dito — **zoneamento de som por
setor** e **curva de volume ao longo da noite**. Isso responde simultaneamente ao medo da mãe
("minha tia não vai conseguir conversar") e ao desejo da debutante ("quero a pista bombando").

---

## 5.3 A luz estragar a foto e o vídeo — a objeção que a mãe herda do fotógrafo

Este é o ponto mais subestimado e o de maior potencial de diferenciação. **O fotógrafo é o
influenciador oculto da decisão.** Ele reclama, e a mãe passa a exigir.

**Falas literais:**

- Luz colorida na cerimônia *"não é indicada para fotografia e filmagem, pois pode refletir e manchar
  a pele dos noivos e convidados, com pouca possibilidade de correção em editores de imagem"*.
  *"Luz colorida reflete bastante na pele, e toda noiva quer valorizar o skincare."*
  ([We Do Meraki](https://wedomeraki.com.br/iluminacao-no-casamento-fotografo-casamento-em-paraty))
- **Laser:** *"tremendamente contraindicado para fotografia e filmagem, pois costuma 'riscar' e
  arruinar as fotos, além de poder danificar o sensor da câmera"* — e pode *"estragar o equipamento
  da equipe de foto e vídeo ou causar danos irreversíveis aos convidados"*. (mesma fonte)
- **Números técnicos publicados:** temperatura ideal **2.700K a 3.200K**. *"Luz fria (acima de 4.500K)
  deixa o ambiente com cara de escritório ou hospital."* O risco maior é a *"mistura de temperaturas
  diferentes em um mesmo ambiente"*, que quebra o balanço de branco. Cores que prejudicam foto:
  **verde, azul frio intenso, roxo saturado e vermelho direto no rosto**.
  ([Casar365](https://casar365.com.br/iluminacao-para-casamento/))
- Recomendação explícita ao casal: *"Antes de fechar o projeto de iluminação, envie a proposta para o
  fotógrafo revisar."* (Casar365) — ou seja, **a proposta da Rapa Sound vai ser lida por um fotógrafo.**
- Do outro lado, **falta de luz também destrói o vídeo**: *"a falta de luz é o inimigo número 1 da
  fotografia e do vídeo"*; sem luz o vídeo **fica granulado porque a câmera sobe o ISO**.
  ([Black Lenses Project](https://blacklensesproject.pt/2022/02/08/casamentos-10-dicas-na-hora-de-escolher-a-empresa-para-o-vosso-video/))
- Isso chega a virar processo: empresa **condenada a R$ 10 mil de dano moral + R$ 1,4 mil de dano
  material** por filmagem com *"imagens ruins, escuras, sem nitidez"*.
  ([Migalhas](https://www.migalhas.com.br/quentes/407646/empresa-e-condenada-por-ma-qualidade-na-filmagem-de-casamento) /
  [TJDFT](https://www.tjdft.jus.br/institucional/imprensa/noticias/2021/fevereiro/consumidora-deve-ser-indenizada-por-falhas-na-filmagem-do-casamento))

**Implicação:** a Rapa Sound vende LED, painel, túnel e área instagramável — ou seja, **vende a foto**.
Dizer na página "trabalhamos alinhados com seu fotógrafo e filmagem; luz âmbar/quente na cerimônia e
nos retratos, cor só na pista, laser sob consulta" é a resposta mais forte que existe para este
público. Hoje o site não diz uma palavra sobre isso.

---

## 5.4 Quem opera durante a festa — e o que acontece se der problema no meio

**Falas literais:**

- Erro nº 1 do setor: *"Contratar só equipamento, sem técnico operador — microfonia acontece e
  ninguém resolve."* ([Equipe Técnica](https://equipetecnica.com.br/sonorizacao-para-eventos-corporativos-em-sao-paulo-o-guia-definitivo-para-nao-errar-na-escolha/))
- Outros erros da mesma lista: *"Não prever microfones reserva"*, *"Não testar o sistema com
  antecedência"*.
- Pergunta recomendada à noiva: *"Quem será o responsável no dia do evento, se terá um técnico do
  começo ao fim"*, e se *"a equipe realiza testes de som no local"*.
  ([Lápis de Noiva](https://lapisdenoiva.com/som-para-casamento/))
- Do checklist de 12 perguntas ao fornecedor de iluminação: **"Quantos técnicos ficam no local
  durante toda a festa?"** e **"Plano para falha de equipamento durante a festa?"**
  ([Casar365](https://casar365.com.br/iluminacao-para-casamento/))
- *"Existência de um plano de contingência, com equipamentos reserva ou suporte rápido."* (Lápis de Noiva)
- Empresas com estrutura maior *"têm material para mais de um evento no mesmo dia; caso algum
  equipamento venha a dar problema, possuem reserva"*. E *"a regra de ouro é sempre contratar mais um
  microfone reserva do que o número de palestrantes — redundância não é luxo, é proteção"*.
- **A cláusula de contrato que assusta:** contratos padrão do setor dizem que, em caso de pane,
  *"a contratada reserva-se o direito de tentar resolver a pane e caso não consiga, acontecerá o
  encerramento da apresentação"*.
  ([Studio On CWB — contrato modelo](https://studiooncwb.com.br/wp-content/uploads/2021/08/CONTRATO-Studio-on-CWB.pdf))
  Quem lê isso e não recebe garantia contrária, desiste.
- O checklist pede ainda: *"O contrato prevê algum tipo de compensação se o serviço não for entregue
  conforme combinado?"* (Casar365)

**Implicação:** "técnico da nossa equipe do início ao fim, equipamento reserva em campo, e o nome do
responsável técnico no contrato" é resposta de FAQ obrigatória. Quase 30 anos e 116 artistas atendidos
são a prova — mas a prova precisa estar **em texto ao lado da promessa**, não numa imagem PNG.

---

## 5.5 Montagem, desmontagem e o horário do salão

**Falas literais:**

- *"Horário para a montagem e desmontagem da festa e, principalmente, horário de fechamento do local
  são detalhes fundamentais."*
  ([Casamentos.com.br](https://www.casamentos.com.br/artigos/8-coisas-que-devera-perguntar-antes-de-contratar-o-espaco-do-casamento--c6509) /
  [Zankyou](https://www.zankyou.pt/p/as-12-perguntas-que-deve-colocar-para-desfrutar-do-espaco-perfeito-no-seu-grande-dia))
- Perguntas do checklist: *"Montagem e desmontagem incluídas? Tempo necessário?"* e *"O orçamento
  inclui **visita técnica ao local** antes do dia do casamento?"* (Casar365)
- No contrato deve constar *"horários de montagem/desmontagem com penalidade para atraso"* e
  *"responsabilidade por danos ao espaço"*. (Casar365)
- Sinal de alerta explícito: **"empresa não quer fazer visita técnica"**. (Casar365)
- Reclamações de atraso de fornecedor são o padrão do setor no Procon — *"problemas enfrentados na
  hora da cerimônia ou da festa"*, incluindo fornecedores que *"simplesmente não apareceram"*.
  ([Idec](https://idec.org.br/consultas/dicas-e-direitos/vai-casar-saiba-seus-direitos-na-hora-de-contratar-servicos-de-casamento))

**Implicação:** dizer o tempo de montagem por porte de evento e afirmar que a visita técnica é feita
(e se é cortesia) resolve a objeção e ainda cria motivo de contato — o que alimenta o WhatsApp.

---

## 5.6 "O espaço já tem estrutura / já vem com som e luz"

Objeção de desqualificação: a mãe acha que não precisa contratar ninguém.

**Falas literais:**

- *"Alguns espaços já incluem esses serviços no pacote, mas caso não estejam inclusos, estima-se um
  valor entre R$700 e R$7.000."*
  ([Eventos Brasília](https://eventosbrasilia.com.br/quanto-custa-festa-15-anos/))
- *"Muitas empresas de sonorização oferecem pacotes que incluem iluminação, mas isso não é uma regra —
  é importante perguntar caso queira facilitar contratando uma empresa só."* (Lápis de Noiva)
- *"Alguns decoradores já oferecem serviços de iluminação cênica — verifique se está incluso ou se
  precisa contratar à parte."* (Casamentos.com.br)
- Pergunta do checklist: *"Gerador próprio ou tenho que providenciar?"*; e *"gerador elétrico, quando
  o local não tem estrutura suficiente para os equipamentos"* é **cobrado à parte**. (Casar365)
- Também cobrado à parte: **torres de iluminação, quando não há pontos de fixação no teto**. (Casar365)
- Na prática elétrica, o salão comum não aguenta: um disjuntor de 50 A em 220 V suporta ~11.000 W;
  para eventos com som, iluminação e refrigeração a recomendação de gerador vai de **45 kVA a 100 kVA**.
  ([A Geradora](https://www.ageradora.com.br/estime-a-potencia-necessaria-do-gerador-para-a-sua-festa/) /
  [Bira Geradores](https://www.birageradores.com.br/gerador-para-festas))

**Implicação:** a resposta honesta — "fazemos visita técnica e dizemos o que o seu espaço já resolve e
o que falta; se a rede não aguentar, o gerador entra no orçamento **antes**, não como surpresa" — é
mais persuasiva que qualquer superlativo. E é uma resposta que **nenhum concorrente local publica**.

---

## 5.7 Prazo de reserva de data — a objeção de urgência (a favor da empresa)

**Falas literais:**

- *"Não. A disponibilidade pode mudar rapidamente. Por isso, a data só fica reservada após alinhamento,
  confirmação e fechamento do evento."* — resposta padrão de FAQ do setor.
  ([DJ Pisqüila, mai/2026](https://djpisquila.com.br/2026/05/18/perguntas-frequentes-dj-pisquila/))
- *"O ideal é reservar o quanto antes, principalmente para casamentos, festas de 15 anos, formaturas e
  datas com maior procura."* (mesma fonte)
- Antecedência recomendada publicada: **12–18 meses** para espaço, cerimonial, foto/vídeo e buffet;
  **6–12 meses** para decoração, música/DJ, som e iluminação.
  ([FestApp](https://www.festapp.com.br/blog/checklist-festa-de-15-anos-o-que-organizar-e-em-qual-ordem) /
  [Eventos Indaiá](https://eventosindaia.com.br/blog/checklist-festa-15-anos/))
- Alta temporada de casamento citada: **maio, setembro, outubro e novembro**.
- Erro mais citado em festa de 15 anos: **"contratar fornecedores em cima da hora — os preços sobem e
  os melhores já estão reservados"**.
  ([Ouse Festar](https://www.ousefestar.com/blog/festa-15-anos-guia-completo))

**Implicação:** esta é a única objeção que joga a favor. "Consulte a data antes de fechar o salão"
é um CTA de WhatsApp melhor que "peça um orçamento", porque tem prazo embutido e custo zero para ela.

---

## 5.8 Sinal, forma de pagamento e o medo de perder o dinheiro

**Falas literais:**

- *"A reserva é feita mediante contrato e sinal."* Modelos praticados encontrados:
  **entrada de 30% na assinatura, saldo até 15 dias antes**; ou **entrada na assinatura e saldo
  parcelado sem juros até 5 dias antes do evento**; com **desconto no PIX** ou **parcelamento em até
  12x no cartão**.
  ([Casamentos.com.br — perfis de fornecedor](https://www.casamentos.com.br/musica-de-casamento/extreme-som-e-iluminacao--e168574),
  [432UP](https://www.432up.com/casamento-sp))
- Red flags que fazem a noiva desistir, literalmente: **"falta de contrato claro e detalhado"**,
  **"orçamento muito abaixo do mercado"**, **"demora nas respostas"**, ausência de avaliações, e
  **"pressão para fechar rapidamente"** — *"fornecedores confiáveis respeitam o tempo de decisão"*.
  ([Seu Casório](https://seucasorio.com.br/noticias/red-flags-ao-contratar-fornecedores-casamento))
- Recomendação do setor: **"contrate fornecedores bem recomendados — fuja do barato, ele geralmente
  sai caro"**, e **contrato individual para cada profissional envolvido**.
  ([CasaMe](https://caseme.com.br/meu-fornecedor-furou-e-agora/))
- No contrato devem constar **"cláusula de cancelamento com valores definidos"** e o **"nome do
  responsável técnico que vai acompanhar o evento"**. (Casar365)

**Nota sobre "demora nas respostas":** isso não é só irritação, é perda mensurável. O estudo
MIT/InsideSales (Oldroyd, 15.000 leads, 100+ empresas) mede **21x mais chance de qualificar** um lead
contatado em até 5 minutos contra 30 minutos; o estudo da Harvard Business Review (2011, 1,25 milhão
de leads, 2.241 empresas) mede **7x mais chance** ao responder em até 1 hora contra a hora seguinte.
Isso é o argumento direto para o WhatsApp com resposta rápida em vez de formulário.
([HBR — The Short Life of Online Sales Leads](https://hbr.org/2011/03/the-short-life-of-online-sales-leads))

---

## 5.9 Objeções específicas de LED, pista e efeitos (o produto principal da empresa)

Menos documentadas em fórum, mas presentes em todo material comercial do setor — o que indica que
são perguntas recorrentes de balcão:

- **Tamanho da pista de LED:** os tamanhos mais contratados são **3x3 m, 4x4 m e 5x5 m**; a 4x4 m tem
  16 m² e é indicada para **eventos com mais de 100 convidados**, *"ideal para festas de 15 anos com
  festa grande, pois a valsa precisa de espaço"*.
  ([DDR Eventos](https://ddreventos.com.br/produto/pista-de-danca-de-led-4m-x-4m-locacao/),
  [Gold Vision](https://goldvisionbrasil.com.br/5-vantagens-de-alugar-um-piso-de-led-para-a-sua-festa-de-15-anos/))
- **A locação inclui montagem e técnico de operação** — dito explicitamente pelos fornecedores, o que
  significa que a pergunta "isso vem com alguém pra operar?" é feita o tempo todo.
- **Painel de LED:** usado com *"imagens da debutante, imagens aleatórias e nomes e frases
  personalizadas"*; um painel atrás da mesa de doces é vendido por ~R$ 800.
  ([LED10](https://led10.com.br/painel-de-led-em-festa-de-debutante/))
- **Máquina de fumaça x alarme de incêndio:** a fumaça densa **dispara detector de fumaça** porque
  imita as características de fumaça de incêndio; a recomendação é **combinar com o salão antes**.
  Objeção real e específica, e a resposta certa é "fazemos fumaça baixa / gelo seco, e alinhamos com o
  espaço na visita técnica".
- **Efeitos indoor (chuva de prata, sky paper, cascata):** *"muito usados na valsa do casamento e nas
  entradas das debutantes"*; lançadores de papel metálico são **seguros para ambiente fechado**; e a
  orientação do setor é usar *"sempre com critério — só em momentos notáveis, como a entrada, uma
  dança, um discurso"*.
  ([Festa15Anos](https://www.festa15anos.com/post/encante-seus-convidados-com-efeitos-especias-na-sua-festa-de-15-anos),
  [Adilson Freitas](https://www.adilsonfreitas.com.br/efeitos-especiais-fogos-indoor-chuva-de-prata-sky-paper-e-cascata/))

---

## 5.10 Ranking das objeções por força

Ordenado por frequência nas fontes × poder de matar a venda.

| # | Objeção | Público que mais sente | Onde responder na página |
|---|---|---|---|
| 1 | Preço opaco — não sei quanto custa nem o que vem junto | Mãe de debutante | Faixa "a partir de" + lista do que está incluso em cada âncora de serviço |
| 2 | A luz vai estragar a foto e o vídeo da minha filha | Mãe e noiva (via fotógrafo) | Seção de iluminação + FAQ + prova em vídeo |
| 3 | Se der problema no meio da festa, quem resolve? | Mãe de debutante | FAQ + "técnico do início ao fim" + rider dos 116 artistas |
| 4 | Som alto demais para a família / baixo demais para a pista | Mãe de debutante | FAQ (zoneamento e curva de volume) |
| 5 | O espaço já não tem som e luz? Preciso mesmo disso? | Mãe e noiva | FAQ + oferta de visita técnica |
| 6 | Contrato, sinal e o medo de perder o dinheiro | Mãe de debutante | FAQ + contrato com lista de equipamento |
| 7 | Montagem/desmontagem e horário do salão | Noiva e cerimonialista | FAQ |
| 8 | A data ainda está livre? | Ambas — **objeção a favor** | CTA primário do WhatsApp |

---

## 5.11 Rascunho de FAQ — 11 perguntas, na voz do cliente

Redigidas como a mãe/noiva pergunta, não como a empresa gostaria que perguntassem. Cada uma com a
fonte que a sustenta.

⚠️ **Ajuste de expectativa, por conta do achado da §1.2:** o **FAQ rich result foi encerrado pelo
Google em 07/05/2026** — não há mais acordeão na SERP para ninguém. O `FAQPage` em JSON-LD continua
válido, mas é **puramente semântico**. O valor real desta FAQ é outro, e é maior: **HTML visível que
alimenta passage ranking, AI Overviews, AI Mode e o botão "Ask" do Google Business Profile** — que
substituiu o Q&A público do GBP em novembro de 2025. Some-se a isso o efeito direto em conversão:
cada objeção respondida na página é uma dúvida a menos entre ela e o botão de WhatsApp.

Regra que continua valendo: **o texto do schema tem que ser idêntico ao texto visível**. O Google é
literal — *"Don't mark up content that is not visible to readers of the page."*
([sd-policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies))

---

**1. Quanto custa o som e a iluminação da festa de 15 anos? O que está incluso no valor?**

> Depende do tamanho do salão, do número de convidados e de quais serviços você quer. Para calibrar:
> som de festa costuma ficar entre R$ 2.500 e R$ 7.000, e iluminação entre 5% e 10% do orçamento total
> do evento. Todo orçamento nosso vem com **a lista dos equipamentos, modelo e quantidade**, mais
> transporte, montagem, desmontagem e o técnico que fica na festa. Sem item escondido.

*Fonte da objeção:* tópicos "Qual a média dos orçamentos de som e iluminação?!" e "Iluminação… preços"
no fórum da [Casamentos.com.br](https://comunidade.casamentos.com.br/forum/qual-a-media-dos-orcamentos-de-som-e-iluminacao--t56882);
faixas de [Lápis de Noiva](https://lapisdenoiva.com/som-para-casamento/) e
[Casar365](https://casar365.com.br/iluminacao-para-casamento/), que também lista "contrato genérico
sem lista de equipamentos" como sinal de alerta.

---

**2. A iluminação colorida não vai estragar as fotos e o vídeo da minha filha?**

> Essa é a pergunta certa — e o motivo é real: luz colorida reflete na pele e é quase impossível de
> corrigir na edição; laser chega a riscar a imagem e pode danificar o sensor da câmera. Por isso
> trabalhamos com **luz quente, entre 2.700K e 3.200K, nos momentos que vão para a foto** — entrada,
> valsa, retratos, mesa do bolo — e deixamos a cor forte para a pista. Se quiser, mandamos o projeto
> de luz para o seu fotógrafo revisar antes de fechar.

*Fonte:* [We Do Meraki](https://wedomeraki.com.br/iluminacao-no-casamento-fotografo-casamento-em-paraty)
("mancha a pele", laser "risca e arruína as fotos");
[Casar365](https://casar365.com.br/iluminacao-para-casamento/) (2.700–3.200K, cores que prejudicam,
"envie a proposta para o fotógrafo revisar").

---

**3. E se a luz ficar fraca demais? Ouvi dizer que o vídeo fica escuro e granulado.**

> Também acontece, e é o outro extremo do mesmo erro. Sem luz, a câmera sobe o ISO e o vídeo fica
> granulado. O projeto de iluminação é dimensionado para o tamanho do salão e para a equipe de foto e
> vídeo trabalhar — não só para a pista ficar bonita.

*Fonte:* [Black Lenses Project](https://blacklensesproject.pt/2022/02/08/casamentos-10-dicas-na-hora-de-escolher-a-empresa-para-o-vosso-video/)
("falta de luz é o inimigo número 1"; ISO alto = vídeo granulado); caso julgado de filmagem com
"imagens escuras, sem nitidez" — [Migalhas](https://www.migalhas.com.br/quentes/407646/empresa-e-condenada-por-ma-qualidade-na-filmagem-de-casamento).

---

**4. Tem alguém da equipe operando o som durante a festa toda, ou vocês só montam e vão embora?**

> A equipe fica. Tem técnico nosso do início ao fim, operando som e luz. Montar e ir embora é o erro
> mais comum do setor: quando dá microfonia no meio do discurso, não tem ninguém para resolver.

*Fonte:* [Equipe Técnica](https://equipetecnica.com.br/sonorizacao-para-eventos-corporativos-em-sao-paulo-o-guia-definitivo-para-nao-errar-na-escolha/)
("contratar só equipamento, sem técnico operador — microfonia acontece e ninguém resolve");
pergunta nº 9 do checklist da [Casar365](https://casar365.com.br/iluminacao-para-casamento/)
("Quantos técnicos ficam no local durante toda a festa?"); [Lápis de Noiva](https://lapisdenoiva.com/som-para-casamento/)
("se terá um técnico do começo ao fim").

---

**5. E se queimar um equipamento no meio da festa? A festa para?**

> Não. Levamos equipamento reserva para o evento — microfone, mesa e as peças críticas — e o técnico
> está no local para trocar na hora. É a diferença entre uma pane de 30 segundos e uma festa que acaba
> cedo.

*Fonte:* pergunta nº 6 do checklist da [Casar365](https://casar365.com.br/iluminacao-para-casamento/)
("Plano para falha de equipamento durante a festa?"); [Lápis de Noiva](https://lapisdenoiva.com/som-para-casamento/)
("plano de contingência, com equipamentos reserva"); contrato-padrão do setor que prevê
"encerramento da apresentação" em caso de pane —
[modelo público](https://studiooncwb.com.br/wp-content/uploads/2021/08/CONTRATO-Studio-on-CWB.pdf).

---

**6. Tenho medo do som ficar alto demais e a família mais velha não conseguir conversar. Como vocês controlam isso?**

> Som ambiente e pista têm controle separado por setor. Na recepção e no jantar o volume fica baixo,
> para dar para conversar; na pista sobe. O ponto certo é aquele em que você dança e ainda consegue
> falar no ouvido de alguém sem gritar — se no fim da noite alguém sai com apito no ouvido, o som
> estava errado.

*Fonte:* [Constance Zahn](https://www.constancezahn.com/tira-duvidas-7-dicas-para-ter-o-som-perfeito-no-casamento/)
("ausência do sistema de sonorização ambiente", controle por setor, "sem precisar gritar", "apito na
orelha"); [Casamentos.pt](https://www.casamentos.pt/artigos/as-10-reclamacoes-de-convidados-mais-frequentes-nos-casamentos-e-como-evita-las--c5201)
(volume alto no jantar entre as reclamações mais frequentes de convidado).

---

**7. O salão que contratei já disse que tem som e iluminação. Ainda preciso de vocês?**

> Às vezes sim, às vezes não — e a gente diz a verdade. Fazemos visita técnica no espaço e apontamos
> o que ele já resolve e o que falta: potência para o número de convidados, pontos de fixação no teto,
> e principalmente se a rede elétrica aguenta. É comum o local não aguentar e o gerador ser necessário;
> quando é o caso, isso entra no orçamento antes, não como surpresa no dia.

*Fonte:* [Eventos Brasília](https://eventosbrasilia.com.br/quanto-custa-festa-15-anos/) ("alguns espaços
já incluem esses serviços"); [Casar365](https://casar365.com.br/iluminacao-para-casamento/) (gerador e
torres cobrados à parte; "empresa não quer fazer visita técnica" é sinal de alerta);
[A Geradora](https://www.ageradora.com.br/estime-a-potencia-necessaria-do-gerador-para-a-sua-festa/)
(45–100 kVA para festa com som, luz e refrigeração).

---

**8. Que horas vocês montam e desmontam? O salão só me libera a partir de certa hora.**

> Alinhamos montagem e desmontagem com o horário que o espaço libera, e isso vai por escrito no
> contrato. Na visita técnica já definimos quanto tempo precisamos, para você fechar esse detalhe com
> o salão sem risco de conflito de horário no dia.

*Fonte:* [Casamentos.com.br](https://www.casamentos.com.br/artigos/8-coisas-que-devera-perguntar-antes-de-contratar-o-espaco-do-casamento--c6509)
e [Zankyou](https://www.zankyou.pt/p/as-12-perguntas-que-deve-colocar-para-desfrutar-do-espaco-perfeito-no-seu-grande-dia)
("horário para montagem e desmontagem e, principalmente, horário de fechamento do local são detalhes
fundamentais"); [Casar365](https://casar365.com.br/iluminacao-para-casamento/) ("horários de
montagem/desmontagem com penalidade para atraso" no contrato).

---

**9. Com quanto tempo de antecedência preciso fechar? Minha festa é só daqui a X meses.**

> Para som, luz e LED o mercado trabalha com **6 a 12 meses**. Sábado em maio, setembro, outubro e
> novembro é o que enche primeiro. A consulta de data é gratuita e não compromete nada — vale
> perguntar antes mesmo de fechar o salão.

*Fonte:* [FestApp](https://www.festapp.com.br/blog/checklist-festa-de-15-anos-o-que-organizar-e-em-qual-ordem)
e [Eventos Indaiá](https://eventosindaia.com.br/blog/checklist-festa-15-anos/) (6–12 meses para
música/som/luz; alta temporada); [Ouse Festar](https://www.ousefestar.com/blog/festa-15-anos-guia-completo)
("contratar em cima da hora — os preços sobem e os melhores já estão reservados");
[DJ Pisqüila](https://djpisquila.com.br/2026/05/18/perguntas-frequentes-dj-pisquila/) ("a data só fica
reservada após confirmação e fechamento").

---

**10. Como funciona o pagamento? Preciso pagar tudo de uma vez para reservar a data?**

> Não. A data é reservada com contrato assinado e um sinal; o saldo é parcelado até alguns dias antes
> do evento. O contrato traz a lista dos equipamentos, os horários, o nome do responsável técnico e a
> cláusula de cancelamento com valores definidos — para você saber exatamente onde está pisando.

*Fonte:* modelos praticados publicados por fornecedores em
[Casamentos.com.br](https://www.casamentos.com.br/musica-de-casamento/extreme-som-e-iluminacao--e168574)
e [432UP](https://www.432up.com/casamento-sp) (30% de entrada, saldo até 15 dias antes, PIX/12x);
[Seu Casório](https://seucasorio.com.br/noticias/red-flags-ao-contratar-fornecedores-casamento)
("falta de contrato claro e detalhado" e "pressão para fechar rapidamente" como red flags);
[Casar365](https://casar365.com.br/iluminacao-para-casamento/) (cláusula de cancelamento e nome do
responsável técnico no contrato).

---

**11. Qual o tamanho ideal de pista de LED para a valsa? E máquina de fumaça pode em salão fechado?**

> Para festa acima de 100 convidados a pista de 4x4 m (16 m²) é a mais pedida — a valsa precisa de
> espaço. A locação já vem com montagem e o técnico que opera os efeitos. Sobre fumaça: a densa dispara
> detector de incêndio em salão fechado, então usamos fumaça baixa ou gelo seco e alinhamos com o
> espaço na visita técnica. Chuva de prata e sky paper são seguros em ambiente fechado e a gente usa
> nos momentos que valem — entrada, valsa, abertura de pista.

*Fonte:* [DDR Eventos](https://ddreventos.com.br/produto/pista-de-danca-de-led-4m-x-4m-locacao/)
(4x4 m, 16 m², +100 convidados, montagem e técnico inclusos);
[Gold Vision](https://goldvisionbrasil.com.br/5-vantagens-de-alugar-um-piso-de-led-para-a-sua-festa-de-15-anos/)
("a valsa precisa de espaço"); documentação técnica de máquinas de fumaça sobre acionamento de
detector; [Festa15Anos](https://www.festa15anos.com/post/encante-seus-convidados-com-efeitos-especias-na-sua-festa-de-15-anos)
e [Adilson Freitas](https://www.adilsonfreitas.com.br/efeitos-especiais-fogos-indoor-chuva-de-prata-sky-paper-e-cascata/)
(efeitos indoor seguros; usar "com critério, só em momentos notáveis").

---

### Pergunta 12, opcional — só se o cliente autorizar responder sobre B2B

**12. Vocês atendem show e evento de porte, com rider técnico de artista?**

> Sim. Já passaram pelos nossos palcos 116 artistas, entre eles Bruno & Marrone, César Menotti &
> Fabiano, Alexandre Pires, Raimundos, Biquini Cavadão e Só Pra Contrariar. Atendemos produtora,
> casa de show, prefeitura e evento corporativo, e trabalhamos em cima do rider que a produção enviar.

*Fonte da oportunidade:* o rider com 116 artistas existe no site, mas **preso dentro de duas imagens
PNG de 3108×3847 e 3289×4671** — invisível para busca, para leitor de tela e para o comprador B2B.
Ver `INVENTARIO.md`, seção 2. Este é o público que hoje **não é atendido** pelo site.

---

## 5.12 O que fazer com isso

1. **Cada uma das 11 perguntas vira texto visível** numa seção de FAQ da página única, com
   `FAQPage` em JSON-LD espelhando exatamente o texto visível.
2. **As respostas 1, 4, 5 e 7 devem também aparecer nas âncoras de serviço**, não só no FAQ —
   é onde a decisão acontece.
3. **A resposta 2 é a mais valiosa e a menos usada pelos concorrentes.** Merece uma seção própria
   com foto real de antes/depois de luz quente vs. luz colorida no rosto.
4. **A resposta 9 é o CTA.** "Consultar se a data está livre" converte melhor do que "solicitar
   orçamento" porque tem prazo e custo zero para quem pergunta.
5. Nenhuma dessas respostas pode ser publicada sem confirmação do cliente sobre os fatos
   operacionais (técnico fica até o fim? há equipamento reserva? a visita técnica é cortesia?
   qual a política de sinal?). **A pesquisa mostra o que perguntam; só o cliente pode responder.**
