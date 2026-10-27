# Operasi dan pengujian

## Tujuan belajar

Setelah bab ini kamu bisa:

- [ ] Menyusun Redis proyek dengan Docker Compose, berkas konfigurasi, dan berkas ACL yang bisa diulang.
- [ ] Mengaktifkan persistence RDB dan AOF, lalu membuktikan data bertahan setelah Redis dimatikan paksa.
- [ ] Membuat pengguna ACL dengan hak minimum untuk aplikasi dan pemantau, serta membuktikan penolakannya.
- [ ] Memilih kebijakan memori yang sesuai campuran data cache dan data permanen, dan memantau indikator pentingnya.
- [ ] Menulis dan menjalankan tes otomatis untuk API, serta mengenali apa yang **tidak** bisa dibuktikan oleh tes itu.

## Prasyarat

- Sudah membaca [Implementasi API](implementasi-api.md). Bab ini memakai `kunci.py`, `sumber.py`, dan `main.py` dari sana. Bab [Fitur realtime](fitur-realtime.md) bersifat opsional; tes untuk `/aliran` di sini hanya memeriksa validasi header.
- Sudah membaca [Persistence](../operasi/persistence.md), [Keamanan](../operasi/keamanan.md), dan [Monitoring](../operasi/monitoring.md). Bab ini menerapkannya pada proyek dan tidak mengulang penjelasan konsepnya.
- Docker dengan Docker Compose v2 (perintah `docker compose`), Python 3, dan paket `pytest`, `fakeredis`, dan `httpx` (`pip install pytest fakeredis httpx`; `TestClient` FastAPI membutuhkan `httpx`).
- Redis 7.0 atau lebih baru (image `redis:latest`).
- Kondisi awal: port 6379 di komputermu bebas, dan tidak ada container bernama `redis-katalog`.

## Konsep

Aplikasi yang jalan di laptop belum tentu siap dipakai. Sebelum dianggap selesai, proyek perlu menjawab empat pertanyaan:

| Pertanyaan | Jawaban di bab ini |
|---|---|
| Apakah datanya bertahan bila Redis mati mendadak? | Persistence RDB dan AOF dengan volume |
| Apakah hanya yang berhak yang bisa masuk dan melakukan apa saja? | Pengguna ACL: satu untuk aplikasi, satu untuk pemantau |
| Apakah kita tahu bila ada yang tidak beres? | Indikator `INFO` dan `SLOWLOG` yang dipantau |
| Apakah kita bisa membuktikan API-nya benar setelah diubah? | Tes otomatis yang bisa dijalankan kapan saja |

Pengujian punya batas yang perlu dipahami. Tes cepat tanpa Redis asli memakai **fakeredis**, pustaka yang meniru Redis di dalam Python. Ia sangat berguna untuk memeriksa logika aplikasi: cache, penghapusan cache, batas laju, penulisan Stream. Tetapi ia **bukan Redis**. Hal-hal yang bergantung pada server asli, seperti ACL, persistence, eviction, dan performa, tidak terbukti oleh tes itu dan harus diperiksa pada Redis asli (itulah isi Langkah 4 sampai 8).

### Analogi

Bayangkan membuka toko. Persistence adalah **brankas** yang menyimpan catatan penjualan walau listrik padam. ACL adalah **kunci yang berbeda** untuk kasir, manajer, dan teknisi. Monitoring adalah **kamera dan panel alarm**. Tes otomatis adalah **daftar periksa pembukaan toko** yang dijalankan setiap pagi. Tidak ada satu pun yang menggantikan yang lain.

!!! note "Batas analogi"
    Daftar periksa tidak bisa membuktikan brankas benar-benar tahan api; itu perlu uji api sungguhan. Begitu pula tes dengan fakeredis tidak membuktikan ACL atau persistence bekerja.

## Cara kerja

Seluruh Redis proyek ditentukan oleh empat berkas dan satu volume:

```mermaid
flowchart LR
    subgraph Komputer
      C["docker-compose.yml"]
      F["redis.conf"]
      U["users.acl"]
    end
    C --> R["Container redis-katalog"]
    F -- "dibaca saat start" --> R
    U -- "dibaca saat start" --> R
    R --> V[("Volume redis-data<br/>dump.rdb + appendonlydir")]
    A["API katalog<br/>(pengguna api-katalog)"] --> R
    M["Pemantau<br/>(pengguna pemantau)"] --> R
```

