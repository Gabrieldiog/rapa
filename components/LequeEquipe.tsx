'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'

/**
 * LEQUE DA EQUIPE — adaptado de melhorias/card.md (21st.dev), com a
 * geometria original preservada e o estilo trazido para a direção TUBO.
 *
 * O que mudou em relação ao arquivo de origem:
 *  - o aro de dois tons e o raio da escala entram no card;
 *  - as setas deixam de ser pílula de vidro e viram controle de painel;
 *  - o marcador de posição vira a coluna de pixels, não bolinha;
 *  - respeita prefers-reduced-motion: sem reduced, leque estático;
 *  - o hover só liga onde existe ponteiro fino.
 */

export type CardEquipe = { src: string; alt: string; nome: string; papel: string }

const MAX_VISIVEL = 7
const METADE = 3

/** as sete posições do leque, do arquivo original */
const LEQUE = [
  { rot: -21, escala: 0.7756, x: -30, y: 7.3, z: 1 },
  { rot: -14, escala: 0.8498, x: -22, y: 4.0, z: 2 },
  { rot: -7,  escala: 0.9346, x: -11, y: 1.3, z: 3 },
  { rot: 0,   escala: 1.0,    x: 0,   y: 0.0, z: 10 },
  { rot: 7,   escala: 0.9346, x: 11,  y: 1.3, z: 3 },
  { rot: 14,  escala: 0.8498, x: 22,  y: 4.0, z: 2 },
  { rot: 21,  escala: 0.7756, x: 30,  y: 7.3, z: 1 },
]

const multLargura = (w: number) =>
  w < 480 ? 0.28 : w < 640 ? 0.38 : w < 768 ? 0.5 : w < 1024 ? 0.75 : 1

function multAltura(w: number) {
  const ideal = w < 480 ? 352 : w < 640 ? 416 : w < 768 ? 448 : w < 1024 ? 544 : 608
  const disp = window.innerHeight * 0.7
  return disp >= ideal ? 1 : disp / ideal
}

function config(total: number, slot: number) {
  if (total >= MAX_VISIVEL) return LEQUE[slot]
  const centro = total >> 1
  const d = total > 1 ? (slot - centro) / centro : 0
  const ad = Math.abs(d)
  return { rot: d * 21, escala: 1 - 0.2244 * ad * ad, x: d * 30, y: ad * ad * 7.3,
           z: 10 - Math.abs(slot - centro) }
}

