/**
 * Uma Musume Race: Live Edition 🏇✨
 * Mode: Single Chat Edit (Biar gak nyepam)
 * Currency: Jewels & Mana (Game Accurate)
 */

const horseNames = [
    "Special Week", "Silence Suzuka", "Tokai Teio", "Mejiro McQueen",
    "Gold Ship", "Daiwa Scarlet", "Vodka", "Grass Wonder", "T.M. Opera O",
    "Rice Shower", "Mihono Bourbon", "Nice Nature", "Twin Turbo",
    "Kitasan Black", "Satono Diamond", "Fine Motion", "Agnes Tachyon",
    "Manhattan Cafe", "Mayano Topgun", "Sakura Bakushin O"
];

const weathers = [
    { name: "Cerah ☀️", multiplier: 1.2, bonus: 1.5, desc: "Kondisi lintasan kering!" },
    { name: "Mendung ☁️", multiplier: 1.0, bonus: 1.2, desc: "Suhu sejuk, stamina stabil." },
    { name: "Hujan 🌧️", multiplier: 0.8, bonus: 2.5, desc: "Lintasan licin! Rewards UP!" },
    { name: "Badai ⛈️", multiplier: 0.5, bonus: 5.0, desc: "Kondisi ekstrem! JACKPOT REWARDS!" }
];

module.exports = {
    command: ['umamusume'],
    category: 'game',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        
        if (!text) {
            let horseList = "";
            for (let i = 0; i < horseNames.length; i++) {
                horseList += `┃ ${String(i + 1).padStart(2, '0')}. ${horseNames[i].padEnd(18)}${(i + 1) % 2 === 0 ? '\n' : ''}`;
            }

            let menu = `╭━━〔 ⛩️ *𝚄𝙼𝙰 𝙼𝚄𝚂𝚄𝙼𝙴 𝙻𝙸𝚅𝙴* ⛩️ 〕━━┓\n`;
            menu += `┃\n`;
            menu += `┃ *Cara bertaruh:* \n`;
            menu += `┃ ${usedPrefix + command} <jewels> <nomor>\n`;
            menu += `┃\n`;
            menu += `┣━━〔 🐎 *𝚁𝙾𝚂𝚃𝙴𝚁 𝚄𝙼𝙰 𝙼𝚄𝚂𝚄𝙼𝙴* 〕━━┓\n`;
            menu += horseList;
            menu += `┗━━━━━━━━━━━━━━━━━━━━┛`;
            return m.reply(menu);
        }

        const args = text.trim().split(/\s+/);
        const betJewels = parseInt(args[0]);
        const horseNum = parseInt(args[1]);

        if (isNaN(betJewels) || betJewels < 50) return m.reply(`⚠️ Minimal taruhan 50 Jewels!`);
        // Asumsi user.jewels ada di database kamu, kalau tidak, ganti ke user.money
        if ((user.jewels || user.money) < betJewels) return m.reply(`❌ Jewels kamu tidak cukup!`);
        if (isNaN(horseNum) || horseNum < 1 || horseNum > horseNames.length) return m.reply(`⚠️ Pilih nomor 1 - ${horseNames.length}!`);

        const betHorse = horseNames[horseNum - 1];
        if (user.jewels) user.jewels -= betJewels; else user.money -= betJewels;

        const weather = weathers[Math.floor(Math.random() * weathers.length)];
        
        // --- STEP 1: STARTING ---
        let { key } = await conn.sendMessage(m.chat, { 
            text: `🏟️ *PREPARING RACE...*\n\n🌦️ Cuaca: ${weather.name}\n🐎 Jagoan: *${betHorse}*\n💎 Taruhan: ${betJewels} Jewels\n\n_Para Uma Musume memasuki gate..._` 
        }, { quoted: m });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // --- STEP 2: RUNNING (EDIT CHAT) ---
        await conn.sendMessage(m.chat, { 
            text: `🏁 *GATE TERBUKA!*\n\n🏃 *Silence Suzuka* memimpin di depan!\n🐎 *${betHorse}* mencoba mengejar dari posisi tengah!\n\n_Dukungan penonton bergemuruh!_ 📢`, 
            edit: key 
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // --- STEP 3: FINAL STRETCH (EDIT CHAT) ---
        await conn.sendMessage(m.chat, { 
            text: `🏁 *FINAL STRETCH!*\n\n🔥 Sisa 200 meter lagi!\n🔥 Persaingan sengit di tikungan terakhir!\n🔥 Siapakah yang akan menyentuh garis finish?!`, 
            edit: key 
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // --- STEP 4: RESULT ---
        const randomRange = (min, max) => Math.random() * (max - min) + min;
        const results = horseNames.map(name => {
            const performance = ((randomRange(80, 115) * 0.6) + (randomRange(75, 100) * 0.4)) * randomRange(0.8, 1.2) * weather.multiplier;
            return { horse: name, performance };
        });
        results.sort((a, b) => b.performance - a.performance);
        
        const isWin = results[0].horse === betHorse;
        const prizeJewels = Math.ceil(betJewels * weather.bonus);
        const prizeMana = Math.ceil(betJewels * 100 * weather.bonus); // Mana lebih banyak jumlahnya

        let resultText = `🏁 *RACE RESULT: ${weather.name}* 🏁\n`;
        resultText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        results.slice(0, 5).forEach((r, i) => {
            resultText += `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏃'} *${i + 1}. ${r.horse}* ${r.horse === betHorse ? '👈' : ''}\n`;
        });
        resultText += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;

        if (isWin) {
            if (user.jewels) {
                user.jewels += prizeJewels;
                user.mana = (user.mana || 0) + prizeMana;
            } else {
                user.money += prizeJewels;
            }
            resultText += `🎉 *UMAPYOOOI!* ${betHorse} Juara 1!\n`;
            resultText += `🎁 Rewards:\n💎 +${prizeJewels} Jewels\n🧪 +${prizeMana.toLocaleString()} Mana`;
        } else {
            const pos = results.findIndex(h => h.horse === betHorse) + 1;
            resultText += `💔 *Losing Streak...* ${betHorse} finish di urutan ke-${pos}.\n`;
            resultText += `💸 Kamu kehilangan ${betJewels} Jewels.`;
        }

        return conn.sendMessage(m.chat, { text: resultText, edit: key });
    }
};
