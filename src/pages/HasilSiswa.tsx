import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, FileText, XCircle, AlertTriangle } from "lucide-react";
import { Link as RLink } from "react-router-dom";

const HasilSiswa = () => {
  const { nisn } = useParams();
  const [siswa, setSiswa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pengaturan, setPengaturan] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("pengaturan").select("*").limit(1).maybeSingle();
      setPengaturan(p);
      const { data } = await supabase.from("siswa").select("*").eq("nisn", nisn!).maybeSingle();
      setSiswa(data);
      setLoading(false);
    })();
  }, [nisn]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Memuat hasil...</p>
        </div>
      </div>
    );
  }

  const dibuka = pengaturan?.pengumuman_dibuka || (pengaturan?.tanggal_pengumuman && new Date(pengaturan.tanggal_pengumuman).getTime() <= Date.now());

  const PageWrap = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-background relative overflow-x-hidden py-6 sm:py-10 px-4">
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[55vw] h-[55vw] max-w-[450px] max-h-[450px] rounded-full bg-primary-glow/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>
      {children}
    </div>
  );

  if (!siswa) {
    return (
      <PageWrap>
        <div className="max-w-md mx-auto flex items-center justify-center min-h-[80vh]">
          <Card className="p-6 sm:p-8 w-full text-center shadow-xl rounded-2xl border-border/50 bg-card/80 backdrop-blur-md animate-scale-in">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl mb-2 font-bold">Data Tidak Ditemukan</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">NISN yang dimasukkan tidak terdaftar.</p>
            <Link to="/"><Button variant="outline" className="rounded-xl"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Button></Link>
          </Card>
        </div>
      </PageWrap>
    );
  }

  if (!dibuka) {
    return (
      <PageWrap>
        <div className="max-w-md mx-auto flex items-center justify-center min-h-[80vh]">
          <Card className="p-6 sm:p-8 w-full text-center shadow-xl rounded-2xl border-border/50 bg-card/80 backdrop-blur-md animate-scale-in">
            <h2 className="font-serif text-xl sm:text-2xl mb-2 font-bold">Pengumuman Belum Dibuka</h2>
            <p className="text-sm text-muted-foreground mb-6">Silakan kembali pada waktu yang telah ditentukan.</p>
            <Link to="/"><Button variant="outline" className="rounded-xl"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Button></Link>
          </Card>
        </div>
      </PageWrap>
    );
  }

  const status: "lulus" | "tunda" | "belum" =
    siswa.status_kelulusan && ["lulus", "tunda", "belum"].includes(siswa.status_kelulusan)
      ? siswa.status_kelulusan
      : siswa.status_lulus ? "lulus" : "belum";

  const borderColor = status === "lulus" ? "border-success" : status === "tunda" ? "border-gold" : "border-destructive";

  return (
    <PageWrap>
      <div className="max-w-2xl mx-auto relative z-10 animate-fade-in">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4 hover:bg-accent/50 rounded-full">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
        </Link>

        <Card className={`p-6 sm:p-10 text-center shadow-2xl border-x border-b border-border/50 bg-card/90 backdrop-blur-md rounded-2xl border-t-8 ${borderColor} animate-scale-in`}>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            Hasil Pengumuman Kelulusan
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl mt-3 mb-2 font-bold leading-tight break-words">
            {siswa.nama}
          </h1>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
            <span>NISN: <span className="font-mono font-semibold text-foreground/80">{siswa.nisn}</span></span>
            {siswa.kelas && <span>• Kelas {siswa.kelas}</span>}
          </div>

          <div className="my-6 sm:my-8">
            {status === "lulus" && (
              <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
                <div className="h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center animate-pulse-glow">
                  <CheckCircle2 className="h-12 w-12 sm:h-14 sm:w-14 text-success" />
                </div>
                <div className="font-serif text-4xl sm:text-5xl md:text-6xl text-success font-extrabold tracking-tight">LULUS</div>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed px-2">
                  Selamat! Anda dinyatakan <strong className="text-success">LULUS</strong> dari{" "}
                  <span className="font-semibold">{pengaturan?.nama_sekolah}</span>.
                </p>
              </div>
            )}

            {status === "tunda" && (
              <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
                <div className="h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                  <AlertTriangle className="h-12 w-12 sm:h-14 sm:w-14 text-gold" />
                </div>
                <div className="font-serif text-4xl sm:text-5xl md:text-6xl text-gold font-extrabold tracking-tight">TUNDA</div>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed px-2">
                  Mohon maaf, kelulusan Anda <strong className="text-gold">DITUNDA</strong> karena masih ada <strong>ujian praktek</strong> yang belum diselesaikan.
                </p>

                <div className="mt-6 max-w-lg mx-auto text-left bg-gold/5 border-2 border-gold/40 rounded-xl p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gold font-bold mb-3 text-center">
                    Mata Pelajaran yang Belum Diujikan
                  </p>
                  {Array.isArray(siswa.mapel_tunda) && siswa.mapel_tunda.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-1.5 text-sm marker:text-gold marker:font-bold">
                      {siswa.mapel_tunda.map((m: string, i: number) => (
                        <li key={i} className="font-semibold text-foreground break-words">{m}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-xs sm:text-sm text-center text-muted-foreground italic">
                      Detail mapel belum dicantumkan. Silakan hubungi wali kelas Anda.
                    </p>
                  )}
                  {siswa.alasan_tunda && (
                    <div className="mt-4 pt-3 border-t border-gold/30">
                      <p className="text-[11px] sm:text-xs font-semibold text-gold mb-1">Catatan dari Sekolah:</p>
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed">{siswa.alasan_tunda}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 max-w-lg mx-auto text-left bg-muted/40 rounded-xl p-4 border border-border animate-fade-in" style={{ animationDelay: "0.5s" }}>
                  <p className="text-xs sm:text-sm font-semibold mb-2">Langkah Selanjutnya:</p>
                  <ol className="list-decimal list-inside text-xs sm:text-sm text-muted-foreground space-y-1 leading-relaxed">
                    <li>Hubungi <strong>guru mata pelajaran</strong> yang tertera di atas.</li>
                    <li>Lakukan <strong>penjadwalan ulang ujian praktek</strong>.</li>
                    <li>Status akan diperbarui setelah ujian selesai.</li>
                    <li>Cek kembali halaman ini untuk hasil terbaru.</li>
                  </ol>
                </div>
              </div>
            )}

            {status === "belum" && (
              <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
                <div className="h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-12 w-12 sm:h-14 sm:w-14 text-destructive" />
                </div>
                <div className="font-serif text-3xl sm:text-5xl md:text-6xl text-destructive font-extrabold tracking-tight">BELUM LULUS</div>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed px-2">
                  Mohon menghubungi pihak sekolah untuk informasi lebih lanjut.
                </p>
              </div>
            )}
          </div>

          {status === "lulus" && (
            <RLink to={`/skl/${siswa.nisn}`}>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 h-12 sm:h-14 px-6 sm:px-8 rounded-xl text-sm sm:text-base font-semibold">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Lihat & Cetak SKL
              </Button>
            </RLink>
          )}
        </Card>
      </div>
    </PageWrap>
  );
};

export default HasilSiswa;
