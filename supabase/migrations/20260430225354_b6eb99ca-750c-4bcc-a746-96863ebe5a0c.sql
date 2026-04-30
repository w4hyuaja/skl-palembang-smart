-- ROLE ENUM
CREATE TYPE public.app_role AS ENUM ('admin');

-- KELOMPOK MAPEL ENUM
CREATE TYPE public.kelompok_mapel AS ENUM ('A', 'B', 'Peminatan', 'Lintas Minat');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER_ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  -- First user becomes admin automatically
  IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- MATA PELAJARAN
CREATE TABLE public.mata_pelajaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  kelompok kelompok_mapel NOT NULL DEFAULT 'A',
  urutan INTEGER NOT NULL DEFAULT 0,
  aktif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mata_pelajaran ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER mp_updated BEFORE UPDATE ON public.mata_pelajaran
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SISWA
CREATE TABLE public.siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nisn TEXT NOT NULL UNIQUE,
  nis TEXT,
  nama TEXT NOT NULL,
  tempat_lahir TEXT,
  tanggal_lahir DATE,
  jenis_kelamin TEXT,
  kelas TEXT,
  jurusan TEXT,
  nama_orang_tua TEXT,
  no_peserta_ujian TEXT,
  no_seri_ijazah TEXT,
  status_lulus BOOLEAN NOT NULL DEFAULT false,
  tanggal_lulus DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER siswa_updated BEFORE UPDATE ON public.siswa
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_siswa_nisn ON public.siswa(nisn);

-- NILAI
CREATE TABLE public.nilai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  mapel_id UUID NOT NULL REFERENCES public.mata_pelajaran(id) ON DELETE CASCADE,
  sem1 NUMERIC(5,2),
  sem2 NUMERIC(5,2),
  sem3 NUMERIC(5,2),
  sem4 NUMERIC(5,2),
  sem5 NUMERIC(5,2),
  sem6 NUMERIC(5,2),
  nilai_akhir NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(siswa_id, mapel_id)
);
ALTER TABLE public.nilai ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER nilai_updated BEFORE UPDATE ON public.nilai
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PENGATURAN (single row)
CREATE TABLE public.pengaturan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_sekolah TEXT NOT NULL DEFAULT 'SMA MUHAMMADIYAH 01 PALEMBANG',
  npsn TEXT NOT NULL DEFAULT '10604065',
  alamat TEXT NOT NULL DEFAULT 'JL. BALAYUDHA KM. 4,5 NO. 21A PALEMBANG',
  kelurahan TEXT DEFAULT 'ARIO KEMUNING',
  kecamatan TEXT DEFAULT 'KEC. KEMUNING',
  kabupaten TEXT DEFAULT 'KOTA PALEMBANG',
  provinsi TEXT DEFAULT 'PROV. SUMATERA SELATAN',
  status_sekolah TEXT DEFAULT 'SWASTA',
  bentuk_pendidikan TEXT DEFAULT 'SMA',
  jenjang TEXT DEFAULT 'DIKMEN',
  kepala_sekolah TEXT NOT NULL DEFAULT 'Muhammad Bustomi, M.Pd.I',
  nip_kepala TEXT DEFAULT '',
  tahun_pelajaran TEXT DEFAULT '2025/2026',
  tanggal_pengumuman TIMESTAMPTZ,
  pengumuman_dibuka BOOLEAN NOT NULL DEFAULT false,
  judul_pengumuman TEXT DEFAULT 'PENGUMUMAN KELULUSAN',
  pesan_pengumuman TEXT DEFAULT 'Selamat kepada seluruh siswa yang telah dinyatakan LULUS.',
  url_validasi_base TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER pengaturan_updated BEFORE UPDATE ON public.pengaturan
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.pengaturan (id) VALUES (gen_random_uuid());

-- ============= RLS POLICIES =============

-- profiles
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "admin read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "admin read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own role read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- mata_pelajaran: admin full, public read aktif
CREATE POLICY "public read mapel" ON public.mata_pelajaran FOR SELECT USING (true);
CREATE POLICY "admin manage mapel" ON public.mata_pelajaran FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- siswa: admin full; public hanya read siswa lulus
CREATE POLICY "public read siswa lulus" ON public.siswa FOR SELECT USING (status_lulus = true);
CREATE POLICY "admin read siswa" ON public.siswa FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin manage siswa" ON public.siswa FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- nilai: admin full; public hanya nilai siswa lulus
CREATE POLICY "public read nilai lulus" ON public.nilai FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = nilai.siswa_id AND s.status_lulus = true)
);
CREATE POLICY "admin read nilai" ON public.nilai FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin manage nilai" ON public.nilai FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- pengaturan: public read, admin update
CREATE POLICY "public read pengaturan" ON public.pengaturan FOR SELECT USING (true);
CREATE POLICY "admin update pengaturan" ON public.pengaturan FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin insert pengaturan" ON public.pengaturan FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SEED MAPEL SMA STANDAR
INSERT INTO public.mata_pelajaran (kode, nama, kelompok, urutan) VALUES
  ('PAI', 'Pendidikan Agama Islam dan Budi Pekerti', 'A', 1),
  ('PKN', 'Pendidikan Pancasila dan Kewarganegaraan', 'A', 2),
  ('BIN', 'Bahasa Indonesia', 'A', 3),
  ('MTK', 'Matematika', 'A', 4),
  ('SIN', 'Sejarah Indonesia', 'A', 5),
  ('BIG', 'Bahasa Inggris', 'A', 6),
  ('SBD', 'Seni Budaya', 'B', 7),
  ('PJK', 'Pendidikan Jasmani, Olahraga, dan Kesehatan', 'B', 8),
  ('PKW', 'Prakarya dan Kewirausahaan', 'B', 9),
  ('MTP', 'Matematika Peminatan', 'Peminatan', 10),
  ('FIS', 'Fisika', 'Peminatan', 11),
  ('KIM', 'Kimia', 'Peminatan', 12),
  ('BIO', 'Biologi', 'Peminatan', 13),
  ('GEO', 'Geografi', 'Peminatan', 14),
  ('SEJ', 'Sejarah', 'Peminatan', 15),
  ('SOS', 'Sosiologi', 'Peminatan', 16),
  ('EKO', 'Ekonomi', 'Peminatan', 17);