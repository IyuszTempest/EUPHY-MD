/**
 * Plugin Waifu Random
 * Menggunakan API Anime/Waifu
 */

const axios = require('axios');

module.exports = {
    command: ['waifu'],
    category: 'anime',
    noPrefix: true, 
    call: async (conn, m) => {
        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        try {
            // Memanggil API menggunakan global.apiyus dan global.apikey
            const response = await axios.get(`${global.apiyus}/api/anime/waifu?apikey=${global.apikey}`);
            
            if (!response.data.status) {
                return m.reply('Maaf, gagal mengambil gambar waifu. Coba lagi nanti ya.');
            }

            const imageUrl = response.data.result;

            // Kirim gambar waifu
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `Istri kartun kamu sudah datang! ✨`,
                mentions: [m.sender]
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '💖', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi server API.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
