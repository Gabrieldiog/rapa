'use client'

import { useEffect, useRef, type ReactNode, type ElementType } from 'react'

/**
 * Reveal por IntersectionObserver.
 *
 * A LEI DA CASA: o estado final é a BASE. A animação entra por cima,
 * e só onde ela não pode atrapalhar.
 *
 * A versão anterior tinha um defeito grave: o HTML era servido com
 * `class="rev"` (opacity: 0) e um script no <head> removia `no-js`
 * antes da hidratação. Resultado — 34 blocos ficavam invisíveis da
 * execução do script até o IntersectionObserver rodar, o que em 4G é
 * a página em branco por segundos. E se o JS falhasse depois disso,
 * ficavam invisíveis para sempre.
 *
 * Agora o elemento é servido SEM classe nenhuma: nasce visível. Só
 * depois da montagem, e só se estiver ABAIXO da dobra, ele é escondido
 * e observado. O que já está na tela nunca chega a sumir — não há nem
 * flash de um quadro.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
}: {
  children: ReactNode
  as?: ElementType
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* ONDE HA `view()`, ESTE COMPONENTE NAO FAZ NADA.
       A entrada passou a ser dirigida pela rolagem, em CSS puro: o
       progresso da animacao É a posicao do bloco na tela, e não um
       cronômetro disparado por um limiar. Fica mais fluido, reverte
       ao rolar de volta, e roda sem uma linha de JavaScript.
       Este caminho sobra para quem nao tem `view()` — Firefox ate a
       156 e navegadores antigos, ~10% do trafego de celular
       brasileiro. Para eles, o observador de sempre. */
    if (CSS.supports('animation-timeline: view()')) return

    // já visível? então não esconde. Nunca.
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight * 0.92) return

    el.classList.add('rev-js')
    if (delay) el.style.setProperty('--d', `${delay}ms`)

    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue
          e.target.classList.add('rev-on')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delay])

  /* A classe `rev` VAI NO HTML SERVIDO, e isso é seguro: a única regra
     que a usa mora dentro de `@supports (animation-timeline: view())`.
     Onde `view()` não existe ela não casa com nada e o bloco nasce
     visível — que é a lei da casa. Onde existe, o navegador já revela
     pela rolagem sem esperar JS nenhum.
     O `--d` também vai no HTML: no caminho de rolagem ele não é atraso
     em tempo, é atraso em DISTÂNCIA — o bloco irmão começa a subir um
     pouco mais tarde no percurso. */
  return (
    <Tag ref={ref}
         className={`rev${className ? ` ${className}` : ''}`}
         style={delay ? ({ ['--d' as string]: `${delay}ms` }) : undefined}>
      {children}
    </Tag>
  )
}
