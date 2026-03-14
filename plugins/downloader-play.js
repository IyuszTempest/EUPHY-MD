/**
 * Euphy-Bot - YouTube Play Downloader ✨
 * Menggunakan API Junzz (Stable Download)
 */

const axios = require('axios');
const yts = require('yt-search');

module.exports = {
    command: ['play'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Masukkan judul lagunya! Contoh: *${usedPrefix + command} DJ Desa All Night*`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

            // 1. Cari video di YouTube
            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return m.reply("Aduh, lagunya nggak ketemu nih...");

            // Bersihkan URL supaya API Junzz lebih mudah prosesnya
            const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

            await conn.sendMessage(m.chat, { react: { text: "🎧", key: m.key } });

            // 2. Request ke API Junzz
            const apiUrl = `https://www.api-junzz.web.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result) {
                throw new Error("Server API sedang bermasalah atau konversi gagal.");
            }

            const res = data.result;

            // 3. Kirim Audio
            await conn.sendMessage(m.chat, { 
                audio: { url: res.download_url }, 
                mimetype: 'audio/mpeg',
                fileName: `${res.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: '𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙼𝚄𝚂𝙸𝙲 𝚂𝚄𝙲𝙲𝙴𝚂𝚂',
                        body: `Judul: ${res.title}\nKualitas: ${res.quality}`,
                        thumbnailUrl: video.thumbnail, // Pakai thumbnail dari hasil search
                        sourceUrl: videoUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error("Error Play Junzz:", e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`❌ *Terjadi Kesalahan:* ${e.message || "Gagal memproses lagu."}`);
        }
    }
};
