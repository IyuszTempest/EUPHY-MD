/**
 * Plugin: Random NSFW Hentai Image Finder 🔞⛩
 * Deskripsi: Mengambil gambar hentai secara acak via Theresav API.
 * Style: Simple & Clean ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['hentai'],
    category: 'nsfw',
    noPrefix: false,
    premium: true,
    call: async (conn, m, { command }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: '🔞', key: m.key } });

            const imageUrl = `https://api.theresav.biz.id/nsfw/hentai?apikey=${global.thrsavapi}`;
            await conn.sendMessage(m.chat, {
                image: { url: imageUrl },
                caption: `*N S F W  H E N T A I*`,
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
            console.error("Theresav NSFW Hentai Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Gagal mengambil gambar:* ${err.message || "Terjadi masalah pada API."}`);
        }
    }
};
