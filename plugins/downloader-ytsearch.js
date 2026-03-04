/**
 * Euphy-Bot - YouTube Search ✨
 * API: ZiaUlhaq
 */

const axios = require('axios');

module.exports = {
    command: ['yts', 'ytsearch'],
    category: 'downloader',
    noPrefix: true;
    call: async (conn, m, { text, usedPrefix, command }) => {
        // 検索ワードのチェック [cite: 2025-05-24]
        if (!text) return m.reply(`*Comtoh:* ${usedPrefix + command} Love & Moon Marika Kohno`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

            // ZiaUlhaq API へのリクエスト [cite: 2026-03-01]
            const apiUrl = `https://api.ziaul.my.id/api/search/youtubesearch?query=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            const res = response.data;
            if (!res.status || !res.data || res.data.length === 0) throw "動画が見つからなかったよ、ユス。";

            // 検索結果の整形 (最大 5 件に制限して RAM を節約)
            let capt = `╭━━〔 ⛩️ *𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝚂𝙴𝙰𝚁𝙲𝙷* ⛩️ 〕━━┓\n┃ 🔍 *Query:* ${text}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            
            const results = res.data.slice(0, 5); 
            results.forEach((v, i) => {
                capt += `*${i + 1}. ${v.title}*\n`;
                capt += `  🎬 *Author:* ${v.author}\n`;
                capt += `  ⏱️ *Duration:* ${v.duration}\n`;
                capt += `  👁️ *Views:* ${v.views || 'N/A'}\n`;
                capt += `  🔗 *URL:* ${v.url}\n\n`;
            });

            capt += `*Euphylia Magenta* で音楽を楽しもう！ ✨`;

            // 最初の動画のサムネイル付きで結果を送信
            await conn.sendMessage(m.chat, { 
                text: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝚈𝚃 𝚂𝙴𝙰𝚁𝙲𝙷 𝚁𝙴𝚂𝚄𝙻𝚃𝚂',
                        body: `Found ${res.data.length} videos!`,
                        thumbnailUrl: global.imgall,
                        sourceUrl: results[0].url,
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
    
