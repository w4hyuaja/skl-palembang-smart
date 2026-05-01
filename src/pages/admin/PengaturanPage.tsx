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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !p) return;
    setUploading(true);
    const ext = f.name.split(".").pop();
    const path = `logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("logos").upload(path, f, { upsert: true });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);
    setP({ ...p, logo_url: publicUrl });
    setUploading(false);
    toast.success("Logo terunggah. Klik Simpan.");
  }

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
        <div className="flex items-start gap-4 mb-2">
          <div className="h-24 w-24 rounded-md border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden shrink-0">
            {p.logo_url ? (
              <img src={p.logo_url} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium block mb-1">Logo Sekolah</label>
            <p className="text-xs text-muted-foreground mb-2">Format PNG/JPG, ideal 400×400px. Tampil di kop SKL & halaman publik.</p>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadLogo} />
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />{uploading ? "Mengunggah..." : "Unggah Logo"}
              </Button>
              {p.logo_url && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setP({ ...p, logo_url: "" })}>Hapus</Button>
              )}
            </div>
          </div>
        </div>
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
        <h2 className="font-serif text-xl">Format SKL untuk Siswa</h2>
        <p className="text-sm text-muted-foreground -mt-2">Pilih bentuk SKL yang akan ditampilkan ke siswa pada halaman pengumuman. Siswa tidak dapat mengubah format ini.</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Bentuk SKL Default</label>
            <Select value={p.bentuk_skl_default ?? "akhir"} onValueChange={(v) => setP({ ...p, bentuk_skl_default: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="akhir">SKL dengan Nilai Akhir</SelectItem>
                <SelectItem value="rata">SKL dengan Rata-rata Semester</SelectItem>
                <SelectItem value="tanpa">SKL Tanpa Nilai</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
