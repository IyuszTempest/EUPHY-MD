/**
 * Style: Simple & Clean ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['cecancina'],
    category: 'anime',
    noPrefix: true,
    call: async (conn, m, { command }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: '🌸', key: m.key } });

            const imageUrl = `https://api.nexray.eu.cc/random/cecan/china`;

            await conn.sendMessage(m.chat, {
                image: { url: imageUrl },
                caption: `> Aduhai Cantiknyo`,
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
