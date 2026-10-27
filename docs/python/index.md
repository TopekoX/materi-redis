# Python dan FastAPI

!!! info "Belum ditulis"
    Bab-bab bagian ini sedang direncanakan. Daftar di bawah adalah rencana, belum berupa tautan.

Bagian ini memindahkan apa yang sudah kamu latih di `redis-cli` ke kode Python, lalu ke API web dengan FastAPI.

## Tujuan bagian

Setelah menyelesaikan bagian ini kamu bisa:

- [ ] Terhubung ke Redis dari Python dengan `redis-py`.
- [ ] Memakai pipeline dan connection pool.
- [ ] Membuat API FastAPI yang memakai Redis untuk cache dan pembatasan laju.

## Prasyarat

- Sudah menyelesaikan bagian [Struktur Data](../struktur-data/index.md) serta bab Caching dan Session dan rate limiting di [Pola Penerapan](../pola-aplikasi/index.md).
- Pengetahuan dasar Python. Pengetahuan dasar FastAPI membantu.

## Rencana bab

| Urutan | Bab | Yang akan dipelajari |
|---|---|---|
| 1 | Dasar `redis-py` | Koneksi, `decode_responses`, perintah dasar |
| 2 | Struktur data di Python | Pemetaan struktur data ke pemanggilan `redis-py` |
| 3 | Pipeline dan connection pool | Mengirim banyak perintah dan mengelola koneksi |
| 4 | Dasar FastAPI dengan Redis | Aplikasi FastAPI dengan dependensi Redis |
| 5 | FastAPI: caching dan rate limit | Cache endpoint dan pembatasan permintaan |
| 6 | FastAPI: fitur realtime *(opsional)* | Event realtime lewat SSE dari Pub/Sub atau Streams |

## Setelah bagian ini

Lanjut ke bagian [Operasi](../operasi/index.md).
