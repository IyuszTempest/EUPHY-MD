/**
 * Euphy-Bot - Spotify Search ✨
 * API: Vreden
 */

const axios = require('axios');

module.exports = {
    command: ['spotifysearch'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`*Contoh:* ${usedPrefix + command} vivarium ado`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "🎧", key: m.key } });

            // Request ke API Spotify Vreden [cite: 2026-03-07]
            const apiUrl = `https://api.vreden.my.id/api/v1/search/spotify?query=${encodeURIComponent(text)}&limit=5`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.result.search_data) throw "Lagu nggak ketemu.";

            let capt = `╭━━〔 ⛩️ *𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝚂𝙴𝙰𝚁𝙲𝙷* ⛩️ 〕━━┓\n┃ 🎧 *Query:* ${res.result.query}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            
            const results = res.result.search_data;
            results.forEach((v, i) => {
                capt += `*${i + 1}. ${v.title}*\n`;
                capt += `👤 *Artist:* ${v.artist}\n`;
                capt += `💿 *Album:* ${v.album}\n`;
                capt += `⏱️ *Duration:* ${v.duration}\n`;
                capt += `📅 *Release:* ${v.release_date}\n`;
                capt += `🔗 \`${v.song_link}\`\n\n`;
            });

            capt += `📍 *Euphylia Magenta ✨*`;

            // Kirim dengan cover album hasil pertama
            await conn.sendMessage(m.chat, { 
                text: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙼𝚄𝚂𝙸𝙲 𝚄𝙿𝙳𝙰𝚃𝙴',
                        body: `Ditemukan lagu ${results[0].title}!`,
                        thumbnailUrl: results[0].cover_img,
                        sourceUrl: results[0].song_link,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || "API lagi sibuk."}`);
        }
    }
};
                  
