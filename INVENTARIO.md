# INVENTÁRIO — rapasound.com.br (Fase 0)

Extraído em 2026-08-04 de `https://rapasound.com.br/` e de todas as 13 subpáginas do sitemap.
Fonte: HTML renderizado no servidor (WordPress 6.6.5 + Elementor 4.1.3, tema Hello Elementor).
Não houve bloqueio de crawler — bastou `curl` com User-Agent de browser.

**Regra desta fase:** tudo abaixo é literal do site. Nada foi reescrito, corrigido ou inventado.

---

## 0. Achado que muda o plano

O briefing assume uma landing page única com uma lista de artistas. O que existe é:

- **14 páginas**, não uma. A home + 13 subpáginas — e as 13 são exatamente os serviços.
- **A seção de serviços da home é um grid de 13 imagens PNG achatadas.** Título, ícone e descrição de cada serviço são pixels. Não existe um único caractere de texto real ali. Isso é, sozinho, a maior perda de SEO do site.
- **Os ~116 artistas também são imagem** — duas PNGs de 3108×3847 e 3289×4671. A prova social mais forte da empresa é invisível para o Google, para leitor de tela e para busca na página.
- **Todas as 34 imagens da home têm `alt=""`.** Sem exceção.
- Os "depoimentos" existem e são bons — **4 vídeos do YouTube com nome e evento reais** —, mas a seção não tem uma linha de texto.

O trabalho não é só visual. Metade do conteúdo existe e está trancado dentro de imagem.

---

## 1. Todo o texto da home, na ordem em que aparece

Literal. `[IMG]` e `[VÍDEO]` marcam onde há mídia sem texto.

```
[IMG logo Rapa Sound]

A melhor escolha para fazer parte dos momentos mais marcantes de suas vidas
CASAMENTOS / FESTAS DE 15 ANOS / EVENTOS CORPORATIVOS
ENTRAR EM CONTATO!

[IMG ×8 — carrossel de fotos de evento]

Sobre nós:
Bem-vindo à RAPA SOUND, sua parceira ideal para proporcionar momentos inesquecíveis em
eventos sociais. Nossa história é marcada por experiência, profissionalismo, pioneirismo e
dedicação, com destaque na área de sonorização e iluminação, oferecendo serviços de alta
qualidade e personalização.

Com quase 30 anos de atuação, a RAPA SOUND tem expertise em criar eventos únicos e
memoráveis. Atendemos noivas, noivos, debutantes e empresas, oferecendo soluções completas
para casamentos, festas de 15 anos e eventos corporativos e empresariais.

ENTRAR EM CONTATO!

[IMG Foto-dobra-3]

Oferecemos serviços personalizados que atendem às necessidades específicas de cada cliente,
sempre com a missão de proporcionar experiências únicas e emocionantes.

[IMG ×13 — os cards de serviço, todos achatados em PNG]

Eventos que já foram realizados pela RAPA SOUND:
[VÍDEO ×6]
ENTRAR EM CONTATO!

depoimentos:
[VÍDEO ×4]

Conheça a Equipe que Faz Tudo Acontecer!
Na RAPA SOUND, não é só a tecnologia e equipamentos que se destacam. O verdadeiro diferencial
está na nossa equipe dedicada e apaixonada, que com excelência transforma cada evento em algo
extraordinário. É graças a esse time que cada projeto se torna único! Com quase 30 anos de
atuação, a RAPA SOUND tem expertise em criar eventos únicos e memoráveis. Atendemos noivas,
noivos, debutantes e empresas, oferecendo soluções completas para casamentos, festas de 15
anos e eventos corporativos e empresariais.

[IMG ×6 — carrossel da equipe]
ENTRAR EM CONTATO!

RIDER TÉCNICO PARA ARTISTAS:
Artistas renomados e empresas de prestígio tiveram seus eventos transformados pela RAPA SOUND.
Com nossa expertise, ícones da música brasileira confiam em nossos serviços para garantir
apresentações impecáveis e inesquecíveis. A RAPA SOUND é sinônimo de inovação e qualidade,
criando experiências memoráveis em cada evento.

CONFIRA ABAIXO OS ARTISTAS QUE JÁ DERAM UM SHOW EM NOSSOS PALCOS:
[IMG ×2 — as duas listas de artistas]

Contato:
Fale com a gente para solicitar o seu orçamento e discutirmos sobre o seu projeto.
ATENDIMENTO COM HORA MARCADA!
Agende seu horário abaixo:
  [formulário: Nome Completo · Melhor Email · Telefone · Mensagem]
  Clique aqui para enviar!

CONTATOS:
+55 34 99199-0994
(34) 3231-0632
vendas@rapasound.com.br

ENDEREÇO:
Av. Maria Silva Garcia, 575 Sala 603
Bairro Granja Marileusa
CEP 38406-634
Uberlândia - MG

Instagram · Facebook · Youtube
ENTRAR EM CONTATO!
Copyright © RAPA SOUND - Todos os direitos reservados.
[IMG "Desenvolvido por: Oliveira"]
```

