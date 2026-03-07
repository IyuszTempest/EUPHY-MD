/**
 * Euphy-Bot - Spotify Downloader ✨
 * API: Vreden
 */

const axios = require('axios');

module.exports = {
    command: ['spotifydl'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} https://open.spotify.com/track/xxxx`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

            // Request ke API Spotify Downloader Vreden [cite: 2026-03-07]
            const apiUrl = `https://api.vreden.my.id/api/v1/download/spotify?url=${encodeURIComponent(args[0])}`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.result) throw "Gagal konversi lagu, link mungkin nggak valid atau API lagi sibuk.";

            const data = res.result;

            let capt = `╭━━〔 ⛩️ *𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁* ⛩️ 〕━━┓\n`;
            capt += `┃ 🎵 *Title:* ${data.title}\n`;
            capt += `┃ 👤 *Artist:* ${data.artists}\n`;
            capt += `┃ 💿 *Album:* ${data.album}\n`;
            capt += `┃ ⏱️ *Duration:* ${Math.floor(data.duration_ms / 60000)} menit\n`;
            capt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            capt += `*Euphylia Magenta* - Musik buat nemenin koding! ✨`;

            // Kirim Info Lagu dengan Thumbnail
            await conn.sendMessage(m.chat, {
                text: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳',
                        body: data.title,
                        thumbnailUrl: data.cover_url,
                        sourceUrl: args[0],
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            // Kirim Audio sebagai File agar Meta Data (Cover & Judul) muncul [cite: 2026-03-07]
            await conn.sendMessage(m.chat, { 
                audio: { url: data.download }, 
                mimetype: 'audio/mpeg',
                fileName: `${data.title}.mp3`
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || "Gagal unduh lagu."}`);
        }
    }
};
