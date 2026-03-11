/**
 * Euphy-Bot - Guardian Tales Gacha Simulator 🛡️
 * Welcome to Kanterbury!
 */

const gtItems = {
    threeStar: [
        { name: 'Future Princess', element: 'Light', class: 'Tanker' },
        { name: 'Kamael', element: 'Earth', class: 'Support' },
        { name: 'Beth', element: 'Dark', class: 'Warrior' },
        { name: 'Claude', element: 'Dark', class: 'Ranged' },
        { name: 'Eunice', element: 'Basic', class: 'Ranged' },
        { name: 'Lilith', element: 'Dark', class: 'Warrior' },
        { name: 'Miya', element: 'Fire', class: 'Healer' },
        { name: 'Garam', element: 'Water', class: 'Ranged' },
        { name: 'Liberator', type: 'Ex-Weapon', hero: 'Future Princess' },
        { name: 'Equinox', type: 'Ex-Weapon', hero: 'Kamael' }
    ],
    twoStar: [
        { name: 'Knight', element: 'Basic', class: 'Warrior' },
        { name: 'Lorrane', element: 'Basic', class: 'Support' },
        { name: 'Elvira', element: 'Fire', class: 'Ranged' },
        { name: 'Karina', element: 'Dark', class: 'Healer' },
        { name: 'Akayuki', element: 'Fire', class: 'Warrior' },
        { name: 'Ranpang', element: 'Basic', class: 'Tanker' }
    ],
    oneStar: [
        { name: 'Bob', element: 'Basic' },
        { name: 'Linda', element: 'Basic' },
        { name: 'Hyper', element: 'Basic' },
        { name: 'Old Knight', element: 'Basic' }
    ]
};

module.exports = {
    command: ['gtgacha', 'summon', 'kanterbury'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        // --- [ LOGIKA HOKI ACAK KANTERBURY ] ---
        // Menentukan rate Bintang 3 secara acak antara 8% - 20% setiap tarikan
        const hokiGuardian = (Math.random() * 12 + 8); 
        
        const rate = Math.random() * 100;
        let hasil;
        let rarity;

        if (rate <= hokiGuardian) { 
            // Rate White Box dinamis biar member grup makin seneng [cite: 2026-01-09]
            rarity = `⚪ (BINTANG 3 - WHITE BOX! - Rate: ${hokiGuardian.toFixed(1)}%)`;
            hasil = gtItems.threeStar[Math.floor(Math.random() * gtItems.threeStar.length)];
        } else if (rate <= (hokiGuardian + 25)) { 
            // Rate Bintang 2 juga ikut dilonggarkan
            rarity = '🟡 (BINTANG 2)';
            hasil = gtItems.twoStar[Math.floor(Math.random() * gtItems.twoStar.length)];
        } else {
            rarity = '🟤 (BINTANG 1)';
            hasil = gtItems.oneStar[Math.floor(Math.random() * gtItems.oneStar.length)];
        }

        let teks = `*🛡️ GUARDIAN TALES SUMMON 🛡️*\n\n`;
        teks += `*🌟 Rarity:* ${rarity}\n`;
        teks += `*🎁 Name:* ${hasil.name}\n`;
        if (hasil.element) teks += `*🔮 Element:* ${hasil.element}\n`;
        if (hasil.class) teks += `*⚔️ Class:* ${hasil.class}\n`;
        if (hasil.hero) teks += `*🔥 Owner:* ${hasil.hero}\n\n`;
        
        if (rate <= hokiGuardian) {
            teks += `*WHITE BOX!* Selamat, kamu dapat hero/senjata legendaris dengan hoki ${hokiGuardian.toFixed(1)}%! 🎉✨`;
        } else {
            teks += `_Jangan sedih, kumpulkan mileage dulu!_`;
        }

        m.reply(teks);
    }
};
