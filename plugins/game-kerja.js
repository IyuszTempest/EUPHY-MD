/**
 * Plugin: Game Kerja Utama (List Button Style) 💼
 * Deskripsi: Cari kerja, absen harian, melamar profesi, atau resign menggunakan tombol interaktif.
 * Style: Clean, Modern & Elegant ✨
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['kerja', 'work', 'profesi', 'resign'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { command, text, usedPrefix }) => {
        let user = global.db.data.users[m.sender];
        
        // Inisialisasi Database Pengguna
        if (typeof user.money === 'undefined') user.money = 0;
        if (typeof user.lastkerja === 'undefined') user.lastkerja = 0;
        if (typeof user.pangkat === 'undefined') user.pangkat = 'Pengangguran';
        if (typeof user.xp === 'undefined') user.xp = 0;

        // Metadata Daftar Profesi
        const profesi = {
            'Pengangguran': { gaji: 0, minXp: 0 },
            'Kurir Paket': { gaji: 145700, minXp: 0 },
            'Ojek Online': { gaji: 286000, minXp: 150 },
            'Admin Olshop': { gaji: 675800, minXp: 500 },
            'Backend Dev': { gaji: 4340000, minXp: 1500 },
            'CEO Muda': { gaji: 53040000, minXp: 10000 }
        };

        const cmd = command.toLowerCase();

        // --- 1. LOGIKA PILIH PROFESI (INTERFACE LIST BUTTON) ---
        if (cmd === 'profesi') {
            try {
                await conn.sendMessage(m.chat, { react: { text: '💼', key: m.key } });

                // Susun baris tombol karir
                let rows = Object.keys(profesi).map(p => {
                    let isCurrent = user.pangkat === p;
                    let isUnlocked = user.xp >= profesi[p].minXp;
                    let statusSymbol = isCurrent ? '✅' : (isUnlocked ? '🔓' : '🔒');
                    let statusLabel = isCurrent ? 'Aktif' : (isUnlocked ? 'Tersedia' : 'Terkunci');

                    return {
                        header: '',
                        title: `${statusSymbol} ${p}`,
                        description: `[${statusLabel}] Gaji: Rp${profesi[p].gaji.toLocaleString()} | Syarat: ${profesi[p].minXp} XP`,
                        id: `${usedPrefix || ''}kerja ${p}`
                    };
                });

                let listMessage = {
                    title: 'Pilih Karir Baru 💼',
                    sections: [{
                        title: 'Lowongan Pekerjaan Tersedia',
                        highlight_label: 'Bursa Kerja 🔥',
                        rows: rows
                    }]
                };

                // Desain isi konten pesan utama (Clean & Aesthetic)
                let menuContent = `✨ *BURSA LOWONGAN KERJA* ✨\n\n`
                                + `👤 *Nama:* ${m.pushName || 'User'}\n`
                                + `📊 *XP Milikmu:* ${user.xp} XP\n`
                                + `🛠️ *Profesi Sekarang:* *${user.pangkat}*\n\n`
                                + `Silakan klik tombol di bawah untuk melamar pekerjaan baru yang sesuai dengan XP kamu!`;

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
                                        title: 'Kementerian Tenaga Kerja Bot',
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
                                            newsletterName: `${global.namech} - Game Center`
                                        }
                                    }
                                })
                            }
                        }
                    },
                    { userJid: conn.user.id, quoted: m }
                );

                // Kirim pesan dengan payload interaktif bypass biz mixed v9
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
                return m.reply(`❌ Terjadi kendala saat membuka daftar lowongan: ${e.message}`);
            }
        }

        // --- 2. LOGIKA MELAMAR PEKERJAAN ---
        if (cmd === 'kerja' && text) {
            let targetJob = text.trim();
            let jobFound = Object.keys(profesi).find(p => p.toLowerCase() === targetJob.toLowerCase());
            
            if (!jobFound) return m.reply('❌ Profesi tersebut tidak ada dalam daftar lowongan! Silakan cek di menu *.profesi*');
            if (user.pangkat === jobFound) return m.reply(`⚠️ Kamu saat ini sudah bekerja sebagai *${jobFound}*.`);
            if (user.xp < profesi[jobFound].minXp) return m.reply(`❌ XP kamu belum mencukupi untuk melamar sebagai *${jobFound}*! Kumpulkan XP lagi dengan bekerja.`);
            
            user.pangkat = jobFound;
            return m.reply(`🎉 *Selamat!* Lamaran kamu diterima. Sekarang kamu resmi bekerja sebagai *${jobFound}*. Semangat kerjanya! 🚀`);
        }

        // --- 3. LOGIKA ABSEN RUTINITAS KERJA ---
        if (cmd === 'kerja' || cmd === 'work') {
            if (user.pangkat === 'Pengangguran') {
                return m.reply('❌ Kamu belum mempunyai pekerjaan tetap! Silakan cari lowongan kerja terlebih dahulu di menu *.profesi*');
            }

            let cooldown = 3600000; // Jeda cooldown kerja (1 Jam)
            if (new Date() - user.lastkerja < cooldown) {
                let sisa = (user.lastkerja + cooldown) - (new Date());
                let menit = Math.floor(sisa / 60000);
                let detik = Math.floor((sisa % 60000) / 1000);
                return m.reply(`⏳ *Masih lelah!* Harap istirahat dulu sekitar *${menit}m ${detik}s* lagi atau pulihkan stamina menggunakan item penambah energi! 🥤`);
            }

            let gajiBase = profesi[user.pangkat].gaji;
            let bonus = Math.floor(Math.random() * 5000);
            let total = gajiBase + bonus;
            let xpDapet = Math.floor(Math.random() * 30) + 10;

            user.money += total;
            user.xp += xpDapet;
            user.lastkerja = new Date() * 1;

            return m.reply(
                `💼 *LAPORAN SHIFT KERJA* 💼\n\n` +
                `👤 *Profesi:* ${user.pangkat}\n` +
                `💵 *Gaji + Bonus:* Rp${total.toLocaleString()}\n` +
                `✨ *Akumulasi XP:* +${xpDapet} XP\n\n` +
                `💳 *Sisa Tabungan:* Rp${user.money.toLocaleString()}`
            );
        }

        // --- 4. LOGIKA MENGUNDURKAN DIRI (RESIGN) ---
        if (cmd === 'resign') {
            if (user.pangkat === 'Pengangguran') return m.reply('⚠️ Kamu tidak memiliki pekerjaan aktif saat ini.');
            user.pangkat = 'Pengangguran';
            return m.reply('🥀 Kamu resmi mengundurkan diri dan kini berstatus sebagai Pengangguran kembali.');
        }
    }
};
    
