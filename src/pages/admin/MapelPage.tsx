import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function MapelPage() {
  const [list, setList] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await supabase.from("mata_pelajaran").select("*").order("urutan");
    setList(data || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!edit?.kode || !edit?.nama) { toast.error("Kode & nama wajib"); return; }
    const payload = { kode: edit.kode, nama: edit.nama, kelompok: edit.kelompok || "A", urutan: Number(edit.urutan) || 0, aktif: edit.aktif !== false };
    const { error } = edit.id ? await supabase.from("mata_pelajaran").update(payload).eq("id", edit.id) : await supabase.from("mata_pelajaran").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan"); setOpen(false); setEdit(null); load();
  }

  async function hapus(id: string) {
    if (!confirm("Hapus mapel ini? Nilai terkait juga akan terhapus.")) return;
    const { error } = await supabase.from("mata_pelajaran").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus"); load();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl">Mata Pelajaran</h1>
          <p className="text-muted-foreground">Kelola daftar mata pelajaran untuk SKL.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEdit(null); }}>
          <DialogTrigger asChild><Button onClick={() => setEdit({ kelompok: "A", aktif: true })} className="bg-gradient-hero"><Plus className="h-4 w-4 mr-2" />Tambah</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{edit?.id ? "Edit" : "Tambah"} Mapel</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><label className="text-sm font-medium">Kode</label><Input value={edit?.kode ?? ""} onChange={(e) => setEdit({ ...edit, kode: e.target.value.toUpperCase() })} /></div>
              <div><label className="text-sm font-medium">Nama</label><Input value={edit?.nama ?? ""} onChange={(e) => setEdit({ ...edit, nama: e.target.value })} /></div>
              <div>
                <label className="text-sm font-medium">Kelompok</label>
                <Select value={edit?.kelompok ?? "A"} onValueChange={(v) => setEdit({ ...edit, kelompok: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Kelompok A (Umum)</SelectItem>
                    <SelectItem value="B">Kelompok B (Umum)</SelectItem>
                    <SelectItem value="Peminatan">Peminatan</SelectItem>
                    <SelectItem value="Lintas Minat">Lintas Minat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium">Urutan</label><Input type="number" value={edit?.urutan ?? 0} onChange={(e) => setEdit({ ...edit, urutan: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={save} className="bg-gradient-hero">Simpan</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <Table>
          <TableHeader><TableRow><TableHead>Urutan</TableHead><TableHead>Kode</TableHead><TableHead>Nama</TableHead><TableHead>Kelompok</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {list.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.urutan}</TableCell>
                <TableCell className="font-mono text-xs">{m.kode}</TableCell>
                <TableCell className="font-medium">{m.nama}</TableCell>
                <TableCell>{m.kelompok}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setEdit(m); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => hapus(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
