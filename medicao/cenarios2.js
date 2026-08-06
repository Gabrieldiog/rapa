/* CUSTO MARGINAL, COM A SEDA NEUTRALIZADA — Rapa Sound */
const PORT = 9455
const { spawn } = require('child_process')
const http = require('http'); const fs = require('fs')
const THROTTLE = Number(process.argv[2] || 6)

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=500,932',
  '--user-data-dir=/tmp/cdpprof-cen2', '--no-first-run',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank',
], { stdio: 'ignore' })
const req = (p, m = 'GET') => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: m }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)) } catch (e) { rej(e) } })
  }); r.on('error', rej); r.end()
})
const sleep = ms => new Promise(r => setTimeout(r, ms))

const OFF = `document.querySelector('canvas').style.display='none';`
const CEN = {
  ctrl:            `${OFF}1`,
  view60:          `${OFF}window.__mk(60,'t');1`,
  view200:         `${OFF}window.__mk(200,'t');1`,
  view400:         `${OFF}window.__mk(400,'t');1`,
  prop60:          `${OFF}window.__mk(60,'p');1`,
  prop200:         `${OFF}window.__mk(200,'p');1`,
  blur20:          `${OFF}window.__mk(20,'b');1`,
  sombra60:        `${OFF}window.__mk(60,'s');1`,
  escala60:        `${OFF}window.__mk(60,'e');1`,
  clip60:          `${OFF}window.__mk(60,'c');1`,
  parallaxJS12:    `${OFF}window.__parallax(12);1`,
  parallaxView12:  `${OFF}window.__mk(12,'x');1`,
  parallaxView12G: `${OFF}window.__mk(12,'X');1`,  // deslocamento GRANDE: testa scrollWidth
  vidro:           `${OFF}window.__vidro();1`,
  // SEDA em variantes de custo
  seda160:         `window.__seda(160);1`,
  seda100:         `window.__seda(100);1`,
  sedaOriginal:    `1`,
}

