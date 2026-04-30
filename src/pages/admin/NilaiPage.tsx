import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, Save } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { rataNilai } from "@/lib/skl-utils";

export default function NilaiPage() {
  const [siswa, setSiswa] = useState<any[]>([]);
  const [mapel, setMapel] = useState<any[]>([]);
  const [siswaId, setSiswaId] = useState<string>("");
  const [nilai, setNilai] = useState<Record<string, any>>({}); // mapel_id -> {sem1..6, nilai_akhir}
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("siswa").select("id, nisn, nama, kelas").order("nama");
      const { data: m } = await supabase.from("mata_pelajaran").select("*").eq("aktif", true).order("urutan");
      setSiswa(s || []); setMapel(m || []);
    })();
  }, []);

  useEffect(() => {
    if (!siswaId) { setNilai({}); return; }
    supabase.from("nilai").select("*").eq("siswa_id", siswaId).then(({ data }) => {
      const map: Record<string, any> = {};
      (data || []).forEach((n) => { map[n.mapel_id] = n; });
      setNilai(map);
    });
  }, [siswaId]);

  function setCell(mapelId: string, key: string, val: string) {
    setNilai((prev) => ({ ...prev, [mapelId]: { ...prev[mapelId], [key]: val === "" ? null : Number(val) } }));
  }

  async function simpan() {
    if (!siswaId) return;
    setSaving(true);
    const rows = mapel.map((m) => {
      const n = nilai[m.id] || {};
      return {
        siswa_id: siswaId,
        mapel_id: m.id,
        sem1: n.sem1 ?? null, sem2: n.sem2 ?? null, sem3: n.sem3 ?? null,
        sem4: n.sem4 ?? null, sem5: n.sem5 ?? null, sem6: n.sem6 ?? null,
        nilai_akhir: n.nilai_akhir ?? null,
      };
    });
    const { error } = await supabase.from("nilai").upsert(rows, { onConflict: "siswa_id,mapel_id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Nilai tersimpan");
  }

  function downloadTemplate() {
    const headers = ["nisn", "nama", ...mapel.flatMap((m) => [`${m.kode}_s1`, `${m.kode}_s2`, `${m.kode}_s3`, `${m.kode}_s4`, `${m.kode}_s5`, `${m.kode}_s6`, `${m.kode}_akhir`])];
    const rows = siswa.map((s) => {
      const r: any = { nisn: s.nisn, nama: s.nama };
      mapel.forEach((m) => { r[`${m.kode}_s1`] = ""; r[`${m.kode}_s2`] = ""; r[`${m.kode}_s3`] = ""; r[`${m.kode}_s4`] = ""; r[`${m.kode}_s5`] = ""; r[`${m.kode}_s6`] = ""; r[`${m.kode}_akhir`] = ""; });
      return r;
    });
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nilai");
    XLSX.writeFile(wb, "template-import-nilai.xlsx");
  }

  async function importExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf);
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    if (!rows.length) { toast.error("File kosong"); return; }
    // map nisn -> id
    const sMap = new Map(siswa.map((s) => [String(s.nisn), s.id]));
    const inserts: any[] = [];
    let skipped = 0;
    for (const r of rows) {
      const sid = sMap.get(String(r.nisn).trim());
      if (!sid) { skipped++; continue; }
      for (const m of mapel) {
        const row = {
          siswa_id: sid, mapel_id: m.id,
          sem1: numOrNull(r[`${m.kode}_s1`]),
          sem2: numOrNull(r[`${m.kode}_s2`]),
          sem3: numOrNull(r[`${m.kode}_s3`]),
          sem4: numOrNull(r[`${m.kode}_s4`]),
          sem5: numOrNull(r[`${m.kode}_s5`]),
          sem6: numOrNull(r[`${m.kode}_s6`]),
          nilai_akhir: numOrNull(r[`${m.kode}_akhir`]),
        };
        // skip if all null
        if ([row.sem1,row.sem2,row.sem3,row.sem4,row.sem5,row.sem6,row.nilai_akhir].every((x) => x === null)) continue;
        inserts.push(row);
      }
    }
    if (!inserts.length) { toast.error(`Tidak ada nilai valid (${skipped} NISN tidak ditemukan)`); return; }
    const { error } = await supabase.from("nilai").upsert(inserts, { onConflict: "siswa_id,mapel_id" });
    if (error) return toast.error(error.message);
    toast.success(`${inserts.length} baris nilai diimpor (${skipped} NISN dilewati)`);
    if (fileRef.current) fileRef.current.value = "";
    if (siswaId) {
      const { data } = await supabase.from("nilai").select("*").eq("siswa_id", siswaId);
      const map: Record<string, any> = {};
      (data || []).forEach((n) => { map[n.mapel_id] = n; });
      setNilai(map);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl">Input Nilai</h1>
          <p className="text-muted-foreground">Input manual per siswa atau import Excel massal.</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={importExcel} />
          <Button variant="outline" onClick={downloadTemplate}><Download className="h-4 w-4 mr-2" />Template Nilai</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Import Excel</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <label className="text-sm font-medium">Pilih Siswa:</label>
          <Select value={siswaId} onValueChange={setSiswaId}>
            <SelectTrigger className="w-[360px]"><SelectValue placeholder="-- Pilih siswa --" /></SelectTrigger>
            <SelectContent>
              {siswa.map((s) => <SelectItem key={s.id} value={s.id}>{s.nama} — {s.nisn} {s.kelas && `(${s.kelas})`}</SelectItem>)}
            </SelectContent>
          </Select>
          {siswaId && <Button onClick={simpan} disabled={saving} className="bg-gradient-hero ml-auto"><Save className="h-4 w-4 mr-2" />{saving ? "Menyimpan..." : "Simpan"}</Button>}
        </div>

        {siswaId && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="w-8">#</TableHead><TableHead>Mapel</TableHead>
                {[1,2,3,4,5,6].map((i) => <TableHead key={i} className="w-20">Sm {i}</TableHead>)}
                <TableHead className="w-20">Rata</TableHead>
                <TableHead className="w-24">Nilai Akhir</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {mapel.map((m, idx) => {
                  const n = nilai[m.id] || {};
                  const r = rataNilai(n);
                  return (
                    <TableRow key={m.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell><div className="font-medium">{m.nama}</div><div className="text-xs text-muted-foreground">{m.kode} • {m.kelompok}</div></TableCell>
                      {[1,2,3,4,5,6].map((i) => (
                        <TableCell key={i}>
                          <Input type="number" step="0.01" value={n[`sem${i}`] ?? ""} onChange={(e) => setCell(m.id, `sem${i}`, e.target.value)} className="h-8 text-center" />
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-medium">{r === null ? "-" : r.toFixed(2)}</TableCell>
                      <TableCell><Input type="number" step="0.01" value={n.nilai_akhir ?? ""} onChange={(e) => setCell(m.id, "nilai_akhir", e.target.value)} className="h-8 text-center font-bold" /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

function numOrNull(v: any) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v); return isNaN(n) ? null : n;
}
