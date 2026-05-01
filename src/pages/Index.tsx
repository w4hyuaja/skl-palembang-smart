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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/50 via-background to-background -z-10 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md overflow-hidden">
              {p?.logo_url ? (
                <img src={p.logo_url} alt="Logo Sekolah" className="h-full w-full object-contain p-1" />
              ) : (
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              )}
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg leading-tight tracking-tight">{p?.nama_sekolah ?? "e-SKL"}</h1>
            </div>
          </div>
          <Link to="/admin/login">
            <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent/50 rounded-full px-4">
              <Lock className="h-4 w-4 mr-2 opacity-70" /> Admin
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 pb-24 md:pt-20 md:pb-32 flex flex-col items-center relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 text-primary font-medium text-sm mb-8 border border-primary/10 shadow-sm">
            <Sparkles className="h-4 w-4" /> {p?.judul_pengumuman ?? "PENGUMUMAN KELULUSAN"}
          </div>
          <h2 className="font-serif font-extrabold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-6 max-w-4xl">
            Sistem Informasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">Kelulusan</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12">
            {p?.pesan_pengumuman ?? "Silakan masukkan Nomor Induk Siswa Nasional (NISN) Anda untuk melihat hasil pengumuman kelulusan dan mengunduh SKL."}
          </p>
        </div>

        {/* Countdown */}
        {!dibuka && p?.tanggal_pengumuman && (
          <Card className="w-full max-w-2xl mx-auto p-8 mb-8 shadow-md border border-border/50 bg-card rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-glow"></div>
            <p className="text-center text-sm font-semibold tracking-wider text-muted-foreground mb-6">PENGUMUMAN DIBUKA DALAM</p>
            <div className="grid grid-cols-4 gap-3 md:gap-4">
              {[
                { v: cd.d, l: "HARI" },
                { v: cd.h, l: "JAM" },
                { v: cd.m, l: "MENIT" },
                { v: cd.s, l: "DETIK" },
              ].map((x) => (
                <div key={x.l} className="bg-background rounded-xl p-4 md:p-6 text-center border border-border/50 shadow-sm">
                  <div className="font-serif text-3xl md:text-5xl font-bold tabular-nums text-primary">{String(x.v).padStart(2, "0")}</div>
                  <div className="text-[10px] md:text-xs font-semibold text-muted-foreground mt-2 tracking-wider">{x.l}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Form NISN */}
        <Card className="w-full max-w-2xl mx-auto p-6 md:p-8 shadow-md border border-border/50 bg-card rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-glow"></div>
          <form onSubmit={cekKelulusan} className="space-y-6">
            <div>
              <label className="text-sm font-semibold mb-2 block text-foreground">Nomor Induk Siswa Nasional (NISN)</label>
              <Input
                placeholder="Contoh: 0012345678"
                value={nisn}
                onChange={(e) => setNisn(e.target.value.replace(/\D/g, ""))}
                maxLength={20}
                inputMode="numeric"
                className="h-14 text-lg rounded-xl bg-background border-border/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <Button type="submit" disabled={loading || !dibuka} className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <Search className="h-5 w-5 mr-2" />
              {dibuka ? (loading ? "Memeriksa..." : "Lihat Hasil Kelulusan") : "Belum Dibuka"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Pastikan NISN sesuai data sekolah. Hubungi panitia jika ada kendala.
            </p>
          </form>
        </Card>

        {/* Cara Cek SKL */}
        <div className="w-full max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 rounded-2xl shadow-sm border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif font-bold text-lg mb-2">1. Masukkan NISN</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ketikkan Nomor Induk Siswa Nasional (NISN) Anda pada kolom pencarian yang tersedia.
            </p>
          </Card>
          
          <Card className="p-6 rounded-2xl shadow-sm border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif font-bold text-lg mb-2">2. Lihat Hasil</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Klik tombol pencarian untuk melihat status kelulusan Anda secara langsung.
            </p>
          </Card>

          <Card className="p-6 rounded-2xl shadow-sm border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <ListChecks className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif font-bold text-lg mb-2">3. Unduh SKL</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Jika dinyatakan lulus, Anda dapat mengunduh dan mencetak Surat Keterangan Lulus.
            </p>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-card text-foreground py-10 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-serif font-bold text-lg">{p?.nama_sekolah ?? "SMA MUHAMMADIYAH 01 PALEMBANG"}</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            {p?.alamat ?? "JL. BALAYUDHA KM. 4,5 NO. 21A PALEMBANG"}
          </p>
          <div className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} • Dibuat oleh TIM Kurikulum
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;
