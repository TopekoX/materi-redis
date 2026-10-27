# Operasi

!!! info "Belum ditulis"
    Bab-bab bagian ini sedang direncanakan. Daftar di bawah adalah rencana, belum berupa tautan.

Bagian ini membahas menjaga Redis tetap aman dan sehat: menyimpan data ke disk, mengamankan akses, dan memantau kondisi server.

## Tujuan bagian

Setelah menyelesaikan bagian ini kamu bisa:

- [ ] Memilih antara RDB dan AOF dan membuat cadangan.
- [ ] Mengamankan Redis dengan ACL, password, pembatasan jaringan, dan TLS.
- [ ] Memantau memori, perintah lambat, dan latensi.

## Prasyarat

- Sudah menyelesaikan [Instalasi dengan Docker](../pengenalan/instalasi-dengan-docker.md).
- Bab Monitoring lebih mudah dipahami setelah bab Caching di [Pola Penerapan](../pola-aplikasi/index.md).

## Rencana bab

| Urutan | Bab | Yang akan dipelajari |
|---|---|---|
| 1 | Persistence | RDB, AOF, dan cadangan |
| 2 | Keamanan | ACL, password, jaringan, dan TLS |
| 3 | Monitoring | `INFO`, `SLOWLOG`, memori, dan latensi |
| 4 | Replikasi, Sentinel, dan Cluster *(opsional)* | Konsep ketersediaan tinggi, tanpa praktik mendalam |

## Setelah bagian ini

Lanjut ke bagian [Proyek Akhir](../proyek-akhir/index.md).
