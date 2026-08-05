'use client'

import { useEffect, useState } from 'react'

/**
 * O beat de blackout — emenda 2. ~400ms, UM so na pagina inteira.
 *
 * NAO segura o paint: a cortina e montada depois da hidratacao, por
 * cima de uma pagina ja pintada. O LCP e a foto do hero, e ela nao
 * espera por isto. Ver IDENTIDADE.md.
 *
 * Nao repete na mesma sessao — um efeito de entrada que dispara toda
 * vez vira irritacao, nao assinatura.
 */
export function Blackout() {
  const [rodar, setRodar] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    try {
      if (sessionStorage.getItem('rs-blackout')) return
      sessionStorage.setItem('rs-blackout', '1')
    } catch {
      /* modo privado sem storage: roda uma vez e pronto */
    }
    setRodar(true)
    const t = setTimeout(() => setRodar(false), 460)
    return () => clearTimeout(t)
  }, [])

  if (!rodar) return null
  return <div className="blackout" aria-hidden />
}
