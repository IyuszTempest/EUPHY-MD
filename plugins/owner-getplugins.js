/**
 * Euphy-Bot - Get Plugin Tool ✨
 * Deskripsi: Mengambil isi kode file di folder plugins
 */

const fs = require('fs');
const path = require('path');

module.exports = {
    command: ['gp'],
    category: 'owner',
    owner: true, // WAJIB OWNER! Bahaya kalau user biasa bisa intip session atau apikey
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Mau ambil plugin apa? 🗿\nContoh: *${usedPrefix + command} smeme.js*`);

        // Pastikan input nama file benar
        const filename = text.endsWith('.js') ? text : `${text}.js`;
        const pathPlugin = path.join(__dirname, filename);

        try {
            // 1. Cek apakah filenya ada
            if (!fs.existsSync(pathPlugin)) {
                return m.reply(`❌ File *${filename}* tidak ditemukan di folder plugins!`);
            }

            // 2. Baca isi file
            const content = fs.readFileSync(pathPlugin, 'utf-8');

            // 3. Kirim hasilnya
            // Kita bungkus pakai backtick (```) biar tampilannya jadi blok kode di WA
            let caption = `⛩️ *PLUGIN SOURCE CODE* ⛩️\n\n`;
            caption += `📂 *File:* ${filename}\n`;
            caption += `📏 *Size:* ${fs.statSync(pathPlugin).size} bytes\n\n`;
            caption += `\`\`\`javascript\n${content}\n\`\`\``;

            await m.reply(caption);

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Gagal mengambil plugin:* ${e.message}`);
        }
    }
};
