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

- **Security Bug Fixed**: Implemented proper authorization checks in all API endpoints to ensure users can only access their own projects and tasks. Added explicit project ownership verification before allowing CRUD operations on tasks.
- **Pagination Implemented**: Added pagination support to the GET /api/projects/:projectId/tasks endpoint with configurable page and pageSize parameters, including proper metadata in responses for frontend integration.
- **Input Validation Added**: Created Zod schemas for all request bodies and parameters, ensuring data integrity and preventing malformed requests. Added validation for project creation, task creation, and task updates.
- **Standardized API Errors**: Developed a centralized error handling utility that formats all API errors consistently with error codes, human-readable messages, and optional details arrays, improving client-side error handling.
- **Global Error Handling**: Applied the standardized error format across all API routes, ensuring consistent error responses throughout the application and better debugging capabilities.
- **Test Case Fixed**: Updated the failing authorization test to reflect the corrected security implementation, confirming that unauthorized access attempts now properly return 403 Forbidden responses.
- **Code Quality Improvements**: Refactored duplicated authentication logic and improved error handling consistency, making the codebase more maintainable and reducing potential security oversights.
- **Pragmatic Approach**: Focused on essential fixes without over-engineering, prioritizing security, validation, and consistency over additional features, ensuring the application meets core requirements efficiently.
- **Trade-offs Made**: Chose to implement explicit authorization checks rather than relying solely on database-level filtering for better error messaging and control, accepting minor performance overhead for improved user experience.
- **Future Improvements**: With more time, would add comprehensive integration tests, implement rate limiting, add API documentation with OpenAPI/Swagger, and consider implementing refresh tokens for better auth security.
