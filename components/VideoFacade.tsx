'use client'

import { useState } from 'react'
import type { Video } from '@/lib/conteudo'

/**
 * Fachada de YouTube. O site antigo carregava 10 players; cada um
 * custa ~1,2MB e destroi o LCP e o INP. Aqui so a capa carrega, e o
 * iframe entra no clique. ~0,6KB.
 *
 * A capa e local (`/img/capas/`), nao do i.ytimg.com: o hqdefault que
 * estava aqui e 480x360, ou seja 4:3 com tarja preta em cima e embaixo
 * de todo video 16:9. A copia local ja vem recortada.
 */
export function VideoFacade({ video, prioridade = false }: { video: Video; prioridade?: boolean }) {
  const [ligado, setLigado] = useState(false)

  if (ligado) {
    return (
      <div className="relative aspect-video overflow-clip bg-void">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
          title={video.titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setLigado(true)}
      className="group relative block aspect-video w-full overflow-clip bg-off text-left"
      aria-label={`Assistir: ${video.titulo}`}
    >
      <img
        src={`/img/capas/${video.id}-p.webp`}
        alt=""
        width={400}
        height={225}
        loading={prioridade ? 'eager' : 'lazy'}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-70
                   transition-opacity duration-300 group-hover:opacity-100"
      />
      {/* o botao de play e um segmento aceso do tubo, nao um triangulo de app */}
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
  )
}
