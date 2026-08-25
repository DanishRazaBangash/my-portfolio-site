import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { GitHubIcon } from '@/components/shared/SocialIcons'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SEOMeta from '@/components/shared/SEOMeta'
import AuthorBio from '@/components/shared/AuthorBio'
import NotFound from '@/pages/NotFound'
import { getProject, getAdjacentProjects } from '@/lib/projects'
import { projectDetailGraph } from '@/lib/projectSchema'
import { BASE_URL, PERSON_ID, WEBSITE_ID } from '@/lib/seo'

/* One metric tile from the project's `highlights`. */
function Stat({ value, label }) {
  return (
    <div className="glass rounded-xl px-4 py-3">
      <p className="text-white font-semibold text-base leading-tight">{value}</p>
      <p className="text-white/40 text-[11px] mt-1 leading-snug">{label}</p>
    </div>
  )
}

function AdjacentLink({ project, direction }) {
  const isPrev = direction === 'prev'
  return (
    <Link
      to={`/projects/${project.slug}`}
      className={`group glass glass-hover rounded-xl p-4 flex flex-col gap-1 transition-colors ${isPrev ? '' : 'sm:items-end sm:text-right'}`}
    >
      <span className="text-[11px] uppercase tracking-widest text-white/30 flex items-center gap-1.5">
        {isPrev && <ArrowLeft size={11} className="group-hover:-translate-x-1 transition-transform" />}
        {isPrev ? 'Previous' : 'Next'}
        {!isPrev && <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />}
      </span>
      <span className="text-white text-sm font-medium">{project.name}</span>
      <span className="text-white/40 text-xs">{project.tagline}</span>
    </Link>
  )
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = getProject(slug)

  // The catalogue is static, so an unknown slug is knowable immediately —
  // no loading state, and the server returns a real 404 for the same URL.
  if (!project) return <NotFound />

  const { prev, next } = getAdjacentProjects(slug)

  return (
    <>
      <SEOMeta
        title={project.name}
        // No site-name suffix — these run 45–58 chars already, and appending
        // it pushes them past what Google will display. Matches server.js.
        exactTitle={`${project.name} — ${project.tagline}`}
        description={project.description}
        image={`${BASE_URL}${project.screenshot}`}
        path={`/projects/${project.slug}`}
        graph={projectDetailGraph(project.slug, {
          domain: BASE_URL, personId: PERSON_ID, siteId: WEBSITE_ID,
        })}
      />
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 md:pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Link to="/projects" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mb-8">
              <ArrowLeft size={13} /> All projects
            </Link>

            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">{project.name}</h1>
            <p className="text-white/55 text-base sm:text-lg mb-5">{project.tagline}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/35 mb-7">
              <span className="tabular-nums">{project.year}</span>
              <span className="text-white/20">·</span>
              <span>{project.role}</span>
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors"
                >
                  Visit site <ArrowUpRight size={15} />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 glass text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-colors"
                >
                  <GitHubIcon size={15} /> Source
                </a>
              )}
            </div>

            {/* Dimensions match the asset so the 16:9 box is reserved before the
                file lands. This is the LCP element on the route. */}
            <img
              src={project.screenshot}
              alt={project.screenshotAlt}
              width="1200"
              height="675"
              fetchPriority="high"
              className="w-full aspect-video object-cover object-top rounded-2xl border border-white/08 mb-10"
            />

            {project.highlights?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
                {project.highlights.map((h) => (
                  <Stat key={h.label} value={h.value} label={h.label} />
                ))}
              </div>
            )}

            <div className="mb-12">
              {project.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-white text-xl font-semibold mt-10 mb-3 first:mt-0">{section.heading}</h2>
                  {section.body.map((para, i) => (
                    <p key={i} className="text-white/65 text-sm leading-relaxed mb-4">{para}</p>
                  ))}
                </section>
              ))}
            </div>

            <div className="mb-12">
              <h2 className="text-xs uppercase tracking-widest text-white/30 mb-3">Built with</h2>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 bg-white/06 text-white/70 rounded-lg border border-white/08">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {(prev || next) && (
              <nav className="grid sm:grid-cols-2 gap-3 pt-8 border-t border-white/08" aria-label="More projects">
                {prev ? <AdjacentLink project={prev} direction="prev" /> : <span className="hidden sm:block" />}
                {next && <AdjacentLink project={next} direction="next" />}
              </nav>
            )}

            <AuthorBio label="Built by" />

            <div className="mt-10">
              <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                <ArrowLeft size={14} /> Back to all projects
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
