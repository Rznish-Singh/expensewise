# ExpenseWise — Personal Expense Tracker

ExpenseWise is a full-stack personal finance web application that lets users log, categorise, and analyse their daily spending. The project covers the complete product surface: a Clerk-powered authentication flow (Google OAuth + email/password), a real-time analytics dashboard with three chart types, an interactive calendar where every day is clickable to reveal a spending breakdown, a filterable transaction history with inline edit and delete, a PDF export that embeds summary statistics and tables, per-user budget and notification settings persisted to a serverless Postgres database, and a suite of microservice-style API routes that follow REST conventions. The UI uses an off-white cream palette, the DM Sans + Fraunces type pairing, and is fully responsive down to mobile.

---

## Live Demo Links

| Environment | URL |
|-------------|-----|
| Production (Vercel) | _Deploy with the steps below and paste your URL here_ |
| Local dev | http://localhost:3000 |

> **Quick deploy:** click the button, fill in the three environment variables, and the app is live in ~90 seconds.
>
> [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ExpenseWise)

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js 15 (App Router) | File-based routing, React Server Components, and built-in API routes eliminate the need for a separate backend server |
| **Auth** | Clerk `^6` | Drop-in Google OAuth + email/password with session management, Middleware protection, and a pre-built UI that matches any design system via the `appearance` prop |
| **Database** | Neon Postgres (serverless) | HTTP-based Postgres that works in Edge/serverless environments with zero cold-start TCP overhead; Supabase is a compatible alternative |
| **ORM** | Drizzle ORM `^0.39` | Type-safe query builder with a thin runtime, first-class Next.js support, and a migration kit (`drizzle-kit`) that generates raw SQL |
| **Charts** | Chart.js `^4.4` + react-chartjs-2 | Mature canvas-based charts; dynamically imported so chart code never bloats the initial JS bundle |
| **PDF export** | jsPDF `^2.5` + jspdf-autotable | Client-side PDF generation with no server costs; auto-imported on demand so the ~300 KB library only loads when the user clicks Export |
| **Styling** | Tailwind CSS `^3.4` | Utility-first CSS keeps component styles co-located; custom design tokens (off-white palette, DM Sans / Fraunces fonts) are defined once in `tailwind.config.ts` |
| **Validation** | Zod `^3.24` | Runtime schema validation on every API route body; errors are formatted and returned with 422 status codes |
| **Date utils** | date-fns `^4` | Tree-shakeable, immutable date helpers (no Moment.js bloat) |
| **Toasts** | react-hot-toast `^2.4` | Lightweight, accessible notifications with promise-based API |
| **Icons** | lucide-react `^0.469` | Consistent SVG icon set with per-icon tree-shaking |
| **Language** | TypeScript `^5` | End-to-end type safety from DB schema → API response → component props |

---

## How to Run Locally

> **Prerequisites:** Node.js ≥ 18.17.  
> You do **not** need a local Postgres installation — the database is hosted on Neon (free tier).

### 1 — Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/ExpenseWise.git
cd ExpenseWise
npm install
```

### 2 — Set up Clerk (free)

1. Go to [clerk.com](https://clerk.com) → **Create application**
2. Enable **Google** and **Email + Password** sign-in methods
3. In the Clerk dashboard, copy your keys

### 3 — Set up Neon database (free)

1. Go to [neon.tech](https://neon.tech) → **New project** → name it `ExpenseWise`
2. Open the **SQL Editor** tab and paste the entire contents of `drizzle/0001_initial.sql`, then run it
3. Copy the **Connection string** (it starts with `postgresql://`)

### 4 — Create your environment file

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the four required values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/ExpenseWise?sslmode=require

# These can be left exactly as shown:
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

### 5 — (Optional) seed demo data

After signing in for the first time, find your Clerk user ID in the Clerk dashboard under **Users**, then run this in the Neon SQL editor:

```sql
SELECT seed_demo_data('user_2xxxxxxxxxxxxxxxx');
```

This inserts 25 realistic transactions across June 2024 so the dashboard has something to show immediately.

### 6 — Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/sign-in`.

### Other useful scripts

```bash
npm run build        # production build
npm run start        # serve the production build locally
npm run lint         # ESLint check
npm run db:studio    # open Drizzle Studio — a browser GUI for your database
npm run db:generate  # regenerate Drizzle migration files after schema changes
```

---

## API Documentation

All routes except `/api/health` and `/api/contact` require a valid Clerk session cookie. Unauthenticated requests receive `401 Unauthorized`. Validation errors return `422 Unprocessable Entity` with a `details` field.

---

### Expenses

#### `GET /api/expenses`

Returns a paginated list of the authenticated user's transactions.

