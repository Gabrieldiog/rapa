import type { Metadata, Viewport } from 'next'
import { CONTATO, TOTAL_ARTISTAS } from '@/lib/conteudo'
import { MotionConfig } from 'framer-motion'
import { Seda } from '@/components/Seda'
import './globals.css'

const SITE = 'https://rapasound.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Rapa Sound — som, luz e LED para casamento e 15 anos em Uberlândia',
  description:
    'Quase 30 anos sonorizando e iluminando festa de 15 anos, casamento e evento corporativo em Uberlândia e região. ' +
    `${TOTAL_ARTISTAS} artistas já passaram pelos nossos palcos. Orçamento no WhatsApp.`,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE,
    siteName: 'Rapa Sound',
    title: 'Rapa Sound — som, luz e LED para casamento e 15 anos',
    description:
      'Quase 30 anos em Uberlândia. Sonorização, iluminação cênica, painel, pista e túnel de LED.',
    // o trafego vem do link na bio — o preview importa mais que a media
    images: [{ url: '/img/eventos/1.webp', width: 1033, height: 690,
      alt: 'Debutante erguida pelas convidadas em festa iluminada pela Rapa Sound' }],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#09090B',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

/** PENDENTE P2: sem CNPJ o schema fica sem `taxID`.
 *  PENDENTE P11: sem horario confirmado, `openingHours` fica de fora. */
const schema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE}/#negocio`,
  name: 'Rapa Sound',
  description:
    'Sonorização, iluminação cênica, efeitos especiais e cenografia de LED para eventos sociais e corporativos.',
  url: SITE,
  telephone: `+55${CONTATO.fixoLink.replace('+55', '')}`,
  email: CONTATO.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTATO.endereco.rua,
    addressLocality: CONTATO.endereco.cidade,
    addressRegion: CONTATO.endereco.uf,
    postalCode: CONTATO.endereco.cep,
    addressCountry: 'BR',
  },
  areaServed: ['Uberlândia', 'Araguari', 'Tiradentes'].map((n) => ({
    '@type': 'City', name: n,
  })),
  sameAs: Object.values(CONTATO.redes),
  image: `${SITE}/img/eventos/1.webp`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* a fonte de texto e a primeira a pintar — preload so nela */}
        <link rel="preload" href="/fonts/cabinet-400.woff2" as="font"
              type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/zodiak-700.woff2" as="font"
              type="font/woff2" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {/* MATA SERVICE WORKER VELHO.
            O log do servidor mostrou `GET /sw.js 404`: existe um
            service worker registrado nesta origem, de algum projeto
            anterior que morava na mesma porta. Este site NAO usa
            service worker — entao qualquer um que esteja ali so pode
            estar servindo bundle e CSS antigos do cache dele, e o
            sintoma e exatamente "o menu nao funciona" e "o site ficou
            sem CSS": HTML novo pedindo arquivos que o worker responde
            com versao velha.
            Um worker orfao sobrevive a Ctrl+Shift+R — quem o remove e
            `unregister()`. Sao seis linhas e elas so fazem alguma
            coisa se houver worker registrado. */}
        <script
          dangerouslySetInnerHTML={{ __html:
            `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations()` +
            `.then(function(rs){var m=false;rs.forEach(function(r){r.unregister();m=true});` +
            `if(m&&window.caches)caches.keys().then(function(k){k.forEach(function(n){caches.delete(n)})});` +
            `if(m)location.reload()}).catch(function(){})}`,
          }}
        />
      </head>
      <body>
        {/* O FUNDO, UMA VEZ SO, ATRAS DA PAGINA INTEIRA.
            Ele mora aqui e nao dentro de cada secao por dois motivos.
            O pedido foi "identico em todo o sistema", e a unica forma
            de ser identico de verdade e ser o MESMO canvas — copia por
            secao nunca fica em fase. E custa um canvas em lugar de N:
            cada instancia era um rAF e um campo de particulas proprio.
            `fixed`: o campo nao rola junto. Ele e o ar da sala, nao um
            papel de parede colado no documento.
            `-z-10` dentro do body: pinta ACIMA do fundo do body e
            ABAIXO de todo o conteudo. */}
        <Seda />
        {/* reducedMotion="user" decide no mount, sem quebrar hidratacao.
            useReducedMotion() retornaria null no servidor. */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  )
}
