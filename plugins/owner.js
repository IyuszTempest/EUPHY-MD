/** * Euphy-Bot - Owner Info Plugin (Pro UI)
 * Fitur: vCard Contact & Social Media Integration
 */

module.exports = {
    command: ['owner', 'creator'],
    category: 'main',
    call: async (conn, m) => {
        await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } });

        let ownerNumber = global.owner;
        let ownerName = global.nameowner;
        
        // Membuat vCard estetik khas profesional
        const vcard = 'BEGIN:VCARD\n' 
                    + 'VERSION:3.0\n' 
                    + `FN:${ownerName}\n` 
                    + `ORG:Universitas Katolik Santo Agustinus Hippo;\n`
                    + `TITLE:Systems Information Student\n`
                    + `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\n` 
                    + `URL;type=Website:${global.social.website}\n`
                    + 'END:VCARD';

        // 1. Kirim Kartu Kontak
        await conn.sendMessage(m.chat, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: m });

        // 2. Kirim Detail Info & Media Sosial
        let info = `╭━━〔 ⛩️ *𝙾𝚆𝙽𝙴𝚁 𝙿𝚁𝙾𝙵𝙸𝙻𝙴* ⛩️ 〕━━┓\n`
                 + `┃ 👤 *𝙽𝚊𝚖𝚎:* ${ownerName}\n`
                 + `┃ 🎓 *𝚂𝚝𝚊𝚝𝚞𝚜:* Mahasiswa SI '25\n`
                 + `┃ 📍 *𝙻𝚘𝚌:* Ngabang, Kalimantan Barat\n`
                 + `┣━━━━━━━━━━━━━━━━━━━━┛\n`
                 + `┃ 🌐 *𝚂𝙾𝙲𝙸𝙰𝙻 𝙼𝙴𝙳𝙸𝙰*\n`
                 + `┃ 🔗 *Website:* ${global.social.website}\n`
                 + `┃ 🐙 *Github:* ${global.social.github}\n`
                 + `┃ 📸 *Instagram:* ${global.social.instagram}\n`
                 + `┃ 🎥 *Youtube:* ${global.social.youtube}\n`
                 + `┃ 💼 *LinkedIn:* ${global.social.linkedin}\n`
                 + `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`
                 + `_"Koding itu seperti sihir, asalkan logikanya bener, duniamu aman."_`

        // Kirim dengan gaya Newsletter & AdReply agar terlihat profesional
        return await conn.sendMessage(m.chat, {
            text: info,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.idch,
                    newsletterName: `Owner of ${global.botname}`,
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: `Connect with ${ownerName}`,
                    body: `Developer & DIY Enthusiast`,
                    thumbnailUrl: global.imgall,
                    sourceUrl: global.social.website,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
            }
            
