# Hooke API

The Hooke backend exposes a REST-style HTTP API.

## Base URL

Local development:

```
http://localhost:3000
```

The production base URL will be documented once deployment is finalised.

## API Principles

- JSON request and response bodies.
- Explicit HTTP status codes.
- Server-side validation.
- Authentication for protected operations.
- Role-based authorisation for administrative operations.
- Consistent error responses.

## Planned Resource Areas

| Resource | Purpose |
|---|---|
| Users | Accounts, roles and profiles |
| Books | Library catalogue titles |
| Copies | Physical book copies and barcodes |
| Loans | Borrowing and returns |
| Reservations | Queued and ready reservations |
| Reviews | User-submitted book reviews |
| Reading Lists | Curated personal/class lists |
| Purchase Requests | Requests for new resources |
| Recommendations | Personalised recommendations |
| Audit Logs | Security and administrative history |

## Status

The API is actively being developed. Endpoint contracts should be added here as routes become stable.
