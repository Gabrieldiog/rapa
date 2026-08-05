# Avaliações reais da Rapa Sound — coleta de 05/08/2026

## Resumo

- **Avaliações com texto literal E autor identificado que consegui: 2**
  - 1 avaliação de cliente propriamente dita (Casamentos.com.br, autora "Tatiane", 5/5, 2016)
  - 1 comentário público no YouTube (autor identificado só pelo @ do canal, não é claramente cliente)

- **Onde achei:**
  - `casamentos.com.br` — perfil da empresa com 1 avaliação completa, com texto, nome, data e nota
  - `youtube.com` — 1 comentário público sob um dos vídeos de depoimento

- **Onde NÃO achei:**
  - Google Maps / Perfil da Empresa no Google — a ficha existe, mas **não tem nenhuma nota nem nenhuma avaliação**
  - Facebook — página existe, mas o conteúdo exige login
  - Instagram — perfil existe, mas exige login
  - Reclame Aqui — **empresa não cadastrada, 0 reclamações**
  - Zankyou, iCasei, Noivinhas de Luxo — nenhum perfil encontrado
  - Página Amarela, Zapia, AppLocal, Globuya, seuevento.net.br — sem seção de avaliações ou sem a empresa

- **Notas agregadas que existem:**
  - **Casamentos.com.br: 5,0 de 5, com 1 (uma) avaliação, 100% de recomendação.**
    Fonte: https://www.casamentos.com.br/animacao-festa/rapa-sound--e130613/opinioes
    Atenção: a média "5,0" é composta por uma única avaliação, de 2016. Não é uma amostra.
  - **Google Maps: não existe nota agregada.** A ficha da empresa existe no Google Maps
    (Place ID `ChIJ9YwvJFVFpJQR_QqDMoEBZaA`, CID `0x94a44555242f8cf5:0xa065018132830afd`,
    categoria "Empresa de organização de eventos", Av. Maria Silva Garcia, 575 — Granja Marileusa),
    mas o registro devolvido pelo Google **não traz campo de nota nem contagem de avaliações**.
    Verifiquei o método comparando com duas empresas de Uberlândia que têm avaliação
    (Palácio de Cristal e Center Convention): nas duas o campo de nota vem preenchido com `4.8`;
    no registro da Rapa Sound esse mesmo campo vem `null`. Conclusão: a ficha **não tem avaliações no Google**.

---

## Avaliações encontradas

### Avaliação 1 — Casamentos.com.br

- **Texto literal:**
  > "Muito satisfeita com a prestação de serviço dessa empresa! Muito competentes e comprometimento nota 1000! O Dj que tocou foi o Daniel Souvile e eu o contrataria de olhos fechados novamente! Vale muito a pena!"
- **Quem escreveu:** Tatiane
- **Data:** 05/07/2016
- **Nota:** 5 de 5
  - Notas por categoria informadas na página: Qualidade do serviço 5,0 · Tempo de resposta 5,0 · Profissionalismo 5,0 · Qualidade/preço 5,0 · Flexibilidade 5,0
