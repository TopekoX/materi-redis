# Pola Penerapan

Bagian ini memakai struktur data untuk masalah nyata di aplikasi: menyimpan salinan data agar cepat, membatasi permintaan, mengirim pesan, mencatat event, dan menjalankan perintah secara atomik.

## Tujuan bagian

Setelah menyelesaikan bagian ini kamu bisa:

- [ ] Menerapkan pola cache-aside dengan TTL dan invalidasi.
- [ ] Membuat sesi dan pembatas laju (*rate limiter*) sederhana.
- [ ] Memakai Pub/Sub dan Streams, serta menjelaskan perbedaannya.
- [ ] Memakai transaksi `MULTI`/`EXEC` dan `WATCH`.

## Prasyarat

- Sudah menyelesaikan bagian [Struktur Data](../struktur-data/index.md). Bab Streams membutuhkan List dan Pub/Sub.

## Daftar bab

| Urutan | Bab | Yang dipelajari |
|---|---|---|
| 1 | [Caching](caching.md) | Cache-aside, TTL, invalidasi, dan eviction |
| 2 | [Session dan rate limiting](session-dan-rate-limiting.md) | Sesi login dan pembatas laju jendela tetap |
| 3 | [Pub/Sub](pub-sub.md) | `SUBSCRIBE`, `PUBLISH`, dan batasan pengirimannya |
| 4 | [Streams dan consumer group](streams-consumer-group.md) | `XADD`, `XREAD`, consumer group, `XACK` |
| 5 | [Transaksi](transaksi.md) | `MULTI`/`EXEC`, `WATCH`, dan bedanya dengan transaksi SQL |
| 6 | [Lua script](lua-script.md) *(opsional)* | `EVAL` untuk operasi atomik |

## Setelah bagian ini

Lanjut ke bagian [Python dan FastAPI](../python/index.md).
