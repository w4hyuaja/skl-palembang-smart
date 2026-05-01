import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GraduationCap, Lock, Search, Sparkles, ListChecks } from "lucide-react";
import { toast } from "sonner";

interface Pengaturan {
  nama_sekolah: string;
  npsn: string;
  alamat: string;
  kepala_sekolah: string;
  tahun_pelajaran: string | null;
  tanggal_pengumuman: string | null;
  pengumuman_dibuka: boolean;
  judul_pengumuman: string | null;
  pesan_pengumuman: string | null;
  logo_url?: string | null;
}

function useCountdown(target?: string | null) {
  const [diff, setDiff] = useState<number>(0);
  useEffect(() => {
    if (!target) return;
    const t = new Date(target).getTime();
    const tick = () => setDiff(Math.max(0, t - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s, done: diff === 0 };
}

const Index = () => {
  const [p, setP] = useState<Pengaturan | null>(null);
  const [nisn, setNisn] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Pengumuman Kelulusan — SMA Muhammadiyah 01 Palembang";
    supabase.from("pengaturan").select("*").limit(1).maybeSingle().then(({ data }) => setP(data as any));
  }, []);

  const cd = useCountdown(p?.tanggal_pengumuman);
  const dibuka = p?.pengumuman_dibuka || (p?.tanggal_pengumuman && cd.done);

  async function cekKelulusan(e: React.FormEvent) {
    e.preventDefault();
    if (!nisn.trim()) return;
    if (!dibuka) {
      toast.error("Pengumuman belum dibuka.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("siswa")
      .select("id, nisn, nama, status_lulus")
      .eq("nisn", nisn.trim())
      .maybeSingle();
    setLoading(false);
    if (error || !data) {
      toast.error("NISN tidak ditemukan.");
      return;
    }
    navigate(`/hasil/${data.nisn}`);
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gold flex items-center justify-center shadow-gold">
              <GraduationCap className="h-7 w-7 text-gold-foreground" />
            </div>
            <div>
              <h1 className="font-serif text-lg md:text-xl leading-tight">{p?.nama_sekolah ?? "SMA MUHAMMADIYAH 01 PALEMBANG"}</h1>
              <p className="text-xs opacity-80">NPSN {p?.npsn ?? "10604065"} • {p?.tahun_pelajaran ?? "—"}</p>
            </div>
          </div>
          <Link to="/admin/login">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-glow">
              <Lock className="h-4 w-4 mr-2" /> Admin
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" /> {p?.judul_pengumuman ?? "PENGUMUMAN KELULUSAN"}
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground leading-tight mb-3">
            Pengumuman Kelulusan <span className="text-gradient-gold">Tahun {p?.tahun_pelajaran ?? ""}</span>
          </h2>
          <p className="text-muted-foreground text-lg">{p?.pesan_pengumuman ?? "Silakan masukkan NISN untuk melihat hasil kelulusan."}</p>
        </div>

        {/* Countdown */}
        {!dibuka && p?.tanggal_pengumuman && (
          <Card className="max-w-3xl mx-auto p-8 mb-8 shadow-elegant border-2 border-gold/30 bg-gradient-to-br from-card to-accent/30">
            <p className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-4">Pengumuman dibuka dalam</p>
            <div className="grid grid-cols-4 gap-3 md:gap-4">
              {[
                { v: cd.d, l: "Hari" },
                { v: cd.h, l: "Jam" },
                { v: cd.m, l: "Menit" },
                { v: cd.s, l: "Detik" },
              ].map((x) => (
                <div key={x.l} className="bg-gradient-hero text-primary-foreground rounded-xl p-4 md:p-6 text-center shadow-elegant animate-pulse-soft">
                  <div className="font-serif text-3xl md:text-5xl font-bold tabular-nums">{String(x.v).padStart(2, "0")}</div>
                  <div className="text-xs md:text-sm opacity-80 mt-1">{x.l}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Form NISN */}
        <Card className="max-w-xl mx-auto p-8 shadow-elegant">
          <form onSubmit={cekKelulusan} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nomor Induk Siswa Nasional (NISN)</label>
              <Input
                placeholder="Contoh: 0012345678"
                value={nisn}
                onChange={(e) => setNisn(e.target.value.replace(/\D/g, ""))}
                maxLength={20}
                inputMode="numeric"
                className="h-12 text-lg"
              />
            </div>
            <Button type="submit" disabled={loading || !dibuka} className="w-full h-12 text-base bg-gradient-hero hover:opacity-95">
              <Search className="h-5 w-5 mr-2" />
              {dibuka ? (loading ? "Memeriksa..." : "Lihat Hasil Kelulusan") : "Belum Dibuka"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Pastikan NISN sesuai data sekolah. Hubungi panitia jika ada kendala.
            </p>
          </form>
        </Card>
      </main>

      <footer className="bg-primary text-primary-foreground/90 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm">
          <p className="font-serif text-base mb-1">{p?.nama_sekolah ?? "SMA MUHAMMADIYAH 01 PALEMBANG"}</p>
          <p className="opacity-80">{p?.alamat ?? "JL. BALAYUDHA KM. 4,5 NO. 21A PALEMBANG"}</p>
          <p className="opacity-60 mt-3 text-xs">© {new Date().getFullYear()} • Sistem SKL Digital</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
