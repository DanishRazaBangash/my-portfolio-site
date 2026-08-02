import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '@/components/shared/SocialIcons'
import SparkleEffect from '@/components/shared/SparkleEffect'
import { FULL_NAME, PROFILES } from '@/lib/seo'

/* ── Particle canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const isMobile = window.innerWidth < 640
    const count = Math.min(isMobile ? 24 : 80, Math.floor(window.innerWidth / 14))
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
        o: Math.random() * 0.5 + 0.1,
      })
    }

    const draw = () => {
      /* Read CSS var each frame so theme changes are instant */
      const rgb = getComputedStyle(document.documentElement)
        .getPropertyValue('--particle-rgb').trim() || '255,255,255'

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb},${p.o})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      })

      /* Connect nearby particles — desktop only (battery-intensive on mobile) */
      if (!isMobile) for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x
          const dy   = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${rgb},${0.06 * (1 - dist / 100)})`
            ctx.lineWidth = 0.4
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      aria-hidden
    />
  )
}

/* ── Magnetic button ── */
function MagneticButton({ children, className, onClick, href, download, rel, target, ariaLabel }) {
  const ref = useRef(null)

  const onMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left - r.width  / 2
    const y = e.clientY - r.top  - r.height / 2
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`
  }, [])

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)'
  }, [])

  const props = {
    ref, onMouseMove: onMove, onMouseLeave: onLeave,
    'aria-label': ariaLabel,
    className: `transition-transform duration-200 ease-out ${className}`,
  }

  if (href) return <a href={href} download={download} rel={rel} target={target} {...props}>{children}</a>
  return <button onClick={onClick} {...props}>{children}</button>
}

/* ── Typing rotator ── */
const roles = [
  'MERN Stack Developer',
  'AI Integration Specialist',
  'Full-Stack Engineer',
  'RAG Pipeline Architect',
]

function TypingRole() {
  const [roleIdx, setRoleIdx] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [pause, setPause] = useState(false)

  useEffect(() => {
    if (pause) { const t = setTimeout(() => setPause(false), 1400); return () => clearTimeout(t) }
    const full = roles[roleIdx]
    if (!deleting && text === full) { setPause(true); setDeleting(true); return }
    if (deleting && text === '') { setDeleting(false); setRoleIdx((i) => (i + 1) % roles.length); return }
    const speed = deleting ? 40 : 70
    const t = setTimeout(() => {
      setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1))
    }, speed)
    return () => clearTimeout(t)
  }, [text, deleting, roleIdx, pause])

  return (
    <span className="text-white/70" aria-hidden>
      {text}
      <span className="inline-block w-0.5 h-5 bg-white/60 ml-0.5 align-middle"
        style={{ animation: 'blink 1s step-end infinite' }} />
    </span>
  )
}

/* ── Hero ── */
export default function Hero() {
  const scrollToProjects = () =>
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
  const scrollToContact = () =>
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden md:pb-24">
      <ParticleCanvas />

      {/* Radial gradient glow — colour set by CSS variable, theme-aware */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 40%, var(--hero-glow) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 md:pt-6 pb-16 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs text-white/60 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
          Available for opportunities · Peshawar, Pakistan
        </motion.div>

        {/*
          The page's only H1, and its highest-weight SEO signal. Carries the
          full name — "Danish Raza Bangash" contains "Danish Raza" as an exact
          substring, so one heading serves both search queries.
        */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-4"
        >
          <span className="text-gradient">Danish Raza</span>
          <br />
          <span className="text-white/90">Bangash</span>
        </motion.h1>

        {/*
          H2 carries the role keywords. The typing animation is decorative and
          aria-hidden; the sr-only span is what crawlers and screen readers read,
          so the keywords are never dependent on animation state.
        */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-lg sm:text-xl font-mono font-normal mb-6 h-8 flex items-center justify-center"
        >
          <span className="sr-only">MERN Stack Developer &amp; AI Integration Specialist</span>
          <TypingRole />
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.45 }}
          className="text-white/50 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-10 hidden sm:block"
        >
          Building production-grade AI-integrated web apps. Architected a no-code chatbot platform
          with a four-tier parallel RAG pipeline achieving ~90% retrieval accuracy. Ranked in the
          98th percentile in the HEC National Skill Competency Test.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto"
        >
          <MagneticButton
            onClick={scrollToProjects}
            className="relative overflow-hidden w-full sm:w-auto flex items-center justify-center px-7 py-3.5 sm:py-3 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors"
          >
            <SparkleEffect count={4} />
            View Work
          </MagneticButton>

          <MagneticButton
            onClick={scrollToContact}
            className="w-full sm:w-auto flex items-center justify-center px-7 py-3.5 sm:py-3 glass glass-hover text-white text-sm font-medium rounded-xl"
          >
            Get in Touch
          </MagneticButton>

          <div className="flex items-center justify-center gap-2">
            <MagneticButton
              href={PROFILES.github}
              target="_blank"
              rel="me noopener noreferrer"
              ariaLabel={`${FULL_NAME} on GitHub`}
              className="w-10 h-10 glass glass-hover rounded-xl flex items-center justify-center text-white/60 hover:text-white"
            >
              <GitHubIcon size={16} />
            </MagneticButton>
            <MagneticButton
              href={PROFILES.linkedin}
              target="_blank"
              rel="me noopener noreferrer"
              ariaLabel={`${FULL_NAME} on LinkedIn`}
              className="w-10 h-10 glass glass-hover rounded-xl flex items-center justify-center text-white/60 hover:text-white"
            >
              <LinkedInIcon size={16} />
            </MagneticButton>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="mt-16 grid grid-cols-3 gap-4 max-w-sm mx-auto"
        >
          {[
            { value: '90%', label: 'RAG Accuracy' },
            { value: '3.9', label: 'GPA / 4.0' },
            { value: '98th', label: 'Percentile HEC' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-[11px] text-white/35 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="md:hidden absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25"
      >
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <ArrowDown size={14} style={{ animation: 'float 2s ease-in-out infinite' }} />
      </motion.div>
    </section>
  )
}
