/**
 * Plugin: Shop & Inventory Game (RedBull Edition) 🏪
 */

module.exports = {
    command: ['shop', 'beli', 'use', 'inv', 'helpshop'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { command, text, usedPrefix }) => {
        let user = global.db.data.users[m.sender];
        
        // Inisialisasi Database jika belum ada
        if (typeof user.inventory === 'undefined') user.inventory = { redbull: 0 };
        if (typeof user.money === 'undefined') user.money = 0;
        if (typeof user.lastkerja === 'undefined') user.lastkerja = 0;

        // --- [ 1. HELP SHOP ] ---
        if (command === 'helpshop') {
            let help = `🛒 *BANTUAN TOKO EUPHY* 🛒\n\n`;
            help += `• *${usedPrefix}shop* : Melihat daftar barang.\n`;
            help += `• *${usedPrefix}beli [nama] [jumlah]* : Membeli barang.\n`;
            help += `• *${usedPrefix}inv* : Cek tas/inventory kamu.\n`;
            help += `• *${usedPrefix}use [nama]* : Menggunakan barang.\n\n`;
            help += `_Contoh: ${usedPrefix}beli redbull 1_`;
            return m.reply(help);
        }

        // --- [ 2. MENU SHOP ] ---
        if (command === 'shop') {
            let teks = `🏪 *EUPHY REDBULL SHOP* 🏪\n\n`;
            teks += `1. *RedBull* 🥤\n`;
            teks += `   - Efek: Menghapus Cooldown Kerja (Skip Time)\n`;
            teks += `   - Harga: Rp25.000\n\n`;
            teks += `Ketik *${usedPrefix}beli redbull 1* untuk membeli.\n`;
            teks += `Ketik *${usedPrefix}helpshop* untuk bantuan.`;
            return m.reply(teks);
        }

        // --- [ 3. LOGIKA BELI ] ---
        if (command === 'beli') {
            if (!text || !text.toLowerCase().includes('redbull')) {
                return m.reply(`Barang apa yang mau dibeli? Contoh: *${usedPrefix}beli redbull 1*`);
            }
            
            let jumlah = parseInt(text.replace(/[^0-9]/g, '')) || 1;
            let hargaPerItem = 25000;
            let totalHarga = hargaPerItem * jumlah;

            if (user.money < totalHarga) {
                return m.reply(`Duit kamu kurang Rp${(totalHarga - user.money).toLocaleString()}! Ayo kerja lagi sana. 💸`);
            }

            user.money -= totalHarga;
            user.inventory.redbull = (user.inventory.redbull || 0) + jumlah;
            
            return m.reply(`Berhasil membeli *${jumlah} RedBull*! 🥤\nSisa Saldo: Rp${user.money.toLocaleString()}\n\nGunakan dengan ketik: *${usedPrefix}use redbull*`);
        }

        // --- [ 4. LOGIKA PAKAI ITEM ] ---
        if (command === 'use') {
            if (!text || !text.toLowerCase().includes('redbull')) {
                return m.reply(`Mau pakai apa? Contoh: *${usedPrefix}use redbull*`);
            }
            
            if (!user.inventory.redbull || user.inventory.redbull < 1) {
                return m.reply(`Kamu nggak punya RedBull! Beli dulu di *${usedPrefix}shop*`);
            }

            // Cek apakah sedang cooldown kerja (1 jam = 3600000 ms)
            let cooldown = 3600000; 
            if (new Date - user.lastkerja > cooldown) {
                return m.reply(`Kamu belum capek, simpan aja dulu RedBull-nya buat nanti pas habis kerja! 😉`);
            }

            user.inventory.redbull -= 1;
            user.lastkerja = 0; // RESET COOLDOWN KERJA
            
            return m.reply(`*Glek.. glek.. AH!* 🥤\nEfek *RedBull* terasa! Stamina kamu pulih seketika. Sekarang kamu bisa langsung *${usedPrefix}kerja* lagi!`);
        }

        // --- [ 5. LOGIKA INVENTORY ] ---
        if (command === 'inv') {
            let teks = `🎒 *INVENTORY - ${m.pushName}* 🎒\n\n`;
            teks += `• RedBull: ${user.inventory.redbull || 0} pcs\n`;
            teks += `• Saldo: Rp${(user.money || 0).toLocaleString()}\n`;
            teks += `• Total XP: ${user.xp || 0}\n\n`;
            teks += `Gunakan item dengan mengetik: *${usedPrefix}use [nama]*`;
            return m.reply(teks);
        }
    }
};
        
