/**
 * Euphy-Bot - Pinterest Search
 * Powered by Euphylia Magenta System ✨
 */

const axios = require('axios');

module.exports = {
    command: ['pin'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Mau cari gambar apa di Pinterest? [cite: 2025-05-24]\nContoh: *${usedPrefix + command} anime wallpaper*`);

        try {
            await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

            // Menggunakan API Ownblox yang baru kamu temukan
            const response = await axios.get(`https://api.ownblox.my.id/api/pinterest?search=${encodeURIComponent(text)}`);
            const res = response.data;

            if (res.status !== 200 || !res.results.length) {
                return m.reply("Gambar tidak ditemukan. Coba kata kunci lain!");
            }

            // Kita ambil 3 gambar pertama biar tidak spam tapi tetap puas
            const topResults = res.results.slice(0, 3);

            for (let item of topResults) {
                let caption = `╭━━〔 ⛩️ *𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃* ⛩️ 〕━━┓\n`;
                caption += `┃ 👤 *By:* ${item.upload_by || 'Unknown'}\n`;
                caption += `┃ 🏮 *Caption:* ${item.caption || 'No description'}\n`;
                caption += `┗━━━━━━━━━━━━━━━━━━━━┛\n`;
                caption += `_Pinterest Searching ✨_`;

                await conn.sendMessage(m.chat, { 
                    image: { url: item.image }, 
                    caption: caption 
                }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            m.reply(`Aduh, sistem Euphylia Magenta gagal nyari gambar: ${e.message}`);
        }
    }
};
