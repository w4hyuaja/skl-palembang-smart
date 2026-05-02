import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GraduationCap, Lock, Search, Sparkles, ListChecks, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-primary-glow/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {p?.logo_url ? (
              <img src={p.logo_url} alt="Logo Sekolah" loading="lazy" decoding="async" className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 object-contain" />
            ) : (
              <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-primary flex items-center justify-center shadow-md ring-2 ring-primary/20">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-sm sm:text-base leading-tight tracking-tight truncate">
                {p?.nama_sekolah ?? "e-SKL"}
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Sistem Pengumuman Kelulusan</p>
            </div>
          </div>
          <Link to="/admin/login" className="shrink-0">
            <Button variant="ghost" size="sm" className="h-9 rounded-full px-3 sm:px-4 text-xs sm:text-sm hover:bg-accent/60">
              <Lock className="h-3.5 w-3.5 sm:mr-2 opacity-70" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-8 pb-16 sm:pt-14 sm:pb-24 md:pt-20 md:pb-32 flex flex-col items-center">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-accent/60 text-primary font-medium text-xs sm:text-sm mb-5 sm:mb-8 border border-primary/15 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate">{p?.judul_pengumuman ?? "PENGUMUMAN KELULUSAN"}</span>
          </div>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-4 sm:mb-6 px-2">
            Sistem Informasi{" "}
            <span className="text-gradient inline-block">Kelulusan</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-2">
            {p?.pesan_pengumuman ?? "Masukkan Nomor Induk Siswa Nasional (NISN) Anda untuk melihat hasil pengumuman dan mengunduh SKL."}
          </p>
        </div>

        {/* Countdown */}
        {!dibuka && p?.tanggal_pengumuman && (
          <Card className="w-full max-w-2xl p-5 sm:p-8 mb-6 sm:mb-8 shadow-lg border border-border/50 bg-card/80 backdrop-blur-md rounded-2xl relative overflow-hidden animate-scale-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-glow to-primary" />
            <p className="text-center text-[11px] sm:text-sm font-semibold tracking-[0.2em] text-muted-foreground mb-4 sm:mb-6">
              PENGUMUMAN DIBUKA DALAM
            </p>
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {[
                { v: cd.d, l: "HARI" },
                { v: cd.h, l: "JAM" },
                { v: cd.m, l: "MENIT" },
                { v: cd.s, l: "DETIK" },
              ].map((x) => (
                <div key={x.l} className="bg-gradient-to-br from-background to-accent/30 rounded-xl p-2.5 sm:p-5 text-center border border-border/60 shadow-sm transition-transform hover:scale-105">
                  <div className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tabular-nums text-primary leading-none">
                    {String(x.v).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] sm:text-xs font-semibold text-muted-foreground mt-1.5 sm:mt-2 tracking-widest">
                    {x.l}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Form NISN */}
        <Card className="w-full max-w-2xl p-5 sm:p-8 shadow-xl border border-border/50 bg-card/80 backdrop-blur-md rounded-2xl relative overflow-hidden animate-scale-in" style={{ animationDelay: "0.15s" }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-glow" />
          <form onSubmit={cekKelulusan} className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="nisn-input" className="text-sm font-semibold mb-2 block">
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="nisn-input"
                  placeholder="Contoh: 0012345678"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value.replace(/\D/g, ""))}
                  maxLength={20}
                  inputMode="numeric"
                  autoComplete="off"
                  className="h-12 sm:h-14 pl-11 sm:pl-12 text-base sm:text-lg rounded-xl bg-background/80 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30 transition-all"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || !dibuka}
              className={`w-full h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 ${dibuka ? "animate-pulse-glow" : ""}`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 sm:h-5 sm:w-5 mr-2 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Memeriksa...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {dibuka ? "Lihat Hasil Kelulusan" : "Belum Dibuka"}
                </>
              )}
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
              Pastikan NISN sesuai data sekolah. Hubungi panitia jika ada kendala.
            </p>
          </form>
        </Card>

        {/* Cara Cek SKL */}
        <section className="w-full max-w-5xl mx-auto mt-14 sm:mt-20">
          <div className="text-center mb-8 sm:mb-10 animate-fade-in">
            <h3 className="font-serif font-bold text-2xl sm:text-3xl mb-2">Cara Cek SKL</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Tiga langkah mudah untuk mengetahui hasil kelulusan</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 stagger">
            {[
              { icon: Search, title: "Masukkan NISN", desc: "Ketikkan Nomor Induk Siswa Nasional (NISN) Anda pada kolom pencarian." },
              { icon: Sparkles, title: "Lihat Hasil", desc: "Klik tombol pencarian untuk melihat status kelulusan secara langsung." },
              { icon: ListChecks, title: "Unduh SKL", desc: "Jika lulus, Anda dapat mengunduh dan mencetak Surat Keterangan Lulus." },
            ].map((step, i) => (
              <Card key={i} className="group p-5 sm:p-6 rounded-2xl shadow-sm border border-border/50 bg-card/60 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start gap-4 sm:block">
                  <div className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center sm:mb-4 group-hover:bg-primary/15 group-hover:scale-110 transition-all">
                    <step.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                      <span className="text-primary mr-1.5">{i + 1}.</span>{step.title}
                    </h4>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Verifikasi badge */}
        <div className="mt-12 sm:mt-16 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/40 border border-border/50 text-xs sm:text-sm text-muted-foreground animate-fade-in">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Setiap SKL dilengkapi QR Code untuk verifikasi keaslian</span>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-card/60 backdrop-blur-sm py-8 sm:py-10 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-3 sm:mb-4">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="font-serif font-bold text-sm sm:text-lg">{p?.nama_sekolah ?? "SMA MUHAMMADIYAH 01 PALEMBANG"}</span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto mb-5 sm:mb-6 px-4 leading-relaxed">
            {p?.alamat ?? "JL. BALAYUDHA KM. 4,5 NO. 21A PALEMBANG"}
          </p>
          <div className="text-[11px] sm:text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} • Dibuat oleh <span className="font-semibold text-foreground/80">TIM Kurikulum</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
