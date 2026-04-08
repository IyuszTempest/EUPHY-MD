/**
 * Plugin: Game Kerja Utama 💼
 */

module.exports = {
    command: ['kerja', 'work', 'profesi', 'resign'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { command, text }) => {
        let user = global.db.data.users[m.sender];
        
        // Inisialisasi Database
        if (typeof user.money === 'undefined') user.money = 0;
        if (typeof user.lastkerja === 'undefined') user.lastkerja = 0;
        if (typeof user.pangkat === 'undefined') user.pangkat = 'Pengangguran';
        if (typeof user.xp === 'undefined') user.xp = 0;

        const profesi = {
            'Pengangguran': { gaji: 0, minXp: 0 },
            'Kurir Paket': { gaji: 145700, minXp: 0 },
            'Ojek Online': { gaji: 286000, minXp: 150 },
            'Admin Olshop': { gaji: 675800, minXp: 500 },
            'Backend Dev': { gaji: 4340000, minXp: 1500 },
            'CEO Muda': { gaji: 53040000, minXp: 10000 }
        };

        // --- [ LOGIKA PILIH PROFESI ] ---
        if (command === 'profesi') {
            let list = Object.keys(profesi).map(p => {
                let status = user.pangkat === p ? '✅' : (user.xp >= profesi[p].minXp ? '🔓' : '🔒');
                return `${status} *${p}*\nGaji: Rp${profesi[p].gaji.toLocaleString()} | Min XP: ${profesi[p].minXp}`;
            }).join('\n\n');
            return m.reply(`💼 *DAFTAR PROFESI*\n\n${list}\n\nKetik *.kerja [nama]* untuk melamar!`);
        }

        // --- [ LOGIKA MELAMAR ] ---
        if (command === 'kerja' && text) {
            let jobFound = Object.keys(profesi).find(p => p.toLowerCase() === text.toLowerCase());
            if (!jobFound) return m.reply('Profesi tidak ditemukan! Cek di *.profesi*');
            if (user.xp < profesi[jobFound].minXp) return m.reply(`XP kamu belum cukup untuk jadi *${jobFound}*!`);
            user.pangkat = jobFound;
            return m.reply(`Selamat! Sekarang kamu bekerja sebagai *${jobFound}*. 🚀`);
        }

        // --- [ LOGIKA ABSEN KERJA ] ---
        if (command === 'kerja' || command === 'work') {
            if (user.pangkat === 'Pengangguran') return m.reply('Kamu masih nganggur! Cari kerja dulu di *.profesi*');

            let cooldown = 3600000; // 1 Jam
            if (new Date - user.lastkerja < cooldown) {
                let sisa = (user.lastkerja + cooldown) - (new Date);
                let menit = Math.floor(sisa / 60000);
                let detik = Math.floor((sisa % 60000) / 1000);
                return m.reply(`Masih capek! Tunggu *${menit}m ${detik}s* lagi atau beli *Energy Drink* di *.shop* untuk skip waktu! 🥤`);
            }

            let gajiBase = profesi[user.pangkat].gaji;
            let bonus = Math.floor(Math.random() * 5000);
            let total = gajiBase + bonus;
            let xpDapet = Math.floor(Math.random() * 30) + 10;

            user.money += total;
            user.xp += xpDapet;
            user.lastkerja = new Date * 1;

            return m.reply(`💼 *LAPORAN KERJA*\n\nHasil: *Rp${total.toLocaleString()}*\nXP: *+${xpDapet}*\nPangkat: *${user.pangkat}*\n\nSaldo: Rp${user.money.toLocaleString()}`);
        }

        if (command === 'resign') {
            user.pangkat = 'Pengangguran';
            return m.reply('Kamu resmi resign dan jadi Pengangguran sekarang. 🥀');
        }
    }
};
