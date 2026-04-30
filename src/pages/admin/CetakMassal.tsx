import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, FileText } from "lucide-react";
import SKLDocument, { type SKLBentuk } from "@/components/skl/SKLDocument";

export default function CetakMassal() {
  const [siswa, setSiswa] = useState<any[]>([]);
  const [mapel, setMapel] = useState<any[]>([]);
  const [pengaturan, setPengaturan] = useState<any>(null);
  const [nilaiAll, setNilaiAll] = useState<Record<string, any[]>>({});
  const [bentuk, setBentuk] = useState<SKLBentuk>("akhir");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterKelas, setFilterKelas] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("pengaturan").select("*").limit(1).maybeSingle();
      const { data: s } = await supabase.from("siswa").select("*").eq("status_lulus", true).order("nama");
      const { data: m } = await supabase.from("mata_pelajaran").select("*").eq("aktif", true).order("urutan");
      const { data: n } = await supabase.from("nilai").select("*");
      setPengaturan(p); setSiswa(s || []); setMapel(m || []);
      const map: Record<string, any[]> = {};
      (n || []).forEach((row) => { (map[row.siswa_id] ||= []).push(row); });
      setNilaiAll(map);
    })();
  }, []);

  const kelasList = Array.from(new Set(siswa.map((s) => s.kelas).filter(Boolean))).sort();
  const filtered = siswa.filter((s) => filterKelas === "all" || s.kelas === filterKelas);

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.id)));
  }

  function toggle(id: string) {
    const ns = new Set(selected);
    ns.has(id) ? ns.delete(id) : ns.add(id);
    setSelected(ns);
  }

  const cetakList = filtered.filter((s) => selected.has(s.id));

  return (
    <div className="p-8 space-y-6">
      <div className="no-print">
        <h1 className="font-serif text-3xl">Cetak SKL Massal</h1>
        <p className="text-muted-foreground">Pilih siswa & bentuk SKL, lalu cetak dalam satu klik.</p>
      </div>

      <Card className="p-6 no-print space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Bentuk SKL</label>
            <Select value={bentuk} onValueChange={(v) => setBentuk(v as SKLBentuk)}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="akhir">SKL Nilai Akhir</SelectItem>
                <SelectItem value="rata">SKL Rata Semester</SelectItem>
                <SelectItem value="tanpa">SKL Tanpa Nilai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Filter Kelas</label>
            <Select value={filterKelas} onValueChange={setFilterKelas}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua kelas</SelectItem>
                {kelasList.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={toggleAll}>{selected.size === filtered.length && filtered.length > 0 ? "Batal Pilih" : "Pilih Semua"}</Button>
            <Button onClick={() => window.print()} disabled={cetakList.length === 0} className="bg-gradient-hero">
              <Printer className="h-4 w-4 mr-2" /> Cetak {cetakList.length} SKL
            </Button>
          </div>
        </div>

        <div className="border rounded-md max-h-[400px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0"><tr><th className="p-2 text-left w-10"></th><th className="p-2 text-left">Nama</th><th className="p-2 text-left">NISN</th><th className="p-2 text-left">Kelas</th></tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t hover:bg-muted/50">
                  <td className="p-2"><Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} /></td>
                  <td className="p-2 font-medium">{s.nama}</td>
                  <td className="p-2 font-mono text-xs">{s.nisn}</td>
                  <td className="p-2">{s.kelas || "-"}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="text-center text-muted-foreground p-6">Belum ada siswa lulus.</td></tr>}
            </tbody>
          </table>
        </div>
        {cetakList.length > 0 && (
          <p className="text-sm text-muted-foreground"><FileText className="h-4 w-4 inline mr-1" />{cetakList.length} SKL siap dicetak. Tekan Cetak — gunakan dialog browser untuk simpan PDF atau cetak langsung.</p>
        )}
      </Card>

      {pengaturan && (
        <div className="skl-print space-y-6">
          {cetakList.map((s, i) => (
            <div key={s.id} className={i < cetakList.length - 1 ? "page-break" : ""}>
              <SKLDocument siswa={s} pengaturan={pengaturan} mapel={mapel} nilai={nilaiAll[s.id] || []} bentuk={bentuk} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
