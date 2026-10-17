# Abingdon Library — Backend

Real Express + TypeScript + Prisma + PostgreSQL API. See the parent project's docs for
architecture details; this file covers local development and the published container.

## Setup

```bash
cp .env.example .env        # fill in real values — see comments in the file
npm install
npx prisma migrate dev      # creates the schema in your Postgres database
npm run seed                # loads obviously-fake dev data (see prisma/seed.ts)
npm run dev                 # starts the API on :4000
```

## Docker / GitHub Container Registry

The repository workflow builds the backend container and publishes it to GitHub Container Registry (GHCR) on pushes to `main` and version tags (`v*). Pull requests build the image for validation but do not publish it.

Published image:

```text
ghcr.io/sebusherrr/hookepoc-backend:latest
```

You can also use a commit-SHA tag or a version tag such as `v1.0.0`. The image listens on port `4000`. Supply runtime configuration through environment variables; **never bake secrets or a real `.env` file into the image**.

Example (replace the database URL and other values with your own):

```bash
docker pull ghcr.io/sebusherrr/hookepoc-backend:latest
docker run --rm -p 4000:4000 \
  -e DATABASE_URL='postgresql://user:password@host:5432/abingdon_library' \
  -e SESSION_SECRET='replace-with-a-long-random-secret' \
  ghcr.io/sebusherrr/hookepoc-backend:latest
```

The API requires a reachable PostgreSQL database. Apply database migrations as a deployment step before running a new version; the container does not automatically migrate the database at startup.

If the package is private, sign in to GHCR before pulling:

```bash
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

Use a token with package read access to pull private images. Do not paste tokens into source control or share them.

## Notes

- Nothing in here works without a real PostgreSQL database — set `DATABASE_URL` first.
- `AI_PROVIDER=groq` + `GROQ_API_KEY` enables the library assistant (`services/ai.service.ts`). Barcode/ISBN lookup (`integrations/openLibrary.ts`) needs no key — it's a free public API.
- Google sign-in/sign-up and WebAuthn passkeys need `GOOGLE_CLIENT_ID` / `RP_ID` set to your real deployed domain before they'll work — see `.env.example`.
- Dev seed accounts (all password `dev-only-change-me`, never reuse in production): `dev.student@abingdon.org.uk`, `dev.staff@…`, `dev.librarian@…`, `dev.hol@…`, `dev.admin@…`