Keputusan penting dan alasannya:

| Keputusan | Alasan |
|---|---|
| RDB **dan** AOF aktif (`save ...`, `appendonly yes`) | Kombinasi yang disarankan dokumentasi resmi bila data cukup berharga.[^1] AOF memberi ketahanan (`everysec`, kehilangan paling banyak ±1 detik), RDB memberi cadangan dan restart lebih cepat. |
| `maxmemory 256mb` dan `maxmemory-policy volatile-lru` | Satu Redis menampung dua jenis data: cache, rate, dan pengunjung (punya TTL, boleh dibuang) serta peringkat dan Stream (tanpa TTL, tidak boleh dibuang). Kebijakan `volatile-*` hanya membuang key yang punya TTL.[^2] |
| Konsekuensi `volatile-lru` | Bila memori penuh dan **tidak ada** key ber-TTL yang bisa dibuang, kebijakan ini berperilaku seperti `noeviction`: penulisan baru ditolak.[^2] Dokumentasi juga menyarankan dua instans terpisah bila memungkinkan. |
| Pengguna di **berkas ACL** (`aclfile`), bukan di `redis.conf` | Keduanya tidak boleh dicampur: bila pengguna didefinisikan di `redis.conf` dan `aclfile` aktif, server menolak start. Dengan `aclfile`, `requirepass` diabaikan.[^3][^4] |
| `user default off` | Pengguna bawaan tanpa password dimatikan, sehingga setiap koneksi wajib `AUTH` sebagai pengguna bernama. |
| Password disimpan sebagai hash `#<SHA-256>` | Berkas ACL tidak berisi password asli. Hash harus 64 karakter heksadesimal huruf kecil.[^3] |
| `api-katalog`: `~katalog:*`, `+@read +@write +@transaction +@connection -@dangerous` | Aplikasi hanya menyentuh key `katalog:*`, boleh membaca, menulis, dan memakai transaksi (pipeline `MULTI`/`EXEC`), tetapi tidak `FLUSHALL`, `CONFIG`, atau `INFO`. |
| `pemantau`: hanya `info`, `ping`, `dbsize`, `slowlog get/len` | Pemantau melihat kondisi server tanpa bisa membaca atau mengubah data. |
| Port dipetakan ke `127.0.0.1` | Redis tidak terjangkau dari jaringan lain (lihat [Keamanan](../operasi/keamanan.md)). |

## Praktik langkah demi langkah

Output Redis di bawah **terverifikasi**: dijalankan di Redis 8.10.3 pada 2026-10-27. Nilai yang berubah tiap eksekusi bisa berbeda di komputermu. Semua password di bab ini adalah placeholder atau nilai acak sekali pakai. Jangan menyimpan password asli di berkas yang masuk Git.

### Langkah 1: Buat password dan hash-nya

**Lingkungan: Python**

```python title="buat_rahasia.py"
import hashlib
import secrets

for nama in ("api-katalog", "pemantau"):
    kata_sandi = secrets.token_hex(32)
    hash_sha256 = hashlib.sha256(kata_sandi.encode()).hexdigest()
    print(nama)
    print("  kata sandi (simpan di tempat aman):", kata_sandi)
    print("  hash SHA-256 (untuk users.acl)    :", hash_sha256)
```

Jalankan `python buat_rahasia.py` di folder proyek.

Kenapa langkah ini diperlukan: password acak yang panjang tahan terhadap tebakan, dan hash-nya adalah yang ditulis di berkas ACL, sehingga password asli tidak tersimpan di berkas. Redis sendiri menyimpan password ACL sebagai SHA-256, dan menyarankan password acak yang panjang karena Redis cepat dicoba berulang kali.[^3]

| Baris | Fungsi dan alasan |
|---|---|
| `secrets.token_hex(32)` | 32 byte acak dari generator kriptografis, menjadi 64 karakter heksadesimal (bentuk yang sama dengan `ACL GENPASS`). |
| `hashlib.sha256(kata_sandi.encode()).hexdigest()` | SHA-256 dari password dalam heksadesimal huruf kecil, persis format `#<hash>` yang diterima ACL. |

**Terverifikasi** (nilai acak, berbeda tiap kali):

```text
api-katalog
  kata sandi (simpan di tempat aman): <64 heksadesimal>
  hash SHA-256 (untuk users.acl)    : <64 heksadesimal>
pemantau
  kata sandi (simpan di tempat aman): <64 heksadesimal>
  hash SHA-256 (untuk users.acl)    : <64 heksadesimal>
```

