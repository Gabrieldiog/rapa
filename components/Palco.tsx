'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Video } from '@/lib/conteudo'

/**
 * PALCO — um vídeo grande + trilho de miniaturas selecionáveis.
 *
 * Invariante de performance: NO MÁXIMO UM <iframe> existe no DOM.
 * Trocar de item desmonta o anterior. É estruturalmente impossível
 * abrir dois players — coisa que a grade antiga permitia.
 *
 * Semântica: lista de <button> com aria-current, não tabs. Roving
 * tabindex brigaria com um trilho rolável.
 */

/* As capas moram AQUI, nao no i.ytimg.com.
   Motivo medido: `maxresdefault.jpg` responde 404 em SETE dos dez
   videos — inclusive no primeiro do filtro "tudo". O onError existia,
   mas o navegador ja tinha desenhado o icone de imagem quebrada. Era
   o "..." cinza no lugar do video.
   Agora cada capa e a melhor resolucao que o YouTube tinha (maxres
   onde existe, sddefault no resto), com a tarja preta 4:3 do sddefault
   recortada fora, servida do proprio dominio. Zero requisicao a
   terceiro, zero 404, e o corte e nosso. */
const CAPA_PALCO = (id: string) => `/img/capas/${id}-g.webp`
const CAPA_MINI = (id: string) => `/img/capas/${id}-p.webp`

