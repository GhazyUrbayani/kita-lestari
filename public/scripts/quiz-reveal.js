(() => {
  /* Google Form berada di domain lain, jadi isinya tidak dapat dibaca dari sini.
     Yang dapat dihitung adalah jumlah pemuatan iframe: muat pertama menampilkan
     form, muat berikutnya berarti tombol Kirim sudah ditekan dan halaman
     konfirmasi masuk. Saat itulah kunci jawaban dibuka. */
  function wire(frame) {
    if (frame.dataset.revealWired) return;
    frame.dataset.revealWired = "1";
    let loads = 0;
    frame.addEventListener("load", () => {
      loads += 1;
      if (loads < 2) return;
      const card = frame.closest(".content-card");
      const panel = card && card.querySelector(".answer-key");
      if (!panel || !panel.hidden) return;
      panel.hidden = false;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function wireAll() {
    document.querySelectorAll(".form-embed iframe").forEach(wire);
  }

  wireAll();
  const host = document.querySelector('[data-live="practice"]');
  if (host && window.MutationObserver) new MutationObserver(wireAll).observe(host, { childList: true, subtree: true });
})();
