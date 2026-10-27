# Struktur data di Python

## Tujuan belajar

Setelah bab ini kamu bisa:

- [ ] Memetakan perintah Hash, List, Set, dan Sorted Set ke metode `redis-py`.
- [ ] Menyebut tipe Python yang dikembalikan tiap metode (`dict`, `list`, `set`, `float`, dan lainnya).
- [ ] Menyimpan `dict` Python sebagai Hash dan mengubah tipenya saat dibaca kembali.
- [ ] Mengenali `DataError` dan memperbaikinya dengan mengubah nilai menjadi `str`, `int`, atau `float`.
- [ ] Menyimpan struktur bersarang dengan JSON, dan tahu kapan itu tepat.

## Prasyarat

- Sudah membaca [Dasar redis-py](dasar-redis-py.md): lingkungan virtual, koneksi, `decode_responses=True`, dan penanganan galat. Bab ini tidak mengulangnya.
- Sudah membaca bab struktur data: [Hash](../struktur-data/hash.md), [List](../struktur-data/list.md), [Set](../struktur-data/set.md), dan [Sorted Set](../struktur-data/sorted-set.md). Arti tiap perintah tidak dijelaskan ulang di sini.
- Container Redis berjalan dan port 6379 dipetakan ke komputermu.
- Perangkat lunak: Python 3 dan paket `redis` terpasang di lingkungan virtual yang aktif.
- Versi Redis: pengambilan beberapa elemen dengan `lpop(key, count)` butuh Redis 6.2.0+, dan `zrange(..., desc=True)` butuh 6.2.0+.[^4] Versi dari `redis:latest` memenuhinya.
- Kondisi awal: tidak ada key berawalan `py:` yang kamu perlukan.

## Konsep

Di `redis-cli` semua balasan berupa teks. Di Python, `redis-py` mengubah balasan menjadi tipe yang paling pas: `dict` untuk Hash, `list` untuk List, `set` untuk anggota Set, dan pasangan `(anggota, skor)` untuk Sorted Set. Tugasmu adalah tahu **tipe apa yang akan kamu terima** agar kode berikutnya benar.[^1]

Dua aturan penting yang tidak berubah dari bab sebelumnya:

1. **Nilai tersimpan sebagai teks.** Angka yang disimpan di Hash atau List akan kembali sebagai `str` (`'25'`), bukan `int`. Kamu harus mengubahnya sendiri (`int(...)`).
2. **Sorted Set adalah pengecualian.** Skor selalu dikembalikan sebagai `float` (`195.0`), karena Redis menyimpannya sebagai bilangan desimal.

Tipe yang boleh kamu **kirim**: `str`, `bytes`, `int`, dan `float`. Tipe lain seperti `bool`, `None`, `dict`, atau `list` ditolak `redis-py` dengan `DataError` sebelum dikirim ke server.[^1]

### Analogi

Bayangkan Redis sebagai lemari arsip yang hanya menyimpan kertas bertulisan teks. `redis-py` adalah petugas yang menyusun kertas-kertas itu menjadi map Python (`dict`), tumpukan (`list`), atau kumpulan (`set`) saat kamu memintanya. Isinya tetap tulisan di kertas, jadi angka perlu kamu baca sebagai angka sendiri.

!!! note "Batas analogi"
    Petugas bisa menyusun ulang bentuk, tetapi tidak mengubah isi kertas. Sebaliknya, `set` Python tidak punya urutan, sama seperti Set Redis, jadi jangan mengandalkan urutan elemennya.

## Cara kerja

