/**
 * Euphy-Bot - Add Premium (Final Notification Fix)
 * Only for Owner
 */

module.exports = {
    command: ['addprem'],
    category: 'owner',
    owner: true,
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // 1. Ambil target (Support LID & JID)
        let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[^0-9]/g, '') + (args[0].includes('@lid') ? '@lid' : '@s.whatsapp.net') : '';
        
        if (!who) return m.reply(`Siapa yang mau dijadiin premium? 🗿\nContoh: *${usedPrefix + command} @user 30*`);

        let users = global.db.data.users;
        
        // 2. Sinkronisasi Database
        if (!users[who]) {
            let idOnly = who.split('@')[0];
            let target = Object.keys(users).find(k => k.includes(idOnly));
            if (target) who = target;
        }

        if (!users[who]) return m.reply(`User tidak ditemukan di database! ❌`);

        // 3. Hitung Durasi (Ganti 1000 jadi 86400000 kalau sudah selesai tes 15 detik)
        let duration = args[1] && !isNaN(args[1]) ? parseInt(args[1]) : 30;
        let expired = Date.now() + (duration * 86400000);
        let tglExpired = new Date(expired).toLocaleString('id-ID');

        // 4. Update Database
        users[who].premium = true;
        users[who].premiumTime = expired;
        
        // 5. Kirim Notifikasi (URUTAN PENTING!)
        try {
            // A. Balas di tempat perintah diketik
            let cap = `*─── [ PREMIUM ADDED ] ───*\n\n`;
            cap += `👤 *User:* @${who.split('@')[0]}\n`;
            cap += `⏳ *Durasi:* ${duration} Hari\n`;
            cap += `📅 *Expired:* ${tglExpired}\n\n`;
            cap += `Berhasil diaktifkan! ✨`;
            await conn.reply(m.chat, cap, m, { mentions: [who] });

            // B. Kirim PC ke USER
            let userMsg = `Selamat! Status kamu sekarang adalah *PREMIUM*. 🎉\n\n*Durasi:* ${duration} Detik\n*Expired:* ${tglExpired}\n\nTerima kasih sudah berlangganan! 🌸`;
            await conn.sendMessage(who, { text: userMsg });

            // C. Kirim PC ke YOU (Owner)
            let ownerId = global.owner[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            let ownerMsg = `[ NOTIF ADD PREM ]\n\nBerhasil menambah premium ke @${who.split('@')[0]}\nID: ${who}\nDurasi: ${duration} Detik\n\nDatabase aman. ✅`;
            await conn.sendMessage(ownerId, { text: ownerMsg, mentions: [who] });

        } catch (e) {
            console.error(e);
            m.reply(`Status update di DB, tapi gagal kirim notifikasi PC. Mungkin karena bot belum chat sama usernya.`);
        }
    }
};
