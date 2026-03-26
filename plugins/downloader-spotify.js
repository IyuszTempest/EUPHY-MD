/**
 * Spotify Player/Downloader 🟢🎶
 * Powered by Furinn API System ✨
 * Format: Unified Plugin System
 */

const axios = require('axios');

module.exports = {
    command: ['spotify'],
    category: 'downloader',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) return m.reply(`Mau cari/download lagu apa dari Spotify?\n\n*Contoh:*\n${usedPrefix + command} Ado Vivarium`);

        await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } });

        try {
            // Memanggil API Play Spotify Furinn
            const apiUrl = `https://apii.furinn.my.id/api/play/spotify?q=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result) {
                return m.reply('❌ Lagu ga ditemukan atau gagal diproses oleh server.');
            }

            const res = data.result;

            // 1. Kirim Info & Cover Album Terlebih Dahulu
            let info = `╭━━〔 🟢 *𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙿𝙻𝙰𝚈𝙴𝚁* 〕━━┓\n`;
            info += `┃\n`;
            info += `┃ 🎼 *Judul:* ${res.title}\n`;
            info += `┃ 🎤 *Artis:* ${res.artist}\n`;
            info += `┃ 💿 *Album:* ${res.album}\n`;
            info += `┃\n`;
            info += `┗━━━━━━━━━━━━━━━━┛\n`;
            info += `_Sedang mengirim audio..._`;

            await conn.sendMessage(m.chat, { 
                image: { url: res.cover }, 
                caption: info 
            }, { quoted: m });

            // 2. Kirim Audio File
            // Menggunakan ptt: false agar dikirim sebagai audio file (bisa di-save)
            await conn.sendMessage(m.chat, { 
                audio: { url: res.download_url }, 
                mimetype: 'audio/mpeg', 
                ptt: false 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Terjadi kesalahan: ${e.message}\nPastikan server API sedang aktif.`);
        }
    }
};
                
