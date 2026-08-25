/**
 * Project catalogue — the single source of truth for /projects, /projects/:slug,
 * and the condensed list on the home page.
 *
 * This file is imported by BOTH the client (`@/lib/projects`) and the Express
 * server (`../client/src/lib/projects.js`), which is what lets the server inject
 * real per-project titles, descriptions and JSON-LD before React boots. Keeping
 * it file-backed rather than in Mongo means a project page resolves with no DB
 * round-trip: no transient 503, and no dependency on Googlebot being allowed to
 * fetch /api to render the page — the exact failure robots.txt documents for the
 * blog.
 *
 * Because Node loads it directly, it must stay plain data: no JSX, no `@` alias,
 * no import.meta.env, no dependencies of any kind.
 *
 * Every claim below is taken from the project's own repository — README, source,
 * or test output. Nothing here is rounded up for effect: if a number appears on
 * a project page it should be reproducible from that repo.
 */

/** Live deployments. Project subdomains, not the underlying Vercel/Railway/Render
 *  hosts — the branded URL is the one that should be indexed and linked. */
export const PROJECT_URLS = {
  botforge: 'https://botforge.danishraza.dev/',
  footalyzer: 'https://footalyzer.danishraza.dev/',
  auzaar: 'https://auzaar.danishraza.dev/',
  eventverse: 'https://events.danishraza.dev/',
}

/**
 * Ordered by significance, not date — the array order is the display order on
 * every surface, and position 1 in the /projects ItemList schema.
 *
 * Field notes:
 *   description  → used verbatim as the page's meta description, so keep it a
 *                  self-contained ~155 chars that names the project.
 *   screenshot   → site-relative; each side prefixes its own origin. Doubles as
 *                  the page's og:image.
 *   sections     → the detail page body. Each heading renders as an <h2>.
 *   schemaType   → WebApplication for something a visitor can go and use; a
 *                  project with no live deployment is SoftwareSourceCode
 *                  instead, since claiming WebApplication for a URL that does
 *                  not exist is a lie Google can check.
 *   updated      → drives sitemap lastmod. Bump only on a real content edit.
 */
