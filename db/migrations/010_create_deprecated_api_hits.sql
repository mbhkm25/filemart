CREATE TABLE IF NOT EXISTS deprecated_api_hits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  route TEXT NOT NULL,
  method TEXT NOT NULL,
  user_id UUID,
  query JSONB,
  body_hash TEXT,
  extra JSONB
);


