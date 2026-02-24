/**
 * Euphy-Bot - Delete Premium (Fixed Sync)
 * Menangani masalah database tidak terdeteksi
 */

module.exports = {
    command: ['delprem', 'unprem'],
    category: 'owner',
    owner: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // 1. Ambil target (dari reply, tag, atau ketik nomor)
        let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '';

        if (!who) return m.reply(`Siapa yang mau dicabut premiumnya?\nContoh: *${usedPrefix + command} @user*`);

        // 2. Cek Database secara mendalam
        let users = global.db.data.users;
        let user = users[who];

        // Jika tidak ketemu lewat JID, coba cari manual lewat nomor (siapa tahu nyangkut di @lid)
        if (!user) {
            let jidTanpaDomain = who.split('@')[0];
            let findJid = Object.keys(users).find(key => key.startsWith(jidTanpaDomain));
            if (findJid) {
                who = findJid;
                user = users[findJid];
            }
        }

        if (!user) return m.reply(`User *@${who.split('@')[0]}* tidak ada di database Euphy! ❌`);

        // 3. Eksekusi Pencabutan Status
        user.premium = false;
        user.premiumTime = 0;

        m.reply(`Berhasil mencabut status premium @${who.split('@')[0]}! ❌\nSekarang dia kembali jadi rakyat jelata. 🗿`, null, { mentions: [who] });
    }
}
