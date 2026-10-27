# List

## Tujuan belajar

Setelah bab ini kamu bisa:

- [ ] Menjelaskan apa itu List di Redis dan bedanya antrean (FIFO) dengan tumpukan (LIFO).
- [ ] Menambah dan mengambil elemen dengan `LPUSH`, `RPUSH`, `LPOP`, dan `RPOP`.
- [ ] Melihat isi List dengan `LRANGE` dan `LLEN`, serta memotongnya dengan `LTRIM`.
- [ ] Membuat antrean sederhana yang menunggu pekerjaan dengan `BRPOP`.
- [ ] Mengenali galat `WRONGTYPE` dan risiko `LRANGE` pada List besar.

## Prasyarat

- Sudah membaca [Hash](hash.md) dan [String](string.md), terutama arti `(integer)`, `(nil)`, dan galat `WRONGTYPE`.
- Sudah membaca [Key dan expiry](../pengenalan/key-dan-expiry.md) untuk skema nama key.
- Container Redis berjalan dan kamu bisa masuk dengan `docker exec -it redis redis-cli` (lihat [Instalasi dengan Docker](../pengenalan/instalasi-dengan-docker.md)).
- Versi Redis: `LPOP` dan `RPOP` dengan jumlah elemen (`count`) tersedia sejak Redis 6.2.0.[^4] Versi dari `redis:latest` memenuhi syarat ini.
- Langkah 7 memerlukan **dua terminal** yang sama-sama terhubung ke Redis.
- Kondisi awal: tidak ada key berawalan `tugas:`, `riwayat:`, atau `undo:` yang kamu perlukan.
- Opsional untuk contoh Python: Python 3 dan paket `redis` (`pip install redis`).

## Konsep

List adalah deretan String yang **berurutan** menurut urutan penambahan. Kamu bisa menambah elemen di ujung kiri (kepala, *head*) atau ujung kanan (ekor, *tail*), dan mengambil dari kedua ujung itu.[^1] Elemen yang sama boleh muncul berkali-kali.

Dua pola yang paling sering dibuat dari List:

| Pola | Aturan | Cara di Redis |
|---|---|---|
| **Antrean** (*queue*, FIFO) | Yang masuk pertama keluar pertama | Tambah di satu ujung, ambil dari ujung lawan: `RPUSH` lalu `LPOP` |
| **Tumpukan** (*stack*, LIFO) | Yang masuk terakhir keluar pertama | Tambah dan ambil dari ujung yang sama: `LPUSH` lalu `LPOP` |

Kenapa berguna: antrean dipakai untuk membagi pekerjaan antar proses (satu proses menaruh tugas, proses lain mengerjakan), sedangkan tumpukan cocok untuk riwayat terbaru atau fitur "urungkan". Redis menjalankan tiap perintah secara atomik, jadi dua pekerja yang mengambil dari List yang sama tidak akan mendapat elemen yang sama.

### Analogi

Antrean: orang mengantre di loket, yang datang lebih dulu dilayani lebih dulu. Tumpukan: setumpuk piring, piring yang terakhir kamu taruh adalah yang pertama kamu ambil.

!!! note "Batas analogi"
    Berbeda dengan antrean loket, List Redis tidak tahu siapa yang sedang "dilayani". Setelah elemen diambil dengan `LPOP`, ia hilang dari List. Kalau pekerja mati sebelum selesai, tugasnya ikut hilang. Pola yang lebih andal dibahas di bagian Pola Penerapan.

## Cara kerja

```mermaid
flowchart LR
    A["RPUSH (tambah di kanan)"] --> L["kiri [ t1 | t2 | t3 ] kanan"]
    L --> B["LPOP (ambil dari kiri)"]
```

Pada gambar, tugas masuk dari kanan dan keluar dari kiri, jadi `t1` yang pertama diambil: itu antrean FIFO. Bila masuk dan keluar sama-sama di kiri, jadilah tumpukan LIFO.

