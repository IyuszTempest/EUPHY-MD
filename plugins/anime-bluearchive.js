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
            await conn.sendMessage(m.chat, { react: { text: '🤨', key: m.key } });
            
            const imageUrl = `https://api.siputzx.my.id/api/r/blue-archive`;
            
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `> Requester: @${m.sender.split`@`[0]}`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: `${global.namech} × Blue Archive`
                    }
                }
            }, { quoted: m });

             } catch (e) {
            console.error(e)
            m.reply(`> error nih`)
        }
    }
};
