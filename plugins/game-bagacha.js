/**
 * Euphy-Bot - Blue Archive Gacha Simulator 🦀
 * Khusus buat para Sensei!
 */

const students = {
    threeStar: [
        { name: 'Shiroko (Swimsuit)', school: 'Abydos', role: 'Attacker' },
        { name: 'Hina (Dress)', school: 'Gehenna', role: 'Attacker' },
        { name: 'Mika', school: 'Trinity', role: 'Attacker' },
        { name: 'Hoshino (Swimsuit)', school: 'Abydos', role: 'Support' },
        { name: 'Ako', school: 'Gehenna', role: 'Support' },
        { name: 'Himari', school: 'Millennium', role: 'Support' },
        { name: 'Ui', school: 'Trinity', role: 'Support' },
        { name: 'Kayoko (New Year)', school: 'Gehenna', role: 'Support' },
        { name: 'Aru', school: 'Gehenna', role: 'Attacker' },
        { name: 'Wakamo', school: 'Hyakkiyako', role: 'Attacker' },
        { name: 'Hanako (Swimsuit)', school: 'Trinity', role: 'Attacker' },
        { name: 'Toki', school: 'Millennium', role: 'Attacker' },
        { name: 'Nagisa', school: 'Trinity', role: 'Attacker' },
        { name: 'Iroha', school: 'Gehenna', role: 'Tactician' },
        { name: 'Cherino', school: 'Red Winter', role: 'Attacker' }
    ],
    twoStar: [
        { name: 'Yuuka', school: 'Millennium', role: 'Tank' },
        { name: 'Hasumi', school: 'Trinity', role: 'Attacker' },
        { name: 'Chise', school: 'Hyakkiyako', role: 'Attacker' },
        { name: 'Mutsuki', school: 'Gehenna', role: 'Attacker' },
        { name: 'Junko', school: 'Gehenna', role: 'Attacker' },
        { name: 'Tsubaki', school: 'Hyakkiyako', role: 'Tank' },
        { name: 'Hanae', school: 'Trinity', role: 'Healer' },
        { name: 'Utaha', school: 'Millennium', role: 'Attacker' },
        { name: 'Akane', school: 'Millennium', role: 'Support' }
    ],
    oneStar: [
        { name: 'Suzumi', school: 'Trinity' },
        { name: 'Chinatsu', school: 'Gehenna' },
        { name: 'Haruka', school: 'Gehenna' },
        { name: 'Juri', school: 'Gehenna' },
        { name: 'Kotori', school: 'Millennium' },
        { name: 'Yoshimi', school: 'Trinity' },
        { name: 'Shimiko', school: 'Trinity' },
        { name: 'Serina', school: 'Trinity' }
    ]
};

module.exports = {
    command: ['bagacha', 'recruit'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        // --- [ LOGIKA HOKI ACAK SENSEI ] ---
        // Menentukan rate Bintang 3 secara acak antara 5% - 20% setiap rekrutmen
        const hokiSensei = (Math.random() * 15 + 5); 
        
        const rate = Math.random() * 100;
        let hasil;
        let rarity;

        if (rate <= hokiSensei) { 
            // Rate Bintang 3 dinamis biar gak dapet biru terus
            rarity = `⭐⭐⭐ (RARE! - Rate: ${hokiSensei.toFixed(1)}%)`;
            hasil = students.threeStar[Math.floor(Math.random() * students.threeStar.length)];
        } else if (rate <= (hokiSensei + 25)) { 
            // Rate Bintang 2 juga ikut dilonggarkan
            rarity = '⭐⭐';
            hasil = students.twoStar[Math.floor(Math.random() * students.twoStar.length)];
        } else {
            rarity = '⭐';
            hasil = students.oneStar[Math.floor(Math.random() * students.oneStar.length)];
        }

        let teks = `*🟦 BLUE ARCHIVE RECRUITMENT 🟦*\n\n`;
        teks += `*🌟 Rarity:* ${rarity}\n`;
        teks += `*👩‍🎓 Student:* ${hasil.name}\n`;
        if (hasil.school) teks += `*🏫 School:* ${hasil.school}\n`;
        if (hasil.role) teks += `*⚔️ Role:* ${hasil.role}\n\n`;
        
        if (rate <= hokiSensei) {
            teks += `*ARONA PRANK IS REAL!* Kamu dapet Bintang 3 dengan hoki ${hokiSensei.toFixed(1)}%! 🎉✨`;
        } else {
            teks += `_Biru lagi, biru lagi... Semangat ya Sensei!_`;
        }

        m.reply(teks);
    }
};
        
