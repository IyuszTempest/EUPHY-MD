/**
 * Game Tanam Sawah (Padi) 🌾🚜
 * Mode: Saldo Utama (Uang Utama)
 * Format: Unified Plugin System
 */

module.exports = {
    command: ['sawah', 'tanam', 'panenpadi', 'pupuk'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        // Inisialisasi variabel Sawah jika belum ada
        if (typeof user.money === 'undefined') user.money = 0;
        if (typeof user.padi === 'undefined') user.padi = 0; 
        if (typeof user.lastpanenpadi === 'undefined') user.lastpanenpadi = 0;

        const hargaBibit = 20000; // Harga 1 petak sawah
        const hasilPanen = 15000; // Hasil jual per petak
        const cooldownPanen = 3600000; // 1 Jam untuk panen

        const cmd = command.toLowerCase();

        // --- 1. STATUS SAWAH ---
        if (cmd === 'sawah') {
            let status = `╭━━〔 🌾 *𝚂𝙰𝚆𝙰𝙷 𝙸𝙽𝙳𝙾𝙽𝙴𝚂𝙸𝙰* 〕━━┓\n`;
            status += `┃\n`;
            status += `┃ 🧑‍🌾 *Petani:* ${m.pushName}\n`;
            status += `┃ 🌾 *Tanaman Padi:* ${user.padi} Petak\n`;
            status += `┃ 💵 *Uang Utama:* Rp${user.money.toLocaleString()}\n`;
            status += `┃\n`;
            status += `┣━━〔 🕹️ *𝙼𝙴𝙽𝚄 𝚃𝙰𝙽𝙸* 〕━━┓\n`;
            status += `┃ 🌱 *${usedPrefix}tanam <jumlah>*\n`;
            status += `┃    (Beli bibit & tanam padi)\n`;
            status += `┃ 🚜 *${usedPrefix}panenpadi*\n`;
            status += `┃    (Ambil hasil panen padi)\n`;
            status += `┃\n`;
            status += `┗━━━━━━━━━━━━━━━━━━━━┛\n`;
            status += `_Padi menguning, dompet pun garing!_`;
            
            return m.reply(status);
        }

        // --- 2. TANAM PADI ---
        if (cmd === 'tanam') {
            if (!text || isNaN(text)) return m.reply(`Mau tanam berapa petak?\nContoh: *${usedPrefix + command} 5*`);
            let jumlah = parseInt(text);
            let totalBiaya = jumlah * hargaBibit;

            if (user.money < totalBiaya) return m.reply(`❌ Uang utama kamu gak cukup! Butuh Rp${totalBiaya.toLocaleString()}`);

            user.money -= totalBiaya;
            user.padi += jumlah;

            return m.reply(`🌱 Berhasil menanam *${jumlah}* petak padi!\n💸 Biaya: Rp${totalBiaya.toLocaleString()}\n⏳ Tunggu 1 jam buat panen.`);
        }

        // --- 3. PANEN PADI ---
        if (cmd === 'panenpadi' || cmd === 'pupuk') {
            if (user.padi === 0) return m.reply("❌ Kamu belum tanam apa-apa di sawah!");

            let timers = (cooldownPanen - (new Date() - user.lastpanenpadi));
            if (new Date() - user.lastpanenpadi < cooldownPanen) {
                return m.reply(`⏳ Padi belum kuning, tunggu *${msToTime(timers)}* lagi.`);
            }

            let totalHasil = user.padi * hasilPanen;
            user.money += totalHasil;
            let jumlahPanen = user.padi;
            user.padi = 0; 
            user.lastpanenpadi = new Date() * 1;

            let res = `🚜 *PANEN RAYA BERHASIL!*\n\n`;
            res += `🌾 Padi Terjual: ${jumlahPanen} Petak\n`;
            res += `💰 Uang Masuk: +Rp${totalHasil.toLocaleString()}\n`;
            res += `💳 Total Uang Utama: Rp${user.money.toLocaleString()}`;
            
            await conn.sendMessage(m.chat, { react: { text: '🌾', key: m.key } });
            return m.reply(res);
        }
    }
};

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let seconds = Math.floor((duration / 1000) % 60);
    return minutes + " menit " + seconds + " detik";
              }
