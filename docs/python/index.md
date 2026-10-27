# Python dan FastAPI

Bagian ini memindahkan apa yang sudah kamu latih di `redis-cli` ke kode Python, lalu ke API web dengan FastAPI.

## Tujuan bagian

Setelah menyelesaikan bagian ini kamu bisa:

- [ ] Terhubung ke Redis dari Python dengan `redis-py`.
- [ ] Memakai pipeline dan connection pool.
- [ ] Membuat API FastAPI yang memakai Redis untuk cache dan pembatasan laju.

## Prasyarat

- Sudah menyelesaikan bagian [Struktur Data](../struktur-data/index.md) serta bab Caching dan Session dan rate limiting di [Pola Penerapan](../pola-aplikasi/index.md).
- Pengetahuan dasar Python. Pengetahuan dasar FastAPI membantu.

## Daftar bab

| Urutan | Bab | Yang dipelajari |
|---|---|---|
| 1 | [Dasar redis-py](dasar-redis-py.md) | Koneksi, `decode_responses`, perintah dasar |
| 2 | [Struktur data di Python](struktur-data-di-python.md) | Pemetaan struktur data ke pemanggilan `redis-py` |
| 3 | [Pipeline dan connection pool](pipeline-dan-connection-pool.md) | Mengirim banyak perintah dan mengelola koneksi |
| 4 | [Dasar FastAPI dengan Redis](dasar-fastapi-dengan-redis.md) | Aplikasi FastAPI dengan dependensi Redis |
| 5 | [FastAPI: caching dan rate limit](fastapi-caching-dan-rate-limit.md) | Cache endpoint dan pembatasan permintaan |
| 6 | [FastAPI: fitur realtime dengan SSE](fastapi-fitur-realtime-dengan-sse.md) *(opsional)* | Event realtime lewat SSE dari Pub/Sub |

## Setelah bagian ini

Lanjut ke bagian [Operasi](../operasi/index.md).
