import 'dotenv/config'
import mongoose from 'mongoose'
import Post  from '../models/Post.js'
import Admin from '../models/Admin.js'

const posts = [
  {
    title: 'Building a Four-Tier Parallel RAG Pipeline with Gemini',
    slug:  'four-tier-parallel-rag-pipeline-gemini',
    excerpt:
      'How I engineered a production RAG system combining semantic search, full-text search, regex, and fuzzy matching — achieving 91.7% retrieval accuracy with ~780ms retrieval time.',
    tags: ['AI', 'RAG', 'Node.js', 'MongoDB', 'Gemini'],
    status: 'published',
    publishedAt: new Date('2025-10-15'),
    coverImage: '',
    body: `## The Problem

When building BotForge, our AI no-code chatbot platform, we needed a retrieval system that could handle messy, real-world user queries — typos, partial phrases, semantically similar-but-differently-worded questions.

A naive vector search alone wasn't good enough. It's powerful but brittle to out-of-vocabulary terms and exact keyword lookups.

## The Solution: Four-Tier Parallel Retrieval

We ran four retrieval strategies **simultaneously** using \`Promise.all\`, then merged results with a weighted scoring function.

\`\`\`javascript
const [semanticResults, textResults, regexResults, fuzzyResults] = await Promise.all([
  semanticSearch(query, embeddings),      // weight 1.8x
  mongoFullTextSearch(query),             // weight 1.5x
  regexKeywordSearch(query),              // weight 1.0x
  fuzzyPerWordMatch(query),               // weight 0.6x
])
\`\`\`

### Tier 1: Semantic Search (1.8× weight)
Using Gemini \`gemini-embedding-2\` to produce **3072-dimensional vectors**, we compute cosine similarity against stored document embeddings. This catches meaning — "how do I reset my login?" matches "account recovery options" even with no shared words.

### Tier 2: MongoDB Full-Text Search (1.5× weight)
A native MongoDB Atlas text index for fast, exact keyword hits. Great for technical terms, product names, and precise phrases.

### Tier 3: Regex Keyword Matching (1.0× weight)
Each significant word in the query is compiled to a case-insensitive regex. Catches partial matches and hyphenated variants.

### Tier 4: Fuzzy Per-Word Matching (0.6× weight)
Levenshtein distance matching per query word — handles typos and misspellings like "configuraton" → "configuration".

## Weighted Score Merging

Each result carries a base score from its retrieval strategy. We deduplicate by chunk ID, sum scores across strategies, and sort descending:

\`\`\`javascript
function mergeResults(tiers, weights) {
  const scoreMap = new Map()
  tiers.forEach((results, i) => {
    results.forEach(({ id, score, chunk }) => {
      const weighted = score * weights[i]
      scoreMap.set(id, {
        chunk,
        total: (scoreMap.get(id)?.total || 0) + weighted,
      })
    })
  })
  return [...scoreMap.values()].sort((a, b) => b.total - a.total).slice(0, 5)
}
\`\`\`

## Results

- **91.7% retrieval accuracy** across a 9-query evaluation set (direct-match, paraphrased and complex)
- **~780ms median latency** end-to-end (including embedding generation)
- Robust to typos, paraphrasing, and domain-specific terminology

The parallel architecture was the key insight — running all four strategies concurrently keeps latency close to the slowest individual strategy (semantic search) rather than multiplying it.

## What I'd Do Differently

- Cache embeddings for frequently asked questions
- Add a re-ranking step (cross-encoder) for the top 10 candidates
- Explore ColBERT-style late interaction for finer-grained scoring
`,
  },
  {
    title: 'Real-Time at Scale: WebSockets with Socket.io and MongoDB',
    slug:  'real-time-websockets-socketio-mongodb',
    excerpt:
      'Lessons learned building a real-time messaging app — from event design to efficient MongoDB schemas for message storage that stay fast at scale.',
    tags: ['Node.js', 'Socket.io', 'MongoDB', 'WebSockets', 'React'],
    status: 'published',
    publishedAt: new Date('2025-08-22'),
    coverImage: '',
    body: `## Why WebSockets?

HTTP's request-response model forces clients to poll for new data. For a chat app, that's wasteful and laggy. WebSockets give us a persistent, bidirectional connection — the server can push to clients the instant something happens.

## Socket.io Architecture

\`\`\`javascript
// Server
io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-joined', { userId: socket.userId })
  })

  socket.on('send-message', async ({ roomId, content }) => {
    const message = await Message.create({
      room: roomId, sender: socket.userId, content,
    })
    io.to(roomId).emit('new-message', message)
  })
})
\`\`\`

Socket.io rooms are the right abstraction here — each conversation (private or group) gets a room ID, and events are scoped to that room.

## MongoDB Schema Design

The naive approach is one document per message. This works up to a point, but at scale you're doing many small writes and reads.

I explored a **bucket pattern**: each document holds up to 100 messages per room per day, dramatically reducing document count while keeping room-scoped queries fast:

\`\`\`javascript
const messageBucketSchema = new Schema({
  room:     { type: ObjectId, ref: 'Room', index: true },
  date:     { type: String, index: true },   // 'YYYY-MM-DD'
  messages: [{
    sender:    { type: ObjectId, ref: 'User' },
    content:   String,
    createdAt: Date,
  }],
  count: { type: Number, default: 0 },
})
\`\`\`

Query for a day's history becomes a single document lookup instead of thousands of rows.

## Online Presence

Tracking who's online is a classic distributed systems problem. We used a Redis-free approach for this scale: a simple in-memory Map on the server with a connected/disconnected event pair, broadcast to room members.

## Key Takeaways

1. **Design your events first** — a clean event vocabulary prevents spaghetti listeners
2. **Index on (room, date)** — most chat queries are "last N messages in room X"
3. **Acknowledge events** — Socket.io callbacks confirm message delivery, enabling read receipts
4. **Handle reconnection** — Socket.io handles the transport layer; you still need to sync missed messages on reconnect
`,
  },
  {
    title: 'MERN Stack Deployment: Separating Frontend, Backend, and Widgets on Render',
    slug:  'mern-deployment-render-separate-services',
    excerpt:
      'How we deployed BotForge as three separate Render services — and why that separation matters for embeddable widget distribution, CORS, and independent scaling.',
    tags: ['Deployment', 'Render', 'MERN', 'DevOps', 'BotForge'],
    status: 'published',
    publishedAt: new Date('2025-12-01'),
    coverImage: '',
    body: `## Why Three Services?

BotForge has three distinct distribution targets:

1. **Frontend** — the React SPA that customers log into to manage their chatbots
2. **Backend API** — the Node/Express server that handles auth, chatbot config, RAG queries
3. **Widget** — a small embeddable \`<script>\` that third-party websites include to display the chatbot

These have different deployment profiles, CORS requirements, and scaling needs. Bundling them together would be a mistake.

## Service 1: Backend API (Render Web Service)

\`\`\`
Build: npm install
Start: node server.js
Environment variables: MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, ...
\`\`\`

The backend runs as a Render Web Service with a Node.js environment. MongoDB Atlas handles the database — never run Mongo on the same VM as your app in production.

**CORS config** is critical here. The backend must accept requests from both the frontend domain and the widget domain:

\`\`\`javascript
app.use(cors({
  origin: [process.env.FRONTEND_URL, process.env.WIDGET_URL],
  credentials: true,
}))
\`\`\`

## Service 2: Widget (Render Static Site)

The widget is a self-contained vanilla JS bundle — no React, no framework. It must be tiny (\`<15KB gzipped\`) because it loads on customers' websites.

\`\`\`html
<!-- What customers paste on their site -->
<script src="https://widget.botforge.app/embed.js" data-bot-id="abc123" async></script>
\`\`\`

The script bootstraps a shadow DOM to avoid CSS collisions, then communicates with the backend API.

Deploying this as a **separate static site** means:
- Independent CDN caching headers
- Can be updated without touching the backend
- Separate domain avoids mixed-content issues

## Service 3: Frontend (Render Static Site)

A standard Vite build deployed as a static site. \`_redirects\` file handles SPA routing:

\`\`\`
/*  /index.html  200
\`\`\`

## MongoDB Atlas + Render: Lessons Learned

- **Allowlist Render's outbound IPs** in Atlas or use 0.0.0.0/0 for development (tighten before production)
- **Connection pooling**: use a module-level singleton for the Mongoose connection, not a new connection per request
- **Cold starts**: Render's free tier sleeps after 15 minutes. Use a health check ping or upgrade to a paid plan for production

## Environment Variables

Never hardcode secrets. Render's dashboard has first-class env var support. For local dev, use a \`.env\` file with \`dotenv\`. For CI/CD, set them in Render's deploy settings.

The separation of concerns made BotForge robust to deploy and easy to reason about in production.
`,
  },
]

async function seed() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD env vars must be set before seeding.')
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  // Seed admin if not exists
  const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL })
  if (!existing) {
    await Admin.create({
      email:    process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    })
    console.log('Admin created:', process.env.ADMIN_EMAIL)
  }

  // Seed posts
  for (const post of posts) {
    const exists = await Post.findOne({ slug: post.slug })
    if (!exists) {
      const words = post.body.trim().split(/\s+/).length
      post.readingTime = `${Math.max(1, Math.round(words / 200))} min read`
      await Post.create(post)
      console.log('Created post:', post.title)
    } else {
      console.log('Skipped (exists):', post.title)
    }
  }

  await mongoose.disconnect()
  console.log('Seed complete.')
}

seed().catch((err) => { console.error(err); process.exit(1) })
