# Farha Rewards — Template Loyalty PWA

Kad loyalti digital (cap + point + ganjaran) dalam gaya **Bento Glass Frost**, tema **merah & putih Farha**.
Ditulis sepenuhnya dalam **HTML, CSS dan JavaScript vanilla**, dalam satu fail `index.html`. Tiada framework dan tiada langkah build.

## Ciri-ciri
- **Splash screen beranimasi**: huruf "f" muncul, zoom, kemudian logo penuh **farha** terbuka dengan percikan dari cawan.
- **5 skrin**: Home · Order · Cap & Point · Ganjaran · Profil, dengan bottom nav berbentuk pil.
- **Kod QR ahli yang boleh diimbas betul-betul**, dijana dalam JS tanpa library (format: `FARHA:<memberId>`).
- **Kad cap 10 petak**: bila penuh, petak hadiah boleh ditekan untuk tebus minuman percuma.
- **Tebus ganjaran**: point ditolak, keluar kod baucar 6 aksara dengan pemasa 10 minit, dan animasi konfeti.
- **Tahap ahli** (Silver / Gold / Platinum) ikut jumlah point terkumpul.
- **PWA**: boleh dipasang ke skrin utama (Android & iOS) dan dibuka luar talian melalui service worker.
- **Mod demo**: butang "Simulasi pembelian" dan "Set semula data". Data disimpan dalam `localStorage`.

## Order pickup (baharu)
Pelanggan boleh order terus dari app dan ambil di kaunter, macam app kopi berantai.
- **Tab Order** dalam bottom nav: pilih cawangan, kategori menu (Popular, Kopi, Bukan Kopi, Teh, Pastri) dan item.
- **Pilih minuman**: suhu, saiz, kemanisan, tambahan (extra shot, susu oat), nota untuk barista dan kuantiti.
- **Troli & bayar**: ambil secepat mungkin atau jadualkan masa, edit kuantiti, **guna ganjaran loyalti semasa checkout** (Diskaun RM5, Minuman Percuma), pilih cara bayar: **Tunai di kaunter** atau **QR DuitNow** (pelanggan imbas QR kedai, bayar, kemudian **wajib muat naik screenshot resit** sebelum pesanan dihantar).
- **Status pesanan**: nombor pesanan, bar progres (Dihantar → Disediakan → Siap diambil), anggaran masa siap, kod QR pickup dan notifikasi bila pesanan siap.
- Order dalam app dapat **2× point** (boleh ubah). Point & cap dikreditkan bila staf tandakan pesanan "Sudah diambil".

**Admin → Pesanan** (`admin.html`):
- Papan 3 lajur: **Baru → Sedang disediakan → Siap diambil**, dengan bunyi "ding" dan lencana bila pesanan baru masuk.
- Butang Terima / Tolak / Tanda siap / Sudah diambil. Tolak pesanan akan memulangkan point ganjaran yang digunakan.
- Pesanan DuitNow ditanda **"semak bukti"**. Staf buka pesanan, lihat gambar bukti, semak duit masuk dalam app bank kedai, kemudian tekan **Sahkan bayaran** atau **Bukti tidak sah** (pelanggan diminta hantar bukti baru atau bayar di kaunter). Pesanan tunai: tekan **Terima tunai & serah** bila pelanggan ambil.
- Suis **Terima pesanan** (tutup sementara bila sibuk), dan **Menu & stok** untuk tanda item habis.
- Di **Kaunter**, imbas QR pesanan atau taip no. pesanan (cth. `F-101`) untuk buka pesanan.
- **Tetapan**: anggaran masa sediakan dan gandaan point order app.

**QR DuitNow kedai:** simpan gambar QR DuitNow kedai sebagai `icons/duitnow-qr.png` (atau tukar `CONFIG.order.duitnowQr`) dan isi `CONFIG.order.duitnowName`.

