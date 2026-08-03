import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { connectDB } from './config/db.js'
import authRoutes    from './routes/auth.js'
import postRoutes    from './routes/posts.js'
import commentRoutes from './routes/comments.js'
import contactRoutes from './routes/contact.js'
import Post from './models/Post.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

const app  = express()
const PORT = process.env.PORT || 5000
const isProd = process.env.NODE_ENV === 'production'

// Render (and most cloud hosts) sit behind a reverse proxy
app.set('trust proxy', 1)

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", 'https://chatbot-builder-widget.onrender.com', 'https://botforge.danishraza.dev'],
      // The BotForge widget wires its buttons up with inline on* attributes,
      // which helmet's default `script-src-attr 'none'` would block.
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc:  ["'self'", 'https://api.github.com', 'https://github-contributions-api.jogruber.de', 'https://chatbot-builder-widget.onrender.com', 'https://chatbot-builder-api-2v3u.onrender.com', 'https://botforge.danishraza.dev'],
      // Inter is self-hosted now — no Google Fonts origins needed
      fontSrc:     ["'self'", 'data:'],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: isProd ? [] : null,
    },
  },
}))

const allowedOrigins = isProd
  ? [process.env.CLIENT_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:4173']

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(morgan(isProd ? 'combined' : 'dev'))
app.use(express.json({ limit: '2mb' }))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false })
app.use('/api', limiter)

const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 })

