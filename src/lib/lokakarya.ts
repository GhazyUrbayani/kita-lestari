/** Materi lokakarya KITA LESTARI: slide, poster, dan berkas PDF yang ikut disimpan
 *  di dalam situs. Isi ini tidak berasal dari Spreadsheet, jadi tetap tampil walau
 *  jaringan sedang bermasalah atau isi live belum sempat diambil. */

export type Slide = { nomor: number; judul: string; alt: string };

export const slides: Slide[] = [
  {
    nomor: 1,
    judul: "Sampul lokakarya KITA LESTARI",
    alt: "Slide sampul dengan judul Pencerdasan Komunitas melalui Lokakarya Media Ajar Interaktif dan Implementasi Biopori untuk Optimalisasi Pengelolaan Limbah Desa Sukalaksana",
  },
  {
    nomor: 2,
    judul: "Semua bisa dimulai dari kita",
    alt: "Slide perkenalan tim KITA LESTARI beserta nama kelima anggotanya",
  },
  {
    nomor: 3,
    judul: "Kenapa sampah perlu dipilah?",
    alt: "Slide pembuka bertuliskan Kenapa sih sampah perlu dipilah",
  },
  {
    nomor: 4,
    judul: "Untungnya memilah sejak dari sumber",
    alt: "Slide yang menjelaskan keuntungan memisahkan sampah sesuai jenisnya sejak dari sumbernya",
  },
  {
    nomor: 5,
    judul: "Kalau sampah tidak dipilah",
    alt: "Slide pembuka bertuliskan Terus dampaknya gimana kalo sampah nggak dipilah",
  },
  {
    nomor: 6,
    judul: "Tiga dampak sampah yang tidak dipilah",
    alt: "Slide berisi tiga kartu dampak sampah yang tidak dipilah untuk lingkungan, kesehatan, dan pengelolaan",
  },
  {
    nomor: 7,
    judul: "Yuk belajar pilah sampah",
    alt: "Slide pembuka bertuliskan Sekarang, yuk belajar pilah sampah dengan tiga tempat sampah berwarna",
  },
  {
    nomor: 8,
    judul: "Tiga jenis sampah dan contohnya",
    alt: "Slide berisi tiga tempat sampah: bahan berbahaya dan beracun, sampah organik, dan sampah anorganik, lengkap dengan contoh tiap jenis",
  },
  {
    nomor: 9,
    judul: "Habis itu, gimana cara mengolahnya?",
    alt: "Slide pembuka bertuliskan Habis itu gimana cara ngolahnya ya",
  },
  {
    nomor: 10,
    judul: "Cara mengolah tiap jenis sampah",
    alt: "Slide berisi cara mengolah sampah berbahaya, sampah organik, dan sampah anorganik",
  },
  {
    nomor: 11,
    judul: "Sampah organik dan lubang biopori",
    alt: "Slide bertuliskan sampah organik punya perjalanan lain selain menuju tempat sampah, salah satunya melalui lubang kecil bernama biopori",
  },
  {
    nomor: 12,
    judul: "Apa itu biopori, cara membuat, dan cara merawat",
    alt: "Slide berisi pengertian lubang resapan biopori, enam langkah membuatnya, dan empat langkah merawatnya",
  },
  {
    nomor: 13,
    judul: "Mari mulai dari satu langkah",
    alt: "Slide penutup bertuliskan Mari mulai dari satu langkah, kelola bersama, dan jadikan lingkungan kita lebih lestari",
  },
];

/** Slide yang paling dekat dengan tiap materi di Spreadsheet. */
const slidePerMateri: Record<string, number[]> = {
  "kenali-dan-pilah-sampah": [3, 4, 7, 8],
  "jangan-bakar-sampah": [5, 6, 9, 10],
  "apa-itu-biopori": [11, 12],
  "cara-membuat-biopori": [12, 13],
};

export function slideMateri(slug?: string): Slide[] {
  const nomor = slidePerMateri[(slug ?? "").trim()] ?? [];
  return nomor.map((angka) => slides[angka - 1]).filter(Boolean);
}

export function slideUrl(nomor: number) {
  return `/images/lokakarya/slide-${String(nomor).padStart(2, "0")}.webp`;
}

export function slideUrlKecil(nomor: number) {
  return `/images/lokakarya/slide-${String(nomor).padStart(2, "0")}-kecil.webp`;
}

export const deck = {
  slug: "lokakarya",
  href: "/materi/lokakarya",
  judul: "Slide Lokakarya KITA LESTARI",
  ringkasan:
    "Slide yang dipakai saat lokakarya di Desa Sukalaksana: dari alasan memilah sampah sampai cara membuat dan merawat lubang biopori.",
  pdf: "/dokumen/materi-lokakarya-kita-lestari.pdf",
  pdfLabel: "PDF slide",
};

export const poster = {
  gambar: "/images/poster-kita-lestari.webp",
  kecil: "/images/poster-kita-lestari-kecil.webp",
  alt: "Poster KITA LESTARI berisi alasan memilah sampah, dampak bila tidak dipilah, tiga jenis sampah, dan cara mengolah tiap jenisnya",
  lebar: 1400,
  tinggi: 1980,
};

/** Logo pendukung program, diurutkan seperti pada batang logo di tiap slide. */
export const logos = [
  { berkas: "/images/logos/kita-lestari.webp", nama: "KITA LESTARI" },
  { berkas: "/images/logos/tut-wuri-handayani.webp", nama: "Tut Wuri Handayani" },
  { berkas: "/images/logos/diktisaintek-berdampak.webp", nama: "Diktisaintek Berdampak" },
  { berkas: "/images/logos/simbelmawa.webp", nama: "Simbelmawa" },
  { berkas: "/images/logos/pkm.webp", nama: "PKM, Program Kreativitas Mahasiswa" },
  { berkas: "/images/logos/itb.webp", nama: "Institut Teknologi Bandung" },
  { berkas: "/images/logos/pelita-muda.webp", nama: "Pelita Muda ITB" },
  { berkas: "/images/logos/sigap-bersinergi.webp", nama: "Sigap Bersinergi" },
];
