/**
 * Plugin: Random Cosplay Image Finder 📸⛩
 * Deskripsi: Mengambil gambar cosplay secara acak via Theresav API.
 * Style: Simple & Clean ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['cosplay'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { command }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: '📸', key: m.key } });

            // Ambil URL gambar langsung dari endpoint random cosplay API Theresav
            const imageUrl = `https://api.theresav.biz.id/random/cosplay?apikey=${global.thrsavapi}`;

            // Kirim gambar dengan format terusan Newsletter minimalis
            await conn.sendMessage(m.chat, {
                image: { url: imageUrl },
                caption: `*R A N D O M  C O S P L A Y*`,
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
            console.error("Theresav Random Cosplay Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Gagal mengambil gambar:* ${err.message || "Terjadi masalah pada API."}`);
        }
    }
};
