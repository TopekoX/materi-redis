# Pola Penerapan

!!! info "Belum ditulis"
    Bab-bab bagian ini sedang direncanakan. Daftar di bawah adalah rencana, belum berupa tautan.

Bagian ini memakai struktur data untuk masalah nyata di aplikasi: menyimpan salinan data agar cepat, membatasi permintaan, mengirim pesan, mencatat event, dan menjalankan perintah secara atomik.

## Tujuan bagian

Setelah menyelesaikan bagian ini kamu bisa:

- [ ] Menerapkan pola cache-aside dengan TTL dan invalidasi.
- [ ] Membuat sesi dan pembatas laju (*rate limiter*) sederhana.
- [ ] Memakai Pub/Sub dan Streams, serta menjelaskan perbedaannya.
- [ ] Memakai transaksi `MULTI`/`EXEC` dan `WATCH`.

## Prasyarat

- Sudah menyelesaikan bagian [Struktur Data](../struktur-data/index.md). Bab Streams membutuhkan List dan Pub/Sub.

## Rencana bab

| Urutan | Bab | Yang akan dipelajari |
|---|---|---|
| 1 | Caching | Cache-aside, TTL, invalidasi, dan eviction |
| 2 | Session dan rate limiting | Sesi login dan pembatas laju jendela tetap |
| 3 | Pub/Sub | `SUBSCRIBE`, `PUBLISH`, dan batasan pengirimannya |
| 4 | Streams | `XADD`, `XREAD`, consumer group, `XACK` |
| 5 | Transaksi | `MULTI`/`EXEC`, `WATCH`, dan bedanya dengan transaksi SQL |
| 6 | Lua script *(opsional)* | `EVAL` untuk operasi atomik |

## Setelah bagian ini

Lanjut ke bagian [Python dan FastAPI](../python/index.md).
