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
        const rate = Math.random() * 100;
        let hasil;
        let rarity;

        if (rate <= 3.0) { // Rate Bintang 3 di BA itu 3%
            rarity = '⭐⭐⭐ (RARE!)';
            hasil = students.threeStar[Math.floor(Math.random() * students.threeStar.length)];
        } else if (rate <= 21.5) { // Rate Bintang 2
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
        
        if (rate <= 3.0) {
            teks += `*ARONA PRANK IS REAL!* Kamu dapat Bintang 3! 🎉✨`;
        } else {
            teks += `_Biru lagi, biru lagi... Semangat ya Sensei!_`;
        }

        m.reply(teks);
    }
};
