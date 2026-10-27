# TASK: Verifikasi Bab Pengenalan, Struktur Data, Pola Penerapan, serta Python dan FastAPI di Komputer dengan Docker

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

## Bagian Struktur Data (F sampai L)

Tujuh bab di `docs/struktur-data/` juga ditulis tanpa Redis nyata. Perintah dan nilai balik dicocokkan dengan dokumentasi resmi, dan angka output dihitung ulang secara manual, tetapi **belum ada yang dijalankan**. Semua blok output berstatus *diharapkan*.

Persiapan tambahan untuk F sampai L:

- Container `redis` bersih (`DBSIZE` = 0) atau tanpa key yang berawalan nama key uji bab.
- Python 3 dan paket `redis` (`pip install redis`) untuk item skrip. Simpan skrip dari bab ke file dengan nama pada kolom judul kode (mis. `string_counter.py`), jalankan dari folder di luar repository.
- Item bertanda **[uji galat]** memicu pesan galat. Cocokkan kalimat aslinya, lalu ganti isi tabel troubleshooting bila beda.
- Catat versi Redis di tabel lingkungan. Bab menyebut Redis 6.2.0+ untuk `LPOP`/`RPOP` dengan `count`, `ZRANGE ... REV`, dan `GEOSEARCH`, serta 4.0.0+ untuk `HSET` multi-pasangan. Jika versi yang dipakai lebih lama, catat perbedaannya.

## F. Bab String (`docs/struktur-data/string.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | F1 | Langkah 1: `INCR halaman:beranda` dua kali → `(integer) 1`, `(integer) 2`; `GET` → `"2"` | |
| - [ ] | F2 | Langkah 2: `INCRBY ... 10` → 12, `DECR` → 11, `DECRBY ... 5` → 6 | |
| - [ ] | F3 | Langkah 3 **[uji galat]**: `SET nama:toko "Toko Maju"` lalu `INCR nama:toko` → `(error) ERR value is not an integer or out of range` | |
| - [ ] | F4 | Langkah 4: `INCR`, `EXPIRE ... 60`, `INCR`, `TTL` → 1, 1, 2, sekitar 60 (expiry tetap ada setelah `INCR` kedua) | |
| - [ ] | F5 | Langkah 5: `MSET` → `OK`; `MGET suhu:jakarta suhu:bandung suhu:surabaya` → `"31"`, `"24"`, `(nil)` | |
| - [ ] | F6 | Langkah 6: `SET kunci:laporan "proses-A" NX EX 30` → `OK`; ulangi dengan `"proses-B"` → `(nil)`; `GET` → `"proses-A"` | |
| - [ ] | F7 | Langkah 7: `DEL kunci:cetak` → 0 (belum ada), `SETNX` → 1, `SETNX` lagi → 0, `GET` → `"siap"` | |
| - [ ] | F8 | Langkah 8: `DEL` delapan key menyebut jumlah key yang masih ada (maksimal 8) | |
| - [ ] | F9 | Skrip `string_counter.py` mencetak enam baris seperti di bab (`A dapat kunci: True`, `B dapat kunci: None`) | |
| - [ ] | F10 | **[uji galat]** `SET n 9223372036854775807` lalu `INCR n` → `ERR increment or decrement would overflow` | |
| - [ ] | F11 | **[uji galat]** `LPUSH l x` lalu `INCR l` → `WRONGTYPE ...`; `MGET l` → `(nil)` untuk key non-String (klaim di tabel troubleshooting) | |

## G. Bab Hash (`docs/struktur-data/hash.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | G1 | Langkah 1: `HSET pengguna:1 nama "Budi" email "budi@example.com" umur 25` → `(integer) 3` | |
| - [ ] | G2 | Langkah 2: `HGET` → `"Budi"`; `HMGET ... nama umur alamat` → `"Budi"`, `"25"`, `(nil)`; `HGETALL` selang-seling field dan value. Catat urutan nyata | |
| - [ ] | G3 | Langkah 3: `HSET pengguna:1 umur 26 kota "Bandung"` → `(integer) 1`; `HGET umur` → `"26"` | |
| - [ ] | G4 | Langkah 4: `HEXISTS` → 1, `HDEL` → 1, `HEXISTS` → 0, `HLEN` → 3 | |
| - [ ] | G5 | Langkah 5: `HSET produk:7 nama "Kopi" stok 10` → 2; `HINCRBY stok -3` → 7; `HINCRBY terjual 3` → 3 | |
| - [ ] | G6 | Langkah 6: `EXPIRE produk:7 60` → 1, `TTL` sekitar 60 | |
| - [ ] | G7 | Langkah 7: `DEL pengguna:1 produk:7` → 2 | |
| - [ ] | G8 | Skrip `hash_objek.py` mencetak tiga baris; `umur` kembali sebagai `'25'` (String) | |
| - [ ] | G9 | **[uji galat]** `WRONGTYPE` (`SET s x` lalu `HGET s f`); `HSET k f` → `wrong number of arguments for 'hset' command`; `HINCRBY pengguna:1 nama 1` → `ERR hash value is not an integer` | |
| - [ ] | G10 | `HGETALL` pada key tidak ada → `(empty array)`; `HDEL` field terakhir lalu `EXISTS` → 0 (Hash kosong ikut hilang) | |
| - [ ] | G11 | `HMSET k a 1` masih berfungsi di versi terpasang (klaim: deprecated, bukan dihapus) | |

## H. Bab List (`docs/struktur-data/list.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | H1 | Langkah 1: `RPUSH tugas:email "kirim-A" "kirim-B" "kirim-C"` → 3; `LRANGE 0 -1` urut A,B,C; `LPOP` → `"kirim-A"`; `LLEN` → 2 | |
| - [ ] | H2 | Langkah 2: `LPUSH undo:dokumen "ketik-1" "ketik-2" "ketik-3"` → 3; `LRANGE` → ketik-3, ketik-2, ketik-1; `LPOP` → `"ketik-3"` | |
| - [ ] | H3 | Langkah 3: `RPUSH` 4 elemen; `LPOP tugas:laporan 2` → `"L1"`, `"L2"`; `RPOP` → `"L4"` | |
| - [ ] | H4 | Langkah 4: `LRANGE 0 1` → a,b; `LRANGE -2 -1` → d,e; `LTRIM -3 -1` → `OK`; `LRANGE` → c,d,e | |
| - [ ] | H5 | Langkah 5: `LPOP sekali` mengosongkan List; `EXISTS` → 0; `LPOP` lagi → `(nil)` | |
| - [ ] | H6 | Langkah 7 (dua terminal): `BRPOP antrean:kerja 30` menunggu; `LPUSH` dari terminal lain → Terminal A mencetak key dan elemen. Catat bentuk persis baris waktu | |
| - [ ] | H7 | `BRPOP kosong 5` tanpa kiriman → `(nil)` setelah sekitar 5 detik. Catat bentuk persisnya | |
| - [ ] | H8 | Skrip `list_antrean.py` mencetak tujuh baris dan berhenti sendiri setelah sekitar 2 detik | |
| - [ ] | H9 | Troubleshooting: `LPUSH huruf a b c` lalu `LRANGE` → c,b,a | |
| - [ ] | H10 | **[uji galat]** `WRONGTYPE`; `LPOP k abc` dan `BRPOP k abc`: catat pesan asli, lalu sesuaikan baris galat `count`/`timeout` di bab | |
| - [ ] | H11 | `LPOP key 2` berfungsi di versi terpasang (klaim: butuh Redis 6.2+) | |

## I. Bab Set (`docs/struktur-data/set.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | I1 | Langkah 1: `SADD kelas:redis "budi" "sari" "tono"` → 3; `SADD ... "budi" "rina"` → 1 | |
| - [ ] | I2 | Langkah 2: `SISMEMBER sari` → 1, `dewi` → 0; `SCARD` → 4 | |
| - [ ] | I3 | Langkah 3: `SMEMBERS` berisi empat anggota (catat urutan nyata); `SREM rina` → 1, lagi → 0 | |
| - [ ] | I4 | Langkah 4: `SADD kelas:python "sari" "dewi" "tono"` → 3; `SINTER` → sari, tono; `SUNION` → empat anggota; `SDIFF kelas:redis kelas:python` → budi | |
| - [ ] | I5 | Langkah 5: `SINTERSTORE kelas:keduanya ...` → 2; `SMEMBERS` → sari, tono | |
| - [ ] | I6 | Langkah 6: `SADD pembaca:artikel-1 "u1" "u2" "u1" "u3" "u2"` → 3; `SCARD` → 3 | |
| - [ ] | I7 | Langkah 7: `DEL` empat key → 4 | |
| - [ ] | I8 | Skrip `set_irisan.py` mencetak lima baris; catat apakah `sismember` mengembalikan `True` atau `1` (versi `redis-py`) dan sesuaikan catatan di bab | |
| - [ ] | I9 | `SINTER` dengan satu key yang tidak ada → `(empty array)`; `SINTERSTORE` ke key tujuan yang sudah ada menimpa isinya | |
| - [ ] | I10 | **[uji galat]** `WRONGTYPE` (mis. `SADD` pada key List) | |

## J. Bab Sorted Set (`docs/struktur-data/sorted-set.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | J1 | Langkah 1: `ZADD papan:game 100 "budi" 250 "sari" 175 "tono"` → 3 | |
| - [ ] | J2 | Langkah 2: `ZRANGE 0 -1` → budi,tono,sari; dengan `WITHSCORES` baris genap berisi skor sebagai String; `ZRANGE 0 2 REV WITHSCORES` → sari,tono,budi | |
| - [ ] | J3 | Langkah 3: `ZADD ... 300 "budi"` → 0; `ZINCRBY ... 20 "tono"` → `"195"`; `ZSCORE budi` → `"300"` | |
| - [ ] | J4 | Langkah 4: `ZREVRANK budi` → 0, `ZRANK budi` → 2, anggota tidak ada → `(nil)` | |
| - [ ] | J5 | Langkah 5: `ZCARD` → 3, `ZCOUNT 200 300` → 2, `ZREM tono` → 1, `ZCARD` → 2 | |
| - [ ] | J6 | Langkah 7: `DEL papan:game` → 1 | |
| - [ ] | J7 | Skrip `sortedset_papan.py` mencetak lima baris (`2. tono - 195`, `peringkat budi: 3`) | |
| - [ ] | J8 | **[uji galat]** `ZADD k abc x` → `ERR value is not a valid float`; `WRONGTYPE` | |
| - [ ] | J9 | `ZREVRANGE` dan `ZRANGEBYSCORE` masih berfungsi di versi terpasang (klaim: deprecated sejak 6.2) | |
| - [ ] | J10 | Dua anggota skor sama diurutkan alfabet (klaim di tabel troubleshooting) | |

