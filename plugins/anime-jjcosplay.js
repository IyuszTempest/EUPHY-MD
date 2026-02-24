/** * Plugin JJ Cosplay
 * Style: Euphylia Magenta - "The King of UI"
 * Fix: Manual Buffer for Large Video Files
 */

const axios = require('axios');

module.exports = {
    command: ['jjcosplay'],
    category: 'anime',
    noPrefix: true, // Pakai prefix biar lebih rapi di log
    call: async (conn, m, { usedPrefix, command }) => {
        // Reaksi loading joget [cite: 2025-05-24]
        await conn.sendMessage(m.chat, { react: { text: '💃', key: m.key } });

        try {
            // Memanggil API IyuszTempest
            const apiEndpoint = `https://iyusztempest.my.id/api/anime?feature=jjcosplay&apikey=${global.apiyus}`;
            const { data } = await axios.get(apiEndpoint);
            
            if (data.status !== "success" || !data.media?.url) {
                return m.reply('Aduh, Euphy gagal nemu video cosplay-nya. Coba lagi ya! 🏮');
            }

            const videoUrl = data.media.url;

            // --- [ METODE BUFFER MANUAL UNTUK VIDEO ] ---
            // Kita kasih timeout lebih lama (30s) karena ukuran video biasanya besar
            const response = await axios.get(videoUrl, { 
                responseType: 'arraybuffer',
                timeout: 30000, 
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const buffer = Buffer.from(response.data, 'binary');

            // Kirim video dengan UI Newsletter
            await conn.sendMessage(m.chat, { 
                video: buffer, 
                caption: `╭━━〔 ⛩️ *JJ COSPLAY ANIME* ⛩️ 〕━━┓\n┃ ✨ *Type:* Video MP4\n┃ 🏮 *Source:* IyuszTempest API\n┃ 👤 *Requester:* @${m.sender.split`@`[0]}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n_✨ Enjoy the show!_`,
                mentions: [m.sender],
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: `Cosplay Gallery - ${global.namech}`
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`Gagal narik video! ❌\nDetail: ${e.message.slice(0, 50)}`);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
        
