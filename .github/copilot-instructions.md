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
