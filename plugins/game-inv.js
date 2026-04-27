/**
 * Plugin: Inventory & Showcase (Fixed Spam) 🎒
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
        let level = Math.floor(user.xp / 1000);
        let nextLvlXp = (level + 1) * 1000;
        
        let k = user.koleksi;
        let daftar = `╭━━〔 🎒 *𝙸𝙽𝚅𝙴𝙽𝚃𝙾𝚁𝚈* 〕━━┓\n┃\n`;
        
        // Bagian Status User (Selalu Tampil)
        daftar += `┣ 👤 *USER:* ${m.pushName}\n`;
        daftar += `┣ 💼 *PANGKAT:* ${user.pangkat}\n`;
        daftar += `┣ ✨ *LEVEL:* ${level}\n`;
        daftar += `┣ 📊 *XP:* ${user.xp.toLocaleString()} / ${nextLvlXp.toLocaleString()}\n┃\n`;
        
        // Cek apakah ada barang atau tidak untuk menentukan tampilan
        const hasItems = k.figure?.length || k.baju?.length || k.harian?.length || user.inventory.redbull > 0;

        if (!hasItems) {
            daftar += `┣ 📦 *ITEM:* _Kosong_\n┃ _Yuk kerja & belanja!_\n`;
        } else {
            // Tampilkan kategori jika ada isinya
            if (k.figure?.length) daftar += `┣ 🎎 *FIGURE:* ${k.figure.join(', ')}\n`;
            if (k.baju?.length) daftar += `┣ 👕 *CLOTHING:* ${k.baju.join(', ')}\n`;
            if (k.harian?.length) daftar += `┣ 🛠️ *DAILY:* ${k.harian.join(', ')}\n`;
            if (user.inventory.redbull > 0) daftar += `┣ 🥤 *REDBULL:* ${user.inventory.redbull} pcs\n`;
        }
        
        daftar += `┃\n┗━━━━━━━━━━━━┛\n`;
        daftar += `💰 *Saldo:* Rp${user.money.toLocaleString()}`;

        // Langsung kirim tanpa return peringatan lagi biar gak nyepam
        return m.reply(daftar);
    }
};
