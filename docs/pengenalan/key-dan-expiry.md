# Key dan expiry

## Tujuan belajar

Setelah bab ini kamu bisa:

- [ ] Menjelaskan apa itu key dan memberi nama key dengan pola yang rapi.
- [ ] Memeriksa dan menghapus key dengan `EXISTS`, `TYPE`, dan `DEL`.
- [ ] Memberi masa hidup pada key dengan `EXPIRE` atau `SET ... EX`, lalu membacanya dengan `TTL`.
- [ ] Membatalkan expiry dengan `PERSIST` dan memahami kapan expiry hilang sendiri.
- [ ] Menelusuri key dengan `SCAN`, dan menjelaskan kenapa `KEYS` berbahaya.

## Prasyarat

- Sudah membaca [Menjalankan redis-cli pertama kali](menjalankan-redis-cli-pertama-kali.md), terutama `SET`, `GET`, dan arti `(integer)` dan `(nil)`.
- Container Redis berjalan dan kamu bisa masuk dengan `docker exec -it redis redis-cli` (lihat [Instalasi dengan Docker](instalasi-dengan-docker.md)).
- Versi Redis: `SCAN` dan nilai `-2` pada `TTL` tersedia sejak Redis 2.8,[^5][^6] jadi semua perintah di bab ini jalan di versi Redis yang kamu pasang lewat Docker.

## Konsep

### Key

Setiap data di Redis disimpan sebagai pasangan **key** dan **value**. Key adalah nama untuk menemukan data, dan value adalah isinya.[^1] Analoginya label di map arsip: label menunjuk ke isi map.

Redis tidak punya folder atau namespace. Semua key berada di satu ruang yang sama, jadi dua key bernama sama akan saling menimpa. Untuk itu ada konvensi memakai titik dua `:` sebagai pemisah, misalnya `user:1000`.[^1]

Saran dari dokumentasi resmi:[^1]

| Saran | Contoh baik | Contoh buruk |
|---|---|---|
| Pakai skema `jenis-objek:id` | `user:1000` | `u1000` |
| Cukup deskriptif, jangan terlalu pendek | `user:1000:followers` | `u1000flw` |
| Jangan terlalu panjang | key pendek dan jelas | key ratusan hingga ribuan byte |
| Batas ukuran key | maksimum 512 MB | |

### Expiry (masa hidup key)

Secara bawaan sebuah key hidup selamanya sampai dihapus. Dengan **expiry** (juga disebut *TTL*, *time to live*), kamu menentukan berapa lama key boleh hidup. Setelah waktunya habis, Redis menghapus key itu otomatis.[^2]

Analogi: makanan dengan tanggal kedaluwarsa. Setelah lewat tanggalnya, makanan dibuang tanpa kamu harus mengingatnya.

Kenapa penting: data sementara seperti cache, kode verifikasi, dan sesi login tidak perlu disimpan selamanya. Tanpa expiry, memori terus terisi data basi. Pola cache yang memakai ini dibahas di bab Caching.

Hal-hal yang perlu kamu tahu:

- Expiry bisa diatur dalam detik atau milidetik. Resolusinya 1 milidetik.[^3]
- Redis menghapus key kedaluwarsa dengan dua cara: saat key itu diakses, dan lewat pemeriksaan berkala pada sebagian key secara acak.[^2] Jadi key bisa terhapus sedikit setelah waktunya, tetapi kamu tidak akan melihatnya sebagai data yang masih valid.
- Informasi expiry disimpan juga di disk. Waktu terus berjalan walau server mati.[^2]

### Menelusuri key: `SCAN` dan `KEYS`

Kadang kamu perlu melihat key apa saja yang ada. Ada dua cara:

| Perintah | Cara kerja | Risiko |
|---|---|---|
| `KEYS pola` | Mengembalikan semua key yang cocok **sekaligus** | Memblokir server sampai selesai. Berbahaya jika key banyak.[^3] |
| `SCAN kursor` | Mengembalikan sedikit demi sedikit, dengan *kursor* sebagai penanda posisi | Aman dipakai bertahap, tetapi hasilnya tidak selengkap `KEYS` pada satu waktu.[^3] |

