(() => {
  /* Kuis dinilai di browser memakai kolom `kunci` dari tab `soal`. Soal
     ditampilkan satu per satu; tombol dan penanda langkah baru muncul setelah
     berkas ini jalan, sehingga tanpa JavaScript seluruh soal tetap terbaca. */
  const butir = (form) => [...form.querySelectorAll(".quiz-item")];
  const jawaban = (item) => item.querySelector("input:checked");
  const sudahDinilai = (form) => form.dataset.dinilai === "ya";
  const teksOpsi = (item, huruf) => {
    const pilihan = item.querySelector(`input[value="${huruf}"]`);
    const label = pilihan && pilihan.closest("label");
    return label ? label.textContent.trim() : huruf;
  };

  /* Keadaan kuis disimpan di peramban pembaca supaya panel yang sudah dibuka
     tidak perlu diklik lagi setiap kali halaman ditinggalkan lalu dibuka lagi.
     Isinya hanya milik pembaca itu sendiri dan tidak dikirim ke mana pun. */
  const KUNCI_SIMPANAN = "kita-lestari:kuis:v1";
  const bacaSimpanan = () => { try { return JSON.parse(localStorage.getItem(KUNCI_SIMPANAN) || "{}"); } catch { return {}; } };
  const tulisSimpanan = (data) => { try { localStorage.setItem(KUNCI_SIMPANAN, JSON.stringify(data)); } catch { /* mode privat menolak menyimpan */ } };

  function simpan(form) {
    const daftar = butir(form);
    const dipilih = {};
    daftar.forEach((item, urutan) => { const pilihan = jawaban(item); if (pilihan) dipilih[urutan] = pilihan.value; });
    const semua = bacaSimpanan();
    const rincian = form.closest(".quiz-embed");
    semua[form.dataset.paket] = {
      terbuka: Boolean(rincian && rincian.open),
      langkah: Number(form.dataset.langkah || 0),
      jumlah: daftar.length,
      dinilai: sudahDinilai(form),
      jawaban: dipilih,
    };
    tulisSimpanan(semua);
  }

  function pulihkan(form) {
    const catatan = bacaSimpanan()[form.dataset.paket];
    const daftar = butir(form);
    /* Bila jumlah soal di Spreadsheet berubah, simpanan lama tidak lagi cocok. */
    if (!catatan || catatan.jumlah !== daftar.length) return false;
    daftar.forEach((item, urutan) => {
      const huruf = catatan.jawaban && catatan.jawaban[urutan];
      const pilihan = huruf && item.querySelector(`input[value="${huruf}"]`);
      if (pilihan) pilihan.checked = true;
    });
    const rincian = form.closest(".quiz-embed");
    if (rincian) rincian.open = Boolean(catatan.terbuka);
    if (catatan.dinilai) { form.dataset.dinilai = "ya"; tampilkanHasil(form, nilai(form)); }
    hitungSisa(form);
    tampilkan(form, catatan.langkah || 0);
    return true;
  }

  function hitungSisa(form) {
    const catatan = form.querySelector(".quiz-sisa");
    if (!catatan) return;
    if (sudahDinilai(form)) { catatan.textContent = ""; return; }
    const sisa = butir(form).filter((item) => !jawaban(item)).length;
    catatan.textContent = sisa ? `Belum dijawab: ${sisa} soal.` : "Semua soal sudah dijawab.";
  }

  function tampilkan(form, langkah) {
    const daftar = butir(form);
    if (!daftar.length) return;
    const posisi = Math.min(Math.max(langkah, 0), daftar.length - 1);
    form.dataset.langkah = String(posisi);
    daftar.forEach((item, urutan) => { item.hidden = urutan !== posisi; });

    const penanda = form.querySelector(".quiz-langkah");
    if (penanda) penanda.textContent = `Soal ${posisi + 1} dari ${daftar.length}`;

    const terakhir = posisi === daftar.length - 1;
    form.querySelector(".quiz-prev").disabled = posisi === 0;
    form.querySelector(".quiz-next").hidden = terakhir;
    form.querySelector(".quiz-selesai").hidden = !terakhir || sudahDinilai(form);
    form.querySelector(".quiz-reset").hidden = !sudahDinilai(form);
  }

  function nilai(form) {
    const daftar = butir(form);
    let benar = 0;

    daftar.forEach((item) => {
      const kunci = (item.dataset.kunci || "").toUpperCase();
      const pilihan = jawaban(item);
      const catatan = item.querySelector(".quiz-note");
      const pembahasan = item.querySelector(".quiz-pembahasan");
      item.classList.remove("quiz-benar", "quiz-salah", "quiz-kosong");

      if (!pilihan) {
        item.classList.add("quiz-kosong");
        if (catatan) catatan.textContent = `Belum dijawab. Kunci: ${teksOpsi(item, kunci)}`;
      } else if (pilihan.value.toUpperCase() === kunci) {
        benar += 1;
        item.classList.add("quiz-benar");
        if (catatan) catatan.textContent = "Benar.";
      } else {
        item.classList.add("quiz-salah");
        if (catatan) catatan.textContent = `Jawabanmu ${teksOpsi(item, pilihan.value)} — kunci: ${teksOpsi(item, kunci)}`;
      }

      if (catatan) catatan.hidden = false;
      if (pembahasan) pembahasan.hidden = false;
    });

    form.querySelectorAll("input[type=radio]").forEach((pilihan) => { pilihan.disabled = true; });
    return { benar, total: daftar.length };
  }

  function tampilkanHasil(form, skor) {
    const panel = form.querySelector(".quiz-result");
    if (!panel) return;
    const akurasi = skor.total ? Math.round((skor.benar / skor.total) * 100) : 0;
    panel.innerHTML =
      `<h3>Hasil</h3>` +
      `<p class="quiz-skor"><strong>${skor.benar}</strong> benar dari ${skor.total} soal</p>` +
      `<p class="quiz-akurasi">Akurasi ${akurasi} persen</p>` +
      `<p>Pakai tombol Sebelumnya dan Berikutnya untuk menelusuri kunci jawaban serta pembahasan tiap soal.</p>`;
    panel.hidden = false;
  }

  function ulang(form) {
    form.dataset.dinilai = "tidak";
    form.querySelectorAll("input[type=radio]").forEach((pilihan) => { pilihan.disabled = false; pilihan.checked = false; });
    butir(form).forEach((item) => {
      item.classList.remove("quiz-benar", "quiz-salah", "quiz-kosong");
      const catatan = item.querySelector(".quiz-note");
      const pembahasan = item.querySelector(".quiz-pembahasan");
      if (catatan) catatan.hidden = true;
      if (pembahasan) pembahasan.hidden = true;
    });
    const panel = form.querySelector(".quiz-result");
    if (panel) { panel.hidden = true; panel.innerHTML = ""; }
    hitungSisa(form);
    tampilkan(form, 0);
  }

  function siapkan(form) {
    if (form.dataset.siap === "ya") return;
    form.dataset.siap = "ya";
    form.dataset.dinilai = "tidak";
    form.querySelector(".quiz-actions").hidden = false;
    if (pulihkan(form)) return;
    hitungSisa(form);
    tampilkan(form, 0);
  }

  /* Penanganan lewat document agar isi versi live yang menggantikan daftar
     latihan tetap ikut bekerja tanpa perlu dipasangi ulang. */
  document.addEventListener("submit", (peristiwa) => {
    const form = peristiwa.target.closest(".quiz");
    if (!form) return;
    peristiwa.preventDefault();
    form.dataset.dinilai = "ya";
    tampilkanHasil(form, nilai(form));
    hitungSisa(form);
    tampilkan(form, 0);
    simpan(form);
    form.querySelector(".quiz-langkah").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.addEventListener("click", (peristiwa) => {
    const tombol = peristiwa.target.closest(".quiz-prev, .quiz-next, .quiz-reset");
    if (!tombol) return;
    const form = tombol.closest(".quiz");
    if (tombol.classList.contains("quiz-reset")) ulang(form);
    else tampilkan(form, Number(form.dataset.langkah || 0) + (tombol.classList.contains("quiz-next") ? 1 : -1));
    simpan(form);
  });

  document.addEventListener("change", (peristiwa) => {
    const form = peristiwa.target.closest(".quiz");
    if (!form) return;
    hitungSisa(form);
    simpan(form);
  });

  /* Peristiwa toggle tidak menggelembung, jadi ditangkap pada fase capture. */
  document.addEventListener("toggle", (peristiwa) => {
    const rincian = peristiwa.target.closest && peristiwa.target.closest(".quiz-embed");
    const form = rincian && rincian.querySelector(".quiz");
    if (form && form.dataset.siap === "ya") simpan(form);
  }, true);

  /* Form baru bisa muncul setelah isi versi live mengganti daftar latihan. */
  const siapkanSemua = () => document.querySelectorAll(".quiz").forEach(siapkan);
  siapkanSemua();
  const wadah = document.querySelector('[data-live="practice"]');
  if (wadah && window.MutationObserver) new MutationObserver(siapkanSemua).observe(wadah, { childList: true, subtree: true });
})();
