/**
 * Euphy-Bot - Tools Get (Smart Fetch)
 * Fitur: Mengambil data teks/JSON atau otomatis kirim gambar jika URL berupa media
 */

const axios = require('axios');

module.exports = {
    command: ['get'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        if (!text) return m.reply('Masukkan URL-nya, Contoh: .get https://catbox.moe/example.jpg');
        
        if (!/^https?:\/\//.test(text)) return m.reply('URL-nya harus diawali http:// atau https:// ya!');

        try {
            // Kita lakukan request head dulu untuk cek tipe konten tanpa download seluruhnya
            const head = await axios.head(text);
            const contentType = head.headers['content-type'] || '';

            // --- [ DETEKSI GAMBAR ] ---
            if (/image/.test(contentType)) {
                return conn.sendMessage(m.chat, { 
                    image: { url: text }, 
                    caption: `📸 *Source:* ${text}` 
                }, { quoted: m });
            }

            // --- [ DETEKSI TEKS / JSON ] ---
            const res = await axios.get(text);
            let result;
            
            if (typeof res.data === 'object') {
                result = JSON.stringify(res.data, null, 2);
            } else {
                result = res.data.toString();
            }

            // Batasi agar tidak bikin bot crash di Lunes Host
            if (result.length > 10000) {
                return m.reply('Waduh, datanya kepanjangan! Euphy cuma bisa nampilin sampai 10.000 karakter aja.');
            }

            return m.reply(result);

        } catch (e) {
            console.error(e);
            return m.reply(`Gagal mengambil data! ❌\n\n*Error:* ${e.message}\nPastikan link-nya valid ya`);
        }
    }
};
