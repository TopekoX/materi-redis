# Belajar Redis

Materi Redis untuk pemula, dari nol sampai penerapan di aplikasi nyata. Semua penjelasan dan contoh dalam bahasa Indonesia, dan rujukan teknisnya adalah [dokumentasi resmi Redis](https://redis.io/docs/latest/).

## Mulai dari sini

Bagian **Pengenalan** dibaca berurutan:

1. [Apa itu Redis](pengenalan/apa-itu-redis.md): konsep, kegunaan, dan struktur data.
2. [Instalasi dengan Docker](pengenalan/instalasi-dengan-docker.md): menjalankan Redis di komputermu.
3. [Menjalankan redis-cli pertama kali](pengenalan/menjalankan-redis-cli-pertama-kali.md): perintah pertama.
4. [Key dan expiry](pengenalan/key-dan-expiry.md): menamai key, `EXPIRE`, `TTL`, dan `SCAN`.

## Rencana materi

| Bagian | Isi |
|---|---|
| Pengenalan | Dasar Redis, Docker, `redis-cli`, key dan expiry |
| Struktur Data | String, Hash, List, Set, Sorted Set |
| Pola Penerapan | Caching, session dan rate limiting, Pub/Sub, Streams, transaksi |
| Python dan FastAPI | `redis-py`, FastAPI, caching, rate limit |
| Operasi | Persistence, keamanan, monitoring |
| Proyek Akhir | Membangun aplikasi dari awal sampai pengujian |

Bagian selain Pengenalan akan ditambahkan bertahap.

!!! info "Tentang output di bab"
    Output yang diberi label *diharapkan* berasal dari dokumentasi resmi dan belum tentu sudah dijalankan di Redis nyata. Bandingkan dengan hasil di komputermu.
