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
      className={`inline-flex min-h-12 items-center gap-3 bg-ambar px-6 text-void
                  font-mono text-xs font-medium uppercase tracking-[0.1em]
                  transition-transform duration-200 hover:-translate-y-0.5 ${className}`}
    >
      {children}
      <span aria-hidden className="text-base leading-none">→</span>
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

/** Sobretitulo utilitario. No estado tecnico ele carrega o dado. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="lab mb-5">{children}</p>
}
