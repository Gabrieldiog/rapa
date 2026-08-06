'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A EQUIPE — leque no desktop, trilho no celular. UM DOM só.
 *
 * O LEQUE AGORA É O DO melhorias/card.md, e não uma lembrança dele.
 * A primeira versão copiou só as POSIÇÕES de repouso e jogou fora o
 * que faz o componente funcionar: o leque do card.md não é um arranjo,
 * é uma REAÇÃO. Ao pousar o mouse num card, ele sobe e cresce e todos
 * os outros se afastam — e é nesse afastamento que os nomes, que no
 * repouso ficam escondidos atrás do vizinho, aparecem. Sem isso sobra
 * um monte de card empilhado, que foi exatamente a leitura do cliente.
 *
 * O QUE VEIO LITERAL DO ARQUIVO (as fórmulas, não uma aproximação):
 *
 *   repouso   rot   = d · 21             d = (slot − centro)/centro
 *             esc   = 1 − 0,2244 · d²
 *             x     = d · 30
 *             y     = d² · 7,3
 *   hover     no card apontado:  y −= 2,5 · esc ×= 1,08
 *             nos outros:  forca = 8 · (1 − |norm|) · (1 + 0,2 · max(0, 3 − dist))
 *                          x ∓= forca · rot ∓= 3/(dist + 1)
 *   atraso    dist · 20 ms, contado a partir do card apontado
 *
 * UMA CORREÇÃO DE UM CARACTERE, e ela importa. O arquivo calcula
 * `centro = total >> 1`, que para 6 cards dá 3 — um índice de card, e
 * não o meio de seis. O leque saía torto: x de −30 a +20, com o
 * quarto card no eixo. Aqui `centro = (total − 1)/2` dá 2,5 e o leque
 * fecha simétrico. As fórmulas são as mesmas; só o divisor está certo.
 *
 * O GSAP NÃO VOLTOU. A elástica dele virou `linear()` no CSS:
 * `elastic.out(a,p)` é a·2^(−10t)·sin((t−s)·2π/p)+1, amostrada em 36
 * pontos — erro máximo de 0,4%, invisível. Quem anima é `transform`,
 * uma propriedade só, na compositor thread. O JS aqui só escreve
 * quatro números por card quando o ponteiro entra ou sai.
 *
 * OS NOMES. No repouso os cards se cobrem, e a legenda sumia atrás do
 * vizinho — "Dagm...", "Daniel..." cortados. A ordem de empilhamento
 * cresce em direção ao centro, então quem está à ESQUERDA é coberto
 * pela direita e vice-versa: a tira visível de cada card é a metade
 * de fora. Por isso a legenda alinha para fora (`data-lado`), e cai
 * dentro da tira. Ao apontar, o card sobe para o topo da pilha e a
 * legenda volta a ocupar a largura toda.
 *
 * NO CELULAR NADA DISSO EXISTE: arco não cabe em 380px. Abaixo de
 * 1024px é trilho com encaixe, setas centralizadas e pontos.
 *
 * AS ARMADILHAS DO TRILHO, todas medidas:
 *  - `scroll-snap-align: start` alinha pela **scroll-padding**, não
 *    pela padding. Só com `padding-inline-start` o navegador rola de
 *    volta e come o respiro. É a causa raiz do "primeiro item cortado".
 *  - o `-1` na detecção de fim não é gambiarra: `scrollWidth` e
 *    `clientWidth` voltam arredondados e `scrollLeft` é fracionário.
 *  - `scrollend` não serve sozinho: iOS Safari só ganhou em 26.2.
 *  - `tabindex="0"` no container rolável é exigência de acessibilidade
 *    — o Safari nunca o adiciona sozinho.
 *  - nada de `role="carousel"`, que não existe na especificação.
 */

export type CardEquipe = { src: string; alt: string; nome: string; papel: string }

/** As posições de repouso do card.md, com o centro corrigido para o
 *  meio de verdade. Devolve unidades — quem as converte em pixel é o
 *  CSS, com `cqi`, para o leque medir a CAIXA e não a janela. */
function repouso(total: number, slot: number) {
  const centro = (total - 1) / 2
  const d = centro > 0 ? (slot - centro) / centro : 0
  const ad = Math.abs(d)
  return {
    rot: d * 21,
    esc: 1 - 0.2244 * ad * ad,
    x: d * 30,
    y: ad * ad * 7.3,
    z: Math.round(10 - Math.abs(slot - centro)),
  }
}

