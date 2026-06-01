/**
 * Euphy-Bot - Donation System 💸
 * Support perkembangan bot Euphy lewat QRIS Natalius!
 */

module.exports = {
    command: ['donasi', 'donate', 'sedekah', 'qris', 'payment'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        const namabt = global.namebot;
        let caption = `*☕ Support ${namabt} ☕*\n\n`;
        caption += `Halo! Terima kasih sudah menggunakan ${namabt}. Jika kamu ingin membantu biaya maintenance server, pengembangan bot ini atau bayar premium/sewa, bisa melalui QRIS ini ya. Suppurt All Payment!\n\n`;
        const qrisUrl = global.qris; 

        try {
            if (qrisUrl) {
                await conn.sendMessage(m.chat, {
                image: { url: qrisUrl },
                caption: caption,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: idch,
                        newsletterName: namech,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });
            } else {
                // Jika global.qris kosong
               return m.reply(caption + `\n\n*(Ssst, Owner belum setting link QRIS di config!)*`);
            }
        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Gagal memuat gambar QRIS. Pastikan link di config.js aktif!`);
        }
    }
};
    
