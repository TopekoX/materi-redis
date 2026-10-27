# Validation Report: Belajar Redis

Diperbarui: 2026-10-27 · Platform: Windows 10 · Tidak ada commit, push, atau deploy.

Laporan ini hanya memuat pemeriksaan yang benar-benar dijalankan. Bagian "Belum diverifikasi" adalah daftar yang menunggu uji.

## Lingkungan

Build dijalankan dengan paket yang terpasang secara global (tidak ada `.venv` di repository ini).

| Komponen | Versi |
|---|---|
| Python | 3.14.7 (Python 3.12 tidak tersedia dan tidak diuji) |
| mkdocs | 1.6.1 |
| mkdocs-material | 9.7.7 |
| pymdown-extensions | 11.0.2 |
| Markdown | 3.10.3 |
| Pygments | 2.21.0 |
| Mermaid (disertakan) | 11.17.2 |
| MathJax (CDN) | 3.2.2 |

Rentang di `requirements.txt` (`mkdocs>=1.6,<2`, `mkdocs-material>=9.5,<10`, `pymdown-extensions>=10.8,<13`) mencakup versi di atas. `pip install -r requirements.txt` di venv baru dan `pip check` **belum dijalankan** pada repository ini.

## Cakupan

Empat bab di `docs/pengenalan/`: Apa itu Redis, Instalasi dengan Docker, Menjalankan redis-cli pertama kali, Key dan expiry; serta konfigurasi yang terpengaruh (`mkdocs.yml`).

## Pemeriksaan yang dijalankan

| Pemeriksaan | Hasil |
|---|---|
| `mkdocs build --strict` setelah semua perubahan terakhir | Berhasil, tanpa `WARNING` atau `ERROR` dari proyek. Kotak pemberitahuan "MkDocs 2.0" dari Material tetap tercetak; itu pengumuman upstream dan tidak menggagalkan strict |
| Entri `nav` vs file di `docs/` | Cocok; tidak ada halaman yatim |
| Tautan internal antarbab | Valid (divalidasi build strict) |
| HTML hasil build, setiap bab | Tidak ada sisa penanda `!!!`, `???`, atau `[^`; admonition, `<details>`, dan footnote terender; blok Mermaid ada di bab 1 dan 2 |
| Footnote | Setiap definisi dipakai dan setiap pemakaian terdefinisi |
| Struktur judul | Satu `#` per halaman, lalu `##` dan `###` |
| Judul admonition bab 1 | Tidak ada `\"` tersisa di HTML |
| Tautan GitHub di header | Tidak ada tautan `repo_url` di HTML hasil build; yang tersisa hanya `canonical` dan tautan "Made with Material" di footer (dicek pada halaman awal, saat `repo_url` baru dihapus) |
| Sidebar | Elemen toggle `md-nav__toggle` ada di HTML hasil build |
| Kecocokan sintaks dengan dokumentasi resmi | `EXPIRE`, `TTL`, `SCAN`, `KEYS`, `redis-cli`, `docker run` dan `docker exec` dibandingkan dengan halaman redis.io |
| `docker info` | Dijalankan: klien Docker ada, tetapi daemon tidak berjalan; pesan galat tercatat dan dipakai di troubleshooting bab 2 |

## Belum diverifikasi

- **Semua perintah Redis dan Docker pada bab.** Docker tidak tersedia saat bab ditulis, jadi seluruh blok "Output yang diharapkan" berstatus *diharapkan*. Daftar uji lengkap: `TASK_VERIFIKASI_DOCKER.md`.
- Kalimat persis pesan galat Docker dan `redis-cli` (selain pesan daemon Docker yang teramati).
- Perintah `exit` untuk keluar dari `redis-cli` (tidak ada di halaman dokumentasi yang dibaca).
- Klaim bahwa `docker rm` menghilangkan data tanpa volume (image resmi mungkin membuat volume anonim di `/data`).
- Tampilan di browser: sidebar buka-tutup, diagram Mermaid (terang dan gelap), tema System/Light/Dark, lebar ponsel, tombol salin, pencarian, kontras. Tidak ada browser yang dijalankan untuk repository ini.
- Instalasi di venv baru (`pip check`), Python 3.12, browser selain yang akan dipakai penulis.
- `mkdocs gh-deploy` dan hosting GitHub Pages: sengaja tidak dijalankan; `site_url` perlu dipastikan sebelum deploy.

## Keterbatasan yang diketahui

- MathJax dimuat dari CDN di setiap halaman, walau bab saat ini belum memakai rumus.
- Mermaid (sekitar 3,5 MB) diunduh di setiap halaman karena dimuat lewat `extra_javascript` (di-cache setelah pertama kali).
- Material for MkDocs 9.x berada dalam mode pemeliharaan upstream.
- Bagian Struktur Data sampai Proyek Akhir belum ditulis.

## Catatan: hasil validasi template lama

Versi sebelumnya dari berkas ini melaporkan pengujian browser pada template (MathJax, Mermaid, tema, pencarian, 2026-10-17, Windows 11, Chrome headless). Pengujian itu dilakukan pada halaman contoh yang sudah dihapus, jadi hasilnya tidak diwarisi di sini. Infrastruktur yang sama (Mermaid yang disertakan, tema, skrip) tetap dipakai, tetapi perlu diuji ulang pada halaman Redis lewat `TASK_VERIFIKASI_DOCKER.md` bagian E.
