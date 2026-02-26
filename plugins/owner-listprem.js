/**
 * Euphy-Bot - List Premium (LID & JID Edition)
 * Menampilkan daftar user premium dengan deteksi ganda
 */

module.exports = {
    command: ['listprem'],
    category: 'info',
    noPrefix: true,
    call: async (conn, m, { usedPrefix }) => {
        // Ambil database dengan Optional Chaining agar tidak crash
        let users = global.db?.data?.users || {}
        
        // Filter user yang punya status premium atau premiumTime aktif
        let premiumUsers = Object.entries(users).filter(([id, user]) => {
            const isPrem = user?.premium === true || user?.premium === 'true';
            const hasTime = (typeof user?.premiumTime === 'number' && user.premiumTime > Date.now());
            const isPermanent = user?.premiumTime === 0 || user?.premiumTime === -1;
            return isPrem || hasTime || isPermanent;
        })

        // Jika kosong, kita coba cek juga di daftar global.owner atau global.lidowner
        if (premiumUsers.length === 0) {
            return m.reply(`Belum ada user premium yang terdaftar di database. 🥲\n\n_Coba ketik .addprem @user 30 dulu ya!`)
        }

        let txt = `*─── [ PREMIUM USER LIST ] ───*\n\n`
        txt += `Total: *${premiumUsers.length}* User ✨\n\n`

        premiumUsers.forEach(([id, user], i) => {
            // Safety check data
            let pTime = typeof user?.premiumTime === 'number' ? user.premiumTime : 0;
            let sisaWaktu = pTime - Date.now();
            let status = "";

            if (pTime === 0 || pTime === -1) {
                status = "Seumur Hidup / Permanen";
            } else if (sisaWaktu <= 0) {
                status = "Expired (Menunggu Reset)";
            } else {
                let hari = Math.floor(sisaWaktu / 86400000);
                let jam = Math.floor((sisaWaktu % 86400000) / 3600000);
                let menit = Math.floor((sisaWaktu % 3600000) / 60000);
                let detik = Math.floor((sisaWaktu % 60000) / 1000);
                
                if (hari > 0) status += `${hari}h `;
                if (jam > 0) status += `${jam}j `;
                if (menit > 0) status += `${menit}m `;
                status += `${detik}s`;
            }

            // Deteksi apakah ID tersebut adalah LID atau JID
            let displayName = id.includes('@lid') ? `LID: ${id.split('@')[0]}` : `@${id.split('@')[0]}`;
            
            txt += `${i + 1}. ${displayName}\n`;
            txt += `   ⏳ Sisa: *${status}*\n`;
            txt += `   📅 Exp: ${pTime > 0 ? new Date(pTime).toLocaleDateString('id-ID') : 'Infinity'}\n\n`;
        });

        txt += `_Bot running on Node ${process.version} @ Lunes Host_`

        // Kirim dengan mention yang mendukung LID/JID
        conn.reply(m.chat, txt, m, { 
            contextInfo: {
                mentionedJid: premiumUsers.map(([id]) => id),
                // Tambahkan fkontak kalau kamu punya fiturnya di handler
            }
        })
    }
    }
