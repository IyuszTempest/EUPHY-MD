/**
 * ZZZ Gacha Simulator - Expanded Edition 🔌
 * Total Agent Update 2026!
 */

const agents = {
    sRank: [
        { name: 'Ellen Joe', faction: 'Victoria Housekeeping', attribute: 'Ice' },
        { name: 'Zhu Yuan', faction: 'Criminal Investigation', attribute: 'Ether' },
        { name: 'Lycaon', faction: 'Victoria Housekeeping', attribute: 'Ice' },
        { name: 'Grace Howard', faction: 'Belobog Heavy Industries', attribute: 'Electric' },
        { name: 'Rina', faction: 'Victoria Housekeeping', attribute: 'Electric' },
        { name: 'Koleda Belobog', faction: 'Belobog Heavy Industries', attribute: 'Fire' },
        { name: 'Nekomata', faction: 'Gentle House', attribute: 'Physical' },
        { name: 'Soldier 11', faction: 'Obols Squad', attribute: 'Fire' },
        { name: 'Qingyi', faction: 'Criminal Investigation', attribute: 'Electric' },
        { name: 'Jane Doe', faction: 'Criminal Investigation', attribute: 'Physical' },
        { name: 'Caesar King', faction: 'Sons of Calydon', attribute: 'Physical' },
        { name: 'Burnice White', faction: 'Sons of Calydon', attribute: 'Fire' },
        { name: 'Hoshimi Miyabi', faction: 'Section 6', attribute: 'Ice' },
        { name: 'Yanagi', faction: 'Section 6', attribute: 'Electric' },
        { name: 'Lighter', faction: 'Sons of Calydon', attribute: 'Fire' },
        { name: 'Harumasa', faction: 'Section 6', attribute: 'Electric' }
    ],
    aRank: [
        { name: 'Anby Demara', faction: 'Gentle House', attribute: 'Electric' },
        { name: 'Nicole Demara', faction: 'Gentle House', attribute: 'Ether' },
        { name: 'Billy Kid', faction: 'Gentle House', attribute: 'Physical' },
        { name: 'Anton Ivanov', faction: 'Belobog Heavy Industries', attribute: 'Electric' },
        { name: 'Ben Bigger', faction: 'Belobog Heavy Industries', attribute: 'Fire' },
        { name: 'Soukaku', faction: 'Section 6', attribute: 'Ice' },
        { name: 'Lucy', faction: 'Sons of Calydon', attribute: 'Fire' },
        { name: 'Piper Wheel', faction: 'Sons of Calydon', attribute: 'Physical' },
        { name: 'Seth Lowell', faction: 'Criminal Investigation', attribute: 'Electric' },
        { name: 'Corin Wickes', faction: 'Victoria Housekeeping', attribute: 'Physical' }
    ],
    bRank: [
        { name: 'W-Engine: Steam Oven', type: 'W-Engine' },
        { name: 'W-Engine: Drill Rig', type: 'W-Engine' },
        { name: 'W-Engine: Vault', type: 'W-Engine' },
        { name: 'W-Engine: Original Transducer', type: 'W-Engine' },
        { name: 'Bangboo Voucher', type: 'Item' },
        { name: 'Official Investigator Log', type: 'Exp' },
        { name: 'W-Engine Energy Module', type: 'Exp' },
        { name: 'Dennies (Bulk)', type: 'Currency' }
    ]
};

module.exports = {
    command: ['zzzgacha'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        // Logika Hoki Proxy (2% - 15% S-Rank chance)
        const proxyLuck = (Math.random() * 13 + 2); 
        const roll = Math.random() * 100;
        
        let result;
        let rarity;
        let color;

        if (roll <= proxyLuck) { 
            rarity = `S-RANK (GOLDEN SIGNAL!)`;
            color = '🟡';
            result = agents.sRank[Math.floor(Math.random() * agents.sRank.length)];
        } else if (roll <= (proxyLuck + 30)) { 
            rarity = 'A-RANK (VIOLET SIGNAL)';
            color = '🟣';
            result = agents.aRank[Math.floor(Math.random() * agents.aRank.length)];
        } else {
            rarity = 'B-RANK (BLUE SIGNAL)';
            color = '🔵';
            result = agents.bRank[Math.floor(Math.random() * agents.bRank.length)];
        }

        let caption = `*📺 SIGNAL SEARCH INITIATED... 📺*\n`;
        caption += `_Accessing Hollow Network for Proxy..._\n\n`;
        caption += `${color} *Rarity:* ${rarity}\n`;
        caption += `*🗂️ Name:* ${result.name}\n`;
        
        if (result.faction) caption += `*🏢 Faction:* ${result.faction}\n`;
        if (result.attribute) caption += `*⚡ Attribute:* ${result.attribute}\n`;
        if (result.type) caption += `*📦 Category:* ${result.type}\n`;
        
        caption += `\n--- --- --- --- --- ---\n`;
        
        if (roll <= proxyLuck) {
            caption += `*JACKPOT!* Sinyal terdeteksi sangat kuat! Kamu dapet S-Rank dengan hoki ${proxyLuck.toFixed(1)}%! 🎰🔥`;
        } else if (roll <= (proxyLuck + 30)) {
            caption += `Not bad, A-Rank Agent siap dideploy ke Hollow! ✨`;
        } else {
            caption += `_Sinyal lemah... cuma dapet supply biasa. Coba lagi nanti, Proxy!_`;
        }

        m.reply(caption);
    }
};
      
