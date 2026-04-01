/**
 * Plugin: Susun Kata (Royal Clue & Confirmation) 🧩
 */

module.exports = {
    command: ['susunkata'],
    category: 'fun',
    group: true,
    noPrefix: true,
    call: async (conn, m) => {
        conn.susunkata = conn.susunkata ? conn.susunkata : {};
        let id = m.chat;

        if (id in conn.susunkata) {
            return conn.reply(m.chat, `Selesaikan dulu tebakan sebelumnya! 😤`, conn.susunkata[id][0]);
        }

        // List Kata (Bisa kamu tambah sendiri sesukamu)
        const database = [
            { jawaban: 'KULIAH', soal: 'H-U-I-L-K-A' },
            { jawaban: 'LAPTOP', soal: 'P-O-T-L-A-L' },
            { jawaban: 'ANIME', soal: 'E-M-I-N-A' },
            { jawaban: 'INDONESIA', soal: 'A-I-S-E-N-O-D-N-I' },
            { jawaban: 'WHATSAPP', soal: 'P-P-A-S-T-A-H-W' },
            { jawaban: 'MAHASISWA', soal: 'A-W-S-I-S-A-H-A-M' },
            { jawaban: 'DATABASE', soal: 'E-S-A-B-A-T-A-D' },
            { jawaban: 'PROGRAMMER', soal: 'R-E-M-M-A-R-G-O-R-P' },

            // --- [ Kategori: Jomok / Random ] ---
            { jawaban: 'REIHAN', soal: 'H-A-I-N-E-R' },
            { jawaban: 'WIDODO', soal: 'O-D-O-D-I-W' },
            { jawaban: 'MASBRO', soal: 'O-R-B-S-A-M' },
            { jawaban: 'AMBATUKAM', soal: 'M-U-K-A-T-A-B-A-M' },
            { jawaban: 'MEWIDIN', soal: 'I-D-I-N-M-E-W' },
            { jawaban: 'SIGMA', soal: 'A-M-G-I-S' },
            { jawaban: 'SKIBIDI', soal: 'I-D-I-B-I-K-S' },
            { jawaban: 'MEWING', soal: 'G-N-I-W-E-M' },
            { jawaban: 'MOGGING', soal: 'G-N-I-G-G-O-M' },
            
            // --- [ Kategori: Kampus / Mahasiswa ] ---
            { jawaban: 'BEASISWA', soal: 'A-W-S-I-S-A-E-B' },
            { jawaban: 'SEMESTER', soal: 'R-E-T-S-E-M-E-S' },
            { jawaban: 'REVISI', soal: 'I-S-I-V-E-R' },
            { jawaban: 'SKRIPSI', soal: 'I-P-S-I-R-K-S' },
            { jawaban: 'KANTIN', soal: 'N-I-T-N-A-K' },
            { jawaban: 'PROPOSAL', soal: 'L-A-S-O-P-O-R-P' },
            
            // --- [ Kategori: Wibu / Anime ] ---
            { jawaban: 'WAIFU', soal: 'U-F-I-A-W' },
            { jawaban: 'ISEKAI', soal: 'I-A-K-E-S-I' },
            { jawaban: 'HIKIKOMORI', soal: 'I-R-O-M-O-K-I-K-I-H' },
            { jawaban: 'TSUNDERE', soal: 'E-R-E-D-N-U-S-T' },
            { jawaban: 'WIBU', soal: 'U-B-I-W' },
            
            // --- [ Kategori: Benda / Umum ] ---
            { jawaban: 'KETOPRAK', soal: 'K-A-R-P-O-T-E-K' },
            { jawaban: 'MENDOAN', soal: 'N-A-O-D-N-E-M' },
            { jawaban: 'GORENGAN', soal: 'N-A-G-N-E-R-O-G' },
            { jawaban: 'SMARTPHONE', soal: 'E-N-O-H-P-T-R-A-M-S' },
            { jawaban: 'KNALPOT', soal: 'T-O-P-L-A-N-K' },
            { jawaban: 'SABUN', soal: 'N-U-B-A-S' },

            // --- [ Kategori: Jomok / Internet Culture ] ---
            { jawaban: 'RUSDI', soal: 'I-D-S-U-R' },
            { jawaban: 'NGANJUK', soal: 'K-U-J-N-A-N-G' },
            { jawaban: 'AMBATAWAN', soal: 'N-A-W-A-T-A-B-M-A' },
            { jawaban: 'IRONI', soal: 'I-N-O-R-I' },
            { jawaban: 'PIRACY', soal: 'Y-C-A-R-I-P' },
            { jawaban: 'WEBINAR', soal: 'R-A-N-I-B-E-W' },
            { jawaban: 'LUNES', soal: 'S-E-N-U-L' },
            { jawaban: 'HOSTING', soal: 'G-N-I-T-S-O-H' },
            
            // --- [ Kategori: Random / Jamet ] ---
            { jawaban: 'MENYALA', soal: 'A-L-A-Y-N-E-M' },
            { jawaban: 'ABANGKU', soal: 'U-K-G-N-A-B-A' },
            { jawaban: 'ILMU', soal: 'U-M-L-I' },
            { jawaban: 'PADI', soal: 'I-D-A-P' },
            { jawaban: 'KELAS', soal: 'S-A-L-E-K' },
            { jawaban: 'KOCAK', soal: 'K-A-C-O-K' },
            { jawaban: 'CEPET', soal: 'T-E-P-E-C' },
            { jawaban: 'BODOH', soal: 'H-O-D-O-B' },
            
            // --- [ Kategori: Makanan / Ngasal ] ---
            { jawaban: 'SEBLAK', soal: 'K-A-L-B-E-S' },
            { jawaban: 'CIRENG', soal: 'G-N-E-R-I-C' },
            { jawaban: 'ESKRIM', soal: 'M-I-R-K-S-E' },
            { jawaban: 'MIEAYAM', soal: 'M-A-Y-A-E-I-M' },
            { jawaban: 'BAKSO', soal: 'O-S-K-A-B' },
            
            // --- [ Kategori: Komputer / Coding ] ---
            { jawaban: 'JAVASCRIPT', soal: 'T-P-I-R-C-S-A-V-A-J' },
            { jawaban: 'PYTHON', soal: 'N-O-H-T-Y-P' },
            { jawaban: 'FRONTEND', soal: 'D-N-E-T-N-O-R-F' },
            { jawaban: 'BACKEND', soal: 'D-N-E-K-C-A-B' },
            { jawaban: 'REDUX', soal: 'X-U-D-E-R' },

            // --- [ Kategori: Benda Sekitar ] ---
            { jawaban: 'TELEVISI', soal: 'I-S-I-V-E-L-E-T' },
            { jawaban: 'KULKAS', soal: 'S-A-K-L-U-K' },
            { jawaban: 'KOMPUTER', soal: 'R-E-T-U-P-M-O-K' },
            { jawaban: 'SPOILER', soal: 'R-E-L-I-O-P-S' },
            { jawaban: 'KAMERA', soal: 'A-R-E-M-A-K' },
            { jawaban: 'SEPEDA', soal: 'A-D-E-P-E-S' },
            { jawaban: 'PAYUNG', soal: 'G-N-U-Y-A-P' },
            { jawaban: 'DOMPET', soal: 'T-E-P-M-O-D' },

            // --- [ Kategori: Buah & Makanan ] ---
            { jawaban: 'MANGGA', soal: 'A-G-G-N-A-M' },
            { jawaban: 'SEMANGKA', soal: 'A-K-G-N-A-M-E-S' },
            { jawaban: 'ALPUKAT', soal: 'T-A-K-U-P-L-A' },
            { jawaban: 'DURIAN', soal: 'N-A-I-R-U-D' },
            { jawaban: 'MARTABAK', soal: 'K-A-B-A-T-R-A-M' },
            { jawaban: 'NASIGORENG', soal: 'G-N-E-R-O-G-I-S-A-N' },

            // --- [ Kategori: Teknologi & Kampus ] ---
            { jawaban: 'KEYBOARD', soal: 'D-R-A-O-B-Y-E-K' },
            { jawaban: 'INTERNET', soal: 'T-E-N-R-E-T-N-I' },
            { jawaban: 'WEBSITE', soal: 'E-T-I-S-B-E-W' },
            { jawaban: 'FLUTTER', soal: 'R-E-T-T-U-L-F' },
            { jawaban: 'MAHASISWA', soal: 'A-W-S-I-S-A-H-A-M' },
            { jawaban: 'EKONOMI', soal: 'I-M-O-N-O-K-E' },
            { jawaban: 'BIOLOGI', soal: 'I-G-O-L-O-I-B' },
            { jawaban: 'FISIKA', soal: 'A-K-I-S-I-F' },

            // --- [ Kategori: Hewan ] ---
            { jawaban: 'HARIMAU', soal: 'U-A-M-I-R-A-H' },
            { jawaban: 'JERAPAH', soal: 'H-A-P-A-R-E-J' },
            { jawaban: 'CENDERAWASIH', soal: 'H-I-S-A-W-A-R-E-D-N-E-C' },
            { jawaban: 'LUMALUMA', soal: 'A-M-U-L-A-M-U-L' },

            // --- [ Kategori: Nama Kota & Geografi ] ---
            { jawaban: 'JAKARTA', soal: 'A-T-R-A-K-A-J' },
            { jawaban: 'BANDUNG', soal: 'G-N-U-D-N-A-B' },
            { jawaban: 'SURABAYA', soal: 'A-Y-A-B-A-R-U-S' },
            { jawaban: 'PONTIANAK', soal: 'K-A-N-A-I-T-N-O-P' },
            { jawaban: 'KALIMANTAN', soal: 'N-A-T-N-A-M-I-L-A-K' },
            { jawaban: 'GUNUNG', soal: 'G-N-U-N-U-G' },
            { jawaban: 'LAUTAN', soal: 'N-A-T-U-A-L' },

            // --- [ Kategori: Benda Rumah Tangga ] ---
            { jawaban: 'LEMARI', soal: 'I-R-A-M-E-L' },
            { jawaban: 'CERMIN', soal: 'N-I-M-R-E-C' },
            { jawaban: 'BANTAL', soal: 'L-A-T-N-A-B' },
            { jawaban: 'SAKLAR', soal: 'R-A-L-K-A-S' },
            { jawaban: 'KOMPOR', soal: 'R-O-P-M-O-K' },
            { jawaban: 'SENDOK', soal: 'K-O-N-E-S-D' },
            { jawaban: 'PIRING', soal: 'G-N-I-R-I-P' },

            // --- [ Kategori: Pendidikan & Kampus ] ---
            { jawaban: 'DOSEN', soal: 'N-E-S-O-D' },
            { jawaban: 'KAMPUS', soal: 'S-U-P-M-A-K' },
            { jawaban: 'SARJANA', soal: 'A-N-A-J-R-A-S' },
            { jawaban: 'BEASISWA', soal: 'A-W-S-I-S-A-E-B' },
            { jawaban: 'PROPOSAL', soal: 'L-A-S-O-P-O-R-P' },
            { jawaban: 'SERTIFIKAT', soal: 'T-A-K-I-F-I-T-R-E-S' },
            { jawaban: 'PRACTICUM', soal: 'M-U-C-I-T-C-A-R-P' },

            // --- [ Kategori: Hewan & Tumbuhan ] ---
            { jawaban: 'KUCING', soal: 'G-N-I-C-U-K' },
            { jawaban: 'GAJAH', soal: 'H-A-J-A-G' },
            { jawaban: 'MELATI', soal: 'I-T-A-L-E-M' },
            { jawaban: 'MAWAR', soal: 'R-A-W-A-M' },
            { jawaban: 'POHON', soal: 'N-O-H-O-P' },

            // --- [ Kategori: Olahraga ] ---
            { jawaban: 'FUTSAL', soal: 'L-A-S-T-U-F' },
            { jawaban: 'MARATON', soal: 'N-O-T-A-R-A-M' },
            { jawaban: 'BADMINTON', soal: 'N-O-T-N-I-M-D-A-B' },
            { jawaban: 'RENANG', soal: 'G-N-A-N-E-R' },

            // --- [ Kategori: Kehidupan Sehari-hari ] ---
            { jawaban: 'SAJADAH', soal: 'H-A-D-A-J-A-S' },
            { jawaban: 'KORDEN', soal: 'N-E-D-R-O-K' },
            { jawaban: 'GANTUNGAN', soal: 'N-A-G-N-U-T-N-A-G' },
            { jawaban: 'SETRIKA', soal: 'A-K-I-R-T-E-S' },
            { jawaban: 'MANGKUK', soal: 'K-U-K-G-N-A-M' },
            { jawaban: 'CELANA', soal: 'A-N-A-L-E-C' },
            { jawaban: 'SEPATU', soal: 'U-T-A-P-E-S' },
            { jawaban: 'KEMEJA', soal: 'A-J-E-M-E-K' },

            // --- [ Kategori: Alam & Cuaca ] ---
            { jawaban: 'MATAHARI', soal: 'I-R-A-H-A-T-A-M' },
            { jawaban: 'PELANGI', soal: 'I-G-N-A-L-E-P' },
            { jawaban: 'REMBULAN', soal: 'N-A-L-U-B-M-E-R' },
            { jawaban: 'HALILINTAR', soal: 'R-A-T-N-I-L-I-L-A-H' },
            { jawaban: 'GEMPA', soal: 'A-P-M-E-G' },
            { jawaban: 'BANJIR', soal: 'R-I-J-N-A-B' },

            // --- [ Kategori: Sekolah & Ilmu ] ---
            { jawaban: 'KALKULATOR', soal: 'R-O-T-A-L-U-K-L-A-K' },
            { jawaban: 'PENGGARIS', soal: 'S-I-R-A-G-G-N-E-P' },
            { jawaban: 'PENSIL', soal: 'L-I-S-N-E-P' },
            { jawaban: 'MATEMATIKA', soal: 'A-K-I-T-A-M-E-T-A-M' },
            { jawaban: 'GEOGRAFI', soal: 'I-F-A-R-G-O-E-G' },
            { jawaban: 'SEJARAH', soal: 'H-A-R-A-J-E-S' },
            { jawaban: 'KAMPUS', soal: 'S-U-P-M-A-K' },

            // --- [ Kategori: Teknologi & Elektronik ] ---
            { jawaban: 'TELEPON', soal: 'N-O-P-E-L-E-T' },
            { jawaban: 'HEADSET', soal: 'T-E-S-D-A-E-H' },
            { jawaban: 'SPEAKER', soal: 'R-E-K-A-E-P-S' },
            { jawaban: 'PRINTER', soal: 'R-E-T-N-I-R-P' },
            { jawaban: 'BATERAI', soal: 'I-A-R-E-T-A-B' },
            { jawaban: 'PROSESOR', soal: 'R-O-S-E-S-O-R-P' },

            // --- [ Kategori: Makanan & Minuman ] ---
            { jawaban: 'KERIPIK', soal: 'K-I-P-I-R-E-K' },
            { jawaban: 'ESJERUK', soal: 'K-U-R-E-J-S-E' },
            { jawaban: 'KOPI', soal: 'I-P-O-K' },
            { jawaban: 'CENIL', soal: 'L-I-N-E-C' },
            { jawaban: 'GADO-GADO', soal: 'O-D-A-G-O-D-A-G' }
        ];
        

        let json = database[Math.floor(Math.random() * database.length)];
        let caption = `🧩 *SUSUN KATA* 🧩\n\n`;
        caption += `Susunlah huruf ini:\n`;
        caption += `👉 *${json.soal}*\n\n`;
        caption += `⏳ Waktu: 60 detik\n`;
        caption += `💡 Ketik *'clue'* untuk bantuan 3 huruf awal!`;

        conn.susunkata[id] = [
            await conn.reply(m.chat, caption, m),
            json,
            setTimeout(() => {
                if (conn.susunkata[id]) {
                    conn.reply(m.chat, `⌛ Waktu habis!\nJawabannya adalah: *${json.jawaban}*`, conn.susunkata[id][0]);
                    delete conn.susunkata[id];
                }
            }, 60000)
        ];
    },

    onMessage: async (conn, m) => {
        conn.susunkata = conn.susunkata ? conn.susunkata : {};
        let id = m.chat;
        if (!(id in conn.susunkata)) return false;
        
        let json = conn.susunkata[id][1];
        let input = m.text.trim().toLowerCase();

        // --- [ SISTEM CLUE - LEBIH ROYAL ] ---
        if (input === 'clue' || input === 'bantuan') {
            let bocoran = json.jawaban.toUpperCase();
            // Munculin 3 huruf pertama, sisanya sensor
            let hasilClue = bocoran.slice(0, 3) + '...'.repeat(bocoran.length - 3);
            return m.reply(`💡 Clue (3 Huruf Awal): *${hasilClue}*`);
        }

        // --- [ CEK JAWABAN ] ---
        if (input === json.jawaban.toLowerCase()) {
            let teksBerhasil = `✅ *TEBAKAN BENAR!* \n\n`;
            teksBerhasil += `Selamat *@${m.sender.split('@')[0]}*!\n`;
            teksBerhasil += `Jawabannya memang: *${json.jawaban.toUpperCase()}* 🌸`;
            
            await conn.reply(m.chat, teksBerhasil, m, { mentions: [m.sender] });
            
            clearTimeout(conn.susunkata[id][2]);
            delete conn.susunkata[id];
            return true;
        }
        return false;
    }
};
                               
