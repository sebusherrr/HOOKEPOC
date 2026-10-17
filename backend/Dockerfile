# Build the TypeScript API and generate the Prisma client.
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Keep the runtime image free of development dependencies.
FROM node:20-bookworm-slim AS production-deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app

COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --chown=node:node package.json ./

USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
