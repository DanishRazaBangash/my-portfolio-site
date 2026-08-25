import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { BASE_URL, FULL_NAME, OG_IMAGE, PERSON_ID, WEBSITE_ID } from '@/lib/seo'

const DEFAULT_DESC =
  'MERN stack developer and AI integration specialist in Peshawar, Pakistan. ' +
  "I'm Danish Raza Bangash — I built BotForge, a no-code AI chatbot platform with 91.7% RAG accuracy."

/**
 * Client-side head management for SPA navigations.
 *
 * The server already injects the same tags into index.html for the initial
 * request (that is what crawlers see), so this exists to keep the head correct
 * once React Router takes over. Schema @ids are deliberately identical to the
 * server-injected ones — matching @ids make the two copies merge into a single
 * node instead of duplicating the entity.
 */
export default function SEOMeta({
  title,
  /**
   * Complete <title>, used verbatim with no " — {name}" suffix appended.
   *
   * Google displays the site name on its own line in the result and strips a
   * trailing "— Site Name" from the title as redundant, which collapsed
   * "Blog — Danish Raza Bangash" down to just "Blog". Pages that need the name
   * to survive have to carry it inside the title phrase instead of as a suffix.
   */
  exactTitle,
  description = DEFAULT_DESC,
  image,
  path = '/',
  type = 'website',
  publishedAt,
  updatedAt,
  tags = [],
  noindex = false,
  /**
   * Prebuilt JSON-LD graph, rendered verbatim. Project pages pass the graph
   * from lib/projectSchema.js — the same builder server.js uses — so the copy
   * React emits after a client-side navigation carries @ids identical to the
   * server-injected one and merges with it rather than competing.
   */
  graph,
}) {
  const fullTitle =
    exactTitle ||
    (title ? `${title} — ${FULL_NAME}` : `${FULL_NAME} — MERN Stack & AI Developer, Peshawar`)
  const fullUrl = `${BASE_URL}${path}`
  const ogImage = image || OG_IMAGE
  const isArticle = type === 'article'
  const imageAlt = title ? `${title} — ${FULL_NAME}` : FULL_NAME

  const articleGraph = isArticle
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            '@id': `${fullUrl}#article`,
            headline: title, // raw post title, no site-name suffix
            description,
            image: ogImage,
            url: fullUrl,
            mainEntityOfPage: { '@type': 'WebPage', '@id': fullUrl },
            datePublished: publishedAt,
            dateModified: updatedAt || publishedAt,
            keywords: tags.join(', '),
            inLanguage: 'en',
            isPartOf: { '@id': WEBSITE_ID },
            // Reference the site-wide Person rather than re-declaring it, so
            // every post reinforces one entity instead of creating a new one.
            author: { '@id': PERSON_ID },
            publisher: { '@id': PERSON_ID },
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${fullUrl}#breadcrumb`,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
              { '@type': 'ListItem', position: 3, name: title },
            ],
          },
        ],
      })
    : null

  /*
   * Singleton head tags are synced in place rather than rendered.
   *
   * index.html ships a full set of these, and server.js rewrites them per route
   * — that copy is what crawlers and social scrapers read, since neither runs
   * our JavaScript. Rendering the same tags through Helmet as well produced a
   * SECOND copy of each: React 19 makes react-helmet-async take its
   * React19Dispatcher path, which emits plain <meta>/<link> elements and leans
   * on React's native metadata hoisting, so the tag-reconciling code that would
   * have replaced the originals never runs. Two <link rel="canonical"> is not a
   * tie-break Google resolves — it discards both.
   *
   * Updating the existing nodes keeps exactly one of each, correct on first
   * paint (the server already set it) and correct after a client-side
   * navigation (this effect rewrites it).
   */
  useEffect(() => {
    const head = document.head

    const sync = (selector, create, attr, value) => {
      if (value == null) return
      let el = head.querySelector(selector)
      if (!el) {
        el = create()
        head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }
    const meta = (key, kind, value) =>
      sync(`meta[${kind}="${key}"]`, () => {
        const el = document.createElement('meta')
        el.setAttribute(kind, key)
        return el
      }, 'content', value)

    document.title = fullTitle

    meta('description', 'name', description)
    meta('author', 'name', FULL_NAME)
    meta('robots', 'name',
      noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1')

    sync('link[rel="canonical"]', () => {
      const el = document.createElement('link')
      el.setAttribute('rel', 'canonical')
      return el
    }, 'href', fullUrl)

    meta('og:type', 'property', type)
    meta('og:url', 'property', fullUrl)
    meta('og:title', 'property', fullTitle)
    meta('og:description', 'property', description)
    meta('og:image', 'property', ogImage)
    meta('og:image:alt', 'property', imageAlt)
    meta('og:site_name', 'property', FULL_NAME)
    meta('og:locale', 'property', 'en_US')

    meta('twitter:card', 'name', 'summary_large_image')
    meta('twitter:title', 'name', fullTitle)
    meta('twitter:description', 'name', description)
    meta('twitter:image', 'name', ogImage)
    meta('twitter:image:alt', 'name', imageAlt)
  }, [fullTitle, description, fullUrl, ogImage, imageAlt, type, noindex])

  /*
   * Only additive tags still go through Helmet. Article/graph JSON-LD may
   * legitimately appear twice — matching @ids merge into one entity — and the
   * article:* properties have no static counterpart to overwrite.
   */
  return (
    <Helmet>
      {isArticle && publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {isArticle && updatedAt && <meta property="article:modified_time" content={updatedAt} />}
      {isArticle && <meta property="article:author" content={`${BASE_URL}/#person`} />}
      {isArticle && tags.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}

      {isArticle && <script type="application/ld+json">{articleGraph}</script>}
      {graph && <script type="application/ld+json">{JSON.stringify(graph)}</script>}
    </Helmet>
  )
}
