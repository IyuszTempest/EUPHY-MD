/**
 * SoundCloud Player/Downloader 🟠🎶
 * Powered by Furinn API System ✨
 * Format: Unified Plugin System
 */

const axios = require('axios');

module.exports = {
    command: ['soundcloud', 'scplay'],
    category: 'downloader',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) return m.reply(`Mau cari/download lagu apa dari SoundCloud?\n\n*Contoh:*\n${usedPrefix + command} Kawaikute Gomen`);

        await conn.sendMessage(m.chat, { react: { text: '🟠', key: m.key } });

        try {
            // Memanggil API SoundCloud Furinn
            const apiUrl = `https://apii.furinn.my.id/api/play/soundcloud?query=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result) {
                return m.reply('❌ Lagu ga ditemukan di SoundCloud.');
            }

            const res = data.result;

            // 1. Kirim Info & Artwork
            let info = `╭━━〔 🟠 *𝚂𝙾𝚄𝙽𝙳𝙲𝙻𝙾𝚄𝙳 𝙿𝙻𝙰𝚈* 〕━━┓\n`;
            info += `┃\n`;
            info += `┃ 🎼 *Judul:* ${res.title}\n`;
            info += `┃ 🎤 *Artis:* ${res.artist}\n`;
            info += `┃ 🕒 *Durasi:* ${res.duration}\n`;
            info += `┃ ❤️ *Likes:* ${res.likes.toLocaleString()}\n`;
            info += `┃ ▶️ *Plays:* ${res.plays.toLocaleString()}\n`;
            info += `┃\n`;
            info += `┗━━━━━━━━━━━━━━━━━┛\n`;
            info += `_Sedang mengirim audio..._`;

            await conn.sendMessage(m.chat, { 
                image: { url: res.artwork }, 
                caption: info 
            }, { quoted: m });

            // 2. Kirim Audio File
            // Kita utamakan link downloadUrl yang disediakan API
            await conn.sendMessage(m.chat, { 
                audio: { url: res.downloadUrl }, 
                mimetype: 'audio/mpeg', 
                ptt: false 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Terjadi kesalahan: ${e.message}\nPastikan link masih aktif dan API tidak maintenance.`);
        }
    }
};
