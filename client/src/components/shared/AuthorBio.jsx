import { Link } from 'react-router-dom'
import { FULL_NAME, ROLE, LOCATION, PROFILES } from '@/lib/seo'

/*
 * Visible authorship, shared by blog posts and project pages.
 *
 * The BlogPosting/WebApplication schema on each page names an author, but
 * Google's quality systems weight a byline a reader can actually see — and it
 * gives every one of these pages an internal link back to the homepage entity
 * with the full name as anchor text.
 */
export default function AuthorBio({ label = 'Written by' }) {
  return (
    <aside className="glass rounded-2xl p-6 mt-16 mb-4">
      <p className="text-xs text-white/30 uppercase tracking-widest mb-3">{label}</p>
      <Link to="/" className="text-white font-semibold text-base hover:text-white/80 transition-colors">
        {FULL_NAME}
      </Link>
      <p className="text-white/50 text-sm mt-1">{ROLE} · {LOCATION}</p>
      <p className="text-white/60 text-sm leading-relaxed mt-3">
        Final-year Computer Science student at the University of Peshawar and the architect of
        BotForge, a no-code AI chatbot platform whose four-tier parallel RAG pipeline reaches
        91.7% retrieval accuracy.{' '}
        <Link to="/" state={{ scrollTo: '#about' }} className="text-white/80 underline underline-offset-2 hover:text-white transition-colors">
          More about me
        </Link>
        .
      </p>
      <div className="flex items-center gap-3 mt-4 text-xs text-white/40">
        <a href={PROFILES.github}   target="_blank" rel="me noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
        <a href={PROFILES.linkedin} target="_blank" rel="me noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
        <a href={PROFILES.devto}    target="_blank" rel="me noopener noreferrer" className="hover:text-white transition-colors">DEV</a>
      </div>
    </aside>
  )
}
