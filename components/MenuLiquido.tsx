'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { zap } from '@/lib/conteudo'

/**
 * O MENU DO CELULAR — o `liquid-morph-floating-menu` de
 * melhorias/menu.md, e nada além dele.
 *
 * NÃO HÁ BARRA. Tentei duas: primeiro um painel que descia de uma
 * pílula presa no canto de cima, depois uma gaveta lateral, as duas
 * penduradas numa faixa preta fixa no topo. A leitura foi direta e
 * está certa — "no mobile não faz sentido ter uma barra preta".
 * Não faz mesmo: a faixa come 64px de altura o tempo todo, repete a
 * marca que já está no hero, e existe só para segurar um botão.
 * O menu.md nunca teve barra. Ele é uma pílula que flutua e cresce.
 *
 * O MORPH É O DO ARQUIVO: pílula âmbar de 150×48 que vira um painel,
 * com o círculo escuro subindo de baixo (200% de lado, `bottom` de
 * −200% a −20%), o rótulo e o hambúrguer ancorados no rodapé dela, e o
 * rolar de letra em cada item.
 *
 * O QUE MUDA DO ORIGINAL, E POR QUÊ:
 *
 *  - É UM <dialog> ABERTO COM showModal(). Não é preciosismo: um
 *    dialog modal é pintado na TOP LAYER do navegador, acima de
 *    qualquer z-index da página. Depois de três rodadas de "o menu não
 *    aparece", eu não vou mais depender de empilhamento. Vem junto, de
 *    graça: o resto da página fica inerte, Esc fecha, o foco fica
 *    contido e o `::backdrop` é do navegador.
 *  - O TAMANHO ABERTO É O ESTADO BASE, e a animação SUBTRAI. O painel
 *    nasce grande no CSS; `data-entrando` o encolhe por um quadro e
 *    sair dele é o que produz o morph. Se a transição não rodar, ele
 *    aparece aberto. Já quebrei essa lei duas vezes neste arquivo: a
 *    altura vinha de uma animação de JS dentro de uma caixa que
 *    recortava, e bastava a animação não terminar para o menu sumir
 *    com o hambúrguer já virado em X.
 *  - o original é uma <div> com onClick: sem teclado, sem
 *    aria-expanded, sem Esc. O gatilho aqui é <button>.
 *  - os itens não tinham href — viraram <a> de verdade, dentro de
 *    <nav> com <ul>.
 *  - o rolar duplica cada caractere. Leitor de tela leria
 *    "SSEEÇÇÕÕEESS", então o visual é `aria-hidden` e o nome acessível
 *    vem de um `sr-only` ao lado.
 *  - o rolar dispara na ABERTURA, não no hover: este componente é
 *    `lg:hidden`, ou seja, só existe onde `mouseenter` nunca dispara.
 *    Era código morto para 100% do público.
 *  - cor e fonte estavam fixas no componente; agora vêm dos tokens.
 *
 * ⚠️ A `NavDesktop` precisa listar TODAS as âncoras: ela é quem as
 * entrega no HTML para a busca. Foi assim que `#sobre` e `#contato`
 * ficaram sem nenhum link apontando para elas.
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
          {/* ESPAÇO VIRA ` `. Cada caractere mora num
              `inline-block` próprio, e espaço normal dentro de um
              inline-block colapsa para zero — saía "15ANOS", "ACASA". */}
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
  /* um quadro encolhido, só para o morph ter de onde crescer */
  const [entrando, setEntrando] = useState(false)
  const [rolar, setRolar] = useState(false)
  const cx = useRef<HTMLDialogElement>(null)
  const gatilho = useRef<HTMLButtonElement>(null)

  const abrir = useCallback(() => {
    const d = cx.current
    if (!d || d.open) return
    setEntrando(true)
    d.showModal()
    setAberto(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setEntrando(false)))
  }, [])

  const fechar = useCallback(() => {
    const d = cx.current
    if (!d || !d.open) return
    setAberto(false)
    setEntrando(true)
    /* `close()` espera o morph encolher. `transitionend` sozinho não
       serve: sem transição o evento nunca chega e o menu ficaria aberto
       para sempre. É uma corrida com um teto de tempo. */
    let feito = false
    const acabar = () => {
      if (feito) return
      feito = true
      d.removeEventListener('transitionend', acabar)
      if (d.open) d.close()
      setEntrando(false)
      gatilho.current?.focus()
    }
    d.addEventListener('transitionend', acabar)
    setTimeout(acabar, 420)
  }, [])

  /* O rolo começa DEPOIS do morph. Disparado junto, a letra tomba
     enquanto a caixa ainda cresce e as duas coisas se anulam. */
  useEffect(() => {
    if (!aberto) { setRolar(false); return }
    const t = setTimeout(() => setRolar(true), 320)
    return () => clearTimeout(t)
  }, [aberto])

  /* Esc é do <dialog>, mas ele fecha na hora, sem deixar o morph
     encolher. Interceptar `cancel` devolve a animação — e continua
     sendo o Esc nativo. */
  useEffect(() => {
    const d = cx.current
    if (!d) return
    const onCancel = (e: Event) => { e.preventDefault(); fechar() }
    d.addEventListener('cancel', onCancel)
    return () => d.removeEventListener('cancel', onCancel)
  }, [fechar])

  return (
    <>
      {/* ---------- fechado: a pílula e o WhatsApp, flutuando ---------- */}
      <div className="flutua lg:hidden" data-oculto={aberto ? '' : undefined}>
        <button ref={gatilho} type="button" onClick={abrir}
                aria-expanded={aberto} aria-controls="menu-secoes"
                className="flutua__pilula">
          <span aria-hidden className="flutua__risco">
            <span /><span /><span />
          </span>
          Seções
        </button>

        <a href={zap('Oi! Quero um orçamento. Meu evento é:')}
           target="_blank" rel="noopener noreferrer" data-zap
           className="flutua__zap">
          WhatsApp
        </a>
      </div>

      {/* ---------- aberto: o mesmo lugar, crescido ----------
          <dialog> modal: top layer, resto da página inerte, Esc e foco
          contido pelo navegador. Depois de três rodadas de "o menu não
          aparece", nada aqui depende de z-index. */}
      <dialog ref={cx} id="menu-secoes" className="morf lg:hidden"
              aria-label="Seções da página"
              data-aberto={aberto ? '' : undefined}
              onClick={(e) => { if (e.target === e.currentTarget) fechar() }}>
        <div className="morf__caixa" data-entrando={entrando ? '' : undefined}>
          {/* o fundo âmbar */}
          <span aria-hidden className="morf__ambar" />
          {/* o círculo escuro subindo de baixo — o "liquid" do morph */}
          <span aria-hidden className="morf__circulo" />

          <nav aria-label="Seções" className="morf__nav"
               data-rolar={rolar ? '' : undefined}>
            <ul>
              {SECOES.map((s, i) => (
                <li key={s.href}>
                  <a href={s.href} onClick={fechar} className="menu-item text-branco">
                    <span className="sr-only">{s.label}</span>
                    <Rolo texto={s.label} i={i} />
                  </a>
                </li>
              ))}
              <li>
                <a href={zap('Oi! Quero um orçamento. Meu evento é:')}
                   target="_blank" rel="noopener noreferrer" data-zap onClick={fechar}
                   className="menu-item text-ambar">
                  <span className="sr-only">Falar no WhatsApp</span>
                  <Rolo texto="WhatsApp" i={SECOES.length} />
                </a>
              </li>
            </ul>
          </nav>

          {/* o rodapé da pílula: rótulo e hambúrguer, ancorados onde o
              dedo tocou — como no original */}
          <button type="button" onClick={fechar} className="morf__rodape">
            <span aria-hidden className="flutua__risco" data-x>
              <span /><span /><span />
            </span>
            Fechar
          </button>
        </div>
      </dialog>
    </>
  )
}
