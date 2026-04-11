/**
 * Juragan Sawit Simulator: All-in-One 🌴🚜
 * Optimized for IyuszTempest (Proxy)
 * Features: Status, Help, Tanam, Panen, Jual
 */

const fs = require('fs');

module.exports = {
    command: ['sawit', 'tanamsawit', 'panen', 'jualsawit', 'helpsawit', 'sawithelp'],
    category: 'game',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu kak!");

        // --- INISIALISASI DATA ---
        if (typeof user.sawit === 'undefined') user.sawit = 0; // Jumlah pohon
        if (typeof user.hasil_panen === 'undefined') user.hasil_panen = 0; // Stok TBS (kg)
        if (typeof user.last_panen === 'undefined') user.last_panen = 0; // Cooldown

        const cmd = command.toLowerCase();

        // --- 1. MENU HELP (Pusat Info) ---
        if (cmd === 'helpsawit' || cmd === 'sawithelp') {
            let helpText = `╭━━〔 🚜 *𝙿𝚄𝚂𝙰𝚃 𝙸𝙽𝙵𝙾 𝚂𝙰𝚆𝙸𝚃* 🚜 〕━━┓\n`;
            helpText += `┃\n`;
            helpText += `┃ 1️⃣ *Beli Bibit:* \n`;
            helpText += `┃ \`${usedPrefix}tanamsawit\` (Rp4.999/phn)\n`;
            helpText += `┃\n`;
            helpText += `┃ 2️⃣ *Egrek/Panen:* \n`;
            helpText += `┃ \`${usedPrefix}panen\` (1 jam sekali)\n`;
            helpText += `┃\n`;
            helpText += `┃ 3️⃣ *Jual ke Pengepul:* \n`;
            helpText += `┃ \`${usedPrefix}jualsawit\` (Min 50 Kg)\n`;
            helpText += `┃\n`;
            helpText += `┃ 4️⃣ *Status Lahan:* \n`;
            helpText += `┃ \`${usedPrefix}sawit\` \n`;
            helpText += `┃\n`;
            helpText += `┗━━━━━━━━━━━━━━━┛\n`;
            helpText += `_Semangat kerjanya, demi negara!_ 🪓`;
            return m.reply(helpText);
        }

        // --- 2. STATUS LAHAN ---
        if (cmd === 'sawit') {
            let status = `╭━━〔 🌴 *𝙹𝚄𝚁𝙰𝙶𝙰𝙽 𝚂𝙰𝚆𝙸𝚃* 🌴 〕━━┓\n`;
            status += `┃\n`;
            status += `┃ 🚜 *Lahan:* ${user.sawit} Pohon\n`;
            status += `┃ ⚖️ *Stok TBS:* ${user.hasil_panen.toLocaleString()} Kg\n`;
            status += `┃ 💰 *Saldo:* Rp${(user.money || 0).toLocaleString()}\n`;
            status += `┃\n`;
            status += `┃ _Ketik *${usedPrefix}helpsawit* untuk bantuan._\n`;
            status += `┗━━━━━━━━━━━━━━━━━━┛`;
            return m.reply(status);
        }

// --- 3. TANAM SAWIT ---
        if (cmd === 'tanamsawit') {
            const hargaBibit = 70000;
            // Ambil angka dari ketikan user, kalau gak ada angka default ke 1
            let jumlah = parseInt(text) || 1;
            
            // Validasi agar user tidak memasukkan angka negatif atau nol
            if (jumlah < 1) return m.reply('❌ Minimal tanam adalah 1 pohon!');
            
            const totalHarga = hargaBibit * jumlah;

            if (user.money < totalHarga) {
                return m.reply(`❌ Saldo kurang! Untuk tanam ${jumlah} pohon, kamu butuh Rp${totalHarga.toLocaleString()}.\n💰 Saldo kamu saat ini: Rp${user.money.toLocaleString()}`);
            }
            
            user.money -= totalHarga;
            user.sawit += jumlah;
            
            return m.reply(`🌱 *BERHASIL TANAM SAWIT* 🌱\n\n┃ 🚜 *Jumlah:* ${jumlah} pohon\n┃ 💸 *Total Biaya:* Rp${totalHarga.toLocaleString()}\n┃ 🌴 *Total Sawitmu:* ${user.sawit} pohon\n┃ 💰 *Sisa Saldo:* Rp${user.money.toLocaleString()}\n\n_Semoga panennya melimpah! ✨_`);
        }

        // --- 4. PANEN SAWIT ---
        if (cmd === 'panen') {
            if (user.sawit < 1) return m.reply("❌ Kamu belum punya pohon! Tanam dulu.");
            
            let cooldown = 3600000; // 1 Jam
            if (new Date() - user.last_panen < cooldown) {
                let sisa = cooldown - (new Date() - user.last_panen);
                return m.reply(`⏳ Belum brondol! Tunggu *${Math.ceil(sisa / 60000)} menit* lagi.`);
            }

            let hasil = 0;
            for (let i = 0; i < user.sawit; i++) {
                hasil += Math.floor(Math.random() * 15) + 10; // 10-25 kg per pohon
            }

            user.hasil_panen += hasil;
            user.last_panen = new Date() * 1;
            
            let { key } = await conn.sendMessage(m.chat, { text: "🚜 *Lagi di kebun, lagi egrek sawit...*" });
            await new Promise(r => setTimeout(r, 2000));
            
            return conn.sendMessage(m.chat, { 
                text: `✅ *PANEN BERHASIL!*\n\n🪓 Dapet: ${hasil} Kg\n📦 Total Gudang: ${user.hasil_panen} Kg.`,
                edit: key 
            });
        }

        // --- 5. JUAL SAWIT ---
        if (cmd === 'jualsawit') {
            if (user.hasil_panen < 50) return m.reply("❌ Minimal punya 50 Kg buat dijual!");

            const hargaPerKg = Math.floor(Math.random() * 500) + 2000; // Rp2000 - Rp2500
            let totalDuit = user.hasil_panen * hargaPerKg;

            user.money = (user.money || 0) + totalDuit;
            let stokLama = user.hasil_panen;
            user.hasil_panen = 0;

            let { key } = await conn.sendMessage(m.chat, { text: "🚛 *Mengirim TBS ke pabrik...*" });
            await new Promise(r => setTimeout(r, 2000));

            let nota = `🚛 *NOTA PENJUALAN SAWIT* 🚛\n`;
            nota += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            nota += `⚖️ *Berat:* ${stokLama} Kg\n`;
            nota += `💹 *Harga:* Rp${hargaPerKg}/Kg\n`;
            nota += `💰 *Cair:* Rp${totalDuit.toLocaleString()}\n\n`;
            nota += `━━━━━━━━━━━━━━━━━━━━\n`;
            nota += `_Duit cair! Hati-hati di jalan, Juragan!_ 💸`;

            return conn.sendMessage(m.chat, { text: nota, edit: key });
        }
    }
};
                
