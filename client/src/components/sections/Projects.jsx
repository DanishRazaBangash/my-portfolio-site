import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ExternalLink, X, ChevronRight } from 'lucide-react'
import { GitHubIcon } from '@/components/shared/SocialIcons'

const projects = [
  {
    title: 'BotForge',
    subtitle: 'AI-Powered No-Code Chatbot Builder',
    description:
      'A production-grade platform enabling businesses to create, train, and deploy AI chatbots without writing code. Features embeddable widgets for any website and a comprehensive analytics dashboard.',
    longDescription:
      "BotForge's core is a four-tier parallel RAG pipeline built with Promise.all — combining semantic cosine similarity search (Gemini gemini-embedding-2, 3072-dimensional vectors) at 1.8× weight, MongoDB full-text search at 1.5×, regex keyword matching at 1.0×, and fuzzy per-word matching at 0.6×. Results are merged via weighted scoring, achieving ~90% retrieval accuracy at ~780ms latency.\n\nBuilt under the supervision of Dr. Sara Shehzad. Deployed on Render (three separate services: backend, widget, frontend) with MongoDB Atlas. Includes multi-tier subscription model (Free, Pro, Business) and conversation history tracking.",
    tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Gemini API', 'Docker', 'Render'],
    github: 'https://github.com/danishrazabangash',
    live: 'https://botforge.danishraza.dev/',
    badge: null,
  },
  {
    title: 'Footalyzer',
    subtitle: 'AI-Powered Football Companion App',
    description:
      'A full-stack football companion delivering AI-generated match briefings alongside live scores and real-time match data across major competitions, including the Premier League and Champions League.',
    longDescription:
      'Built and deployed a full-stack football companion platform delivering AI-generated match briefings alongside live scores and real-time match data across major competitions, including the Premier League and Champions League.\n\nDesigned a Node.js/Express backend with MongoDB and Redis (Upstash), using BullMQ for background job processing and Socket.io for real-time score and event updates.\n\nIntegrated Clerk authentication and a Stripe-powered tiered subscription model, taking the product from concept to a live, monetised deployment.',
    tech: [
      'Next.js 14', 'Express.js', 'MongoDB', 'Redis (Upstash)',
      'BullMQ', 'Socket.io', 'Clerk', 'Stripe',
    ],
    github: null,
    live: 'https://footalyzer.danishraza.dev',
    badge: null,
  },
  {
    title: 'Real-Time Chat App',
    subtitle: 'WebSocket-Powered Messaging Platform',
    description:
      'A full-featured real-time messaging platform supporting private messaging, group chats, online status indicators, and persistent message history.',
    longDescription:
      'Built on Socket.io for bidirectional real-time communication. Features JWT-based authentication, efficient MongoDB schemas designed for scalable message storage, online presence indicators, and read receipts. Group management supports room creation, joining, and admin controls.',
    tech: ['React.js', 'Node.js', 'Express.js', 'Socket.io', 'MongoDB', 'JWT'],
    github: 'https://github.com/danishrazabangash',
    live: null,
    badge: null,
  },
  {
    title: 'Event Booking Platform',
    subtitle: 'Role-Based Ticketing & Management System',
    description:
      'A full-stack event management platform with role-based access control for admins, organisers, and attendees. Features QR-code ticket verification.',
    longDescription:
      'Three distinct dashboards tailored to each user role — admins manage the platform, organisers create and manage events, attendees discover and book tickets. QR codes are generated on booking and verified on-site. Cloudinary handles image uploads for event covers and organiser profiles. Responsive design works across all devices.',
    tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Cloudinary', 'JWT'],
    github: 'https://github.com/danishrazabangash',
    live: null,
    badge: null,
  },
]

function ProjectCard({ project, onClick }) {
  return (
    <motion.div
      layout
      className="glass glass-hover rounded-2xl p-6 flex flex-col gap-4 cursor-pointer group transition-all duration-200"
      onClick={() => onClick(project)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold text-base">{project.title}</h3>
            {project.badge && (
              <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white/70 rounded-full border border-white/12">
                {project.badge}
              </span>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="pill-live flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors"
              >
                <ExternalLink size={9} /> Visit Site
              </a>
            )}
          </div>
          <p className="text-white/40 text-xs">{project.subtitle}</p>
        </div>
        <ChevronRight
          size={16}
          className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all shrink-0 mt-1"
        />
      </div>

      <p className="text-white/60 text-sm leading-relaxed">{project.description}</p>

      <div className="flex flex-wrap gap-1.5 mt-auto">
        {project.tech.slice(0, 5).map((t) => (
          <span key={t} className="text-[11px] px-2 py-0.5 bg-white/05 text-white/50 rounded-md">
            {t}
          </span>
        ))}
        {project.tech.length > 5 && (
          <span className="text-[11px] px-2 py-0.5 bg-white/05 text-white/30 rounded-md">
            +{project.tech.length - 5}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function ProjectModal({ project, onClose }) {
  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-300"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-301 px-4"
          >
            <div className="glass rounded-2xl p-7 max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white text-xl font-bold">{project.title}</h3>
                    {project.badge && (
                      <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white/70 rounded-full border border-white/12">
                        {project.badge}
                      </span>
                    )}
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill-live flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors"
                      >
                        <ExternalLink size={9} /> Visit Site
                      </a>
                    )}
                  </div>
                  <p className="text-white/40 text-sm">{project.subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center glass rounded-lg hover:bg-white/10 text-white/50 hover:text-white shrink-0 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Overview</p>
                  {project.longDescription.split('\n\n').map((para, i) => (
                    <p key={i} className="text-white/65 text-sm leading-relaxed mb-3">{para}</p>
                  ))}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <span key={t} className="text-xs px-3 py-1 bg-white/06 text-white/70 rounded-lg border border-white/08">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors"
                    >
                      <GitHubIcon size={15} /> GitHub
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 glass text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink size={15} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [selected, setSelected] = useState(null)

  return (
    <section id="projects" className="py-16 md:py-28 px-6">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs tracking-widest uppercase text-white/30 mb-3">What I've built</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">Projects</h2>
          <p className="text-white/50 text-sm mb-8 sm:mb-12 max-w-lg">
            Click any project to read the full case study, tech decisions, and architecture details.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <ProjectCard project={p} onClick={setSelected} />
            </motion.div>
          ))}
        </div>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
