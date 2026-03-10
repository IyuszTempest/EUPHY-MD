/**
 * Euphy-Bot - Genshin Gacha Simulator 🌀
 * Khusus buat kamu penggemar Genshin Impact!
 */

const items = {
    fiveStar: [
        { name: 'Raiden Shogun', type: 'Character', element: 'Electro' },
        { name: 'Arlecchino', type: 'Character', element: 'Pyro' },
        { name: 'Nahida', type: 'Character', element: 'Dendro' },
        { name: 'Furina', type: 'Character', element: 'Hydro' },
        { name: 'Neuvillette', type: 'Character', element: 'Hydro' },
        { name: 'Zhongli', type: 'Character', element: 'Geo' },
        { name: 'Kazuha', type: 'Character', element: 'Anemo' },
        { name: 'Yelan', type: 'Character', element: 'Hydro' },
        { name: 'Hu Tao', type: 'Character', element: 'Pyro' },
        { name: 'Kamisato Ayaka', type: 'Character', element: 'Cryo' },
        { name: 'Navia', type: 'Character', element: 'Geo' },
        { name: 'Clorinde', type: 'Character', element: 'Electro' },
        { name: 'Staff of Homa', type: 'Weapon', element: 'Polearm' },
        { name: 'Mistsplitter Reforged', type: 'Weapon', element: 'Sword' },
        { name: 'Aqua Simulacra', type: 'Weapon', element: 'Bow' },
        { name: 'Arataki Itto', type: 'Character', element: 'Geo' },
        { name: 'Xianyun', type: 'Character', element: 'Anemo' },
        { name: 'Wriothesley', type: 'Character', element: 'Cryo' },
        { name: 'Lyney', type: 'Character', element: 'Pyro' },
        { name: 'Alhaitham', type: 'Character', element: 'Dendro' },
        { name: 'Cyno', type: 'Character', element: 'Electro' },
        { name: 'Nilou', type: 'Character', element: 'Hydro' },
        { name: 'Sangonomiya Kokomi', type: 'Character', element: 'Hydro' },
        { name: 'Ganyu', type: 'Character', element: 'Cryo' },
        { name: 'Xiao', type: 'Character', element: 'Anemo' },
        { name: 'Diluc', type: 'Character', element: 'Pyro' },
        { name: 'Jean', type: 'Character', element: 'Anemo' },
        { name: 'Keqing', type: 'Character', element: 'Electro' },
        { name: 'Mona', type: 'Character', element: 'Hydro' },
        { name: 'Qiqi', type: 'Character', element: 'Cryo' },
        { name: 'Tighnari', type: 'Character', element: 'Dendro' },
        { name: 'Dehya', type: 'Character', element: 'Pyro' },
        { name: 'Wolf\'s Gravestone', type: 'Weapon', element: 'Claymore' },
        { name: 'Primordial Jade Winged-Spear', type: 'Weapon', element: 'Polearm' },
        { name: 'Lost Prayer to the Sacred Winds', type: 'Weapon', element: 'Catalyst' },
        { name: 'Skyward Harp', type: 'Weapon', element: 'Bow' },
        { name: 'Splendor of Tranquil Waters', type: 'Weapon', element: 'Sword' }
    ],
    fourStar: [
        { name: 'Bennett', type: 'Character', element: 'Pyro' },
        { name: 'Xiangling', type: 'Character', element: 'Pyro' },
        { name: 'Xingqiu', type: 'Character', element: 'Hydro' },
        { name: 'Kuki Shinobu', type: 'Character', element: 'Electro' },
        { name: 'Chevreuse', type: 'Character', element: 'Pyro' },
        { name: 'Gaming', type: 'Character', element: 'Pyro' },
        { name: 'Fischl', type: 'Character', element: 'Electro' },
        { name: 'Sucrose', type: 'Character', element: 'Anemo' },
        { name: 'Yaoyao', type: 'Character', element: 'Dendro' },
        { name: 'The Widsith', type: 'Weapon', element: 'Catalyst' },
        { name: 'Favonius Sword', type: 'Weapon', element: 'Sword' },
        { name: 'Sacrificial Fragments', type: 'Weapon', element: 'Catalyst' },
        { name: 'Rust', type: 'Weapon', element: 'Bow' },
        { name: 'Dragon\'s Bane', type: 'Weapon', element: 'Polearm' },
        { name: 'Layla', type: 'Character', element: 'Cryo' },
        { name: 'Faruzan', type: 'Character', element: 'Anemo' },
        { name: 'Kaveh', type: 'Character', element: 'Dendro' },
        { name: 'Lynette', type: 'Character', element: 'Anemo' },
        { name: 'Freminet', type: 'Character', element: 'Cryo' },
        { name: 'Charlotte', type: 'Character', element: 'Cryo' },
        { name: 'Sethos', type: 'Character', element: 'Electro' },
        { name: 'Heizou', type: 'Character', element: 'Anemo' },
        { name: 'Gorou', type: 'Character', element: 'Geo' },
        { name: 'Yun Jin', type: 'Character', element: 'Geo' },
        { name: 'Sayu', type: 'Character', element: 'Anemo' },
        { name: 'Rosaria', type: 'Character', element: 'Cryo' },
        { name: 'Beidou', type: 'Character', element: 'Electro' },
        { name: 'Chun-Yun', type: 'Character', element: 'Cryo' },
        { name: 'Razor', type: 'Character', element: 'Electro' },
        { name: 'Ningguang', type: 'Character', element: 'Geo' },
        { name: 'Noelle', type: 'Character', element: 'Geo' },
        { name: 'Barbara', type: 'Character', element: 'Hydro' },
        { name: 'Lisa', type: 'Character', element: 'Electro' },
        { name: 'Kaeya', type: 'Character', element: 'Cryo' },
        { name: 'Amber', type: 'Character', element: 'Pyro' },
        { name: 'The Stringless', type: 'Weapon', element: 'Bow' },
        { name: 'Sacrificial Sword', type: 'Weapon', element: 'Sword' },
        { name: 'Favonius Lance', type: 'Weapon', element: 'Polearm' },
        { name: 'Eye of Perception', type: 'Weapon', element: 'Catalyst' }
    ],
    threeStar: [
        { name: 'Debate Club', type: 'Weapon' },
        { name: 'Cool Steel', type: 'Weapon' },
        { name: 'Black Tassel', type: 'Weapon' },
        { name: 'Sharpshooter\'s Oath', type: 'Weapon' },
        { name: 'Thrilling Tales of Dragon Slayers', type: 'Weapon' },
        { name: 'Magic Guide', type: 'Weapon' },
        { name: 'Skyrider Sword', type: 'Weapon' },
        { name: 'Harbinger of Dawn', type: 'Weapon' },
        { name: 'Raven Bow', type: 'Weapon' },
        { name: 'Bloodtainted Greatsword', type: 'Weapon' },
        { name: 'Slingshot', type: 'Weapon' },
        { name: 'White Iron Greatsword', type: 'Weapon' },
        { name: 'Twin Nephrite', type: 'Weapon' },
        { name: 'Otherworldly Story', type: 'Weapon' },
        { name: 'Emerald Orb', type: 'Weapon' },
        { name: 'Skyrider Greatsword', type: 'Weapon' },
        { name: 'Recurve Bow', type: 'Weapon' },
        { name: 'Fillet Blade', type: 'Weapon' },
        { name: 'Dark Iron Sword', type: 'Weapon' }
    ]
};
         
