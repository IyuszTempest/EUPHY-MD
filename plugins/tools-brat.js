/**
 * Euphy-Bot - Brat Generator (Meme Sticker)
 * Powered by Euphylia Magenta System ✨
 */

const axios = require('axios');
const { sticker } = require('../lib/sticker'); // Pastikan file ini ada di folder lib

module.exports = {
    command: ['brat'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Ketik teksnya! Contoh: *${usedPrefix + command} Euphylia Magenta*`);

        try {
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

            const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}`;
            
            // Ambil gambar dari API
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'utf-8');

            // Proses jadi stiker pakai library sticker.js kamu
            let stiker = await sticker(buffer, false, 'Euphylia Magenta', 'by IyuszTempest');

            if (stiker) {
                // Kirim sebagai stiker beneran
                await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m });
            } else {
                // Kalau gagal jadi stiker, balik ke gambar lagi biar gak zonk
                await conn.sendMessage(m.chat, { image: buffer, caption: 'Gagal jadi stiker, kirim gambar aja ya!' }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            m.reply(`Maaf, sistem Euphylia Magenta sedang gangguan: ${e.message}`);
        }
    }
};
