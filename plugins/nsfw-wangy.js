/** * Plugin Wangy (NSFW)
 * Fix: Manual Buffer & Stability Fix
 */

const axios = require('axios');

module.exports = {
    command: ['wangy'],
    category: 'nsfw',
    noPrefix: false, 
    premium: true,
    call: async (conn, m, { usedPrefix, command }) => {
        await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } });

        try {
            const apiEndpoint = `https://iyusztempest.my.id/api/nsfw?feature=wangy&apikey=${global.apiyus}`;
            const { data } = await axios.get(apiEndpoint);
            
            if (data.status !== "Sukses kak!" || !data.media?.url) {
                return m.reply('Stok gambar lagi habis, Yus! 🏮');
            }

            const { url: mediaUrl, type: mediaType } = data.media;

            // --- [ METODE BUFFER MANUAL ] ---
            const response = await axios.get(mediaUrl, { 
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const buffer = Buffer.from(response.data, 'binary');

            let caption = `╭━━〔 🔞 *NSFW CONTENT* 🔞 〕━━┓\n`
            caption += `┃ 🏮 *Type:* ${mediaType.toUpperCase()}\n`
            caption += `┃ ⚠️ *Warning:* Gunakan bijak!\n┃ 👤 *Requester:* @${m.sender.split`@`[0]}\n`
            caption += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n_Powered by IyuszTempest_`

            let messageOptions = {
                caption: caption,
                mentions: [m.sender],
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: `NSFW Room - ${global.namech}`
                    }
                }
            };

            if (mediaType === 'image') messageOptions.image = buffer;
            else if (mediaType === 'video') messageOptions.video = buffer;

            await conn.sendMessage(m.chat, messageOptions, { quoted: m });
            await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`Gagal ambil gambar! ❌\nDetail: ${e.message.slice(0, 50)}`);
        }
    }
};