!!! warning "Jangan pakai `KEYS` di server yang dipakai aplikasi"
    Dokumentasi resmi menyebut `KEYS` untuk debugging dan operasi khusus, dan tidak boleh dipakai di kode aplikasi biasa. Untuk mencari subset key, pakai `SCAN`.[^3]

## Praktik langkah demi langkah

Lingkungan: **redis-cli**, kecuali dinyatakan lain. Output di bawah adalah output yang **diharapkan** dari dokumentasi, bukan hasil eksekusi di komputermu. Angka sisa waktu bisa sedikit berbeda.

Masuk dulu:

**Lingkungan: terminal**

```bash
docker exec -it redis redis-cli
```

### Langkah 1: Buat beberapa key dengan skema

```text
127.0.0.1:6379> SET user:1:nama "Budi"
127.0.0.1:6379> SET user:2:nama "Sari"
127.0.0.1:6379> SET sesi:abc123 "login-budi"
```

Kita memakai skema `jenis:id:atribut` agar key mudah dikelompokkan dan dicari nanti. Setiap perintah dibalas `OK`.

### Langkah 2: Periksa dan hapus key

```text
127.0.0.1:6379> EXISTS user:1:nama
127.0.0.1:6379> TYPE user:1:nama
127.0.0.1:6379> DEL user:2:nama
127.0.0.1:6379> EXISTS user:2:nama
```

| Perintah | Fungsi |
|---|---|
| `EXISTS key` | `1` jika ada, `0` jika tidak. |
| `TYPE key` | Mengembalikan jenis value, misalnya `string`, atau `none` jika key tidak ada.[^1] |
| `DEL key` | Menghapus key dan value-nya. Mengembalikan `1` jika ada yang terhapus, `0` jika key tidak ada.[^1] |

**Diharapkan:**

```text
(integer) 1
string
(integer) 1
(integer) 0
```

!!! danger "`DEL` tidak bisa dibatalkan"
    Key yang dihapus tidak bisa dikembalikan kecuali ada backup. Pastikan nama key benar sebelum menjalankannya.

### Langkah 3: Beri expiry dengan `EXPIRE` dan baca dengan `TTL`

```text
127.0.0.1:6379> EXPIRE sesi:abc123 30
127.0.0.1:6379> TTL sesi:abc123
```

| Bagian | Penjelasan |
|---|---|
| `EXPIRE sesi:abc123 30` | Atur masa hidup key menjadi 30 detik. |
| Balasan `1` | Expiry berhasil diatur. Balasan `0` berarti tidak diatur, misalnya karena key tidak ada.[^4] |
| `TTL sesi:abc123` | Menampilkan sisa detik. Kita membacanya untuk membuktikan expiry aktif. |

**Diharapkan:**

```text
(integer) 1
(integer) 30
```

Angka kedua bisa 30 atau sedikit lebih kecil, tergantung seberapa cepat kamu mengetik. Ulangi `TTL` beberapa kali dan lihat angkanya turun.

### Langkah 4: Lihat key hilang

Tunggu lebih dari 30 detik, lalu:

```text
127.0.0.1:6379> GET sesi:abc123
127.0.0.1:6379> TTL sesi:abc123
```

**Diharapkan:**

```text
(nil)
(integer) -2
```

Nilai balik `TTL` punya makna khusus:[^5]

| Nilai | Arti |
|---|---|
| Angka positif | Sisa waktu hidup dalam detik |
| `-1` | Key ada, tetapi **tanpa** expiry |
| `-2` | Key **tidak ada** (misalnya sudah kedaluwarsa) |

### Langkah 5: Buat key sekaligus dengan expiry

```text
127.0.0.1:6379> SET kode:otp "482913" EX 10
127.0.0.1:6379> TTL kode:otp
```

