/* O DEFEITO DOS 1424px: que tipo de deslocamento estica o documento?
   Testa 8 formas de mover coisa e le scrollWidth/scrollHeight.       */
const PORT = 9499
const { spawn } = require('child_process'); const http = require('http')
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=500,932',
  '--user-data-dir=/tmp/cdpprof-lg', '--no-first-run', 'about:blank'], { stdio: 'ignore' })
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
    const M = () => ({ scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight,
                       bodyW: document.body.scrollWidth, innerW: innerWidth })
    const base = M()
    const casos = {}
    const roda = (nome, css, alvoSel) => {
      const alvo = document.querySelector(alvoSel)
      if (!alvo) { casos[nome] = 'alvo ausente'; return }
      const d = document.createElement('div')
      d.style.cssText = 'width:120px;height:60px;background:#f0f4;' + css
      alvo.appendChild(d)
      document.body.offsetHeight
      const m = M()
      casos[nome] = { alvo: alvoSel, scrollW: m.scrollW, dW: m.scrollW - base.scrollW, dH: m.scrollH - base.scrollH,
                      esticou: m.scrollW > base.scrollW }
      d.remove(); document.body.offsetHeight
    }
    // 1. translate (propriedade CSS) horizontal grande, em pai overflow:visible
    roda('translate 400px em #rider (overflow visible)', 'translate: 400px 0;', '#rider')
    // 2. transform translateX grande, em pai overflow:visible
    roda('transform translateX(400px) em #rider', 'transform: translateX(400px);', '#rider')
    // 3. margin-left grande (layout de verdade)
    roda('margin-left 400px em #rider', 'margin-left: 400px;', '#rider')
    // 4. absolute SEM ancestral posicionado -> foge para o bloco inicial
    roda('absolute left:1300px em #rider (nao posicionado?)', 'position:absolute; left:1300px; top:0;', '#rider')
    // 5. absolute dentro de pai POSICIONADO e que recorta
    roda('absolute left:1300px em #servicos (relative+clip)', 'position:absolute; left:1300px; top:0;', '#servicos')
    // 6. absolute dentro do trilho de video (relative + overflow-x auto)
    roda('absolute left:1300px em .trilho', 'position:absolute; left:1300px; top:0;', '.trilho')
    // 7. fixed (nunca estica)
    roda('fixed left:1300px no body', 'position:fixed; left:1300px; top:0;', 'body')
    // 8. translate grande dentro de um pai overflow:clip
    roda('translate 400px em #servicos (overflow clip)', 'translate: 400px 0;', '#servicos')
    // 9. translate VERTICAL grande no fim do documento
    roda('translate 0 600px no footer', 'translate: 0 600px;', 'footer')
    // 10. rotate grande
    roda('rotate 25deg + width 400 em #rider', 'width:400px; rotate: 25deg;', '#rider')
    // quem POSICIONA de fato
    const posicionados = {}
    for (const sel of ['#rider','#servicos','#casamento','#sobre','#eventos','.trilho','.equipe__trilho','body','.bloco__grade','.painel']) {
      const e = document.querySelector(sel)
      posicionados[sel] = e ? { position: getComputedStyle(e).position, overflow: getComputedStyle(e).overflow,
        transform: getComputedStyle(e).transform !== 'none', filter: getComputedStyle(e).filter !== 'none',
        containerType: getComputedStyle(e).containerType, contain: getComputedStyle(e).contain,
        willChange: getComputedStyle(e).willChange } : 'ausente'
    }
    return JSON.stringify({ base, casos, posicionados }, null, 1)
  })()`))
  chrome.kill(); process.exit(0)
})().catch(e => { console.error('FALHA', e); try { chrome.kill() } catch {}; process.exit(1) })
