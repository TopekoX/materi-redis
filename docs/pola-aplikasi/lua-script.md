# Lua script

!!! info "Opsional"
    Bab ini boleh dilewati tanpa memutus alur belajar. Sebagian besar kebutuhan atomik bisa dipenuhi satu perintah atau [transaksi](transaksi.md); Lua script berguna untuk logika bersyarat yang tidak bisa dilakukan keduanya.

## Tujuan belajar

Setelah bab ini kamu bisa:

- [ ] Menjelaskan apa itu Lua script di Redis dan kenapa script berjalan secara atomik.
- [ ] Menjalankan script dengan `EVAL`, memakai `KEYS` dan `ARGV`, dan memanggil perintah Redis lewat `redis.call`.
- [ ] Menulis script "bandingkan lalu hapus" dan "naikkan counter beserta expiry" secara atomik.
- [ ] Memakai `SCRIPT LOAD` dan `EVALSHA`, serta `register_script` di Python.
- [ ] Menyebut risiko script yang lambat dan aturan penulisan yang aman.

## Prasyarat

- Sudah membaca [Transaksi](transaksi.md), terutama alasan `WATCH` perlu diulang dan bahwa transaksi tidak bisa menggantungkan keputusan pada hasil baca di tengah jalan.
- Sudah membaca [Session dan rate limiting](session-dan-rate-limiting.md) dan [String](../struktur-data/string.md) (pola `SET ... NX EX`).
- Container Redis berjalan dan kamu bisa masuk dengan `docker exec -it redis redis-cli` (lihat [Instalasi dengan Docker](../pengenalan/instalasi-dengan-docker.md)).
- Versi Redis: `EVAL` dan `EVALSHA` tersedia sejak Redis 2.6. Redis menjalankan script dengan Lua 5.1.[^1]
- Kondisi awal: tidak ada key berawalan `kunci:` atau `rate:` yang kamu perlukan.
- Untuk contoh Python: Python 3 dan paket `redis` (`pip install redis`).
- Tidak perlu pengalaman Lua. Bab ini hanya memakai `local`, `if`, dan pemanggilan fungsi.

## Konsep

**Lua** adalah bahasa pemrograman kecil yang ditanam di dalam Redis. Dengan `EVAL`, kamu mengirim potongan kode Lua ke server dan server menjalankannya di tempat. Selama script berjalan, Redis **tidak menjalankan perintah klien lain**, jadi seluruh script bersifat atomik.[^1]

Kenapa dibutuhkan: di bab [Transaksi](transaksi.md), keputusan "cek dulu, baru ubah" butuh `WATCH` dan percobaan ulang karena hasil baca tidak tersedia di dalam `MULTI`. Di Lua, script bisa membaca, memutuskan, lalu menulis dalam satu langkah atomik tanpa percobaan ulang. Selain itu, tiga langkah menjadi satu kali perjalanan jaringan.

### Analogi

Transaksi seperti menitipkan daftar belanja ke kasir. Lua script seperti menitipkan **resep dengan instruksi bersyarat**: "jika stok ada, ambil; jika tidak, kembalikan 0." Kasir mengerjakan seluruh resep tanpa melayani orang lain di tengahnya.

!!! warning "Konsekuensi atomik"
    Selama script berjalan, seluruh server menunggu. Script yang lambat atau berulang tanpa batas membuat Redis tampak mati untuk semua klien. Jaga script tetap pendek.

## Cara kerja

Bentuk perintah:[^2]

```text
EVAL script jumlah_key key [key ...] arg [arg ...]
```

| Bagian | Arti |
|---|---|
| `script` | Teks kode Lua |
| `jumlah_key` | Berapa argumen pertama setelahnya yang merupakan **key** |
| `KEYS[1]`, `KEYS[2]`, ... | Nama key yang diteruskan (indeks mulai dari **1**) |
| `ARGV[1]`, `ARGV[2]`, ... | Argumen biasa (selalu String) |
| `redis.call('PERINTAH', ...)` | Memanggil perintah Redis; bila galat, script berhenti dengan galat |

Kenapa key dan argumen dipisah: nama key harus diteruskan lewat `KEYS` (bukan ditulis langsung di dalam script) agar script tetap benar di Redis Cluster, yang perlu tahu key mana yang disentuh.[^1]

Konversi nilai balik Lua ke Redis:[^1]

| Lua | Balasan Redis |
|---|---|
| angka | integer (desimal dipotong, mis. `3.9` menjadi `3`) |
| string | bulk string |
| tabel (array) | array |
| `false` | `(nil)` |
| `true` | integer `1` |

## Praktik langkah demi langkah

Output di bawah adalah output yang **diharapkan** berdasarkan dokumentasi, bukan hasil eksekusi di komputermu.