## K. Bab Bitmap, HyperLogLog, dan Geo (`docs/struktur-data/bitmap-hyperloglog-geo.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | K1 | Langkah 1: `SETBIT login:2026-10-27 7 1` dan `12 1` → 0, 0; `GETBIT 7` → 1, `GETBIT 8` → 0; `BITCOUNT` → 2 | |
| - [ ] | K2 | Langkah 2: `PFADD pengunjung:hari-ini "u1" "u2" "u3"` → 1; `PFADD ... "u2" "u4"` → 1; `PFCOUNT` → 4 | |
| - [ ] | K3 | Langkah 2: `PFMERGE pengunjung:dua-hari ...` → `OK`; `PFCOUNT` → 5 | |
| - [ ] | K4 | Langkah 3: `GEOADD kota 106.8456 -6.2088 "jakarta" 107.6191 -6.9175 "bandung" 106.8060 -6.5950 "bogor"` → 3 | |
| - [ ] | K5 | Langkah 4: `GEODIST kota jakarta bandung km`: **catat angka asli** dan ganti placeholder `"116.xxxx"` di bab | |
| - [ ] | K6 | Langkah 4: `GEOSEARCH kota FROMMEMBER jakarta BYRADIUS 80 km ASC WITHDIST`: **catat output asli** (apakah `jakarta` ikut, jarak `bogor`) dan ganti placeholder `"4x.xxxx"` di bab | |
| - [ ] | K7 | `TYPE kota` → `zset`; `ZRANGE kota 0 -1` dan `ZREM kota "bogor"` berfungsi (klaim: Geo adalah Sorted Set) | |
| - [ ] | K8 | Langkah 5: `DEL` lima key → 5 | |
| - [ ] | K9 | **[uji galat]** `GEOADD kota 200 0 x` → `ERR invalid longitude,latitude pair ...`; `SETBIT k 4294967296 1` → `ERR bit offset is not an integer or out of range`; `WRONGTYPE` | |
| - [ ] | K10 | Opsional dan berisiko memori (~512 MB): `SETBIT besar 4000000000 1`. Jalankan hanya jika RAM cukup, lalu `DEL besar`; periksa `MEMORY USAGE besar` | |

## L. Bab Memilih struktur data yang tepat (`docs/struktur-data/memilih-struktur-data-yang-tepat.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | L1 | Langkah 1: `INCR toko:pengunjung` dua kali → 1, 2 | |
| - [ ] | L2 | Langkah 2: `HSET toko:produk:1 nama "Kopi" harga 25000 stok 10` → 3; `HINCRBY stok -1` → 9 | |
| - [ ] | L3 | Langkah 3: `RPUSH toko:antrean "pesanan-1" "pesanan-2"` → 2; `LPOP` → `"pesanan-1"` | |
| - [ ] | L4 | Langkah 4: dua `SADD` → 2, 2; `SINTER` → `"sari"` | |
| - [ ] | L5 | Langkah 5: `ZINCRBY` → `"3"`, `"5"`; `ZRANGE toko:terlaris 0 0 REV WITHSCORES` → `"teh"`, `"5"` | |
| - [ ] | L6 | Langkah 6: lima `TYPE` → `string`, `hash`, `list`, `set`, `zset` | |
| - [ ] | L7 | Langkah 7: `SADD toko:salah "kopi" "teh"` → 2; `SMEMBERS` tanpa skor | |
| - [ ] | L8 | Langkah 8: `DEL` tujuh key → 7 | |

## Bagian Pola Penerapan (M sampai R)

Enam bab di `docs/pola-aplikasi/` juga ditulis tanpa Redis nyata. Perintah dan nilai balik dicocokkan dengan dokumentasi resmi, dan angka output dihitung ulang secara manual, tetapi **belum ada yang dijalankan**. Semua blok output berstatus *diharapkan*.

Persiapan tambahan untuk M sampai R:

- Container `redis` bersih atau tanpa key berawalan `cache:`, `sesi:`, `rate:`, `kunci:`, `akun:`, dan `pesanan` (nama key uji bab-bab ini).
- Python 3 dan paket `redis` versi terbaru (`pip install --upgrade redis`). Catat versi `redis-py` di tabel lingkungan; `expire(..., nx=True)` membutuhkan versi yang cukup baru.
- Versi Redis yang dipakai bab: opsi `NX` pada `EXPIRE` butuh 7.0.0+, `XAUTOCLAIM` butuh 6.2.0+, dan balasan `XAUTOCLAIM` berisi tiga elemen pada 7.0+. Catat versi nyata dan perbedaannya.
- Item bertanda **[dua terminal]** memerlukan dua sesi `redis-cli` yang berjalan bersamaan.
- Item bertanda **[uji galat]** memicu pesan galat. Cocokkan kalimat aslinya, lalu ganti isi tabel troubleshooting bila beda.
- Bab Caching mengubah konfigurasi server (`maxmemory`, `maxmemory-policy`). Kembalikan sesuai item M10 sebelum lanjut ke bab lain agar `OOM` tidak mengganggu uji berikutnya.

## M. Bab Caching (`docs/pola-aplikasi/caching.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | M1 | Langkah 1: `GET cache:produk:1` pada key yang belum ada → `(nil)` | |
| - [ ] | M2 | Langkah 2: `SET cache:produk:1 '{"nama":"Kopi","harga":25000}' EX 60` (tanda kutip tunggal diterima `redis-cli`) → `OK`; `TTL` sekitar 60 | |
| - [ ] | M3 | Langkah 3: `GET` menampilkan JSON dengan tanda kutip ganda di-escape (`"{\"nama\":\"Kopi\",\"harga\":25000}"`). Catat bentuk persisnya | |
| - [ ] | M4 | Langkah 4: `DEL cache:produk:1` → 1; `GET` → `(nil)` | |
| - [ ] | M5 | Langkah 5: `INFO stats` memuat `keyspace_hits`, `keyspace_misses`, dan `evicted_keys`. Catat nilai sebelum Langkah 1 dan sesudah Langkah 4: misses naik minimal 2, hits naik minimal 1 | |
| - [ ] | M6 | Langkah 6: `CONFIG GET maxmemory` → `"maxmemory"`, `"0"`; `CONFIG GET maxmemory-policy` → `"maxmemory-policy"`, `"noeviction"` pada `redis:latest`. Catat bentuk output | |
| - [ ] | M7 | Langkah 7: `INFO memory` memuat `used_memory_human` (catat nilainya); `CONFIG SET maxmemory 4mb` dan `CONFIG SET maxmemory-policy allkeys-lru` → `OK` | |
| - [ ] | M8 | Langkah 7: `isi_cache.py` mencetak jumlah key `cache:uji:*` **kurang dari 8000** dan `evicted_keys` lebih dari 0. Catat kedua angka dan sesuaikan kalimat bila batas 4 mb tidak memicu eviction | |
| - [ ] | M9 | **[uji galat]** Dengan `maxmemory` kecil dan `maxmemory-policy noeviction`, tulis banyak data sampai gagal → `OOM command not allowed when used memory > 'maxmemory'`. Catat kalimat asli | |
| - [ ] | M10 | Langkah 8: `CONFIG SET maxmemory 0` dan `CONFIG SET maxmemory-policy noeviction` → `OK`; `SCAN 0 MATCH cache:uji:* COUNT 100` → kursor `"0"` dan daftar kosong (skrip sudah membersihkan) | |
| - [ ] | M11 | Skrip `cache_aside.py` mencetak empat baris MISS, HIT, MISS, HIT; miss sekitar 1 detik dan hit jauh lebih cepat. Catat waktu nyata | |
| - [ ] | M12 | Klaim di troubleshooting: setelah `docker restart redis`, `CONFIG GET maxmemory` kembali ke `0` (CONFIG SET tidak permanen) | |

## N. Bab Session dan rate limiting (`docs/pola-aplikasi/session-dan-rate-limiting.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | N1 | Langkah 1: `HSET sesi:token-contoh-abc123 user_id 42 nama "Budi"` → 2; `EXPIRE ... 30` → 1; `TTL` sekitar 30 | |
| - [ ] | N2 | Langkah 2: `HGETALL` menampilkan empat baris selang-seling; `EXPIRE ... 30` → 1; `TTL` → 30 atau 29 | |
| - [ ] | N3 | Langkah 3: setelah lebih dari 30 detik, `HGETALL` → `(empty array)` | |
| - [ ] | N4 | Langkah 4: `HSET` → 2, `EXPIRE ... 1800` → 1, `DEL` → 1, `EXISTS` → 0 | |
| - [ ] | N5 | Langkah 5: urutan `INCR` dan `EXPIRE rate:user42 10 NX` → 1, 1, 2, **0**, 3, 4; `TTL` sisa dari 10 detik | |
| - [ ] | N6 | Langkah 6: setelah `TTL` habis, `GET rate:user42` → `(nil)` dan `INCR` → 1 | |
| - [ ] | N7 | Langkah 7: `DEL` tiga key mengembalikan jumlah yang masih ada (0 sampai 1) | |
| - [ ] | N8 | Skrip `sesi_dan_rate_limit.py` mencetak sembilan baris; permintaan 4 dan 5 `DITOLAK`, dan baris terakhir `boleh`. Catat versi `redis-py` | |
| - [ ] | N9 | **[uji galat]** `EXPIRE k 10 NX` di Redis di bawah 7.0 → `ERR wrong number of arguments for 'expire' command` (opsional: `docker run --rm -d --name redis6 -p 6381:6379 redis:6`, lalu `docker rm -f redis6`) | |
| - [ ] | N10 | Klaim di tabel penjelasan kode: `pipeline()` redis-py membungkus perintah dalam `MULTI`/`EXEC`. Cek dengan `MONITOR` di terminal lain: terlihat `MULTI`, `HSET`, `EXPIRE`, `EXEC` | |

