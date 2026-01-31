# Technology Stack

**Analysis Date:** 2026-01-31

## Languages

**Primary:**
- TypeScript 5 - Entire codebase, strict mode enabled
- JavaScript (React JSX/TSX) - Client and server components

**Secondary:**
- CSS - Tailwind CSS utility classes

## Runtime

**Environment:**
- Node.js (version specified by .nvmrc or package.json engines, currently supporting Node 18+)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.2 - Full-stack framework with App Router
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering

**UI Components:**
- Shadcn/ui (via Radix UI primitives) - Headless component library
  - @radix-ui/react-dialog, @radix-ui/react-select, @radix-ui/react-dropdown-menu, @radix-ui/react-tabs, @radix-ui/react-collapsible, @radix-ui/react-switch, @radix-ui/react-checkbox, @radix-ui/react-separator, @radix-ui/react-progress, @radix-ui/react-avatar, @radix-ui/react-label, @radix-ui/react-slot
- Tailwind CSS 4 - Utility-first CSS framework
- class-variance-authority 0.7.1 - CSS-in-JS variant system
- clsx 2.1.1 - Class name utilities
- tailwind-merge 3.4.0 - Merge Tailwind classes intelligently

**Data Management:**
- TanStack React Query 5.90.17 - Async state management, caching, synchronization
- Zod 4.3.5 - Schema validation
- React Hook Form 7.71.1 - Form state management
- @hookform/resolvers 5.2.2 - Form validation resolution

**Styling:**
- Tailwind CSS 4 - Utility framework
- @tailwindcss/postcss 4 - PostCSS plugin for Tailwind
- next-themes 0.4.6 - Light/dark mode theming

**Visualization:**
- Recharts 3.6.0 - React charting library for financial data visualization

**Date/Time:**
- date-fns 4.1.0 - Date manipulation utilities

**Icons:**
- lucide-react 0.562.0 - Icon library
- qrcode.react 4.2.0 - QR code generation

**Notifications:**
- sonner 2.0.7 - Toast notification library

## Key Dependencies

**Critical:**
- stripe 20.2.0 - Stripe SDK for payment processing, subscription management
- @supabase/supabase-js 2.90.1 - Supabase JavaScript client (PostgreSQL database)
- @supabase/ssr 0.8.0 - Server-side rendering utilities for Supabase auth

**Infrastructure:**
- @supabase/supabase-js - Database and authentication via PostgreSQL + RLS
- stripe - Payment processing and subscription billing

## Development Dependencies

**Testing:**
- vitest 4.0.18 - Fast unit test framework
- @vitest/ui 4.0.18 - Test UI dashboard
- @vitest/coverage-v8 4.0.18 - Code coverage reporting
- @testing-library/react 16.3.2 - React component testing utilities
- @testing-library/jest-dom 6.9.1 - DOM matchers
- @testing-library/user-event 14.6.1 - User interaction simulation
- msw 2.12.7 - Mock Service Worker for API mocking
- jsdom 27.4.0 - DOM environment for tests

**Build & Type:**
- TypeScript 5 - Type checking and compilation
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions
- @types/node 20 - Node.js type definitions

**Linting:**
- eslint 9 - Code linting
- eslint-config-next 16.1.2 - Next.js ESLint config

**Build Tools:**
- @vitejs/plugin-react 5.1.2 - Vite plugin for React (used by vitest)

## Configuration

**Environment:**
- `.env.local` - Local development environment (git-ignored)
- `.env.example` - Environment variable template

**Build:**
- `tsconfig.json` - TypeScript compiler config with `@/*` path alias
- `eslint.config.mjs` - ESLint v9 flat config
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS
- `next.config.ts` - Next.js configuration
- `vitest.config.ts` - Vitest configuration with jsdom environment
- `package.json` - Project manifest with build/dev/test scripts

## Platform Requirements

**Development:**
- Node.js 18+ (via npm)
- TypeScript 5 compiler
- ESLint 9 linter
- Vitest 4 test runner

**Production:**
- Deployed on Vercel (based on Next.js and `NEXT_PUBLIC_APP_URL` in env)
- Node.js 18+ runtime
- PostgreSQL database (Supabase)
- Stripe account for payment processing

## Build Commands

```bash
npm run dev          # Start Next.js development server (port 3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
npm run test:ui      # Run tests with UI dashboard
npm run test:coverage # Generate coverage report
npm run test:run     # Run tests once (CI mode)
```

## Code Quality

**Type Safety:**
- TypeScript strict mode enabled
- Path alias: `@/*` → `./src/*`

**Formatting:**
- Tailwind CSS 4 with PostCSS
- ESLint 9 with Next.js recommended rules

**Testing:**
- Vitest 4 as test runner
- jsdom as DOM environment
- Coverage reporting via v8 provider

---

*Stack analysis: 2026-01-31*
