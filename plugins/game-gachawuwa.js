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
        // --- [ LOGIKA HOKI ACAK ROVER ] ---
        // Menentukan rate Bintang 5 secara acak antara 6% - 18% setiap sesi
        const hokiRover = (Math.random() * 12 + 6); 
        
        const rate = Math.random() * 100;
        let hasil;
        let rarity;

        if (rate <= hokiRover) { 
            // Rate Bintang 5 dinamis biar koleksi Resonator makin banyak
            rarity = `⭐⭐⭐⭐⭐ (5-STAR! - Rate: ${hokiRover.toFixed(1)}%)`;
            hasil = wuwaItems.fiveStar[Math.floor(Math.random() * wuwaItems.fiveStar.length)];
        } else if (rate <= (hokiRover + 20)) { 
            // Rate Bintang 4 juga dilonggarkan biar makin asik
            rarity = '⭐⭐⭐⭐ (4-STAR)';
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
        
        if (rate <= hokiRover) {
            teks += `*GOLDEN SHINE!* Rover, kamu dapet Bintang 5 dengan hoki ${hokiRover.toFixed(1)}%! 🎉✨`;
        } else {
            teks += `_Cuma dapet ampas, jangan nyerah ya Rover!_`;
        }

        m.reply(teks);
    }
};
                           
