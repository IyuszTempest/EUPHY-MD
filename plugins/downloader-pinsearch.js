/**
 * Pinterest Carousel (Team-Furina) ⛩️🌸
 * Powered by Furinn API System ✨
 * Mode: Carousel (Album)
 */

const axios = require('axios');

module.exports = {
    command: ['pin'],
    category: 'downloader',
    noPrefix: true,
    premium: false,
    register: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) return m.reply(`Mau cari gambar apa di Pinterest?\nContoh: *${usedPrefix + command} Euphylia kawai*`);

        // Beri reaksi 'Tunggu' (Emoji Mata Bulat)
        await conn.sendMessage(m.chat, { react: { text: '🙄', key: m.key } });

        try {
            // Nembak API Furinn (Pinterest Search)
            const apiUrl = `https://apii.furinn.my.id/api/search/pinterest?q=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            // Validasi data dari API
            if (!data.status || !data.result || data.result.length === 0) {
                return m.reply('❌ Gambar tidak ditemukan. Coba kata kunci lain!');
            }

            // Ambil 5 gambar terbaik untuk dikirim sebagai Carousel/Album
            const results = data.result.slice(0, 5);
            
            // Pengiriman berturut-turut untuk menciptakan efek album
            for (let item of results) {
                let caption = `╭━━〔 ⛩️ *𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃* ⛩️ 〕━━┓\n`;
                caption += `┃\n`;
                caption += `┃ ✨ *Status:* Done\n`;
                caption += `┃ 🏮 *Source:* Pinterest\n`;
                caption += `┃\n`;
                caption += `┗━━━━━━━━━━━━━━━━━┛\n`;
                caption += `_Pinterest Searching..._`;

                await conn.sendMessage(m.chat, { 
                    image: { url: item.image }, 
                    caption: caption 
                }, { quoted: m });
            }

            // Beri reaksi 'Selesai' (Emoji Love)
            await conn.sendMessage(m.chat, { react: { text: '💖', key: m.key } });

        } catch (e) {
            console.error(e);
            // Menampilkan pesan error yang informatif
            m.reply(`⚠️ Aduh, gagal nyari gambar: ${e.response ? e.response.status : e.message}\nCoba lagi nanti ya!`);
        }
    }
};
