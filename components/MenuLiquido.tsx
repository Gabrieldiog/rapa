'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { zap } from '@/lib/conteudo'

/**
 * MENU LÍQUIDO — porte do `liquid-morph-floating-menu` de
 * melhorias/menu.md, vestido na direção da casa.
 *
 * O MORPH E O DO ORIGINAL: pílula que cresce, fundo âmbar, e o círculo
 * escuro subindo de baixo — 200% de lado, `bottom` de -200% a -20%.
 *
 * O ROLAR DE LETRA VOLTOU, e por um caminho diferente.
 * No original ele dispara em `onMouseEnter`. Este componente é
 * `lg:hidden`: no desktop ele não existe, e no celular `mouseenter` não
 * dispara. Era código morto para 100% do público — por isso saiu na
 * primeira versão. Agora ele dispara na ABERTURA, escalonado por item e
 * por caractere, o que funciona no toque e ainda vira entrada em vez de
 * enfeite de hover.
 *
 * O que mais mudou do original, e por quê:
 *
 *  - era uma <div> com onClick: sem teclado, sem aria-expanded, sem
 *    Esc. Agora o gatilho é <button>, fecha no Esc, devolve o foco e
 *    move o foco para o painel ao abrir;
 *  - fechava só em `mousedown`, que ignora toque. Agora é `pointerdown`;
 *  - os itens não tinham href — viraram <a> de verdade;
 *  - o rolar duplica cada caractere. Leitor de tela leria "SSEEÇÇÕÕEESS",
 *    então o visual é `aria-hidden` e o nome acessível vem de um
 *    `sr-only` ao lado;
 *  - cor e fonte estavam fixas no componente; agora vêm dos tokens.
 *
 * ⚠️ OS ITENS SÓ EXISTEM NO DOM DEPOIS DE ABRIR. Estão dentro do
 * `AnimatePresence`, então o HTML servido não os contém — sem JS este
 * menu é só um botão. Isso é aceitável porque a página é uma rolagem
 * só e tudo se alcança rolando, MAS exige que a `NavDesktop` liste
 * TODAS as âncoras: ela é quem as entrega no HTML. Foi assim que
 * `#sobre` e `#contato` ficaram sem nenhum link apontando para elas.
 *
 * A PÍLULA DE WHATSAPP SOME QUANDO O MENU ABRE. Não é capricho: a 380px
 * a soma do painel aberto com a pílula passava da largura da tela. Ela
 * volta como o último item do painel, em destaque — a conversão continua
 * a um toque, e sem estourar a linha.
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

/** Uma palavra em colunas de um caractere, cada uma com o mesmo
 *  caractere duas vezes. O rolo sobe 50% e a letra tomba sobre si. */
function Rolo({ texto, i }: { texto: string; i: number }) {
  return (
    <span aria-hidden className="rolo">
      {Array.from(texto, (ch, c) => (
        <span key={c} className="rolo__col"
              style={{ ['--c' as string]: c, ['--i' as string]: i }}>
          <span className="rolo__par">
            <span>{ch === ' ' ? ' ' : ch}</span>
            <span>{ch === ' ' ? ' ' : ch}</span>
          </span>
        </span>
      ))}
    </span>
  )
}

export function MenuLiquido() {
  const [aberto, setAberto] = useState(false)
  const [rolar, setRolar] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const gatilho = useRef<HTMLButtonElement>(null)
  const painel = useRef<HTMLDivElement>(null)

  const fechar = useCallback(() => {
    setAberto(false)
    gatilho.current?.focus()
  }, [])

  /* O rolo começa DEPOIS do morph. Disparado junto, a letra tombava
     enquanto a caixa ainda crescia e as duas coisas se anulavam. */
  useEffect(() => {
    if (!aberto) { setRolar(false); return }
    const t = setTimeout(() => setRolar(true), 340)
    return () => clearTimeout(t)
  }, [aberto])

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
    /* inset-x com folga em vez de left-1/2 + translate: a 380px a raiz
       media 393px e cortava a pilula de WhatsApp nos dois lados. */
    <div ref={raiz}
         className="fixed inset-x-3 z-[100] flex items-end justify-center gap-2.5
                    bottom-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
      {/* ---------- a pílula que morfa ---------- */}
      <motion.div
        className="relative flex flex-col overflow-hidden"
        /* initial={false}: o menu nasce pronto no HTML. Com initial
           animado ele sairia com opacity:0 e so apareceria depois da
           hidratacao. */
        initial={false}
        animate={{
          width: aberto ? 'min(17.5rem, calc(100vw - 1.5rem))' : 124,
          height: aberto ? 444 : 52,
          borderRadius: aberto ? 26 : 26,
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

        {/* ---------- as âncoras ----------
            Vêm ANTES da barra e com flex-1, entao a barra fica sempre
            no rodape da pilula — ancorada onde o dedo tocou, como no
            original. Na primeira versao a barra ficava no topo e o
            painel crescia para baixo do dedo. */}
        <AnimatePresence>
          {aberto && (
            <motion.div
              ref={painel}
              id="menu-secoes"
              data-rolar={rolar ? '' : undefined}
              className="relative z-10 flex flex-1 flex-col items-center justify-center
                         gap-3.5 overflow-hidden px-6 pt-7"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {SECOES.map((s, i) => (
                <a key={s.href} href={s.href} onClick={fechar}
                   className="menu-item text-branco">
                  <span className="sr-only">{s.label}</span>
                  <Rolo texto={s.label} i={i} />
                </a>
              ))}

              {/* O WhatsApp entra aqui porque a pilula de fora some com o
                  menu aberto. Em destaque: e a unica conversao da pagina. */}
              <a href={zap('Oi! Quero um orçamento. Meu evento é:')}
                 target="_blank" rel="noopener noreferrer" data-zap onClick={fechar}
                 className="menu-item mt-1 text-ambar">
                <span className="sr-only">Falar no WhatsApp</span>
                <Rolo texto="WhatsApp" i={SECOES.length} />
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- a barra, sempre no rodapé ---------- */}
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
      </motion.div>

      {/* ---------- WhatsApp: some quando o menu abre ----------
          A 380px o painel aberto + esta pilula passavam da largura da
          tela. Com o menu aberto ela sai e reaparece como item do
          painel; com o menu fechado ela e a conversao a um toque. */}
      <AnimatePresence>
        {!aberto && (
          <motion.a
            href={zap('Oi! Quero um orçamento. Meu evento é:')}
            target="_blank" rel="noopener noreferrer" data-zap
            aria-label="Falar com a Rapa Sound no WhatsApp"
            className="flex h-13 shrink-0 items-center rounded-[26px] border border-ambar px-4
                       font-mono text-2xs font-medium uppercase tracking-[0.14em] text-ambar
                       backdrop-blur-md"
            style={{ background: 'color-mix(in srgb, var(--color-void) 82%, transparent)' }}
            initial={false}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            whileTap={{ scale: 0.96 }}
          >
            WhatsApp
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  )
}
