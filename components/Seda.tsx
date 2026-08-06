'use client'

import { useEffect, useRef } from 'react'

/**
 * O FUNDO — porte do `silk-background-animation` de melhorias/back2.md.
 *
 * A MATEMATICA DO PADRAO E A DO ORIGINAL, intacta:
 *   tex_y   = v + 0.03 * sin(8*tex_x - t)
 *   pattern = 0.6 + 0.4 * sin( 5*(tex_x + tex_y + cos(3*tex_x + 5*tex_y)
 *                                 + 0.02*t)
 *                              + sin(20*(tex_x + tex_y - 0.1*t)) )
 *   intensidade = max(0, pattern - ruido/15 * 0.8)
 *
 * O QUE NAO FOI COPIADO, e por que:
 *
 * 1. O original chama `createImageData` A CADA QUADRO. Numa tela de
 *    1280x860 isso e um buffer de ~4,4 MB alocado 60 vezes por segundo.
 *    Aqui o buffer e criado uma vez e reaproveitado.
 *
 * 2. O original desenha um gradiente e logo depois chama `putImageData`
 *    por cima. `putImageData` SUBSTITUI pixel, nao compoe — entao aquele
 *    gradiente era apagado inteiro. Codigo morto. Aqui o degrade de
 *    fundo entra no proprio calculo da cor.
 *
 * 3. O laco anda de 2 em 2 mas escreve UM pixel, entao tres de cada
 *    quatro ficavam com alfa 0. Aqui todo pixel do buffer e escrito, e
 *    a economia vem de calcular em resolucao menor e ampliar — que e o
 *    jeito certo de baratear um campo continuo.
 *
 * 4. `noise(x, y)` NAO depende do tempo. O original recalculava para
 *    cada pixel de cada quadro. Aqui e uma tabela, refeita so no
 *    redimensionamento.
 *
 * 5. O original injetava `<style>` com `overflow-x: hidden` em
 *    html/body. Fora: e efeito colateral global vindo de um componente
 *    de fundo.
 *
 * 6. Sem porta de `prefers-reduced-motion` e sem pausa fora da tela.
 *
 * COR: o original usa cinza-violeta `rgb(123,116,129)` sobre `#1a1a1a`.
 * Cinza neutro puro esta proibido no IDENTIDADE.md, e `#1a1a1a` nao e
 * cor desta paleta. Aqui a intensidade interpola do `--void` ate um
 * violeta acinzentado puxado para o congo — que e a cor que a restricao
 * dura reserva para AMBIENTE. Um campo de violeta baixo atras da pagina
 * e exatamente o papel dele.
 */

/** o degrade do chao: void nas pontas, um degrau acima no meio */
const CHAO = [9, 9, 11] as const           // --void #09090B
const CHAO_MEIO = [22, 22, 27] as const    // um passo antes do --off
/** A SEDA — o pico do drapeado. Violeta acinzentado, herdado do
    original e puxado ao congo, que e a cor que a restricao dura
    reserva para ambiente.

    O VALOR FOI MEDIDO, nao escolhido. Um fundo com variacao de
    luminancia briga com texto de cor fixa, e quem tem que ganhar essa
    briga e o texto. Contra o pico da seda:

      pico do original 123,116,129 -> branco 3,85:1 · branco-2 1,43:1
      88, 81,106                   -> branco 6,40:1 · branco-2 2,38:1
      40, 37, 48                   -> branco 12,83:1 · branco-2 4,77:1
      chao liso --void             -> branco 16,98:1 · branco-2 6,31:1

    O criterio 1.4.3 da WCAG pede 4,5:1 para texto normal. So o ultimo
    passa — com o original, a pagina inteira reprovaria, inclusive o
    texto branco. */
const SEDA = [40, 37, 48] as const

