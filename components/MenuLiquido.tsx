'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { zap } from '@/lib/conteudo'

/**
 * MENU LÍQUIDO — adaptado de melhorias/menu.md.
 *
 * A pílula morfa em painel, com o círculo escuro subindo de baixo e o
 * rolar de letra por caractere no hover. Vestido na direção TUBO.
 *
 * O que corrigi do original:
 *  - era uma <div> com onClick: sem teclado, sem aria-expanded, sem Esc.
 *    Agora o gatilho é <button>, fecha no Esc, devolve o foco e move o
 *    foco para o painel ao abrir;
 *  - fechava só em `mousedown`, o que ignora toque. Agora é `pointerdown`;
 *  - os itens não tinham href — viraram <a> de verdade, para funcionar
 *    sem JS e para o Google seguir as âncoras;
 *  - cor e fonte estavam fixas no componente; agora vêm dos tokens.
 *
 * O WhatsApp fica FORA do morph, sempre visível: é a única conversão da
 * página e não pode depender de abrir menu.
 */

const ease = [0.22, 1, 0.36, 1] as const

const SECOES = [
  { href: '#quinze-anos', label: '15 anos' },
  { href: '#casamento', label: 'Casamento' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#eventos', label: 'Vídeos' },
  { href: '#rider', label: 'Rider' },
  { href: '#sobre', label: 'A casa' },
  { href: '#duvidas', label: 'Dúvidas' },
  { href: '#contato', label: 'Contato' },
]

/** Rolar de letra: cada caractere sobe e o clone toma o lugar. */
function Rolar({ texto }: { texto: string }) {
  const [sobre, setSobre] = useState(false)
  const chars = [...texto]
  return (
    <span className="inline-flex" onMouseEnter={() => setSobre(true)}
          onMouseLeave={() => setSobre(false)}>
      {chars.map((c, i) => (
        <span key={i} className="inline-block overflow-hidden" style={{ height: '1em' }}>
          <span className="flex flex-col"
                style={{
                  transitionProperty: 'transform',
                  transitionDuration: sobre ? '760ms' : '0ms',
                  transitionDelay: sobre ? `${28 * i}ms` : '0ms',
                  transform: sobre ? 'translateY(-50%)' : 'translateY(0%)',
                  transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
                }}>
            <span className="block" style={{ height: '1em', lineHeight: '1em' }}>
              {c === ' ' ? ' ' : c}
            </span>
            <span className="block" aria-hidden style={{ height: '1em', lineHeight: '1em' }}>
              {c === ' ' ? ' ' : c}
            </span>
          </span>
        </span>
      ))}
    </span>
  )
}

export function MenuLiquido() {
  const [aberto, setAberto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const gatilho = useRef<HTMLButtonElement>(null)
  const painel = useRef<HTMLDivElement>(null)

  const fechar = useCallback(() => {
    setAberto(false)
    gatilho.current?.focus()
  }, [])

  // Esc fecha e o foco volta para o gatilho
  useEffect(() => {
    if (!aberto) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar() }
    // pointerdown cobre toque, o mousedown do original nao cobria
    const onFora = (e: PointerEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onFora)
    painel.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onFora)
    }
  }, [aberto, fechar])

  return (
    <div ref={raiz}
         className="fixed left-1/2 z-[100] flex -translate-x-1/2 items-end gap-3
                    bottom-[max(1.25rem,env(safe-area-inset-bottom))] lg:hidden">
      {/* ---------- a pílula que morfa ---------- */}
      <motion.div
        className="relative flex flex-col overflow-hidden"
        /* initial={false}: o menu nasce pronto no HTML. Com initial
           animado ele sairia com opacity:0 e so apareceria depois da
           hidratacao. */
        initial={false}
        animate={{
          width: aberto ? 268 : 132,
          height: aberto ? 316 : 52,
          borderRadius: aberto ? 24 : 26,
        }}
        transition={{ duration: 0.8, ease,
                      height: { duration: aberto ? 0.8 : 0.15 } }}
      >
        {/* fundo âmbar */}
        <span aria-hidden className="absolute inset-0 rounded-[inherit] bg-ambar" />

        {/* o círculo escuro subindo de baixo — o "liquid" do morph */}
        <motion.span
          aria-hidden
          className="absolute left-1/2 rounded-full bg-void"
          style={{ width: '220%', aspectRatio: '1', x: '-50%' }}
          animate={{ y: aberto ? '-12%' : '100%' }}
          transition={{ duration: aberto ? 0.8 : 0.5, ease }}
        />

        {/* fechado: o rótulo */}
        <button
          ref={gatilho}
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu-secoes"
          className="relative z-10 flex h-13 shrink-0 items-center justify-center gap-2.5
                     px-6 font-mono text-2xs font-medium uppercase tracking-[0.14em]"
          style={{ color: aberto ? 'var(--color-branco)' : 'var(--color-void)' }}
        >
          <span aria-hidden className="flex flex-col gap-[3px]">
            <motion.span className="block h-[2px] w-4 bg-current"
                         animate={{ rotate: aberto ? 45 : 0, y: aberto ? 5 : 0 }}
                         transition={{ duration: 0.4, ease }} />
            <motion.span className="block h-[2px] w-4 bg-current"
                         animate={{ opacity: aberto ? 0 : 1 }}
                         transition={{ duration: 0.2 }} />
            <motion.span className="block h-[2px] w-4 bg-current"
                         animate={{ rotate: aberto ? -45 : 0, y: aberto ? -5 : 0 }}
                         transition={{ duration: 0.4, ease }} />
          </span>
          {aberto ? 'Fechar' : 'Seções'}
        </button>

        {/* aberto: as âncoras */}
        <AnimatePresence>
          {aberto && (
            <motion.div
              ref={painel}
              id="menu-secoes"
              className="relative z-10 flex flex-col gap-0.5 px-6 pb-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              {SECOES.map((s, i) => (
                <motion.a
                  key={s.href} href={s.href} onClick={fechar}
                  className="flex h-[30px] items-center overflow-hidden text-branco
                             font-[family-name:var(--font-display)] text-base leading-none"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.045, ease }}
                >
                  <Rolar texto={s.label} />
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ---------- WhatsApp: fora do morph, sempre alcançável ---------- */}
      <motion.a
        href={zap('Oi! Quero um orçamento. Meu evento é:')}
        target="_blank" rel="noopener noreferrer" data-zap
        aria-label="Falar com a Rapa Sound no WhatsApp"
        className="flex h-13 items-center rounded-[26px] border border-ambar px-5
                   font-mono text-2xs font-medium uppercase tracking-[0.14em] text-ambar
                   backdrop-blur-md"
        style={{ background: 'color-mix(in srgb, var(--color-void) 82%, transparent)' }}
        initial={false}
        whileTap={{ scale: 0.96 }}
      >
        WhatsApp
      </motion.a>
    </div>
  )
}
