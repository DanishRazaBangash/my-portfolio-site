import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SEOMeta from '@/components/shared/SEOMeta'
import { PROJECTS_LIST } from '@/lib/projects'
import { projectsIndexGraph } from '@/lib/projectSchema'
import { FULL_NAME, BASE_URL, PERSON_ID, WEBSITE_ID } from '@/lib/seo'

const TITLE = `Projects by ${FULL_NAME} — AI, RAG & Full-Stack Builds`

// Kept under ~160 characters so Google renders it whole rather than clipping
// mid-sentence. server.js must state this verbatim.
const DESCRIPTION =
  `Four shipped products by ${FULL_NAME} — an AI chatbot platform, an AI football companion, ` +
  'a 21-tool developer toolbox and an AI-agent ticketing app.'

function ProjectCard({ project, index }) {
  const isFirst = index === 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group relative glass glass-hover rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 flex flex-col"
    >
      {/*
        Explicit width/height reserves the 16:9 box before the file arrives, so
        the card never reflows underneath the cursor. The first image is the
        LCP candidate on this route and is fetched eagerly; the rest wait.
      */}
      <img
        src={project.screenshot}
        alt={project.screenshotAlt}
        width="1200"
        height="675"
        loading={isFirst ? 'eager' : 'lazy'}
        fetchPriority={isFirst ? 'high' : undefined}
        className="w-full aspect-video object-cover object-top border-b border-white/08 opacity-90 group-hover:opacity-100 transition-opacity"
      />

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-1">
          {/*
            Only the title is a link, and its ::after blankets the card — that
            keeps one crawlable link per card carrying the project name as
            anchor text, instead of a wrapper <a> with the whole card inside it.
            It also avoids nesting the "Visit site" anchor inside another anchor,
            which is invalid HTML and drops out of the accessibility tree.
          */}
          <h2 className="text-white font-semibold text-lg leading-tight">
            <Link
              to={`/projects/${project.slug}`}
              className="after:content-[''] after:absolute after:inset-0 after:rounded-2xl"
            >
              {project.name}
            </Link>
          </h2>
          <span className="text-xs tabular-nums text-white/25 shrink-0 mt-1">{project.year}</span>
        </div>

        <p className="text-white/40 text-xs mb-3">{project.tagline}</p>
        <p className="text-white/60 text-sm leading-relaxed mb-5">{project.summary}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 bg-white/06 text-white/50 rounded-md">
              {t}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="text-[11px] px-2 py-0.5 bg-white/06 text-white/30 rounded-md">
              +{project.tech.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-white/06">
          <span className="inline-flex items-center gap-1.5 text-xs text-white/50 group-hover:text-white transition-colors">
            Read the write-up
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </span>

          {project.liveUrl && (
            // z-10 lifts this above the title link's ::after overlay so it stays
            // independently clickable rather than being swallowed by the card.
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-live relative z-10 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border transition-colors"
            >
              Visit site <ArrowUpRight size={10} />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export default function Projects() {
  return (
    <>
      <SEOMeta
        title="Projects"
        // Name inside the phrase, not a trailing suffix — Google strips a
        // matching "— Site Name" tail, which collapsed /blog's title to "Blog".
        exactTitle={TITLE}
        description={DESCRIPTION}
        path="/projects"
        graph={projectsIndexGraph({
          domain: BASE_URL, personId: PERSON_ID, siteId: WEBSITE_ID,
          title: TITLE, description: DESCRIPTION,
        })}
      />
      <Navbar />
      <main className="min-h-screen pt-28 md:pt-10 pb-20 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs tracking-widest uppercase text-white/30 mb-3">Work</p>
            {/* Renders "Projects" as the display word while reading as
                "Projects by Danish Raza Bangash" to a crawler — a bare
                <h1>Projects</h1> is what Google uses to override the title. */}
            <h1 className="text-3xl sm:text-5xl font-bold text-gradient mb-4">
              Projects
              <span className="block text-base sm:text-lg font-medium text-white/40 mt-2">
                by {FULL_NAME}
              </span>
            </h1>
            <p className="text-white/50 text-sm max-w-xl leading-relaxed">
              Four products I designed, built and deployed — each one live, each with a write-up on
              the architecture behind it. More on the{' '}
              <Link
                to="/"
                state={{ scrollTo: '#about' }}
                className="text-white/70 hover:text-white underline underline-offset-2 transition-colors"
              >
                person who built them
              </Link>
              .
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {PROJECTS_LIST.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
