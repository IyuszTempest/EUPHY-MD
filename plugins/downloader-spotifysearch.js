/**
 * Spotify Search Plugin 🟢🎵
 * Powered by Furinn API System ✨
 * Format: Unified Plugin System
 */

const axios = require('axios');

module.exports = {
    command: ['spotifysearch'],
    category: 'downloader',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) return m.reply(`Mau cari lagu apa di Spotify?\n\n*Contoh:*\n${usedPrefix + command} Vivarium Ado`);

        await conn.sendMessage(m.chat, { react: { text: '🟢', key: m.key } });

        try {
            // Nembak API Spotify Furinn dengan limit 5 sesuai JSON kamu
            const apiUrl = `https://apii.furinn.my.id/api/search/spotify?query=${encodeURIComponent(text)}&limit=5`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result || data.result.tracks.length === 0) {
                return m.reply('❌ Lagu ga ditemukan di Spotify. Coba judul lain!');
            }

            const tracks = data.result.tracks;
            let caption = `╭━━〔 🟢 *𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝚂𝙴𝙰𝚁𝙲𝙷* 〕━━┓\n`;
            caption += `┃ 🔍 *Query:* ${text}\n`;
            caption += `┃\n`;

            tracks.forEach((track, i) => {
                caption += `┃ *${i + 1}. ${track.title}*\n`;
                caption += `┃    └ 🎤 *Artis:* ${track.artist}\n`;
                caption += `┃    └ 💿 *Album:* ${track.album}\n`;
                caption += `┃    └ 🕒 *Durasi:* ${track.duration}\n`;
                caption += `┃    └ 🔗 [Buka di Spotify](${track.spotify_url})\n`;
                caption += `┃\n`;
            });

            caption += `┗━━━━━━━━━━━━━━━━━━┛\n`;
            caption += `_Bantu bot Euphy agar bisa online 24 jam dengan .donasi ✨_`;

            // Kirim pesan dengan thumbnail dari lagu pertama biar estetik
            await conn.sendMessage(m.chat, { 
                image: { url: tracks[0].image }, 
                caption: caption 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Terjadi kesalahan: ${e.message}\nCoba lagi beberapa saat lagi.`);
        }
    }
};
