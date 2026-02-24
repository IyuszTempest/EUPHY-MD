/**
 * Plugin Lahelu
 * Menggunakan API Fun/Lahelu
 */

const axios = require('axios');

module.exports = {
    command: ['lahelu'],
    category: 'fun',
    noPrefix: true, 
    call: async (conn, m, { usedPrefix, command }) => {
        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });

        try {
            // Memanggil API milikmu
            const response = await axios.get(`https://iyusztempest.my.id/api/fun?feature=lahelu&apikey=${global.apiyus}`);
            
            if (response.data.status !== "success") {
                return m.reply('Gagal mengambil konten dari Lahelu. Coba lagi nanti ya.');
            }

            const { message, media } = response.data;

            if (media.type === 'video') {
                // Kirim Video jika tipe medianya video
                await conn.sendMessage(m.chat, { 
                    video: { url: media.url }, 
                    caption: `*LAHELU CONTENT*\n\n"${message}"` 
                }, { quoted: m });
            } else if (media.type === 'image') {
                // Kirim Gambar jika tipe medianya image
                await conn.sendMessage(m.chat, { 
                    image: { url: media.url }, 
                    caption: `*LAHELU CONTENT*\n\n"${message}"` 
                }, { quoted: m });
            }

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan sistem saat menghubungi API.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
