/**
 * Euphy-Bot - YouTube Video Downloader ✨
 * API: ZiaUlhaq
 */

const axios = require('axios');

module.exports = {
    command: ['ytmp4'],
    noPrefix: true,
    category: 'downloader',
    call: async (conn, m, { args, usedPrefix, command }) => {
        // URLのチェック [cite: 2025-05-24]
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} https://www.youtube.com/watch?v=1aQGYPhp8uA`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            // ZiaUlhaq API へのリクエスト [cite: 2026-03-01]
            const apiUrl = `https://api.ziaul.my.id/api/downloader/ytmp4?url=${encodeURIComponent(args[0])}`;
            const response = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            const res = response.data;
            if (!res.status || !res.result) throw "Aku gagal mendapatkan videonya";

            const { title, quality, duration, downloadUrl, thumbnail } = res.result;

            // 動画の送信 (RAM 節約のため URL ストリーミング方式を採用)
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                caption: `╭━━〔 ⛩️ *𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙳𝙻* ⛩️ 〕━━┓\n┃ 📝 *Title:* ${title}\n┃ 🎬 *Quality:* ${quality}\n┃ ⏱️ *Duration:* ${duration}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\nEuphylia Magenta がお届けしたよ！ ✨`,
                contextInfo: {
                    externalAdReply: {
                        title: '𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝚅𝙸𝙳𝙴𝙾 𝚂𝚄𝙲𝙲𝙴𝚂𝚂',
                        body: `Quality: ${quality} | Duration: ${duration}`,
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
            m.reply(`❌ *Error:* ${e.message || e}`);
        }
    }
};
