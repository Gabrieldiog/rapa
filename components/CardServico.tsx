import type { Servico } from '@/lib/conteudo'
import { zap } from '@/lib/conteudo'
import { Tubo } from './ui'
import { Reveal } from './Reveal'

/** A cor do tubo de um serviço, pela restrição dura:
 *  'festa' = ambiente (magenta) · 'tecnico' = luz de trabalho (branco). */
export const corDoTubo = (s: Servico) =>
  s.estado === 'festa' ? 'var(--color-magenta)' : 'var(--color-branco)'

/**
 * Card de destaque — só para os três serviços de LED que vendem.
 * Os outros dez vivem no índice, que não é caixa.
 *
 * O facho `.luz` não soma brilho: ele revela a matriz de LEDs sob o
 * difusor. É "LED é pixel, não lâmpada" virando interação.
 */
export function CardServico({ servico, i, foto }:
  { servico: Servico; i: number; foto?: string }) {
  const cor = corDoTubo(servico)

  return (
    <Reveal delay={i * 80}>
      <a
        id={servico.ancora}
        href={zap(`Oi! Quero orçamento de ${servico.nome.toLowerCase()}.`)}
        target="_blank"
        rel="noopener noreferrer"
        data-zap
        className="card group flex h-full scroll-mt-24 flex-col"
        style={{ ['--tubo-cor' as string]: cor }}
      >
        <span className="luz" aria-hidden />
        <Tubo cor={cor} />

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
      </a>
    </Reveal>
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
