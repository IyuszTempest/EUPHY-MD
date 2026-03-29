/**
 * E-Wallet DANA (Game Edition) 💙📱
 * Manage your in-game money across all plugins.
 * Format: Unified Plugin System
 */

module.exports = {
    command: ['dana', 'topup', 'tarik', 'dompet'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        // Inisialisasi Saldo DANA jika belum ada
        if (typeof user.dana_balance === 'undefined') user.dana_balance = 0;
        if (typeof user.money === 'undefined') user.money = 0; // Saldo Utama Bot

        const cmd = command.toLowerCase();

        // --- 1. CEK SALDO DANA ---
        if (cmd === 'dana' || cmd === 'dompet') {
            let status = `╭━━〔 📱 *DANA FAKE* 〕━━┓\n`;
            status += `┃\n`;
            status += `┃ 👤 *User:* ${m.pushName}\n`;
            status += `┃ 💰 *Saldo DANA:* Rp${user.dana_balance.toLocaleString()}\n`;
            status += `┃ 💵 *Saldo Utama:* Rp${user.money.toLocaleString()}\n`;
            status += `┃\n`;
            status += `┣━━〔 🕹️ *𝙼𝙴𝙽𝚄 𝚃𝚁𝙰𝙽𝚂𝙰𝙺𝚂𝙸* 〕━━┓\n`;
            status += `┃ ➕ *${usedPrefix}topup <nominal>*\n`;
            status += `┃    (Pindah Saldo Utama -> DANA)\n`;
            status += `┃ ➖ *${usedPrefix}tarik <nominal>*\n`;
            status += `┃    (Pindah Saldo DANA -> Utama)\n`;
            status += `┃\n`;
            status += `┗━━━━━━━━━━━━━━━━━━━━┛\n`;
            status += `_Gunakan DANA untuk investasi game!_`;
            
            return m.reply(status);
        }

        // --- 2. TOP UP (Pindahkan Saldo Utama ke DANA) ---
        if (cmd === 'topup') {
            if (!text || isNaN(text)) return m.reply(`Contoh: *${usedPrefix + command} 50000*`);
            let nominal = parseInt(text);
            
            if (nominal < 10000) return m.reply("❌ Minimal Top Up Rp10.000");
            if (user.money < nominal) return m.reply("❌ Saldo utama kamu tidak cukup untuk Top Up!");

            user.money -= nominal;
            user.dana_balance += nominal;

            let res = `✅ *TOP UP BERHASIL*\n\n`;
            res += `💰 Nominal: Rp${nominal.toLocaleString()}\n`;
            res += `📱 Saldo DANA: Rp${user.dana_balance.toLocaleString()}\n`;
            res += `💳 Saldo Utama: Rp${user.money.toLocaleString()}`;
            
            return m.reply(res);
        }

        // --- 3. TARIK TUNAI (Pindahkan Saldo DANA ke Utama) ---
        if (cmd === 'tarik') {
            if (!text || isNaN(text)) return m.reply(`Contoh: *${usedPrefix + command} 25000*`);
            let nominal = parseInt(text);

            if (nominal < 1000) return m.reply("❌ Minimal Tarik Tunai Rp1.000");
            if (user.dana_balance < nominal) return m.reply("❌ Saldo DANA kamu tidak cukup!");

            user.dana_balance -= nominal;
            user.money += nominal;

            let res = `💸 *PENARIKAN BERHASIL*\n\n`;
            res += `💰 Nominal: Rp${nominal.toLocaleString()}\n`;
            res += `📱 Sisa DANA: Rp${user.dana_balance.toLocaleString()}\n`;
            res += `💳 Saldo Utama: Rp${user.money.toLocaleString()}`;

            return m.reply(res);
        }
    }
};
