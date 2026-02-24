/**
 * Plugin Megumin Random
 * Menggunakan API Anime/Megumin
 */

const axios = require('axios');

module.exports = {
    command: ['megumin'],
    category: 'anime',
    noPrefix: true, 
    call: async (conn, m) => {
        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });

        try {
            // Memanggil API menggunakan variabel global
            const response = await axios.get(`${global.apiyus}/api/anime/megumin?apikey=${global.apikey}`);
            
            if (!response.data.status) {
                return m.reply('Maaf, si penyihir ledakan lagi istirahat. Coba lagi nanti ya.');
            }

            const imageUrl = response.data.result;

            // Kirim gambar Megumin
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `EXPLOSION! ✨`,
                mentions: [m.sender]
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '❤️‍🔥', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi server API.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