| Perintah | Fungsi | Balasan |
|---|---|---|
| `LPUSH key e [e ...]` / `RPUSH key e [e ...]` | Tambah di kiri / kanan.[^2][^3] | Panjang List setelah penambahan |
| `LPOP key [count]` / `RPOP key [count]` | Ambil dan hapus dari kiri / kanan.[^4][^5] | Elemen, atau `(nil)` bila kosong |
| `LRANGE key start stop` | Lihat elemen pada rentang indeks.[^6] | Daftar elemen |
| `LLEN key` | Hitung elemen.[^7] | Jumlah elemen |
| `LTRIM key start stop` | Pertahankan hanya rentang itu.[^8] | `OK` |
| `BRPOP key [key ...] timeout` | Seperti `RPOP`, tetapi menunggu bila kosong.[^9] | Key dan elemen, atau `(nil)` saat waktu habis |

Indeks dimulai dari `0` (elemen paling kiri). Indeks negatif menghitung dari kanan: `-1` elemen terakhir.[^6] Karena itu `LRANGE key 0 -1` berarti "semua elemen".

## Praktik langkah demi langkah

Output di bawah adalah output **terverifikasi**: dijalankan di Redis 8.10.3 pada 2026-10-27. Hasilmu bisa berbeda pada nilai yang berubah tiap eksekusi. Bandingkan dengan hasilmu sendiri.

**Lingkungan: terminal**

```bash
docker exec -it redis redis-cli
```

Semua langkah berikutnya di **redis-cli**, kecuali dinyatakan lain.

### Langkah 1: Antrean dengan `RPUSH` dan `LPOP`

```text
127.0.0.1:6379> RPUSH tugas:email "kirim-A" "kirim-B" "kirim-C"
127.0.0.1:6379> LRANGE tugas:email 0 -1
127.0.0.1:6379> LPOP tugas:email
127.0.0.1:6379> LLEN tugas:email
```

Kenapa langkah ini diperlukan: kita ingin melihat perilaku FIFO. Tiga tugas ditambah di kanan, lalu diambil dari kiri.

| Bagian | Fungsi dan alasan |
|---|---|
| `RPUSH ... "kirim-A" "kirim-B" "kirim-C"` | Menambah tiga elemen berurutan di kanan. Key dibuat otomatis jika belum ada. |
| `LRANGE tugas:email 0 -1` | Melihat seluruh isi tanpa mengubahnya. |
| `LPOP` | Mengambil sekaligus **menghapus** elemen paling kiri. |
| `LLEN` | Memastikan jumlah berkurang. |

**Terverifikasi:**

```text
(integer) 3
1) "kirim-A"
2) "kirim-B"
3) "kirim-C"
"kirim-A"
(integer) 2
```

Cara membaca output: `RPUSH` membalas panjang List. `kirim-A` masuk pertama dan keluar pertama.

### Langkah 2: Tumpukan dengan `LPUSH` dan `LPOP`

```text
127.0.0.1:6379> LPUSH undo:dokumen "ketik-1" "ketik-2" "ketik-3"
127.0.0.1:6379> LRANGE undo:dokumen 0 -1
127.0.0.1:6379> LPOP undo:dokumen
```

**Terverifikasi:**

```text
(integer) 3
1) "ketik-3"
2) "ketik-2"
3) "ketik-1"
"ketik-3"
```

Cara membaca output: `LPUSH` dengan banyak elemen memasukkannya satu per satu dari kiri, jadi elemen terakhir yang disebut (`ketik-3`) berada paling kiri.[^2] `LPOP` mengambil yang paling kiri, yaitu yang terakhir masuk: itu LIFO.

### Langkah 3: Ambil beberapa elemen sekaligus

