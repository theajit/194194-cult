CREATE TABLE IF NOT EXISTS postal_post_offices (
  id BIGSERIAL PRIMARY KEY,
  pincode CHAR(6) NOT NULL,
  circle_name TEXT,
  region_name TEXT,
  division_name TEXT,
  office_name TEXT NOT NULL,
  office_type TEXT,
  delivery_status TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  source_dataset TEXT,
  source_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pincode, office_name, district, state)
);
CREATE INDEX IF NOT EXISTS postal_post_offices_pincode_idx ON postal_post_offices (pincode);
CREATE INDEX IF NOT EXISTS postal_post_offices_state_district_idx ON postal_post_offices (state, district);
CREATE INDEX IF NOT EXISTS postal_post_offices_office_name_idx ON postal_post_offices (office_name);
CREATE TABLE IF NOT EXISTS postal_imports (id BIGSERIAL PRIMARY KEY,source_file TEXT NOT NULL,source_dataset TEXT,office_rows INTEGER NOT NULL,unique_pins INTEGER NOT NULL,imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS cult_locations (pincode CHAR(6) PRIMARY KEY,status TEXT NOT NULL CHECK (status IN ('ACTIVE','FORMING')),chapter_name TEXT,chapter_number INTEGER,host_location TEXT,since_year INTEGER,activated_at TIMESTAMPTZ,instagram_url TEXT,whatsapp_url TEXT,member_count INTEGER,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
INSERT INTO cult_locations (pincode,status,chapter_name,chapter_number,host_location,since_year) VALUES ('759001','ACTIVE','Founding Chapter',1,'Pin Code Café',2026) ON CONFLICT (pincode) DO NOTHING;

CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content_markdown TEXT NOT NULL DEFAULT '',
  author_name TEXT NOT NULL DEFAULT '194.194 Cult',
  author_email TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  cover_kind TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_email TEXT;
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_status_check CHECK (status IN ('DRAFT','PENDING','PUBLISHED','REJECTED'));
CREATE INDEX IF NOT EXISTS blog_posts_status_published_idx ON blog_posts (status,published_at DESC);

INSERT INTO blog_posts (slug,title,excerpt,content_markdown,author_name,status,cover_kind,published_at) VALUES ('what-is-194-194-cult','What is 194.194 Cult?','Why a community born around a café carries a number inspired by caffeine — and why 194.194 is a signature, not a chemistry claim.',$blog1$
194.194 Cult started with a simple idea: a place should be more than an address.

A PIN code tells you **where** you are. DIGIPIN can tell you **exactly where** you are. 194.194 Cult is about **who you find there** — people willing to talk, listen, disagree, learn, build and belong without needing to perform.

## Why 194.194?

The number comes from caffeine.

Caffeine has the molecular formula **C8H10N4O2** and a molar mass of about **194.19 g/mol**. The Cult uses **194.194** as a deliberate brand signature inspired by that number. It is not intended as a more precise scientific value.

[[caffeine-structure]]

Coffee helped create the setting. Conversation created the Cult.

## What the Cult stands for

We like fundamentals. If we know, we share. If we do not know, we ask. Different points of view are welcome when they come with curiosity and respect.

A Cult chapter is not a membership badge for being similar. It is a local signal that people in a PIN are willing to show up, exchange ideas and create shared experiences.

## PIN Code + DIGIPIN + Community

- **PIN Code** — postal identity and geography.
- **DIGIPIN** — precise digital location identity.
- **194.194 Cult** — the human layer attached to a PIN.

Every PIN has an address. Every place can have a DIGIPIN. Some PINs have a Cult.

## Where it started

The founding chapter is PIN **759001**, Dhenkanal, Odisha, at **Pin Code Café**.

The café became a small laboratory for coffee, work, books, karaoke, games and conversations. The number stayed. The idea grew beyond the café.

If your PIN does not have a chapter yet, you can be the reason it starts.
$blog1$,'194.194 Cult','PUBLISHED','caffeine',NOW()) ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (slug,title,excerpt,content_markdown,author_name,status,cover_kind,published_at) VALUES ('coffee-guide-espresso-drinks','Coffee Guide: Espresso Drinks, Decoded','A practical visual guide to espresso, doppio, macchiato, ristretto, americano, latte, cappuccino, flat white, piccolo, mocha, affogato and magic.',$blog2$
Coffee menus can look complicated, but most espresso drinks are built from a few variables: **espresso, water, milk, foam and sometimes chocolate or ice cream**.

This guide keeps the recipes simple. Exact ratios vary by café, cup size, roast and local style — use these as a practical starting point, not a law of coffee.

## Espresso (Short Black)
[[coffee:espresso]]
The foundation of espresso-based drinks: concentrated coffee extracted under pressure.
- Pull **1 espresso shot** into an espresso cup.

## Double Espresso (Doppio)
[[coffee:doppio]]
Doppio simply means a double espresso.
- Pull **2 espresso shots** into one cup.

## Short Macchiato
[[coffee:short-macchiato]]
An espresso marked with a small amount of steamed milk and foam.
- Pull **1 espresso shot**.
- Add a small dollop of steamed milk and foam.

## Long Macchiato
[[coffee:long-macchiato]]
The same idea as a short macchiato, but built on a double shot.
- Pull **2 espresso shots**.
- Add a small dollop of steamed milk and foam.

## Ristretto
[[coffee:ristretto]]
A shorter, more concentrated extraction than a standard espresso.
- Use the same coffee dose as espresso.
- Stop the extraction earlier, producing roughly half the beverage volume.

## Long Black / Americano
[[coffee:americano]]
Espresso and hot water. A common long-black method preserves more crema by placing espresso over the water.
- Fill the cup about **two-thirds with hot water**.
- Pull **1 espresso shot** over the water.

## Café Latte
[[coffee:latte]]
Espresso softened by plenty of steamed milk with a thin layer of microfoam.
- Pull **1 espresso shot**.
- Add steamed milk.
- Finish with roughly **1 cm of microfoam**.

## Cappuccino
[[coffee:cappuccino]]
Compared with a latte, a cappuccino typically has a more pronounced foam layer and may be finished with cocoa or chocolate powder.
- Pull **1 espresso shot** into a cup.
- Add steamed milk.
- Add a deeper layer of microfoam.
- Optional: dust with cocoa or chocolate.

## Flat White
[[coffee:flat-white]]
A smooth espresso-and-milk drink associated strongly with Australia and New Zealand, usually served with a thin, integrated microfoam rather than a thick cap.
- Pull **1 espresso shot**.
- Add textured steamed milk with very fine microfoam.

## Piccolo Latte
[[coffee:piccolo]]
A small milk coffee that keeps the espresso character prominent.
- Pull **1 espresso or ristretto shot** into a small glass or cup.
- Add steamed milk with a small amount of microfoam.

## Mocha
[[coffee:mocha]]
Think espresso + chocolate + steamed milk.
- Pull **1 espresso shot**.
- Mix in chocolate or cocoa.
- Add steamed milk.
- Finish with microfoam and, if you like, a light cocoa dusting.

## Affogato
[[coffee:affogato]]
Dessert and coffee meet in one glass.
- Add **1 scoop of vanilla ice cream or gelato**.
- Pour **1 or 2 espresso shots** over it immediately before serving.

## Magic
[[coffee:magic]]
A Melbourne café favourite: strong, compact and milk-balanced.
- Pull **2 ristretto shots**.
- Top with steamed milk and a small amount of microfoam.
- Serve a little cooler than a typical latte so it is comfortable to drink quickly.

## The simplest way to remember the menu
- Want it **short and intense**? Espresso or ristretto.
- Want **more coffee**? Doppio.
- Want coffee **with water**? Long black / americano.
- Want **just a touch of milk**? Macchiato.
- Want **smooth milk and espresso**? Flat white or latte.
- Want **more foam**? Cappuccino.
- Want **chocolate**? Mocha.
- Want **dessert**? Affogato.

At 194.194 Cult, the point is not to memorise jargon. It is to understand what is in your cup — then order what you actually enjoy.
$blog2$,'194.194 Cult','PUBLISHED','coffee-guide',NOW() - INTERVAL '1 minute') ON CONFLICT (slug) DO NOTHING;
