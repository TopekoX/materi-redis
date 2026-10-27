# Menjalankan redis-cli pertama kali

## Tujuan belajar

Setelah bab ini kamu bisa:

- [ ] Menjelaskan apa itu `redis-cli` dan dua cara memakainya.
- [ ] Membuka sesi interaktif dan membaca prompt-nya.
- [ ] Menjalankan `PING`, `SET`, `GET`, `EXISTS`, dan `DBSIZE`.
- [ ] Membaca tipe balasan Redis, seperti `OK`, `(integer)`, dan `(nil)`.
- [ ] Memakai `HELP` dan Tab untuk belajar sendiri.
- [ ] Mengenali pesan galat sederhana.

## Prasyarat

- Sudah membaca [Apa itu Redis](apa-itu-redis.md).
- Container Redis berjalan, seperti di [Instalasi dengan Docker](instalasi-dengan-docker.md). Cek dengan `docker ps`; kalau belum ada, ikuti langkah 2 bab tersebut.

## Konsep

### Apa itu `redis-cli`

`redis-cli` adalah antarmuka baris perintah (CLI) Redis: program kecil tempat kamu mengetik perintah, mengirimnya ke server Redis, dan membaca balasannya.[^1] Analoginya seperti telepon ke resepsionis: kamu bicara (perintah), resepsionis menjawab (balasan).

### Dua cara memakainya

| Mode | Cara | Kapan dipakai |
|---|---|---|
| **Interaktif** | Jalankan tanpa perintah; kamu mengetik di prompt | Belajar dan menjelajah |
| **Satu perintah** | Tulis perintah sebagai argumen; hasil dicetak lalu program selesai | Skrip dan pengecekan cepat |

Kita berlatih dengan mode interaktif lebih dulu karena memberi umpan balik langsung.[^1]

### Membaca balasan

Balasan Redis punya tipe, dan `redis-cli` menampilkan tipe itu agar mudah dibaca manusia:[^1]

| Tampilan | Arti |
|---|---|
| `PONG`, `OK` | Teks status dari server |
| `"Budi"` | String (ditampilkan dengan tanda kutip) |
| `(integer) 1` | Bilangan bulat |
| `(nil)` | Tidak ada nilai (key tidak ditemukan) |
| `(error) ...` | Perintah ditolak |

## Praktik langkah demi langkah

Semua langkah di **lingkungan: redis-cli** kecuali disebut lain. Output di bawah adalah output yang **diharapkan** berdasarkan dokumentasi, bukan hasil eksekusi di komputermu. Bandingkan dengan hasilmu sendiri.

### Langkah 1: Masuk ke `redis-cli`

**Lingkungan: terminal**

```bash
docker exec -it redis redis-cli
```

Perintah ini dijelaskan di bab Docker. Jika kamu sudah memasang `redis-cli` di komputer, `redis-cli` saja cukup karena nilai bawaannya adalah host `127.0.0.1` dan port `6379`.[^1]

**Output yang diharapkan:** prompt berikut muncul dan menunggu ketikanmu.

```text
127.0.0.1:6379>
```

Prompt menunjukkan server yang sedang terhubung: alamat `127.0.0.1` dan port `6379`.[^1] Kalau kamu berpindah database, prompt berubah, misalnya `127.0.0.1:6379[2]>`. Bagian `127.0.0.1:6379>` bukan untuk diketik.

### Langkah 2: Tes koneksi dengan `PING`

```text
127.0.0.1:6379> PING
```

Kenapa: `PING` murah dan tidak mengubah data, jadi cocok untuk memastikan server hidup sebelum kamu menulis apa pun.

**Diharapkan:**

```text
PONG
```

### Langkah 3: Simpan dan ambil data

```text
127.0.0.1:6379> SET nama "Budi"
127.0.0.1:6379> GET nama
```

| Bagian | Penjelasan |
|---|---|
| `SET` | Menyimpan sebuah nilai. |
| `nama` | **Key**, yaitu nama untuk menemukan data lagi. |
| `"Budi"` | Nilai yang disimpan. Tanda kutip dipakai agar nilai dengan spasi tetap satu argumen. |
| `GET nama` | Mengambil nilai milik key `nama`. Tanpa langkah ini kamu belum membuktikan data tersimpan. |

**Diharapkan:**

```text
OK
"Budi"
```

`OK` berarti penyimpanan berhasil. `"Budi"` adalah nilai yang kamu simpan, ditampilkan sebagai string.

### Langkah 4: Key yang belum ada

```text
127.0.0.1:6379> GET tidak_ada
```

**Diharapkan:**

```text
(nil)
```

`(nil)` bukan galat. Artinya "tidak ada nilai di key itu". Ini jawaban penting yang sering dipakai aplikasi untuk memutuskan apakah data harus diambil dari database utama.

### Langkah 5: Balasan berupa angka

```text
127.0.0.1:6379> EXISTS nama
127.0.0.1:6379> DBSIZE
```

| Perintah | Fungsi |
|---|---|
| `EXISTS nama` | Menanyakan apakah key `nama` ada. `1` berarti ada, `0` berarti tidak. |
| `DBSIZE` | Menghitung jumlah key di database yang sedang dipakai. |

**Diharapkan** (jika database baru dan hanya berisi `nama`):

```text
(integer) 1
(integer) 1
```

Jumlah `DBSIZE` mengikuti isi database kamu, jadi bisa berbeda.

