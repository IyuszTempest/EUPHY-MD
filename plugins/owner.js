 /** * Euphy-Bot - Owner Info Plugin (Pro UI)
 * Fitur: vCard Contact & Social Media Integration
 */

module.exports = {
    command: ['owner', 'creator', 'developer'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m) => {
        await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } });

        let ownerNumber = global.owner;
        let ownerName = global.nameowner;
        
        // Membuat vCard estetik khas profesional
        const vcard = 'BEGIN:VCARD\n' 
                    + 'VERSION:3.0\n' 
                    + `FN:${ownerName}\n` 
                    + `ORG:${orgowner}\n`
                    + `TITLE:${titleowner}\n`
                    + `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\n` 
                    + `URL;type=Website:${global.social.website}\n`
                    + `URL;type=GitHub:${global.social.github}\n`
                    + `URL;type=Instagram:${global.social.instagram}\n`
                    + `URL;type=YouTube:${global.social.youtube}\n`
                    + `URL;type=TikTok:${global.social.tiktok}\n`
                    + `URL;type=LinkedIn:${global.social.linkedin}\n`
                    + 'END:VCARD';

     // 1. Kirim Kartu Kontak
        await conn.sendMessage(m.chat, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: m });
    }
}
