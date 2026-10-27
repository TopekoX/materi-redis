# Bitmap, HyperLogLog, dan Geo

!!! info "Opsional"
    Bab ini boleh dilewati tanpa memutus alur belajar. Ketiganya adalah struktur khusus untuk kebutuhan tertentu (menghitung dan lokasi), dan bab-bab inti berikutnya tidak bergantung padanya.

## Tujuan belajar

Setelah bab ini kamu bisa:

- [ ] Menjelaskan bahwa Bitmap, HyperLogLog, dan Geo dibangun di atas tipe yang sudah kamu kenal.
- [ ] Mencatat status ya/tidak per pengguna dengan Bitmap (`SETBIT`, `GETBIT`, `BITCOUNT`).
- [ ] Menghitung perkiraan jumlah item unik dengan HyperLogLog (`PFADD`, `PFCOUNT`).
- [ ] Menyimpan lokasi dan mencari yang terdekat dengan Geo (`GEOADD`, `GEODIST`, `GEOSEARCH`).
- [ ] Memilih di antara ketiganya, dan menyebut batas masing-masing.

## Prasyarat

- Sudah membaca [Set](set.md) dan [Sorted Set](sorted-set.md), terutama gagasan data unik dan skor.
- Sudah membaca [String](string.md) karena Bitmap disimpan sebagai String.
- Container Redis berjalan dan kamu bisa masuk dengan `docker exec -it redis redis-cli` (lihat [Instalasi dengan Docker](../pengenalan/instalasi-dengan-docker.md)).
- Versi Redis: `GEOSEARCH` tersedia sejak Redis 6.2.0.[^7] Versi dari `redis:latest` memenuhi syarat ini.
- Kondisi awal: tidak ada key berawalan `login:`, `pengunjung:`, atau `kota` yang kamu perlukan.

## Konsep

Ketiga struktur ini bukan tipe data baru yang berdiri sendiri, melainkan cara memakai tipe yang sudah ada:

| Struktur | Disimpan sebagai | Dipakai untuk |
|---|---|---|
| **Bitmap** | String (kumpulan bit) | Status ya/tidak per nomor (mis. pengguna ID 1042 login hari ini) |
| **HyperLogLog** | String khusus | Memperkirakan jumlah item **unik** dengan memori kecil |
| **Geo** | Sorted Set | Menyimpan koordinat dan mencari yang berdekatan |

Kenapa ada: [Set](set.md) menghitung unik dengan tepat tetapi memori tumbuh seiring jumlah anggota. Jika kamu cukup dengan perkiraan, HyperLogLog memakai memori tetap (maksimum sekitar 12 KB) berapa pun jumlahnya.[^4] Bitmap memadatkan satu status ke satu bit, jauh lebih hemat daripada satu key per status.[^1]

### Analogi

Bitmap seperti deretan lampu bernomor: nyala berarti "ya". HyperLogLog seperti petugas yang menaksir jumlah penonton konser dari kerapatan kerumunan: tidak persis, tetapi cepat dan murah. Geo seperti peta dengan pin bernama.

!!! note "Batas analogi"
    HyperLogLog tidak bisa menyebutkan *siapa* saja yang dihitung, dan hasilnya punya galat standar sekitar 0,81%.[^4] Jangan dipakai untuk hitungan yang harus tepat, seperti saldo atau stok.

## Praktik langkah demi langkah

Output di bawah adalah output yang **diharapkan** berdasarkan dokumentasi, bukan hasil eksekusi di komputermu. Bandingkan dengan hasilmu sendiri.

**Lingkungan: terminal**

```bash
docker exec -it redis redis-cli
```

Semua langkah berikutnya di **redis-cli**.

### Langkah 1: Bitmap, tandai pengguna yang login

```text
127.0.0.1:6379> SETBIT login:2026-10-27 7 1
127.0.0.1:6379> SETBIT login:2026-10-27 12 1
127.0.0.1:6379> GETBIT login:2026-10-27 7
127.0.0.1:6379> GETBIT login:2026-10-27 8
127.0.0.1:6379> BITCOUNT login:2026-10-27
```

Kenapa langkah ini diperlukan: offset dipakai sebagai nomor pengguna (ID 7 dan 12), dan bit `1` berarti "sudah login". Dari ini kamu bisa menghitung berapa orang login hari itu.

| Bagian | Fungsi dan alasan |
|---|---|
| `SETBIT key offset 1` | Mengatur bit pada posisi `offset`.[^1] Membalas nilai **lama** bit itu. |
| `GETBIT key offset` | Membaca bit; posisi yang belum pernah diatur dianggap `0`.[^2] |
| `BITCOUNT key` | Menghitung jumlah bit bernilai `1`.[^3] |

**Diharapkan:**

```text
(integer) 0
(integer) 0
(integer) 1
(integer) 0
(integer) 2
```

