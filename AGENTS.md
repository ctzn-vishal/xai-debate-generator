# Repository Guidelines

## Project Structure & Module Organization
The `nextjs-app/` directory is the primary workspace. Core UI routes live in `src/app`, reusable UI elements in `src/components`, and shared logic in `src/lib` with typed contracts in `src/types`. The root-level `src/` folder exposes the debate engine as a reusable TypeScript library that mirrors the app's `lib/` code. Keep generated assets (`.next/`, `dist/`) out of version control and document any new top-level folders in this guide.

## Build, Test, and Development Commands
Install dependencies once per workspace: `npm install` in the repo root for the library, and `cd nextjs-app && npm install` for the app. Run `npm run dev` inside `nextjs-app` for a Turbopack dev server with hot reload. Use `npm run build` followed by `npm run start` to validate a production bundle. Lint UI code with `npm run lint`; the root project offers `npm run build`, `npm run test`, and `npm run lint` for the exported SDK.

## Coding Style & Naming Conventions
TypeScript is strict in both packages; keep type definitions in `src/types`, and surface new shared types through the root `src/index.ts`. Prettier is the formatting source of truth (two-space indentation, single quotes via ESLint). Name React components and files in PascalCase (`DebateDisplay.tsx`), use camelCase for functions and variables, and reserve SCREAMING_SNAKE_CASE for env keys such as `XAI_API_KEY`. Prefer the `@/` alias when importing within the app.

## Testing Guidelines
Jest is configured for the core library; add unit tests under `src/**/*.test.ts` and run them with `npm test` in the root. The app currently lacks automated UI tests—add new suites alongside components (for example, `src/components/PersonaSelector.test.tsx`) and document any required mocks for the Grok client. Before opening a PR, execute relevant Jest suites and manual smoke tests against the Next.js dev server.

## Commit & Pull Request Guidelines
Commit messages follow an imperative, present-tense style (`Fix optional chaining in sourcesUsed.map()`). Scope each commit to a logical change set, referencing affected modules when helpful. Pull requests should include: a concise summary, linked issues or task IDs, screenshots or terminal output for UI/API changes, and a checklist of tests performed. Flag configuration changes (such as new env vars) prominently in the PR description.

## Environment & Configuration Tips
Copy `.env.example` (or create `.env.local`) with `XAI_API_KEY` for server calls and `NEXT_PUBLIC_XAI_API_KEY` when the browser needs access. The app targets Node 18+, so align local runtimes accordingly. When introducing new secrets or feature flags, update both the README and this guide, and prefer `dotenv`-friendly naming to keep deployment on Vercel straightforward.
