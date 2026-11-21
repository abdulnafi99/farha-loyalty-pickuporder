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
- **Mod demo**: butang "Simulasi pembelian" dan "Set semula data". Data disimpan dalam `localStorage`. Bila `CONFIG.firebase` diisi, semua alat demo disorok (pelanggan tidak boleh beri point kepada diri sendiri) dan ahli contoh tidak dijana di admin.
- **Admin → Tetapan → Buang ahli & transaksi contoh**: buang data palsu sahaja; menu, varian, promosi, pesanan dan tetapan tidak disentuh.

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

**QR DuitNow kedai & WhatsApp support:** admin → Tetapan → **Pembayaran & sokongan**. Muat naik gambar QR DuitNow (tiada QR = pilihan DuitNow dimatikan dalam app) dan isi no. WhatsApp support. Butang WhatsApp keluar di Profil, skrin status pesanan, info cawangan dan helaian DuitNow; kosongkan nombor untuk sembunyi.

Ubah menu, harga (harga dalam template ialah contoh), cawangan dan pilihan minuman dalam `CONFIG.store`, `CONFIG.menu`, `CONFIG.categories` dan `OPTION_SETS` dalam `index.html`. Demo tanpa admin: tekan "Demo: simulasi kedai proses pesanan" pada skrin status.

> Untuk produksi: sambung pesanan ke backend (cth. Firebase) supaya pesanan sampai ke tablet kedai. Dalam mod demo, pesanan disimpan dalam `localStorage` (`farha-orders-v1`).

## Log masuk (no. telefon + password)
- Skrin **Log masuk / Daftar** selepas splash. Pelanggan guna **no. telefon Malaysia** (cth. `012-345 6789`) dan **password** (minimum 6 aksara).
- Firebase Authentication guna **e-mel + password**, jadi no. telefon ditukar kepada e-mel dalaman: `60123456789@phone.farha.app` (ubah domain di `CONFIG.auth.emailDomain`). Pelanggan tidak nampak e-mel ini.
- **ID ahli = no. telefon** (cth. `60123456789`), jadi staf boleh cari ahli di kaunter dengan no. telefon.
- **Firebase sudah disambung** (projek `farha-apporder`, Email/Password dihidupkan). Pelanggan daftar dan log masuk melalui Firebase Authentication.
- Tetapkan `CONFIG.firebase = null` untuk kembali ke **mod demo** (akaun dalam peranti; akaun demo `012-345 6789` / `demo123`).
- Pastikan domain hosting (cth. `nama-app.vercel.app`) ditambah di Firebase console → *Authentication → Settings → Authorized domains*.
- **Sambung Firebase:** di Firebase console, hidupkan *Authentication → Sign-in method → Email/Password*, daftar web app, kemudian tampal `firebaseConfig` ke `CONFIG.firebase` dalam `index.html`. Tambah domain hosting anda di *Authentication → Settings → Authorized domains*.
- **Lupa password:** e-mel dalaman tidak boleh terima e-mel reset, jadi pelanggan diminta hubungi kedai. Staf/owner reset password di Firebase console (*Authentication → Users*).
- Nota: buat masa ini Firebase digunakan untuk log masuk sahaja. Point, cap dan pesanan masih disimpan dalam peranti sehingga Firestore disambung.

