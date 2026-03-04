/**
 * Euphy-Bot - Facebook Video Downloader ✨
 * API: OwnBlox
 */

const axios = require('axios');

module.exports = {
    command: ['fb', 'facebook'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // Cek input link Facebook
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} https://www.facebook.com/share/v/xxxx/`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            // Request ke API OwnBlox
            const apiUrl = `https://api.ownblox.my.id/api/fbdl?url=${encodeURIComponent(args[0])}`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (res.status !== 200) throw "Gagal mengambil data.";

            // Kirim Video Langsung (Stream URL biar hemat RAM Lunes Host)
            await conn.sendMessage(m.chat, { 
                video: { url: res.download_link }, 
                caption: `╭━━〔 ⛩️ *𝙵𝙰𝙲𝙴𝙱𝙾𝙾Ｋ 𝙳𝙻* ⛩️ 〕━━┓\n┃ 🔗 *Source:* Facebook\n┗━━━━━━━━━━━━━━━━━━━━┛\n\nVideo berhasil diunduh buat kamu! ✨`,
                contextInfo: {
                    externalAdReply: {
                        title: '𝙴𝚄𝙿𝙷𝚈 𝙵𝙱 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁',
                        body: 'Facebook Video Success ✨',
                        thumbnailUrl: global.allimg,
                        sourceUrl: args[0],
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`❌ *Sistem Euphy Error:* ${e.message || e}`);
        }
    }
};
