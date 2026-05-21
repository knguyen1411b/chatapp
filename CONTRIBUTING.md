# Contributing Guide

Thanks for your interest in contributing.

## Before You Start

- Read the README for setup instructions.
- Check open issues and discussions first to avoid duplicate work.
- For significant changes, open an issue to align on direction before coding.

## Development Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

3. Generate Prisma client and migrate DB:

```bash
pnpm prisma:generate
pnpm migrate
```

4. Run local dev:

```bash
pnpm dev
```

## Branches and Commits

- Create a branch from `main`:
    - `feature/<short-name>`
    - `fix/<short-name>`
- Write clear commit messages:
    - `feat(chat): add unread badge`
    - `fix(auth): refresh token retry handling`

## Pull Request Checklist

- Keep PR scope focused and minimal.
- Add screenshots/GIFs for UI changes.
- Ensure all checks pass:

```bash
pnpm format
pnpm lint
pnpm build
```

- Mention related issue(s) in the PR description.
- Describe what changed, why, and how to test.

## Coding Standards

- Follow the existing project structure and naming.
- Avoid introducing breaking API changes unless discussed first.
- Do not commit secrets or real `.env` files.

## Reporting Bugs

When opening a bug report, include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Logs or screenshots
- Environment details (OS, Node, pnpm, browser)

## Security

If you discover a security issue, please report it privately to maintainers instead of opening a public issue.