**Observações sobre o texto**

- Segundo o próprio site são **"quase 30 anos"** de atuação, nas duas vezes em que o número aparece. O briefing diz "25+". *Use "quase 30" ou confirme o ano de fundação com o cliente — não misture os dois.*
- O parágrafo "Com quase 30 anos de atuação…" está **duplicado literalmente** em "Sobre nós" e em "Conheça a Equipe". Copy-paste, não intenção.
- Não há nenhum número de eventos realizados, nenhuma quantidade de equipamentos, nenhuma métrica. **O único número real disponível é o tempo de mercado.**
- A copy atual já usa quase toda a lista de termos proibidos do briefing: "parceira ideal", "momentos inesquecíveis", "soluções completas", "experiências únicas", "excelência". Reescrever é obrigatório, não opcional.
- `<title>` da home: `Rapa Sound – Site Oficial`. Não há `<meta name="description">` em nenhuma página. Não há Open Graph. Não há schema.

---

## 2. Artistas — a lista completa (116 nomes)

Presa dentro de duas imagens. Transcrita daqui em texto pela primeira vez.
Os nomes vêm em 6 categorias, que o site define mas quase não exibe (os títulos das categorias
são texto branco sobre fundo branco em parte da imagem — praticamente ilegíveis hoje).

### Sertanejo (27)
BRUNA VIOLA · BRUNO · BRUNO & MARRONE · CARVALHO & MARIANO · CÉSAR MENOTTI & FABIANO ·
CLEBER & CAUAN · CLEITON & ROMÁRIO · DI PAULO & PAULINO · DIEGO & VICTOR HUGO ·
EDER & EMERSOM · EMÍLIO & EDUARDO · ERICK LINS · FELIPE ARAÚJO · FRED & FABRÍCIO ·
GUI D'CASTRO & GABRIEL · GUILHERME & SANTIAGO · HENRIQUE & DIEGO · JOÃO BOSCO & VINÍCIUS ·
KLÉO DIBAH · LÉO CHAVES · MATHEUS & KAUAN · NAESSA · RENATO TEIXEIRA · SÉRGIO REIS ·
SIDNEY DO CERRADO · THAEME & THIAGO · THIAGO BRAVA

### Pop & Rock (17)
AFONSO NIGRO · BANDA BLITZ · BANDA JACK HABBIT · BANDA LIGA JOE · BANDA VENOSA ·
BIQUINI CAVADÃO · DINO FONSECA · DIVAS · DOUGLAS ALESSI · MARIANA RIOS · PAULO RICARDO ·
LATINO · RAIMUNDOS · TIAGO ABRAVANEL · VENOSA · WILSON SIDERAL · ZEEBA

### Samba, Pagode e Axé (14)
ALEXANDRE PEIXE · ALEXANDRE PIRES · BANDA CAMOMILÁ · BANDA EVA · D' CORPO INTEIRO ·
GRUPO BEAT SAMBA · INIMIGOS DA HP · MANÉ GALINHA · OBA OBA SAMBA HOUSE · PAQUÁ ·
PROJETO AO CUBO · SEMPRE BOM · SÓ PRA CONTRARIAR · TUCA FERNANDES

