# TASK: Verifikasi Bab Pengenalan di Komputer dengan Docker

File ini ada di root repository (bukan di `docs/`), jadi tidak ikut dipublikasikan.

Latar belakang: keempat bab di `docs/pengenalan/` ditulis di komputer **tanpa Docker**. Sintaks dan nilai balik sudah dicocokkan dengan dokumentasi resmi redis.io, tetapi **belum ada perintah yang dijalankan**. Semua blok "Output yang diharapkan" masih berstatus *diharapkan*, bukan *terverifikasi*.

## Cara memakai file ini

1. Jalankan di komputer yang punya Docker. Baca `CLAUDE.md` lebih dulu.
2. Kerjakan item dari atas ke bawah. Setelah item dijalankan, ganti tanda kotak kosong di kolom ✓ menjadi `[x]` dan isi kolom **Hasil**.
3. Tampilkan sisa pekerjaan kapan saja:

   ```bash
   grep -n -- "- \[ \]" TASK_VERIFIKASI_DOCKER.md
   ```

   Hitung yang belum selesai: `grep -c -- "- \[ \]" TASK_VERIFIKASI_DOCKER.md`

## Aturan

- Jangan menulis "terverifikasi" untuk perintah yang tidak benar-benar dijalankan.
- Jika hasil berbeda dari bab, perbaiki **hanya** kalimat atau blok output terkait di file bab. Jangan menulis ulang bab, mengubah tema, atau mengubah konfigurasi lain.
- Jangan menyalin output yang tidak teramati. Angka seperti ID container dan sisa TTL boleh berbeda; cukup tulis bentuknya.
- Setelah semua perbaikan, jalankan `mkdocs build --strict` dan catat hasilnya.
- Selesai uji, hapus container uji: `docker rm -f redis`.

## Lingkungan uji (isi)

| Item | Nilai |
|---|---|
| Tanggal | |
| Sistem operasi | |
| Versi Docker (`docker --version`) | |
| Versi Redis (`docker exec redis redis-server --version`) | |
| Tag image yang dipakai | `redis:latest` |

---

## A. Bab 2: Instalasi dengan Docker (`docs/pengenalan/instalasi-dengan-docker.md`)

Pastikan tidak ada container bernama `redis` dan port 6379 bebas sebelum mulai (`docker ps -a`).

| ✓ | ID | Perintah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | A1 | `docker --version` dan `docker info` tampil Client dan Server tanpa galat | |
| - [ ] | A2 | `docker run -d --name redis -p 6379:6379 redis:latest` mengunduh image lalu mencetak satu ID container panjang | |
| - [ ] | A3 | `docker ps` menampilkan baris `redis`, image `redis:latest`, status `Up ...`, port `6379->6379/tcp` | |
| - [ ] | A4 | `docker exec redis redis-server --version` mencetak satu baris berisi nomor versi. Catat versinya di tabel lingkungan | |
| - [ ] | A5 | `docker logs redis` memuat baris yang menyatakan server siap menerima koneksi. Catat kalimat aslinya | |
| - [ ] | A6 | `docker exec -it redis redis-cli` lalu `PING` membalas `PONG`; `exit` keluar dari sesi (**`exit` belum diverifikasi di dokumentasi**) | |
| - [ ] | A7 | `docker stop redis`, `docker start redis`, lalu `docker exec -it redis redis-cli` berhasil lagi | |
| - [ ] | A8 | Saat container berhenti, `docker exec -it redis redis-cli` gagal (latihan 2). Catat pesannya | |
| - [ ] | A9 | Varian `-p 127.0.0.1:6379:6379` (di admonition keamanan) berjalan dan `PING` tetap `PONG` dari komputer yang sama | |
| - [ ] | A10 | Jalankan `redis-cli -h 127.0.0.1 -p 6379` dari komputer (jika `redis-cli` lokal terpasang) | |
| - [ ] | A11 | Latihan 3: buat ulang dengan `-p 6380:6379`, sambung dengan `-p 6380` | |

**Pesan galat di tabel troubleshooting** (cocokkan kalimat aslinya, ganti isi tabel bila beda):

