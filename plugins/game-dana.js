/**
 * E-Wallet DANA (Super Clean & Interactive Edition) 💙📱
 * Feature: Topup, Tarik, Daget, Klaim.
 * Status: FITUR TF DIHAPUS 🗑️
 * Optimized with Baileys Native Flow Interactive Buttons (Quick Claim & Copy Code)
 * Author: Euphy System
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['dana', 'topup', 'tarik', 'dompet', 'daget', 'klaim'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix: _p, command, text }) => {
        try {
            let user = global.db.data.users[m.sender];
            if (!user) return m.reply("> kamu belum terdaftar di database! Hubungi owner atau ketik pendaftaran dulu ya~ 🥺");
            
            user.dana_balance = user.dana_balance || 0;
            user.money = user.money || 0;

            if (!global.db.data.daget) global.db.data.daget = {};

            const cmd = command.toLowerCase();

            // ════════════════════════════════════════════════════
            //  DASHBOARD UTAMA DANA (INTERACTIVE LIST BUTTON)
            // ════════════════════════════════════════════════════
            if (cmd === 'dana' || cmd === 'dompet') {
                await conn.sendMessage(m.chat, { react: { text: "📱", key: m.key } });

                let desc = `Halo! Kelola keuangan digitalmu di sini untuk mempermudah operasional bisnis sawit & belanja hobimu! 🌸✨\n\n`;
                desc += `📱 *𝚂𝚊𝚕𝚍𝚘 𝙳𝙰𝙽𝙰:* Rp${user.dana_balance.toLocaleString()}\n`;
                desc += `💵 *𝚄𝚊𝚗𝚐 𝚄𝚝𝚊𝚖𝚊:* Rp${user.money.toLocaleString()}\n\n`;
                desc += `_Pilih aksi transaksi cepat atau buat DANA Kaget menggunakan tombol interaktif di bawah ini! 👇_`;
                
                const rows = [
                    {
                        title: '💳 Topup Saldo Rp10.000',
                        description: 'Pindahkan uang utama ke saldo DANA',
                        id: `${_p}topup 10000`
                    },
                    {
                        title: '💳 Topup Saldo Rp50.000',
                        description: 'Pindahkan uang utama ke saldo DANA',
                        id: `${_p}topup 50000`
                    },
                    {
                        title: '💳 Topup Saldo Rp500.000',
                        description: 'Topup nominal besar untuk transaksi hobi',
                        id: `${_p}topup 500000`
                    },
                    {
                        title: '💳 Topup Saldo Rp10.000.000',
                        description: 'Pindahkan uang utama ke saldo DANA',
                        id: `${_p}topup 10000000`
                    },
                    {
                        title: '💸 Tarik Tunai Rp50.000',
                        description: 'Kembalikan saldo DANA ke uang utama kamu',
                        id: `${_p}tarik 50000`
                    },
                    {
                        title: '💸 Tarik Tunai Rp500.000',
                        description: 'Tarik nominal besar untuk kas utama',
                        id: `${_p}tarik 500000`
                    },
                                        {
                        title: '💸 Tarik Tunai Rp10.000.000',
                        description: 'Tarik nominal besar untuk kas utama',
                        id: `${_p}tarik 10000000`
                    },
                    {
                        title: '🎁 Buat Daget Rp500.000 (1 Kuota)',
                        description: 'Bagi-bagi saldo DANA Kaget instan',
                        id: `${_p}daget 500000 1`
                    },
                    {
                        title: '🎁 Buat Daget Rp50.000 (5 Kuota)',
                        description: 'Bagi-bagi saldo DANA Kaget instan',
                        id: `${_p}daget 50000 5`
                    },
                    {
                        title: '🎁 Buat Daget Rp100.000 (10 Kuota)',
                        description: 'Daget spesial untuk teman-teman grup!',
                        id: `${_p}daget 100000 5`
                    },
                    {
                        title: '🎁 Buat Daget Rp10.000.000 (100 Kuota)',
                        description: 'Daget spesial untuk teman-teman grup!',
                        id: `${_p}daget 10000000 100`
                    }
                ];

                const listMessage = {
                    title: 'Menu Transaksi DANA 📲',
                    sections: [{
                        title: 'Tindakan Keuangan',
                        highlight_label: 'Transaksi Instan ⚡',
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
                                        title: '📱 DANA DIGITAL WALLET 📱',
                                        hasMediaAttachment: true,
                                        ...(await prepareWAMessageMedia({ image: { url: global.imgall } }, { upload: conn.waUploadToServer }))
                                    }),
                                    body: proto.Message.InteractiveMessage.Body.create({
                                        text: desc
                                    }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({
                                        text: global.wm
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
                                        isForwarded: true
                                    }
                                })
                            }
                        }
                    },
                    { userJid: conn.user.id, quoted: m }
                );

                return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            }

            // ════════════════════════════════════════════════════
            //  SISTEM PROSES TRANSAKSI
            // ════════════════════════════════════════════════════

            // 1. DANA KAGET (DAGET)
            if (cmd === 'daget') {
                let args = text.split(' ');
                let nom = parseInt(args[0]);
                let kuota = parseInt(args[1]);

                if (!nom || !kuota || nom < 1000 || kuota < 1) {
                    return m.reply(`> Cara pembuatan DANA Kaget:\n*${_p + command} <nominal> <kuota>*\n\nContoh: *${_p + command} 50000 5*`);
                }
                if (user.dana_balance < nom) {
                    return m.reply("> saldo DANA kamu tidak cukup untuk membuat Daget ini! Silakan topup dulu.");
                }

                let code = Math.random().toString(36).substring(2, 8).toUpperCase();
                user.dana_balance -= nom;
                global.db.data.users[m.sender] = user;

                global.db.data.daget[code] = {
                    perPerson: Math.floor(nom / kuota),
                    kuota: kuota,
                    claimed: []
                };

                // Susun tombol interaktif: Satu buat klaim instan, satu buat salin kode!
                const buttons = [
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "Klaim Daget! 🧧",
                            id: `${_p}klaim ${code}`
                        })
                    },
                    {
                        name: "cta_copy",
                        buttonParamsJson: JSON.stringify({
                            display_text: "Salin Kode Daget 📋",
                            copy_code: code
                        })
                    }
                ];

                let res = `🎁 *𝙳𝙰𝙽𝙰 𝙺𝙰𝙶𝙴𝚃 𝙱𝙴𝚁𝙷𝙰𝚂𝙸𝙻 𝙳𝙸𝙱𝚄𝙰𝚃!* 🎁\n`;
                res += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                res += `👤 *Pembuat:* @${m.sender.split('@')[0]}\n`;
                res += `💰 *Total Saldo:* Rp${nom.toLocaleString()}\n`;
                res += `👥 *Kuota Penerima:* ${kuota} Orang\n`;
                res += `💸 *Jatah per Orang:* Rp${Math.floor(nom / kuota).toLocaleString()}\n\n`;
                res += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                res += `_Silakan klik tombol "Klaim Daget! 🧧" di bawah ini untuk mengambil jatah secara instan, atau gunakan tombol salin untuk membagikan kodenya! ✨_`;

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
                                        title: '🧧 SHARE DANA KAGET 🧧',
                                        hasMediaAttachment: false
                                    }),
                                    body: proto.Message.InteractiveMessage.Body.create({
                                        text: res
                                    }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({
                                        text: global.wm
                                    }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        messageVersion: 1,
                                        buttons: buttons
                                    }),
                                    contextInfo: { 
                                        mentionedJid: [m.sender],
                                        forwardingScore: 999,
                                        isForwarded: true
                                    }
                                })
                            }
                        }
                    },
                    { userJid: conn.user.id, quoted: m }
                );

                return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            }

            // 2. KLAIM DAGET
            if (cmd === 'klaim') {
                let code = text.trim().toUpperCase();
                if (!code) return m.reply(`> Masukkan kode Daget yang ingin diklaim!\nContoh: *${_p}klaim ABCXYZ*`);

                let daget = global.db.data.daget[code];

                if (!daget) return m.reply("> Kode DANA Kaget salah, tidak valid, atau sudah kedaluwarsa.");
                if (daget.claimed.length >= daget.kuota) return m.reply("> Yahh! Telat Onii-chan, saldo DANA Kaget ini sudah habis diserbu orang lain. 🥺");
                if (daget.claimed.includes(m.sender)) return m.reply("> Kamu sudah mengambil jatah DANA Kaget dari kode ini!");

                user.dana_balance = (user.dana_balance || 0) + daget.perPerson;
                daget.claimed.push(m.sender);
                global.db.data.users[m.sender] = user;

                return m.reply(`🧧 *𝙺𝙻𝙰𝙸𝙼 𝙳𝙰𝙶𝙴𝚃 𝚂𝚄𝙺𝚂𝙴𝚂!* 🧧\n\n💰 Selamat! Kamu berhasil mendapatkan saldo sebesar: *Rp${daget.perPerson.toLocaleString()}* yang langsung masuk ke dompet DANA-mu! ✨`);
            }

            // 3. TOPUP DANA
            if (cmd === 'topup') {
                let nom = parseInt(text);
                if (!nom || nom < 1000) return m.reply("> Minimal Topup saldo DANA adalah Rp1.000!");
                if (user.money < nom) return m.reply(`> Uang utama kamu kurang Rp${(nom - user.money).toLocaleString()} untuk melakukan topup ini!`);
                
                user.money -= nom;
                user.dana_balance += nom;
                global.db.data.users[m.sender] = user;

                return m.reply(`✅ *Topup Berhasil!* 📲\n\n💸 *Nominal:* Rp${nom.toLocaleString()}\n💰 *Saldo DANA Sekarang:* Rp${user.dana_balance.toLocaleString()}\n💵 *Sisa Uang Utama:* Rp${user.money.toLocaleString()}`);
            }
            
            // 4. TARIK TUNAI (WITHDRAW)
            if (cmd === 'tarik') {
                let nom = parseInt(text);
                if (!nom || nom < 1000) return m.reply("> Minimal penarikan saldo DANA adalah Rp1.000!");
                if (user.dana_balance < nom) return m.reply(`> Saldo DANA kamu tidak cukup untuk ditarik sebesar Rp${nom.toLocaleString()}!`);
                
                user.dana_balance -= nom;
                user.money += nom;
                global.db.data.users[m.sender] = user;

                return m.reply(`✅ *Penarikan Berhasil!* 💸\n\n💸 *Nominal:* Rp${nom.toLocaleString()}\n💵 *Uang Utama Sekarang:* Rp${user.money.toLocaleString()}\n💰 *Sisa Saldo DANA:* Rp${user.dana_balance.toLocaleString()}`);
            }

        } catch (e) {
            console.error(e);
            m.reply(`Error E-Wallet DANA: ${e.message}`);
        }
    }
};