app.use('/api/auth',     authRoutes)
app.use('/api/posts',    postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/contact',  contactLimiter, contactRoutes)

app.get('/api/health', (_, res) => res.json({ ok: true }))

const DOMAIN = 'https://danishraza.dev'

/*
 * Canonical name. "Danish Raza Bangash" contains "Danish Raza" as an exact
 * substring, so a single spelling serves both search queries — see
 * client/src/lib/seo.js, which must stay in sync with these values.
 */
const SITE      = 'Danish Raza Bangash'
const PERSON_ID = `${DOMAIN}/#person`
const SITE_ID   = `${DOMAIN}/#website`
const DEF_TITLE = `${SITE} — MERN Stack & AI Developer, Peshawar`
const DEF_DESC  = "MERN stack developer and AI integration specialist in Peshawar, Pakistan. I'm Danish Raza Bangash — I built BotForge, a no-code AI chatbot platform with ~90% RAG accuracy."
const DEF_IMG   = `${DOMAIN}/og-image.png`

// Escape special HTML characters so injected values can't break the document
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Replace the static meta tags baked into index.html with route-specific values.
// The regexes are deliberately simple because we control the template format.
function injectMeta(template, { title, description, url, image, ogType, extraHead = '', noindex = false }) {
  let html = template
    .replace(/(<title>)[^<]*(<\/title>)/,                                  `$1${escHtml(title)}$2`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/,           `$1${escHtml(description)}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/,                 `$1${url}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,            `$1${url}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,          `$1${escHtml(title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,    `$1${escHtml(description)}$2`)
    .replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/,          `$1${image}$2`)
    .replace(/(<meta\s+property="og:image:alt"\s+content=")[^"]*(")/,      `$1${escHtml(title)}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,         `$1${escHtml(title)}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,   `$1${escHtml(description)}$2`)
    .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,         `$1${image}$2`)
    .replace(/(<meta\s+name="twitter:image:alt"\s+content=")[^"]*(")/,     `$1${escHtml(title)}$2`)

  if (ogType) {
    html = html.replace(/(<meta\s+property="og:type"\s+content=")[^"]*(")/, `$1${ogType}$2`)
  }

  // The declared 1200x630 only describes the default OG image. A post cover is
  // an arbitrary size, and lying about it makes Slack/X render a broken crop —
  // better to drop the hint and let the scraper measure the file itself.
  if (image !== DEF_IMG) {
    html = html
      .replace(/\s*<meta\s+property="og:image:type"[^>]*>/,   '')
      .replace(/\s*<meta\s+property="og:image:width"[^>]*>/,  '')
      .replace(/\s*<meta\s+property="og:image:height"[^>]*>/, '')
  }

  if (noindex) {
    html = html.replace(/(<meta\s+name="robots"\s+content=")[^"]*(")/, '$1noindex, nofollow$2')
  }

  return html.replace('</head>', `${extraHead}</head>`)
}

const ldScript = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`

app.get('/sitemap.xml', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' }).select('slug updatedAt').lean()
    const day = (d) => new Date(d).toISOString().split('T')[0]

    // lastmod has to be truthful. Stamping "today" on every crawl is the classic
    // way to get a sitemap's dates ignored outright, so derive it from the most
    // recently touched post instead.
    const latest = posts.reduce(
      (acc, p) => (new Date(p.updatedAt) > new Date(acc) ? p.updatedAt : acc),
      posts[0]?.updatedAt || new Date(),
    )
    const staticEntries = [
      `  <url><loc>${DOMAIN}/</loc><lastmod>${day(latest)}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
      `  <url><loc>${DOMAIN}/blog</loc><lastmod>${day(latest)}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`,
    ]
    const postEntries = posts.map((p) =>
      `  <url><loc>${DOMAIN}/blog/${p.slug}</loc><lastmod>${new Date(p.updatedAt).toISOString().split('T')[0]}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
    )
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...postEntries].join('\n')}\n</urlset>`
    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.send(xml)
  } catch (err) {
    console.error('Sitemap error:', err)
    res.status(500).send('Error generating sitemap')
  }
})

const escXml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

app.get('/rss.xml', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .select('title slug excerpt publishedAt tags')
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean()

    const items = posts.map((p) => `    <item>
      <title>${escXml(p.title)}</title>
      <link>${DOMAIN}/blog/${p.slug}</link>
      <guid isPermaLink="true">${DOMAIN}/blog/${p.slug}</guid>
      <description>${escXml(p.excerpt || '')}</description>
      <dc:creator>${escXml(SITE)}</dc:creator>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
${(p.tags || []).map((t) => `      <category>${escXml(t)}</category>`).join('\n')}
    </item>`).join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escXml(SITE)} — Blog</title>
    <link>${DOMAIN}/blog</link>
    <atom:link href="${DOMAIN}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Thoughts on MERN development, AI integration, and RAG pipelines by ${escXml(SITE)}.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.send(xml)
  } catch (err) {
    console.error('RSS error:', err)
    res.status(500).send('Error generating feed')
  }
})

if (isProd) {
  const distPath = join(__dirname, '../client/dist')
  // Read template once at startup — every deploy restarts the server anyway
  const template = readFileSync(join(distPath, 'index.html'), 'utf-8')

  // Render also serves this app on its *.onrender.com hostname. Left alone that
  // is a full duplicate of the site on a second domain, so send every hit there
  // to the canonical apex with a 301 and let the link equity consolidate.
  app.use((req, res, next) => {
    if (req.hostname.endsWith('.onrender.com')) {
      return res.redirect(301, `${DOMAIN}${req.originalUrl}`)
    }
    next()
  })

  // The resume was renamed to carry the full name; keep the old URL alive since
  // it may already be indexed or linked from an application.
  app.get('/Danish-Raza-resume.pdf', (req, res) =>
    res.redirect(301, '/Danish-Raza-Bangash-Resume.pdf'))

  // /blog/ and /blog resolve to the same page. Collapse to one canonical form so
  // crawlers don't have to guess which of the two is the real URL.
  app.use((req, res, next) => {
    if (req.path.length > 1 && req.path.endsWith('/')) {
      const query = req.originalUrl.slice(req.path.length)
      return res.redirect(301, req.path.slice(0, -1) + query)
    }
    next()
  })

  // { index: false } prevents express.static from serving index.html for '/'
  // so our smart catch-all below handles every HTML request instead
  app.use(express.static(distPath, { index: false }))

  app.get('*', async (req, res) => {
    const pathname = req.path

    const meta = {
      title:       DEF_TITLE,
      description: DEF_DESC,
      url:         `${DOMAIN}${pathname}`,
      image:       DEF_IMG,
      ogType:      'website',
      extraHead:   '',
      noindex:     false,
    }
    // Anything that isn't a real route gets a genuine 404 further down —
    // serving 200 for every unknown URL is what Google reports as a soft 404.
    let status = 404

    if (pathname === '/') {
      status = 200
      meta.ogType = 'profile'
      // ProfilePage is the type Google uses for pages that are *about* a person.
      // It lives here rather than in index.html because index.html is the
      // template for every route, and /blog is not a profile page.
      meta.extraHead = ldScript({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'ProfilePage',
            '@id': `${DOMAIN}/#webpage`,
            url: `${DOMAIN}/`,
            name: DEF_TITLE,
            description: DEF_DESC,
            inLanguage: 'en',
            isPartOf: { '@id': SITE_ID },
            about: { '@id': PERSON_ID },
            mainEntity: { '@id': PERSON_ID },
            primaryImageOfPage: { '@id': `${DOMAIN}/#personimage` },
          },
          // Shipped products as their own entities, each attributed to the same
          // Person. Google treats these subdomains as separate sites, so this is
          // what tells it they belong to one author — the `url` must be the
          // branded subdomain, not the underlying host it happens to deploy to.
          {
            '@type': 'WebApplication',
            '@id': `${DOMAIN}/#botforge`,
            name: 'BotForge',
            alternateName: 'BotForge — AI Chatbot Builder',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Web',
            url: 'https://botforge.danishraza.dev/',
            sameAs: 'https://botforge.danishraza.dev/',
            description: 'A no-code platform for creating, training, and deploying AI chatbots, built on a four-tier parallel RAG pipeline that reaches ~90% retrieval accuracy at ~780ms latency.',
            author: { '@id': PERSON_ID },
            creator: { '@id': PERSON_ID },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@type': 'WebApplication',
            '@id': `${DOMAIN}/#footalyzer`,
            name: 'Footalyzer',
            alternateName: 'Footalyzer — AI football briefings, live scores & predictions',
            applicationCategory: 'SportsApplication',
            operatingSystem: 'Web',
            url: 'https://footalyzer.danishraza.dev/',
            sameAs: 'https://footalyzer.danishraza.dev/',
            description: 'A football companion delivering AI-generated match briefings, live scores, predictions and private prediction leagues across major competitions.',
            author: { '@id': PERSON_ID },
            creator: { '@id': PERSON_ID },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
        ],
      })

    } else if (pathname === '/blog') {
      status = 200
      // Not `Blog — ${SITE}`: Google renders the site name on its own line in the
      // result and strips a matching trailing suffix, which collapsed this to a
      // bare "Blog". Keeping the name inside the phrase survives that rewrite.
      meta.title       = `Blog by ${SITE} — MERN, AI & RAG Engineering`
      meta.description = `Thoughts on MERN development, AI integration, RAG pipelines, and building things at scale — by ${SITE}.`
      meta.extraHead   = ldScript({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Blog',
            '@id': `${DOMAIN}/blog#blog`,
            url: `${DOMAIN}/blog`,
            name: `${SITE} — Blog`,
            description: meta.description,
            inLanguage: 'en',
            isPartOf: { '@id': SITE_ID },
            author: { '@id': PERSON_ID },
            publisher: { '@id': PERSON_ID },
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${DOMAIN}/blog#breadcrumb`,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${DOMAIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `${DOMAIN}/blog` },
            ],
          },
        ],
      })

    } else if (pathname.startsWith('/admin')) {
      // Never index the admin surface, regardless of what robots.txt says —
      // a Disallow only stops crawling, a noindex stops the URL appearing.
      status = 200
      meta.noindex = true
      meta.title   = `Admin — ${SITE}`

    } else if (pathname.startsWith('/blog/')) {
      const slug = pathname.slice(6)
      try {
        const post = await Post
          .findOne({ slug, status: 'published' })
          .select('title excerpt coverImage publishedAt updatedAt tags')
          .lean()

        if (post) {
          status = 200
          meta.title       = `${post.title} — ${SITE}`
          meta.description = post.excerpt || DEF_DESC
          meta.ogType      = 'article'
          if (post.coverImage) meta.image = post.coverImage

          // @ids match the ones SEOMeta.jsx emits client-side, so the two copies
          // merge into one node instead of registering as duplicate entities.
          // author/publisher point at the site-wide Person by reference, which
          // is what makes every post reinforce a single "Danish Raza Bangash".
          meta.extraHead = ldScript({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'BlogPosting',
                '@id': `${meta.url}#article`,
                headline: post.title,
                description: meta.description,
                image: meta.image,
                url: meta.url,
                mainEntityOfPage: { '@type': 'WebPage', '@id': meta.url },
                datePublished: post.publishedAt,
                dateModified: post.updatedAt || post.publishedAt,
                keywords: (post.tags || []).join(', '),
                inLanguage: 'en',
                isPartOf: { '@id': SITE_ID },
                author: { '@id': PERSON_ID },
                publisher: { '@id': PERSON_ID },
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${meta.url}#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${DOMAIN}/` },
                  { '@type': 'ListItem', position: 2, name: 'Blog', item: `${DOMAIN}/blog` },
                  { '@type': 'ListItem', position: 3, name: post.title },
                ],
              },
            ],
          })
        }
      } catch (err) {
        console.error('SSR meta error for', slug, err.message)
        // Never crash the request — but don't claim 200 for a page we couldn't
        // resolve either, or a transient DB blip turns into an indexed empty page.
        status = 503
      }
    }

    if (status === 404) {
      meta.title       = `404 — Page Not Found — ${SITE}`
      meta.description = "This page doesn't exist. Let me help you find your way back."
      meta.noindex     = true
    }

    res.status(status).send(injectMeta(template, meta))
  })
}

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => { console.error(err); process.exit(1) })
