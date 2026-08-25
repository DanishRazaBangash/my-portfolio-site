# Danish Raza — Portfolio

My personal portfolio website. Built with the MERN stack and deployed on Render.

**Live site:** https://danishraza.dev

---

## About Me

I'm a final-year Computer Science student at the University of Peshawar (GPA 3.9), graduating in 2026. I build full-stack web apps with a focus on AI integration.

My flagship project, **BotForge**, is a no-code chatbot platform with a custom four-tier parallel RAG pipeline — achieving 91.7% retrieval accuracy at ~780ms latency using Gemini embeddings, MongoDB full-text search, regex, and fuzzy matching.

I'm ranked in the 98th percentile in the HEC National Skill Competency Test and currently looking to join a product-focused startup or AI team.

- **GitHub:** [danishrazabangash](https://github.com/danishrazabangash)
- **LinkedIn:** [danish-raza-bangash](https://linkedin.com/in/danish-raza-bangash)
- **Location:** Peshawar, Pakistan

---

## What's in this repo

This is a monorepo with two folders:

```
/client   →  React frontend (Vite)
/server   →  Node.js + Express backend
```

In production, Express builds and serves the React app. One Render web service handles everything — both the API and the frontend.

---

## Features

- **Blog** — markdown-based posts with reading time, tags, and syntax highlighting
- **Admin dashboard** — protected route to create, edit, and delete posts
- **Contact form** — sends email via Nodemailer (Gmail App Password)
- **GitHub activity** — live contribution graph fetched from the GitHub API
- **Command palette** — press `Ctrl+K` to navigate anywhere
- **Dark / light theme** — persisted in localStorage
- **Animations** — Framer Motion for page transitions, GSAP for scroll effects
- **Particle canvas** — custom WebGL-style background on the hero section
- **Custom cursor** — desktop only

---

## Tech Stack

**Frontend**
- React 19 + Vite 8
- Tailwind CSS v4
- Framer Motion + GSAP
- React Router DOM v7
- Zustand (theme state)
- Axios
- shadcn/ui (Radix UI primitives)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Nodemailer (contact form emails)
- Helmet (security headers + CSP)
- express-rate-limit

**Database**
- MongoDB Atlas (cloud)

**Deployed on**
- Render (single web service — backend serves the frontend build)

---

## How it works

### Development

The client and server run separately. Vite proxies `/api` requests to the Express server on port 5000.

```bash
# Terminal 1 — backend
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev

# Terminal 2 — frontend
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

### Production

Render runs one build command and one start command:

| | Command |
|---|---|
| **Build** | `npm run build && cd server && npm install` |
| **Start** | `node server/server.js` |

The build compiles the React app into `client/dist/`. Express then serves those static files. Any URL that isn't an `/api` route returns `index.html` so React Router handles it client-side.

---

## Environment variables

Copy `server/.env.example` to `server/.env` and fill in:

| Variable | What it's for |
|---|---|
| `NODE_ENV` | Set to `production` on Render |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Any long random string |
| `CLIENT_URL` | Your Render URL (used for CORS) |
| `EMAIL_USER` | Gmail address for contact form |
| `EMAIL_PASS` | Gmail App Password (not your real password) |
| `EMAIL_TO` | Where contact form emails are sent |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |

The client only needs one variable (optional):

| Variable | What it's for |
|---|---|
| `VITE_API_URL` | API base URL — defaults to `/api` if not set |

---

## Seeding the database

After the first deploy, run this once to create the admin account and seed the default blog posts:

```bash
node server/config/seed.js
```

On Render, open the **Shell** tab in your web service and run that command.

---

## Project structure

```
├── client/
│   ├── public/           # Static assets (resume PDF, favicon)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/   # Navbar, Footer
│   │   │   ├── sections/ # Hero, About, Skills, Projects, Timeline, GitHubStats, Contact
│   │   │   └── shared/   # CustomCursor, CommandPalette, ThemeToggle, etc.
│   │   ├── pages/        # Home, Blog, BlogPost, admin/Login, admin/Dashboard
│   │   ├── hooks/        # useEasterEgg
│   │   ├── lib/          # axios instance, utils
│   │   └── store/        # Zustand theme store
│   └── vite.config.js
│
├── server/
│   ├── config/           # db.js, seed.js
│   ├── controllers/      # Route handlers
│   ├── middleware/        # JWT auth
│   ├── models/           # Admin, Post, Comment, Contact
│   ├── routes/           # auth, posts, comments, contact
│   └── server.js
│
├── package.json          # Root — build and start scripts for Render
└── .gitignore
```

---

## License

MIT — feel free to use this as a reference or starting point for your own portfolio.