/** O layout com um card apontado. `apontado === null` é o repouso. */
function comHover(total: number, slot: number, apontado: number | null) {
  const centro = (total - 1) / 2
  const base = repouso(total, slot)

  if (apontado === null) {
    return { ...base, atraso: Math.abs(slot - centro) * 20 }
  }

  const dist = Math.abs(slot - apontado)
  const atraso = dist * 20

  // o card apontado: sobe e cresce
  if (slot === apontado) {
    return { ...base, y: base.y - 2.5, esc: base.esc * 1.08, atraso }
  }

  /* os outros: empurrados para fora. A força é máxima no MEIO do leque
     e ZERO nas pontas — `1 − |norm|` zera quando norm = ±1. Por isso as
     pontas ficam ancoradas e quem abre é o miolo. */
  const norm = centro > 0 ? (slot - centro) / centro : 0
  const forca = 8 * (1 - Math.abs(norm)) * (1 + 0.2 * Math.max(0, 3 - dist))
  const paraEsquerda = slot < apontado

  let { x, rot, y } = base
  x += paraEsquerda ? -forca : forca
  rot += (paraEsquerda ? -3 : 3) / (dist + 1)
  // as pontas sobem um pouco quando o hover vem do lado oposto: sem
  // isto o leque parece cair para um lado só
  if (slot === total - 1 && apontado < centro) y -= 1
  if (slot === 0 && apontado > centro) y -= 1

  return { ...base, x, rot, y, atraso }
}

