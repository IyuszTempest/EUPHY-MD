/** * Plugin Anime Gallery (Waifu, Neko, Megumin)
 * Style: Euphylia Magenta - "The King of UI"
 * Fix: Manual Buffer for High Stability
 */

const axios = require('axios');

module.exports = {
    command: ['waifu', 'neko', 'megumin'],
    category: 'anime',
    noPrefix: true, 
    call: async (conn, m, { usedPrefix, command }) => {
        // Reaksi loading sesuai karakter [cite: 2025-05-24]
        let reactEmoji = command === 'waifu' ? '💖' : command === 'neko' ? '🐈' : '💥';
        await conn.sendMessage(m.chat, { react: { text: reactEmoji, key: m.key } });

        try {
            // Memanggil API IyuszTempest berdasarkan command yang diketik
            const apiEndpoint = `https://iyusztempest.my.id/api/anime/${command}?apikey=${global.apiyus}`;
            const { data } = await axios.get(apiEndpoint);
            
            // Validasi status sesuai JSON: status: true
            if (!data.status || !data.result) {
                return m.reply(`Duh, ${command}-nya lagi sembunyi nih. Coba lagi ya! 🏮`);
            }

            const imageUrl = data.result;

            // --- [ METODE BUFFER MANUAL ] ---
            const response = await axios.get(imageUrl, { 
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const buffer = Buffer.from(response.data, 'binary');

            // Kirim gambar dengan UI estetik khas Euphy
            await conn.sendMessage(m.chat, { 
                image: buffer, 
                caption: `╭━━〔 ⛩️ *ANIME GALLERY* ⛩️ 〕━━┓\n┃ 🏮 *Category:* ${command.toUpperCase()}\n┃ ✨ *Source:* IyuszTempest API\n┃ 👤 *Requester:* @${m.sender.split`@`[0]}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n_Enjoy your ${command}! 🌸_`,
                mentions: [m.sender],
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: `Anime Gallery - ${global.namech}`
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`Gagal narik gambar ${command}! ❌\nDetail: ${e.message.slice(0, 50)}`);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
          