**Lingkungan: terminal**

```bash
docker exec -it redis redis-cli
```

Semua langkah berikutnya di **redis-cli**. Script ditulis dalam satu baris di dalam tanda kutip ganda, dan tanda kutip tunggal dipakai di dalam script.

### Langkah 1: Script paling sederhana

```text
127.0.0.1:6379> EVAL "return ARGV[1]" 0 halo
127.0.0.1:6379> EVAL "return 3.9" 0
```

| Bagian | Fungsi dan alasan |
|---|---|
| `"return ARGV[1]"` | Mengembalikan argumen pertama. |
| `0` | Jumlah key; di sini tidak ada key. |
| `halo` | Nilai `ARGV[1]`. |

**Diharapkan:** `"halo"`, lalu `(integer) 3`. Contoh kedua menunjukkan angka desimal dipotong menjadi integer.

### Langkah 2: Memakai key dan `redis.call`

```text
127.0.0.1:6379> SET nama "Budi"
127.0.0.1:6379> EVAL "return redis.call('GET', KEYS[1])" 1 nama
```

Kenapa langkah ini diperlukan: ini cara script berbicara dengan data. `1` berarti satu key (`nama`), yang muncul sebagai `KEYS[1]`. **Diharapkan:** `OK`, lalu `"Budi"`.

### Langkah 3: Bandingkan lalu hapus (lepas kunci dengan aman)

Dari bab [String](../struktur-data/string.md) kamu sudah mengambil kunci dengan `SET ... NX EX`. Melepasnya dengan `DEL` biasa berbahaya: jika kuncimu sudah kedaluwarsa dan diambil proses lain, `DEL` menghapus kunci **milik orang lain**. Solusinya, hapus hanya bila nilainya masih milikmu, dan itu harus atomik.

```text
127.0.0.1:6379> SET kunci:laporan "proses-A" NX EX 60
127.0.0.1:6379> EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end" 1 kunci:laporan proses-B
127.0.0.1:6379> EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end" 1 kunci:laporan proses-A
127.0.0.1:6379> GET kunci:laporan
```

| Bagian | Fungsi dan alasan |
|---|---|
| `redis.call('GET', KEYS[1]) == ARGV[1]` | Membandingkan pemilik kunci sekarang dengan pemanggil. |
| `return redis.call('DEL', KEYS[1])` | Menghapus hanya jika cocok; membalas 1 (terhapus). |
| `else return 0 end` | Bukan pemilik: tidak melakukan apa pun. |

**Diharapkan:** `OK`, `(integer) 0` (`proses-B` bukan pemilik), `(integer) 1` (`proses-A` pemilik), lalu `(nil)`.

!!! danger "Kunci terdistribusi tidak sesederhana ini"
    Pola ini cukup untuk latihan dan kasus sederhana pada satu Redis. Untuk sistem produksi ada pertimbangan tambahan (kegagalan server, kedaluwarsa saat masih bekerja) yang dibahas dokumentasi resmi tentang kunci terdistribusi.

### Langkah 4: `INCR` dan `EXPIRE` yang atomik

Di bab [Session dan rate limiting](session-dan-rate-limiting.md), ada celah kecil bila aplikasi berhenti di antara `INCR` dan `EXPIRE`. Script menutupnya:

```text
127.0.0.1:6379> EVAL "local n = redis.call('INCR', KEYS[1]) if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return n" 1 rate:uji 5
127.0.0.1:6379> EVAL "local n = redis.call('INCR', KEYS[1]) if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return n" 1 rate:uji 5
127.0.0.1:6379> TTL rate:uji
```

| Bagian | Fungsi dan alasan |
|---|---|
| `local n = ...` | Variabel lokal berisi hasil `INCR`. |
| `if n == 1 then ... end` | Hanya pada permintaan pertama jendela, pasang expiry `ARGV[1]` detik. |
| `return n` | Mengembalikan hitungan terbaru. |

**Diharapkan:** `(integer) 1`, `(integer) 2`, lalu angka sekitar `5` atau kurang. Karena `INCR` dan `EXPIRE` ada dalam satu script, tidak ada saat ketika counter ada tanpa expiry.

### Langkah 5: `SCRIPT LOAD` dan `EVALSHA`

Mengirim teks script panjang tiap kali boros. `SCRIPT LOAD` menyimpan script di server dan membalas **SHA1** dari isinya, yang bisa dipanggil dengan `EVALSHA`:[^3]

```text
127.0.0.1:6379> SCRIPT LOAD "local n = redis.call('INCR', KEYS[1]) if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return n"
127.0.0.1:6379> EVALSHA 2ff4a3e24772cc6d522d80ca1ef9ca17a73cb574 1 rate:uji 5
```