`SET ... EX detik` menyimpan nilai dan mengatur expiry dalam satu perintah.[^3] Kita pakai ini karena lebih ringkas dan tidak ada jeda di mana key ada tanpa expiry. **Diharapkan:** `OK`, lalu angka sekitar `10` atau `9`.

!!! note "Milidetik"
    Untuk milidetik tersedia `PEXPIRE` dan `PTTL`.[^3]

### Langkah 6: Batalkan expiry dengan `PERSIST`

```text
127.0.0.1:6379> SET catatan "sementara"
127.0.0.1:6379> EXPIRE catatan 60
127.0.0.1:6379> PERSIST catatan
127.0.0.1:6379> TTL catatan
```

`PERSIST` menghapus expiry sehingga key hidup permanen lagi.[^3] **Diharapkan:** `OK`, `(integer) 1`, `(integer) 1`, lalu `(integer) -1` (key ada tanpa expiry).

### Langkah 7: Perhatikan jebakan: `SET` menghapus expiry

```text
127.0.0.1:6379> SET catatan "baru" 
127.0.0.1:6379> EXPIRE catatan 60
127.0.0.1:6379> SET catatan "ditimpa"
127.0.0.1:6379> TTL catatan
```

Menimpa key dengan `SET` menghapus expiry-nya. Dokumentasi menyatakan timeout dibersihkan oleh perintah yang menghapus atau menimpa isi key, seperti `DEL` dan `SET`.[^4] Perintah yang hanya mengubah isi tanpa menggantinya (misalnya `INCR`, `LPUSH`, `HSET`) tidak mengubah expiry.[^4]

**Diharapkan:** `TTL` yang terakhir mengembalikan `(integer) -1`.

### Langkah 8: Telusuri key dengan `SCAN`

```text
127.0.0.1:6379> SCAN 0 MATCH user:* COUNT 100
```

| Bagian | Penjelasan |
|---|---|
| `SCAN 0` | Mulai iterasi dengan kursor `0`.[^6] |
| `MATCH user:*` | Hanya key yang cocok pola glob. `*` berarti apa saja. |
| `COUNT 100` | Petunjuk jumlah kerja per panggilan. Bawaannya 10. Ini hanya petunjuk, bukan jaminan jumlah hasil.[^6] |

Balasan berbentuk dua bagian: kursor berikutnya, lalu daftar key. **Diharapkan** (urutan key tidak dijamin):

```text
1) "0"
2) 1) "user:1:nama"
```

Kursor `"0"` berarti iterasi selesai. Pada database kecil, semua hasil biasanya muncul dalam satu panggilan. Pada database besar, kursor bukan `0`, dan kamu harus mengulang dengan kursor itu:

```text
127.0.0.1:6379> SCAN 17
```

Aturan iterasi `SCAN`:[^6]

- Mulai dari `0`, berhenti ketika kursor yang dikembalikan `0`.
- Satu panggilan boleh mengembalikan **nol** elemen. Jangan anggap selesai selama kursor belum `0`.
- Satu key bisa muncul **lebih dari sekali**, jadi aplikasi harus siap menanganinya.
- Key yang ada selama seluruh iterasi pasti dikembalikan.

### Langkah 9: `SCAN` dari terminal

**Lingkungan: terminal**

```bash
docker exec redis redis-cli --scan --pattern "user:*"
```

Opsi `--scan` di `redis-cli` memakai `SCAN` di balik layar dan mengulang kursor untukmu, jadi kamu tidak perlu menulis kursor manual.[^7] **Diharapkan:** daftar nama key, satu per baris, misalnya `user:1:nama`.

## Troubleshooting

