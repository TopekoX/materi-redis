# Struktur Data

Redis menyimpan nilai dalam struktur data siap pakai, bukan hanya teks. Bagian ini mengenalkan struktur yang paling sering dipakai, satu per bab, dan diakhiri panduan memilih yang tepat.

## Tujuan bagian

Setelah menyelesaikan bagian ini kamu bisa:

- [ ] Memakai String, Hash, List, Set, dan Sorted Set dari `redis-cli`.
- [ ] Menjelaskan kapan tiap struktur cocok dipakai.
- [ ] Memilih struktur data untuk sebuah kebutuhan aplikasi.

## Prasyarat

- Sudah menyelesaikan bagian [Pengenalan](../pengenalan/index.md), terutama [Key dan expiry](../pengenalan/key-dan-expiry.md).

## Daftar bab

| Urutan | Bab | Yang dipelajari |
|---|---|---|
| 1 | [String](string.md) | `INCR`, `MSET`, `SET ... NX`, `SETNX`, dan counter |
| 2 | [Hash](hash.md) | Menyimpan objek dengan `HSET` dan `HGETALL` |
| 3 | [List](list.md) | Antrean dan tumpukan dengan `LPUSH` dan `BRPOP` |
| 4 | [Set](set.md) | Data unik dan irisan dengan `SINTER` |
| 5 | [Sorted Set](sorted-set.md) | Papan peringkat dengan `ZADD` dan `ZRANGE` |
| 6 | [Bitmap, HyperLogLog, dan Geo](bitmap-hyperloglog-geo.md) *(opsional)* | Menghitung data unik dan kueri lokasi |
| 7 | [Memilih struktur data yang tepat](memilih-struktur-data-yang-tepat.md) | Panduan memilih struktur untuk suatu kasus |

## Setelah bagian ini

Lanjut ke bagian [Pola Penerapan](../pola-aplikasi/index.md).
