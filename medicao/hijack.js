/* PROVA DE SEQUESTRO DE view() — Rapa Sound
   Injeta a MESMA animacao view() dentro de tres ancestrais diferentes e
   compara o progresso em varias posicoes de rolagem.                */
const PORT = 9477
const { spawn } = require('child_process'); const http = require('http')
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=500,932',
  '--user-data-dir=/tmp/cdpprof-hj', '--no-first-run', 'about:blank'], { stdio: 'ignore' })
const req = (p, m = 'GET') => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: m }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)) } catch (e) { rej(e) } })
  }); r.on('error', rej); r.end() })
const sleep = ms => new Promise(r => setTimeout(r, ms))
;(async () => {
  for (let i = 0; i < 60; i++) { try { await req('/json/version'); break } catch { await sleep(250) } }
  const tgt = await req('/json/new?' + encodeURIComponent('http://localhost:3000'), 'PUT')
  const WebSocket = require('/private/tmp/node_modules/ws')
  const ws = new WebSocket(tgt.webSocketDebuggerUrl, { maxPayload: 1 << 28 })
  let id = 0; const pend = new Map()
  ws.on('message', m => { const o = JSON.parse(m); if (o.id && pend.has(o.id)) { pend.get(o.id)(o.result || o.error); pend.delete(o.id) } })
  const send = (m, p = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })) })
  await new Promise(r => ws.on('open', r))
  await send('Runtime.enable'); await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 430, height: 932, deviceScaleFactor: 2, mobile: true, screenWidth: 430, screenHeight: 932 })
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r.exceptionDetails ? 'ERRO:' + (r.exceptionDetails.exception?.description || '').slice(0, 300) : r.result.value }
  await sleep(9000)

  console.log(await ev(`(() => {
    const st = document.createElement('style')
    st.textContent = \`@keyframes __hj { from { translate: 0 100px } to { translate: 0 0 } }
      .__hj { display:block; height:8px; background:#f0f; animation: __hj 1s linear both;
              animation-timeline: view(); animation-range: entry 0% entry 100%; }\`
    document.head.appendChild(st)
    const por = (sel) => { const p = document.querySelector(sel); if (!p) return 'sem '+sel
      const d = document.createElement('div'); d.className='__hj'; d.dataset.hj=sel; p.appendChild(d); return 'ok' }
    return JSON.stringify({
      dentroCasamento: por('#casamento'),           // overflow: hidden  <- suspeito
      dentroTrilhoVideo: por('.trilho'),            // overflow-x: auto  <- suspeito
      dentroEquipeTrilho: por('.equipe__trilho'),   // overflow-x: auto  <- suspeito
      dentroServicos: por('#servicos'),             // overflow: clip    <- controle bom
      dentroRider: por('#rider'),                   // sem overflow      <- controle bom
      dentroRolo: (()=>{const p=document.querySelector('.rolo__col'); if(!p) return 'sem .rolo__col'
        const d=document.createElement('div'); d.className='__hj'; d.dataset.hj='.rolo__col'; p.appendChild(d); return 'ok'})(),
    })})()`))

  const leitura = async (y) => {
    await ev(`document.documentElement.style.scrollBehavior='auto';scrollTo(0,${y});1`)
    await sleep(450)
    return await ev(`(() => {
      const out = {}
      for (const d of document.querySelectorAll('.__hj')) {
        const a = d.getAnimations()[0]
        const r = d.getBoundingClientRect()
        out[d.dataset.hj] = {
          topo: Math.round(r.top),
          progresso: a ? (a.effect.getComputedTiming().progress === null ? null : +a.effect.getComputedTiming().progress.toFixed(3)) : 'sem anim',
          translate: getComputedStyle(d).translate,
          linhaDoTempo: a ? (a.timeline && a.timeline.constructor ? a.timeline.constructor.name : '?') : '-',
        }
      }
      return JSON.stringify(out)})()`)
  }
  for (const y of [0, 2000, 4000, 6000, 9000, 12000, 15000]) {
    console.log('y=' + y + ' :: ' + await leitura(y))
  }
  console.log('LARGURA_FINAL :: ' + await ev(`JSON.stringify({scrollW:document.documentElement.scrollWidth,innerW:innerWidth})`))
  chrome.kill(); process.exit(0)
})().catch(e => { console.error('FALHA', e); try { chrome.kill() } catch {}; process.exit(1) })