### DJs e MCs (32)
DJ ANDRÉ WINK · DJ CAMILA PEIXOTO · DJ DANIEL SOUVILE · DJ ELIESER · DJ FRANCISCO ·
DJ HENRIQUE SECHI · DJ JIMMY · DJ JUNIOR RIBEIRO · DJ LEONARDO RUAS · DJ LIU · DJ LOZANELLO ·
DJ LUCAS BORCHARDT · DJ MARCELO AUGUSTO · DJ RENATO CARNEIRO · DJ DUDU LINHARES ·
DJ RONALDO GASPARIAN · DJ SAMHARA · DJ SHARK · DJ THASCYA · DJ THOMAS B · DJ TULIO MASS ·
DJ WESLEY GONZAGA · DJ WILLIAN RIBEIRO · HEARTBREAKERS · JERRY SMITH · JETLAG ·
MAKE U SWEET · MC DON JUAN · MC MATHEUZINHO · MC NALDO BENNY · MEU NOME É VACA · SUITX

### Bandas — estilos variados e atualidades (18)
ANDRÉ LOPES E BANDA · BANDA ABR3 · BANDA EBO · BANDA GATO PRETO · BANDA HOMEM DE LATA ·
BANDA LP3 · BANDA MAFU · BANDA NK2 · BANDA NOVA YORK · BANDA ROMEU & JULIETA · BANDA LEMON ·
BANDA SANTA TEREZA · BANDA SP3 · BANDA GANG LEX · BANDA LEX LUTHOR · HERBERT LEVY ·
LETÍCIA LANDIN E BANDA · THYAGO BRANDÃO E BANDA

### Orquestras e grupos musicais de receptivo (8)
GRUPO MUSICAL BRAVÍSSIMO · GRUPO MUSICAL PIANÍSSIMO · GRUPO MUSICAL SIBÉLIUS ·
GRUPO MUSICAL ALCÂNTARA · ETERNO GRUPO MUSICAL · GRUPO MUSICAL VIENA ·
ORQUESTRA GEORGE FREIRE · GRUPO ARTE FANTÁSTICA

**Nenhum artista tem foto ou logo associado** — só o nome dentro de um retângulo colorido.
As cores (vermelho → laranja → amarelo → verde) são decorativas, em degradê pela ordem
alfabética. Não codificam nada.

> Nomes conferidos na resolução original (3108px e 3289px de largura), não na versão exibida.
> Ainda assim, confirme a grafia com o cliente antes de publicar: são nomes de terceiros e
> alguns podem estar errados na arte original — `EDER & EMERSOM` e `BANDA JACK HABBIT`
> chamam atenção.

---

## 3. Mídia — imagens e vídeos

### 3.1 Vídeos do YouTube (10, todos do canal deles)

**Seção "Eventos que já foram realizados" — 6 vídeos**

| ID | Título | Tipo |
|---|---|---|
| `j74jFf8vrQQ` | RAPA SOUND - PORTFÓLIO 2022 | institucional |
| `Rlp-GE1v9dI` | Maria Clara 15 anos - Abertura de Pista e melhores momentos da festa | 15 anos |
| `d2t6cKFrxxw` | Casamento Maria Augusta e Serge Toppjian - Tiradentes/MG | casamento |
| `CX6FVxpH_T4` | Casamento Paola e Vitor - Palácio de Cristal - Uberlândia/MG | casamento |
| `wWSYRAXXh8Y` | 15 anos Júlia Pacheco - Palácio de Cristal - Uberlândia/MG | 15 anos |
| `4GaYSBuoKKQ` | 15 anos Luma - Clube Pica Pau - Araguari/MG - SHORT FILM | 15 anos |

**Seção "depoimentos" — 4 vídeos**

| ID | Título | Quem fala |
|---|---|---|
| `Duu55y9-doc` | Depoimento Diana, mãe debutante Lana Ribeiro - 15 anos | mãe de debutante |
| `-4uQIpkfB3E` | Depoimento Debutante Vitória Francis - 15 anos | debutante |
| `Mg31EitG_YY` | Depoimento Debutante Maria Antônia - 15 e 16 anos | debutante |
| `5hAsVfeDe_4` | Depoimento Debutante Ana Laura (Ani) - 15 anos | debutante |

