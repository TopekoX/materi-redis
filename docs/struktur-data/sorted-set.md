# Sorted Set

## Tujuan belajar

Setelah bab ini kamu bisa:

- [ ] Menjelaskan apa itu Sorted Set dan bedanya dengan Set biasa.
- [ ] Menambah dan memperbarui skor dengan `ZADD` dan `ZINCRBY`.
- [ ] Membaca peringkat dengan `ZRANGE` (termasuk `REV` dan `WITHSCORES`), `ZRANK`, dan `ZREVRANK`.
- [ ] Membuat papan peringkat (*leaderboard*) sederhana.
- [ ] Menghitung dan menghapus anggota dengan `ZCARD`, `ZCOUNT`, dan `ZREM`.

## Prasyarat

- Sudah membaca [Set](set.md), terutama bahwa anggota Set unik dan tidak berurutan.
- Sudah membaca [Key dan expiry](../pengenalan/key-dan-expiry.md).
- Container Redis berjalan dan kamu bisa masuk dengan `docker exec -it redis redis-cli` (lihat [Instalasi dengan Docker](../pengenalan/instalasi-dengan-docker.md)).
- Versi Redis: `ZRANGE` dengan `REV` dan `BYSCORE` tersedia sejak Redis 6.2.0.[^4] Versi dari `redis:latest` memenuhi syarat ini.
- Kondisi awal: tidak ada key berawalan `papan:` atau `skor:` yang kamu perlukan.
- Opsional untuk contoh Python: Python 3 dan paket `redis` (`pip install redis`).

## Konsep

Sorted Set adalah Set yang tiap anggotanya punya **skor** (angka). Anggota tetap unik, tetapi Redis selalu menjaganya terurut berdasarkan skor, dari kecil ke besar.[^1] Jika dua anggota punya skor sama, keduanya diurutkan secara alfabet menurut nama anggota.

Kenapa dibutuhkan: dengan Set kamu tahu *siapa* saja yang ada, tetapi tidak tahu *siapa yang teratas*. Dengan Sorted Set, peringkat selalu siap tanpa kamu mengurutkan ulang. Cocok untuk papan peringkat game, artikel terpopuler, atau antrean berprioritas.

### Analogi

Seperti papan skor lomba: nama peserta unik, tiap peserta punya nilai, dan papan selalu menampilkan urutan dari nilai terendah ke tertinggi. Saat nilai seseorang berubah, posisinya otomatis bergeser.

!!! note "Batas analogi"
    Peringkat Redis dimulai dari **0**, bukan 1, dan secara bawaan diurutkan dari skor **terkecil**. Untuk "juara pertama = skor tertinggi", kamu harus membalik urutannya.

## Cara kerja

| Perintah | Fungsi | Balasan |
|---|---|---|
| `ZADD key skor anggota [skor anggota ...]` | Tambah anggota atau perbarui skornya.[^2] | Jumlah anggota **baru** |
| `ZINCRBY key n anggota` | Tambah `n` ke skor anggota.[^5] | Skor baru |
| `ZRANGE key start stop [REV] [WITHSCORES]` | Baca anggota menurut peringkat.[^4] | Daftar anggota |
| `ZRANK key anggota` / `ZREVRANK key anggota` | Peringkat (0 = pertama) dari skor terkecil / terbesar.[^6][^7] | Angka, atau `(nil)` |
| `ZSCORE key anggota` | Skor anggota.[^8] | Skor |
| `ZCARD key` | Jumlah anggota.[^9] | Jumlah |
| `ZCOUNT key min max` | Jumlah anggota dengan skor dalam rentang.[^10] | Jumlah |
| `ZREM key anggota [anggota ...]` | Hapus anggota.[^11] | Jumlah terhapus |

Skor disimpan sebagai angka desimal presisi ganda (*double*). Redis membalas skor sebagai String, misalnya `"100"`.[^1]

## Praktik langkah demi langkah

Output di bawah adalah output yang **diharapkan** berdasarkan dokumentasi, bukan hasil eksekusi di komputermu. Bandingkan dengan hasilmu sendiri.

**Lingkungan: terminal**

```bash
docker exec -it redis redis-cli
```

Semua langkah berikutnya di **redis-cli**.

### Langkah 1: Isi papan peringkat dengan `ZADD`

```text
127.0.0.1:6379> ZADD papan:game 100 "budi" 250 "sari" 175 "tono"
```

Kenapa langkah ini diperlukan: kita butuh data peserta beserta skornya. Urutan argumen adalah **skor dulu, baru anggota**; terbalik dari `HSET` yang field dulu.

**Diharapkan:**

```text
(integer) 3
```

Cara membaca output: tiga anggota baru ditambahkan.

### Langkah 2: Lihat urutan dengan `ZRANGE`

