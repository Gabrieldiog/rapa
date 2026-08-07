# Mapa de redirecionamentos 301

A arquitetura decidida é **página única**. As 13 URLs de serviço saem do ar e cada uma
redireciona para a âncora correspondente. Elas estão indexadas desde setembro/2024 — sem
`301`, perde-se o pouco de autoridade que existe.

⚠️ **Provisório.** Os nomes das âncoras se confirmam quando a estrutura de seções fechar, na
Fase 3/4. O mapeamento origem→destino, esse já está decidido.

---

## ❗ Duas armadilhas técnicas

### 1. `output: 'export'` não executa `redirects()` do Next.js

A chave `redirects` do `next.config.js` **exige um servidor Node**. Com export estático ela é
silenciosamente ignorada — não dá erro, simplesmente não redireciona.

Os 301 têm que ser configurados **na camada de hospedagem**:

| Host | Onde |
|---|---|
| Apache (host WordPress atual) | `.htaccess` |
| Nginx | bloco `server` |
| Vercel | `vercel.json` |
| Netlify | `_redirects` |
| Cloudflare Pages | `_redirects` |

Definir isso antes do deploy. É o tipo de coisa que se descobre depois que o tráfego já caiu.

### 2. O Google ignora o fragmento em um 301

Redirecionar `/painel-de-led/` para `/#painel-de-led` **é lido pelo Google como redirect para
`/`**. O fragmento serve para o visitante humano, que cai no lugar certo da página; para o
índice, as 13 URLs consolidam todas na home.

Consequência prática: se a home nova **não cobrir de verdade** o assunto de cada página
antiga, o Google trata o redirect como irrelevante e pode devolver a URL antiga para
soft-404 — pior que não redirecionar.

**Mitigação, e é obrigatória:** cada serviço precisa existir na página nova como conteúdo
real — nome, descrição e, de preferência, foto. Não basta um item de lista. Era exatamente o
que faltava no site antigo, onde as 13 páginas tinham só um título e um botão.

> O relatório `pesquisa/03-conversao-seo.md` está investigando o padrão correto disso.
> Revisar este arquivo quando ele chegar.

---

## O mapa

### Serviços — âncora individual dentro de `#servicos`

Âncora por serviço, não uma âncora só para todos. O visitante que clicou em "pista de LED" no
Google chega na pista de LED, não no topo de uma lista de treze.

| URL antiga | Destino |
|---|---|
| `/sonorizacaopalco/` | `/#sonorizacao-palco` |
| `/iluminacao-cenica/` | `/#iluminacao-cenica` |
| `/iluminacao-pista/` | `/#iluminacao-pista` |
| `/painel-de-led/` | `/#painel-de-led` |
| `/pista-de-led/` | `/#pista-de-led` |
| `/tubos-de-led/` | `/#tubos-de-led` |
| `/tunel-de-led/` | `/#tunel-de-led` |
| `/efeitos-especiais/` | `/#efeitos-especiais` |
| `/projetos-3d-personalizados/` | `/#projetos-3d` |
| `/area-instagramavel/` | `/#area-instagramavel` |
| `/criacao-de-conteudo/` | `/#criacao-de-conteudo` |

### Tipos de evento — seções próprias, não itens de serviço

`Emoções 15 Anos` e `Emoções Casamento` não são serviços técnicos: são os dois públicos
principais. Viram seção com peso próprio, acima dos serviços.

| URL antiga | Destino |
|---|---|
| `/emocoes-15-anos/` | `/#quinze-anos` |
| `/emocoes-casamento/` | `/#casamento` |

### Limpeza

| URL antiga | Ação |
|---|---|
| `/sample-page/` | `410 Gone` — página padrão do WordPress, nunca teve conteúdo. `410` remove do índice mais rápido que `301`. |
| `/feed/`, `/comments/feed/` | avaliar no deploy — some junto com o WordPress |
| `/wp-sitemap*.xml` | substituir por `sitemap.xml` novo |

---

## Rascunho de `.htaccess`

