# Xplender Platform Web

Central administration console for [Xplender Platform](https://github.com/Xplender).

Part of Xplender Platform — the shared services layer that powers all Xplender SaaS products.

## Stack

- [Next.js 15](https://nextjs.org) — App Router, React Server Components
- TypeScript (strict mode)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## Getting started

```bash
cp .env.example .env.local
# Fill in .env.local with your values

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Deployment

Deployed to [Vercel](https://vercel.com). Connect the `Xplender/xplender-platform-web` repository in the Vercel dashboard and set the environment variables from `.env.example`.

## Status

Early architecture phase. Authentication and modules will be added in subsequent iterations.
