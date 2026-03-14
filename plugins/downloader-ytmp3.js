
/**
 * Euphy-Bot - YouTube MP3 Downloader ✨
 * Menggunakan API Junzz (Stable Download)
 */

const axios = require('axios');

module.exports = {
    command: ['ytmp3'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // Cek apakah ada URL yang dimasukkan
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} https://www.youtube.com/watch?v=HWjCStB6k4o`);

        // Validasi simpel link YouTube
        if (!/youtube\.com|youtu\.be/i.test(args[0])) return m.reply("❌ Masukkan link YouTube yang valid!");

        try {
            await conn.sendMessage(m.chat, { react: { text: "🎧", key: m.key } });

            // Request ke API Junzz
            const apiUrl = `https://www.api-junzz.web.id/download/ytmp3?url=${encodeURIComponent(args[0])}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result) {
                throw new Error("Gagal mengambil data dari server API.");
            }

            const res = data.result;

            // Kirim Audio
            await conn.sendMessage(m.chat, { 
                audio: { url: res.download_url }, 
                mimetype: 'audio/mpeg',
                fileName: `${res.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: '𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙼𝚄𝚂𝙸𝙲 𝚂𝚄𝙲𝙲𝙴𝚂𝚂',
                        body: `Judul: ${res.title}\nKualitas: ${res.quality}`,
                        // Thumbnail default YT karena API Junzz tidak menyediakan thumbnail di result
                        thumbnailUrl: `https://i.ytimg.com/vi/${args[0].split('v=')[1]?.split('&')[0] || args[0].split('/').pop().split('?')[0]}/hqdefault.jpg`,
                        sourceUrl: args[0],
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error("Error ytmp3 Junzz:", e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`❌ *Terjadi Kesalahan:* ${e.message || "Gagal memproses permintaan."}`);
        }
    }
};
                                                                
