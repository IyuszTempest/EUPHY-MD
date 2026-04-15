/**
 * Plugin: Hobby Shop (Waifu & Collection) 🏪
 */
module.exports = {
    command: ['shop', 'beli', 'hobby'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { command, text, usedPrefix }) => {
        let user = global.db.data.users[m.sender];
        if (typeof user.money === 'undefined') user.money = 0;
        if (typeof user.koleksi === 'undefined') user.koleksi = { figure: [], baju: [], harian: [], waifu: [], husbu: [] };

        const katalog = {
            'elaina': { nama: 'Elaina (Majojo)', harga: 5000000, tipe: 'waifu' },
            'takina': { nama: 'Takina Inoue', harga: 4500000, tipe: 'waifu' },
            'zongli': { nama: 'Zhongli (Daddy)', harga: 8000000, tipe: 'husbu' },
            'f-elaina': { nama: 'Figure Elaina 1/7', harga: 1500000, tipe: 'figure' },
            'pc': { nama: 'PC Case Kayu Custom', harga: 5000000, tipe: 'harian' },
            'motor': { nama: 'Yamaha Jupiter Z1', harga: 15000000, tipe: 'harian' }
        };

        if (command === 'shop' || command === 'hobby') {
            let teks = `┏━━〔 🏪 *𝙴𝚄𝙿𝙷𝚈 𝙷𝙾𝙱𝙱𝚈 𝚂𝙷𝙾𝙿* 〕━━┓\n┃\n`;
            teks += `┣ 🌸 *WAIFU & HUSBU*\n┃ • elaina | takina | zongli\n┃\n`;
            teks += `┣ 🎎 *FIGURES*\n┃ • f-elaina : Rp1.5jt\n┃\n`;
            teks += `┣ 🛠️ *EQUIPMENT*\n┃ • pc : Rp5jt | motor : Rp15jt\n┃\n`;
            teks += `┣ 🥤 *CONSUMABLE*\n┃ • redbull : Rp25rb (Ketik: .beliredbull)\n┃\n`;
            teks += `┗━━━━━━━━━━━━━━━━━━━━━━┛\n`;
            teks += `💰 Saldo: Rp${user.money.toLocaleString()}`;
            return m.reply(teks);
        }

        if (command === 'beli') {
            let kode = text.toLowerCase().trim();
            if (!katalog[kode]) return m.reply(`Kode salah! Contoh: *${usedPrefix}beli elaina*`);
            let item = katalog[kode];
            if (user.koleksi[item.tipe].includes(item.nama)) return m.reply("Sudah punya, Yus!");
            if (user.money < item.harga) return m.reply("Duit kurang!");
            user.money -= item.harga;
            user.koleksi[item.tipe].push(item.nama);
            return m.reply(`✨ Berhasil mendapatkan *${item.nama}*!`);
        }
    }
};
