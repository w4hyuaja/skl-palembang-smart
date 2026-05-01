import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Upload, Download, Trash2, Edit, CheckCircle2, XCircle, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type Status = "lulus" | "tunda" | "belum";

export default function SiswaPage() {
  const [list, setList] = useState<any[]>([]);
  const [mapelList, setMapelList] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [edit, setEdit] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data } = await supabase.from("siswa").select("*").order("nama");
    setList(data || []);
    const { data: mp } = await supabase.from("mata_pelajaran").select("nama").eq("aktif", true).order("urutan");
    setMapelList(mp || []);
  }
  useEffect(() => { load(); }, []);

  const filtered = list.filter((s) =>
    !filter || s.nama.toLowerCase().includes(filter.toLowerCase()) || s.nisn.includes(filter) || (s.kelas || "").toLowerCase().includes(filter.toLowerCase())
  );

  function statusOf(s: any): Status {
    if (s.status_kelulusan && ["lulus", "tunda", "belum"].includes(s.status_kelulusan)) return s.status_kelulusan;
    return s.status_lulus ? "lulus" : "belum";
  }

  async function save() {
    if (!edit?.nama || !edit?.nisn) { toast.error("Nama & NISN wajib diisi."); return; }
    const payload: any = { ...edit };
    delete payload.created_at; delete payload.updated_at;
    // Sinkronkan status_lulus boolean dari status_kelulusan
    payload.status_lulus = payload.status_kelulusan === "lulus";
    if (payload.status_kelulusan === "lulus" && !payload.tanggal_lulus) {
      payload.tanggal_lulus = new Date().toISOString().slice(0, 10);
    }
    const { error } = edit.id
      ? await supabase.from("siswa").update(payload).eq("id", edit.id)
      : await supabase.from("siswa").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    setOpen(false); setEdit(null); load();
  }

  async function hapus(id: string) {
    const { error } = await supabase.from("siswa").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus"); load();
  }

  async function setStatus(s: any, newStatus: Status) {
    const patch: any = {
      status_kelulusan: newStatus,
      status_lulus: newStatus === "lulus",
    };
    if (newStatus === "lulus" && !s.tanggal_lulus) patch.tanggal_lulus = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("siswa").update(patch).eq("id", s.id);
    if (error) return toast.error(error.message);
    load();
  }

  async function massal(newStatus: Status) {
    const ids = filtered.map((s) => s.id);
    if (!ids.length) return;
    const patch: any = { status_kelulusan: newStatus, status_lulus: newStatus === "lulus" };
    if (newStatus === "lulus") patch.tanggal_lulus = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("siswa").update(patch).in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`${ids.length} siswa diatur menjadi ${newStatus.toUpperCase()}`);
    load();
  }

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([{
      nisn: "0012345678", nis: "1234", nama: "Contoh Nama", tempat_lahir: "Palembang",
      tanggal_lahir: "2007-05-12", jenis_kelamin: "L", kelas: "XII IPA 1", jurusan: "IPA",
      nama_orang_tua: "Nama Ortu", no_peserta_ujian: "", no_seri_ijazah: "",
      status_kelulusan: "belum", mapel_tunda: "", alasan_tunda: "",
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Siswa");
    XLSX.writeFile(wb, "template-import-siswa.xlsx");
  }

  async function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf);
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    if (!rows.length) { toast.error("File kosong"); return; }
    const cleaned = rows.map((r) => {
      const status = String(r.status_kelulusan || r.STATUS || "belum").toLowerCase().trim();
      const validStatus: Status = ["lulus", "tunda", "belum"].includes(status) ? (status as Status) : "belum";
      const mapelStr = String(r.mapel_tunda || r["MAPEL TUNDA"] || "").trim();
      const mapelArr = mapelStr ? mapelStr.split(/[;,|]/).map((x) => x.trim()).filter(Boolean) : [];
      return {
        nisn: String(r.nisn ?? r.NISN ?? "").trim(),
        nis: String(r.nis ?? r.NIS ?? "").trim() || null,
        nama: String(r.nama ?? r.NAMA ?? "").trim(),
        tempat_lahir: r.tempat_lahir || r["TEMPAT LAHIR"] || null,
        tanggal_lahir: r.tanggal_lahir || r["TANGGAL LAHIR"] || null,
        jenis_kelamin: r.jenis_kelamin || r["JENIS KELAMIN"] || null,
        kelas: r.kelas || r.KELAS || null,
        jurusan: r.jurusan || r.JURUSAN || null,
        nama_orang_tua: r.nama_orang_tua || r["NAMA ORANG TUA"] || null,
        no_peserta_ujian: r.no_peserta_ujian || null,
        no_seri_ijazah: r.no_seri_ijazah || null,
        status_kelulusan: validStatus,
        status_lulus: validStatus === "lulus",
        mapel_tunda: mapelArr,
        alasan_tunda: r.alasan_tunda || r["ALASAN TUNDA"] || "",
      };
    }).filter((r) => r.nisn && r.nama);
    const { error } = await supabase.from("siswa").upsert(cleaned, { onConflict: "nisn" });
    if (error) return toast.error(error.message);
    toast.success(`${cleaned.length} siswa diimpor / diperbarui`);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  function toggleMapelTunda(nama: string) {
    const arr: string[] = Array.isArray(edit?.mapel_tunda) ? edit.mapel_tunda : [];
    const next = arr.includes(nama) ? arr.filter((x) => x !== nama) : [...arr, nama];
    setEdit({ ...edit, mapel_tunda: next });
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl">Data Siswa</h1>
          <p className="text-muted-foreground">{list.length} siswa terdaftar.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={importFile} />
          <Button variant="outline" onClick={downloadTemplate}><Download className="h-4 w-4 mr-2" /> Template</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> Import Excel</Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEdit(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEdit({ status_kelulusan: "belum", mapel_tunda: [] })} className="bg-gradient-hero"><Plus className="h-4 w-4 mr-2" /> Tambah Siswa</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{edit?.id ? "Edit" : "Tambah"} Siswa</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <Field label="NISN *" v={edit?.nisn} on={(v) => setEdit({ ...edit, nisn: v })} />
                <Field label="NIS" v={edit?.nis} on={(v) => setEdit({ ...edit, nis: v })} />
                <Field label="Nama Lengkap *" v={edit?.nama} on={(v) => setEdit({ ...edit, nama: v })} className="col-span-2" />
                <Field label="Tempat Lahir" v={edit?.tempat_lahir} on={(v) => setEdit({ ...edit, tempat_lahir: v })} />
                <Field label="Tanggal Lahir" type="date" v={edit?.tanggal_lahir} on={(v) => setEdit({ ...edit, tanggal_lahir: v })} />
                <Field label="Jenis Kelamin (L/P)" v={edit?.jenis_kelamin} on={(v) => setEdit({ ...edit, jenis_kelamin: v })} />
                <Field label="Kelas" v={edit?.kelas} on={(v) => setEdit({ ...edit, kelas: v })} />
                <Field label="Jurusan" v={edit?.jurusan} on={(v) => setEdit({ ...edit, jurusan: v })} />
                <Field label="Nama Orang Tua" v={edit?.nama_orang_tua} on={(v) => setEdit({ ...edit, nama_orang_tua: v })} />
                <Field label="No. Peserta Ujian" v={edit?.no_peserta_ujian} on={(v) => setEdit({ ...edit, no_peserta_ujian: v })} />
                <Field label="No. Seri Ijazah" v={edit?.no_seri_ijazah} on={(v) => setEdit({ ...edit, no_seri_ijazah: v })} />

                <div className="col-span-2 border-t pt-3 mt-2">
                  <label className="text-sm font-medium">Status Kelulusan</label>
                  <Select value={edit?.status_kelulusan ?? "belum"} onValueChange={(v) => setEdit({ ...edit, status_kelulusan: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lulus">LULUS</SelectItem>
                      <SelectItem value="tunda">TUNDA (belum ujian praktek)</SelectItem>
                      <SelectItem value="belum">Belum Lulus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {edit?.status_kelulusan === "tunda" && (
                  <>
                    <div className="col-span-2">
                      <label className="text-sm font-medium block mb-1">Mata Pelajaran yang Ditunda (belum ujian praktek)</label>
                      <p className="text-xs text-muted-foreground mb-2">Centang satu atau lebih mapel.</p>
                      <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-48 overflow-y-auto bg-muted/30">
                        {mapelList.map((m) => {
                          const checked = Array.isArray(edit?.mapel_tunda) && edit.mapel_tunda.includes(m.nama);
                          return (
                            <label key={m.nama} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={checked} onChange={() => toggleMapelTunda(m.nama)} />
                              <span>{m.nama}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium">Alasan / Catatan Tunda (opsional)</label>
                      <Textarea value={edit?.alasan_tunda ?? ""} onChange={(e) => setEdit({ ...edit, alasan_tunda: e.target.value })} rows={2} />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter><Button onClick={save} className="bg-gradient-hero">Simpan</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari nama / NISN / kelas..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-9" />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline" className="text-success border-success"><CheckCircle2 className="h-4 w-4 mr-2" />Luluskan Semua ({filtered.length})</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Luluskan {filtered.length} siswa?</AlertDialogTitle><AlertDialogDescription>Status seluruh siswa yang ditampilkan akan diset menjadi LULUS.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => massal("lulus")}>Ya, Luluskan</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={() => massal("tunda")} className="text-gold border-gold/60"><AlertTriangle className="h-4 w-4 mr-2" />Tunda Semua</Button>
          <Button variant="outline" onClick={() => massal("belum")}><XCircle className="h-4 w-4 mr-2" />Reset Belum</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NISN</TableHead><TableHead>Nama</TableHead><TableHead>Kelas</TableHead><TableHead>Jurusan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const st = statusOf(s);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.nisn}</TableCell>
                    <TableCell className="font-medium">{s.nama}</TableCell>
                    <TableCell>{s.kelas || "-"}</TableCell>
                    <TableCell>{s.jurusan || "-"}</TableCell>
                    <TableCell>
                      <Select value={st} onValueChange={(v) => setStatus(s, v as Status)}>
                        <SelectTrigger className={`h-7 w-32 text-xs ${st === "lulus" ? "bg-success/15 text-success border-success/30" : st === "tunda" ? "bg-gold/15 text-gold border-gold/40" : "bg-muted text-muted-foreground"}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lulus">LULUS</SelectItem>
                          <SelectItem value="tunda">TUNDA</SelectItem>
                          <SelectItem value="belum">Belum</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => { setEdit({ ...s, mapel_tunda: s.mapel_tunda || [] }); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Hapus {s.nama}?</AlertDialogTitle><AlertDialogDescription>Data nilai juga akan ikut terhapus.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => hapus(s.id)}>Hapus</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada data.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, v, on, type = "text", className = "" }: any) {
  return (
    <div className={className}>
      <label className="text-sm font-medium">{label}</label>
      <Input type={type} value={v ?? ""} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