Ubah menu, harga (harga dalam template ialah contoh), cawangan dan pilihan minuman dalam `CONFIG.store`, `CONFIG.menu`, `CONFIG.categories` dan `OPTION_SETS` dalam `index.html`. Demo tanpa admin: tekan "Demo: simulasi kedai proses pesanan" pada skrin status.

> Untuk produksi: sambung pesanan ke backend (cth. Firebase) supaya pesanan sampai ke tablet kedai. Dalam mod demo, pesanan disimpan dalam `localStorage` (`farha-orders-v1`).

## Log masuk (no. telefon + password)
- Skrin **Log masuk / Daftar** selepas splash. Pelanggan guna **no. telefon Malaysia** (cth. `012-345 6789`) dan **password** (minimum 6 aksara).
- Firebase Authentication guna **e-mel + password**, jadi no. telefon ditukar kepada e-mel dalaman: `60123456789@phone.farha.app` (ubah domain di `CONFIG.auth.emailDomain`). Pelanggan tidak nampak e-mel ini.
- **ID ahli = no. telefon** (cth. `60123456789`), jadi staf boleh cari ahli di kaunter dengan no. telefon.
- **Mod demo** (`CONFIG.firebase = null`): akaun disimpan dalam peranti. Akaun demo: `012-345 6789` / `demo123`.
- **Sambung Firebase:** di Firebase console, hidupkan *Authentication → Sign-in method → Email/Password*, daftar web app, kemudian tampal `firebaseConfig` ke `CONFIG.firebase` dalam `index.html`. Tambah domain hosting anda di *Authentication → Settings → Authorized domains*.
- **Lupa password:** e-mel dalaman tidak boleh terima e-mel reset, jadi pelanggan diminta hubungi kedai. Staf/owner reset password di Firebase console (*Authentication → Users*).
- Nota: buat masa ini Firebase digunakan untuk log masuk sahaja. Point, cap dan pesanan masih disimpan dalam peranti sehingga Firestore disambung.

## Menu (admin → Menu)
- **Tambah, edit dan buang item jualan**: nama, penerangan, harga, kategori, gambar (dimampatkan), pilihan untuk pelanggan (kopi / susu / teh / pastri / tiada), lencana (cth. TERLARIS), Popular, dapat cap, dan suis **Dijual dalam app**.
- **Varian & Add-on** (tab dalam skrin Menu): bina sendiri kumpulan pilihan dan sambungkan ke item.
  - **Varian** = pelanggan pilih satu (wajib), cth. Saiz: Biasa / Besar +RM2.00. Tetapkan pilihan asal.
    - **Cara kira harga varian**: *Tambah pada harga item* (masukkan beza harga sahaja, cth. item RM12, Besar +RM2 = RM14) atau *Harga penuh* (harga pilihan menggantikan harga item, cth. Biasa RM12, Besar RM14). Jika semua pilihan ada harga dalam mod tambah, admin akan ditanya sama ada mahu tukar ke harga penuh supaya harga tidak jadi berganda.
  - **Add-on** = pelanggan boleh pilih banyak, setiap satu dengan harga, cth. Extra shot +RM2.00. Boleh hadkan bilangan maksimum.
  - Sambung ke item dari skrin varian/add-on (butang **Semua minuman**) atau dari skrin edit item.
- Suis **Ada stok** untuk tanda item habis sementara. Perubahan terus muncul dalam app pelanggan.
- Menu asal dalam `CONFIG.menu` hanya dimasukkan kali pertama app dibuka. Selepas itu menu diurus di admin.

## Notifikasi push
- **Pelanggan**: notifikasi bila pesanan diterima, siap, selesai, dibatalkan, bayaran DuitNow disahkan atau bukti ditolak. Hidupkan dari skrin status pesanan atau Profil → Notifikasi push.
- **Admin**: notifikasi bila pesanan baru masuk atau pelanggan hantar semula bukti DuitNow. Tekan **Hidupkan notifikasi** di skrin Pesanan.
- Klik notifikasi membuka app di pesanan berkenaan.
- **Had mod demo**: notifikasi keluar bila app/tab terbuka di latar belakang (pelayar yang sama). Untuk notifikasi bila app **ditutup sepenuhnya** dan antara peranti, sambung **Firebase Cloud Messaging** (service worker `sw.js` sudah ada pengendali `push`) dengan Cloud Function yang menghantar push bila status pesanan berubah. iPhone: notifikasi web hanya untuk app yang dipasang ke skrin utama (iOS 16.4+).

