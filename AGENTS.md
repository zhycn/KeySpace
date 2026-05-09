<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- **Package manager**: pnpm (ignore README listing npm/yarn/bun)
- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm lint` — Biome check (not ESLint)
- `pnpm format` — Biome format --write (not Prettier)
- No test framework is configured

## Stack & Config

- **Next.js 16** with React 19 and React Compiler enabled (`reactCompiler: true` in next.config.ts). Don't add unnecessary `useMemo`/`useCallback` — the compiler handles memoization.
- **Tailwind CSS v4** (not v3) — uses `@tailwindcss/postcss`, CSS-first config in `app/globals.css`.
- **shadcn/ui** with `radix-luma` style. `components/ui/` is auto-generated — **do not manually edit or lint it**. It's excluded in `biome.json`.
- **next-intl v4** for i18n. Default locale is `zh`; supported: `zh`, `en`. Translation files in `messages/`. Server resolves locale from `keyspace-locale` cookie; client uses `LocaleSwitchProvider` with localStorage + cookie sync.
- **Biome** for lint and format (2-space indent). `noDangerouslySetInnerHtml` enforced.
- **tsconfig**: `noUncheckedIndexedAccess` enabled. Path alias `@/*` → `./*`.

## Architecture

- Static data app — no database, no API routes. All content is JSON in `data/` (categories, engines, keyword files per category). Data loaded server-side via `lib/data-loader.ts` using dynamic imports.
- Client-side state via React context providers (search, keywords, navigation, theme, locale).
- Routes: `/` (home), `/[categoryId]` (category view, SSG via `generateStaticParams`), `/history` (click history).
- User preferences and click history stored in `localStorage` (`lib/storage.ts`), capped at 200 records.
