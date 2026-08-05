/**
 * Conteudo da Rapa Sound.
 *
 * REGRA: tudo aqui e literal do site atual ou derivado dele por contagem.
 * Nada foi inventado. Ver INVENTARIO.md.
 *
 * O que depende de confirmacao do cliente esta marcado com // PENDENTE:
 * e registrado em PENDENCIAS.md.
 */

export const WHATSAPP = '5534991990994' // PENDENTE-NAO: nao alterar, decidido no briefing

/** Monta o link com o texto ja preenchido. encodeURIComponent basta —
 *  acento cru na URL retorna HTTP 400, bug confirmado no site atual. */
export function zap(texto: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`
}

export const CONTATO = {
  whatsappVisivel: '+55 34 99199-0994',
  fixo: '(34) 3231-0632',
  fixoLink: '+553432310632',
  email: 'vendas@rapasound.com.br',
  // PENDENTE P1: 7 paginas do site dizem Granja Marileusa, 6 dizem Bom Jesus.
  // A correlacao com as datas do sitemap indica mudanca em curso — as paginas
  // editadas em abril/2026 usam esta. Confirmar antes de publicar.
  endereco: {
    rua: 'Av. Maria Silva Garcia, 575 — Sala 603',
    bairro: 'Granja Marileusa',
    cep: '38406-634',
    cidade: 'Uberlândia',
    uf: 'MG',
  },
  redes: {
    instagram: 'https://www.instagram.com/rapasound',
    facebook: 'https://www.facebook.com/rapasoundoficial',
    youtube: 'https://www.youtube.com/@RapaSound',
  },
  // PENDENTE P2: CNPJ nao aparece em nenhuma das 14 paginas do site atual.
  // Necessario para schema LocalBusiness completo e para a politica LGPD.
  cnpj: null as string | null,
}

/* ============================================================
   OS 13 SERVICOS — descricao literal do site atual.
   No site velho isto era um grid de 13 PNGs achatados: titulo,
   icone e descricao eram pixels. Aqui e texto real.
   `ancora` casa com o mapa de 301 em REDIRECTS.md.
   ============================================================ */

export type Servico = {
  ancora: string
  nome: string
  desc: string
  urlAntiga: string
  /** 'festa' = colore com magenta/congo · 'tecnico' = branco de trabalho */
  estado: 'festa' | 'tecnico'
  /** Codigo de rider — a notacao que a industria usa em mapa de palco.
   *  PA = public address, LX = lighting. Substitui a numeracao 01/02/03,
   *  que e proibida e alem disso mentirosa: servico nao tem ordem. */
  codigo: string
  bloco: 'som' | 'luz' | 'led' | 'cenografia' | 'pacotes'
}

/** 13 e primo — nao existe grade de colunas iguais que o acomode sem
 *  orfao. A saida e parar de tratar os 13 como iguais: cinco blocos de
 *  tamanho desigual, em que a assimetria vira informacao. O bloco LED e
 *  o maior porque e o que a empresa faz de diferente. */
export const BLOCOS: { id: Servico['bloco']; titulo: string; nota: string }[] = [
  { id: 'som', titulo: 'Som', nota: 'A base de tudo' },
  { id: 'luz', titulo: 'Luz', nota: 'Cênica e de pista' },
  { id: 'led', titulo: 'LED', nota: 'A metade que nos diferencia' },
  { id: 'cenografia', titulo: 'Cenografia e conteúdo', nota: 'O que fica na foto' },
  { id: 'pacotes', titulo: 'Pacotes', nota: 'A festa inteira' },
]

/** Os tres que vendem: entram como card, nao como linha de indice. */
export const DESTAQUE_LED = ['painel-de-led', 'pista-de-led', 'tunel-de-led']

export const SERVICOS: Servico[] = [
  { ancora: 'sonorizacao-palco', nome: 'Sonorização e palco',
    desc: 'Estruturas que elevam qualquer atração, proporcionando som impecável e palco digno de grandes shows.',
    urlAntiga: '/sonorizacaopalco/', codigo: 'PA', bloco: 'som', estado: 'tecnico' },
  { ancora: 'iluminacao-cenica', nome: 'Iluminação cênica',
    desc: 'Desenvolvemos uma atmosfera de luz ideal para qualquer evento.',
    urlAntiga: '/iluminacao-cenica/', codigo: 'LX', bloco: 'luz', estado: 'tecnico' },
  { ancora: 'iluminacao-pista', nome: 'Iluminação de pista',
    desc: 'Luzes que realçam cada momento e transformam seu evento em um espetáculo visual.',
    urlAntiga: '/iluminacao-pista/', codigo: 'LX-P', bloco: 'luz', estado: 'festa' },
  { ancora: 'painel-de-led', nome: 'Painel de LED',
    desc: 'Utilizamos tecnologias avançadas para um visual impactante.',
    urlAntiga: '/painel-de-led/', codigo: 'LED-P', bloco: 'led', estado: 'festa' },
  { ancora: 'pista-de-led', nome: 'Pista de LED',
    desc: 'Onde o brilho e a grandiosidade se encontram, criando uma pista de dança imponente.',
    urlAntiga: '/pista-de-led/', codigo: 'LED-F', bloco: 'led', estado: 'festa' },
  { ancora: 'tubos-de-led', nome: 'Tubos de LED',
    desc: 'Efeitos luminosos modernos e atraentes que criam ambientes dinâmicos e inesquecíveis.',
    urlAntiga: '/tubos-de-led/', codigo: 'LED-T', bloco: 'led', estado: 'festa' },
  { ancora: 'tunel-de-led', nome: 'Túnel de LED',
    desc: 'Uma experiência envolvente que leva você para uma nova dimensão.',
    urlAntiga: '/tunel-de-led/', codigo: 'LED-TN', bloco: 'led', estado: 'festa' },
  { ancora: 'efeitos-especiais', nome: 'Efeitos especiais',
    desc: 'Detalhes que acrescentam um toque especial ao seu evento.',
    urlAntiga: '/efeitos-especiais/', codigo: 'FX', bloco: 'led', estado: 'festa' },
  { ancora: 'projetos-3d', nome: 'Projetos 3D personalizados',
    desc: 'Criação de ambientes únicos e exclusivos.',
    urlAntiga: '/projetos-3d-personalizados/', codigo: '3D', bloco: 'cenografia', estado: 'tecnico' },
  { ancora: 'area-instagramavel', nome: 'Área instagramável',
    desc: 'Um espaço pensado para brilhar nas suas fotos e eternizar o momento perfeito.',
    urlAntiga: '/area-instagramavel/', codigo: 'SET', bloco: 'cenografia', estado: 'festa' },
  { ancora: 'criacao-de-conteudo', nome: 'Criação de conteúdo',
    desc: 'Criamos projetos personalizados que contam a sua história.',
    urlAntiga: '/criacao-de-conteudo/', codigo: 'REC', bloco: 'cenografia', estado: 'tecnico' },
  { ancora: 'quinze-anos', nome: 'Emoções 15 anos',
    desc: 'Um momento mágico que celebra o início de uma nova fase, repleto de brilho e encanto.',
    urlAntiga: '/emocoes-15-anos/', codigo: '15A', bloco: 'pacotes', estado: 'festa' },
  { ancora: 'casamento', nome: 'Emoções casamento',
    desc: 'Cenários perfeitos para histórias de amor inesquecíveis, no dia mais especial da sua vida.',
    urlAntiga: '/emocoes-casamento/', codigo: 'CAS', bloco: 'pacotes', estado: 'festa' },
]

/* ============================================================
   OS VIDEOS — 10 do canal deles, todos ja no ar.
   ============================================================ */

export type Video = { id: string; titulo: string; tipo: string; local?: string }

export const EVENTOS: Video[] = [
  { id: 'Rlp-GE1v9dI', titulo: 'Maria Clara — abertura de pista e melhores momentos', tipo: '15 anos' },
  { id: 'wWSYRAXXh8Y', titulo: '15 anos da Júlia Pacheco', tipo: '15 anos', local: 'Palácio de Cristal · Uberlândia/MG' },
  { id: '4GaYSBuoKKQ', titulo: '15 anos da Luma — short film', tipo: '15 anos', local: 'Clube Pica Pau · Araguari/MG' },
  { id: 'CX6FVxpH_T4', titulo: 'Casamento da Paola e do Vitor', tipo: 'casamento', local: 'Palácio de Cristal · Uberlândia/MG' },
  { id: 'd2t6cKFrxxw', titulo: 'Casamento da Maria Augusta e do Serge', tipo: 'casamento', local: 'Tiradentes/MG' },
  // PENDENTE P10: o portfolio em destaque e de 2022. O ano nao aparece na pagina.
  { id: 'j74jFf8vrQQ', titulo: 'Portfólio Rapa Sound', tipo: 'portfólio' },
]

export const DEPOIMENTOS: Video[] = [
  { id: 'Duu55y9-doc', titulo: 'Diana, mãe da debutante Lana Ribeiro', tipo: 'mãe de debutante' },
  { id: '-4uQIpkfB3E', titulo: 'Vitória Francis, debutante', tipo: 'debutante' },
  { id: 'Mg31EitG_YY', titulo: 'Maria Antônia, debutante', tipo: 'debutante' },
  { id: '5hAsVfeDe_4', titulo: 'Ana Laura (Ani), debutante', tipo: 'debutante' },
]
// PENDENTE P6: os 4 depoimentos que existem sao de 15 anos. Nenhum de
// casamento, nenhum de corporativo. Pedir dois ao cliente.

/* ============================================================
   O RIDER — 116 artistas. No site velho, duas imagens PNG de
   3108x3847 e 3289x4671. Invisiveis para busca e leitor de tela.
   Aqui e texto, pela primeira vez.
   ============================================================ */

export const RIDER: { categoria: string; nomes: string[] }[] = [
  { categoria: 'Sertanejo', nomes: [
    'Bruna Viola','Bruno','Bruno & Marrone','Carvalho & Mariano','César Menotti & Fabiano',
    'Cleber & Cauan','Cleiton & Romário','Di Paulo & Paulino','Diego & Victor Hugo',
    'Eder & Emersom','Emílio & Eduardo','Erick Lins','Felipe Araújo','Fred & Fabrício',
    "Gui D'Castro & Gabriel",'Guilherme & Santiago','Henrique & Diego','João Bosco & Vinícius',
    'Kléo Dibah','Léo Chaves','Matheus & Kauan','Naessa','Renato Teixeira','Sérgio Reis',
    'Sidney do Cerrado','Thaeme & Thiago','Thiago Brava'] },
  { categoria: 'Pop e rock', nomes: [
    'Afonso Nigro','Banda Blitz','Banda Jack Habbit','Banda Liga Joe','Banda Venosa',
    'Biquini Cavadão','Dino Fonseca','Divas','Douglas Alessi','Mariana Rios','Paulo Ricardo',
    'Latino','Raimundos','Tiago Abravanel','Venosa','Wilson Sideral','Zeeba'] },
  { categoria: 'Samba, pagode e axé', nomes: [
    'Alexandre Peixe','Alexandre Pires','Banda Camomilá','Banda Eva',"D' Corpo Inteiro",
    'Grupo Beat Samba','Inimigos da HP','Mané Galinha','Oba Oba Samba House','Paquá',
    'Projeto Ao Cubo','Sempre Bom','Só Pra Contrariar','Tuca Fernandes'] },
  { categoria: 'DJs e MCs', nomes: [
    'DJ André Wink','DJ Camila Peixoto','DJ Daniel Souvile','DJ Elieser','DJ Francisco',
    'DJ Henrique Sechi','DJ Jimmy','DJ Junior Ribeiro','DJ Leonardo Ruas','DJ Liu','DJ Lozanello',
    'DJ Lucas Borchardt','DJ Marcelo Augusto','DJ Renato Carneiro','DJ Dudu Linhares',
    'DJ Ronaldo Gasparian','DJ Samhara','DJ Shark','DJ Thascya','DJ Thomas B','DJ Tulio Mass',
    'DJ Wesley Gonzaga','DJ Willian Ribeiro','Heartbreakers','Jerry Smith','Jetlag',
    'Make U Sweet','MC Don Juan','MC Matheuzinho','MC Naldo Benny','Meu Nome é Vaca','SuitX'] },
  { categoria: 'Bandas de estilos variados', nomes: [
    'André Lopes e Banda','Banda ABR3','Banda EBO','Banda Gato Preto','Banda Homem de Lata',
    'Banda LP3','Banda MAFU','Banda NK2','Banda Nova York','Banda Romeu & Julieta','Banda Lemon',
    'Banda Santa Tereza','Banda SP3','Banda Gang Lex','Banda Lex Luthor','Herbert Levy',
    'Letícia Landin e Banda','Thyago Brandão e Banda'] },
  { categoria: 'Orquestras e grupos de receptivo', nomes: [
    'Grupo Musical Bravíssimo','Grupo Musical Pianíssimo','Grupo Musical Sibélius',
    'Grupo Musical Alcântara','Eterno Grupo Musical','Grupo Musical Viena',
    'Orquestra George Freire','Grupo Arte Fantástica'] },
]

export const TOTAL_ARTISTAS = RIDER.reduce((n, c) => n + c.nomes.length, 0) // 116

/**
 * Os nomes de alcance nacional, escolhidos de dentro da lista real.
 * Nada acrescentado — e so hierarquia: prova social funciona quando o
 * nome que a pessoa reconhece aparece primeiro. No site antigo os 116
 * tinham exatamente o mesmo peso, e por isso nenhum tinha peso nenhum.
 */
export const DESTAQUES = [
  'Bruno & Marrone', 'Alexandre Pires', 'César Menotti & Fabiano', 'Raimundos',
  'Só Pra Contrariar', 'Biquini Cavadão', 'Banda Eva', 'Sérgio Reis',
  'Thaeme & Thiago', 'Matheus & Kauan', 'Latino', 'Jerry Smith',
]

/* ============================================================
   FAQ — as objecoes reais, colhidas em forum e blog do setor.
   Ver pesquisa/03-conversao-seo.md §5.

   PENDENTE P12 — BLOQUEIA PUBLICACAO:
   As respostas abaixo assumem compromissos operacionais (tecnico
   presente do inicio ao fim, equipamento reserva, visita tecnica,
   faixas de preco) que vieram de NORMA DO SETOR, nao do cliente.
   O cliente precisa confirmar cada uma antes de ir ao ar — sao
   promessas contratuais, nao texto de marketing.
   ============================================================ */

export type Pergunta = { p: string; r: string; confirmar: boolean }

export const FAQ: Pergunta[] = [
  { confirmar: true,
    p: 'Quanto custa o som e a iluminação da festa? O que está incluso no valor?',
    r: 'Depende do tamanho do salão, do número de convidados e de quais serviços você quer. Todo orçamento nosso vem com a lista dos equipamentos, modelo e quantidade, mais transporte, montagem, desmontagem e o técnico que fica na festa. Sem item escondido.' },
  { confirmar: true,
    p: 'A iluminação colorida não vai estragar as fotos e o vídeo da minha filha?',
    r: 'Essa é a pergunta certa, e o motivo é real: luz colorida reflete na pele e é quase impossível de corrigir na edição. Por isso trabalhamos com luz quente, entre 2.700K e 3.200K, nos momentos que vão para a foto — entrada, valsa, retratos, mesa do bolo — e deixamos a cor forte para a pista. Se quiser, mandamos o projeto de luz para o seu fotógrafo revisar antes de fechar.' },
  { confirmar: true,
    p: 'E se a luz ficar fraca demais? Ouvi dizer que o vídeo fica escuro e granulado.',
    r: 'Também acontece, e é o outro extremo do mesmo erro. Sem luz, a câmera sobe o ISO e o vídeo fica granulado. O projeto de iluminação é dimensionado para o tamanho do salão e para a equipe de foto e vídeo trabalhar, não só para a pista ficar bonita.' },
  { confirmar: true,
    p: 'Tem alguém operando o som durante a festa toda, ou vocês só montam e vão embora?',
    r: 'A equipe fica. Tem técnico nosso do início ao fim, operando som e luz. Montar e ir embora é o erro mais comum do setor: quando dá microfonia no meio do discurso, não tem ninguém para resolver.' },
  { confirmar: true,
    p: 'E se queimar um equipamento no meio da festa? A festa para?',
    r: 'Não. Levamos equipamento reserva para o evento — microfone, mesa e as peças críticas — e o técnico está no local para trocar na hora. É a diferença entre uma pane de 30 segundos e uma festa que acaba cedo.' },
  { confirmar: true,
    p: 'Tenho medo do som ficar alto demais e a família mais velha não conseguir conversar.',
    r: 'Som ambiente e pista têm controle separado por setor. Na recepção e no jantar o volume fica baixo, para dar para conversar; na pista sobe. O ponto certo é aquele em que você dança e ainda consegue falar no ouvido de alguém sem gritar.' },
  { confirmar: true,
    p: 'O salão já disse que tem som e iluminação. Ainda preciso de vocês?',
    r: 'Às vezes sim, às vezes não, e a gente diz a verdade. Fazemos visita técnica no espaço e apontamos o que ele já resolve e o que falta: potência para o número de convidados, pontos de fixação no teto, e principalmente se a rede elétrica aguenta. Quando o gerador é necessário, isso entra no orçamento antes, não como surpresa no dia.' },
  { confirmar: false,
    p: 'Vocês atendem fora de Uberlândia?',
    r: 'Sim. Já fizemos evento em Araguari e em Tiradentes, entre outras cidades. Manda a data e o local no WhatsApp que a gente confirma o deslocamento.' },
  { confirmar: false,
    p: 'Há quanto tempo vocês estão no mercado?',
    r: `Quase 30 anos. Nesse tempo passaram ${TOTAL_ARTISTAS} artistas pelos nossos palcos, de Bruno & Marrone a Alexandre Pires e Raimundos, além de milhares de casamentos e festas de 15 anos.` },
]

/* ============================================================
   O ACERVO — fotos reais de evento, do site deles.
   PENDENTE P5: 1033x690 e baixo para hero em tela grande.
   Pedir os originais ao cliente.
   ============================================================ */

export const FOTOS_EVENTO = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
  src: `/img/eventos/${n}.webp`,
  w: 1033,
  h: 690,
}))

/* ============================================================
   A EQUIPE.

   As imagens do site antigo eram CARDS GRAFICOS, nao fotos: nome e
   cargo queimados no pixel, sobre o gradiente #FF6600 do tema velho.
   Era o mesmo defeito que quebrou o resto do site — texto dentro de
   imagem — e ele voltou porque eu copiei os arquivos sem abrir.

   Corrigido: a faixa de texto foi cortada fora, a cor antiga foi
   removida (as fotos viraram monocromaticas, coerentes com a luz de
   trabalho do estado tecnico) e os nomes voltaram como TEXTO REAL.

   Dois deles tambem estao no rider dos 116: Andre Wink e Daniel
   Souvile sao DJs da casa.
   ============================================================ */

export type Pessoa = { nome: string; papel: string; src: string }

export const EQUIPE: Pessoa[] = [
  { nome: 'Leandro Rapa',    papel: 'Idealizador',                 src: '/img/equipe/1.webp' },
  { nome: 'Dagma',           papel: 'Consultora e produtora',      src: '/img/equipe/2.webp' },
  { nome: 'Daniel Souvile',  papel: 'Conteúdo audiovisual e VJ',   src: '/img/equipe/3.webp' },
  { nome: 'Daniel Ribeiro',  papel: 'Pré-produção',                src: '/img/equipe/4.webp' },
  { nome: 'André Wink',      papel: 'DJ',                          src: '/img/equipe/5.webp' },
  { nome: 'Marcelo Augusto', papel: 'DJ e produtor',               src: '/img/equipe/6.webp' },
]

export const FOTOS_EQUIPE = EQUIPE.map((p) => ({ src: p.src, w: 440, h: 635 }))
