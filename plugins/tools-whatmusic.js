/**
 * WhatMusic / Identify Music Plugin 🔍🎵
 * Powered by Furinn API System ✨
 * Format: Unified Plugin System
 */

const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');

module.exports = {
    command: ['whatmusic'],
    category: 'tools',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        // Validasi: Harus berupa audio atau video
        if (!/audio|video/.test(mime)) return m.reply(`Kirim atau reply audio/video dengan caption *${usedPrefix + command}* untuk mencari judul lagu!`);

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            // Download media ke temporary file
            let media = await q.download();
            let fileName = `./tmp/${m.sender}_${Date.now()}.mp3`;
            fs.writeFileSync(fileName, media);

            // Upload ke file hosting sementara (misal: Pomf.lain/Telegra.ph) untuk dapat URL
            // Di sini kita asumsikan butuh URL sesuai spek API kamu
            // Note: Kamu bisa pakai upload helper yang ada di bot-mu
            let { uploadFile } = require('../lib/uploadFile'); 
            let stats = await uploadFile(media);
            let urlMedia = stats.url;

            // Nembak API WhatMusic Furinn
            const apiUrl = `https://apii.furinn.my.id/api/search/whatmusic?url=${encodeURIComponent(urlMedia)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result || data.result.length === 0) {
                return m.reply('❌ Maaf, lagu ga berhasil dikenali. Pastikan audionya jelas!');
            }

            const res = data.result[0]; // Ambil hasil dengan skor tertinggi
            
            let caption = `╭━━〔 🔍 *𝙼𝚄𝚂𝙸𝙲 𝙸𝙳𝙴𝙽𝚃𝙸𝙵𝙸𝙴𝚁* 〕━━┓\n`;
            caption += `┃\n`;
            caption += `┃ 🎼 *Judul:* ${res.title}\n`;
            caption += `┃ 🎤 *Artis:* ${res.artist}\n`;
            caption += `┃ 📈 *Score:* ${res.score}%\n`;
            caption += `┃ 📅 *Rilis:* ${res.release}\n`;
            caption += `┃ 🕒 *Durasi:* ${res.duration}\n`;
            caption += `┃\n`;
            caption += `┣━━〔 🔗 *𝚂𝚃𝚁𝙴𝙰𝙼𝙸𝙽𝙶* 〕━━┓\n`;
            
            // Loop link streaming yang ada
            res.urls.forEach((link, i) => {
                if (link.includes('spotify')) caption += `┃ 🟢 [Spotify](${link})\n`;
                else if (link.includes('youtu')) caption += `┃ 🔴 [YouTube](${link})\n`;
                else if (link.includes('deezer')) caption += `┃ 🟣 [Deezer](${link})\n`;
            });
            
            caption += `┗━━━━━━━━━━━━━━━━┛\n`;
            caption += `_Semoga membantu ✨_`;

            await m.reply(caption);
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            // Hapus file sampah
            fs.unlinkSync(fileName);

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Terjadi kesalahan: ${e.message}`);
        }
    }
};
              
