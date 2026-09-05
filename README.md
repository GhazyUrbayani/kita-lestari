# KITA LESTARI

## Menjalankan di komputer

Gunakan Node.js 20 atau lebih baru.

```sh
npm install
npm run dev
```

Buka alamat yang ditampilkan terminal, biasanya `http://localhost:4321`.

## Membuat hasil siap unggah

```sh
npm run build
npm run preview
```

Hasil situs berada di folder `dist`. Perintah build mengambil lima tab publik dari Spreadsheet (`materi`, `latihan`, `pengumuman`, `tim`, dan `kredit`) lalu membuat salinan CSV di `dist/data/snapshot.json`.

## Commit dan push ke GitHub

Folder proyek ini belum menjadi repositori Git. Lakukan sekali saja di Terminal, setelah membuat repositori GitHub **kosong** bernama `kita-lestari`:

```sh
git init
git branch -M main
git add .
git commit -m "Buat situs KITA LESTARI"
git remote add origin https://github.com/NAMA-AKUN-GITHUB/kita-lestari.git
git push -u origin main
```

Ganti `NAMA-AKUN-GITHUB` dengan nama akun GitHub sendiri. Untuk mengirim perubahan berikutnya:

```sh
git add .
git commit -m "Jelaskan perubahan singkat"
git push
```

Jangan mengirim file `.env`, folder `node_modules`, atau folder `dist`. File-file itu sudah diabaikan oleh `.gitignore`.

### Menggunakan GitHub Desktop

1. Buka GitHub Desktop dan masuk ke akun GitHub.
2. Pilih **File → Add Local Repository**, lalu pilih folder proyek ini.
3. Jika GitHub Desktop mengatakan folder belum menjadi repositori, pilih **Create a Repository**. Gunakan nama `kita-lestari` dan folder proyek yang sama. Jangan buat README baru karena proyek sudah memilikinya.
4. Buka tab **Changes**. Tulis `Buat situs KITA LESTARI` pada kotak **Summary**, lalu pilih **Commit to main**.
5. Pilih **Publish repository**. Isi nama `kita-lestari`, pilih akun pribadi atau organisasi, lalu pilih **Publish Repository**.

Untuk perubahan berikutnya, simpan perubahan file terlebih dahulu. Di GitHub Desktop buka **Changes**, periksa daftar file, isi **Summary**, pilih **Commit to main**, lalu pilih **Push origin**. Push inilah yang akan menjalankan deploy otomatis bila Cloudflare Pages sudah dihubungkan ke repositori.

## Deploy Cloudflare Pages dengan GitHub — pilihan yang dianjurkan

1. Masuk ke Cloudflare lalu buka **Workers & Pages**.
2. Pilih **Create application → Pages → Connect to Git**.
3. Hubungkan GitHub dan pilih repositori `kita-lestari`.
4. Isi pengaturan berikut:

| Pengaturan | Nilai |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| `NODE_VERSION` | `20` |
| `ADMIN_ENABLED` | `false` |

5. Pilih **Save and Deploy**. Cloudflare memberi alamat `*.pages.dev`.

Setelah itu, setiap `git push` ke `main` akan membangun dan menerbitkan versi baru secara otomatis.

## Deploy Cloudflare Pages tanpa GitHub

Pilih cara ini hanya bila tidak ingin memakai GitHub. Jalankan `npm run build`, lalu di Cloudflare buka **Workers & Pages → Create application → Get started → Drag and drop your files**. Masukkan nama proyek, unggah folder `dist`, lalu pilih **Deploy site**.

Untuk pembaruan berikutnya, jalankan `npm run build` lagi lalu pilih **Create a new deployment** dan unggah `dist` lagi. Proyek Direct Upload tidak dapat diubah menjadi proyek Git integration; pilih salah satu cara dari awal.

## Spreadsheet sebagai sumber isi

| Halaman | Tab Spreadsheet |
| --- | --- |
| Beranda: pengumuman | `pengumuman` |
| Beranda dan daftar materi | `materi` |
| Halaman materi | `materi` |
| Latihan | `latihan` |
| Tentang tim | `tim` dan `kredit` |

Saat build, situs mengambil data terbaru dari tab-tab tersebut dan menaruh salinannya di `dist/data/snapshot.json`. Jadi situs selalu memiliki isi yang bisa dibaca saat jaringan bermasalah atau JavaScript dimatikan.

Saat halaman dibuka, situs juga dapat mengambil CSV terbaru di latar belakang. Agar bagian ini bekerja tanpa build baru, lakukan sekali saja di Spreadsheet: **File → Share → Publish to web**, lalu publikasikan hanya `materi`, `latihan`, `pengumuman`, `tim`, dan `kredit` sebagai CSV. Jangan publikasikan `soal`, karena tab itu memuat kunci jawaban dan pembahasan. Setelah lima tautan CSV terbit tersedia, masukkan ke konfigurasi situs satu kali.

Di tab `materi`, `gambar_url` menampilkan gambar pada halaman materi. `pdf_url` menampilkan PDF di halaman materi yang sama. Link berbagi Google Drive boleh ditempel langsung setelah akses file diatur menjadi “siapa saja yang memiliki link dapat melihat”.