## O. Bab Pub/Sub (`docs/pola-aplikasi/pub-sub.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | O1 | **[dua terminal]** Langkah 1: `SUBSCRIBE berita` mencetak teks "Reading messages..." lalu `"subscribe"`, `"berita"`, `(integer) 1`. Catat kalimat persis | |
| - [ ] | O2 | **[dua terminal]** Langkah 2: `PUBLISH berita "halo semua"` → 1; Terminal A mencetak `"message"`, `"berita"`, `"halo semua"` | |
| - [ ] | O3 | Langkah 3: `PUBLISH sepi "tidak ada yang dengar"` → 0 | |
| - [ ] | O4 | **[dua terminal]** Langkah 4: `PSUBSCRIBE berita.*`; tiga `PUBLISH` → 1, 1, 0; Terminal A menerima dua `pmessage` empat baris | |
| - [ ] | O5 | **[dua terminal]** Langkah 5: `PUBSUB NUMSUB berita` → `"berita"`, 0 (pelanggan lewat pola); `PUBSUB NUMPAT` → 1 | |
| - [ ] | O6 | Langkah 6: Ctrl-C keluar dari mode langganan. Catat perilaku di versi `redis-cli` terpasang, termasuk arti "or any other key to type a command" pada pesan awal | |
| - [ ] | O7 | Skrip `pubsub_demo.py` mencetak tiga `dikirim`, tiga `diterima`, dan `tanpa pelanggan: 0`. Catat urutan baris nyata | |
| - [ ] | O8 | Latihan 3: pesan yang dikirim **sebelum** ada pelanggan tidak pernah sampai ke pelanggan yang datang kemudian | |
| - [ ] | O9 | **[uji galat]** Di sesi yang sedang berlangganan, jalankan perintah biasa (mis. `GET x`). Catat apakah ditolak dan kalimat aslinya; sesuaikan baris troubleshooting bila `redis-cli` versi baru berperilaku beda | |
| - [ ] | O10 | Klaim di troubleshooting: klien yang `SUBSCRIBE berita` **dan** `PSUBSCRIBE berita.*`/`PSUBSCRIBE *` menerima pesan dua kali untuk satu `PUBLISH` | |

## P. Bab Streams dan consumer group (`docs/pola-aplikasi/streams-consumer-group.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | P1 | Langkah 1: tiga `XADD pesanan 1-1/2-1/3-1 ...` → `"1-1"`, `"2-1"`, `"3-1"`; `XLEN` → 3 | |
| - [ ] | P2 | Langkah 2: `XRANGE pesanan - + COUNT 2` mengembalikan entri `1-1` dan `2-1` dalam bentuk bersarang seperti di bab | |
| - [ ] | P3 | Langkah 3: `XREAD COUNT 1 STREAMS pesanan 1-1` → entri `2-1` (teh) di bawah nama key `"pesanan"` | |
| - [ ] | P4 | Langkah 4: `XGROUP CREATE pesanan tim-dapur 0` → `OK` | |
| - [ ] | P5 | Langkah 5: `XREADGROUP ... koki-1 ... >` → `1-1` (kopi); `koki-2` → `2-1` (teh). Catat bentuk balasan | |
| - [ ] | P6 | Langkah 6: `XPENDING pesanan tim-dapur` → 2, `"1-1"`, `"2-1"`, dan `koki-1`/`koki-2` masing-masing `"1"` | |
| - [ ] | P7 | Langkah 7: `XACK pesanan tim-dapur 1-1` → 1; `XPENDING` menunjukkan 1 entri tersisa (`2-1`) | |
| - [ ] | P8 | Langkah 8: `XAUTOCLAIM pesanan tim-dapur koki-3 0 0-0 COUNT 10` mengembalikan `0-0`, entri `2-1`, dan daftar kosong. Catat jumlah elemen balasan dan versi Redis; lalu `XACK` → 1, `XREADGROUP` oleh `koki-1` → `3-1`, `XACK` → 1 | |
| - [ ] | P9 | Langkah 9: `XPENDING` → `(integer) 0` dan tiga `(nil)`; `XLEN` masih 3 | |
| - [ ] | P10 | **[dua terminal]** Langkah 10: `XREAD BLOCK 10000 STREAMS pesanan $` menerima entri `4-1`; tanpa kiriman, balasan `(nil)` setelah sekitar 10 detik | |
| - [ ] | P11 | Langkah 11: `DEL pesanan` → 1 (Stream dan group ikut hilang) | |
| - [ ] | P12 | Skrip `stream_group.py` mencetak enam baris (`koki-1` kopi, teh; `koki-2` roti, susu; `pending: 0`; `panjang stream: 4`) | |
| - [ ] | P13 | **[uji galat]** `NOGROUP` (`XREADGROUP` pada group yang tidak ada), `BUSYGROUP` (`XGROUP CREATE` dua kali), ID `XADD` yang lebih kecil dari entri terakhir, dan `WRONGTYPE` | |
| - [ ] | P14 | Latihan 2: group dibuat dengan `$` setelah entri ada tidak membaca entri lama (`XREADGROUP ... >` → `(nil)`) | |

## Q. Bab Transaksi (`docs/pola-aplikasi/transaksi.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | Q1 | Langkah 1: `MULTI` → `OK`, dua perintah → `QUEUED`, `EXEC` → `400` dan `200`. Catat apakah prompt berubah menjadi `(TX)` | |
| - [ ] | Q2 | Langkah 2: `MULTI`, `SET percobaan "batal"`, `DISCARD` → `OK`; `GET percobaan` → `(nil)` | |
| - [ ] | Q3 | Langkah 3: `INCR catatan` pada teks gagal di dalam `EXEC` tetapi `SET akun:C 1` tetap berlaku (`GET` → `"1"`): tidak ada rollback | |
| - [ ] | Q4 | Langkah 4: salah argumen saat mengantre lalu `EXEC` → `EXECABORT Transaction discarded because of previous errors.`; `GET akun:E` → `(nil)` | |
| - [ ] | Q5 | **[dua terminal]** Langkah 5: dengan `WATCH akun:A` dan perubahan dari terminal lain, `EXEC` → `(nil)`; `GET akun:A` → `"410"` | |
| - [ ] | Q6 | Langkah 6: tanpa gangguan, `EXEC` → `1) (integer) 310` | |
| - [ ] | Q7 | Langkah 7: `DEL akun:A akun:B akun:C catatan percobaan` → 4 | |
| - [ ] | Q8 | Skrip `transaksi_watch.py` mencetak `saldo awal: 100`, `berhasil, percobaan: 2`, `saldo akhir: 120`, dan `saldo kurang, percobaan: 1` | |
| - [ ] | Q9 | **[uji galat]** `MULTI` bersarang, `EXEC` tanpa `MULTI`, `DISCARD` tanpa `MULTI`, dan `WATCH` di dalam `MULTI`. Catat kalimat asli | |
| - [ ] | Q10 | Latihan 3: `GET` dari terminal lain (hanya membaca) **tidak** memicu `WATCH`, jadi `EXEC` berhasil | |

## R. Bab Lua script (`docs/pola-aplikasi/lua-script.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | R1 | Langkah 1: `EVAL "return ARGV[1]" 0 halo` → `"halo"`; `EVAL "return 3.9" 0` → `(integer) 3` | |
| - [ ] | R2 | Langkah 2: `EVAL "return redis.call('GET', KEYS[1])" 1 nama` → `"Budi"` | |
| - [ ] | R3 | Langkah 3: skrip bandingkan-hapus → `OK`, `(integer) 0` (`proses-B`), `(integer) 1` (`proses-A`), `GET` → `(nil)` | |
| - [ ] | R4 | Langkah 4: skrip `INCR` + `EXPIRE` dua kali → 1, 2; `TTL` sekitar 5 atau kurang | |
| - [ ] | R5 | Langkah 5: `SCRIPT LOAD` membalas `2ff4a3e24772cc6d522d80ca1ef9ca17a73cb574` (dihitung dari teks, belum dicocokkan). Catat hash nyata; `EVALSHA` dengan hash itu berhasil | |
| - [ ] | R6 | Langkah 6 **[uji galat]**: `redis.call('INCR', ...)` pada teks; `EVAL "return 1" 5 a` → `ERR Number of keys can't be greater than number of args`; `EVALSHA` hash nol → `NOSCRIPT No matching script. Please use EVAL.` | |
| - [ ] | R7 | Langkah 7: `DEL nama catatan rate:uji kunci:laporan` mengembalikan jumlah key yang masih ada | |
| - [ ] | R8 | Skrip `lua_script.py` mencetak tujuh baris (`B melepas: 0`, `A melepas: 1`, `isi kunci: None`, hitungan 1 sampai 3, `ttl`) | |
| - [ ] | R9 | Latihan 4: `SCRIPT FLUSH` lalu `EVALSHA` hash tadi → `NOSCRIPT`; `register_script` di Python tetap berhasil karena fallback ke `EVAL` | |
| - [ ] | R10 | Tabel konversi: `EVAL "return {KEYS[1], ARGV[1]}" 1 a b` → array dua elemen; `EVAL "return false" 0` → `(nil)`; `EVAL "return true" 0` → `(integer) 1` | |

## Bagian Python dan FastAPI (T sampai Y)

Enam bab di `docs/python/` juga ditulis tanpa Redis, Python, dan FastAPI yang dijalankan. Hanya **sintaks Python** skripnya yang diperiksa (`py_compile` dan `ast`); perilaku, output, dan versi pustaka **belum diuji**. Semua blok output berstatus *diharapkan*.

Persiapan tambahan untuk T sampai Y:

- Folder latihan di luar repository (mis. `latihan-fastapi`) dengan lingkungan virtual sendiri. Jangan membuat `.venv` di dalam repository materi.
- Pasang paket: `pip install --upgrade redis` dan `pip install "fastapi[standard]"`. Catat di tabel lingkungan: versi Python, `redis-py`, FastAPI, dan Uvicorn (`pip show redis fastapi uvicorn`).
- Port 8000 bebas untuk server FastAPI (`fastapi dev main.py`). Skrip uji `httpx` (`uji_api.py`, `uji_cache.py`, `uji_rate.py`, `uji_sse.py`) dijalankan di terminal kedua selagi server hidup.
- Di PowerShell, `curl` adalah alias perintah lain; tulis `curl.exe`. Kutip JSON di PowerShell bisa bermasalah, jadi gunakan skrip `httpx` atau halaman `/docs`.
- Hasil yang tergantung versi (`aclose()` pada klien dan `PubSub` butuh `redis-py` 5.0.1+, `expire(..., nx=True)` di pipeline asinkron butuh Redis 7.0+) harus dicatat bila berbeda.
- Item bertanda **[dua terminal]** memerlukan dua sesi yang berjalan bersamaan; **[uji galat]** memicu pesan galat. Cocokkan kalimat aslinya, lalu ganti isi tabel troubleshooting bila beda.
- Item yang menghentikan Redis (`docker stop redis`) harus diakhiri dengan `docker start redis`.
- Skrip di bab berbeda dapat memakai nama berkas yang sama (mis. `list_antrean.py` ada di bab List dan di bab Struktur data di Python). Simpan di folder terpisah per bab.