| Struktur | Perintah → metode | Tipe balikan |
|---|---|---|
| Hash | `HSET` → `hset(k, mapping={...})` | `int` (field baru) |
| | `HGET` → `hget(k, f)` | `str` atau `None` |
| | `HGETALL` → `hgetall(k)` | `dict` (`{}` bila kosong) |
| | `HINCRBY` → `hincrby(k, f, n)` | `int` |
| List | `RPUSH` → `rpush(k, *v)` | `int` (panjang List) |
| | `LPOP` → `lpop(k)` / `lpop(k, 2)` | `str` atau `None` / `list` |
| | `LRANGE` → `lrange(k, 0, -1)` | `list` |
| | `BRPOP` → `brpop(k, timeout=2)` | `(key, elemen)` atau `None` |
| Set | `SADD` → `sadd(k, *v)` | `int` (anggota baru) |
| | `SMEMBERS` → `smembers(k)` | `set` |
| | `SINTER` → `sinter(k1, k2)` | `set` |
| | `SISMEMBER` → `sismember(k, v)` | `1`/`0` di redis-py 8.1.0 (versi lain bisa `True`/`False`) |
| Sorted Set | `ZADD` → `zadd(k, {"a": 100})` | `int` (anggota baru) |
| | `ZRANGE ... REV WITHSCORES` → `zrange(k, 0, -1, desc=True, withscores=True)` | `list` pasangan `(str, float)` |
| | `ZINCRBY` → `zincrby(k, n, a)` | `float` |
| | `ZSCORE` → `zscore(k, a)` | `float` atau `None` |
| | `ZREVRANK` → `zrevrank(k, a)` | `int` atau `None` |

Perhatikan urutan argumen yang berbeda dari perintah mentah: `zadd` menerima `dict` nama ke skor, sedangkan `ZADD` mentah menulis skor lebih dulu.

## Praktik langkah demi langkah

Output di bawah adalah output **terverifikasi**: dijalankan di Redis 8.10.3 pada 2026-10-27. Hasilmu bisa berbeda pada nilai yang berubah tiap eksekusi. Urutan elemen `set` dan `dict` bisa berbeda.

Setiap skrip memakai klien yang sama:

**Lingkungan: Python**

```python
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)
```

Baris itu diulang di tiap berkas supaya setiap skrip bisa dijalankan sendiri.

### Langkah 1: Hash sebagai `dict`

Simpan sebagai `hash_dict.py`:

```python title="hash_dict.py"
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

r.delete("py:pengguna:1")

print("hset:", r.hset("py:pengguna:1", mapping={"nama": "Budi", "umur": 25}))
print("hget:", r.hget("py:pengguna:1", "nama"))

data = r.hgetall("py:pengguna:1")
print("hgetall:", data)
print("umur + 1:", int(data["umur"]) + 1)

print("hincrby:", r.hincrby("py:pengguna:1", "umur", 1))
print("kosong:", r.hgetall("py:tidak-ada"))

r.delete("py:pengguna:1")
```

| Baris | Penjelasan |
|---|---|
| `mapping={"nama": "Budi", "umur": 25}` | Mengirim banyak field sekaligus dari `dict`. Angka `25` otomatis dikirim sebagai teks. |
| `r.hgetall(...)` | Mengembalikan `dict` Python.[^2] Karena nilainya `str`, kita ubah dengan `int(data["umur"])` sebelum menghitung. |
| `r.hincrby(...)` | Menaikkan angka di dalam Hash dan mengembalikan `int`. |
| `r.hgetall("py:tidak-ada")` | Key tidak ada menghasilkan `{}` (dict kosong), bukan `None`. |
| `r.delete(...)` di awal dan akhir | Memulai dan mengakhiri dari kondisi bersih. |

**Terverifikasi:**

```text
hset: 2
hget: Budi
hgetall: {'nama': 'Budi', 'umur': '25'}
umur + 1: 26
hincrby: 26
kosong: {}
```

Cara membaca output: `hset` mengembalikan 2 field baru. `umur` kembali sebagai `'25'` (teks). `hincrby` mengembalikan `int` `26`.

### Langkah 2: List sebagai antrean

Simpan sebagai `list_antrean.py`:

```python title="list_antrean.py"
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

r.delete("py:antrean")

print("rpush:", r.rpush("py:antrean", "A", "B", "C", "D"))
print("lrange:", r.lrange("py:antrean", 0, -1))
print("lpop:", r.lpop("py:antrean"))
print("lpop 2:", r.lpop("py:antrean", 2))
print("sisa:", r.lrange("py:antrean", 0, -1))
print("lpop kosong:", r.lpop("py:kosong"))

r.delete("py:antrean")
```

Kenapa `lpop` ada dua bentuk: tanpa `count` mengembalikan satu `str`, dengan `count` mengembalikan `list`.[^4] **Terverifikasi:**

```text
rpush: 4
lrange: ['A', 'B', 'C', 'D']
lpop: A
lpop 2: ['B', 'C']
sisa: ['D']
lpop kosong: None
```

