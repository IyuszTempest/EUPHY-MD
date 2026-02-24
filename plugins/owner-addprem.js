/**
 * Euphy-Bot - Add Premium
 * Only for Owner
 */

module.exports = {
    command: ['addprem'],
    category: 'owner',
    owner: true, // Proteksi khusus owner
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // Tentukan target: bisa dari reply chat atau tag @user
        let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '';
        
        if (!who) return m.reply(`Siapa yang mau dijadiin premium?\nContoh: *${usedPrefix + command} @user* atau reply chatnya.`);
        
        let user = global.db.data.users[who];
        if (!user) return m.reply(`User tidak ditemukan di database! ❌`);
        if (user.premium) return m.reply(`Dia sudah menjadi user premium sebelumnya! ✨`);

        // Update database
        user.premium = true;
        
        let cap = `*─── [ PREMIUM ADDED ] ───*\n\n`;
        cap += `👤 *User:* @${who.split('@')[0]}\n`;
        cap += `💎 *Status:* SEUMUR HIDUP\n\n`;
        cap += `Sekarang user tersebut bisa mengakses semua fitur premium Euphy! ✨`;

        conn.reply(m.chat, cap, m, { mentions: [who] });
    }
};
