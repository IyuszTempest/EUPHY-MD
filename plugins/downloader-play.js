/**
 * Euphy-Bot - YouTube Play Downloader
 * Integrated with Iyusz API (iyusztempest.my.id)
 */

const axios = require('axios');

module.exports = {
    command: ['play'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Masukkan judul lagunya! Contoh: *${usedPrefix + command} kawaikute gomen*`);

        await conn.sendMessage(m.chat, { react: { text: "🎵", key: m.key } });

        try {
            // URL API sesuai format yang kamu berikan
            const apiUrl = `https://iyusztempest.my.id/api/download?feature=play&query=${encodeURIComponent(text)}&apikey=${global.apiyus}`;
            
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (res.status !== "success") return m.reply("Gagal mengambil lagu. Pastikan API kamu sedang aktif!");

            const { title, videoId, download_url } = res.result;

            let caption = `╭━━〔 🎵 *𝚈𝚃 𝙿𝙻𝙰𝚈* 〕━━┓\n`;
            caption += `┃ 📌 *𝚃𝚒𝚝𝚕𝚎:* ${title}\n`;
            caption += `┃ 🆔 *𝚅𝚒𝚍𝚎𝚘 𝙸𝙳:* ${videoId}\n`;
            caption += `┃ 🔗 *𝙰𝙿𝙸:* iyusztempest.my.id\n`;
            caption += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            caption += `_Sedang mengirim audio, mohon tunggu..._`;

            // Kirim info lagu terlebih dahulu
            await m.reply(caption);

            // Kirim file audio ke WhatsApp
            return await conn.sendMessage(m.chat, {
                audio: { url: download_url },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: "EUPHY MUSIC PLAYER",
                        body: title,
                        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                        sourceUrl: download_url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            return m.reply(`Terjadi kesalahan pada sistem API! ❌\n\n*Error:* ${e.message}`);
        }
    }
};
