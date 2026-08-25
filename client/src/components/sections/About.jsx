import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Download, MapPin, GraduationCap, Trophy, Briefcase, ArrowUpRight } from 'lucide-react'

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  )
}

const facts = [
  {
    icon: GraduationCap,
    title: 'BS Computer Science',
    sub: 'University of Peshawar · GPA 3.9 / 4.0',
    meta: 'Graduating 2026',
  },
  {
    icon: Trophy,
    title: '98th Percentile',
    sub: 'HEC National Skill Competency Test',
    meta: '2026',
  },
  {
    icon: MapPin,
    title: 'Peshawar, Pakistan',
    sub: 'Open to remote worldwide',
    meta: null,
  },
  {
    icon: Briefcase,
    title: 'Looking for',
    sub: 'Product-focused startups & AI teams',
    meta: null,
  },
]

const certifications = [
  { name: 'Full Stack Web Development', issuer: 'Udemy', year: '2025' },
  { name: 'Google Agile Essentials',    issuer: 'Coursera', year: '2025' },
  { name: 'Google Introduction to AI',  issuer: 'Coursera', year: '2025' },
  { name: 'Google Frontend Bootcamp',   issuer: 'Google', year: '2023' },
]

export default function About() {
  return (
    <section id="about" className="py-16 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Section header — same eyebrow + heading rhythm as Skills and Timeline */}
        <FadeIn>
          <p className="text-xs tracking-widest uppercase text-white/30 mb-3">Who I am</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-8 sm:mb-10">About Me</h2>
        </FadeIn>

        {/*
          DOM order is portrait → bio → facts → certifications, which is the
          mobile reading order (the photo is the hook, the wall of prose is not).
          On lg the explicit column placement flips them so the prose reads on
          the left and the portrait sits on the right.
        */}
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-5">

          {/* ── Portrait — right column on lg, deliberately narrow ── */}
          <FadeIn delay={0.08} className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
            <div className="group h-full glass glass-hover rounded-3xl p-2.5 flex flex-col max-w-xs mx-auto lg:max-w-none transition-all duration-300">
              <div className="relative flex-1 min-h-64 sm:min-h-72 rounded-[1.15rem] overflow-hidden">
                {/*
                  The only photograph of the site owner on the site. Google leans on
                  a real face image when deciding whether a person entity is
                  Knowledge-Panel-worthy, so the alt text spells out the full name
                  and role rather than something like "profile photo".
                */}
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/headshot-224.webp 224w, /headshot-400.webp 400w, /headshot.webp 800w"
                    sizes="(min-width: 1024px) 340px, 320px"
                  />
                  <img
                    src="/headshot.jpg"
                    alt="Danish Raza Bangash — MERN Stack Developer and AI Integration Specialist based in Peshawar, Pakistan"
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-[center_20%] grayscale-30 transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-[1.04]"
                  />
                </picture>

                {/*
                  Everything layered on the photo uses literal rgba rather than
                  Tailwind's white utilities — index.css inverts `text-white` and
                  friends in light mode, which would make this unreadable against
                  the photo (the photo does not change with the theme).
                */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 38%, transparent 62%)',
                  }}
                  aria-hidden
                />

                <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.45)] backdrop-blur-md text-[11px] text-[rgba(255,255,255,0.88)]">
                  <span className="relative flex w-1.5 h-1.5">
                    <span
                      className="absolute inset-0 rounded-full bg-[rgba(255,255,255,0.7)]"
                      style={{ animation: 'pulse-ring 2s ease-out infinite' }}
                    />
                    <span className="relative w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.95)]" />
                  </span>
                  Available
                </div>

                <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 text-[11px] text-[rgba(255,255,255,0.75)]">
                  <MapPin size={11} />
                  Peshawar, Pakistan
                </div>
              </div>

              {/* Card footer — on the glass surface, so it follows the theme */}
              <div className="px-2.5 pt-3.5 pb-1.5">
                <p className="text-white text-sm font-semibold tracking-tight">Danish Raza Bangash</p>
                <p className="text-white/40 text-[11px] font-mono mt-1">MERN Stack · AI Integration</p>
              </div>
            </div>
          </FadeIn>

          {/* ── Bio — left column on lg, the widest block in the section ── */}
          <FadeIn className="lg:col-span-8 lg:col-start-1 lg:row-start-1">
            <div className="h-full glass rounded-3xl p-6 sm:p-8 flex flex-col">
              <div className="space-y-4 flex-1">
                {/*
                  Opens with the full name in visible body copy. Google weights
                  visible prose far more than markup, and this is the one place a
                  natural first-person introduction can carry the surname without
                  reading like keyword stuffing.
                */}
                <p className="text-white/70 leading-relaxed text-sm sm:text-base">
                  I'm <strong className="text-white font-medium">Danish Raza Bangash</strong> — a
                  final-year Computer Science student at the University of Peshawar (GPA 3.9),
                  graduating in 2026. I build full-stack web applications — primarily on the MERN
                  stack — with a focus on AI integration.
                </p>

                <p className="text-white/70 leading-relaxed text-sm sm:text-base">
                  My flagship project, <span className="text-white font-medium">BotForge</span>, is a
                  production-grade no-code chatbot platform featuring a custom four-tier parallel RAG
                  pipeline that achieves 91.7% retrieval accuracy using Gemini embeddings, MongoDB
                  full-text search, regex matching, and fuzzy scoring — all merged with weighted
                  ranking at ~780ms latency.
                </p>

                {/* 3rd paragraph — context/personal; removed on mobile to reduce scroll */}
                <p className="hidden sm:block text-white/70 leading-relaxed text-sm sm:text-base">
                  I'm looking to join a product-focused startup or AI team where I can contribute at
                  scale. Outside of code I'm a big football fan — ask me about the World Cup.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <a
                  href="/Danish-Raza-Bangash-Resume.pdf"
                  download
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors"
                >
                  <Download size={14} />
                  Download Resume
                </a>
                <a
                  href="#contact"
                  className="group/cta inline-flex items-center justify-center gap-2 px-5 py-2.5 glass glass-hover text-white/80 hover:text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Get in touch
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                  />
                </a>
              </div>
            </div>
          </FadeIn>

          {/* ── Fact tiles — full-width 4-across strip under both columns ── */}
          <FadeIn delay={0.14} className="lg:col-span-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {facts.map(({ icon: Icon, title, sub, meta }) => (
                <div
                  key={title}
                  className="group/tile glass glass-hover rounded-2xl p-5 flex flex-col gap-3.5 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/08 flex items-center justify-center">
                    <Icon
                      size={17}
                      className="text-white/60 transition-colors duration-200 group-hover/tile:text-white/90"
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{title}</p>
                    <p className="text-white/50 text-xs mt-1 leading-relaxed">{sub}</p>
                    {meta && <p className="text-white/25 text-xs mt-1">{meta}</p>}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* ── Certifications — pill row, desktop only (too much detail for mobile scroll) ── */}
          <FadeIn delay={0.2} className="hidden sm:block lg:col-span-12">
            <div className="glass rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="flex items-center gap-3 shrink-0">
                <span className="w-6 h-px bg-white/20" aria-hidden />
                <p className="text-xs tracking-widest uppercase text-white/30">Certifications</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {certifications.map(({ name, issuer, year }) => (
                  <span
                    key={name}
                    className="px-3 py-1.5 text-xs text-white/60 glass rounded-full border border-white/08"
                  >
                    {name}
                    <span className="text-white/25"> · {issuer} {year}</span>
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
