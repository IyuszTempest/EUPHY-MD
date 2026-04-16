/**
 * Plugin: Inventory & Showcase (Updated with XP & Pangkat) 🎒
 */
module.exports = {
    command: ['inv', 'koleksi', 'inventory', 'xp'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix }) => {
        let user = global.db.data.users[m.sender];
        
        // --- [ INISIALISASI DATABASE ] ---
        if (!user.koleksi) user.koleksi = { figure: [], baju: [], harian: [] };
        if (!user.inventory) user.inventory = { redbull: 0 };
        if (typeof user.xp === 'undefined') user.xp = 0;
        if (typeof user.pangkat === 'undefined') user.pangkat = 'Pengangguran';
        if (typeof user.money === 'undefined') user.money = 0;

        // --- [ LOGIKA LEVEL UP ] ---
        // Menentukan level berdasarkan total XP (tiap 1000 XP naik 1 level)
        let level = Math.floor(user.xp / 1000);
        let nextLvlXp = (level + 1) * 1000;
        let progresXp = user.xp % 1000;
        

        let k = user.koleksi;
        let daftar = `╭━━〔 🎒 *𝙸𝙽𝚅𝙴𝙽𝚃𝙾𝚁𝚈* 〕━━┓\n┃\n`;
        
        // Bagian Status User
        daftar += `┣ 💼 *PEKERJAAN:* ${user.pangkat}\n`;
        daftar += `┣ ✨ *XP:* ${user.xp.toLocaleString()} / ${nextLvlXp.toLocaleString()}\n`;
        
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
        
        daftar += `┗━━━━━━━━━━━━┛\n`;
        daftar += `💰 Saldo: Rp${user.money.toLocaleString()}`;

        // Cek jika inventory benar-benar kosong
        const isKosong = !k.figure?.length && !k.baju?.length && !k.harian?.length;
        if (isKosong && (user.inventory.redbull || 0) === 0 && user.xp === 0) {
            return m.reply("Inventory masih kosong! Yuk kerja di *.kerja* dan belanja di *.shop*");
        }

        return m.reply(daftar);
    }
};
