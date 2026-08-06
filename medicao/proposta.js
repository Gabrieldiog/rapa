/* VALIDACAO DA PROPOSTA — injeta os oito efeitos propostos no DOM real
   e mede. Compara: pagina atual / atual+efeitos / seda-cortada+efeitos  */
const PORT = 9544
const { spawn } = require('child_process'); const http = require('http'); const fs = require('fs')
const THROTTLE = Number(process.argv[2] || 6)
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=500,932',
  '--user-data-dir=/tmp/cdpprof-pr', '--no-first-run',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank'], { stdio: 'ignore' })
const req = (p, m = 'GET') => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: m }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)) } catch (e) { rej(e) } }) }); r.on('error', rej); r.end() })
const sleep = ms => new Promise(r => setTimeout(r, ms))

/* ---------- O CSS DA PROPOSTA, como seria enviado ---------- */
const CSS_PROPOSTA = `
/* consertos estruturais que os efeitos EXIGEM */
.card__foto { overflow: clip !important; }
#casamento { overflow: clip !important; }
.respira { overflow: clip; display: block; }

@keyframes p-sobe   { from { translate: 0 26px; opacity: 0 } to { translate: 0 0; opacity: 1 } }
@keyframes p-assenta{ from { opacity: 0; transform: perspective(900px) translateY(26px) }
                      to   { opacity: 1; transform: perspective(900px) rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg)) } }
@keyframes p-respira{ from { transform: scale(1.08) translateY(-14px) } to { transform: scale(1.08) translateY(14px) } }
@keyframes p-acende { from { scale: .72; opacity: 0 } to { scale: 1; opacity: 1 } }
@keyframes p-varre  { from { translate: -130% 0 } to { translate: 130% 0 } }
@keyframes p-filete { from { transform: scaleX(0) } to { transform: scaleX(1) } }

@supports (animation-timeline: view()) {
 @media (prefers-reduced-motion: no-preference) {

  /* E1 — os 13 cards entram pela ROLAGEM (hoje entram no load) */
  .card { animation: p-assenta linear both; animation-timeline: view();
          animation-range: entry 4% entry 58%; }

  /* E2 — a foto do card respira dentro da moldura */
  .card__foto img { animation: p-respira linear both; animation-timeline: view();
                    animation-range: cover 0% cover 100%; }

  /* E3 — as fotos grandes de 15 anos e casamento respiram */
  .respira > img { animation: p-respira linear both; animation-timeline: view();
                   animation-range: cover 0% cover 100%; }

  /* E4 — os 12 nomes do painel sobem em cascata (escalonado por RANGE) */
  .painel__nome { animation: p-sobe linear both; animation-timeline: view();
                  animation-range: entry calc(6% + var(--i,0) * 2.5%) entry calc(52% + var(--i,0) * 2.5%); }

  /* E5 — o contador de cada categoria do rider acende */
  .rider__conta { display: inline-block; animation: p-acende linear both;
                  animation-timeline: view(); animation-range: entry 18% entry 62%; }

  /* E6 — o sobretitulo e varrido por uma faixa de luz */
  .eyebrow { position: relative; overflow: clip; }
  .eyebrow::after { content:''; position:absolute; inset-block:0; inset-inline:0; z-index:0;
    pointer-events:none;
    background: linear-gradient(100deg, transparent 40%,
      color-mix(in srgb, var(--tubo-cor, var(--color-ambar)) 34%, transparent) 50%, transparent 60%);
    translate: -130% 0;
    animation: p-varre linear both; animation-timeline: view();
    animation-range: entry 0% entry 100%; }

  /* E7 — cada H2 sobe e o filete abre sob ele */
  h2 { animation: p-sobe linear both; animation-timeline: view();
       animation-range: entry 8% entry 55%; }
  h2::after { content:''; display:block; block-size:2px; inline-size:3.5rem;
    margin-block-start:.75rem; background: var(--tubo-cor, var(--color-ambar));
    transform-origin: 0 50%; transform: scaleX(0);
    animation: p-filete linear both; animation-timeline: view();
    animation-range: entry 20% entry 70%; }

  /* E8 — os oito blocos do rider entram por categoria */
  .rider__cat { animation: p-sobe linear both; animation-timeline: view();
                animation-range: entry 10% entry 58%; }
 }
}`

