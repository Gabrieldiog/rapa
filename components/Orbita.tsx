'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Fala } from '@/lib/conteudo'

/**
 * OS DEPOIMENTOS EM ÓRBITA — porte do `Orbiting Circles with Globe`
 * de melhorias/algum.png, vestido na direção da casa.
 *
 * O QUE A REFERÊNCIA É: uma cúpula de partículas com círculos
 * orbitando em arcos concêntricos por cima. No original os círculos
 * carregam logotipos de tecnologia. Aqui carregam PESSOAS, e ao passar
 * pelo alto cada uma solta a sua fala num balão — que foi o pedido.
 *
 * POR QUE CÚPULA, E NÃO GLOBO. O original é meio globo, e num site de
 * tecnologia isso lê como "o mundo". Aqui lê como outra coisa, melhor:
 * é a PLATEIA vista do palco. Cada ponto é uma pessoa na pista, e os
 * depoimentos orbitam por cima dela. A empresa monta o palco; a cúpula
 * é o que ela vê de lá.
 *
 * AS DUAS DECISÕES QUE MANDAM NO COMPONENTE
 *
 * 1. TEXTO NÃO GIRA. Depoimento é CONTEÚDO, não enfeite. Se o texto
 *    orbitasse junto ficaria ilegível, e quem usa leitor de tela não
 *    teria nada. As falas vivem numa lista de verdade no DOM, e a
 *    órbita só decide QUAL delas está em destaque. Se a animação nunca
 *    rodar, os sete depoimentos continuam lá, legíveis, na ordem.
 *
 * 2. TEM BOTÃO DE PAUSA, E ELE É VISÍVEL. Movimento automático que
 *    dura mais de cinco segundos em paralelo com outro conteúdo aciona
 *    o critério 2.2.2 da WCAG, que é NÍVEL A e exige um mecanismo de
 *    pausa NA PÁGINA. `prefers-reduced-motion` não fecha esse critério
 *    — a técnica que o usa é de 2.3.3, que é AAA. Um carrossel que
 *    gira sozinho sem pausa é falha de acessibilidade, não é estilo.
 *
 * O CUSTO. Já há um canvas rodando na página (a seda do fundo). Este é
 * o segundo, então ele se comporta: 24 quadros por segundo, metade dos
 * pontos no celular, e PARA de desenhar quando a seção sai da tela —
 * um IntersectionObserver desliga o laço inteiro. Fora da tela ele
 * custa zero.
 */

/** Os pontos da cúpula. Distribuição em espiral de Fibonacci sobre a
 *  esfera: é a única que não empilha nos polos, que é o defeito de
 *  sortear latitude e longitude ao acaso. */
function pontosDaCupula(n: number) {
  const pts: { x: number; y: number; z: number }[] = []
  const phi = Math.PI * (3 - Math.sqrt(5)) // ângulo áureo
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 1 // de 1 a 0: só o hemisfério de cima
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const t = phi * i
    pts.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r })
  }
  return pts
}

