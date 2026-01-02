# TrueScaleTech Assessment

A task management application for the Full Stack Engineer technical assessment.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT with httpOnly cookies

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd truescaletech-assessment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

### 4. Start the database

```bash
docker-compose up -d
```

### 5. Generate Prisma client

```bash
npm run db:generate
```

### 6. Seed the database

```bash
npm run db:seed
```

### 7. Start the development server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Test Users

After seeding, you can log in with:

| Email | Password |
|-------|----------|
| alice@example.com | password123 |
| bob@example.com | password123 |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with test data
- `npm run db:studio` - Open Prisma Studio
- `npm run test` - Run tests

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── login/         # Login page
│   │   └── projects/      # Project pages
│   └── lib/               # Utilities
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── __tests__/             # Test files
└── docker-compose.yml     # Docker configuration
```

## API Endpoints

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create a project

### Tasks
- `GET /api/projects/:projectId/tasks` - List tasks for a project
- `POST /api/projects/:projectId/tasks` - Create a task
- `PATCH /api/tasks/:taskId` - Update a task
- `DELETE /api/tasks/:taskId` - Delete a task

---

## Candidate Notes

_Add your write-up here after completing the assessment tasks._
