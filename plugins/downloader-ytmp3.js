/**
 * Euphy-Bot - YouTube MP3 Downloader ✨
 * API: ZiaUlhaq
 */

const axios = require('axios');

module.exports = {
    command: ['ytmp3'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // URLのチェック [cite: 2025-05-24]
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} https://www.youtube.com/watch?v=1aQGYPhp8uA`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "🎧", key: m.key } });

            // ZiaUlhaq API へのリクエスト [cite: 2026-03-01]
            const apiUrl = `https://api.ziaul.my.id/api/downloader/ytmp3?url=${encodeURIComponent(args[0])}`;
            const response = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            const res = response.data;
            if (!res.status || !res.result) throw "Gagal mendapatkan videonya";

            const { title, quality, duration, downloadUrl, thumbnail } = res.result;

            // 音声ファイルの送信 (URL ストリーミング方式で RAM 節約)
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: '𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙼𝚄𝚂𝙸𝙲 𝚂𝚄𝙲𝙲𝙴𝚂𝚂',
                        body: `Title: ${title}\nDuration: ${duration}`,
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
