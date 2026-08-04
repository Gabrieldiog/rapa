import type { ReactNode } from 'react'
import { zap } from '@/lib/conteudo'

/** A coluna de pixels — a expressao da assinatura.
 *  Pontos discretos, nunca linha continua. Sem glow. */
export function Tubo({ cor = 'var(--color-ambar)', aceso = false }:
  { cor?: string; aceso?: boolean }) {
  return (
    <span aria-hidden className={`tubo ${aceso ? 'tubo-aceso' : ''}`}
          style={{ ['--tubo-cor' as string]: cor }} />
  )
}

/** O CTA. Sempre ambar, sempre com o texto ja preenchido, e o rotulo
 *  sempre diz o que acontece. Alvo de toque 48px. */
export function Zap({ texto, children, className = '' }:
  { texto: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={zap(texto)}
      target="_blank"
      rel="noopener noreferrer"
      data-zap
      className={`group inline-flex min-h-13 items-center gap-3 rounded-[var(--radius-botao)]
                  bg-ambar px-7 text-void font-mono text-xs font-medium uppercase
                  tracking-[0.1em] shadow-[0_10px_30px_-14px_var(--color-ambar)]
                  transition-[transform,box-shadow] duration-200
                  hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-14px_var(--color-ambar)]
                  active:translate-y-0 ${className}`}
    >
      {children}
      <span aria-hidden
            className="text-base leading-none transition-transform duration-200
                       group-hover:translate-x-1">
        →
      </span>
    </a>
  )
}

export function Secao({ id, children, className = '' }:
  { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-16 py-24 lg:py-40 ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">{children}</div>
    </section>
  )
}

/**
 * Sobretítulo. Não é só uppercase com tracking: leva um marcador de
 * pixel na cor do tubo da seção, e contraste de valor dentro da
 * própria linha — <b> para o termo, <i> para o numeral.
 */
export function Eyebrow({ children, cor }: { children: ReactNode; cor?: string }) {
  return (
    <p className="eyebrow mb-5"
       style={cor ? ({ ['--tubo-cor' as string]: cor }) : undefined}>
      {children}
    </p>
  )
}