### Langkah 6: Nilai dengan spasi

```text
127.0.0.1:6379> SET pesan "Halo Dunia"
127.0.0.1:6379> GET pesan
```

`redis-cli` memecah argumen berdasarkan spasi. Tanpa tanda kutip, `Halo Dunia` terbaca sebagai dua argumen dan perintah ditolak.[^1] Tanda kutip ganda dan tunggal sama-sama bisa dipakai.

**Diharapkan:**

```text
OK
"Halo Dunia"
```

### Langkah 7: Belajar sendiri dengan `HELP` dan Tab

```text
127.0.0.1:6379> HELP SET
```

`HELP <nama-perintah>` menampilkan sintaks dan ringkasan perintah. `HELP @string` menampilkan semua perintah dalam satu kategori.[^1] Kita pakai ini supaya tidak perlu menghafal.

Tab melengkapi nama perintah, misalnya mengetik `Z` lalu Tab menampilkan perintah yang berawalan `Z`. Panah atas dan bawah memunculkan perintah sebelumnya. Riwayat disimpan antarsesi.[^1] `CLEAR` membersihkan layar.

### Langkah 8: Mode satu perintah

Keluar dari sesi interaktif dengan `exit`, lalu di terminal:

**Lingkungan: terminal**

```bash
docker exec redis redis-cli GET nama
```

Perintah dikirim sebagai argumen, hasilnya dicetak, lalu program selesai. Bagian `-it` tidak diperlukan karena tidak ada sesi interaktif. Mode ini berguna untuk skrip.[^1]

**Diharapkan:** `Budi` (tanpa tanda kutip). Ketika keluaran bukan terminal interaktif, `redis-cli` memakai *raw output*: tipe seperti `(integer)` dan tanda kutip tidak ditampilkan. Kamu bisa memaksanya dengan `--raw`.[^1]

## Troubleshooting

| Gejala | Penyebab dan solusi |
|---|---|
| `Could not connect to Redis at 127.0.0.1:6379: Connection refused` | Redis tidak berjalan atau port tidak dipetakan. Cek `docker ps`, jalankan `docker start redis`. |
| `Error response from daemon: No such container: redis` | Nama container salah atau belum dibuat. Lihat `docker ps -a`. |
| `(error) ERR unknown command 'POING', ...` | Salah ketik nama perintah. Perintah tidak membedakan huruf besar dan kecil, tetapi ejaannya harus tepat. |
| `(error) ERR wrong number of arguments for 'set' command` | Argumen kurang, misalnya `SET nama` tanpa nilai. Cek sintaks dengan `HELP SET`. |
| `(error) ERR syntax error` | Argumen berlebih atau tidak dikenali, misalnya nilai dengan spasi tanpa tanda kutip (`SET sapaan Halo Dunia`). Bungkus nilai dengan tanda kutip. |
| `docker exec` meminta `-it` atau tidak ada prompt | Tambahkan `-it` untuk sesi interaktif. |
| Prompt menjadi `not connected>` | Koneksi terputus. `redis-cli` mencoba menyambung ulang setiap perintah; periksa server.[^1] |

!!! note "Status verifikasi"
    Teks galat di atas adalah bentuk umum dan belum direproduksi di Redis sungguhan saat bab ini ditulis. Kalimat persisnya dapat berbeda antarversi Redis.

!!! info "Catatan"
    Kamu menyimpan `nama` dan `pesan` di Redis kamu. Jangan menyimpan data rahasia. Bab Keamanan menjelaskan kenapa.

## Latihan

1. Masuk ke `redis-cli`, jalankan `PING`, lalu `SET kota "Bandung"` dan `GET kota`. Apa tipe balasan masing-masing?
2. Jalankan `GET` pada key yang belum pernah dibuat. Apa balasannya, dan kenapa itu bukan galat?
3. Coba `SET sapaan Halo Dunia` tanpa tanda kutip. Apa balasannya? Bagaimana memperbaikinya?
4. Pakai `HELP SET` lalu jelaskan dengan kata-katamu apa fungsi perintah `SET`.
5. Jalankan `docker exec redis redis-cli DBSIZE`. Jelaskan beda tampilan balasannya dibanding di sesi interaktif.

??? success "Petunjuk"
    3. Perhatikan jumlah argumen yang diterima `SET` dan lihat sintaksnya di `HELP SET`.
    5. Ingat aturan *raw output*.

## Ringkasan

- `redis-cli` adalah klien baris perintah dengan mode interaktif dan mode satu perintah.
- Prompt `127.0.0.1:6379>` menunjukkan server yang terhubung.
- `PING` untuk tes, `SET` dan `GET` untuk menyimpan dan mengambil, `EXISTS` dan `DBSIZE` untuk menghitung.
- Balasan punya tipe: `OK`, string, `(integer)`, `(nil)`, dan `(error)`.
- `HELP`, Tab, dan riwayat panah membantu belajar mandiri.

Berikutnya: [Key dan expiry](key-dan-expiry.md).

## Referensi resmi

[^1]: Redis, *Redis CLI*: <https://redis.io/docs/latest/develop/tools/cli/>

Bacaan tambahan: [Daftar perintah Redis](https://redis.io/docs/latest/commands/) dan [`PING`](https://redis.io/docs/latest/commands/ping/), [`SET`](https://redis.io/docs/latest/commands/set/), [`GET`](https://redis.io/docs/latest/commands/get/).