### Langkah 3: Set sebagai `set`

Simpan sebagai `set_python.py`:

```python title="set_python.py"
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

r.delete("py:redis", "py:python")

print("sadd:", r.sadd("py:redis", "budi", "sari", "tono"))
print("sadd ulang:", r.sadd("py:redis", "budi"))
r.sadd("py:python", "sari", "dewi")

print("anggota:", sorted(r.smembers("py:redis")))
print("irisan:", r.sinter("py:redis", "py:python"))
print("budi ada:", r.sismember("py:redis", "budi"))

r.delete("py:redis", "py:python")
```

| Baris | Penjelasan |
|---|---|
| `r.smembers(...)` | Mengembalikan `set` Python. Kita bungkus `sorted(...)` agar tampilan stabil karena `set` tidak berurutan. |
| `r.sinter(a, b)` | Irisan dihitung di server dan dikembalikan sebagai `set`. |
| `r.sismember(...)` | Mengembalikan `1`/`0` di `redis-py` 8.1.0 (teramati); versi lain bisa `True`/`False`, jadi jangan membandingkan dengan `is True`. |

**Terverifikasi:**

```text
sadd: 3
sadd ulang: 0
anggota: ['budi', 'sari', 'tono']
irisan: {'sari'}
budi ada: 1
```

### Langkah 4: Sorted Set sebagai papan peringkat

Simpan sebagai `sortedset_papan.py`:

```python title="sortedset_papan.py"
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

r.delete("py:papan")

print("zadd:", r.zadd("py:papan", {"budi": 100, "sari": 250, "tono": 175}))
print("zincrby:", r.zincrby("py:papan", 20, "tono"))
print("top:", r.zrange("py:papan", 0, 1, desc=True, withscores=True))
print("zscore:", r.zscore("py:papan", "budi"))
print("peringkat budi:", r.zrevrank("py:papan", "budi") + 1)
print("tidak ada:", r.zrevrank("py:papan", "x"))

r.delete("py:papan")
```

Kenapa `+ 1` pada peringkat: peringkat Redis mulai dari 0, sedangkan tampilan ke pengguna biasanya mulai dari 1. **Terverifikasi:**

```text
zadd: 3
zincrby: 195.0
top: [('sari', 250.0), ('tono', 195.0)]
zscore: 100.0
peringkat budi: 3
tidak ada: None
```

Cara membaca output: skor selalu `float` (`195.0`, bukan `195`).[^3] `withscores=True` menghasilkan daftar tuple `(anggota, skor)`.

### Langkah 5: `DataError` pada tipe yang tidak didukung

Simpan sebagai `data_error.py`:

```python title="data_error.py"
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

try:
    r.hset("py:profil", mapping={"nama": "Budi", "aktif": True})
except redis.exceptions.DataError as e:
    print("ditolak redis-py:", e)

r.hset("py:profil", mapping={"nama": "Budi", "aktif": int(True)})
print(r.hgetall("py:profil"))

r.delete("py:profil")
```

Kenapa langkah ini penting: kesalahan paling umum pemula adalah mengirim `True`, `None`, atau `dict` langsung. `redis-py` menolaknya sebelum menyentuh server. **Terverifikasi:**

```text
ditolak redis-py: Invalid input of type: 'bool'. Convert to a bytes, string, int or float first.
{'nama': 'Budi', 'aktif': '1'}
```

Teks galat persisnya bisa berbeda antarversi. Perbaikannya: ubah nilai ke `str`, `int`, atau `float` (di sini `int(True)` menjadi `1`).

### Langkah 6: Struktur bersarang dengan JSON

Simpan sebagai `json_string.py`:

```python title="json_string.py"
import json

import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

pesanan = {"id": 7, "item": ["kopi", "teh"], "total": 45000}

r.set("py:pesanan:7", json.dumps(pesanan))
kembali = json.loads(r.get("py:pesanan:7"))

print(kembali)
print(kembali["item"][0])

r.delete("py:pesanan:7")
```

| Baris | Penjelasan |
|---|---|
| `json.dumps(pesanan)` | Mengubah `dict` bersarang menjadi teks JSON agar bisa disimpan sebagai String. |
| `json.loads(r.get(...))` | Mengembalikan teks menjadi `dict` Python. |

