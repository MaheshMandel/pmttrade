import type { Locale } from "../i18n/config";

export interface PartnerCategory {
  name: string;
  anchor: string;
  slugs: string[];
  translations: Record<Locale, string>;
}

export interface PartnerMeta {
  slug: string;
  name: string;
  category: string;
  blurb: Record<Locale, string>;
}

export const PARTNER_CATEGORIES: PartnerCategory[] = [
  {
    name: "Market Data & News",
    anchor: "market-data",
    slugs: ["benzinga", "marketwatch", "yahoo-finance", "barchart", "trading-economics"],
    translations: {
      en: "Market Data & News",
      de: "Marktdaten & Nachrichten",
      es: "Datos de Mercado y Noticias",
      fr: "Données de Marché et Actualités",
      it: "Dati di Mercato e Notizie",
    },
  },
  {
    name: "Charting & Order Flow Tools",
    anchor: "charting-tools",
    slugs: ["stockcharts", "bookmap"],
    translations: {
      en: "Charting & Order Flow Tools",
      de: "Chart- & Orderflow-Tools",
      es: "Herramientas de Gráficos y Flujo de Órdenes",
      fr: "Outils de Graphiques et de Flux d'Ordres",
      it: "Strumenti di Grafici e Order Flow",
    },
  },
  {
    name: "Trading Education",
    anchor: "trading-education",
    slugs: ["babypips", "traderlion"],
    translations: {
      en: "Trading Education",
      de: "Trading-Ausbildung",
      es: "Educación de Trading",
      fr: "Formation au Trading",
      it: "Formazione al Trading",
    },
  },
  {
    name: "Prop Firm Research",
    anchor: "prop-firm-research",
    slugs: ["prop-firm-match", "thetrustedprop", "canadian-futures-trader"],
    translations: {
      en: "Prop Firm Research",
      de: "Prop-Firm-Recherche",
      es: "Investigación de Prop Firms",
      fr: "Recherche sur les Prop Firms",
      it: "Ricerca sulle Prop Firm",
    },
  },
  {
    name: "Journal & Community",
    anchor: "journal-community",
    slugs: ["tradezella", "forex-factory"],
    translations: {
      en: "Journal & Community",
      de: "Journal & Community",
      es: "Diario y Comunidad",
      fr: "Journal et Communauté",
      it: "Diario e Community",
    },
  },
  {
    name: "TradingView Indicators",
    anchor: "tradingview-indicators",
    slugs: ["luxalgo", "zeiierman", "bigbeluga", "theindicatorstore", "pinecoders"],
    translations: {
      en: "TradingView Indicators",
      de: "TradingView-Indikatoren",
      es: "Indicadores de TradingView",
      fr: "Indicateurs TradingView",
      it: "Indicatori TradingView",
    },
  },
];

export function categoryLabel(categoryName: string, locale: Locale): string {
  const cat = PARTNER_CATEGORIES.find((c) => c.name === categoryName);
  return cat?.translations[locale] ?? categoryName;
}

