/**
 * Plugin: Total Fitur & Command Counter 📊
 * Fitur: Menghitung jumlah file plugin dan total perintah yang terdaftar.
 */

const fs = require('fs');

module.exports = {
    command: ['totalfitur'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        // Pengecekan database user
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        try {
            await conn.sendMessage(m.chat, { react: { text: '🎸', key: m.key } });

            // Menghitung jumlah file plugin yang memiliki help dan tags aktif
            let totalFitur = Object.values(global.plugins)
                .filter(v => v.help && v.tags && !v.disabled)
                .length;

            // Menghitung total seluruh perintah/alias yang terdaftar
            let totalCommand = Object.values(global.plugins)
                .map(v => v.command)
                .filter(v => v)
                .map(v => Array.isArray(v) ? v.length : 1)
                .reduce((a, b) => a + b, 0);

            await conn.sendMessage(m.chat, { react: { text: '🌀', key: m.key } });

            let caption = `╭ 📊 *𝚂𝚃𝙰𝚃𝙸𝚂𝚃𝙸𝙺 𝙵𝙸𝚃𝚄𝚁*\n┃\n` +
                          `┣ 🔹 *Total Fitur:* ${totalPlugins} file\n` +
                          `┣ 📘 *Total Command:* ${totalCommand} perintah\n┃\n` +

            await conn.sendMessage(
                m.chat,
                { text: caption },
                { quoted: m }
            );

        } catch (e) {
            console.error(e);
            m.reply('> Terjadi kesalahan saat menghitung statistik fitur.');
        }
    }
};
