/**
 * Plugin: Game Kerja Utama 💼
 * Fitur: Pangkat, Gaji Dinamis, & Sistem Energi.
 */

module.exports = {
    command: ['kerja', 'work', 'profesi', 'resign'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { command, text }) => {
        let user = global.db.data.users[m.sender];
        
        // Inisialisasi data user kalau belum ada
        if (typeof user.money === 'undefined') user.money = 0;
        if (typeof user.lastkerja === 'undefined') user.lastkerja = 0;
        if (typeof user.pangkat === 'undefined') user.pangkat = 'Pengangguran';
        if (typeof user.xp === 'undefined') user.xp = 0;

        // --- [ DAFTAR PROFESI & GAJI ] ---
        const profesi = {
            'Pengangguran': { gaji: 0, minXp: 0, energy: 0 },
            'Kurir Paket': { gaji: 250000, minXp: 0, energy: 10 },
            'Ojek Online': { gaji: 286000, minXp: 100, energy: 15 },
            'Admin Olshop': { gaji: 556000, minXp: 500, energy: 20 },
            'Backend Dev': { gaji: 1250000, minXp: 2000, energy: 30 },
            'Project Manager': { gaji: 7480000, minXp: 5000, energy: 40 },
            'CEO Muda': { gaji: 1580000000, minXp: 15000, energy: 50 }
        };

        // --- [ LOGIKA RESIGN ] ---
        if (command === 'resign') {
            user.pangkat = 'Pengangguran';
            return m.reply('Kamu sekarang mengundurkan diri dan menjadi Pengangguran. 🥀');
        }

        // --- [ LOGIKA PILIH PROFESI ] ---
        if (command === 'profesi') {
            let list = Object.keys(profesi).map(p => {
                let status = user.pangkat === p ? '✅' : (user.xp >= profesi[p].minXp ? '🔓' : '🔒');
                return `${status} *${p}*\nGaji: Rp${profesi[p].gaji.toLocaleString()} | Min XP: ${profesi[p].minXp}`;
            }).join('\n\n');
            
            return m.reply(`💼 *DAFTAR PROFESI TERSEDIA*\n\n${list}\n\nKetik *.kerja [nama profesi]* untuk melamar!`);
        }

        // --- [ LOGIKA MELAMAR KERJA ] ---
        if (text) {
            let jobFound = Object.keys(profesi).find(p => p.toLowerCase() === text.toLowerCase());
            if (!jobFound) return m.reply('Profesi itu nggak ada di database! Ketik *.profesi* buat cek.');
            
            if (user.xp < profesi[jobFound].minXp) {
                return m.reply(`XP kamu belum cukup buat jadi *${jobFound}*! Butuh minimal ${profesi[jobFound].minXp} XP.`);
            }
            
            user.pangkat = jobFound;
            return m.reply(`Selamat! Kamu sekarang bekerja sebagai *${jobFound}*. Ketik *.kerja* buat mulai cari duit! 🚀`);
        }

        // --- [ LOGIKA MULAI KERJA ] ---
        if (user.pangkat === 'Pengangguran') {
            return m.reply('Kamu masih nganggur! Ketik *.profesi* buat cari kerja dulu.');
        }

        // Cooldown Kerja (Misal 1 jam sekali)
        let cooldown = 3600000; // 1 Jam dalam ms
        if (new Date - user.lastkerja < cooldown) {
            let sisa = (user.lastkerja + cooldown) - (new Date);
            let menit = Math.floor(sisa / 60000);
            let detik = Math.floor((sisa % 60000) / 1000);
            return m.reply(`Kamu masih capek! Istirahat dulu selama *${menit} menit ${detik} detik* lagi. ☕`);
        }

        // Proses Gajian
        let dataJob = profesi[user.pangkat];
        let bonus = Math.floor(Math.random() * 2000); // Bonus random biar gak kaku
        let totalGaji = dataJob.gaji + bonus;
        let dapetXp = Math.floor(Math.random() * 50) + 10;

        user.money += totalGaji;
        user.xp += dapetXp;
        user.lastkerja = new Date * 1;

        let caption = `💼 *LAPORAN KERJA* 💼\n\n`;
        caption += `Profesi: *${user.pangkat}*\n`;
        caption += `Gaji: *Rp${dataJob.gaji.toLocaleString()}*\n`;
        caption += `Bonus Tip: *Rp${bonus.toLocaleString()}*\n`;
        caption += `XP Tambahan: *+${dapetXp} XP*\n\n`;
        caption += `*Total Pendapatan:* Rp${totalGaji.toLocaleString()}\n`;
        caption += `_Gunakan duitmu dengan bijak!_`;

        return m.reply(caption);
    }
};
                  
