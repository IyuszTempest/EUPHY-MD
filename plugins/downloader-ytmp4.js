/**
 * Euphy-Bot - YouTube Video & Audio Downloader ✨
 * Optimized for Lunes Host
 */

const axios = require('axios');

module.exports = {
    command: ['ytmp4'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} https://youtu.be/HWjCStB6k4o`);

        const isVideo = command === 'ytmp4' || command === 'ytdl';
        const type = isVideo ? 'video' : 'mp3';
        
        try {
            await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

            // Request ke API Downloader Vreden [cite: 2026-03-07]
            const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/${type}?url=${encodeURIComponent(args[0])}${isVideo ? '&quality=360' : ''}`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.result.download || !res.result.download.url) {
                throw res.result.download?.message || "Terjadi kesalahan saat konversi.";
            }

            const { metadata, download } = res.result;

            let capt = `╭━━〔 ⛩️ *𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙳𝙻* ⛩️ 〕━━┓\n`;
            capt += `┃ 📝 *Title:* ${metadata.title}\n`;
            capt += `┃ 🎬 *Author:* ${metadata.author.name}\n`;
            capt += `┃ ⏱️ *Duration:* ${metadata.timestamp}\n`;
            capt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            capt += `*Euphylia Magenta* - Siap unduh! ✨`;

            if (isVideo) {
                // Kirim Video
                await conn.sendMessage(m.chat, { 
                    video: { url: download.url }, 
                    caption: capt,
                    contextInfo: {
                        externalAdReply: {
                            title: '𝚈𝚃 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳',
                            body: metadata.title,
                            thumbnailUrl: metadata.thumbnail,
                            sourceUrl: args[0],
                            mediaType: 1
                        }
                    }
                }, { quoted: m });
            } else {
                // Kirim Audio [cite: 2026-03-07]
                await conn.sendMessage(m.chat, { 
                    audio: { url: download.url }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${metadata.title}.mp3`
                }, { quoted: m });
            }

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || "Gagal mengambil data, coba lagi nanti ya!"}`);
        }
    }
};
                            