## T. Bab Dasar redis-py (`docs/python/dasar-redis-py.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | T1 | Langkah 1: `python -m venv .venv`, aktivasi, `pip install redis`, `pip show redis` menampilkan `Name: redis`, `Version`, dan `Location` di dalam `.venv`. Catat versi dan versi Python | |
| - [ ] | T2 | Langkah 2: `koneksi.py` mencetak `ping: True` | |
| - [ ] | T3 | Langkah 3: `tipe_data.py` mencetak `b'Budi'`, `Budi`, dan `None` | |
| - [ ] | T4 | Langkah 4: `perintah_dasar.py` mencetak sembilan baris (`set: True`, `get: '25'`, `incr: 26`, `exists: 1`, `ttl: -1`, `expire: True`, `ttl: 30`, `delete: 1`, `ttl: -2`) | |
| - [ ] | T5 | Langkah 5: `set_opsi.py` mencetak `pertama: True`, `kedua: None`, `isi: proses-A`, `ttl: 30` | |
| - [ ] | T6 | Langkah 6 **[uji galat]**: `galat_respons.py` mencetak `ditolak Redis:` diikuti pesan mirip `value is not an integer or out of range`. Catat teks asli | |
| - [ ] | T7 | Langkah 7 **[uji galat]**: `galat_koneksi.py` (port 6390) mencetak `tidak bisa terhubung:` diikuti pesan penolakan koneksi; tidak menggantung lebih dari sekitar 2 detik. Catat kalimat asli dan sistem operasi | |
| - [ ] | T8 | Langkah 8: setelah mengatur `REDIS_URL` (`$env:REDIS_URL` di PowerShell atau `export`), `dari_env.py` mencetak `ping: True`; tanpa variabel, memakai nilai bawaan | |
| - [ ] | T9 | Contoh lengkap: `dasar_redis_py.py` mencetak empat baris (`salam: halo`, `sisa ttl: 60`, `pengunjung: 3`, `ditolak Redis: ...`) | |
| - [ ] | T10 | Klaim peringatan: `decode_responses=True` menimbulkan `UnicodeDecodeError` pada value biner (mis. simpan `b"\xff\xfe"` dengan klien tanpa decode, lalu baca dengan klien ber-decode) | |
| - [ ] | T11 | Prasyarat bab: catat versi Python terpasang dan apakah `redis-py` terbaru mendukungnya; sesuaikan kalimat "cek persyaratan versi" bila perlu | |

## U. Bab Struktur data di Python (`docs/python/struktur-data-di-python.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | U1 | Langkah 1: `hash_dict.py` mencetak `hset: 2`, `hget: Budi`, `hgetall: {'nama': 'Budi', 'umur': '25'}`, `umur + 1: 26`, `hincrby: 26`, `kosong: {}` | |
| - [ ] | U2 | Langkah 2: `list_antrean.py` mencetak `rpush: 4`, list A-D, `lpop: A`, `lpop 2: ['B', 'C']`, `sisa: ['D']`, `lpop kosong: None` | |
| - [ ] | U3 | Langkah 3: `set_python.py` mencetak `sadd: 3`, `sadd ulang: 0`, anggota terurut, `irisan: {'sari'}`. Catat apakah `sismember` mengembalikan `True` atau `1` dan sesuaikan catatan | |
| - [ ] | U4 | Langkah 4: `sortedset_papan.py` mencetak `zadd: 3`, `zincrby: 195.0`, top berupa tuple `(str, float)`, `zscore: 100.0`, `peringkat budi: 3`, `tidak ada: None` | |
| - [ ] | U5 | Langkah 5 **[uji galat]**: `data_error.py` mencetak `ditolak redis-py:` dengan pesan tentang tipe `bool`, lalu `{'nama': 'Budi', 'aktif': '1'}`. Catat teks asli | |
| - [ ] | U6 | Langkah 6: `json_string.py` mencetak dict asli dan `kopi` | |
| - [ ] | U7 | Contoh lengkap: `struktur_lengkap.py` mencetak lima baris (profil, riwayat tiga halaman, tag terurut, dua baris peringkat) | |
| - [ ] | U8 | Klaim: `DataError` juga muncul untuk `None` dan `dict` sebagai value (`r.hset("py:x", mapping={"a": None})`) | |
| - [ ] | U9 | Klaim ringkasan: key tidak ada → `get` mengembalikan `None`, `hgetall` → `{}`, `lrange` → `[]` | |
| - [ ] | U10 | Setelah semua skrip, `SCAN 0 MATCH py:* COUNT 100` tidak menemukan key tersisa (skrip membersihkan dirinya) | |

## V. Bab Pipeline dan connection pool (`docs/python/pipeline-dan-connection-pool.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | V1 | Langkah 1: `pipeline_dasar.py` mencetak `[True, 2, '2']` | |
| - [ ] | V2 | Langkah 2: `pipeline_rantai.py` mencetak `hasil: [1, 2, True]` dan `hitungan akhir: 2` | |
| - [ ] | V3 | Langkah 3: `pipeline_galat.py` mencetak `1 bool`, `2 ResponseError`, `3 bool`, `py:y = 2` | |
| - [ ] | V4 | Langkah 4: `pipeline_waktu.py` menunjukkan waktu pipeline lebih kecil daripada satu per satu. Catat kedua angka; key `py:uji:*` terhapus di akhir | |
| - [ ] | V5 | Langkah 5: `pool_bersama.py` mencetak `dibaca: halo` | |
| - [ ] | V6 | Langkah 6 **[uji galat]**: `pool_penuh.py` mencetak `pool penuh: Too many connections`. Catat teks asli; ulangi dengan `BlockingConnectionPool(max_connections=1, timeout=1)` dan catat galat serta lama menunggu | |
| - [ ] | V7 | Contoh lengkap: `pipeline_pool_lengkap.py` mencetak `hset: [2, 2, 2]` dan tiga dict produk | |
| - [ ] | V8 | Klaim: `pipeline()` bawaan memakai `MULTI`/`EXEC`, dan `pipeline(transaction=False)` tidak. Cek dengan `MONITOR` di terminal lain | |
| - [ ] | V9 | Latihan 3: pada `pipeline_galat.py` dengan `transaction=True`, perintah ketiga tetap berjalan meski perintah kedua gagal | |
| - [ ] | V10 | Klaim troubleshooting: tanpa `execute()` perintah tidak pernah terkirim (key tidak muncul di `redis-cli`) | |

## W. Bab Dasar FastAPI dengan Redis (`docs/python/dasar-fastapi-dengan-redis.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | W1 | Langkah 1: `pip install "fastapi[standard]" redis` selesai tanpa galat. Catat versi FastAPI, Uvicorn, dan `redis-py` | |
| - [ ] | W2 | Langkah 2: `fastapi dev main.py` menjalankan server di `http://127.0.0.1:8000`; `GET /` → `{"pesan":"FastAPI hidup"}`; `/docs` terbuka. Catat baris log server | |
| - [ ] | W3 | Langkah 3: `curl http://127.0.0.1:8000/health` (`curl.exe` di PowerShell) → `{"status":"ok","redis":true}` | |
| - [ ] | W4 | Langkah 4: `POST /counter/tamu/naik` → nilai 1 lalu 2; `GET /counter/tamu` → 2; counter yang tidak ada → 404 | |
| - [ ] | W5 | Langkah 5: `PUT /catatan/belajar`, `GET`, `DELETE`; `sisa_ttl_detik` 60 atau 59; `GET` setelah `DELETE` → 404 | |
| - [ ] | W6 | Langkah 6: `uji_api.py` mencetak delapan baris seperti di bab (termasuk `422` untuk `/counter/Tidak Valid`) | |
| - [ ] | W7 | Langkah 7: `docker stop redis`, lalu `curl -i /health` → `HTTP/1.1 503` dan `{"detail":"Redis tidak tersedia"}`; `docker start redis` mengembalikan 200. Catat berapa lama respons 503 muncul | |
| - [ ] | W8 | Langkah 8: `DEL api:counter:tamu api:catatan:belajar` → 1 | |
| - [ ] | W9 | Klaim: `await app.state.redis.aclose()` bekerja saat server berhenti (Ctrl+C) tanpa peringatan. Catat log shutdown dan versi `redis-py` | |
| - [ ] | W10 | **[uji galat]** `PUT /catatan/x` dengan `ttl_detik: 0` → 422; hapus `lifespan=lifespan` sementara → `AttributeError: 'State' object has no attribute 'redis'`; lupa `await` → `RuntimeWarning` (kembalikan kode setelah uji) | |
| - [ ] | W11 | Klaim: handler 503 tidak menangkap `ResponseError`. Buat `LPUSH api:catatan:tipe-salah x` lalu `GET /catatan/tipe-salah` → 500 (bukan 503) | |
| - [ ] | W12 | Klaim troubleshooting: `uvicorn main:app --reload` bekerja sebagai alternatif `fastapi dev` | |

## X. Bab FastAPI: caching dan rate limit (`docs/python/fastapi-caching-dan-rate-limit.md`)

Hapus dulu key uji: `DEL api:cache:produk:1 api:rate:127.0.0.1`. Pastikan Redis 7.0+ untuk `EXPIRE ... NX`.

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | X1 | Langkah 1: berkas dasar (lifespan, `get_redis`, handler 503) jalan tanpa galat impor | |
| - [ ] | X2 | Langkah 2: `GET /produk/1` pertama `X-Cache: MISS` sekitar 1 detik; berikutnya `HIT` mendekati 0 detik; `GET /statistik` menghitung panggilan database | |
| - [ ] | X3 | Langkah 3: `PUT /produk/1/harga` dengan `{"harga": 30000}` mengembalikan produk dengan harga baru; `GET /produk/1` berikutnya `MISS` dengan harga baru, lalu `HIT` | |
| - [ ] | X4 | Langkah 4: `GET /layanan` lima kali lolos dengan `X-RateLimit-Remaining` 4,3,2,1,0; ke-6 dan ke-7 → 429 dengan `Retry-After` | |
| - [ ] | X5 | Langkah 5: `uji_cache.py` mencetak tujuh baris (MISS, HIT, HIT, ubah harga, MISS, HIT, `panggilan_db: 2`). Catat waktu nyata | |
| - [ ] | X6 | Langkah 6: `uji_rate.py` mencetak delapan baris; catat nilai `Retry-After` nyata dan status setelah menunggu 11 detik (200) | |
| - [ ] | X7 | Langkah 7: `GET api:rate:127.0.0.1` bernilai angka; `TTL` maksimal 10; `TTL api:cache:produk:1` maksimal 60 | |
| - [ ] | X8 | Langkah 8: `DEL api:cache:produk:1 api:rate:127.0.0.1` mengembalikan jumlah key yang masih ada | |
| - [ ] | X9 | Klaim: `pipe.incr(...)`, `pipe.expire(..., nx=True)`, `pipe.ttl(...)` diantrekan tanpa `await` dan hanya `await pipe.execute()` yang dibutuhkan (tanpa `RuntimeWarning`/`TypeError`) di versi `redis-py` terpasang | |
| - [ ] | X10 | Klaim: header `X-RateLimit-*` muncul pada respons 200 (lewat `response.headers` di dependency) dan pada 429 (lewat `HTTPException.headers`) | |
| - [ ] | X11 | **[uji galat]** `GET /produk/99` → 404 tanpa menyimpan cache; `GET /produk/abc` → 422 | |
| - [ ] | X12 | **[uji galat]** Opsional di Redis di bawah 7.0 (`redis:6`): `nx=True` menghasilkan galat dan respons 500. Catat teksnya | |
| - [ ] | X13 | Latihan 3: pasang `dependencies=[Depends(batasi)]` pada `/produk/{produk_id}`; lebih dari lima permintaan dalam 10 detik → 429 meski data di cache | |

