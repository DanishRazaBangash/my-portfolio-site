import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Clock, Eye, ArrowLeft, Share2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SEOMeta from '@/components/shared/SEOMeta'
import toast from 'react-hot-toast'
import AuthorBio from '@/components/shared/AuthorBio'
import { FULL_NAME } from '@/lib/seo'

function CommentForm({ slug }) {
  const [form, setForm] = useState({ name: '', email: '', body: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/posts/${slug}/comments`, form)
      setSent(true)
      setForm({ name: '', email: '', body: '' })
      toast.success('Comment submitted for review!')
    } catch {
      toast.error('Failed to post comment.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="glass rounded-2xl p-6 text-center">
      <p className="text-white/60 text-sm">Thanks! Your comment is awaiting moderation.</p>
    </div>
  )

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-semibold text-sm">Leave a Comment</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <input required placeholder="Name" value={form.name} onChange={set('name')}
          className="bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/40 transition-colors" />
        <input required type="email" placeholder="Email (not published)" value={form.email} onChange={set('email')}
          className="bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/40 transition-colors" />
      </div>
      <textarea required rows={4} placeholder="Share your thoughts..." value={form.body} onChange={set('body')}
        className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/40 transition-colors resize-none" />
      <button type="submit" disabled={loading}
        className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 disabled:opacity-50 transition-colors">
        {loading ? 'Posting…' : 'Post Comment'}
      </button>
    </form>
  )
}

export default function BlogPost() {
  const { slug } = useParams()
  /*
   * One state object tagged with the slug it describes, so `loading` is derived
   * from "what we hold doesn't match what was asked for" rather than an effect
   * body toggling it. That also closes a stale-response race: moving between
   * posts could land an older response after a newer one and render the wrong
   * article under the right URL.
   */
  const [data, setData] = useState({ slug: null, post: null, comments: [], failed: false })

  useEffect(() => {
    let cancelled = false
    api.get(`/posts/${slug}`)
      .then((r) => {
        if (!cancelled) setData({ slug, post: r.data.post, comments: r.data.comments || [], failed: false })
      })
      .catch(() => {
        if (!cancelled) setData({ slug, post: null, comments: [], failed: true })
      })
    return () => { cancelled = true }
  }, [slug])

  const loading  = data.slug !== slug
  const notFound = !loading && data.failed
  const post     = data.post
  const comments = data.comments

  const share = (platform) => {
    const url = window.location.href
    const text = encodeURIComponent(post?.title || '')
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    if (platform === 'linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
    if (platform === 'copy') { navigator.clipboard.writeText(url); toast.success('Link copied!') }
  }

  if (loading) return (
    <><Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    </>
  )

  if (notFound) return (
    <><Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-white/50">Post not found.</p>
        <Link to="/blog" className="text-sm text-white underline">← Back to Blog</Link>
      </div>
    </>
  )

  return (
    <>
      <SEOMeta
        title={post.title}
        description={post.excerpt}
        image={post.coverImage || undefined}
        path={`/blog/${post.slug}`}
        type="article"
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        tags={post.tags || []}
      />
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 md:pb-32 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Link to="/blog" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mb-8">
              <ArrowLeft size={13} /> Back to Blog
            </Link>

            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={`${post.title} — article cover`}
                width="672"
                height="224"
                fetchPriority="high"
                className="w-full h-56 object-cover rounded-2xl mb-8 opacity-80"
              />
            )}

            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags?.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/06 text-white/50 rounded-md border border-white/08">{tag}</span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-4">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/35 mb-10 pb-6 border-b border-white/08">
              <span>
                By{' '}
                <Link
                  to="/"
                  rel="author"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {FULL_NAME}
                </Link>
              </span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              {post.readingTime && <span className="flex items-center gap-1"><Clock size={11} /> {post.readingTime}</span>}
              {post.views > 0 && <span className="flex items-center gap-1"><Eye size={11} /> {post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views} views</span>}
            </div>

            {/* Body */}
            <div className="prose prose-sm prose-invert max-w-none text-white/70 leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // `node` is destructured only to keep it out of ...props —
                  // spreading it onto a DOM element triggers an unknown-prop warning.
                  code({ node: _node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-white/08 text-white/85 px-1.5 py-0.5 rounded text-xs" {...props}>
                        {children}
                      </code>
                    )
                  },
                  // Demoted a level: the post title is already the page's H1, and
                  // a second H1 inside the body splits the document outline.
                  h1: ({ children }) => <h2 className="text-white text-2xl font-bold mt-8 mb-4">{children}</h2>,
                  h2: ({ children }) => <h2 className="text-white text-xl font-semibold mt-7 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-white text-lg font-medium mt-5 mb-2">{children}</h3>,
                  p:  ({ children }) => <p className="text-white/65 mb-4 leading-relaxed">{children}</p>,
                  a:  ({ href, children }) => <a href={href} className="text-white underline hover:text-white/70 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                  blockquote: ({ children }) => <blockquote className="border-l-2 border-white/20 pl-4 text-white/50 italic my-4">{children}</blockquote>,
                  ul: ({ children }) => <ul className="list-disc list-outside pl-5 space-y-1.5 mb-4 text-white/65">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-outside pl-5 space-y-1.5 mb-4 text-white/65">{children}</ol>,
                }}
              >
                {post.body}
              </ReactMarkdown>
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 mt-12 pt-6 border-t border-white/08">
              <span className="text-xs text-white/30"><Share2 size={12} className="inline mr-1" />Share</span>
              <button onClick={() => share('twitter')} className="text-xs px-3 py-1.5 glass rounded-lg text-white/50 hover:text-white transition-colors">Twitter</button>
              <button onClick={() => share('linkedin')} className="text-xs px-3 py-1.5 glass rounded-lg text-white/50 hover:text-white transition-colors">LinkedIn</button>
              <button onClick={() => share('copy')} className="text-xs px-3 py-1.5 glass rounded-lg text-white/50 hover:text-white transition-colors">Copy Link</button>
            </div>

            <AuthorBio />

            {/* Comments */}
            <div className="mt-12 space-y-6">
              <h3 className="text-white font-semibold text-sm">
                {comments.length === 0 ? 'No comments yet' : `${comments.length} Comment${comments.length > 1 ? 's' : ''}`}
              </h3>

              {comments.map((c) => (
                <div key={c._id} className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{c.name}</span>
                    <span className="text-white/30 text-xs">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{c.body}</p>
                </div>
              ))}

              <CommentForm slug={slug} />
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
