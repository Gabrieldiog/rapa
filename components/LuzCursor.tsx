'use client'

import { useEffect } from 'react'

/**
 * Escreve --mx/--my no card sob o ponteiro. UM listener delegado para
 * todos os cards, com rAF e passivo. Nao re-renderiza React.
 *
 * ~480 B. Nao roda em touch nem em reduced-motion — e nesses casos o
 * card ja funciona sozinho, com o aro de dois tons e o tubo.
 *
 * Sem will-change: translate3d ja promove a camada, e will-change em
 * N elementos criaria N camadas permanentes na GPU.
 */
export function LuzCursor({ seletor }: { seletor: string }) {
  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const raiz = document.querySelector(seletor)
    if (!raiz) return

    let id = 0
    let ult: PointerEvent | null = null

    const aplica = () => {
      id = 0
      if (!ult) return
      const card = (ult.target as Element).closest<HTMLElement>('.card')
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${ult.clientX - r.left}px`)
      card.style.setProperty('--my', `${ult.clientY - r.top}px`)
    }

    const onMove = (e: Event) => {
      ult = e as PointerEvent
      if (!id) id = requestAnimationFrame(aplica)
    }

    raiz.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      raiz.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(id)
    }
  }, [seletor])

  return null
}
