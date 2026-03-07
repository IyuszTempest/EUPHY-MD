/**
 * Euphy-Bot - CNN Indonesia News ✨
 * API: ZiaUlhaq
 */

const axios = require('axios');

module.exports = {
    command: ['cnn'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: "📰", key: m.key } });

            // Request ke API CNN Indonesia [cite: 2026-03-07]
            const apiUrl = `https://api.ziaul.my.id/api/berita/cnn`;
            const response = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            const res = response.data;
            if (!res.status || !res.data || res.data.length === 0) throw "Gagal ambil berita CNN.";

            // Ambil 5 berita teratas biar hemat RAM & gak spam
            let capt = `╭━━〔 ⛩️ *𝙲𝙽𝙽 𝙸𝙽𝙳𝙾𝙽𝙴𝚂𝙸𝙰* ⛩️ 〕━━┓\n┃ 🌏 *Update Berita Terbaru*\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            
            const newsList = res.data.slice(0, 5);
            newsList.forEach((v, i) => {
                capt += `*${i + 1}. ${v.title}*\n`;
                capt += `🔗 ${v.link}\n\n`;
            });

            capt += `📍 *Euphylia Magenta ✨*`;

            // Kirim dengan thumbnail berita pertama
            await conn.sendMessage(m.chat, { 
                text: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝙲𝙽𝙽 𝙸𝙽𝙳𝙾𝙽𝙴𝚂𝙸𝙰 𝚄𝙿𝙳𝙰𝚃𝙴',
                        body: 'Berita hari ini cukup menghebohkan',
                        thumbnailUrl: newsList[0].img || global.imgall,
                        sourceUrl: newsList[0].link,
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
