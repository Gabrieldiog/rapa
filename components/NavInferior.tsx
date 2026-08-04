'use client'

import { useCallback, useEffect, useRef } from 'react'
import { zap } from '@/lib/conteudo'

const SECOES = [
  { href: '#quinze-anos', label: '15 anos' },
  { href: '#casamento', label: 'Casamento' },
  { href: '#servicos', label: 'Os 13 serviços' },
  { href: '#eventos', label: 'Veja como fica' },
  { href: '#rider', label: 'Rider · 116 artistas' },
  { href: '#sobre', label: 'Quase 30 anos' },
  { href: '#duvidas', label: 'Dúvidas' },
  { href: '#contato', label: 'Contato' },
]

/**
 * NAV INFERIOR — quatro alvos, no polegar.
 *
 * O botão flutuante de WhatsApp foi ABSORVIDO aqui, como quarto slot.
 * Antes ele disputava a mesma área do polegar com a nav e cobria
 * conteúdo; agora não há sobreposição nem z-index brigando.
 *
 * São 8 âncoras e uma barra comporta de 3 a 5 alvos — por isso o menu
 * continua existindo, só que como folha aberta pelo terceiro slot.
 *
 * <dialog> e não popover: popover não prende foco, não deixa o fundo
 * inert, e o light-dismiss só foi corrigido no iOS 18.3. O <dialog>
 * está sólido desde o iOS 15.4 e entrega foco preso, Esc e devolução
 * de foco de graça.
 */
export function NavInferior() {
  const ref = useRef<HTMLDialogElement>(null)

  const abrir = useCallback(() => ref.current?.showModal(), [])
  const fechar = useCallback(() => ref.current?.close(), [])

  // trava a rolagem do fundo sem pular o layout
  useEffect(() => {
    const d = ref.current
    if (!d) return
    const on = () => { document.body.style.overflow = 'hidden' }
    const off = () => { document.body.style.overflow = '' }
    d.addEventListener('close', off)
    return () => { d.removeEventListener('close', off); off(); void on }
  }, [])

  return (
    <>
      <nav aria-label="Navegação principal" className="navbar lg:hidden">
        <a href="#quinze-anos" className="navbar__alvo">15 anos</a>
        <a href="#casamento" className="navbar__alvo">Casamento</a>
        <button type="button" onClick={abrir} aria-haspopup="dialog"
                className="navbar__alvo" aria-label="Abrir menu de seções">
          <span aria-hidden className="mb-1 flex flex-col gap-[3px]">
            <span className="block h-[2px] w-4 bg-current" />
            <span className="block h-[2px] w-4 bg-current" />
            <span className="block h-[2px] w-4 bg-current" />
          </span>
          Seções
        </button>
        <a href={zap('Oi! Quero um orçamento. Meu evento é:')}
           target="_blank" rel="noopener noreferrer" data-zap
           className="navbar__alvo navbar__zap">WhatsApp</a>
      </nav>

      <dialog ref={ref} onClick={(e) => { if (e.target === ref.current) fechar() }}
              className="folha" aria-label="Seções da página">
        <div className="folha__corpo" onClick={(e) => e.stopPropagation()}>
          <div className="mb-6 flex items-center justify-between">
            <p className="lab">Ir para</p>
            <button type="button" onClick={fechar}
                    className="min-h-11 min-w-11 font-mono text-lg leading-none text-branco-2
                               hover:text-branco"
                    aria-label="Fechar menu">×</button>
          </div>
          <ul className="flex flex-col">
            {SECOES.map((s) => (
              <li key={s.href}>
                <a href={s.href} onClick={fechar}
                   className="flex min-h-14 items-center justify-between border-t border-rule
                              text-sm font-bold transition-colors hover:text-ambar">
                  {s.label}
                  <span aria-hidden className="lab text-ambar">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  )
}
