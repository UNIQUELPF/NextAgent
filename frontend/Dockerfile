ARG NEXT_PUBLIC_KRATOS_PUBLIC_URL=http://www.qibiaobang.com/.ory

FROM node:20-bullseye AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV npm_config_registry="https://registry.npmjs.org/"
RUN corepack enable

WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
COPY .npmrc ./
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG NEXT_PUBLIC_KRATOS_PUBLIC_URL
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  NEXT_DISABLE_ESLINT=1 \
  NEXT_DISABLE_TYPECHECK=1
ENV NEXT_PUBLIC_KRATOS_PUBLIC_URL=${NEXT_PUBLIC_KRATOS_PUBLIC_URL}
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM node:20-bullseye AS runner
WORKDIR /app
ARG NEXT_PUBLIC_KRATOS_PUBLIC_URL
ENV NODE_ENV=production
ENV NEXT_PUBLIC_KRATOS_PUBLIC_URL=${NEXT_PUBLIC_KRATOS_PUBLIC_URL}

COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
