# PRD: Belajar Redis

Status: berjalan · Diperbarui: 2026-10-27

## 1. Gambaran produk

Situs dokumentasi MkDocs berbahasa Indonesia yang mengajarkan Redis dari nol: dasar, struktur data, pola penerapan, integrasi Python dan FastAPI, operasi, lalu proyek akhir. Rujukan teknis utama adalah dokumentasi resmi Redis (<https://redis.io/docs/latest/>).

## 2. Masalah

Pemula Redis berbahasa Indonesia sulit menemukan materi runtut yang menjelaskan *kenapa* sebuah perintah dipakai, bukan hanya *apa* perintahnya, dan yang memisahkan jelas antara output yang diharapkan dan yang benar-benar teruji.

## 3. Pengguna

- **Pembaca (utama):** pemula yang belajar Redis, membaca di desktop atau ponsel.
- **Penulis/pengelola:** menulis bab dalam Markdown, mendaftarkannya di `nav`, dan memvalidasi build.

## 4. Tujuan dan non-tujuan

**Tujuan:** kurikulum runtut dan kecil per bab; penjelasan alasan di balik tiap perintah; contoh yang bisa dijalankan; build `--strict` bersih; kompatibel GitHub Pages.

**Non-tujuan:** mesin eksekusi kode; kerangka frontend sendiri; mengarang output perintah; deploy atau commit otomatis; materi Redis Enterprise atau Cloud secara mendalam.

## 5. Kurikulum

Bab bertanda *(opsional)* boleh dilewati. Folder dan nama file mengikuti konvensi kebab-case.

| Bagian | Folder | Bab |
|---|---|---|
| 1. Pengenalan | `pengenalan/` | Apa itu Redis · Instalasi dengan Docker · Menjalankan `redis-cli` pertama kali · Key dan expiry |
| 2. Struktur Data | `struktur-data/` | String · Hash · List · Set · Sorted Set · Bitmap, HyperLogLog, Geo *(opsional)* · Memilih struktur data |
| 3. Pola Penerapan | `pola-aplikasi/` | Caching · Session dan rate limiting · Pub/Sub · Streams · Transaksi · Lua script *(opsional)* |
| 4. Python dan FastAPI | `python/` | `redis-py` dasar · Struktur data di Python · Pipeline dan connection pool · FastAPI dasar · FastAPI caching dan rate limit · FastAPI realtime *(opsional)* |
| 5. Operasi | `operasi/` | Persistence · Keamanan · Monitoring · Replikasi, Sentinel, Cluster *(opsional)* |
| 6. Proyek Akhir | `proyek-akhir/` | Perancangan · Implementasi API · Fitur realtime · Operasi dan pengujian |

Ketergantungan utama: Pengenalan harus lebih dulu; Streams membutuhkan List dan Pub/Sub; bagian Python dan FastAPI membutuhkan Struktur Data serta bab Caching dan Rate limit; Proyek Akhir memakai hampir semua bab sebelumnya. Bab yang sudah ada tercantum di `README.md`.

## 6. Persyaratan fungsional

Wajib untuk setiap bab (sumber: `CLAUDE.md`):

1. Tujuan belajar. 2. Prasyarat. 3. Konsep dan analogi. 4. Contoh langkah demi langkah. 5. Kode lengkap bila sesuai. 6. Penjelasan perintah dan parameter. 7. Output yang diharapkan dan cara membacanya. 8. Troubleshooting. 9. Latihan. 10. Ringkasan. Ditambah referensi resmi.

Aturan isi:

- Label lingkungan eksekusi (terminal, redis-cli, Python, YAML, shell).
- Output yang belum dijalankan harus dinyatakan sebagai "diharapkan"; jangan mengarang output.
- Perintah destruktif dan risiko kehilangan data ditandai.
- Secret memakai placeholder, tidak pernah kredensial asli.
- Perintah diverifikasi terhadap versi Redis yang dituju dan dokumentasi resmi.
- Bab tidak mengulang penjelasan bab lain; gunakan tautan relatif.
- Bab opsional diberi catatan "Opsional".

Fitur situs: sidebar hierarkis yang bisa dibuka dan ditutup, pencarian, breadcrumb, tombol sebelumnya/berikutnya, tombol salin pada kode, admonition, tab, tabel, diagram Mermaid, tema System/Light/Dark, antarmuka berbahasa Indonesia.

## 7. Persyaratan non-fungsional

- `mkdocs build --strict` tanpa warning atau error proyek.
- Tanpa font eksternal dan tanpa analytics; tidak ada tautan GitHub di header.
- Responsif di lebar desktop, tablet, ponsel; tabel lebar dan kode bergulir horizontal di dalam bloknya.
- Fokus keyboard terlihat; kontras memadai di tema terang dan gelap (warna kustom hanya lewat variabel `--md-*`).
- CSS dan JavaScript kustom seminimal mungkin.

## 8. Stack

Python 3.12+ (dikembangkan di 3.14); `mkdocs>=1.6,<2`; `mkdocs-material>=9.5,<10`; `pymdown-extensions>=10.8,<13`; Mermaid 11.17.2 disertakan di repo; MathJax 3.2.2 dari CDN (opsional, untuk rumus). Rincian ada di `TECHNICAL_DESIGN.md`.

## 9. Kriteria penerimaan per bab

| Area | Kriteria | Cara |
|---|---|---|
| Build | `mkdocs build --strict` exit 0 | CLI |
| Tautan dan nav | tidak ada tautan rusak; setiap bab ada di `nav` | build strict |
| Struktur | 10 unsur wajib ada; satu judul `#` | tinjauan |
| Akurasi | sintaks dan nilai balik cocok dengan redis.io | tinjauan terhadap dokumentasi resmi |
| Keteruji | perintah dijalankan di Redis nyata, hasil dicatat | `TASK_VERIFIKASI_DOCKER.md` |
| Tampilan | sidebar, diagram, footnote, lebar ponsel | browser |

## 10. Deployment

Kompatibel dengan `mkdocs gh-deploy` (belum dijalankan). `site_url` harus `https://<user>.github.io/<repo>/`. Jalur aset relatif sehingga situs berfungsi di sub-path. Tidak ada domain kustom.

## 11. Risiko dan asumsi

- Perintah pada bab yang sudah ditulis belum dijalankan (Docker tidak tersedia saat penulisan); lihat `TASK_VERIFIKASI_DOCKER.md`.
- Material for MkDocs 9.x berada dalam mode pemeliharaan upstream; `mkdocs<2` dipatok.
- MathJax dimuat dari CDN pihak ketiga dan hanya dibutuhkan jika bab memakai rumus.
- Versi Redis target belum dikunci; bab menyebut versi minimum bila relevan dan memakai `redis:latest` hanya untuk belajar.
