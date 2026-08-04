import type { Metadata, Viewport } from 'next'
import { CONTATO, TOTAL_ARTISTAS } from '@/lib/conteudo'
import { MotionConfig } from 'framer-motion'
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
      </head>
      <body>
        {/* reducedMotion="user" decide no mount, sem quebrar hidratacao.
            useReducedMotion() retornaria null no servidor. */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  )
}
