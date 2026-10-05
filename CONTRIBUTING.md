# Contributing to Hooke

Thank you for contributing to Hooke.

Hooke is developed as a structured software project, so changes should be deliberate, documented and easy to review.

## Before You Start

1. Read the main [README](README.md).
2. Check existing issues and the project roadmap.
3. Avoid duplicating work already in progress.
4. Never commit secrets, credentials or production environment files.

## Development Principles

- Keep frontend and backend responsibilities separate.
- Prefer small, focused changes.
- Use clear, descriptive names.
- Avoid unnecessary dependencies.
- Validate user input at application boundaries.
- Keep security-sensitive operations on the server.
- Update documentation when behaviour or architecture changes.

## Pull Requests

A good pull request should include:

- A clear title.
- A concise explanation of what changed and why.
- Testing performed.
- Screenshots for significant UI changes.
- Notes about migrations or configuration changes.

## Commit Messages

Prefer descriptive commits such as:

`feat: add book reservation endpoint`
`fix: handle expired reservations`
`docs: update deployment guide`
`refactor: simplify loan service`

## Reporting Bugs

Use the Bug Report issue template and include reproduction steps, expected behaviour and actual behaviour.

## Security

Do not publicly disclose security vulnerabilities through normal issues. Follow [SECURITY.md](SECURITY.md).
