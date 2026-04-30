export const TERBILANG_BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

export function formatTanggalID(d?: string | null | Date) {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "-";
  return `${date.getDate()} ${TERBILANG_BULAN[date.getMonth()]} ${date.getFullYear()}`;
}

export function rataNilai(n: { sem1?: number|null; sem2?: number|null; sem3?: number|null; sem4?: number|null; sem5?: number|null; sem6?: number|null }) {
  const arr = [n.sem1, n.sem2, n.sem3, n.sem4, n.sem5, n.sem6]
    .map((x) => (x === null || x === undefined ? null : Number(x)))
    .filter((x): x is number => x !== null && !isNaN(x));
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function fmtAngka(n: number | null | undefined, decimals = 2) {
  if (n === null || n === undefined || isNaN(Number(n))) return "-";
  return Number(n).toFixed(decimals);
}
