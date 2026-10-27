# Belajar Redis

Materi Redis untuk pemula dalam bahasa Indonesia, dari nol sampai penerapan di aplikasi. Dibangun dengan [MkDocs](https://www.mkdocs.org/) dan [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/).

Rujukan teknis utama adalah dokumentasi resmi: <https://redis.io/docs/latest/>.

## Status materi

| Bagian | Bab | Status |
|---|---|---|
| Pengenalan | Apa itu Redis, Instalasi dengan Docker, `redis-cli` pertama kali, Key dan expiry | Ditulis (perintah belum diuji di Redis, lihat di bawah) |
| Struktur Data | String, Hash, List, Set, Sorted Set, dan lainnya | Belum |
| Pola Penerapan | Caching, Session dan rate limiting, Pub/Sub, Streams, Transaksi | Belum |
| Python dan FastAPI | `redis-py`, FastAPI, caching, rate limit | Belum |
| Operasi | Persistence, Keamanan, Monitoring | Belum |
| Proyek Akhir | Perancangan sampai pengujian | Belum |

Semua blok "Output yang diharapkan" di bab yang sudah ditulis masih berstatus **diharapkan**, bukan terverifikasi. Daftar uji di komputer ber-Docker ada di `TASK_VERIFIKASI_DOCKER.md`.

## Isi repository

```
mkdocs.yml                     identitas situs, tema, nav, ekstensi, aset
requirements.txt               dependensi Python
CLAUDE.md                      aturan penulisan materi (standar bab, kode, Markdown)
PRD.md                         kebutuhan produk
TECHNICAL_DESIGN.md            rancangan teknis
VALIDATION_REPORT.md           hasil validasi yang benar-benar dijalankan
TASK_VERIFIKASI_DOCKER.md      daftar uji untuk komputer yang punya Docker
docs/                          semua konten yang dipublikasikan
  index.md
  pengenalan/                  index.md (halaman pembuka) dan bab-bab bagian Pengenalan
  stylesheets/extra.css        penyesuaian kecil, mengikuti variabel tema
  javascripts/mathjax.js       konfigurasi MathJax (rumus LaTeX)
  javascripts/mermaid-config.js
  assets/vendor/mermaid/       Mermaid yang disertakan, versi dipatok
examples/                      sumber kode di luar docs (untuk snippet)
```

## Menjalankan secara lokal

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
mkdocs serve              # http://127.0.0.1:8000, reload otomatis
mkdocs build --strict     # build ke site/; gagal jika ada tautan rusak
```

macOS/Linux: `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.

Dependensi: `mkdocs>=1.6,<2`, `mkdocs-material>=9.5,<10`, `pymdown-extensions>=10.8,<13`. Material 9.7 menampilkan kotak pemberitahuan "MkDocs 2.0" di setiap build. Itu pengumuman dari upstream, bukan warning proyek, dan tidak menggagalkan `--strict`.

## Menulis bab baru

1. Salin kerangka bab dari `docs/redis/_template-bab.md` (tidak diterbitkan; dikecualikan lewat `exclude_docs` di `mkdocs.yml`).
2. Baca `CLAUDE.md`. Setiap bab wajib memuat: tujuan belajar, prasyarat, konsep dan analogi, contoh langkah demi langkah, kode lengkap bila sesuai, penjelasan perintah, output yang diharapkan, troubleshooting, latihan, ringkasan, dan referensi resmi.
3. Buat `docs/<bagian>/<nama-bab>.md` dengan satu judul `#`. Nama file memakai huruf kecil dan tanda hubung.
4. Bagian baru wajib punya `index.md` sebagai halaman pembuka, dibuat bersama bab pertama dan ditaruh paling atas di `nav` (aturannya ada di `CLAUDE.md`).
5. Daftarkan di `nav` pada `mkdocs.yml`. Hanya daftarkan file yang sudah ada, karena `--strict` menolak entri nav yang filenya tidak ditemukan.
6. Pakai tautan relatif antar bab, misalnya `[Key dan expiry](key-dan-expiry.md)`.
7. Jalankan `mkdocs build --strict`.

Konvensi Markdown yang dipakai bab yang ada:

- Blok kode dengan bahasa (` ```bash `, ` ```text `, ` ```python `), plus `title="..."` bila perlu. Tombol salin otomatis.
- Admonition: `!!! note`, `!!! warning`, `!!! danger`; `??? question` dan `??? success` untuk yang bisa dilipat. Jangan memakai `\"` di judul admonition; pakai tanda kutip lengkung.
- Referensi resmi memakai footnote (`[^1]`) dengan definisinya di bagian "Referensi resmi".
- Diagram: blok ` ```mermaid `. Mermaid disertakan di `docs/assets/vendor/mermaid/` sehingga tidak butuh jaringan.
- Rumus LaTeX: `$...$` dan `$$...$$` (MathJax dimuat dari `cdn.jsdelivr.net`, butuh jaringan). Materi saat ini belum memakai rumus.
- Berkas kode dari `examples/` bisa disisipkan dengan `--8<-- "jalur/relatif/dari/examples/file.py"`.

## Tema

Tombol di header berganti System, Light, Dark. Bahasa antarmuka diatur `theme.language: id`. Sidebar: grup bisa dibuka dan ditutup. Tautan repository tidak ditampilkan di header (`repo_url` tidak diisi). CSS kustom hanya memakai variabel `var(--md-*)`.

## Deploy ke GitHub Pages

1. Buat repository GitHub dan push ke `main`.
2. Pastikan `site_url` di `mkdocs.yml` benar: `https://<user>.github.io/<repo>/`.
3. Jalankan `mkdocs gh-deploy --strict`. Perintah ini membangun situs dan mendorongnya ke branch `gh-pages`.
4. Di GitHub: **Settings, Pages, Deploy from a branch, `gh-pages` / root**.

Belum ada yang dideploy dari repository ini.

## Ketergantungan jaringan saat dibuka di browser

| Sumber | Kapan | Catatan |
|---|---|---|
| `cdn.jsdelivr.net` (MathJax 3.2.2) | setiap halaman | hanya perlu bila ada rumus |
| Google Fonts | tidak pernah | `theme.font: false` memakai font sistem |
| Mermaid | tidak pernah | disertakan di repo |

## Lisensi

[MIT](LICENSE). Library Mermaid di `docs/assets/vendor/mermaid/` juga MIT dan menyertakan `LICENSE` sendiri.