Cara membaca: simpan **kata sandi** di pengelola rahasia atau variabel lingkungan; tempel **hash** ke `users.acl` di langkah berikut. Pada tulisan selanjutnya, kata sandi disebut `PASSWORD_API` dan `PASSWORD_PEMANTAU`.

### Langkah 2: Tulis `users.acl` dan `redis.conf`

**Lingkungan: berkas konfigurasi Redis**

```text title="users.acl"
user default off
user api-katalog on #GANTI_HASH_API ~katalog:* +@read +@write +@transaction +@connection -@dangerous
user pemantau on #GANTI_HASH_PEMANTAU -@all +info +ping +dbsize +slowlog|get +slowlog|len
```

Ganti `GANTI_HASH_API` dan `GANTI_HASH_PEMANTAU` dengan hash dari Langkah 1 (tanpa tanda kurung).

```conf title="redis.conf"
# Persistence: RDB dan AOF
save 900 1 300 10 60 10000
appendonly yes
appendfsync everysec
dir /data

# Memori: key ber-TTL (cache, rate, pengunjung) boleh dibuang; yang tanpa TTL tidak
maxmemory 256mb
maxmemory-policy volatile-lru

# Akses: pengguna didefinisikan di berkas ACL
aclfile /usr/local/etc/redis/users.acl

# Pemantauan
slowlog-log-slower-than 10000
slowlog-max-len 128
latency-monitor-threshold 100
```

| Baris | Fungsi dan alasan |
|---|---|
| `save 900 1 300 10 60 10000` | Snapshot bila ada ≥1 perubahan dalam 15 menit, ≥10 dalam 5 menit, atau ≥10000 dalam 1 menit. Pasangan *detik perubahan* ditulis pada satu baris.[^4] |
| `appendonly yes`, `appendfsync everysec` | AOF aktif dengan `fsync` tiap detik: seimbang antara keamanan dan kecepatan ([Persistence](../operasi/persistence.md)). |
| `dir /data` | Folder tempat `dump.rdb` dan `appendonlydir` ditulis; di image resmi, `/data` adalah volume. |
| `maxmemory`, `maxmemory-policy volatile-lru` | Batas memori dan kebijakan pembuangan seperti dijelaskan di Cara kerja. |
| `aclfile ...` | Memuat pengguna dari berkas. Redis akan menolak start bila berkas ini dan pengguna di `redis.conf` dipakai bersamaan.[^4] |
| `slowlog-*`, `latency-monitor-threshold 100` | Nilai bawaan slow log, dan monitor latensi menyala untuk kejadian ≥100 ms ([Monitoring](../operasi/monitoring.md)). |

Kenapa: dua berkas ini adalah satu-satunya tempat konfigurasi Redis proyek. Karena ditulis sebagai berkas (bukan `CONFIG SET`), pengaturan tidak hilang saat restart (lihat jebakan `CONFIG SET` di [Persistence](../operasi/persistence.md)).

### Langkah 3: Tulis `docker-compose.yml`

**Lingkungan: YAML**

```yaml title="docker-compose.yml"
services:
  redis:
    image: redis:latest
    container_name: redis-katalog
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis-data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf:ro
      - ./users.acl:/usr/local/etc/redis/users.acl:ro
    restart: unless-stopped

volumes:
  redis-data:
```

| Baris | Fungsi dan alasan |
|---|---|
| `command: ["redis-server", ".../redis.conf"]` | Menjalankan Redis dengan berkas konfigurasi kita, bukan nilai bawaan. |
| `127.0.0.1:6379:6379` | Port hanya terbuka di komputer sendiri. |
| `redis-data:/data` | Volume bernama untuk persistence, agar data bertahan walau container dibuat ulang. |
| `./redis.conf ...:ro` dan `./users.acl ...:ro` | Berkas dipasang **hanya-baca**, jadi proses di container tidak bisa mengubahnya. |
| `restart: unless-stopped` | Container menyala lagi sendiri setelah crash atau reboot Docker. Perintah `docker kill` manual tidak dihitung sebagai crash: di uji, container tetap `Exited (137)` sampai kamu menjalankan `docker compose up -d`. Aman karena persistence aktif. |

