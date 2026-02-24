/**
 * Euphy-Bot - List Premium
 * Menampilkan daftar user premium beserta sisa waktunya
 */

module.exports = {
    command: ['listprem'],
    category: 'info',
    noPrefix: true,
    call: async (conn, m, { usedPrefix }) => {
        let users = global.db.data.users
        let premiumUsers = Object.entries(users).filter(([id, user]) => user.premium)

        if (premiumUsers.length === 0) return m.reply(`Belum ada user premium, Yus. Sedih banget... 🥲`)

        let txt = `*─── [ PREMIUM USER LIST ] ───*\n\n`
        txt += `Total: *${premiumUsers.length}* User\n\n`

        premiumUsers.forEach(([id, user], i) => {
    // Safety check: Pastikan premiumTime adalah angka
    let pTime = typeof user.premiumTime === 'number' ? user.premiumTime : 0;
    let sisaWaktu = pTime - Date.now();
    let status = "";

    if (pTime === 0) {
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

    txt += `${i + 1}. @${id.split('@')[0]}\n`;
    txt += `   ⏳ Sisa: *${status}*\n`;
    txt += `   📅 Exp: ${pTime > 0 ? new Date(pTime).toLocaleDateString('id-ID') : 'Infinity'}\n\n`;
});

        txt += `_Gunakan *${usedPrefix}addprem* untuk menambah durasi._`

        conn.reply(m.chat, txt, m, { mentions: premiumUsers.map(([id]) => id) })
    }
}
