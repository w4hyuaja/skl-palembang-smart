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
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center shadow-elegant">
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
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center shadow-elegant">
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
    <div className="min-h-screen bg-gradient-soft py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/"><Button variant="ghost" className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Button></Link>

        <Card className={`p-10 text-center shadow-elegant border-t-8 ${borderColor}`}>
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
                <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                  Kelulusan Anda <strong className="text-gold">DITUNDA</strong> karena belum menyelesaikan ujian praktek pada mata pelajaran berikut:
                </p>
                {Array.isArray(siswa.mapel_tunda) && siswa.mapel_tunda.length > 0 && (
                  <div className="mt-4 inline-block text-left bg-gold/10 border border-gold/40 rounded-lg p-4">
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {siswa.mapel_tunda.map((m: string, i: number) => <li key={i} className="font-medium">{m}</li>)}
                    </ul>
                  </div>
                )}
                {siswa.alasan_tunda && (
                  <p className="text-xs text-muted-foreground mt-3 max-w-md mx-auto">{siswa.alasan_tunda}</p>
                )}
                <p className="text-sm text-muted-foreground mt-4">Segera hubungi guru mata pelajaran terkait untuk penjadwalan ulang.</p>
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
              <Button className="bg-gradient-hero hover:opacity-95 h-12 px-6">
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
