import { Mail } from 'lucide-react'
import { GitHubIcon, LinkedInIcon, DevToIcon, YouTubeIcon, InstagramIcon, FacebookIcon } from '@/components/shared/SocialIcons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FULL_NAME, ROLE, LOCATION, EMAIL, PROFILES } from '@/lib/seo'

/*
 * Every profile listed in Person.sameAs also appears here as a real outbound
 * link carrying rel="me". sameAs is a claim; a crawlable rel="me" link that the
 * profile links back to is what actually confirms the identity, which is how
 * "Danish Raza" and "Danish Raza Bangash" get merged into one entity.
 */
const socials = [
  { icon: GitHubIcon,    label: 'GitHub',    href: PROFILES.github },
  { icon: LinkedInIcon,  label: 'LinkedIn',  href: PROFILES.linkedin },
  { icon: DevToIcon,     label: 'DEV',       href: PROFILES.devto },
  { icon: YouTubeIcon,   label: 'YouTube',   href: PROFILES.youtube },
  { icon: InstagramIcon, label: 'Instagram', href: PROFILES.instagram },
  { icon: FacebookIcon,  label: 'Facebook',  href: PROFILES.facebook },
  { icon: Mail,          label: 'Email',     href: `mailto:${EMAIL}` },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const location = useLocation()
  const navigate = useNavigate()

  const scrollTo = (id) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } })
    } else {
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="border-t border-white/06 py-10 mt-24">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-semibold text-white text-sm">{FULL_NAME}</span>
          <span className="text-xs text-white/30">{ROLE} · {LOCATION}</span>
        </div>

        <nav className="flex items-center gap-4 text-xs text-white/40">
          <button onClick={() => scrollTo('#about')}    className="hover:text-white transition-colors">About</button>
          <button onClick={() => scrollTo('#projects')} className="hover:text-white transition-colors">Projects</button>
          <Link to="/blog"                              className="hover:text-white transition-colors">Blog</Link>
          <button onClick={() => scrollTo('#contact')}  className="hover:text-white transition-colors">Contact</button>
        </nav>

        <div className="flex items-center gap-3">
          {socials.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel={href.startsWith('mailto') ? undefined : 'me noopener noreferrer'}
              aria-label={`${FULL_NAME} on ${label}`}
              className="w-8 h-8 flex items-center justify-center glass rounded-lg hover:bg-white/10 hover:text-white text-white/50 transition-all"
            >
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6 pt-6 border-t border-white/04 flex items-center justify-between">
        <p className="text-[11px] text-white/20">© {year} {FULL_NAME}. Built with React + Node.js.</p>
        {/* Easter egg: konami-code hint hidden in plain sight */}
        <p className="text-[11px] text-white/10 select-none" title="⬆⬆⬇⬇⬅➡⬅➡BA">
          ∴
        </p>
      </div>
    </footer>
  )
}