## Menu (admin → Menu)
- **Tambah, edit dan buang item jualan**: nama, penerangan, harga, kategori, gambar (dimampatkan), pilihan untuk pelanggan (kopi / susu / teh / pastri / tiada), lencana (cth. TERLARIS), Popular, dapat cap, dan suis **Dijual dalam app**.
- **Urus kategori** (butang di hujung baris kategori): tukar nama, susun semula (naik/turun), tambah kategori baru, atau buang kategori. Buang kategori yang ada item akan minta pilih kategori lain untuk pindahkan item tersebut. Kategori **Popular** kekal automatik. App pelanggan ikut susunan dan nama ini.
- **Varian & Add-on** (tab dalam skrin Menu): bina sendiri kumpulan pilihan dan sambungkan ke item.
  - **Varian** = pelanggan pilih satu (wajib), cth. Saiz: Biasa / Besar +RM2.00. Tetapkan pilihan asal.
    - **Harga varian = harga penuh**: masukkan harga jualan sebenar (cth. Biasa RM12, Besar RM14). Kosongkan jika sama dengan harga item (cth. Ais / Panas).
    - Harga varian boleh diubah **untuk setiap item** di skrin edit item (cth. Besar Latte RM12.90, Besar Signature RM14.90).
    - Hanya satu varian patut ada harga (cth. Saiz). Caj tambahan seperti susu oat → guna **Add-on** (+RM).
  - **Add-on** = pelanggan boleh pilih banyak, setiap satu dengan harga, cth. Extra shot +RM2.00. Boleh hadkan bilangan maksimum.
    - **Maks kuantiti setiap pilihan** (butang − / + di sebelah harga): 1 = pelanggan pilih atau tidak sahaja (kotak tanda); 2 ke atas = pelanggan guna butang − / + hingga had itu (cth. Fish Ball maks 3). Nak lebih, pelanggan tambah item lain ke troli. Troli & pesanan tunjuk "2× Fish Ball". Had jumlah semua add-on masih guna "Maksimum pilihan".
  - Sambung ke item dari skrin varian/add-on (butang **Semua minuman**) atau dari skrin edit item.
- Suis **Ada stok** untuk tanda item habis sementara. Perubahan terus muncul dalam app pelanggan.
- Menu asal dalam `CONFIG.menu` hanya dimasukkan kali pertama app dibuka. Selepas itu menu diurus di admin.

## Promosi (Home)
- Seksyen **Promosi** di skrin Home app pelanggan: slider banner (bertukar sendiri setiap 5 saat) dengan gambar atau kad warna, lencana, tajuk, keterangan dan butang.
- **Admin → Promosi**: tambah, edit, buang, susun (naik / turun), tunjuk / sembunyi, dan jadualkan tarikh mula & tamat. Ada pratonton terus semasa edit.
- Bila ditekan, banner boleh: buka **item istimewa** (terus ke halaman item), buka **kategori**, buka **menu Order**, atau tiada tindakan (banner sahaja).
- Gambar dimampatkan secara automatik. Saiz disyorkan: landskap, cth. 1200×600. Jika gambar sudah ada tulisan, kosongkan tajuk.

## Realtime Database (langkah 1: menu, promosi, tetapan, ganjaran)
- Data **menu & varian, promosi, tetapan dan ganjaran** disimpan di Firebase Realtime Database (`/shop/...`). Admin ubah → semua telefon pelanggan dikemas kini secara langsung (cth. item habis, tutup pesanan, promosi baru).
- Kali pertama admin log masuk, data dari pelayar admin itu dimuat naik jika database masih kosong.
- Status segerak dipapar di bawah sidebar admin ("Disegerak dengan database").
- **Pasang peraturan keselamatan (wajib):** Firebase console → *Realtime Database → Rules* → tampal isi fail [`database.rules.json`](database.rules.json) → **Publish**. Semua orang boleh membaca menu; hanya `admin@farha.app` boleh menulis.

### Langkah 2: akaun ahli, pesanan, bukti bayaran, baucar
- `/members/{uid}`: nama, no. telefon, point, cap, sejarah. Pelanggan hanya boleh **menolak** point/cap (tebus ganjaran); **admin sahaja** boleh menambah (kredit pesanan, rekod pembelian di kaunter, pelarasan).
- `/orders/{no}`: pesanan dari telefon pelanggan terus muncul di admin (peranti lain); status dari admin terus muncul di telefon pelanggan. Pelanggan hanya nampak pesanan sendiri.
- `/proofs/{no}`: bukti DuitNow (dimuat bila staf buka pesanan). `/vouchers/{kod}`: baucar ganjaran yang disahkan di kaunter.
- `/counters/orderNo`: nombor pesanan unik untuk semua pelanggan.
- Senarai **Ahli** dan **Ringkasan** di admin kini dari database (ahli sebenar yang mendaftar).
- Selepas kemas kini, **Publish semula** peraturan dari `database.rules.json`.

