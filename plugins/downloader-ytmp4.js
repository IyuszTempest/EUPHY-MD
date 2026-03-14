/**
 * Euphy-Bot - YouTube MP4 Downloader
 * Menggunakan API ZiaUlhaq
 */

const axios = require('axios');

module.exports = {
    command: ['ytmp4'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // Cek apakah ada URL yang dimasukkan
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} https://youtu.be/0ronVoomulM`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

            // Request ke API Downloader ZiaUlhaq
            const apiUrl = `https://api.ziaul.my.id/api/downloader/ytmp4?url=${encodeURIComponent(args[0])}`;
            const { data } = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            // Validasi response API
            if (!data.status || !data.result) {
                throw new Error("Gagal mengambil data video dari server.");
            }

            const { title, quality, duration, downloadUrl, thumbnail, videoUrl } = data.result;

            // Susun caption informasi video
            let capt = `╭━━〔 ⛩️ *𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙳𝙻* ⛩️ 〕━━┓\n`;
            capt += `┃ 📝 *Judul:* ${title}\n`;
            capt += `┃ ⚙️ *Kualitas:* ${quality}\n`;
            capt += `┃ ⏱️ *Durasi:* ${duration}\n`;
            capt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            capt += `*Euphylia Magenta* - Berhasil diunduh! ✨`;

            // Mengirim Video ke WhatsApp
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                caption: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝚈𝚃 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳',
                        body: title,
                        thumbnailUrl: thumbnail,
                        sourceUrl: videoUrl || args[0],
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error("Error ytmp4:", e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`❌ *Terjadi Kesalahan:* ${e.message || "Gagal memproses permintaan, silakan coba lagi nanti."}`);
        }
    }
};
