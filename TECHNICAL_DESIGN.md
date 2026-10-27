# Technical Design: Belajar Redis

Berdasarkan `PRD.md` · Diperbarui: 2026-10-27

## 1. Arsitektur dan dependensi

Alur: Markdown (`docs/`) → MkDocs 1.6 → tema Material → `site/` → GitHub Pages (branch `gh-pages` lewat `mkdocs gh-deploy`).

`requirements.txt`:

```
mkdocs>=1.6,<2
mkdocs-material>=9.5,<10
pymdown-extensions>=10.8,<13
```

Rentang versi (bukan pin tepat) agar versi yang sudah diuji tidak dipaksa naik dan MkDocs 2 tidak masuk. Pygments, Markdown, dan Jinja2 ikut sebagai dependensi turunan. Plugin hanya `search` bawaan. Lingkungan: `.venv` lokal (`.venv/` ada di `.gitignore`).

## 2. Konfigurasi `mkdocs.yml`

Urutan bagian: identitas situs → `theme` → `nav` → `plugins` → `markdown_extensions` → `extra_css`/`extra_javascript` → `validation`.

- Identitas: `site_name: Belajar Redis`, `site_description`, `site_url` (kanonis, dipakai sitemap dan tautan). `repo_url`, `repo_name`, dan `edit_uri` **tidak diisi**, sehingga header tidak menampilkan tautan GitHub dan browser tidak memanggil `api.github.com`.
- `validation` bernilai `warn` untuk `omitted_files`, `absolute_links`, `unrecognized_links`, dan `anchors`; dengan `--strict`, semuanya menggagalkan build. Akibatnya setiap file di `docs/` harus ada di `nav`, dan setiap entri `nav` harus menunjuk file yang ada.
- `exclude_docs` mengecualikan `redis/_template-bab.md` (template bab sesuai `CLAUDE.md`) agar tidak terbit dan tidak memicu peringatan "tidak ada di nav" pada `--strict`.
- `--strict` diberikan lewat CLI, bukan di file konfigurasi, agar `serve` tetap longgar.
- `examples/` berada di luar `docs_dir`; hanya terbit jika disisipkan lewat snippet.

## 3. Tema

```yaml
theme:
  name: material
  language: id
  font: false
  features:
    - navigation.indexes
    - navigation.path
    - navigation.footer
    - navigation.top
    - navigation.tracking
    - toc.follow
    - search.highlight
    - search.suggest
    - content.code.copy
    - content.code.annotate
    - content.tabs.link
```

- `language: id` menerjemahkan teks antarmuka (pencarian, navigasi).
- `navigation.sections` **tidak** diaktifkan. Tanpa fitur itu, grup `nav` level atas di sidebar bisa dibuka dan ditutup. Dengan fitur itu, grup tampil sebagai judul statis yang selalu terbuka.
- `content.action.edit` tidak diaktifkan karena membutuhkan `repo_url`.
- `navigation.instant` tidak diaktifkan.
- Palet tiga keadaan (System, Light, Dark) memakai konfigurasi `palette` bawaan Material, tanpa pengalih buatan sendiri. Pilihan disimpan Material di `localStorage`.

## 4. Ekstensi Markdown

`admonition`, `attr_list`, `def_list`, `footnotes`, `md_in_html`, `tables`, `toc` (`permalink`), `pymdownx.arithmatex` (generic), `pymdownx.betterem`, `pymdownx.details`, `pymdownx.emoji`, `pymdownx.highlight`, `pymdownx.inlinehilite`, `pymdownx.keys`, `pymdownx.mark`, `pymdownx.snippets` (`base_path: [examples]`, `check_paths: true`), `pymdownx.superfences` (fence `mermaid`), `pymdownx.tabbed` (`alternate_style`), `pymdownx.tasklist`.

Yang dipakai bab saat ini: admonition (`!!!`), details (`???`), footnotes, tables, superfences (kode dan Mermaid), highlight. Sisanya tersedia untuk bab berikutnya (tab, snippet, rumus).

## 5. CSS dan JavaScript

- `docs/stylesheets/extra.css`: lebar konten, jarak baris, fokus terlihat, zebra tabel, gulir horizontal untuk rumus panjang, `prefers-reduced-motion`. Warna hanya lewat `var(--md-*)`.
- `docs/javascripts/mermaid-config.js`: membungkus `mermaid.initialize` (Material memanggilnya sendiri) untuk `securityLevel: "strict"`, `suppressErrorRendering: true`, dan `themeCSS` berbasis variabel tema.
- `docs/javascripts/mathjax.js`: konfigurasi MathJax dan hook `document$` untuk typeset ulang.
- Mermaid 11.17.2 disertakan di `docs/assets/vendor/mermaid/` (lisensi dan `VERSION.txt` menyertainya), dimuat sebelum skrip MathJax. Diagram dipakai di bab 1 dan 2.
- MathJax 3.2.2 dimuat dari `cdn.jsdelivr.net`. Skrip ini tetap dimuat di setiap halaman walau bab saat ini belum memakai rumus; menghapusnya adalah keputusan terpisah yang mengubah konfigurasi bersama.

## 6. Konvensi konten

- Satu judul `#` per halaman; file kebab-case; folder per bagian. Daftar bab di `nav` dibuat eksplisit. Setiap bagian punya `index.md` sebagai halaman pembuka, dibuat bersama bab pertamanya dan ditaruh paling atas di `nav` (aturan di `CLAUDE.md`, bagian Section Index Rules).
- Kerangka bab mengikuti `CLAUDE.md`: tujuan belajar, prasyarat, konsep, praktik langkah demi langkah, kesalahan umum atau troubleshooting, latihan, ringkasan, referensi resmi.
- Referensi resmi sebagai footnote. Tautan antarbab relatif (`bab.md`); tautan ke bab yang belum ada ditulis sebagai teks biasa agar `--strict` lolos.
- Output perintah ditandai "diharapkan" sampai diuji di Redis nyata.

## 7. Alur kerja lokal dan deploy

```
python -m venv .venv
.venv\Scripts\Activate.ps1      # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve                    # http://127.0.0.1:8000
mkdocs build --strict           # pemeriksaan sebelum rilis
mkdocs gh-deploy --strict       # belum pernah dijalankan
```

Jalur aset relatif sehingga situs berjalan di sub-path GitHub Pages. Pages diarahkan ke branch `gh-pages`.

## 8. Strategi validasi

| Pemeriksaan | Alat |
|---|---|
| Build bersih | `mkdocs build --strict`, exit code dan keluaran |
| Tautan dan nav | validasi strict (`validation`) |
| Render | periksa HTML hasil build: tidak ada sisa `!!!`, `???`, `[^`; footnote dan admonition muncul |
| Struktur bab | tinjauan terhadap standar `CLAUDE.md` |
| Akurasi perintah | cocokkan dengan halaman perintah di redis.io |
| Keteruji | jalankan perintah di Redis nyata (`TASK_VERIFIKASI_DOCKER.md`) |
| Tampilan | browser: sidebar, diagram, tema, lebar ponsel |

Apa yang sudah dan belum dijalankan dicatat di `VALIDATION_REPORT.md`.
