/**
 * Simulasi Makan Bergizi Gratis (MBG) 🍱🏫
 * All-in-One: Menu, Bagi Makan, Anggaran, & Help
 */

module.exports = {
    command: ['mbg', 'bagimakan', 'cekdana', 'menu-mbg', 'helpmbg', 'mbghelp'],
    category: 'game',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        // --- INISIALISASI DATA MBG ---
        if (typeof user.mbg_budget === 'undefined') user.mbg_budget = 50000000; 
        if (typeof user.mbg_reputation === 'undefined') user.mbg_reputation = 50; 
        if (typeof user.last_mbg === 'undefined') user.last_mbg = 0;

        const cmd = command.toLowerCase();

        // --- 1. MENU HELP (Pusat Bantuan) ---
        if (cmd === 'helpmbg' || cmd === 'mbghelp') {
            let help = `╭━━〔 🍱 *𝙸𝙽𝙵𝙾 𝙿𝚁𝙾𝙶𝚁𝙰𝙼 𝙼𝙱𝙶* 〕━━┓\n`;
            help += `┃\n`;
            help += `┃ 1️⃣ *Pilih Menu:* \n`;
            help += `┃ \`${usedPrefix}menu-mbg\` \n`;
            help += `┃ Cek paket makanan & harganya.\n`;
            help += `┃\n`;
            help += `┃ 2️⃣ *Bagi Makanan:* \n`;
            help += `┃ \`${usedPrefix}bagimakan <nomor>\` \n`;
            help += `┃ Kirim makanan ke sekolah (10 mnt sekali).\n`;
            help += `┃\n`;
            help += `┃ 3️⃣ *Dapatkan Anggaran:* \n`;
            help += `┃ \`${usedPrefix}cekdana\` \n`;
            help += `┃ Jika reputasi > 80, dapat subsidi dana.\n`;
            help += `┃\n`;
            help += `┃ 4️⃣ *Status Pengelola:* \n`;
            help += `┃ \`${usedPrefix}mbg\` \n`;
            help += `┃ Cek sisa dana & skor kepuasan siswa.\n`;
            help += `┃\n`;
            help += `┗━━━━━━━━━━━━━━━━━━━━┛\n`;
            help += `_Kelola gizi siswa dengan bijak!_ 🥛`;
            return m.reply(help);
        }

        // --- 2. STATUS PENGELOLA ---
        if (cmd === 'mbg') {
            let status = `╭━━〔 🍱 *𝙼𝙰𝙺𝙰𝙽 𝙱𝙴𝚁𝙶𝙸𝚉𝙸 𝙶𝚁𝙰𝚃𝙸𝚂* 〕━━┓\n`;
            status += `┃\n`;
            status += `┃ 💰 *Sisa Anggaran:* Rp${user.mbg_budget.toLocaleString()}\n`;
            status += `┃ ⭐️ *Skor Reputasi:* ${user.mbg_reputation}/100\n`;
            status += `┃\n`;
            status += `┃ _Ketik *${usedPrefix}helpmbg* untuk cara main._\n`;
            status += `┗━━━━━━━━━━━━━━━━━━━━┛`;
            return m.reply(status);
        }

        // --- DATA MENU ---
        const daftarMenu = [
            { nama: "Paket Hemat (Nasi + Telur + Jeruk)", harga: 15000, gizi: 65 },
            { nama: "Paket Sehat (Nasi + Ayam + Sayur + Susu)", harga: 25000, gizi: 90 },
            { nama: "Paket Mewah (Nasi + Daging + Buah + Susu)", harga: 45000, gizi: 100 }
        ];

        // --- 3. LIHAT MENU ---
        if (cmd === 'menu-mbg') {
            let teks = `🍱 *DAFTAR PAKET MAKANAN* 🍱\n\n`;
            daftarMenu.forEach((v, i) => {
                teks += `*${i + 1}. ${v.nama}*\n`;
                teks += `   └ Harga: Rp${v.harga.toLocaleString()}/porsi\n`;
                teks += `   └ Kualitas Gizi: ${v.gizi}\n\n`;
            });
            teks += `_Ketik *${usedPrefix}bagimakan <nomor>* untuk eksekusi._`;
            return m.reply(teks);
        }

        // --- 4. BAGI MAKANAN ---
        if (cmd === 'bagimakan') {
            let cooldown = 600000; // 10 menit
            if (new Date() - user.last_mbg < cooldown) {
                let sisa = cooldown - (new Date() - user.last_mbg);
                return m.reply(`⏳ Distribusi masih berjalan. Sisa waktu: *${Math.ceil(sisa / 60000)} menit*.`);
            }

            let index = parseInt(text) - 1;
            if (!daftarMenu[index]) return m.reply(`⚠️ Gunakan \`${usedPrefix + command} <nomor menu>\` (1-3)`);

            let menu = daftarMenu[index];
            let jumlahSiswa = Math.floor(Math.random() * 10) + 5; 
            let totalBiaya = menu.harga * jumlahSiswa;

            if (user.mbg_budget < totalBiaya) return m.reply(`❌ Anggaran tidak cukup! Butuh Rp${totalBiaya.toLocaleString()} untuk ${jumlahSiswa} siswa.`);

            user.mbg_budget -= totalBiaya;
            user.last_mbg = new Date() * 1;

            let { key } = await conn.sendMessage(m.chat, { text: "🍱 *Siswa mulai mengantre di kantin sekolah...*" });
            await new Promise(r => setTimeout(r, 2000));
            
            // Logika Reputasi
            let reputasiNaik = menu.gizi >= 90 ? 5 : 2;
            if (Math.random() > 0.85) { 
                reputasiNaik = -10; // Kejadian acak: Makanan telat sampai
                await conn.sendMessage(m.chat, { text: "⚠️ *Gawat!* Truk makanan terjebak macet, siswa mulai protes!", edit: key });
                await new Promise(r => setTimeout(r, 2000));
            }

            user.mbg_reputation = Math.min(100, Math.max(0, user.mbg_reputation + reputasiNaik));

            let res = `✅ *LAPORAN DISTRIBUSI SELESAI!*\n\n`;
            res += `🍱 *Menu:* ${menu.nama}\n`;
            res += `👥 *Sasaran:* ${jumlahSiswa} Siswa\n`;
            res += `💰 *Pengeluaran:* -Rp${totalBiaya.toLocaleString()}\n`;
            res += `⭐ *Reputasi:* ${user.mbg_reputation}/100 (${reputasiNaik >= 0 ? '+' : ''}${reputasiNaik})\n\n`;
            res += `_Terima kasih telah mendukung gizi bangsa!_`;

            return conn.sendMessage(m.chat, { text: res, edit: key });
        }

        // --- 5. SUBSIDI ANGGARAN ---
        if (cmd === 'cekdana') {
            if (user.mbg_reputation >= 80) {
                let subsidi = 1500000;
                user.mbg_budget += subsidi;
                // Turunkan sedikit reputasi biar gak spam subsidi terus
                user.mbg_reputation -= 10; 
                return m.reply(`🎊 *SUBSIDI CAIR!* Karena reputasimu sangat baik, pemerintah memberikan tambahan anggaran sebesar *Rp${subsidi.toLocaleString()}*.\n\n_Reputasi digunakan untuk pengajuan dana._`);
            } else {
                return m.reply(`💰 *INFO ANGGARAN*\n\nSisa dana: *Rp${user.mbg_budget.toLocaleString()}*.\n\nReputasi saat ini: *${user.mbg_reputation}/100*.\n(Butuh minimal 80 untuk mencairkan subsidi baru)`);
            }
        }
    }
};
