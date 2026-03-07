/**
 * Euphy-Bot - YouTube Play (Search & Stable Download) ✨
 * Optimized for Lunes Host 512MB RAM
 */

const axios = require('axios');

module.exports = {
    command: ['playvid'],
    category: 'downloader',
    noPrefix: true, // プレフィックスなしで動作
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`*例:* ${command} ray of light hanatan`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

            // 1. まずは検索してメタデータとURLを取得 [cite: 2026-03-07]
            const searchApi = `https://api.vreden.my.id/api/v1/download/play/video?query=${encodeURIComponent(text)}`;
            const searchRes = await axios.get(searchApi);
            
            if (!searchRes.data.status || !searchRes.data.result.metadata) throw "動画情報が見つからなかったよ。";
            
            const meta = searchRes.data.result.metadata;
            const videoUrl = meta.url;

            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            // 2. 専用ダウンロードエンドポイントを叩く (360p固定でRAM負荷軽減)
            const dlApi = `https://api.vreden.my.id/api/v1/download/youtube/video?url=${encodeURIComponent(videoUrl)}&quality=360`;
            const dlRes = await axios.get(dlApi);

            // エラーハンドリング: ダウンロードリンクが取得できない場合 [cite: 2026-03-07]
            if (!dlRes.data.status || !dlRes.data.result.download || !dlRes.data.result.download.url) {
                return m.reply(`⚠️ *Download Error:* APIが混み合っているみたい。\n\n📌 *Title:* ${meta.title}\n🔗 *URL:* ${meta.url}\n\nこのURLをブラウザで開いてみてね、ユス！`);
            }

            const downloadUrl = dlRes.data.result.download.url;

            // 3. ビデオを送信
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                caption: `╭━━〔 ⛩️ *𝚈𝚃 𝚅𝙸𝙳𝙴𝙾 𝙿𝙻𝙰𝚈* ⛩️ 〕━━┓\n┃ 📝 *Title:* ${meta.title}\n┃ 🎬 *Author:* ${meta.author.name}\n┃ ⏱️ *Duration:* ${meta.timestamp}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\nEuphylia Magenta ✨`,
                contextInfo: {
                    externalAdReply: {
                        title: '🎥 𝙽𝙾𝚆 𝙿𝙻𝙰𝚈𝙸𝙽𝙶',
                        body: meta.title,
                        thumbnailUrl: meta.thumbnail,
                        sourceUrl: videoUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || "Error"}`);
        }
    }
};
            
