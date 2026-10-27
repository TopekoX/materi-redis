# Struktur Data

!!! info "Belum ditulis"
    Bab-bab bagian ini sedang direncanakan. Daftar di bawah adalah rencana, belum berupa tautan.

Redis menyimpan nilai dalam struktur data siap pakai, bukan hanya teks. Bagian ini mengenalkan struktur yang paling sering dipakai, satu per bab, dan diakhiri panduan memilih yang tepat.

## Tujuan bagian

Setelah menyelesaikan bagian ini kamu bisa:

- [ ] Memakai String, Hash, List, Set, dan Sorted Set dari `redis-cli`.
- [ ] Menjelaskan kapan tiap struktur cocok dipakai.
- [ ] Memilih struktur data untuk sebuah kebutuhan aplikasi.

## Prasyarat

- Sudah menyelesaikan bagian [Pengenalan](../pengenalan/index.md), terutama [Key dan expiry](../pengenalan/key-dan-expiry.md).

## Rencana bab

| Urutan | Bab | Yang akan dipelajari |
|---|---|---|
| 1 | String | `INCR`, `MSET`, `SETNX`, dan counter |
| 2 | Hash | Menyimpan objek dengan `HSET` dan `HGETALL` |
| 3 | List | Antrean dan tumpukan dengan `LPUSH` dan `BRPOP` |
| 4 | Set | Data unik dan irisan dengan `SINTER` |
| 5 | Sorted Set | Papan peringkat dengan `ZADD` dan `ZRANGE` |
| 6 | Bitmap, HyperLogLog, dan Geo *(opsional)* | Menghitung data unik dan kueri lokasi |
| 7 | Memilih struktur data | Panduan memilih struktur untuk suatu kasus |

## Setelah bagian ini

Lanjut ke bagian [Pola Penerapan](../pola-aplikasi/index.md).
