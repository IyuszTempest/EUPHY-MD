/**
 * Pinterest Search ⛩️🌸
 * Powered by Vreden API System ✨
 * Mode: Biasa
 */

const axios = require('axios');

module.exports = {
    command: ['pin'],
    category: 'downloader',
    noPrefix: true,
    premium: false,
    register: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) return m.reply(`Mau cari gambar apa di Pinterest, Yus?\nContoh: *${usedPrefix + command} Euphylia Magenta* 🌸`);

        // Beri reaksi 'Tunggu' (Emoji Mata Bulat)
        await conn.sendMessage(m.chat, { react: { text: '🙄', key: m.key } });

        try {
            // Nembak API Vreden (Pinterest Search)
            const apiUrl = `https://api.vreden.my.id/api/v1/search/pinterest?query=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            // Validasi data dari API Vreden (menggunakan search_data)
            if (!data.status || !data.result || !data.result.search_data || data.result.search_data.length === 0) {
                return m.reply('❌ Gomen, gambarnya nggak ketemu. Coba keyword lain ya!');
            }

            // Ambil 5 gambar terbaik
            const results = data.result.search_data.slice(0, 5);
            
            for (let imageUrl of results) {
                let caption = `╭━━〔 ⛩️ *𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃* ⛩️ 〕━━┓\n`;
                caption += `┃\n`;
                caption += `┃ ✨ *Status:* Done\n`;
                caption += `┃ 🏮 *Source:* Pinterest\n`;
                caption += `┃ 👤 *Request by:* ${m.pushName}\n`;
                caption += `┃\n`;
                caption += `┗━━━━━━━━━━━━━━━━━┛\n`;
                caption += `_Semoga suka ya ✨_`;

                await conn.sendMessage(m.chat, { 
                    image: { url: imageUrl }, 
                    caption: caption 
                }, { quoted: m });
            }

            // Beri reaksi 'Selesai' (Emoji Love)
            await conn.sendMessage(m.chat, { react: { text: '💖', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Aduh, ada error pas lagi nyari gambar: ${e.message}\nCoba cek API-nya lagi deh!`);
        }
    }
};
