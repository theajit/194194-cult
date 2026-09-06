# 194.194 Cult

> Every PIN has an address. Every place can have a DIGIPIN. Some PINs have a Cult.

194.194 Cult is a mobile-first India PIN-code discovery and community layer, founded at Pin Code Café in Dhenkanal.

The product combines three related layers:
- **PIN Code** — postal geography and post offices
- **DIGIPIN** — precise digital location identity within a PIN area
- **194.194 Cult** — community status attached to the PIN

## Routes
- `/` — PIN / DIGIPIN / Cult discovery
- `/pincodes` — India state/UT directory
- `/pincodes/[state]` — district directory
- `/pincodes/[state]/[district]` — valid PIN codes
- `/pincode/[pin]` — postal details + DIGIPIN guidance + Cult status
- `/sitemap.xml` and `/robots.txt` — crawler discovery

Every PIN page has unique metadata, a canonical URL, postal details, internal geographic links and structured address data. Unknown PINs are non-indexable and return 404 once the complete directory is loaded.

## Official PIN data
`data/pincodes.json` is the generated build artifact used by the app. `scripts/import-pincodes.mjs` imports the Government of India Open Government Data / Department of Posts PIN directory and groups multiple post-office rows under one unique PIN.

Set a data.gov.in API key and run:

```bash
DATA_GOV_IN_API_KEY=your_key npm run data:pincodes
npm run build
```

On Windows PowerShell:

```powershell
$env:DATA_GOV_IN_API_KEY='your_key'
npm run data:pincodes
npm run build
```

The checked-in JSON is intentionally a small development fixture. Run the importer before production deployment to materialize the complete official directory and complete crawlable PIN sitemap.

## Separation of concerns
Postal master data, DIGIPIN and Cult state are intentionally separate. One PIN can contain multiple post offices and many DIGIPIN locations, while one Cult lifecycle status belongs to the PIN itself.

Public Cult lifecycle: `ACTIVE`, `FORMING`, `NOT HERE YET`.

Dhenkanal `759001` is the founding chapter, hosted at Pin Code Café.

## Run
```bash
npm install
npm run dev
```

## Product principle
`NOT HERE YET` is deliberate: absence is an invitation, not a failed chapter.
