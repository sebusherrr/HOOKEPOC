# Development Guide

## Requirements

- Node.js 20+
- npm
- PostgreSQL
- Git

## Backend

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### Build

```bash
npm run build
```

### Tests

```bash
npm test
```

### Database

Development migrations:

```bash
npm run prisma:migrate
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

Seed development data when appropriate:

```bash
npm run seed
```

## Frontend

The frontend currently uses a static HTML/CSS/JavaScript structure.

Use a local HTTP server for browser development rather than relying on file:// behaviour when testing API requests.

## Environment

Copy the backend example configuration:

```bash
cp .env.example .env
```

Never commit `.env`.

## Workflow

1. Create a focused branch.
2. Make the smallest sensible change.
3. Test locally.
4. Update documentation if needed.
5. Open a pull request.
6. Review CI results before merging.
