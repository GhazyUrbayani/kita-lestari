(() => {
  const config = window.__KITA_LIVE__;
  if (!config || !window.fetch || !window.localStorage) return;

  const storageKey = "kita-lestari:csv:v1";
  const text = (value) => (value == null ? "" : String(value).trim());
  const escape = (value) => text(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const url = (value) => { try { const parsed = new URL(text(value)); return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : ""; } catch { return ""; } };
  const driveFileId = (value) => { const parsed = new URL(value); return /(^|\.)drive\.google\.com$/.test(parsed.hostname) ? (parsed.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || parsed.searchParams.get("id") || "") : ""; };
  const imageSourceUrl = (value) => { const id = driveFileId(value); return id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600` : value; };
  const pdfPreviewUrl = (value) => { const id = driveFileId(value); return id ? `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview` : value; };
  const paragraphHtml = (value) => text(value).split(/\r?\n\s*\r?\n/).filter(Boolean).map((paragraph) => `<p>${escape(paragraph)}</p>`).join("");
  const header = (value) => text(value).toLocaleLowerCase("id-ID").replace(/\s+/g, "_");

  function parseCsv(csv) {
    const rows = [];
    let row = [], cell = "", quoted = false;
    for (let index = 0; index < csv.length; index += 1) {
      const character = csv[index], next = csv[index + 1];
      if (quoted) {
        if (character === '"' && next === '"') { cell += '"'; index += 1; }
        else if (character === '"') quoted = false;
        else cell += character;
      } else if (character === '"') quoted = true;
      else if (character === ",") { row.push(cell); cell = ""; }
      else if (character === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
      else cell += character;
    }
    if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
    const [headers = [], ...values] = rows;
    return values.filter((entry) => entry.some((value) => text(value))).map((entry) => Object.fromEntries(headers.map((name, index) => [header(name), entry[index] || ""])));
  }

  const published = (rows, field) => rows.filter((row) => text(row.status).toLocaleLowerCase("id-ID") === "terbit" && text(row[field]));
  const ordered = (rows) => [...rows].sort((a, b) => (Number(a.urutan) || Infinity) - (Number(b.urutan) || Infinity));
  /* Isi versi live datang beberapa detik setelah halaman tampil. Bila saat itu
     pembaca sudah membuka form atau kunci jawaban sudah terbuka, penggantian
     dilewati supaya jawaban yang sedang diketik tidak ikut terhapus. */
  /* Panel kuis yang sekadar terbuka boleh diganti isinya, sebab keadaannya
     dipulihkan kembali oleh quiz.js. Yang dilindungi hanya pekerjaan pembaca:
     jawaban yang sudah dipilih, hasil yang sudah tampil, dan PDF materi. */
  const sedangDipakai = (node) => Boolean(node.querySelector("details.document-embed[open]") || node.querySelector("input:checked") || node.querySelector(".quiz-result:not([hidden])"));
  const assign = (selector, html) => {
    const node = document.querySelector(selector);
    if (!node || node.innerHTML === html || sedangDipakai(node)) return;
    node.innerHTML = html;
  };
  function materialList(rows, limit) {
    const materials = ordered(published(rows, "judul").filter((row) => text(row.slug)));
    const shown = limit ? materials.slice(0, limit) : materials;
    if (!shown.length) return "<p>Belum ada materi yang diterbitkan. Pengelola dapat menambahkannya di Sheet.</p>";
    return `<ul class="card-list">${shown.map((item) => `<li><article class="content-card"><h2><a href="/materi/${encodeURIComponent(item.slug)}">${escape(item.judul)}</a></h2>${item.ringkasan ? `<p>${escape(item.ringkasan)}</p>` : ""}</article></li>`).join("")}</ul>`;
  }
  const idPaket = (paket) => text(paket).toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "paket";

  function quizHtml(rows, paket) {
    const key = text(paket).toLocaleLowerCase("id-ID");
    const butir = rows
      .filter((row) => text(row.paket).toLocaleLowerCase("id-ID") === key && text(row.pertanyaan) && text(row.kunci))
      .sort((a, b) => (Number(text(a.nomor)) || Infinity) - (Number(text(b.nomor)) || Infinity));
    if (!butir.length) return "<p>Paket ini belum tersedia. Pengelola perlu mengisi soalnya di tab <code>soal</code>.</p>";
    const id = idPaket(paket);
    const daftar = butir.map((row, urutan) => {
      const opsi = [["A", row.opsi_a], ["B", row.opsi_b], ["C", row.opsi_c], ["D", row.opsi_d]]
        .filter(([, teks]) => text(teks))
        .map(([huruf, teks]) => `<label class="quiz-option"><input type="radio" name="${id}-${urutan + 1}" value="${huruf}"><span>${huruf}. ${escape(teks)}</span></label>`)
        .join("");
      return `<li class="quiz-item" data-kunci="${escape(text(row.kunci).toUpperCase())}"><fieldset><legend>${escape(text(row.nomor) || String(urutan + 1))}. ${escape(row.pertanyaan)}</legend>${opsi}</fieldset><p class="quiz-note" hidden></p>${text(row.pembahasan) ? `<p class="quiz-pembahasan" hidden>${escape(row.pembahasan)}</p>` : ""}</li>`;
    }).join("");
    return `<details class="quiz-embed"><summary class="action-link">Tampilkan soal ${escape(paket)} di halaman ini</summary><div class="quiz-panel"><form class="quiz" data-paket="${escape(paket)}"><p class="quiz-langkah" role="status"></p><ol class="quiz-list">${daftar}</ol><p class="quiz-sisa" role="status"></p><div class="quiz-actions" hidden><button type="button" class="action-link quiz-prev">Sebelumnya</button><button type="button" class="action-link quiz-next">Berikutnya</button><button type="submit" class="action-link quiz-selesai">Selesai dan lihat hasil</button><button type="button" class="action-link quiz-reset" hidden>Kerjakan ulang</button></div><section class="quiz-result" aria-live="polite" hidden></section></form></div></details>`;
  }

  function render(data) {
    const material = parseCsv(data.materi || ""), practice = parseCsv(data.latihan || ""), announcement = parseCsv(data.pengumuman || ""), team = parseCsv(data.tim || ""), credits = parseCsv(data.kredit || ""), questions = parseCsv(data.soal || "");
    /* Bila tab `pengumuman` kosong, isi bawaan modal dibiarkan apa adanya
       supaya setiap halaman menampilkan pengumuman yang sama. */
    const latest = published(announcement, "judul")[0];
    if (latest) {
      const tanda = escape(`${text(latest.tanggal)}|${text(latest.judul)}`);
      assign('[data-live="announcement"]', `<article class="notice-board" data-pengumuman-id="${tanda}">${latest.tanggal ? `<p class="notice-date"><time>${escape(latest.tanggal)}</time></p>` : ""}<h3>${escape(latest.judul)}</h3>${paragraphHtml(latest.isi)}</article>`);
    }

    if (config.page === "home") assign('[data-live="materials-preview"]', materialList(material, 2));
    if (config.page === "materials") assign('[data-live="materials-list"]', materialList(material));
    if (config.page === "material") {
      const item = ordered(published(material, "judul")).find((entry) => entry.slug === config.slug);
      if (!item) return;
      const image = url(item.gambar_url), pdf = url(item.pdf_url);
      assign('[data-live="material-detail"]', `<h1>${escape(item.judul)}</h1>${item.ringkasan ? `<p>${escape(item.ringkasan)}</p>` : ""}${image ? `<img src="${escape(imageSourceUrl(image))}" alt="${escape(item.judul)}" loading="lazy">` : ""}${paragraphHtml(item.isi)}${pdf ? `<details class="document-embed"><summary class="action-link">Tampilkan PDF materi di halaman ini</summary><div class="document-embed-panel"><iframe src="${escape(pdfPreviewUrl(pdf))}" title="PDF ${escape(item.judul)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin">PDF tidak dapat dimuat di halaman ini.</iframe></div></details>` : ""}`);
    }
    if (config.page === "practice") {
      const packages = ordered(published(practice, "judul_paket"));
      assign('[data-live="practice"]', packages.length
        ? `<ul class="card-list">${packages.map((item) => `<li><article class="content-card"><h2>${escape(item.judul_paket)}</h2>${item.keterangan ? `<p>${escape(item.keterangan)}</p>` : ""}${quizHtml(questions, item.judul_paket)}</article></li>`).join("")}</ul>`
        : "<p>Belum ada paket soal yang diterbitkan.</p>");
    }
    if (config.page === "about") {
      const members = ordered(team.filter((item) => text(item.nama)));
      assign('[data-live="team"]', members.length ? `<ul class="card-list">${members.map((item) => `<li><article class="content-card"><h3>${escape(item.nama)}</h3>${item.nim ? `<p>NIM: ${escape(item.nim)}</p>` : ""}${item.peran || item.prodi ? `<p class="member-meta">${item.peran ? `<span class="pill">${escape(item.peran)}</span>` : ""}${item.prodi ? `<span class="pill">${escape(item.prodi)}</span>` : ""}</p>` : ""}${item.angkatan ? `<p>Angkatan ${escape(item.angkatan)}</p>` : ""}</article></li>`).join("")}</ul>` : "<p>Daftar tim belum tersedia. Pengelola dapat melengkapinya di Sheet.</p>");
      const creditRows = published(credits, "nama");
      assign('[data-live="credits"]', creditRows.length ? `<dl>${creditRows.map((item) => `<div>${item.jenis ? `<dt>${escape(item.jenis)}</dt>` : ""}<dd>${escape(item.nama)}</dd>${item.keterangan ? `<dd>${escape(item.keterangan)}</dd>` : ""}</div>`).join("")}</dl>` : "<p>Kredit belum tersedia.</p>");
    }
  }
  function readStored() { try { return JSON.parse(localStorage.getItem(storageKey) || "null"); } catch { return null; } }
  async function refresh() {
    /* Modal pengumuman tampil di semua halaman, jadi sheet ini selalu ikut
       diambil walau bukan bagian dari sumber halaman yang bersangkutan. */
    const sumber = [...new Set([...(config.sources || []), "pengumuman"])];
    const entries = await Promise.all(sumber.map(async (sheet) => {
      const response = await fetch(config.urls[sheet], { cache: "no-store" });
      if (!response.ok) throw new Error("CSV tidak tersedia");
      return [sheet, await response.text()];
    }));
    const stored = readStored();
    const cachedSheets = stored && stored.buildId === config.buildId && stored.sheets ? stored.sheets : {};
    const sheets = { ...cachedSheets, ...Object.fromEntries(entries) };
    localStorage.setItem(storageKey, JSON.stringify({ buildId: config.buildId, sheets, savedAt: new Date().toISOString() }));
    render(sheets);
  }
  requestAnimationFrame(() => { const stored = readStored(); if (stored && stored.buildId === config.buildId && stored.sheets) render(stored.sheets); refresh().catch(() => {}); });
})();
