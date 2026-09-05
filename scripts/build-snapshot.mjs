import { mkdir, writeFile } from "node:fs/promises";

const spreadsheetId = "1nItdfvg9ZL-lE4r5a-7_V6GKf8_mYeUCd_PjMOKYLa8";
const sheetNames = ["materi", "latihan", "pengumuman", "tim", "kredit"];
const source = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;

function csvUrl(sheet) {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
}

async function getSheet(sheet) {
  const url = csvUrl(sheet);
  const response = await fetch(url, { headers: { Accept: "text/csv" } });
  if (!response.ok) throw new Error(`CSV ${sheet} tidak dapat diambil (${response.status}).`);
  return [sheet, { url, csv: await response.text() }];
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
