/**
 * Plugin: Trading Simulator V2 (Fixed DANA Only) 📉📈
 * Status: 100% Menggunakan Saldo DANA
 */

module.exports = {
    command: ['helptrade', 'op', 'cekaset', 'trade'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database bot!");

        // --- INISIALISASI ---
        user.dana_balance = user.dana_balance || 0; // Pastikan pakai dana_balance
        if (typeof user.last_trade === 'undefined') user.last_trade = 0;

        const cmd = command.toLowerCase();

        // --- [ 1. MENU HELP ] ---
        if (cmd === 'helptrade' || (cmd === 'trade' && !text)) {
            let h = `╭━━〔 💹 *𝙴𝚄𝙿𝙷𝚈 𝚃𝚁𝙰𝙳𝙸𝙽𝙶* 💹 〕━━┓\n`;
            h += `┃\n`;
            h += `┃ 🚀 *Cara Main:* \n`;
            h += `┃ \`${usedPrefix}trade [nominal] [durasi]\` \n`;
            h += `┃\n`;
            h += `┃ 📱 *Saldo DANA:* Rp${user.dana_balance.toLocaleString()}\n`;
            h += `┃ 💰 *Profit:* 85% \n`;
            h += `┃ ⏱️ *Limit:* 1 - 10 Menit \n`;
            h += `┃\n`;
            h += `┃ 📝 *Contoh:* \n`;
            h += `┃ \`${usedPrefix}trade 10000 1\` \n`;
            h += `┗━━━━━━━━━━━━━━━┛\n`;
            h += `_Pastikan saldo DANA mencukupi!_ 🌸`;
            return m.reply(h);
        }

        // --- [ 2. LOGIKA TRADING ] ---
        if (cmd === 'trade' || cmd === 'op') {
            let [nominal, durasi] = text.split(' ');
            nominal = parseInt(nominal);
            durasi = parseInt(durasi) || 1; 

            if (isNaN(nominal) || nominal < 1000) {
                return m.reply(`❌ Masukkan nominal yang valid! Minimal Rp1.000.\nContoh: *${usedPrefix}trade 10000 1*`);
            }
            if (durasi < 1 || durasi > 10) {
                return m.reply(`❌ Durasi minimal 1 menit dan maksimal 10 menit.`);
            }

            // CEK SALDO DANA
            if (user.dana_balance < nominal) {
                return m.reply(`❌ Saldo DANA tidak cukup!\n\n💰 *Saldo DANA:* Rp${user.dana_balance.toLocaleString()}\n💸 *Kurang:* Rp${(nominal - user.dana_balance).toLocaleString()}\n\n_Silakan topup dulu dari saldo utama._`);
            }

            // CEK COOLDOWN
            let cooldown = durasi * 60000; 
            if (new Date() - user.last_trade < cooldown) {
                let sisa = cooldown - (new Date() - user.last_trade);
                let menit = Math.floor(sisa / 60000);
                let detik = Math.floor((sisa % 60000) / 1000);
                return m.reply(`❌ Masih ada posisi terbuka! Tunggu *${menit}m ${detik}s* lagi.`);
            }

            // POTONG SALDO DANA
            user.dana_balance -= nominal;
            user.last_trade = new Date() * 1;

            let { key } = await conn.sendMessage(m.chat, { 
                text: `📊 *OPEN POSITION BERHASIL*\n\n💰 *Modal DANA:* Rp${nominal.toLocaleString()}\n⏱️ *Durasi:* ${durasi} Menit\n📈 *Status:* Menganalisa Market...` 
            });

            await new Promise(r => setTimeout(r, 2500));
            await conn.sendMessage(m.chat, { text: `📉 *Grafik sedang fluktuatif (BTC/USDT)...*`, edit: key });

            // EKSEKUSI SETELAH DURASI SELESAI
            setTimeout(async () => {
                let isWin = Math.random() > 0.5; 
                let multiplier = 1.85; 
                let winAmount = Math.floor(nominal * multiplier);

                if (isWin) {
                    // TAMBAH KE SALDO DANA
                    user.dana_balance += winAmount;
                    let notaWin = `✅ *TRADE PROFIT!* 🟢\n\n`;
                    notaWin += `📈 *Market:* BTC/USDT\n`;
                    notaWin += `💰 *Hasil:* Rp${winAmount.toLocaleString()}\n`;
                    notaWin += `💸 *Net Profit:* +Rp${(winAmount - nominal).toLocaleString()}\n\n`;
                    notaWin += `*Saldo DANA Sekarang:* Rp${user.dana_balance.toLocaleString()}`;
                    await conn.sendMessage(m.chat, { text: notaWin });
                } else {
                    let notaLoss = `❌ *TRADE LOSS!* 🔴\n\n`;
                    notaLoss += `📉 *Market:* BTC/USDT\n`;
                    notaLoss += `💸 *Loss:* -Rp${nominal.toLocaleString()}\n\n`;
                    notaLoss += `_Saldo DANA kamu berkurang. Tetap tenang!_`;
                    await conn.sendMessage(m.chat, { text: notaLoss });
                }
            }, durasi * 60000);
        }

        // --- [ 3. CEK ASET ] ---
        if (cmd === 'cekaset') {
            let statusAset = `╭━━〔 🎒 *𝙲𝙴𝙺 𝙰𝚂𝙴𝚃* 〕━━┓\n`;
            statusAset += `┃ 📱 *Saldo DANA:* Rp${user.dana_balance.toLocaleString()}\n`;
            statusAset += `┃ 💵 *Saldo Utama:* Rp${(user.money || 0).toLocaleString()}\n`;
            statusAset += `┗━━━━━━━━━━━━━━┛`;
            return m.reply(statusAset);
        }
    }
};