const APLICA = `(() => {
  const st = document.createElement('style'); st.id='__proposta'; st.textContent = ${JSON.stringify(CSS_PROPOSTA)}
  document.head.appendChild(st)
  // --i para o escalonamento dos nomes do painel
  document.querySelectorAll('.painel__nome').forEach((e,i)=>e.style.setProperty('--i', i))
  // as fotos grandes ganham a moldura .respira (o que o JSX faria)
  let env = 0
  for (const sel of ['#quinze-anos img', '#casamento img']) {
    for (const img of document.querySelectorAll(sel)) {
      if (img.closest('.respira') || img.closest('.card')) continue
      const w = document.createElement('span'); w.className = 'respira'
      w.style.cssText = 'display:block;overflow:clip;border-radius:inherit'
      img.replaceWith(w); w.appendChild(img); env++
    }
  }
  document.body.offsetHeight
  const comTimeline = [...document.querySelectorAll('*')].filter(e=>{
    const s=getComputedStyle(e); return s.animationTimeline && s.animationTimeline!=='auto' && s.animationTimeline!=='none'}).length
  const anims = document.getAnimations()
  const porFonte = {}
  for (const a of anims) { const f = a.timeline ? (a.timeline.constructor.name + (a.timeline.source ? (a.timeline.source===document.scrollingElement?'/html':'/'+a.timeline.source.tagName) : '')) : 'null'
    porFonte[f] = (porFonte[f]||0)+1 }
  return JSON.stringify({ envolvidas: env, elementosComTimeline: comTimeline, totalAnimacoes: anims.length, porFonte })
})()`

const SEDA_CORTA = `(() => {
  const c = document.querySelector('canvas'); if(!c) return 'sem canvas'
  // mesma matematica, TETO de resolucao menor: 110 em vez de 300
  const r = c.getBoundingClientRect()
  const esc = Math.min(1, 110/Math.max(r.width, r.height))
  const w = Math.round(r.width*esc), h = Math.round(r.height*esc)
  return 'novo buffer ' + w + 'x' + h + ' = ' + (w*h) + 'px (era 138x300 = 41400)'
})()`