| ✓ | ID | Cara memicu | Hasil |
|---|---|---|---|
| - [ ] | A12 | `container name "/redis" is already in use`: jalankan `docker run` kedua dengan nama sama | |
| - [ ] | A13 | `port is already allocated`: jalankan container lain dengan `-p 6379:6379` saat port terpakai | |
| - [ ] | A14 | `Could not connect to Redis ... Connection refused`: sambung ke port yang tidak dipetakan | |
| - [ ] | A15 | `failed to connect to the docker API ...`: matikan Docker Desktop lalu jalankan `docker info` (di Linux: daemon berhenti). Pesan di komputer asli sudah teramati di Windows | |

**Klaim yang perlu dipastikan**

| ✓ | ID | Klaim di bab | Hasil |
|---|---|---|---|
| - [ ] | A16 | "Setelah `docker rm redis` data ikut hilang kecuali ada volume." Uji: `SET x 1`, `docker stop redis`, `docker rm redis`, buat ulang, `GET x`. Cek juga `docker volume ls` untuk volume anonim yang tersisa. Sesuaikan kalimat bila perlu | |
| - [ ] | A17 | `docker rm redis` pada container yang masih berjalan ditolak (bab menulis "harus dalam keadaan berhenti") | |

## B. Bab 3: Menjalankan redis-cli pertama kali (`docs/pengenalan/menjalankan-redis-cli-pertama-kali.md`)

Mulai dari container `redis` yang bersih dan database kosong (`DBSIZE` = 0).

| ✓ | ID | Perintah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | B1 | Prompt `127.0.0.1:6379>` muncul setelah `docker exec -it redis redis-cli` | |
| - [ ] | B2 | `PING` → `PONG` | |
| - [ ] | B3 | `SET nama "Budi"` → `OK`; `GET nama` → `"Budi"` | |
| - [ ] | B4 | `GET tidak_ada` → `(nil)` | |
| - [ ] | B5 | `EXISTS nama` → `(integer) 1`; `DBSIZE` → `(integer) 1` | |
| - [ ] | B6 | `SET pesan "Halo Dunia"` → `OK`; `GET pesan` → `"Halo Dunia"` | |
| - [ ] | B7 | `HELP SET` menampilkan sintaks dan ringkasan; `HELP @string` menampilkan daftar perintah | |
| - [ ] | B8 | Tab melengkapi nama perintah (`Z` + Tab), panah atas memunculkan riwayat, `CLEAR` membersihkan layar | |
| - [ ] | B9 | `docker exec redis redis-cli GET nama` (tanpa `-it`) mencetak `Budi` tanpa tanda kutip | |
| - [ ] | B10 | `docker exec redis redis-cli DBSIZE` (tanpa `-it`) mencetak angka saja, tanpa `(integer)` (latihan 5) | |
| - [ ] | B11 | Hasil dengan `--raw` dibanding tanpa: `docker exec -it redis redis-cli --raw GET nama` | |

**Pesan galat di tabel troubleshooting**

| ✓ | ID | Cara memicu | Hasil |
|---|---|---|---|
| - [ ] | B12 | `PING` salah ketik, misalnya `POING` → tulis kalimat asli `(error) ERR unknown command ...` | |
| - [ ] | B13 | `SET nama` → `(error) ERR wrong number of arguments for 'set' command` | |
| - [ ] | B14 | `SET sapaan Halo Dunia` → `(error) ERR syntax error` (latihan 3) | |
| - [ ] | B15 | `Error response from daemon: No such container: redis` (jalankan `docker exec` dengan nama salah) | |
| - [ ] | B16 | Prompt `not connected>` saat container berhenti di tengah sesi | |
| - [ ] | B17 | Perintah huruf kecil (`ping`, `get nama`) berfungsi sama (klaim: nama perintah tidak membedakan huruf besar dan kecil) | |

## C. Bab 4: Key dan expiry (`docs/pengenalan/key-dan-expiry.md`)