```text
127.0.0.1:6379> RPUSH tugas:laporan "L1" "L2" "L3" "L4"
127.0.0.1:6379> LPOP tugas:laporan 2
127.0.0.1:6379> RPOP tugas:laporan
```

Argumen `count` (Redis 6.2+) mengambil beberapa elemen dalam satu perintah, lebih efisien daripada mengulang `LPOP`. **Terverifikasi:** `(integer) 4`, lalu `1) "L1"` `2) "L2"`, lalu `"L4"`.

### Langkah 4: Rentang indeks dan `LTRIM`

```text
127.0.0.1:6379> RPUSH riwayat:login "a" "b" "c" "d" "e"
127.0.0.1:6379> LRANGE riwayat:login 0 1
127.0.0.1:6379> LRANGE riwayat:login -2 -1
127.0.0.1:6379> LTRIM riwayat:login -3 -1
127.0.0.1:6379> LRANGE riwayat:login 0 -1
```

Kenapa `LTRIM`: untuk menjaga List tetap pendek, misalnya hanya menyimpan 3 riwayat terbaru. Tanpa pembatas, List terus tumbuh dan memakan memori.

**Terverifikasi:**

```text
(integer) 5
1) "a"
2) "b"
1) "d"
2) "e"
OK
1) "c"
2) "d"
3) "e"
```

!!! danger "Risiko kehilangan data"
    `LTRIM` membuang permanen semua elemen di luar rentang. Pastikan indeks benar sebelum menjalankannya. `LPOP`/`RPOP` juga menghapus elemen yang diambil.

### Langkah 5: List kosong menghilang

```text
127.0.0.1:6379> RPUSH sekali "x"
127.0.0.1:6379> LPOP sekali
127.0.0.1:6379> EXISTS sekali
127.0.0.1:6379> LPOP sekali
```

**Terverifikasi:** `(integer) 1`, `"x"`, `(integer) 0`, lalu `(nil)`. Redis menghapus key List yang sudah tidak punya elemen,[^1] dan `LPOP` pada List kosong membalas `(nil)`, bukan galat.

### Langkah 6: Peringatan `LRANGE 0 -1` pada List besar

`LRANGE key 0 -1` mengembalikan seluruh isi sekaligus. Pada List dengan jutaan elemen, ini membebani server dan jaringan.[^6] Untuk List kecil seperti latihan ini aman. Untuk List besar, ambil per halaman, misalnya `LRANGE key 0 99`, lalu `LRANGE key 100 199`.

### Langkah 7: Menunggu pekerjaan dengan `BRPOP` (dua terminal)

`RPOP` pada List kosong langsung membalas `(nil)`, sehingga pekerja harus terus bertanya (*polling*). `BRPOP` menahan koneksi sampai ada elemen atau waktu habis.[^9]

**Terminal A (pekerja):**

```text
127.0.0.1:6379> BRPOP antrean:kerja 30
```

Perintah ini diam menunggu sampai 30 detik. `30` adalah batas waktu dalam detik; `0` berarti menunggu tanpa batas.

**Terminal B (pengirim), dalam 30 detik:**

```text
127.0.0.1:6379> LPUSH antrean:kerja "tugas-1"
```

Di sini `LPUSH` + `BRPOP` membentuk antrean FIFO: masuk dari kiri, keluar dari kanan.

**Terverifikasi di Terminal B:** `(integer) 1`.

**Terverifikasi di Terminal A:**

```text
1) "antrean:kerja"
2) "tugas-1"
(0.xx s)
```

Cara membaca output: balasan `BRPOP` selalu berisi nama key lalu elemen, karena ia bisa menunggu beberapa key sekaligus. Angka waktu menunjukkan lama menunggu. Bila tidak ada kiriman sampai waktu habis, balasannya `(nil)`.

!!! warning "Jangan beri timeout `0` tanpa alasan"
    Timeout `0` membuat klien menunggu selamanya. Pakai angka terbatas supaya program bisa memeriksa tanda berhenti secara berkala.

