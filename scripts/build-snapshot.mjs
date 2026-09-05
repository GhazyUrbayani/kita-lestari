import { mkdir, writeFile } from "node:fs/promises";

const spreadsheetId = "1nItdfvg9ZL-lE4r5a-7_V6GKf8_mYeUCd_PjMOKYLa8";
const sheetNames = ["materi", "latihan", "pengumuman", "tim", "kredit", "pembahasan"];
const source = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;

function csvUrl(sheet) {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
}

/* Bila nama tab salah ketik atau tabnya belum ada, Google tidak memberi error:
   ia diam-diam mengirim isi tab pertama. Kolom penanda di bawah dipakai untuk
   memastikan tab yang terambil memang tab yang diminta. */
const kolomPenanda = {
  materi: "slug",
  latihan: "judul_paket",
  pengumuman: "tanggal",
  tim: "nim",
  kredit: "jenis",
  pembahasan: "paket",
};

async function getSheet(sheet) {
  const url = csvUrl(sheet);
  const response = await fetch(url, { headers: { Accept: "text/csv" } });
  if (!response.ok) throw new Error(`CSV ${sheet} tidak dapat diambil (${response.status}).`);
  const csv = await response.text();
  const penanda = kolomPenanda[sheet];
  const header = csv.slice(0, csv.indexOf("\n") + 1 || undefined).toLowerCase();
  if (penanda && !header.includes(`"${penanda}"`)) {
    throw new Error(`Tab "${sheet}" tidak ditemukan di Spreadsheet, atau kolom "${penanda}" belum ada. Google mengirim tab lain sebagai gantinya.`);
  }
  return [sheet, { url, csv }];
}

const entries = await Promise.all(sheetNames.map(getSheet));
const snapshot = { version: 1, source, builtAt: new Date().toISOString(), sheets: Object.fromEntries(entries) };
const output = `${JSON.stringify(snapshot, null, 2)}\n`;

await mkdir("src/data", { recursive: true });
await mkdir("public/data", { recursive: true });
await Promise.all([
  writeFile("src/data/snapshot.json", output),
  writeFile("public/data/snapshot.json", output),
]);

console.log(`Snapshot ${sheetNames.length} sheet dibuat pada ${snapshot.builtAt}.`);
