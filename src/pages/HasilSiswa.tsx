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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>;

  const dibuka = pengaturan?.pengumuman_dibuka || (pengaturan?.tanggal_pengumuman && new Date(pengaturan.tanggal_pengumuman).getTime() <= Date.now());

  if (!siswa) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/50 via-background to-background -z-10 pointer-events-none" />
        <Card className="p-8 max-w-md text-center shadow-md rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h2 className="font-serif text-2xl mb-2">Data Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-6">NISN yang dimasukkan tidak terdaftar.</p>
          <Link to="/"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Button></Link>
        </Card>
      </div>
    );
  }

  if (!dibuka) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/50 via-background to-background -z-10 pointer-events-none" />
        <Card className="p-8 max-w-md text-center shadow-md rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm">
          <h2 className="font-serif text-2xl mb-2">Pengumuman Belum Dibuka</h2>
          <Link to="/" className="mt-4 inline-block"><Button variant="outline">Kembali</Button></Link>
        </Card>
      </div>
    );
  }

  // Tentukan status: prefer status_kelulusan baru, fallback ke status_lulus
  const status: "lulus" | "tunda" | "belum" =
    siswa.status_kelulusan && ["lulus", "tunda", "belum"].includes(siswa.status_kelulusan)
      ? siswa.status_kelulusan
      : siswa.status_lulus ? "lulus" : "belum";

  const borderColor = status === "lulus" ? "border-success" : status === "tunda" ? "border-gold" : "border-destructive";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-8 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/50 via-background to-background -z-10 pointer-events-none" />
      <div className="max-w-2xl mx-auto relative z-10">
        <Link to="/"><Button variant="ghost" className="mb-4 hover:bg-accent/50"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Button></Link>

        <Card className={`p-10 text-center shadow-lg border-x border-b border-border/50 bg-card/90 backdrop-blur-sm rounded-2xl border-t-8 ${borderColor}`}>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Hasil Pengumuman Kelulusan</p>
          <h1 className="font-serif text-3xl md:text-4xl mt-3 mb-2">{siswa.nama}</h1>
          <p className="text-sm text-muted-foreground">NISN: {siswa.nisn} {siswa.kelas && `• Kelas ${siswa.kelas}`}</p>

          <div className="my-8">
            {status === "lulus" && (
              <>
                <CheckCircle2 className="h-20 w-20 text-success mx-auto mb-4" />
                <div className="font-serif text-5xl md:text-6xl text-success font-bold">LULUS</div>
                <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                  Selamat! Anda dinyatakan <strong className="text-success">LULUS</strong> dari {pengaturan?.nama_sekolah}.
                </p>
              </>
            )}
            {status === "tunda" && (
              <>
                <AlertTriangle className="h-20 w-20 text-gold mx-auto mb-4" />
                <div className="font-serif text-5xl md:text-6xl text-gold font-bold">TUNDA</div>
                <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
                  Mohon maaf, kelulusan Anda <strong className="text-gold">DITUNDA</strong> karena masih ada <strong>ujian praktek</strong> yang belum Anda selesaikan.
                </p>

                <div className="mt-6 max-w-lg mx-auto text-left bg-gold/10 border-2 border-gold/50 rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wider text-gold font-bold mb-3 text-center">
                    Mata Pelajaran yang Belum Anda Ujikan
                  </p>
                  {Array.isArray(siswa.mapel_tunda) && siswa.mapel_tunda.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-1.5 text-sm marker:text-gold marker:font-bold">
                      {siswa.mapel_tunda.map((m: string, i: number) => (
                        <li key={i} className="font-semibold text-foreground">{m}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-center text-muted-foreground italic">
                      Detail mapel belum dicantumkan. Silakan hubungi wali kelas Anda.
                    </p>
                  )}
                  {siswa.alasan_tunda && (
                    <div className="mt-4 pt-3 border-t border-gold/30">
                      <p className="text-xs font-semibold text-gold mb-1">Catatan dari Sekolah:</p>
                      <p className="text-sm text-foreground">{siswa.alasan_tunda}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 max-w-lg mx-auto text-left bg-muted/40 rounded-lg p-4 border border-border">
                  <p className="text-sm font-semibold mb-2">Langkah Selanjutnya:</p>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Hubungi <strong>guru mata pelajaran</strong> yang tertera di atas.</li>
                    <li>Lakukan <strong>penjadwalan ulang ujian praktek</strong>.</li>
                    <li>Setelah selesai, status kelulusan akan diperbarui oleh sekolah.</li>
                    <li>Cek kembali halaman ini untuk melihat hasil terbaru.</li>
                  </ol>
                </div>
              </>
            )}
            {status === "belum" && (
              <>
                <XCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
                <div className="font-serif text-5xl md:text-6xl text-destructive font-bold">BELUM LULUS</div>
                <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                  Mohon menghubungi pihak sekolah untuk informasi lebih lanjut.
                </p>
              </>
            )}
          </div>

          {status === "lulus" && (
            <RLink to={`/skl/${siswa.nisn}`}>
              <Button className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-md hover:shadow-lg transition-all h-14 px-8 rounded-xl text-base font-semibold">
                <FileText className="h-5 w-5 mr-2" /> Lihat & Cetak SKL
              </Button>
            </RLink>
          )}
        </Card>
      </div>
    </div>
  );
};

export default HasilSiswa;
