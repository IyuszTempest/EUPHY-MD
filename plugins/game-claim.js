/**
 * Daily Claim Rupiah 💸
 * Bonus harian Rp300.000 buat saldo DANA Game.
 * Format: Unified Plugin System
 */

module.exports = {
    command: ['claim', 'daily'],
    category: 'game',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        // Inisialisasi variabel jika belum ada
        if (typeof user.dana_balance === 'undefined') user.dana_balance = 0;
        if (typeof user.lastclaim === 'undefined') user.lastclaim = 0;

        const bonus = 300000; // Nominal Rp300.000
        const cooldown = 86400000; // 24 Jam dalam milidetik

        // Cek apakah sudah waktunya klaim atau belum
        let timers = (cooldown - (new Date() - user.lastclaim));
        if (new Date() - user.lastclaim < cooldown) {
            return m.reply(`✨ Kamu sudah ambil jatah hari ini!\n\nSabar ya, tunggu *${msToTime(timers)}* lagi buat gajian selanjutnya.`);
        }

        // Proses Klaim
        user.dana_balance += bonus;
        user.lastclaim = new Date() * 1;

        let res = `╭━━〔 💵 *𝙶𝙰𝙹𝙸𝙰𝙽 𝙷𝙰𝚁𝙸𝙰𝙽* 〕━━┓\n`;
        res += `┃\n`;
        res += `┃ 🥳 *Selamat!* Kamu berhasil klaim\n`;
        res += `┃ 💰 *Bonus:* Rp${bonus.toLocaleString()}\n`;
        res += `┃ 📱 *Saldo DANA:* Rp${user.dana_balance.toLocaleString()}\n`;
        res += `┃\n`;
        res += `┣━━━━━━━━━━━━━━━━━━━━┛\n`;
        res += `┃ _Gunakan buat modal Sawit atau Padi!_\n`;
        res += `┗━━━━━━━━━━━━━━━━━━━━┛`;

        await conn.sendMessage(m.chat, { react: { text: '💸', key: m.key } });
        return m.reply(res);
    }
};

/**
 * Fungsi pembantu buat format waktu cooldown
 */
function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + " jam " + minutes + " menit " + seconds + " detik";
}
