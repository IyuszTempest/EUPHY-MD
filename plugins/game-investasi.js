/**
 * Plugin: Investasi Simulator (Emas, Saham, Reksadana) 📈
 * Fitur: Harga Fluktuatif, Buy, Sell, & Portofolio
 */

module.exports = {
    command: ['inves', 'beliinves', 'jualinves', 'portofolio', 'helpiv'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu kak!");

        // --- INISIALISASI DATABASE ---
        if (typeof user.investasi === 'undefined') user.investasi = {
            emas: 0,
            saham: 0,
            reksadana: 0
        };
        if (typeof user.money === 'undefined') user.money = 0;

        // --- KONFIGURASI HARGA (Bisa berubah-ubah) ---
        // Harga dasar & range fluktuasi
        const market = {
            emas: { 
                base: 1000000, 
                volt: 50000, // Naik turun Rp50rb
                nama: "Emas Antam (per gram)" 
            },
            saham: { 
                base: 500000, 
                volt: 200000, // Saham lebih beresiko (Rp200rb)
                nama: "Saham Bluechip (per lot)" 
            },
            reksadana: { 
                base: 100000, 
                volt: 5000, // Reksadana lebih stabil
                nama: "Reksadana Pasar Uang (per unit)" 
            }
        };

        const cmd = command.toLowerCase();

        // --- 1. MENU HELP ---
        if (cmd === 'helpiv') {
            let h = `╭━━〔 📈 *𝙿𝚄𝚂𝙰𝚃 𝙸𝙽𝚅𝙴𝚂𝚃𝙰𝚂𝙸* 📈 〕━━┓\n`;
            h += `┃\n`;
            h += `┃ 🛒 *Beli:* \`${usedPrefix}beliinvest [jenis] [jumlah]\` \n`;
            h += `┃ 💰 *Jual:* \`${usedPrefix}jualinvest [jenis] [jumlah]\` \n`;
            h += `┃ 📊 *Cek Harga:* \`${usedPrefix}invest\` \n`;
            h += `┃ 🎒 *Dompet:* \`${usedPrefix}portofolio\` \n`;
            h += `┃\n`;
            h += `┃ *Pilihan Jenis:* \n`;
            h += `┃ _emas, saham, reksadana_\n`;
            h += `┗━━━━━━━━━━━━━━━┛\n`;
            h += `_Investasi hari ini, pensiun dini esok hari!_ 🚀`;
            return m.reply(h);
        }

        // --- 2. CEK MARKET (HARGA SEKARANG) ---
        if (cmd === 'inves') {
            let marketText = `📊 *MARKET UPDATE HARI INI* 📊\n\n`;
            for (let x in market) {
                // Logika harga acak: Base +/- (Acak * Volt)
                let currentPrice = market[x].base + (Math.floor(Math.random() * market[x].volt * 2) - market[x].volt);
                marketText += `🔸 *${market[x].nama}*\n`;
                marketText += `   Price: Rp${currentPrice.toLocaleString()}\n\n`;
            }
            marketText += `_Ketik *${usedPrefix}beliinvest [jenis] [jumlah]* untuk membeli. Ketik ${usedPrefix}helpiv untuk melihat menu investasi._`;
            return m.reply(marketText);
        }

        // --- 3. PORTOFOLIO (CEK BARANG) ---
        if (cmd === 'portofolio') {
            let p = `🎒 *PORTOFOLIO INVESTASI* 🎒\n\n`;
            p += `✨ Nama: ${m.pushName}\n`;
            p += `💰 Saldo: Rp${user.money.toLocaleString()}\n\n`;
            p += `🔸 Emas: ${user.investasi.emas} gr\n`;
            p += `🔸 Saham: ${user.investasi.saham} lot\n`;
            p += `🔸 Reksadana: ${user.investasi.reksadana} unit\n\n`;
            p += `_Pantau terus harganya di *${usedPrefix}invest*!_`;
            return m.reply(p);
        }

        // --- 4. LOGIKA BELI ---
        if (cmd === 'beliinves') {
            let [type, qty] = text.split(' ');
            type = type?.toLowerCase();
            qty = parseInt(qty) || 1;

            if (!market[type]) return m.reply(`❌ Jenis salah! Pilih: *emas, saham, reksadana*`);
            if (qty < 1) return m.reply(`❌ Jumlah minimal beli adalah 1!`);

            let price = market[type].base + (Math.floor(Math.random() * market[type].volt * 2) - market[type].volt);
            let total = price * qty;

            if (user.money < total) return m.reply(`❌ Saldo gak cukup! Butuh Rp${total.toLocaleString()} buat beli ${qty} ${type}.`);

            user.money -= total;
            user.investasi[type] += qty;

            return m.reply(`✅ *TRANSAKSI BERHASIL*\n\nKamu beli *${qty} ${type}* seharga Rp${total.toLocaleString()}.\nSisa saldo: Rp${user.money.toLocaleString()}`);
        }

        // --- 5. LOGIKA JUAL ---
        if (cmd === 'jualinves') {
            let [type, qty] = text.split(' ');
            type = type?.toLowerCase();
            qty = parseInt(qty) || 1;

            if (!market[type]) return m.reply(`❌ Jenis salah! Pilih: *emas, saham, reksadana*`);
            if (user.investasi[type] < qty) return m.reply(`❌ Kamu cuma punya ${user.investasi[type]} ${type}!`);

            let price = market[type].base + (Math.floor(Math.random() * market[type].volt * 2) - market[type].volt);
            let total = price * qty;

            user.money += total;
            user.investasi[type] -= qty;

            let { key } = await conn.sendMessage(m.chat, { text: `📉 *Menghubungi broker...*` });
            await new Promise(r => setTimeout(r, 1500));

            return conn.sendMessage(m.chat, { 
                text: `💰 *INVESTASI CAIR!*\n\nBerhasil jual *${qty} ${type}*.\nUang masuk: Rp${total.toLocaleString()}\nTotal Saldo: Rp${user.money.toLocaleString()}`,
                edit: key 
            });
        }
    }
};
