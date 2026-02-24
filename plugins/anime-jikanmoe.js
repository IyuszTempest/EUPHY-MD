/**
 * Plugin Jikan Moe (Anime Search)
 * Menggunakan API Anime/JikanMoe
 */

const axios = require('axios');

module.exports = {
    command: ['jikanmoe'],
    category: 'anime',
    noPrefix: true, 
    call: async (conn, m, { text, command }) => {
        if (!text) return m.reply(`Mau cari anime apa? Contoh: *${command} dr stone*`);

        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            // Memanggil API menggunakan global.apiyus dan global.apikey
            const response = await axios.get(`${global.apiyus}/api/anime?feature=jikanmoe&query=${encodeURIComponent(text)}&apikey=${global.apikey}`);
            
            if (response.data.status !== "success") {
                return m.reply('Maaf, informasi anime tidak ditemukan.');
            }

            // Kita ambil hasil pertama saja agar informasi lebih detail
            const data = response.data.data[0];
            
            let caption = `*─── [ ANIME INFO ] ───*\n\n`;
            caption += `📺 *Judul:* ${data.title}\n`;
            caption += `🇯🇵 *Jepang:* ${data.title_japanese}\n`;
            caption += `⭐ *Rating:* ${data.score || 'N/A'}\n`;
            caption += `🎞️ *Tipe:* ${data.type}\n`;
            caption += `📅 *Status:* ${data.status}\n`;
            caption += `🔢 *Episode:* ${data.episodes || 'Unknown'}\n`;
            caption += `🕒 *Durasi:* ${data.duration}\n`;
            caption += `🔞 *Rating:* ${data.rating}\n\n`;
            caption += `📖 *Sinopsis:* ${data.synopsis ? data.synopsis.slice(0, 300) + '...' : 'Tidak ada sinopsis.'}\n\n`;
            caption += `🔗 *MAL URL:* ${data.url}`;

            // Kirim gambar poster anime beserta detailnya
            await conn.sendMessage(m.chat, { 
                image: { url: data.images.jpg.large_image_url }, 
                caption: caption 
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi database anime.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
