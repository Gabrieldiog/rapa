'use client'

import { useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { zap } from '@/lib/conteudo'

/**
 * NAV DESKTOP — o par do MenuLiquido, que é lg:hidden.
 * Sem ela, acima de 1024px a página não tinha navegação nenhuma.
 *
 * Só aparece depois do hero: no topo ela competiria com o H1, que é
 * candidato a LCP e é o argumento da página.
 *
 * Fica escura sempre, inclusive sobre o estado técnico (fundo branco) —
 * uma barra que troca de cor no meio da rolagem chama atenção para si
 * mesma, e ela não é o assunto.
 */

const ANCORAS = [
  { href: '#quinze-anos', label: '15 anos' },
  { href: '#casamento', label: 'Casamento' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#eventos', label: 'Vídeos' },
  { href: '#rider', label: 'Rider' },
  { href: '#duvidas', label: 'Dúvidas' },
]

export function NavDesktop() {
  const { scrollY } = useScroll()
  const [visivel, setVisivel] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setVisivel(y > window.innerHeight * 0.75)
  })

  return (
    <motion.nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 top-0 z-[90] hidden lg:block"
      initial={false}
      animate={{ y: visivel ? 0 : -80, opacity: visivel ? 1 : 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: visivel ? 'auto' : 'none' }}
    >
      <div className="border-b border-rule backdrop-blur-xl"
           style={{ background: 'color-mix(in srgb, var(--color-void) 82%, transparent)' }}>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-8">
          <a href="#conteudo"
             className="font-[family-name:var(--font-display)] text-base leading-none
                        text-branco">
            Rapa Sound
          </a>

          <ul className="ml-auto flex items-center gap-7">
            {ANCORAS.map((a) => (
              <li key={a.href}>
                <a href={a.href}
                   className="lab transition-colors duration-200 hover:text-branco">
                  {a.label}
                </a>
              </li>
            ))}
          </ul>

          <a href={zap('Oi! Quero um orçamento. Meu evento é:')}
             target="_blank" rel="noopener noreferrer" data-zap
             className="flex h-10 items-center rounded-[var(--radius-botao)] bg-ambar px-5
                        font-mono text-2xs font-medium uppercase tracking-[0.12em] text-void
                        transition-transform duration-200 hover:-translate-y-0.5">
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </motion.nav>
  )
}
