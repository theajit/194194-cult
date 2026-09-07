# 194.194 Cult

> Every PIN has an address. Every place can have a DIGIPIN. Some PINs have a Cult.

194.194 Cult is a mobile-first India PIN-code discovery and community layer, founded at Pin Code Café in Dhenkanal.

The product combines three separate but PIN-linked layers:
- **PIN Code** — Department of Posts postal geography and post offices stored in PostgreSQL
- **DIGIPIN** — precise digital location identity within a PIN area
- **194.194 Cult** — editable community lifecycle state keyed by PIN

## Architecture

```text
Official Department of Posts CSV
          ↓
PostgreSQL postal_post_offices
          ↓
Postal API / server pages
          ↓
Search + PIN directory

pincode ─────────────→ cult_locations
                         ↓
                 ACTIVE / FORMING / absence = NOT HERE YET
```

Postal imports never overwrite Cult state. Cult data has its own table and update API.

## Environment

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
ADMIN_TOKEN=use-a-long-random-secret
```

For PostgreSQL providers that require TLS:

```bash
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

For a private Dokploy PostgreSQL service, TLS is normally not required unless you configured it explicitly.

## Database setup

The production start command runs the idempotent schema migration before starting Next.js.

The official CSV is checked into the repository at:

```text
data/postal/all-india-pincode-directory.csv
```

Postal import is intentionally an explicit admin operation because it replaces the postal master table. After deployment, import the bundled CSV with:

```text
POST /api/admin/postal/import
Authorization: Bearer <ADMIN_TOKEN>
```

No multipart body is required. The endpoint reads the bundled CSV and imports only the configured Phase-1 scope: Odisha, Karnataka, Delhi, Mumbai, Kolkata, Chennai and Hyderabad. Multipart CSV upload remains available for future refreshes.

Check import status:

```text
GET /api/postal/status
```

## Postal API

```text
GET /api/postal/pin/759027
GET /api/postal/search?q=govindpur
GET /api/postal/search?q=dhenkanal
GET /api/postal/states
GET /api/postal/states/Odisha/districts
GET /api/postal/status
```

The legacy `GET /api/pincodes` endpoint remains as a PostgreSQL-backed compatibility route. Individual PIN pages now use PostgreSQL as the postal source of truth and do not fall back to bundled seed JSON.

## Cult API

Public reads:

```text
GET /api/cult/759001
GET /api/cult/759027
GET /api/cult/stats
```

Protected update:

```text
PATCH /api/admin/cult/759027
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

Example — start forming:

```json
{
  "status": "FORMING",
  "chapterName": "Dhenkanal North",
  "hostLocation": "Example Venue"
}
```

Example — activate:

```json
{
  "status": "ACTIVE",
  "chapterName": "Dhenkanal North Chapter",
  "chapterNumber": 2,
  "hostLocation": "Example Venue",
  "sinceYear": 2026
}
```

Example — reset to public `NOT HERE YET`:

```json
{
  "status": "NOT_HERE_YET"
}
```

`NOT_HERE_YET` is represented by the absence of a row in `cult_locations`; the public API still returns the explicit fallback status.

## Routes

- `/` — PIN / DIGIPIN / Cult discovery
- `/pincodes` — PostgreSQL-backed India state/UT directory
- `/pincodes/[state]` — district directory
- `/pincodes/[state]/[district]` — PIN directory
- `/pincode/[pin]` — postal details + DIGIPIN guidance + Cult status
- `/sitemap.xml` and `/robots.txt` — crawler discovery

## Dokploy

Recommended deployment sequence:

```bash
npm install
npm run build
npm run start
```

Schema migration runs automatically at startup. Postal CSV import remains admin-only and explicit.

## Run locally

```bash
npm install
npm run dev
```

## Product principle

Postal truth belongs to the Department of Posts. Cult state belongs to 194.194 Cult. Both use PIN code as the stable joining key without coupling their lifecycle.
