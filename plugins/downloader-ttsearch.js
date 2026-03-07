/**
 * Euphy-Bot - TikTok Search & Downloader ✨
 * API: Vreden
 */

const axios = require('axios');

module.exports = {
    command: ['ttsearch'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`*Contoh:* ${usedPrefix + command} cortisol`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "🎬", key: m.key } });

            // Request ke API Vreden
            const apiUrl = `https://api.vreden.my.id/api/v1/search/tiktok?query=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.result.search_data) throw "Gagal mencari video TikTok.";

            let capt = `╭━━〔 ⛩️ *𝚃𝙸𝙺𝚃𝙾𝙺 𝚂𝙴𝙰𝚁𝙲𝙷* ⛩️ 〕━━┓\n┃ 🔍 *Query:* ${res.result.query}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            
            // Ambil 3 hasil teratas biar RAM 512MB kamu tetap stabil
            const results = res.result.search_data.slice(0, 3);
            
            results.forEach((v, i) => {
                capt += `*${i + 1}. ${v.author.nickname}* (@${v.author.fullname})\n`;
                capt += `💬 ${v.title.substring(0, 80)}...\n`;
                capt += `👁️ ${v.stats.views} | ❤️ ${v.stats.likes}\n`;
                capt += `🔗 Link No WM: \`${v.data.find(d => d.type === 'no_watermark')?.url}\`\n\n`;
            });

            capt += `📍 *Euphylia Magenta* ✨\n_Ketik .tt [link] untuk unduh videonya!_`;

            // Kirim dengan cover video pertama
            await conn.sendMessage(m.chat, { 
                text: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝚃𝙸𝙺𝚃𝙾𝙺 𝚃𝚁𝙴𝙽𝙳𝙸𝙽𝙶 𝚄𝙿𝙳𝙰𝚃𝙴',
                        body: `Ditemukan ${res.result.count} video!`,
                        thumbnailUrl: results[0].cover,
                        sourceUrl: results[0].data[0].url,
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