export function LequeEquipe({ cards }: { cards: CardEquipe[] }) {
  const trilho = useRef<HTMLUListElement>(null)
  const [naTela, setNaTela] = useState(false)
  const [pos, setPos] = useState({ inicio: true, fim: true, atual: 0 })
  const [apontado, setApontado] = useState<number | null>(null)
  /* a entrada dura 1,2 s + escalonamento. Enquanto ela roda, hover é
     ignorado — é o `isAnimating` do card.md. Sem ele o `transform` da
     animação e o da transição brigam e o card salta. */
  const [entrou, setEntrou] = useState(false)

  /* O HTML NASCE NO ESTADO FINAL, e a animação SUBTRAI.
     A versão anterior deixava `.equipe__card { opacity: 0 }` na folha
     e só devolvia a opacidade quando o observer marcava `data-natela`.
     Se o JS não roda — falha de rede no chunk, erro de hidratação,
     navegador antigo — a equipe inteira fica invisível para sempre.
     É defeito de CONTEÚDO disfarçado de defeito de animação, e já
     aconteceu neste projeto com os cards de serviço.
     `armado` só existe depois que este componente montou. Sem JS ele
     nunca aparece, a regra que esconde nunca casa, e os seis ficam
     visíveis — sem a entrada, que é o que se pode perder. */
  const [armado, setArmado] = useState(false)

  const total = cards.length

  /* A entrada só dispara quando a seção aparece: animar o que ninguém
     está vendo é gastar quadro à toa. */
  useEffect(() => {
    const el = trilho.current
    if (!el) return
    setArmado(true)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setNaTela(true); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
    /* PISO DE SEGURANÇA. `armado` esconde os cards contando que o
       observer vá devolvê-los. Se por qualquer motivo ele não falar —
       e num Chrome headless com relógio virtual ele realmente não fala
       — a equipe fica invisível para sempre. Três segundos é tempo de
       sobra para o caso normal (a seção está a 10.000px do topo e o
       observer dispara muito antes de alguém chegar lá); quando não é,
       o pior que acontece é a entrada rodar sem plateia. */
    const piso = setTimeout(() => setNaTela(true), 3000)
    return () => { io.disconnect(); clearTimeout(piso) }
  }, [])

  useEffect(() => {
    if (!naTela) return
    // 200ms de atraso + (total−1)·60 de escalonamento + 1200 de duração
    const t = setTimeout(() => setEntrou(true), 200 + (total - 1) * 60 + 1200)
    return () => clearTimeout(t)
  }, [naTela, total])

  const medir = useCallback(() => {
    const el = trilho.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const item = el.querySelector<HTMLElement>('li')
    const passo = item ? item.getBoundingClientRect().width + 12 : 1
    setPos({
      inicio: el.scrollLeft <= 1,
      fim: max <= 1 || el.scrollLeft >= max - 1,
      atual: Math.max(0, Math.min(total - 1, Math.round(el.scrollLeft / passo))),
    })
  }, [total])

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

  /* UM `pointermove` NO CONTAINER, e não seis `mouseenter` por card.
     O card.md faz por card, e ali há dois furos medidos:

      1. os cards se SOBREPÕEM. O hit test entrega o evento só ao card
         de cima, então a área sensível de cada um é a tira estreita e
         torta que o vizinho não cobre. A pessoa aponta para o meio de
         um rosto e acende o card ao lado.
      2. pior: o card apontado CRESCE e SOBE, e ao crescer passa a
         cobrir o vizinho sem o ponteiro se mexer. A especificação de
         Pointer Events manda o navegador disparar boundary events
         depois de mudança de layout que altere o alvo do hit test —
         ou seja, o próprio efeito dispara um `mouseleave` que desfaz
         o efeito, que dispara um `mouseenter`... É a fonte número um
         de piscada em leque que expande.

     Decidir o slot pela GEOMETRIA mata os dois: a faixa de cada card é
     fixa e não depende de quem está por cima nem de quanto ele cresceu. */
  const apontar = useCallback((e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = trilho.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const faixa = r.width / total
    const i = Math.floor((e.clientX - r.left) / faixa)
    setApontado(Math.max(0, Math.min(total - 1, i)))
  }, [total])

  const andar = useCallback((dir: 1 | -1) => {
    const el = trilho.current
    if (!el) return
    const item = el.querySelector<HTMLElement>('li')
    // largura do card + o vao: a seta anda um card exato, nao "uma tela"
    const passo = item ? item.getBoundingClientRect().width + 12 : el.clientWidth * 0.7
    el.scrollBy({ left: passo * dir, behavior: 'smooth' })
  }, [])

  if (!total) return null
  const semRolagem = pos.inicio && pos.fim
  const centro = (total - 1) / 2

  return (
    <div className="equipe">
      <div role="group" aria-label="A equipe da Rapa Sound">
        <ul ref={trilho} tabIndex={0}
            data-armado={armado ? '' : undefined}
            data-natela={naTela ? '' : undefined}
            className="equipe__trilho"
            onPointerMove={apontar}
            /* `pointerleave` no CONTAINER: sair pela fresta entre dois
               cards não zera o leque, só sair da caixa inteira. */
            onPointerLeave={() => setApontado(null)}
            /* TECLADO PELA MESMA PORTA. `focusin` borbulha (`focus`
               não), então um só ouvinte cobre os seis, e ele escreve no
               MESMO estado que o ponteiro — zero lógica duplicada.
               Também é o que satisfaz o critério 2.4.11 da WCAG 2.2: o
               card focado sobe para o topo da pilha, então nunca fica
               inteiramente escondido atrás do vizinho. */
            onFocus={(e) => {
              const li = (e.target as HTMLElement).closest<HTMLElement>('[data-slot]')
              if (li) setApontado(Number(li.dataset.slot))
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setApontado(null)
            }}>
          {cards.map((c, i) => {
            const p = comHover(total, i, entrou ? apontado : null)
            return (
              <li key={c.src} className="equipe__card"
                  data-slot={i}
                  data-aceso={apontado === i ? '' : undefined}
                  data-lado={i < centro ? 'esq' : i > centro ? 'dir' : 'centro'}
                  style={{
                    ['--i' as string]: i,
                    ['--rot' as string]: `${p.rot.toFixed(3)}deg`,
                    ['--esc' as string]: p.esc.toFixed(4),
                    ['--x' as string]: p.x.toFixed(3),
                    ['--y' as string]: p.y.toFixed(3),
                    ['--z' as string]: p.z,
                    ['--atraso' as string]: `${p.atraso}ms`,
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
                    <span className="equipe__nome">{c.nome}</span>
                    <span className="lab equipe__papel">{c.papel}</span>
                  </figcaption>
                </figure>
              </li>
            )
          })}
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

          {/* os pontos do card.md: dizem ONDE se está nos seis, coisa
              que duas setas sozinhas não dizem. Decoração para o leitor
              de tela — a lista de nomes ao lado já é a informação. */}
          <span aria-hidden className="equipe__pontos">
            {cards.map((c, i) => (
              <span key={c.src} className="equipe__ponto"
                    data-atual={i === pos.atual ? '' : undefined} />
            ))}
          </span>

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
