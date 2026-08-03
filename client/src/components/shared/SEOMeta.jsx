import { Helmet } from 'react-helmet-async'
import { BASE_URL, FULL_NAME, OG_IMAGE, PERSON_ID, WEBSITE_ID } from '@/lib/seo'

const DEFAULT_DESC =
  'MERN stack developer and AI integration specialist in Peshawar, Pakistan. ' +
  "I'm Danish Raza Bangash — I built BotForge, a no-code AI chatbot platform with ~90% RAG accuracy."

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
}) {
  const fullTitle =
    exactTitle ||
    (title ? `${title} — ${FULL_NAME}` : `${FULL_NAME} — MERN Stack & AI Developer, Peshawar`)
  const fullUrl = `${BASE_URL}${path}`
  const ogImage = image || OG_IMAGE
  const isArticle = type === 'article'

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

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={FULL_NAME} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'}
      />
      <link rel="canonical" href={fullUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title ? `${title} — ${FULL_NAME}` : FULL_NAME} />
      <meta property="og:site_name" content={FULL_NAME} />
      <meta property="og:locale" content="en_US" />
      {isArticle && publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {isArticle && updatedAt && <meta property="article:modified_time" content={updatedAt} />}
      {isArticle && <meta property="article:author" content={`${BASE_URL}/#person`} />}
      {isArticle && tags.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title ? `${title} — ${FULL_NAME}` : FULL_NAME} />

      {isArticle && <script type="application/ld+json">{articleGraph}</script>}
    </Helmet>
  )
}