export function Seda({ forca = 1 }: { forca?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    /* O campo e desenhado PEQUENO e ampliado pelo proprio canvas.
       Da para fazer isso porque o padrao e continuo: ampliar um campo
       suave nao mostra bloco, mostra um campo suave maior.
       O ganho e quadratico — 420x282 sao 118 mil pixels contra 1,1
       milhao de uma tela cheia. Nove vezes menos trigonometria. */
    /* MEDIDO, e o numero antigo era alto demais. Com CPU estrangulada
       em 6x — o perfil de um Android de entrada — a seda a 420/300
       derruba a pagina para 27,8 quadros por segundo, com p50 de
       33,3ms num orcamento de 16,7ms. A pagina inteira ficava a
       16,9fps, e so `serviceScriptedAnimations` comia 40,7ms por
       quadro. Reduzindo o buffer: 160 devolve 32,8fps, e 110 devolve
       51,0 — contra 55,1 com o canvas escondido. A 110 a seda
       praticamente para de custar.
       E nao se perde nada: ela e um FUNDO, ampliado para a tela inteira
       de qualquer jeito, e o que se ve dela e o drapeado grande. */
    const LADO_MAX = 160
    const LADO_MAX_MOVEL = 110

    let w = 0, h = 0, img: ImageData | null = null, ruido: Float32Array | null = null

    const medir = () => {
      const r = canvas.getBoundingClientRect()
      if (!r.width || !r.height) return
      const teto = r.width < 640 ? LADO_MAX_MOVEL : LADO_MAX
      const escala = Math.min(1, teto / Math.max(r.width, r.height))
      w = Math.max(2, Math.round(r.width * escala))
      h = Math.max(2, Math.round(r.height * escala))
      canvas.width = w
      canvas.height = h
      img = ctx.createImageData(w, h)

      /* A TABELA DE RUIDO. `noise(x, y)` do original nao tem termo de
         tempo — e constante para cada pixel. Recalcular a cada quadro
         era desperdicio puro. */
      const G = Math.E
      ruido = new Float32Array(w * h)
      for (let y = 0; y < h; y++) {
        const ry = G * Math.sin(G * y)
        for (let x = 0; x < w; x++) {
          const rx = G * Math.sin(G * x)
          ruido[y * w + x] = (rx * ry * (1 + x)) % 1
        }
      }
    }
    medir()

    const ESCALA = 2          // `scale` do original
    const VELOCIDADE = 0.02   // `speed` do original
    const GRAO = 0.8          // `noiseIntensity` do original

    let t = 0
    let id = 0
    let naTela = true
    let comFoco = true

    /* A SEDA ANIMA E DEPOIS DESCANSA.
       Antes ela desenhava enquanto a pessoa estivesse na pagina — 30
       segundos ou 10 minutos, sempre. Medido com CPU estrangulada em
       6x, que e o perfil de um Android de entrada: mesmo com o buffer
       ja reduzido ela custa 4 quadros por segundo o tempo inteiro
       (51,0 contra 55,1 com o canvas escondido). Isso e rAF acordando
       o processador 24 vezes por segundo, para sempre, e no celular
       isso e bateria.

       Ela e um DRAPEADO: o que ela tem de bonito e a forma, nao o
       movimento. Sete segundos de ondulacao na entrada dao o efeito
       de tecido vivo; depois disso ela congela num quadro e para de
       custar QUALQUER coisa.

       De quebra, isso tira a pagina do criterio 2.2.2 da WCAG por
       aqui: movimento que termina em 7 segundos nao e movimento
       automatico continuo, e nao precisa de mecanismo de pausa. */
    const DURACAO = 7000
    let comecou = 0
    let acabou = false
    const rodando = () => naTela && comFoco && !acabou

    /* 30 quadros por segundo, nao 60. O padrao anda 0.02 por quadro:
       a diferenca entre um quadro e o seguinte e imperceptivel, e
       metade dos quadros e metade da conta. */
    const PASSO = 1000 / 30
    let ultimo = 0

    const quadro = (agora: number) => {
      if (!comecou) comecou = agora
      if (agora - comecou > DURACAO) acabou = true
      if (rodando()) id = requestAnimationFrame(quadro)
      if (agora - ultimo < PASSO) return
      ultimo = agora
      if (!img || !ruido) return

      const d = img.data
      const tOff = VELOCIDADE * t

      for (let y = 0; y < h; y++) {
        const v = (y / h) * ESCALA
        // o degrade do chao e vertical e nao depende de x
        const meio = 1 - Math.abs(y / h - 0.5) * 2
        const baseR = CHAO[0] + (CHAO_MEIO[0] - CHAO[0]) * meio
        const baseG = CHAO[1] + (CHAO_MEIO[1] - CHAO[1]) * meio
        const baseB = CHAO[2] + (CHAO_MEIO[2] - CHAO[2]) * meio

        for (let x = 0; x < w; x++) {
          const tex_x = (x / w) * ESCALA
          const tex_y = v + 0.03 * Math.sin(8 * tex_x - tOff)

          const padrao = 0.6 + 0.4 * Math.sin(
            5 * (tex_x + tex_y + Math.cos(3 * tex_x + 5 * tex_y) + 0.02 * tOff)
            + Math.sin(20 * (tex_x + tex_y - 0.1 * tOff)),
          )

          let i = padrao - (ruido[y * w + x] / 15) * GRAO
          i = i > 0 ? i * forca : 0

          const p = (y * w + x) * 4
          d[p]     = baseR + (SEDA[0] - baseR) * i
          d[p + 1] = baseG + (SEDA[1] - baseG) * i
          d[p + 2] = baseB + (SEDA[2] - baseB) * i
          d[p + 3] = 255
        }
      }

      ctx.putImageData(img, 0, 0)
      t += 1
    }

    /* Duas condicoes INDEPENDENTES. Colapsadas numa so, ao voltar da
       aba ela ja era false e a expressao nunca religava. */
    const religa = () => {
      cancelAnimationFrame(id)
      if (rodando()) id = requestAnimationFrame(quadro)
    }
    /* O OBSERVADOR OBSERVAVA O PROPRIO CANVAS, e o canvas e
       `fixed inset-0`: ele esta SEMPRE na tela, por definicao. Ou seja
       `naTela` nunca virava false e o laco rodava pelos 17.899px de
       rolagem inteiros, do topo ao rodape, para sempre.
       Nao ha o que observar: um fundo fixo nunca sai de vista. Quem
       pausa de verdade e a aba perder o foco — e isso o
       `visibilitychange` ja faz. O observador saiu. */
    const onVis = () => { comFoco = !document.hidden; religa() }
    document.addEventListener('visibilitychange', onVis)

    /* redimensionar zera o canvas (mudar `width` limpa o bitmap) e a
       seda ja pode estar congelada — entao a rodada recomeca por mais
       um ciclo curto para ela se redesenhar em vez de sumir */
    const ro = new ResizeObserver(() => {
      medir()
      if (acabou) {
        acabou = false
        comecou = 0
        id = requestAnimationFrame(quadro)
      }
    })
    ro.observe(canvas)

    id = requestAnimationFrame(quadro)

    return () => {
      cancelAnimationFrame(id)   // o original so cancelava, nunca desligava o resto
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [forca])

  return (
    <>
      {/* O canvas e AMPLIADO pelo CSS a partir de um buffer pequeno.
          `fixed`: o campo nao rola junto — e o ar da sala, nao papel de
          parede colado no documento. */}
      <canvas ref={ref} aria-hidden
              className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
      {/* A vinheta do original, que ele desenhava no canvas a cada
          quadro. Em CSS ela custa zero e nao entra no laco de pixel. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
           style={{ background:
             'radial-gradient(120% 90% at 50% 50%, color-mix(in srgb, var(--color-void) 10%, transparent) 0%, color-mix(in srgb, var(--color-void) 55%, transparent) 100%)' }} />
    </>
  )
}
