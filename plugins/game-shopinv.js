/**
 * Plugin: Shop & Inventory Game 🏪
 */

module.exports = {
    command: ['shop', 'beli', 'use', 'inv'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { command, text }) => {
        let user = global.db.data.users[m.sender];
        
        // Inisialisasi Inventory jika belum ada
        if (typeof user.inventory === 'undefined') user.inventory = { energy_drink: 0 };
        if (typeof user.money === 'undefined') user.money = 0;

        // --- [ 1. MENU SHOP ] ---
        if (command === 'shop') {
            let teks = `🏪 *EUPHY ENERGY SHOP* 🏪\n\n`;
            teks += `1. *Energy Drink* 🥤\n`;
            teks += `   - Efek: Menghapus Cooldown Kerja\n`;
            teks += `   - Harga: Rp25.000\n\n`;
            teks += `Cara beli: *.beli energy 1*`;
            return m.reply(teks);
        }

        // --- [ 2. LOGIKA BELI ] ---
        if (command === 'beli') {
            if (!text || !text.includes('energy')) return m.reply(`Contoh: *.beli energy 1*`);
            let jumlah = parseInt(text.replace(/[^0-9]/g, '')) || 1;
            let hargaPerItem = 25000;
            let totalHarga = hargaPerItem * jumlah;

            if (user.money < totalHarga) {
                return m.reply(`Duit kamu kurang Rp${(totalHarga - user.money).toLocaleString()}! Ayo kerja lagi. 💸`);
            }

            user.money -= totalHarga;
            user.inventory.energy_drink += jumlah;
            return m.reply(`Berhasil beli *${jumlah} Energy Drink*! 🥤\nSisa Saldo: Rp${user.money.toLocaleString()}`);
        }

        // --- [ 3. LOGIKA PAKAI ITEM ] ---
        if (command === 'use') {
            if (!text || !text.includes('energy')) return m.reply(`Gunakan apa? Contoh: *.use energy*`);
            if (user.inventory.energy_drink < 1) return m.reply(`Kamu nggak punya Energy Drink! Beli dulu di *.shop*`);

            // Cek apakah user sedang cooldown kerja
            let cooldown = 3600000; 
            if (new Date - user.lastkerja > cooldown) {
                return m.reply(`Kamu belum capek, simpan aja dulu minumannya buat nanti! 😉`);
            }

            user.inventory.energy_drink -= 1;
            user.lastkerja = 0; // RESET COOLDOWN
            return m.reply(`*Glek.. glek.. AH!* 🥤\nStamina pulih! Kamu bisa langsung *.kerja* lagi sekarang!`);
        }

        // --- [ 4. LOGIKA INVENTORY ] ---
        if (command === 'inv') {
            let teks = `🎒 *INVENTORY - ${m.pushName}*\n\n`;
            teks += `- Energy Drink: ${user.inventory.energy_drink} pcs\n`;
            teks += `- Saldo: Rp${user.money.toLocaleString()}\n`;
            teks += `- XP: ${user.xp}\n\n`;
            teks += `Gunakan item: *.use [nama item]*`;
            return m.reply(teks);
        }
    }
};
