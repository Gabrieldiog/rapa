'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { zap } from '@/lib/conteudo'
import { Logo } from '@/components/Logo'

/**
 * A BARRA DO CELULAR — porte do `liquid-morph-floating-menu` de
 * melhorias/menu.md, vestido na direção da casa.
 *
 * ELA SUBIU PARA O TOPO. A queixa foi literal: "não tem nenhum botão
 * hambúrguer, no modo PC temos a navbar, por que no mobile não temos".
 * O menu EXISTIA — era uma pílula flutuante no rodapé — e é justamente
 * esse o problema: no rodapé ele não é lido como navegação, e no print
 * que o cliente mandou ele nem aparecia, porque o recorte da tela
 * cortava antes. Navegação onde o PC tem navegação: no topo, com a
 * marca à esquerda e o hambúrguer à direita.
 *
 * O QUE FICOU NO RODAPÉ é o WhatsApp, sozinho. Não é sobra: é a única
 * conversão da página, e o rodapé é a zona que o polegar alcança sem
 * reposicionar o aparelho. Navegação em cima, conversão embaixo — cada
 * uma onde o gesto correspondente é mais barato.
 *
 * O MORPH É O DO ORIGINAL, com uma inversão de sinal: o círculo escuro
 * entra POR CIMA (`y: -200% → -12%`) em vez de subir de baixo, porque
 * o painel agora cresce para baixo e o preenchimento tem que seguir a
 * direção do crescimento. Fora isso, mesma pílula que cresce, mesmo
 * fundo âmbar, mesma curva.
 *
 * O ROLAR DE LETRA dispara na ABERTURA, e não no hover. No original é
 * `onMouseEnter`; este componente é `lg:hidden`, ou seja, só existe
 * onde `mouseenter` não dispara — era código morto para 100% do
 * público. Escalonado por item e por caractere, ele funciona no toque
 * e vira entrada em vez de enfeite de hover.
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

  /* A MARCA NA BARRA SÓ APARECE DEPOIS DO HERO.
     No topo havia DUAS Rapa Sound na mesma tela: a da barra e a do
     hero, que é grande e centralizada e é o primeiro argumento da
     página. Repetir a marca 40px acima dela não informa nada — só
     divide a atenção e faz parecer erro.
     É exatamente o que a NavDesktop já faz, e pelo mesmo motivo: no
     topo ela competiria com o que a página tem de mais forte.
     A barra em si NÃO some: ela carrega o menu e o WhatsApp, que
     precisam estar alcançáveis o tempo todo. Some só a marca. */
  const { scrollY } = useScroll()
  const [passouHero, setPassouHero] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => {
    setPassouHero(y > window.innerHeight * 0.6)
  })

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
    /* Fechar clicando fora TEM que devolver o foco. Sem isto o foco
       cai no <body> e a próxima tecla Tab recomeça do topo do
       documento — é o critério 2.4.3 (Focus Order, nível A). */
    const onFora = (e: PointerEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) fechar()
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
    <>
      {/* ══════════ A BARRA, no topo ══════════ */}
      <div ref={raiz} className="barra-cel lg:hidden">
        <a href="#conteudo" aria-label="Rapa Sound — voltar ao topo"
           className="barra-cel__marca flex min-h-11 items-center"
           data-visivel={passouHero ? '' : undefined}
           /* `inert` e não só `opacity: 0`: invisível mas focável é o
              pior dos dois mundos — o Tab leva o foco para um link que
              ninguém vê.
              Booleano de verdade, não string vazia: no React 19 `inert`
              é prop booleana nativa, e `inert=""` dispara
              "Received an empty string for a boolean attribute" e é
              tratado como FALSE — ou seja, silenciosamente não inertiza
              nada. */
           inert={!passouHero}>
          <Logo className="w-[6.5rem] text-branco" />
        </a>

        {/* O WHATSAPP MORA AQUI, e não numa segunda pílula flutuante.
            Dois elementos fixos custavam 152px num iPhone SE — 27,5%
            da tela visível, e 59,6% em paisagem. A técnica C34 da WCAG
            manda soltar o `fixed` em viewport curta justamente por
            isso, e o critério 1.4.10 exige que a página funcione com
            256px de ALTURA, onde 152px de barra não deixam nada.
            Num elemento só o custo cai para 64px, 11,6%.
            E é literalmente o que foi pedido: a navbar do PC tem marca,
            navegação e o botão âmbar de WhatsApp. Agora o celular tem
            os três, na mesma ordem. */}
        <AnimatePresence>
          {!aberto && (
            <motion.a
              href={zap('Oi! Quero um orçamento. Meu evento é:')}
              target="_blank" rel="noopener noreferrer" data-zap
              aria-label="Falar com a Rapa Sound no WhatsApp"
              className="barra-cel__zap"
              initial={false}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              whileTap={{ scale: 0.94 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden
                   className="h-5 w-5">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.25 8.24a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.25-8.24Zm-2.5 4.02c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.4 2.14 3.4 3 .47.2.84.32 1.13.42.48.15.91.13 1.25.08.38-.06 1.17-.48 1.34-.95.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.51.64-.62.77-.12.13-.23.15-.43.05a5.4 5.4 0 0 1-1.6-.99 6.03 6.03 0 0 1-1.1-1.38c-.12-.2-.02-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.06-.13.03-.25-.02-.35-.05-.1-.44-1.07-.6-1.46-.16-.38-.32-.33-.44-.34h-.37Z" />
              </svg>
            </motion.a>
          )}
        </AnimatePresence>

        {/* A pílula é ABSOLUTA dentro da barra: crescendo, ela não pode
            empurrar a marca nem esticar a altura da barra. */}
        {/* A ALTURA SAIU DO JAVASCRIPT E FOI PARA O CSS, e isso é o
            conserto do "o menu não aparece de jeito nenhum".

            Antes a altura era `animate={{ height: aberto ? 452 : 44 }}`.
            O painel vive DENTRO desta caixa, que tem `overflow: hidden`
            — então a visibilidade dos nove itens dependia de uma
            animação de JavaScript chegar ao fim. Qualquer coisa que
            interrompesse essa animação (aba em segundo plano, service
            worker servindo bundle velho, quadro perdido no meio do
            morph) deixava a caixa em 44px com o painel inteiro
            recortado: o hambúrguer virava X, aparecia "Fechar", e nada
            mais — que é exatamente a descrição do defeito.

            Agora quem abre é o CSS, por `data-aberto`. Basta o React
            trocar o atributo — o mesmo que já troca o `aria-expanded`.
            Se a animação não rodar, a caixa simplesmente salta para a
            altura certa e os itens aparecem. O morph continua, mas
            deixou de ser condição para o menu funcionar. */}
        <motion.div
          data-aberto={aberto ? '' : undefined}
          className="barra-cel__pilula flex flex-col overflow-hidden"
          /* initial={false}: o menu nasce pronto no HTML. Com initial
             animado ele sairia com opacity:0 e so apareceria depois da
             hidratacao. */
          initial={false}
          animate={{ width: aberto ? 'min(17.5rem, calc(100vw - 1.5rem))' : 124 }}
          transition={{ duration: 0.8, ease }}
        >
          {/* fundo âmbar */}
          <span aria-hidden className="absolute inset-0 rounded-[inherit] bg-ambar" />

          {/* O CÍRCULO ESCURO — o "liquid" do morph. Ele desce DE CIMA
              agora: o painel cresce para baixo, e preenchimento que
              vem do lado contrário ao crescimento lê como erro. */}
          <motion.span
            aria-hidden
            className="absolute left-1/2 rounded-full bg-void"
            /* O `y` VAI NO STYLE, e não só no `animate`. Sem valor
               inicial declarado, o motion lê a posição atual do DOM —
               que é 0 — e o círculo escuro nasce COBRINDO a pílula
               âmbar no HTML servido, com o texto "Menu" em cor escura
               por cima dele. Fica um retângulo preto vazio até a
               hidratação animar para fora. */
            style={{ width: '220%', aspectRatio: '1', x: '-50%', y: '-200%' }}
            animate={{ y: aberto ? '-12%' : '-200%' }}
            transition={{ duration: aberto ? 0.8 : 0.5, ease }}
          />

          {/* ---------- a barra, sempre no TOPO da pílula ----------
              Vem ANTES das âncoras, ao contrário do original: lá o
              painel crescia para cima a partir do rodapé, aqui ele
              cresce para baixo a partir do topo. A barra fica ancorada
              onde o dedo tocou nos dois casos. */}
          <button
            ref={gatilho}
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="menu-secoes"
            className="relative z-10 flex h-11 shrink-0 items-center justify-center gap-2.5
                       px-5 font-mono text-2xs font-medium uppercase tracking-[0.14em]"
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
            {aberto ? 'Fechar' : 'Menu'}
          </button>

          {/* ---------- as âncoras ----------
              `<nav>` com `<ul>`, e não um punhado de `<a>` soltos: é
              navegação, e leitor de tela anuncia "lista de 9 itens".
              `overflow-y: auto` no painel porque a altura da pílula é
              px cravado e a caixa tem `overflow: hidden`: com o texto
              do navegador em 200% (critério 1.4.4, nível AA) os nove
              itens passam de 670px numa caixa de 452 e os últimos
              ficavam cortados e inalcançáveis. O CSS ainda limita a
              altura ao que cabe na tela. */}
          <AnimatePresence>
            {aberto && (
              <motion.nav
                ref={painel}
                id="menu-secoes"
                aria-label="Seções da página"
                data-rolar={rolar ? '' : undefined}
                className="menu-painel"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <ul className="flex flex-col items-center gap-3.5">
                  {SECOES.map((s, i) => (
                    <li key={s.href}>
                      <a href={s.href} onClick={fechar} className="menu-item text-branco">
                        <span className="sr-only">{s.label}</span>
                        <Rolo texto={s.label} i={i} />
                      </a>
                    </li>
                  ))}
                  <li className="mt-1">
                    <a href={zap('Oi! Quero um orçamento. Meu evento é:')}
                       target="_blank" rel="noopener noreferrer" data-zap onClick={fechar}
                       className="menu-item text-ambar">
                      <span className="sr-only">Falar no WhatsApp</span>
                      <Rolo texto="WhatsApp" i={SECOES.length} />
                    </a>
                  </li>
                </ul>
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  )
}
