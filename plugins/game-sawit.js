/** * Juragan Sawit Simulator v2.0 🌴🚜
 * Optimized for Interactive UI & Native Flow Buttons
 * Author: Euphy System
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

// Konfigurasi Tier Peralatan & Upgrade
const TIERS = {
    egrek: [
        { name: 'Egrek Karatan 🪓', bonus: 0, price: 0 },
        { name: 'Egrek Stainless Steel ✨', bonus: 20, price: 150000 },
        { name: 'Egrek Titanium 🔥', bonus: 50, price: 500000 },
        { name: 'Laser Egrek Cyberpunk ⚡', bonus: 100, price: 1500000 },
        { name: 'Golden Egrek Shinto 👑', bonus: 200, price: 5000000 }
    ],
    pupuk: [
        { name: 'Tanpa Pupuk 🪹', reduction: 0, price: 0 },
        { name: 'Kompos Organik 🍂', reduction: 480000, price: 100000 },     // -8 Menit
        { name: 'Pupuk Urea Subsidi 🧪', reduction: 960000, price: 300000 },    // -16 Menit
        { name: 'Super NPK Booster ⚡', reduction: 1440000, price: 1000000 },   // -24 Menit
        { name: 'Elixir Kimia Mitologi 🧪✨', reduction: 2400000, price: 3000000 } // -40 Menit
    ],
    truk: [
        { name: 'Sepeda Motor Rebo 🛵', bonus: 0, price: 0 },
        { name: 'Becak Barang Motor 🛺', bonus: 10, price: 120000 },
        { name: 'Mobil Pick-Up L300 🛻', bonus: 25, price: 400000 },
        { name: 'Truk Colt Diesel 🚚', bonus: 50, price: 1200000 },
        { name: 'Fuso Gandeng Overload 🚛🔥', bonus: 100, price: 4000000 }
    ]
};

module.exports = {
    command: ['sawit', 'tanamsawit', 'panen', 'jualsawit', 'helpsawit', 'sawithelp'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix: _p, command, text }) => {
        try {
            let user = global.db.data.users[m.sender];
            if (!user) return m.reply("Yus-senpai, kamu belum terdaftar di database! Hubungi owner atau ketik pendaftaran dulu ya~ 🥺");

            // --- INISIALISASI DATABASE SAWIT ---
            if (typeof user.sawit === 'undefined') user.sawit = 0;
            if (typeof user.hasil_panen === 'undefined') user.hasil_panen = 0;
            if (typeof user.last_panen === 'undefined') user.last_panen = 0;
            
            // Level Alat (Default Level 1 / index 0)
            if (typeof user.sawit_egrek === 'undefined') user.sawit_egrek = 1;
            if (typeof user.sawit_pupuk === 'undefined') user.sawit_pupuk = 1;
            if (typeof user.sawit_truk === 'undefined') user.sawit_truk = 1;

            const args = text ? text.toLowerCase().trim().split(' ') : [];
            const action = args[0];

            // ════════════════════════════════════════════════════
            //  FUNGSI HELPER: INTERACTIVE LIST MESSAGE
            // ════════════════════════════════════════════════════
            const sendSawitDashboard = async () => {
                await conn.sendMessage(m.chat, { react: { text: "🌴", key: m.key } });

                // Ambil info tier saat ini
                const egrekInfo = TIERS.egrek[user.sawit_egrek - 1] || TIERS.egrek[0];
                const pupukInfo = TIERS.pupuk[user.sawit_pupuk - 1] || TIERS.pupuk[0];
                const trukInfo = TIERS.truk[user.sawit_truk - 1] || TIERS.truk[0];

                let desc = `🌸 *𝙾𝚗𝚒𝚒-𝚌𝚑𝚊𝚗, 𝙹𝚞𝚛𝚊𝚐𝚊𝚗 𝚂𝚊𝚠𝚒𝚝 𝚂𝚢𝚜𝚝𝚎𝚖 𝚁𝚎𝚊𝚍𝚢!* 🌸\n\n`;
                desc += `👤 *𝙺𝚎𝚋𝚞𝚗 𝙼𝚒𝚕𝚒𝚔:* @${m.sender.split('@')[0]}\n`;
                desc += `💰 *𝚄𝚊𝚗𝚐 𝚃𝚞𝚗𝚊𝚒:* Rp${(user.money || 0).toLocaleString()}\n\n`;
                desc += `📊 *𝙻𝙾𝙶𝙸𝚂𝚃𝙸𝙺 𝙻𝙰𝙷𝙰𝙽:*\n`;
                desc += `🌴 *𝚃𝚘𝚝𝚊𝚕 𝙿𝚘𝚑𝚘𝚗:* ${user.sawit} Pohon\n`;
                desc += `⚖️ *𝚂𝚝𝚘𝚔 𝚃𝙱𝚂:* ${user.hasil_panen.toLocaleString()} Kg\n\n`;
                desc += `🛠️ *𝙿𝙴𝚁𝙰𝙻𝙰𝚃𝙰𝙽 𝙺𝙰𝙼𝚄:*\n`;
                desc += `🪓 *𝙴𝚐𝚛𝚎к:* ${egrekInfo.name} (+${egrekInfo.bonus}% Hasil)\n`;
                desc += `🧪 *𝙿𝚞𝚙𝚞𝚔:* ${pupukInfo.name} (-${pupukInfo.reduction / 60000} Menit Cooldown)\n`;
                desc += `🚛 *𝚃𝚛𝚞𝚔:* ${trukInfo.name} (+${trukInfo.bonus}% Bonus Jual)\n\n`;
                desc += `_Pilih tindakan operasional kebun kelapa sawit Onii-chan pada tombol interaktif di bawah ini! 👇_`;

                // Susun baris tombol interaktif
                const rows = [
                    {
                        title: '🪓 Panen Raya (Egrek)',
                        description: 'Mulai memanen buah sawit matang di kebunmu',
                        id: `${_p}sawit panen`
                    },
                    {
                        title: '🚛 Jual Seluruh Hasil TBS',
                        description: 'Kirim stok kelapa sawit ke pengepul untuk dicairkan',
                        id: `${_p}sawit jual`
                    },
                    {
                        title: '🌱 Tanam 1 Pohon (Rp70.000)',
                        description: 'Membeli dan menanam 1 bibit kelapa sawit baru',
                        id: `${_p}sawit tanam 1`
                    },
                    {
                        title: '🌱 Tanam 10 Pohon (Rp700.000)',
                        description: 'Paket ekspansi sedang lahan kelapa sawit',
                        id: `${_p}sawit tanam 10`
                    },
                    {
                        title: '🌱 Tanam 50 Pohon (Rp3.500.000)',
                        description: 'Skala industrialisasi kebun sawit Onii-chan!',
                        id: `${_p}sawit tanam 50`
                    },
                    {
                        title: '🛠️ Upgrade Egrek (Alat Panen)',
                        description: 'Meningkatkan produktivitas panen per pohon',
                        id: `${_p}sawit upgrade egrek`
                    },
                    {
                        title: '🧪 Upgrade Formula Pupuk',
                        description: 'Mempercepat siklus pertumbuhan & mempersingkat cooldown',
                        id: `${_p}sawit upgrade pupuk`
                    },
                    {
                        title: '🚛 Upgrade Armada Truk',
                        description: 'Dapatkan bonus harga jual dari pengepul pusat',
                        id: `${_p}sawit upgrade truk`
                    },
                    {
                        title: '🏆 Papan Peringkat (Leaderboard)',
                        description: 'Lihat daftar pengusaha sawit terkaya sejagat raya',
                        id: `${_p}sawit leaderboard`
                    }
                ];

                const listMessage = {
                    title: 'Operasional Kebun 🚜',
                    sections: [{
                        title: 'Tindakan Strategis',
                        highlight_label: 'Sangat Direkomendasikan ⭐',
                        rows: rows
                    }]
                };

                const msg = generateWAMessageFromContent(
                    m.chat,
                    {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadata: {},
                                    deviceListMetadataVersion: 2
                                },
                                interactiveMessage: proto.Message.InteractiveMessage.create({
                                    header: proto.Message.InteractiveMessage.Header.create({
                                        title: '🌴 JURAGAN SAWIT SIMULATOR v2.0 🌴',
                                        hasMediaAttachment: true,
                                        ...(await prepareWAMessageMedia({ image: { url: global.imgall || 'https://i.pinimg.com/originals/f1/b9/d7/f1b9d702bae9274340cb7e9534233d32.jpg' } }, { upload: conn.waUploadToServer }))
                                    }),
                                    body: proto.Message.InteractiveMessage.Body.create({
                                        text: desc
                                    }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({
                                        text: global.wm || 'Euphy MD system'
                                    }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        messageVersion: 1,
                                        buttons: [{
                                            name: "single_select",
                                            buttonParamsJson: JSON.stringify(listMessage) 
                                        }],
                                    }),
                                    contextInfo: { 
                                        mentionedJid: [m.sender],
                                        forwardingScore: 999,
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: global.idch,
                                            serverMessageId: 143,
                                            newsletterName: `${global.namech} - Sistem Kebun Online`
                                        }
                                    }
                                })
                            }
                        }
                    },
                    { userJid: conn.user.id, quoted: m }
                );

                await conn.relayMessage(m.chat, msg.message, {
                    messageId: msg.key.id,
                    additionalNodes: [
                        {
                            tag: 'biz',
                            attrs: {},
                            content: [{
                                tag: 'interactive',
                                attrs: { type: 'native_flow', v: '1' },
                                content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
                            }]
                        }
                    ]
                });
            };

            // ════════════════════════════════════════════════════
            //  ROUTING AKSI GAMEPLAY
            // ════════════════════════════════════════════════════
            
            // 1. TANAM SAWIT
            if (action === 'tanam') {
                const hargaBibit = 70000;
                let jumlah = parseInt(args[1]) || 1;
                if (jumlah < 1) return m.reply('❌ Onii-chan, jumlah pohon yang ditanam minimal 1!');
                
                const totalHarga = hargaBibit * jumlah;
                if (user.money < totalHarga) {
                    return m.reply(`❌ Uang tidak cukup! Untuk ekspansi ${jumlah} pohon, kamu butuh Rp${totalHarga.toLocaleString()}.\n💰 Saldo kamu saat ini: Rp${user.money.toLocaleString()}`);
                }

                user.money -= totalHarga;
                user.sawit += jumlah;
                global.db.data.users[m.sender] = user;

                return m.reply(`🌱 *Eks can, Penanaman Sukses!* 🌱\n\n┃ 🚜 *Ekspansi Lahan:* +${jumlah} Pohon\n┃ 💸 *Total Biaya:* Rp${totalHarga.toLocaleString()}\n┃ 🌴 *Total Sawit:* ${user.sawit} Pohon\n┃ 💰 *Sisa Saldo:* Rp${user.money.toLocaleString()}\n\n_Semoga tumbuh subur dan melimpah ya, Onii-chan!_ ✨`);
            }

            // 2. PANEN SAWIT
            if (action === 'panen') {
                if (user.sawit < 1) return m.reply("❌ Onii-chan belum punya pohon sawit! Tanam dulu gih lewat tombol di bawah. 🥺");
                
                // Kalkulasi cooldown pupuk
                const baseCooldown = 3600000; // 1 Jam default
                const pupukInfo = TIERS.pupuk[user.sawit_pupuk - 1] || TIERS.pupuk[0];
                const activeCooldown = baseCooldown - pupukInfo.reduction;

                if (new Date() - user.last_panen < activeCooldown) {
                    let sisa = activeCooldown - (new Date() - user.last_panen);
                    let sisaMenit = Math.ceil(sisa / 60000);
                    return m.reply(`⏳ *Buah Belum Brondol!* \nTunggu *${sisaMenit} menit* lagi untuk panen berikutnya, atau upgrade formula pupuk biar makin cepat panen! 🧪🍂`);
                }

                // Kalkulasi hasil egrek
                const egrekInfo = TIERS.egrek[user.sawit_egrek - 1] || TIERS.egrek[0];
                let hasilKotor = 0;
                for (let i = 0; i < user.sawit; i++) {
                    hasilKotor += Math.floor(Math.random() * 15) + 10; // 10-25 kg per pohon
                }

                const bonusYield = Math.floor(hasilKotor * (egrekInfo.bonus / 100));
                const totalPanen = hasilKotor + bonusYield;

                user.hasil_panen += totalPanen;
                user.last_panen = new Date() * 1;
                global.db.data.users[m.sender] = user;

                let { key } = await conn.sendMessage(m.chat, { text: "🚜 *Lagi dandan pakai boot, otw kebun buat egrek sawit...*" });
                await new Promise(r => setTimeout(r, 1500));
                
                let successText = `✅ *PANEN RAYA BERHASIL!* 🪓✨\n\n`;
                successText += `📦 *Hasil Panen:* ${hasilKotor.toLocaleString()} Kg\n`;
                if (bonusYield > 0) successText += `⚡ *Bonus Egrek (${egrekInfo.name}):* +${bonusYield.toLocaleString()} Kg\n`;
                successText += `⚖️ *Total Panen:* *${totalPanen.toLocaleString()} Kg*\n`;
                successText += `📥 *Stok di Gudang:* ${user.hasil_panen.toLocaleString()} Kg`;

                return conn.sendMessage(m.chat, { text: successText, edit: key });
            }

            // 3. JUAL SAWIT
            if (action === 'jual') {
                if (user.hasil_panen < 50) return m.reply("❌ Gudang masih kosong, Onii-chan! Minimal kumpulkan 50 Kg TBS dulu baru bisa diangkut truk ke pabrik pengepul! 🚛");

                const baseHarga = Math.floor(Math.random() * 500) + 2200; // Rp2.200 - Rp2.700
                const trukInfo = TIERS.truk[user.sawit_truk - 1] || TIERS.truk[0];
                
                const hargaKotor = user.hasil_panen * baseHarga;
                const bonusTruk = Math.floor(hargaKotor * (trukInfo.bonus / 100));
                const totalCair = hargaKotor + bonusTruk;

                user.money = (user.money || 0) + totalCair;
                let stokTerjual = user.hasil_panen;
                user.hasil_panen = 0;
                global.db.data.users[m.sender] = user;

                let { key } = await conn.sendMessage(m.chat, { text: `🚛 *Mengisi muatan sawit seberat ${stokTerjual.toLocaleString()} Kg ke dalam ${trukInfo.name}...*` });
                await new Promise(r => setTimeout(r, 2000));

                let nota = `🚛 *NOTA TRANSAKSI PABRIK PENGECORAN* 🚛\n`;
                nota += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                nota += `⚖️ *Berat Muatan:* ${stokTerjual.toLocaleString()} Kg\n`;
                nota += `💹 *Harga Pasar:* Rp${baseHarga}/Kg\n`;
                if (bonusTruk > 0) nota += `⚡ *Bonus Truk (${trukInfo.name}):* +Rp${bonusTruk.toLocaleString()}\n`;
                nota += `💰 *Dana Cair:* *Rp${totalCair.toLocaleString()}*\n\n`;
                nota += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                nota += `_Duit sawit sudah ditransfer ke saldo utama kamu! Beliin aku merchan anime ya Onii-chan!_ 😉👑`;

                return conn.sendMessage(m.chat, { text: nota, edit: key });
            }

            // 4. UPGRADE PERALATAN
            if (action === 'upgrade') {
                const item = args[1];
                if (!['egrek', 'pupuk', 'truk'].includes(item)) return m.reply('❌ Pilih item upgrade yang valid: `egrek`, `pupuk`, atau `truk`!');

                const currentLevel = user[`sawit_${item}`];
                const tierList = TIERS[item];

                if (currentLevel >= tierList.length) {
                    return m.reply(`❌ *Peralatan Maksimal!* \n${item.toUpperCase()} Onii-chan sudah mencapai tingkat kejayaan tertinggi: *${tierList[currentLevel - 1].name}*! 👑💎`);
                }

                const nextTier = tierList[currentLevel];
                if (user.money < nextTier.price) {
                    return m.reply(`❌ Saldo tidak cukup untuk upgrade! \n🛒 *Upgrade:* ${tierList[currentLevel - 1].name} ➡️ *${nextTier.name}*\n💸 *Biaya:* Rp${nextTier.price.toLocaleString()}\n💰 Saldo kamu saat ini: Rp${user.money.toLocaleString()}`);
                }

                user.money -= nextTier.price;
                user[`sawit_${item}`] += 1;
                global.db.data.users[m.sender] = user;

                return m.reply(`🛠️ *UPGRADE PERALATAN SUKSES!* 🛠️\n\n┃ 🔧 *Item:* ${item.toUpperCase()}\n┃ 📈 *Tingkat Baru:* *${nextTier.name}*\n┃ 💸 *Biaya Upgrade:* Rp${nextTier.price.toLocaleString()}\n┃ 💰 *Sisa Saldo:* Rp${user.money.toLocaleString()}\n\n_Sekarang efisiensi kerja kebun Onii-chan naik berkali-kali lipat! 🔥_`);
            }

            // 5. LEADERBOARD JURAGAN SAWIT
            if (action === 'leaderboard' || action === 'lb') {
                const users = global.db.data.users;
                const sorted = Object.entries(users)
                    .map(([jid, val]) => ({ jid, name: val.name || jid.split('@')[0], money: val.money || 0, sawit: val.sawit || 0 }))
                    .sort((a, b) => b.money - a.money)
                    .slice(0, 5);

                let lbText = `🏆 *𝙿𝙰𝙿𝙰𝙽 𝙿𝙴𝚁𝙸𝙽𝙶𝙺𝙰𝚃 𝙹𝚄𝚁𝙰𝙶𝙰𝙽 𝚂𝙰𝚆𝙸𝚃* 🏆\n`;
                lbText += `_Orang-orang terkaya berkat keringat di kebun sawit_\n\n`;

                sorted.forEach((u, index) => {
                    const medal = ['🥇', '🥈', '🥉', '🏅', '🎖️'][index];
                    lbText += `${medal} *${index + 1}.* @${u.jid.split('@')[0]}\n`;
                    lbText += `   ┃ 💰 *Kekayaan:* Rp${u.money.toLocaleString()}\n`;
                    lbText += `   ┃ 🌴 *Lahan:* ${u.sawit} Pohon\n\n`;
                });

                lbText += `_Ayo Onii-chan, kerja keras lagi biar namamu nampang di atas!_ 🔥🪓`;

                return conn.sendMessage(m.chat, { text: lbText, mentions: sorted.map(u => u.jid) });
            }

            // DEFAULT: Tampilkan Dashboard Utama
            await sendSawitDashboard();

        } catch (e) {
            console.error(e);
            m.reply(`Error Simulator Sawit: ${e.message}`);
        }
    }
};
