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
    const led = document.querySelector<HTMLElement>('.led')
    if (!led) return

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) led.removeAttribute('data-fora')
        else led.setAttribute('data-fora', '')
      },
      { threshold: 0 },
    )
    io.observe(led)
    return () => io.disconnect()
  }, [])

  return null
}
