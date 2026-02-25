/** * Minimalist User Profile - "The King of UI" Style
 * Fitur: Cek Profil (Tanpa Status Premium)
 */

module.exports = {
    command: ['me', 'profil', 'profile'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        // 1. Ambil JID Target (Tag -> Reply -> Me)
        let who = m.mentionedJid && m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted 
                ? m.quoted.sender 
                : m.sender;

        // 2. Ambil Data dari Database
        let user = global.db.data.users[who];
        let userName = user?.name || conn.getName(who) || 'User Baru';
        let userAge = user?.age || '-';

        // 3. Tampilan Output Minimalis
        let cap = `╭━━〔 ⛩️ *𝚄𝚂𝙴𝚁 𝙿𝚁𝙾𝙵𝙸𝙻𝙴* ⛩️ 〕━━┓\n`
                + `┃ 👤 *𝙽𝚊𝚖𝚎:* ${userName}\n`
                + `┃ 🔢 *𝙰𝚐𝚎:* ${userAge} Tahun\n`
                + `┣━━━━━━━━━━━━━━━━━━━━┛\n`
                + `┃ 📱 *𝙽𝚞𝚖𝚋𝚎𝚛:* ${who.split('@')[0]}\n`
                + `┃ 🏮 *𝙻𝙸𝙳:* ${who.endsWith('@lid') ? 'Active ✅' : 'Standard 📱'}\n`
                + `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`
                + `_Terus gunakan Euphy untuk fitur menarik lainnya!_ [cite: 2025-05-24]`;

        return await conn.sendMessage(m.chat, {
            text: cap,
            contextInfo: {
                mentionedJid: [who],
                externalAdReply: {
                    title: `Identity: ${userName}`,
                    body: `Euphylia System User`,
                    thumbnailUrl: global.imgall,
                    sourceUrl: global.idch,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};
