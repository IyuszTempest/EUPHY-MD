/**
 * Plugin: Random Loli Image Finder 🌸⛩
 * Deskripsi: Mengambil gambar anime loli secara acak via Theresav API.
 * Style: Simple & Clean ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['loli', 'rdloli', 'randomloli'],
    category: 'anime',
    noPrefix: true,
    call: async (conn, m, { command }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: '🌸', key: m.key } });

            // Ambil URL gambar langsung dari endpoint random API Theresav
            const imageUrl = `https://api.theresav.biz.id/random/loli?apikey=${global.thrsavapi}`;

            // Kirim gambar dengan format terusan Newsletter minimalis
            await conn.sendMessage(m.chat, {
                image: { url: imageUrl },
                caption: `*R A N D O M  L O L I*`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: global.namech,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error("Theresav Random Loli Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Gagal mengambil gambar:* ${err.message || "Terjadi masalah pada API."}`);
        }
    }
};
