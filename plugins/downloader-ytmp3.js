/**
 * Euphy-Bot - YouTube MP3 Downloader ✨
 * Menggunakan API Ziaul (Stable URL Download)
 */

const axios = require('axios');

module.exports = {
    command: ['ytmp3'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // Cek apakah ada URL yang dimasukkan
        if (!args[0]) return m.reply(`Mana link-nya? ✨\n*Contoh:* ${usedPrefix + command} https://www.youtube.com/watch?v=uF7eT3nhyZ0`);

        // Validasi simpel link YouTube
        if (!/youtube\.com|youtu\.be/i.test(args[0])) return m.reply("❌ Masukkan link YouTube yang valid ya!");

        try {
            await conn.sendMessage(m.chat, { react: { text: "🎧", key: m.key } });

            // Request ke API Ziaul
            const apiUrl = `https://api.ziaul.my.id/api/downloader/ytmp3?url=${encodeURIComponent(args[0])}`;
            const { data } = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            if (!data.status || !data.result) {
                throw new Error("Aduh, server API-nya lagi bermasalah nih...");
            }

            const res = data.result;

            // Kirim Audio dengan info lengkap
            await conn.sendMessage(m.chat, { 
                audio: { url: res.downloadUrl }, 
                mimetype: 'audio/mpeg',
                fileName: res.filename,
                contextInfo: {
                    externalAdReply: {
                        title: '𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙼𝚄𝚂𝙸𝙲 𝚂𝚄𝙲𝙲𝙴𝚂𝚂',
                        body: `Judul: ${res.title}\nDurasi: ${res.duration} | Kualitas: ${res.quality}`,
                        thumbnailUrl: res.thumbnail,
                        sourceUrl: res.videoUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error("Error ytmp3 Ziaul:", e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`❌ *Terjadi Kesalahan:* ${e.message || "Gagal memproses link tersebut."}`);
        }
    }
};