| Gejala | Penyebab dan solusi |
|---|---|
| `EXPIRE` membalas `(integer) 0` | Key tidak ada, atau opsi `NX`/`XX`/`GT`/`LT` membuat perintah dilewati.[^4] Cek `EXISTS`. |
| `TTL` membalas `-1` padahal sudah `EXPIRE` | Key sempat ditimpa `SET` sehingga expiry hilang. Atur ulang setelah `SET`, atau pakai `SET ... EX`. |
| `TTL` membalas `-2` | Key sudah tidak ada: kedaluwarsa, terhapus, atau salah ketik. |
| `SCAN` mengembalikan daftar kosong tetapi kursor bukan `0` | Wajar. Lanjutkan sampai kursor `0`.[^6] |
| Key muncul dua kali di hasil `SCAN` | Wajar. Hapus duplikat di sisi aplikasi.[^6] |
| `SCAN` tidak menampilkan key yang baru dibuat | Key yang tidak ada sepanjang iterasi boleh muncul atau tidak.[^6] |
| `EXPIRE key 0` atau negatif menghapus key | Memang begitu: timeout non-positif membuat key langsung terhapus.[^4] |

!!! note "Status verifikasi"
    Sintaks, nilai balik, dan aturan di atas dicocokkan dengan dokumentasi resmi. Blok output belum dijalankan di Redis sungguhan saat bab ini ditulis, jadi bandingkan dengan hasilmu sendiri.

## Latihan

1. Buat tiga key dengan skema `produk:<id>:nama`. Periksa jenis salah satunya dengan `TYPE`.
2. Buat key `promo:harian`, beri expiry 20 detik, lalu pantau dengan `TTL` sampai key menghilang. Apa nilai `TTL` setelah hilang?
3. Buat key dengan `SET token "rahasia-placeholder" EX 15`. Sebelum habis, jalankan `SET token "baru"` lalu `TTL token`. Jelaskan hasilnya.
4. Jalankan `SCAN 0 MATCH produk:* COUNT 1` dan ulangi dengan kursor yang dikembalikan sampai kursor `0`. Berapa panggilan yang dibutuhkan?
5. Jelaskan dengan kata-katamu kenapa `KEYS *` berbahaya di server produksi sedangkan `SCAN` tidak.

??? success "Petunjuk"
    2. Lihat tabel nilai balik `TTL`.
    3. Ingat aturan menimpa key dengan `SET`.
    4. `COUNT` hanya petunjuk, jadi jumlah panggilan tidak harus sama dengan jumlah key.

## Ringkasan

- Key adalah nama untuk menemukan value. Pakai skema `jenis:id:atribut` karena Redis tidak punya namespace.
- `EXISTS`, `TYPE`, dan `DEL` mengelola key. `DEL` tidak bisa dibatalkan.
- `EXPIRE` atau `SET ... EX` memberi masa hidup, `TTL` membacanya (`-1` tanpa expiry, `-2` tidak ada), `PERSIST` membatalkannya.
- `SET` yang menimpa key menghapus expiry.
- `SCAN` menelusuri key bertahap dengan kursor (mulai dan berakhir di `0`, hasil bisa duplikat). `KEYS` memblokir server dan dihindari di aplikasi.

Berikutnya: bagian Struktur Data, dimulai dari String.

## Referensi resmi

[^1]: Redis, *Keys and values*: <https://redis.io/docs/latest/develop/using-commands/keyspace/>
[^2]: Redis, *EXPIRE* (bagian *Appendix: Redis expires*): <https://redis.io/docs/latest/commands/expire/>
[^3]: Redis, *Keys and values* (bagian *Key expiration* dan *Navigating the keyspace*): <https://redis.io/docs/latest/develop/using-commands/keyspace/>
[^4]: Redis, *EXPIRE*: <https://redis.io/docs/latest/commands/expire/>
[^5]: Redis, *TTL*: <https://redis.io/docs/latest/commands/ttl/>
[^6]: Redis, *SCAN*: <https://redis.io/docs/latest/commands/scan/>
[^7]: Redis, *Redis CLI* (bagian *Get a list of keys*): <https://redis.io/docs/latest/develop/tools/cli/>

Bacaan tambahan: [`PERSIST`](https://redis.io/docs/latest/commands/persist/), [`DEL`](https://redis.io/docs/latest/commands/del/), [`KEYS`](https://redis.io/docs/latest/commands/keys/).