Sintaks berkas Compose mengikuti referensi resmi.[^6] **Terverifikasi:** `docker compose config` mengurai berkas ini tanpa galat (dijalankan pada 27 Oktober 2026, Docker Compose v5.0.2). Itu hanya memeriksa sintaks Compose, bukan bahwa Redis berhasil start.

### Langkah 4: Jalankan dan buktikan pengguna ACL

**Lingkungan: terminal**

```bash
docker compose up -d
docker compose ps
docker compose logs redis
```

**Terverifikasi:** `docker compose ps` menampilkan `redis-katalog` berstatus `Up`, dan log memuat baris yang menyatakan server siap menerima koneksi tanpa galat soal berkas ACL atau konfigurasi.

Lalu masuk dan uji hak akses:

```bash
docker exec -it redis-katalog redis-cli
```

**Lingkungan: redis-cli**

```text
PING
AUTH api-katalog PASSWORD_API
SET katalog:uji 1
SET lain:uji 1
DEL katalog:uji
FLUSHALL
INFO
AUTH pemantau PASSWORD_PEMANTAU
PING
GET katalog:uji
INFO persistence
```

Kenapa: aturan yang tidak diuji hanyalah asumsi. Setiap baris membuktikan satu keputusan ACL.

**Terverifikasi:**

```text
(error) NOAUTH Authentication required.
OK
OK
(error) NOPERM No permissions to access a key
(integer) 1
(error) NOPERM User api-katalog has no permissions to run the 'flushall' command
(error) NOPERM User api-katalog has no permissions to run the 'info' command
OK
PONG
(error) NOPERM User pemantau has no permissions to run the 'get' command
# Persistence
aof_enabled:1
...
```

Cara membaca: `NOAUTH` karena pengguna `default` mati. Sebagai `api-katalog`, `SET` dan `DEL` pada `katalog:uji` berhasil, tetapi key di luar `katalog:*` ditolak, begitu pula `FLUSHALL` dan `INFO` (kategori `@dangerous`). Perintah `ACL ...` (mis. `ACL WHOAMI`) juga tidak diizinkan untuk pengguna ini karena tidak termasuk kategori yang diberikan. Sebagai `pemantau`, `PING` dan `INFO persistence` boleh, tetapi membaca data (`GET`) tidak. Teks galat `NOPERM` bergantung versi.

### Langkah 5: Jalankan API dengan pengguna `api-katalog`

**Lingkungan: terminal**

```bash
export REDIS_URL="redis://api-katalog:PASSWORD_API@localhost:6379/0"   # PowerShell: $env:REDIS_URL = "..."
fastapi dev main.py
```

Di terminal lain jalankan `python uji_katalog.py` (dari bab [Implementasi API](implementasi-api.md)).

Kenapa: ini membuktikan aplikasi cukup dengan hak `api-katalog`. Bila ada perintah yang kurang izinnya, API akan mengembalikan galat, dan itu justru temuan berharga.

**Terverifikasi:** keluaran sama dengan Langkah 6 bab Implementasi API (MISS lalu HIT, `banjir 8 permintaan: [200, 200, 200, 200, 429, 429, 429, 429]`, dan seterusnya), tanpa galat `NOPERM`.

### Langkah 6: Buktikan data bertahan setelah crash

**Lingkungan: terminal**

Tunggu minimal 2 detik setelah permintaan terakhir (agar `fsync` per detik sempat jalan), lalu:

```bash
docker kill redis-katalog
docker compose up -d
docker exec -it redis-katalog redis-cli
```

**Lingkungan: redis-cli**

```text
AUTH api-katalog PASSWORD_API
ZRANGE katalog:populer 0 -1 REV WITHSCORES
XLEN katalog:peristiwa
```

Kenapa: `docker kill` mengirim `SIGKILL`, mensimulasikan listrik padam. Bila persistence bekerja, peringkat dan Stream yang tanpa TTL kembali utuh setelah Redis hidup lagi. `docker compose up -d` memastikan container menyala (aman walau sudah dinyalakan ulang otomatis).

**Terverifikasi:**

```text
OK
1) "produk:1"
2) "7"
3) "produk:2"
4) "1"
(integer) 1
```

Cara membaca: peringkat dan jumlah peristiwa sama seperti sebelum `docker kill` (angkamu mengikuti permintaan yang kamu kirim). Key ber-TTL seperti `katalog:cache:*` mungkin sudah kedaluwarsa, dan itu wajar. Dengan `everysec`, perubahan dalam sekitar 1 detik terakhir sebelum crash bisa hilang.

