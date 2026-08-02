import { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, User, Zap, LayoutGrid, BookOpen, Mail, Download, Sun, Moon } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '@/components/shared/SocialIcons'
import { useTheme } from '@/store/useTheme'

/* ─── Single dock item ─────────────────────────────────────────── */
function DockItem({ mouseX, icon, label, onClick, isActive = false }) {
  const ref = useRef(null)

  const distance = useTransform(mouseX, (val) => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - b.x - b.width / 2
  })

  const sizeSync = useTransform(distance, [-150, 0, 150], [54, 88, 54])
  const size     = useSpring(sizeSync, { mass: 0.1, stiffness: 260, damping: 25 })

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Icon — animates size, grows upward thanks to items-end on parent */}
      <motion.button
        ref={ref}
        style={{ width: size, height: size }}
        onClick={onClick}
        aria-label={label}
        className="relative dock-icon flex items-center justify-center shrink-0 rounded-[14px] text-white/90 hover:text-white focus:outline-none"
      >
        {icon}

        {/* Active dot inside icon so it magnifies with it; layoutId slides it between items */}
        {isActive && (
          <motion.span
            layoutId="dock-dot"
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black/40 dark:bg-white/65 pointer-events-none"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
      </motion.button>

      {/* Always-visible label */}
      <span
        className={`text-[9px] font-medium leading-none whitespace-nowrap select-none pointer-events-none transition-colors ${
          isActive ? 'text-white' : 'text-white/70'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

/* ─── Separator — self-stretch fills the full row height; the line
       stays in the icon area and the bottom spacer matches the
       label + gap so it visually lines up with the other items ── */
function Separator() {
  return (
    <div className="self-stretch flex flex-col items-center shrink-0 mx-0.5">
      <div className="flex-1 w-px dock-separator" style={{ minHeight: '36px' }} />
      <div className="h-4.5" />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════ */
export default function Dock() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { theme, toggle } = useTheme()
  const mouseX = useMotionValue(Infinity)

  if (location.pathname.startsWith('/admin')) return null

  // Track which section is scrolled into view (home page only)
  const [activeSection, setActiveSection] = useState(null)

  useEffect(() => {
    if (location.pathname !== '/') { setActiveSection(null); return }

    window.scrollTo(0, 0)
    setActiveSection(null)

    // Defer observer setup to the next macrotask so the scroll has been
    // committed to layout before the initial intersection check fires
    let observers = []
    const timerId = setTimeout(() => {
      const ids = ['#about', '#skills', '#projects', '#contact']
      observers = ids.flatMap((id) => {
        const el = document.querySelector(id)
        if (!el) return []
        const obs = new IntersectionObserver(
          ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
          { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
        )
        obs.observe(el)
        return [obs]
      })
    }, 0)

    return () => {
      clearTimeout(timerId)
      observers.forEach((obs) => obs.disconnect())
    }
  }, [location.pathname])

  const scrollTo = (id) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } })
    } else {
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const downloadResume = () => {
    const a = document.createElement('a')
    a.href     = '/Danish-Raza-Bangash-Resume.pdf'
    a.download = 'Danish-Raza-Bangash-Resume.pdf'
    a.click()
  }

  const isHome = location.pathname === '/'
  const isBlog = location.pathname.startsWith('/blog')
  const isDark = theme === 'dark'
  const sz = 24

  // Inline styles bypass Vite/Lightning CSS processing entirely —
  // the only reliable way to get backdrop-filter working on a fixed
  // element in production Chrome without compositing layer issues.
  const panelStyle = {
    backdropFilter: 'saturate(180%) blur(40px)',
    WebkitBackdropFilter: 'saturate(180%) blur(40px)',
    ...(isDark ? {
      background: 'rgba(255, 255, 255, 0.10)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.30), 0 2px 12px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.18)',
    } : {
      background: 'rgba(190, 193, 215, 0.82)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.90)',
    }),
  }

  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center z-90 pointer-events-none">

      {/* ── Desktop macOS dock ── */}
      {/* motion.div animates opacity only — no transform means no GPU
          compositing layer that would swallow the backdrop-filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.9 }}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="hidden md:flex items-end gap-2 px-4 py-3 rounded-2xl pointer-events-auto dock-border"
        style={panelStyle}
      >
        <DockItem mouseX={mouseX} icon={<Home size={sz} />}         label="Home"     onClick={() => { if (isHome) { setActiveSection(null); window.scrollTo({ top: 0, behavior: 'smooth' }) } else { navigate('/') } }} isActive={isHome && !activeSection} />
        <Separator />
        <DockItem mouseX={mouseX} icon={<User size={sz} />}         label="About"    onClick={() => scrollTo('#about')}    isActive={isHome && activeSection === '#about'} />
        <DockItem mouseX={mouseX} icon={<Zap size={sz} />}          label="Skills"   onClick={() => scrollTo('#skills')}   isActive={isHome && activeSection === '#skills'} />
        <DockItem mouseX={mouseX} icon={<LayoutGrid size={sz} />}   label="Projects" onClick={() => scrollTo('#projects')} isActive={isHome && activeSection === '#projects'} />
        <DockItem mouseX={mouseX} icon={<BookOpen size={sz} />}     label="Blog"     onClick={() => navigate('/blog')}     isActive={isBlog} />
        <DockItem mouseX={mouseX} icon={<Mail size={sz} />}         label="Contact"  onClick={() => scrollTo('#contact')}  isActive={isHome && activeSection === '#contact'} />
        <Separator />
        <DockItem mouseX={mouseX} icon={<GitHubIcon size={sz} />}   label="GitHub"   onClick={() => window.open('https://github.com/danishrazabangash',       '_blank')} />
        <DockItem mouseX={mouseX} icon={<LinkedInIcon size={sz} />} label="LinkedIn" onClick={() => window.open('https://linkedin.com/in/danish-raza-bangash', '_blank')} />
        <Separator />
        <DockItem mouseX={mouseX} icon={<Download size={sz} />}     label="Resume"   onClick={downloadResume} />
        <DockItem
          mouseX={mouseX}
          icon={theme === 'dark' ? <Sun size={sz} /> : <Moon size={sz} />}
          label="Theme"
          onClick={toggle}
        />
      </motion.div>

    </div>
  )
}