export function Orbita({ falas }: { falas: Fala[] }) {
  const cx = useRef<HTMLCanvasElement>(null)
  const caixa = useRef<HTMLDivElement>(null)
  const [ativa, setAtiva] = useState(0)
  const [parada, setParada] = useState(false)
  const [naTela, setNaTela] = useState(false)

  const total = falas.length

  /* ---------- a cúpula ---------- */
  useEffect(() => {
    const cv = cx.current
    const box = caixa.current
    if (!cv || !box) return

    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const estreito = window.matchMedia('(max-width: 640px)').matches
    const pts = pontosDaCupula(estreito ? 420 : 900)
    const ctx = cv.getContext('2d', { alpha: true })
    if (!ctx) return

    let larg = 0, alt = 0, dpr = 1
    const medir = () => {
      const r = box.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      larg = Math.max(1, Math.round(r.width))
      alt = Math.max(1, Math.round(r.height))
      cv.width = Math.round(larg * dpr)
      cv.height = Math.round(alt * dpr)
      cv.style.width = `${larg}px`
      cv.style.height = `${alt}px`
    }
    medir()
    /* repinta ao redimensionar: mudar `cv.width` limpa o canvas, entao
       sem isto a cupula sumia ao girar o aparelho */
    const ro = new ResizeObserver(() => { medir(); pintar() })
    ro.observe(box)

    let pedido = 0
    let giro = 0
    let ultimo = 0
    const QUADRO = 1000 / 24 // 24fps: cúpula de pontos não precisa de 60

    const pintar = () => {
      ctx.clearRect(0, 0, cv.width, cv.height)
      ctx.save()
      ctx.scale(dpr, dpr)

      /* A CUPULA E MENOR QUE AS ORBITAS, e isso e o desenho: na
         referencia os circulos correm POR CIMA da cupula, nao dentro
         dela. Com 0.42/0.72 a cupula media 300px e os tres aneis
         corriam a 248, 187 e 154 — todos por dentro, e virava sopa. */
      const raio = alt * 0.60
      const ox = larg / 2
      const oy = alt

      /* OS ARCOS SAO DESENHADOS AQUI, e nao em SVG, e o motivo e
         alinhamento. Em SVG eu tinha tres elipses num viewBox com
         `preserveAspectRatio: none` — ou seja, esticadas — enquanto as
         bolas corriam em raios calculados sobre a ALTURA da caixa. Os
         dois nunca batiam, e o resultado era bola solta ao lado do
         arco em vez de bola EM CIMA do arco.
         Aqui arco e bola usam a mesma origem e os mesmos tres fatores
         (0,86 · 0,775 · 0,69 da altura), entao encaixam por construcao. */
      ctx.strokeStyle = 'rgba(236,237,239,0.13)'
      ctx.lineWidth = 1
      for (const f of [0.86, 0.775, 0.69]) {
        ctx.beginPath()
        // de -100 a +100 graus: arco aberto, sem fechar embaixo
        ctx.arc(ox, oy, alt * f, Math.PI * -0.94, Math.PI * -0.06)
        ctx.stroke()
      }

      if (!reduz) giro += 0.0016

      for (const p of pts) {
        // rotação em torno do eixo vertical
        const c = Math.cos(giro), s = Math.sin(giro)
        const x = p.x * c - p.z * s
        const z = p.x * s + p.z * c
        // só o que está virado para quem olha
        if (z < -0.15) continue
        const px = ox + x * raio
        const py = oy - p.y * raio
        // profundidade vira brilho e tamanho, nunca desfoque
        const prof = (z + 1) / 2
        const a = 0.10 + prof * 0.46
        const t = 0.5 + prof * 0.9
        // âmbar nos da frente, branco frio nos do fundo: a plateia
        // iluminada de cima, que é o que a empresa faz
        ctx.fillStyle = prof > 0.72
          ? `rgba(255,163,0,${a * 0.9})`
          : `rgba(214,218,228,${a * 0.62})`
        ctx.beginPath()
        ctx.arc(px, py, t, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }


    /* O PRIMEIRO QUADRO SAI NA HORA, sem esperar observador nenhum.
       Antes o desenho inteiro so comecava quando o IntersectionObserver
       dizia que a secao estava na tela — e observador tem latencia, nao
       dispara sob relogio virtual, e pode simplesmente nao falar. O
       resultado era uma caixa VAZIA com as bolinhas flutuando no nada.
       Agora o observador so decide se o laco CONTINUA; a cupula
       aparece de saida. */
    pintar()

    const laco = (agora: number) => {
      pedido = requestAnimationFrame(laco)
      if (agora - ultimo < QUADRO) return
      ultimo = agora
      pintar()
    }
    if (naTela) pedido = requestAnimationFrame(laco)
    return () => { cancelAnimationFrame(pedido); ro.disconnect() }
  }, [naTela])

  /* Fora da tela o laço nem começa: já há um canvas na página (a seda),
     e dois desenhando ao mesmo tempo num celular fraco é caro. */
  useEffect(() => {
    const box = caixa.current
    if (!box) return
    const io = new IntersectionObserver(([e]) => setNaTela(e.isIntersecting), {
      rootMargin: '160px 0px',
    })
    io.observe(box)
    return () => io.disconnect()
  }, [])

  /* ---------- o giro das falas ---------- */
  useEffect(() => {
    if (parada || !naTela || total < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setAtiva((n) => (n + 1) % total), 6200)
    return () => clearInterval(t)
  }, [parada, naTela, total])

  const escolher = useCallback((i: number) => {
    setAtiva(i)
    setParada(true)   // mexeu, manda quem mexeu
  }, [])

  if (!total) return null
  const f = falas[ativa]

  return (
    <div className="orbita">
      <div ref={caixa} className="orbita__palco">
        {/* a cúpula */}
        <canvas ref={cx} aria-hidden className="orbita__cupula" />

        {/* as bolinhas. Cada uma é um <button> de verdade: dá para
            chegar nelas por Tab e escolher por Enter, e o nome
            acessível é o de quem falou. */}
        <ul className="orbita__bolas" data-parada={parada ? '' : undefined}>
          {falas.map((fa, i) => (
            <li key={fa.quem + fa.onde}
                className="orbita__orbita"
                /* --i espalha as bolas pela volta; --anel escolhe em
                   qual dos três arcos ela corre; --dur dá a cada anel
                   uma velocidade própria, senão elas andam em bloco e
                   parece uma engrenagem só. */
                style={{
                  ['--i' as string]: i,
                  ['--n' as string]: total,
                  ['--anel' as string]: i % 3,
                }}>
              <button type="button" onClick={() => escolher(i)}
                      aria-pressed={i === ativa}
                      className="orbita__bola"
                      data-ativa={i === ativa ? '' : undefined}>
                <span aria-hidden>{fa.quem.slice(0, 1)}</span>
                <span className="sr-only">
                  Ver o depoimento de {fa.quem}, {fa.papel}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* O BALÃO. `aria-live` não vai aqui: as falas todas já estão no
          DOM logo abaixo, e anunciar a cada seis segundos seria ruído.
          Este bloco é o eco visual — por isso é `aria-hidden`. */}
      <div aria-hidden className="orbita__balao" key={ativa}>
        <p className="orbita__texto">{f.texto}</p>
        <p className="orbita__quem">
          <b>{f.quem}</b>
          <span>{f.papel} · {f.onde}</span>
        </p>
      </div>

      <div className="orbita__controles">
        <button type="button" onClick={() => setParada((v) => !v)}
                className="orbita__pausa" aria-pressed={parada}>
          {parada ? 'Voltar a girar' : 'Pausar'}
        </button>
        <p className="lab orbita__conta" aria-hidden>
          <b>{String(ativa + 1).padStart(2, '0')}</b> / {String(total).padStart(2, '0')}
        </p>
      </div>

      {/* A LISTA DE VERDADE. É daqui que o leitor de tela e a busca
          leem os depoimentos — não do balão. Ela existe mesmo que
          nenhuma animação rode, e é ela que faz o conteúdo ser
          conteúdo. Visualmente ela some no desktop, onde o balão já
          mostra a fala; no celular ela É a apresentação. */}
      <ul className="orbita__falas">
        {falas.map((fa) => (
          <li key={fa.quem + fa.onde} className="orbita__fala">
            <blockquote>
              <p>{fa.texto}</p>
              <footer>
                <b>{fa.quem}</b> · {fa.papel} · {fa.onde}
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  )
}
