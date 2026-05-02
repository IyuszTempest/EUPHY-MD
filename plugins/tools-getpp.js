/**
 * Plugin: Get Profile Picture (GetPP) 📸⛩️
 * Fitur: Mengambil foto profil user via mention atau reply.
 * Mode: Unified Plugin System (module.exports)
 */

const PhoneNumber = require('awesome-phonenumber');

module.exports = {
    command: ['getpp'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        // Menentukan target: mention, reply, atau diri sendiri
        let who = m.mentionedJid?.[0] 
            ? m.mentionedJid[0] 
            : m.quoted?.sender 
            ? m.quoted.sender 
            : m.sender;

        // Bersihkan format nomor agar menjadi JID yang valid
        let number = who.split('@')[0];
        let jid = PhoneNumber('+' + number).getNumber('e164').replace('+', '') + '@s.whatsapp.net';

        // Gambar default kalau target gak pasang PP atau di-private
        let pp = 'https://i.ibb.co/31VZ8vv/avatar-contact.png'; 

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            // Ambil URL foto profil asli dari server WhatsApp
            pp = await conn.profilePictureUrl(jid, 'image');
        } catch (e) {
            console.log(`[GETPP] Gagal ambil PP ${jid}:`, e.message);
            // Tetap lanjut pakai gambar default jika gagal (karena privasi user)
        }

        // Kirim file foto profilnya ke chat
        await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption: `乂 *GET PROFILE*\n\n📸 *User:* @${jid.split('@')[0]}\n🔗 *Link:* ${pp}`,
            mentions: [jid]
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
};
