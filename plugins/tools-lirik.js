/**
 * Lyric Search Plugin 🎵
 * Powered by Furinn API System ✨
 * Format: Unified Plugin System
 */

const axios = require('axios');

module.exports = {
    command: ['lirik'],
    category: 'tools',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) return m.reply(`Lagu apa yang mau dicari liriknya?\n\n*Contoh:*\n${usedPrefix + command} Tengaku Hanatan`);

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            // Memanggil API Lirik Furinn
            const apiUrl = `https://apii.furinn.my.id/api/search/lyrics?q=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result) {
                return m.reply('❌ Lirik tidak ditemukan. Coba masukkan nama artisnya juga!');
            }

            const res = data.result;

            // Menyusun pesan lirik
            let caption = `╭━━〔 🎸 *𝙻𝚈𝚁𝙸𝙲 𝚂𝙴𝙰𝚁𝙲𝙷* 〕━━┓\n`;
            caption += `┃\n`;
            caption += `┃ 🎼 *Judul:* ${res.title}\n`;
            caption += `┃ 🎤 *Artis:* ${res.artist}\n`;
            caption += `┃ 💿 *Album:* ${res.album || '-'}\n`;
            caption += `┃ 🕒 *Durasi:* ${res.duration_formatted}\n`;
            caption += `┃\n`;
            caption += `┣━━〔 📖 *𝙻𝚈𝚁𝙸𝙲𝚂* 〕━━┓\n\n`;
            caption += `${res.lyrics}\n\n`;
            caption += `┗━━━━━━━━━━━━━━━━┛\n`;
            caption += `_Mari karaoke bersama ✨_`;

            // Kirim lirik (menggunakan reply agar tidak spam gambar)
            await m.reply(caption);

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Gagal mencari lirik: ${e.message}`);
        }
    }
};