Bersihkan dulu key uji bab ini (hanya key dari bab ini, jangan `FLUSHALL` kalau ada data lain).

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | C1 | Langkah 1: tiga `SET` membalas `OK` | |
| - [ ] | C2 | Langkah 2: `EXISTS user:1:nama` → 1, `TYPE` → `string`, `DEL user:2:nama` → 1, `EXISTS user:2:nama` → 0 | |
| - [ ] | C3 | Langkah 2: `TYPE` pada key yang tidak ada → `none`; `DEL` pada key yang tidak ada → 0 | |
| - [ ] | C4 | Langkah 3: `EXPIRE sesi:abc123 30` → 1; `TTL` → sekitar 30 dan turun jika diulang | |
| - [ ] | C5 | Langkah 4: setelah >30 detik, `GET` → `(nil)` dan `TTL` → `-2` | |
| - [ ] | C6 | Langkah 5: `SET kode:otp "482913" EX 10` → `OK`; `TTL` → sekitar 10 atau 9 | |
| - [ ] | C7 | Langkah 6: `SET`, `EXPIRE 60`, `PERSIST`, `TTL` → `OK`, 1, 1, `-1` | |
| - [ ] | C8 | Langkah 7: setelah `SET` menimpa key, `TTL` → `-1` | |
| - [ ] | C9 | Langkah 8: `SCAN 0 MATCH user:* COUNT 100` → kursor `"0"` dan daftar key. Catat bentuk output persisnya | |
| - [ ] | C10 | Langkah 8: pada data banyak (mis. 500 key `user:N:nama` lewat skrip), kursor bukan `0` dan perlu diulang; satu key bisa muncul ganda atau panggilan kosong | |
| - [ ] | C11 | Langkah 9: `docker exec redis redis-cli --scan --pattern "user:*"` mencetak nama key satu per baris | |
| - [ ] | C12 | Troubleshooting: `EXPIRE key 0` (dan negatif) menghapus key; `EXPIRE` pada key tidak ada → 0 | |
| - [ ] | C13 | Latihan 4: hitung berapa panggilan `SCAN ... COUNT 1` sampai kursor `0` pada data uji, dan sesuaikan petunjuk bila perlu | |

## D. Bab 1: Apa itu Redis (`docs/pengenalan/apa-itu-redis.md`)

| ✓ | ID | Cek | Hasil |
|---|---|---|---|
| - [ ] | D1 | Blok "contoh bacaan" (`PING` → `PONG`, `SET nama "Budi"` → `OK`, `GET nama` → `"Budi"`) cocok dengan hasil nyata | |
| - [ ] | D2 | Latihan 3: `GET` sebelum `SET` → `(nil)` | |

## E. Tampilan di browser (`mkdocs serve`, buka http://127.0.0.1:8000)

Dikerjakan di komputer mana pun yang punya browser; tidak perlu Docker.

| ✓ | ID | Cek | Hasil |
|---|---|---|---|
| - [ ] | E1 | Sidebar: grup **Pengenalan** bisa dibuka dan ditutup dengan klik, dan grup terbuka otomatis saat halamannya aktif (fitur `navigation.sections` sudah dihapus) | |
| - [ ] | E2 | Diagram Mermaid di bab 1 dan bab 2 tampil di mode terang dan gelap | |
| - [ ] | E3 | Judul admonition `??? question` di bab 1 tampil dengan tanda kutip lengkung, tanpa garis miring | |
| - [ ] | E4 | Footnote (superskrip) menautkan ke bagian *Referensi resmi* dan tautan kembali berfungsi | |
| - [ ] | E5 | Tabel lebar di bab 2 dan bab 3 tidak membuat halaman bergeser horizontal di lebar ponsel (375 px) | |
| - [ ] | E6 | Tombol salin muncul di blok kode ` ```bash `; blok ` ```text ` berfungsi | |
| - [ ] | E7 | Pencarian "expiry" menemukan bab 4 | |

## F. Penutup

| ✓ | ID | Tugas | Hasil |
|---|---|---|---|
| - [ ] | F1 | Untuk setiap item di atas yang hasilnya **sama** dengan bab: ubah label "diharapkan" menjadi "terverifikasi (Redis `<versi>`, `<tanggal>`)" di blok atau admonition "Status verifikasi" terkait | |
| - [ ] | F2 | Untuk setiap item yang hasilnya **berbeda**: perbaiki kalimat atau output di bab dan catat di tabel perubahan di bawah | |
| - [ ] | F3 | `mkdocs build --strict` berhasil tanpa warning proyek | |
| - [ ] | F4 | `docker rm -f redis` dan hapus volume uji yang tersisa | |

## Catatan di luar cakupan bab (opsional, jangan dikerjakan tanpa diminta)

- `PROMPT_MKDOCS_TEMPLATE.md` adalah prompt pembuatan template lama dan belum diubah atau dihapus.
- `CLAUDE.md` merujuk `docs/redis/_template-bab.md`, file yang sudah dihapus.

## Tabel perubahan (isi saat memperbaiki bab)

| File | Bagian | Sebelum | Sesudah | Alasan (ID item) |
|---|---|---|---|---|
| | | | | |
