/**
 * E-Wallet DANA (Super Clean Edition) 💙📱
 * Fitur: Topup, Tarik, Daget, Klaim.
 * Status: FITUR TF DIHAPUS 🗑️
 */

module.exports = {
    command: ['dana', 'topup', 'tarik', 'dompet', 'daget', 'klaim'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");
        
        // Safety initialization (Angka 0 jika data belum ada)
        user.dana_balance = user.dana_balance || 0;
        user.money = user.money || 0;

        // Inisialisasi Database Daget Global
        if (!global.db.data.daget) global.db.data.daget = {};

        const cmd = command.toLowerCase();

        // --- [ 1. MENU UTAMA ] ---
        if (cmd === 'dana' || cmd === 'dompet') {
            let status = `╭━━〔 📱 *𝙳𝙰𝙽𝙰 𝙵𝙰𝙺𝙴* 〕━━┓\n`;
            status += `┃ 💰 *Saldo:* Rp${user.dana_balance.toLocaleString()}\n`;
            status += `┃ 💵 *Utama:* Rp${user.money.toLocaleString()}\n`;
            status += `┃\n`;
            status += `┣━━〔 🕹️ *𝚃𝚁𝙰𝙽𝚂𝙰𝙺𝚂𝙸* 〕━━┓\n`;
            status += `┃ ➕ *${usedPrefix}topup <nominal>*\n`;
            status += `┃ ➖ *${usedPrefix}tarik <nominal>*\n`;
            status += `┃ 🎁 *${usedPrefix}daget <nom> <kuota>*\n`;
            status += `┃ 🧧 *${usedPrefix}klaim <code>*\n`;
            status += `┗━━━━━━━━━━━━━━━━━┛\n`;
            status += `_Gunakan saldo untuk modal game!_ 🌸`;
            return m.reply(status);
        }

        // --- [ 2. DANA KAGET (DAGET) ] ---
        if (cmd === 'daget') {
            let args = text.split(' ');
            let nom = parseInt(args[0]);
            let kuota = parseInt(args[1]);

            if (!nom || !kuota || nom < 1000) return m.reply(`Cara buat:\n*${usedPrefix + command} <nominal> <kuota>*`);
            if (user.dana_balance < nom) return m.reply("❌ Saldo DANA kamu tidak cukup!");

            let code = Math.random().toString(36).substring(2, 8).toUpperCase();
            user.dana_balance -= nom;

            global.db.data.daget[code] = {
                perPerson: Math.floor(nom / kuota),
                kuota: kuota,
                claimed: []
            };

            let res = `🎁 *𝙳𝙰𝙽𝙰 𝙺𝙰𝙶𝙴𝚃 𝙳𝙸𝙱𝚄𝙰𝚃!*\n\n`;
            res += `🧧 Kode: *${code}*\n`;
            res += `💰 Total: Rp${nom.toLocaleString()}\n`;
            res += `👥 Kuota: ${kuota} orang\n\n`;
            res += `Ketik: *${usedPrefix}klaim ${code}* buat ambil!`;
            
            return m.reply(res);
        }

        // --- [ 3. KLAIM DAGET ] ---
        if (cmd === 'klaim') {
            let code = text.trim().toUpperCase();
            let daget = global.db.data.daget[code];

            if (!daget) return m.reply("❌ Kode Daget salah atau sudah kedaluwarsa.");
            if (daget.claimed.length >= daget.kuota) return m.reply("🧧 Yahh! Dagetnya dah habis.");
            if (daget.claimed.includes(m.sender)) return m.reply("❌ Kamu sudah ambil jatahmu!");

            user.dana_balance = (user.dana_balance || 0) + daget.perPerson;
            daget.claimed.push(m.sender);

            return m.reply(`🧧 *𝙺𝙻𝙰𝙸𝙼 𝙳𝙰𝙶𝙴𝚃 𝚂𝚄𝙺𝚂𝙴𝚂!*\n💰 Kamu dapat: Rp${daget.perPerson.toLocaleString()}`);
        }

        // --- [ 4. TOPUP ] ---
        if (cmd === 'topup') {
            let nom = parseInt(text);
            if (!nom || nom < 1000) return m.reply("❌ Minimal Topup Rp1.000");
            if (user.money < nom) return m.reply("❌ Uang utama kamu tidak cukup.");
            
            user.money -= nom;
            user.dana_balance += nom;
            return m.reply(`✅ *Topup Berhasil!*\n💰 Saldo DANA: Rp${user.dana_balance.toLocaleString()}`);
        }
        
        // --- [ 5. TARIK TUNAI (WD) ] ---
        if (cmd === 'tarik') {
            let nom = parseInt(text);
            if (!nom || user.dana_balance < nom) return m.reply("❌ Saldo DANA tidak cukup untuk ditarik.");
            
            user.dana_balance -= nom;
            user.money += nom;
            return m.reply(`✅ *Berhasil ditarik!*\n💵 Uang Utama: Rp${user.money.toLocaleString()}`);
        }
    }
};
