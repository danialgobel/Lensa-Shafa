# LENSA SHAFA | Platform Portofolio & Informasi Layanan Dokumentasi Umroh Premium

Website ini dirancang secara khusus untuk mempermudah klien **Lensa Shafa** dalam menjelajahi karya portofolio video sinematik, melihat galeri foto profesional di Tanah Suci (Haramain), meninjau rincian paket harga (pricelist) secara interaktif, serta melakukan pemesanan layanan dokumentasi secara langsung.

Tujuan utama platform ini adalah menghadirkan representasi visual yang mewah dan premium, memudahkan calon jemaah dalam merencanakan dokumentasi perjalanan ibadah spiritual mereka dengan Lensa Shafa.

---

## ✨ Fitur Utama Website

1. **Premium Cinematic Portfolio Showcase**
   - Integrasi video sinematik terbaik dengan pemutar video portrait (9:16) yang responsif dan disesuaikan dinamis untuk kenyamanan tampilan di HP tanpa garis hitam (black bars).
   - Dilengkapi spinner loading indikator dan tombol unduh langsung yang andal.

2. **Frame-Frame Sinematik (Interactive Gallery)**
   - Galeri foto dokumentasi perjalanan ibadah di Mekkah & Madinah dengan efek hover premium.
   - Sistem **Unified Lightbox Gallery** yang responsif, mendukung navigasi swipe gestur di layar sentuh HP dan tombol keyboard untuk kenyamanan menjelajah foto.

3. **Pricelist & Paket Interaktif**
   - Informasi paket harga (Single, Couple, Family Package) dengan efek interaksi sentuh (active state).
   - Tombol **"Pesan Sekarang"** yang terintegrasi secara otomatis ke WhatsApp Admin dengan format teks pemesanan tebal (`*Single Package*`, dll.) sesuai kartu harga yang diklik.
   - Fitur **Pricelist Fullscreen Lightbox** untuk memperbesar selebaran harga resmi dengan resolusi tinggi.

4. **Cinematic Background Audio (Mobile & iOS Fix)**
   - Lagu pengiring bernuansa syahdu yang dipotong (trimmed) presisi untuk langsung berbunyi di detik ke-52 secara instan.
   - Implementasi **Web Audio API (`AudioContext` & `GainNode`)** untuk menghasilkan transisi *fade-in* (saat mulai) dan *fade-out* (saat jeda) volume yang sangat halus. Metode ini terbukti andal mengatasi pembatasan volume programmatic dari browser Apple iOS Safari.

5. **Premium Smooth Scroll & Ultra-Responsive Design**
   - Navigasi halaman yang mengalir sangat mulus dan mewah berkat integrasi **Lenis Smooth Scroll**.
   - Desain layout yang sepenuhnya responsif, optimal diakses baik dari desktop, tablet, maupun berbagai ukuran layar ponsel pintar.

---

## 🛠️ Teknologi & Library yang Digunakan

* **Core**: HTML5 (Semantic Markup) & Vanilla JavaScript (ES6+)
* **Styling**: Modern CSS3 (Custom Properties & Flexbox/Grid Layout)
* **Smooth Scrolling**: [Lenis Scroll Library v1.1.13](https://github.com/darkroomengineering/lenis)
* **Audio Engine**: Web Audio API (untuk manipulasi gain volume pada iOS)
* **Typography**: Google Fonts (Cinzel, Playfair Display, & Inter)

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

Jika Anda ingin menjalankan atau menguji proyek ini di komputer lokal:

1. Clone repositori ini:
   ```bash
   git clone https://github.com/danialgobel/Lensa-Shafa.git
   ```
2. Masuk ke direktori proyek:
   ```bash
   cd Lensa-Shafa
   ```
3. Jalankan menggunakan web server lokal pilihan Anda (misalnya menggunakan extension Live Server di VSCode atau `http-server` via NodeJS):
   ```bash
   npx http-server -p 8080 -c-1 --cors
   ```
4. Buka browser dan akses alamat `http://localhost:8080`.
