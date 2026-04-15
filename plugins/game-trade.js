/**
 * Plugin: Trading Simulator V1 (Fast Trade) 📉📈
 * Fitur: Open Position, Duration, & Profit/Loss Logic
 */

const crypto = require('crypto');

module.exports = {
    command: ['helptrade', 'op', 'cekaset', 'trade'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database bot!");

        // --- INISIALISASI ---
        if (typeof user.money === 'undefined') user.money = 0;
        if (typeof user.last_trade === 'undefined') user.last_trade = 0;

        const cmd = command.toLowerCase();

        // --- 1. MENU HELP ---
        if (cmd === 'helptrade') {
            let h = `╭━━〔 💹 *𝙴𝚄𝙿𝙷𝚈 𝚃𝚁𝙰𝙳𝙸𝙽𝙶* 💹 〕━━┓\n`;
            h += `┃\n`;
            h += `┃ 🚀 *Cara Main:* \n`;
            h += `┃ \`trade [nominal] [durasi]\` \n`;
            h += `┃\n`;
            h += `┃ 📝 *Contoh:* \n`;
            h += `┃ \`trade 50000 1\` \n`;
            h += `┃ _(Artinya trade Rp50rb selama 1 menit)_\n`;
            h += `┃\n`;
            h += `┃ 💰 *Profit:* Up to 90% \n`;
            h += `┃ ⏱️ *Limit:* Minimal 1 Menit \n`;
            h += `┗━━━━━━━━━━━━━━━┛\n`;
            h += `_High Risk, High Return! Gunakan uang dingin._ ☕`;
            return m.reply(h);
        }

        // --- 2. LOGIKA TRADING ---
        if (cmd === 'trade' || cmd === 'op') {
            let [nominal, durasi] = text.split(' ');
            nominal = parseInt(nominal);
            durasi = parseInt(durasi) || 1; // Default 1 menit

            if (isNaN(nominal) || nominal < 1000) {
                return m.reply(`❌ Masukkan nominal yang valid! Minimal Rp1.000.\nContoh: *trade 10000 1*`);
            }
            if (durasi < 1 || durasi > 10) {
                return m.reply(`❌ Durasi minimal 1 menit dan maksimal 10 menit.`);
            }
            if (user.money < nominal) {
                return m.reply(`❌ Saldo kamu gak cukup! Saldo saat ini: Rp${user.money.toLocaleString()}`);
            }

            // Cooldown agar tidak spam (berdasarkan durasi yang dipilih)
            let cooldown = durasi * 60000; 
            if (new Date() - user.last_trade < cooldown) {
                return m.reply(`❌ Kamu masih punya posisi yang terbuka! Tunggu trade sebelumnya selesai.`);
            }

            // Potong saldo di awal (Margin)
            user.money -= nominal;
            user.last_trade = new Date() * 1;

            let { key } = await conn.sendMessage(m.chat, { 
                text: `📊 *OPEN POSITION BERHASIL*\n\n💰 *Investasi:* Rp${nominal.toLocaleString()}\n⏱️ *Durasi:* ${durasi} Menit\n📈 *Status:* Menganalisa Market...` 
            });

            // Simulasi pergerakan grafik (delay 3 detik buat gaya-gayaan)
            await new Promise(r => setTimeout(r, 3000));
            await conn.sendMessage(m.chat, { text: `📉 *Grafik sedang fluktuatif...*`, edit: key });

            // Set Timeout sesuai durasi trade
            setTimeout(async () => {
                // Logika Win/Lose (50:50 Chance, bisa kamu modif)
                let isWin = Math.random() > 0.5;
                let multiplier = 1.85; // Profit 85% dari modal
                let winAmount = Math.floor(nominal * multiplier);

                if (isWin) {
                    user.money += winAmount;
                    let notaWin = `✅ *TRADE PROFIT!* 🟢\n\n`;
                    notaWin += `📈 *Market:* Crypto/USDT\n`;
                    notaWin += `💰 *Hasil:* Rp${winAmount.toLocaleString()}\n`;
                    notaWin += `💸 *Net Profit:* +Rp${(winAmount - nominal).toLocaleString()}\n\n`;
                    notaWin += `*Total Saldo:* Rp${user.money.toLocaleString()}`;
                    await conn.sendMessage(m.chat, { text: notaWin });
                } else {
                    let notaLoss = `❌ *TRADE LOSS!* 🔴\n\n`;
                    notaLoss += `📉 *Market:* Crypto/USDT\n`;
                    notaLoss += `💸 *Kerugian:* -Rp${nominal.toLocaleString()}\n\n`;
                    notaLoss += `_Jangan menyerah, pasar selalu ada esok hari._`;
                    await conn.sendMessage(m.chat, { text: notaLoss });
                }
            }, durasi * 60000);
        }

        if (cmd === 'cekaset') {
            return m.reply(`💰 *SALDO UTAMA:* Rp${user.money.toLocaleString()}`);
        }
    }
};
