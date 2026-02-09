
-- Investigation history table
CREATE TABLE public.investigations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  scan_mode TEXT NOT NULL DEFAULT 'quick',
  risk_level TEXT,
  classification TEXT,
  summary TEXT,
  ai_bio TEXT,
  results JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  evidence_links TEXT[] DEFAULT '{}',
  threat_profile JSONB,
  network_map JSONB,
  pivot_suggestions JSONB,
  recommendations JSONB,
  raw_intel JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

-- Public read/write for now (no auth)
CREATE POLICY "Allow public read" ON public.investigations FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.investigations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.investigations FOR DELETE USING (true);

-- Index for fast lookups
CREATE INDEX idx_investigations_query ON public.investigations (query);
CREATE INDEX idx_investigations_created ON public.investigations (created_at DESC);