const PREP = `
window.__mk = (n, modo) => {
  const alvos = [...document.querySelectorAll('section, .card, li, h2, h3, p, img, dt, dd, summary')]
  const st = document.createElement('style')
  st.textContent = \`
    @property --pp { syntax: '<percentage>'; inherits: false; initial-value: 0% }
    @keyframes __t { from { translate: 0 24px; opacity: .001 } to { translate: 0 0; opacity: 1 } }
    @keyframes __p { from { --pp: 0% } to { --pp: 100% } }
    @keyframes __b { from { filter: blur(8px) } to { filter: blur(0px) } }
    @keyframes __s { from { box-shadow: 0 0 0 0 #fff0 } to { box-shadow: 0 18px 40px -10px #0009 } }
    @keyframes __e { from { scale: .92; opacity: .001 } to { scale: 1; opacity: 1 } }
    @keyframes __c { from { clip-path: inset(0 100% 0 0) } to { clip-path: inset(0 0 0 0) } }
    @keyframes __x { from { translate: 0 40px } to { translate: 0 -40px } }
    @keyframes __X { from { translate: 0 300px } to { translate: 0 -300px } }
    .__fx { animation-duration:1s; animation-timing-function:linear; animation-fill-mode:both;
            animation-timeline: view(); animation-range: entry 0% entry 100% }
    .__t{animation-name:__t} .__p{animation-name:__p;background-image:linear-gradient(90deg,#0000 var(--pp),#fff1 var(--pp))}
    .__b{animation-name:__b} .__s{animation-name:__s} .__e{animation-name:__e}
    .__c{animation-name:__c} .__x{animation-name:__x} .__X{animation-name:__X}
  \`
  document.head.appendChild(st)
  let k=0; for (const e of alvos) { if (k>=n) break; e.classList.add('__fx','__'+modo); k++ }
  return k
}
window.__parallax = (n) => {
  const els=[...document.querySelectorAll('section, .card')].slice(0,n); let id=0
  const passo=()=>{id=0;const vh=innerHeight
    for(const e of els){const r=e.getBoundingClientRect()
      e.style.transform='translate3d(0,'+((r.top-vh/2)*-0.06).toFixed(2)+'px,0)'}}
  addEventListener('scroll',()=>{if(!id)id=requestAnimationFrame(passo)},{passive:true}); return els.length
}
window.__vidro = () => {
  const d=document.createElement('div')
  d.style.cssText='position:fixed;inset-inline:0;top:0;height:64px;z-index:99;backdrop-filter:blur(14px) saturate(1.4);background:#09090b66;pointer-events:none'
  document.body.appendChild(d); return 1
}
window.__seda = (lado) => {
  // recria a Seda com outro teto de resolucao, matando a original
  const velho=document.querySelector('canvas'); velho.style.display='none'
  const c=document.createElement('canvas')
  c.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:-10;pointer-events:none'
  document.body.appendChild(c)
  const ctx=c.getContext('2d',{alpha:false})
  const r=c.getBoundingClientRect()
  const esc=Math.min(1,lado/Math.max(r.width,r.height))
  const w=Math.round(r.width*esc), h=Math.round(r.height*esc)
  c.width=w; c.height=h
  const img=ctx.createImageData(w,h), d=img.data
  const G=Math.E, ruido=new Float32Array(w*h)
  for(let y=0;y<h;y++){const ry=G*Math.sin(G*y);for(let x=0;x<w;x++){const rx=G*Math.sin(G*x);ruido[y*w+x]=(rx*ry*(1+x))%1}}
  const E=2,GR=0.8,CH=[9,9,11],CM=[22,22,27],SD=[40,37,48]
  let t=0, ult=0
  const q=(ag)=>{requestAnimationFrame(q); if(ag-ult<1000/30)return; ult=ag
    const tO=0.02*t
    for(let y=0;y<h;y++){const v=(y/h)*E,me=1-Math.abs(y/h-0.5)*2
      const bR=CH[0]+(CM[0]-CH[0])*me,bG=CH[1]+(CM[1]-CH[1])*me,bB=CH[2]+(CM[2]-CH[2])*me
      for(let x=0;x<w;x++){const tx=(x/w)*E,ty=v+0.03*Math.sin(8*tx-tO)
        const pa=0.6+0.4*Math.sin(5*(tx+ty+Math.cos(3*tx+5*ty)+0.02*tO)+Math.sin(20*(tx+ty-0.1*tO)))
        let i=pa-(ruido[y*w+x]/15)*GR; i=i>0?i:0
        const p=(y*w+x)*4
        d[p]=bR+(SD[0]-bR)*i;d[p+1]=bG+(SD[1]-bG)*i;d[p+2]=bB+(SD[2]-bB)*i;d[p+3]=255}}
    ctx.putImageData(img,0,0); t++}
  requestAnimationFrame(q)
  return w+'x'+h+'='+(w*h)
}
1`

