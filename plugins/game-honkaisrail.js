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
        // --- [ LOGIKA HOKI ACAK ] ---
        // Menentukan rate Bintang 5 secara acak antara 1% - 15% setiap klik [cite: 2026-01-09]
        const hokiHariIni = (Math.random() * 14 + 1); 
        
        const rate = Math.random() * 100;
        let hasil;
        let rarity;

        if (rate <= hokiHariIni) { 
            // Rate Bintang 5 dinamis sesuai hokiHariIni
            rarity = `⭐⭐⭐⭐⭐ (5-STAR! - Rate: ${hokiHariIni.toFixed(1)}%)`;
            hasil = hsrItems.fiveStar[Math.floor(Math.random() * hsrItems.fiveStar.length)];
        } else if (rate <= (hokiHariIni + 15)) { 
            // Rate Bintang 4 juga dilonggarkan
            rarity = '⭐⭐⭐⭐ (4-STAR)';
            hasil = hsrItems.fourStar[Math.floor(Math.random() * hsrItems.fourStar.length)];
        } else {
            rarity = '⭐⭐⭐';
            hasil = hsrItems.threeStar[Math.floor(Math.random() * hsrItems.threeStar.length)];
        }

        let teks = `*✨ STELLAR WARP SIMULATOR ✨*\n\n`;
        teks += `*🌟 Rarity:* ${rarity}\n`;
        teks += `*🎁 Name:* ${hasil.name}\n`;
        teks += `*📂 Type:* ${hasil.type || 'Light Cone'}\n`; // Fallback jika type kosong
        if (hasil.path) teks += `*🛤️ Path:* ${hasil.path}\n`;
        if (hasil.element) teks += `*🔮 Element:* ${hasil.element}\n\n`;
        
        if (rate <= hokiHariIni) {
            teks += `*KABOOM!* Tiket emas berbuah manis! Hoki kamu lagi gacor di angka ${hokiHariIni.toFixed(1)}%! 🎉🔥`;
        } else {
            teks += `_Pom-Pom cuma bisa kasih ini, sabar ya Trailblazer!_`;
        }

        m.reply(teks);
    }
};
