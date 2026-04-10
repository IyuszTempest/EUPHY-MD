const axios = require('axios');

module.exports = {
    command: ['neko'],
    category: 'anime',
    noPrefix: true, 
    call: async (conn, m) => {
        await conn.sendMessage(m.chat, { react: { text: '🐈', key: m.key } });

        try {
            const { data } = await axios.get(`https://iyusztempest.my.id/api/anime/neko?apikey=${global.apiyus}`);
            if (!data.status || !data.result) throw new Error('API Error');

            const response = await axios.get(data.result, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            await conn.sendMessage(m.chat, { 
                image: buffer, 
                caption: `╭━━〔 ⛩️ *ANIME GALLERY* ⛩️ 〕━━┓\n┃ 🏮 *Category:* NEKO\n┃ ✨ *Source:* IyuszTempest API\n┃ 👤 *Requester:* @${m.sender.split`@`[0]}\n┗━━━━━━━━━━━━━━━━━┛\n\n_Nyaa~ Enjoy your neko! 🐾_`,
                mentions: [m.sender],
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: `Neko Gallery - ${global.namech}`
                    }
                }
            }, { quoted: m });
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });
        } catch (e) {
            m.reply(`Gagal narik gambar! ❌`);
        }
    }
};
