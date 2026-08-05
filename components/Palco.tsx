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
      <div className="relative aspect-video w-full overflow-hidden
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
                 className="absolute inset-0 h-full w-full object-cover opacity-75
                            transition-opacity duration-300 group-hover:opacity-100" />
            {/* o play é um segmento aceso do tubo. Âmbar, nunca magenta. */}
            <span aria-hidden
                  className="absolute bottom-5 left-5 flex h-12 items-center gap-3
                             rounded-[var(--radius-botao)] bg-ambar px-5 text-void
                             transition-transform duration-300 group-hover:translate-x-1">
              <span className="block h-3.5 w-[3px] rounded-[1px] bg-void" />
              <span className="font-mono text-2xs font-medium uppercase tracking-[0.14em]">
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
        {lista.map((item, n) => (
          <li key={item.id} className="shrink-0 snap-start">
            <button type="button" onClick={() => escolher(n)}
                    aria-current={item.id === v.id ? 'true' : undefined}
                    className="mini group block w-[9rem] text-left sm:w-[11rem]">
              <span className="relative block aspect-video overflow-hidden
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
