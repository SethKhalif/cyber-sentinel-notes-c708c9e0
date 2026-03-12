
-- Create storage bucket for threat scanner uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('threat-uploads', 'threat-uploads', false);

-- RLS for threat-uploads bucket: users can upload their own files
CREATE POLICY "Authenticated users can upload threat files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'threat-uploads');

CREATE POLICY "Users can read their own uploads"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'threat-uploads' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'threat-uploads' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Create scan_results table
CREATE TABLE public.scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scan_type TEXT NOT NULL DEFAULT 'url',
  source TEXT NOT NULL,
  threat_level TEXT NOT NULL DEFAULT 'None',
  attack_type TEXT,
  probability INTEGER DEFAULT 0,
  mitre_mapping TEXT,
  mitigation TEXT,
  malicious_indicators JSONB DEFAULT '[]'::jsonb,
  raw_content_preview TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans" ON public.scan_results
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON public.scan_results
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans" ON public.scan_results
FOR DELETE TO authenticated USING (auth.uid() = user_id);
