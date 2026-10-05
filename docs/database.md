# Hooke Database

Hooke uses PostgreSQL with Prisma.

## Core Model

A **Book** represents a title.

A **BookCopy** represents one physical copy of that title and has its own barcode and status.

A **Loan** belongs to a specific physical copy and a borrower.

This distinction allows the system to track multiple physical copies of the same title accurately.

## Main Entities

```text
User
 ├── Loan
 ├── Reservation
 ├── Favourite
 ├── ReadingList
 ├── Review
 ├── PurchaseRequest
 ├── AuditLog
 └── Passkey

Book
 ├── BookAuthor ── Author
 ├── BookCopy
 ├── Loan
 ├── Reservation
 ├── Favourite
 ├── Review
 ├── ReadingListItem
 └── Recommendation
```

## Important Design Decisions

- UUIDs are used for primary identifiers.
- ISBN-13 is unique when present.
- Physical copies have unique barcodes.
- User roles are represented by an enum.
- Loan and reservation state use explicit enums.
- Audit records preserve important administrative activity.
- Passkeys are stored separately from user records.

Run Prisma commands from `backend/`.
