import {
  SERVICOS, RIDER, TOTAL_ARTISTAS, EVENTOS, DEPOIMENTOS, FAQ,
  CONTATO, FOTOS_EVENTO, FOTOS_EQUIPE, zap,
} from '@/lib/conteudo'
import { Reveal } from '@/components/Reveal'
import { VideoFacade } from '@/components/VideoFacade'
import { CardServico } from '@/components/CardServico'
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

      {/* ══════════════ HERO ══════════════ */}
      <header id="conteudo" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={FOTOS_EVENTO[0].src}
            width={FOTOS_EVENTO[0].w}
            height={FOTOS_EVENTO[0].h}
            alt="Debutante erguida pelas convidadas no meio da pista, com arcos de luz ao fundo"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/30" />
        </div>

        <div className="relative mx-auto flex min-h-[88svh] w-full max-w-6xl
                        flex-col justify-end px-5 pb-16 pt-28 lg:px-8 lg:pb-24">
          <Eyebrow>Uberlândia · quase 30 anos</Eyebrow>
          <h1 className="max-w-[16ch] text-3xl lg:text-4xl">
            Som, luz e LED para 15&nbsp;anos e casamento
          </h1>
          <p className="mt-7 max-w-[46ch] text-base text-branco-2">
            A gente cuida do som, da luz e da estrutura. No dia, tem técnico nosso
            do começo ao fim — para você não ter que resolver nada.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Zap texto="Oi! Quero um orçamento de som e luz. Meu evento é:">
              Falar no WhatsApp
            </Zap>
            <a href="#rider" className="lab underline decoration-rule underline-offset-8
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
            <Eyebrow>O que mais fazemos</Eyebrow>
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

        <Reveal className="mt-20">
          <Eyebrow>Quem já contratou, contando</Eyebrow>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEPOIMENTOS.map((v) => (
              <figure key={v.id}>
                <VideoFacade video={v} />
                <figcaption className="mt-3">
                  <p className="text-xs">{v.titulo}</p>
                  <p className="lab mt-1">{v.tipo}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </Secao>

      {/* ══════════════ ESTADO FESTA · CASAMENTO ══════════════ */}
      <Secao id="casamento" className="relative bg-congo/25">
        <Tubo cor="var(--color-congo)" aceso />
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-20">
          <Reveal>
            <div className="grid grid-cols-2 gap-2">
              {FOTOS_EVENTO.slice(5, 8).map((f, i) => (
                <img key={f.src} src={f.src} width={f.w} height={f.h} loading="lazy"
                     decoding="async"
                     alt={`Casamento sonorizado e iluminado pela Rapa Sound — foto ${i + 1}`}
                     className={`aspect-4/3 w-full object-cover ${i === 0 ? 'col-span-2' : ''}`} />
              ))}
            </div>
          </Reveal>
          <Reveal delay={90}>
            <Eyebrow>Cerimônia, recepção e pista</Eyebrow>
            <h2 className="text-2xl lg:text-3xl">Casamento</h2>
            <p className="mt-6 text-base text-branco-2">
              Som ambiente no jantar em volume que deixa conversar. Na pista,
              sobe. Se no fim da noite alguém sai com apito no ouvido, o som
              estava errado.
            </p>
            <Zap texto="Oi! Quero orçamento de som e luz para casamento." className="mt-9">
              Orçamento de casamento
            </Zap>
          </Reveal>
        </div>
      </Secao>

      {/* ══════════════ OS 13 SERVIÇOS ══════════════ */}
      <Secao id="servicos">
        <Reveal>
          <Eyebrow>13 serviços · monta junto ou separado</Eyebrow>
          <h2 className="max-w-[20ch] text-2xl lg:text-3xl">
            Do palco ao túnel de LED
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICOS.map((s, i) => (
            <CardServico key={s.ancora} servico={s} i={i} />
          ))}
        </div>
      </Secao>

      {/* ══════════════ EVENTOS EM VÍDEO ══════════════ */}
      <Secao id="eventos">
        <Reveal>
          <Eyebrow>Festas que já aconteceram</Eyebrow>
          <h2 className="max-w-[20ch] text-2xl lg:text-3xl">Veja como fica</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EVENTOS.map((v, i) => (
            <Reveal key={v.id} delay={(i % 3) * 70}>
              <figure>
                <VideoFacade video={v} />
                <figcaption className="mt-3">
                  <p className="text-xs">{v.titulo}</p>
                  <p className="lab mt-1">{v.local ?? v.tipo}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Secao>

      {/* ══════════════ A VIRADA ══════════════
          A assinatura. A pagina troca de estado: sai a cor da festa,
          entra a luz de trabalho. O LED vende a festa; o branco vende
          os trinta anos. */}
      <div className="relative border-y border-rule bg-off">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <Reveal>
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="lab text-branco">Luz de trabalho</p>
                <p className="mt-4 max-w-[34ch] font-mono text-sm leading-relaxed text-branco-2">
                  Daqui para baixo não tem foto bonita. Tem rider, tem
                  equipamento e tem os trinta anos.
                </p>
              </div>
              <div className="flex items-end gap-3" aria-hidden>
                {/* a coluna de pixels, deitada: o tubo trocando de estado */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={i} className="block h-8 w-[3px]"
                        style={{ background: i < 5 ? 'var(--color-magenta)'
                                 : i < 7 ? 'var(--color-congo)' : 'var(--color-branco)',
                                 opacity: i < 7 ? 0.35 : 1 }} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ══════════════ ESTADO TÉCNICO · RIDER ══════════════ */}
      <Secao id="rider" className="relative">
        <Tubo cor="var(--color-branco)" aceso />
        <Reveal>
          <Eyebrow>Rider técnico · {TOTAL_ARTISTAS} artistas</Eyebrow>
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

        <div className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {RIDER.map((cat, i) => (
            <Reveal key={cat.categoria} delay={(i % 3) * 70}>
              <h3 className="lab border-b border-rule pb-3 text-branco">
                {cat.categoria} · {cat.nomes.length}
              </h3>
              <ul className="mt-4 font-mono text-2xs leading-[2] text-branco-2">
                {cat.nomes.map((n) => (
                  <li key={n} className="transition-colors hover:text-ambar">{n}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Secao>

      {/* ══════════════ ESTADO TÉCNICO · SOBRE E EQUIPE ══════════════ */}
      <Secao id="sobre" className="border-t border-rule">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Eyebrow>Desde o começo</Eyebrow>
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
            <div className="grid grid-cols-3 gap-2">
              {FOTOS_EQUIPE.map((f, i) => (
                <img key={f.src} src={f.src} width={f.w} height={f.h} loading="lazy"
                     decoding="async"
                     alt={`Integrante da equipe da Rapa Sound — foto ${i + 1}`}
                     className="aspect-3/4 w-full object-cover" />
              ))}
            </div>
          </Reveal>
        </div>
      </Secao>

      {/* ══════════════ FAQ ══════════════ */}
      <Secao id="duvidas" className="border-t border-rule">
        <Reveal>
          <Eyebrow>O que perguntam antes de fechar</Eyebrow>
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
            <Eyebrow>Falar com a gente</Eyebrow>
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
                <dd className="mt-2 font-mono text-xs">
                  <a href={`tel:${CONTATO.fixoLink}`} className="hover:text-ambar">
                    {CONTATO.fixo}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="lab">E-mail</dt>
                <dd className="mt-2 font-mono text-xs break-all">
                  <a href={`mailto:${CONTATO.email}`} className="hover:text-ambar">
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
                <dd className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
                  {Object.entries(CONTATO.redes).map(([nome, url]) => (
                    <a key={nome} href={url} target="_blank" rel="noopener noreferrer"
                       className="capitalize underline decoration-rule underline-offset-4
                                  hover:text-ambar">
                      {nome}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </Secao>

      <footer className="border-t border-rule py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 lg:flex-row
                        lg:items-center lg:justify-between lg:px-8">
          <p className="lab">© Rapa Sound · Uberlândia/MG</p>
          <p className="lab">Sonorização · iluminação · efeitos · LED</p>
        </div>
      </footer>

      {/* botão flutuante — não cobre conteúdo, respeita a safe area do iOS */}
      <a
        href={zap('Oi! Quero um orçamento. Meu evento é:')}
        target="_blank"
        rel="noopener noreferrer"
        data-zap
        aria-label="Falar com a Rapa Sound no WhatsApp"
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50
                   flex h-14 min-w-14 items-center gap-3 bg-ambar px-5 text-void
                   font-mono text-2xs font-medium uppercase tracking-[0.12em]
                   transition-transform duration-200 hover:-translate-y-0.5 lg:hidden"
      >
        WhatsApp
      </a>
    </>
  )
}
