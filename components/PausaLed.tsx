'use client'

import { useEffect } from 'react'

/**
 * A varredura da palavra LED e infinita, a pedido do cliente do
 * projeto. Mas `background-clip: text` repinta na MAIN THREAD a cada
 * quadro — nao vai para o compositor. Um loop eterno com o telefone
 * parado na mesa gasta bateria de graca.
 *
 * Entao a animacao so roda enquanto alguem esta olhando: sai da tela,
 * `data-fora` entra e o CSS pausa. Volta, sai.
 *
 * ~350 B. Um observer, um elemento, nenhum listener de scroll.
 */
export function PausaLed() {
  useEffect(() => {
    /* querySelectorAll e nao querySelector: sao DUAS palavras varridas
       no topo. Com o singular, a segunda nunca pausava e ficava
       repintando na main thread com a pagina rolada la embaixo. */
    const alvos = document.querySelectorAll<HTMLElement>('.led')
    if (!alvos.length) return

    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) e.target.removeAttribute('data-fora')
          else e.target.setAttribute('data-fora', '')
        }
      },
      { threshold: 0 },
    )
    for (const a of alvos) io.observe(a)
    return () => io.disconnect()
  }, [])

  return null
}