**Terverifikasi:**

```text
{'id': 7, 'item': ['kopi', 'teh'], 'total': 45000}
kopi
```

Kapan JSON tepat: data dibaca dan ditulis sebagai satu kesatuan (mis. cache seperti di [Caching](../pola-aplikasi/caching.md)). Bila sering mengubah satu atribut, Hash lebih baik, karena JSON harus dibaca dan ditulis ulang seluruhnya.

## Contoh lengkap

**Lingkungan: Python** · Kebutuhan: Python 3, paket `redis`, dan Redis berjalan di `localhost:6379`.

```python title="struktur_lengkap.py"
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

PROFIL = "py:profil:1"
RIWAYAT = "py:riwayat:1"
TAG = "py:tag:1"
SKOR = "py:skor"

r.delete(PROFIL, RIWAYAT, TAG, SKOR)

# Hash: profil pengguna
r.hset(PROFIL, mapping={"nama": "Budi", "login": 0})
r.hincrby(PROFIL, "login", 1)
profil = r.hgetall(PROFIL)
print("profil:", profil, "| login:", int(profil["login"]))

# List: 3 riwayat terbaru
for halaman in ["beranda", "produk", "keranjang", "bayar"]:
    r.rpush(RIWAYAT, halaman)
r.ltrim(RIWAYAT, -3, -1)
print("riwayat:", r.lrange(RIWAYAT, 0, -1))

# Set: tag unik
r.sadd(TAG, "redis", "python", "redis")
print("tag:", sorted(r.smembers(TAG)))

# Sorted Set: papan skor
r.zadd(SKOR, {"budi": 100, "sari": 250})
r.zincrby(SKOR, 175, "budi")
for peringkat, (nama, skor) in enumerate(
    r.zrange(SKOR, 0, -1, desc=True, withscores=True), start=1
):
    print(f"{peringkat}. {nama} - {skor:g}")

r.delete(PROFIL, RIWAYAT, TAG, SKOR)
```

Penjelasan baris penting:

| Baris | Penjelasan |
|---|---|
| `r.delete(PROFIL, RIWAYAT, TAG, SKOR)` di awal dan akhir | Memulai dan mengakhiri dari kondisi bersih; menghapus keempat key itu. |
| `int(profil["login"])` | Nilai Hash kembali sebagai `str`, jadi diubah menjadi `int` sebelum dipakai sebagai angka. |
| `r.ltrim(RIWAYAT, -3, -1)` | Hanya menyisakan 3 elemen terakhir agar List tidak terus membesar. |
| `sorted(r.smembers(TAG))` | `set` tidak berurutan; diurutkan agar output stabil. |
| `enumerate(..., start=1)` | Memberi nomor peringkat mulai dari 1. |
| `{skor:g}` | Menampilkan `float` seperti `275.0` sebagai `275`. |

Cara menjalankan: `python struktur_lengkap.py`.

**Terverifikasi:**

```text
profil: {'nama': 'Budi', 'login': '1'} | login: 1
riwayat: ['produk', 'keranjang', 'bayar']
tag: ['python', 'redis']
1. budi - 275
2. sari - 250
```

## Kesalahan umum dan troubleshooting

| Gejala | Penyebab dan solusi |
|---|---|
| `redis.exceptions.DataError: Invalid input of type: 'bool'` (atau `NoneType`, `dict`, `list`) | Tipe tidak didukung. Ubah ke `str`, `int`, atau `float`; untuk struktur bersarang pakai `json.dumps`. |
| `TypeError: can only concatenate str (not "int") to str` | Nilai dari Hash/List kembali sebagai `str`. Ubah dengan `int(...)` sebelum menghitung. |
| `redis.exceptions.ResponseError: WRONGTYPE ...` | Key bertipe lain dari yang diharapkan metode. Cek dengan `r.type("key")`. |
| Hasil `hgetall` berupa `{}` | Key tidak ada atau Hash kosong. Bedakan dengan `r.exists("key")`. |
| Urutan `smembers` berubah-ubah | `set` tidak berurutan. Urutkan di aplikasi atau pakai Sorted Set. |
| Skor tampil `250.0`, bukan `250` | Sorted Set mengembalikan `float`. Format dengan `:g` atau ubah dengan `int(...)` bila yakin bulat. |
| `r.lpop(key, 2)` galat sintaks | Redis di bawah 6.2.[^4] Perbarui Redis, atau panggil `lpop` berulang. |
| Hasil berbentuk `b'...'` | `decode_responses=True` belum dipakai (lihat [Dasar redis-py](dasar-redis-py.md)). |
| `redis.exceptions.ConnectionError` | Container Redis belum berjalan atau port 6379 tidak terbuka. Cek `docker ps`. |

