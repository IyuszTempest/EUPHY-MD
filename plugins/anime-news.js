/**
 * Euphy-Bot - Berita Anime Terkini ✨
 * API: ZiaUlhaq
 */

const axios = require('axios');

module.exports = {
    command: ['animenews'],
    category: 'anime',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: "⛩️", key: m.key } });

            // Request ke API Berita Anime [cite: 2026-03-07]
            const apiUrl = `https://api.ziaul.my.id/api/anime/berita-anime`;
            const response = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            const res = response.data;
            if (!res.status || !res.data.articles) throw "Gagal ambil berita anime.";

            // Ambil 6 berita terbaru biar rapi
            let capt = `╭━━〔 ⛩️ *𝙰𝙽𝙸𝙼𝙴 𝙽𝙴𝚆𝚂 𝚄𝙿𝙳𝙰𝚃𝙴* ⛩️ 〕━━┓\n┃ 🌸 *Info Hari Ini*\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            
            const articles = res.data.articles.slice(0, 6);
            articles.forEach((v, i) => {
                capt += `*${i + 1}. ${v.title}*\n`;
                capt += `📅 ${v.dateText || 'Baru-baru ini'}\n`;
                capt += `🔗 ${v.url}\n\n`;
            });

            capt += `📍 *Euphylia Magenta ✨*`;

            // Kirim dengan gambar berita utama
            await conn.sendMessage(m.chat, { 
                text: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝙰𝙽𝙸𝙼𝙴 𝙳𝙰𝙸𝙻𝚈 𝚄𝙿𝙳𝙰𝚃𝙴',
                        body: 'Jangan sampai ketinggalan info anime terbaru!',
                        thumbnailUrl: articles[0].imgSrc || global.imgall,
                        sourceUrl: articles[0].url,
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
