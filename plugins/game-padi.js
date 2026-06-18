/**
 * Plugin: Game Sawah Indonesia V2 (List Button Style) 🌾🚜
 * Deskripsi: Kelola pertanian padi, sewa buruh, kelola mood buruh, dan panen menggunakan menu interaktif.
 * Style: Clean, Modern & Single Select List ✨
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['padi', 'sawah', 'tanampadi', 'panenpadi', 'feed', 'makanburuh'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("❌ Kamu belum terdaftar di dalam database!");

        // --- [ DATABASE INITIALIZATION ] ---
        if (typeof user.money === 'undefined') user.money = 0;
        if (typeof user.padi === 'undefined') user.padi = 0; 
        if (typeof user.lastpanenpadi === 'undefined') user.lastpanenpadi = 0;
        if (typeof user.mood_buruh === 'undefined') user.mood_buruh = 100; // Mood awal 100%

        const hargaBibit = 20000;
        const hasilPanenBase = 35000; // Base hasil lebih tinggi karena ada potongan gaji
        const biayaGajiBuruh = 5000;  // Potongan wajib per petak buat gaji orang
        const cooldownPanen = 3600000; // 1 Jam

        // --- [ ITEM BOOSTER DATA ] ---
        const items = {
            kopi: { harga: 5000, mood: 10, msg: '☕ Seger cuy! Buruh semangat kerja.' },
            gorengan: { harga: 3000, mood: 5, msg: '🥖 Gorengan anget bikin buruh hepi.' },
            roti: { harga: 7000, mood: 15, msg: '🍞 Roti ganjal perut, kerja makin lurus.' },
            rokok: { harga: 25000, mood: 40, msg: '🚬 BOOSTER! Asap mengepul, panen makin ngebul.' }
        };

        const cmd = command.toLowerCase();

        // --- 1. LOGIKA STATUS UTAMA SAWAH (INTERFACE LIST BUTTON) ---
        if (cmd === 'sawah') {
            try {
                await conn.sendMessage(m.chat, { react: { text: '🌾', key: m.key } });

                let emojiMood = user.mood_buruh > 70 ? '😊' : user.mood_buruh > 30 ? '😐' : '😡';
                
                // Susun baris-baris menu pilihan list
                const rows = [
                    {
                        header: '🚜 AKTIVITAS LAHAN',
                        title: 'Tanam 1 Petak Padi',
                        description: `🌱 Biaya: Rp${(hargaBibit * 1).toLocaleString()}`,
                        id: `${usedPrefix || ''}tanampadi 1`
                    },
                    {
                        header: '',
                        title: 'Tanam 5 Petak Padi',
                        description: `🌱 Biaya: Rp${(hargaBibit * 5).toLocaleString()}`,
                        id: `${usedPrefix || ''}tanampadi 5`
                    },
                    {
                        header: '',
                        title: 'Tanam 10 Petak Padi',
                        description: `🌱 Biaya: Rp${(hargaBibit * 10).toLocaleString()}`,
                        id: `${usedPrefix || ''}tanampadi 10`
                    },
                    {
                        header: '',
                        title: '🚜 Panen Raya Padi',
                        description: 'Mulai memanen padi di lahan yang sudah menguning',
                        id: `${usedPrefix || ''}panenpadi`
                    },
                    {
                        header: '☕ WARUNG SAWAH (BOOST MOOD)',
                        title: 'Beli Kopi',
                        description: `Rp5.000 | +10% Mood Buruh`,
                        id: `${usedPrefix || ''}feed kopi`
                    },
                    {
                        header: '',
                        title: 'Beli Gorengan',
                        description: `Rp3.000 | +5% Mood Buruh`,
                        id: `${usedPrefix || ''}feed gorengan`
                    },
                    {
                        header: '',
                        title: 'Beli Roti',
                        description: `Rp7.000 | +15% Mood Buruh`,
                        id: `${usedPrefix || ''}feed roti`
                    },
                    {
                        header: '',
                        title: 'Beli Rokok (SUPER BOOSTER)',
                        description: `Rp25.000 | +40% Mood Buruh`,
                        id: `${usedPrefix || ''}feed rokok`
                    }
                ];

                let listMessage = {
                    title: 'Pilih Tindakan Tani 🧑‍🌾',
                    sections: [{
                        title: 'Manajemen Sawah & Buruh',
                        highlight_label: 'Aksi Cepat ⚡',
                        rows: rows
                    }]
                };

                let menuContent = `╭━━〔 🌾 *𝚂𝙰𝚆𝙰𝙷 𝙸𝙽𝙳𝙾𝙽𝙴𝚂𝙸𝙰* 〕━━┓\n┃\n`
                                + `┃ 🧑‍🌾 *Pemilik Lahan:* ${m.pushName || 'User'}\n`
                                + `┃ 🌾 *Lahan Padi:* ${user.padi} Petak\n`
                                + `┃ ${emojiMood} *Mood Buruh:* ${user.mood_buruh}%\n`
                                + `┃ 💵 *Saldo Dompet:* Rp${user.money.toLocaleString()}\n┃\n`
                                + `┗━━━━━━━━━━━━━━━━━━┛\n\n`
                                + `Kelola pertanian padi milikmu dengan matang! Klik tombol di bawah untuk menanam, memanen, atau memulihkan mood buruh di warung kopi sawah.`;

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
                                        title: 'Koperasi Tani Indonesia',
                                        hasMediaAttachment: true,
                                        ...(await prepareWAMessageMedia({ image: { url: global.imgall } }, { upload: conn.waUploadToServer }))
                                    }),
                                    body: proto.Message.InteractiveMessage.Body.create({ text: menuContent }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({ text: global.wm }),
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
                                            newsletterName: `${global.namech} - Mini Game`
                                        }
                                    }
                                })
                            }
                        }
                    },
                    { userJid: conn.user.id, quoted: m }
                );

                // Kirim menggunakan bypass biz mixed v9
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

                return await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

            } catch (e) {
                console.error(e);
                return m.reply(`❌ Gagal memuat menu sawah: ${e.message}`);
            }
        }

        // --- 2. LOGIKA FEED SYSTEM (BOOST MOOD) ---
        if (cmd === 'feed' || cmd === 'makanburuh') {
            if (!text) return m.reply(`Mau kasih makan apa buruhnya?\nContoh: *${usedPrefix}feed kopi*\n\n*Menu:* Kopi, Gorengan, Roti, Rokok.`);
            let itemKey = text.toLowerCase().trim();
            if (!items[itemKey]) return m.reply("❌ Menu itu nggak tersedia di warung sawah!");

            let item = items[itemKey];
            if (user.money < item.harga) return m.reply(`❌ Uang kamu gak cukup buat beli ${itemKey}!`);
            if (user.mood_buruh >= 100) return m.reply("❌ Buruh kamu sudah super hepi, jangan dikasih makan terus nanti obesitas!");

            user.money -= item.harga;
            user.mood_buruh = Math.min(100, user.mood_buruh + item.mood);

            return m.reply(`✅ *BERHASIL!* ${item.msg}\n💰 -Rp${item.harga.toLocaleString()} | ✨ Mood: +${item.mood}%`);
        }

        // --- 3. LOGIKA TANAM PADI ---
        if (cmd === 'tanampadi') {
            if (!text || isNaN(text)) return m.reply(`Mau tanam berapa petak?\nContoh: *${usedPrefix}tanampadi 5*`);
            let jumlah = parseInt(text);
            if (jumlah <= 0) return m.reply('❌ Jumlah minimal penanaman adalah 1 petak!');
            
            let totalBiaya = jumlah * hargaBibit;
            if (user.money < totalBiaya) return m.reply(`❌ Uang kamu tidak cukup untuk menanam ${jumlah} petak padi!`);

            user.money -= totalBiaya;
            user.padi += jumlah;
            // Tanam bikin mood buruh turun dikit karena capek
            user.mood_buruh = Math.max(0, user.mood_buruh - (jumlah * 1)); 

            return m.reply(`🌱 Berhasil menanam *${jumlah}* petak padi baru.\n⚠️ Mood buruh kamu sedikit turun karena capek bekerja.`);
        }

        // --- 4. LOGIKA PANEN PADI (COMPLEX LOGIC) ---
        if (cmd === 'panenpadi') {
            if (user.padi === 0) return m.reply("❌ Lahan kamu kosong! Silakan tanam padi terlebih dahulu.");

            let timers = (cooldownPanen - (new Date() - user.lastpanenpadi));
            if (new Date() - user.lastpanenpadi < cooldownPanen) {
                return m.reply(`⏳ Padi belum menguning seutuhnya! Harap tunggu sekitar *${msToTime(timers)}* lagi.`);
            }

            // --- HITUNG MOOD MULTIPLIER ---
            let multiplier = 1.0;
            if (user.mood_buruh >= 90) multiplier = 1.5; // Bonus 50% kalo hepi banget
            else if (user.mood_buruh <= 10) multiplier = 0.2; // Potongan 80% kalo mogok kerja

            let pendapatanKotor = user.padi * hasilPanenBase * multiplier;
            let totalGaji = user.padi * biayaGajiBuruh;
            let pendapatanBersih = pendapatanKotor - totalGaji;

            user.money += pendapatanBersih;
            let jumlahPanen = user.padi;
            user.padi = 0; 
            user.lastpanenpadi = new Date() * 1;
            
            // Setelah panen mood buruh drop drastis karena kerja berat
            user.mood_buruh = Math.max(0, user.mood_buruh - 30); 

            let res = `🚜 *PANEN RAYA SELESAI!* 🚜\n\n`
                    + `🌾 *Total Hasil:* ${jumlahPanen} Petak Padi\n`
                    + `📈 *Multiplier Mood:* x${multiplier}\n`
                    + `💸 *Gaji Buruh:* -Rp${totalGaji.toLocaleString()}\n`
                    + `💰 *Profit Bersih:* +Rp${pendapatanBersih.toLocaleString()}\n\n`
                    + `⚠️ Mood buruh drop drastis menjadi *${user.mood_buruh}%*! Segera beri mereka kopi agar tidak mogok kerja!`;
            
            await conn.sendMessage(m.chat, { react: { text: '💰', key: m.key } });
            return m.reply(res);
        }
    }
};

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let seconds = Math.floor((duration / 1000) % 60);
    return minutes + "m " + seconds + "s";
}
