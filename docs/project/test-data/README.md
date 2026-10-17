# Hooke catalogue CSV test fixtures

These files are **test data only**, not a verified school catalogue.

## Files

- `hooke-catalogue-test-books.csv`: 61 book records for testing bulk import, catalogue cards, genre/year-group filters, searching and long lists.
- `catalogue-import-edge-cases.csv`: 10 records for checking quoted commas, quotes, Unicode, long titles, duplicate ISBN handling, zero copies, invalid values and safe display of HTML-like text.

## Import format

The main fixture has the exact 17-column header accepted by the Hooke CSV importer:

```csv
title,author,isbn,copies,cover,genre,year_group,publisher,publication_year,language,format,shelf,description,keywords,reading_age,pages,edition
```

Required: `title`, `author`.

Optional: `isbn`, `copies`, `cover`, `genre`, `year_group`, `publisher`, `publication_year`, `language`, `format`, `shelf`, `description`, `keywords`, `reading_age`, `pages`, `edition`.

Column names are case-insensitive; spaces and hyphens in headers are normalised to underscores. Commas, quotes, and line breaks inside fields should be wrapped in CSV double quotes. A literal double quote inside a quoted field must be doubled.

The test fixture intentionally leaves ISBN, publisher, publication year and page count blank where values have not been verified. Summaries are labelled test placeholders rather than publisher copy. Do not treat this fixture as authoritative bibliographic data.

## How to test

1. Sign in using the demo Head of Library or Librarian account.
2. Open **Book CSV Import**.
3. Upload `hooke-catalogue-test-books.csv`.
4. Click **Preview and validate**, review the first 100 rows, then **Import valid rows**.
5. For validation checks, clear the import text and use `catalogue-import-edge-cases.csv`. Import it only in a disposable demo browser profile.
6. Check that invalid rows are reported, the duplicate test ISBN is skipped when a matching ISBN is already in the catalogue, and the HTML-like title is displayed as text.

## Important limitations

This prototype stores data in the current browser's local storage. It is not a shared catalogue, and the current CSV upload is not a full production security test. Do not import live student information or real printer codes into the demo. Production use requires server-side validation, authorization, audit logs, rate limits, and secure database storage.
