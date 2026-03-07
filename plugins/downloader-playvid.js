/**
 * Euphy-Bot - YouTube Video Play (Search & DL) ✨
 * API: Vreden
 */

const axios = require('axios');

module.exports = {
    command: ['playvid'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        // 検索ワードのチェック [cite: 2025-05-24]
        if (!text) return m.reply(`*例:* ${usedPrefix + command} ray of light hanatan`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "🎬", key: m.key } });

            // Vreden API へのリクエスト [cite: 2026-03-07]
            const apiUrl = `https://api.vreden.my.id/api/v1/download/play/video?query=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.result.metadata) throw "Aku tidak menemukan informasi video apa pun.";

            const meta = res.result.metadata;
            
            // エラーハンドリング: ダウンロードリンクが死んでいる場合 [cite: 2026-03-07]
            if (!res.result.download || !res.result.download.url) {
                return m.reply(`⚠️ *API Error:* ${res.result.download.message || 'Terjadi kesalahan konversi.'}\n\nでも大丈夫、ユス！動画は見つかったよ：\n📌 *Title:* ${meta.title}\n🔗 *URL:* ${meta.url}\n\n代わりに \`.ytmp4 ${meta.url}\` Cobalah menggunakan！`);
            }

            // 成功した場合はビデオを送信 (RAM 512MB 最適化)
            await conn.sendMessage(m.chat, { 
                video: { url: res.result.download.url }, 
                caption: `╭━━〔 ⛩️ *𝚈𝚃 𝚅𝙸𝙳𝙴𝙾 𝙿𝙻𝙰𝚈* ⛩️ 〕━━┓\n┃ 📝 *Title:* ${meta.title}\n┃ 🎬 *Author:* ${meta.author.name}\n┃ ⏱️ *Duration:* ${meta.timestamp}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\nEuphylia Magenta がお届けしたよ、ユス！ ✨`,
                contextInfo: {
                    externalAdReply: {
                        title: '🎥 𝙽𝙾𝚆 𝙿𝙻𝙰𝚈𝙸𝙽𝙶',
                        body: meta.title,
                        thumbnailUrl: meta.thumbnail,
                        sourceUrl: meta.url,
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
                                                                        
