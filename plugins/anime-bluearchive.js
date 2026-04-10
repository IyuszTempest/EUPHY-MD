/**
 * Euphy-Bot - Blue Archive Random Image
 * Identitas: Euphylia Magenta Randomizer ✨
 */

module.exports = {
    command: ['bluearchive'],
    category: 'anime',
    noPrefix: true,
    call: async (conn, m) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: '📸', key: m.key } });
            
            // Mengirim link langsung sebagai gambar
            const imageUrl = `https://api.siputzx.my.id/api/r/blue-archive`;
            
             // Kirim hasil dengan UI Euphylia Magenta
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `🏮 *Blue Archive Random Image* 🏮\n\n👤 *Requester:* @${m.sender.split`@`[0]}`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: `BA Community - ${global.namech}`
                    }
                }
            }, { quoted: m });

             } catch (e) {
            console.error(e)
            m.reply(`error nih`)
        }
    }
};
