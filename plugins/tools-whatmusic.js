/**
 * WhatMusic / Identify Music (Catbox Fixed) 🔍🎵
 * Powered by Furinn API System ✨
 * Format: Unified Plugin System
 */

const axios = require('axios');
const FormData = require('form-data');

module.exports = {
    command: ['whatmusic'],
    category: 'tools',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        // Validasi: Harus berupa audio atau video
        if (!/audio|video/.test(mime)) return m.reply(`Kirim atau reply audio/video dengan caption *${usedPrefix + command}* buat nyari judul lagunya!`);

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            // 1. Download media dari WhatsApp
            let media = await q.download();
            
            // 2. Fungsi Upload ke Catbox (Inline biar gak error 'not a function')
            const catboxUpload = async (buffer) => {
                const formData = new FormData();
                formData.append('reqtype', 'fileupload');
                formData.append('fileToUpload', buffer, { filename: 'identify.mp3' });
                
                const response = await axios.post('https://catbox.moe/user/api.php', formData, {
                    headers: { ...formData.getHeaders() }
                });
                return response.data; // Balikannya langsung URL string
            };

            const urlMedia = await catboxUpload(media);
            
            if (!urlMedia.includes('https://files.catbox.moe/')) {
                throw new Error("Gagal dapet link dari Catbox.");
            }

            // 3. Nembak API WhatMusic Furinn pakai URL dari Catbox
            const apiUrl = `https://apii.furinn.my.id/api/search/whatmusic?url=${encodeURIComponent(urlMedia)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result || data.result.length === 0) {
                return m.reply('❌ Waduh, lagunya gak ketemu. Pastikan suaranya jelas ya!');
            }

            const res = data.result[0]; // Ambil hasil paling akurat
            
            let caption = `╭━━〔 🔍 *𝙼𝚄𝚂𝙸𝙲 𝙸𝙳𝙴𝙽𝚃𝙸𝙵𝙸𝙴𝚁* 〕━━┓\n`;
            caption += `┃\n`;
            caption += `┃ 🎼 *Judul:* ${res.title}\n`;
            caption += `┃ 🎤 *Artis:* ${res.artist}\n`;
            caption += `┃ 📈 *Akurasi:* ${res.score}%\n`;
            caption += `┃ 📅 *Rilis:* ${res.release}\n`;
            caption += `┃ 🕒 *Durasi:* ${res.duration}\n`;
            caption += `┃\n`;
            caption += `┣━━〔 🔗 *𝚂𝚃𝚁𝙴𝙰𝙼𝙸𝙽𝙶* 〕━━┓\n`;
            
            // Link streaming
            if (res.urls && res.urls.length > 0) {
                res.urls.forEach((link) => {
                    if (link.includes('spotify')) caption += `┃ 🟢 Spotify: ${link}\n`;
                    else if (link.includes('youtu')) caption += `┃ 🔴 YouTube: ${link}\n`;
                    else if (link.includes('deezer')) caption += `┃ 🟣 Deezer: ${link}\n`;
                });
            } else {
                caption += `┃ _Link streaming gak tersedia._\n`;
            }
            
            caption += `┗━━━━━━━━━━━━━━━━━━┛\n`;
            caption += `_Semoga membantu ✨_`;

            await m.reply(caption);
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Terjadi kesalahan: ${e.message}\nCoba cek log terminal kamu.`);
        }
    }
};