Cara membaca output: dua `SETBIT` pertama membalas `0` karena bit sebelumnya `0`. `GETBIT` 7 bernilai `1`, `GETBIT` 8 bernilai `0`, dan `BITCOUNT` menghitung 2 pengguna login.

!!! warning "Offset besar memakai banyak memori"
    Bitmap adalah String yang diperpanjang sampai mencapai offset. `SETBIT key 4000000000 1` langsung mengalokasikan sekitar 512 MB.[^1] Gunakan offset dari ID yang padat, bukan angka acak besar.

### Langkah 2: HyperLogLog, hitung pengunjung unik

```text
127.0.0.1:6379> PFADD pengunjung:hari-ini "u1" "u2" "u3"
127.0.0.1:6379> PFADD pengunjung:hari-ini "u2" "u4"
127.0.0.1:6379> PFCOUNT pengunjung:hari-ini
```

| Bagian | Fungsi dan alasan |
|---|---|
| `PFADD key elemen ...` | Memasukkan elemen ke HyperLogLog. Membalas `1` bila perkiraan hitungan berubah, `0` bila tidak.[^4] |
| `PFCOUNT key` | Membaca perkiraan jumlah elemen unik.[^5] |

**Diharapkan:**

```text
(integer) 1
(integer) 1
(integer) 4
```

Cara membaca output: `u2` dimasukkan dua kali tetapi hanya dihitung sekali; unik-nya `u1`, `u2`, `u3`, `u4`. Pada data sekecil ini hasilnya biasanya tepat; galat 0,81% baru terasa pada data besar.

Menggabungkan dua HyperLogLog (misalnya dua hari):

```text
127.0.0.1:6379> PFADD pengunjung:kemarin "u1" "u9"
127.0.0.1:6379> PFMERGE pengunjung:dua-hari pengunjung:hari-ini pengunjung:kemarin
127.0.0.1:6379> PFCOUNT pengunjung:dua-hari
```

**Diharapkan:** `(integer) 1`, `OK`, lalu `(integer) 5` (`u1`, `u2`, `u3`, `u4`, `u9`). `PFMERGE` menimpa key tujuan.[^6]

### Langkah 3: Geo, simpan lokasi

```text
127.0.0.1:6379> GEOADD kota 106.8456 -6.2088 "jakarta" 107.6191 -6.9175 "bandung" 106.8060 -6.5950 "bogor"
```

Kenapa penting: urutan koordinat adalah **bujur (longitude) dulu, baru lintang (latitude)**, kebalikan dari kebiasaan sebagian peta. Salah urutan tidak menimbulkan galat jika nilainya masih valid, tetapi lokasi akan salah.[^8]

**Diharapkan:**

```text
(integer) 3
```

Batas nilai valid: bujur -180 sampai 180, lintang sekitar -85,05 sampai 85,05.[^8]

### Langkah 4: Ukur jarak dan cari yang terdekat

```text
127.0.0.1:6379> GEODIST kota jakarta bandung km
127.0.0.1:6379> GEOSEARCH kota FROMMEMBER jakarta BYRADIUS 80 km ASC WITHDIST
```

| Bagian | Fungsi dan alasan |
|---|---|
| `GEODIST key a b km` | Jarak antara dua anggota dalam satuan yang dipilih (`m`, `km`, `mi`, `ft`).[^9] |
| `FROMMEMBER jakarta` | Pusat pencarian adalah anggota yang sudah ada. Bisa juga `FROMLONLAT bujur lintang`.[^7] |
| `BYRADIUS 80 km` | Cari dalam lingkaran berjari-jari 80 km. |
| `ASC WITHDIST` | Urutkan dari terdekat dan sertakan jarak. |

**Diharapkan** (angka jarak berupa perkiraan; hasil nyata dihitung Redis):

```text
"116.xxxx"
1) 1) "jakarta"
   2) "0.0000"
2) 1) "bogor"
   2) "4x.xxxx"
```

Cara membaca output: jarak `jakarta`-`bandung` sekitar 116 km garis lurus, jadi `bandung` tidak masuk radius 80 km. `jakarta` sendiri muncul dengan jarak 0 karena pusatnya termasuk. Pada hasil nyata, `x` diganti angka desimal.

!!! note "Geo itu Sorted Set"
    Di balik layar Geo disimpan sebagai Sorted Set,[^8] sehingga `ZRANGE kota 0 -1` dan `ZREM kota "bogor"` tetap bekerja. Itu juga berarti menghapus lokasi memakai `ZREM`, bukan perintah `GEO*`.

### Langkah 5: Bersihkan data latihan

```text
127.0.0.1:6379> DEL login:2026-10-27 pengunjung:hari-ini pengunjung:kemarin pengunjung:dua-hari kota
```

**Diharapkan:** `(integer) 5`.

!!! danger "`DEL` tidak bisa dibatalkan"
    Perintah ini menyebut key satu per satu agar tidak ada key lain yang ikut terhapus.

