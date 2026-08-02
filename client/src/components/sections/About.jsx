import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Download, MapPin, GraduationCap, Trophy } from 'lucide-react'

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  )
}

export default function About() {
  return (
    <section id="about" className="py-16 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="flex items-center gap-5 sm:gap-6 mb-10 md:mb-16">
            {/*
              The only photograph of the site owner on the site. Google leans on
              a real face image when deciding whether a person entity is
              Knowledge-Panel-worthy, so the alt text spells out the full name
              and role rather than something like "profile photo".
            */}
            <picture className="shrink-0">
              <source
                type="image/webp"
                srcSet="/headshot-224.webp 224w, /headshot-400.webp 400w, /headshot.webp 800w"
                sizes="(min-width: 640px) 112px, 88px"
              />
              <img
                src="/headshot.jpg"
                alt="Danish Raza Bangash — MERN Stack Developer and AI Integration Specialist based in Peshawar, Pakistan"
                width="112"
                height="112"
                loading="lazy"
                decoding="async"
                className="w-22 h-22 sm:w-28 sm:h-28 rounded-2xl object-cover ring-1 ring-white/10"
              />
            </picture>
            <div>
              <p className="text-xs tracking-widest uppercase text-white/30 mb-2">Who I am</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gradient">About Me</h2>
            </div>
          </div>
        </FadeIn>

        {/* On mobile: cards first (order-1), then bio (order-2). On md+: normal left/right. */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">

          {/* Bio — order-2 on mobile, order-1 on md+ */}
          <div className="space-y-5 order-2 md:order-1">
            <FadeIn delay={0.05}>
              {/*
                Opens with the full name in visible body copy. Google weights
                visible prose far more than markup, and this is the one place a
                natural first-person introduction can carry the surname without
                reading like keyword stuffing.
              */}
              <p className="text-white/70 leading-relaxed text-sm sm:text-base">
                I'm <strong className="text-white font-medium">Danish Raza Bangash</strong> — a
                final-year Computer Science student at the University of Peshawar (GPA 3.9),
                graduating in 2026. I build full-stack web applications — primarily on the MERN stack —
                with a focus on AI integration.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-white/70 leading-relaxed text-sm sm:text-base">
                My flagship project, <span className="text-white font-medium">BotForge</span>, is a
                production-grade no-code chatbot platform featuring a custom four-tier parallel RAG
                pipeline that achieves ~90% retrieval accuracy using Gemini embeddings, MongoDB full-text
                search, regex matching, and fuzzy scoring — all merged with weighted ranking at ~780ms
                latency.
              </p>
            </FadeIn>

            {/* 3rd paragraph — context/personal; remove on mobile to reduce scroll */}
            <div className="hidden sm:block">
              <FadeIn delay={0.15}>
                <p className="text-white/70 leading-relaxed text-sm sm:text-base">
                  I'm looking to join a product-focused startup or AI team where I can contribute at scale.
                  Outside of code I'm a big football fan — ask me about the World Cup.
                </p>
              </FadeIn>
            </div>

            <FadeIn delay={0.2}>
              <a
                href="/Danish-Raza-Bangash-Resume.pdf"
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors mt-2"
              >
                <Download size={14} />
                Download Resume
              </a>
            </FadeIn>
          </div>

          {/* Info cards — order-1 on mobile (leads the section), order-2 on md+ */}
          <div className="space-y-3 order-1 md:order-2">
            {[
              {
                icon: GraduationCap,
                title: 'BS Computer Science',
                sub: 'University of Peshawar · GPA 3.9 / 4.0',
                meta: 'Graduating 2026',
              },
              {
                icon: Trophy,
                title: '98th Percentile',
                sub: 'HEC National Skill Competency Test (NSCT)',
                meta: '2026',
              },
              {
                icon: MapPin,
                title: 'Peshawar, Pakistan',
                sub: 'Open to remote worldwide',
                meta: null,
              },
            ].map(({ icon: Icon, title, sub, meta }, i) => (
              <FadeIn key={title} delay={0.08 * i + 0.1}>
                <div className="glass glass-hover rounded-2xl p-4 sm:p-5 flex items-start gap-4 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-white/06 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-white/70" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{title}</p>
                    <p className="text-white/50 text-xs mt-0.5">{sub}</p>
                    {meta && <p className="text-white/25 text-xs mt-0.5">{meta}</p>}
                  </div>
                </div>
              </FadeIn>
            ))}

            {/* Certifications — desktop only; too much detail for mobile scroll */}
            <div className="hidden sm:block">
              <FadeIn delay={0.35}>
                <div className="glass rounded-2xl p-5">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Certifications</p>
                  <ul className="space-y-1.5">
                    {[
                      'Full Stack Web Development — Angela Yu / Udemy (2025)',
                      'Google Agile Essentials — Coursera (2025)',
                      'Google Introduction to AI — Coursera (2025)',
                      'Google Frontend Bootcamp — Google (2023)',
                    ].map((cert) => (
                      <li key={cert} className="flex items-start gap-2 text-xs text-white/55">
                        <span className="text-white/30 mt-0.5">·</span> {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
