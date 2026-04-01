/**
 * Plugin: Susun Kata (No Reward Edition) 🧩
 * Cara main: .susunkata
 */

const fs = require('fs');

module.exports = {
    command: ['susunkata'],
    category: 'fun',
    group: true,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        // Inisialisasi session game agar tidak tabrakan
        conn.susunkata = conn.susunkata ? conn.susunkata : {};
        let id = m.chat;

        if (id in conn.susunkata) {
            return conn.reply(m.chat, `Selesaikan dulu tebakan sebelumnya, Kak! 😤`, conn.susunkata[id][0]);
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
            { jawaban: 'REDUX', soal: 'X-U-D-E-R' }
        ];

        // Ambil random soal
        let json = database[Math.floor(Math.random() * database.length)];
        let caption = `🧩 *SUSUN KATA* 🧩\n\n`;
        caption += `Susunlah huruf ini menjadi kata yang benar:\n`;
        caption += `👉 *${json.soal}*\n\n`;
        caption += `⏳ Waktu: 60 detik\n`;
        caption += `_Ketik jawabannya langsung ya!_`;

        conn.susunkata[id] = [
            await conn.reply(m.chat, caption, m),
            json,
            setTimeout(() => {
                if (conn.susunkata[id]) {
                    conn.reply(m.chat, `⌛ Waktu habis!\nJawabannya adalah: *${json.jawaban}*`, conn.susunkata[id][0]);
                    delete conn.susunkata[id];
                }
            }, 60000) // Waktu 60 detik
        ];
    },

    // --- [ 2. HANDLE JAWABAN ] ---
    // Taruh di bawah call atau biarkan handler yang urus
    onMessage: async (conn, m) => {
        conn.susunkata = conn.susunkata ? conn.susunkata : {};
        let id = m.chat;

        if (!(id in conn.susunkata)) return false;
        let json = conn.susunkata[id][1];

        if (m.text.toUpperCase() === json.jawaban.toUpperCase()) {
            await conn.reply(m.chat, `✅ *Bener Banget!*\n\nSelamat Kak @${m.sender.split('@')[0]} kamu berhasil menyusun katanya! ✨`, m, { mentions: [m.sender] });
            clearTimeout(conn.susunkata[id][2]);
            delete conn.susunkata[id];
        }
        return true;
    }
};