## Y. Bab FastAPI: fitur realtime dengan SSE (`docs/python/fastapi-fitur-realtime-dengan-sse.md`)

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | Y1 | Langkah 1 sampai 3: server dengan `/aliran`, `/kirim`, dan `/` berjalan; `curl -N http://127.0.0.1:8000/aliran` langsung mencetak `: terhubung` | |
| - [ ] | Y2 | **[dua terminal]** Langkah 5: `POST /kirim` saat `curl -N` terbuka → `{"penerima":1}` dan `curl` menampilkan `data: {"teks": "halo"}`; tanpa pelanggan → `penerima` 0 | |
| - [ ] | Y3 | Langkah 4: `uji_sse.py` mencetak tiga `dikirim` dan tiga `diterima` (`penerima: 1`). Catat urutan nyata | |
| - [ ] | Y4 | Langkah 5: halaman `/` di peramban menampilkan pesan baru seketika; dengan dua tab, `penerima` bernilai 2 dan kedua tab menerima | |
| - [ ] | Y5 | Langkah 6: setelah `uji_sse.py` selesai atau tab ditutup, `PUBSUB NUMSUB notifikasi` → 0. Catat berapa detik sampai nol | |
| - [ ] | Y6 | Klaim: komentar `: ping` muncul sekitar tiap 15 detik tanpa pesan (amati dengan `curl -N`) | |
| - [ ] | Y7 | Klaim: `await pubsub.aclose()` ada di `redis-py` terpasang; tanpa `AttributeError`. Catat versi, dan perilaku di versi lama (`close()`) | |
| - [ ] | Y8 | **[uji galat]** Kirim `{"teks":"a\nb"}` (baris baru) lewat `/docs`; `curl -N` menampilkan `\n` ter-escape di dalam JSON tanpa merusak bingkai `data:` | |
| - [ ] | Y9 | Klaim: pesan yang dikirim saat tidak ada pelanggan tidak diterima pelanggan yang datang kemudian (`penerima: 0`) | |
| - [ ] | Y10 | Klaim: respons `/aliran` memuat `content-type: text/event-stream`, `cache-control: no-cache`, dan `x-accel-buffering: no` (`curl -i -N`) | |
| - [ ] | Y11 | Klaim troubleshooting: pasang `socket_timeout=2` pada klien dan amati apakah aliran yang menganggur putus dengan galat; lalu kembalikan | |

## Bagian Operasi (AA sampai AD)

Empat bab di `docs/operasi/` ditulis tanpa Redis yang dijalankan. Sintaks, nama pengaturan, nilai bawaan, dan perilaku dicocokkan dengan redis.io, tetapi **semua blok output berstatus *diharapkan***. Sentinel dan Cluster di AD hanya konsep (tanpa praktik), jadi tidak ada item uji untuknya.

Persiapan tambahan untuk AA sampai AD:

- Pakai **Git Bash** atau shell POSIX. Beberapa perintah memakai `docker exec ... sh -c '...'` dengan tanda kutip bersarang yang bisa rusak di Windows PowerShell. Bila terpaksa memakai PowerShell, catat perubahan kutipnya.
- Bab-bab ini memakai nama sendiri agar tidak mengganggu container `redis`: container `redis-persist`, `redis-aman`, `redis-pantau`, `redis-utama`, `redis-replika`, volume `redis-data`, jaringan `redis-ha`. Pastikan semuanya belum ada (`docker ps -a`, `docker volume ls`, `docker network ls`).
- **Perbedaan format keluaran yang mungkin besar.** Perintah `docker exec <container> redis-cli ...` **tanpa** `-it` tidak berjalan di terminal, sehingga `redis-cli` memakai *raw output*: tanpa `(integer)`, tanpa tanda kutip pada string, dan nilai kosong bisa berupa baris kosong, bukan `(nil)`.[^raw] Blok "Diharapkan" di AA, AC, dan AD sudah disesuaikan: perintah `docker exec` tanpa `-it` ditulis dalam bentuk raw (`Budi`, baris kosong untuk `nil`, `501`), sedangkan perintah dengan balasan bersarang atau galat (`ROLE`, `SLOWLOG GET`, `SET` ke replika) memakai `-it` dan bentuk interaktif. Item **AA13**, **AC13**, dan **AD11** meminta kamu memastikan bentuk raw dan bentuk interaktif itu benar-benar seperti yang ditulis, terutama baris kosong untuk `nil` dan bentuk galat. Bila berbeda, perbaiki blok output di bab.
- Item yang menghentikan atau mematikan container (`docker kill`, `docker stop`) harus diakhiri dengan `docker start` bila bab melanjutkan dengan container yang sama.
- Catat versi Redis dari image (`docker exec <container> redis-server --version`). Teks galat dan beberapa field `INFO` bergantung versi.

[^raw]: Dokumentasi *Redis CLI*: `redis-cli` hanya menampilkan informasi tambahan untuk manusia bila stdout adalah tty; selain itu otomatis memakai raw output. <https://redis.io/docs/latest/develop/tools/cli/>

## AA. Bab Persistence (`docs/operasi/persistence.md`)

Mulai dari kondisi bersih: tidak ada container `redis-persist` dan volume `redis-data`.

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | AA1 | Langkah 1: `docker run -d --name redis-persist -v redis-data:/data redis:latest redis-server --save 60 1` mencetak satu ID container; `docker volume ls` memuat `redis-data` | |
| - [ ] | AA2 | Langkah 2: `CONFIG GET save` → `save` lalu `60 1`; `CONFIG GET appendonly` → `no`; `CONFIG GET dir` → `/data`. Catat bentuk keluaran asli | |
| - [ ] | AA3 | Langkah 3: `BGSAVE` membalas `Background saving started`; `LASTSAVE` kedua lebih besar dari yang pertama; `ls -l /data` memuat `dump.rdb`. Catat selisih `LASTSAVE` dan ukuran file | |
| - [ ] | AA4 | Langkah 4 (dalam 60 detik setelah AA3): `SET kota`, `docker kill`, `docker start` → `GET nama` ada, `GET kota` kosong. Catat apa yang terjadi bila lewat 60 detik | |
| - [ ] | AA5 | Langkah 5: `CONFIG SET appendonly yes` → `OK`; `INFO persistence` memuat `aof_enabled:1`, `aof_rewrite_in_progress:0`, `aof_last_bgrewrite_status:ok`; `/data/appendonlydir` memuat file base, incr, dan manifest. Catat **nama file asli** (bab menulis `appendonly.aof.1.base.rdb`, `appendonly.aof.1.incr.aof`, `appendonly.aof.manifest`) | |
| - [ ] | AA6 | Langkah 6, klaim: setelah `docker restart redis-persist` (tanpa `--appendonly yes`), `CONFIG GET appendonly` kembali `no` | |
| - [ ] | AA7 | Langkah 6: `docker rm -f` lalu `docker run ... --save 60 1 --appendonly yes` pada volume yang sama; `GET nama` masih ada. Periksa `docker logs redis-persist` untuk baris yang menyatakan data dimuat dari AOF atau RDB, dan catat kalimat aslinya | |
| - [ ] | AA8 | Langkah 7: `SET kota`, tunggu 2–3 detik, `docker kill`, `docker start` → `GET kota` ada | |
| - [ ] | AA9 | Langkah 8: `BGREWRITEAOF` membalas `Background append only file rewriting started`; nomor file di `appendonlydir` naik (mis. `...2.base.rdb`). Catat teks balasan dan nama file asli | |
| - [ ] | AA10 | Langkah 9: `BGSAVE`, `LASTSAVE`, lalu `docker cp redis-persist:/data/dump.rdb ./dump-cadangan.rdb` menghasilkan file berukuran lebih dari nol di folder kerja | |
| - [ ] | AA11 | **[uji galat]** Troubleshooting: jalankan `BGREWRITEAOF` lalu segera `BGSAVE`; catat teks balasan atau galat (bab menyatakan galat bila ada rewrite berjalan) | |
| - [ ] | AA12 | Klaim: pada container RDB-only (`--save 60 1`), `SET x 1`, `docker stop`, `docker start` → `GET x` ada (SIGTERM memicu penyimpanan RDB) | |
| - [ ] | AA13 | **[format keluaran]** `docker exec redis-persist redis-cli GET nama` mencetak `Budi` (tanpa tanda kutip) dan `GET kota` yang kosong mencetak baris kosong (bukan `(nil)`). Bandingkan dengan blok di Langkah 4, 6, dan 7 | |
| - [ ] | AA14 | Latihan 2: server `--save 3600 1`, `SET x 1`, tunggu 2 detik, `docker kill` → `x` hilang | |
| - [ ] | AA15 | Latihan 3: `CONFIG SET appendfsync always` → `OK`; `CONFIG GET appendfsync` → `always` | |
| - [ ] | AA16 | Langkah 10: `docker rm -f redis-persist` dan `docker volume rm redis-data` berhasil; `docker volume ls` tidak lagi memuat `redis-data` | |

## AB. Bab Keamanan (`docs/operasi/keamanan.md`)