export const PROJECTS_LIST = [
  {
    slug: 'botforge',
    name: 'BotForge',
    tagline: 'AI-Powered No-Code Chatbot Builder',
    summary: 'A no-code platform for building, training and embedding AI chatbots, built on a four-tier parallel RAG pipeline.',
    description:
      'BotForge is a no-code AI chatbot platform by Danish Raza Bangash. Its four-tier parallel RAG pipeline retrieves in ~780ms at 91.7% accuracy.',
    screenshot: '/projects/botforge.webp',
    screenshotAlt: 'BotForge dashboard — the no-code AI chatbot builder by Danish Raza Bangash',
    year: '2026',
    status: 'live',
    role: 'Final year project with Muhammad Hazik, supervised by Dr. Sara Shehzad — I built the RAG pipeline, backend and widget',
    tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Gemini API', 'Docker', 'Caddy', 'Render'],
    liveUrl: PROJECT_URLS.botforge,
    githubUrl: 'https://github.com/DanishRazaBangash/chatbot-builder-platform',
    highlights: [
      { value: '91.7%', label: 'RAG retrieval accuracy' },
      { value: '~780ms', label: 'four-tier retrieval' },
      { value: '3072-dim', label: 'Gemini embeddings' },
      { value: '9 sprints', label: 'over ~18 weeks' },
    ],
    schemaType: 'WebApplication',
    appCategory: 'DeveloperApplication',
    updated: '2026-08-25',
    sections: [
      {
        heading: 'Overview',
        body: [
          'BotForge lets a business stand up a support chatbot trained on its own documents without writing a line of code. You upload content — .txt, .pdf or .csv — the platform extracts and indexes it, and you get an embeddable widget that drops into any website with a copy-paste script tag, plus an analytics dashboard showing what people are actually asking.',
          'It was built as a final year project for BS Computer Science at the University of Peshawar, with Muhammad Hazik and under the supervision of Dr. Sara Shehzad, across nine Agile sprints over roughly eighteen weeks. Commercial platforms in this space run $19–400/month; the design goal was accessibility, transparency about where an answer came from, and an architecture you can self-host.',
        ],
      },
      {
        heading: 'The retrieval problem',
        body: [
          'A chatbot answering from your documents is only as good as the passage it retrieves. Pure vector search is the usual default and it fails in a predictable way: it is excellent at paraphrase and poor at exact tokens. Ask about a product code or a proper noun the embedding model never saw, and cosine similarity returns something semantically adjacent and factually wrong.',
          'Keyword search has the opposite profile — precise on exact tokens, useless on paraphrase. The first version of the pipeline (sprint 5) ran MongoDB full-text search, regex keyword matching and fuzzy matching. Semantic search was added on top rather than in place of them, because none of the four is reliable enough alone.',
        ],
      },
      {
        heading: 'Four-tier parallel RAG pipeline',
        body: [
          'Every query fans out across all four retrieval strategies at once through a single Promise.all, so the pipeline costs roughly what its slowest tier costs rather than the sum of four sequential round-trips. Measured end to end, all four methods combined return in about 780ms.',
          'Each tier returns scored candidates which are merged into one map by weighted scoring, with the weights ordered by how much each method deserves to be trusted: semantic cosine similarity over 3072-dimensional Gemini embeddings at 1.8×, MongoDB full-text search at 1.5×, regex keyword matching at 1.0×, and fuzzy per-word matching at 0.6×. Scores accumulate rather than compete, so a passage that ranks moderately on three tiers beats one that ranks first on a single tier and nowhere else.',
          'Cosine similarity is computed in application code against stored embeddings rather than delegated to a vector database, with anything below 0.3 dropped before merging. On a 9-query evaluation set spanning direct-match, paraphrased and complex questions, the merged pipeline retrieved the correct passage 91.7% of the time.',
          'One detail that matters more than it looks: the threshold for feeding a passage to the model is separate from the threshold for citing it as a source. Retrieval is deliberately permissive so the model has context, while citation stays conservative — the bot shows you where an answer came from only when the match is genuinely strong enough to stand behind.',
        ],
      },
      {
        heading: 'The widget, and everywhere else the bot lives',
        body: [
          'The embeddable widget is vanilla JavaScript with zero dependencies, deployed as its own service and loaded asynchronously so a cold start on the chatbot backend can never block the host page’s render — the same reason this portfolio injects it after the load event rather than in the document head. Session state lives in localStorage; colour, position and greeting are passed at init time, so one build serves every customer.',
          'The same bot also runs on Telegram through a single bot token, and each chatbot carries its own persona — tone, role and behaviour — rather than sharing one global system prompt. Five starter templates (Blank, FAQ, Support, E-commerce, Education) ask setup questions instead of injecting filler content, and on paid plans an AI setup assistant drafts an initial knowledge base from your website or a plain description of your business.',
        ],
      },
      {
        heading: 'Plans, limits and operations',
        body: [
          'Three subscription tiers — Starter (free), Pro ($19/mo) and Business ($49/mo) — gate chatbot count, knowledge entries, storage, monthly messages and analytics retention windows of 7, 30 or 90 days. Every one of those limits is enforced in backend middleware rather than the frontend, because a limit a client can skip is not a limit. Safepay hosted checkout is built and sandbox-tested, with go-live blocked on merchant verification rather than on engineering.',
          'Around that sits the operational surface: an analytics dashboard with period comparison and multi-sheet Excel export, conversation history per chatbot, OTP-based email verification and password reset, and an admin panel for platform stats and user management. The whole stack is containerised with Docker Compose behind Caddy, so self-hosting is a supported path and not an afterthought.',
        ],
      },
    ],
  },

  {
    slug: 'footalyzer',
    name: 'Footalyzer',
    tagline: 'AI Football Briefings, Live Scores & Predictions',
    summary: 'AI match briefings, live scores and private prediction leagues across Europe’s six biggest competitions.',
    description:
      'Footalyzer is an AI football companion by Danish Raza Bangash — AI briefings, live scores, predictions and private leagues across six competitions.',
    screenshot: '/projects/footalyzer.webp',
    screenshotAlt: 'Footalyzer — AI football briefings, live scores and predictions, built by Danish Raza Bangash',
    year: '2026',
    status: 'live',
    role: 'Solo developer — Turborepo monorepo, Express API and Next.js web app',
    tech: [
      'Next.js 14', 'TypeScript', 'Express.js', 'MongoDB Atlas', 'Atlas Search',
      'Upstash Redis', 'BullMQ', 'Socket.io', 'Clerk', 'Stripe', 'Gemini API', 'Turborepo',
    ],
    liveUrl: PROJECT_URLS.footalyzer,
    githubUrl: 'https://github.com/DanishRazaBangash/football-hub-ai',
    highlights: [
      { value: '6', label: 'competitions tracked' },
      { value: '0', label: 'user requests hit the upstream API' },
      { value: 'SSE', label: 'streamed football chatbot' },
      { value: '40/15min', label: 'AI rate limit per IP' },
    ],
    schemaType: 'WebApplication',
    appCategory: 'SportsApplication',
    updated: '2026-08-25',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Footalyzer is a football companion built around one idea: the scoreline is the least interesting thing about a match. Alongside fixtures, results, standings and team pages for the Premier League, La Liga, Serie A, Bundesliga, Ligue 1 and the Champions League, it layers AI on top of the raw data — pre-match briefings explaining what is at stake, post-match recaps explaining what actually happened, and a chatbot that answers football questions in plain English.',
          'Add scoreline predictions, global leaderboards and private prediction leagues with friends, and it stops being a results page and becomes a reason to come back on matchday. It is a Turborepo monorepo: a Next.js 14 App Router frontend on Vercel, an Express API on Railway, and a shared TypeScript package holding the types both sides agree on.',
        ],
      },
      {
        heading: 'Only workers talk to the football API',
        body: [
          'Live football is a hard real-time problem on a small budget. Upstream match feeds are rate-limited and metered, users expect a goal to show up within seconds, and the obvious design — fetch on request — either burns the quota or serves stale scores, usually both.',
          'So the codebase enforces one rule above all others: request handlers never call the football provider. BullMQ workers poll and normalise upstream data on their own schedule and write it into MongoDB, with Upstash Redis in front as the hot cache. Every user request reads from MongoDB or Redis exclusively. One poll fans out to every viewer through Socket.io rooms keyed per match, so upstream cost stays flat no matter how many people are watching.',
          'That rule has a practical corollary that took a while to get right: two separate Redis clients. The Upstash REST client handles caching, while BullMQ needs a real TCP connection through ioredis — a REST client cannot back a queue.',
        ],
      },
      {
        heading: 'AI that runs before you ask for it',
        body: [
          'Briefings and recaps are generated by queued jobs ahead of time and persisted per match, never on the request path, so no page render ever waits on a model call. The same queue handles fixture ingestion, standings sync and prediction settlement, which means retries and backoff come for free when the upstream feed drops out mid-match.',
          'The chatbot is the exception that proves the rule — it streams over SSE because the answer genuinely depends on the question, and it is grounded in today’s fixtures plus the last 48 hours of results rather than the model’s training data. Free-tier users get three queries a day, decremented atomically server-side so parallel requests cannot race past the limit.',
        ],
      },
      {
        heading: 'Predictions, leagues and the vocabulary problem',
        body: [
          'Users predict scorelines, editable right up to kickoff and then locked by a server-authoritative widget rather than a client-side timer. When a match finishes, settlement is automatic: points are awarded, and cancelled matches are voided rather than scored as misses. Leaderboards are filterable by time window and competition, and your own rank stays pinned even when you fall outside the visible page.',
          'The word "league" means two different things in football software, and conflating them is a bug factory. In this codebase a Competition is a real competition synced from the provider; a League is a user-created private prediction pool. They are never the same model, never the same route, and never share a name.',
        ],
      },
      {
        heading: 'Search that survives how people actually type',
        body: [
          'Nobody types "1. FC Köln". MongoDB Atlas Search covers teams, matches and competitions with fuzzy matching, autocomplete and diacritic folding, so "arsnal" finds Arsenal and "koln" finds 1. FC Köln. The indexes are defined in code rather than clicked together in the Atlas UI, so a fresh environment comes up correct instead of subtly different.',
          'It surfaces through a ⌘K command palette with grouped results and keyboard navigation. The rest of the platform is hardened to match: helmet, a CORS allowlist, express-mongo-sanitize, Zod-validated environment variables, and per-IP rate limits of 600 requests per 15 minutes on public routes tightening to 40 on AI ones.',
        ],
      },
    ],
  },

  {
    slug: 'auzaar',
    name: 'Auzaar',
    tagline: 'A 21-Tool Developer Toolbox',
    summary: 'Twenty-one developer, text, design and AI tools — sixteen of which never send your data anywhere.',
    description:
      'Auzaar is a 21-tool developer toolbox by Danish Raza Bangash. Sixteen tools run entirely in your browser; five are Gemini-powered, keyed server-side.',
    screenshot: '/projects/auzaar.webp',
    screenshotAlt: 'Auzaar — a 21-tool developer toolbox built by Danish Raza Bangash',
    year: '2026',
    status: 'live',
    role: 'Solo developer — architecture, all 21 tools, test suite and deployment',
    tech: [
      'Next.js 16', 'TypeScript', 'Tailwind CSS v4', 'shadcn/ui', 'Gemini API',
      'MongoDB', 'Clerk', 'Upstash Redis', 'Polar', 'Vitest', 'Railway',
    ],
    liveUrl: PROJECT_URLS.auzaar,
    githubUrl: 'https://github.com/DanishRazaBangash/Auzaar-ai',
    highlights: [
      { value: '21', label: 'tools in one registry' },
      { value: '16', label: 'run fully client-side' },
      { value: '345', label: 'tests in ~1.2s' },
      { value: '796 KB', label: 'homepage, zero tool code' },
    ],
    schemaType: 'WebApplication',
    appCategory: 'DeveloperApplication',
    updated: '2026-08-25',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Auzaar is a toolbox of twenty-one utilities across four categories: developer tools (JSON formatter, Base64 and URL encoder, UUID and hash generator, cron explainer, regex tester, JWT decoder), text tools (diff, word counter with Flesch readability, case converter, markdown preview, lorem ipsum), design tools (colour palette with WCAG contrast checking, gradient and box-shadow builders, QR generator and reader, image compressor, favicon and Open Graph previewer), and five AI tools built on Gemini.',
          'Sixteen of the twenty-one run entirely in the browser — nothing you paste is uploaded, ever. That is a privacy property, but it is also an availability one: those sixteen work on a fresh clone with an empty environment file, because the tools that need no key genuinely need no key. The five AI tools call Gemini from the server so the API key never reaches the client.',
        ],
      },
      {
        heading: 'One registry drives everything',
        body: [
          'A single plain array of tool metadata is the source of truth for the homepage grid, the category filters, /tools/[slug] routing, page metadata, OG image generation, sitemap.xml and the semantic search index. Adding a tool is a component file, a registry entry, and a line in the lazy loader.',
          'That third step is the one you forget, so the type system remembers it instead. The registry is declared as const satisfies readonly Tool[] — the slug union is derived from it, and the component map is typed against that union, so a missing entry is a compile error rather than a 500 in production.',
          'Tool logic also lives outside React, in plain modules the components only wire up. That is what made it possible to check the colour maths against WCAG’s published contrast ratios and the hash outputs against Node’s own crypto module, rather than eyeballing the UI and hoping. 345 tests run in about a second.',
        ],
      },
      {
        heading: 'Two bugs worth the write-up',
        body: [
          'The obvious way to lazy-load tool components is to attach each one to its registry entry with next/dynamic. That produced no code splitting at all — a Server Component dynamically importing a Client Component does not get it. Every single route shipped an identical 975 KB bundle with all twenty-one tools inside. Moving the component map into a Client Component fixed it; the homepage now ships 796 KB with zero tool code, and stayed there as the app grew from four tools to twenty-one.',
          'The second was worse because it was invisible. Reading filter state with useSearchParams made the directory’s Suspense boundary render its fallback into the static HTML — the homepage shipped fourteen skeleton placeholders and not a single tool link. To a crawler, the site had no content. It now reads searchParams on the server and syncs the URL with history.replaceState, so filtering stays instant and the links are in the HTML.',
        ],
      },
      {
        heading: 'A threshold you measure, not guess',
        body: [
          'Natural-language search ("make my cv sound better" → the resume rewriter) works on embeddings, which means picking a similarity cutoff. Guessing one is how you end up either rejecting real queries or confidently routing nonsense to a random tool.',
          'So it was swept over 22 real queries and 8 deliberately off-topic ones. The distributions overlap — the weakest true match scores 0.615, the strongest false positive 0.625 — which is exactly the situation where a guessed threshold goes wrong. 0.63 keeps 21 of the 22 real queries and lets none of the junk through, and retrieval is 16 of 16 top-1 on natural-language queries.',
        ],
      },
      {
        heading: 'Model output is untrusted input',
        body: [
          'Three of the AI tools render something the model wrote, which makes the model an untrusted source like any other. Generated Mermaid is validated with mermaid.parse() before rendering and degrades to plain source on failure. Generated HTML renders only inside an iframe with allow-scripts and deliberately without allow-same-origin, so a script in generated markup cannot reach the parent page. The one route that fetches a user-supplied URL is SSRF-guarded against private, loopback, link-local and cloud-metadata addresses on every redirect hop, not just the first.',
          'The rate limiter had a subtler version of the same mistake. It originally charged quota before parsing the request body, so three malformed requests could empty a user’s entire daily AI allowance without a single call ever reaching the model. Quota is now charged after validation.',
        ],
      },
    ],
  },

  {
    slug: 'eventverse',
    name: 'EventVerse',
    tagline: 'Event Ticketing with a Built-In AI Agent',
    summary: 'A three-role ticketing marketplace with QR check-in and an AI agent that books tickets through a hand-written tool loop.',
    description:
      'EventVerse is a MERN event ticketing platform by Danish Raza Bangash — role-scoped AI agent tools, an MCP server and QR check-in at the door.',
    screenshot: '/projects/eventverse.webp',
    screenshotAlt: 'EventVerse — event ticketing platform with an AI agent, built by Danish Raza Bangash',
    year: '2025 — 2026',
    status: 'live',
    role: 'Solo developer — full stack, agent and MCP server',
    tech: [
      'React 19', 'Vite 7', 'Tailwind CSS v4', 'Express 5', 'Mongoose 8',
      'Gemini API', 'MCP SDK', 'Cloudinary', 'Brevo', 'JWT',
    ],
    liveUrl: PROJECT_URLS.eventverse,
    githubUrl: 'https://github.com/DanishRazaBangash/Event-booking',
    highlights: [
      { value: '~30 lines', label: 'the entire agent loop' },
      { value: '0', label: 'agent frameworks used' },
      { value: '3', label: 'roles, enforced by tool set' },
      { value: 'MCP', label: 'same tools, any client' },
    ],
    schemaType: 'WebApplication',
    appCategory: 'BusinessApplication',
    updated: '2026-08-25',
    sections: [
      {
        heading: 'Overview',
        body: [
          'EventVerse is a MERN ticketing marketplace serving three people at once: customers discover and book events, organisers publish and manage them, and admins moderate the whole platform. It covers the unglamorous parts properly — email verification, capacity-controlled ticketing that cannot oversell, QR check-in at the door, Cloudinary image uploads, transactional email through Brevo, and analytics dashboards built on MongoDB aggregation.',
          'It started as a beginner MERN project and was rebuilt toward something production-shaped: validated end to end, secure by default, and organised around a reusable UI system. The most interesting part arrived last — an AI agent that can actually operate the platform.',
        ],
      },
      {
        heading: 'An AI agent without a framework',
        body: [
          'The agent searches the catalogue, answers questions about your bookings and spending, analyses an organiser’s event performance, and books tickets behind a confirmation gate. Ask an organiser question like "how are my events doing, which one should I worry about?" and it chains get_overall_stats into list_my_events and forms a judgement by comparing sales against capacity and time remaining. That is not a lookup — the answer does not exist in any single query.',
          'Underneath, an agent is one loop: send the messages and the tool list to the model; if it asks for no tools, stream the answer; otherwise run the tools it named, append the results, and ask again, up to six times. That loop is about thirty lines and there is no framework under it.',
          'LangChain was designed when models had no native tool calling and needed elaborate scaffolding. Models then got native tool calling, and much of that scaffolding became weight you debug through rather than with. Writing it directly means the request that reaches the model is the request I wrote, and every failure is in code I can read. The provider sits behind a one-file Gemini adapter, and conversations are persisted in a provider-neutral shape rather than Gemini’s wire format, so switching model vendors is a sibling file rather than a refactor.',
        ],
      },
      {
        heading: 'The prompt describes the role; the tool set enforces it',
        body: [
          'Customers and organisers get different tools. Crucially, a wrong-role tool is not refused when called — it is never shown to the model at all, so there is no request for a jailbreak to talk its way past.',
          'That is still not sufficient on its own, and testing found exactly why. Asked about a competitor, the agent found a foreign event’s id through the public catalogue tool — a legitimate source — and tried it against two owner-scoped tools. Both refused, because ownership is checked inside the tool against the authenticated user rather than assumed from how the id was obtained. Without that check, one ordinary question leaks a rival organiser’s revenue figures and attendee list. Write actions add a second gate: the agent proposes, the user confirms, and only then does it execute.',
        ],
      },
      {
        heading: 'The same tools over MCP',
        body: [
          'The agent’s tools are also exposed as a Model Context Protocol server over stdio, so Claude Desktop, Cursor or any MCP client can search events and book tickets on the platform directly.',
          'This was nearly free, and for a reason worth noting: MCP’s inputSchema wire format is JSON Schema, which the tool definitions already carried for Gemini. The same buildTools(user) function is reused verbatim, which also means the role scoping and ownership checks above apply identically over MCP — the security model did not have to be rebuilt for a second transport.',
        ],
      },
      {
        heading: 'Ticketing that cannot oversell',
        body: [
          'Capacity is enforced atomically, so two people booking the last ticket at the same moment cannot both succeed — the classic inventory race that a read-then-write check does not actually prevent. Bookings are blocked on past events and gated behind email verification, and cancelling releases tickets back to inventory.',
          'QR codes are generated per booking and validated server-side at check-in, which prevents both re-use and cross-event use — the code is a reference the server resolves, not a payload the door trusts. Booking records keep a snapshot of event details so a customer’s history stays readable even if the event is later deleted. On the organiser side, editing an event only re-triggers admin approval when a material field changes (date, price or capacity), so fixing a typo in a description does not pull a live listing down for re-review.',
        ],
      },
    ],
  },
]

/** Slug → project. Returns undefined for an unknown slug so callers can 404. */
export function getProject(slug) {
  return PROJECTS_LIST.find((p) => p.slug === slug)
}

/** Previous/next in display order, for the detail page footer. Deliberately
 *  does not wrap — a "next" link that loops back to the first project reads as
 *  a bug at the end of the list. */
export function getAdjacentProjects(slug) {
  const i = PROJECTS_LIST.findIndex((p) => p.slug === slug)
  if (i === -1) return { prev: null, next: null }
  return {
    prev: PROJECTS_LIST[i - 1] || null,
    next: PROJECTS_LIST[i + 1] || null,
  }
}
