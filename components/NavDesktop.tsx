'use client'

import { useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { zap } from '@/lib/conteudo'
import { Logo } from './Logo'

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
  /* `#sobre` e `#contato` faltavam aqui, e como o menu do celular so
     monta os itens ao ABRIR, as duas secoes ficavam sem NENHUM link
     apontando para elas no HTML servido. Medido: zero ocorrencias de
     href="#sobre" e href="#contato" no out/index.html. */
  { href: '#sobre', label: 'A casa' },
  { href: '#duvidas', label: 'Dúvidas' },
  { href: '#contato', label: 'Contato' },
]

export function NavDesktop() {
  const { scrollY } = useScroll()
  const [visivel, setVisivel] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setVisivel(y > window.innerHeight * 0.75)
  })

  return (
    /* `display:none` e nao `opacity:0`.
       Antes ela ia para o disco com style="opacity:0" — um fantasma
       invisivel dentro do documento, que leitor de tela e busca ainda
       enxergam. Agora, enquanto nao ha rolagem, a classe e so `hidden`:
       o elemento nao e exibido em largura nenhuma. Quando aparece,
       `lg:block` entra junto.
       NAO da para usar o atributo `hidden` aqui: `.lg\:block` e estilo
       de autor e ganha do `[hidden]` da folha do navegador. */
    <motion.nav
      aria-label="Navegação principal"
      className={`fixed inset-x-0 top-0 z-[90] ${visivel ? 'hidden lg:block' : 'hidden'}`}
      initial={false}
      animate={{ y: visivel ? 0 : -80 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="border-b border-rule backdrop-blur-xl"
           style={{ background: 'color-mix(in srgb, var(--color-void) 82%, transparent)' }}>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-8">
          {/* a marca, nao o nome escrito em serif. O SVG carrega o VU
              meter, que e o detalhe que a pagina inteira desenvolve. */}
          <a href="#conteudo" aria-label="Rapa Sound — ir para o topo"
             className="block shrink-0 text-branco transition-opacity duration-200
                        hover:opacity-80">
            {/* h-9 e nao h-7: o logo tem tres andares (wordmark, "Sound"
                e a forma de onda). A 28px de altura total o "Sound"
                ficava com ~5px e virava borrao. */}
            <Logo className="h-9 w-auto" />
          </a>

          {/* gap-5 no lg: com os dois itens novos a fileira passa de 8, e
              a 1024px a soma de logo + itens + botao estourava a largura
              util. gap-7 volta a partir de 1280px, onde sobra espaco. */}
          <ul className="ml-auto flex items-center gap-5 xl:gap-7">
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
