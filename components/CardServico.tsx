'use client'

import { useCallback, useRef } from 'react'
import type { Servico } from '@/lib/conteudo'
import { zap } from '@/lib/conteudo'

/**
 * O CARD DE SERVIÇO — um componente, três pesos.
 *
 * O QUE ESTAVA ERRADO ANTES
 * Não era o card, era a divisão em castas: três serviços viravam card e
 * dez viravam linha de índice. A leitura do cliente foi exata — "o som
 * ficou sem nada de card" — porque sonorização é o serviço-base da
 * empresa e aparecia como linha de lista.
 *
 * Agora os 13 são card. O que muda entre eles é o PESO, e o peso é
 * geometria, não hierarquia de valor: 1 ocupa o dobro e leva foto, 2 é
 * médio, 3 é compacto. Como cada bloco tem sua própria grade pequena, a
 * contagem 13 nunca aparece em lugar nenhum — e o bloco de som, que tem
 * um item só, fica com a maior área da página.
 *
 * QUATRO DEFEITOS CONCRETOS, TODOS CORRIGIDOS
 *
 * 1. `transition: background 260ms` era INERTE. `background-image` tem
 *    tipo de animação `discrete` (MDN): gradiente não interpola. O aro
 *    de dois tons TROCAVA num quadro enquanto `transform` deslizava por
 *    260ms — essa dessincronia é parte concreta do "está horrível".
 *    Agora o estado de hover é uma camada própria e só `opacity` anima.
 *
 * 2. Não existia `:active` em lugar nenhum. No celular, que é a maior
 *    parte do tráfego, o card não dava sinal nenhum de que foi tocado.
 *
 * 3. `delay: i * 0.08` sem teto dava 0,96 s no décimo terceiro card.
 *
 * 4. O `<a>` envolvia o `<h3>` e o `<p>`, então o leitor de tela
 *    anunciava o card inteiro como rótulo do link. Agora o card é
 *    `<article>` e o link cobre a área por `::after` — o nome acessível
 *    passa a ser só o texto do CTA.
 *
 * O TILT
 * ±4 graus, não 15. E `perspective()` DENTRO do transform de cada card,
 * nunca `perspective` como propriedade num wrapper: como propriedade ela
 * cria containing block para `position: fixed` e quebraria a nav.
 * Nada de `translateZ`: `overflow: hidden` e `isolation: isolate` no card
 * forçam `transform-style: flat` mesmo com `preserve-3d` declarado.
 *
 * Escreve direto em custom property, sem estado do React — zero
 * re-render por movimento de ponteiro. E o CSS só liga o tilt em
 * `(hover: hover) and (pointer: fine)`, então em toque ele não existe.
 */

export function CardServico({ servico, i }: { servico: Servico; i: number }) {
  const ref = useRef<HTMLElement>(null)

  /* Sem estado: `style.setProperty` não passa pelo React. Um mousemove
     a 120 Hz com useState seria 120 renders por segundo por card. */
  const mover = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    el.style.setProperty('--tx', `${(y - 0.5) * -8}deg`)
    el.style.setProperty('--ty', `${(x - 0.5) * 8}deg`)
  }, [])

  const sair = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tx', '0deg')
    el.style.setProperty('--ty', '0deg')
  }, [])

  const heroi = servico.peso === 1

  return (
    <article
      ref={ref}
      id={servico.ancora}
      className="card"
      data-peso={servico.peso}
      data-estado={servico.estado}
      /* teto no atraso: sem ele o 13o card entrava com 0,96 s */
      style={{ ['--d' as string]: `${Math.min(i, 6) * 55}ms` }}
      onPointerMove={mover}
      onPointerLeave={sair}
    >
      {/* o facho e o aro ficam em z-index 0 e a foto e o texto em 1.
          Assim magenta NAO ALCANCA um rosto por geometria, e nao por
          disciplina de quem escreve o proximo card. */}
      <span className="card__facho" aria-hidden />
      <span className="card__aro" aria-hidden />

      {/* A foto NAO e decorativa: e a prova de que o servico existe.
          Entao ela leva alt descritivo e o span nao e aria-hidden. */}
      {servico.foto && (
        <span className="card__foto">
          <img src={servico.foto} width={1033} height={690} loading="lazy"
               decoding="async"
               alt={`${servico.nome} montado pela Rapa Sound em evento real`} />
        </span>
      )}

      <div className="card__corpo">
        <span className="card__cod">{servico.codigo}</span>
        <h3 className="card__titulo">{servico.nome}</h3>
        <p className="card__desc">{servico.desc}</p>

        {/* A ficha do herói. São fatos já provados no inventário — nada
            de número de caixa ou de canal de mesa, que eu não tenho e
            não invento. Ver P14 no PENDENCIAS.md. */}
        {heroi && (
          <dl className="card__ficha">
            {servico.bloco === 'som' ? (
              <>
                <div><dt>Artistas</dt><dd>116</dd></div>
                <div><dt>Mercado</dt><dd>Quase 30 anos</dd></div>
                <div><dt>Praças</dt><dd>Uberlândia · Araguari · Tiradentes</dd></div>
              </>
            ) : (
              <>
                <div><dt>Formatos</dt><dd>Painel · pista · túnel · tubo</dd></div>
                <div><dt>Monta</dt><dd>Junto ou separado</dd></div>
              </>
            )}
          </dl>
        )}

        {/* O link cobre o card inteiro por ::after. O nome acessivel e
            so este texto — antes o <a> envolvia titulo e descricao e o
            leitor de tela lia o card todo como rotulo. */}
        <a className="card__link"
           href={zap(`Oi! Quero orçamento de ${servico.nome.toLowerCase()}.`)}
           target="_blank" rel="noopener noreferrer" data-zap>
          Falar no WhatsApp
          <span aria-hidden>→</span>
        </a>
      </div>
    </article>
  )
}
