/* MAPA DE ARMADILHAS — varre o DOM vivo e lista:
   1. todo scroll container (sequestra view())
   2. todo containing block de position:fixed
   3. todo elemento com animation-timeline atual e a fonte dele
   4. quem tem @keyframes/animate-* do Tailwind junto de animation-timeline */
const PORT = 9522
const { spawn } = require('child_process'); const http = require('http'); const fs = require('fs')
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=500,932',
  '--user-data-dir=/tmp/cdpprof-mp', '--no-first-run', 'about:blank'], { stdio: 'ignore' })
const req = (p, m = 'GET') => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: m }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)) } catch (e) { rej(e) } }) }); r.on('error', rej); r.end() })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const LARG = Number(process.argv[2] || 430)
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
  await send('Emulation.setDeviceMetricsOverride', { width: LARG, height: 932, deviceScaleFactor: 2, mobile: LARG < 900, screenWidth: LARG, screenHeight: 932 })
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r.exceptionDetails ? 'ERRO:' + (r.exceptionDetails.exception?.description || '').slice(0, 400) : r.result.value }
  await sleep(9000)
  const out = await ev(`(() => {
    const nome = e => { if (!e) return 'null'; if (e === document.scrollingElement) return 'html(documento)'
      const c = typeof e.className === 'string' ? e.className.trim().split(/\\s+/).slice(0,4).join('.') : ''
      return e.tagName.toLowerCase() + (e.id ? '#'+e.id : '') + (c ? '.'+c : '') }
    const caminho = e => { const p=[]; let n=e; while(n && n!==document.body){ p.unshift(nome(n)); n=n.parentElement } return p.join(' > ') }
    const scrollers = [], blocosFixos = [], comTimeline = []
    for (const e of document.querySelectorAll('*')) {
      const s = getComputedStyle(e)
      // 1. scroll container: overflow diferente de visible E de clip
      const ehScroller = ['auto','scroll','hidden','overlay'].includes(s.overflowX) || ['auto','scroll','hidden','overlay'].includes(s.overflowY)
      if (ehScroller) scrollers.push({ el: nome(e), overflowX: s.overflowX, overflowY: s.overflowY,
        rolaX: e.scrollWidth > e.clientWidth, rolaY: e.scrollHeight > e.clientHeight, caminho: caminho(e) })
      // 2. containing block de position:fixed
      const cria = (s.transform !== 'none') || (s.perspective !== 'none') || (s.filter !== 'none') ||
                   (s.backdropFilter && s.backdropFilter !== 'none') || (s.willChange||'').match(/transform|perspective|filter/) ||
                   (s.contain||'').match(/paint|layout|strict|content/) || (s.containerType && s.containerType !== 'normal')
      if (cria && e.tagName !== 'HTML') blocosFixos.push({ el: nome(e), transform: s.transform !== 'none',
        perspective: s.perspective, filter: s.filter, backdrop: s.backdropFilter, willChange: s.willChange,
        contain: s.contain, containerType: s.containerType })
      // 3. animation-timeline em uso
      if (s.animationTimeline && s.animationTimeline !== 'auto' && s.animationTimeline !== 'none')
        comTimeline.push({ el: nome(e), timeline: s.animationTimeline, range: s.animationRange,
          nomeAnim: s.animationName, duracao: s.animationDuration })
    }
    // animacoes ATIVAS e a fonte de cada uma
    const ativas = {}
    for (const a of document.getAnimations()) {
      const alvo = a.effect && a.effect.target ? nome(a.effect.target) + (a.effect.pseudoElement || '') : '?'
      const k = (a.animationName || a.constructor.name) + ' @ ' + alvo
      ativas[k] = ativas[k] || { n: 0, linha: a.timeline ? a.timeline.constructor.name : 'null',
        fonte: a.timeline && a.timeline.source ? nome(a.timeline.source) : '-' }
      ativas[k].n++
    }
    return JSON.stringify({ larguraDoc: document.documentElement.scrollWidth, innerW: innerWidth,
      alturaDoc: document.documentElement.scrollHeight,
      nElementos: document.querySelectorAll('*').length,
      scrollers, blocosFixos, comTimeline: comTimeline.slice(0,10), nComTimeline: comTimeline.length, ativas }, null, 1)
  })()`)
  console.log(out)
  fs.writeFileSync('/Users/gabrieldiogosilva/site-melhorado/medicao/mapa-' + LARG + '.json', out)
  chrome.kill(); process.exit(0)
})().catch(e => { console.error('FALHA', e); try { chrome.kill() } catch {}; process.exit(1) })
