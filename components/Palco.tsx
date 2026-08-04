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

const CAPA_MINI = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
const CAPA_PALCO = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
const CAPA_FALL = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

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
                 onError={(e) => { e.currentTarget.src = CAPA_FALL(v.id) }}
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
