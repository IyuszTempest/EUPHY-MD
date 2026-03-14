/**
 * Euphy-Bot - YouTube Play Downloader
 * Updated to ZiaUlhaq API ✨
 */

const axios = require('axios');
const yts = require('yt-search'); // Pastikan sudah install library ini: npm install yt-search

module.exports = {
    command: ['play'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Masukkan judul lagunya, Yus! Contoh: *${usedPrefix + command} Kawaikute Gomen*`);

        await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

        try {
            // 1. Cari video di YouTube berdasarkan text/judul
            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return m.reply("Aduh, lagunya nggak ketemu nih... Coba judul lain?");

            const videoUrl = video.url;

            // 2. Tembak ke API ZiaUlhaq buat dapetin link download MP3
            const apiUrl = `https://api.ziaul.my.id/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`;
            const { data } = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            if (!data.status || !data.result) throw new Error("Gagal convert ke MP3 via ZiaUlhaq API.");

            const { title, duration, downloadUrl, thumbnail } = data.result;

            // 3. Susun Caption biar estetik ala bot gaul
            let caption = `╭━━〔 🎵 *𝙴𝚄𝙿𝙷𝚈 𝙿𝙻𝙰𝚈* 〕━━┓\n`;
            caption += `┃ 📌 *𝚃𝚒𝚝𝚕𝚎:* ${title}\n`;
            caption += `┃ ⏳ *𝙳𝚞𝚛𝚊𝚝𝚒𝚘𝚗:* ${duration}\n`;
            caption += `┃ 🔗 *𝚂𝚘𝚞𝚛𝚌𝚎:* YouTube\n`;
            caption += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            caption += `_Sabar ya Yus, audionya lagi meluncur..._ 🚀`;

            await conn.sendMessage(m.chat, { 
                image: { url: thumbnail || video.thumbnail }, 
                caption: caption 
            }, { quoted: m });

            // 4. Kirim Audio
            await conn.sendMessage(m.chat, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: "EUPHY MUSIC PLAYER",
                        body: `Playing: ${title}`,
                        thumbnailUrl: thumbnail || video.thumbnail,
                        sourceUrl: videoUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error("Error Play:", e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`Yah error... ❌\n*Pesan:* ${e.message || "API ZiaUlhaq lagi sibuk kali ya?"}`);
        }
    }
};
                
