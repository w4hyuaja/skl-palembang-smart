import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Upload, Image as ImageIcon } from "lucide-react";

export default function PengaturanPage() {
  const [p, setP] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("pengaturan").select("*").limit(1).maybeSingle().then(({ data }) => setP(data));
  }, []);

  async function simpan() {
    if (!p) return;
    setSaving(true);
    const { id, created_at, updated_at, ...patch } = p;
    const { error } = await supabase.from("pengaturan").update(patch).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Pengaturan tersimpan");
  }

  if (!p) return <div className="p-8">Memuat...</div>;

  // Format datetime-local from ISO
  const dtVal = p.tanggal_pengumuman ? new Date(p.tanggal_pengumuman).toISOString().slice(0, 16) : "";

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl">Pengaturan</h1>
        <p className="text-muted-foreground">Identitas sekolah, kepala sekolah, dan jadwal pengumuman.</p>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="font-serif text-xl">Identitas Sekolah</h2>
        <div className="grid grid-cols-2 gap-3">
          <F label="Nama Sekolah" v={p.nama_sekolah} on={(v) => setP({ ...p, nama_sekolah: v })} className="col-span-2" />
          <F label="NPSN" v={p.npsn} on={(v) => setP({ ...p, npsn: v })} />
          <F label="Tahun Pelajaran" v={p.tahun_pelajaran} on={(v) => setP({ ...p, tahun_pelajaran: v })} />
          <F label="Alamat" v={p.alamat} on={(v) => setP({ ...p, alamat: v })} className="col-span-2" />
          <F label="Kelurahan" v={p.kelurahan} on={(v) => setP({ ...p, kelurahan: v })} />
          <F label="Kecamatan" v={p.kecamatan} on={(v) => setP({ ...p, kecamatan: v })} />
          <F label="Kabupaten/Kota" v={p.kabupaten} on={(v) => setP({ ...p, kabupaten: v })} />
          <F label="Provinsi" v={p.provinsi} on={(v) => setP({ ...p, provinsi: v })} />
          <F label="Status" v={p.status_sekolah} on={(v) => setP({ ...p, status_sekolah: v })} />
          <F label="Bentuk Pendidikan" v={p.bentuk_pendidikan} on={(v) => setP({ ...p, bentuk_pendidikan: v })} />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-serif text-xl">Kepala Sekolah</h2>
        <div className="grid grid-cols-2 gap-3">
          <F label="Nama Kepala Sekolah" v={p.kepala_sekolah} on={(v) => setP({ ...p, kepala_sekolah: v })} />
          <F label="NIP (opsional)" v={p.nip_kepala} on={(v) => setP({ ...p, nip_kepala: v })} />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-serif text-xl">Pengumuman Kelulusan</h2>
        <div className="grid grid-cols-2 gap-3">
          <F label="Judul Pengumuman" v={p.judul_pengumuman} on={(v) => setP({ ...p, judul_pengumuman: v })} className="col-span-2" />
          <div className="col-span-2">
            <label className="text-sm font-medium">Pesan Pengumuman</label>
            <Textarea value={p.pesan_pengumuman ?? ""} onChange={(e) => setP({ ...p, pesan_pengumuman: e.target.value })} rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium">Jadwal Pengumuman Dibuka</label>
            <Input type="datetime-local" value={dtVal} onChange={(e) => setP({ ...p, tanggal_pengumuman: e.target.value ? new Date(e.target.value).toISOString() : null })} />
            <p className="text-xs text-muted-foreground mt-1">Countdown akan tampil di halaman publik.</p>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium block mb-2">Buka Manual Sekarang</label>
              <div className="flex items-center gap-2">
                <Switch checked={p.pengumuman_dibuka} onCheckedChange={(v) => setP({ ...p, pengumuman_dibuka: v })} />
                <span className="text-sm">{p.pengumuman_dibuka ? "Pengumuman terbuka" : "Tertutup"}</span>
              </div>
            </div>
          </div>
          <F label="URL Validasi (opsional, default: domain saat ini)" v={p.url_validasi_base} on={(v) => setP({ ...p, url_validasi_base: v })} className="col-span-2" />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={simpan} disabled={saving} className="bg-gradient-hero h-11 px-6"><Save className="h-4 w-4 mr-2" />{saving ? "Menyimpan..." : "Simpan Pengaturan"}</Button>
      </div>
    </div>
  );
}

function F({ label, v, on, className = "" }: any) {
  return (
    <div className={className}>
      <label className="text-sm font-medium">{label}</label>
      <Input value={v ?? ""} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
