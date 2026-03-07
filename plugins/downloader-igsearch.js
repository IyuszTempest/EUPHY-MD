/**
 * Euphy-Bot - Instagram Reels Search ✨
 * API: Vreden
 */

const axios = require('axios');

module.exports = {
    command: ['igsearch'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`*Contoh:* ${usedPrefix + command} cortisol`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "📸", key: m.key } });

            // Request ke API Vreden [cite: 2026-03-07]
            const apiUrl = `https://api.vreden.my.id/api/v1/search/instagram/reels?query=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.result.search_data) throw "Gagal mencari Reels.";

            let capt = `╭━━〔 ⛩️ *𝙸𝙶 𝚁𝙴𝙴𝙻𝚂 𝚂𝙴𝙰𝚁𝙲𝙷* ⛩️ 〕━━┓\n┃ 🔍 *Query:* ${res.result.query}\n┃ 📊 *Total:* ${res.result.count} data\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            
            // Ambil 3 hasil teratas agar tidak spam & hemat RAM
            const results = res.result.search_data.slice(0, 3);
            
            results.forEach((v, i) => {
                capt += `*${i + 1}. ${v.profile.full_name} (@${v.profile.username})*\n`;
                capt += `💬 ${v.caption.substring(0, 100)}...\n`;
                capt += `❤️ ${v.statistics.like_count.toLocaleString()} | ⏯️ ${v.statistics.play_count.toLocaleString()}\n`;
                capt += `🔗 ${v.links}\n\n`;
            });

            capt += `📍 *Euphylia Magenta* ✨`;

            // Kirim dengan thumbnail hasil pertama
            await conn.sendMessage(m.chat, { 
                text: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼 𝚁𝙴𝙴𝙻𝚂 𝚄𝙿𝙳𝙰𝚃𝙴',
                        body: `Hasil pencarian untuk: ${text}`,
                        thumbnailUrl: results[0].thumbnail,
                        sourceUrl: results[0].links,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || "Lagi limit atau API down."}`);
        }
    }
};
