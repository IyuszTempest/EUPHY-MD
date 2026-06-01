/**
 * Plugin: Total Fitur & Command Counter 📊
 * Fitur: Menghitung jumlah file plugin dan total perintah yang terdaftar.
 */

const fs = require('fs');

module.exports = {
    command: ['totalcmd'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        try {
            await conn.sendMessage(m.chat, { react: { text: '🎸', key: m.key } });

            let totalFitur = Object.values(global.plugins)
                .filter(v => v.help && v.tags && !v.disabled)
                .length;

            let totalCommand = Object.values(global.plugins)
                .map(v => v.command)
                .filter(v => v)
                .map(v => Array.isArray(v) ? v.length : 1)
                .reduce((a, b) => a + b, 0);

            await conn.sendMessage(m.chat, { react: { text: '🌀', key: m.key } });

            let caption = `📘 *Total Command:* ${totalCommand} perintah\n`;

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

            await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: '😢', key: m.key } });
            return m.reply('> Terjadi kesalahan saat menghitung statistik fitur.');
        }
    }
};
