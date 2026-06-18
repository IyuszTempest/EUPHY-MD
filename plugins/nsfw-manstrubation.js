/**
 * Plugin: Random NSFW Masturbation Image Finder 🔞⛩
 * Deskripsi: Mengambil gambar kategori dewasa secara acak via Theresav API.
 * Style: Simple & Clean ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['manstrubation'],
    category: 'nsfw',
    noPrefix: true,
    premium: true,
    call: async (conn, m, { command }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: '🔞', key: m.key } });

            // Ambil URL gambar langsung dari endpoint NSFW API Theresav
            const imageUrl = `https://api.theresav.biz.id/nsfw/manstrubation?apikey=${global.thrsavapi}`;

            // Kirim gambar dengan format terusan Newsletter minimalis
            await conn.sendMessage(m.chat, {
                image: { url: imageUrl },
                caption: `*N S F W  M A S T U R B A T I O N*`,
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
            console.error("Theresav NSFW Masturbation Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Gagal mengambil gambar:* ${err.message || "Terjadi masalah pada API."}`);
        }
    }
};
