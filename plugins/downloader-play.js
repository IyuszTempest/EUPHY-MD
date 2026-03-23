/**
 * Euphy-Bot - YouTube Play Downloader ✨
 * Menggunakan API Ziaul (Query Direct Download)
 */

const axios = require('axios');

module.exports = {
    command: ['play'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Ayo mau dengerin lagu apa hari ini? ✨\nContoh: *${usedPrefix + command} Kawaikute Gomen*`);

        try {
            // Reaksi lagi nyari biar gaul
            await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

            // Request ke API Ziaul menggunakan query langsung
            const apiUrl = `https://api.ziaul.my.id/api/downloader/ytplaymp3?query=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            if (!data.status || !data.result) {
                throw new Error("Aduh, servernya lagi mogok atau lagunya nggak ketemu...");
            }

            const res = data.result;

            await conn.sendMessage(m.chat, { react: { text: "🎧", key: m.key } });

            // Kirim Audio dengan tampilan keren
            await conn.sendMessage(m.chat, { 
                audio: { url: res.downloadUrl }, 
                mimetype: 'audio/mpeg',
                fileName: `${res.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: res.title,
                        body: `Duration: ${res.duration} | Quality: ${res.quality}`,
                        thumbnailUrl: res.thumbnail,
                        sourceUrl: res.videoUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error("Error Play Ziaul:", e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`❌ *Gagal nih:* ${e.message || "Ada masalah teknis, coba lagi nanti ya!"}`);
        }
    }
};