;(async () => {
  for (let i = 0; i < 60; i++) { try { await req('/json/version'); break } catch { await sleep(250) } }
  const tgt = await req('/json/new?about:blank', 'PUT')
  const WebSocket = require('/private/tmp/node_modules/ws')
  const ws = new WebSocket(tgt.webSocketDebuggerUrl, { maxPayload: 512 * 1024 * 1024 })
  let id = 0; const pend = new Map(); let chunks = []; let done = false
  ws.on('message', m => { const o = JSON.parse(m)
    if (o.id && pend.has(o.id)) { pend.get(o.id)(o.result || o.error); pend.delete(o.id) }
    if (o.method === 'Tracing.dataCollected') chunks.push(...o.params.value)
    if (o.method === 'Tracing.tracingComplete') done = true })
  const send = (m, p = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })) })
  await new Promise(r => ws.on('open', r))
  await send('Runtime.enable'); await send('Page.enable'); await send('Tracing.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 430, height: 932, deviceScaleFactor: 3, mobile: true, screenWidth: 430, screenHeight: 932 })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r.exceptionDetails ? 'ERRO:' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).slice(0, 200) : r.result.value }

  const R = {}
  for (const [nome, receita] of Object.entries(CEN)) {
    await send('Emulation.setCPUThrottlingRate', { rate: 1 })
    await send('Page.navigate', { url: 'http://localhost:3000' })
    await sleep(8000)
    await ev(PREP)
    const aplicou = await ev(receita)
    const antes = await ev(`JSON.stringify({scrollW:document.documentElement.scrollWidth,bodyW:document.body.scrollWidth,docH:document.documentElement.scrollHeight})`)
    await ev(`document.documentElement.style.scrollBehavior='auto';scrollTo(0,0);1`)
    await sleep(500)
    await send('Emulation.setCPUThrottlingRate', { rate: THROTTLE }); await sleep(400)
    chunks = []; done = false
    await send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { recordMode: 'recordAsMuchAsPossible', includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame'] } })
    await ev(`window.__f=[];window.__t0=performance.now();(function l(t){window.__f.push(t);if(performance.now()-window.__t0<7000)requestAnimationFrame(l)})(performance.now());1`)
    const docH = await ev(`document.documentElement.scrollHeight`)
    for (let i = 0; i < 45; i++) {
      await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 215, y: 500, deltaX: 0, deltaY: Math.round((docH - 932) / 45) })
      await sleep(130)
    }
    await sleep(400)
    const fr = await ev(`(()=>{const f=window.__f,d=[];for(let i=1;i<f.length;i++)d.push(f[i]-f[i-1]);d.sort((a,b)=>a-b)
      const q=p=>d.length?+d[Math.min(d.length-1,Math.floor(d.length*p))].toFixed(1):0
      return JSON.stringify({n:d.length,fps:+(d.length/((f[f.length-1]-f[0])/1000)).toFixed(1),p50:q(.5),p90:q(.9),p95:q(.95),max:+(d[d.length-1]||0).toFixed(1),perdidos:d.filter(x=>x>25).length})})()`)
    const depois = await ev(`JSON.stringify({scrollW:document.documentElement.scrollWidth,bodyW:document.body.scrollWidth,docH:document.documentElement.scrollHeight})`)
    await send('Tracing.end')
    for (let i = 0; i < 150 && !done; i++) await sleep(100)
    let pid = null, tid = null
    for (const e of chunks) if (e.name === 'thread_name' && e.args?.name === 'CrRendererMain') { pid = e.pid; tid = e.tid }
    const d = {}, c = {}
    for (const e of chunks) if (e.ph === 'X' && e.pid === pid && e.tid === tid && typeof e.dur === 'number') { d[e.name] = (d[e.name] || 0) + e.dur / 1000; c[e.name] = (c[e.name] || 0) + 1 }
    const nf = c['Commit'] || 1
    const pf = k => +((d[k] || 0) / nf).toFixed(3)
    R[nome] = { aplicou, frames: JSON.parse(fr), antes: JSON.parse(antes), depois: JSON.parse(depois),
      quadrosCommit: nf,
      msPorQuadro: { rAF: pf('PageAnimator::serviceScriptedAnimations'), recalcEstilo: pf('UpdateLayoutTree'),
        layout: pf('LocalFrameView::layout'), prePaint: pf('PrePaint'), paint: pf('Paint'),
        layerize: pf('Layerize'), commit: pf('Commit'),
        principalTotal: pf('ProxyMain::BeginMainFrame'), tarefas: pf('RunTask') },
      totais: { RunTask: +(d['RunTask'] || 0).toFixed(1), rAF: +(d['PageAnimator::serviceScriptedAnimations'] || 0).toFixed(1),
        UpdateLayoutTree: +(d['UpdateLayoutTree'] || 0).toFixed(1), Paint: +(d['Paint'] || 0).toFixed(1),
        nRecalc: c['UpdateLayoutTree'] || 0, nPaint: c['Paint'] || 0 } }
    console.log(nome + '::' + JSON.stringify(R[nome]))
  }
  fs.writeFileSync(`/Users/gabrieldiogosilva/site-melhorado/medicao/cen2-${THROTTLE}x.json`, JSON.stringify(R, null, 2))
  chrome.kill(); process.exit(0)
})().catch(e => { console.error('FALHA', e); try { chrome.kill() } catch {}; process.exit(1) })