## Kesalahan umum dan troubleshooting

| Gejala | Penyebab dan solusi |
|---|---|
| `(error) WRONGTYPE Operation against a key holding the wrong kind of value` | Key bukan tipe yang diharapkan. Bitmap dan HyperLogLog adalah String; Geo adalah Sorted Set. Cek `TYPE key`. |
| `(error) ERR bit offset is not an integer or out of range` | Offset negatif atau lebih dari 2^32 - 1.[^1] |
| `SETBIT` terasa lambat atau memori melonjak | Offset sangat besar. Pakai ID yang padat. |
| `PFCOUNT` sedikit meleset dari hitungan manual | Itu perkiraan dengan galat standar sekitar 0,81%.[^4] |
| `(error) ERR invalid longitude,latitude pair ...` | Koordinat di luar rentang, atau bujur dan lintang tertukar.[^8] |
| `GEOSEARCH` tidak dikenal | Redis di bawah 6.2. Perbarui, atau pakai `GEORADIUS` (deprecated).[^7] |
| `GEOADD` ulang membalas `0` | Anggota sudah ada sehingga hanya posisinya diperbarui. Normal. |

!!! note "Status verifikasi"
    Sintaks, nilai balik, dan batas dicocokkan dengan dokumentasi resmi Redis. Blok output belum dijalankan di Redis sungguhan saat bab ini ditulis, dan angka jarak Geo sengaja ditulis sebagai perkiraan. Bandingkan dengan hasilmu sendiri.

## Latihan

1. Tandai pengguna ID 3, 5, dan 9 sebagai aktif pada Bitmap `aktif:minggu-ini`. Berapa `BITCOUNT`-nya? Berapa `GETBIT` untuk ID 4?
2. Masukkan 6 elemen ke HyperLogLog dengan dua duplikat. Prediksi `PFCOUNT`, lalu jalankan.
3. Tambah dua kota lain ke Geo dan cari yang berada dalam 200 km dari Bandung.
4. Jelaskan kapan memilih Set dan kapan HyperLogLog untuk menghitung pengunjung.
5. Hapus satu kota dari Geo. Perintah apa yang dipakai dan kenapa?

??? success "Petunjuk"
    1. Offset adalah ID pengguna.
    2. Hitung hanya elemen unik.
    3. Gunakan `FROMMEMBER bandung BYRADIUS 200 km`.
    4. Pertimbangkan perlunya daftar anggota dan ketepatan.
    5. Ingat Geo disimpan sebagai Sorted Set.

## Ringkasan

- Bitmap (`SETBIT`, `GETBIT`, `BITCOUNT`) mencatat status ya/tidak per nomor dengan memori sangat kecil; hati-hati offset besar.
- HyperLogLog (`PFADD`, `PFCOUNT`, `PFMERGE`) memperkirakan jumlah unik dengan memori tetap; galat sekitar 0,81% dan tidak menyimpan daftar anggota.
- Geo (`GEOADD`, `GEODIST`, `GEOSEARCH`) menyimpan koordinat (bujur dulu, lintang kemudian) di atas Sorted Set.
- Pilih sesuai kebutuhan: tepat dan perlu daftar → Set; cukup perkiraan → HyperLogLog.

Berikutnya: [Memilih struktur data yang tepat](memilih-struktur-data-yang-tepat.md).

## Referensi resmi

[^1]: Redis, *Redis bitmaps* dan *SETBIT*: <https://redis.io/docs/latest/develop/data-types/bitmaps/> dan <https://redis.io/docs/latest/commands/setbit/>
[^2]: Redis, *GETBIT*: <https://redis.io/docs/latest/commands/getbit/>
[^3]: Redis, *BITCOUNT*: <https://redis.io/docs/latest/commands/bitcount/>
[^4]: Redis, *Redis HyperLogLog* dan *PFADD*: <https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/> dan <https://redis.io/docs/latest/commands/pfadd/>
[^5]: Redis, *PFCOUNT*: <https://redis.io/docs/latest/commands/pfcount/>
[^6]: Redis, *PFMERGE*: <https://redis.io/docs/latest/commands/pfmerge/>
[^7]: Redis, *GEOSEARCH*: <https://redis.io/docs/latest/commands/geosearch/>
[^8]: Redis, *Redis geospatial* dan *GEOADD*: <https://redis.io/docs/latest/develop/data-types/geospatial/> dan <https://redis.io/docs/latest/commands/geoadd/>
[^9]: Redis, *GEODIST*: <https://redis.io/docs/latest/commands/geodist/>

Bacaan tambahan: [`BITOP`](https://redis.io/docs/latest/commands/bitop/), [`GEOPOS`](https://redis.io/docs/latest/commands/geopos/), [`GEORADIUS`](https://redis.io/docs/latest/commands/georadius/) (deprecated).
