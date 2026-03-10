/**
 * Euphy-Bot - Honkai Star Rail Gacha Simulator 🚂
 * May this journey lead us starward!
 */

const hsrItems = {
    fiveStar: [
        { name: 'Acheron', type: 'Character', path: 'Nihility', element: 'Lightning' },
        { name: 'Firefly', type: 'Character', path: 'Destruction', element: 'Fire' },
        { name: 'Robin', type: 'Character', path: 'Harmony', element: 'Physical' },
        { name: 'Aventurine', type: 'Character', path: 'Preservation', element: 'Imaginary' },
        { name: 'Sparkle', type: 'Character', path: 'Harmony', element: 'Quantum' },
        { name: 'Black Swan', type: 'Character', path: 'Nihility', element: 'Wind' },
        { name: 'Ruan Mei', type: 'Character', path: 'Harmony', element: 'Ice' },
        { name: 'Jingliu', type: 'Character', path: 'Destruction', element: 'Ice' },
        { name: 'Dan Heng • Imbibitor Lunae', type: 'Character', path: 'Destruction', element: 'Imaginary' },
        { name: 'Fu Xuan', type: 'Character', path: 'Preservation', element: 'Quantum' },
        { name: 'Along the Passing Shore', type: 'Light Cone', path: 'Nihility' },
        { name: 'In the Night', type: 'Light Cone', path: 'Hunt' }
    ],
    fourStar: [
        { name: 'Gallagher', type: 'Character', path: 'Abundance', element: 'Fire' },
        { name: 'Misha', type: 'Character', path: 'Destruction', element: 'Ice' },
        { name: 'Hanya', type: 'Character', path: 'Harmony', element: 'Physical' },
        { name: 'Guinaifen', type: 'Character', path: 'Nihility', element: 'Fire' },
        { name: 'Lynx', type: 'Character', path: 'Abundance', element: 'Quantum' },
        { name: 'Yukong', type: 'Character', path: 'Harmony', element: 'Imaginary' },
        { name: 'Tingyun', type: 'Character', path: 'Harmony', element: 'Lightning' },
        { name: 'Pela', type: 'Character', path: 'Nihility', element: 'Ice' },
        { name: 'Indelible Promise', type: 'Light Cone', path: 'Destruction' },
        { name: 'Day One of My New Life', type: 'Light Cone', path: 'Preservation' }
    ],
    threeStar: [
        { name: 'Arrows', type: 'Light Cone' },
        { name: 'Adversarial', type: 'Light Cone' },
        { name: 'Amber', type: 'Light Cone' },
        { name: 'Chorus', type: 'Light Cone' },
        { name: 'Data Bank', type: 'Light Cone' }
    ]
};

module.exports = {
    command: ['hsrgacha', 'warp', 'pompon'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        const rate = Math.random() * 100;
        let hasil;
        let rarity;

        if (rate <= 0.6) { // Rate Bintang 5 HSR = 0.6%
            rarity = '⭐⭐⭐⭐⭐ (5-STAR!)';
            hasil = hsrItems.fiveStar[Math.floor(Math.random() * hsrItems.fiveStar.length)];
        } else if (rate <= 5.7) { // Rate Bintang 4
            rarity = '⭐⭐⭐⭐';
            hasil = hsrItems.fourStar[Math.floor(Math.random() * hsrItems.fourStar.length)];
        } else {
            rarity = '⭐⭐⭐';
            hasil = hsrItems.threeStar[Math.floor(Math.random() * hsrItems.threeStar.length)];
        }

        let teks = `*✨ STELLAR WARP SIMULATOR ✨*\n\n`;
        teks += `*🌟 Rarity:* ${rarity}\n`;
        teks += `*🎁 Name:* ${hasil.name}\n`;
        teks += `*📂 Type:* ${hasil.type}\n`;
        if (hasil.path) teks += `*🛤️ Path:* ${hasil.path}\n`;
        if (hasil.element) teks += `*🔮 Element:* ${hasil.element}\n\n`;
        
        if (rate <= 0.6) {
            teks += `*KABOOM!* Tiket emas berbuah manis! Hoki parah kamu! 🎉🔥`;
        } else {
            teks += `_Pom-Pom cuma bisa kasih ini, sabar ya Trailblazer!_`;
        }

        m.reply(teks);
    }
};