Gunakan sesi interaktif `docker exec -it redis-aman redis-cli` untuk AB2 sampai AB10, supaya bentuk keluaran sama dengan blok bab.

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | AB1 | Langkah 1: `docker run -d --name redis-aman redis:latest` mencetak satu ID container | |
| - [ ] | AB2 | Langkah 2: `ACL LIST` → `1) "user default on nopass ~* &* +@all"`. Catat bentuk asli (versi baru mungkin menambah flag seperti `sanitize-payload`) | |
| - [ ] | AB3 | Langkah 2: `ACL WHOAMI` → `"default"`; `ACL GENPASS` → string heksadesimal 64 karakter | |
| - [ ] | AB4 | Langkah 3: `ACL SETUSER default >...` → `OK`; di sesi **baru**, `PING` → galat `NOAUTH`; `AUTH salah-sengaja` → galat `WRONGPASS`; `AUTH <password benar>` → `OK`; `PING` → `PONG`. Catat **teks galat asli** keduanya | |
| - [ ] | AB5 | Klaim: sesi yang sudah terautentikasi sebelum password dipasang tetap bisa menjalankan perintah (tidak diputus) | |
| - [ ] | AB6 | Langkah 4: dua `ACL SETUSER` membalas `OK`; `ACL LIST` memuat `aplikasi` dan `pembaca` dengan `#<hash>`, `~app:*`, `resetchannels`, `-@all`, dan aturan perintahnya. Catat bentuk dan urutan asli | |
| - [ ] | AB7 | Langkah 5: sebagai `aplikasi`, `ACL WHOAMI` → `"aplikasi"`; `SET app:1` → `OK`; `SET lain:1` → `NOPERM` (key); `FLUSHALL` → `NOPERM` (perintah). Catat teks asli kedua `NOPERM` | |
| - [ ] | AB8 | Langkah 5: sebagai `pembaca`, `GET app:1` → nilainya; `SET app:2` → `NOPERM` | |
| - [ ] | AB9 | Klaim: `-@dangerous` yang ditulis **setelah** `+@read +@write` benar-benar mencabut `FLUSHALL`, `KEYS`, dan `CONFIG` (coba `KEYS app:*` sebagai `aplikasi`) | |
| - [ ] | AB10 | Klaim: tanpa `+@connection`, pengguna tidak bisa menjalankan `PING` (buat pengguna uji tanpa kategori itu) | |
| - [ ] | AB11 | Langkah 6: `ACL LOG 3` memuat entri `reason` bernilai `auth` (dari AB4) dan `command` dengan `object` `flushall`; catat medan dan nilai `count` | |
| - [ ] | AB12 | Langkah 7: `docker exec -e REDISCLI_AUTH=<password> redis-aman redis-cli PING` → `PONG` tanpa peringatan. Bandingkan dengan `redis-cli -a <password> PING` (catat teks peringatan) | |
| - [ ] | AB13 | Klaim: setelah `docker restart redis-aman`, pengguna `aplikasi`/`pembaca` hilang dan `default` kembali `nopass` (`ACL LIST`) | |
| - [ ] | AB14 | Troubleshooting: pengguna dibuat **tanpa** `on` → `AUTH` gagal dengan `WRONGPASS`; setelah `ACL SETUSER <nama> on`, `AUTH` berhasil | |
| - [ ] | AB15 | Troubleshooting dan latihan 2: pengguna `~tenant:* +@all` masih bisa `FLUSHALL`; `ACL SETUSER x on >pw ~* -@dangerous +@read` menolak `FLUSHALL` | |
| - [ ] | AB16 | Latihan 4: tiga `AUTH` salah dalam 60 detik tergabung menjadi satu entri `ACL LOG` dengan `count` 3 | |
| - [ ] | AB17 | **[klaim TLS]** Cek apakah `redis:latest` dikompilasi dengan TLS: `docker run --rm redis:latest redis-server --port 0 --tls-port 6380` lalu baca keluarannya (galat berkas sertifikat berarti TLS dikenali; galat direktif tidak dikenal berarti tidak). Sesuaikan kalimat "periksa dokumentasi image" bila perlu | |
| - [ ] | AB18 | Langkah 8: `docker rm -f redis-aman` berhasil | |

## AC. Bab Monitoring (`docs/operasi/monitoring.md`)

Mulai dari container `redis-pantau` baru. Item AC2 sampai AC10 bergantung pada data dari AC1.

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | AC1 | Langkah 1: loop `docker exec ... sh -c '...'` menjalankan tanpa galat kutip; `DBSIZE` → 501 (500 `produk:*` ditambah `antrean`). Catat bentuk keluaran dan shell yang dipakai | |
| - [ ] | AC2 | Langkah 2: `grep` menampilkan lima field: `used_memory_human`, `used_memory_rss_human`, `maxmemory_human:0B`, `maxmemory_policy:noeviction`, `mem_fragmentation_ratio`. Catat nilai nyata | |
| - [ ] | AC3 | Langkah 3: `MEMORY USAGE produk:1` dan `MEMORY USAGE antrean` mengembalikan byte; `antrean` jauh lebih besar. Catat angka (bab menulis ilustrasi 72 dan 1180000) | |
| - [ ] | AC4 | Langkah 3: `redis-cli --bigkeys` melaporkan `antrean` sebagai list terbesar (20000 items) dan 500 strings. Catat keluaran ringkasannya | |
| - [ ] | AC5 | Langkah 4: setelah `GET produk:1` dan `GET tidak-ada`, `keyspace_hits` dan `keyspace_misses` masing-masing naik 1. Bab menulis nilai absolut `1` dan `1`; catat nilai sebelum dan sesudah, karena perintah pengisian data mungkin ikut menghitung | |
| - [ ] | AC6 | Langkah 4: field `total_commands_processed`, `instantaneous_ops_per_sec`, `rejected_connections`, `evicted_keys`, `expired_keys` semuanya ada di `INFO stats` | |
| - [ ] | AC7 | Langkah 5: `INFO clients` memuat `connected_clients` dan `blocked_clients`; `redis-cli --stat` (dengan `-it`) mencetak tabel dengan kolom `keys`, `mem`, `clients`, `blocked`, `requests`, `connections` | |
| - [ ] | AC8 | Langkah 6: `CONFIG GET slowlog-log-slower-than` → `10000`; `CONFIG GET slowlog-max-len` → `128` (nilai bawaan pada image) | |
| - [ ] | AC9 | Langkah 6: setelah ambang `100`, `SLOWLOG RESET`, `LRANGE antrean 0 -1`, dan `KEYS '*'`, `SLOWLOG LEN` bernilai minimal 2 dan `SLOWLOG GET 2` memuat kedua perintah. Catat jumlah entri, durasi (mikrodetik), dan jumlah elemen per entri (bab menulis enam; versi baru bisa menambah elemen ketujuh). Bila kosong, ulangi dengan ambang `0` | |
| - [ ] | AC10 | Langkah 6: ambang dikembalikan ke `10000` dan `CONFIG GET` membuktikannya | |
| - [ ] | AC11 | Langkah 7: `redis-cli --latency` (dengan `-it`) mencetak `min: ..., max: ..., avg: ... (N samples)`; hentikan dengan `Ctrl+C`. Catat bentuk dan satuan | |
| - [ ] | AC12 | Langkah 8: `CONFIG SET latency-monitor-threshold 1` → `OK`; `LATENCY LATEST` kosong atau berisi event; catat teks `LATENCY DOCTOR` apa adanya. Coba picu event dengan `KEYS '*'` dan catat apakah event `command` muncul | |
| - [ ] | AC13 | **[format keluaran]** Tanpa `-it`, `DBSIZE`, `MEMORY USAGE`, dan `SLOWLOG LEN` mencetak angka polos, `GET` mencetak string tanpa tanda kutip, dan `GET` yang kosong mencetak baris kosong. Dengan `-it`, `SLOWLOG GET 2` tampil sebagai daftar bernomor. Bandingkan dengan blok di Langkah 1, 3, 4, dan 6 | |
| - [ ] | AC14 | Contoh lengkap: `sh cek-redis.sh redis-pantau` mencetak lima bagian; `HITS` dan `MISSES` terisi angka tanpa karakter `\r`. Catat bila ada galat | |
| - [ ] | AC15 | Troubleshooting: pengguna ACL `+@read +@connection -@dangerous` ditolak (`NOPERM`) saat menjalankan `INFO` dan `SLOWLOG GET`. Catat mana yang benar-benar ditolak, lalu sesuaikan kalimat bila perlu | |
| - [ ] | AC16 | Latihan 2: apakah `EXISTS produk:1` menaikkan `keyspace_hits`? Catat hasilnya agar petunjuk latihan akurat | |
| - [ ] | AC17 | Latihan 4: `redis-cli --scan` tidak tercatat di slow log pada ambang `100`, berbeda dengan `KEYS '*'`. Catat hasilnya | |
| - [ ] | AC18 | Langkah 9: `docker rm -f redis-pantau` berhasil | |

## AD. Bab Replikasi, Sentinel, dan Cluster (`docs/operasi/replikasi-sentinel-dan-cluster.md`)

Hanya bagian replikasi yang diuji. Mulai tanpa container `redis-utama`, `redis-replika`, dan jaringan `redis-ha`.

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | AD1 | Langkah 1: `docker network create redis-ha` dan `docker run -d --name redis-utama --network redis-ha redis:latest` mencetak ID jaringan dan container | |
| - [ ] | AD2 | Langkah 2: `docker run ... redis-server --replicaof redis-utama 6379` berjalan; nama `redis-utama` terselesaikan (cek `docker logs redis-replika` untuk baris sinkronisasi, catat kalimat aslinya) | |
| - [ ] | AD3 | Langkah 3: `ROLE` di primary → `master`, offset, dan satu replika; `ROLE` di replika → `slave`, `redis-utama`, `6379`, `connected`, offset. Catat bentuk asli, termasuk apakah alamat primary tampil sebagai nama atau IP | |
| - [ ] | AD4 | Langkah 3: `INFO replication` di replika memuat `role:slave`, `master_host`, dan `master_link_status:up`. Catat nilai asli | |
| - [ ] | AD5 | Langkah 4: `SET kota` di primary lalu `GET kota` di replika mengembalikan nilainya; bila kosong, catat berapa lama sampai muncul | |
| - [ ] | AD6 | Langkah 4 **[uji galat]**: `SET` di replika → `READONLY You can't write against a read only replica.`. Catat teks asli | |
| - [ ] | AD7 | Langkah 5: `docker stop redis-utama`; `REPLICAOF NO ONE` di replika → `OK`; `ROLE` → `master`; `SET` dan `GET` berhasil. **Catat offset pada `ROLE`**: bab kini menulis `(integer) <offset>` dan menyatakan angkanya kemungkinan besar melanjutkan hitungan primary lama, bukan 0. Konfirmasi, dan pastikan elemen ketiga berupa `(empty array)` | |
| - [ ] | AD8 | Langkah 5, klaim: `docker start redis-utama` lalu `ROLE` menunjukkan ia masih `master` (dua primary). Lalu `REPLICAOF redis-replika 6379` pada `redis-utama` membuat datanya diganti data `redis-replika` | |
| - [ ] | AD9 | Latihan 1 dan 2: replika kedua tersambung; `ROLE` di primary mendaftar dua replika; `INFO replication` di primary memuat field jumlah replika. Catat nama field asli (bab merujuk field berawalan `connected_`) | |
| - [ ] | AD10 | Troubleshooting: pada jaringan Docker **bawaan** (tanpa `--network`), `--replicaof redis-utama 6379` gagal menyelesaikan nama; catat `master_link_status` dan pesan di `docker logs` | |
| - [ ] | AD11 | **[format keluaran]** `ROLE` dan `SET` ke replika dijalankan dengan `-it` dan tampil sebagai daftar bernomor serta `(error) READONLY ...`; `GET kota` tanpa `-it` mencetak `Bandung` tanpa tanda kutip. Bandingkan dengan blok di Langkah 3, 4, dan 5 | |
| - [ ] | AD12 | **[uji galat]** Primary diberi password (`--requirepass`) tanpa `--masterauth` di replika: catat `master_link_status` dan pesan di log. Lalu tambah `--masterauth` dan pastikan sinkron | |
| - [ ] | AD13 | Langkah 6: `docker rm -f redis-utama redis-replika` dan `docker network rm redis-ha` berhasil | |