### Langkah 7: Pantau kondisi Redis

**Lingkungan: redis-cli** (sebagai `pemantau`)

```text
AUTH pemantau PASSWORD_PEMANTAU
INFO memory
INFO stats
INFO persistence
SLOWLOG GET 5
DBSIZE
```

Kenapa: ini kumpulan pemeriksaan harian. Indikator yang layak diperhatikan untuk proyek ini:

| Indikator | Di mana | Arti dan tindakan |
|---|---|---|
| `used_memory_human` dibanding `maxmemory_human` | `INFO memory` | Mendekati batas berarti eviction akan terjadi; selidiki key besar ([Monitoring](../operasi/monitoring.md)). |
| `evicted_keys` | `INFO stats` | Naik berarti cache dibuang karena memori penuh. Wajar sesekali; naik terus berarti `maxmemory` terlalu kecil atau TTL terlalu panjang.[^2] |
| `keyspace_hits` dan `keyspace_misses` | `INFO stats` | Hit rate cache: `hits / (hits + misses)`.[^2] |
| `rejected_connections` | `INFO stats` | Server menolak klien karena batas koneksi. |
| `rdb_last_bgsave_status`, `aof_last_write_status`, `aof_last_bgrewrite_status` | `INFO persistence` | Semuanya harus `ok` ([Persistence](../operasi/persistence.md)). |
| `latest_fork_usec` | `INFO stats` | Lama `fork` terakhir; membesar bersama ukuran dataset. |
| Entri `SLOWLOG` | `SLOWLOG GET` | Perintah lambat; di proyek ini waspadai `ZRANGE` atau `XRANGE` pada rentang besar. |

**Terverifikasi:** bagian `INFO` yang terbaca dan `SLOWLOG GET 5` berupa daftar (mungkin kosong). Angkanya milik komputermu. Ambang peringatan (mis. memori di atas 80% batas) adalah **pilihanmu**, bukan aturan Redis.

### Langkah 8: Jalankan tes otomatis

**Lingkungan: terminal** · Kebutuhan: `pip install pytest fakeredis httpx`

Simpan berkas tes dari bagian "Contoh lengkap" sebagai `test_katalog.py` di folder proyek (satu folder dengan `main.py`), lalu:

```bash
python -m pytest -v test_katalog.py
```

Kenapa: tes ini menjalankan API di dalam proses Python dengan fakeredis, tanpa Docker, memakai `TestClient` bawaan FastAPI.[^5] Hasilnya cepat dan bisa dijalankan setiap kali kode berubah.

**Terverifikasi** (Python 3.14.7, pytest 9.1.1, fakeredis 2.40.0, 27 Oktober 2026):

```text
test_katalog.py::test_cache_miss_lalu_hit PASSED                         [ 11%]
test_katalog.py::test_ubah_harga_menghapus_cache_dan_menulis_peristiwa PASSED [ 22%]
test_katalog.py::test_batas_laju PASSED                                  [ 33%]
test_katalog.py::test_populer_dan_pengunjung PASSED                      [ 44%]
test_katalog.py::test_produk_tidak_ada_tidak_dihitung PASSED             [ 55%]
test_katalog.py::test_semua_key_berawalan_katalog PASSED                 [ 66%]
test_katalog.py::test_tanggal_tidak_valid_ditolak PASSED                 [ 77%]
test_katalog.py::test_last_event_id_tidak_valid PASSED                   [ 88%]
test_katalog.py::test_id_klien_ipv6_tidak_memuat_titik_dua PASSED        [100%]

============================== 9 passed in 0.51s ==============================
```

Cara membaca: sembilan tes lolos. Untuk memastikan tes itu bukan sekadar "hijau", kami juga merusak satu baris sengaja (menonaktifkan `await r.delete(kunci.cache_produk(produk_id))` di `PUT`); tes `test_ubah_harga_menghapus_cache_dan_menulis_peristiwa` gagal dengan `assert 1 == 0`, lalu lolos lagi setelah baris dikembalikan. Coba sendiri pada Latihan 3.

### Langkah 9: Bersihkan

**Lingkungan: terminal**

Hentikan server FastAPI (`Ctrl+C`), lalu:

```bash
docker compose down
```

