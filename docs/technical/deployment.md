# Deployment Guide

Hooke has separate frontend and backend deployment requirements.

## Frontend

The static frontend can be served by a static hosting platform such as GitHub Pages, provided the application does not require server-side secrets.

The frontend must never contain:

- Database credentials.
- Private API keys.
- Session secrets.
- Administrative credentials.

## Backend

The backend requires:

- Node.js 20+.
- A PostgreSQL database.
- A secure `DATABASE_URL`.
- Production environment variables.
- HTTPS in production.

Build the backend with:

```bash
cd backend
npm install
npx prisma generate
npm run build
```

Apply production migrations with:

```bash
npm run prisma:deploy
```

Start the server with:

```bash
npm start
```

## Production Checklist

- [ ] HTTPS enabled.
- [ ] Production database configured.
- [ ] Secrets stored in deployment environment.
- [ ] Database backups configured.
- [ ] Authentication verified.
- [ ] Authorisation verified.
- [ ] Rate limiting enabled.
- [ ] Security headers enabled.
- [ ] Logs monitored.
- [ ] CI passing.
- [ ] No development credentials deployed.

Production deployment should only occur after security and authentication functionality has been reviewed.
