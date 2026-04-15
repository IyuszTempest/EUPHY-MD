/**
 * Plugin: RedBull System 🥤
 */
module.exports = {
    command: ['beliredbull', 'use'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { command, text, usedPrefix }) => {
        let user = global.db.data.users[m.sender];
        user.inventory = user.inventory || { redbull: 0 };

        if (command === 'beliredbull') {
            let jml = parseInt(text) || 1;
            let harga = 25000 * jml;
            if (user.money < harga) return m.reply("Duit gak cukup!");
            user.money -= harga;
            user.inventory.redbull += jml;
            return m.reply(`🥤 Beli ${jml} RedBull berhasil! Sisa: Rp${user.money.toLocaleString()}`);
        }

        if (command === 'use' && text.includes('redbull')) {
            if (user.inventory.redbull < 1) return m.reply("Habis, beli dulu!");
            let cooldown = 3600000; // 1 Jam
            if (new Date - (user.lastkerja || 0) > cooldown) return m.reply("Kamu belum capek!");
            
            user.inventory.redbull -= 1;
            user.lastkerja = 0; // Reset cooldown kerja
            return m.reply("*Glek.. AH!* Stamina pulih! Bisa langsung kerja lagi. 🚀");
        }
    }
};
