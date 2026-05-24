# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal site at [lenvx.dev](https://lenvx.dev). Deployed on Vercel. Licensed under AGPL.

## Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js | 16.2.6 |
| Language | TypeScript | ^5 |
| UI Runtime | React | 19.2.4 |
| Styling | Tailwind CSS | ^4 |
| Components | shadcn/ui | (not yet installed) |
| Animation | Motion | (not yet installed) |
| Animation | GSAP | (not yet installed) |
| Smooth Scroll | Lenis | (not yet installed) |
| 3D | React Three Fiber | (not yet installed) |
| 3D Helpers | @react-three/drei | (not yet installed) |

## Commands

```bash
npm run dev       # start dev server (localhost:3000)
npm run build     # production build
npm run start     # start production server
npm run lint      # ESLint
```

## Architecture notes

- Next.js App Router (`app/` directory). See `AGENTS.md` at root — this is Next.js 16 with breaking changes; read `node_modules/next/dist/docs/` before writing new Next.js-specific code.
- Tailwind CSS v4 — uses `@tailwindcss/postcss` plugin, not the v3 `tailwind.config.js` approach. Config is CSS-first (via `@theme` in CSS).
- 3D scenes use React Three Fiber — keep heavy Three.js imports inside client components (`"use client"`).
- Lenis smooth scroll should be initialized at the layout level and paired with GSAP ScrollTrigger via `lenis.on("scroll", ScrollTrigger.update)`.
- GSAP animations and Motion (Framer Motion) can coexist — prefer Motion for React-driven state animations and GSAP for scroll-based or timeline sequencing.
- shadcn/ui components live in `components/ui/` and are copy-pasted source, not an installed package — edit them directly if needed.
