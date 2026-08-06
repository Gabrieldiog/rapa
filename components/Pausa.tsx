'use client'

import { useEffect, useState } from 'react'

/**
 * O CONTROLE DE PAUSA.
 *
 * NÃO É ENFEITE DE ACESSIBILIDADE — é o único item da página com
 * exposição jurídica. O critério 2.2.2 da WCAG é NÍVEL A e diz:
 * conteúdo em movimento que começa sozinho, dura mais de cinco
 * segundos e aparece em paralelo com outro conteúdo precisa de um
 * mecanismo para PAUSAR, PARAR OU ESCONDER — e o mecanismo tem que
 * estar na página, ao alcance de quem usa. `prefers-reduced-motion`
 * não fecha esse critério: a técnica que o usa é de 2.3.3, que é AAA.
 *
 * A página falha em dois lugares hoje, e nenhum é pequeno:
 *  - a varredura da palavra "marcantes" no H1: `infinite`, começa
 *    sozinha 1,2 s depois do carregamento e nunca para. O
 *    `PausaLed` existente só a pausa quando ela sai da tela, o que
 *    não é mecanismo do usuário — é economia de quadro.
 *  - a seda do fundo: campo contínuo, `fixed inset-0`, nunca sai da
 *    tela e nunca para.
 *
 * Um botão só fecha os dois. Ele mora no rodapé, ao lado do "©", que
 * é onde a convenção põe controles de página, e é alcançável por Tab
 * como qualquer outro link.
 *
 * A ESCOLHA FICA GUARDADA. Quem pediu para parar não quer pedir de
 * novo a cada página que abre — e este site é uma página só, então
 * "de novo" quer dizer "toda vez que voltar".
 */

const CHAVE = 'rs-parado'

export function Pausa() {
  const [parado, setParado] = useState(false)

  /* ELE VAI NO HTML SERVIDO, sempre. A primeira versão só o
     renderizava depois de montar, para não deixar um controle morto na
     tela antes da hidratação — e isso estava errado pelo motivo que
     mais importa: um mecanismo que o critério 2.2.2 EXIGE não pode
     depender de o JavaScript chegar. A varredura da palavra
     "marcantes" é animação de CSS: ela roda com ou sem JS. Se o botão
     não estiver lá, ela roda sem saída. */
  useEffect(() => {
    let guardado = false
    try { guardado = localStorage.getItem(CHAVE) === '1' } catch { /* modo privado */ }
    if (guardado) {
      setParado(true)
      document.documentElement.setAttribute('data-parado', '')
      window.dispatchEvent(new Event('rs-pausa'))
    }
  }, [])

  const alternar = () => {
    const novo = !parado
    setParado(novo)
    document.documentElement.toggleAttribute('data-parado', novo)
    try { localStorage.setItem(CHAVE, novo ? '1' : '0') } catch { /* modo privado */ }
    /* a seda é canvas: CSS não a alcança. Ela ouve este evento e para
       o próprio laço, deixando o último quadro pintado na tela — o
       fundo continua lá, só para de se mexer. */
    window.dispatchEvent(new Event('rs-pausa'))
  }

  return (
    <button type="button" onClick={alternar} aria-pressed={parado}
            className="pausa-geral">
      <span aria-hidden className="pausa-geral__sinal">
        {parado
          ? <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current"><path d="M3 1.5 10 6l-7 4.5z" /></svg>
          : <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current"><rect x="2.5" y="1.5" width="2.5" height="9" /><rect x="7" y="1.5" width="2.5" height="9" /></svg>}
      </span>
      {parado ? 'Retomar o movimento' : 'Pausar o movimento'}
    </button>
  )
}
