/**
 * Euphy-Bot - Get Plugin Tool ✨
 * Deskripsi: Mengambil isi kode file di folder plugins
 */

const fs = require('fs');
const path = require('path');

module.exports = {
    command: ['gp'],
    category: 'owner',
    owner: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`> Mau ambil plugin apa?\nContoh: *${usedPrefix + command} smeme.js*`);

        const filename = text.endsWith('.js') ? text : `${text}.js`;
        const pathPlugin = path.join(__dirname, filename);

        try {
            if (!fs.existsSync(pathPlugin)) {
                return m.reply(`> File *${filename}* tidak ditemukan di folder plugins!`);
            }

            const content = fs.readFileSync(pathPlugin, 'utf-8');

            let caption = `${content}`;

            await conn.sendMessage(m.chat, {
                text: caption,
                    contextInfo: {
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: idch,
                            newsletterName: namech,
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
        } catch (e) {
            console.error(e);
            m.reply(`❌ *Gagal mengambil plugin:* ${e.message}`);
        }
    }
};