!!! danger "Jangan tambahkan `-v` sebelum yakin"
    `docker compose down` menghapus container tetapi **mempertahankan volume** `redis-data` (nama sebenarnya diberi awalan nama folder proyek, mis. `ah_redis-data`; lihat `docker volume ls`), jadi data persistence tetap ada. `docker compose down -v` juga menghapus volume dan **semua data permanen** (peringkat, Stream, `dump.rdb`, AOF). Pakai `-v` hanya bila kamu memang ingin membuang semuanya.

## Contoh lengkap

Berkas tes lengkap. Letakkan di folder proyek bersama `main.py`, `kunci.py`, dan `sumber.py`.

**Lingkungan: Python** · Kebutuhan: Python 3, `fastapi[standard]`, `redis`, `pytest`, `fakeredis`, `httpx`

```python title="test_katalog.py"
from types import SimpleNamespace

import fakeredis
import pytest
import redis.asyncio as redis
from fastapi.testclient import TestClient

import kunci
import main
import sumber


@pytest.fixture
def lingkungan(monkeypatch):
    server = fakeredis.FakeServer()  # satu "Redis" palsu baru untuk setiap tes
    monkeypatch.setattr(
        redis,
        "from_url",
        lambda *a, **k: fakeredis.FakeAsyncRedis(server=server, decode_responses=True),
    )
    monkeypatch.setattr(sumber, "LATENSI", 0)
    monkeypatch.setattr(main, "BATAS", 100)
    monkeypatch.setitem(sumber._PRODUK[1], "harga", 45000)
    sumber.PANGGILAN["jumlah"] = 0
    periksa = fakeredis.FakeRedis(server=server, decode_responses=True)
    with TestClient(main.app) as klien:
        yield klien, periksa


def test_cache_miss_lalu_hit(lingkungan):
    klien, _ = lingkungan
    pertama = klien.get("/produk/1")
    kedua = klien.get("/produk/1")
    assert pertama.headers["x-cache"] == "MISS"
    assert kedua.headers["x-cache"] == "HIT"
    assert sumber.PANGGILAN["jumlah"] == 1


def test_ubah_harga_menghapus_cache_dan_menulis_peristiwa(lingkungan):
    klien, periksa = lingkungan
    klien.get("/produk/1")
    assert periksa.exists(kunci.cache_produk(1)) == 1

    assert klien.put("/produk/1/harga", json={"harga": 47000}).status_code == 200

    assert periksa.exists(kunci.cache_produk(1)) == 0
    entri = periksa.xrange(kunci.peristiwa())
    assert len(entri) == 1
    assert entri[0][1] == {"produk": "1", "jenis": "harga", "nilai": "47000"}
    assert klien.get("/produk/1").json()["harga"] == 47000


def test_batas_laju(lingkungan, monkeypatch):
    monkeypatch.setattr(main, "BATAS", 3)
    klien, _ = lingkungan
    respons = [klien.get("/produk/1") for _ in range(5)]
    assert [r.status_code for r in respons] == [200, 200, 200, 429, 429]
    assert int(respons[-1].headers["retry-after"]) >= 1


def test_populer_dan_pengunjung(lingkungan):
    klien, periksa = lingkungan
    for jalur in ("/produk/1", "/produk/1", "/produk/2"):
        klien.get(jalur)
    assert klien.get("/populer?jumlah=2").json() == [
        {"produk_id": 1, "dilihat": 2},
        {"produk_id": 2, "dilihat": 1},
    ]
    assert klien.get(f"/pengunjung/{main.hari_ini()}").json()["perkiraan"] == 1
    assert periksa.ttl(kunci.pengunjung(main.hari_ini())) > 0


def test_produk_tidak_ada_tidak_dihitung(lingkungan):
    klien, periksa = lingkungan
    assert klien.get("/produk/999").status_code == 404
    assert periksa.zcard(kunci.populer()) == 0


def test_semua_key_berawalan_katalog(lingkungan):
    klien, periksa = lingkungan
    klien.get("/produk/1")
    klien.put("/produk/1/harga", json={"harga": 46000})
    klien.get("/populer")
    semua = periksa.keys("*")
    assert semua
    assert all(k.startswith("katalog:") for k in semua)


def test_tanggal_tidak_valid_ditolak(lingkungan):
    klien, _ = lingkungan
    assert klien.get("/pengunjung/2026-10-27").status_code == 422


def test_last_event_id_tidak_valid(lingkungan):
    klien, _ = lingkungan
    assert klien.get("/aliran", headers={"Last-Event-ID": "bukan-id"}).status_code == 400


def test_id_klien_ipv6_tidak_memuat_titik_dua():
    permintaan = SimpleNamespace(client=SimpleNamespace(host="::1"))
    assert main.id_klien(permintaan) == "--1"
```

