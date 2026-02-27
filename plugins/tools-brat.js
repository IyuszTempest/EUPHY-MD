/**
 * Euphy-Bot - Brat Generator (Meme Sticker)
 * Powerred by Euphylia Magenta System ✨
 */

const axios = require('axios');
const { sticker } = require('../lib/sticker'); // Pastikan kamu punya lib sticker

module.exports = {
    command: ['brat'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        // Pesan jika tidak ada teks [cite: 2025-05-24]
        if (!text) return m.reply(`Ketik teksnya, Yus! Contoh: *${usedPrefix + command} Euphylia Magenta Gacor*`);

        try {
            // Memberikan reaksi biar Euphylia Magenta terlihat responsif
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

            // Endpoint Brat dari hasil tes curl kamu
            const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}`;
            
            // Mengambil data gambar (buffer)
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'utf-8');

            // Konversi menjadi stiker khas Euphylia Magenta
            let stiker = await sticker(buffer, false, 'Euphylia Magenta', 'By Yus');
            
            if (stiker) {
                await conn.sendFile(m.chat, stiker, 'brat.webp', '', m);
            } else {
                // Fallback jika konversi stiker gagal, kirim sebagai gambar
                await conn.sendMessage(m.chat, { image: buffer, caption: 'Nih hasil Brat-nya, Yus! ✨' }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            m.reply(`Maaf, sistem Euphylia Magenta sedang gangguan: ${e.message}`);
        }
    }
};
