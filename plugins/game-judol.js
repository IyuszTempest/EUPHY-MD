/**
 * Simulasi Keberuntungan (Bandar Edition) 🎰🎲
 * Fitur: Win Rate & Profit Owner
 */

module.exports = {
    command: ['judol', 'judi'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text, isOwner }) => {
        let user = global.db.data.users[m.sender];
        
        // Ambil data owner dari config (Biasanya nomor pertama di array owner)
        let ownerNumber = global.owner[0] + '@s.whatsapp.net';
        let ownerData = global.db.data.users[ownerNumber];

        if (!user) return m.reply("Daftar dulu di database!");
        if (typeof user.dana_balance === 'undefined') user.dana_balance = 0;

        let bet = parseInt(text);
        if (!text || isNaN(bet) || bet <= 0) return m.reply(`🎰 *CARA MAIN* 🎰\n\nKetik: *${usedPrefix + command} <nominal bet>*\nContoh: *${usedPrefix + command} 50000*`);

        if (bet < 1000) return m.reply("❌ Minimal bet adalah Rp1.000");
        if (user.dana_balance < bet) return m.reply(`❌ Saldo DANA kamu tidak cukup!`);

        // --- PENGATURAN BANDAR ---
        // Win Rate 20% (User cuma punya 20% peluang buat menang)
        let winRate = 20; 
        let rng = Math.floor(Math.random() * 100);
        let forceWin = rng < winRate; 

        // Animasi "Rolling"
        let { key } = await conn.sendMessage(m.chat, { text: "🎰 *Memutar mesin keberuntungan...*" });
        await new Promise(r => setTimeout(r, 1000));

        const emojis = ["🍎", "🍋", "🍇", "🍒", "💎", "🔔", "7️⃣"];
        let a, b, c;

        if (forceWin) {
            // Jika terpilih menang, buat semua emoji sama
            a = emojis[Math.floor(Math.random() * emojis.length)];
            b = a;
            c = a;
        } else {
            // Jika kalah, pastikan minimal ada satu yang beda
            a = emojis[Math.floor(Math.random() * emojis.length)];
            b = emojis[Math.floor(Math.random() * emojis.length)];
            c = emojis[Math.floor(Math.random() * emojis.length)];
            if (a === b && b === c) { // Pengaman kalau hoki gak sengaja sama
                c = emojis[(emojis.indexOf(a) + 1) % emojis.length];
            }
        }

        let isWin = (a === b && b === c);
        let isJackpot = (a === "7️⃣" && b === "7️⃣" && c === "7️⃣");
        let multiplier = isJackpot ? 10 : (isWin ? 3 : 0);

        let resultText = `╭━━〔 🎰 *𝚁𝙴𝚂𝚄𝙻𝚃* 〕━━┓\n`;
        resultText += `┃\n`;
        resultText += `┃       [ ${a} | ${b} | ${c} ]\n`;
        resultText += `┃\n`;

        if (multiplier > 0) {
            let menang = bet * multiplier;
            user.dana_balance += menang;
            resultText += `┃ 🎉 *MENANG PARAH!*\n`;
            resultText += `┃ 💰 Hadiah: +Rp${menang.toLocaleString()}\n`;
            await conn.sendMessage(m.chat, { react: { text: '💳', key: m.key } });
        } else {
            // LOGIC OWNER PROFIT
            user.dana_balance -= bet;
            if (ownerData) {
                if (typeof ownerData.dana_balance === 'undefined') ownerData.dana_balance = 0;
                ownerData.dana_balance += bet; // Duit rungkad masuk ke DANA Owner
            }

            resultText += `┃ 💀 *RUNGKAD BOS!*\n`;
            resultText += `┃ 💸 Kehilangan: -Rp${bet.toLocaleString()}\n`;
            await conn.sendMessage(m.chat, { react: { text: '😭', key: m.key } });
        }

        resultText += `┃ 📱 Sisa DANA: Rp${user.dana_balance.toLocaleString()}\n`;
        resultText += `┗━━━━━━━━━━━━━━━━━━━━┛\n`;
        resultText += multiplier > 0 ? `_WD sekarang sebelum disedot bandar!_ 🗿` : `_Ayo depo lagi, bentar lagi bisa WD tuh!_ 🤡`;

        return conn.sendMessage(m.chat, { text: resultText, edit: key });
    }
};
