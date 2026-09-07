# JobLign PH

Skill-based employment and recruitment platform for Filipino job seekers and employers.

Match scores are recommendations only. They do not guarantee employment or a hiring decision.

## Stack

- Next.js 16 (App Router) + React 19
- Auth.js (NextAuth v5) credentials + JWT sessions
- Prisma + SQLite (swap `DATABASE_URL` for PostgreSQL in production)
- Tailwind CSS 4
- Zod validation and bcryptjs password hashing

## Setup

1. Copy environment variables:

```bash
copy .env.example .env
```

On macOS/Linux use `cp .env.example .env`. Set `AUTH_SECRET` to a long random string.

2. Install dependencies, create the database, and load demo data:

```bash
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

3. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Administrator | admin@joblign.ph | Admin123! |
| Job seeker | seeker@joblign.ph | Seeker123! |
| Verified employer | employer@joblign.ph | Employer123! |
| Pending employer | pending@joblign.ph | Employer123! |

## Tests

```bash
npm test
```

## Modules

- Authentication and role-based dashboards (`/seeker`, `/employer`, `/admin`)
- Job search, applications, resumes, interviews
- Skill matching engine (`src/lib/matching.ts`)
- Notifications and recruitment messaging
- Admin user management, employer verification, reports, settings

API details are in [docs/API.md](docs/API.md).
