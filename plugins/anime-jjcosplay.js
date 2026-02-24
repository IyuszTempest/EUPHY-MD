/**
 * Plugin JJ Cosplay
 * Menggunakan API Anime/JJ Cosplay
 */

const axios = require('axios');

module.exports = {
    command: ['jjcosplay'],
    category: 'anime',
    noPrefix: true, 
    call: async (conn, m, { usedPrefix, command }) => {
        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '💃', key: m.key } });

        try {
            // Memanggil API menggunakan global.apiyus
            const response = await axios.get(`${global.apiyus}/api/anime?feature=jjcosplay&apikey=${global.apiyus}`);
            
            if (response.data.status !== "success") {
                return m.reply('Maaf, gagal mengambil video cosplay. Coba lagi nanti ya.');
            }

            const { media } = response.data;

            // Kirim video JJ Cosplay
            await conn.sendMessage(m.chat, { 
                video: { url: media.url }, 
                caption: `*JJ COSPLAY ANIME* ✨`,
                mentions: [m.sender]
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi server API.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
