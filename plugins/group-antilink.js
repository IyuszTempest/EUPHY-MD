/**
 * Euphy-Bot - Antilink Sistem Peringatan (Ultra Fix) 🛡️
 */

module.exports = {
    command: ['antilink'],
    category: 'group',
    group: true, 
    admin: true, 
    
    before: async (m, { conn, isAdmin, isBotAdmin }) => {
        if (!m.isGroup || m.fromMe) return false;
        if (!m.text) return false; // Pastikan ada teks untuk di-scan

        // --- PAKSA INISIALISASI DATABASE ---
        global.db = global.db || { data: {} };
        global.db.data = global.db.data || {};
        global.db.data.chats = global.db.data.chats || {};
        global.db.data.users = global.db.data.users || {};
        
        let chat = global.db.data.chats[m.chat];
        if (!chat) chat = global.db.data.chats[m.chat] = { antilink: false };

        // Jika fitur mati, jangan lanjut
        if (!chat.antilink) return false;

        const groupLink = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
        const containsLink = groupLink.test(m.text);

        if (containsLink && !isAdmin && isBotAdmin) {
            // Inisialisasi user per grup
            const userKey = `${m.sender}_${m.chat}`;
            if (!global.db.data.users[userKey]) global.db.data.users[userKey] = { warning: 0 };
            let user = global.db.data.users[userKey];

            user.warning += 1;

            // Hapus pesan pelanggaran secepat mungkin
            await conn.sendMessage(m.chat, { delete: m.key });

            if (user.warning < 2) {
                return conn.sendMessage(m.chat, { 
                    text: `*⚠️ PERINGATAN (1/2) ⚠️*\n\n@${m.sender.split('@')[0]}, jangan kirim link grup lain! Satu kali lagi kamu akan di-kick otomatis.`,
                    mentions: [m.sender]
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { 
                    text: `*🚫 PELANGGARAN KEDUA 🚫*\n\nMaaf @${m.sender.split('@')[0]}, kamu dikeluarkan dari grup.`,
                    mentions: [m.sender]
                });
                
                user.warning = 0; // Reset data

                // Eksekusi Kick
                return setTimeout(async () => {
                    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                }, 800);
            }
        }
        return true;
    },

    call: async (conn, m, { args, usedPrefix, command }) => {
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { antilink: false };
        let chat = global.db.data.chats[m.chat];

        if (!args[0]) return m.reply(`*Format:* ${usedPrefix + command} on/off`);

        if (args[0] === 'on') {
            chat.antilink = true;
            m.reply('✅ *Antilink Aktif!*\nSistem: 1x Peringatan, 2x Kick.');
        } else if (args[0] === 'off') {
            chat.antilink = false;
            m.reply('⚠️ *Antilink dimatikan.*');
        }
    }
};
      
