# Feature Flag Management Dashboard

A full-stack feature flag management system built with React, Node.js, Express, PostgreSQL, and Prisma.

The application allows users to create, manage, filter, and toggle feature flags across multiple environments. It also maintains an audit history and asynchronously sends notifications whenever a production feature flag is toggled.

## Features

### Feature Flag Management
- Create feature flags with a unique key per environment.
- Support for DEV, STAGING, and PROD environments.
- Enable or disable feature flags.
- Prevent duplicate feature keys within the same environment.
- Filter flags by environment and enabled status.

### Audit Logging
- Automatically records feature flag creation and toggle operations.
- Captures the actor, action, previous state, new state, and timestamp.
- Displays recent activity in the dashboard.
- Uses append-only audit records at the application level.

### Asynchronous Notifications
- Production flag toggles create notification jobs.
- A separate background worker processes pending jobs.
- Failed jobs are retried, with a maximum of three attempts.
- Successful notifications are delivered to a local mock webhook.
- PostgreSQL row locking with `SKIP LOCKED` supports safe job claiming by concurrent workers.

### Developer Experience
- Docker Compose for one-command startup.
- PostgreSQL database with persistent Docker volume.
- Automatic Prisma migrations and database seeding.
- Backend and frontend automated tests.
- Vite hot reload for frontend development.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Validation | Zod |
| Backend testing | Vitest, Supertest |
| Frontend testing | Vitest, React Testing Library |
| Containerization | Docker, Docker Compose |
| Background processing | PostgreSQL-backed worker |

---

## Architecture

```text
                 Browser
                    |
                    v
             React Dashboard
              localhost:5173
                    |
                    | REST API
                    v
             Express Backend
              localhost:3000
                    |
          +---------+---------+
          |                   |
          v                   v
     PostgreSQL          Mock Webhook
          ^              /api/webhook/mock
          |
          |
    Background Worker
    (Notification Jobs)
```

### Main application flow

1. The frontend sends REST API requests to the Express backend.
2. The backend validates incoming requests using Zod.
3. Prisma communicates with PostgreSQL.
4. Feature flag operations and their audit records are persisted transactionally.
5. Production toggles additionally create notification jobs.
6. The background worker claims pending jobs and sends notifications to the mock webhook.
7. The dashboard retrieves the latest audit activity.

---

## Project Structure

```text
husqvarna-feature-flags/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── webhook/
│   │   ├── workers/
│   │   └── tests/
│   │
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

Install the following:

- Docker
- Docker Compose

No local PostgreSQL, Node.js, or Prisma installation is required to run the complete application through Docker Compose.

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd husqvarna-feature-flags
```

### 2. Start the application

Run:

```bash
docker compose up --build
```

Docker Compose starts:

- PostgreSQL database
- Express backend
- React frontend
- Background notification worker

The backend automatically applies database migrations and executes the seed script during startup.

### 3. Access the application

| Service | URL |
|---|---|
| Frontend dashboard | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Backend health check | http://localhost:3000/health |

The database is persisted using a Docker named volume.

### 4. Stop the application

```bash
docker compose down
```

To stop the application and delete its database volume:

```bash
docker compose down -v
```

**Warning:** The second command permanently deletes the database data stored in the Compose volume.

---

## API Documentation

Base URL:

```text
http://localhost:3000/api
```

### Feature Flags

| Method | Endpoint | Description |
|---|---|---|
| GET | `/flags` | Retrieve feature flags |
| POST | `/flags` | Create a feature flag |
| PATCH | `/flags/:id/toggle` | Toggle a feature flag |

#### Get feature flags

```http
GET /api/flags
```

Optional query parameters:

```text
GET /api/flags?environment=PROD
GET /api/flags?enabled=true
GET /api/flags?environment=DEV&enabled=false
```

#### Create a feature flag

```http
POST /api/flags
Content-Type: application/json
```

Example request:

```json
{
  "key": "new-checkout-flow",
  "description": "Enable redesigned checkout experience",
  "environment": "PROD",
  "enabled": false
}
```

