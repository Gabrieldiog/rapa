import {
  SERVICOS, BLOCOS, DESTAQUE_LED, RIDER, DESTAQUES, TOTAL_ARTISTAS,
  EVENTOS, DEPOIMENTOS, FAQ,
  CONTATO, FOTOS_EVENTO, EQUIPE, zap,
} from '@/lib/conteudo'
import { Reveal } from '@/components/Reveal'
import { CardServico, LinhaServico } from '@/components/CardServico'
import { LuzCursor } from '@/components/LuzCursor'
import { Palco } from '@/components/Palco'
import { MenuLiquido } from '@/components/MenuLiquido'
import { NavDesktop } from '@/components/NavDesktop'
import { LequeEquipe } from '@/components/LequeEquipe'
import { Logo } from '@/components/Logo'
import { PausaLed } from '@/components/PausaLed'
import { Blackout } from '@/components/Blackout'
import { Tubo, Zap, Secao, Eyebrow } from '@/components/ui'

export default function Home() {
  return (
    <>
      <Blackout />
      <a href="#conteudo"
         className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4
                    focus:z-[100] focus:bg-ambar focus:px-4 focus:py-2 focus:text-void">
        Pular para o conteúdo
      </a>

      {/* ══════════════ HERO ══════════════
          O topo era a foto de uma festa sangrada a 45% de opacidade.
          Agora e o campo de particulas do back.md com a marca no meio,
          como pedido. A foto nao foi jogada fora: ela desce e abre a
          secao de 15 anos, que e onde ela prova alguma coisa.

          overflow-clip e nao hidden: `hidden` cria scroll container. */}
      <header id="conteudo" className="relative overflow-clip">
        {/* A vinheta local saiu: ela terminava junto com o <header> e
            deixava uma EMENDA HORIZONTAL visivel no fim do topo, porque
            o fundo continua e ela nao. A vinheta agora e do proprio
            fundo, fixa e sem costura. */}

        {/* pb maior que pt no celular: o menu de secoes e fixo no
            rodape e cobria o CTA. O `justify-center` centraliza o que
            sobra, entao o bloco sobe e o botao fica alcancavel. */}
        <div className="relative mx-auto flex min-h-[92svh] w-full max-w-3xl flex-col
                        items-center justify-center px-5 pt-16
                        pb-[calc(6.5rem+env(safe-area-inset-bottom))]
                        text-center lg:py-24">
          {/* A MARCA. `animar` acende o VU meter de baixo para cima uma
              vez, na entrada — e o que um medidor faz quando pega o
              primeiro pico. Depois descansa. */}
          {/* Cresceu de 52vw/19rem porque o paragrafo saiu e liberou
              altura. A marca e o primeiro argumento do topo agora. */}
          <Logo animar
                className="w-[min(74vw,27rem)] shrink-0 text-branco" />

          <div className="mt-7 lg:mt-9">
            <Eyebrow><b>Uberlândia</b> · quase <i>30</i> anos</Eyebrow>
          </div>

          {/* o H1 NAO pode entrar num <Reveal>: opacity/transform criam
              contexto de empilhamento e o background-clip:text some no
              Chrome. E ele e candidato a LCP. */}
          {/* text-xl/2xl e nao 2xl/3xl: sao 76 caracteres. Frase longa
              pede corpo MENOR, nao maior — a 64px ela ocupava cinco
              linhas e empurrava os dois CTAs para fora da tela, no
              desktop e no celular. Manchete curta cresce, manchete
              comprida encolhe. */}
          <h1 className="max-w-[24ch] text-xl lg:text-2xl">
            A melhor escolha para fazer parte dos momentos mais{' '}
            <span className="led">marcantes</span> de suas vidas
          </h1>

          {/* Os tres servicos, texto de verdade e nao imagem. Aqui moram
              as palavras que a mae de debutante e a noiva digitam na
              busca — o H1 virou a promessa, entao a palavra-chave
              precisa de um lugar proprio.
              O separador e o pixel do tubo, nao um bullet. */}
          <ul className="mt-6 flex flex-wrap lg:mt-8 items-center justify-center gap-x-4 gap-y-2">
            {['Casamentos', 'Festas de 15 anos', 'Eventos corporativos'].map((s, i) => (
              <li key={s} className="flex items-center gap-4">
                {i > 0 && (
                  <span aria-hidden
                        className="block h-1 w-1 shrink-0 rounded-[1px] bg-ambar" />
                )}
                <span className="lab text-branco">{s}</span>
              </li>
            ))}
          </ul>

          {/* O paragrafo "Som, luz e LED. Tecnico nosso do comeco ao
              fim" saiu daqui a pedido. Com ele foi embora a segunda
              palavra varrida — sobra so "marcantes".
              As palavras som/luz/LED continuam no <title>, na meta
              description e na secao de servicos, entao a busca nao
              perde nada. */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:mt-11">
            <Zap texto="Oi! Quero um orçamento de som e luz. Meu evento é:">
              Falar no WhatsApp
            </Zap>
            {/* inline-flex + min-h-11: como <a> inline a area de toque
                media 171x19. A regra da casa e 44px sem excecao, e o
                criterio 2.5.8 da WCAG 2.2 pede 24x24 no minimo — 19px
                de altura reprova nos dois. */}
            <a href="#rider" className="lab inline-flex min-h-11 items-center underline
                                        decoration-rule underline-offset-8
                                        transition-colors hover:text-branco">
              Ver o rider técnico
            </a>
          </div>
        </div>
      </header>

      {/* ══════════════ ESTADO FESTA · 15 ANOS ══════════════ */}
      <Secao id="quinze-anos" className="relative">
        <Tubo cor="var(--color-magenta)" aceso />
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-20">
          <Reveal>
            <Eyebrow cor="var(--color-magenta)"><b>15 anos</b> · o que mais fazemos</Eyebrow>
            <h2 className="text-2xl lg:text-3xl">Festa de 15 anos</h2>
            <p className="mt-6 text-base text-branco-2">
              Entrada, valsa, abertura de pista. Cada momento pede uma luz
              diferente — e é aí que a festa vira lembrança ou vira foto ruim.
            </p>
            <p className="mt-4 text-xs text-branco-2">
              Na pista, cor forte. Nos momentos que vão para a foto, luz quente
              entre 2.700K e 3.200K, que não mancha a pele. São duas luzes
              diferentes, e saber separá-las é metade do nosso trabalho.
            </p>
            <Zap texto="Oi! Quero orçamento para festa de 15 anos." className="mt-9">
              Orçamento de 15 anos
            </Zap>
          </Reveal>
          <Reveal delay={90}>
            {/* a foto que saiu do topo abre aqui, grande e sem veu: e a
                unica prova visual de que a festa aconteceu de verdade.
                fetchPriority alto porque agora ela e a candidata a LCP. */}
            <img src={FOTOS_EVENTO[0].src} width={FOTOS_EVENTO[0].w}
                 height={FOTOS_EVENTO[0].h} fetchPriority="high" decoding="async"
                 alt="Debutante erguida pelas convidadas no meio da pista, com arcos de luz ao fundo"
                 className="mb-2 aspect-16/10 w-full rounded-[var(--radius-card)]
                            object-cover" />
            <div className="grid grid-cols-2 gap-2">
              {FOTOS_EVENTO.slice(1, 5).map((f, i) => (
                <img key={f.src} src={f.src} width={f.w} height={f.h} loading="lazy"
                     decoding="async"
                     alt={`Festa de 15 anos sonorizada e iluminada pela Rapa Sound — foto ${i + 1}`}
                     className="aspect-4/3 w-full object-cover" />
              ))}
            </div>
          </Reveal>
        </div>

      </Secao>

      {/* ══════════════ ESTADO FESTA · CASAMENTO ══════════════
          A regra das duas luzes contada como percurso da noite.
          E o argumento mais forte que temos com a noiva: a segunda
          maior objecao dela e "a luz colorida vai estragar minha foto". */}
      <Secao id="casamento" className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
             style={{ background:
               'radial-gradient(120% 80% at 78% 0%, color-mix(in srgb, var(--color-congo) 62%, transparent) 0%, transparent 68%)' }} />
        <Tubo cor="var(--color-congo)" aceso />

        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-20">
          <Reveal>
            <Eyebrow cor="var(--color-congo)"><b>Casamento</b> · cerimônia, recepção e pista</Eyebrow>
            <h2 className="max-w-[15ch] text-2xl lg:text-3xl">
              A noite inteira pede três luzes diferentes
            </h2>
            <p className="mt-7 max-w-[44ch] text-base text-branco-2">
              É a pergunta que toda noiva faz, e ela está certa em fazer:
              luz colorida reflete na pele e quase não tem conserto na edição.
              A resposta não é abrir mão da cor — é saber onde ela entra.
            </p>

            {/* PENDENTE P12: descreve operacao. Confirmar com o cliente. */}
            <ol className="mt-10 flex flex-col">
              {[
                { h: 'Cerimônia', l: 'luz quente, 3.200K',
                  d: 'A que vai para o álbum. Sem cor na pele, sem sombra dura no rosto.' },
                { h: 'Recepção e jantar', l: 'som ambiente por setor',
                  d: 'Volume que deixa a mesa conversar. A família mais velha não precisa gritar.' },
                { h: 'Pista', l: 'aí sim, cor',
                  d: 'Aqui a cor pode tudo. É onde o LED, o tubo e a pista aparecem.' },
              ].map((m, i) => (
                <li key={m.h}
                    className="group grid grid-cols-[auto_1fr] gap-x-5 border-t border-rule py-6
                               last:border-b">
                  <span aria-hidden
                        className="mt-1.5 flex h-full flex-col items-center gap-1.5">
                    {/* a coluna de pixels virando cor ao longo da noite */}
                    {[0, 1, 2].map((p) => (
                      <span key={p} className="block h-1.5 w-[3px] rounded-[1px]"
                            style={{ background: i === 2 ? 'var(--color-magenta)' : 'var(--color-branco)',
                                     opacity: p === 0 ? 1 : 0.3 }} />
                    ))}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h3 className="text-lg">{m.h}</h3>
                      <span className="lab text-ambar">{m.l}</span>
                    </div>
                    <p className="mt-2 max-w-[42ch] text-xs text-branco-2">{m.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Zap texto="Oi! Quero orçamento de som e luz para casamento. A data é:"
                 className="mt-10">
              Orçamento de casamento
            </Zap>
          </Reveal>

          <Reveal delay={90}>
            <div className="grid grid-cols-2 gap-3">
              {FOTOS_EVENTO.slice(5, 8).map((f, i) => (
                <img key={f.src} src={f.src} width={f.w} height={f.h} loading="lazy"
                     decoding="async"
                     alt={`Casamento sonorizado e iluminado pela Rapa Sound — foto ${i + 1}`}
                     className={`w-full rounded-[var(--radius-card)] object-cover
                                 ${i === 0 ? 'col-span-2 aspect-16/10' : 'aspect-4/5'}`} />
              ))}
            </div>
            <p className="lab mt-5 max-w-[36ch] leading-relaxed">
              Se quiser, mandamos o projeto de luz para o seu fotógrafo revisar
              antes de você fechar com a gente.
            </p>
          </Reveal>
        </div>
      </Secao>

      {/* ══════════════ OS 13 SERVIÇOS ══════════════
          13 e primo: nao existe grade de colunas iguais que o acomode
          sem orfao. A saida e parar de tratar os 13 como iguais — tres
          cards para o que vende, indice para o resto, em cinco blocos
          de tamanho desigual. A assimetria vira informacao: o bloco LED
          e o maior porque e o que a empresa faz de diferente. */}
      {/* overflow-CLIP, nao hidden: `hidden` cria scroll container e vira
          o scrollport dos `lg:sticky` la embaixo — os cinco cabecalhos de
          bloco nunca grudavam. `clip` recorta sem criar o container. */}
      <Secao id="servicos" className="relative overflow-clip">
        <LuzCursor seletor="#servicos" />
        <Reveal>
          <Eyebrow><b>Serviços</b> · <i>13</i>, monta junto ou separado</Eyebrow>
          <h2 className="max-w-[20ch] text-2xl lg:text-3xl">
            Do palco ao túnel de LED
          </h2>
        </Reveal>

        {/* os tres que vendem */}
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {DESTAQUE_LED.map((a, i) => {
            const s = SERVICOS.find((x) => x.ancora === a)!
            return (
              <CardServico key={a} servico={s} i={i}
                           foto={`/img/eventos/${[3, 6, 8][i]}.webp`} />
            )
          })}
        </div>

        {/* o indice: os cinco blocos, tamanhos desiguais de proposito */}
        <div className="mt-20 flex flex-col gap-14">
          {BLOCOS.map((b, bi) => {
            const itens = SERVICOS.filter(
              (s) => s.bloco === b.id && !DESTAQUE_LED.includes(s.ancora),
            )
            if (!itens.length) return null
            return (
              <Reveal key={b.id} delay={Math.min(bi, 3) * 60}>
                <div className="bloco grid gap-x-10 gap-y-5
                                lg:grid-cols-[minmax(0,13rem)_1fr]">
                  <div className="lg:sticky lg:top-8 lg:self-start">
                    <h3 className="text-lg">{b.titulo}</h3>
                    <p className="lab mt-2">
                      {b.nota} · {itens.length + (b.id === 'led' ? 3 : 0)}
                    </p>
                  </div>
                  <div className="lg:pl-4">
                    {itens.map((s) => (
                      <LinhaServico key={s.ancora} servico={s}
                                    paraSecao={b.id === 'pacotes'} />
                    ))}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Secao>

      {/* ══════════════ EVENTOS EM VÍDEO ══════════════ */}
      <Secao id="eventos">
        <Reveal>
          <Eyebrow><b>Acervo</b> · <i>10</i> vídeos de festas que aconteceram</Eyebrow>
          <h2 className="max-w-[20ch] text-2xl lg:text-3xl">Veja como fica</h2>
        </Reveal>
        <div className="mt-12">
          <Palco videos={[...EVENTOS, ...DEPOIMENTOS]} />
        </div>
      </Secao>

      {/* A VIRADA foi removida.
          Ela era 170svh de rolagem cujo unico proposito era acender a
          sala em sete degraus ate o branco — e o branco acabou. Sem o
          estado que ela introduzia, ficaria uma tela vazia pedindo
          para o visitante rolar por nada.
          O que ela defendia continua vivo, so que por tipografia:
          da secao do rider para baixo a pagina fica monoespacada, sem
          cor de ambiente, com o tubo branco. Ver IDENTIDADE.md. */}

      <div className="registro">
      {/* ══════════════ ESTADO TÉCNICO · RIDER ══════════════ */}
      <Secao id="rider" className="relative">
        {/* branco puro: no registro tecnico o tubo e luz de trabalho,
            nunca cor de ambiente. */}
        <Tubo cor="var(--color-branco)" aceso />
        <Reveal>
          <Eyebrow><b>Rider técnico</b> · <i>{TOTAL_ARTISTAS}</i> artistas</Eyebrow>
          <h2 className="max-w-[24ch] text-2xl lg:text-3xl">
            Quem já subiu nos nossos palcos
          </h2>
          <p className="mt-6 max-w-[56ch] text-xs text-branco-2">
            Atendemos o rider de {TOTAL_ARTISTAS} artistas e bandas. Se você é
            produtor, casa de show ou prefeitura, é por aqui.
          </p>
          <Zap texto="Oi! Sou produtor(a). Quero falar sobre rider técnico e estrutura." className="mt-8">
            Falar sobre rider
          </Zap>
        </Reveal>

        {/* os que a pessoa reconhece, grandes. Sem isto os 116 tem o
            mesmo peso — e peso igual e peso nenhum. */}
        <Reveal className="mt-16">
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
            {DESTAQUES.map((n, i) => (
              <span key={n}
                    className="font-[family-name:var(--font-display)] text-lg
                               leading-tight lg:text-xl"
                    style={{ opacity: 1 - i * 0.045 }}>
                {n}
              </span>
            ))}
            <span className="lab self-center">
              e mais {TOTAL_ARTISTAS - DESTAQUES.length}
            </span>
          </div>
        </Reveal>

        {/* a lista completa: corrida, com o pixel do tubo separando.
            Em coluna vertical de mono minusculo ninguem le. */}
        <div className="mt-20 flex flex-col gap-12">
          {RIDER.map((cat, i) => (
            <Reveal key={cat.categoria} delay={Math.min(i, 3) * 60}>
              <div className="grid gap-x-10 gap-y-4 lg:grid-cols-[minmax(0,15rem)_1fr]">
                <h3 className="lab flex items-baseline gap-3 lg:sticky lg:top-8 lg:self-start">
                  <b>{cat.categoria}</b>
                  <span className="tabular-nums opacity-60">{cat.nomes.length}</span>
                </h3>
                <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-branco-2
                               lg:border-l lg:border-rule lg:pl-10">
                  {cat.nomes.map((n, j) => (
                    <li key={n} className="flex items-center gap-3">
                      <span className="transition-colors duration-200 hover:text-ambar">{n}</span>
                      {j < cat.nomes.length - 1 && (
                        <span aria-hidden
                              className="block h-1 w-1 shrink-0 rounded-[1px] bg-rule" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Secao>

      {/* ══════════════ ESTADO TÉCNICO · SOBRE E EQUIPE ══════════════ */}
      <Secao id="sobre" className="border-t border-rule">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Eyebrow><b>A casa</b> · quase <i>30</i> anos</Eyebrow>
            <h2 className="max-w-[18ch] text-2xl lg:text-3xl">Quase 30 anos</h2>
            <p className="mt-6 text-base text-branco-2">
              A Rapa Sound é de Uberlândia e atende casamento, festa de 15 anos e
              evento de empresa. Já montamos em Araguari, em Tiradentes e no
              Palácio de Cristal — e continuamos atendendo aqui do lado.
            </p>
            <p className="mt-4 text-xs text-branco-2">
              O equipamento qualquer um aluga. O que não se aluga é a equipe que
              sabe onde pendurar o refletor para a foto sair boa.
            </p>
          </Reveal>
          <Reveal delay={90}>
            <LequeEquipe cards={EQUIPE.map((p) => ({
              src: p.src,
              alt: `${p.nome}, ${p.papel.toLowerCase()} na Rapa Sound`,
              nome: p.nome,
              papel: p.papel,
            }))} />
          </Reveal>
        </div>
      </Secao>

      {/* ══════════════ FAQ ══════════════ */}
      <Secao id="duvidas" className="border-t border-rule">
        <Reveal>
          <Eyebrow><b>Dúvidas</b> · o que perguntam antes de fechar</Eyebrow>
          <h2 className="max-w-[20ch] text-2xl lg:text-3xl">Dúvidas</h2>
        </Reveal>
        <div className="mt-12 max-w-[70ch]">
          {FAQ.map((q, i) => (
            <Reveal key={q.p} delay={Math.min(i, 4) * 50}>
              {/* <details> nativo: acessivel e zero JS */}
              <details className="group border-b border-rule">
                <summary className="flex min-h-14 cursor-pointer list-none items-center
                                    justify-between gap-6 py-5 text-sm font-bold
                                    transition-colors hover:text-ambar
                                    [&::-webkit-details-marker]:hidden">
                  {q.p}
                  <span aria-hidden
                        className="shrink-0 font-mono text-lg leading-none text-ambar
                                   transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-6 text-xs leading-relaxed text-branco-2">{q.r}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Secao>

      {/* ══════════════ CONTATO ══════════════ */}
      <Secao id="contato" className="border-t border-rule">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Eyebrow><b>Contato</b> · resposta no WhatsApp</Eyebrow>
            <h2 className="max-w-[18ch] text-2xl lg:text-3xl">
              Manda a data que a gente confirma
            </h2>
            <p className="mt-6 max-w-[44ch] text-xs text-branco-2">
              Diga o tipo de evento, a data e o salão. Com isso já dá para
              responder se está livre e quanto fica.
            </p>
            <Zap texto="Oi! Quero um orçamento. Meu evento é:" className="mt-9">
              Falar no WhatsApp
            </Zap>
          </Reveal>

          <Reveal delay={90}>
            <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              <div>
                <dt className="lab">WhatsApp</dt>
                <dd className="mt-2 font-mono text-xs">{CONTATO.whatsappVisivel}</dd>
              </div>
              <div>
                <dt className="lab">Telefone fixo</dt>
                <dd className="font-mono text-xs">
                  <a href={`tel:${CONTATO.fixoLink}`}
                     className="inline-flex min-h-11 items-center hover:text-ambar">
                    {CONTATO.fixo}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="lab">E-mail</dt>
                <dd className="font-mono text-xs break-all">
                  <a href={`mailto:${CONTATO.email}`}
                     className="inline-flex min-h-11 items-center hover:text-ambar">
                    {CONTATO.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="lab">Endereço</dt>
                {/* PENDENTE P1: confirmar qual dos dois enderecos vale */}
                <dd className="mt-2 font-mono text-xs not-italic leading-relaxed text-branco-2">
                  {CONTATO.endereco.rua}<br />
                  {CONTATO.endereco.bairro} · {CONTATO.endereco.cep}<br />
                  {CONTATO.endereco.cidade}/{CONTATO.endereco.uf}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="lab">Redes</dt>
                <dd className="mt-1 flex flex-wrap gap-x-6 font-mono text-xs">
                  {Object.entries(CONTATO.redes).map(([nome, url]) => (
                    <a key={nome} href={url} target="_blank" rel="noopener noreferrer"
                       className="inline-flex min-h-11 items-center capitalize underline
                                  decoration-rule underline-offset-4 hover:text-ambar">
                      {nome}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </Secao>

      </div>

      <footer className="border-t border-rule py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 lg:flex-row
                        lg:items-center lg:justify-between lg:px-8">
          <p className="lab">© Rapa Sound · Uberlândia/MG</p>
          <p className="lab">Sonorização · iluminação · efeitos · LED</p>
        </div>
      </footer>

      <MenuLiquido />
      <NavDesktop />
      <PausaLed />
    </>
  )
}
