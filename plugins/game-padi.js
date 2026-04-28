/**
 * Game Sawah Indonesia V2 (Economy & Mood System) 🌾🚜
 * Feature: Gaji Buruh, Mood Booster (Kopi, Rokok, dsb), & Bonus Mood.
 */

module.exports = {
    command: ['sawah', 'tanampadi', 'panenpadi', 'feed', 'makanburuh'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        // --- [ DATABASE INITIALIZATION ] ---
        if (typeof user.money === 'undefined') user.money = 0;
        if (typeof user.padi === 'undefined') user.padi = 0; 
        if (typeof user.lastpanenpadi === 'undefined') user.lastpanenpadi = 0;
        if (typeof user.mood_buruh === 'undefined') user.mood_buruh = 100; // Mood awal 100%

        const hargaBibit = 20000;
        const hasilPanenBase = 35000; // Base hasil lebih tinggi karena ada potongan gaji
        const biayaGajiBuruh = 5000;  // Potongan wajib per petak buat gaji orang
        const cooldownPanen = 3600000; 

        // --- [ ITEM BOOSTER DATA ] ---
        const items = {
            kopi: { harga: 5000, mood: 10, msg: '☕ Seger cuy! Buruh semangat kerja.' },
            gorengan: { harga: 3000, mood: 5, msg: '🥖 Gorengan anget bikin buruh hepi.' },
            roti: { harga: 7000, mood: 15, msg: '🍞 Roti ganjal perut, kerja makin lurus.' },
            rokok: { harga: 25000, mood: 40, msg: '🚬 BOOSTER! Asap mengepul, panen makin ngebul.' } // Mahal & Efek Tinggi
        };

        const cmd = command.toLowerCase();

        // --- 1. STATUS SAWAH ---
        if (cmd === 'sawah') {
            let emojiMood = user.mood_buruh > 70 ? '😊' : user.mood_buruh > 30 ? '😐' : '😡';
            let status = `╭━━〔 🌾 *𝚂𝙰𝚆𝙰𝙷 𝙸𝙽𝙳𝙾𝙽𝙴𝚂𝙸𝙰* 〕━━┓\n`;
            status += `┃\n`;
            status += `┃ 🧑‍🌾 *Tuan Tanah:* ${m.pushName}\n`;
            status += `┃ 🌾 *Lahan Padi:* ${user.padi} Petak\n`;
            status += `┃ ${emojiMood} *Mood Buruh:* ${user.mood_buruh}%\n`;
            status += `┃ 💵 *Saldo:* Rp${user.money.toLocaleString()}\n`;
            status += `┃\n`;
            status += `┣━━〔 🕹️ *𝙼𝙴𝙽𝚄 𝚃𝙰𝙽𝙸* 〕━━┓\n`;
            status += `┃ 🌱 *${usedPrefix}tanampadi <jumlah>*\n`;
            status += `┃ 🚜 *${usedPrefix}panenpadi*\n`;
            status += `┃ 🍿 *${usedPrefix}feed <item>*\n`;
            status += `┃    _(kopi, gorengan, roti, rokok)_\n`;
            status += `┃\n`;
            status += `┗━━━━━━━━━━━━━━━━━┛\n`;
            return m.reply(status);
        }

        // --- 2. FEED SYSTEM (BOOST MOOD) ---
        if (cmd === 'feed' || cmd === 'makanburuh') {
            if (!text) return m.reply(`Mau kasih makan apa buruhnya?\nContoh: *${usedPrefix}feed kopi*\n\n*Menu:* Kopi, Gorengan, Roti, Rokok.`);
            let itemKey = text.toLowerCase();
            if (!items[itemKey]) return m.reply("❌ Menu itu nggak tersedia di warung sawah!");

            let item = items[itemKey];
            if (user.money < item.harga) return m.reply(`❌ Uang kamu gak cukup buat beli ${itemKey}!`);
            if (user.mood_buruh >= 100) return m.reply("❌ Buruh kamu udah super hepi, jangan dikasih makan terus nanti obesitas!");

            user.money -= item.harga;
            user.mood_buruh = Math.min(100, user.mood_buruh + item.mood);

            return m.reply(`✅ *BERHASIL!* ${item.msg}\n💰 -Rp${item.harga.toLocaleString()} | ✨ Mood: +${item.mood}%`);
        }

        // --- 3. TANAM PADI ---
        if (cmd === 'tanampadi') {
            if (!text || isNaN(text)) return m.reply(`Mau tanam berapa petak?\nContoh: *${usedPrefix}tanam 5*`);
            let jumlah = parseInt(text);
            let totalBiaya = jumlah * hargaBibit;

            if (user.money < totalBiaya) return m.reply(`❌ Uang kamu gak cukup!`);

            user.money -= totalBiaya;
            user.padi += jumlah;
            // Tanam bikin mood buruh turun dikit karena capek [cite: 2026-04-28]
            user.mood_buruh = Math.max(0, user.mood_buruh - (jumlah * 1)); 

            return m.reply(`🌱 Berhasil tanam *${jumlah}* petak.\nMood buruh turun karena capek kerja.`);
        }

        // --- 4. PANEN PADI (COMPLEX LOGIC) ---
        if (cmd === 'panenpadi') {
            if (user.padi === 0) return m.reply("❌ Lahan kosong, tanam dulu!");

            let timers = (cooldownPanen - (new Date() - user.lastpanenpadi));
            if (new Date() - user.lastpanenpadi < cooldownPanen) {
                return m.reply(`⏳ Padi belum kuning, tunggu *${msToTime(timers)}* lagi.`);
            }

            // --- HITUNG MOOD MULTIPLIER --- [cite: 2026-04-28]
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
            // Setelah panen mood buruh drop drastis karena kerja berat [cite: 2026-04-28]
            user.mood_buruh = Math.max(0, user.mood_buruh - 30); 

            let res = `🚜 *PANEN RAYA SELESAI!*\n\n`;
            res += `🌾 Total: ${jumlahPanen} Petak\n`;
            res += `📈 Multiplier Mood: x${multiplier}\n`;
            res += `💸 Gaji Buruh: -Rp${totalGaji.toLocaleString()}\n`;
            res += `💰 Profit Bersih: +Rp${pendapatanBersih.toLocaleString()}\n`;
            res += `⚠️ Mood Buruh drop jadi ${user.mood_buruh}%! Segera kasih kopi!`;
            
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
