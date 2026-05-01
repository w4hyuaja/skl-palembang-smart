import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Printer } from "lucide-react";
import SKLDocument, { type SKLBentuk } from "@/components/skl/SKLDocument";

const SKLPage = () => {
  const { nisn } = useParams();
  const [data, setData] = useState<any>(null);
  const [pengaturan, setPengaturan] = useState<any>(null);
  const [mapel, setMapel] = useState<any[]>([]);
  const [nilai, setNilai] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("pengaturan").select("*").limit(1).maybeSingle();
      setPengaturan(p);
      const { data: s } = await supabase.from("siswa").select("*").eq("nisn", nisn!).maybeSingle();
      setData(s);
      const { data: mp } = await supabase.from("mata_pelajaran").select("*").eq("aktif", true).order("urutan");
      setMapel(mp || []);
      if (s) {
        const { data: n } = await supabase.from("nilai").select("*").eq("siswa_id", s.id);
        setNilai(n || []);
      }
    })();
  }, [nisn]);

  if (!data || !pengaturan) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  if (!data.status_lulus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p>SKL belum tersedia.</p>
          <Link to="/" className="mt-4 inline-block"><Button variant="outline">Kembali</Button></Link>
        </Card>
      </div>
    );
  }

  // Bentuk SKL ditentukan oleh admin (pengaturan), bukan dipilih siswa
  const bentuk = (pengaturan.bentuk_skl_default as SKLBentuk) || "akhir";

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-5xl mx-auto no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Link to={`/hasil/${nisn}`}><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Button></Link>
          <Button onClick={() => window.print()} className="bg-gradient-hero"><Printer className="h-4 w-4 mr-2" /> Cetak SKL</Button>
        </div>
      </div>
      <div className="skl-print">
        <SKLDocument siswa={data} pengaturan={pengaturan} mapel={mapel} nilai={nilai} bentuk={bentuk} />
      </div>
    </div>
  );
};

export default SKLPage;