```text
127.0.0.1:6379> ZRANGE papan:game 0 -1
127.0.0.1:6379> ZRANGE papan:game 0 -1 WITHSCORES
127.0.0.1:6379> ZRANGE papan:game 0 2 REV WITHSCORES
```

| Bagian | Fungsi dan alasan |
|---|---|
| `0 -1` | Rentang peringkat, dari yang pertama sampai terakhir (indeks negatif sama seperti di [List](list.md)). |
| `WITHSCORES` | Menampilkan skor di samping anggota; tanpa ini hanya nama. |
| `REV` | Membalik urutan menjadi skor terbesar dulu, cocok untuk papan peringkat.[^4] |

**Diharapkan:**

```text
1) "budi"
2) "tono"
3) "sari"
1) "budi"
2) "100"
3) "tono"
4) "175"
5) "sari"
6) "250"
1) "sari"
2) "250"
3) "tono"
4) "175"
5) "budi"
6) "100"
```

Cara membaca output: dengan `WITHSCORES`, baris ganjil adalah anggota dan baris genap adalah skornya. Dengan `REV`, `sari` (250) ada di puncak.

### Langkah 3: Perbarui skor

```text
127.0.0.1:6379> ZADD papan:game 300 "budi"
127.0.0.1:6379> ZINCRBY papan:game 20 "tono"
127.0.0.1:6379> ZSCORE papan:game "budi"
```

`ZADD` pada anggota yang sudah ada **mengganti** skornya tanpa menambah anggota. `ZINCRBY` menambah skor secara atomik, cocok untuk menambah poin tanpa membaca dulu (pola yang sama dengan `INCR` di [String](string.md)).

**Diharapkan:** `(integer) 0`, `"195"`, lalu `"300"`.

`ZADD` membalas `0` karena tidak ada anggota baru; `budi` hanya diperbarui.

### Langkah 4: Cari peringkat anggota

```text
127.0.0.1:6379> ZREVRANK papan:game "budi"
127.0.0.1:6379> ZRANK papan:game "budi"
127.0.0.1:6379> ZREVRANK papan:game "tidak-ada"
```

**Diharapkan:** `(integer) 0`, `(integer) 2`, lalu `(nil)`.

`ZREVRANK` menghitung dari skor terbesar, jadi `budi` (300) berperingkat `0`, yaitu juara pertama. `ZRANK` menghitung dari terkecil, sehingga `budi` terakhir (`2`). Tambahkan 1 bila ingin menampilkan peringkat mulai dari 1.

### Langkah 5: Hitung dan hapus

```text
127.0.0.1:6379> ZCARD papan:game
127.0.0.1:6379> ZCOUNT papan:game 200 300
127.0.0.1:6379> ZREM papan:game "tono"
127.0.0.1:6379> ZCARD papan:game
```

**Diharapkan:** `(integer) 3`, `(integer) 2` (sari 250 dan budi 300), `(integer) 1`, lalu `(integer) 2`.

!!! danger "Risiko kehilangan data"
    `ZREM` menghapus anggota permanen beserta skornya. Jika anggota terakhir dihapus, key ikut hilang. `DEL papan:game` menghapus seluruh papan. Keduanya tidak bisa dibatalkan.

### Langkah 6: Hati-hati dengan rentang besar

`ZRANGE papan:game 0 -1` mengembalikan seluruh anggota. Pada papan dengan jutaan anggota, ambil per halaman, misalnya `ZRANGE papan:game 0 9 REV WITHSCORES` untuk 10 teratas.[^4]

### Langkah 7: Bersihkan data latihan

```text
127.0.0.1:6379> DEL papan:game
```

**Diharapkan:** `(integer) 1`.

## Contoh lengkap

**Lingkungan: Python** · Kebutuhan: Python 3, paket `redis` (`pip install redis`), dan Redis berjalan di `localhost:6379`.

```python title="sortedset_papan.py"
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

KEY = "papan:game"

r.delete(KEY)

r.zadd(KEY, {"budi": 100, "sari": 250, "tono": 175})
r.zincrby(KEY, 20, "tono")

print("top 3:")
for peringkat, (nama, skor) in enumerate(
    r.zrange(KEY, 0, 2, desc=True, withscores=True), start=1
):
    print(f"{peringkat}. {nama} - {skor:g}")

print("peringkat budi:", r.zrevrank(KEY, "budi") + 1)

r.delete(KEY)
```

Penjelasan baris penting:

| Baris | Penjelasan |
|---|---|
| `r.delete(KEY)` di awal dan akhir | Memulai dan mengakhiri dari kondisi bersih; menghapus key itu. |
| `r.zadd(KEY, {...})` | Menerima `dict` nama ke skor. Perhatikan urutannya terbalik dari perintah mentah. |
| `desc=True, withscores=True` | Setara `REV WITHSCORES`; hasil berupa daftar pasangan `(anggota, skor)` dengan skor `float`. |
| `enumerate(..., start=1)` | Memberi nomor peringkat mulai 1 untuk tampilan. |
| `zrevrank(...) + 1` | Peringkat Redis mulai dari 0, jadi ditambah 1. |

