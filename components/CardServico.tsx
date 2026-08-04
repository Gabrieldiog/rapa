'use client'

import { motion, stagger, steps, type Variants } from 'framer-motion'
import type { Servico } from '@/lib/conteudo'
import { zap } from '@/lib/conteudo'
import { Tubo } from './ui'

/** A cor do tubo de um serviço, pela restrição dura:
 *  'festa' = ambiente (magenta) · 'tecnico' = luz de trabalho (branco). */
export const corDoTubo = (s: Servico) =>
  s.estado === 'festa' ? 'var(--color-magenta)' : 'var(--color-branco)'

const PIXELS = 9

/* O chase: o tubo acende pixel a pixel. Não dá para fazer em CSS —
   exigiria nove :nth-child escritos à mão, e não haveria como inverter
   a varredura na saída. Com variantes, `from: 'last'` inverte. */
const ENTRA = [0.22, 1, 0.36, 1] as const

const pixelVar: Variants = {
  oculto: { opacity: 0 },
  'tubo-apagado': { opacity: 0.24, transition: { duration: 0.12 } },
  'tubo-aceso': { opacity: 1, transition: { duration: 0.12, ease: steps(2, 'end') } },
}

/* Nomes específicos de propósito: variante propaga por TODA a subárvore
   de componentes motion, então um nome genérico como 'aceso' dispararia
   em descendentes que não deviam responder. */

/**
 * Card de destaque — só para os três serviços de LED que vendem.
 * Os outros dez vivem no índice, que não é caixa.
 *
 * whileTap não é enfeite: `whileHover` NUNCA dispara em touch (o Motion
 * filtra pointerType === 'touch' na entrada e na saída). Sem ele, o
 * chase simplesmente não existiria para a maioria do tráfego, que chega
 * pelo link na bio do Instagram.
 */
export function CardServico({ servico, i, foto }:
  { servico: Servico; i: number; foto?: string }) {
  const cor = corDoTubo(servico)

  return (
    <motion.a
      id={servico.ancora}
      href={zap(`Oi! Quero orçamento de ${servico.nome.toLowerCase()}.`)}
      target="_blank"
      rel="noopener noreferrer"
      data-zap
      className="card group flex h-full scroll-mt-24 flex-col"
      style={{ ['--tubo-cor' as string]: cor }}
      /* três estados: entra escondido, assenta apagado, acende no gesto.
         Sem o estado intermediário o card saltaria ao receber o ponteiro. */
      initial="oculto"
      whileInView="tubo-apagado"
      whileHover="tubo-aceso"
      whileFocus="tubo-aceso"
      whileTap="tubo-aceso"
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        oculto: { opacity: 0, y: 16 },
        'tubo-apagado': {
          opacity: 1, y: 0,
          transition: { duration: 0.5, delay: i * 0.08, ease: ENTRA,
                        delayChildren: stagger(0.03, { from: 'last' }) },
        },
        'tubo-aceso': {
          opacity: 1, y: 0,
          transition: { delayChildren: stagger(0.035) },
        },
      }}
    >
      <span className="luz" aria-hidden />

      {/* o tubo em pixels discretos — a assinatura, virando interação */}
      <span aria-hidden
            className="absolute inset-y-6 left-3.5 flex w-[3px] flex-col justify-between">
        {Array.from({ length: PIXELS }, (_, p) => (
          <motion.span key={p} variants={pixelVar} data-pixel
                       className="h-1.5 w-full rounded-[var(--radius-cut)]"
                       style={{ background: cor }} />
        ))}
      </span>

      {foto && (
        <img src={foto} width={1033} height={690} loading="lazy" decoding="async"
             alt={`${servico.nome} montado pela Rapa Sound`}
             /* raio interno = externo − distância até a borda */
             className="mb-6 aspect-16/10 w-full rounded-[calc(var(--radius-card)-0.75rem)]
                        object-cover" />
      )}

      <span className="lab text-ambar">{servico.codigo}</span>
      <h3 className="mt-2 text-lg">{servico.nome}</h3>
      <p className="mt-3 flex-1 text-xs leading-relaxed text-branco-2">{servico.desc}</p>
      <span className="lab mt-6 inline-flex items-center gap-2 text-ambar
                       transition-transform duration-300 group-hover:translate-x-1">
        Falar no WhatsApp
        <span aria-hidden>→</span>
      </span>
    </motion.a>
  )
}

/**
 * Linha de índice — os dez serviços restantes.
 * Sem caixa e sem sombra: filete e ritmo. O código de rider (PA, LX,
 * LED-T) substitui a numeração 01/02/03, que é proibida e além disso
 * mentirosa — serviço não tem ordem.
 */
export function LinhaServico({ servico }: { servico: Servico }) {
  const cor = corDoTubo(servico)
  return (
    <a
      id={servico.ancora}
      href={zap(`Oi! Quero orçamento de ${servico.nome.toLowerCase()}.`)}
      target="_blank"
      rel="noopener noreferrer"
      data-zap
      className="linha scroll-mt-24"
      style={{ ['--tubo-cor' as string]: cor }}
    >
      <span className="linha__px" aria-hidden />
      <span className="linha__cod">{servico.codigo}</span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{servico.nome}</span>
        <span className="mt-1 block max-w-[52ch] text-xs text-branco-2">{servico.desc}</span>
      </span>
      <span className="linha__seta lab text-ambar" aria-hidden>→</span>
    </a>
  )
}

export { Tubo }
