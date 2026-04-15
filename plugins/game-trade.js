/**
 * Plugin: Trading Simulator V2 (DANA Edition) 📉📈
 * Fitur: Taruhan pakai Saldo DANA, Auto-Help, & Realistic Profit.
 */

module.exports = {
    command: ['helptrade', 'op', 'cekaset', 'trade'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database bot!");

        // --- INISIALISASI ---
        user.dana_balance = user.dana_balance || 0;
        if (typeof user.last_trade === 'undefined') user.last_trade = 0;

        const cmd = command.toLowerCase();

        // --- 1. MENU HELP (Pusat Bantuan) ---
        if (cmd === 'helptrade' || (cmd === 'trade' && !text)) {
            let h = `╭━━〔 💹 *𝙴𝚄𝙿𝙷𝚈 𝚃𝚁𝙰𝙳𝙸𝙽𝙶* 💹 〕━━┓\n`;
            h += `┃\n`;
            h += `┃ 🚀 *Cara Main:* \n`;
            h += `┃ \`${usedPrefix}trade [nominal] [durasi]\` \n`;
            h += `┃\n`;
            h += `┃ 📝 *Contoh:* \n`;
            h += `┃ \`${usedPrefix}trade 50000 1\` \n`;
            h += `┃ _(Trade Rp50rb selama 1 menit)_\n`;
            h += `┃\n`;
            h += `┃ 📱 *Saldo DANA:* Rp${user.dana_balance.toLocaleString()}\n`;
            h += `┃ 💰 *Profit:* 85% - 90% \n`;
            h += `┃ ⏱️ *Limit:* 1 - 10 Menit \n`;
            h += `┗━━━━━━━━━━━━━━━┛\n`;
            h += `_Gunakan saldo DANA untuk modal!_ 🌸`;
            return m.reply(h);
        }

        // --- 2. LOGIKA TRADING ---
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
            if (user.dana_balance < nominal) {
                return m.reply(`❌ Saldo DANA kamu gak cukup! Saldo DANA saat ini: Rp${user.dana_balance.toLocaleString()}\n\n_Topup dulu dari saldo utama ke DANA._`);
            }

            // Cooldown berdasarkan durasi
            let cooldown = durasi * 60000; 
            if (new Date() - user.last_trade < cooldown) {
                let sisa = cooldown - (new Date() - user.last_trade);
                let menit = Math.floor(sisa / 60000);
                let detik = Math.floor((sisa % 60000) / 1000);
                return m.reply(`❌ Masih ada posisi terbuka! Tunggu *${menit}m ${detik}s* lagi.`);
            }

            // Potong saldo DANA di awal
            user.dana_balance -= nominal;
            user.last_trade = new Date() * 1;

            let { key } = await conn.sendMessage(m.chat, { 
                text: `📊 *OPEN POSITION BERHASIL*\n\n💰 *Modal DANA:* Rp${nominal.toLocaleString()}\n⏱️ *Durasi:* ${durasi} Menit\n📈 *Status:* Menganalisa Market...` 
            });

            // Delay animasi
            await new Promise(r => setTimeout(r, 2500));
            await conn.sendMessage(m.chat, { text: `📉 *Grafik sedang fluktuatif (Binary Option)...*`, edit: key });

            // Set Timeout sesuai durasi
            setTimeout(async () => {
                let isWin = Math.random() > 0.5; // 50:50 Chance
                let multiplier = 1.85; 
                let winAmount = Math.floor(nominal * multiplier);

                if (isWin) {
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
                    notaLoss += `_Pasar lagi kejam, coba lagi nanti!_`;
                    await conn.sendMessage(m.chat, { text: notaLoss });
                }
            }, durasi * 60000);
        }

        // --- 3. CEK ASET ---
        if (cmd === 'cekaset') {
            return m.reply(`📱 *DOMPET DANA:* Rp${user.dana_balance.toLocaleString()}\n💵 *SALDO UTAMA:* Rp${(user.money || 0).toLocaleString()}`);
        }
    }
};