## Bagian Proyek Akhir (AE sampai AH)

Empat bab di `docs/proyek-akhir/` ditulis tanpa Redis asli. Yang **sudah dijalankan** hanyalah kode Python terhadap `fakeredis` (bukan Redis): `kunci.py`, `uji_katalog.py`, `uji_aliran.py`, sembilan tes `test_katalog.py`, dan `buat_rahasia.py`, ditambah `docker compose config` untuk `docker-compose.yml`. Semua perintah `redis-cli`, `docker compose up`, dan `docker kill` **belum dijalankan**. Output yang berasal dari fakeredis tetap harus dibuktikan ulang pada Redis asli di AF, AG, dan AH.

Persiapan tambahan untuk AE sampai AH:

- Folder latihan di luar repository (mis. `katalog-api`) dengan lingkungan virtual sendiri. Salin berkas dari bab: `kunci.py` (Perancangan), `sumber.py`, `main.py`, `uji_katalog.py` (Implementasi API), `realtime.py`, `uji_aliran.py` (Fitur realtime), `test_katalog.py`, `buat_rahasia.py`, `redis.conf`, `users.acl`, `docker-compose.yml` (Operasi dan pengujian).
- Pasang paket: `pip install "fastapi[standard]" redis httpx pytest fakeredis`. Catat versi Python, `redis-py`, FastAPI, Uvicorn, httpx, pytest, fakeredis (`pip show`).
- Port 6379 dan 8000 bebas. Container yang dipakai: `redis-proyek` (AE, AF, AG) dan `redis-katalog` (AH). Pastikan keduanya belum ada, jangan dijalankan bersamaan karena memakai port 6379 yang sama.
- Redis 7.0 atau lebih baru untuk semua item (opsi `NX` pada `EXPIRE`). Catat versi image (`docker exec <container> redis-server --version`).
- Di PowerShell, tulis `curl.exe` dan hindari kutip JSON bersarang; pakai skrip Python bila kutipnya bermasalah.
- Item bertanda **[uji galat]** memicu pesan galat; cocokkan kalimat aslinya dan sesuaikan tabel troubleshooting bila beda. Item **[peramban]** perlu peramban sungguhan.
- Jalankan `uji_katalog.py` hanya setelah jendela rate limit 60 detik sebelumnya berlalu, atau hapus key `katalog:rate:127.0.0.1`.

## AE. Bab Perancangan (`docs/proyek-akhir/perancangan.md`)

Mulai dari container `redis-proyek` yang bersih (`DBSIZE` = 0). Gunakan sesi interaktif `docker exec -it redis-proyek redis-cli` agar bentuk keluaran sama dengan bab.

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | AE1 | Langkah 2: `docker run -d --name redis-proyek redis:latest` mencetak ID container; `docker exec -it redis-proyek redis-cli` menampilkan prompt `127.0.0.1:6379>` | |
| - [ ] | AE2 | Langkah 3: `SET ... EX 300` → `OK`; `GET` mengembalikan JSON dengan tanda kutip ter-escape (`\"`). Catat bentuk asli | |
| - [ ] | AE3 | Langkah 3: `INCR katalog:rate:klien-1` → 1 lalu 2; `EXPIRE ... 60 NX` → 1 lalu 0 | |
| - [ ] | AE4 | Langkah 3: tiga `ZINCRBY` → `"1"`, `"2"`, `"1"` (string); `ZRANGE katalog:populer 0 2 REV WITHSCORES` → `produk:1`, `2`, `produk:2`, `1` | |
| - [ ] | AE5 | Langkah 3: `PFADD` dengan `klien-1 klien-2 klien-1` → 1; `PFCOUNT` → 2; `EXPIRE ... 604800` → 1 | |
| - [ ] | AE6 | Langkah 3: dua `XADD ... MAXLEN ~ 1000 *` mengembalikan ID berformat `angka-angka`; `XRANGE katalog:peristiwa - +` menampilkan dua entri dengan bidang `produk`, `jenis`, `nilai`. Catat bentuk keluaran | |
| - [ ] | AE7 | Langkah 4: `SCAN 0 MATCH katalog:* COUNT 100` → kursor `0` dan lima key; `DBSIZE` → 5 | |
| - [ ] | AE8 | Langkah 4: `TYPE` berurutan → `string`, `string`, `zset`, `string` (HyperLogLog), `stream` | |
| - [ ] | AE9 | Langkah 4: `TTL katalog:cache:produk:1` sekitar 300; `TTL katalog:populer` → -1. Catat hasil `MEMORY USAGE` (bab menulis 120 sebagai ilustrasi) | |
| - [ ] | AE10 | Contoh lengkap: `python kunci.py` mencetak enam baris yang sama dengan blok di bab. Catat versi Python | |
| - [ ] | AE11 | **[uji galat]** Troubleshooting: `SET katalog:populer x` lalu `ZINCRBY katalog:populer 1 produk:1` → `WRONGTYPE ...`. Catat teks asli | |
| - [ ] | AE12 | **[uji galat]** Opsional di Redis di bawah 7.0 (`redis:6`): `EXPIRE ... NX` menghasilkan galat sintaks. Catat teksnya | |
| - [ ] | AE13 | Latihan 4: ukur `MEMORY USAGE katalog:peristiwa` dengan satu dan dua entri; bandingkan dengan perkiraan 100 byte per entri di soal | |
| - [ ] | AE14 | Langkah 5: `docker rm -f redis-proyek` berhasil | |

## AF. Bab Implementasi API (`docs/proyek-akhir/implementasi-api.md`)

Pakai Redis asli (`redis-proyek` dengan `-p 127.0.0.1:6379:6379`) dan `redis-py` terbaru. Output di bab diperoleh dari fakeredis, jadi semua item di sini membuktikan perilaku Redis asli.

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | AF1 | Langkah 1: venv, `pip install`, dan `docker run ... -p 127.0.0.1:6379:6379 redis:latest` berhasil. Catat versi paket | |
| - [ ] | AF2 | Langkah 6: `fastapi dev main.py` berjalan tanpa galat impor; `python uji_katalog.py` selesai tanpa traceback | |
| - [ ] | AF3 | Langkah 6: `GET /produk/1` pertama → `MISS` sekitar 500 ms; kedua → `HIT` beberapa ms. Catat waktu nyata | |
| - [ ] | AF4 | Langkah 6: `PUT` → 200 dengan harga 47000; `GET` sesudahnya → `MISS` dengan harga 47000 | |
| - [ ] | AF5 | Langkah 6: `/populer?jumlah=2` → produk 1 dilihat 3, produk 2 dilihat 1; `/pengunjung/<hari ini UTC>` → `perkiraan` 1 | |
| - [ ] | AF6 | Langkah 6: banjir 8 permintaan → `[200, 200, 200, 200, 429, 429, 429, 429]`; `Retry-After` sekitar sisa jendela (≤ 60); `panggilan database` → 3 | |
| - [ ] | AF7 | Langkah 7: `SCAN` menampilkan lima jenis key sesuai kamus (`katalog:rate:127.0.0.1`, `populer`, `pengunjung:<hari>`, `peristiwa`, dua `cache:produk`); `ZRANGE katalog:populer 0 -1 REV WITHSCORES` → `produk:1` skor 7; `XLEN katalog:peristiwa` → 1 | |
| - [ ] | AF8 | Klaim `EXPIRE ... NX`: `TTL katalog:rate:127.0.0.1` terus berkurang pada dua pengecekan berurutan (tidak diperpanjang oleh permintaan baru); `TTL katalog:pengunjung:<hari>` sekitar 604800 dan tidak diperpanjang | |
| - [ ] | AF9 | Klaim: `TTL katalog:cache:produk:1` sekitar 300 setelah MISS | |
| - [ ] | AF10 | Klaim: `PUT /produk/1/harga` tidak dibatasi laju (kirim lebih dari 10 kali tanpa `429`) | |
| - [ ] | AF11 | **[uji galat]** Hentikan Redis (`docker stop redis-proyek`): `GET /produk/1` → 503 dengan `Redis tidak tersedia`; lalu `docker start redis-proyek` dan API pulih | |
| - [ ] | AF12 | **[uji galat]** `GET /pengunjung/2026-10-27` → 422 | |
| - [ ] | AF13 | Klaim IPv6: bila klien tersambung lewat `localhost` yang diterjemahkan ke `::1`, nama key menjadi `katalog:rate:--1` (tanpa `ValueError`). Catat alamat klien nyata | |
| - [ ] | AF14 | Latihan 2: `BATAS_PER_JENDELA=3`; catat permintaan ke berapa `429` pertama muncul | |
| - [ ] | AF15 | Kompatibilitas: `Path(pattern=...)` dan `redis.asyncio` bekerja pada versi FastAPI dan `redis-py` terpasang. Catat versi minimum yang kamu coba bila memakai versi lebih lama | |
| - [ ] | AF16 | Langkah 8: `docker rm -f redis-proyek` berhasil | |

## AG. Bab Fitur realtime (`docs/proyek-akhir/fitur-realtime.md`)

