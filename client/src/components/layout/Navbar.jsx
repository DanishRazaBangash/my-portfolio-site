import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Command } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '@/components/shared/ThemeToggle'

// isRoute marks a real page rather than a section anchor on the home page.
// Previously this was inferred with href.startsWith('/blog'), which only held
// while /blog was the single non-anchor destination.
const navLinks = [
  { label: 'About',    href: '/#about' },
  { label: 'Skills',   href: '/#skills' },
  { label: 'Projects', href: '/projects', isRoute: true },
  { label: 'Blog',     href: '/blog',     isRoute: true },
  { label: 'Contact',  href: '/#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href) => {
    setMobileOpen(false)
    if (!href.startsWith('/#')) return
    const id = href.slice(1) // '/#about' → '#about'
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } })
    } else {
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 md:hidden ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div
        className="mx-auto max-w-6xl px-6 flex items-center justify-between rounded-2xl border transition-colors duration-300 py-3"
        style={{
          backgroundColor:      scrolled ? 'var(--navbar-glass)'  : 'transparent',
          borderColor:          scrolled ? 'var(--navbar-border)' : 'transparent',
          backdropFilter:       scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
      >
        {/* Logo */}
        <Link to="/" className="font-semibold text-white tracking-tight text-lg select-none">
          DR<span className="text-white/30">.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) =>
            l.isRoute ? (
              <Link
                key={l.href}
                to={l.href}
                className="px-3 py-1.5 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/05 transition-colors"
              >
                {l.label}
              </Link>
            ) : (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="px-3 py-1.5 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/05 transition-colors"
              >
                {l.label}
              </button>
            )
          )}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white/40 glass rounded-lg hover:text-white/70 transition-colors"
          >
            <Command size={12} />
            <span>K</span>
          </button>
          <ThemeToggle />
          <a
            href="/Danish-Raza-Bangash-Resume.pdf"
            download
            className="px-4 py-1.5 text-sm font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
          >
            Resume
          </a>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="w-9 h-9 flex items-center justify-center glass rounded-lg"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className="md:hidden mx-4 mt-2 glass rounded-2xl p-4 flex flex-col gap-1"
          >
            {navLinks.map((l) =>
              l.isRoute ? (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/05 transition-colors"
                >
                  {l.label}
                </Link>
              ) : (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="px-3 py-2.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/05 transition-colors text-left"
                >
                  {l.label}
                </button>
              )
            )}
            <div className="mt-2 pt-2 border-t border-white/08">
              <a
                href="/Danish-Raza-Bangash-Resume.pdf"
                download
                className="block w-full text-center px-4 py-2.5 text-sm font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
              >
                Resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
