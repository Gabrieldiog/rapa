/* MEDIDOR DE ORCAMENTO DE QUADRO — Rapa Sound
   uso: node med.js <url> <cpuThrottle> <saida.json>            */
const PORT = 9412
const { spawn } = require('child_process')
const http = require('http')
const fs = require('fs')

const URL = process.argv[2] || 'http://localhost:3000'
const THROTTLE = Number(process.argv[3] || 1)
const OUT = process.argv[4] || '/tmp/med.json'

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`,
  '--window-size=500,932', '--user-data-dir=/tmp/cdpprof-med',
  '--enable-gpu-rasterization', '--force-device-scale-factor=1',
  '--no-first-run', '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding', 'about:blank',
], { stdio: 'ignore' })

const req = (p, method = 'GET') => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method }, (r) => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)) } catch (e) { rej(e) } })
  }); r.on('error', rej); r.end()
})
const sleep = ms => new Promise(r => setTimeout(r, ms))

;(async () => {
  for (let i = 0; i < 60; i++) { try { await req('/json/version'); break } catch { await sleep(250) } }
  const tgt = await req('/json/new?' + encodeURIComponent(URL), 'PUT')
  const WebSocket = require('/private/tmp/node_modules/ws')
  const ws = new WebSocket(tgt.webSocketDebuggerUrl, { maxPayload: 512 * 1024 * 1024 })
  let id = 0
  const pend = new Map()
  const evts = []
  const traceChunks = []
  ws.on('message', m => {
    const o = JSON.parse(m)
    if (o.id && pend.has(o.id)) { pend.get(o.id)(o.result || o.error); pend.delete(o.id) }
    if (o.method === 'Tracing.dataCollected') traceChunks.push(...o.params.value)
    if (o.method === 'Tracing.tracingComplete') evts.push('DONE')
    if (o.method === 'Runtime.exceptionThrown') console.error('[EXC]', o.params.exceptionDetails.text, o.params.exceptionDetails.exception?.description)
  })
  const send = (method, params = {}) => new Promise(res => {
    const myId = ++id; pend.set(myId, res); ws.send(JSON.stringify({ id: myId, method, params }))
  })
  await new Promise(r => ws.on('open', r))
  await send('Runtime.enable'); await send('Page.enable'); await send('Tracing.enable')

  await send('Emulation.setDeviceMetricsOverride', {
    width: 430, height: 932, deviceScaleFactor: 3, mobile: true,
    screenWidth: 430, screenHeight: 932,
  })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })

  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
    if (r.exceptionDetails) return { ERRO: r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || '') }
    return r.result.value
  }

  // espera hidratacao real
  await sleep(9000)
  const hidratou = await ev(`JSON.stringify({
    canvas: !!document.querySelector('canvas'),
    canvasW: document.querySelector('canvas')?.width || 0,
    canvasH: document.querySelector('canvas')?.height || 0,
    cards: document.querySelectorAll('.card').length,
    revs: document.querySelectorAll('.rev').length,
    revOn: document.querySelectorAll('.rev-on').length,
    imgs: document.images.length,
    docH: document.documentElement.scrollHeight,
    docW: document.documentElement.scrollWidth,
    innerW: innerWidth,
    dpr: devicePixelRatio,
    supportsView: CSS.supports('animation-timeline: view()'),
  })`)
  console.log('ESTADO::' + hidratou)

  // ---- MICRO-BENCH 1: o laco de pixel da Seda, isolado ----
  const bench = await ev(`(() => {
    const c = document.querySelector('canvas'); if(!c) return 'sem canvas'
    const w = c.width, h = c.height
    const ctx = document.createElement('canvas').getContext('2d',{alpha:false})
    ctx.canvas.width = w; ctx.canvas.height = h
    const img = ctx.createImageData(w,h); const d = img.data
    const G = Math.E; const ruido = new Float32Array(w*h)
    for(let y=0;y<h;y++){const ry=G*Math.sin(G*y);for(let x=0;x<w;x++){const rx=G*Math.sin(G*x);ruido[y*w+x]=(rx*ry*(1+x))%1}}
    const ESCALA=2, GRAO=0.8, CHAO=[9,9,11], CHAO_MEIO=[22,22,27], SEDA=[40,37,48]
    let t=0
    const um = () => {
      const tOff = 0.02*t
      for(let y=0;y<h;y++){
        const v=(y/h)*ESCALA
        const meio=1-Math.abs(y/h-0.5)*2
        const baseR=CHAO[0]+(CHAO_MEIO[0]-CHAO[0])*meio
        const baseG=CHAO[1]+(CHAO_MEIO[1]-CHAO[1])*meio
        const baseB=CHAO[2]+(CHAO_MEIO[2]-CHAO[2])*meio
        for(let x=0;x<w;x++){
          const tx=(x/w)*ESCALA
          const ty=v+0.03*Math.sin(8*tx-tOff)
          const p2=0.6+0.4*Math.sin(5*(tx+ty+Math.cos(3*tx+5*ty)+0.02*tOff)+Math.sin(20*(tx+ty-0.1*tOff)))
          let i=p2-(ruido[y*w+x]/15)*GRAO; i=i>0?i:0
          const p=(y*w+x)*4
          d[p]=baseR+(SEDA[0]-baseR)*i; d[p+1]=baseG+(SEDA[1]-baseG)*i; d[p+2]=baseB+(SEDA[2]-baseB)*i; d[p+3]=255
        }
      }
      t++
    }
    for(let k=0;k<5;k++) um()             // aquece
    const t0=performance.now(); const N=30
    for(let k=0;k<N;k++) um()
    const tLoop=(performance.now()-t0)/N
    const t1=performance.now()
    for(let k=0;k<N;k++) ctx.putImageData(img,0,0)
    const tPut=(performance.now()-t1)/N
    return JSON.stringify({w,h,px:w*h,loopMs:+tLoop.toFixed(3),putMs:+tPut.toFixed(3),totalMs:+(tLoop+tPut).toFixed(3)})
  })()`)
  console.log('SEDABENCH::' + bench)

  // ---- MICRO-BENCH 2: custo de um forced style recalc no documento inteiro ----
  const recalc = await ev(`(() => {
    const r=document.documentElement
    // aquece
    for(let i=0;i<3;i++){ r.style.setProperty('--bench', i+'px'); document.body.offsetHeight }
    const t0=performance.now(); const N=20
    for(let i=0;i<N;i++){ r.style.setProperty('--bench', i+'px'); document.body.offsetHeight }
    const recalcTudo=(performance.now()-t0)/N
    r.style.removeProperty('--bench')
    // custo de LER 20 getBoundingClientRect (forca layout)
    const els=[...document.querySelectorAll('.card, section, h2')].slice(0,40)
    const t1=performance.now()
    for(let i=0;i<N;i++){ document.body.style.setProperty('--z', i+'px'); for(const e of els) e.getBoundingClientRect() }
    const layout40=(performance.now()-t1)/N
    document.body.style.removeProperty('--z')
    return JSON.stringify({recalcTudoMs:+recalcTudo.toFixed(3), layout40elMs:+layout40.toFixed(3), nEls:els.length,
      nNodes:document.getElementsByTagName('*').length})
  })()`)
  console.log('RECALC::' + recalc)

  // ---- CPU THROTTLE + TRACE DE ROLAGEM ----
  if (THROTTLE > 1) await send('Emulation.setCPUThrottlingRate', { rate: THROTTLE })
  await sleep(600)

  await send('Tracing.start', {
    transferMode: 'ReportEvents',
    traceConfig: {
      recordMode: 'recordAsMuchAsPossible',
      includedCategories: [
        'devtools.timeline', 'disabled-by-default-devtools.timeline',
        'disabled-by-default-devtools.timeline.frame', 'blink.user_timing',
        'latencyInfo', 'benchmark', 'rail', 'v8.execute',
      ],
    },
  })

  // rolagem programada, em passos, ~7 s cobrindo a pagina inteira
  await ev(`(()=>{document.documentElement.style.scrollBehavior='auto';window.__frames=[];
    window.__t0=performance.now();
    (function loop(t){window.__frames.push(t); if(performance.now()-window.__t0<9000) requestAnimationFrame(loop)})(performance.now());
  })()`)

  const docH = JSON.parse(hidratou).docH
  const passos = 60
  for (let i = 0; i < passos; i++) {
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel', x: 215, y: 500, deltaX: 0,
      deltaY: Math.round((docH - 932) / passos), modifiers: 0,
    })
    await sleep(110)
  }
  await sleep(500)

  const frames = await ev(`(()=>{const f=window.__frames; const d=[]; for(let i=1;i<f.length;i++) d.push(f[i]-f[i-1]);
    d.sort((a,b)=>a-b);
    const q=p=>d.length?+d[Math.min(d.length-1,Math.floor(d.length*p))].toFixed(2):0
    return JSON.stringify({n:d.length, fps:+(d.length/((f[f.length-1]-f[0])/1000)).toFixed(1),
      p50:q(.5),p75:q(.75),p95:q(.95),p99:q(.99),max:+(d[d.length-1]||0).toFixed(2),
      acima16:d.filter(x=>x>16.7).length, acima33:d.filter(x=>x>33).length})})()`)
  console.log('FRAMES::' + frames)

  const largura = await ev(`JSON.stringify({scrollW:document.documentElement.scrollWidth,
    bodyScrollW:document.body.scrollWidth, innerW:innerWidth,
    revOn:document.querySelectorAll('.rev-on').length, rev:document.querySelectorAll('.rev').length})`)
  console.log('LARGURA::' + largura)

  await send('Tracing.end')
  for (let i = 0; i < 200 && !evts.includes('DONE'); i++) await sleep(100)

  // ---- AGREGA O TRACE ----
  const por = {}
  let rendererPid = null, mainTid = null
  for (const e of traceChunks) {
    if (e.name === 'thread_name' && e.args?.name === 'CrRendererMain') { rendererPid = e.pid; mainTid = e.tid }
  }
  const dur = {}
  let frameCount = 0
  const longTasks = []
  for (const e of traceChunks) {
    if (e.ph === 'X' && e.pid === rendererPid && e.tid === mainTid && typeof e.dur === 'number') {
      dur[e.name] = (dur[e.name] || 0) + e.dur / 1000
      por[e.name] = (por[e.name] || 0) + 1
      if (e.name === 'RunTask' && e.dur > 50000) longTasks.push(+(e.dur / 1000).toFixed(1))
    }
    if (e.name === 'DrawFrame' || e.name === 'BeginFrame') frameCount++
  }
  const ordenado = Object.entries(dur).sort((a, b) => b[1] - a[1]).slice(0, 22)
    .map(([k, v]) => ({ evento: k, msTotal: +v.toFixed(1), n: por[k], msMedio: +(v / por[k]).toFixed(3) }))
  const saida = { url: URL, throttle: THROTTLE, estado: JSON.parse(hidratou),
    seda: JSON.parse(bench), recalc: JSON.parse(recalc), frames: JSON.parse(frames),
    largura: JSON.parse(largura), trace: ordenado, longTasks: longTasks.slice(0, 20) }
  fs.writeFileSync(OUT, JSON.stringify(saida, null, 2))
  console.log('TRACE::' + JSON.stringify(ordenado))
  console.log('LONGTASKS::' + JSON.stringify(longTasks.slice(0, 20)))
  chrome.kill(); process.exit(0)
})().catch(e => { console.error('FALHA', e); try { chrome.kill() } catch {} ; process.exit(1) })
