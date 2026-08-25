import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PenSquare, Trash2, Eye, EyeOff, LogOut, Plus, X, CheckCircle, XCircle, MessageSquare, FileText,
} from 'lucide-react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

/* ── tiny markdown editor ── */
function PostEditor({ post, onSave, onCancel }) {
  const [form, setForm] = useState(
    post || { title: '', slug: '', excerpt: '', body: '', tags: '', status: 'draft', coverImage: '' }
  )
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }
      if (post?._id) {
        await api.put(`/posts/${post._id}`, payload)
        toast.success('Post updated.')
      } else {
        await api.post('/posts', payload)
        toast.success('Post created.')
      }
      onSave()
    } catch {
      toast.error('Save failed.')
    } finally {
      setLoading(false)
    }
  }

  const fieldCls = 'w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/40 transition-colors'

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      onSubmit={save}
      className="glass rounded-2xl p-7 space-y-4 mb-8"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold">{post?._id ? 'Edit Post' : 'New Post'}</h3>
        <button type="button" onClick={onCancel} className="text-white/40 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <input required placeholder="Title" value={form.title} onChange={set('title')} className={fieldCls} />
      <input placeholder="Slug (auto-generated if empty)" value={form.slug} onChange={set('slug')} className={fieldCls} />
      <input placeholder="Excerpt (short summary)" value={form.excerpt} onChange={set('excerpt')} className={fieldCls} />
      <input placeholder="Cover image URL" value={form.coverImage} onChange={set('coverImage')} className={fieldCls} />
      <input placeholder="Tags (comma-separated)" value={form.tags} onChange={set('tags')} className={fieldCls} />

      <textarea
        required rows={14} placeholder="Post body (Markdown supported)"
        value={form.body} onChange={set('body')}
        className={`${fieldCls} resize-y font-mono text-xs`}
      />

      <div className="flex items-center gap-3">
        <select value={form.status} onChange={set('status')}
          className="bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/40 transition-colors">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 disabled:opacity-50 transition-colors">
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </motion.form>
  )
}

/* ── tab: posts ── */
function PostsTab() {
  const [posts, setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)

  const fetchPosts = () =>
    api.get('/posts').then((r) => setPosts(r.data.posts || [])).finally(() => setLoading(false))

  // `load` is the manual refresh used after a mutation; it shows the spinner
  // again. The mount effect skips that, since loading already starts true and
  // setting it synchronously in an effect body just forces an extra render.
  const load = () => {
    setLoading(true)
    fetchPosts()
  }
  useEffect(() => { fetchPosts() }, [])

  const del = async (id) => {
    if (!confirm('Delete this post?')) return
    await api.delete(`/posts/${id}`)
    toast.success('Deleted.')
    load()
  }

  const toggleStatus = async (post) => {
    await api.put(`/posts/${post._id}`, { status: post.status === 'published' ? 'draft' : 'published' })
    load()
  }

  const saved = () => { setEditing(null); setCreating(false); load() }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-semibold">Posts</h2>
        <button onClick={() => { setCreating(true); setEditing(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-medium rounded-xl hover:bg-white/90 transition-colors">
          <Plus size={14} /> New Post
        </button>
      </div>

      {creating && <PostEditor onSave={saved} onCancel={() => setCreating(false)} />}
      {editing  && <PostEditor post={editing} onSave={saved} onCancel={() => setEditing(null)} />}

      {loading ? (
        <div className="space-y-3">
          {[0,1,2].map((i) => <div key={i} className="glass rounded-2xl h-16 animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-12">No posts yet.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post._id} className="glass rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{post.title}</p>
                <p className="text-white/35 text-xs mt-0.5">{formatDate(post.publishedAt || post.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-white/15 text-white/80' : 'bg-white/06 text-white/35'}`}>
                  {post.status}
                </span>
                <button onClick={() => toggleStatus(post)} title="Toggle publish" className="text-white/40 hover:text-white p-1 transition-colors">
                  {post.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => { setEditing(post); setCreating(false) }} className="text-white/40 hover:text-white p-1 transition-colors">
                  <PenSquare size={14} />
                </button>
                <button onClick={() => del(post._id)} className="text-white/40 hover:text-red-400 p-1 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── tab: comments ── */
function CommentsTab() {
  const [comments, setComments] = useState([])
  const [loading, setLoading]   = useState(true)

  const load = () => {
    api.get('/comments').then((r) => setComments(r.data.comments || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const moderate = async (id, approved) => {
    await api.put(`/comments/${id}`, { approved })
    load()
  }
  const del = async (id) => {
    await api.delete(`/comments/${id}`)
    toast.success('Comment deleted.')
    load()
  }

  return (
    <div>
      <h2 className="text-white font-semibold mb-6">Comments</h2>
      {loading ? (
        <div className="space-y-3">{[0,1].map((i) => <div key={i} className="glass rounded-2xl h-20 animate-pulse" />)}</div>
      ) : comments.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-12">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-white text-sm font-medium">{c.name}</p>
                  <p className="text-white/35 text-xs">{c.email} · {formatDate(c.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!c.approved && (
                    <button onClick={() => moderate(c._id, true)} title="Approve"
                      className="text-white/40 hover:text-white p-1 transition-colors">
                      <CheckCircle size={14} />
                    </button>
                  )}
                  {c.approved && (
                    <button onClick={() => moderate(c._id, false)} title="Un-approve"
                      className="text-white/40 hover:text-white p-1 transition-colors">
                      <XCircle size={14} />
                    </button>
                  )}
                  <button onClick={() => del(c._id)} className="text-white/40 hover:text-red-400 p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-white/55 text-sm">{c.body}</p>
              <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full ${c.approved ? 'bg-white/12 text-white/70' : 'bg-white/04 text-white/30'}`}>
                {c.approved ? 'Approved' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── main dashboard ── */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('posts')

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) navigate('/admin/login')
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-white font-bold text-xl">Admin Dashboard</h1>
            <p className="text-white/35 text-xs mt-0.5">Portfolio backend</p>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white glass px-3 py-2 rounded-xl transition-colors">
            <LogOut size={13} /> Log out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'posts',    label: 'Posts',    icon: FileText },
            { id: 'comments', label: 'Comments', icon: MessageSquare },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${tab === id ? 'bg-white text-black font-medium' : 'glass text-white/50 hover:text-white'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {tab === 'posts'    && <PostsTab />}
        {tab === 'comments' && <CommentsTab />}
      </div>
    </div>
  )
}
