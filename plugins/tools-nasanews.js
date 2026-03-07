/**
 * Euphy-Bot - NASA News ✨
 * API: ZiaUlhaq
 */

const axios = require('axios');

module.exports = {
    command: ['nasa'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: "🚀", key: m.key } });

            // Request ke API Berita NASA
            const apiUrl = `https://api.ziaul.my.id/api/berita/nasa`;
            const response = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            const res = response.data;
            if (!res.status || !res.data || res.data.length === 0) throw "Gagal ambil berita NASA.";

            // Ambil 5 berita terbaru biar gak kepanjangan
            let capt = `╭━━〔 ⛩️ *𝙽𝙰𝚂𝙰 𝙻𝙰𝚃𝙴𝚂𝚃 𝙽𝙴𝚆𝚂* ⛩️ 〕━━┓\n┃ 🛰️ *Exploring the Universe*\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            
            const newsList = res.data.slice(0, 5);
            newsList.forEach((v, i) => {
                capt += `*${i + 1}. ${v.judul}*\n`;
                capt += `📰 ${v.desc.substring(0, 100)}...\n`;
                capt += `🔗 ${v.link}\n\n`;
            });

            capt += `📍 *Euphylia Magenta* - Menuju tak terbatas! ✨`;

            // Kirim dengan gambar bertema luar angkasa
            await conn.sendMessage(m.chat, { 
                text: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '🚀 NASA SPACE UPDATES',
                        body: 'Berita terbaru dari luar angkasa!',
                        thumbnailUrl: 'https://www.nasa.gov/wp-content/uploads/2023/04/nasa-logo-web-rgb.png',
                        sourceUrl: 'https://www.nasa.gov',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || e}`);
        }
    }
};
