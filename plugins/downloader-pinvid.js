/**
 * Euphy-Bot - Pinterest Video Search ✨
 * API: Vreden v2
 */

const axios = require('axios');

module.exports = {
    command: ['pinvid'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`*Contoh:* ${usedPrefix + command} pemandangan alam`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "📌", key: m.key } });

            // Request ke API Pinterest Vreden v2 [cite: 2026-03-07]
            const apiUrl = `https://api.vreden.my.id/api/v2/search/pinterest?query=${encodeURIComponent(text)}&limit=5&type=videos`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || res.result.result.length === 0) throw "Video Pinterest nggak ketemu.";

            let capt = `╭━━〔 ⛩️ *𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 𝚅𝙸𝙳𝙴𝙾* ⛩️ 〕━━┓\n┃ 🔍 *Query:* ${res.result.query}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            
            // Ambil 3 hasil teratas agar RAM 512MB kamu tetap stabil
            const results = res.result.result.slice(0, 3);
            
            results.forEach((v, i) => {
                const media = v.media_urls[0];
                capt += `*${i + 1}. ${v.title || 'Tanpa Judul'}*\n`;
                capt += `👤 *Uploader:* ${v.uploader.full_name}\n`;
                capt += `🎬 *Quality:* ${media.quality}\n`;
                capt += `🔗 *Url:* ${v.pin_url}\n\n`;
            });

            capt += `📍 *Euphylia Magenta* ✨\n_Note: Video Pinterest seringkali menggunakan format streaming (m3u8)._`;

            // Kirim dengan thumbnail video pertama
            await conn.sendMessage(m.chat, { 
                text: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 𝚅𝙸𝙳𝙴𝙾 𝚂𝙴𝙰𝚁𝙲𝙷',
                        body: `Ditemukan ${res.result.total} video!`,
                        thumbnailUrl: results[0].media_urls[0].thumbnail,
                        sourceUrl: results[0].pin_url,
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