Isso resolve o requisito do briefing de "depoimento com nome e tipo de evento" — **já existe,
em vídeo, com nome real**. O que falta é o texto ao lado.

⚠️ **Zero depoimento de casamento e zero de corporativo.** Todos os 4 são de 15 anos.
Se o casamento é público-alvo prioritário, isso é uma lacuna a levar para o cliente.

⚠️ O portfólio em destaque é de **2022**. Vale pedir um mais recente.

### 3.2 Fotos reais de evento

**Carrossel do topo — 8 fotos, `~/uploads/2024/10/AnyConv.com__PAGINA-INICIAL-{1..8}-1.webp`**
1033×690 (paisagem), 60–106 KB cada. São as melhores fotos do acervo.
A nº1 — noiva sendo erguida pelas convidadas, vestido aberto em leque, arcos de luz âmbar ao
fundo — **é material de hero**. Foto real, emoção real, e a luz do fundo é literalmente o
produto que eles vendem. É a foto que o briefing pede acima da dobra.

⚠️ 1033×690 é baixo para hero em tela grande. **Peça os originais ao cliente** — o nome
`AnyConv.com__` indica conversão por ferramenta web, então deve existir um JPG maior.

**Foto de apoio — `~/uploads/2024/09/Foto-dobra-3.webp`** — 1548×1433. Usada na seção "Sobre".

**Equipe — 6 fotos, carrossel**
`1-19.webp` · `2-34.webp` · `3-19.webp` · `7-2.webp` · `8-2.webp` (628×793) e `5.png` (628×794).
⚠️ `5.png` pesa **430 KB** — é PNG onde deveria ser WebP. Sozinha, é 10% do peso da página.

### 3.3 Imagens que são texto achatado (a serem eliminadas)

| Arquivo | O que é |
|---|---|
| `Group-1171275405.png` … `Group-1171275417.png` (12) | os cards de serviço |
| `Gemini_Generated_Image_vo3t48vo3t48vo3t-Editado-1024x867.png` | o 13º card — **imagem gerada por IA**, 747 KB |
| `AnyConv.com__2-2.webp` (3108×3847) | lista de artistas — sertanejo, pop/rock, samba |
| `Group-1171275404-1.png` (3289×4671) | lista de artistas — DJs, bandas, orquestras |

⚠️ O card de **Emoções Casamento** foi substituído em março/2026 por uma imagem **gerada pelo
Gemini**, com o nome do arquivo do gerador ainda intacto na URL pública. É a maior imagem do
site (747 KB) e ocupa o lugar do serviço mais importante. Levar ao cliente.

### 3.4 Identidade visual atual

Laranja saturado (≈ `#FF6600`) sobre cinza-grafite (≈ `#262626`), texto branco.
Ícones de linha vazados dentro de círculo laranja. Tipografia: **Roboto**, servida pelo
Elementor. Não é uma direção ruim — o laranja tem força e não é nenhum dos defaults de IA
listados no briefing. Vale considerar herdar o laranja na Fase 3 em vez de descartá-lo.

---

## 4. Contatos encontrados no HTML

| Item | Valor | Onde |
|---|---|---|
| WhatsApp | `+55 34 99199-0994` → `api.whatsapp.com/send/?phone=5534991990994` | 5 botões, todas as páginas |
| Texto pré-preenchido atual | `Vim pelo site e gostaria de marcar um atendimento` | idêntico nos 5 botões |
| Fixo | `(34) 3231-0632` | rodapé, todas as páginas |
| E-mail | `vendas@rapasound.com.br` | rodapé, todas as páginas |
| Instagram | `instagram.com/rapasound` | rodapé |
| Facebook | `facebook.com/rapasoundoficial` | rodapé |
| YouTube | `youtube.com/@RapaSound` | rodapé |

**Não existe no site:**
- `atendimento@rapasound.com.br` — o briefing cita, o site não tem. Confirmar se ainda vale.
- **CNPJ** — em nenhuma página. Necessário para `LocalBusiness` e para a política LGPD.
- Horário de atendimento, mapa, área de cobertura.

