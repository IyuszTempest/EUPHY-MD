/**
 * Simulasi Keberuntungan (Game Only) 🎰🎲
 * Integrated with DANA Balance
 * Format: Unified Plugin System
 */

module.exports = {
    command: ['judol', 'judi'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");
        if (typeof user.dana_balance === 'undefined') user.dana_balance = 0;

        let bet = parseInt(text);
        if (!text || isNaN(bet) || bet <= 0) return m.reply(`🎰 *CARA MAIN* 🎰\n\nKetik: *${usedPrefix + command} <nominal bet>*\nContoh: *${usedPrefix + command} 50000*`);

        if (bet < 1000) return m.reply("❌ Minimal bet adalah Rp1.000");
        if (user.dana_balance < bet) return m.reply(`❌ Saldo DANA kamu tidak cukup! Sisa saldo: Rp${user.dana_balance.toLocaleString()}`);

        // Animasi "Rolling"
        let { key } = await conn.sendMessage(m.chat, { text: "🎰 *Memutar mesin keberuntungan...*" });
        await new Promise(r => setTimeout(r, 1500));

        const emojis = ["🍎", "🍋", "🍇", "🍒", "💎", "🔔", "7️⃣"];
        let a = emojis[Math.floor(Math.random() * emojis.length)];
        let b = emojis[Math.floor(Math.random() * emojis.length)];
        let c = emojis[Math.floor(Math.random() * emojis.length)];

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
            user.dana_balance -= bet;
            resultText += `┃ 💀 *RUNGKAD BOS!*\n`;
            resultText += `┃ 💸 Kehilangan: -Rp${bet.toLocaleString()}\n`;
            await conn.sendMessage(m.chat, { react: { text: '😭', key: m.key } });
        }

        resultText += `┃ 📱 Sisa DANA: Rp${user.dana_balance.toLocaleString()}\n`;
        resultText += `┗━━━━━━━━━━━━━━━━━━━━┛\n`;
        resultText += multiplier > 0 ? `_Kemenangan adalah awal dari kekalahan._ 🗿` : `_Ayo depo lagi, dikit lagi JP itu!_ 🤡`;

        return conn.sendMessage(m.chat, { text: resultText, edit: key });
    }
};
          
