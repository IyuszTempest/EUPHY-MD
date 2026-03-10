/**
 * Euphy-Bot - Wuthering Waves Gacha Simulator 🌊
 * Wake up, Rover!
 */

const wuwaItems = {
    fiveStar: [
        { name: 'Jinhsi', type: 'Resonator', element: 'Spectro', weapon: 'Broadblade' },
        { name: 'Changli', type: 'Resonator', element: 'Fusion', weapon: 'Sword' },
        { name: 'Yinlin', type: 'Resonator', element: 'Electro', weapon: 'Rectifier' },
        { name: 'Jiyan', type: 'Resonator', element: 'Aero', weapon: 'Broadblade' },
        { name: 'Verina', type: 'Resonator', element: 'Spectro', weapon: 'Rectifier' },
        { name: 'Calcharo', type: 'Resonator', element: 'Electro', weapon: 'Broadblade' },
        { name: 'Encore', type: 'Resonator', element: 'Fusion', weapon: 'Rectifier' },
        { name: 'Jianxin', type: 'Resonator', element: 'Aero', weapon: 'Gauntlets' },
        { name: 'Ages of Harvest', type: 'Weapon', element: 'Broadblade' },
        { name: 'Emerald of Genesis', type: 'Weapon', element: 'Sword' }
    ],
    fourStar: [
        { name: 'Mortefi', type: 'Resonator', element: 'Fusion', weapon: 'Pistols' },
        { name: 'Danjin', type: 'Resonator', element: 'Havoc', weapon: 'Sword' },
        { name: 'Sanhua', type: 'Resonator', element: 'Glacio', weapon: 'Sword' },
        { name: 'Baizhi', type: 'Resonator', element: 'Glacio', weapon: 'Rectifier' },
        { name: 'Chixia', type: 'Resonator', element: 'Fusion', weapon: 'Pistols' },
        { name: 'Yangyang', type: 'Resonator', element: 'Aero', weapon: 'Sword' },
        { name: 'Discord', type: 'Weapon', element: 'Broadblade' },
        { name: 'Helios Cleaver', type: 'Weapon', element: 'Broadblade' }
    ],
    threeStar: [
        { name: 'Originite Type I', type: 'Weapon' },
        { name: 'Guardian Rectifier', type: 'Weapon' },
        { name: 'Swordsman Theory', type: 'Weapon' },
        { name: 'Training Gauntlets', type: 'Weapon' }
    ]
};

module.exports = {
    command: ['wuwagacha', 'convene', 'rover'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        const rate = Math.random() * 100;
        let hasil;
        let rarity;

        if (rate <= 0.8) { // Rate Bintang 5 WuWa = 0.8%
            rarity = '⭐⭐⭐⭐⭐ (5-STAR!)';
            hasil = wuwaItems.fiveStar[Math.floor(Math.random() * wuwaItems.fiveStar.length)];
        } else if (rate <= 6.0) { // Rate Bintang 4
            rarity = '⭐⭐⭐⭐';
            hasil = wuwaItems.fourStar[Math.floor(Math.random() * wuwaItems.fourStar.length)];
        } else {
            rarity = '⭐⭐⭐';
            hasil = wuwaItems.threeStar[Math.floor(Math.random() * wuwaItems.threeStar.length)];
        }

        let teks = `*🌊 WUTHERING WAVES CONVENE 🌊*\n\n`;
        teks += `*🌟 Rarity:* ${rarity}\n`;
        teks += `*🎁 Name:* ${hasil.name}\n`;
        teks += `*📂 Type:* ${hasil.type}\n`;
        if (hasil.element) teks += `*🔮 Element:* ${hasil.element}\n`;
        if (hasil.weapon) teks += `*⚔️ Weapon:* ${hasil.weapon}\n\n`;
        
        if (rate <= 0.8) {
            teks += `*GOLDEN SHINE!* Rover, kamu beruntung banget dapet Bintang 5! 🎉✨`;
        } else {
            teks += `_Cuma dapet ampas, jangan nyerah ya Rover!_`;
        }

        m.reply(teks);
    }
};
