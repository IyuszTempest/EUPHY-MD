/**
 * Plugin Wangy (NSFW)
 * Menggunakan API NSFW/Wangy
 */

const axios = require('axios');

module.exports = {
    command: ['wangy'],
    category: 'nsfw',
    noPrefix: true, 
    premium: true, // Fitur ini khusus user premium karena konten khusus
    call: async (conn, m, { usedPrefix, command }) => {
        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } });

        try {
            // Memanggil API milikmu
            const response = await axios.get(`https://iyusztempest.my.id/api/nsfw?feature=wangy&apikey=yusz123`);
            
            if (response.data.status !== "Sukses kak!") {
                return m.reply('Gagal mengambil gambar. Coba lagi nanti.');
            }

            const { media } = response.data;

            // Kirim gambar dengan peringatan NSFW
            await conn.sendMessage(m.chat, { 
                image: { url: media.url }, 
                caption: `*NSFW CONTENT: WANGY*\n\nGunakan dengan bijak! 🌸`,
                mentions: [m.sender]
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi API.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
