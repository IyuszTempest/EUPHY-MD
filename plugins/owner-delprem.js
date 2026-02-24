/**
 * Euphy-Bot - Delete Premium
 * Only for Owner
 */

module.exports = {
    command: ['delprem'],
    category: 'owner',
    owner: true,
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '';
        
        if (!who) return m.reply(`Siapa yang mau dicabut premiumnya?\nContoh: *${usedPrefix + command} @user* atau reply chatnya.`);
        
        let user = global.db.data.users[who];
        if (!user) return m.reply(`User tidak ditemukan di database! ❌`);
        if (!user.premium) return m.reply(`User tersebut memang bukan user premium. 👤`);

        // Update database
        user.premium = false;
        
        let cap = `*─── [ PREMIUM REMOVED ] ───*\n\n`;
        cap += `👤 *User:* @${who.split('@')[0]}\n`;
        cap += `❌ *Status:* Dicabut\n\n`;
        cap += `Akses fitur premium telah dinonaktifkan untuk user ini.`;

        conn.reply(m.chat, cap, m, { mentions: [who] });
    }
};
