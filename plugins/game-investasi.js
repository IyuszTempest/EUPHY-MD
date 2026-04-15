/**
 * Plugin: Investasi Simulator (DANA Edition) 📈
 * Fitur: Beli/Jual pake Saldo DANA, Harga Fluktuatif.
 */

module.exports = {
    command: ['helpiv', 'inves', 'beliinves', 'jualinves', 'portofolio'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        // --- INISIALISASI DATABASE ---
        if (typeof user.investasi === 'undefined') user.investasi = {
            emas: 0,
            saham: 0,
            reksadana: 0
        };
        user.dana_balance = user.dana_balance || 0; // Menggunakan Saldo DANA

        // --- KONFIGURASI MARKET ---
        const market = {
            emas: { 
                base: 1000000, 
                volt: 50000, 
                nama: "Emas Antam (per gram)" 
            },
            saham: { 
                base: 500000, 
                volt: 200000, 
                nama: "Saham Bluechip (per lot)" 
            },
            reksadana: { 
                base: 100000, 
                volt: 5000, 
                nama: "Reksadana Pasar Uang (per unit)" 
            }
        };

        const cmd = command.toLowerCase();

        // --- [ 1. MENU HELP ] ---
        if (cmd === 'helpiv') {
            let h = `╭━━〔 📈 *𝙸𝙽𝚅𝙴𝚂𝚃𝙰𝚂𝙸 𝙳𝙰𝙽𝙰* 📈 〕━━┓\n`;
            h += `┃\n`;
            h += `┃ 🛒 *Beli:* \`${usedPrefix}beliinves [jenis] [jumlah]\` \n`;
            h += `┃ 💰 *Jual:* \`${usedPrefix}jualinves [jenis] [jumlah]\` \n`;
            h += `┃ 📊 *Cek Harga:* \`${usedPrefix}inves\` \n`;
            h += `┃ 🎒 *Dompet:* \`${usedPrefix}portofolio\` \n`;
            h += `┃\n`;
            h += `┃ *Catatan:* \n`;
            h += `┃ _Transaksi otomatis menggunakan Saldo DANA._\n`;
            h += `┗━━━━━━━━━━━━━━━┛\n`;
            h += `_Cuan hari ini, kaya esok hari!_ 🚀`;
            return m.reply(h);
        }

        // --- [ 2. MARKET UPDATE ] ---
        if (cmd === 'inves') {
            let marketText = `📊 *MARKET UPDATE HARI INI* 📊\n\n`;
            for (let x in market) {
                let currentPrice = market[x].base + (Math.floor(Math.random() * market[x].volt * 2) - market[x].volt);
                marketText += `🔸 *${market[x].nama}*\n`;
                marketText += `   Price: Rp${currentPrice.toLocaleString()}\n\n`;
            }
            marketText += `_Gunakan *${usedPrefix}beliinves* untuk transaksi. Ketik *${usedPrefix}helpiv* untuk melihat menu investasi_`;
            return m.reply(marketText);
        }

        // --- [ 3. PORTOFOLIO ] ---
        if (cmd === 'portofolio') {
            let p = `🎒 *PORTOFOLIO INVESTASI* 🎒\n\n`;
            p += `✨ Nama: ${m.pushName}\n`;
            p += `📱 Saldo DANA: Rp${user.dana_balance.toLocaleString()}\n\n`;
            p += `🔸 Emas: ${user.investasi.emas} gr\n`;
            p += `🔸 Saham: ${user.investasi.saham} lot\n`;
            p += `🔸 Reksadana: ${user.investasi.reksadana} unit\n\n`;
            p += `_Cek harga berkala biar tau kapan cuan!_`;
            return m.reply(p);
        }

        // --- [ 4. BELI ASSET ] ---
        if (cmd === 'beliinves') {
            let [type, qty] = text.split(' ');
            type = type?.toLowerCase();
            qty = parseInt(qty) || 1;

            if (!market[type]) return m.reply(`❌ Pilih jenis yang benar: *emas, saham, reksadana*`);
            
            let price = market[type].base + (Math.floor(Math.random() * market[type].volt * 2) - market[type].volt);
            let total = price * qty;

            if (user.dana_balance < total) {
                return m.reply(`❌ Saldo DANA kamu tidak cukup!\nTotal beli: Rp${total.toLocaleString()}\nSaldo DANA: Rp${user.dana_balance.toLocaleString()}`);
            }

            user.dana_balance -= total;
            user.investasi[type] += qty;

            return m.reply(`✅ *INVESTASI BERHASIL*\n\nKamu membeli *${qty} ${type}*\n💰 Biaya: Rp${total.toLocaleString()}\n📱 Sisa Saldo DANA: Rp${user.dana_balance.toLocaleString()}`);
        }

        // --- [ 5. JUAL ASSET ] ---
        if (cmd === 'jualinves') {
            let [type, qty] = text.split(' ');
            type = type?.toLowerCase();
            qty = parseInt(qty) || 1;

            if (!market[type]) return m.reply(`❌ Jenis salah!`);
            if (user.investasi[type] < qty) return m.reply(`❌ Kamu tidak punya cukup aset ${type}!`);

            let price = market[type].base + (Math.floor(Math.random() * market[type].volt * 2) - market[type].volt);
            let total = price * qty;

            user.dana_balance += total;
            user.investasi[type] -= qty;

            let { key } = await conn.sendMessage(m.chat, { text: `📉 *Sedang memproses penjualan ke bursa...*` });
            await new Promise(r => setTimeout(r, 1500));

            return conn.sendMessage(m.chat, { 
                text: `💰 *INVESTASI CAIR!*\n\nBerhasil jual *${qty} ${type}*.\n💵 Masuk ke DANA: Rp${total.toLocaleString()}\n📱 Total Saldo DANA: Rp${user.dana_balance.toLocaleString()}`,
                edit: key 
            });
        }
    }
};
