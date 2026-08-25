/**
 * Identity constants — the single source of truth for how this person is named
 * and linked across the site.
 *
 * The SEO goal is one Google entity that answers to both "Danish Raza" and
 * "Danish Raza Bangash". That only works if the name is spelled identically
 * everywhere and every profile link is listed, so nothing here should be
 * hand-typed a second time in a component.
 */

export const BASE_URL = 'https://danishraza.dev'

/** Canonical form. Contains "Danish Raza" as an exact substring by design. */
export const FULL_NAME = 'Danish Raza Bangash'

/** Short form — used in prose where the full name would read as stuffing. */
export const SHORT_NAME = 'Danish Raza'

export const ROLE = 'MERN Stack Developer & AI Integration Specialist'
export const LOCATION = 'Peshawar, Pakistan'
export const EMAIL = 'danishrazabangash@gmail.com'

/** Stable @id for the Person node declared in index.html. Every other schema
 *  on the site references this instead of repeating the Person's fields. */
export const PERSON_ID = `${BASE_URL}/#person`
export const WEBSITE_ID = `${BASE_URL}/#website`

export const OG_IMAGE = `${BASE_URL}/og-image.png`

/** Real photograph — used as Person.image. Kept separate from OG_IMAGE, which is
 *  a text card and works for social previews but not as a face for the entity. */
export const HEADSHOT = `${BASE_URL}/headshot.jpg`
export const RESUME_PATH = '/Danish-Raza-Bangash-Resume.pdf'

/**
 * Every profile that carries either spelling of the name. This list must stay
 * identical to the Person.sameAs array in index.html — it is the main signal
 * telling Google the two name variants are one person.
 */
export const PROFILES = {
  github: 'https://github.com/danishrazabangash',
  linkedin: 'https://www.linkedin.com/in/danish-raza-bangash',
  devto: 'https://dev.to/danishrazabangash',
  youtube: 'https://www.youtube.com/@danishrazabangash1',
  instagram: 'https://www.instagram.com/danish_raza.bangash',
  // Canonical www host, not the web.facebook.com variant — the path already
  // carries the full name, which is a bonus signal for the entity.
  facebook: 'https://www.facebook.com/people/Danish-Raza-Bangash/pfbid023GY2t8Be6rMu64ChrhiaaN6kPN3PrRt9sz1bau1HXN4ffwLX6eTacQHee4V4nah3l/',
}

export const SAME_AS = Object.values(PROFILES)

/**
 * Live project deployments on project subdomains.
 *
 * Google treats a subdomain as a largely separate site, so these do not lift
 * danishraza.dev's own rankings. Their value is that each one is another
 * indexed property attributed back to the same Person `@id` — and that only
 * works if the subdomain links home and names the author.
 *
 * Defined in lib/projects.js and re-exported here: that module is the catalogue
 * the server also reads, so the URLs live there and this stays the one import
 * path components already know.
 */
export { PROJECT_URLS as PROJECTS } from './projects.js'
