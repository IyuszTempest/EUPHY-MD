/**
 * Plugin: Family 100 V4.5 (Ultimate Edition) 📺
 * Fitur: Anti-Self Talk, Auto-Rekap, Modern & Anime Database.
 */

module.exports = {
    command: ['family100', 'stop'],
    category: 'fun',
    group: true,
    noPrefix: true,
    call: async (conn, m, { command }) => {
        conn.family100 = conn.family100 ? conn.family100 : {};
        let id = m.chat;

        // --- [ FITUR KELUAR / STOP ] ---
        if (command === 'stop') {
            if (!(id in conn.family100)) return m.reply("Gak ada game yang lagi jalan di sini. 🙄");
            let [msg, json, tertebak] = conn.family100[id];
            await m.reply(`🏳️ *GAME DIHENTIKAN!*\nJawabannya adalah: ${json.jawaban.join(', ')}`);
            delete conn.family100[id];
            return;
        }

        if (id in conn.family100) {
            return conn.reply(m.chat, `Selesaikan dulu soal yang ini! Atau ketik *.stop* buat berhenti. 😤`, conn.family100[id][0]);
        }

        // --- [ DATABASE LENGKAP: UMUM & ANIME ] ---
        const database = [
            { soal: "Apa yang biasa dilakukan orang kalau lagi stres?", jawaban: ["Tidur", "Makan", "Jalan-jalan", "Menangis", "Belanja"] },
            { soal: "Sebutkan alasan orang telat masuk kuliah!", jawaban: ["Bangun Siang", "Macet", "Ban Bocor", "Hujan", "Ketinggalan Bus"] },
            { soal: "Apa yang dicari orang saat bangun tidur?", jawaban: ["HP", "Kacamata", "Air Minum", "Handuk", "Bantal"] },
            { soal: "Sebutkan istilah yang sering diucap anak jaman sekarang!", jawaban: ["Gak Jelas", "Cringe", "Menyala Abangku", "Suki", "Sigma", "Mewing"] },
            { soal: "Sebutkan benda yang ada di dalam tas mahasiswa!", jawaban: ["Laptop", "Buku", "Pulpen", "Charger", "Tumblr"] },
            { soal: "Apa yang dilakukan kalau dosen gak datang-datang?", jawaban: ["Main Game", "Ghibah", "Kantin", "Tidur", "Mabar", "Pulang"] },
            { soal: "Sebutkan makanan yang sering dipesan lewat ojek online!", jawaban: ["Ayam Geprek", "Seblak", "Mie Gacoan", "Martabak", "Kopi"] },
            { soal: "Apa yang dicari orang di dalam dompet pas tanggal tua?", jawaban: ["Struk", "Recehan", "KTP", "Foto Mantan", "Kartu ATM"] },
            { soal: "Sebutkan hobi cowok yang bikin lupa waktu!", jawaban: ["Main Game", "Futsal", "Modif Motor", "Coding", "Nonton Anime"] },
            { soal: "Apa yang sering hilang di kos-kosan?", jawaban: ["Korek Api", "Sandal", "Gunting Kuku", "Karet Rambut", "Uang Kas"] },
            { soal: "Sebutkan isi dari nasi kotak pas acara kampus!", jawaban: ["Nasi", "Ayam", "Sambal", "Lalapan", "Kerupuk", "Jeruk"] },
            { soal: "Apa yang bikin orang betah di cafe?", jawaban: ["WiFi Kencang", "AC Dingin", "Kopi Enak", "Banyak Colokan", "Suasana"] },

            // --- [ ERA SEKARANG & TONGKRONGAN ] ---
            { soal: "Sebutkan istilah yang sering diucap anak jaman sekarang!", jawaban: ["Gak Jelas", "Cringe", "Menyala Abangku", "Suki", "Sigma", "Mewing", "Yapping"] },
            { soal: "Apa yang dilakukan kalau tiba-tiba mati lampu pas lagi asik main HP?", jawaban: ["Cek Sekring", "Cari Lilin", "Nyalain Flashlight", "Keluar Rumah", "Update Status"] },
            { soal: "Sebutkan alasan orang bikin story WA!", jawaban: ["Gengsi", "Galau", "Pamer Makanan", "Promosi", "Gabut", "Nyindir Orang"] },
            { soal: "Apa yang biasa dicari di minimarket (Indomaret/Alfamart)?", jawaban: ["Minuman Dingin", "Rokok", "Camilan", "Tisu", "Pulsa", "Skincare"] },
            { soal: "Sebutkan benda yang sering dipinjam temen tapi jarang balik!", jawaban: ["Korek Api", "Pulpen", "Charger", "Payung", "Uang", "Helm"] },

            // --- [ DUNIA KULIAH & DOSEN ] ---
            { soal: "Sebutkan alasan mahasiswa gak ngerjain tugas!", jawaban: ["Lupa", "Gak Paham", "Ketiduran", "Mabar", "Nunggu Jawaban Temen", "Internet Mati"] },
            { soal: "Apa yang dilakukan saat nunggu dosen telat masuk?", jawaban: ["Main HP", "Ghibah", "Ke Kantin", "Tidur", "Nugas Lain", "Pulang"] },
            { soal: "Sebutkan perlengkapan wajib saat mau presentasi!", jawaban: ["Laptop", "Materi", "Pointer", "Mental", "Kabel HDMI", "Baju Rapi"] },
            { soal: "Apa yang bikin mahasiswa pengen cepet lulus?", jawaban: ["Bosen Tugas", "Pengen Kerja", "Tekanan Ortu", "Capek Revisi", "Biar Gak Bayar UKT"] },

            // --- [ MAKANAN & RUMAH TANGGA ] ---
            { soal: "Sebutkan topping martabak manis yang paling lari!", jawaban: ["Cokelat", "Keju", "Kacang", "Wijen", "Susu", "Ketan Hitam"] },
            { soal: "Apa yang biasanya ada di atas meja makan?", jawaban: ["Tudung Saji", "Kecap", "Sambal", "Gelas", "Sendok", "Tisu"] },
            { soal: "Sebutkan menu sarapan favorit orang Indonesia!", jawaban: ["Nasi Uduk", "Bubur Ayam", "Gorengan", "Nasi Kuning", "Lontong Sayur"] },
            { soal: "Benda apa yang sering ada di bawah jok motor?", jawaban: ["Jas Hujan", "Obeng", "Lap", "STNK", "Helm", "Kunci Gembok"] },

            // --- [ RANDOM / GAK JELAS ] ---
            { soal: "Sebutkan nama-nama hewan yang depannya huruf K!", jawaban: ["Kucing", "Kambing", "Kuda", "Kangguru", "Kura-kura", "Kadal"] },
            { soal: "Apa yang biasanya ditanyakan orang saat pertama kali ketemu?", jawaban: ["Nama", "Tinggal Dimana", "Asal Mana", "Umur", "Kuliah Dimana"] },
            { soal: "Sebutkan suara yang sering terdengar di malam hari!", jawaban: ["Jangkrik", "Motor Lewat", "Kucing Berantem", "Tokek", "Angin", "Suara AC"] },

            // --- [ KATEGORI: SOCIAL MEDIA & INTERNET ] ---
            { soal: "Apa yang biasa dicari orang di YouTube kalau lagi gabut?", jawaban: ["Meme", "Vlog", "Tutorial", "Lagu", "Horor", "Film", "Gaming"] },
            { soal: "Sebutkan alasan orang unfollow atau mute akun di sosmed!", jawaban: ["Toxic", "Spam Story", "Sering Pamer", "Gak Kenal", "Berisik", "Gak Sefrekuensi"] },
            { soal: "Apa yang dilakukan kalau sinyal internet tiba-tiba lemot?", jawaban: ["Mode Pesawat", "Restart HP", "Cek Kuota", "Pindah Tempat", "Ngomel", "Cari WiFi"] },
            { soal: "Sebutkan barang yang sering dibeli lewat toko online karena diskon!", jawaban: ["Baju", "Skincare", "Sepatu", "Gadget", "Camilan", "Aksesoris"] },

            // --- [ KATEGORI: TONGKRONGAN & GAYA HIDUP ] ---
            { soal: "Apa yang ditanyakan temen kalau kamu baru beli barang baru?", jawaban: ["Harga", "Beli Dimana", "Pinjam", "Minta", "Kualitas", "Merk"] },
            { soal: "Sebutkan barang yang wajib dibawa pas lagi nongkrong!", jawaban: ["HP", "Powerbank", "Korek Api", "Rokok", "Dompet", "Vape"] },
            { soal: "Apa yang dilakukan cowok kalau lagi ngumpul bareng temen?", jawaban: ["Mabar", "Ghibah", "Ngopi", "Bahas Motor", "Main Kartu"] },
            { soal: "Sebutkan istilah yang sering dipakai buat orang yang sok tau!", jawaban: ["Yapping", "Sok Asik", "Sok Suhu", "Pick Me", "Gak Jelas"] },

            // --- [ KATEGORI: KULIAH & KERJA ] ---
            { soal: "Apa yang bikin semangat kalau lagi di kampus atau kantor?", jawaban: ["Gajian", "Libur", "Doi", "Kantin", "Wifi Gratis", "Temen Lucu"] },
            { soal: "Sebutkan benda yang sering ada di atas meja kerja atau meja belajar!", jawaban: ["Laptop", "Kopi", "Tisu", "Buku", "Penghapus", "Camilan"] },
            { soal: "Apa yang dirasain pas dapet tugas kelompok?", jawaban: ["Males", "Seneng", "Pasrah", "Bingung", "Beban"] },

            // --- [ KATEGORI: RUMAH TANGGA & RANDOM ] ---
            { soal: "Apa yang dilakukan orang kalau denger suara tukang bakso lewat?", jawaban: ["Panggil", "Cari Mangkok", "Cek Dompet", "Nitip", "Keluar Rumah"] },
            { soal: "Sebutkan benda di rumah yang gampang rusak kalau jatuh!", jawaban: ["Gelas", "Piring", "HP", "Cermin", "Lampu", "Jam Dinding"] },
            { soal: "Apa yang dicari ibu-ibu pas lagi masak di dapur?", jawaban: ["Garam", "Micin", "Spatula", "Lap", "Pisau", "Korek Gas"] },
            { soal: "Sebutkan jenis gorengan yang paling cepet abis kalau dibeli!", jawaban: ["Bala-bala", "Gehu", "Tempe", "Pisang Goreng", "Cireng"] },

            // --- [ KATEGORI: LIFESTYLE & TONGKRONGAN ] ---
            { soal: "Apa yang dilakukan kalau saldo ATM tinggal 50 ribu?", jawaban: ["Tarik Tunai", "Berdoa", "Cari Makan Murah", "Nabung Lagi", "Cek Mutasi", "Pasrah"] },
            { soal: "Sebutkan alasan orang gak jadi nongkrong!", jawaban: ["Gak Ada Duit", "Mager", "Hujan", "Gak Boleh Ortu", "Ketiduran", "Ada Acara Keluarga"] },
            { soal: "Apa yang biasa ditanyakan pas lagi kumpul keluarga?", jawaban: ["Kapan Lulus", "Kapan Nikah", "Jurusan Apa", "Semester Berapa", "Mana Pacarnya"] },
            { soal: "Sebutkan hal yang sering didebatkan bareng temen!", jawaban: ["Game", "Motor", "Cewek", "Sepak Bola", "Pilihan Makanan", "Politik"] },

            // --- [ KATEGORI: MAHASISWA & KAMPUS ] ---
            { soal: "Sebutkan benda yang sering dipinjam mahasiswa di kelas!", jawaban: ["Pulpen", "Kertas", "Charger", "Tipe-x", "Penghapus", "Catatan"] },
            { soal: "Apa yang dilakukan kalau dosen gak kunjung datang ke kelas?", jawaban: ["Ghibah", "Main Game", "Tidur", "Ke Kantin", "Pulang", "Mendengarkan Musik"] },
            { soal: "Sebutkan tempat favorit mahasiswa buat ngerjain tugas!", jawaban: ["Perpustakaan", "Cafe", "Kos-kosan", "Kantin", "Taman Kampus"] },

            // --- [ KATEGORI: KEBIASAAN DI RUMAH ] ---
            { soal: "Apa yang paling sering dicari di rumah pas mau pergi?", jawaban: ["Kunci Motor", "Dompet", "HP", "Kaos Kaki", "Helm", "Jaket"] },
            { soal: "Sebutkan barang yang sering numpuk di kamar mandi!", jawaban: ["Sabun", "Sampo", "Baju Kotor", "Handuk", "Gayung", "Pasta Gigi"] },
            { soal: "Apa yang dilakukan orang kalau denger suara petir gede banget?", jawaban: ["Tutup Kuping", "Matikan TV", "Kaget", "Masuk Rumah", "Cabut Colokan"] },

            // --- [ KATEGORI: MAKANAN & RANDOM ] ---
            { soal: "Sebutkan varian rasa mi instan yang paling populer!", jawaban: ["Mi Goreng", "Soto", "Ayam Bawang", "Kari Ayam", "Rendang", "Sambal Ijo"] },
            { soal: "Apa yang biasanya ada di dalam nasi bungkus/nasi rames?", jawaban: ["Nasi", "Ayam", "Tempe", "Sambal", "Sayur", "Telur"] },
            { soal: "Sebutkan hewan yang bikin geli atau takut di dalam rumah!", jawaban: ["Kecoak", "Cicak", "Tikus", "Laba-laba", "Kelabang"] },
            { soal: "Apa yang sering dilakukan orang kalau lagi nunggu antrian?", jawaban: ["Main HP", "Ngobrol", "Liat Sekitar", "Denger Musik", "Bengong"] },

            // --- [ KATEGORI: KALIMANTAN & LOKAL ] ---
            { soal: "Sebutkan buah-buahan yang banyak tumbuh di Kalimantan!", jawaban: ["Durian", "Rambutan", "Langsat", "Cempedak", "Manggis", "Lai"] },
            { soal: "Apa yang dilakukan orang kalau cuaca lagi panas banget di siang hari?", jawaban: ["Nyalain Kipas", "Minum Es", "Mandi", "Neduh", "Nyalain AC", "Tidur"] },
            { soal: "Sebutkan transportasi yang sering dipakai orang di daerah kamu!", jawaban: ["Motor", "Mobil", "Bus", "Truk", "Perahu", "Sepeda"] },

            // --- [ KATEGORI: CODING & GADGET ] ---
            { soal: "Sebutkan bahasa pemrograman yang populer buat dipelajari!", jawaban: ["Javascript", "Python", "Java", "PHP", "C++", "Golang", "HTML"] },
            { soal: "Apa yang bikin pusing pas lagi bikin program atau website?", jawaban: ["Error", "Bug", "Kurang Kurung", "Logika Mati", "Lupa Save", "Deadline"] },
            { soal: "Sebutkan komponen yang ada di dalam sebuah PC!", jawaban: ["Prosesor", "RAM", "Motherboard", "VGA", "Power Supply", "SSD", "Hardisk"] },
            { soal: "Apa yang dilakukan kalau HP tiba-tiba ngehang atau lag?", jawaban: ["Restart", "Hapus Cache", "Banting", "Diamkan", "Cek Memori"] },

            // --- [ KATEGORI: ANAK KOS & KULIAH ] ---
            { soal: "Sebutkan menu andalan anak kos pas akhir bulan!", jawaban: ["Mie Instan", "Promag", "Nasi Garam", "Telor", "Kerupuk", "Air Putih"] },
            { soal: "Apa yang bikin mahasiswa males berangkat kuliah pagi?", jawaban: ["Ngantuk", "Hujan", "Dosen Galak", "Mager", "Gak Mandi", "Begadang"] },
            { soal: "Sebutkan barang yang sering hilang di dalam tas kuliah!", jawaban: ["Pulpen", "Flashdisk", "Tipe-X", "Kunci Motor", "Uang Receh"] },

            // --- [ KATEGORI: RANDOM & MEME ] ---
            { soal: "Sebutkan hewan yang suaranya berisik di malam hari!", jawaban: ["Tokek", "Kucing", "Anjing", "Jangkrik", "Katak", "Nyamuk"] },
            { soal: "Apa yang biasa diminta temen pas kamu lagi makan?", jawaban: ["Minta Dikit", "Nitip", "Cicip", "Bagi", "Suapin"] },
            { soal: "Sebutkan benda yang bentuknya bulat!", jawaban: ["Bola", "Roda", "Kelereng", "Donat", "Piring", "Mata"] },
            { soal: "Apa yang dilakukan orang kalau lagi grogi di depan umum?", jawaban: ["Gemetar", "Keringat Dingin", "Salah Tingkah", "Main HP", "Garuk Kepala"] },

            // --- [ KATEGORI: WIBU & ANIME ] ---
            { soal: "Sebutkan judul anime yang sangat populer di Indonesia!", jawaban: ["Naruto", "One Piece", "Doraemon", "Dragon Ball", "Attack on Titan", "Spy x Family"] },
            { soal: "Apa yang biasanya ada di kamar seorang Wibu?", jawaban: ["Action Figure", "Poster", "Dakimakura", "Light Novel", "Manga", "PC Gaming"] },
            { soal: "Sebutkan kekuatan atau jurus ikonik di anime!", jawaban: ["Kamehameha", "Rasengan", "Chidori", "Bankai", "Amaterasu", "Domain Expansion"] },
            { soal: "Apa yang dilakukan wibu kalau lagi datang ke Event Jejepangan?", jawaban: ["Cosplay", "Beli Merchandise", "Foto Bareng Cosplayer", "Jajan Makanan Jepang", "Nonton Guest Star"] },
            { soal: "Sebutkan genre anime yang paling banyak disukai!", jawaban: ["Isekai", "Shonen", "Romance", "Action", "Slice of Life", "Horror"] },
            { soal: "Apa yang sering diucapkan wibu pas lagi ngobrol?", jawaban: ["Kawaii", "Omaewa Mou Shindeiru", "Nani", "Yamete", "Waku Waku", "Itai"] },
            { soal: "Sebutkan alasan orang suka nonton anime!", jawaban: ["Ceritanya Seru", "Grafiknya Bagus", "Banyak Waifu", "Bikin Terharu", "Gak Ngebosenin"] },
            { soal: "Apa yang dilakukan kalau waifu favoritnya mati di anime?", jawaban: ["Menangis", "Galau", "Gak Mau Nonton Lagi", "Hapus Folder", "Update Status Sedih"] },
            { soal: "Sebutkan anggota kelompok Akatsuki di Naruto!", jawaban: ["Itachi", "Kisame", "Pain", "Konan", "Deidara", "Sasori", "Tobi"] },
            { soal: "Apa yang biasanya dimakan karakter anime pas lagi di sekolah?", jawaban: ["Bento", "Onigiri", "Ramen", "Roti", "Takoyaki"] },
            { soal: "Sebutkan nama-nama studio anime yang terkenal!", jawaban: ["MAPPA", "Ufotable", "Studio Ghibli", "Madhouse", "Wit Studio", "A-1 Pictures"] },
            { soal: "Apa yang sering terjadi di anime Isekai?", jawaban: ["Ketabrak Truck", "Ketemu Dewi", "Jadi Overpower", "Punya Harem", "Masuk Dunia Game"] },

            // --- [ KATEGORI: DUNIA ANIME & MANGA ] ---
            { soal: "Sebutkan nama karakter utama anime yang sangat populer!", jawaban: ["Luffy", "Naruto", "Goku", "Eren", "Tanjiro", "Deku", "Saitama"] },
            { soal: "Apa yang dilakukan wibu kalau lagi libur kuliah atau sekolah?", jawaban: ["Maraton Anime", "Baca Manga", "Main Game", "Tidur", "Ngehalu", "Beresin Figure"] },
            { soal: "Sebutkan warna rambut karakter anime yang paling ikonik!", jawaban: ["Putih", "Biru", "Merah", "Kuning", "Pink", "Hijau", "Hitam"] },
            { soal: "Apa yang biasanya ada di dalam tas seorang cosplayer?", jawaban: ["Wig", "Kostum", "Make Up", "Alat Jahit", "Lakban", "Sepatu", "Aksesoris"] },
            { soal: "Sebutkan judul anime bertema Isekai yang kamu tahu!", jawaban: ["Mushoku Tensei", "Konosuba", "Re Zero", "Overlord", "Slime", "Sword Art Online"] },
            { soal: "Apa yang dirasakan wibu kalau anime favoritnya tamat?", jawaban: ["Sedih", "Hampa", "Gak Rela", "Cari Anime Baru", "Baca Manganya"] },
            { soal: "Sebutkan benda ajaib atau senjata paling kuat di anime!", jawaban: ["Death Note", "Dragon Ball", "Gunung Katana", "Mata Sharingan", "Zanpakuto", "Excalibur"] },
            { soal: "Apa yang sering muncul di adegan anime Slice of Life?", jawaban: ["Makan Bareng", "Festival Budaya", "Kembang Api", "Ujian Sekolah", "Naik Kereta"] },
            { soal: "Sebutkan nama-nama karakter anime yang punya sifat Tsundere!", jawaban: ["Asuka", "Taiga", "Rin Tohsaka", "Noelle", "Erina", "Chitoge"] },
            { soal: "Apa yang bikin orang jadi berhenti nonton anime (Pensiun)?", jawaban: ["Sibuk Kerja", "Bosen", "Udah Menikah", "Gak Ada Waktu", "Fokus Real Life"] },
            { soal: "Sebutkan judul anime olahraga (Sport) yang paling seru!", jawaban: ["Haikyuu", "Blue Lock", "Kuroko No Basket", "Slam Dunk", "Captain Tsubasa", "Prince Of Tennis"] },
            { soal: "Apa yang sering dilakukan karakter anime pas lagi jatuh cinta?", jawaban: ["Salting", "Muka Merah", "Gagap", "Lari", "Bengong"] }
        ];

        let json = database[Math.floor(Math.random() * database.length)];
        
        let caption = `📺 *FAMILY 100* 📺\n\n`;
        caption += `*Pertanyaan:* ${json.soal}\n\n`;
        caption += `Terdapat *${json.jawaban.length}* jawaban teratas.\n`;
        caption += `_Ketik jawabannya langsung (Tanpa Titik)!_\n`;
        caption += `_Ketik *.stop* untuk berhenti._`;

        // Simpan sesi game
        conn.family100[id] = [
            await conn.reply(m.chat, caption, m),
            json,
            [] // Koleksi jawaban tertebak
        ];
    },

    onMessage: async (conn, m) => {
        conn.family100 = conn.family100 ? conn.family100 : {};
        let id = m.chat;

        // --- [ 1. GATEKEEPER ANTI-SELF-TALK (PENTING!) ] ---
        if (!(id in conn.family100)) return false;
        
        // Cek ID Bot secara dinamis
        let botJid = conn.user.jid || conn.user.id;

        // STOP JIKA: Pesan dari bot sendiri, dari sistem, atau pesan kosong
        if (m.fromMe || m.key.fromMe || m.sender === botJid || m.isBaileys || !m.text) return false;

        // STOP JIKA: User ngetik command bot (prefix)
        if (/^[.!#]/.test(m.text)) return false;

        let [msg, json, tertebak] = conn.family100[id];
        let input = m.text.trim().toLowerCase();

        // --- [ 2. LOGIKA JAWABAN ] ---
        let index = json.jawaban.findIndex(v => v.toLowerCase() === input);
        
        if (index > -1) {
            // Jika sudah ditebak, bot diam saja (menghindari spam list berulang)
            if (tertebak.includes(input)) return false;

            tertebak.push(input);
            
            // Build List Rekap Status
            let rekap = json.jawaban.map((v, i) => {
                return tertebak.includes(v.toLowerCase()) ? `✅ ${v.toUpperCase()}` : `${i + 1}. ???`;
            }).join('\n');

            if (tertebak.length === json.jawaban.length) {
                await conn.reply(m.chat, `✅ *LENGKAP! SEMUA TERTEBAK!*\n\n${rekap}\n\nKalian kompak banget! 🌸`, m);
                delete conn.family100[id];
            } else {
                let teks = `✅ *BENAR!* (${input.toUpperCase()})\n\n`;
                teks += `*LIST JAWABAN:*\n${rekap}\n\n`;
                teks += `Tersisa *${json.jawaban.length - tertebak.length}* lagi! 🚀`;
                await m.reply(teks);
            }
            return true;
        } else {
            // --- [ 3. RESPONS SALAH ] ---
            // Hanya merespon jika input panjangnya > 3 huruf
            // Dan dipastikan bukan chat dari bot sendiri
            if (input.length > 3) {
                return m.reply(`❌ Salah, coba lagi!`);
            }
        }
    }
};
