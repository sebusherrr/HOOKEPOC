# Security Policy

## Supported Versions

Hooke is currently under active development. Security fixes are applied to the current development branch.

| Version | Supported |
|---|---|
| main | Yes |
| Older releases | No |

## Reporting a Vulnerability

Please do **not** create a public GitHub issue for an undisclosed security vulnerability.

Contact the project maintainer privately with:

- A description of the vulnerability.
- Steps required to reproduce it.
- The affected component.
- Potential impact.
- Any suggested mitigation.

Please allow reasonable time for the issue to be investigated before public disclosure.

## Security Principles

Hooke is designed with security in mind, including:

- Environment-based secret management.
- Password hashing rather than plaintext credential storage.
- Rate limiting.
- HTTP security headers.
- Server-side authorisation.
- Audit logging.
- Database access through Prisma.
- Separation of public and privileged operations.

Security-sensitive functionality must be reviewed before production deployment.
