/**
 * Euphy-Bot - YouTube Video Play Downloader ✨
 * Optimized for Stability
 */

const axios = require('axios');
const yts = require('yt-search');

module.exports = {
    command: ['playvid'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Masukkan judul video yang ingin dicari! Contoh: *${usedPrefix + command} hanatan ray of light*`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

            // 1. Mencari video menggunakan yt-search
            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return m.reply("Video tidak ditemukan. Coba kata kunci lain.");

            const videoUrl = video.url;

            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            // 2. Mengambil link download dari API Downloader
            const apiUrl = `https://api.ziaul.my.id/api/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}`;
            const { data } = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            if (!data.status || !data.result || !data.result.downloadUrl) {
                return m.reply(`⚠️ *Gagal mengambil video.* API mungkin sedang sibuk.\n\n📌 *Judul:* ${video.title}\n🔗 *Link:* ${video.url}`);
            }

            const res = data.result;

            // 3. Mengirim Video ke WhatsApp
            await conn.sendMessage(m.chat, { 
                video: { url: res.downloadUrl }, 
                caption: `╭━━〔 ⛩️ *𝚈𝚃 𝚅𝙸𝙳𝙴𝙾 𝙿𝙻𝙰𝚈* ⛩️ 〕━━┓\n┃ 📝 *Judul:* ${res.title}\n┃ ⏱️ *Durasi:* ${res.duration}\n┃ ⚙️ *Kualitas:* ${res.quality}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\nEuphylia Magenta ✨`,
                contextInfo: {
                    externalAdReply: {
                        title: '🎥 𝚂𝙴𝙳𝙰𝙽𝙶 𝙳𝙸𝙿𝚄𝚃𝙰𝚁',
                        body: res.title,
                        thumbnailUrl: res.thumbnail || video.thumbnail,
                        sourceUrl: videoUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`❌ *Terjadi Kesalahan:* ${e.message || "Sistem error"}`);
        }
    }
};
    
