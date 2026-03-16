# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for New Horizons Immigration Law, an immigration case management system with three components:

- **server/** - Express + TypeScript + Prisma backend API
- **client/** - React + Vite frontend application (app.newhorizonsimmigrationlaw.org)
- **web/** - Astro + Tailwind static marketing site (newhorizonsimmigrationlaw.org)

## Development Commands

### Server (Backend)
```bash
cd server
npm run dev          # Start development server with hot reload (tsx watch)
npm run build        # Compile TypeScript to dist/
npm start            # Production: run migrations + start server
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema changes to database
```

### Client (Frontend App)
```bash
cd client
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Web (Static Site)
```bash
cd web
npm run dev          # Start Astro dev server (port 4321)
npm run build        # Build static site
npm run preview      # Preview production build
```

### Database (Docker)
```bash
cd server
docker-compose up -d  # Start PostgreSQL container
```

## Architecture

### Server Architecture (Layered)

```
src/
├── routes/          # Express route definitions
├── controllers/     # Request/response handling
├── services/        # Business logic
├── middlewares/     # Express middleware (auth, validation, rate limiting)
├── repositories/    # Database access (Prisma)
├── lib/             # Core utilities (db, auth, OpenAPI)
├── schemas/         # Zod validation schemas
├── utils/           # Helper utilities
└── docs/            # OpenAPI documentation definitions
```

**Key Patterns:**
- Routes delegate to Controllers, which use Services for business logic
- Validation via Zod schemas in `middlewares/validateRequest.ts`
- Authentication via Lucia auth with session cookies (`lib/auth.ts`)
- Database access through Prisma client singleton (`lib/db.ts`)
- Rate limiting: 100 req/15min global, 5 login attempts/hour
- OpenAPI docs auto-generated from Zod schemas (`lib/openApi.ts`)

### Client Architecture

```
src/
├── components/      # Reusable UI components
├── features/        # Feature-based modules (tickets, payments, appointments, dashboard)
├── pages/           # Route components (Dashboard, Login, Signup, Tickets/)
├── services/        # API client functions
├── config/          # App configuration (ticket types, workflow steps)
├── context/         # React context providers
├── i18n/            # Internationalization (Spanish/English)
├── lib/             # Utility functions
└── types/           # TypeScript type definitions
```

**Key Patterns:**
- Feature-based organization with co-located components, services, and types
- React Query for server state management
- Axios for API calls with credentials
- Tailwind CSS v4 for styling
- i18next for translations

### Web Architecture (Astro)

```
src/
├── components/      # Astro components
├── layouts/         # Page layouts
├── pages/           # Astro pages + MDX content
├── content/         # Markdown content
├── styles/          # Global styles
└── scripts/         # Client-side JS
```

## Database Schema

PostgreSQL with Prisma ORM. Key entities:
- **User** - Clients, Advisors, Admins (role-based)
- **Ticket** - Immigration cases with type (WORK_VISA, STUDENT_VISA, RESIDENCY, CITIZENSHIP, OTHER)
- **Comment** - Ticket discussions
- **Payment** - PayPal payments linked to tickets
- **Attachment** - File uploads (S3)
- **Appointment** - Medical/psychological exams
- **AuditLog** - Activity tracking

Ticket types have configurable workflows defined in `client/src/config/workflow.ts` and `client/src/config/ticketConfig.ts`.

## Environment Variables

### Server (.env)
```
DATABASE_URL="postgresql://..."
PORT=3000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
RESEND_API_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

### Client (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_PAYPAL_CLIENT_ID=
```

### Web (.env)
```
PUBLIC_API_URL=https://app.newhorizonsimmigrationlaw.org/api/public
```

## Key Integrations

- **Authentication**: Lucia auth with Prisma adapter, session cookies
- **Payments**: PayPal Checkout SDK
- **Email**: Resend API + React Email templates
- **File Storage**: AWS S3 with presigned URLs
- **Database**: PostgreSQL via Prisma
- **Documentation**: OpenAPI 3.0 + Swagger UI at `/api/docs`

## Deployment

Dockerfiles are in `coolify-config/dockerfiles/` for Coolify deployment:
- `Dockerfile.server` - Node.js production server
- `Dockerfile.client` - Nginx serving built Vite app
- `Dockerfile.web` - Nginx serving built Astro site

Production URLs:
- API: https://app.newhorizonsimmigrationlaw.org/api
- Client: https://app.newhorizonsimmigrationlaw.org
- Web: https://newhorizonsimmigrationlaw.org
