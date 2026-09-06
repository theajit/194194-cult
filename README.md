# 194.194 Cult

> Every PIN has an address. Some PINs have a Cult.

194.194 Cult is a mobile-first community registry and India PIN-code discovery layer, founded at Pin Code Café in Dhenkanal.

## Routes
- `/` — Cult discovery/search
- `/pincodes` — India state/UT directory
- `/pincodes/[state]` — district directory
- `/pincodes/[state]/[district]` — valid PIN codes
- `/pincode/[pin]` — useful postal page + Cult status
- `/sitemap.xml` and `/robots.txt` — crawler discovery

Every PIN page has unique metadata, canonical URL, postal details, internal geographic links and structured address data. Unknown PINs are not indexable and return 404 once the complete directory is loaded.

## Official PIN data
The generated `data/pincodes.json` is the build artifact used by the app. `scripts/import-pincodes.mjs` imports the Government of India Open Government Data / Department of Posts PIN directory and groups multiple post-office rows under one unique PIN.

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

The checked-in JSON currently remains a small development fixture. Run the importer before production deployment to materialize the complete official directory and therefore the complete set of crawlable PIN pages/sitemap entries.

## Separation of concerns
Postal master data and Cult state are intentionally separate. One PIN can contain multiple post offices, while one Cult status belongs to the PIN itself.

Public Cult lifecycle: `ACTIVE`, `FORMING`, `NOT HERE YET`.

## Run
```bash
npm install
npm run dev
```
