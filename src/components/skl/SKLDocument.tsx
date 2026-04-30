import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { fmtAngka, formatTanggalID, rataNilai } from "@/lib/skl-utils";

export type SKLBentuk = "akhir" | "rata" | "tanpa";

interface Props {
  siswa: any;
  pengaturan: any;
  mapel: any[];
  nilai: any[];
  bentuk: SKLBentuk;
}

export default function SKLDocument({ siswa, pengaturan, mapel, nilai, bentuk }: Props) {
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const base = (pengaturan.url_validasi_base || window.location.origin).replace(/\/$/, "");
    const url = `${base}/validasi/${siswa.nisn}`;
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, url, { width: 110, margin: 1, color: { dark: "#003D1F", light: "#FFFFFF" } });
    }
  }, [siswa.nisn, pengaturan.url_validasi_base]);

  const nilaiByMapel = new Map(nilai.map((n) => [n.mapel_id, n]));

  const grouped = {
    A: mapel.filter((m) => m.kelompok === "A"),
    B: mapel.filter((m) => m.kelompok === "B"),
    Peminatan: mapel.filter((m) => m.kelompok === "Peminatan"),
    "Lintas Minat": mapel.filter((m) => m.kelompok === "Lintas Minat"),
  };

  const showNilai = bentuk !== "tanpa";
  const showSemester = bentuk === "rata";

  return (
    <div
      className="bg-white text-[hsl(var(--skl-ink))] mx-auto shadow-card"
      style={{ width: "210mm", minHeight: "297mm", padding: "14mm 16mm", fontFamily: "Merriweather, Georgia, serif", fontSize: 11 }}
    >
      {/* KOP */}
      <div className="flex items-center gap-4 border-b-4 border-double border-[hsl(var(--skl-accent))] pb-3">
        <div className="h-20 w-20 rounded-full bg-[hsl(var(--skl-accent))] flex items-center justify-center text-white shrink-0">
          <span className="font-bold text-2xl">M</span>
        </div>
        <div className="flex-1 text-center leading-tight">
          <div className="text-[10px] tracking-widest">PIMPINAN DAERAH MUHAMMADIYAH KOTA PALEMBANG</div>
          <div className="text-base font-bold">MAJELIS PENDIDIKAN DASAR DAN MENENGAH</div>
          <div className="text-xl font-black uppercase">{pengaturan.nama_sekolah}</div>
          <div className="text-[10px]">{pengaturan.alamat} • NPSN {pengaturan.npsn}</div>
          <div className="text-[10px]">{pengaturan.kelurahan}, {pengaturan.kecamatan}, {pengaturan.kabupaten}, {pengaturan.provinsi}</div>
        </div>
      </div>

      {/* JUDUL */}
      <div className="text-center mt-5">
        <div className="text-base font-bold underline">SURAT KETERANGAN LULUS</div>
        <div className="text-[10px]">Nomor: ___ / SKL / SMA-MUH01-PLG / {new Date().getFullYear()}</div>
      </div>

      <p className="mt-4 text-justify leading-relaxed" style={{ fontSize: 11 }}>
        Yang bertanda tangan di bawah ini, Kepala <strong>{pengaturan.nama_sekolah}</strong>,
        Provinsi {pengaturan.provinsi}, dengan ini menerangkan bahwa:
      </p>

      {/* Identitas */}
      <table className="mt-3 text-[11px]" style={{ fontFamily: "Inter, sans-serif" }}>
        <tbody>
          <Row label="Nama" value={siswa.nama} bold />
          <Row label="Tempat, Tanggal Lahir" value={`${siswa.tempat_lahir || "-"}, ${formatTanggalID(siswa.tanggal_lahir)}`} />
          <Row label="Jenis Kelamin" value={siswa.jenis_kelamin || "-"} />
          <Row label="NISN" value={siswa.nisn} />
          <Row label="NIS" value={siswa.nis || "-"} />
          {siswa.no_peserta_ujian && <Row label="No. Peserta Ujian" value={siswa.no_peserta_ujian} />}
          <Row label="Kelas / Jurusan" value={`${siswa.kelas || "-"} / ${siswa.jurusan || "-"}`} />
          <Row label="Nama Orang Tua" value={siswa.nama_orang_tua || "-"} />
        </tbody>
      </table>

      <p className="mt-4 text-justify leading-relaxed">
        Berdasarkan hasil Rapat Pleno Dewan Guru dan ketentuan kelulusan yang berlaku, siswa tersebut dinyatakan:
      </p>
      <div className="text-center my-3">
        <span className="inline-block px-8 py-2 border-2 border-[hsl(var(--skl-accent))] font-black text-2xl tracking-widest">LULUS</span>
      </div>

      {/* Tabel Nilai */}
      {showNilai && (
        <div className="mt-2">
          <p className="font-bold text-center mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
            DAFTAR NILAI {bentuk === "rata" ? "RATA-RATA SEMESTER" : "AKHIR"}
          </p>
          <table className="w-full border-collapse text-[10px]" style={{ fontFamily: "Inter, sans-serif" }}>
            <thead>
              <tr className="bg-[hsl(var(--skl-accent))] text-white">
                <th className="border border-black p-1 w-8">No</th>
                <th className="border border-black p-1 text-left">Mata Pelajaran</th>
                {showSemester ? (
                  <>
                    <th className="border border-black p-1 w-10">Sm 1</th>
                    <th className="border border-black p-1 w-10">Sm 2</th>
                    <th className="border border-black p-1 w-10">Sm 3</th>
                    <th className="border border-black p-1 w-10">Sm 4</th>
                    <th className="border border-black p-1 w-10">Sm 5</th>
                    <th className="border border-black p-1 w-10">Sm 6</th>
                    <th className="border border-black p-1 w-12">Rata</th>
                  </>
                ) : (
                  <th className="border border-black p-1 w-20">Nilai Akhir</th>
                )}
              </tr>
            </thead>
            <tbody>
              {(["A", "B", "Peminatan", "Lintas Minat"] as const).map((kel) => {
                const list = grouped[kel];
                if (!list?.length) return null;
                return (
                  <RenderGroup
                    key={kel}
                    label={kel === "A" ? "Kelompok A (Umum)" : kel === "B" ? "Kelompok B (Umum)" : kel === "Peminatan" ? "Kelompok C (Peminatan)" : "Lintas Minat"}
                    list={list}
                    nilaiByMapel={nilaiByMapel}
                    showSemester={showSemester}
                    startNo={kel === "A" ? 1 : kel === "B" ? grouped.A.length + 1 : kel === "Peminatan" ? grouped.A.length + grouped.B.length + 1 : grouped.A.length + grouped.B.length + grouped.Peminatan.length + 1}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tanda tangan */}
      <div className="grid grid-cols-2 gap-4 mt-6" style={{ fontFamily: "Inter, sans-serif", fontSize: 10 }}>
        <div className="flex items-end">
          <canvas ref={qrRef} className="border border-border" />
          <div className="ml-3 text-[9px] leading-tight">
            <div className="font-bold">Validasi Keaslian</div>
            <div>Pindai kode QR untuk memverifikasi SKL ini secara online.</div>
          </div>
        </div>
        <div className="text-center">
          <div>Palembang, {formatTanggalID(siswa.tanggal_lulus || new Date())}</div>
          <div>Kepala Sekolah,</div>
          <div className="h-20"></div>
          <div className="font-bold underline">{pengaturan.kepala_sekolah}</div>
          {pengaturan.nip_kepala && <div>NIP. {pengaturan.nip_kepala}</div>}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr>
      <td className="pr-2 align-top w-48">{label}</td>
      <td className="pr-1 align-top w-3">:</td>
      <td className={`align-top ${bold ? "font-bold uppercase" : ""}`}>{value}</td>
    </tr>
  );
}

function RenderGroup({ label, list, nilaiByMapel, showSemester, startNo }: any) {
  return (
    <>
      <tr>
        <td colSpan={showSemester ? 9 : 3} className="border border-black px-2 py-1 bg-[hsl(var(--skl-accent))]/10 font-bold">{label}</td>
      </tr>
      {list.map((m: any, i: number) => {
        const n = nilaiByMapel.get(m.id);
        const rata = n ? rataNilai(n) : null;
        return (
          <tr key={m.id}>
            <td className="border border-black p-1 text-center">{startNo + i}</td>
            <td className="border border-black p-1">{m.nama}</td>
            {showSemester ? (
              <>
                <td className="border border-black p-1 text-center">{fmtAngka(n?.sem1)}</td>
                <td className="border border-black p-1 text-center">{fmtAngka(n?.sem2)}</td>
                <td className="border border-black p-1 text-center">{fmtAngka(n?.sem3)}</td>
                <td className="border border-black p-1 text-center">{fmtAngka(n?.sem4)}</td>
                <td className="border border-black p-1 text-center">{fmtAngka(n?.sem5)}</td>
                <td className="border border-black p-1 text-center">{fmtAngka(n?.sem6)}</td>
                <td className="border border-black p-1 text-center font-bold">{fmtAngka(rata)}</td>
              </>
            ) : (
              <td className="border border-black p-1 text-center font-bold">{fmtAngka(n?.nilai_akhir ?? rata)}</td>
            )}
          </tr>
        );
      })}
    </>
  );
}