**Diharapkan:** `"2ff4a3e24772cc6d522d80ca1ef9ca17a73cb574"` (hash ini dihitung dari teks script persis di atas, tetapi belum dicocokkan dengan Redis nyata), lalu angka hitungan (misalnya `(integer) 3`).

!!! info "Cache script tidak permanen"
    Script yang dimuat bisa hilang setelah restart atau `SCRIPT FLUSH`. Klien yang memakai `EVALSHA` perlu siap menangani `NOSCRIPT` dengan memuat ulang script. Library seperti `redis-py` melakukannya otomatis lewat `register_script`.

### Langkah 6: Lihat galat

```text
127.0.0.1:6379> SET catatan "teks"
127.0.0.1:6379> EVAL "return redis.call('INCR', KEYS[1])" 1 catatan
127.0.0.1:6379> EVAL "return 1" 5 a
127.0.0.1:6379> EVALSHA 0000000000000000000000000000000000000000 0
```

**Diharapkan** (teks persis bisa berbeda antarversi):

- Perintah kedua: galat berawalan `ERR value is not an integer or out of range`, disertai info tentang script.
- Perintah ketiga: `(error) ERR Number of keys can't be greater than number of args`.
- Perintah keempat: `(error) NOSCRIPT No matching script. Please use EVAL.`

### Langkah 7: Bersihkan data latihan

```text
127.0.0.1:6379> DEL nama catatan rate:uji kunci:laporan
```

**Diharapkan:** `(integer)` sejumlah key yang masih ada (di sini `nama`, `catatan`, dan `rate:uji` bila belum kedaluwarsa; `kunci:laporan` sudah dihapus script).

!!! danger "`DEL` tidak bisa dibatalkan"
    Perintah ini menyebut key satu per satu agar tidak ada key lain yang ikut terhapus.

## Contoh lengkap

**Lingkungan: Python** · Kebutuhan: Python 3, paket `redis` (`pip install redis`), dan Redis berjalan di `localhost:6379`.

```python title="lua_script.py"
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

LEPAS_KUNCI = r.register_script("""
if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
end
return 0
""")

HITUNG = r.register_script("""
local n = redis.call('INCR', KEYS[1])
if n == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return n
""")

KUNCI = "kunci:laporan"
COUNTER = "rate:uji"

r.delete(KUNCI, COUNTER)

# 1. Lepas kunci hanya oleh pemiliknya
r.set(KUNCI, "proses-A", nx=True, ex=60)
print("B melepas:", LEPAS_KUNCI(keys=[KUNCI], args=["proses-B"]))
print("A melepas:", LEPAS_KUNCI(keys=[KUNCI], args=["proses-A"]))
print("isi kunci:", r.get(KUNCI))

# 2. Counter dengan expiry atomik
for _ in range(3):
    print("hitungan:", HITUNG(keys=[COUNTER], args=[5]))
print("ttl:", r.ttl(COUNTER))

r.delete(KUNCI, COUNTER)
```

Penjelasan baris penting:

| Baris | Penjelasan |
|---|---|
| `r.register_script("""...""")` | Mendaftarkan script dan mengembalikan objek yang bisa dipanggil. Library memakai `EVALSHA` dan jatuh kembali ke `EVAL` bila server berkata `NOSCRIPT`. |
| `LEPAS_KUNCI(keys=[...], args=[...])` | `keys` menjadi `KEYS`, `args` menjadi `ARGV`. Argumen diteruskan sebagai String. |
| `if redis.call('GET', KEYS[1]) == ARGV[1]` | Bandingkan pemilik kunci sebelum menghapus. |
| `if n == 1 then ... EXPIRE ...` | Memasang expiry hanya pada permintaan pertama di jendela. |
| `r.delete(KUNCI, COUNTER)` di awal dan akhir | Memulai dan mengakhiri dari kondisi bersih; menghapus kedua key itu. |

Cara menjalankan: `python lua_script.py`.

**Diharapkan:**

```text
B melepas: 0
A melepas: 1
isi kunci: None
hitungan: 1
hitungan: 2
hitungan: 3
ttl: 5
```

Nilai `ttl` bisa `4` atau `5` tergantung waktu eksekusi.

## Kesalahan umum dan troubleshooting

