'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { zap } from '@/lib/conteudo'
import { Logo } from '@/components/Logo'

/**
 * A BARRA DO CELULAR E A GAVETA LATERAL.
 *
 * POR QUE GAVETA, E NÃO O PAINEL QUE CRESCIA DA PÍLULA.
 * O painel anterior descia da pílula âmbar, ancorado no canto de cima
 * à direita. Ele abria, tinha os nove itens, funcionava — e mesmo
 * assim a leitura foi "não tem menu lateral de jeito nenhum". Está
 * certo: uma caixa de 280px pendurada num canto não é o que se
 * reconhece como menu de celular. Menu de celular entra pelo lado e
 * toma a altura da tela. Isso não é preferência, é o gesto que a
 * pessoa já tem no dedo.
 *
 * E A GAVETA É UM <dialog> ABERTO COM showModal(). Isso não é
 * capricho de semântica — resolve, de uma vez, a classe inteira de
 * defeito que me perseguiu neste componente:
 *
 *  - TOP LAYER. Um dialog modal é pintado na camada de topo do
 *    navegador, ACIMA de qualquer z-index da página. Não existe mais
 *    "alguma coisa está cobrindo o menu": é estruturalmente impossível.
 *  - `inert` no resto da página, de graça e pelo navegador.
 *  - Esc fecha, sem ouvinte de teclado escrito à mão.
 *  - o foco fica contido dentro dela, sem trap improvisado.
 *  - `::backdrop` de verdade, que também é do navegador.
 *
 * A LEI QUE EU JÁ QUEBREI DUAS VEZES NESTE ARQUIVO: o menu não pode
 * depender de uma animação para EXISTIR. A gaveta aberta tem
 * `translate: 0` como estado BASE — a transição só desliza até lá. Se
 * a transição não rodar, ela aparece de uma vez, inteira. Antes a
 * altura vinha de uma animação de JS dentro de uma caixa que recortava,
 * e bastava a animação não terminar para o menu sumir com o hambúrguer
 * já virado em X.
 *
 * O QUE FICOU DO melhorias/menu.md: a pílula âmbar como gatilho, o
 * hambúrguer que vira X, e o ROLAR DE LETRA nos itens — que dispara na
 * abertura, e não no hover. No original é `onMouseEnter`; este
 * componente é `lg:hidden`, ou seja, só existe onde `mouseenter` não
 * dispara. Era código morto para 100% do público.
 *
 * ⚠️ OS ITENS SÓ EXISTEM NO DOM DEPOIS DE ABRIR — não, agora não mais:
 * a gaveta está sempre montada e o `<dialog>` fechado já esconde tudo
 * do leitor de tela. Mas a `NavDesktop` continua tendo que listar
 * TODAS as âncoras, porque ela é quem as entrega no HTML para a busca.
 */

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
          {/* ESPAÇO VIRA ` `. Cada caractere mora num
              `inline-block` próprio, e espaço normal dentro de um
              inline-block colapsa para zero — saía "15ANOS" e
              "ACASA". Espaço inquebrável tem largura de verdade. */}
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
  const gaveta = useRef<HTMLDialogElement>(null)
  const gatilho = useRef<HTMLButtonElement>(null)

  /* A MARCA NA BARRA SÓ APARECE DEPOIS DO HERO.
     No topo havia DUAS Rapa Sound na mesma tela: a da barra e a do
     hero, que é grande, centralizada e é o primeiro argumento da
     página. É o mesmo que a NavDesktop faz, e pelo mesmo motivo.
     A barra em si NÃO some: ela carrega o menu e o WhatsApp. */
  const { scrollY } = useScroll()
  const [passouHero, setPassouHero] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => {
    setPassouHero(y > window.innerHeight * 0.6)
  })

  const abrir = useCallback(() => {
    const d = gaveta.current
    if (!d || d.open) return
    d.showModal()
    setAberto(true)
  }, [])

  const fechar = useCallback(() => {
    const d = gaveta.current
    if (!d || !d.open) return
    setAberto(false)
    /* O `close()` espera a saída deslizar. `transitionend` sozinho não
       serve: se a transição não rodar — reduced motion, navegador sem
       suporte — o evento nunca chega e a gaveta ficaria aberta para
       sempre. Por isso é uma corrida entre o evento e um teto de
       tempo, e o primeiro que chegar fecha. */
    let feito = false
    const acabar = () => {
      if (feito) return
      feito = true
      d.removeEventListener('transitionend', acabar)
      if (d.open) d.close()
      gatilho.current?.focus()
    }
    d.addEventListener('transitionend', acabar)
    setTimeout(acabar, 380)
  }, [])

  /* O rolo começa DEPOIS da gaveta deslizar. Disparado junto, a letra
     tomba enquanto a caixa ainda anda e as duas coisas se anulam. */
  useEffect(() => {
    if (!aberto) { setRolar(false); return }
    const t = setTimeout(() => setRolar(true), 260)
    return () => clearTimeout(t)
  }, [aberto])

  /* Esc é do <dialog>, mas ele dispara `cancel` e fecha na hora, sem
     deixar a saída deslizar. Interceptar e chamar o nosso `fechar`
     devolve a animação — e continua sendo o Esc nativo. */
  useEffect(() => {
    const d = gaveta.current
    if (!d) return
    const onCancel = (e: Event) => { e.preventDefault(); fechar() }
    d.addEventListener('cancel', onCancel)
    return () => d.removeEventListener('cancel', onCancel)
  }, [fechar])

  return (
    <>
      {/* ══════════ A BARRA, no topo ══════════ */}
      <div className="barra-cel lg:hidden">
        <a href="#conteudo" aria-label="Rapa Sound — voltar ao topo"
           className="barra-cel__marca flex min-h-11 items-center"
           data-visivel={passouHero ? '' : undefined}
           /* `inert` e não só `opacity: 0`: invisível mas focável é o
              pior dos dois mundos — o Tab leva o foco para um link que
              ninguém vê. Booleano de verdade: no React 19 `inert=""`
              dispara aviso e é tratado como FALSE. */
           inert={!passouHero}>
          <Logo className="w-[6.5rem] text-branco" />
        </a>

        {/* O WHATSAPP MORA AQUI, e não numa segunda pílula flutuante.
            Dois elementos fixos custavam 152px num iPhone SE — 27,5%
            da tela visível, 59,6% em paisagem. Num elemento só o custo
            cai para 64px. E é o que foi pedido: a navbar do PC tem
            marca, navegação e o botão âmbar; o celular agora tem os
            três, na mesma ordem. */}
        <a href={zap('Oi! Quero um orçamento. Meu evento é:')}
           target="_blank" rel="noopener noreferrer" data-zap
           aria-label="Falar com a Rapa Sound no WhatsApp"
           className="barra-cel__zap">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.25 8.24a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.25-8.24Zm-2.5 4.02c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.4 2.14 3.4 3 .47.2.84.32 1.13.42.48.15.91.13 1.25.08.38-.06 1.17-.48 1.34-.95.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.51.64-.62.77-.12.13-.23.15-.43.05a5.4 5.4 0 0 1-1.6-.99 6.03 6.03 0 0 1-1.1-1.38c-.12-.2-.02-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.06-.13.03-.25-.02-.35-.05-.1-.44-1.07-.6-1.46-.16-.38-.32-.33-.44-.34h-.37Z" />
          </svg>
        </a>

        {/* o gatilho: a pílula âmbar do menu.md */}
        <button ref={gatilho} type="button" onClick={abrir}
                aria-expanded={aberto} aria-controls="gaveta-menu"
                className="barra-cel__pilula">
          <span aria-hidden className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-4 bg-current" />
            <span className="block h-[2px] w-4 bg-current" />
            <span className="block h-[2px] w-4 bg-current" />
          </span>
          Menu
        </button>
      </div>

      {/* ══════════ A GAVETA ══════════
          `<dialog>` modal: top layer, `inert` no resto da página, Esc e
          contenção de foco, tudo pelo navegador. */}
      <dialog ref={gaveta} id="gaveta-menu" className="gaveta lg:hidden"
              aria-label="Menu de seções"
              data-aberta={aberto ? '' : undefined}
              /* toque no fundo escuro fecha. O `::backdrop` não recebe
                 eventos: quem recebe é o próprio <dialog>, cuja caixa
                 ocupa a tela toda enquanto a gaveta ocupa só a faixa
                 lateral. Por isso o alvo é comparado com o painel. */
              onClick={(e) => { if (e.target === e.currentTarget) fechar() }}>
        <div className="gaveta__painel" data-rolar={rolar ? '' : undefined}>
          <div className="gaveta__topo">
            <Logo className="w-[6rem] text-branco" />
            <button type="button" onClick={fechar} className="gaveta__x"
                    aria-label="Fechar o menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                   strokeLinecap="round" aria-hidden className="h-5 w-5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav aria-label="Seções da página" className="gaveta__nav">
            <ul>
              {SECOES.map((s, i) => (
                <li key={s.href}>
                  <a href={s.href} onClick={fechar} className="menu-item text-branco">
                    <span className="sr-only">{s.label}</span>
                    <Rolo texto={s.label} i={i} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a href={zap('Oi! Quero um orçamento. Meu evento é:')}
             target="_blank" rel="noopener noreferrer" data-zap onClick={fechar}
             className="gaveta__zap">
            Falar no WhatsApp
            <span aria-hidden>→</span>
          </a>
        </div>
      </dialog>
    </>
  )
}