Opsional. Server FastAPI berjalan dengan `realtime.py` terdaftar (dua baris tambahan di `main.py`) dan Redis asli.

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | AG1 | Langkah 4: `curl.exe -N http://127.0.0.1:8000/aliran` langsung mencetak `: terhubung`; `PUT` dari terminal lain memunculkan `id: ...` dan `data: {...}` dengan nilai bertipe string | |
| - [ ] | AG2 | Langkah 5: `python uji_aliran.py` mencetak tiga baris `diterima`, satu baris `menyusul setelah ... -> ['49000', '50000']`, dan `Last-Event-ID tidak valid -> 400` | |
| - [ ] | AG3 | Langkah 6: `XLEN katalog:peristiwa` bukan nol dan `XRANGE katalog:peristiwa - + COUNT 2` menampilkan entri yang sudah terkirim (tidak terhapus setelah dibaca) | |
| - [ ] | AG4 | **[peramban]** Langkah 7: halaman `/` menampilkan satu baris baru tiap `PUT`; tanpa galat JavaScript di konsol | |
| - [ ] | AG5 | **[peramban]** Hentikan lalu jalankan ulang server saat halaman terbuka: `EventSource` menyambung ulang sendiri dan header `Last-Event-ID` terkirim (lihat Network di alat pengembang atau log server) | |
| - [ ] | AG6 | Klaim: dengan `Last-Event-ID: 0`, seluruh riwayat Stream dikirim ulang; dengan ID terbaru, tidak ada yang dikirim sampai ada peristiwa baru | |
| - [ ] | AG7 | Klaim: komentar `: ping` muncul sekitar tiap 15 detik tanpa peristiwa (amati `curl.exe -N`) | |
| - [ ] | AG8 | Klaim: respons `/aliran` memuat `content-type: text/event-stream`, `cache-control: no-cache`, dan `x-accel-buffering: no` (`curl.exe -i -N`) | |
| - [ ] | AG9 | Klaim kebocoran koneksi: setelah `curl -N` dihentikan, `connected_clients` di `INFO clients` kembali ke nilai awal dalam beberapa detik | |
| - [ ] | AG10 | **[uji galat]** Latihan 2 dan klaim yang dilunakkan: ubah `block=1000` menjadi `5000` dengan `socket_timeout=2`; catat apakah muncul `TimeoutError`, kapan, dan bagaimana respons API. Sesuaikan kalimat "dapat memicu" di bab sesuai hasilnya | |
| - [ ] | AG11 | Klaim pemangkasan: tulis lebih dari 1000 entri (`XADD katalog:peristiwa MAXLEN ~ 1000 * a b` berulang); `XLEN` mendekati 1000, tidak harus persis. Catat angka nyata | |
| - [ ] | AG12 | Klaim: `Last-Event-ID` berisi ID yang sudah dipangkas tetap menghasilkan aliran dari entri tertua yang masih ada, tanpa galat | |
| - [ ] | AG13 | Latihan 1: sambung ulang dengan `Last-Event-ID` entri pertama; hanya entri sesudahnya yang muncul | |

## AH. Bab Operasi dan pengujian (`docs/proyek-akhir/operasi-dan-pengujian.md`)

Gunakan `docker compose` dari folder berisi `redis.conf`, `users.acl`, dan `docker-compose.yml`. Hentikan `redis-proyek` lebih dulu (port 6379).

| ✓ | ID | Langkah dan yang diharapkan di bab | Hasil |
|---|---|---|---|
| - [ ] | AH1 | Langkah 1: `python buat_rahasia.py` mencetak dua blok (kata sandi dan hash, masing-masing 64 heksadesimal). Cek satu hash secara terpisah, mis. dengan `hashlib.sha256(<kata sandi>.encode()).hexdigest()` di Python atau perintah `sha256sum` pada teks kata sandi tanpa baris baru | |
| - [ ] | AH2 | Langkah 3: `docker compose config` tanpa galat; `docker compose up -d` membuat container `redis-katalog` dan volume. Catat **nama volume sebenarnya** di `docker volume ls` (bab menulis `redis-data`, Compose biasanya memberi awalan nama proyek) | |
| - [ ] | AH3 | Langkah 4: `docker compose ps` berstatus `Up`; `docker compose logs redis` memuat kalimat siap menerima koneksi tanpa galat berkas ACL atau konfigurasi. Catat kalimat aslinya | |
| - [ ] | AH4 | Langkah 4: `PING` sebelum `AUTH` → `NOAUTH`; `AUTH api-katalog` → `OK`; `SET katalog:uji 1` → `OK`; `SET lain:uji 1` → `NOPERM` (key); `DEL katalog:uji` → `(integer) 1`; `FLUSHALL` dan `INFO` → `NOPERM`. Catat teks asli semua galat | |
| - [ ] | AH5 | Langkah 4: `AUTH pemantau` → `OK`; `PING` → `PONG`; `GET katalog:uji` → `NOPERM`; `INFO persistence` menampilkan `aof_enabled:1` | |
| - [ ] | AH6 | Klaim: `ACL WHOAMI` sebagai `api-katalog` ditolak (`NOPERM`) karena tidak termasuk kategori yang diberikan | |
| - [ ] | AH7 | Klaim `user default off`: koneksi baru dari komputer (`redis-cli -h 127.0.0.1 -p 6379`, bila terpasang) tidak menghadapi penolakan *protected mode*, hanya `NOAUTH` sampai `AUTH`. Catat perilaku nyata | |
| - [ ] | AH8 | Langkah 5: `REDIS_URL=redis://api-katalog:<kata sandi>@localhost:6379/0 fastapi dev main.py` lalu `python uji_katalog.py` memberi keluaran seperti bab Implementasi API tanpa `NOPERM`. Catat apakah muncul peringatan `redis-py` soal `CLIENT SETINFO` yang ditolak (`-@dangerous`) | |
| - [ ] | AH9 | **[uji galat]** Bila AH8 gagal dengan `NOPERM`, catat perintah yang ditolak dan sesuaikan aturan `api-katalog` di bab (izin tersempit yang cukup) | |
| - [ ] | AH10 | Langkah 6: tunggu 2 detik, `docker kill redis-katalog`, `docker compose up -d`; `ZRANGE katalog:populer 0 -1 REV WITHSCORES` dan `XLEN katalog:peristiwa` sama seperti sebelum crash. Catat apakah container menyala sendiri (`restart: unless-stopped`) setelah `docker kill` | |
| - [ ] | AH11 | Klaim `everysec`: tulis lalu `docker kill` kurang dari 1 detik kemudian; catat apakah tulisan terakhir hilang (opsional, tidak deterministik) | |
| - [ ] | AH12 | Langkah 7: sebagai `pemantau`, `INFO memory`, `INFO stats`, `INFO persistence`, `SLOWLOG GET 5`, dan `DBSIZE` berhasil. Catat bentuk `SLOWLOG GET` | |
| - [ ] | AH13 | Langkah 7: field berikut ada di `INFO`: `evicted_keys`, `keyspace_hits`, `keyspace_misses`, `rejected_connections`, `rdb_last_bgsave_status`, `aof_last_write_status`, `aof_last_bgrewrite_status`, `latest_fork_usec`, dan `maxmemory_policy:volatile-lru` dengan `maxmemory_human` sekitar 256M | |
| - [ ] | AH14 | **[uji galat]** Klaim `volatile-lru`: turunkan `maxmemory` (mis. 2mb) lewat `redis.conf`, isi key tanpa TTL sampai penuh; penulisan berikutnya ditolak dengan galat OOM. Catat teks asli. Lalu isi key ber-TTL dan amati `evicted_keys` naik. Kembalikan nilai awal | |
| - [ ] | AH15 | Langkah 8: `python -m pytest -v test_katalog.py` → 9 passed pada mesinmu. Catat versi Python, pytest, fakeredis | |
| - [ ] | AH16 | Latihan 3: nonaktifkan baris `await r.delete(kunci.cache_produk(produk_id))` → `test_ubah_harga_menghapus_cache_dan_menulis_peristiwa` gagal; kembalikan barisnya | |
| - [ ] | AH17 | Klaim batas fakeredis: jalankan tes yang sama terhadap Redis asli (ganti fixture dengan klien ke `redis-katalog`) atau catat perbedaan perilaku yang kamu temui (mis. `EXPIRE NX`, `XADD`, `PFADD`) | |
| - [ ] | AH18 | Latihan 1: tambah pengguna `operator`; `ACL LOG` memuat entri `NOPERM` dari `api-katalog` yang dihasilkan di AH4 | |
| - [ ] | AH19 | **[uji galat]** Troubleshooting: ubah satu karakter hash di `users.acl` (63 atau 65 karakter) → Redis gagal start; catat kalimat di `docker compose logs redis` lalu kembalikan | |
| - [ ] | AH20 | Troubleshooting (Linux atau macOS): berkas `users.acl` ber-izin `600` milik pengguna lain → Redis gagal membacanya; `chmod 644` memperbaiki. Lewati bila di Windows | |
| - [ ] | AH21 | Langkah 9: `docker compose down` menyisakan volume (`docker volume ls`); `docker compose down -v` menghapusnya dan data permanen hilang. Lakukan `-v` hanya setelah semua item AH selesai | |

## Z. Penutup

Berlaku untuk semua bagian di atas (A sampai AH).

| ✓ | ID | Tugas | Hasil |
|---|---|---|---|
| - [ ] | Z1 | Untuk setiap item di atas yang hasilnya **sama** dengan bab: ubah label "diharapkan" menjadi "terverifikasi (Redis `<versi>`, `<tanggal>`)" di blok atau admonition "Status verifikasi" terkait | |
| - [ ] | Z2 | Untuk setiap item yang hasilnya **berbeda**: perbaiki kalimat atau output di bab dan catat di tabel perubahan di bawah | |
| - [ ] | Z3 | `mkdocs build --strict` berhasil tanpa warning proyek | |
| - [ ] | Z4 | `docker rm -f redis` dan hapus volume uji yang tersisa. Untuk bagian Operasi, pastikan juga tidak ada sisa container `redis-persist`, `redis-aman`, `redis-pantau`, `redis-utama`, `redis-replika`, volume `redis-data`, dan jaringan `redis-ha`. Untuk bagian Proyek Akhir, pastikan juga tidak ada sisa container `redis-proyek` dan `redis-katalog`, serta volume dari `docker compose` (`docker compose down -v` di folder proyek) | |

## Catatan di luar cakupan bab (opsional, jangan dikerjakan tanpa diminta)

- `PROMPT_MKDOCS_TEMPLATE.md` adalah prompt pembuatan template lama dan belum diubah atau dihapus.
- `CLAUDE.md` merujuk `docs/redis/_template-bab.md`, file yang sudah dihapus.

## Tabel perubahan (isi saat memperbaiki bab)

| File | Bagian | Sebelum | Sesudah | Alasan (ID item) |
|---|---|---|---|---|
| | | | | |