## Admin dashboard (`admin.html`, demo)
Buka `/admin` atau `admin.html` dan masukkan PIN demo **1234**.
- **Ringkasan**: KPI (ahli, pembelian hari ini, point dikeluarkan, tebusan), carta pembelian 14 hari, ganjaran popular, aktiviti terkini dan ahli teratas.
- **Kaunter**: imbas QR pelanggan dengan kamera (BarcodeDetector, atau jsQR sebagai fallback) atau taip ID ahli. Kemudian rekod pembelian (+cap, +point), tebus kad cap penuh, tebus ganjaran, dan sahkan kod baucar.
- **Ahli**: cari, tapis ikut tahap, susun. Lihat butiran dan sejarah, laraskan point, eksport CSV.
- **Ganjaran**: tambah, edit, padam, aktif/sembunyi, dan pilih ganjaran utama. Perubahan terus muncul dalam app pelanggan.
- **Tetapan**: bilangan cap untuk minuman percuma dan point setiap minuman.

**Segerak demo:** admin dan app pelanggan berkongsi `localStorage` dalam pelayar yang sama. Buka `index.html` dan `admin.html` dalam dua tab sebelah-menyebelah. Cap yang ditambah di kaunter terus muncul dalam app pelanggan, dan baucar yang disahkan staf terus bertukar jadi "✓ Telah ditebus di kaunter". Ahli lain dalam dashboard adalah data contoh. Untuk segerak antara peranti, sambung ke Firebase.

## Struktur
```
index.html             ← app pelanggan: SEMUA UI, CSS & JS (logo dibenam base64)
admin.html             ← dashboard admin & kaunter staf (satu fail, demo)
vercel.json            ← laluan /admin
manifest.webmanifest   ← maklumat PWA (nama, warna, ikon)
sw.js                  ← service worker (cache luar talian)
icons/                 ← ikon app + logo Farha (PNG)
```

## Jalankan
Service worker hanya berfungsi melalui `http://localhost` atau `https://`:
```bash
python3 -m http.server 8080
# buka http://localhost:8080
```
Untuk deploy, muat naik folder ini ke mana-mana hosting statik (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

## Jadikan untuk kedai lain (template)
1. **Warna**: ubah pemboleh ubah `:root` di bahagian atas `<style>` (`--brand`, `--brand-2`, `--brand-deep`, `--blob-*`).
2. **Data & ganjaran**: ubah objek `CONFIG` di bahagian atas `<script>`, termasuk nama brand, sasaran cap, senarai ganjaran, tahap ahli dan pengguna demo.
3. **Logo**: ganti `data:image/png;base64,...` pada `<img class="wm">` dalam splash dengan wordmark putih (PNG lutsinar) anda, dan ganti fail dalam `icons/`.
   - Animasi splash memaparkan ~16% bahagian kiri logo dahulu (huruf pertama). Laraskan `clip-path:inset(0 84% 0 0)` dan `translateX(42%)` dalam `.sp-slide` jika huruf pertama logo anda lebih lebar atau lebih sempit.
4. **Manifest**: kemas kini `name`, `short_name` dan `theme_color` dalam `manifest.webmanifest`.
5. Naikkan `VERSION` dalam `sw.js` setiap kali anda deploy versi baru.

## Sambung ke backend
Template ini menyimpan data secara tempatan sahaja. Untuk produksi, gantikan fungsi `load()`, `save()`, `doRedeem()` dan `demoBuy()` dengan panggilan API ke backend anda (contohnya Firebase atau Supabase), dan buang bahagian "mod demo" di skrin Profil.
