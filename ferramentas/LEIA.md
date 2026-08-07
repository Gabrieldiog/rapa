# As ferramentas de auditoria

Não fazem parte do site. Moram **aqui e não em `public/`** por um motivo
concreto: tudo que está em `public/` é copiado para o build **mesmo estando
no `.gitignore`** — o Next copia a pasta inteira, verbatim. Guardar aqui é a
única forma de elas existirem no repositório sem correrem o risco de ir ao ar.

## Como usar

```bash
cp ferramentas/__*.html public/     # só enquanto estiver auditando
npm run dev
# ... audite ...
rm public/__*.html                  # ANTES de qualquer build de produção
```

O `.gitignore` tem `public/__*.html` como rede de segurança: mesmo copiadas,
elas não voltam a ser commitadas por engano.

## O que cada uma faz

| arquivo | para quê |
|---|---|
| `__diag.html` | auditoria de layout num viewport arbitrário: estouro horizontal real, elementos fora da borda, alvos de toque abaixo de 44px, invisíveis sem explicação, offset das seções |
| `__ver.html` | print de uma seção no meio da página, em largura arbitrária |
| `__sonda.html` | lê o estilo **computado** de um seletor — print não distingue `opacity: 0` de `display: none` |

Parâmetros: `?w=` `?h=` `?rolar=` `?s=` `?clique=` `?sel=` `?props=` `?so=1`

## Três coisas que elas aprenderam na marra

1. **O Chrome headless trava a janela em 500px de largura mínima.** Pedir
   `--window-size=380` devolve `innerWidth=500`, e o print sai um recorte de um
   render de 500px. Por isso elas usam iframe: um iframe de mesma origem tem
   viewport próprio de verdade.
2. **`html { scroll-behavior: smooth }` quebra print de headless.** Todo
   `scrollTo` vira animação, e o `--virtual-time-budget` não avança linha do
   tempo de animação — a rolagem para no meio e o print sai na seção errada.
   As três forçam `scrollBehavior = 'auto'` antes de rolar.
3. **`IntersectionObserver` não dispara sob relógio virtual.** As observações
   são entregues nos passos de renderização, que o relógio virtual não produz.
   Qualquer coisa revelada por observer precisa ser ligada à mão na ferramenta.