### Langkah 8: Bersihkan data latihan

```text
127.0.0.1:6379> DEL tugas:email undo:dokumen tugas:laporan riwayat:login antrean:kerja
```

**Terverifikasi:** `(integer)` sejumlah key yang masih ada, maksimal 5.

!!! danger "`DEL` tidak bisa dibatalkan"
    Perintah di atas menyebut key satu per satu agar tidak ada key lain yang ikut terhapus.

## Contoh lengkap

**Lingkungan: Python** · Kebutuhan: Python 3, paket `redis` (`pip install redis`), dan Redis berjalan di `localhost:6379`.

```python title="list_antrean.py"
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

KEY = "antrean:kerja"

r.delete(KEY)

# Pengirim: masukkan tugas dari kiri
for i in range(1, 4):
    panjang = r.lpush(KEY, f"tugas-{i}")
    print("dikirim tugas", i, "| panjang antrean:", panjang)

# Pekerja: ambil dari kanan; berhenti bila kosong selama 2 detik
while True:
    hasil = r.brpop(KEY, timeout=2)
    if hasil is None:
        print("antrean kosong, pekerja berhenti")
        break
    nama_key, tugas = hasil
    print("mengerjakan", tugas)
```

Penjelasan baris penting:

| Baris | Penjelasan |
|---|---|
| `r.delete(KEY)` | Memulai dari antrean kosong; menghapus key itu bila ada. |
| `r.lpush(KEY, ...)` | Menambah di kiri; mengembalikan panjang List. |
| `r.brpop(KEY, timeout=2)` | Mengambil dari kanan dan menunggu maksimal 2 detik. Mengembalikan tuple `(key, elemen)` atau `None` bila waktu habis. |
| `if hasil is None` | Tanda antrean kosong, sehingga loop tidak berjalan selamanya. |
| `nama_key, tugas = hasil` | `BRPOP` membalas pasangan key dan elemen. |

Cara menjalankan: `python list_antrean.py`.

**Terverifikasi:**

```text
dikirim tugas 1 | panjang antrean: 1
dikirim tugas 2 | panjang antrean: 2
dikirim tugas 3 | panjang antrean: 3
mengerjakan tugas-1
mengerjakan tugas-2
mengerjakan tugas-3
antrean kosong, pekerja berhenti
```

Urutan pengerjaan sama dengan urutan pengiriman karena masuk dari kiri dan keluar dari kanan (FIFO).

## Kesalahan umum dan troubleshooting

| Gejala | Penyebab dan solusi |
|---|---|
| `(error) WRONGTYPE Operation against a key holding the wrong kind of value` | Key bukan List. Cek `TYPE key` dan pakai key lain. |
| `LPOP`/`RPOP` membalas `(nil)` | List kosong atau key tidak ada. Normal; pakai `BRPOP` bila ingin menunggu. |
| `LRANGE` membalas `(empty array)` | Key tidak ada, atau rentang di luar List. |
| Urutan terbalik setelah `LPUSH a b c` | `LPUSH` memasukkan satu per satu dari kiri, hasilnya `c b a`.[^2] |
| `BRPOP` terasa "menggantung" | Itu memang menunggu. Beri timeout terbatas atau tekan Ctrl+C. |
| Galat saat `count` pada `LPOP`/`RPOP` atau `timeout` pada `BRPOP` bukan angka | `count` harus bilangan bulat positif dan `timeout` harus angka tidak negatif (desimal diperbolehkan di Redis 6.0+).[^9] Periksa argumen yang kamu kirim. Teramati di Redis 8.10.3: `LPOP k abc` → `(error) ERR value is out of range, must be positive`, `BRPOP k abc` → `(error) ERR timeout is not a float or out of range`; teks bisa berbeda antarversi. |
| `LPOP key 2` menghasilkan galat syntax di versi lama | Argumen `count` baru ada sejak Redis 6.2.[^4] Perbarui Redis. |
| List terus membesar | Tidak ada yang mengambil atau memangkas. Pakai `LTRIM` atau pekerja yang cukup. |

