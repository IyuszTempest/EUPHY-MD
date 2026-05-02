/**
 * Plugin: Cek ID Saluran (Newsletter JID) 🔍📢
 * Fitur: Mengambil ID JID dari pesan Saluran yang di-forward atau di-reply.
 */

module.exports = {
    command: ['cekidch', 'jidch', 'newsletterjid'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        // Pengecekan database user
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        // Mendeteksi pesan yang di-reply atau di-forward
        let q = m.quoted ? m.quoted : m;
        let newsletterJid = q.msg?.contextInfo?.forwardedNewsletterMessageInfo?.newsletterJid;

        // Validasi jika ID tidak ditemukan
        if (!newsletterJid) {
            return m.reply(`🚩 *Gagal mendapatkan ID Saluran.*\n\nPastikan Anda me-reply pesan yang berasal dari saluran/newsletter.`);
        }

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        // Menyusun informasi ID Saluran
        let caption = `╭━━〔 📢 *𝙸𝙳 𝚂𝙰𝙻𝚄𝚁𝙰𝙽* 〕━━┓\n┃\n` +
                      `┣ 🆔 *JID:* ${newsletterJid}\n┃\n` +
                      `┗━━━━━━━━━━━━━━┛\n\n` +
                      `Gunakan ID di atas untuk keperluan konfigurasi plugin saluran.`;

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: "Channel ID Detector",
                    body: newsletterJid,
                    thumbnailUrl: "https://i.ibb.co/31VZ8vv/avatar-contact.png",
                    sourceUrl: null,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
};
