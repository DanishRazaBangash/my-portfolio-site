/**
 * JSON-LD builders for the project pages.
 *
 * Imported by BOTH server.js — for the copy injected into the HTML, which is
 * what crawlers actually read — and SEOMeta, for the copy React re-emits after
 * a client-side navigation. Sharing one builder is what guarantees the two
 * copies carry byte-identical @ids: matching @ids merge into a single entity,
 * while differing ones create competing duplicates of the same product.
 *
 * The caller supplies the identity constants because the server and the client
 * each already hold their own copy of them.
 *
 * Same constraints as projects.js — plain ESM, no dependencies, no JSX.
 */
import { PROJECTS_LIST, getProject } from './projects.js'

/** Stable @id for a project, identical on the home page, the index and its own
 *  page. Everything else keys off this. */
export const projectId = (domain, slug) => `${domain}/projects/${slug}#project`

/**
 * One project as a schema.org node.
 *
 * `detailed` is the difference between the page that IS about this project and
 * the pages that merely mention it. The detail page emits the full node; the
 * home page and the index emit the identifying subset, so they reinforce the
 * same entity without restating (and risking contradicting) its description.
 */
export function projectNode(p, { domain, personId }, { detailed = false } = {}) {
  const pageUrl = `${domain}/projects/${p.slug}`
  const node = {
    '@type': p.schemaType,
    '@id': projectId(domain, p.slug),
    name: p.name,
    // For something deployed, `url` is where the thing lives; the page that
    // describes it is mainEntityOfPage. Collapsing the two loses the deployment.
    url: p.liveUrl || pageUrl,
    mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
    author: { '@id': personId },
    creator: { '@id': personId },
  }
  if (!detailed) return node

  node.alternateName = `${p.name} — ${p.tagline}`
  node.description = p.description
  node.image = `${domain}${p.screenshot}`
  node.screenshot = `${domain}${p.screenshot}`
  node.dateModified = p.updated
  node.sameAs = [p.liveUrl, p.githubUrl].filter(Boolean)
  if (p.githubUrl) node.codeRepository = p.githubUrl
  if (p.tech?.length) node.keywords = p.tech.join(', ')

  // applicationCategory/operatingSystem/offers only mean anything for something
  // you can go and run. A source-only entry gets none of them.
  if (p.schemaType === 'WebApplication') {
    node.applicationCategory = p.appCategory
    node.operatingSystem = 'Web'
    node.offers = { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  }
  return node
}

/** Every project, identifying subset — for the home page's graph. */
export function allProjectNodes(ids) {
  return PROJECTS_LIST.map((p) => projectNode(p, ids))
}

/** Graph for /projects. */
export function projectsIndexGraph({ domain, personId, siteId, title, description }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${domain}/projects#webpage`,
        url: `${domain}/projects`,
        name: title,
        description,
        inLanguage: 'en',
        isPartOf: { '@id': siteId },
        about: { '@id': personId },
        mainEntity: { '@id': `${domain}/projects#list` },
        breadcrumb: { '@id': `${domain}/projects#breadcrumb` },
      },
      {
        '@type': 'ItemList',
        '@id': `${domain}/projects#list`,
        numberOfItems: PROJECTS_LIST.length,
        itemListElement: PROJECTS_LIST.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${domain}/projects/${p.slug}`,
          name: p.name,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${domain}/projects#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${domain}/` },
          { '@type': 'ListItem', position: 2, name: 'Projects' },
        ],
      },
      ...allProjectNodes({ domain, personId }),
    ],
  }
}

/** Graph for /projects/:slug. Returns null for an unknown slug. */
export function projectDetailGraph(slug, { domain, personId, siteId }) {
  const p = getProject(slug)
  if (!p) return null
  const pageUrl = `${domain}/projects/${p.slug}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${p.name} — ${p.tagline}`,
        description: p.description,
        inLanguage: 'en',
        isPartOf: { '@id': siteId },
        primaryImageOfPage: { '@id': `${pageUrl}#image` },
        mainEntity: { '@id': projectId(domain, p.slug) },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        dateModified: p.updated,
        author: { '@id': personId },
      },
      {
        '@type': 'ImageObject',
        '@id': `${pageUrl}#image`,
        url: `${domain}${p.screenshot}`,
        contentUrl: `${domain}${p.screenshot}`,
        width: 1200,
        height: 675,
        caption: p.screenshotAlt,
      },
      projectNode(p, { domain, personId }, { detailed: true }),
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${domain}/` },
          { '@type': 'ListItem', position: 2, name: 'Projects', item: `${domain}/projects` },
          { '@type': 'ListItem', position: 3, name: p.name },
        ],
      },
    ],
  }
}
