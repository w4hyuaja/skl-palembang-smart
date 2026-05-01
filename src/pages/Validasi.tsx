import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { formatTanggalID } from "@/lib/skl-utils";

const Validasi = () => {
  const { nisn } = useParams();
  const [siswa, setSiswa] = useState<any>(null);
  const [pengaturan, setPengaturan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Validasi Keaslian SKL";
    (async () => {
      const { data: p } = await supabase.from("pengaturan").select("*").limit(1).maybeSingle();
      setPengaturan(p);
      const { data } = await supabase.from("siswa").select("*").eq("nisn", nisn!).maybeSingle();
      setSiswa(data);
      setLoading(false);
    })();
  }, [nisn]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  const status: "lulus" | "tunda" | "belum" | "none" = !siswa
    ? "none"
    : (siswa.status_kelulusan && ["lulus", "tunda", "belum"].includes(siswa.status_kelulusan))
      ? siswa.status_kelulusan
      : (siswa.status_lulus ? "lulus" : "belum");

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 shadow-elegant text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
          <ShieldCheck className="h-4 w-4" /> HALAMAN VALIDASI RESMI
        </div>
        {status === "lulus" && (
          <>
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-3" />
            <h1 className="font-serif text-2xl mb-2">SKL Asli & Terverifikasi</h1>
            <p className="text-muted-foreground mb-6 text-sm">Surat Keterangan Lulus atas nama berikut tercatat sah dalam basis data {pengaturan?.nama_sekolah}.</p>
            <div className="text-left bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
              <Row k="Nama" v={siswa.nama} bold />
              <Row k="NISN" v={siswa.nisn} />
              <Row k="Kelas / Jurusan" v={`${siswa.kelas || "-"} / ${siswa.jurusan || "-"}`} />
              <Row k="Tanggal Lulus" v={formatTanggalID(siswa.tanggal_lulus)} />
              <Row k="Status" v="LULUS" />
            </div>
          </>
        )}
        {status === "tunda" && (
          <>
            <XCircle className="h-16 w-16 text-gold mx-auto mb-3" />
            <h1 className="font-serif text-2xl mb-2">Status: TUNDA</h1>
            <p className="text-muted-foreground text-sm mb-4">Siswa berikut tercatat dalam basis data namun kelulusannya ditunda.</p>
            <div className="text-left bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
              <Row k="Nama" v={siswa.nama} bold />
              <Row k="NISN" v={siswa.nisn} />
              <Row k="Status" v="TUNDA" />
              {Array.isArray(siswa.mapel_tunda) && siswa.mapel_tunda.length > 0 && (
                <Row k="Mapel Tunda" v={siswa.mapel_tunda.join(", ")} />
              )}
            </div>
          </>
        )}
        {(status === "belum" || status === "none") && (
          <>
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-3" />
            <h1 className="font-serif text-2xl mb-2">SKL Tidak Ditemukan</h1>
            <p className="text-muted-foreground text-sm">Data dengan NISN tersebut tidak ada atau status kelulusan belum dikonfirmasi.</p>
          </>
        )}
        <p className="text-xs text-muted-foreground mt-6">{pengaturan?.nama_sekolah} • NPSN {pengaturan?.npsn}</p>
      </Card>
    </div>
  );
};

const Row = ({ k, v, bold }: { k: string; v: string; bold?: boolean }) => (
  <div className="flex justify-between gap-3">
    <span className="text-muted-foreground">{k}</span>
    <span className={bold ? "font-semibold" : ""}>{v}</span>
  </div>
);

export default Validasi;