export function LequeEquipe({ cards }: { cards: CardEquipe[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [naTela, setNaTela] = useState(false)
  const animando = useRef(false)
  const entrou = useRef(false)
  const direcao = useRef<'esq' | 'dir' | null>(null)
  const visivelAntes = useRef<Set<number>>(new Set())

  const total = cards.length
  const pagina = total > MAX_VISIVEL
  const [centro, setCentro] = useState(pagina ? METADE : total >> 1)

  const mapaVisivel = useCallback((c: number) => {
    const m = new Map<number, number>()
    if (!pagina) { cards.forEach((_, i) => m.set(i, i)); return m }
    for (let s = 0; s < MAX_VISIVEL; s++) {
      m.set((((c + s - METADE) % total) + total) % total, s)
    }
    return m
  }, [total, pagina, cards])

  const girar = useCallback((d: 'esq' | 'dir') => {
    if (animando.current || !pagina) return
    animando.current = true
    direcao.current = d
    setCentro((p) => (d === 'dir' ? (p + 1) % total : (p - 1 + total) % total))
  }, [total, pagina])

  /* Espera entrar na tela. Sem isto a entrada do leque acontecia na
     montagem — a pessoa rolava ate a equipe e encontrava tudo ja
     posicionado, sem ver a animacao. */
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setNaTela(true); io.disconnect() }
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const cont = ref.current
    if (!cont || !total || !naTela) return

    const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = Array.from(cont.querySelectorAll<HTMLElement>('.leque-card'))
    if (!els.length) return

    const visiveis = mapaVisivel(centro)
    const antes = visivelAntes.current
    const d = direcao.current
    const primeiro = !entrou.current
    const mw = multLargura(window.innerWidth)
    const mh = multAltura(window.innerWidth)
    const slots = pagina ? MAX_VISIVEL : total
    const cfg = (s: number) => config(slots, s)

    if (primeiro) animando.current = true
    let feitos = 0
    const pronto = () => {
      if (++feitos >= visiveis.size) {
        animando.current = false
        if (primeiro) entrou.current = true
      }
    }

    els.forEach((el, i) => {
      const slot = visiveis.get(i)
      const eraVisivel = antes.has(i)

      if (slot !== undefined) {
        const { x, y, rot, escala, z } = cfg(slot)
        const alvo = { x: `${x * mw}rem`, y: `${y * mh}rem`, rotation: rot,
                       scale: escala, opacity: 1, zIndex: z }
        if (reduzido) { gsap.set(el, alvo); pronto(); return }

        if (primeiro) {
          gsap.set(el, { x: 0, y: `${12 * mh}rem`, rotation: 0, scale: 0.5, opacity: 0 })
          gsap.to(el, { ...alvo, duration: 1.2, ease: 'elastic.out(1.05,.78)',
                        delay: 0.2 + slot * 0.06, onComplete: pronto })
        } else if (!eraVisivel) {
          const ex = d === 'dir' ? 40 : -40
          gsap.set(el, { x: `${ex}rem`, y: `${y * mh}rem`,
                         rotation: d === 'dir' ? 30 : -30, scale: 0.5, opacity: 0 })
          gsap.to(el, { ...alvo, duration: 0.6, ease: 'power2.out', onComplete: pronto })
        } else {
          gsap.to(el, { ...alvo, duration: 0.5, ease: 'power2.out', onComplete: pronto })
        }
      } else if (eraVisivel) {
        const sx = d === 'dir' ? -40 : 40
        gsap.to(el, { x: `${sx}rem`, opacity: 0, scale: 0.5,
                      rotation: d === 'dir' ? -30 : 30, duration: 0.4,
                      ease: 'power2.in', zIndex: 0 })
      } else if (primeiro) {
        gsap.set(el, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 })
      }
    })

    visivelAntes.current = new Set(visiveis.keys())

    // hover: só onde existe ponteiro fino, e nunca com reduced-motion
    if (reduzido || !matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const entradas: { el: HTMLElement; slot: number }[] = []
    els.forEach((el, i) => {
      const s = visiveis.get(i)
      if (s !== undefined) entradas.push({ el, slot: s })
    })
    entradas.sort((a, b) => a.slot - b.slot)

    let ativo: number | null = null
    let timer: ReturnType<typeof setTimeout> | null = null
    const slotCentral = entradas.length >> 1

    const rearranjar = (sobre: number | null) => {
      const mw2 = multLargura(window.innerWidth)
      const mh2 = multAltura(window.innerWidth)
      entradas.forEach(({ el, slot }) => {
        const b = cfg(slot)
        let tx = b.x * mw2, ty = b.y * mh2, tr = b.rot, te = b.escala, atraso = 0
        if (sobre !== null) {
          const dist = Math.abs(slot - sobre)
          atraso = dist * 0.02
          if (slot === sobre) { ty -= 2.5 * mh2; te *= 1.08 }
          else {
            const nrm = slotCentral > 0 ? (slot - slotCentral) / slotCentral : 0
            const empurra = 8 * (1 - Math.abs(nrm)) * (1 + 0.2 * Math.max(0, 3 - dist))
            if (slot < sobre) { tx -= empurra * mw2; tr -= 3 / (dist + 1) }
            else { tx += empurra * mw2; tr += 3 / (dist + 1) }
            if (slot === entradas.length - 1 && sobre < slotCentral) ty -= mh2
            if (slot === 0 && sobre > slotCentral) ty -= mh2
          }
        } else atraso = Math.abs(slot - slotCentral) * 0.02
        gsap.to(el, { x: `${tx}rem`, y: `${ty}rem`, rotation: tr, scale: te,
                      duration: 0.5, delay: atraso, ease: 'elastic.out(1,.75)',
                      overwrite: 'auto' })
        gsap.set(el, { zIndex: b.z })
      })
    }

    const handlers = entradas.map(({ el, slot }) => {
      const h = () => {
        if (animando.current) return
        if (timer) { clearTimeout(timer); timer = null }
        if (ativo !== slot) { ativo = slot; rearranjar(slot) }
      }
      el.addEventListener('mouseenter', h)
      return { el, h }
    })

    const sair = () => {
      if (animando.current) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => { ativo = null; rearranjar(null) }, 50)
    }
    cont.addEventListener('mouseleave', sair)
    const onResize = () => { if (!animando.current) rearranjar(ativo) }
    window.addEventListener('resize', onResize)

    return () => {
      handlers.forEach(({ el, h }) => el.removeEventListener('mouseenter', h))
      cont.removeEventListener('mouseleave', sair)
      window.removeEventListener('resize', onResize)
      if (timer) clearTimeout(timer)
    }
  }, [centro, total, mapaVisivel, pagina, naTela])

  if (!total) return null

  const seta = (d: 'esq' | 'dir') => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <polyline points={d === 'esq' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  )

  return (
    <div className="flex w-full flex-col items-center">
      <div ref={ref} className="leque relative flex w-full items-center justify-center">
        {cards.map((c, i) => (
          <figure key={i} className="leque-card">
            <img src={c.src} alt={c.alt} loading="lazy" decoding="async"
                 width={440} height={635}
                 className="absolute inset-0 h-full w-full object-cover" />
            {/* no site antigo isto era pixel queimado na imagem */}
            <figcaption className="sobre-escuro absolute inset-x-0 bottom-0 bg-gradient-to-t
                                   from-void via-void/85 to-transparent px-4 pb-4 pt-10">
              <span className="block text-sm font-bold leading-tight text-branco">{c.nome}</span>
              <span className="lab mt-1 block">{c.papel}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {total > MAX_VISIVEL && (
        <div className="mt-8 flex items-center gap-5">
          <button type="button" onClick={() => girar('esq')} aria-label="Anterior"
                  className="leque-seta">{seta('esq')}</button>
          {/* marcador: a coluna de pixels deitada, nao bolinha */}
          <div className="flex items-center gap-1.5" aria-hidden>
            {cards.map((_, i) => (
              <span key={i}
                    className={`block h-3 w-[3px] rounded-[1px] transition-all duration-300
                                ${i === centro ? 'bg-ambar' : 'bg-rule'}`} />
            ))}
          </div>
          <button type="button" onClick={() => girar('dir')} aria-label="Próximo"
                  className="leque-seta">{seta('dir')}</button>
        </div>
      )}
    </div>
  )
}
