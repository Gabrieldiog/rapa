/* QUEM E A FONTE DA ViewTimeline — prova direta */
const PORT = 9488
const { spawn } = require('child_process'); const http = require('http')
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=500,932',
  '--user-data-dir=/tmp/cdpprof-fo', '--no-first-run', 'about:blank'], { stdio: 'ignore' })
const req = (p, m = 'GET') => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: m }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)) } catch (e) { rej(e) } }) }); r.on('error', rej); r.end() })
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
    const nome = e => !e ? 'null' : (e === document.scrollingElement ? 'scrollingElement(<html>)' :
      e.tagName + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/).slice(0,3).join('.') : ''))
    const st = document.createElement('style')
    st.textContent = '@keyframes __f { from { translate: 0 60px } to { translate: 0 0 } } .__f { display:block;height:6px; animation: __f 1s linear both; animation-timeline: view(); animation-range: entry 0% entry 100% }'
    document.head.appendChild(st)
    const alvos = ['#casamento','#servicos','#rider','.trilho','.equipe__trilho','#eventos','header#conteudo','.registro','.painel','.card']
    const out = {}
    for (const sel of alvos) {
      const p = document.querySelector(sel); if (!p) { out[sel]='ausente'; continue }
      const cs = getComputedStyle(p)
      const d = document.createElement('div'); d.className='__f'; p.appendChild(d)
      const a = d.getAnimations()[0]
      out[sel] = { overflowPai: cs.overflow, overflowX: cs.overflowX, overflowY: cs.overflowY,
        fonteDaLinha: a && a.timeline ? nome(a.timeline.source) : 'sem anim',
        temScrollX: p.scrollWidth > p.clientWidth, temScrollY: p.scrollHeight > p.clientHeight,
        transformPai: cs.transform, filterPai: cs.filter, containPai: cs.contain, perspectivaPai: cs.perspective }
      d.remove()
    }
    // e as animacoes REAIS que ja existem na pagina
    const reais = {}
    const c = document.querySelector('.card')
    if (c) { const as = c.getAnimations({subtree:true})
      reais.card = as.map(a => ({ nome: a.animationName || '?', alvo: a.effect?.pseudoElement || 'elemento',
        linha: a.timeline ? a.timeline.constructor.name : 'null',
        fonte: a.timeline && a.timeline.source ? nome(a.timeline.source) : '-' })) }
    const pv = document.querySelector('.painel__varre')
    if (pv) { const as = pv.getAnimations()
      reais.painelVarre = as.map(a => ({ nome: a.animationName, linha: a.timeline ? a.timeline.constructor.name : 'null',
        fonte: a.timeline && a.timeline.source ? nome(a.timeline.source) : '-' })) }
    return JSON.stringify({ out, reais }, null, 1)
  })()`))
  chrome.kill(); process.exit(0)
})().catch(e => { console.error('FALHA', e); try { chrome.kill() } catch {}; process.exit(1) })
