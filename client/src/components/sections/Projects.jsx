import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { PROJECTS_LIST } from '@/lib/projects'

/*
 * Home-page index of the project catalogue — names and one line each, nothing
 * more. The full cards, screenshots and write-ups live on /projects and
 * /projects/:slug.
 *
 * This used to be a card grid whose detail lived in a modal. A modal has no URL,
 * so none of that writing could be linked, shared or indexed; every row here is
 * a real <Link> to a real page instead.
 */
export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="projects" className="py-16 md:py-28 px-6">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-10 sm:mb-14"
        >
          <p className="text-xs tracking-widest uppercase text-white/30 mb-3">What I've built</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">Projects</h2>
          <p className="text-white/50 text-sm max-w-lg">
            Four shipped products, each live and each with a full write-up.
          </p>
        </motion.div>

        <ul className="border-b border-white/08">
          {PROJECTS_LIST.map((p, i) => (
            <motion.li
              key={p.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.07 }}
              className="border-t border-white/08"
            >
              <Link
                to={`/projects/${p.slug}`}
                className="group flex items-center gap-4 sm:gap-6 py-5 sm:py-6 -mx-3 px-3 rounded-lg hover:bg-white/04 transition-colors"
              >
                {/* tabular-nums keeps the index column from shifting width */}
                <span className="text-xs tabular-nums text-white/25 group-hover:text-white/45 transition-colors shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold text-base sm:text-lg leading-tight">
                    {p.name}
                  </h3>
                  <p className="text-white/40 text-xs sm:text-sm mt-1 truncate">{p.tagline}</p>
                </div>

                <span className="hidden sm:block text-xs tabular-nums text-white/25 shrink-0">
                  {p.year}
                </span>

                <ArrowUpRight
                  size={16}
                  className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                />
              </Link>
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="mt-8 flex justify-end"
        >
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            View all projects
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
