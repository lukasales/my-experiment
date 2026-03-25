# Repository context

This repository contains a university assignment project.

## Core stack
- React + TypeScript client in `sistema/client`
- Node + TypeScript server in `sistema/server`
- Gherkin/Cucumber acceptance scenarios in `sistema/features`

## Working style
- Make small, verifiable changes only.
- Prefer one minimal vertical slice at a time.
- Do not refactor unrelated parts of the codebase.
- Keep code readable, modular, and easy to review.
- Preserve the existing folder structure unless explicitly asked.

## Before changing code
- Summarize the plan briefly.
- List the files likely to change.
- Mention risks and assumptions.

## After changing code
- Explain what changed.
- Explain how to validate it locally.
- Mention what remains intentionally out of scope.

## Quality expectations
- Avoid duplication where practical.
- Prefer clear naming and small functions/components.
- Keep client and server responsibilities separated.
- Add or update tests when relevant.
- Do not invent features outside the requested scope.

## Validation expectations
- Changes should compile or build successfully.
- The implementation should satisfy the requested acceptance criteria.
- If requirements are ambiguous, choose the smallest safe interpretation and say so.

## Modularity expectations
- Do not concentrate new domain types, validation logic, API access logic, route handling, and UI rendering in a single file when a small extraction is clearly justified.
- Prefer small, maintainable extractions over growing large all-in-one files.
- Do not introduce heavy architecture, but do extract obvious responsibilities when it improves maintainability and future growth.

## Frontend structure preference
- Prefer:
  - `src/types` for domain models
  - `src/services` for API calls
  - `src/components` for rendering concerns
- Keep `App.tsx` focused on composition and top-level orchestration whenever practical.
- If a feature grows, prefer extracting the feature section into its own component instead of growing `App.tsx` indefinitely.

## Backend structure preference
- Prefer keeping `server.ts` focused on application bootstrap and route wiring whenever practical.
- Prefer small extractions such as:
  - route handlers or route modules for endpoint logic
  - `types` or domain model files for shared backend shapes
  - small helper/service modules for in-memory data operations or validation when the logic starts growing
- Do not keep request validation, in-memory data manipulation, and route definitions all mixed in one large file if a small extraction is clearly justified.
- Avoid introducing heavy frameworks or unnecessary layering, but do extract obvious backend responsibilities when it keeps the code easier to extend.

## Scope discipline
- If the task is a minimal slice, keep the implementation minimal.
- However, minimal does not mean forcing all new logic into one existing file.
- When a small extraction clearly improves clarity without expanding scope, prefer the small extraction.