- **URL exata:** https://www.casamentos.com.br/animacao-festa/rapa-sound--e130613/opinioes
  (também aparece em https://www.casamentos.com.br/animacao-festa/rapa-sound--e130613)
- **Data em que consultei:** 05/08/2026
- **Observação de método:** o acesso direto ao casamentos.com.br devolveu HTTP 403 (bloqueio anti-bot).
  Consegui ler o conteúdo através do proxy de texto `r.jina.ai`. Li a página do perfil e a página
  `/opinioes` separadamente e o texto, o nome, a data e a nota bateram nas duas.

---

### Avaliação 2 — Comentário no YouTube

- **Texto literal:**
  > "Sim é uma grande Família e uma equipe de respeito!!!! 👊😊👍"
- **Quem escreveu:** `@vandersalles2996` (identificação é o @ do canal do YouTube; não há nome civil público)
- **Data:** o YouTube exibe apenas "há 1 ano" (data relativa, em 05/08/2026). O vídeo comentado foi publicado em 04/09/2024.
- **Nota:** não se aplica — YouTube não tem nota
- **URL exata:** https://www.youtube.com/watch?v=Duu55y9-doc
- **Data em que consultei:** 05/08/2026
- **Ressalva honesta:** este é um comentário de apoio sob um vídeo de depoimento, não uma avaliação
  de serviço. O autor não se identifica como cliente e não descreve nenhuma contratação. Não dá para
  afirmar que seja cliente. Registro aqui porque é o único texto público atribuído a uma pessoa que
  encontrei fora do Casamentos.com.br.

---

## Depoimentos em vídeo — pessoas identificadas, mas SEM texto transcrito

Os 4 IDs de vídeo indicados são de fato depoimentos de clientes nomeadas, publicados no canal da
própria empresa. **O depoimento é falado, não escrito.** Tentei baixar as legendas automáticas
(existem faixas ASR declaradas nos 4 vídeos) e o endpoint `timedtext` do YouTube devolveu resposta
vazia em todas as tentativas (com e sem `fmt=json3`/`fmt=srv3`). **Portanto não tenho o texto do que
essas pessoas dizem e não vou inventar.** Registro só o que é verificável:

| Vídeo | Título literal | Publicado em | Views (05/08/2026) | Comentários |
|---|---|---|---|---|
| https://www.youtube.com/watch?v=Duu55y9-doc | "Depoimento Diana, mãe debutante Lana Ribeiro - 15 anos com a #RapaSound" | 04/09/2024 | 37 | 1 (o da Avaliação 2 acima) |
| https://www.youtube.com/watch?v=-4uQIpkfB3E | "Depoimento Debutante Vitória Francis - 15 anos com a #RapaSound" | 31/08/2022 | 79 | 0 |
| https://www.youtube.com/watch?v=Mg31EitG_YY | "Depoimento Debutante Maria Antônia - 15 e 16 anos com a #RapaSound" | 04/09/2022 | 75 | 0 |
| https://www.youtube.com/watch?v=5hAsVfeDe_4 | "Depoimento Debutante Ana Laura (Ani) - 15 anos com a #RapaSound" | 02/09/2022 | 81 | 0 |

Verifiquei a contagem de comentários pela API interna do YouTube (`youtubei/v1/next`): só o vídeo
`Duu55y9-doc` tem o contador em "1"; os outros três não têm nenhum comentário.

Nota: a seção "depoimentos:" do site `https://rapasound.com.br/` é **apenas um carrossel desses vídeos
do YouTube**. Não há nenhum depoimento em texto no site. Confirmado lendo o HTML da home (os widgets
de vídeo do Elementor apontam para esses mesmos IDs).

---

## Onde procurei e não achei

| Plataforma | URL | O que aconteceu |
|---|---|---|
| Google Maps (ficha da empresa) | busca `tbm=map` por "Rapa Sound Uberlandia"; ficha `ChIJ9YwvJFVFpJQR_QqDMoEBZaA` | Ficha existe e está completa (endereço, telefone (34) 99199-0994, site, horário, descrição). **Campo de nota vem `null` — nenhuma avaliação.** Método validado contra 2 empresas de controle que têm nota. |
| Google Maps (endpoint de avaliações) | `google.com/maps/rpc/listugcposts` com o feature ID da empresa | HTTP 403 — Google bloqueia a chamada sem sessão. Não consegui listar avaliações por essa via. |
| Google Search (SERP / painel) | `google.com/search?q="Rapa Sound" Uberlândia` | Google redireciona para tela de consentimento e não entrega conteúdo, tanto por WebFetch quanto por curl com cookie de consentimento. Proxy `r.jina.ai` sobre o Google: HTTP 403. |
| Facebook — página oficial | https://www.facebook.com/rapasoundoficial | Página existe ("Há 25 anos tornando a sua festa inesquecível!", ~1.519 curtidas segundo snippet de busca). **Conteúdo bloqueado por muro de login.** Não consegui ver recomendações. |
| Facebook — aba de avaliações | https://www.facebook.com/rapasoundoficial/reviews | HTTP 404 / tela de login. |
| Facebook — mbasic | https://mbasic.facebook.com/rapasoundoficial | **Exige login.** |
| Facebook — vídeo de depoimento | https://www.facebook.com/rapasoundoficial/videos/depoimento-debutante-maria-antônia-15-e-16-anos-com-a-rapasound/1356844741509305/ | A estrutura de comentários aparece, mas **nenhum comentário é servido sem login**. |
| Facebook `/RapaSound` (sem "oficial") | https://www.facebook.com/RapaSound | É outra empresa — "Rapasound | Halifax". Não é a empresa de Uberlândia. |
| Instagram | https://www.instagram.com/rapasound/ | **Exige login.** Só carrega a tela de autenticação. Não consegui ler nenhum comentário. |
| Reclame Aqui | https://www.reclameaqui.com.br/busca/?q=rapa+sound | Busca retorna "Empresas 0 / Reclamações 0". **A empresa não tem cadastro no Reclame Aqui.** (Acesso direto dava 403; li via proxy de texto.) |
| Zankyou | https://www.zankyou.com.br/busca?q=Rapa%20Sound | HTTP 422. Nenhuma menção à Rapa Sound em nenhuma busca no Zankyou. Sem perfil encontrado. |
| iCasei | buscas web | Nenhum perfil da Rapa Sound encontrado. |
| Noivinhas de Luxo | buscas web | Nenhum perfil da Rapa Sound encontrado. |
| Página Amarela | https://paginaamarela.com.br/empresa/rapa-sound/uberlandia/mg/11805047 | Perfil existe, mas **não tem seção de avaliações, nota nem depoimentos**. |
| Zapia | https://zapia.digital/uberlandia-mg/nossa-senhora-aparecida/projetos-e-instalacoes-de-som/rapa-sound/5971025 | Perfil existe, mas **sem avaliações, notas ou reviews**. |
| AppLocal | https://applocal.com.br/empresa/rapa-sound/uberlandia/mg/11806756 | HTTP 403 / bloqueio Cloudflare, direto e via proxy. Não consegui ler. |
| Globuya | https://www.globuya.com/BR/Uberlândia/154984837918655/Rapa-Sound | HTTP 403 / verificação de segurança Cloudflare. Não consegui ler. |
| Bing Maps | https://www.bing.com/maps?q=Rapa+Sound+Uberlandia+MG | Ficha com endereço e horário, **sem nota e sem avaliações**. |
| seuevento.net.br (Uberlândia) | https://www.seuevento.net.br/uberlandia/festaemgeral/dj-banda-sonorizacao-e-iluminacao | **A Rapa Sound não está na lista** de fornecedores dessa categoria. |
| Trustpilot, Kekanto, Hotfrog, GuiaFácil, Encontra Uberlândia, Apontador, Telelistas, GuiaMais, Solutudo, Sympla | buscas web direcionadas | Nenhum perfil da Rapa Sound com avaliações encontrado. |
| Site da própria empresa | https://rapasound.com.br/ e https://rapasound.com.br/depoimentos/ | A URL `/depoimentos/` dá **404**. A seção "depoimentos:" da home é só um carrossel de vídeos do YouTube — **zero depoimentos em texto**. |

---

## Alerta

**Não encontrei nenhuma reclamação, crítica ou conteúdo negativo sobre a Rapa Sound em lugar nenhum.**
O Reclame Aqui não tem sequer cadastro da empresa (0 empresas, 0 reclamações na busca).

O que **é** um ponto de atenção — e é um problema de reputação, não uma crítica de cliente:

1. **A ficha do Google Maps da Rapa Sound não tem nenhuma avaliação.** Para uma empresa com quase
   30 anos de mercado, isso é bastante incomum e é hoje o principal buraco de prova social. Empresas
   comparáveis de Uberlândia (Palácio de Cristal, Center Convention) têm 4,8. É a lacuna mais
   acionável do conjunto.

2. **A única avaliação escrita real que existe publicamente é de 05/07/2016** — tem quase 10 anos.
   Ela é ótima (5/5), mas é uma só, e é antiga.

3. **Os vídeos de depoimento têm audiência mínima** (37 a 81 visualizações) e praticamente nenhum
   comentário. Eles existem e são de pessoas nomeadas, mas não estão gerando prova social.

4. **Facebook e Instagram estão atrás de muro de login.** Pode haver recomendações e comentários reais
   lá que eu não consegui ver. **Não estou afirmando que não existem — estou afirmando que não
   consegui acessá-los.** Se alguém com login abrir a aba de avaliações do
   `facebook.com/rapasoundoficial`, pode haver material.

---

**Total de avaliações com texto literal e autor identificado que consegui: 2 — sendo 1 avaliação de cliente propriamente dita (Tatiane, 5/5, Casamentos.com.br, 05/07/2016) e 1 comentário de YouTube atribuído apenas a um @ de canal (`@vandersalles2996`), que não se identifica como cliente.**
