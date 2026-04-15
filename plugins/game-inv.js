/**
 * Plugin: Inventory & Showcase 🎒
 */
module.exports = {
    command: ['inv', 'koleksi', 'inventory'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix }) => {
        let user = global.db.data.users[m.sender];
        
        // Inisialisasi data (Hanya kategori yang tersedia di shop)
        if (!user.koleksi) user.koleksi = { figure: [], baju: [], harian: [] };
        if (!user.inventory) user.inventory = { redbull: 0 };
        
        let k = user.koleksi;

        let daftar = `╭━━〔 🎒 *𝙸𝙽𝚅𝙴𝙽𝚃𝙾𝚁𝚈* 〕━━┓\n┃\n`;
        
        // Kategori Figure
        if (k.figure?.length) {
            daftar += `┣ 🎎 *FIGURE:* ${k.figure.join(', ')}\n`;
        }
        
        // Kategori Clothing & Gear
        if (k.baju?.length) {
            daftar += `┣ 👕 *CLOTHING:* ${k.baju.join(', ')}\n`;
        }
        
        // Kategori Daily Stuff & Horeg
        if (k.harian?.length) {
            daftar += `┣ 🛠️ *DAILY & HOREG:* ${k.harian.join(', ')}\n`;
        }
        
        // Bagian Consumable
        daftar += `┃\n┣ 🥤 *REDBULL:* ${user.inventory.redbull || 0} pcs\n`;
        
        daftar += `┗━━━━━━━━━━━━━━┛\n`;
        daftar += `💰 Saldo: Rp${(user.money || 0).toLocaleString()}`;

        // Cek jika inventory benar-benar kosong
        const isKosong = !k.figure?.length && !k.baju?.length && !k.harian?.length;
        if (isKosong && (user.inventory.redbull || 0) === 0) {
            return m.reply("Inventory masih kosong! Yuk belanja dulu di *.shop*");
        }

        return m.reply(daftar);
    }
};
