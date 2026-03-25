/**
 * Uma Musume Gacha Simulator 🐎✨
 * Feature: 3-Star Pity, Edit Message Animation, Huge Roster
 * Powered by IyuszTempest Proxy Logic
 */

const students = {
    threeStar: [
        "Special Week", "Silence Suzuka", "Tokai Teio", "Mejiro McQueen", 
        "Gold Ship", "Rice Shower", "Mihono Bourbon", "Kitasan Black", 
        "Satono Diamond", "Fine Motion", "Agnes Tachyon", "Manhattan Cafe",
        "Curren Chan", "Smart Falcon", "Narita Brian", "Air Groove",
        "Tamamo Cross", "Oguri Cap", "Super Creek", "Inari One"
    ],
    twoStar: [
        "Daiwa Scarlet", "Vodka", "Grass Wonder", "El Condor Pasa",
        "Mayano Topgun", "Mejiro Ryan", "Nice Nature", "King Halo",
        "Winning Ticket", "Narita Taishin", "Biwa Hayahide", "Matikanefukukitaru"
    ],
    oneStar: [
        "Sakura Bakushin O", "Haru Urara", "Nice Nature", "Agnes Digital",
        "T.M. Opera O", "Mejiro Dober", "Yukino Bijin", "Ikuno Dictus"
    ]
};

module.exports = {
    command: ['umagacha'],
    category: 'game',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        let user = global.db.data.users[m.sender];
        const gachaCost = 150; // 1x Pull = 150 Jewels

        if ((user.jewels || user.money) < gachaCost) {
            return m.reply(`❌ Jewels tidak cukup! Butuh ${gachaCost} Jewels untuk 1x Recruitment.`);
        }

        // Kurangi saldo
        if (user.jewels) user.jewels -= gachaCost; else user.money -= gachaCost;

        // --- ANIMASI GACHA (EDIT CHAT) ---
        let { key } = await conn.sendMessage(m.chat, { text: "🎫 *Recruitment Ticket digunakan...*" });
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        await conn.sendMessage(m.chat, { text: "✨ *Pintu Tracen Academy terbuka...* ✨", edit: key });
        await new Promise(resolve => setTimeout(resolve, 1500));

        // --- LOGIKA HOKI PROXY ---
        const rate = Math.random() * 100;
        let result, rarity, color, manaReward;

        if (rate <= 3) { // 3% Chance SSS/3-Star
            rarity = "⭐⭐⭐ (RARE!)";
            color = "🌈";
            result = students.threeStar[Math.floor(Math.random() * students.threeStar.length)];
            manaReward = 50000;
        } else if (rate <= 21) { // 18% Chance 2-Star
            rarity = "⭐⭐";
            color = "🌟";
            result = students.twoStar[Math.floor(Math.random() * students.twoStar.length)];
            manaReward = 10000;
        } else {
            rarity = "⭐";
            color = "⚪";
            result = students.oneStar[Math.floor(Math.random() * students.oneStar.length)];
            manaReward = 2000;
        }

        // Tambahkan Mana Reward ke user
        user.mana = (user.mana || 0) + manaReward;

        let finalMsg = `🎫 *TRACEN RECRUITMENT RESULT* 🎫\n`;
        finalMsg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        finalMsg += `${color} *Rarity:* ${rarity}\n`;
        finalMsg += `🏇 *Uma Musume:* ${result}\n\n`;
        finalMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
        finalMsg += `🧪 *Bonus Mana:* +${manaReward.toLocaleString()}\n`;
        
        if (rate <= 3) {
            finalMsg += `\n*GILA!* Kamu dapet bintang 3! Umapyoi legend! 🎉🔥`;
        } else {
            finalMsg += `\n_Terima kasih sudah mendaftar di Tracen Academy!_`;
        }

        return conn.sendMessage(m.chat, { text: finalMsg, edit: key });
    }
};
              