Penjelasan baris penting:

| Baris | Penjelasan |
|---|---|
| `fakeredis.FakeServer()` | Satu "server" palsu per tes, sehingga data satu tes tidak bocor ke tes lain. |
| `monkeypatch.setattr(redis, "from_url", ...)` | Mengganti pembuat klien Redis, sehingga `lifespan` di `main.py` memakai fakeredis tanpa mengubah kode aplikasi. |
| `monkeypatch.setattr(sumber, "LATENSI", 0)` | Menghilangkan jeda 0,5 detik database simulasi agar tes cepat. |
| `monkeypatch.setitem(sumber._PRODUK[1], "harga", 45000)` | Mengembalikan harga awal untuk setiap tes; `monkeypatch` memulihkannya setelah tes. |
| `periksa = fakeredis.FakeRedis(server=server, ...)` | Klien sinkron ke server palsu yang sama, untuk memeriksa isi Redis langsung (key, TTL, Stream). |
| `with TestClient(main.app)` | Menjalankan aplikasi termasuk `lifespan`, lalu membersihkannya. |
| `test_batas_laju` | Menurunkan `BATAS` menjadi 3 agar pembuktian `429` singkat. |
| `test_semua_key_berawalan_katalog` | Menjaga aturan penamaan: tak ada key liar di luar `katalog:*`, yang juga dasar pola ACL `~katalog:*`. |

Cara menjalankan: `python -m pytest -v test_katalog.py`. Hasil yang diharapkan sama dengan Langkah 8.

## Kesalahan umum dan troubleshooting

| Gejala | Penyebab dan solusi |
|---|---|
| Redis langsung berhenti saat start | Periksa `docker compose logs redis`. Penyebab umum: pengguna didefinisikan di `redis.conf` **dan** `aclfile` (ditolak),[^4] hash di `users.acl` bukan 64 heksadesimal huruf kecil,[^3] atau berkas tidak bisa dibaca proses container (beri izin baca, mis. `chmod 644`). |
| `NOAUTH Authentication required` dari API | `REDIS_URL` tidak memuat pengguna dan password. Pengguna `default` sengaja dimatikan. |
| `WRONGPASS` | Password tidak cocok dengan hash di `users.acl`. Hash dihitung dari password persis (tanpa spasi atau baris baru), dan `AUTH` harus memakai pengguna yang benar. |
| API membalas `500` dengan `NOPERM` | Ada perintah baru yang tak diizinkan `api-katalog`. Tambahkan izin yang paling sempit (lihat Latihan 1), jangan `+@all`. |
| `OOM command not allowed when used memory > 'maxmemory'` | Memori penuh dan tidak ada key ber-TTL yang bisa dibuang, sehingga `volatile-lru` bertindak seperti `noeviction`.[^2] Naikkan `maxmemory`, kurangi data tanpa TTL (mis. pangkas `katalog:populer`), atau pisahkan data permanen ke instans lain. |
| Data hilang setelah `docker compose down -v` | Opsi `-v` menghapus volume `redis-data`. Pulihkan dari cadangan RDB ([Persistence](../operasi/persistence.md)). |
| Peringkat berkurang sedikit setelah `docker kill` | `appendfsync everysec` bisa kehilangan sekitar 1 detik terakhir. Pakai `always` bila tak bisa menerima itu, dengan konsekuensi performa. |
| Pengaturan `CONFIG SET` hilang setelah restart | Tulis pengaturan permanen di `redis.conf`; `CONFIG SET` hanya untuk server yang berjalan. |
| `ModuleNotFoundError: No module named 'main'` saat `pytest` | Jalankan `pytest` dari folder proyek (satu folder dengan `main.py`). |
| Tes hijau tetapi produksi gagal | Tes fakeredis tidak membuktikan ACL, persistence, eviction, atau performa. Jalankan juga pengujian pada Redis asli (Langkah 4 sampai 7). |
| Tes saling memengaruhi | Status bersama (`PANGGILAN`, harga, server palsu) tidak direset. Gunakan fixture seperti `lingkungan`. |

