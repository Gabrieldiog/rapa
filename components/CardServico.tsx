import type { Servico } from '@/lib/conteudo'
import { zap } from '@/lib/conteudo'
import { Tubo } from './ui'
import { Reveal } from './Reveal'

/**
 * O card de servico.
 *
 * No site antigo isto era um PNG achatado — titulo, icone e descricao
 * eram pixels. Aqui e texto real, com ancora propria para receber o
 * 301 da URL antiga (ver REDIRECTS.md).
 *
 * Animado em duas camadas:
 *  1. reveal na entrada, escalonado por indice
 *  2. o tubo acende no hover/foco e joga luz na superficie
 * So transform e opacity.
 *
 * RESTRICAO DURA: o tubo de um servico do estado 'festa' pode ser
 * magenta (e ambiente). O de um servico 'tecnico' e sempre branco.
 * Nenhum deles pinta o botao — botao e sempre ambar.
 */
export function CardServico({ servico, i }: { servico: Servico; i: number }) {
  const cor =
    servico.estado === 'festa' ? 'var(--color-magenta)' : 'var(--color-branco)'

  return (
    <Reveal delay={(i % 3) * 70}>
      <a
        id={servico.ancora}
        href={zap(`Oi! Quero orçamento de ${servico.nome.toLowerCase()}.`)}
        target="_blank"
        rel="noopener noreferrer"
        data-zap
        className="card group block h-full scroll-mt-24"
        style={{ ['--tubo-cor' as string]: cor }}
      >
        <Tubo cor={cor} />
        <h3 className="text-lg">{servico.nome}</h3>
        <p className="mt-3 text-xs leading-relaxed text-branco-2">{servico.desc}</p>
        <span
          className="lab mt-6 inline-flex items-center gap-2 text-ambar
                     transition-transform duration-300 group-hover:translate-x-1"
        >
          Falar no WhatsApp
          <span aria-hidden>→</span>
        </span>
      </a>
    </Reveal>
  )
}