export function Palco({ videos }: { videos: Video[] }) {
  const [filtro, setFiltro] = useState<string>('tudo')
  const [i, setI] = useState(0)
  const [tocando, setTocando] = useState(false)

  const tipos = useMemo(
    () => ['tudo', ...Array.from(new Set(videos.map((v) => v.tipo)))],
    [videos],
  )
  const lista = useMemo(
    () => (filtro === 'tudo' ? videos : videos.filter((v) => v.tipo === filtro)),
    [videos, filtro],
  )
  const v = lista[Math.min(i, lista.length - 1)] ?? videos[0]

  const escolher = useCallback((n: number) => { setI(n); setTocando(false) }, [])
  const filtrar = useCallback((t: string) => { setFiltro(t); setI(0); setTocando(false) }, [])

  /** preconnect só na intenção de clique: poupa o handshake em 4G */
  const aquecer = useCallback(() => {
    if (document.getElementById('yt-preconnect')) return
    const l = document.createElement('link')
    l.id = 'yt-preconnect'
    l.rel = 'preconnect'
    l.href = 'https://www.youtube-nocookie.com'
    document.head.append(l)
  }, [])

  return (
    <div>
      {/* ---------- CHIPS ---------- */}
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
        {tipos.map((t) => (
          <button key={t} type="button" onClick={() => filtrar(t)}
                  aria-pressed={filtro === t}
                  className={`min-h-11 rounded-[var(--radius-botao)] border px-4 font-mono
                              text-2xs uppercase tracking-[0.12em] transition-colors
                              ${filtro === t
                                ? 'border-ambar bg-ambar text-void'
                                : 'border-rule text-branco-2 hover:border-branco-2 hover:text-branco'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ---------- PALCO ---------- */}
      <div className="relative aspect-video w-full overflow-clip
                      rounded-[var(--radius-placa)] bg-off">
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
          <button type="button" onClick={() => setTocando(true)}
                  onPointerEnter={aquecer} onTouchStart={aquecer}
                  className="group absolute inset-0 block w-full text-left"
                  aria-label={`Assistir: ${v.titulo}`}>
            <img key={v.id} src={CAPA_PALCO(v.id)}
                 srcSet={`${CAPA_MINI(v.id)} 400w, ${CAPA_PALCO(v.id)} 1280w`}
                 sizes="(min-width: 1024px) 60rem, 100vw"
                 alt="" width={1280} height={720}
                 loading="lazy" decoding="async"
                 /* subiu de 75 para 90: quem escurece o miolo agora e o
                    gradiente radial abaixo, entao a foto nao precisa mais
                    pagar por isso na imagem inteira. */
                 className="absolute inset-0 h-full w-full object-cover opacity-90
                            transition-opacity duration-300 group-hover:opacity-100" />
            {/* O play era uma barrinha vertical de 3px dentro de uma placa
                âmbar no canto. A ideia era "um segmento aceso do tubo",
                mas 3px de largura não lê como play — lê como cursor de
                texto, ou como metade de um pause. E a placa no canto
                inferior esquerdo não tinha razão de estar ali.
                Agora é centralizado e legível: disco âmbar, triângulo de
                verdade, e o anel que abre é o facho saindo do refletor. */}

            {/* escurecimento só no miolo, para o disco ter contraste
                sobre qualquer capa. Não é um véu na foto inteira. */}
            <span aria-hidden className="absolute inset-0"
                  style={{ background:
                    'radial-gradient(40% 48% at 50% 47%, color-mix(in srgb, var(--color-void) 58%, transparent) 0%, transparent 100%)' }} />

            <span aria-hidden
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="relative flex h-16 w-16 items-center justify-center
                               rounded-full bg-ambar transition-transform duration-300
                               ease-[var(--ease-out-cut)] group-hover:scale-105
                               motion-reduce:transition-none motion-reduce:group-hover:scale-100
                               sm:h-20 sm:w-20">
                {/* o facho: anel que abre e some. transform + opacity só. */}
                <span className="absolute inset-0 rounded-full border border-ambar
                                 transition duration-700 ease-[var(--ease-out-cut)]
                                 group-hover:scale-[1.45] group-hover:opacity-0
                                 motion-reduce:hidden" />
                {/* ml-[3px] porque triângulo centralizado geometricamente
                    parece torto para a esquerda. É correção óptica. */}
                <svg viewBox="0 0 24 24"
                     className="ml-[3px] h-6 w-6 fill-void sm:h-7 sm:w-7">
                  <path d="M8 4.8v14.4L19.4 12z" />
                </svg>
              </span>
              <span className="font-mono text-2xs font-medium uppercase tracking-[0.18em]
                               text-branco">
                Assistir
              </span>
            </span>
          </button>
        )}
      </div>

      {/* aria-live avisa quem usa leitor de tela sem roubar o foco do trilho */}
      <p className="mt-4 min-h-12" aria-live="polite">
        <span className="block text-base leading-tight">{v.titulo}</span>
        <span className="lab mt-1 block">{v.tipo}{v.local ? ` · ${v.local}` : ''}</span>
      </p>

      {/* ---------- TRILHO ---------- */}
      <ul className="trilho mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3"
          aria-label="Escolha um vídeo">
        {/* `relative` NO BOTAO, e nao e enfeite — e o conserto de um
            defeito que derrubou a pagina inteira no celular.
            O `.sr-only` la embaixo e `position: absolute`. Sem um
            ancestral POSICIONADO ele se resolve contra o bloco
            inicial e ESCAPA do `overflow-x: auto` do trilho: o
            ultimo item parava em x=1423 e o documento passava a
            medir 1424px de largura em qualquer viewport.
            Em desktop isso nao rola de lado (o navegador nao
            considera essa sobra rolavel) e passa despercebido. Em
            EMULACAO DE CELULAR o navegador nao rola: ele AFASTA O
            ZOOM para caber os 1424px, e o viewport de layout vira
            1425px. Tudo que e `position: fixed` — o menu flutuante,
            a barra — vai parar fora da area visivel. Foi por isso
            que o botao do menu "nao existia" no aparelho e existia
            em todo teste meu. */}
        {lista.map((item, n) => (
          <li key={item.id} className="shrink-0 snap-start">
            <button type="button" onClick={() => escolher(n)}
                    aria-current={item.id === v.id ? 'true' : undefined}
                    className="mini group relative block w-[9rem] text-left sm:w-[11rem]">
              <span className="relative block aspect-video overflow-clip
                               rounded-[var(--radius-botao)] bg-off">
                <img src={CAPA_MINI(item.id)} alt="" width={320} height={180}
                     loading="lazy" decoding="async"
                     className="h-full w-full object-cover transition-opacity duration-200" />
                <span aria-hidden className="mini-tubo" />
              </span>
              <span className="mt-2 block text-xs leading-snug">{item.titulo}</span>
              <span className="sr-only">
                {item.id === v.id ? ' — em exibição' : ` — exibir no palco (${item.tipo})`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
