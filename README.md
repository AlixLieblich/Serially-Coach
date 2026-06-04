# 👛 Serially Coach 👜

✨ A web app for Coach bag owners to decode serial numbers and learn when and where a bag was made, what style it is, and more!

### 🌐 Try it on the live site

**Live site:** [serially-coach.vercel.app](https://serially-coach.vercel.app) (hosted on [Vercel](https://vercel.com/))

Go to **[Uncover Your Bag](https://serially-coach.vercel.app/dashboard)** 🔍 and paste one of these example serials (dash optional; letter case does not matter):

- `k8p-9870`
- `k9p-9076`

---

## 📖 About

Every Coach bag has a serial number (often on the interior wall of bag). Those characters encode production details—month, year, factory, style number, and other metadata depending on the era and format.

**Serially Coach** parses supported serial formats, looks up codes in a Postgres database, and returns human-readable results. The goal is a friendly, accurate decoder without digging through forums or vintage reference sheets.

**Supported format (MVP):** `letter + digit + letter` + four digits — e.g. `K8P-9870` or `K8P9870`


| Segment       | Meaning                     |
| ------------- | --------------------------- |
| 1st letter    | Month code → `month_codes`  |
| 1st digit     | Year code → `year_codes`    |
| 3rd letter    | Reserved (not used yet)     |
| Last 4 digits | Style number → `bag_styles` |


---

## 🔍 Serial lookup results

A successful decode on **Uncover Your Bag** (`/dashboard`) returns:


| Field                | Source                                                |
| -------------------- | ----------------------------------------------------- |
| **Month**            | `month_codes` (from 1st letter)                       |
| **Year**             | `year_codes` (from 1st digit)                         |
| **Style**            | `bag_styles.style_name` (from last 4 digits)          |
| **Category**         | `bag_styles.category`                                 |
| **Production start** | `bag_styles.production_start`                         |
| **Production end**   | `bag_styles.production_end`                           |
| **Colors**           | All color names via `bag_style_colors` → `bag_colors` |


Results are shown in a labeled panel on the lookup form. Invalid formats or missing codes show friendly fallback text (e.g. `Unknown`) instead of failing the whole lookup.

---

## 🔐 Authentication

User accounts are powered by **[NextAuth.js](https://next-auth.js.org/) v5** (Auth.js) with a **credentials** provider (email + password), **bcrypt** password hashing, and a `users` table in Postgres.


| Feature        | Route / location            | Notes                                                 |
| -------------- | --------------------------- | ----------------------------------------------------- |
| **Sign in**    | `/login`                    | Email/password form → `authenticate` server action    |
| **Register**   | `/register`                 | Create account, hash password, auto sign-in           |
| **Sign out**   | Home + dashboard sidebar    | Server action calls `signOut` → redirects to `/`      |
| **Session**    | `auth.ts`, `auth.config.ts` | `auth()` used in pages/components for logged-in state |
| **Middleware** | `proxy.ts`                  | Next.js proxy runs Auth.js on matched routes          |


**When signed in:**

- Dashboard sidebar shows **Sign Out** (instead of **Sign In**)
- **My Bags** nav link appears (`/dashboard/bags`)
- Home page shows **View Your Bags** and **Sign out**

**When signed out:**

- Sidebar links to **Sign In**
- Home page links to **Log in**

Custom sign-in page is set in `auth.config.ts` (`pages.signIn: '/login'`). Route protection for private pages is still being tightened (middleware currently allows all routes through while auth is wired up).

---

## 📊 Data source

The live app reads from a **Postgres database** 🗄️ (hosted on Neon) that was built from reference data derived from this Google Sheet:

**[Vintage Coach Bag Catalog (1975–99)](https://docs.google.com/spreadsheets/d/1EEoGH18VqF_gyC1Hx0RxRVWaJvv2t2nLC7d99fTe5PM/edit)** — Google Sheets

Serially Coach does **not** call the Google Sheet at runtime.

That Google Sheet includes style catalog tabs (style numbers, names, categories, dimensions, years in production, colors) and related serial-decode reference material. For this project:

1. Style rows were exported and normalized into `data/styles.csv`.
2. `pnpm seed:styles` loads that CSV into Postgres (`bag_styles`, `bag_colors`, `bag_style_colors`).
3. Lookup tables (`month_codes`, `year_codes`, `place_codes`) are maintained in Postgres for serial decoding.

So the “API” in production is a **Next.js server** querying Postgres via `app/lib/serial.ts` — the spreadsheet is the **source of truth for building the database**.

### Main tables


| Table                                        | Purpose                                                                           |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| `bag_styles`                                 | Style catalog (`bag_styles_id`, `style_number`, name, category, production years) |
| `bag_colors`                                 | Color names (`bag_color_id`, `name`)                                              |
| `bag_style_colors`                           | Many-to-many link (`bag_styles_id`, `bag_color_id`)                               |
| `month_codes` / `year_codes` / `place_codes` | Serial decode lookups                                                             |
| `users`                                      | Registered accounts (name, email, hashed password)                                |


---

## 🛠️ Tech stack


| Category            | Tools                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Hosting**         | [Vercel](https://vercel.com/) ▲                                                                                                                        |
| **Framework**       | [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)                                |
| **Styling**         | [Tailwind CSS](https://tailwindcss.com/), [@tailwindcss/forms](https://github.com/tailwindlabs/tailwindcss-forms), [Heroicons](https://heroicons.com/) |
| **Database**        | [Postgres](https://www.postgresql.org/) via [Neon](https://neon.tech/), `[postgres](https://github.com/porsager/postgres)` JS client                   |
| **Auth**            | [NextAuth.js](https://next-auth.js.org/) v5, `bcrypt`, `zod` 🔐                                                                                        |
| **Data / scripts**  | `csv-parse`, `tsx`, `dotenv` for seeding styles from CSV                                                                                               |
| **Utilities**       | `clsx`                                                                                                                                                 |
| **Package manager** | [pnpm](https://pnpm.io/)                                                                                                                               |


---

## 🗺️ Roadmap (MVPs)

### V1 — In progress 🚧

- Landing page and dashboard shell
- Postgres schema (`bag_styles`, `bag_colors`, `bag_style_colors`, lookup tables)
- Seed script for styles from `data/styles.csv`
- Serial lookup for simple format (`XXX-XXXX` / `XXXYYYY`)
- Extended decode display (category, production years, colors)
- User registration, login, sign out (NextAuth + `users` table)
- Place-of-manufacture decoding (`place_codes`) 📍
- Serial number guide content (`/dashboard/guide`) 📚
- Save bags to account (`/dashboard/bags` — UI stub exists)

### V2 🔎

- Full “My Bags” persistence (saved serials per user)
- Stricter protected routes for authenticated-only pages

### V3

- Decode **all** Coach serial number formats (not just the simple pattern)
- Broader historical code tables and format detection

### V4 — Ideas 💡

- Social or community features
- Image upload for bags 📷
- Color reference and style browse (table of style numbers, colors, etc.)

---

## 🚀 Getting started

### 📋 Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/installation)
- A Postgres database (e.g. [Neon](https://neon.tech/))

### 🔑 Environment

Create a `.env` file in the project root:

```env
POSTGRES_URL=your_postgres_connection_string
AUTH_SECRET=your_auth_secret   # generate with: openssl rand -base64 32
```

`AUTH_SECRET` is required for NextAuth session signing in production.

### 💻 Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).


| Route              | Description                                         |
| ------------------ | --------------------------------------------------- |
| `/`                | Landing page (login / sign out when session exists) |
| `/dashboard`       | Serial number lookup                                |
| `/login`           | Sign in                                             |
| `/register`        | Create account                                      |
| `/dashboard/guide` | Serial number guide (content TBD)                   |
| `/dashboard/bags`  | My Bags (logged-in users; persistence TBD)          |


### 🌱 Seed style data

Loads `data/styles.csv` into `bag_styles`, `bag_colors`, and `bag_style_colors`:

```bash
pnpm seed:styles
```

Lookup tables (`month_codes`, `year_codes`, `place_codes`) and the `users` table should exist in your database for full app functionality.

---

## 📁 Project structure

```
app/
  page.tsx                 # Landing (auth-aware CTAs)
  login/                   # Sign-in page
  register/                # Registration page
  dashboard/               # Serial lookup, guide, bags
  lib/
    serial.ts              # Parse serial + Postgres lookups
    actions.ts             # Server actions (lookup, auth, register)
    definitions.ts         # Types (DB tables, SerialLookupResult, User)
  ui/
    serial/lookup-form.tsx # Lookup form + results panel
    login-form.tsx
    register-form.tsx
    dashboard/             # Sidebar, nav (Sign In/Out, My Bags)
auth.ts                    # NextAuth instance + credentials provider
auth.config.ts             # Auth pages, callbacks, middleware config
proxy.ts                   # Auth middleware (Next.js proxy)
data/
  styles.csv               # Style seed data
scripts/
  seedStyles.ts            # CLI seed script
```

---

## ⚡ Scripts


| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm dev`         | Start dev server (Turbopack)    |
| `pnpm build`       | Production build                |
| `pnpm start`       | Run production server           |
| `pnpm seed:styles` | Seed bag styles/colors from CSV |


---

## 📄 License

Private project — all rights reserved unless otherwise noted.