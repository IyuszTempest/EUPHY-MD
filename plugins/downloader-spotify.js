/**
 * Euphy-Bot - Spotify Search & Download ✨
 * Gabungan Search + Downloader
 */

const axios = require('axios');

module.exports = {
    command: ['spotify'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`*Contoh:* ${usedPrefix + command} vivarium ado`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

            // 1. Tahap Pencarian [cite: 2026-03-07]
            const searchUrl = `https://api.vreden.my.id/api/v1/search/spotify?query=${encodeURIComponent(text)}&limit=1`;
            const searchRes = await axios.get(searchUrl);
            
            if (!searchRes.data.status || searchRes.data.result.search_data.length === 0) {
                throw "Lagu nggak ketemu.";
            }

            const track = searchRes.data.result.search_data[0];
            const songLink = track.song_link;

            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            // 2. Tahap Download [cite: 2026-03-07]
            const downloadUrl = `https://api.vreden.my.id/api/v1/download/spotify?url=${encodeURIComponent(songLink)}`;
            const dlRes = await axios.get(downloadUrl);

            if (!dlRes.data.status) throw "Gagal konversi lagu ke MP3.";

            const data = dlRes.data.result;
            
            let capt = `╭━━〔 ⛩️ *𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙿𝙻𝙰𝚈* ⛩️ 〕━━┓\n`;
            capt += `┃ 🎵 *Title:* ${data.title}\n`;
            capt += `┃ 👤 *Artist:* ${data.artists}\n`;
            capt += `┃ 💿 *Album:* ${data.album}\n`;
            capt += `┃ 📅 *Release:* ${data.release_date}\n`;
            capt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            capt += `*Euphylia Magenta* - Musik buat Kamu! ✨`;

            // 3. Kirim Info & Audio
            await conn.sendMessage(m.chat, {
                text: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝙽𝙾𝚆 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶...',
                        body: data.title,
                        thumbnailUrl: data.cover_url,
                        sourceUrl: songLink,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { 
                audio: { url: data.download }, 
                mimetype: 'audio/mpeg',
                fileName: `${data.title}.mp3`
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || "API lagi sibuk atau limit."}`);
        }
    }
};