**Segundo número de WhatsApp — resolvido:** `5534996528844` aparece uma vez, no link da
assinatura "Desenvolvido por: Oliveira" no rodapé. **É o número da agência que fez o site, não
do cliente.** Não migrar. Já o `?text=Olá, gostaria de solicitar um orçamento!` desse link está
com acentuação crua na URL — decidir com o cliente se a assinatura permanece.

### ⚠️ Os dois endereços — o briefing estava certo, e é pior do que parecia

Não é "aparecem em lugares diferentes". Estão **divididos entre as páginas, sem critério**:

| Av. Maria Silva Garcia, 575 — Sala 603 — Granja Marileusa — 38406-634 | Rua Antônio Crescêncio, 310 — Bom Jesus — 38400-636 |
|---|---|
| home | area-instagramavel |
| sonorizacaopalco | criacao-de-conteudo |
| emocoes-casamento | efeitos-especiais |
| emocoes-15-anos | iluminacao-pista |
| iluminacao-cenica | painel-de-led |
| tubos-de-led | pista-de-led |
| | projetos-3d-personalizados |
| | tunel-de-led |

7 páginas dizem um, 6 dizem o outro. **Bloqueante para publicar.** Pergunta ao cliente: qual é
o endereço fiscal/comercial válido, e o outro é galpão, showroom, ou já foi desativado?

---

## 5. Serviços — a lista real, com a descrição de cada um

13 serviços. Cada um tem página própria hoje. A descrição abaixo é a que o site usa (idêntica
no card e no H2 da página).

| # | Serviço | Descrição literal | URL atual |
|---|---|---|---|
| 1 | Emoções 15 Anos | Um momento mágico que celebra o início de uma nova fase, repleto de brilho e encanto | `/emocoes-15-anos/` |
| 2 | Emoções Casamento | Cenários perfeitos para histórias de amor inesquecíveis, no dia mais especial da sua vida | `/emocoes-casamento/` |
| 3 | Sonorização e Palco | Estruturas que elevam qualquer atração, proporcionando som impecável e palco digno de grandes shows | `/sonorizacaopalco/` |
| 4 | Iluminação Pista | Luzes que realçam cada momento e transformam seu evento em um espetáculo visual | `/iluminacao-pista/` |
| 5 | Iluminação Cênica | Desenvolvemos uma atmosfera de luz ideal para qualquer evento | `/iluminacao-cenica/` |
| 6 | Painel de LED | Utilizamos tecnologias avançadas para um visual impactante | `/painel-de-led/` |
| 7 | Pista de LED | Onde o brilho e a grandiosidade se encontram, criando uma pista de dança imponente | `/pista-de-led/` |
| 8 | Área Instagramável | Um espaço pensado para brilhar nas suas fotos e eternizar o momento perfeito | `/area-instagramavel/` |
| 9 | Criação de Conteúdo | Criamos projetos personalizados que contam a sua história | `/criacao-de-conteudo/` |
| 10 | Efeitos Especiais | Detalhes que acrescentam um toque especial ao seu evento | `/efeitos-especiais/` |
| 11 | Túnel de LED | Uma experiência envolvente que leva você para uma nova dimensão | `/tunel-de-led/` |
| 12 | Projetos 3D Personalizados | Criação de ambientes únicos e exclusivos | `/projetos-3d-personalizados/` |
| 13 | Tubos de LED | Efeitos luminosos modernos e atraentes que criam ambientes dinâmicos e inesquecíveis | `/tubos-de-led/` |

**O briefing subestimou o escopo.** Ele fala em "som, luz e efeitos especiais" — três itens.
São treze, e a maior parte é **cenografia e LED**, não sonorização. Isso muda a seção 2 da
página proposta e provavelmente muda a direção de arte: a empresa vende ambiente visual tanto
quanto som.

⚠️ **Erro no site atual:** `/painel-de-led/` tem `<title>` "PAINEL DE LED" mas o H1 e a
descrição dentro da página são os de **Sonorização e Palco**, copiados por engano. O card na
home mostra a descrição certa ("Utilizamos tecnologias avançadas…"), a página mostra a errada.

