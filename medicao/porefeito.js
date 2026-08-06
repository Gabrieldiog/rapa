/* CUSTO DE CADA EFEITO, ISOLADO, com a Seda desligada (base limpa) */
const PORT = 9566
const { spawn } = require('child_process'); const http = require('http'); const fs = require('fs')
const THROTTLE = 6
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=500,932',
  '--user-data-dir=/tmp/cdpprof-pe', '--no-first-run',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank'], { stdio: 'ignore' })
const req = (p, m = 'GET') => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: m }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)) } catch (e) { rej(e) } }) }); r.on('error', rej); r.end() })
const sleep = ms => new Promise(r => setTimeout(r, ms))

const BASE = `
@keyframes p-sobe   { from { translate: 0 26px; opacity: 0 } to { translate: 0 0; opacity: 1 } }
@keyframes p-assenta{ from { opacity: 0; transform: perspective(900px) translateY(26px) }
                      to   { opacity: 1; transform: perspective(900px) rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg)) } }
@keyframes p-respira{ from { transform: scale(1.08) translateY(-14px) } to { transform: scale(1.08) translateY(14px) } }
@keyframes p-acende { from { scale: .72; opacity: 0 } to { scale: 1; opacity: 1 } }
@keyframes p-varre  { from { translate: -130% 0 } to { translate: 130% 0 } }
@keyframes p-filete { from { transform: scaleX(0) } to { transform: scaleX(1) } }
`
const EF = {
  E1_cards_entram: `.card { animation: p-assenta linear both; animation-timeline: view(); animation-range: entry 4% entry 58% }`,
  E2_foto_card_respira: `.card__foto { overflow: clip !important }
    .card__foto img { animation: p-respira linear both; animation-timeline: view(); animation-range: cover 0% cover 100% }`,
  E3_fotos_grandes_respiram: `.respira { display:block; overflow: clip }
    .respira > img { animation: p-respira linear both; animation-timeline: view(); animation-range: cover 0% cover 100% }`,
  E4_nomes_painel_cascata: `.painel__nome { animation: p-sobe linear both; animation-timeline: view();
    animation-range: entry calc(6% + var(--i,0) * 2.5%) entry calc(52% + var(--i,0) * 2.5%) }`,
  E5_contador_rider_acende: `.rider__conta { display:inline-block; animation: p-acende linear both;
    animation-timeline: view(); animation-range: entry 18% entry 62% }`,
  E6_eyebrow_varrida: `.eyebrow { position: relative; overflow: clip }
    .eyebrow::after { content:''; position:absolute; inset-block:0; inset-inline:0; z-index:0; pointer-events:none;
      background: linear-gradient(100deg, transparent 40%, color-mix(in srgb, var(--tubo-cor, var(--color-ambar)) 34%, transparent) 50%, transparent 60%);
      translate: -130% 0; animation: p-varre linear both; animation-timeline: view(); animation-range: entry 0% entry 100% }`,
  E7a_h2_sobe: `h2 { animation: p-sobe linear both; animation-timeline: view(); animation-range: entry 8% entry 55% }`,
  E7b_filete_sob_h2: `h2::after { content:''; display:block; block-size:2px; inline-size:3.5rem; margin-block-start:.75rem;
    background: var(--tubo-cor, var(--color-ambar)); transform-origin: 0 50%; transform: scaleX(0);
    animation: p-filete linear both; animation-timeline: view(); animation-range: entry 20% entry 70% }`,
  E8_rider_cat_entra: `.rider__cat { animation: p-sobe linear both; animation-timeline: view(); animation-range: entry 10% entry 58% }`,
  Z_controle: ``,
}

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
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r.exceptionDetails ? 'ERRO:' + (r.exceptionDetails.exception?.description || '').slice(0, 300) : r.result.value }
  const R = {}
  for (const [nome, regra] of Object.entries(EF)) {
    await send('Emulation.setCPUThrottlingRate', { rate: 1 })
    await send('Page.navigate', { url: 'http://localhost:3000' }); await sleep(8500)
    await ev(`document.querySelector('canvas').style.display='none';1`)
    const n = await ev(`(() => {
      const st=document.createElement('style')
      st.textContent = ${JSON.stringify(BASE)} + '@supports (animation-timeline: view()){@media (prefers-reduced-motion: no-preference){' + ${JSON.stringify(regra)} + '}}'
      document.head.appendChild(st)
      document.querySelectorAll('.painel__nome').forEach((e,i)=>e.style.setProperty('--i',i))
      for (const sel of ['#quinze-anos img','#casamento img']) for (const img of document.querySelectorAll(sel)) {
        if (img.closest('.respira')||img.closest('.card')) continue
        const w=document.createElement('span'); w.className='respira'; img.replaceWith(w); w.appendChild(img) }
      document.body.offsetHeight
      return document.getAnimations().filter(a=>a.timeline && a.timeline.constructor.name==='ViewTimeline').length })()`)
    await ev(`document.documentElement.style.scrollBehavior='auto';scrollTo(0,0);1`); await sleep(500)
    await send('Emulation.setCPUThrottlingRate', { rate: THROTTLE }); await sleep(400)
    chunks = []; done = false
    await send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { recordMode: 'recordAsMuchAsPossible', includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame'] } })
    await ev(`window.__f=[];window.__t0=performance.now();(function l(t){window.__f.push(t);if(performance.now()-window.__t0<7000)requestAnimationFrame(l)})(performance.now());1`)
    const docH = await ev(`document.documentElement.scrollHeight`)
    for (let i = 0; i < 45; i++) { await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 215, y: 500, deltaX: 0, deltaY: Math.round((docH - 932) / 45) }); await sleep(130) }
    await sleep(400)
    const fr = await ev(`(()=>{const f=window.__f,d=[];for(let i=1;i<f.length;i++)d.push(f[i]-f[i-1]);d.sort((a,b)=>a-b)
      const q=p=>d.length?+d[Math.min(d.length-1,Math.floor(d.length*p))].toFixed(1):0
      return JSON.stringify({fps:+(d.length/((f[f.length-1]-f[0])/1000)).toFixed(1),p50:q(.5),p90:q(.9),p95:q(.95),max:+(d[d.length-1]||0).toFixed(1),perdidos:d.filter(x=>x>25).length})})()`)
    const larg = await ev(`document.documentElement.scrollWidth`)
    await send('Tracing.end'); for (let i = 0; i < 150 && !done; i++) await sleep(100)
    let pid = null, tid = null
    for (const e of chunks) if (e.name === 'thread_name' && e.args?.name === 'CrRendererMain') { pid = e.pid; tid = e.tid }
    const d = {}, c = {}
    for (const e of chunks) if (e.ph === 'X' && e.pid === pid && e.tid === tid && typeof e.dur === 'number') { d[e.name] = (d[e.name] || 0) + e.dur / 1000; c[e.name] = (c[e.name] || 0) + 1 }
    const nf = c['Commit'] || 1
    R[nome] = { nAnims: n, scrollW: larg, frames: JSON.parse(fr), quadros: nf,
      msQuadro: +((d['RunTask'] || 0) / nf).toFixed(3),
      recalcMs: +((d['UpdateLayoutTree'] || 0) / nf).toFixed(3), nRecalc: c['UpdateLayoutTree'] || 0,
      paintMs: +((d['Paint'] || 0) / nf).toFixed(3), nPaint: c['Paint'] || 0,
      totalRunTask: +(d['RunTask'] || 0).toFixed(1) }
    console.log(nome + ' :: ' + JSON.stringify(R[nome]))
  }
  fs.writeFileSync('/Users/gabrieldiogosilva/site-melhorado/medicao/porefeito.json', JSON.stringify(R, null, 2))
  chrome.kill(); process.exit(0)
})().catch(e => { console.error('FALHA', e); try { chrome.kill() } catch {}; process.exit(1) })
