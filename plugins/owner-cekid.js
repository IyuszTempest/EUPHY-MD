/**
 * Plugin: Cek ID Owner & Bot 🤖👑
 * Fitur: Mengambil JID pengelola dan JID sistem bot yang sedang aktif.
 */

module.exports = {
    command: ['cekid'],
    category: 'owner',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        // Pengecekan database user
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        await conn.sendMessage(m.chat, { react: { text: '🆔', key: m.key } });

        // Mengambil ID sistem dan ID pengirim
        let botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        let ownerJid = '6282155827670@s.whatsapp.net'; // ID Owner Utama

        let caption = `╭━━〔 🆔 *𝙸𝙳𝙴𝙽𝚃𝙸𝚃𝙰𝚂 𝚂𝙸𝚂𝚃𝙴𝙼* 〕━━┓\n┃\n` +
                      `┣ 🤖 *ID Bot:* ${botJid}\n` +
                      `┣ 👑 *ID Owner:* ${ownerJid}\n` +
                      `┣ 👤 *ID Anda:* ${m.sender}\n┃\n` +
                      `┗━━━━━━━━━━━━━━━━━━┛\n\n` +
                      `Gunakan ID di atas untuk keperluan konfigurasi script atau database.`;

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: "Identity Detector",
                    body: "WhatsApp JID Checker",
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