module.exports = {
    command: ['gachagenshin', 'pull'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        const rate = Math.random() * 100;
        let hasil;
        let rarity;

        if (rate <= 0.6) { 
            rarity = '⭐⭐⭐⭐⭐ (BINTANG 5!)';
            hasil = items.fiveStar[Math.floor(Math.random() * items.fiveStar.length)];
        } else if (rate <= 5.1) { 
            rarity = '⭐⭐⭐⭐ (BINTANG 4)';
            hasil = items.fourStar[Math.floor(Math.random() * items.fourStar.length)];
        } else {
            rarity = '⭐⭐⭐ (Ampas)';
            // FIX: Langsung ambil dari array
            hasil = items.threeStar[Math.floor(Math.random() * items.threeStar.length)];
        }

        let teks = `*✨ GENSHIN IMPACT ✨*\n\n`;
        teks += `*🌟 Rarity:* ${rarity}\n`;
        teks += `*🎁 Hadiah:* ${hasil.name}\n`; // Sekarang bakal muncul nama itemnya, bukan [object]
        if (hasil.type) teks += `*📂 Tipe:* ${hasil.type}\n`;
        if (hasil.element) teks += `*🔮 Elemen:* ${hasil.element}\n\n`;
        
        if (rate <= 0.6) {
            teks += `*WANGY WANGY!* Kamu hoki banget hari ini! 😭✨`;
        } else {
            teks += `_Coba lagi, mungkin belum saatnya dapet archon._`;
        }

        m.reply(teks);
    }
};
