import type { ReactNode } from 'react'
import { zap } from '@/lib/conteudo'

/* A COLUNA DE PIXELS SAIU.
   Era a "assinatura" da página: um filete de pontos na borda de cada
   seção. Saiu a pedido — "tire todas as listras". A assinatura não
   morre com ela: o mesmo desenho de pontos continua vivo no marcador
   do `.eyebrow`, no separador entre os nomes do rider e no tubo da
   miniatura de vídeo, que são os lugares onde ele diz alguma coisa em
   vez de só decorar a margem. */

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
    /* scroll-mt-20 = 80px: os 64px da barra fixa (a do celular e a
       NavDesktop medem o mesmo) mais 16px de respiro. Era 16 (64px),
       que encostava o titulo na barra no desktop; e no celular ele
       SOMAVA com um `scroll-padding-block-start` de 80px na html,
       dando 144px de desvio para uma barra de 64. */
    <section id={id} className={`scroll-mt-20 py-24 lg:py-40 ${className}`}>
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