## Waktu Pickup (admin)
- **Admin → Waktu Pickup**: waktu operasi setiap hari (buka / tutup / cuti, boleh hingga lepas tengah malam), anggaran masa sediakan, selang slot (10–30 minit), had jadual (1–24 jam ke depan), suis benarkan jadual, dan suis **Terima pesanan**. Pratonton menunjukkan status & slot yang pelanggan nampak.
- **Pre-order bila kedai tutup** (suis di Waktu Pickup, lalai: hidup): di luar waktu operasi atau bila hampir tutup, pelanggan boleh pilih slot ambil untuk hari buka seterusnya (semua slot hari itu, tidak terhad kepada had jadual). Pesanan ditanda **PRE-ORDER** di kanban admin. Suis **Terima pesanan** yang dimatikan tetap menghalang semua pesanan.
- App pelanggan ikut waktu ini secara automatik: status "Buka · tutup 10:00 MLM" / "Tutup · buka esok 8:00 PG", "Secepat mungkin" hanya bila kedai buka dan sempat disediakan, slot "Jadualkan" hanya dalam waktu operasi, dan senarai waktu operasi dalam maklumat cawangan.
- Disegerak ke semua telefon melalui Realtime Database (`/shop/settings`).
- Pilihan Delivery dibuang (pickup sahaja).

## Tour panduan & cara pasang app
- **Tour panduan (spotlight)**: keluar sekali selepas log masuk pertama di setiap peranti. Menyorot satu demi satu: Promosi, Point, Kad cap, Kod ahli, Order, Cawangan, Kategori, Pilih minuman, Ganjaran dan Profil, kemudian cara pasang app. Boleh **Langkau**, **Kembali**, atau ulang dari **Profil → Panduan app**.
- **Cara pasang app**: panduan langkah demi langkah ikut peranti (iPhone/iPad, Android, Komputer), dengan butang **Pasang sekarang** bila pelayar menyokong. Juga dari **Profil → Cara pasang app** dan butang Pasang di Home.

## Backup & eksport data
- **Admin → Tetapan → Backup & eksport data**: muat turun semua data app dalam pelayar ini sebagai fail `.json` (pilihan: dengan / tanpa gambar), **Kongsi fail** (telefon), dan **Pulihkan dari fail**.
- **App pelanggan → Profil → Backup data app**: muat turun / kongsi fail yang sama (berguna jika belum boleh masuk admin).
- Password tidak dieksport. Fail mengandungi nama & no. telefon pelanggan — kongsi dengan berhati-hati.

## Notifikasi push
- **Pelanggan**: notifikasi bila pesanan diterima, siap, selesai, dibatalkan, bayaran DuitNow disahkan atau bukti ditolak. Hidupkan dari skrin status pesanan atau Profil → Notifikasi push.
- **Admin**: notifikasi bila pesanan baru masuk atau pelanggan hantar semula bukti DuitNow. Tekan **Hidupkan notifikasi** di skrin Pesanan.
- Klik notifikasi membuka app di pesanan berkenaan.
- **Had mod demo**: notifikasi keluar bila app/tab terbuka di latar belakang (pelayar yang sama). Untuk notifikasi bila app **ditutup sepenuhnya** dan antara peranti, sambung **Firebase Cloud Messaging** (service worker `sw.js` sudah ada pengendali `push`) dengan Cloud Function yang menghantar push bila status pesanan berubah. iPhone: notifikasi web hanya untuk app yang dipasang ke skrin utama (iOS 16.4+).

## Admin dashboard (`admin.html`, demo)
Buka `/admin` atau `admin.html` dan log masuk dengan **e-mel admin** melalui Firebase Authentication.
- E-mel yang dibenarkan: `ADMIN.adminEmails` dalam `admin.html` (kini `admin@farha.app`). Akaun pelanggan biasa tidak boleh masuk admin.
- **Password tidak disimpan dalam kod.** Cipta akaun admin di Firebase console → *Authentication → Users → Add user*. Tukar password di situ juga, atau guna butang **Lupa password?** (pautan reset dihantar ke e-mel admin).
- Mod demo (`ADMIN.firebase = null`): PIN **1234**.
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