⚠️ Todas as 13 páginas têm **exatamente o mesmo conteúdo**: um título, uma linha, um botão de
WhatsApp e o rodapé. Nenhuma foto, nenhum detalhe técnico, nenhum preço, nenhuma FAQ. São
páginas vazias — daí a recomendação do briefing de virarem âncoras numa página só ser
provavelmente certa, **desde que cada âncora ganhe conteúdo real** (foto do serviço + o que
está incluso). Como âncora vazia, não melhora nada.

⚠️ `/sample-page/` (página padrão do WordPress) está no sitemap e indexável.

---

## 6. Números reais disponíveis

Existe **um** só:

- **"quase 30 anos de atuação"** — citado duas vezes, texto idêntico.

Não existe no site: nº de eventos realizados, nº de casamentos, tamanho da equipe, quantidade
de equipamento, cidades atendidas, ano de fundação.

Deriváveis com honestidade, sem inventar nada:
- **116 artistas atendidos** — contagem da lista deles.
- **13 serviços.**
- Cidades comprovadas pelos títulos dos vídeos: **Uberlândia, Araguari e Tiradentes (MG)**.
- Locais comprovados: **Palácio de Cristal** (2 eventos), **Clube Pica Pau** (Araguari).

Qualquer outro número precisa vir do cliente.

---

## 7. Diagnóstico de performance — linha de base

Medido por download real de todos os recursos referenciados na home.

| Categoria | Peso | Requisições |
|---|---|---|
| Imagens | 2 368 KB | 33 |
| JavaScript | 806 KB | 16 |
| CSS | 687 KB | 26 |
| Google Tag (gtag.js) | 527 KB | 1 |
| HTML | 125 KB | 1 |
| **Total** | **≈ 4,41 MB** | **77** |

**Não inclui os 10 embeds do YouTube.** Eles têm lazy-load do WP Rocket, mas ao entrar em
viewport cada um puxa o player. O peso real de uma sessão que rola a página inteira é
muito maior.

**Os 6 maiores recursos**

| Peso | Recurso |
|---|---|
| 747 KB | `Gemini_Generated_Image_…png` — a imagem de IA do card de casamento |
| 527 KB | `googletagmanager.com/gtag/js` |
| 430 KB | `uploads/2024/10/5.png` — foto da equipe salva como PNG |
| 321 KB | `elementor/css/custom-pro-frontend.min.css` |
| 168 KB | `Group-1171275404-1-721x1024.png` — lista de artistas |
| 157 KB | `pixelyoursite/dist/scripts/public.js` |

**Outros achados**

- Fonte **Roboto** via CSS do Elementor. **Sem `preload`.** (`font-display: swap` está ativo.)
- **26 arquivos CSS separados.** Elementor + Elementor Pro + plugins, sem concatenação.
- Rastreamento: Google Tag (AW-17926727806), GTM (GTM-P3J5DF42), Meta Pixel (1037241428673660)
  via PixelYourSite. **Nenhum cookie banner. Nenhuma política de privacidade.** Meta Pixel
  disparando sem consentimento é exposição direta de LGPD.
- `jquery` + `jquery-migrate` carregados. `swiper.min.js` 140 KB para os dois carrosséis.

### ❗ O que não consegui medir

**LCP, INP, CLS e os screenshots mobile/desktop exigem um navegador de verdade.** Não há
Playwright MCP nem Chrome DevTools MCP conectados nesta sessão, e o Lighthouse não está
instalado localmente. O peso e as requisições acima são medição real; os Core Web Vitals, não.

Para fechar essa parte da Fase 0, escolha um:
1. Conectar o **Playwright MCP** ou o **Chrome DevTools MCP** (o briefing já recomenda na
   Fase 2 — é o item de maior impacto, e serve para o resto do projeto);
2. Rodar `npx lighthouse https://rapasound.com.br/ --preset=perf --form-factor=mobile
   --output=json --output-path=baseline.json` e me passar o arquivo;
3. Colar o link do PageSpeed Insights.

