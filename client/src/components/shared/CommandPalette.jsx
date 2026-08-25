import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Home, User, Briefcase, BookOpen, Mail, ExternalLink, LayoutGrid } from 'lucide-react'
import { PROJECTS_LIST } from '@/lib/projects'
import { motion, AnimatePresence } from 'framer-motion'

const commands = [
  { id: 'home',     label: 'Home',          icon: Home,        action: 'scroll', target: '#hero' },
  { id: 'about',    label: 'About',         icon: User,        action: 'scroll', target: '#about' },
  { id: 'projects', label: 'Projects',      icon: Briefcase,   action: 'route',  target: '/projects' },
  { id: 'blog',     label: 'Blog',          icon: BookOpen,    action: 'route',  target: '/blog' },
  { id: 'contact',  label: 'Contact',       icon: Mail,        action: 'scroll', target: '#contact' },
  // Every project is reachable by name, so Ctrl+K jumps straight to one
  // instead of stopping at the index page.
  ...PROJECTS_LIST.map((p) => ({
    id: `project-${p.slug}`,
    label: p.name,
    hint: p.tagline,
    icon: LayoutGrid,
    action: 'route',
    target: `/projects/${p.slug}`,
  })),
  { id: 'github',   label: 'GitHub →',      icon: ExternalLink, action: 'link', target: 'https://github.com/danishrazabangash' },
  { id: 'linkedin', label: 'LinkedIn →',    icon: ExternalLink, action: 'link', target: 'https://linkedin.com/in/danish-raza-bangash' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  /*
   * The highlighted row, stored with the query it belongs to. Deriving
   * `selected` from that pairing resets the cursor whenever the query changes,
   * without an effect that fires a setState on every keystroke.
   */
  const [cursor, setCursor] = useState({ query: '', index: 0 })
  const navigate = useNavigate()
  const location = useLocation()

  const filtered = query
    ? commands.filter((c) => `${c.label} ${c.hint || ''}`.toLowerCase().includes(query.toLowerCase()))
    : commands

  const selected = cursor.query === query ? cursor.index : 0

  useEffect(() => {
    const down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [])

  const run = (cmd) => {
    setOpen(false)
    setQuery('')
    if (cmd.action === 'scroll') {
      // These targets are sections of the home page. Off the home page the
      // element simply isn't in the document, so the command used to do
      // nothing at all — now it routes home and scrolls on arrival, matching
      // what the Navbar, Dock and Footer already do.
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: cmd.target } })
      } else {
        document.querySelector(cmd.target)?.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (cmd.action === 'route') {
      navigate(cmd.target)
    } else if (cmd.action === 'link') {
      window.open(cmd.target, '_blank')
    }
  }

  const move = (delta) =>
    setCursor({ query, index: Math.max(0, Math.min(selected + delta, filtered.length - 1)) })

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); move(-1) }
    if (e.key === 'Enter' && filtered[selected]) run(filtered[selected])
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[501] px-4"
            >
              <div className="glass rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/08">
                  <Search size={16} className="text-white/40 shrink-0" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Search or jump to..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                  />
                  <kbd className="text-[10px] text-white/30 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
                </div>
                <div className="py-2 max-h-72 overflow-y-auto no-scrollbar">
                  {filtered.length === 0 && (
                    <p className="text-center text-white/30 text-sm py-6">No results</p>
                  )}
                  {filtered.map((cmd, i) => (
                    <button
                      key={cmd.id}
                      onClick={() => run(cmd)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                        i === selected ? 'bg-white/08 text-white' : 'text-white/60 hover:bg-white/04 hover:text-white'
                      }`}
                    >
                      <cmd.icon size={15} className="shrink-0" />
                      <span className="truncate">{cmd.label}</span>
                      {cmd.hint && (
                        <span className="ml-auto pl-3 text-xs text-white/25 truncate hidden sm:block">
                          {cmd.hint}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-white/08 flex gap-3 text-[10px] text-white/25">
                  <span><kbd className="border border-white/10 rounded px-1">↑↓</kbd> navigate</span>
                  <span><kbd className="border border-white/10 rounded px-1">↵</kbd> open</span>
                  <span><kbd className="border border-white/10 rounded px-1">Ctrl K</kbd> toggle</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