#### Toggle a feature flag

```http
PATCH /api/flags/{id}/toggle
```

The toggle operation updates the feature flag, creates an audit record, and creates a notification job when the environment is PROD.

### Audit Logs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/audit-logs` | Retrieve recent audit activity |

Example:

```http
GET /api/audit-logs?limit=10
```

### Mock Webhook

| Method | Endpoint | Description |
|---|---|---|
| POST | `/webhook/mock` | Receive notification events |

The mock webhook is used by the background worker to demonstrate asynchronous production flag notifications.

---

## Database Design

The application uses three primary database models.

### FeatureFlag

Stores feature flag information:

- ID
- Key
- Description
- Environment
- Enabled status
- Created timestamp
- Updated timestamp

A composite unique constraint on `(key, environment)` ensures that the same flag key cannot be duplicated within an environment.

### AuditLog

Stores feature flag activity:

- ID
- Feature flag ID
- Actor
- Action
- Previous state
- New state
- Timestamp

Audit records are created in the same database transaction as their corresponding feature flag operation.

### NotificationJob

Stores asynchronous notification jobs:

- ID
- Feature flag ID
- Status
- Payload
- Attempts
- Last error
- Created timestamp
- Processed timestamp

Supported job statuses:

- PENDING
- PROCESSING
- COMPLETED
- FAILED

---

## Background Worker Design

The notification worker continuously polls PostgreSQL for pending notification jobs.

Processing flow:

1. Find the oldest pending notification job.
2. Claim the job using a PostgreSQL transaction and `FOR UPDATE SKIP LOCKED`.
3. Update its status to PROCESSING.
4. Send the notification to the mock webhook.
5. Mark the job COMPLETED if successful.
6. Retry failed jobs, up to three attempts.
7. Mark the job FAILED after exhausting retries.

The worker uses a timeout for webhook requests and retry delays to avoid continuously retrying failed requests.

This design keeps notification delivery outside the synchronous API request lifecycle.

---

## Running Tests

### Backend tests

```bash
cd backend
npm install
npm test
```

The backend integration test verifies API behavior and database persistence, including audit log creation.

### Frontend tests

```bash
cd frontend
npm install
npm test
```

Frontend component tests verify feature flag rendering and toggle interactions.

Run tests against a configured test database rather than a database containing important development data.

---

## Engineering Decisions and Trade-offs

### PostgreSQL-backed notification queue

Instead of introducing an additional message broker, PostgreSQL is used to persist and coordinate notification jobs.

**Advantages:**
- Fewer infrastructure dependencies.
- Transactional creation of notification jobs.
- Persistent job storage.
- Row-level locking for concurrent job claiming.

**Trade-off:**

A dedicated message broker such as Kafka or RabbitMQ would provide more advanced messaging capabilities and better scalability for larger workloads.

### Transactional audit logging

Feature flag updates and their corresponding audit records are committed within the same database transaction.

This prevents successful state changes from being committed without their corresponding audit entries.

### Composite unique constraint

The database enforces uniqueness for the combination of feature key and environment, rather than relying only on frontend validation.

This protects data integrity even when requests originate outside the frontend.

### Simplified actor identity

The current implementation uses a demo actor identity because authentication is outside the scope of this assignment.

In a production system, the actor should be derived from the authenticated user's identity.

### Notification delivery

The worker retries failed webhook requests up to three times.

Production-grade delivery would additionally benefit from stale-job recovery, idempotent webhook handling, monitoring, and dead-letter management.

---

## Future Improvements

- Authentication and role-based access control.
- Environment-specific permissions.
- Advanced audit log filtering and pagination.
- Worker monitoring and stale-job recovery.
- Notification delivery metrics and dead-letter management.
- Production webhook integration.
- Dedicated message broker for larger workloads.
- Automated end-to-end testing.

---

## Author

Developed as a full-stack engineering assignment demonstrating API design, database modeling, transactional consistency, asynchronous processing, frontend development, automated testing, and containerized local development.