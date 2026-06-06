/**
 * Hobby Shop & Inventory System v3.0 (Standalone Shop) 🏪🎒
 * Integrated buffs writing directly to Database collections.
 * Author: Euphy System
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

const KATALOG = {
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
    'toki': { nama: 'Figure Asuma Toki (Bunny)', harga: 3500000, tipe: 'figure' },
    'nagisa': { nama: 'Figure Kirifuji Nagisa', harga: 2900000, tipe: 'figure' },
    'rio': { nama: 'Figure Tsukatsuki Rio', harga: 3800000, tipe: 'figure' },
    'clorinde': { nama: 'Figure Clorinde', harga: 3400000, tipe: 'figure' },
    'navia': { nama: 'Figure Navia', harga: 3200000, tipe: 'figure' },
    'anya': { nama: 'Figure Anya Forger', harga: 1100000, tipe: 'figure' },
    'yor': { nama: 'Figure Yor Forger', harga: 2600000, tipe: 'figure' },
    'megumin': { nama: 'Figure Megumin (Explosion)', harga: 2400000, tipe: 'figure' },
    'aqua': { nama: 'Figure Aqua (Useless Goddess)', harga: 2000000, tipe: 'figure' },
    'ruby': { nama: 'Figure Hoshino Ruby', harga: 2150000, tipe: 'figure' },
    'kana': { nama: 'Figure Arima Kana', harga: 2100000, tipe: 'figure' },

    // --- EQUIPMENT & CLOTHING ---
    'hoodie': { nama: 'Hoodie Lycoris Recoil', harga: 450000, tipe: 'baju' },
    'jersey': { nama: 'Jersey T1 Faker Edition', harga: 850000, tipe: 'baju' },
    'kimono': { nama: 'Yukata Casual Japan', harga: 600000, tipe: 'baju' },
    'techwear': { nama: 'Arknights Style Techwear', harga: 1200000, tipe: 'baju' },

    // --- DAILY STUFF & LOCAL CULTURE ---
    'setup': { nama: 'RGB Gaming Setup (Dual Monitor)', harga: 25000000, tipe: 'harian' },
    'keyboard': { nama: 'Mechanical Keyboard Custom', harga: 2500000, tipe: 'harian' },
    'pc': { nama: 'PC Case Kayu Custom (Handmade)', harga: 5000000, tipe: 'harian' },
    'motor': { nama: 'Yamaha Jupiter Z1 (Restored)', harga: 15000000, tipe: 'harian' },
    'helm': { nama: 'Helm KYT Custom Repaint', harga: 1200000, tipe: 'harian' },
    'speaker': { nama: 'Subwoofer 15-inch Horeg', harga: 3500000, tipe: 'harian' },
    'power-amp': { nama: 'Amplifier SOCL 506 Horeg', harga: 1500000, tipe: 'harian' },
    'knalpot': { nama: 'Knalpot Racing Jupiter', harga: 850000, tipe: 'harian' },

    // --- LUXURY & REAL ESTATE ---
    'mobil': { nama: 'Toyota GR Supra (A90)', harga: 1200000000, tipe: 'harian' },
    'rumah': { nama: 'Rumah Minimalis Modern', harga: 5000000000, tipe: 'harian' },
    'tv': { nama: 'Smart TV OLED 65-inch', harga: 25000000, tipe: 'harian' },
    'ac': { nama: 'AC Split 1 PK', harga: 4500000, tipe: 'harian' },
    'kulkas': { nama: 'Kulkas 2 Pintu', harga: 3500000, tipe: 'harian' }
};

module.exports = {
    command: ['shop', 'beli', 'hobby', 'inv', 'inventory', 'koleksi'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix: _p, command, text }) => {
        try {
            let user = global.db.data.users[m.sender];
            if (!user) return m.reply("> kamu belum terdaftar di database! Hubungi owner atau ketik pendaftaran dulu ya~ 🥺");

            if (typeof user.money === 'undefined') user.money = 0;
            if (typeof user.koleksi === 'undefined') user.koleksi = { figure: [], baju: [], harian: [] };

            const cmd = command.toLowerCase();

            const figureBuff = (user.koleksi.figure || []).length * 2;
            const bajuBuff = (user.koleksi.baju || []).length * 5;
            const harianReduction = (user.koleksi.harian || []).length * 60000;

            // ════════════════════════════════════════════════════
            //  DASHBOARD SHOP UTAMA
            // ════════════════════════════════════════════════════
            const sendHobbyShop = async () => {
                await conn.sendMessage(m.chat, { react: { text: "🏪", key: m.key } });

                let desc = `Kamu belanjakan uang hasil jeri payahmu di sini untuk mengoleksi Waifu & barang impianmu! Tiap barang memberikan buff permanen untukmu loh ya!\n\n`;
                desc += `💰 *Saldo Kamu:* Rp${user.money.toLocaleString()}\n\n`;
                desc += `📊 *INFORMASI SPECIAL BUFFS SAWIT:*\n`;
                desc += `🎎 *Figure:* +2% per item\n`;
                desc += `👕 *Clothing:* +5% per item\n`;
                desc += `🛠️ *Daily Stuff:* -1 Menit Cooldown / item\n\n`;
                desc += `_Silakan pilih item yang ingin kamu beli pada daftar list di bawah ini! 👇_`;

                let figureRows = [];
                let bajuRows = [];
                let harianRows = [];

                for (let key in KATALOG) {
                    const item = KATALOG[key];
                    const owned = user.koleksi[item.tipe].includes(item.nama) ? ' (Milikmu ✓)' : '';
                    const formattedRow = {
                        title: `${item.nama}${owned}`,
                        description: `Harga: Rp${item.harga.toLocaleString()}`,
                        id: `${_p}beli ${key}`
                    };

                    if (item.tipe === 'figure') figureRows.push(formattedRow);
                    else if (item.tipe === 'baju') bajuRows.push(formattedRow);
                    else if (item.tipe === 'harian') harianRows.push(formattedRow);
                }

                const listMessage = {
                    title: 'Daftar Katalog Toko 🛍️',
                    sections: [
                        { title: '🎎 KOLEKSI WAIFU FIGURES', rows: figureRows.slice(0, 15) },
                        { title: '👕 CLOTHING & OTAKU GEAR', rows: bajuRows },
                        { title: '🛠️ DAILY STUFF & HOREG', rows: harianRows }
                    ]
                };

                const msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                            interactiveMessage: proto.Message.InteractiveMessage.create({
                                header: proto.Message.InteractiveMessage.Header.create({
                                    title: '🛍️ HOBBY SHOP CATALOGUE 🛍️',
                                    hasMediaAttachment: true,
                                    ...(await prepareWAMessageMedia({ image: { url: global.imgall } }, { upload: conn.waUploadToServer }))
                                }),
                                body: proto.Message.InteractiveMessage.Body.create({ text: desc }),
                                footer: proto.Message.InteractiveMessage.Footer.create({ text: global.wm || 'Euphy MD system' }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                    messageVersion: 1,
                                    buttons: [
                                        { name: "single_select", buttonParamsJson: JSON.stringify(listMessage) }
                                    ],
                                }),
                                contextInfo: { 
                                    mentionedJid: [m.sender],
                                    forwardingScore: 999,
                                    isForwarded: true
                                }
                            })
                        }
                    }
                }, { userJid: conn.user.id, quoted: m });

                await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            };

            // ════════════════════════════════════════════════════
            //  ROUTING COMMAND SHOP
            // ════════════════════════════════════════════════════

            if (cmd === 'shop' || cmd === 'hobby') {
                await sendHobbyShop();
            }

            if (cmd === 'beli') {
                let kode = text.toLowerCase().trim();
                if (!KATALOG[kode]) return m.reply(`> Kode barang salah! Silakan cek menu \`.shop\` untuk daftar kode.`);
                
                let item = KATALOG[kode];
                if (user.koleksi[item.tipe].includes(item.nama)) {
                    return m.reply(`> Kamu sudah memiliki koleksi *${item.nama}*!`);
                }

                if (user.money < item.harga) {
                    return m.reply(`> Duit kamu kurang Rp${(item.harga - user.money).toLocaleString()} untuk membeli ${item.nama}! Ayo kerja lagi!`);
                }

                user.money -= item.harga;
                user.koleksi[item.tipe].push(item.nama);
                global.db.data.users[m.sender] = user;

                let successBuy = `✨ *PEMBELIAN KOLEKSI BERHASIL!* ✨\n\n`;
                successBuy += `🛍️ *Barang:* ${item.nama}\n`;
                successBuy += `💸 *Harga:* Rp${item.harga.toLocaleString()}\n`;
                successBuy += `💰 *Sisa Saldo:* Rp${user.money.toLocaleString()}\n\n`;
                successBuy += `📈 *Efek Aktif Kebun:* `;
                if (item.tipe === 'figure') successBuy += `+2% Yield Panen Permanen 🎎`;
                else if (item.tipe === 'baju') successBuy += `+5% Harga Jual Permanen 👕`;
                else if (item.tipe === 'harian') successBuy += `-1 Menit Cooldown Panen Permanen 🛠️`;

                return m.reply(successBuy);
            }

            // ════════════════════════════════════════════════════
            //  INVENTORY VIEWER
            // ════════════════════════════════════════════════════

            if (cmd === 'inv' || cmd === 'inventory' || cmd === 'koleksi') {
                let invText = `🎒 *𝙺𝙾𝙻𝙴𝙺𝚂𝙸 & 𝙰𝙺𝚃𝙸𝙵 𝙱𝚄𝙵𝙵𝚂 𝙾𝚃𝙰𝙺𝚄* 🎒\n\n`;
                invText += `👤 *Kolektor:* @${m.sender.split('@')[0]}\n`;
                invText += `💰 *Uang Tunai:* Rp${(user.money || 0).toLocaleString()}\n\n`;
                invText += `⚡ *STATISTIK AKTIF BUFFS KEBUN:*\n`;
                invText += `📈 *Bonus Yield:* +${figureBuff}% (Dari ${user.koleksi.figure.length} Waifu)\n`;
                invText += `💸 *Bonus Jual:* +${bajuBuff}% (Dari ${user.koleksi.baju.length} Gear/Baju)\n`;
                invText += `⏳ *Potongan Cooldown:* -${harianReduction / 60000} Menit (Dari ${user.koleksi.harian.length} Barang)\n\n`;
                
                invText += `🎎 *FIGURES (${user.koleksi.figure.length}):*\n`;
                invText += user.koleksi.figure.length ? user.koleksi.figure.map(f => `  • ${f}`).join('\n') + '\n\n' : `  • Belum ada koleksi figure waifu 🥺\n\n`;
                
                invText += `👕 *CLOTHING & GEAR (${user.koleksi.baju.length}):*\n`;
                invText += user.koleksi.baju.length ? user.koleksi.baju.map(b => `  • ${b}`).join('\n') + '\n\n' : `  • Belum ada koleksi gear/baju 🥺\n\n`;
                
                invText += `🛠️ *DAILY STUFF & LUXURY (${user.koleksi.harian.length}):*\n`;
                invText += user.koleksi.harian.length ? user.koleksi.harian.map(h => `  • ${h}`).join('\n') : `  • Belum ada barang harian 🥺`;

                return conn.sendMessage(m.chat, { text: invText, mentions: [m.sender] });
            }

        } catch (e) {
            console.error(e);
            m.reply(`Error Hobby Shop: ${e.message}`);
        }
    }
};