**Query parameters**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `startDate` | `YYYY-MM-DD` | — | Inclusive start date filter |
| `endDate` | `YYYY-MM-DD` | — | Inclusive end date filter |
| `category` | string | — | Filter by category key (e.g. `food`) |
| `type` | `expense` \| `income` | — | Filter by transaction type |
| `search` | string | — | Partial match on description |
| `page` | number | `1` | Page number |
| `pageSize` | number | `50` | Results per page (max 200) |

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "user_xxx",
      "description": "Lunch at Coffee House",
      "amount": "850.00",
      "category": "food",
      "type": "expense",
      "date": "2024-06-12",
      "notes": null,
      "createdAt": "2024-06-12T08:30:00.000Z",
      "updatedAt": "2024-06-12T08:30:00.000Z"
    }
  ],
  "total": 96,
  "page": 1,
  "pageSize": 50,
  "hasMore": true
}
```

---

#### `POST /api/expenses`

Creates a new expense or income transaction.

**Request body**

```json
{
  "description": "Uber Ride",
  "amount": 320,
  "category": "transport",
  "type": "expense",
  "date": "2024-06-12",
  "notes": "Airport drop"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `description` | string | ✅ | 1–200 chars |
| `amount` | number | ✅ | Positive number |
| `category` | string | ✅ | One of the category keys below |
| `type` | `expense` \| `income` | ✅ | |
| `date` | `YYYY-MM-DD` | ✅ | |
| `notes` | string | ❌ | Optional free text |

**Valid category keys:** `food` · `transport` · `bills` · `shopping` · `entertainment` · `gym` · `grocery` · `travel` · `online` · `income` · `other`

**Response `201`**

```json
{ "data": { /* full Expense row */ } }
```

---

#### `GET /api/expenses/:id`

Returns a single transaction by ID.

**Response `200`** — `{ "data": { /* Expense row */ } }` · **`404`** if not found or belongs to another user.

---

#### `PATCH /api/expenses/:id`

Partially updates a transaction. All fields are optional.

**Request body** — same shape as `POST`, all fields optional.

**Response `200`** — `{ "data": { /* updated Expense row */ } }`

---

#### `DELETE /api/expenses/:id`

Deletes a transaction.

**Response `200`** — `{ "message": "Deleted" }` · **`404`** if not found.

---

### Stats

#### `GET /api/stats`

Returns aggregated analytics for a given month.

**Query parameters**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `year` | number | current year | 4-digit year |
| `month` | number | current month | 1–12 |

**Response `200`**

```json
{
  "data": {
    "stats": {
      "totalExpenses": 45680,
      "totalIncome": 73000,
      "totalSavings": 27320,
      "budgetRemaining": 14320,
      "transactionCount": 96,
      "monthlyBudget": 60000,
      "expenseChangePercent": 12.5,
      "savingsChangePercent": 8.2,
      "budgetChangePercent": 10.3,
      "transactionChangePercent": 15.7
    },
    "categories": [
      {
        "category": "food",
        "label": "Food & Dining",
        "emoji": "🍽",
        "color": "#1D9E75",
        "amount": 14850,
        "percentage": 32.5
      }
    ],
    "dailyTrend": [
      { "date": "2024-06-01", "day": 1, "amount": 0 },
      { "date": "2024-06-12", "day": 12, "amount": 1170 }
    ],
    "monthlyTrend": [
      { "month": "Jan", "expenses": 38200, "income": 65000 }
    ]
  }
}
```

---

### Settings

#### `GET /api/settings`

Returns the authenticated user's settings. Auto-creates a default row on first call.

**Response `200`**

```json
{
  "data": {
    "id": "uuid",
    "userId": "user_xxx",
    "monthlyBudget": "60000.00",
    "currency": "INR",
    "currencySymbol": "₹",
    "notifyBudgetAlert": true,
    "notifyWeeklySummary": true,
    "notifyNewTransaction": false,
    "notifyMonthlyReport": true,
    "darkMode": false,
    "compactView": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### `PATCH /api/settings`

Updates one or more settings fields. All fields optional.

**Request body**

```json
{
  "monthlyBudget": 75000,
  "currency": "USD",
  "currencySymbol": "$",
  "notifyBudgetAlert": true,
  "darkMode": false
}
```

**Response `200`** — `{ "data": { /* updated settings row */ } }`

---

### Export

#### `GET /api/export`

Returns structured data for client-side jsPDF report generation.

**Query parameters**

| Param | Type | Default |
|-------|------|---------|
| `startDate` | `YYYY-MM-DD` | first of current month |
| `endDate` | `YYYY-MM-DD` | today |

**Response `200`**

```json
{
  "data": {
    "period": { "startDate": "2024-06-01", "endDate": "2024-06-30" },
    "summary": {
      "totalExpenses": 45680,
      "totalIncome": 73000,
      "totalSavings": 27320,
      "transactionCount": 96,
      "symbol": "₹"
    },
    "categories": [ { "label": "Food & Dining", "emoji": "🍽", "amount": 14850, "percentage": 32.5, "color": "#1D9E75" } ],
    "dailyTrend": [ { "date": "2024-06-12", "amount": 1170 } ],
    "transactions": [ { "id": "uuid", "description": "Lunch", "amount": 850, "category": "food", "type": "expense", "date": "2024-06-12" } ]
  }
}
```

---

### Alerts

#### `GET /api/alerts`

Budget threshold checker. Returns active alerts for the current month.

**Response `200`**

```json
{
  "data": {
    "totalSpent": 45680,
    "monthlyBudget": 60000,
    "percentage": 76.1,
    "isOverBudget": false,
    "notifyEnabled": true,
    "alerts": [
      {
        "type": "approaching_budget",
        "level": "warning",
        "message": "You've used 76.1% of your monthly budget."
      }
    ]
  }
}
```

**Alert levels:** `info` · `warning` · `danger`  
**Alert types:** `over_budget` · `near_budget` · `approaching_budget` · `high_daily_spend`

---

### Contact

#### `POST /api/contact`

Submits a support message. No auth required.

**Request body**

```json
{
  "name": "Arjun Sharma",
  "email": "arjun@example.com",
  "subject": "Bug report",
  "message": "The calendar is not loading on mobile Safari."
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | 1–100 chars |
| `email` | string | ✅ | Valid email |
| `subject` | string | ✅ | 1–200 chars |
| `message` | string | ✅ | 10–2000 chars |

**Response `200`** — `{ "message": "Message received! We'll get back to you within 24 hours." }`

---

#### `GET /api/contact`

Service health check for the contact microservice.

**Response `200`** — `{ "service": "ExpenseWise Contact API", "status": "healthy", "version": "1.0.0", "timestamp": "..." }`

---

### Categories

#### `GET /api/categories`

Returns all category metadata (no auth required).

**Response `200`** — `{ "data": [ { "key": "food", "label": "Food & Dining", "emoji": "🍽", "color": "#1D9E75", "bgColor": "#E1F5EE", "textColor": "#085041" } ] }`

---

### Health

#### `GET /api/health`

Microservice health check. Verifies database connectivity and Clerk config.

**Response `200` (healthy)**

```json
{
  "status": "healthy",
  "service": "ExpenseWise API",
  "version": "1.0.0",
  "timestamp": "2024-06-12T10:30:00.000Z",
  "checks": {
    "database": "ok",
    "auth": "ok"
  },
  "uptime": 3820.4
}
```

**Response `503` (degraded)** — same shape with `"status": "degraded"` and one or more checks set to `"error"`.

---

## Project Structure

```
ExpenseWise/
│
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Route group — no sidebar layout
│   │   ├── sign-in/[[...sign-in]]/   # Clerk catch-all sign-in page
│   │   └── sign-up/[[...sign-up]]/   # Clerk catch-all sign-up page
│   │
│   ├── (dashboard)/                  # Route group — shares sidebar layout
│   │   ├── layout.tsx                # Renders AppSidebar + <main>
│   │   ├── dashboard/                # Analytics overview (page + loading skeleton)
│   │   ├── history/                  # Transaction table (page + loading skeleton)
│   │   ├── calendar/                 # Interactive calendar (page + loading skeleton)
│   │   ├── settings/                 # User preferences page
│   │   └── contact/                  # Contact form page
│   │
│   ├── api/                          # API route handlers (all server-side)
│   │   ├── expenses/route.ts         # GET list, POST create
│   │   ├── expenses/[id]/route.ts    # GET one, PATCH update, DELETE
│   │   ├── stats/route.ts            # Dashboard analytics aggregation
│   │   ├── settings/route.ts         # User settings CRUD
│   │   ├── export/route.ts           # PDF export data endpoint
│   │   ├── alerts/route.ts           # Budget threshold microservice
│   │   ├── contact/route.ts          # Contact form microservice
│   │   ├── categories/route.ts       # Category metadata
│   │   └── health/route.ts           # Health check endpoint
│   │
│   ├── globals.css                   # Tailwind directives + CSS variables + Clerk overrides
│   ├── layout.tsx                    # Root layout: ClerkProvider + Toaster + font links
│   ├── page.tsx                      # Root redirect (→ /dashboard or /sign-in)
│   ├── not-found.tsx                 # 404 page
│   └── global-error.tsx              # Global error boundary
│
├── components/
│   ├── charts/                       # Chart.js wrappers (all dynamically import Chart.js)
│   │   ├── LineChart.tsx             # Daily expenses trend line chart
│   │   ├── DonutChart.tsx            # Category breakdown donut with centre label
│   │   ├── BarChart.tsx              # Monthly income vs expenses grouped bars
│   │   └── Sparkline.tsx             # Mini 40px sparkline for stat cards
│   │
│   ├── modals/                       # Dialog overlays
│   │   ├── AddExpenseModal.tsx       # Create expense/income with category chips
│   │   ├── EditExpenseModal.tsx      # Pre-filled edit form
│   │   └── DayDetailModal.tsx        # Calendar day drill-down with bar chart
│   │
│   ├── sidebar/
│   │   └── AppSidebar.tsx            # Collapsible sidebar — desktop fixed, mobile drawer
│   │
│   └── ui/                           # Primitive / shared components
│       ├── AlertBanner.tsx           # Budget alert dismissible banner
│       ├── BudgetProgressBar.tsx     # Animated progress bar with colour thresholds
│       ├── Button.tsx                # Variant-based button (primary/outline/danger/ghost)
│       ├── Card.tsx                  # Card + CardHeader + CardActionButton
│       ├── CategoryTag.tsx           # Coloured pill badge per category
│       ├── PageHeader.tsx            # Title + subtitle + right-slot for action buttons
│       └── StatCard.tsx              # KPI card with sparkline overlay
│
├── hooks/                            # Client-side data hooks
│   ├── useExpenses.ts                # CRUD for expenses + export PDF logic
│   ├── useBudgetProgress.ts          # Computes percentage, colour, label from totals
│   ├── useAlerts.ts                  # Polls /api/alerts every 5 minutes
│   └── useDebounce.ts                # Generic debounce for search inputs
│
├── lib/
│   ├── db.ts                         # Drizzle + Neon HTTP client singleton
│   ├── schema.ts                     # expenses and user_settings table definitions
│   └── utils.ts                      # cn(), formatCurrency(), formatDate(), etc.
│
├── types/
│   └── index.ts                      # Shared TypeScript interfaces + CATEGORY_META constant
│
├── drizzle/
│   ├── 0001_initial.sql              # Run this once to create tables and seed function
│   └── meta/_journal.json            # Drizzle migration journal
│
├── public/
│   └── favicon.svg                   # SVG favicon
│
├── middleware.ts                     # Clerk middleware — protects all routes except /sign-*
├── drizzle.config.ts                 # Drizzle Kit config pointing to lib/schema.ts
├── next.config.ts                    # Next.js config (Clerk image domains)
├── tailwind.config.ts                # Design tokens, font families, custom colours
├── tsconfig.json                     # TypeScript config with @/* path alias
├── vercel.json                       # Vercel deployment config with env var mappings
├── .env.example                      # Template — copy to .env.local and fill in values
└── package.json                      # Dependencies and npm scripts
```

---

## Next Steps

### What was deliberately left out

The following features were scoped out to keep the project completable within a reasonable timeframe. Each is a well-defined next step with no architectural changes required.

**Recurring transactions**  
A `is_recurring` boolean and `recurrence_rule` column (RRULE string) on the `expenses` table would let the app auto-generate future transactions. The stats API already aggregates by date range, so the dashboard would pick them up automatically.

**Email notifications**  
The `/api/alerts` microservice already computes which alerts are active. Plugging in [Resend](https://resend.com) (two lines in `/api/contact/route.ts`) and a Vercel Cron job (`vercel.json` → `"crons"`) would deliver weekly summaries and budget warnings without any frontend changes.

**CSV / Excel export**  
The `/api/export` route already returns structured JSON. Adding a `format=csv` query parameter and using the `papaparse` library (already in the JS ecosystem) to serialise the response would give users a spreadsheet-compatible download alongside the existing PDF.

**Multi-currency conversion**  
The settings table stores `currency` and `currency_symbol` but today only changes the display symbol. Integrating a free exchange-rate API (e.g. `api.exchangerate-api.com`) and storing a `base_currency_amount` column would enable accurate cross-currency analytics.

**Budget categories**  
Currently there is one monthly budget for all spending. A `category_budgets` table (`user_id`, `category`, `amount`) would let users set per-category limits (e.g. ₹5 000 for food) and trigger targeted alerts.

**Shared households / split expenses**  
Adding a `household_id` foreign key and a `splits` table would let multiple Clerk users share an expense pool — useful for couples or flatmates. Clerk's Organisations feature provides the multi-user group primitive.

**Offline support / PWA**  
The app is purely server-fetched today. Adding a `next-pwa` manifest and a service worker that caches the last 30 days of transactions would make the dashboard readable without internet access, with optimistic writes synced on reconnect.

**End-to-end tests**  
The API routes are unit-testable with `vitest` + `@testing-library/react`. The happy-path user flows (sign-up → add expense → export PDF) map directly to Playwright test cases against the local dev server.

**Rate limiting**  
The API routes have no rate limiting. Adding [Upstash Redis](https://upstash.com) + the `@upstash/ratelimit` package to the Middleware file would prevent abuse without adding infrastructure.

---

## Licence

MIT — do whatever you like with the code.