!!! note "Status verifikasi"
    Perintah, nilai balik, dan skrip di bab ini dijalankan di Redis 8.10.3 (`redis:latest`) pada 2026-10-27, dengan Python 3.12.3 dan redis-py 8.1.0. Sintaks juga dicocokkan dengan dokumentasi resmi Redis. Nilai yang berubah tiap eksekusi (ID, TTL, waktu, urutan, alamat IP) bisa berbeda di komputermu, dan teks galat bisa berbeda antarversi. Tampilan prompt interaktif `redis-cli` (prompt, Tab, riwayat) tidak teramati karena pengujian berjalan tanpa terminal interaktif.

## Latihan

1. Buat antrean `tugas:cetak` dengan tiga elemen memakai `RPUSH`. Ambil dua dengan `LPOP`. Elemen apa yang tersisa?
2. Sebelum menjalankan: apa isi List setelah `LPUSH huruf a b c`? Jalankan `LRANGE huruf 0 -1` lalu bandingkan.
3. Buat riwayat 5 elemen lalu pertahankan hanya 2 yang terbaru (kanan) dengan `LTRIM`.
4. Jalankan `BRPOP kosong 5` tanpa mengirim apa pun. Apa balasan setelah 5 detik?
5. Ubah `list_antrean.py` agar membuat tumpukan, bukan antrean. Perintah mana yang perlu diganti?

??? success "Petunjuk"
    1. `LPOP` mengambil dari kiri.
    2. Ingat aturan urutan `LPUSH` di Langkah 2.
    3. Gunakan indeks negatif: `-2 -1`.
    4. Perhatikan `(nil)` dan lama menunggu.
    5. Ganti `brpop` dengan `blpop` agar masuk dan keluar dari sisi yang sama.

## Ringkasan

- List adalah deretan String berurutan; elemen boleh sama. Redis menghapus List yang kosong.
- Antrean FIFO: `RPUSH` + `LPOP` (atau `LPUSH` + `RPOP`). Tumpukan LIFO: `LPUSH` + `LPOP`.
- `LRANGE key 0 -1` melihat semua isi; hindari pada List besar. `LTRIM` memangkas List dan membuang elemen di luar rentang.
- `BRPOP` menunggu elemen sampai timeout, menghindari polling terus-menerus.
- Elemen yang sudah di-`POP` hilang dari List; pola yang lebih andal untuk pekerjaan penting dibahas di bagian Pola Penerapan.

Berikutnya: [Set](set.md), untuk data unik dan operasi irisan.

## Referensi resmi

[^1]: Redis, *Redis lists*: <https://redis.io/docs/latest/develop/data-types/lists/>
[^2]: Redis, *LPUSH*: <https://redis.io/docs/latest/commands/lpush/>
[^3]: Redis, *RPUSH*: <https://redis.io/docs/latest/commands/rpush/>
[^4]: Redis, *LPOP*: <https://redis.io/docs/latest/commands/lpop/>
[^5]: Redis, *RPOP*: <https://redis.io/docs/latest/commands/rpop/>
[^6]: Redis, *LRANGE*: <https://redis.io/docs/latest/commands/lrange/>
[^7]: Redis, *LLEN*: <https://redis.io/docs/latest/commands/llen/>
[^8]: Redis, *LTRIM*: <https://redis.io/docs/latest/commands/ltrim/>
[^9]: Redis, *BRPOP*: <https://redis.io/docs/latest/commands/brpop/>

Bacaan tambahan: [`BLPOP`](https://redis.io/docs/latest/commands/blpop/), [`LMOVE`](https://redis.io/docs/latest/commands/lmove/), [`LINDEX`](https://redis.io/docs/latest/commands/lindex/).