Cara menjalankan: `python sortedset_papan.py`.

**Diharapkan:**

```text
top 3:
1. sari - 250
2. tono - 195
3. budi - 100
peringkat budi: 3
```

## Kesalahan umum dan troubleshooting

| Gejala | Penyebab dan solusi |
|---|---|
| `(error) WRONGTYPE Operation against a key holding the wrong kind of value` | Key bukan Sorted Set. Cek `TYPE key`. |
| `(error) ERR value is not a valid float` | Skor bukan angka. Periksa urutan argumen: skor harus lebih dulu daripada anggota. |
| `(error) ERR syntax error` pada `ZRANGE ... REV` | Redis di bawah 6.2. Perbarui, atau pakai `ZREVRANGE` (deprecated).[^4] |
| Peringkat juara terasa terbalik | `ZRANGE` dan `ZRANK` menaik. Pakai `REV` atau `ZREVRANK`. |
| Anggota dengan skor sama berurutan "aneh" | Skor sama diurutkan secara alfabet menurut anggota.[^1] |
| `ZRANK` membalas `(nil)` | Anggota atau key tidak ada. |
| Tutorial lama memakai `ZREVRANGE` atau `ZRANGEBYSCORE` | Perintah itu deprecated sejak 6.2; gunakan `ZRANGE` dengan `REV` atau `BYSCORE`.[^4] |

!!! note "Status verifikasi"
    Sintaks, nilai balik, dan versi minimum dicocokkan dengan dokumentasi resmi Redis. Blok output dan skrip Python belum dijalankan di Redis sungguhan saat bab ini ditulis, jadi bandingkan dengan hasilmu sendiri.

## Latihan

1. Buat papan `papan:kuis` berisi empat peserta dengan skor berbeda. Tampilkan tiga teratas beserta skornya.
2. Sebelum menjalankan: apa hasil `ZREVRANK` untuk peserta dengan skor tertinggi? Jalankan lalu bandingkan.
3. Tambah 50 poin ke satu peserta dengan `ZINCRBY`, lalu cek apakah peringkatnya berubah.
4. Hitung berapa peserta yang skornya antara 100 dan 200 dengan `ZCOUNT`.
5. Jelaskan kenapa `ZADD` yang kedua pada anggota yang sama membalas `0`.

??? success "Petunjuk"
    1. Pakai `ZRANGE ... 0 2 REV WITHSCORES`.
    2. Peringkat dimulai dari 0.
    3. Bandingkan `ZREVRANK` sebelum dan sesudah.
    4. Rentang `ZCOUNT` mencakup batas min dan max.
    5. Ingat arti balasan `ZADD`.

## Ringkasan

- Sorted Set adalah Set yang anggotanya punya skor dan selalu terurut menaik menurut skor.
- `ZADD` menambah atau memperbarui; `ZINCRBY` menambah skor secara atomik.
- `ZRANGE` membaca menurut peringkat (`REV` untuk terbesar dulu, `WITHSCORES` untuk skor); `ZRANK` dan `ZREVRANK` memberi peringkat mulai dari 0.
- Cocok untuk papan peringkat; hindari membaca seluruh anggota pada papan besar.
- `ZREM` dan `DEL` menghapus permanen.

Berikutnya: [Bitmap, HyperLogLog, dan Geo](bitmap-hyperloglog-geo.md) (opsional).

## Referensi resmi

[^1]: Redis, *Redis sorted sets*: <https://redis.io/docs/latest/develop/data-types/sorted-sets/>
[^2]: Redis, *ZADD*: <https://redis.io/docs/latest/commands/zadd/>
[^4]: Redis, *ZRANGE*: <https://redis.io/docs/latest/commands/zrange/>
[^5]: Redis, *ZINCRBY*: <https://redis.io/docs/latest/commands/zincrby/>
[^6]: Redis, *ZRANK*: <https://redis.io/docs/latest/commands/zrank/>
[^7]: Redis, *ZREVRANK*: <https://redis.io/docs/latest/commands/zrevrank/>
[^8]: Redis, *ZSCORE*: <https://redis.io/docs/latest/commands/zscore/>
[^9]: Redis, *ZCARD*: <https://redis.io/docs/latest/commands/zcard/>
[^10]: Redis, *ZCOUNT*: <https://redis.io/docs/latest/commands/zcount/>
[^11]: Redis, *ZREM*: <https://redis.io/docs/latest/commands/zrem/>

Bacaan tambahan: [`ZPOPMAX`](https://redis.io/docs/latest/commands/zpopmax/), [`ZRANGEBYSCORE`](https://redis.io/docs/latest/commands/zrangebyscore/) (deprecated), [`ZUNIONSTORE`](https://redis.io/docs/latest/commands/zunionstore/).
