import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Tag, Clock, Eye, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SEOMeta from '@/components/shared/SEOMeta'
import { FULL_NAME } from '@/lib/seo'

const fmtViews = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

function PostCard({ post, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
    >
      <Link to={`/blog/${post.slug}`} className="block group">
        <div className="glass glass-hover rounded-2xl p-6 h-full transition-all duration-200 group-hover:-translate-y-1">
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-40 object-cover rounded-xl mb-5 opacity-70 group-hover:opacity-90 transition-opacity"
              loading="lazy"
            />
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/06 text-white/50 rounded-md border border-white/08">
                {tag}
              </span>
            ))}
          </div>

          <h2 className="text-white font-semibold text-base mb-2 group-hover:text-white/90 transition-colors leading-snug">
            {post.title}
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>

          <div className="flex items-center justify-between text-xs text-white/30 mt-auto">
            <div className="flex items-center gap-3">
              <span>{formatDate(post.publishedAt)}</span>
              {post.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {post.readingTime}
                </span>
              )}
              {post.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye size={11} /> {fmtViews(post.views)}
                </span>
              )}
            </div>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Blog() {
  const [posts, setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState(null)

  // Search lives in ?q= rather than component state so the WebSite SearchAction
  // declared in index.html points at a URL that actually works, and so a search
  // result stays shareable. robots.txt keeps ?q= out of the index.
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const setQuery = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    api.get('/posts?status=published')
      .then((r) => setPosts(r.data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const allTags = [...new Set(posts.flatMap((p) => p.tags || []))]

  const filtered = posts.filter((p) => {
    const matchQ = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.excerpt?.toLowerCase().includes(query.toLowerCase())
    const matchT = !activeTag || p.tags?.includes(activeTag)
    return matchQ && matchT
  })

  return (
    <>
      <SEOMeta
        title="Blog"
        // Name sits inside the phrase, not as a trailing suffix — see exactTitle
        exactTitle={`Blog by ${FULL_NAME} — MERN, AI & RAG Engineering`}
        description={`Thoughts on MERN development, AI integration, RAG pipelines, and building things at scale — by ${FULL_NAME}.`}
        path="/blog"
        // A filtered view is a slice of the same content, not a page of its own
        noindex={Boolean(query || activeTag)}
      />
      <Navbar />
      <main className="min-h-screen pt-28 md:pt-10 pb-20 md:pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs tracking-widest uppercase text-white/30 mb-3">Writing</p>
            {/*
              Reads as "Blog by Danish Raza Bangash" to a crawler while still
              rendering "Blog" as the display word. A bare <h1>Blog</h1> was what
              Google used to override the title tag in the result.
            */}
            <h1 className="text-3xl sm:text-5xl font-bold text-gradient mb-4">
              Blog
              <span className="block text-base sm:text-lg font-medium text-white/40 mt-2">
                by {FULL_NAME}
              </span>
            </h1>
            <p className="text-white/50 text-sm max-w-lg">
              Thoughts on MERN development, AI integration, RAG pipelines, and building things at
              scale — from a full-stack developer in{' '}
              <Link to="/" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">
                Peshawar, Pakistan
              </Link>
              .
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="relative mb-4"
          >
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full bg-white/04 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/40 transition-colors"
            />
          </motion.div>

          {/* Tags */}
          {allTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              <button
                onClick={() => setActiveTag(null)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${!activeTag ? 'bg-white text-black' : 'glass text-white/50 hover:text-white'}`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${activeTag === tag ? 'bg-white text-black' : 'glass text-white/50 hover:text-white'}`}
                >
                  <Tag size={10} /> {tag}
                </button>
              ))}
            </motion.div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[0,1,2].map((i) => (
                <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-white/30 py-20">No posts found.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((post, i) => (
                <PostCard key={post._id} post={post} delay={i * 0.06} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
