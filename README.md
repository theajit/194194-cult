# 194.194 Cult

> Every PIN has an address. Some PINs have a Cult.

Mobile-first registry for discovering whether 194.194 Cult is active in an Indian PIN code.

## MVP
- Six-digit PIN lookup
- ACTIVE / FORMING / NOT HERE YET lifecycle
- Public `/pincode/[pin]` pages
- Dhenkanal 759001 as the founding chapter, hosted at Pin Code Café
- Responsive brand experience

## Run
```bash
npm install
npm run dev
```

## Data roadmap
`lib/pincodes.ts` contains only MVP seed records. The next data milestone is an ingestion job for the official India Post / Government OGD All India Pincode Directory. Cult state must remain separate from post-office master records because multiple post offices can share one PIN.

Proposed persistent model:
- `pincodes`: unique PIN geography/search projection
- `post_offices`: official office rows linked to PIN
- `cult_locations`: unique PIN + lifecycle status/chapter metadata
- `cult_interest`: expressions of interest used to move NOT HERE YET → FORMING

## Product principle
The public status language is deliberately `NOT HERE YET`, not `INACTIVE`: absence is an invitation, not a failed chapter.
