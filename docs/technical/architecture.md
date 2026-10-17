# Hooke Architecture

Hooke uses a separated web application architecture.

```text
Browser
   │
   ▼
Frontend
   │
   │ HTTP / JSON
   ▼
Express API
   │
   ▼
Application Services
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL
```

## Frontend

The frontend is responsible for presentation, navigation, user interaction and API consumption.

It should not contain privileged business logic or database credentials.

## Backend

The backend provides the trusted application boundary.

Responsibilities include:

- Authentication.
- Authorisation.
- Validation.
- Business rules.
- Database access.
- Audit logging.
- Security controls.

## Database

PostgreSQL provides persistent storage. Prisma provides the typed data-access layer and schema definition.

## Design Goal

The architecture keeps presentation, application logic and persistence separate so each layer can evolve without unnecessarily coupling the rest of the system.
