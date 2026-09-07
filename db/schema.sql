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

CREATE TABLE IF NOT EXISTS postal_imports (
  id BIGSERIAL PRIMARY KEY,
  source_file TEXT NOT NULL,
  source_dataset TEXT,
  office_rows INTEGER NOT NULL,
  unique_pins INTEGER NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cult_locations (
  pincode CHAR(6) PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE','FORMING')),
  chapter_name TEXT,
  chapter_number INTEGER,
  host_location TEXT,
  since_year INTEGER,
  activated_at TIMESTAMPTZ,
  instagram_url TEXT,
  whatsapp_url TEXT,
  member_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO cult_locations (pincode,status,chapter_name,chapter_number,host_location,since_year)
VALUES ('759001','ACTIVE','Founding Chapter',1,'Pin Code Café',2026)
ON CONFLICT (pincode) DO NOTHING;