| Gejala | Penyebab dan solusi |
|---|---|
| `(error) ERR Number of keys can't be greater than number of args` | `jumlah_key` lebih besar dari jumlah argumen yang diberikan. Periksa angka setelah teks script. |
| `KEYS[1]` bernilai `nil` | `jumlah_key` `0`, atau indeks salah. Di Lua, indeks dimulai dari 1. |
| `(error) NOSCRIPT No matching script. Please use EVAL.` | `EVALSHA` dengan hash yang belum dimuat (atau cache dibersihkan). Muat ulang dengan `SCRIPT LOAD` atau pakai `register_script`. |
| Galat sintaks Lua (`user_script:1: ...`) | Kesalahan penulisan Lua. Periksa `then`/`end`, tanda kutip, dan tanda `==`. |
| Perbandingan angka selalu salah | `ARGV` selalu String. Ubah dengan `tonumber(ARGV[1])` sebelum membandingkan angka. |
| Hasil `false`/tabel tampak aneh | Lihat tabel konversi: `false` menjadi `(nil)`, desimal dipotong. Tabel yang berisi `nil` terpotong di elemen itu. |
| Redis tidak merespons saat script berjalan | Script berjalan terlalu lama dan memblokir semua klien. Persingkat script, hindari perulangan besar.[^1] |
| Script bekerja di satu Redis tapi bermasalah di Cluster | Key diakses tanpa lewat `KEYS`. Selalu teruskan key lewat `KEYS`.[^1] |
| `redis.exceptions.ConnectionError` | Container Redis belum berjalan atau port 6379 tidak terbuka. Cek dengan `docker ps`. |

!!! warning "Aturan penulisan yang aman"
    Jaga script pendek dan deterministik. Teruskan semua key lewat `KEYS` dan nilai lewat `ARGV`. Jangan menaruh data sensitif langsung di teks script. Jangan memakai script untuk pekerjaan berat yang memblokir server.

!!! note "Status verifikasi"
    Sintaks `EVAL`/`EVALSHA`, aturan `KEYS`/`ARGV`, dan konversi tipe dicocokkan dengan dokumentasi resmi Redis. Blok output dan skrip Python belum dijalankan di Redis sungguhan saat bab ini ditulis. Hash SHA1 pada Langkah 5 dihitung dari teks script, tetapi belum dibandingkan dengan balasan Redis nyata. Teks galat persis bisa berbeda antarversi.

## Latihan

1. Jalankan `EVAL "return {KEYS[1], ARGV[1]}" 1 kunci-a nilai-a`. Apa bentuk balasannya?
2. Sebelum menjalankan: `EVAL "return redis.call('SET', KEYS[1], ARGV[1])" 1 salam halo`, lalu `GET salam`. Apa balasan keduanya?
3. Tulis script yang menambah stok `stok:kopi` sebesar `ARGV[1]` hanya bila nilainya sudah ada (`EXISTS`), dan membalas `-1` bila belum ada.
4. Muat script pada Langkah 4 dengan `SCRIPT LOAD`, panggil dengan `EVALSHA`, lalu jalankan `SCRIPT FLUSH` dan panggil lagi. Apa balasannya?
5. Jelaskan kapan memilih transaksi dengan `WATCH` dan kapan Lua script.

??? success "Petunjuk"
    1. Balasan Lua berupa tabel menjadi array.
    2. `redis.call('SET', ...)` mengembalikan `OK`.
    3. `redis.call('EXISTS', KEYS[1]) == 1` lalu `INCRBY`; `else return -1`.
    4. Lihat teks galat `NOSCRIPT`.
    5. Pikirkan apakah logika bersyarat harus dijalankan tanpa percobaan ulang.

## Ringkasan

- Lua script dijalankan di dalam Redis lewat `EVAL` dan bersifat atomik: tidak ada klien lain yang menyela.
- Key diteruskan lewat `KEYS` dan argumen lewat `ARGV` (indeks mulai dari 1); perintah Redis dipanggil dengan `redis.call`.
- Cocok untuk logika bersyarat atomik: lepas kunci hanya oleh pemilik, atau `INCR` dengan `EXPIRE`.
- `SCRIPT LOAD` dan `EVALSHA` menghindari mengirim teks script berulang; `register_script` di Python menanganinya otomatis.
- Script yang lambat memblokir seluruh server, jadi harus pendek dan deterministik.

Berikutnya: bagian [Python dan FastAPI](../python/index.md).

## Referensi resmi

[^1]: Redis, *Scripting with Lua*: <https://redis.io/docs/latest/develop/programmability/eval-intro/>
[^2]: Redis, *EVAL*: <https://redis.io/docs/latest/commands/eval/>
[^3]: Redis, *SCRIPT LOAD*: <https://redis.io/docs/latest/commands/script-load/>

Bacaan tambahan: [`EVALSHA`](https://redis.io/docs/latest/commands/evalsha/), [Redis Functions](https://redis.io/docs/latest/develop/programmability/functions-intro/) (Redis 7.0+, pengganti script yang lebih terstruktur), [`SCRIPT FLUSH`](https://redis.io/docs/latest/commands/script-flush/).
