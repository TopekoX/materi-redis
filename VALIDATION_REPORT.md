# Validation Report: Belajar Redis

Diperbarui: 2026-10-27 · Platform: Windows 10 (build awal) dan Pop!_OS 24.04 (verifikasi Docker) · Tidak ada commit, push, atau deploy.

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

Seluruh bab di `docs/` (Pengenalan, Struktur Data, Pola Penerapan, Python dan FastAPI, Operasi, Proyek Akhir) serta konfigurasi yang terpengaruh (`mkdocs.yml`).

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

## Verifikasi perintah di Docker (2026-10-27)

Dijalankan di Pop!_OS 24.04 dengan Docker 29.9.2, `redis:latest` (Redis 8.10.3), Python 3.12.3, redis-py 8.1.0, FastAPI 0.162.0, Uvicorn 0.54.0, httpx 0.28.1, pytest 9.1.1, fakeredis 2.40.0. `mkdocs build --strict` tetap berhasil setelah perubahan.

| Cakupan | Hasil |
|---|---|
| Perintah `redis-cli`, skrip Python, FastAPI, SSE | Dijalankan terhadap Redis nyata; hasil sama dengan bab setelah koreksi |
| `docker compose` (ACL, persistence, `volatile-lru`), replikasi dua container, persistence RDB/AOF | Dijalankan; perilaku dicatat di bab |
| `pytest test_katalog.py` | 9 lulus bila `realtime` terdaftar; 8 lulus dan 1 gagal bila belum |

Koreksi yang dihasilkan: `sismember` mengembalikan `1`, placeholder jarak Geo diganti angka nyata, `ACL LIST` memuat `sanitize-payload`, `ACL WHOAMI` ditolak untuk pengguna terbatas, angka dan bentuk slowlog di Monitoring, `docker kill` tidak memicu `restart: unless-stopped`, serta nama volume Compose berawalan nama folder.

## Belum diverifikasi

- **Prompt interaktif `redis-cli`** (prompt `127.0.0.1:6379>`, Tab, riwayat, `exit`, `not connected>`, sesi `SUBSCRIBE` dan Ctrl-C): pengujian berjalan tanpa terminal interaktif.
- `redis-cli` terpasang di komputer (di luar container) dan pesan galat saat daemon Docker mati.
- Nama key rate limit untuk klien IPv6 (`::1`) dan tes proyek akhir terhadap Redis asli (bukan fakeredis).
- Tampilan fitur realtime di browser (`EventSource`, `Last-Event-ID` saat sambung ulang).
- Tampilan di browser: sidebar buka-tutup, diagram Mermaid (terang dan gelap), tema System/Light/Dark, lebar ponsel, tombol salin, pencarian, kontras. Tidak ada browser yang dijalankan untuk repository ini.
- Instalasi di venv baru (`pip check`), Python 3.12, browser selain yang akan dipakai penulis.
- `mkdocs gh-deploy` dan hosting GitHub Pages: sengaja tidak dijalankan; `site_url` perlu dipastikan sebelum deploy.

## Keterbatasan yang diketahui

- MathJax dimuat dari CDN di setiap halaman, walau bab saat ini belum memakai rumus.
- Mermaid (sekitar 3,5 MB) diunduh di setiap halaman karena dimuat lewat `extra_javascript` (di-cache setelah pertama kali).
- Material for MkDocs 9.x berada dalam mode pemeliharaan upstream.

## Catatan: hasil validasi template lama

Versi sebelumnya dari berkas ini melaporkan pengujian browser pada template (MathJax, Mermaid, tema, pencarian, 2026-10-17, Windows 11, Chrome headless). Pengujian itu dilakukan pada halaman contoh yang sudah dihapus, jadi hasilnya tidak diwarisi di sini. Infrastruktur yang sama (Mermaid yang disertakan, tema, skrip) tetap dipakai, tetapi masih perlu diuji ulang pada halaman Redis di browser.