!!! note "Status verifikasi"
    Perintah, nilai balik, dan skrip di bab ini dijalankan di Redis 8.10.3 (`redis:latest`) pada 2026-10-27, dengan Python 3.12.3 dan redis-py 8.1.0, FastAPI 0.162.0, Uvicorn 0.54.0, pytest 9.1.1, fakeredis 2.40.0. Sintaks juga dicocokkan dengan dokumentasi resmi Redis. Nilai yang berubah tiap eksekusi (ID, TTL, waktu, urutan, alamat IP) bisa berbeda di komputermu, dan teks galat bisa berbeda antarversi. Tampilan prompt interaktif `redis-cli` (prompt, Tab, riwayat) tidak teramati karena pengujian berjalan tanpa terminal interaktif.

## Latihan

1. Tambahkan pengguna `operator` (hak penuh, `~* &* +@all`, password dan hash baru) di `users.acl` untuk keperluan administrasi, lalu pakai `ACL LOG` untuk melihat penolakan yang dialami `api-katalog` di Langkah 4. Kenapa akun ini tidak boleh dipakai aplikasi?
2. Sebelum menjalankan: bila `maxmemory-policy` diganti `allkeys-lru`, data apa yang bisa terbuang selain cache? Apa dampaknya pada peringkat dan Stream?
3. Nonaktifkan baris `await r.delete(kunci.cache_produk(produk_id))` di `main.py`, jalankan `pytest`, dan catat tes yang gagal. Kembalikan barisnya.
4. Tambahkan tes baru yang menulis tiga entri ke Stream lewat `PUT`, lalu memeriksa `xrange` hanya mengembalikan entri sesudah ID tertentu. Fixture mana yang kamu pakai ulang?
5. Tulis daftar periksa rilis satu halaman untuk proyek ini (persistence, ACL, monitoring, tes) dengan satu perintah pembuktian untuk setiap butir.

??? success "Petunjuk"
    1. `ACL LOG` termasuk kategori `@admin` dan `@dangerous`, jadi hanya pengguna dengan izin luas yang bisa menjalankannya.
    2. Kebijakan `allkeys-*` boleh membuang key apa pun, termasuk yang tanpa TTL.
    3. Cari tes yang memeriksa `exists(kunci.cache_produk(1)) == 0`.
    4. Pakai `monkeypatch` dan `periksa.xrange(kunci.peristiwa(), min="(<ID>")` untuk batas eksklusif.
    5. Gunakan hasil Langkah 4 sampai 8 sebagai butir pembuktian.

## Ringkasan

- Redis proyek ditentukan oleh `docker-compose.yml`, `redis.conf`, `users.acl`, dan satu volume, sehingga bisa dibuat ulang dengan satu perintah.
- Persistence RDB dan AOF di volume membuat data permanen (peringkat, Stream) bertahan setelah crash; `docker kill` membuktikannya. Hanya sekitar 1 detik terakhir yang berisiko bila memakai `everysec`.
- `volatile-lru` cocok untuk campuran cache dan data permanen, tetapi bertindak seperti `noeviction` bila tak ada key ber-TTL yang bisa dibuang.
- ACL: pengguna `default` dimatikan, `api-katalog` dibatasi `~katalog:*` tanpa `@dangerous`, dan `pemantau` hanya bisa melihat kondisi server. Buktikan dengan perintah yang sengaja ditolak.
- Tes otomatis dengan fakeredis cepat dan membuktikan logika aplikasi, tetapi tidak membuktikan ACL, persistence, atau eviction; itu perlu uji pada Redis asli.

Proyek akhir selesai: kamu sudah merancang, membangun, mengamankan, memantau, dan menguji aplikasi Redis dari awal sampai akhir.

## Referensi resmi

[^1]: Redis, *Redis persistence*: <https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/>
[^2]: Redis, *Key eviction*: <https://redis.io/docs/latest/develop/reference/eviction/>
[^3]: Redis, *ACL*: <https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/>
[^4]: Redis, `redis.conf` (8.0): <https://raw.githubusercontent.com/redis/redis/8.0/redis.conf>
[^5]: FastAPI, *Testing*: <https://fastapi.tiangolo.com/tutorial/testing/>
[^6]: Docker, *Compose file reference*: <https://docs.docker.com/reference/compose-file/>

Bacaan tambahan: [pytest](https://docs.pytest.org/en/stable/), [fakeredis](https://fakeredis.readthedocs.io/), [`ACL LOG`](https://redis.io/docs/latest/commands/acl-log/).
