import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, CheckCircle2, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ siswa: 0, lulus: 0, mapel: 0 });
  const [pengaturan, setPengaturan] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const [{ count: s }, { count: l }, { count: m }, { data: p }] = await Promise.all([
        supabase.from("siswa").select("id", { count: "exact", head: true }),
        supabase.from("siswa").select("id", { count: "exact", head: true }).eq("status_lulus", true),
        supabase.from("mata_pelajaran").select("id", { count: "exact", head: true }),
        supabase.from("pengaturan").select("*").limit(1).maybeSingle(),
      ]);
      setStats({ siswa: s ?? 0, lulus: l ?? 0, mapel: m ?? 0 });
      setPengaturan(p);
    })();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan sistem SKL.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Siswa" value={stats.siswa} />
        <StatCard icon={CheckCircle2} label="Dinyatakan Lulus" value={stats.lulus} accent="success" />
        <StatCard icon={BookOpen} label="Mata Pelajaran" value={stats.mapel} />
      </div>
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="font-serif text-lg">Pengumuman</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Status:{" "}
              {pengaturan?.pengumuman_dibuka ? (
                <span className="text-success font-medium">Dibuka</span>
              ) : (
                <span className="text-warning font-medium">Belum dibuka</span>
              )}
              {pengaturan?.tanggal_pengumuman && (
                <> • Jadwal: {new Date(pengaturan.tanggal_pengumuman).toLocaleString("id-ID")}</>
              )}
            </p>
            <Link to="/admin/pengaturan" className="text-sm text-primary hover:underline mt-2 inline-block">Atur jadwal & status →</Link>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-serif text-lg mb-3">Akses Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/admin/siswa" className="p-4 border rounded-md hover:bg-accent transition text-sm">+ Tambah Siswa / Import Excel</Link>
          <Link to="/admin/nilai" className="p-4 border rounded-md hover:bg-accent transition text-sm">Input Nilai</Link>
          <Link to="/admin/cetak" className="p-4 border rounded-md hover:bg-accent transition text-sm">Cetak Massal SKL</Link>
          <Link to="/admin/mapel" className="p-4 border rounded-md hover:bg-accent transition text-sm">Kelola Mapel</Link>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: any) {
  return (
    <Card className="p-6 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${accent === "success" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}
