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


| Segment       | Meaning                    |
| ------------- | -------------------------- |
| 1st letter    | Month code → `month_codes` |
| 1st digit     | Year code → `year_codes`   |
| 3rd letter    | Reserved (not used yet)    |
| Last 4 digits | Style number → `styles`    |


---

## 📊 Data source

The live app reads from a **Postgres database** 🗄️ (hosted on Neon) that was built from reference data derived from this Google Sheet:

**[Vintage Coach Bag Catalog (1975–99)](https://docs.google.com/spreadsheets/d/1EEoGH18VqF_gyC1Hx0RxRVWaJvv2t2nLC7d99fTe5PM/edit)** — Google Sheets

Serially Coach does **not** call the Google Sheet at runtime.

That Google Sheet includes style catalog tabs (style numbers, names, categories, dimensions, years in production, colors) and related serial-decode reference material. For this project:

1. Style rows were exported and normalized into `data/styles.csv`.
2. `pnpm seed:styles` loads that CSV into Postgres (`styles`, `colors`, `style_colors`).
3. Lookup tables (`month_codes`, `year_codes`, `place_codes`) are maintained in Postgres for serial decoding.

So the “API” in production is a **Next.js server** querying Postgres via `app/lib/serial.ts` — the spreadsheet is the **source of truth for building the database**.

---

## 🛠️ Tech stack


| Category            | Tools                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hosting**         | [Vercel](https://vercel.com/) ▲                                                                                                                             |
| **Framework**       | [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)                                     |
| **Styling**         | [Tailwind CSS](https://tailwindcss.com/), [@tailwindcss/forms](https://github.com/tailwindlabs/tailwindcss-forms), [Heroicons](https://heroicons.com/)      |
| **Database**        | [Postgres](https://www.postgresql.org/) via [Neon](https://neon.tech/) (or any Postgres host), `[postgres](https://github.com/porsager/postgres)` JS client |
| **Auth (planned)**  | [NextAuth.js](https://next-auth.js.org/) v5, `bcrypt` 🔐                                                                                                    |
| **Data / scripts**  | `csv-parse`, `tsx`, `dotenv` for seeding styles from CSV                                                                                                    |
| **Utilities**       | `clsx`, `zod` (validation, as features grow)                                                                                                                |
| **Package manager** | [pnpm](https://pnpm.io/)                                                                                                                                    |


---

## 🗺️ Roadmap (MVPs)

### V1 — In progress 🚧

- Landing page and dashboard shell
- Postgres schema for styles, colors, and lookup tables (`month_codes`, `year_codes`, etc.)
- Seed script for styles from `data/styles.csv`
- Serial lookup for simple format (`XXX-XXXX` / `XXXYYYY`)
- Place-of-manufacture decoding (`place_codes`) 📍
- Serial number guide content (`/dashboard/guide`) 📚

### V2 🔎

- Decode **all** Coach serial number formats (not just the simple pattern)
- Broader historical code tables and format detection

### V3 🔐

- User accounts (save “My Bags”)
- Login / auth wired end-to-end

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
```

### 💻 Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Home** — `/`
- **Serial lookup** — `/dashboard`
- **Login (UI shell)** — `/login`

### 🌱 Seed style data

Loads `data/styles.csv` into `styles`, `colors`, and `style_colors`:

```bash
pnpm seed:styles
```

Lookup tables (`month_codes`, `year_codes`, `place_codes`) should be populated separately in your database for decode results to resolve fully.

---

## 📁 Project structure

```
app/
  page.tsx                 # Landing page
  login/                   # Login page (form UI; auth not wired yet)
  dashboard/               # Serial lookup, guide, bags (v3 stub)
  lib/
    serial.ts              # Parse serial + Postgres lookups
    actions.ts             # Server actions for the lookup form
    definitions.ts         # TypeScript types for DB tables
  ui/
    serial/lookup-form.tsx # Client lookup form
    login-form.tsx
    dashboard/             # Sidebar navigation
data/
  styles.csv               # Style seed data
scripts/
  seedStyles.ts            # CLI seed script
```

---

## ⚡ Scripts


| Command            | Description                  |
| ------------------ | ---------------------------- |
| `pnpm dev`         | Start dev server (Turbopack) |
| `pnpm build`       | Production build             |
| `pnpm start`       | Run production server        |
| `pnpm seed:styles` | Seed styles/colors from CSV  |


---

## 📄 License

Private project — all rights reserved unless otherwise noted.