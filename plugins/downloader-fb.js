/**
 * Euphy-Bot - Facebook Downloader ✨
 * API: Vreden
 */

const axios = require('axios');

module.exports = {
    command: ['fb', 'facebook'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} https://www.facebook.com/share/r/16sXMhKi6e/`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

            // Request ke API FB Downloader [cite: 2026-03-07]
            const apiUrl = `https://api.vreden.my.id/api/v1/download/facebook?url=${encodeURIComponent(args[0])}`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.result.download) throw "Gagal mengambil video, pastikan link publik ya!";

            const { title, durasi, thumbnail, download } = res.result;
            const videoUrl = download.hd || download.sd; // Prioritas HD kalau ada

            let capt = `╭━━〔 ⛩️ *𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺 𝙳𝙻* ⛩️ 〕━━┓\n`;
            capt += `┃ 📝 *Title:* ${title}\n`;
            capt += `┃ ⏱️ *Durasi:* ${durasi}\n`;
            capt += `┃ 📽️ *Quality:* ${download.hd ? 'HD' : 'SD'}\n`;
            capt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            capt += `*Euphylia Magenta* ✨`;

            // Kirim Video
            await conn.sendMessage(m.chat, { 
                video: { url: videoUrl }, 
                caption: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳',
                        body: title,
                        thumbnailUrl: thumbnail,
                        sourceUrl: args[0],
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || "Lagi limit atau link salah."}`);
        }
    }
};
