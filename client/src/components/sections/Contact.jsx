import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Send, Mail, CheckCircle } from 'lucide-react'
import { GitHubIcon, LinkedInIcon, DevToIcon } from '@/components/shared/SocialIcons'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { EMAIL, PROFILES } from '@/lib/seo'

const socials = [
  { icon: GitHubIcon,   label: 'GitHub',   href: PROFILES.github,     sub: 'danishrazabangash' },
  { icon: LinkedInIcon, label: 'LinkedIn', href: PROFILES.linkedin,   sub: 'danish-raza-bangash' },
  { icon: DevToIcon,    label: 'DEV',      href: PROFILES.devto,      sub: 'dev.to/danishrazabangash' },
  { icon: Mail,         label: 'Email',    href: `mailto:${EMAIL}`,   sub: EMAIL },
]

const init = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [form, setForm] = useState(init)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contact', form)
      setSent(true)
      setForm(init)
      toast.success("Message sent! I'll get back to you soon.")
    } catch {
      toast.error('Failed to send. Try emailing me directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-16 md:py-28 px-6">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-10 md:mb-14"
        >
          <p className="text-xs tracking-widest uppercase text-white/30 mb-3">Let's talk</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient">Get In Touch</h2>
          <p className="text-white/50 text-sm mt-3 max-w-md">
            Open to full-time roles, freelance projects, and collaboration. I typically respond within 24 hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
            onSubmit={submit}
            className="glass rounded-2xl p-5 sm:p-7 space-y-4"
          >
            {sent && (
              <div className="flex items-center gap-2 text-sm text-white/70 bg-white/06 rounded-xl p-4">
                <CheckCircle size={16} className="text-white/70 shrink-0" />
                Message sent successfully!
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Name *</label>
                <input
                  required value={form.name} onChange={set('name')}
                  placeholder="Your name"
                  className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Email *</label>
                <input
                  required type="email" value={form.email} onChange={set('email')}
                  placeholder="your@email.com"
                  className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5">Subject *</label>
              <input
                required value={form.subject} onChange={set('subject')}
                placeholder="What's this about?"
                className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5">Message *</label>
              <textarea
                required rows={4} value={form.message} onChange={set('message')}
                placeholder="Tell me what you're working on..."
                className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/40 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <><Send size={14} /> Send Message</>
              )}
            </button>
          </motion.form>

          {/* Socials */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="space-y-3 sm:space-y-4"
          >
            {/* "Prefer a direct line?" text — redundant on mobile; the cards speak for themselves */}
            <p className="hidden sm:block text-white/50 text-sm leading-relaxed mb-6">
              Prefer a direct line? Reach me on any of these platforms. I'm most responsive on LinkedIn and email.
            </p>

            {socials.map(({ icon: Icon, label, href, sub }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel={href.startsWith('mailto') ? undefined : 'me noopener noreferrer'}
                className="flex items-center gap-4 glass glass-hover rounded-2xl p-4 sm:p-5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/06 group-hover:bg-white/12 transition-colors">
                  <Icon size={18} className="text-white/70" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{sub}</p>
                </div>
              </a>
            ))}

            {/* "Based in" card — already in Hero badge + About cards; remove on mobile */}
            <div className="hidden sm:block glass rounded-2xl p-5 mt-4">
              <p className="text-xs text-white/30 mb-1">Based in</p>
              <p className="text-white text-sm font-medium">Peshawar, Pakistan</p>
              <p className="text-white/40 text-xs mt-1">PKT · UTC+5</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
