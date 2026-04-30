import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Upload, Download, Trash2, Edit, CheckCircle2, XCircle, Search } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function SiswaPage() {
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [edit, setEdit] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data } = await supabase.from("siswa").select("*").order("nama");
    setList(data || []);
  }
  useEffect(() => { load(); }, []);

  const filtered = list.filter((s) =>
    !filter || s.nama.toLowerCase().includes(filter.toLowerCase()) || s.nisn.includes(filter) || (s.kelas || "").toLowerCase().includes(filter.toLowerCase())
  );

  async function save() {
    if (!edit?.nama || !edit?.nisn) { toast.error("Nama & NISN wajib diisi."); return; }
    const payload = { ...edit };
    delete payload.created_at; delete payload.updated_at;
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

  async function toggleLulus(s: any, val: boolean) {
    const patch: any = { status_lulus: val };
    if (val && !s.tanggal_lulus) patch.tanggal_lulus = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("siswa").update(patch).eq("id", s.id);
    if (error) return toast.error(error.message);
    load();
  }

  async function lulusSemua(val: boolean) {
    const ids = filtered.map((s) => s.id);
    if (!ids.length) return;
    const patch: any = { status_lulus: val };
    if (val) patch.tanggal_lulus = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("siswa").update(patch).in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`${ids.length} siswa di-${val ? "luluskan" : "batalkan kelulusannya"}`);
    load();
  }

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([{
      nisn: "0012345678", nis: "1234", nama: "Contoh Nama", tempat_lahir: "Palembang",
      tanggal_lahir: "2007-05-12", jenis_kelamin: "L", kelas: "XII IPA 1", jurusan: "IPA",
      nama_orang_tua: "Nama Ortu", no_peserta_ujian: "", no_seri_ijazah: "",
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
    const cleaned = rows.map((r) => ({
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
    })).filter((r) => r.nisn && r.nama);
    const { error } = await supabase.from("siswa").upsert(cleaned, { onConflict: "nisn" });
    if (error) return toast.error(error.message);
    toast.success(`${cleaned.length} siswa diimpor / diperbarui`);
    if (fileRef.current) fileRef.current.value = "";
    load();
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
              <Button onClick={() => setEdit({})} className="bg-gradient-hero"><Plus className="h-4 w-4 mr-2" /> Tambah Siswa</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
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
              <AlertDialogHeader><AlertDialogTitle>Luluskan {filtered.length} siswa?</AlertDialogTitle><AlertDialogDescription>Status kelulusan dan tanggal lulus akan diset untuk semua siswa yang ditampilkan.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => lulusSemua(true)}>Ya, Luluskan</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={() => lulusSemua(false)}><XCircle className="h-4 w-4 mr-2" />Batalkan Semua</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NISN</TableHead><TableHead>Nama</TableHead><TableHead>Kelas</TableHead><TableHead>Jurusan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.nisn}</TableCell>
                  <TableCell className="font-medium">{s.nama}</TableCell>
                  <TableCell>{s.kelas || "-"}</TableCell>
                  <TableCell>{s.jurusan || "-"}</TableCell>
                  <TableCell>
                    {s.status_lulus ? (
                      <button onClick={() => toggleLulus(s, false)} className="text-xs px-2 py-1 rounded-full bg-success/15 text-success font-medium">LULUS</button>
                    ) : (
                      <button onClick={() => toggleLulus(s, true)} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-success/10 hover:text-success">Belum</button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setEdit(s); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Hapus {s.nama}?</AlertDialogTitle><AlertDialogDescription>Data nilai juga akan ikut terhapus.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => hapus(s.id)}>Hapus</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
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
