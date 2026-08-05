'use client'

import { useEffect, useRef } from 'react'

/**
 * O FUNDO. Porte fiel do `FluidParticlesBackground` de melhorias/back.md.
 *
 * Os parametros sao os do original, sem reinterpretacao:
 *   particleCount 2000 · noiseIntensity 0.003 · tamanho 0.5 a 2
 *   particula rgba(255,255,255,.07) · opacidade sin(vida/max * PI) * .15
 *   velocidade 2 · angulo = ruido * PI * 4 · borda dá a volta
 *
 * UMA diferenca deliberada, e e de cor, nao de comportamento: o
 * original limpa o quadro com `rgba(0,0,0,0.12)`, preto puro. O chao
 * desta pagina e `--void`, #09090B. Limpar com preto puro faria o campo
 * escurecer em direcao a #000 e descolar do resto da pagina. Entao a
 * limpeza usa o proprio void na mesma opacidade. Mesmo rastro, chao
 * certo.
 *
 * As quatro correcoes do original ficam, porque sao defeitos dele e nao
 * estilo:
 *   1. o rAF nunca era cancelado — vazava no unmount;
 *   2. `noise` era recriado a cada render E estava nas deps do
 *      useEffect, o que remontava o efeito em laco;
 *   3. `particleSize` como objeto nas deps causava o mesmo;
 *   4. sem porta de prefers-reduced-motion e sem pausa fora da tela.
 *
 * E uma quinta, medida: DPR com teto de 1.5. Em telefone com DPR 3 o
 * custo por quadro triplica sem ganho visivel num campo de pontos de
 * 7% de opacidade.
 */

function criarRuido() {
  const permutation = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
    8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
    35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
    134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
    55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,
    169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,
    124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,
    28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
    129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,
    34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,
    214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,
    93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
  ]
  const p = new Array<number>(512)
  for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i]

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  const lerp = (t: number, a: number, b: number) => a + t * (b - a)
  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  return (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z)
    const u = fade(x), v = fade(y), w = fade(z)
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z
    const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z
    return lerp(w,
      lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
              lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))),
      lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
              lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))))
  }
}

export function Particulas({ quantidade = 2000 }: { quantidade?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const ruido = criarRuido()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let w = 0, h = 0

    const medir = () => {
      const r = canvas.getBoundingClientRect()
      if (!r.width || !r.height) return
      w = r.width; h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    medir()

    // menos particula em tela pequena: o publico chega por 4G
    const n = w < 640 ? Math.round(quantidade * 0.45) : quantidade
    const parts = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: Math.random() * 1.5 + 0.5,   // particleSize { min: .5, max: 2 }
      vida: Math.random() * 100,
      max: 100 + Math.random() * 50,
    }))

    let id = 0
    let naTela = true
    let comFoco = true
    const rodando = () => naTela && comFoco

    const quadro = () => {
      /* Rastro: limpa com o void translucido, nao apaga.
         0.07 e nao os 0.12 do original PORQUE a particula ficou mais
         lenta. O comprimento do risco e velocidade x quadros ate
         sumir. Com alfa 0.12 um ponto some em ~36 quadros; a 2px por
         quadro isso dava um risco de ~72px. Baixando a velocidade para
         1.1 e mantendo 0.12, o risco cairia para ~40px e o fundo
         mudaria de aparencia — o cliente do projeto disse que gostou
         de como esta, so quer mais devagar.
         0.07 leva o ponto a ~65 quadros, e 1.1 x 65 da os mesmos
         ~72px. Mesmo desenho, metade da pressa. */
      ctx.fillStyle = 'rgba(9, 9, 11, 0.07)'
      ctx.fillRect(0, 0, w, h)

      /* VELOCIDADE — os dois numeros abaixo sao os unicos que saem do
         original de proposito, a pedido do cliente do projeto: "deixa
         as linhas correrem um pouco mais lento".
         `0.00004` (era 0.0001) faz o CAMPO de ruido girar mais devagar,
         entao as linhas mudam de direcao com menos pressa.
         `1.1` (era 2) e a velocidade da particula no proprio quadro.
         Sao coisas diferentes: mexer so na velocidade deixaria as
         particulas lentas fazendo curva rapida, que fica nervoso. */
      const t = performance.now() * 0.00004
      for (const p of parts) {
        p.vida += 1
        if (p.vida > p.max) {
          p.vida = 0
          p.x = Math.random() * w
          p.y = Math.random() * h
        }
        const op = Math.sin((p.vida / p.max) * Math.PI) * 0.15
        const a = ruido(p.x * 0.003, p.y * 0.003, t) * Math.PI * 4
        p.x += Math.cos(a) * 1.1
        p.y += Math.sin(a) * 1.1
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.fillStyle = `rgba(255, 255, 255, ${op})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
        ctx.fill()
      }
      if (rodando()) id = requestAnimationFrame(quadro)
    }

    /* Duas condicoes INDEPENDENTES. Colapsadas numa variavel so, ao
       voltar da aba ela ja era false e a expressao nunca religava: o
       campo congelava. */
    const religa = () => {
      cancelAnimationFrame(id)
      if (rodando()) id = requestAnimationFrame(quadro)
    }
    const io = new IntersectionObserver(([e]) => { naTela = e.isIntersecting; religa() },
                                        { threshold: 0 })
    io.observe(canvas)
    const onVis = () => { comFoco = !document.hidden; religa() }
    document.addEventListener('visibilitychange', onVis)
    const ro = new ResizeObserver(medir)
    ro.observe(canvas)

    id = requestAnimationFrame(quadro)

    return () => {
      cancelAnimationFrame(id)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [quantidade])

  return (
    /* `fixed` e nao `absolute`: o campo cobre o viewport e nao rola
       junto com a pagina — ele e o ar da sala, nao papel de parede.
       Efeito colateral bom: o canvas mede sempre o viewport, entao a
       resolucao nao cresce com o comprimento do documento. */
    <canvas ref={ref} aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
  )
}
