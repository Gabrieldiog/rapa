'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A EQUIPE — leque no desktop, trilho no celular. UM DOM só.
 *
 * O PROBLEMA QUE ISTO RESOLVE
 * A versão anterior era leque de GSAP em qualquer largura. Seis fotos
 * abertas em arco a 380px deixavam três à mostra e cortavam as das
 * pontas: não dava para ver a equipe inteira. E ela posicionava os cards
 * com `window.innerWidth`, mas vive dentro de uma coluna de grid MENOR
 * que a janela — sangrava para fora do container.
 *
 * Arco não cabe em telefone. Não é ajuste de número, é geometria: seis
 * cards em leque pedem largura que 380px não tem. Abaixo de 1024px vira
 * trilho, com setas, começando no primeiro. De 1024px para cima o leque
 * continua, porque lá ele cabe e é bonito.
 *
 * O GSAP SAIU, e com ele 28 KB — era o único consumidor no projeto.
 * Toda a máquina de paginação dele era CÓDIGO MORTO: são 6 cards para 7
 * posições, então `total > MAX_VISIVEL` nunca foi verdade e as setas
 * jamais renderizaram. O que sobrou de real — arco, entrada e realce no
 * hover — é `transform` e `opacity`, que o CSS faz sozinho e na
 * compositor thread.
 *
 * AS ARMADILHAS DO TRILHO, todas medidas na pesquisa:
 *
 *  - `scroll-snap-align: start` alinha pela **scroll-padding**, não pela
 *    padding. Com só `padding-inline-start` o navegador rola de volta e
 *    come exatamente o respiro criado. Os dois precisam existir, com o
 *    MESMO valor. É a causa raiz do "primeiro item cortado".
 *  - o `-1` na detecção de fim não é gambiarra: `scrollWidth` e
 *    `clientWidth` voltam arredondados para inteiro e `scrollLeft` é
 *    fracionário, então a igualdade exata nunca fecha.
 *  - `scrollend` não serve sozinho: iOS Safari só ganhou em 26.2. O
 *    estado das setas anda no `scroll` mesmo, amortecido por rAF.
 *  - `tabindex="0"` no container rolável é exigência de acessibilidade —
 *    o Safari nunca o adiciona sozinho, e sem ele não há rolagem por
 *    teclado.
 *  - nada de `role="carousel"`, que não existe na especificação. É
 *    `role="group"` com rótulo, e a `<ul>` por dentro fica sem role para
 *    não destruir a semântica de lista.
 */

export type CardEquipe = { src: string; alt: string; nome: string; papel: string }

/** As posições do arco, herdadas de melhorias/card.md. São seis porque
 *  a equipe tem seis — com total par não existe card no centro. */
const ARCO = [
  { rot: -20, esc: 0.80, x: -31,  y: 6.6, z: 1 },
  { rot: -12, esc: 0.88, x: -19,  y: 2.6, z: 2 },
  { rot: -4,  esc: 0.97, x: -6.5, y: 0.3, z: 3 },
  { rot: 4,   esc: 0.97, x: 6.5,  y: 0.3, z: 3 },
  { rot: 12,  esc: 0.88, x: 19,   y: 2.6, z: 2 },
  { rot: 20,  esc: 0.80, x: 31,   y: 6.6, z: 1 },
]

export function LequeEquipe({ cards }: { cards: CardEquipe[] }) {
  const trilho = useRef<HTMLUListElement>(null)
  const [naTela, setNaTela] = useState(false)
  const [pos, setPos] = useState({ inicio: true, fim: true })

  /* A entrada só dispara quando a seção aparece: animar o que ninguém
     está vendo é gastar quadro à toa. */
  useEffect(() => {
    const el = trilho.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setNaTela(true); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const medir = useCallback(() => {
    const el = trilho.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setPos({
      inicio: el.scrollLeft <= 1,
      fim: max <= 1 || el.scrollLeft >= max - 1,
    })
  }, [])

  useEffect(() => {
    const el = trilho.current
    if (!el) return
    let pedido = 0
    const onScroll = () => {
      if (pedido) return
      pedido = requestAnimationFrame(() => { pedido = 0; medir() })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    /* ResizeObserver e nao `resize` da janela: no desktop o leque zera a
       rolagem, e quem muda e a CAIXA — que pode mudar sem a janela
       mudar, por exemplo quando a coluna de grid troca de tamanho. */
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    medir()
    return () => {
      cancelAnimationFrame(pedido)
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [medir])

  const andar = useCallback((dir: 1 | -1) => {
    const el = trilho.current
    if (!el) return
    const item = el.querySelector<HTMLElement>('li')
    // largura do card + o vao: a seta anda um card exato, nao "uma tela"
    const passo = item ? item.getBoundingClientRect().width + 12 : el.clientWidth * 0.7
    el.scrollBy({ left: passo * dir, behavior: 'smooth' })
  }, [])

  if (!cards.length) return null
  const semRolagem = pos.inicio && pos.fim

  return (
    <div className="equipe">
      <div role="group" aria-label="A equipe da Rapa Sound">
        <ul ref={trilho} tabIndex={0}
            data-natela={naTela ? '' : undefined}
            className="equipe__trilho">
          {cards.map((c, i) => (
            <li key={c.src} className="equipe__card"
                style={{
                  ['--i' as string]: i,
                  ['--rot' as string]: `${ARCO[i]?.rot ?? 0}deg`,
                  ['--esc' as string]: ARCO[i]?.esc ?? 1,
                  ['--x' as string]: ARCO[i]?.x ?? 0,
                  ['--y' as string]: ARCO[i]?.y ?? 0,
                  ['--z' as string]: ARCO[i]?.z ?? 1,
                }}>
              <figure className="equipe__figura">
                <img src={c.src} alt={c.alt} width={380} height={548}
                     loading="lazy" decoding="async" className="equipe__foto" />
                {/* Camada âmbar em `mix-blend-mode: color` sobre a foto em
                    cinza: dá duotone quente. As fotos estavam em cinza
                    puro, que o IDENTIDADE.md proíbe — e âmbar é
                    exatamente a cor que a restrição dura manda usar perto
                    de rosto. */}
                <span aria-hidden className="equipe__tinta" />
                <figcaption className="equipe__legenda">
                  <span className="block text-sm font-bold leading-tight">{c.nome}</span>
                  <span className="lab mt-1 block">{c.papel}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      {/* As setas somem sozinhas quando não há o que rolar — que é
          exatamente o caso do leque, onde os seis já estão à vista. */}
      {!semRolagem && (
        <div className="equipe__setas">
          <button type="button" className="equipe__seta" onClick={() => andar(-1)}
                  disabled={pos.inicio} aria-label="Ver a pessoa anterior">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button type="button" className="equipe__seta" onClick={() => andar(1)}
                  disabled={pos.fim} aria-label="Ver a próxima pessoa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