export const PARTNERS: PartnerMeta[] = [
  {
    slug: "benzinga",
    name: "Benzinga",
    category: "Market Data & News",
    blurb: {
      en: "Four paid products behind one free news site, from a $10.75/mo Edge tier to an institutional API business.",
      de: "Vier kostenpflichtige Produkte hinter einer kostenlosen News-Seite, von einer Edge-Stufe für 10,75 $/Monat bis zu einem institutionellen API-Geschäft.",
      es: "Cuatro productos de pago detrás de un sitio de noticias gratuito, desde un nivel Edge de 10,75 $/mes hasta un negocio de API institucional.",
      fr: "Quatre produits payants derrière un site d'actualités gratuit, d'un forfait Edge à 10,75 $/mois à une activité d'API institutionnelle.",
      it: "Quattro prodotti a pagamento dietro un sito di notizie gratuito, da un piano Edge a 10,75 $/mese a un business di API istituzionali.",
    },
  },
  {
    slug: "marketwatch",
    name: "MarketWatch",
    category: "Market Data & News",
    blurb: {
      en: "How it was actually founded, what it costs today, and its consumer-reviews side business.",
      de: "Wie es tatsächlich gegründet wurde, was es heute kostet, und sein Nebengeschäft mit Verbraucherbewertungen.",
      es: "Cómo se fundó realmente, cuánto cuesta hoy y su negocio paralelo de reseñas de consumo.",
      fr: "Comment il a réellement été fondé, ce qu'il coûte aujourd'hui, et son activité annexe d'avis consommateurs.",
      it: "Come è stato realmente fondato, quanto costa oggi, e la sua attività collaterale di recensioni per i consumatori.",
    },
  },
  {
    slug: "yahoo-finance",
    name: "Yahoo Finance",
    category: "Market Data & News",
    blurb: {
      en: "What it offers across Bronze/Silver/Gold tiers and its new AlphaSpace platform.",
      de: "Was es über die Stufen Bronze/Silber/Gold und seine neue AlphaSpace-Plattform bietet.",
      es: "Qué ofrece en sus niveles Bronce/Plata/Oro y su nueva plataforma AlphaSpace.",
      fr: "Ce qu'il propose sur ses paliers Bronze/Argent/Or et sa nouvelle plateforme AlphaSpace.",
      it: "Cosa offre nei livelli Bronze/Silver/Gold e la sua nuova piattaforma AlphaSpace.",
    },
  },
  {
    slug: "barchart",
    name: "Barchart",
    category: "Market Data & News",
    blurb: {
      en: "What it offers across three pricing tiers, plus its new Kalshi data partnership.",
      de: "Was es über drei Preisstufen hinweg bietet, plus seine neue Datenpartnerschaft mit Kalshi.",
      es: "Qué ofrece en sus tres niveles de precios, además de su nueva asociación de datos con Kalshi.",
      fr: "Ce qu'il propose sur ses trois paliers tarifaires, plus son nouveau partenariat de données avec Kalshi.",
      it: "Cosa offre nei suoi tre livelli di prezzo, più la nuova partnership sui dati con Kalshi.",
    },
  },
  {
    slug: "trading-economics",
    name: "Trading Economics",
    category: "Market Data & News",
    blurb: {
      en: "What it covers beyond macro data, its real client list, and its new AI integration.",
      de: "Was es über Makrodaten hinaus abdeckt, seine echte Kundenliste und seine neue KI-Integration.",
      es: "Qué cubre más allá de los datos macro, su lista real de clientes y su nueva integración de IA.",
      fr: "Ce qu'il couvre au-delà des données macroéconomiques, sa véritable liste de clients et sa nouvelle intégration IA.",
      it: "Cosa copre oltre i dati macro, la sua reale lista clienti e la nuova integrazione IA.",
    },
  },
  {
    slug: "stockcharts",
    name: "StockCharts.com",
    category: "Charting & Order Flow Tools",
    blurb: {
      en: "What it offers across four pricing tiers and a 350+ article ChartSchool education library.",
      de: "Was es über vier Preisstufen und eine ChartSchool-Bildungsbibliothek mit über 350 Artikeln bietet.",
      es: "Qué ofrece en sus cuatro niveles de precios y su biblioteca educativa ChartSchool con más de 350 artículos.",
      fr: "Ce qu'il propose sur ses quatre paliers tarifaires et sa bibliothèque éducative ChartSchool de plus de 350 articles.",
      it: "Cosa offre nei suoi quattro livelli di prezzo e nella libreria didattica ChartSchool con oltre 350 articoli.",
    },
  },
  {
    slug: "bookmap",
    name: "Bookmap",
    category: "Charting & Order Flow Tools",
    blurb: {
      en: "What it offers across four pricing tiers, its 2024 acquisition, and unbundled market-data costs.",
      de: "Was es über vier Preisstufen bietet, seine Übernahme 2024 und die entbündelten Marktdatenkosten.",
      es: "Qué ofrece en sus cuatro niveles de precios, su adquisición de 2024 y los costes de datos de mercado desglosados.",
      fr: "Ce qu'il propose sur ses quatre paliers tarifaires, son rachat en 2024 et les coûts de données de marché non groupés.",
      it: "Cosa offre nei suoi quattro livelli di prezzo, l'acquisizione del 2024 e i costi separati dei dati di mercato.",
    },
  },
  {
    slug: "babypips",
    name: "babypips",
    category: "Trading Education",
    blurb: {
      en: "What it still offers free now that half its curriculum is paywalled.",
      de: "Was es weiterhin kostenlos anbietet, jetzt da die Hälfte des Lehrplans kostenpflichtig ist.",
      es: "Qué sigue ofreciendo gratis ahora que la mitad de su plan de estudios está detrás de un muro de pago.",
      fr: "Ce qu'il propose encore gratuitement maintenant que la moitié de son cursus est payante.",
      it: "Cosa offre ancora gratis ora che metà del suo programma è a pagamento.",
    },
  },
  {
    slug: "traderlion",
    name: "TraderLion",
    category: "Trading Education",
    blurb: {
      en: "What it offers across four named co-founders, a free online conference, and its Deepvue spinoff.",
      de: "Was es über vier namentlich genannte Mitgründer, eine kostenlose Online-Konferenz und seinen Deepvue-Ableger bietet.",
      es: "Qué ofrece con sus cuatro cofundadores identificados, una conferencia online gratuita y su spinoff Deepvue.",
      fr: "Ce qu'il propose avec ses quatre cofondateurs nommés, une conférence en ligne gratuite et sa spin-off Deepvue.",
      it: "Cosa offre con i suoi quattro co-fondatori dichiarati, una conferenza online gratuita e la sua spin-off Deepvue.",
    },
  },
  {
    slug: "prop-firm-match",
    name: "Prop Firm Match",
    category: "Prop Firm Research",
    blurb: {
      en: "What it offers, its named founders, and its own disclosed conflict of interest.",
      de: "Was es bietet, seine namentlich genannten Gründer und sein selbst offengelegter Interessenkonflikt.",
      es: "Qué ofrece, sus fundadores identificados y su propio conflicto de interés declarado.",
      fr: "Ce qu'il propose, ses fondateurs nommés et son propre conflit d'intérêts déclaré.",
      it: "Cosa offre, i suoi fondatori dichiarati e il conflitto di interesse che dichiara apertamente.",
    },
  },
  {
    slug: "thetrustedprop",
    name: "TheTrustedProp",
    category: "Prop Firm Research",
    blurb: {
      en: "What it verifies, from its blockchain-sourced payout tracker to its two-part scoring system.",
      de: "Was es überprüft, von seinem Blockchain-basierten Auszahlungs-Tracker bis zu seinem zweiteiligen Bewertungssystem.",
      es: "Qué verifica, desde su rastreador de pagos basado en blockchain hasta su sistema de puntuación en dos partes.",
      fr: "Ce qu'il vérifie, de son traqueur de paiements basé sur la blockchain à son système de notation en deux parties.",
      it: "Cosa verifica, dal suo tracker dei payout basato su blockchain al suo sistema di valutazione in due parti.",
    },
  },
  {
    slug: "canadian-futures-trader",
    name: "Canadian Futures Trader",
    category: "Prop Firm Research",
    blurb: {
      en: "What it covers, and its real audience size across platforms, for Canadian futures traders.",
      de: "Was es für kanadische Futures-Trader abdeckt, und seine tatsächliche Reichweite über verschiedene Plattformen hinweg.",
      es: "Qué cubre para los traders de futuros canadienses, y su alcance real de audiencia en distintas plataformas.",
      fr: "Ce qu'il couvre pour les traders de futures canadiens, et son audience réelle sur les différentes plateformes.",
      it: "Cosa copre per i trader di futures canadesi, e la sua reale portata di pubblico sulle diverse piattaforme.",
    },
  },
  {
    slug: "tradezella",
    name: "Tradezella",
    category: "Journal & Community",
    blurb: {
      en: "What it offers across three pricing tiers and its AI agent system.",
      de: "Was es über drei Preisstufen und sein KI-Agentensystem bietet.",
      es: "Qué ofrece en sus tres niveles de precios y su sistema de agentes de IA.",
      fr: "Ce qu'il propose sur ses trois paliers tarifaires et son système d'agents IA.",
      it: "Cosa offre nei suoi tre livelli di prezzo e nel suo sistema di agenti IA.",
    },
  },
  {
    slug: "forex-factory",
    name: "Forex Factory",
    category: "Journal & Community",
    blurb: {
      en: "A 9.4-million-reply forum and economic calendar, with a broker directory that pays for placement.",
      de: "Ein Forum mit 9,4 Millionen Antworten und ein Wirtschaftskalender, mit einem Broker-Verzeichnis, das für Platzierungen bezahlt wird.",
      es: "Un foro con 9,4 millones de respuestas y un calendario económico, con un directorio de brokers que cobra por su posicionamiento.",
      fr: "Un forum de 9,4 millions de réponses et un calendrier économique, avec un annuaire de brokers qui fait payer son placement.",
      it: "Un forum con 9,4 milioni di risposte e un calendario economico, con una directory di broker che fa pagare il posizionamento.",
    },
  },
  {
    slug: "luxalgo",
    name: "LuxAlgo",
    category: "TradingView Indicators",
    blurb: {
      en: "What it offers now, from its AI strategy builder to its 1.3M-follower indicator suite.",
      de: "Was es jetzt bietet, von seinem KI-Strategie-Builder bis zu seiner Indikator-Suite mit 1,3 Mio. Followern.",
      es: "Qué ofrece ahora, desde su creador de estrategias con IA hasta su suite de indicadores con 1,3 M de seguidores.",
      fr: "Ce qu'il propose désormais, de son générateur de stratégies IA à sa suite d'indicateurs suivie par 1,3 M de personnes.",
      it: "Cosa offre ora, dal suo strategy builder basato su IA alla sua suite di indicatori con 1,3 milioni di follower.",
    },
  },
  {
    slug: "zeiierman",
    name: "Zeiierman Trading",
    category: "TradingView Indicators",
    blurb: {
      en: "What it offers across indicators, paid signals, and mentorship.",
      de: "Was es über Indikatoren, kostenpflichtige Signale und Mentoring bietet.",
      es: "Qué ofrece en indicadores, señales de pago y mentoría.",
      fr: "Ce qu'il propose entre indicateurs, signaux payants et mentorat.",
      it: "Cosa offre tra indicatori, segnali a pagamento e mentorship.",
    },
  },
  {
    slug: "bigbeluga",
    name: "BigBeluga",
    category: "TradingView Indicators",
    blurb: {
      en: "What it offers across nine toolkits and a browser extension.",
      de: "Was es über neun Toolkits und eine Browser-Erweiterung bietet.",
      es: "Qué ofrece en sus nueve kits de herramientas y una extensión de navegador.",
      fr: "Ce qu'il propose à travers neuf kits d'outils et une extension de navigateur.",
      it: "Cosa offre nei suoi nove toolkit e in un'estensione per browser.",
    },
  },
  {
    slug: "theindicatorstore",
    name: "The Indicator Store",
    category: "TradingView Indicators",
    blurb: {
      en: "What it sells across NinjaTrader, TradingView, automation, and education.",
      de: "Was es über NinjaTrader, TradingView, Automatisierung und Weiterbildung hinweg verkauft.",
      es: "Qué vende en NinjaTrader, TradingView, automatización y educación.",
      fr: "Ce qu'il vend entre NinjaTrader, TradingView, automatisation et formation.",
      it: "Cosa vende tra NinjaTrader, TradingView, automazione e formazione.",
    },
  },
  {
    slug: "pinecoders",
    name: "PineCoders",
    category: "TradingView Indicators",
    blurb: {
      en: "A ~40-member volunteer group behind open Pine Script libraries and a TradingView freelancer directory.",
      de: "Eine ehrenamtliche Gruppe von rund 40 Mitgliedern hinter offenen Pine-Script-Bibliotheken und einem TradingView-Freelancer-Verzeichnis.",
      es: "Un grupo voluntario de unos 40 miembros detrás de bibliotecas abiertas de Pine Script y un directorio de freelancers de TradingView.",
      fr: "Un groupe bénévole d'environ 40 membres à l'origine de bibliothèques Pine Script ouvertes et d'un annuaire de freelances TradingView.",
      it: "Un gruppo di volontari di circa 40 membri dietro librerie Pine Script open e una directory di freelance TradingView.",
    },
  },
];
