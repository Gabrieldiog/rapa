'use client'

import { useEffect, useRef, type ReactNode, type ElementType } from 'react'

/**
 * Reveal por IntersectionObserver. ~0,4KB, sem lib.
 * Ver pesquisa/02-motion.md: a stack inteira cabe em ~1,1KB.
 *
 * Sem JS o conteudo aparece normalmente (.no-js .rev no CSS).
 * Com prefers-reduced-motion o CSS neutraliza o transform.
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('rev-on')
      return
    }
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
  }, [])

  return (
    <Tag
      ref={ref}
      className={`rev ${className}`}
      style={delay ? ({ ['--d' as string]: `${delay}ms` }) : undefined}
    >
      {children}
    </Tag>
  )
}
