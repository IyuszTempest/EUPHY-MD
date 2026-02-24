/**
 * Euphy-Bot - Auto Greeting & Promotion
 * Biar bot makin gaul dan promosi terus, awokawok.
 */

module.exports = {
    // Kata kunci yang akan memicu respons bot
    command: ['p', 'tes', 'woy', 'uy', 'cuy', '.'],
    category: 'main',
    noPrefix: true, // Wajib true agar merespons tanpa titik
    call: async (conn, m, { usedPrefix, command }) => {
        // Daftar kata-kata promosi biar makin pro
        const promosi = [
            "Apaan manggil-manggil? Euphy lagi sibuk nih, tapi kalo mau pake fitur keren ketik *.menu* ya! ✨",
            "Hadir! Jangan cuma tes-tes doang, coba cek fitur downloadernya, dijamin kenceng! 🚀",
            "Yo! Udah daftar belum? Ketik *.daftar nama.umur* biar bisa akses semua fitur rahasia Euphy. 🌸",
            "Euphy System Online! ✨\nBtw, aku ini dibuat sama IyuszTempest. Kalo mau bikin bot kayak gini juga, tanya aja ke ownernya, awokawok.",
            "Uy! Jangan lupa join grup official kita ya buat info update terbaru: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c"
        ];

        // Ambil satu pesan random dari daftar promosi
        const randomPromosi = promosi[Math.floor(Math.random() * promosi.length)];

        // Kirim balasan dengan gaya Newsletter + Fkontak yang udah kita setting di handler
        conn.reply(m.chat, randomPromosi, m);
    }
};