Vale se o site novo ficar no mesmo host Apache. Vai depois do bloco do WordPress, ou no lugar
dele quando o WordPress sair.

```apache
Redirect 410 /sample-page/

RewriteEngine On
RewriteRule ^sonorizacaopalco/?$            /#sonorizacao-palco    [R=301,L,NE]
RewriteRule ^iluminacao-cenica/?$           /#iluminacao-cenica    [R=301,L,NE]
RewriteRule ^iluminacao-pista/?$            /#iluminacao-pista     [R=301,L,NE]
RewriteRule ^painel-de-led/?$               /#painel-de-led        [R=301,L,NE]
RewriteRule ^pista-de-led/?$                /#pista-de-led         [R=301,L,NE]
RewriteRule ^tubos-de-led/?$                /#tubos-de-led         [R=301,L,NE]
RewriteRule ^tunel-de-led/?$                /#tunel-de-led         [R=301,L,NE]
RewriteRule ^efeitos-especiais/?$           /#efeitos-especiais    [R=301,L,NE]
RewriteRule ^projetos-3d-personalizados/?$  /#projetos-3d          [R=301,L,NE]
RewriteRule ^area-instagramavel/?$          /#area-instagramavel   [R=301,L,NE]
RewriteRule ^criacao-de-conteudo/?$         /#criacao-de-conteudo  [R=301,L,NE]
RewriteRule ^emocoes-15-anos/?$             /#quinze-anos          [R=301,L,NE]
RewriteRule ^emocoes-casamento/?$           /#casamento            [R=301,L,NE]
```

A flag `NE` (`noescape`) é necessária — sem ela o Apache escapa o `#` para `%23` e o
redirecionamento vai para uma URL literal com `%23`, que não existe.

---

## Checklist de virada

- [ ] Redirects configurados **na hospedagem**, não no `next.config.js`
- [ ] Cada serviço existe na página nova como conteúdo real, com âncora `id` correspondente
- [ ] `sitemap.xml` novo enviado no Google Search Console
- [ ] As 13 URLs antigas **fora** do sitemap novo
- [ ] Testar cada uma das 13 com `curl -I` e conferir `301` + `Location` correto
- [ ] Search Console → Inspeção de URL em 3 amostras depois do deploy
- [ ] Google Business Profile apontando para o endereço confirmado (`PENDENCIAS.md` P1)
- [ ] Monitorar impressões por 30 dias — queda que não recupera significa 301 mal resolvido

---

## ✅ FEITO — `vercel.json` na raiz

Os 301 saíram do rascunho e entraram no repositório. Duas coisas que valem registrar:

**1. `vercel.json` NÃO é o `redirects()` do Next.** O aviso lá em cima continua valendo — a
chave `redirects` do `next.config.mjs` exige servidor Node e é ignorada em silêncio com
`output: 'export'`. O `vercel.json` é outra camada: ele roda na borda da Vercel, **antes**
de qualquer arquivo estático ser servido. É exatamente a "camada de hospedagem" que este
arquivo pedia.

**2. As origens vão SEM barra final.** O projeto usa `trailingSlash: true`, e a Vercel
normaliza a barra antes de casar a rota. Escrever `/painel-de-led/` na origem faria a regra
não casar com `/painel-de-led` e vice-versa — some uma das duas formas. Sem a barra, as duas
entram.

Junto foram os cabeçalhos: cache de um ano para fontes e imagens (têm hash no nome, então
nunca ficam velhas), e quatro de segurança — `nosniff`, `Referrer-Policy`,
`X-Frame-Options` e uma `Permissions-Policy` que desliga câmera, microfone, geolocalização
e o FLoC.

Continua pendente: o `410 Gone` de `/sample-page/`. A Vercel não emite 410 por
`vercel.json` — só 301/302/307/308. Está redirecionando para `/`, o que resolve para o
visitante mas remove do índice mais devagar. Se importar, dá para servir um `410` por
função de borda; hoje não vale a complexidade.
