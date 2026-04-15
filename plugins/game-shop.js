/**
 * Plugin: Hobby Shop (Otaku Paradise Edition) 🏪
 * Update: Added massive character list & more daily items.
 */

module.exports = {
    command: ['shop', 'beli', 'hobby'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { command, text, usedPrefix }) => {
        let user = global.db.data.users[m.sender];
        if (typeof user.money === 'undefined') user.money = 0;
        if (typeof user.koleksi === 'undefined') user.koleksi = { figure: [], baju: [], harian: [] };

        const katalog = {
            // --- FIGURES (WAIFU/HUSBU) ---
            'elaina': { nama: 'Figure Elaina (Wandering Witch)', harga: 1500000, tipe: 'figure' },
            'takina': { nama: 'Figure Takina Inoue', harga: 1800000, tipe: 'figure' },
            'chisato': { nama: 'Figure Chisato Nishikigi', harga: 1850000, tipe: 'figure' },
            'kurumi': { nama: 'Figure Kurumi Tokisaki', harga: 2500000, tipe: 'figure' },
            'eula': { nama: 'Figure Eula Lawrence', harga: 3000000, tipe: 'figure' },
            'raiden': { nama: 'Figure Raiden Shogun', harga: 3500000, tipe: 'figure' },
            'nahida': { nama: 'Figure Nahida', harga: 2200000, tipe: 'figure' },
            'hutao': { nama: 'Figure Hu Tao', harga: 2800000, tipe: 'figure' },
            'furina': { nama: 'Figure Furina de Fontaine', harga: 3200000, tipe: 'figure' },
            'kafka': { nama: 'Figure Kafka (Stellaron Hunter)', harga: 4000000, tipe: 'figure' },
            'firefly': { nama: 'Figure Firefly/SAM', harga: 4500000, tipe: 'figure' },
            'march': { nama: 'Figure March 7th', harga: 2000000, tipe: 'figure' },
            'robin': { nama: 'Figure Robin (Penacony)', harga: 3800000, tipe: 'figure' },
            'zongli': { nama: 'Figure Zhongli', harga: 3200000, tipe: 'figure' },
            'kazuha': { nama: 'Figure Kaedehara Kazuha', harga: 2700000, tipe: 'figure' },
            'rimuru': { nama: 'Figure Rimuru Tempest', harga: 1900000, tipe: 'figure' },
            'miku': { nama: 'Figure Hatsune Miku V4', harga: 1200000, tipe: 'figure' },
            'arona': { nama: 'Figure Arona (Blue Archive)', harga: 2100000, tipe: 'figure' },
            'shiroko': { nama: 'Figure Shiroko Sunaookami', harga: 2300000, tipe: 'figure' },
            'hina': { nama: 'Figure Sorasaki Hina', harga: 2600000, tipe: 'figure' },
            'mika': { nama: 'Figure Misono Mika', harga: 3300000, tipe: 'figure' },
            'frieren': { nama: 'Figure Frieren the Slayer', harga: 2900000, tipe: 'figure' },
            'fern': { nama: 'Figure Fern (Mage)', harga: 2400000, tipe: 'figure' },
            'power': { nama: 'Figure Power (Chainsaw Man)', harga: 2100000, tipe: 'figure' },
            'makima': { nama: 'Figure Makima', harga: 2700000, tipe: 'figure' },

            // --- EQUIPMENT & CLOTHING ---
            'hoodie': { nama: 'Hoodie Lycoris Recoil', harga: 450000, tipe: 'baju' },
            'jersey': { nama: 'Jersey T1 Faker Edition', harga: 850000, tipe: 'baju' },
            'kimono': { nama: 'Yukata Casual Japan', harga: 600000, tipe: 'baju' },
            'techwear': { nama: 'Arknights Style Techwear', harga: 1200000, tipe: 'baju' },
            'setup': { nama: 'RGB Gaming Setup (Dual Monitor)', harga: 25000000, tipe: 'harian' },
            'keyboard': { nama: 'Mechanical Keyboard Custom', harga: 2500000, tipe: 'harian' },

            // --- DAILY STUFF & LOCAL CULTURE ---
            'pc': { nama: 'PC Case Kayu Custom (Handmade)', harga: 5000000, tipe: 'harian' },
            'motor': { nama: 'Yamaha Jupiter Z1 (Restored)', harga: 15000000, tipe: 'harian' },
            'helm': { nama: 'Helm KYT Custom Repaint', harga: 1200000, tipe: 'harian' },
            'speaker': { nama: 'Subwoofer 15-inch Horeg', harga: 3500000, tipe: 'harian' },
            'power-amp': { nama: 'Amplifier SOCL 506 Horeg', harga: 1500000, tipe: 'harian' },
            'knalpot': { nama: 'Knalpot Racing Jupiter', harga: 850000, tipe: 'harian' }
        };

        const cmd = command.toLowerCase();

        if (cmd === 'shop' || cmd === 'hobby') {
            let teks = `┏━━〔 🏪 *𝙴𝚄𝙿𝙷𝚈 𝙷𝙾𝙱𝙱𝚈 𝚂𝙷𝙾𝙿* 〕━━┓\n┃\n`;
            teks += `┣ 🎎 *FIGURES (ANIME/GAME)*\n`;
            teks += `┃ • elaina | takina | chisato | kurumi\n`;
            teks += `┃ • eula | raiden | nahida | hutao\n`;
            teks += `┃ • furina | kafka | firefly | march\n`;
            teks += `┃ • robin | zongli | kazuha | rimuru\n`;
            teks += `┃ • miku | arona | shiroko | hina\n`;
            teks += `┃ • mika | frieren | fern | power\n┃\n`;
            
            teks += `┣ 👕 *CLOTHING & GEAR*\n`;
            teks += `┃ • hoodie : 450rb | jersey : 850rb\n`;
            teks += `┃ • kimono : 600rb | techwear : 1.2jt\n┃\n`;
            
            teks += `┣ 🛠️ *DAILY STUFF & HOREG*\n`;
            teks += `┃ • pc      : 5jt (PC Kayu)\n`;
            teks += `┃ • motor   : 15jt (Jupiter Z1)\n`;
            teks += `┃ • speaker : 3.5jt (15-inch)\n`;
            teks += `┃ • helm    : 1.2jt (KYT Custom)\n┃\n`;
            
            teks += `┣ 🥤 *CONSUMABLE*\n`;
            teks += `┃ • redbull : 25rb (.beliredbull)\n┃\n`;
            
            teks += `┣ ✨ *CARA BELI*\n`;
            teks += `┃ Ketik: *${usedPrefix}beli [kode]*\n`;
            teks += `┗━━━━━━━━━━━━━━━━━━━━━━┛\n`;
            teks += `💰 Saldo: Rp${user.money.toLocaleString()}`;
            return m.reply(teks);
        }

        if (cmd === 'beli') {
            let kode = text.toLowerCase().trim();
            if (!katalog[kode]) return m.reply(`Kode salah, Yus! Contoh: *${usedPrefix}beli firefly*`);
            
            let item = katalog[kode];
            if (user.koleksi[item.tipe].includes(item.nama)) {
                return m.reply(`Kamu sudah punya *${item.nama}*!`);
            }

            if (user.money < item.harga) {
                return m.reply(`Duit kamu kurang Rp${(item.harga - user.money).toLocaleString()}!`);
            }

            user.money -= item.harga;
            user.koleksi[item.tipe].push(item.nama);
            return m.reply(`✨ Berhasil mengoleksi *${item.nama}*! Cek di *${usedPrefix}inv*`);
        }
    }
};
