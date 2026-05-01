
-- 1. Tambah kolom pengaturan
ALTER TABLE public.pengaturan
  ADD COLUMN IF NOT EXISTS bentuk_skl_default TEXT NOT NULL DEFAULT 'akhir',
  ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '';

-- 2. Tambah kolom siswa untuk status tunda
ALTER TABLE public.siswa
  ADD COLUMN IF NOT EXISTS status_kelulusan TEXT NOT NULL DEFAULT 'belum',
  ADD COLUMN IF NOT EXISTS mapel_tunda TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS alasan_tunda TEXT DEFAULT '';

-- Sinkronkan status_kelulusan dari status_lulus existing
UPDATE public.siswa SET status_kelulusan = 'lulus' WHERE status_lulus = true AND status_kelulusan = 'belum';

-- 3. Update RLS public read siswa: izinkan jika lulus atau tunda
DROP POLICY IF EXISTS "public read siswa lulus" ON public.siswa;
CREATE POLICY "public read siswa pengumuman"
ON public.siswa
FOR SELECT
TO public
USING (status_lulus = true OR status_kelulusan IN ('lulus','tunda'));

-- Update RLS nilai mengikuti
DROP POLICY IF EXISTS "public read nilai lulus" ON public.nilai;
CREATE POLICY "public read nilai pengumuman"
ON public.nilai
FOR SELECT
TO public
USING (EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = nilai.siswa_id AND (s.status_lulus = true OR s.status_kelulusan IN ('lulus','tunda'))));

-- 4. Storage bucket logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Admin upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'logos' AND public.has_role(auth.uid(), 'admin'));