Sem isso não há como provar a melhoria com número no fim — que é exatamente o que o briefing
pede na Fase 5.

---

## 8. Outras URLs do domínio

Do `wp-sitemap-posts-page-1.xml`. `robots.txt` só bloqueia `/wp-admin/`.

| URL | Última modificação | Destino sugerido |
|---|---|---|
| `/` | 2026-04-14 | vira a nova landing |
| `/emocoes-casamento/` | 2026-04-13 | âncora `#casamento` |
| `/emocoes-15-anos/` | 2026-04-14 | âncora `#quinze-anos` |
| `/sonorizacaopalco/` | 2026-04-13 | âncora `#servicos` |
| `/iluminacao-cenica/` | 2026-04-13 | âncora `#servicos` |
| `/tubos-de-led/` | 2026-04-13 | âncora `#servicos` |
| `/iluminacao-pista/` | 2026-02-22 | âncora `#servicos` |
| `/painel-de-led/` | 2026-02-22 | âncora `#servicos` |
| `/pista-de-led/` | 2026-02-22 | âncora `#servicos` |
| `/tunel-de-led/` | 2026-02-22 | âncora `#servicos` |
| `/area-instagramavel/` | 2026-02-22 | âncora `#servicos` |
| `/criacao-de-conteudo/` | 2026-02-22 | âncora `#servicos` |
| `/efeitos-especiais/` | 2026-02-22 | âncora `#servicos` |
| `/projetos-3d-personalizados/` | 2026-02-22 | âncora `#servicos` |
| `/sample-page/` | 2024-09-10 | **apagar** — página padrão do WordPress, indexável |

Também no sitemap: `wp-sitemap-posts-post-1.xml`, `-taxonomies-category-1.xml`, `-users-1.xml`.

⚠️ **Se as 13 páginas virarem âncora, é obrigatório mapear `301` de cada URL antiga para a
âncora nova.** Elas estão indexadas há quase dois anos. Sem redirect, perde-se o pouco de SEO
que existe. A alternativa — manter as 13 como páginas reais e enriquecidas — é defensável e
provavelmente melhor para "sonorização Uberlândia", mas contraria a premissa de página única
do briefing. **É uma decisão que precisa ser tomada antes da Fase 3.**

---

## Perguntas para o cliente

Ordenadas por bloqueio.

1. **Qual endereço é o válido?** 7 páginas dizem Granja Marileusa, 6 dizem Bom Jesus. O outro é o quê?
2. **Qual é o CNPJ?** Necessário para schema `LocalBusiness` e para a política de privacidade.
3. **São "quase 30 anos" ou 25+?** Qual o ano de fundação?
4. **Página única ou manter as 13?** Define a arquitetura e o plano de redirects.
5. **Existem os arquivos originais das fotos?** As do site estão em 1033×690 — baixo para hero.
6. **Podemos ter depoimento de casamento e de corporativo?** Os 4 que existem são todos de 15 anos.
7. **A imagem gerada por IA no card de Casamento fica ou sai?** (recomendo sair — há acervo real)
8. **`atendimento@rapasound.com.br` ainda existe?** Não está no site.
9. **A assinatura "Desenvolvido por: Oliveira" permanece?** O WhatsApp dela é da agência.
10. **Há um vídeo de portfólio mais recente que o de 2022?**
11. Horário de atendimento e área de cobertura, para o schema.

---

## Onde estão os arquivos

Tudo baixado em
`/private/tmp/claude-501/-Users-gabrieldiogosilva-site-melhorado/4a5d36c9-eaf5-4b9b-98b6-74a928bf6be1/scratchpad/`

- `home.html` · `paginas/*.html` — HTML bruto das 14 páginas
- `texto.txt` · `subpaginas.txt` — texto extraído
- `img/` — cards de serviço, listas de artistas (original e recortes legíveis), hero, rodapé
- `eq/` — fotos da equipe e de apoio, em resolução original
- `wpsm-pages.xml` · `robots.txt`

---

**Fase 0 concluída, com uma exceção declarada: Core Web Vitals e screenshots (item 7).**
Nada de código antes da sua revisão.