;(async () => {
  for (let i = 0; i < 60; i++) { try { await req('/json/version'); break } catch { await sleep(250) } }
  const tgt = await req('/json/new?about:blank', 'PUT')
  const WebSocket = require('/private/tmp/node_modules/ws')
  const ws = new WebSocket(tgt.webSocketDebuggerUrl, { maxPayload: 1 << 28 })
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
  await send('Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' })
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r.exceptionDetails ? 'ERRO:' + (r.exceptionDetails.exception?.description || '').slice(0, 400) : r.result.value }

  const CEN = {
    'A_pagina_atual':            { seda: 'normal', efeitos: false },
    'B_atual_mais_8_efeitos':    { seda: 'normal', efeitos: true },
    'C_seda110_mais_8_efeitos':  { seda: 110,      efeitos: true },
    'D_seda110_sem_efeitos':     { seda: 110,      efeitos: false },
    'E_sem_seda_mais_8_efeitos': { seda: 'off',    efeitos: true },
  }
  const R = {}
  for (const [nome, cfg] of Object.entries(CEN)) {
    await send('Emulation.setCPUThrottlingRate', { rate: 1 })
    await send('Page.navigate', { url: 'http://localhost:3000' })
    await sleep(8500)
    let info = null
    if (cfg.seda === 'off') await ev(`document.querySelector('canvas').style.display='none';1`)
    else if (typeof cfg.seda === 'number') {
      // recria a seda com teto menor, matando a original
      await ev(`(()=>{const v=document.querySelector('canvas'); v.style.display='none'
        const c=document.createElement('canvas'); c.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:-10;pointer-events:none'
        document.body.appendChild(c); const ctx=c.getContext('2d',{alpha:false}); const r=c.getBoundingClientRect()
        const e=Math.min(1,${cfg.seda}/Math.max(r.width,r.height)); const w=Math.round(r.width*e),h=Math.round(r.height*e)
        c.width=w;c.height=h; const img=ctx.createImageData(w,h),d=img.data
        const G=Math.E,ru=new Float32Array(w*h)
        for(let y=0;y<h;y++){const ry=G*Math.sin(G*y);for(let x=0;x<w;x++){const rx=G*Math.sin(G*x);ru[y*w+x]=(rx*ry*(1+x))%1}}
        const E=2,GR=.8,CH=[9,9,11],CM=[22,22,27],SD=[40,37,48];let t=0,u=0
        const q=(a)=>{requestAnimationFrame(q);if(a-u<1000/30)return;u=a;const tO=.02*t
          for(let y=0;y<h;y++){const v2=(y/h)*E,me=1-Math.abs(y/h-.5)*2
            const bR=CH[0]+(CM[0]-CH[0])*me,bG=CH[1]+(CM[1]-CH[1])*me,bB=CH[2]+(CM[2]-CH[2])*me
            for(let x=0;x<w;x++){const tx=(x/w)*E,ty=v2+.03*Math.sin(8*tx-tO)
              const pa=.6+.4*Math.sin(5*(tx+ty+Math.cos(3*tx+5*ty)+.02*tO)+Math.sin(20*(tx+ty-.1*tO)))
              let i=pa-(ru[y*w+x]/15)*GR;i=i>0?i:0;const p=(y*w+x)*4
              d[p]=bR+(SD[0]-bR)*i;d[p+1]=bG+(SD[1]-bG)*i;d[p+2]=bB+(SD[2]-bB)*i;d[p+3]=255}}
          ctx.putImageData(img,0,0);t++}
        requestAnimationFrame(q); window.__novoBuffer=w+'x'+h+'='+(w*h)})()`)
      info = await ev(`window.__novoBuffer`)
    }
    let aplic = null
    if (cfg.efeitos) aplic = await ev(APLICA)
    const largAntes = await ev(`JSON.stringify({scrollW:document.documentElement.scrollWidth, innerW:innerWidth, docH:document.documentElement.scrollHeight})`)
    await ev(`document.documentElement.style.scrollBehavior='auto';scrollTo(0,0);1`); await sleep(500)
    await send('Emulation.setCPUThrottlingRate', { rate: THROTTLE }); await sleep(400)
    chunks = []; done = false
    await send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { recordMode: 'recordAsMuchAsPossible', includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame'] } })
    await ev(`window.__f=[];window.__t0=performance.now();(function l(t){window.__f.push(t);if(performance.now()-window.__t0<7000)requestAnimationFrame(l)})(performance.now());1`)
    const docH = await ev(`document.documentElement.scrollHeight`)
    let larguraMax = 0
    for (let i = 0; i < 45; i++) {
      await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 215, y: 500, deltaX: 0, deltaY: Math.round((docH - 932) / 45) })
      await sleep(130)
      if (i % 9 === 0) { const w = await ev(`document.documentElement.scrollWidth`); if (w > larguraMax) larguraMax = w }
    }
    await sleep(400)
    const fr = await ev(`(()=>{const f=window.__f,d=[];for(let i=1;i<f.length;i++)d.push(f[i]-f[i-1]);d.sort((a,b)=>a-b)
      const q=p=>d.length?+d[Math.min(d.length-1,Math.floor(d.length*p))].toFixed(1):0
      return JSON.stringify({n:d.length,fps:+(d.length/((f[f.length-1]-f[0])/1000)).toFixed(1),p50:q(.5),p90:q(.9),p95:q(.95),
        max:+(d[d.length-1]||0).toFixed(1),perdidos:d.filter(x=>x>25).length})})()`)
    await send('Tracing.end')
    for (let i = 0; i < 150 && !done; i++) await sleep(100)
    let pid = null, tid = null
    for (const e of chunks) if (e.name === 'thread_name' && e.args?.name === 'CrRendererMain') { pid = e.pid; tid = e.tid }
    const d = {}, c = {}
    for (const e of chunks) if (e.ph === 'X' && e.pid === pid && e.tid === tid && typeof e.dur === 'number') { d[e.name] = (d[e.name] || 0) + e.dur / 1000; c[e.name] = (c[e.name] || 0) + 1 }
    const nf = c['Commit'] || 1
    R[nome] = { info, aplic: aplic ? JSON.parse(aplic) : null, frames: JSON.parse(fr),
      largura: JSON.parse(largAntes), larguraMaxDurante: larguraMax, quadros: nf,
      msPorQuadro: { rAF: +((d['PageAnimator::serviceScriptedAnimations'] || 0) / nf).toFixed(3),
        recalcEstilo: +((d['UpdateLayoutTree'] || 0) / nf).toFixed(3),
        paint: +((d['Paint'] || 0) / nf).toFixed(3),
        commit: +((d['Commit'] || 0) / nf).toFixed(3),
        tarefaTotal: +((d['RunTask'] || 0) / nf).toFixed(3) },
      contagens: { recalc: c['UpdateLayoutTree'] || 0, paint: c['Paint'] || 0, layout: c['LocalFrameView::layout'] || 0 },
      totais: { RunTask: +(d['RunTask'] || 0).toFixed(1), rAF: +(d['PageAnimator::serviceScriptedAnimations'] || 0).toFixed(1) } }
    console.log(nome + ' :: ' + JSON.stringify(R[nome]))
  }
  fs.writeFileSync(`/Users/gabrieldiogosilva/site-melhorado/medicao/proposta-${THROTTLE}x.json`, JSON.stringify(R, null, 2))
  chrome.kill(); process.exit(0)
})().catch(e => { console.error('FALHA', e); try { chrome.kill() } catch {}; process.exit(1) })
