import snapshotFile from "../data/snapshot.json";

export type Materi = { urutan?: string; slug?: string; judul?: string; ringkasan?: string; isi?: string; gambar_url?: string; pdf_url?: string; status?: string };
export type Latihan = { urutan?: string; judul_paket?: string; keterangan?: string; form_url?: string; status?: string };
export type Pengumuman = { tanggal?: string; judul?: string; isi?: string; status?: string };
export type AnggotaTim = { urutan?: string; nama?: string; nim?: string; peran?: string; prodi?: string; angkatan?: string };
export type Kredit = { jenis?: string; nama?: string; keterangan?: string; status?: string };
export type Soal = { paket?: string; nomor?: string; pertanyaan?: string; opsi_a?: string; opsi_b?: string; opsi_c?: string; opsi_d?: string; kunci?: string; pembahasan?: string };

type SourceSheet = { url: string; csv: string };
type Snapshot = { version: number; source: string; builtAt: string | null; sheets: Record<string, SourceSheet> };
type Row = Record<string, string>;

export const snapshot = snapshotFile as Snapshot;
export const spreadsheetUrl = snapshot.source;
export const sheetUrls = Object.fromEntries(Object.entries(snapshot.sheets).map(([sheet, data]) => [sheet, data.url]));

function stringValue(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function canonicalHeader(value: string) { return value.trim().toLocaleLowerCase("id-ID").replace(/\s+/g, "_"); }

export function parseCsv(csv: string): Row[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const next = csv[index + 1];
    if (quoted) {
      if (character === '"' && next === '"') { cell += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else cell += character;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === ",") { row.push(cell); cell = ""; }
    else if (character === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += character;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
  const [headers = [], ...values] = rows;
  return values
    .filter((valuesRow) => valuesRow.some((value) => stringValue(value)))
    .map((valuesRow) => Object.fromEntries(headers.map((name, index) => [canonicalHeader(name), valuesRow[index] ?? ""])));
}

function isTerbit(item: { status?: string }) { return stringValue(item.status).toLocaleLowerCase("id-ID") === "terbit"; }
function ordered<T extends { urutan?: string }>(items: T[]) {
  return [...items].sort((first, second) => {
    const firstOrder = Number(stringValue(first.urutan));
    const secondOrder = Number(stringValue(second.urutan));
    return (Number.isFinite(firstOrder) ? firstOrder : Infinity) - (Number.isFinite(secondOrder) ? secondOrder : Infinity);
  });
}
function rows<T>(sheet: string) { return parseCsv(snapshot.sheets[sheet]?.csv ?? "") as T[]; }

export const materi = ordered(rows<Materi>("materi").filter((item) => isTerbit(item) && Boolean(stringValue(item.judul)) && Boolean(stringValue(item.slug))));
export const latihan = ordered(rows<Latihan>("latihan").filter((item) => isTerbit(item) && Boolean(stringValue(item.judul_paket))));
export const pengumuman = rows<Pengumuman>("pengumuman").filter((item) => isTerbit(item) && Boolean(stringValue(item.judul)));
export const tim = ordered(rows<AnggotaTim>("tim").filter((item) => Boolean(stringValue(item.nama))));
export const kredit = rows<Kredit>("kredit").filter((item) => isTerbit(item) && Boolean(stringValue(item.nama)));
export const soal = rows<Soal>("soal").filter((item) => Boolean(stringValue(item.paket)) && Boolean(stringValue(item.pertanyaan)) && Boolean(stringValue(item.kunci)));

/** Soal satu paket latihan, diurutkan menurut kolom `nomor`. */
export function soalPaket(paket?: string) {
  const kunci = stringValue(paket).toLocaleLowerCase("id-ID");
  return soal
    .filter((item) => stringValue(item.paket).toLocaleLowerCase("id-ID") === kunci)
    .sort((first, second) => (Number(stringValue(first.nomor)) || Infinity) - (Number(stringValue(second.nomor)) || Infinity));
}

/** Empat pilihan jawaban satu soal, lengkap dengan hurufnya. */
export function opsiSoal(item: Soal) {
  return ([["A", item.opsi_a], ["B", item.opsi_b], ["C", item.opsi_c], ["D", item.opsi_d]] as const)
    .filter(([, teks]) => Boolean(stringValue(teks)))
    .map(([huruf, teks]) => ({ huruf, teks: stringValue(teks) }));
}

/** Nama grup radio yang aman dipakai sebagai atribut HTML. */
export function idPaket(paket?: string) {
  return stringValue(paket).toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "paket";
}

export function asParagraphs(value?: string) { return stringValue(value).split(/\r?\n\s*\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean); }
export function isHttpUrl(value?: string) { try { const url = new URL(stringValue(value)); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; } }
function safeUrl(value?: string) { try { const url = new URL(stringValue(value)); return url.protocol === "https:" || url.protocol === "http:" ? url : undefined; } catch { return undefined; } }
function driveFileId(value?: string) {
  const url = safeUrl(value);
  if (!url || !/(^|\.)drive\.google\.com$/.test(url.hostname)) return "";
  return url.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? url.searchParams.get("id") ?? "";
}

/** Mengubah link bagikan Google Drive menjadi sumber gambar yang dapat ditampilkan. */
export function imageSourceUrl(value?: string) {
  const url = safeUrl(value);
  if (!url) return "";
  const fileId = driveFileId(value);
  return fileId ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600` : url.href;
}

/** Mengubah link bagikan Google Drive menjadi tampilan PDF yang dapat disematkan. */
export function pdfPreviewUrl(value?: string) {
  const url = safeUrl(value);
  if (!url) return "";
  const fileId = driveFileId(value);
  return fileId ? `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview` : url.href;
}

export function isCurrentPath(pathname: string, href: string) { return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`); }
