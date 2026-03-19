/** * Euphy-Bot - Smeme Maker (Meme Sticker) ✨
 * No heavy libraries, uses fast external API.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getRandom } = require('./lib/functions'); // Sesuaikan path fungsi getRandom bot kamu

module.exports = {
    command: ['smeme'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        // Cek apakah ada teks
        if (!text) return m.reply(`*Contoh:* Reply sticker dengan ketik *${usedPrefix + command} Teks Atas | Teks Bawah*`);

        // Cek apakah me-reply sticker
        if (!m.quoted || !m.quoted.message || !m.quoted.message.stickerMessage) {
            return m.reply("❌ Reply stickernya dulu!");
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: "✍️", key: m.key } });

            // Pisahin teks atas & bawah pakai pemisah '|'
            let [t1, t2] = text.split('|');
            t1 = t1 ? t1.trim() : '_'; // Default kalau kosong
            t2 = t2 ? t2.trim() : '_';

            // Nama file temp
            let encmedia = `target_${getRandom('.webp')}`;
            let media = `result_${getRandom('.webp')}`;

            // 1. Download sticker yang di-reply
            let buff = await conn.downloadAndSaveMediaMessage(m.quoted, encmedia);
            
            // 2. Upload & Generate Meme via API (Super Fast)
            let { uploadMedia } = require('./lib/functions'); // Sesuaikan path fungsi upload bot kamu
            let mediaUrl = await uploadMedia(buff.path);

            // Ganti ini dengan API Smeme yang kamu punya atau pakai yang stabil
            // format: https://api.memegen.link/images/custom/${atas}/${bawah}.webp?background=${url_sticker}
            let memeUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(t1)}/${encodeURIComponent(t2)}.webp?background=${mediaUrl}`;

            // 3. Kirim hasil sebagai Sticker
            await conn.sendImageAsSticker(m.chat, memeUrl, m, {
                packname: global.packname || 'Euphy-Bot',
                author: global.author || 'by IyuszTempest',
                categories: ['🤩', '💖', '😹'],
                keepScale: true // Biar stickernya gak gepeng
            });

            // 4. Cleanup file temp
            if (fs.existsSync(encmedia)) fs.unlinkSync(encmedia);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`❌ *Error:* Gagal membuat smeme.`);
        }
    }
};