!!! note "Status verifikasi"
    Perintah, nilai balik, dan skrip di bab ini dijalankan di Redis 8.10.3 (`redis:latest`) pada 2026-10-27, dengan Python 3.12.3 dan redis-py 8.1.0, FastAPI 0.162.0, Uvicorn 0.54.0. Sintaks juga dicocokkan dengan dokumentasi resmi Redis. Nilai yang berubah tiap eksekusi (ID, TTL, waktu, urutan, alamat IP) bisa berbeda di komputermu, dan teks galat bisa berbeda antarversi. Tampilan prompt interaktif `redis-cli` (prompt, Tab, riwayat) tidak teramati karena pengujian berjalan tanpa terminal interaktif.

## Latihan

1. Simpan `produk:1` sebagai Hash dengan `nama`, `harga`, dan `stok`. Baca dengan `hgetall`, lalu hitung nilai stok (`harga * stok`) sebagai `int`.
2. Sebelum menjalankan: apa tipe `r.zscore("py:papan", "budi")` dan apa hasil `type(r.smembers("py:redis"))`? Buktikan dengan `type(...)`.
3. Buat antrean List, isi lima elemen, lalu ambil tiga sekaligus dengan satu panggilan. Metode dan argumen apa yang kamu pakai?
4. Coba `r.hset("py:x", mapping={"a": None})` dan perbaiki sehingga tidak galat. Lalu jelaskan kenapa `None` ditolak.
5. Pilih Hash atau String JSON untuk menyimpan profil yang atributnya sering diubah satu per satu. Jelaskan alasanmu.

??? success "Petunjuk"
    1. `int(data["harga"]) * int(data["stok"])`.
    2. Skor `float`; `smembers` mengembalikan `set`.
    3. `lpop(key, 3)` (Redis 6.2+).
    4. Ganti `None` dengan string kosong atau hapus field itu.
    5. Pikirkan membaca dan menulis ulang seluruh dokumen untuk satu perubahan kecil.

## Ringkasan

- `redis-py` mengubah balasan menjadi `dict` (Hash), `list` (List), `set` (Set), dan tuple `(str, float)` (Sorted Set).
- Nilai tersimpan sebagai teks, jadi ubah ke `int`/`float` saat membaca; skor Sorted Set selalu `float`.
- Tipe yang boleh dikirim: `str`, `bytes`, `int`, `float`. `bool`, `None`, `dict`, dan `list` menimbulkan `DataError`.
- Gunakan JSON di String untuk data bersarang yang dibaca sebagai satu kesatuan; gunakan Hash bila atribut sering diubah satu per satu.
- Key yang tidak ada: `get` menghasilkan `None`, `hgetall` menghasilkan `{}`, `lrange` menghasilkan `[]`.

Berikutnya: [Pipeline dan connection pool](pipeline-dan-connection-pool.md).

## Referensi resmi

[^1]: Redis, *redis-py guide (Python)*: <https://redis.io/docs/latest/develop/clients/redis-py/>
[^2]: Redis, *Redis hashes*: <https://redis.io/docs/latest/develop/data-types/hashes/>
[^3]: Redis, *Redis sorted sets*: <https://redis.io/docs/latest/develop/data-types/sorted-sets/>
[^4]: Redis, *LPOP* dan *ZRANGE*: <https://redis.io/docs/latest/commands/lpop/> dan <https://redis.io/docs/latest/commands/zrange/>

Bacaan tambahan: [Dokumentasi `redis-py`](https://redis-py.readthedocs.io/en/stable/), [`HSET`](https://redis.io/docs/latest/commands/hset/), [`SINTER`](https://redis.io/docs/latest/commands/sinter/).
